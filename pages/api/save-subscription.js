import { google } from 'googleapis';

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: Buffer.from(process.env.GOOGLE_PRIVATE_KEY || '', 'base64').toString('utf-8'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sub = req.body;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth: getAuth() });

    // 重複チェック
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: '購読者!A:A',
    });
    const endpoints = (existing.data.values || []).flat();
    if (endpoints.includes(sub.endpoint)) {
      return res.status(200).json({ ok: true, message: 'already registered' });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: '購読者!A:D',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          sub.endpoint,
          sub.keys.p256dh,
          sub.keys.auth,
          new Date().toLocaleString('ja-JP'),
        ]],
      },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[save-subscription]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
