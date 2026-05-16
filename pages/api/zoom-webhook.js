import crypto from 'crypto';
import { google } from 'googleapis';
import { getMeetingSummary } from '../../lib/zoom';

export const config = {
  api: { bodyParser: false },
};

const ROOM_DEPARTMENT_MAP = {
  '86395338905': '全体',
  '83863635589': '役員',
  '89397572415': '執行部会',
  '88457604930': '開発',
  '89970981219': '運営',
  '85342110171': 'SNS・企業連携',
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function verifySignature(rawBody, timestamp, signature) {
  const message = `v0:${timestamp}:${rawBody}`;
  const hash = crypto
    .createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN)
    .update(message)
    .digest('hex');
  return `v0=${hash}` === signature;
}

async function saveToSheets({ category, department, title, summary, body, todos, meeting_date }) {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: Buffer.from(process.env.GOOGLE_PRIVATE_KEY || '', 'base64').toString('utf-8'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const created_at = new Date().toLocaleString('ja-JP');

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'シート1!A:L',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[created_at, category, department, title, summary, body, todos, '', meeting_date, '', '', 'PENDING']],
    },
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // Zoom URL validation handshake
  if (payload.event === 'endpoint.url_validation') {
    const encryptedToken = crypto
      .createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN)
      .update(payload.payload.plainToken)
      .digest('hex');
    return res.status(200).json({
      plainToken: payload.payload.plainToken,
      encryptedToken,
    });
  }

  // Verify webhook signature
  const timestamp = req.headers['x-zm-request-timestamp'];
  const signature = req.headers['x-zm-signature'];
  if (!timestamp || !signature || !verifySignature(rawBody, timestamp, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  if (payload.event !== 'meeting.ended') {
    return res.status(200).json({ received: true });
  }

  const meeting = payload.payload.object;
  const meetingId = String(meeting.id);
  const department = ROOM_DEPARTMENT_MAP[meetingId] || '不明';

  // Fetch Zoom AI summary (may not be immediately available)
  let summaryData = null;
  try {
    summaryData = await getMeetingSummary(meetingId);
  } catch (err) {
    console.error('Zoom summary fetch failed:', err.message);
  }

  const summaryText = summaryData?.summary_details?.map(d => d.summary).join('\n') || '';
  const actionItems = Array.isArray(summaryData?.next_steps)
    ? summaryData.next_steps.join('\n')
    : '';
  const meetingTopic = summaryData?.meeting_topic || meeting.topic || `${department}ミーティング`;
  const meetingDate = meeting.start_time
    ? new Date(meeting.start_time).toLocaleString('ja-JP')
    : new Date().toLocaleString('ja-JP');

  try {
    await saveToSheets({
      category: 'ミーティング',
      department,
      title: meetingTopic,
      summary: summaryText,
      body: summaryText,
      todos: actionItems,
      meeting_date: meetingDate,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Sheets save failed:', err.message);
    res.status(500).json({ error: err.message });
  }
}
