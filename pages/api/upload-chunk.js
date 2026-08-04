const {
  CHUNK_SIZE,
  MAX_CHUNKS,
  decryptToken,
  isTokenExpired,
  parseContentRange,
  validateChunkRange,
} = require('../../lib/upload-chunk-protocol');

export const config = { api: { bodyParser: false } };

const READ_LIMIT = CHUNK_SIZE + 1024;

function getHeader(req, name) {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function sendError(res, status, message, code) {
  const body = code ? { success: false, error: code, message } : { success: false, error: message };
  return res.status(status).json(body);
}

function readRequestBody(req, expectedLength) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let done = false;

    function fail(error) {
      if (done) return;
      done = true;
      req.destroy();
      reject(error);
    }

    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > READ_LIMIT || total > expectedLength) {
        fail(new Error('body_too_large'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (done) return;
      done = true;
      if (total !== expectedLength) {
        reject(new Error('body_length_mismatch'));
        return;
      }
      resolve(Buffer.concat(chunks, total));
    });
    req.on('error', fail);
  });
}

function parseGoogleRange(rangeHeader) {
  const match = String(rangeHeader || '').match(/^bytes=0-(\d+)$/);
  if (!match) return 0;
  return Number(match[1]) + 1;
}

async function relayToGoogle(sessionUrl, rangeHeader, body) {
  const headers = {
    'Content-Range': rangeHeader,
    'Content-Length': String(body ? body.length : 0),
  };
  if (body) headers['Content-Type'] = 'application/octet-stream';

  return fetch(sessionUrl, {
    method: 'PUT',
    headers,
    body: body || undefined,
  });
}

async function sendGoogleResult(googleResponse, res) {
  if (googleResponse.status === 308) {
    const receivedBytes = parseGoogleRange(googleResponse.headers.get('range'));
    return res.status(200).json({ success: true, status: 'incomplete', receivedBytes });
  }

  if (googleResponse.status === 200 || googleResponse.status === 201) {
    const data = await googleResponse.json().catch(() => ({}));
    return res.status(200).json({
      success: true,
      status: 'complete',
      fileId: data?.id,
      fileName: data?.name,
    });
  }

  if (googleResponse.status === 400) {
    return res.status(400).json({
      success: false,
      error: 'RANGE_MISMATCH',
      message: 'アップロードの位置がずれました。位置を確認して再送してください',
    });
  }

  if (googleResponse.status === 401 || googleResponse.status === 403) {
    console.error('Drive upload session rejected', { status: googleResponse.status });
    return sendError(res, 401, 'アップロードセッションが無効です。最初からやり直してください', 'UPLOAD_ABORTED');
  }

  console.error('Drive upload relay unexpected status', { status: googleResponse.status });
  return sendError(res, 502, 'アップロード中継に失敗しました', 'UPLOAD_REJECTED');
}

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const uploadToken = getHeader(req, 'x-upload-token');
  if (!uploadToken) return sendError(res, 401, 'アップロード認証情報がありません');

  let payload;
  try {
    payload = decryptToken(uploadToken, process.env.UPLOAD_TOKEN_SECRET);
  } catch {
    return sendError(res, 401, 'アップロード認証情報が不正です');
  }

  if (isTokenExpired(payload, Date.now())) {
    return sendError(res, 401, 'アップロードの有効期限が切れました。最初からやり直してください', 'TOKEN_EXPIRED');
  }

  const range = parseContentRange(getHeader(req, 'content-range'));
  if (!range) return sendError(res, 400, 'Content-Rangeが不正です');
  if (range.total !== payload.size) return sendError(res, 400, 'ファイルサイズが一致しません');

  try {
    if (range.isProbe) {
      const googleResponse = await relayToGoogle(payload.sessionUrl, `bytes */${range.total}`, null);
      return sendGoogleResult(googleResponse, res);
    }

    const validation = validateChunkRange(range, {
      expectedTotal: payload.size,
      chunkSize: CHUNK_SIZE,
      maxChunks: MAX_CHUNKS,
    });
    if (!validation.ok) return sendError(res, 400, 'アップロード範囲が不正です');

    const expectedLength = range.end - range.start + 1;
    const body = await readRequestBody(req, expectedLength);
    const googleResponse = await relayToGoogle(
      payload.sessionUrl,
      `bytes ${range.start}-${range.end}/${range.total}`,
      body,
    );
    return sendGoogleResult(googleResponse, res);
  } catch {
    console.error('Drive upload relay failed');
    return sendError(res, 502, 'アップロード中継に失敗しました', 'UPLOAD_REJECTED');
  }
}
