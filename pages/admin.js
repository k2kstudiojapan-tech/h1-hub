import { useState } from 'react';

const DEPARTMENTS = ['役員', '執行部会', '運営チーム', '開発チーム', 'SNS', '企業連携チーム', '事務局'];
const CATEGORIES = ['決定事項', '会議サマリー', 'お知らせ', '予定・スケジュール'];

const emptyForm = {
  category: '', department: '', author: '',
  title: '', summary: '', body: '',
  todos: '', links: '', meeting_date: '',
  zoom_recording_url: '', transcript_url: '',
};

export default function Admin() {
  const [password, setPassword] = useState('');
  const [auth, setAuth] = useState(false);
  const [authError, setAuthError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [approveStatus, setApproveStatus] = useState({});

  const fetchPending = (pw) => {
    setPendingLoading(true);
    fetch(`/api/pending?password=${encodeURIComponent(pw)}`)
      .then(r => r.json())
      .then(data => { setPendingPosts(Array.isArray(data) ? data : []); })
      .finally(() => setPendingLoading(false));
  };

  const handleLogin = () => {
    if (!password) { setAuthError('パスワードを入力してください'); return; }
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, category: '__check__' }),
    }).then(r => {
      if (r.status === 401) { setAuthError('パスワードが違います'); }
      else { setAuth(true); fetchPending(password); }
    });
  };

  const handleApprove = (rowIndex) => {
    setApproveStatus(s => ({ ...s, [rowIndex]: '公開中...' }));
    fetch('/api/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, rowIndex }),
    }).then(r => r.json()).then(data => {
      if (data.success) {
        setApproveStatus(s => ({ ...s, [rowIndex]: '公開しました' }));
        setPendingPosts(prev => prev.filter(p => p.rowIndex !== rowIndex));
      } else {
        setApproveStatus(s => ({ ...s, [rowIndex]: 'エラー：' + data.error }));
      }
    });
  };

  const handleSubmit = () => {
    if (!form.category || !form.department || !form.author || !form.title) {
      setStatus('カテゴリ・部署・投稿者名・タイトルは必須です');
      return;
    }
    if (form.category === '決定事項' && !form.body) {
      setStatus('決定内容は必須です');
      return;
    }
    if (form.category === 'お知らせ' && !form.body) {
      setStatus('本文は必須です');
      return;
    }
    if (form.category === '予定・スケジュール' && !form.meeting_date) {
      setStatus('日時は必須です');
      return;
    }
    setStatus('送信中...');
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, ...form }),
    }).then(r => r.json()).then(data => {
      if (data.success) {
        setStatus('承認待ちに追加しました');
        setForm(emptyForm);
        fetchPending(password);
      } else {
        setStatus('エラー：' + data.error);
      }
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
        <div style={styles.headerSub}>役員専用</div>
      </div>
      <div style={styles.body}>

        {/* 承認待ち投稿セクション */}
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>承認待ち投稿</span>
          {pendingPosts.length > 0 && (
            <span style={styles.badge}>{pendingPosts.length}</span>
          )}
          <button style={styles.refreshBtn} onClick={() => fetchPending(password)}>更新</button>
        </div>

        {pendingLoading && <div style={styles.loadingText}>読み込み中...</div>}

        {!pendingLoading && pendingPosts.length === 0 && (
          <div style={styles.emptyText}>承認待ちの投稿はありません</div>
        )}

        {pendingPosts.map(post => (
          <div key={post.rowIndex} style={styles.pendingCard}>
            <div style={styles.pendingMeta}>
              {post.created_at && <span>{post.created_at} ・ </span>}
              <span style={styles.categoryTag}>{post.category}</span>
              {' '}
              <span style={styles.deptTag}>{post.department}</span>
              {post.author && <span style={styles.authorTag}>{post.author}</span>}
            </div>
            <div style={styles.pendingTitle}>{post.title}</div>
            {post.summary && <div style={styles.pendingSummary}>{post.summary}</div>}
            {post.body && (
              <div style={styles.pendingBody}>
                {post.body.length > 120 ? post.body.slice(0, 120) + '…' : post.body}
              </div>
            )}
            {approveStatus[post.rowIndex] ? (
              <div style={approveStatus[post.rowIndex] === '公開しました' ? styles.approveSuccess : styles.approveError}>
                {approveStatus[post.rowIndex]}
              </div>
            ) : (
              <button style={styles.approveBtn} onClick={() => handleApprove(post.rowIndex)}>
                承認して公開
              </button>
            )}
          </div>
        ))}

        <div style={styles.divider} />

        {/* 新規投稿フォーム */}
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>新規投稿</span>
        </div>

        <div style={styles.label}>カテゴリ *</div>
        <select style={styles.input} value={form.category} onChange={e => setForm({ ...emptyForm, category: e.target.value })}>
          <option value="">選択してください</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>

        {form.category && (
          <>
            <div style={styles.label}>部署 *</div>
            <div style={styles.tagRow}>
              {DEPARTMENTS.map(d => (
                <button key={d} style={form.department === d ? styles.tagSelected : styles.tag}
                  onClick={() => setForm({ ...form, department: d })}>
                  {d}
                </button>
              ))}
            </div>

            <div style={styles.label}>投稿者名 *</div>
            <input style={styles.input} value={form.author} onChange={set('author')} placeholder="氏名を入力" />

            <div style={styles.label}>タイトル *</div>
            <input style={styles.input} value={form.title} onChange={set('title')} placeholder="タイトルを入力" />

            {/* 決定事項 */}
            {form.category === '決定事項' && (
              <>
                <div style={styles.label}>決定内容 *</div>
                <textarea style={styles.textarea} value={form.body} onChange={set('body')} placeholder="" />

                <div style={styles.label}>承認元</div>
                <input style={styles.input} value={form.summary} onChange={set('summary')} placeholder="承認した組織・役員名" />

                <div style={styles.label}>日付</div>
                <input style={styles.input} type="date" value={form.meeting_date} onChange={set('meeting_date')} />
              </>
            )}

            {/* 会議サマリー */}
            {form.category === '会議サマリー' && (
              <>
                <div style={styles.label}>短い要約</div>
                <input style={styles.input} value={form.summary} onChange={set('summary')} placeholder="2〜3行で内容を説明" />

                <div style={styles.label}>詳細</div>
                <textarea style={styles.textarea} value={form.body} onChange={set('body')} placeholder="" />

                <div style={styles.label}>TODO（1行1項目）</div>
                <textarea style={{ ...styles.textarea, minHeight: 80 }} value={form.todos} onChange={set('todos')} placeholder={'参加者に連絡する\n資料を共有する'} />

                <div style={styles.label}>関連リンク（1行1URL）</div>
                <textarea style={{ ...styles.textarea, minHeight: 60 }} value={form.links} onChange={set('links')} placeholder="https://example.com" />

                <div style={styles.label}>会議日付</div>
                <input style={styles.input} type="date" value={form.meeting_date} onChange={set('meeting_date')} />
              </>
            )}

            {/* お知らせ */}
            {form.category === 'お知らせ' && (
              <>
                <div style={styles.label}>本文 *</div>
                <textarea style={styles.textarea} value={form.body} onChange={set('body')} placeholder="" />

                <div style={styles.label}>日付</div>
                <input style={styles.input} type="date" value={form.meeting_date} onChange={set('meeting_date')} />
              </>
            )}

            {/* 予定・スケジュール */}
            {form.category === '予定・スケジュール' && (
              <>
                <div style={styles.label}>日時 *</div>
                <input style={styles.input} type="datetime-local" value={form.meeting_date} onChange={set('meeting_date')} />

                <div style={styles.label}>場所</div>
                <input style={styles.input} value={form.summary} onChange={set('summary')} placeholder="会場・URLなど" />

                <div style={styles.label}>備考</div>
                <textarea style={{ ...styles.textarea, minHeight: 80 }} value={form.body} onChange={set('body')} placeholder="" />
              </>
            )}

            {status && <div style={status === '承認待ちに追加しました' ? styles.success : styles.error}>{status}</div>}
            <button style={styles.btn} onClick={handleSubmit}>承認待ちに追加</button>
          </>
        )}
      </div>
    </div>
  );
}

const C = { accent: '#1a4f8a', text: '#1a1a1a', sub: '#555', border: '#ddd', bg: '#f7f7f5', pending: '#fff8e1' };
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
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: C.text },
  badge: { background: '#e53935', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 },
  refreshBtn: { marginLeft: 'auto', fontSize: 12, padding: '4px 10px', borderRadius: 6, border: `1px solid ${C.border}`, background: 'white', cursor: 'pointer', fontFamily: 'sans-serif' },
  loadingText: { fontSize: 13, color: C.sub, textAlign: 'center', padding: 12 },
  emptyText: { fontSize: 13, color: C.sub, background: 'white', border: `1px dashed ${C.border}`, borderRadius: 8, padding: '14px 16px', textAlign: 'center' },
  pendingCard: { background: C.pending, border: `1.5px solid #ffe082`, borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 },
  pendingMeta: { fontSize: 11, color: C.sub, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
  categoryTag: { fontSize: 11, background: '#e3f2fd', color: '#1565c0', padding: '1px 7px', borderRadius: 10, fontWeight: 700 },
  deptTag: { fontSize: 11, background: '#f3e5f5', color: '#6a1b9a', padding: '1px 7px', borderRadius: 10 },
  authorTag: { fontSize: 11, color: C.sub },
  pendingTitle: { fontSize: 15, fontWeight: 700, color: C.text },
  pendingSummary: { fontSize: 13, color: C.sub },
  pendingBody: { fontSize: 12, color: '#444', lineHeight: 1.6, whiteSpace: 'pre-wrap' },
  approveBtn: { background: '#2e7d32', color: 'white', fontSize: 14, fontWeight: 700, padding: '10px 0', border: 'none', borderRadius: 8, cursor: 'pointer', width: '100%', marginTop: 4 },
  approveSuccess: { fontSize: 13, color: '#2e7d32', background: '#eaf4ea', padding: '8px 12px', borderRadius: 6, textAlign: 'center' },
  approveError: { fontSize: 13, color: '#e74c3c', background: '#fff8f7', padding: '8px 12px', borderRadius: 6, textAlign: 'center' },
  divider: { height: 1, background: C.border, margin: '8px 0' },
};
