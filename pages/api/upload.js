import { google } from 'googleapis';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

const FOLDER_IDS = {
  view: '1cseP7t7ioyegAHmC3i725XWFPl8WpMkv',
  edit: '1USa7cQQ0HRaEp7J3mEYGjLc6xxmhXjQ9',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, base64, filename, mimeType, folder } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '認証エラー' });
  }
  if (!base64 || !filename || !folder) {
    return res.status(400).json({ error: 'ファイルまたはフォルダが未指定です' });
  }

  const folderId = FOLDER_IDS[folder];
  if (!folderId) return res.status(400).json({ error: '無効なフォルダ指定です' });

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: Buffer.from(process.env.GOOGLE_PRIVATE_KEY || '', 'base64').toString('utf-8'),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const buffer = Buffer.from(base64, 'base64');

    const response = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
      },
      media: {
        mimeType: mimeType || 'application/octet-stream',
        body: Readable.from(buffer),
      },
      fields: 'id,webViewLink,name',
    });

    res.status(200).json({
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
      url: response.data.webViewLink,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'アップロードに失敗しました: ' + error.message });
  }
}
