/**
 * テスト通知送信API（将来: 全購読者へのPush送信に拡張）
 *
 * POST /api/send-notification
 * Body: { title, body, url, department? }
 *
 * 本番Push通知を実装する場合の追加要件:
 *   1. VAPID鍵ペア生成: npx web-push generate-vapid-keys
 *   2. npm install web-push
 *   3. .env.local に VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT を追記
 *   4. 保存済みサブスクリプションを取得してwebpush.sendNotification()を呼ぶ
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    title = 'H1ポータル',
    body  = 'テスト通知です',
    url   = '/',
    department = null,
  } = req.body || {};

  // クライアント側でServiceWorkerRegistration.showNotification()を使ってもらう
  // サーバー側Push（web-push）を有効にする場合はここに実装

  return res.status(200).json({
    ok: true,
    notification: { title, body, url, department },
    message: 'クライアント側でSW通知を表示してください',
    // 本番実装時: 'VAPID設定後にweb-pushで全端末に送信できます'
  });
}
