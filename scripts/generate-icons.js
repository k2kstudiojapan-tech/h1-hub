#!/usr/bin/env node
/**
 * H1ポータル PWAアイコン生成スクリプト
 * Node.js組み込みモジュールのみ使用（追加パッケージ不要）
 * 色: ネイビーブルー #1a4f8a = RGB(26, 79, 138)
 *
 * 実行: node scripts/generate-icons.js
 */
'use strict';

const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// アイコンカラー (H1ポータル ネイビーブルー)
const R = 26, G = 79, B = 138;

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

// ─── CRC32 ────────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// ─── PNG utilities ────────────────────────────────────────────────────────────
function u32BE(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function pngChunk(type, data) {
  const typeBuf  = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  return Buffer.concat([u32BE(data.length), typeBuf, data, u32BE(crc32(crcInput))]);
}

// ─── 単色PNG生成 ──────────────────────────────────────────────────────────────
function createSolidPNG(size, r, g, b) {
  // シグネチャ
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: 幅・高さ・ビット深度8・カラータイプRGB(2)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB

  // 各スキャンライン = フィルタバイト(0=None) + RGB×size
  const rowLen = 1 + size * 3;
  const row    = Buffer.alloc(rowLen);
  row[0] = 0;
  for (let x = 0; x < size; x++) {
    row[1 + x * 3]     = r;
    row[1 + x * 3 + 1] = g;
    row[1 + x * 3 + 2] = b;
  }
  const raw  = Buffer.concat(Array(size).fill(row));
  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── 実行 ─────────────────────────────────────────────────────────────────────
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

let generated = 0;
for (const size of SIZES) {
  const png     = createSolidPNG(size, R, G, B);
  const outPath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`  ✓ icon-${size}.png  (${(png.length / 1024).toFixed(1)} KB)`);
  generated++;
}

console.log(`\n✅ ${generated}個のアイコンを生成: ${iconsDir}`);
console.log('   色: #1a4f8a (ネイビーブルー)');
console.log('   ブランドアイコンに置き換える場合は public/icons/ のPNGを差し替えてください');
