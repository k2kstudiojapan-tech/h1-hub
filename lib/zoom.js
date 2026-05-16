const ZOOM_OAUTH_TOKEN_URL = 'https://zoom.us/oauth/token';
const ZOOM_API_BASE = 'https://api.zoom.us/v2';

export async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch(
    `${ZOOM_OAUTH_TOKEN_URL}?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zoom OAuth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function getMeetingSummary(meetingId) {
  const token = await getAccessToken();

  const res = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}/meeting_summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zoom meeting_summary API failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getMeetingTranscript(meetingId) {
  const token = await getAccessToken();

  const recordingsRes = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}/recordings`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!recordingsRes.ok) {
    const text = await recordingsRes.text();
    throw new Error(`Zoom recordings API failed: ${recordingsRes.status} ${text}`);
  }

  const recordings = await recordingsRes.json();
  const transcriptFile = recordings.recording_files?.find(
    f => f.file_type === 'TRANSCRIPT' && f.status === 'completed'
  );

  if (!transcriptFile) return null;

  const vttRes = await fetch(transcriptFile.download_url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!vttRes.ok) return null;

  const vtt = await vttRes.text();
  // Strip VTT timestamps/headers, keep only spoken text
  return vtt
    .split('\n')
    .filter(line => line && !line.startsWith('WEBVTT') && !line.match(/^\d+$/) && !line.match(/^\d{2}:\d{2}/))
    .join(' ')
    .trim();
}
