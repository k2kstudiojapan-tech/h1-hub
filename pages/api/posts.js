import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: Buffer.from(process.env.GOOGLE_PRIVATE_KEY || '', 'base64').toString('utf-8'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'シート1!A2:F',
    });

    const rows = response.data.values || [];
    const posts = rows
      .filter(row => row[5] === 'TRUE')
      .map(row => ({
        timestamp: row[0],
        category: row[1],
        title: row[2],
        body: row[3],
        date: row[4],
        published: row[5],
      }));

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(200).json([]);
  }
}