import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ROOMS } from '../lib/rooms';

const DEPARTMENTS = ['役員', '執行部会', '運営チーム', '開発チーム', 'SNS', '企業連携チーム', '事務局'];
const CATEGORIES = ['決定事項', '会議サマリー', 'お知らせ', '予定・スケジュール'];

const emptyForm = {
  category: '', department: '', author: '',
  title: '', summary: '', body: '',
  todos: '', links: '', meeting_date: '',
  zoom_recording_url: '', transcript_url: '',
  zoom_room: '', attachStatus: '',
};

export default function Admin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [auth, setAuth] = useState(false);
  const [authError, setAuthError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', summary: '', body: '', todos: '', links: '' });
  const [editStatus, setEditStatus] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFolder, setUploadFolder] = useState('edit');
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

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

  const handleEditPending = (post) => {
    setEditingPost(post);
    setEditForm({ title: post.title, summary: '', body: '', todos: '', links: '' });
    setEditStatus('');
  };

  const handleApproveWithEdit = () => {
    if (!editForm.title) { setEditStatus('タイトルは必須です'); return; }
    setEditStatus('公開中...');
    fetch('/api/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password,
        rowIndex: editingPost.rowIndex,
        title: editForm.title,
        summary: editForm.summary,
        body: editForm.body,
        todos: editForm.todos,
        links: editForm.links,
      }),
    }).then(r => r.json()).then(data => {
      if (data.success) {
        window.location.href = `/posts/${data.rowIndex}`;
      } else {
        setEditStatus('エラー：' + data.error);
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
        setSubmitted(true);
        setForm(emptyForm);
        setStatus('');
        // 1秒後にトップへ自動遷移（最新データを確実に取得）
        setTimeout(() => router.push('/'), 1000);
      } else {
        setStatus('エラー：' + data.error);
      }
    }).catch(e => {
      setStatus('通信エラー：' + e.message + '（再度お試しください）');
    });
  };

  const doUpload = (file, folder, onSuccess, onError, onStart) => {
    onStart();
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, base64, filename: file.name, mimeType: file.type || 'application/octet-stream', folder }),
      }).then(r => r.json()).then(data => {
        if (data.success) onSuccess(data);
        else onError(data.error);
      }).catch(e => onError(e.message));
    };
    reader.onerror = () => onError('ファイルの読み込みに失敗しました');
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = () => {
    if (!uploadFile) { setUploadStatus('ファイルを選択してください'); return; }
    doUpload(
      uploadFile, uploadFolder,
      (data) => { setUploadStatus('アップロード完了'); setUploadResult(data); setUploadFile(null); },
      (err) => setUploadStatus('エラー：' + err),
      () => { setUploadStatus('アップロード中...'); setUploadResult(null); },
    );
  };

  const handleAttach = (file) => {
    if (!file) return;
    doUpload(
      file, 'edit',
      (data) => {
        const newLinks = form.links ? form.links + '\n' + data.url : data.url;
        setForm({ ...form, links: newLinks, attachStatus: '添付完了：' + data.fileName });
      },
      (err) => setForm({ ...form, attachStatus: 'エラー：' + err }),
      () => setForm({ ...form, attachStatus: 'アップロード中...' }),
    );
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setEdit = (key) => (e) => setEditForm({ ...editForm, [key]: e.target.value });

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

  if (editingPost !== null) return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => setEditingPost(null)} style={styles.backBtn}>← 承認待ちへ戻る</button>
        <div style={styles.headerTitle}>会議サマリー 編集・承認</div>
      </div>
      <div style={styles.body}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>部署</span>
          <span style={styles.infoValue}>{editingPost.department}</span>
        </div>
        {editingPost.meeting_date && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>会議日時</span>
            <span style={styles.infoValue}>{editingPost.meeting_date}</span>
          </div>
        )}

        <div style={styles.label}>タイトル *</div>
        <input style={styles.input} value={editForm.title} onChange={setEdit('title')} />

        <div style={styles.label}>短い要約</div>
        <input style={styles.input} value={editForm.summary} onChange={setEdit('summary')} placeholder="2〜3行で内容を説明" />

        <div style={styles.label}>詳細</div>
        <textarea style={styles.textarea} value={editForm.body} onChange={setEdit('body')} />

        <div style={styles.label}>TODO（1行1項目）</div>
        <textarea style={{ ...styles.textarea, minHeight: 80 }} value={editForm.todos} onChange={setEdit('todos')} placeholder={'参加者に連絡する\n資料を共有する'} />

        <div style={styles.label}>関連リンク（1行1URL）</div>
        <textarea style={{ ...styles.textarea, minHeight: 60 }} value={editForm.links} onChange={setEdit('links')} placeholder="https://example.com" />

        {editStatus && (
          <div style={editStatus.startsWith('エラー') || editStatus === 'タイトルは必須です' ? styles.error : styles.loadingText}>
            {editStatus}
          </div>
        )}
        <button style={styles.btn} onClick={handleApproveWithEdit}>承認して投稿</button>
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
          <div key={post.rowIndex} style={styles.pendingCard} onClick={() => handleEditPending(post)}>
            <div style={styles.pendingMeta}>
              {post.created_at && <span>{post.created_at} ・ </span>}
              <span style={styles.categoryTag}>{post.category}</span>
              {' '}
              <span style={styles.deptTag}>{post.department}</span>
              {post.author && <span style={styles.authorTag}>{post.author}</span>}
            </div>
            <div style={styles.pendingTitle}>{post.title}</div>
            {post.meeting_date && <div style={styles.pendingDate}>{post.meeting_date}</div>}
            <div style={styles.editHint}>タップして編集・承認 →</div>
          </div>
        ))}

        <div style={styles.divider} />

        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>ファイルをアップロード</span>
        </div>

        <div style={styles.label}>保存先フォルダ</div>
        <div style={styles.tagRow}>
          <button style={uploadFolder === 'edit' ? styles.tagSelected : styles.tag}
            onClick={() => setUploadFolder('edit')}>共同編集用</button>
          <button style={uploadFolder === 'view' ? styles.tagSelected : styles.tag}
            onClick={() => setUploadFolder('view')}>閲覧用</button>
        </div>

        <div style={styles.label}>ファイル選択</div>
        <input type="file" style={styles.fileInput}
          onChange={e => { setUploadFile(e.target.files[0] || null); setUploadStatus(''); setUploadResult(null); }} />

        {uploadStatus && (
          <div style={uploadStatus.startsWith('エラー') ? styles.error : uploadStatus === 'アップロード完了' ? styles.success : styles.loadingText}>
            {uploadStatus}
          </div>
        )}
        {uploadResult && (
          <a href={uploadResult.url} target="_blank" rel="noopener noreferrer" style={styles.uploadResultLink}>
            🔗 {uploadResult.fileName} — Driveで開く
          </a>
        )}

        <button style={styles.btn} onClick={handleUpload}>アップロード</button>

        <div style={styles.divider} />

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

            {form.category === 'お知らせ' && (
              <>
                <div style={styles.label}>本文 *</div>
                <textarea style={styles.textarea} value={form.body} onChange={set('body')} placeholder="" />
                <div style={styles.label}>日付</div>
                <input style={styles.input} type="date" value={form.meeting_date} onChange={set('meeting_date')} />
              </>
            )}

            {form.category === '予定・スケジュール' && (
              <>
                <div style={styles.label}>日時 *</div>
                <input style={styles.input} type="datetime-local" value={form.meeting_date} onChange={set('meeting_date')} />

                <div style={styles.label}>Zoom会議室</div>
                <div style={styles.tagRow}>
                  {ROOMS.map(r => (
                    <button key={r.id}
                      style={form.zoom_room === r.department ? styles.tagSelected : styles.tag}
                      onClick={() => setForm({ ...form, zoom_room: r.department, zoom_recording_url: r.url })}>
                      {r.department}
                    </button>
                  ))}
                  <button
                    style={form.zoom_room === 'その他' ? styles.tagSelected : styles.tag}
                    onClick={() => setForm({ ...form, zoom_room: 'その他', zoom_recording_url: '' })}>
                    その他
                  </button>
                </div>
                {form.zoom_room === 'その他' && (
                  <>
                    <div style={styles.label}>ZoomのURL</div>
                    <input style={styles.input} value={form.zoom_recording_url} onChange={set('zoom_recording_url')} placeholder="https://zoom.us/j/..." />
                  </>
                )}

                <div style={styles.label}>調整さんURL</div>
                <input style={styles.input} value={form.transcript_url} onChange={set('transcript_url')} placeholder="https://chouseisan.com/..." />

                <div style={styles.label}>場所（会場名など）</div>
                <input style={styles.input} value={form.summary} onChange={set('summary')} placeholder="会場名・URLなど" />

                <div style={styles.label}>備考</div>
                <textarea style={{ ...styles.textarea, minHeight: 80 }} value={form.body} onChange={set('body')} placeholder="" />
              </>
            )}

            <div style={styles.label}>ファイルを添付（任意）</div>
            <input type="file" style={styles.fileInput}
              onChange={e => { const f = e.target.files[0]; if (f) handleAttach(f); e.target.value = ''; }} />
            {form.attachStatus && (
              <div style={form.attachStatus.startsWith('エラー') ? styles.error : form.attachStatus === 'アップロード中...' ? styles.loadingText : styles.success}>
                {form.attachStatus}
              </div>
            )}

            {status && <div style={styles.error}>{status}</div>}
            <button style={styles.btn} onClick={handleSubmit}>
              {form.category === '会議サマリー' ? '承認して投稿' : '投稿'}
            </button>
          </>
        )}

        {submitted && (
          <>
            <div style={styles.success}>投稿しました ✓</div>
            <Link href="/" style={styles.homeBtn}>ホームへ戻る</Link>
            <button style={{ ...styles.btn, background: '#555' }} onClick={() => setSubmitted(false)}>続けて投稿する</button>
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
  backBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', fontSize: 13, cursor: 'pointer', padding: '0 0 10px 0', fontFamily: 'sans-serif', display: 'block' },
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
  fileInput: { fontSize: 14, padding: '10px 0', width: '100%', fontFamily: 'sans-serif', cursor: 'pointer' },
  homeBtn: {
    display: 'block', textAlign: 'center', background: '#2e7d32', color: 'white',
    fontSize: 16, fontWeight: 700, padding: 16, borderRadius: 10, textDecoration: 'none',
  },
  uploadResultLink: {
    display: 'block', fontSize: 13, color: C.accent, textDecoration: 'none',
    background: '#e8f0fa', padding: '10px 14px', borderRadius: 8, wordBreak: 'break-all',
  },
  emptyText: { fontSize: 13, color: C.sub, background: 'white', border: `1px dashed ${C.border}`, borderRadius: 8, padding: '14px 16px', textAlign: 'center' },
  pendingCard: { background: C.pending, border: `1.5px solid #ffe082`, borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer' },
  pendingMeta: { fontSize: 11, color: C.sub, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
  categoryTag: { fontSize: 11, background: '#e3f2fd', color: '#1565c0', padding: '1px 7px', borderRadius: 10, fontWeight: 700 },
  deptTag: { fontSize: 11, background: '#f3e5f5', color: '#6a1b9a', padding: '1px 7px', borderRadius: 10 },
  authorTag: { fontSize: 11, color: C.sub },
  pendingTitle: { fontSize: 15, fontWeight: 700, color: C.text },
  pendingDate: { fontSize: 11, color: C.sub },
  editHint: { fontSize: 11, color: C.accent, fontWeight: 600, textAlign: 'right', marginTop: 2 },
  divider: { height: 1, background: C.border, margin: '8px 0' },
  infoRow: { display: 'flex', alignItems: 'center', gap: 10, background: '#f0f4fa', borderRadius: 8, padding: '10px 14px' },
  infoLabel: { fontSize: 12, fontWeight: 700, color: C.sub, minWidth: 60 },
  infoValue: { fontSize: 14, color: C.text },
};
