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
