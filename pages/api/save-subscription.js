/**
 * Push通知サブスクリプション保存API
 *
 * 現状: ログ出力のみ（将来: Google SheetsまたはSupabaseに保存）
 * POST /api/save-subscription
 * Body: { endpoint, expirationTime, keys: { p256dh, auth } }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const subscription = req.body;

  if (!subscription?.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' });
  }

  // TODO: ここにサブスクリプション保存ロジックを追加
  // 例: Google Sheetsに追記、またはSupabaseのテーブルに保存
  // const { endpoint, keys } = subscription;
  // await saveToSheet(endpoint, keys.p256dh, keys.auth);

  console.log('[Push] 新しいサブスクリプション:', subscription.endpoint.substring(0, 60) + '...');

  return res.status(200).json({
    ok: true,
    message: 'Subscription received',
  });
}
