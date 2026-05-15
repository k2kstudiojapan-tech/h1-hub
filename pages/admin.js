import { useState } from 'react';

const DEPARTMENTS = ['役員', '執行部会', '運営チーム', '開発チーム', 'SNS', '企業連携チーム', '事務局'];

const emptyForm = {
  category: '', department: '', title: '', summary: '', body: '',
  todos: '', links: '', meeting_date: '', zoom_recording_url: '', transcript_url: '',
};

export default function Admin() {
  const [password, setPassword] = useState('');
  const [auth, setAuth] = useState(false);
  const [authError, setAuthError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');

  const handleLogin = () => {
    if (!password) { setAuthError('パスワードを入力してください'); return; }
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, category: '__check__' }),
    }).then(r => {
      if (r.status === 401) { setAuthError('パスワードが違います'); }
      else { setAuth(true); }
    });
  };

  const handleSubmit = () => {
    if (!form.category || !form.department || !form.title || !form.body) {
      setStatus('カテゴリ・部署・タイトル・本文は必須です');
      return;
    }
    setStatus('送信中...');
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, ...form }),
    }).then(r => r.json()).then(data => {
      if (data.success) { setStatus('公開しました'); setForm(emptyForm); }
      else { setStatus('エラー：' + data.error); }
    });
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  if (!auth) return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>H1情報ハブ 管理画面</div>
        <div style={styles.headerSub}>役員専用</div>
      </div>
      <div style={styles.body}>
        <div style={styles.label}>パスワード</div>
        <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="パスワードを入力"
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
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
        <select style={styles.input} value={form.category} onChange={set('category')}>
          <option value="">選択してください</option>
          <option>決定事項</option>
          <option>重要なお知らせ</option>
          <option>会議サマリー</option>
          <option>予定・スケジュール</option>
        </select>

        <div style={styles.label}>部署 *</div>
        <div style={styles.tagRow}>
          {DEPARTMENTS.map(d => (
            <button key={d} style={form.department === d ? styles.tagSelected : styles.tag}
              onClick={() => setForm({ ...form, department: d })}>
              {d}
            </button>
          ))}
        </div>

        <div style={styles.label}>タイトル *</div>
        <input style={styles.input} value={form.title} onChange={set('title')} placeholder="例：エントリー締切を延長します" />

        <div style={styles.label}>短い要約</div>
        <input style={styles.input} value={form.summary} onChange={set('summary')} placeholder="一行で内容を説明してください" />

        <div style={styles.label}>本文 *</div>
        <textarea style={styles.textarea} value={form.body} onChange={set('body')} placeholder="Claudeで整形した文章をここに貼り付けてください。" />

        <div style={styles.label}>TODO（1行1項目）</div>
        <textarea style={{ ...styles.textarea, minHeight: 80 }} value={form.todos} onChange={set('todos')} placeholder={"参加者に連絡する\n資料を共有する"} />

        <div style={styles.label}>関連リンク（1行1URL）</div>
        <textarea style={{ ...styles.textarea, minHeight: 80 }} value={form.links} onChange={set('links')} placeholder="https://example.com" />

        <div style={styles.label}>会議日</div>
        <input style={styles.input} type="date" value={form.meeting_date} onChange={set('meeting_date')} />

        <div style={styles.label}>Zoom録画URL</div>
        <input style={styles.input} value={form.zoom_recording_url} onChange={set('zoom_recording_url')} placeholder="https://zoom.us/..." />

        <div style={styles.label}>議事録URL</div>
        <input style={styles.input} value={form.transcript_url} onChange={set('transcript_url')} placeholder="https://docs.google.com/..." />

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
  input: { fontSize: 15, padding: '11px 13px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: 'white', width: '100%', fontFamily: 'sans-serif', boxSizing: 'border-box' },
  textarea: { fontSize: 15, padding: '11px 13px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: 'white', width: '100%', minHeight: 130, lineHeight: 1.7, fontFamily: 'sans-serif', resize: 'vertical', boxSizing: 'border-box' },
  btn: { background: C.accent, color: 'white', fontSize: 16, fontWeight: 700, padding: 16, border: 'none', borderRadius: 10, cursor: 'pointer', width: '100%' },
  error: { fontSize: 13, color: '#e74c3c', background: '#fff8f7', padding: '8px 12px', borderRadius: 6 },
  success: { fontSize: 13, color: '#2e7d32', background: '#eaf4ea', padding: '8px 12px', borderRadius: 6 },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  tag: { fontSize: 13, padding: '6px 13px', borderRadius: 20, border: `1.5px solid ${C.border}`, background: 'white', cursor: 'pointer', fontFamily: 'sans-serif' },
  tagSelected: { fontSize: 13, padding: '6px 13px', borderRadius: 20, border: `1.5px solid ${C.accent}`, background: C.accent, color: 'white', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 700 },
};
