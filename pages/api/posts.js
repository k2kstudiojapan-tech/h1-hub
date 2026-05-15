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
      range: 'シート1!A2:L',
    });

    const rows = response.data.values || [];
    const posts = [];
    rows.forEach((row, i) => {
      if (row[11] === 'TRUE') {
        posts.push({
          id: i,
          created_at: row[0] || '',
          category: row[1] || '',
          department: row[2] || '',
          title: row[3] || '',
          summary: row[4] || '',
          body: row[5] || '',
          todos: row[6] || '',
          links: row[7] || '',
          meeting_date: row[8] || '',
          zoom_recording_url: row[9] || '',
          transcript_url: row[10] || '',
        });
      }
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(200).json([]);
  }
}
