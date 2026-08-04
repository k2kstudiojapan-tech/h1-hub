import { google } from 'googleapis';
const { CHUNK_SIZE, encryptToken } = require('../../lib/upload-chunk-protocol');

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
const TOKEN_TTL_MS = 3 * 60 * 60 * 1000;
const FOLDER_IDS = {
  view: '1cseP7t7ioyegAHmC3i725XWFPl8WpMkv',
  edit: '1USa7cQQ0HRaEp7J3mEYGjLc6xxmhXjQ9',
};

function sanitizeFilename(filename) {
  return String(filename || '')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

function normalizeMimeType(mimeType) {
  const value = String(mimeType || 'application/octet-stream').trim();
  return /^[\w!#$&^.+-]+\/[\w!#$&^.+-]+$/.test(value) ? value : 'application/octet-stream';
}

function getUploadErrorMessage(status) {
  if (status === 401 || status === 403) return 'Google Driveの認証に失敗しました';
  if (status === 404) return '保存先フォルダが見つかりません';
  if (status === 429) return 'Google Driveの利用制限に達しました。時間をおいて再度お試しください';
  return 'アップロードの準備に失敗しました';
}

async function getAccessToken() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  });

  const token = await oauth2Client.getAccessToken();
  const accessToken = typeof token === 'string' ? token : token?.token;
  if (!accessToken) throw new Error('token_unavailable');
  return accessToken;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, filename, mimeType, size, folder } = req.body || {};

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '認証エラー' });
  }

  const folderId = FOLDER_IDS[folder];
  if (!folderId) return res.status(400).json({ error: '無効なフォルダ指定です' });

  const safeFilename = sanitizeFilename(filename);
  const fileSize = Number(size);
  const safeMimeType = normalizeMimeType(mimeType);

  if (!safeFilename) {
    return res.status(400).json({ error: 'ファイル名が未指定です' });
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return res.status(400).json({ error: 'ファイルサイズが不正です' });
  }
  if (fileSize > MAX_UPLOAD_SIZE) {
    return res.status(413).json({ error: 'ファイルサイズが上限の50MBを超えています' });
  }
  if (!process.env.UPLOAD_TOKEN_SECRET) {
    return res.status(500).json({ error: 'アップロード機能が準備できていません' });
  }

  try {
    const accessToken = await getAccessToken();
    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': safeMimeType,
          'X-Upload-Content-Length': String(fileSize),
        },
        body: JSON.stringify({
          name: safeFilename,
          parents: [folderId],
        }),
      },
    );

    const sessionUrl = uploadResponse.headers.get('location');
    if (!uploadResponse.ok || !sessionUrl) {
      return res.status(502).json({ error: getUploadErrorMessage(uploadResponse.status) });
    }

    const issuedAt = Date.now();
    const uploadToken = encryptToken(
      {
        sessionUrl,
        filename: safeFilename,
        mimeType: safeMimeType,
        size: fileSize,
        folderId,
        issuedAt,
        expiresAt: issuedAt + TOKEN_TTL_MS,
      },
      process.env.UPLOAD_TOKEN_SECRET,
    );

    return res.status(200).json({
      success: true,
      uploadToken,
      chunkSize: CHUNK_SIZE,
      filename: safeFilename,
      mimeType: safeMimeType,
      size: fileSize,
    });
  } catch {
    console.error('Drive resumable session start failed');
    return res.status(500).json({ error: 'アップロードの準備に失敗しました' });
  }
}
