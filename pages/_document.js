import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        {/* PWA基本設定 */}
        <meta name="application-name" content="H1ポータル" />
        <meta name="description" content="H1法話グランプリ 公式情報ポータル" />

        {/* Android / Chrome PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1a4f8a" />

        {/* iOS Safari PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="H1" />
        {/* default: 通常のステータスバー / black-translucent: 全画面でコンテンツが後ろに回る */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />

        {/* アイコン */}
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />

        {/* マニフェスト */}
        <link rel="manifest" href="/manifest.json" />

        {/* スプラッシュスクリーン（iPhone主要サイズ） */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
          /* スクロールバー非表示（スマホ向け） */
          ::-webkit-scrollbar { display: none; }
          html { scrollbar-width: none; }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
