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

    // スプレッドシートのシートIDを取得
    const meta = await sheets.spreadsheets.get({ spreadsheetId: process.env.SPREADSHEET_ID });
    const sheet = meta.data.sheets.find(s => s.properties.title === 'シート1');
    const sheetId = sheet.properties.sheetId;

    // 行を削除（rowIndex+1 は0-based、データはA2から始まるのでrowIndex+1がsheetの0-basedindex）
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex + 1, // 0-based: row2=index1
              endIndex:   rowIndex + 2,
            },
          },
        }],
      },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[delete-pending]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
