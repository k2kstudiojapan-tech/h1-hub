import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Decisions() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => {
        setPosts(data.filter(p => p.category === '決定事項'));
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <Link href="/" style={styles.backLink}>← トップへ戻る</Link>
        <div style={styles.headerTitle}>決定事項一覧</div>
        <div style={styles.headerSub}>H1法話グランプリ 公式情報ポータル</div>
      </div>

      <div style={styles.body}>
        {loading ? (
          <div style={styles.empty}>読み込み中...</div>
        ) : posts.length === 0 ? (
          <div style={styles.empty}>決定事項はありません</div>
        ) : (
          posts.map((d, i) => (
            <div key={i} style={styles.decisionItem}>
              <div style={styles.dot} />
              <div style={styles.decisionContent}>
                <div style={styles.decisionText}>{d.title}</div>
                {d.body && <div style={styles.decisionBody}>{d.body}</div>}
                <div style={styles.decisionDate}>{d.date}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const C = { accent: '#1a4f8a', accentLight: '#e8f0fa', text: '#1a1a1a', sub: '#555', border: '#ddd', bg: '#f7f7f5' };
const styles = {
  page: { maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: 'sans-serif' },
  header: { background: C.accent, color: 'white', padding: '16px 20px' },
  backLink: { display: 'inline-block', color: 'rgba(255,255,255,0.8)', fontSize: 12, textDecoration: 'none', marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: 700 },
  headerSub: { fontSize: 11, opacity: 0.8, marginTop: 3 },
  body: { padding: 16, display: 'flex', flexDirection: 'column', gap: 10 },
  empty: { textAlign: 'center', color: C.sub, fontSize: 14, marginTop: 40 },
  decisionItem: { display: 'flex', gap: 10, alignItems: 'flex-start', background: C.accentLight, borderRadius: 7, padding: '11px 13px', border: `1px solid ${C.border}` },
  dot: { width: 7, height: 7, background: C.accent, borderRadius: '50%', marginTop: 6, flexShrink: 0 },
  decisionContent: { flex: 1 },
  decisionText: { fontSize: 14, fontWeight: 600, color: C.text },
  decisionBody: { fontSize: 12, color: C.sub, marginTop: 4, lineHeight: 1.6 },
  decisionDate: { fontSize: 11, color: C.sub, marginTop: 4 },
};
