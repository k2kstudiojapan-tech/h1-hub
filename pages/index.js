import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Google DriveのURLをここに設定してください（または環境変数 NEXT_PUBLIC_DRIVE_URL）
const DRIVE_URL = process.env.NEXT_PUBLIC_DRIVE_URL || '#';

const DEPT_COLORS = {
  '役員': '#7b2d8b',
  '執行部会': '#1a4f8a',
  '運営チーム': '#2e7d32',
  '開発チーム': '#6a1b9a',
  'SNS': '#c62828',
  '企業連携チーム': '#e65100',
  '事務局': '#37474f',
};

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false); });
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>H1情報ハブ</div>
          <div style={styles.headerSub}>H1法話グランプリ 公式情報ポータル</div>
        </div>
        <div style={styles.headerBtns}>
          <a href={DRIVE_URL} target="_blank" rel="noopener noreferrer" style={styles.driveBtn}>
            📁 Drive
          </a>
          <Link href="/zoom" style={styles.zoomBtn}>📹 Zoom</Link>
          <Link href="/admin" style={styles.postBtn}>投稿</Link>
        </div>
      </div>

      <div style={styles.body}>
        {loading ? (
          <div style={styles.empty}>読み込み中...</div>
        ) : posts.length === 0 ? (
          <div style={styles.empty}>投稿がありません</div>
        ) : (
          posts.map((post) => {
            const isSchedule = post.category === '予定・スケジュール';
            const cardInner = (
              <div style={styles.postCard}>
                <div style={styles.metaRow}>
                  {post.category && (
                    <span style={styles.categoryTag}>{post.category}</span>
                  )}
                  {post.department && (
                    <span style={{
                      ...styles.deptTag,
                      background: DEPT_COLORS[post.department] || '#555',
                    }}>{post.department}</span>
                  )}
                  <span style={styles.dateText}>
                    {post.meeting_date || post.created_at}
                  </span>
                </div>
                <div style={styles.postTitle}>{post.title}</div>
                {post.summary && (
                  <div style={styles.postSummary}>{post.summary}</div>
                )}
                {isSchedule && (post.zoom_recording_url || post.transcript_url) && (
                  <div style={styles.scheduleActions}>
                    {post.zoom_recording_url && (
                      <a href={post.zoom_recording_url} target="_blank" rel="noopener noreferrer"
                        style={styles.zoomJoinBtn}
                        onClick={e => e.stopPropagation()}>
                        📹 Zoomに参加
                      </a>
                    )}
                    {post.transcript_url && (
                      <a href={post.transcript_url} target="_blank" rel="noopener noreferrer"
                        style={styles.chouseiBtn}
                        onClick={e => e.stopPropagation()}>
                        📅 日程調整
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
            return isSchedule ? (
              <div key={post.id} style={styles.postLink}
                onClick={() => router.push(`/posts/${post.id}`)}>
                {cardInner}
              </div>
            ) : (
              <Link key={post.id} href={`/posts/${post.id}`} style={styles.postLink}>
                {cardInner}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

const C = { accent: '#1a4f8a', text: '#1a1a1a', sub: '#666', border: '#e0e0e0', bg: '#f7f7f5' };
const styles = {
  page: { maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: 'sans-serif' },
  header: { background: C.accent, color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 700 },
  headerSub: { fontSize: 11, opacity: 0.8, marginTop: 3 },
  headerBtns: { display: 'flex', gap: 8, alignItems: 'center' },
  driveBtn: {
    background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 13, fontWeight: 600,
    padding: '8px 13px', borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)',
    whiteSpace: 'nowrap',
  },
  zoomBtn: {
    background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 13, fontWeight: 600,
    padding: '8px 13px', borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)',
    whiteSpace: 'nowrap',
  },
  postBtn: {
    background: 'white', color: C.accent, fontSize: 13, fontWeight: 700,
    padding: '8px 13px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap',
  },
  body: { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 },
  empty: { textAlign: 'center', color: C.sub, fontSize: 14, marginTop: 40 },
  postLink: { textDecoration: 'none', display: 'block' },
  postCard: {
    background: 'white', borderRadius: 10, padding: '13px 15px',
    border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  metaRow: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 7 },
  categoryTag: {
    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
    background: '#e8f0fa', color: C.accent,
  },
  deptTag: {
    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, color: 'white',
  },
  dateText: { fontSize: 11, color: '#aaa', marginLeft: 'auto' },
  postTitle: { fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.4 },
  postSummary: { fontSize: 12, color: C.sub, marginTop: 5, lineHeight: 1.6 },
  scheduleActions: { display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' },
  zoomJoinBtn: {
    fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 6,
    background: C.accent, color: 'white', textDecoration: 'none', cursor: 'pointer',
  },
  chouseiBtn: {
    fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 6,
    background: '#e8f0fa', color: C.accent, textDecoration: 'none', cursor: 'pointer',
  },
};
