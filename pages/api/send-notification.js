import webpush from 'web-push';
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

  const {
    title = 'H1ポータル',
    body  = '新しい投稿があります',
    url   = '/',
  } = req.body || {};

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: 'VAPID keys not configured' });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:k2k.studio.japan@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  try {
    // 購読者一覧を取得
    const sheets = google.sheets({ version: 'v4', auth: getAuth() });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: '購読者!A:C',
    });
    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(200).json({ ok: true, sent: 0, message: '購読者なし' });
    }

    const payload = JSON.stringify({ title, body, url });
    const results = await Promise.allSettled(
      rows.map(([endpoint, p256dh, auth]) => {
        if (!endpoint || !p256dh || !auth) return Promise.resolve();
        return webpush.sendNotification({ endpoint, keys: { p256dh, auth } }, payload);
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    console.log(`[push] sent=${sent} failed=${failed}`);

    return res.status(200).json({ ok: true, sent, failed });
  } catch (err) {
    console.error('[send-notification]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
