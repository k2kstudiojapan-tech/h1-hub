import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const DEPT_COLORS = {
  '役員': '#7b2d8b',
  '執行部会': '#1a4f8a',
  '運営チーム': '#2e7d32',
  '開発チーム': '#6a1b9a',
  'SNS': '#c62828',
  '企業連携チーム': '#e65100',
  '事務局': '#37474f',
};

export default function PostDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === undefined) return;
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => {
        setPost(data.find(p => String(p.id) === String(id)) || null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={styles.page}><div style={styles.empty}>読み込み中...</div></div>;
  if (!post) return (
    <div style={styles.page}>
      <div style={styles.header}>
        <Link href="/" style={styles.backLink}>← トップへ戻る</Link>
      </div>
      <div style={styles.empty}>投稿が見つかりません</div>
    </div>
  );

  const todos = post.todos ? post.todos.split('\n').filter(s => s.trim()) : [];
  const links = post.links ? post.links.split('\n').filter(s => s.trim()) : [];
  const displayDate = post.meeting_date || post.created_at;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <Link href="/" style={styles.backLink}>← トップへ戻る</Link>
        <div style={styles.metaRow}>
          {post.category && <span style={styles.categoryTag}>{post.category}</span>}
          {post.department && (
            <span style={{ ...styles.deptTag, background: DEPT_COLORS[post.department] || '#555' }}>
              {post.department}
            </span>
          )}
        </div>
        <div style={styles.headerTitle}>{post.title}</div>
        <div style={styles.headerMeta}>
          {displayDate && <span>{displayDate}</span>}
          {post.author && <span>投稿者：{post.author}</span>}
        </div>
      </div>

      <div style={styles.body}>
        {post.summary && (
          <div style={styles.summaryBox}>{post.summary}</div>
        )}

        {post.body && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>本文</div>
            <div style={styles.bodyText}>
              {post.body.split('\n').map((line, i) => {
                const parts = line.split(/(https?:\/\/[^\s]+)/g);
                return (
                  <span key={i}>
                    {parts.map((part, j) =>
                      /^https?:\/\//.test(part)
                        ? <a key={j} href={part} target="_blank" rel="noopener noreferrer" style={styles.bodyLink}>{part}</a>
                        : part
                    )}
                    <br />
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {todos.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>TODO</div>
            <ul style={styles.todoList}>
              {todos.map((t, i) => (
                <li key={i} style={styles.todoItem}>
                  <span style={styles.todoCheck}>☐</span>{t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {links.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>関連リンク</div>
            <div style={styles.linkList}>
              {links.map((l, i) => {
                const isUrl = l.startsWith('http');
                return isUrl ? (
                  <a key={i} href={l} target="_blank" rel="noopener noreferrer" style={styles.linkItem}>
                    🔗 {l}
                  </a>
                ) : (
                  <div key={i} style={styles.linkText}>{l}</div>
                );
              })}
            </div>
          </div>
        )}

        {post.category === '予定・スケジュール' && (post.zoom_recording_url || post.transcript_url) && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>参加・調整</div>
            <div style={styles.linkList}>
              {post.zoom_recording_url && (
                <a href={post.zoom_recording_url} target="_blank" rel="noopener noreferrer" style={styles.zoomJoinBtn}>
                  📹 Zoomに参加する
                </a>
              )}
              {post.transcript_url && (
                <a href={post.transcript_url} target="_blank" rel="noopener noreferrer" style={styles.resourceBtn}>
                  📅 日程調整（調整さん）
                </a>
              )}
            </div>
          </div>
        )}

        {post.category !== '予定・スケジュール' && (post.zoom_recording_url || post.transcript_url) && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>会議リソース</div>
            <div style={styles.linkList}>
              {post.zoom_recording_url && (
                <a href={post.zoom_recording_url} target="_blank" rel="noopener noreferrer" style={styles.resourceBtn}>
                  🎥 Zoom録画を見る
                </a>
              )}
              {post.transcript_url && (
                <a href={post.transcript_url} target="_blank" rel="noopener noreferrer" style={styles.resourceBtn}>
                  📄 議事録を見る
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const C = { accent: '#1a4f8a', text: '#1a1a1a', sub: '#555', border: '#e0e0e0', bg: '#f7f7f5' };
const styles = {
  page: { maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: 'sans-serif' },
  header: { background: C.accent, color: 'white', padding: '16px 20px' },
  backLink: { display: 'inline-block', color: 'rgba(255,255,255,0.75)', fontSize: 12, textDecoration: 'none', marginBottom: 10 },
  metaRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  categoryTag: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.2)', color: 'white' },
  deptTag: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, color: 'white' },
  headerTitle: { fontSize: 18, fontWeight: 700, lineHeight: 1.4 },
  headerMeta: { fontSize: 11, opacity: 0.7, marginTop: 5, display: 'flex', gap: 12 },
  body: { padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 12 },
  empty: { textAlign: 'center', color: C.sub, fontSize: 14, marginTop: 40 },
  summaryBox: {
    background: '#e8f0fa', color: C.accent, fontSize: 13, lineHeight: 1.6,
    padding: '11px 14px', borderRadius: 8, fontWeight: 500,
  },
  section: { background: 'white', borderRadius: 10, padding: '13px 15px', border: `1px solid ${C.border}` },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '0.08em', marginBottom: 9 },
  bodyText: { fontSize: 14, color: C.text, lineHeight: 1.8 },
  bodyLink: { color: C.accent, textDecoration: 'underline', wordBreak: 'break-all' },
  todoList: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7 },
  todoItem: { fontSize: 14, color: C.text, display: 'flex', gap: 8, alignItems: 'flex-start' },
  todoCheck: { fontSize: 16, color: C.accent, flexShrink: 0 },
  linkList: { display: 'flex', flexDirection: 'column', gap: 7 },
  linkItem: { fontSize: 13, color: C.accent, textDecoration: 'none', wordBreak: 'break-all', display: 'block' },
  linkText: { fontSize: 13, color: C.sub },
  resourceBtn: {
    display: 'block', fontSize: 14, fontWeight: 600, color: C.accent,
    textDecoration: 'none', padding: '10px 14px', background: '#e8f0fa',
    borderRadius: 8, border: `1px solid #c5d8f5`,
  },
  zoomJoinBtn: {
    display: 'block', textAlign: 'center', fontSize: 16, fontWeight: 700,
    color: 'white', textDecoration: 'none', padding: '15px 14px',
    background: C.accent, borderRadius: 10,
  },
};
