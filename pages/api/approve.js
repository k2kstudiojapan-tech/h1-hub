import { google } from 'googleapis';
import webpush from 'web-push';

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: Buffer.from(process.env.GOOGLE_PRIVATE_KEY || '', 'base64').toString('utf-8'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function pushToAll(title, summary) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:k2k.studio.japan@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: '購読者!A:C',
  });
  const rows = res.data.values || [];
  const payload = JSON.stringify({ title, body: summary || '新しい投稿が承認されました', url: '/' });
  await Promise.allSettled(
    rows.map(([endpoint, p256dh, auth]) => {
      if (!endpoint || !p256dh || !auth) return Promise.resolve();
      return webpush.sendNotification({ endpoint, keys: { p256dh, auth } }, payload);
    })
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, rowIndex, title, summary, body, todos, links } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'パスワードが違います' });
  }

  if (typeof rowIndex !== 'number') {
    return res.status(400).json({ error: '行インデックスが不正です' });
  }

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: Buffer.from(process.env.GOOGLE_PRIVATE_KEY || '', 'base64').toString('utf-8'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetRow = rowIndex + 2;

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: `シート1!D${sheetRow}:H${sheetRow}`,
            values: [[title || '', summary || '', body || '', todos || '', links || '']],
          },
          {
            range: `シート1!L${sheetRow}`,
            values: [['TRUE']],
          },
        ],
      },
    });

    // Push通知を非同期で送信（失敗しても承認は成功扱い）
    pushToAll(title, summary).catch(e => console.error('[push]', e.message));

    res.status(200).json({ success: true, rowIndex });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
