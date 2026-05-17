import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, rowIndex } = req.body;

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
    // rowIndex is 0-based from A2, spreadsheet row = rowIndex + 2
    const sheetRow = rowIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `シート1!L${sheetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [['TRUE']] },
    });

    res.status(200).json({ success: true, rowIndex });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
