import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Service Worker: キャッシュ禁止（常に最新を取得させる）
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control',          value: 'public, max-age=0, must-revalidate' },
          { key: 'Content-Type',           value: 'application/javascript; charset=UTF-8' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // Web Manifest: 短いキャッシュ
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Content-Type', value: 'application/manifest+json; charset=UTF-8' },
        ],
      },
      {
        // アイコンは長期キャッシュ可（内容が変わるときはファイル名を変える）
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
