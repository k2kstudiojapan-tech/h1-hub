import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, category, department, author, title, summary, body, todos, links, meeting_date, zoom_recording_url, transcript_url } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'パスワードが違います' });
  }

  if (category === '__check__') return res.status(200).json({ success: true });

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: Buffer.from(process.env.GOOGLE_PRIVATE_KEY || '', 'base64').toString('utf-8'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const created_at = new Date().toLocaleString('ja-JP');

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'シート1!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[created_at, category, department, title, summary, body, todos, links, meeting_date, zoom_recording_url, transcript_url, 'TRUE', author || '']],
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('詳細エラー:', error.message);
    res.status(500).json({ error: error.message });
  }
}
