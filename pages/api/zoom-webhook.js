import crypto from 'crypto';
import { google } from 'googleapis';
import OpenAI from 'openai';
import { getMeetingTranscript } from '../../lib/zoom';

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
  const defaultTitle = meeting.topic || `${department}ミーティング`;
  const meetingDate = meeting.start_time
    ? new Date(meeting.start_time).toLocaleString('ja-JP')
    : new Date().toLocaleString('ja-JP');

  let transcript = null;
  try {
    transcript = await getMeetingTranscript(meetingId);
  } catch (err) {
    console.error('Zoom transcript fetch failed:', err.message);
  }

  let title = defaultTitle;
  let summary = '';
  let body = '';
  let todos = '';

  if (transcript) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '以下の会議文字起こしを分析し、必ずJSON形式で回答してください。キー: title (会議タイトル), summary (2〜3行の短い要約), body (詳細な会議サマリー), todos (TODO項目を改行区切り)。',
          },
          {
            role: 'user',
            content: `部門: ${department}\n\n文字起こし:\n${transcript}`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content);
      title = result.title || defaultTitle;
      summary = result.summary || '';
      body = result.body || '';
      todos = result.todos || '';
    } catch (err) {
      console.error('OpenAI summarization failed:', err.message);
    }
  }

  try {
    await saveToSheets({
      category: 'ミーティング',
      department,
      title,
      summary,
      body,
      todos,
      meeting_date: meetingDate,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Sheets save failed:', err.message);
    res.status(500).json({ error: err.message });
  }
}
