# H1ポータル — PWA対応 情報ハブ

H1法話グランプリ実行委員向けの公式情報ポータル。  
スマホのホーム画面に追加してアプリのように使えます（PWA）。

---

## ファイル構成

```
h1-hub/
├── pages/
│   ├── _document.js          PWAメタタグ・アイコン・マニフェストリンク
│   ├── _app.js               Service Worker登録
│   ├── index.js              トップページ（クイックアクション・投稿一覧・ボトムナビ）
│   ├── admin.js              投稿・承認管理（パスワード保護）
│   ├── decisions.js          決定事項一覧
│   ├── zoom.js               Zoom会議室一覧
│   ├── posts/[id].js         投稿詳細
│   └── api/
│       ├── posts.js          投稿一覧取得（Google Sheets）
│       ├── submit.js         投稿作成
│       ├── approve.js        投稿承認
│       ├── pending.js        承認待ち一覧
│       ├── upload.js         Driveファイルアップロード
│       ├── zoom-webhook.js   Zoom終了フック → AI議事録生成
│       ├── save-subscription.js  Push通知サブスクリプション保存（将来用）
│       └── send-notification.js  Push通知送信エンドポイント（将来用）
├── public/
│   ├── manifest.json         Web App Manifest（PWAの設定ファイル）
│   ├── sw.js                 Service Worker（オフライン・キャッシュ・Push受信）
│   ├── offline.html          オフライン時フォールバックページ
│   ├── icon.svg              SVGアイコン（Chrome等のSVG対応ブラウザ用）
│   └── icons/
│       └── icon-{size}.png   PNGアイコン（72〜512px、prebuildで自動生成）
├── scripts/
│   └── generate-icons.js     PNGアイコン自動生成スクリプト（追加パッケージ不要）
├── lib/
│   ├── rooms.js              Zoom会議室設定
│   └── zoom.js               Zoom API連携
└── next.config.ts            SWキャッシュヘッダー・アイコンキャッシュ設定
```

---

## ホーム画面への追加方法

### iPhone（iOS 16.4以上 推奨）

1. **Safari** でポータルURLを開く（ChromeやFirefoxは不可）
2. 画面下部の **「□↑」（共有ボタン）** をタップ
3. **「ホーム画面に追加」** をタップ
4. 名前を確認して **「追加」** をタップ
5. ホーム画面に「H1」アイコンが追加される

> iOS 16.4以上でスタンドアロンモードになり、Push通知も利用可能になります。

### Android（Chrome）

1. **Chrome** でポータルURLを開く
2. アドレスバー右の **「⋮」メニュー** をタップ
3. **「ホーム画面に追加」** をタップ
4. 確認ダイアログで **「追加」** をタップ

---

## PWAの仕組み

```
ブラウザ
  └── manifest.json を読む → アプリ情報（名前・色・アイコン）をOSに登録
  └── sw.js を登録 → Service Worker がバックグラウンドで常駐

Service Worker のキャッシュ戦略:
  ├── APIルート (/api/*) → ネットワーク専用（常に最新データ）
  ├── ページ遷移 (navigate) → ネットワーク優先 → オフライン時は offline.html
  └── 静的アセット → キャッシュ優先 → なければネットワーク取得してキャッシュ
```

---

## 通知が動く条件

| 条件 | Android Chrome | iPhone Safari |
|------|:-:|:-:|
| HTTPSサイト | ✅ 必須 | ✅ 必須 |
| ユーザーが許可 | ✅ 必須 | ✅ 必須 |
| ホーム画面に追加済み | 不要 | ✅ **必須** |
| iOS 16.4以上 | — | ✅ **必須** |

---

## Vercelデプロイ手順

```bash
# GitHub連携で自動デプロイ（推奨）
# Vercel Dashboard → Import Git Repository → 環境変数を設定
```

| 環境変数 | 説明 |
|----------|------|
| `SPREADSHEET_ID` | Google SheetsのスプレッドシートID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | サービスアカウントメール |
| `GOOGLE_PRIVATE_KEY` | 秘密鍵（base64エンコード） |
| `ADMIN_PASSWORD` | 管理画面パスワード |
| `NEXT_PUBLIC_DRIVE_URL` | Google DriveのURL |
| `ZOOM_ACCOUNT_ID` / `ZOOM_CLIENT_ID` / `ZOOM_CLIENT_SECRET` | Zoom API |
| `ZOOM_WEBHOOK_SECRET_TOKEN` | ZoomウェブフックToken |
| `OPENAI_API_KEY` | AI議事録生成用 |
| `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` / `GOOGLE_OAUTH_REFRESH_TOKEN` | Drive直接アップロード用 |

> `npm run build` の前に `prebuild` が自動実行され、アイコンが生成されます。Vercel上でも同様に動作します。

---

## バッジ（未読数）の仕組み

Badging APIを使い、アプリアイコンに未読件数を赤バッジ表示します。

```
起動時:
  投稿取得 → localStorage「前回閲覧時刻」と比較 → 新投稿数を算出
  → navigator.setAppBadge(count) でバッジ設定
  → 5秒後に navigator.clearAppBadge() でクリア
  → 「前回閲覧時刻」を現在時刻で更新
```

| プラットフォーム | バッジ対応 |
|----------------|:------:|
| Android Chrome（ホーム画面追加時） | ✅ |
| Windows Chrome / Edge | ✅ |
| Mac Safari | ✅ |
| iPhone（iOS 17以降・一部端末） | ⚠️ 限定的 |

---

## Push通知の本実装手順（将来）

現在はSW経由のローカル表示通知のみ対応。全端末へのサーバー発信Pushには以下が必要：

### 1. VAPID鍵を生成
```bash
npm install web-push
npx web-push generate-vapid-keys
```

### 2. 環境変数に追加
```
VAPID_PUBLIC_KEY=BExamplePublicKey...
VAPID_PRIVATE_KEY=ExamplePrivateKey...
VAPID_SUBJECT=mailto:admin@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BExamplePublicKey...
```

### 3. save-subscription.js に保存ロジックを追加
Google SheetsまたはSupabaseのテーブルに `endpoint` と `keys` を保存。

### 4. send-notification.js でweb-pushを使って全購読者に送信
```javascript
import webpush from 'web-push';
webpush.setVapidDetails(subject, publicKey, privateKey);
// 保存済みサブスクリプションをループして送信
await webpush.sendNotification(subscription, JSON.stringify({ title, body, url }));
```

---

## アイコンのカスタマイズ

現在は単色ネイビーブルー（#1a4f8a）です。ブランドロゴへの変更方法：

```bash
# 単色アイコンを再生成
npm run generate-icons

# または public/icons/ に直接PNGを配置（要サイズ: 72/96/128/144/152/180/192/384/512px）
```

---

## 将来の拡張計画

| 機能 | 説明 |
|------|------|
| Push通知 本実装 | VAPID + 購読者管理でサーバー発信通知 |
| AI議事録ページ | Zoom録画→自動要約→閲覧ページ |
| 部署別フィルター | ホームに部署タブを追加 |
| 未読管理（投稿単位） | 既読フラグをローカル保存 |
| 役員限定ページ | 認証付きページ |
| Supabase移行 | Google Sheets → リレーショナルDB |
| Claude API連携 | 高度な議事録生成・要約 |

---

## ローカル開発

```bash
npm install
npm run generate-icons   # アイコン生成（初回のみ）
npm run dev              # → http://localhost:3000
```

> Service WorkerはHTTPS（またはlocalhost）でのみ動作します。
