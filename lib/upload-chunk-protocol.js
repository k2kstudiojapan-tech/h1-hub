'use strict';

const crypto = require('crypto');

const CHUNK_SIZE = 3 * 1024 * 1024;
const MAX_CHUNKS = 20;

function keyFromSecret(secret) {
  if (!secret) throw new Error('missing_secret');
  return crypto.createHash('sha256').update(String(secret)).digest();
}

function toBase64Url(buffer) {
  return Buffer.from(buffer).toString('base64url');
}

function fromBase64Url(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error('invalid_token_part');
  }
  return Buffer.from(value, 'base64url');
}

function encryptToken(payloadObj, secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyFromSecret(secret), iv);
  const plaintext = Buffer.from(JSON.stringify(payloadObj), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${toBase64Url(iv)}.${toBase64Url(ciphertext)}.${toBase64Url(authTag)}`;
}

function decryptToken(tokenString, secret) {
  const parts = String(tokenString || '').split('.');
  if (parts.length !== 3) throw new Error('invalid_token');

  const iv = fromBase64Url(parts[0]);
  const ciphertext = fromBase64Url(parts[1]);
  const authTag = fromBase64Url(parts[2]);
  if (iv.length !== 12 || authTag.length !== 16) throw new Error('invalid_token');

  const decipher = crypto.createDecipheriv('aes-256-gcm', keyFromSecret(secret), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}

function isTokenExpired(payload, nowMs) {
  return Number(payload?.expiresAt) <= nowMs;
}

function parseContentRange(headerValue) {
  const value = String(headerValue || '').trim();
  const probe = value.match(/^bytes \*\/(\d+)$/);
  if (probe) {
    const total = Number(probe[1]);
    return Number.isSafeInteger(total) && total > 0 ? { isProbe: true, total } : null;
  }

  const match = value.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
  if (!match) return null;

  const start = Number(match[1]);
  const end = Number(match[2]);
  const total = Number(match[3]);
  if (![start, end, total].every(Number.isSafeInteger)) return null;
  if (start < 0 || end < start || total <= 0 || end >= total) return null;
  return { isProbe: false, start, end, total };
}

function chunkIndexFor(start, chunkSize) {
  return Math.floor(start / chunkSize);
}

function reject(reason) {
  return { ok: false, reason };
}

function validateChunkRange(range, options) {
  const { expectedTotal, chunkSize, maxChunks } = options || {};
  const { start, end, total } = range || {};

  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start) {
    return reject('INVALID_RANGE');
  }
  if (total !== expectedTotal) return reject('TOTAL_MISMATCH');
  if (!Number.isSafeInteger(total) || total <= 0 || end >= total) return reject('INVALID_TOTAL');
  if ((end - start + 1) > chunkSize) return reject('CHUNK_TOO_LARGE');
  if (chunkIndexFor(start, chunkSize) >= maxChunks) return reject('TOO_MANY_CHUNKS');
  return { ok: true };
}

module.exports = {
  CHUNK_SIZE,
  MAX_CHUNKS,
  encryptToken,
  decryptToken,
  isTokenExpired,
  parseContentRange,
  chunkIndexFor,
  validateChunkRange,
};
