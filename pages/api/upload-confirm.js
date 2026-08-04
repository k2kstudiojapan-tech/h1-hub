import { google } from 'googleapis';

const FOLDER_IDS = {
  view: '1cseP7t7ioyegAHmC3i725XWFPl8WpMkv',
  edit: '1USa7cQQ0HRaEp7J3mEYGjLc6xxmhXjQ9',
};

function isValidFileId(fileId) {
  return /^[A-Za-z0-9_-]{10,}$/.test(String(fileId || ''));
}

function getDrive() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

function getConfirmErrorMessage(status) {
  if (status === 401 || status === 403) return 'Google Driveの認証に失敗しました';
  if (status === 404) return 'アップロード済みファイルが見つかりません';
  return 'アップロード完了確認に失敗しました';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, fileId, folder } = req.body || {};

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '認証エラー' });
  }

  const folderId = FOLDER_IDS[folder];
  if (!folderId) return res.status(400).json({ error: '無効なフォルダ指定です' });

  if (!isValidFileId(fileId)) {
    return res.status(400).json({ error: 'ファイルIDが不正です' });
  }

  try {
    const drive = getDrive();
    const response = await drive.files.get({
      fileId,
      fields: 'id,name,webViewLink,parents,trashed',
      supportsAllDrives: true,
    });
    const file = response.data;

    if (file.trashed || !Array.isArray(file.parents) || !file.parents.includes(folderId)) {
      return res.status(404).json({ error: 'アップロード済みファイルを確認できませんでした' });
    }

    return res.status(200).json({
      success: true,
      fileId: file.id,
      fileName: file.name,
      url: file.webViewLink,
    });
  } catch (error) {
    const status = error?.response?.status;
    console.error('Drive upload confirmation failed');
    return res.status(status === 404 ? 404 : 500).json({ error: getConfirmErrorMessage(status) });
  }
}
