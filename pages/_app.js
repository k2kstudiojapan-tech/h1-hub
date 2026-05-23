import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return <Component {...pageProps} />;
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

    // 更新があれば自動適用
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 新しいSWが準備できた → 次回リロード時に反映
          console.log('[SW] 新しいバージョンが利用可能です');
        }
      });
    });
  } catch (err) {
    console.warn('[SW] 登録失敗:', err);
  }
}
