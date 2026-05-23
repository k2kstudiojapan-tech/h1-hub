// H1ポータル Service Worker
// バージョンを変えるとキャッシュが更新されます
const CACHE_VERSION = 'v1';
const CACHE_NAME = `h1-portal-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// インストール時にプリキャッシュするファイル
const PRECACHE_URLS = [
  '/offline.html',
  '/manifest.json',
  '/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-72.png',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // 古いキャッシュを削除
      caches.keys().then((names) =>
        Promise.all(
          names
            .filter((n) => n.startsWith('h1-portal-') && n !== CACHE_NAME)
            .map((n) => caches.delete(n))
        )
      ),
      self.clients.claim(),
    ])
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // GETリクエスト・同一オリジンのみ処理
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // APIルートはネットワーク専用（キャッシュしない）
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        })
      )
    );
    return;
  }

  // ナビゲーション（ページ遷移）: ネットワーク優先 → オフライン時はoffline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // 静的アセット: キャッシュ優先 → なければネットワーク取得してキャッシュ
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
      return cached || networkFetch;
    })
  );
});

// ─── Push通知受信 ─────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {
    title: 'H1ポータル',
    body: '新しいお知らせがあります',
    url: '/',
    department: null,
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: 'h1-notification',
    renotify: true,
    vibrate: [100, 50, 100],
    data: { url: data.url },
    actions: [
      { action: 'open', title: '開く' },
      { action: 'dismiss', title: '閉じる' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ─── 通知クリック ──────────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
});
