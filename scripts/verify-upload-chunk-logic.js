#!/usr/bin/env node
'use strict';

const assert = require('assert');
const {
  CHUNK_SIZE,
  MAX_CHUNKS,
  encryptToken,
  decryptToken,
  isTokenExpired,
  parseContentRange,
  validateChunkRange,
} = require('../lib/upload-chunk-protocol');

const checks = [];

function check(name, fn) {
  checks.push({ name, fn });
}

check('encryptTokenとdecryptTokenの往復', () => {
  const payload = {
    sessionUrl: 'https://example.invalid/session',
    filename: 'meeting.pdf',
    mimeType: 'application/pdf',
    size: 12345,
    folderId: 'folder',
    issuedAt: 1000,
    expiresAt: 2000,
  };
  assert.deepStrictEqual(decryptToken(encryptToken(payload, 'secret'), 'secret'), payload);
});

check('改ざんされたトークンの拒否', () => {
  // トークン文字列の末尾1文字だけを別の文字に置換する方式は、その文字が
  // base64urlの余りバイトを表す場合、置換先によっては実際のバイト値が
  // 変化せず改ざんを検出できないことがある（確率的に失敗するテストに
  // なってしまう）。ciphertext部分の先頭バイトを実際にXORで反転させる
  // ことで、常に実バイト値が変化することを保証する。
  const token = encryptToken({ size: 1, expiresAt: 2 }, 'secret');
  const [ivPart, ciphertextPart, tagPart] = token.split('.');
  const ciphertextBuf = Buffer.from(ciphertextPart, 'base64url');
  ciphertextBuf[0] ^= 0xff;
  const tampered = `${ivPart}.${ciphertextBuf.toString('base64url')}.${tagPart}`;
  assert.throws(() => decryptToken(tampered, 'secret'));
});

check('isTokenExpiredの判定', () => {
  assert.strictEqual(isTokenExpired({ expiresAt: 2000 }, 1999), false);
  assert.strictEqual(isTokenExpired({ expiresAt: 2000 }, 2000), true);
});

check('parseContentRangeの通常形式', () => {
  assert.deepStrictEqual(parseContentRange('bytes 0-100/500'), {
    isProbe: false,
    start: 0,
    end: 100,
    total: 500,
  });
});

check('parseContentRangeの位置確認形式', () => {
  assert.deepStrictEqual(parseContentRange('bytes */500'), { isProbe: true, total: 500 });
});

check('parseContentRangeの不正形式', () => {
  assert.strictEqual(parseContentRange('bytes a-100/500'), null);
  assert.strictEqual(parseContentRange('bytes 0-100/'), null);
  assert.strictEqual(parseContentRange('bytes 101-100/500'), null);
});

check('validateChunkRangeの正常チャンク', () => {
  assert.deepStrictEqual(
    validateChunkRange(
      { start: 0, end: CHUNK_SIZE - 1, total: CHUNK_SIZE * 2 },
      { expectedTotal: CHUNK_SIZE * 2, chunkSize: CHUNK_SIZE, maxChunks: MAX_CHUNKS },
    ),
    { ok: true },
  );
});

check('validateChunkRangeのtotal不一致', () => {
  assert.strictEqual(
    validateChunkRange(
      { start: 0, end: 10, total: 100 },
      { expectedTotal: 101, chunkSize: CHUNK_SIZE, maxChunks: MAX_CHUNKS },
    ).ok,
    false,
  );
});

check('validateChunkRangeのチャンクサイズ超過', () => {
  assert.strictEqual(
    validateChunkRange(
      { start: 0, end: CHUNK_SIZE, total: CHUNK_SIZE + 2 },
      { expectedTotal: CHUNK_SIZE + 2, chunkSize: CHUNK_SIZE, maxChunks: MAX_CHUNKS },
    ).ok,
    false,
  );
});

check('validateChunkRangeのMAX_CHUNKS超過', () => {
  const start = CHUNK_SIZE * MAX_CHUNKS;
  assert.strictEqual(
    validateChunkRange(
      { start, end: start, total: start + 1 },
      { expectedTotal: start + 1, chunkSize: CHUNK_SIZE, maxChunks: MAX_CHUNKS },
    ).ok,
    false,
  );
});

for (const { name, fn } of checks) {
  try {
    fn();
  } catch (error) {
    process.exitCode = 1;
    console.log(`検証失敗: ${name}`);
    console.log(error && error.message ? error.message : String(error));
  }
}

if (!process.exitCode) {
  console.log('全ての検証に合格しました');
}
