import { google } from 'googleapis';

export default async function handler(req, res) {
  const password = req.method === 'POST' ? req.body?.password : req.query?.password;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'パスワードが違います' });
  }

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: Buffer.from(process.env.GOOGLE_PRIVATE_KEY || '', 'base64').toString('utf-8'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'シート1!A2:M',
    });

    const rows = response.data.values || [];
    const posts = [];
    rows.forEach((row, i) => {
      if (row[11] === 'PENDING') {
        posts.push({
          rowIndex: i,
          created_at: row[0] || '',
          category: row[1] || '',
          department: row[2] || '',
          title: row[3] || '',
          summary: row[4] || '',
          body: row[5] || '',
          author: row[12] || '',
        });
      }
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
