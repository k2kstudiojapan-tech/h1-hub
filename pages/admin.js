import { useState } from 'react';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [auth, setAuth] = useState(false);
  const [authError, setAuthError] = useState('');
  const [form, setForm] = useState({ category: '', title: '', body: '', date: '' });
  const [status, setStatus] = useState('');

  const handleLogin = () => {
    if (password === '') { setAuthError('パスワードを入力してください'); return; }
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, category: '__check__', title: '', body: '', date: '' }),
    }).then(r => {
      if (r.status === 401) { setAuthError('パスワードが違います'); }
      else { setAuth(true); }
    });
  };

  const handleSubmit = () => {
    if (!form.category || !form.title || !form.body) { setStatus('カテゴリ・タイトル・本文は必須です'); return; }
    setStatus('送信中...');
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, ...form }),
    }).then(r => r.json()).then(data => {
      if (data.success) { setStatus('公開しました'); setForm({ category: '', title: '', body: '', date: '' }); }
      else { setStatus('エラー：' + data.error); }
    });
  };

  if (!auth) return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>H1情報ハブ 管理画面</div>
        <div style={styles.headerSub}>役員専用</div>
      </div>
      <div style={styles.body}>
        <div style={styles.label}>パスワード</div>
        <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="パスワードを入力" />
        {authError && <div style={styles.error}>{authError}</div>}
        <button style={styles.btn} onClick={handleLogin}>ログイン</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>H1情報ハブ 管理画面</div>
        <div style={styles.headerSub}>役員専用 ／ 新規投稿</div>
      </div>
      <div style={styles.body}>
        <div style={styles.label}>カテゴリ *</div>
        <select style={styles.input} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
          <option value="">選択してください</option>
          <option>決定事項</option>
          <option>重要なお知らせ</option>
          <option>会議サマリー</option>
          <option>予定・スケジュール</option>
        </select>

        <div style={styles.label}>タイトル *</div>
        <input style={styles.input} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="例：エントリー締切を延長します" />

        <div style={styles.label}>本文 *</div>
        <textarea style={styles.textarea} value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Claudeで整形した文章をここに貼り付けてください。" />

        <div style={styles.label}>日付</div>
        <input style={styles.input} type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />

        {status && <div style={status === '公開しました' ? styles.success : styles.error}>{status}</div>}
        <button style={styles.btn} onClick={handleSubmit}>公開する</button>
      </div>
    </div>
  );
}

const C = { accent: '#1a4f8a', text: '#1a1a1a', sub: '#555', border: '#ddd', bg: '#f7f7f5' };
const styles = {
  page: { maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: 'sans-serif' },
  header: { background: '#2c2c2c', color: 'white', padding: '16px 20px' },
  headerTitle: { fontSize: 18, fontWeight: 700 },
  headerSub: { fontSize: 11, opacity: 0.6, marginTop: 3 },
  body: { padding: 16, display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontSize: 12, fontWeight: 700, color: C.sub },
  input: { fontSize: 15, padding: '11px 13px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: 'white', width: '100%', fontFamily: 'sans-serif' },
  textarea: { fontSize: 15, padding: '11px 13px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: 'white', width: '100%', minHeight: 130, lineHeight: 1.7, fontFamily: 'sans-serif', resize: 'vertical' },
  btn: { background: C.accent, color: 'white', fontSize: 16, fontWeight: 700, padding: 16, border: 'none', borderRadius: 10, cursor: 'pointer', width: '100%' },
  error: { fontSize: 13, color: '#e74c3c', background: '#fff8f7', padding: '8px 12px', borderRadius: 6 },
  success: { fontSize: 13, color: '#2e7d32', background: '#eaf4ea', padding: '8px 12px', borderRadius: 6 },
};