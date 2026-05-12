import { useEffect, useState } from 'react';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => setPosts(data));
  }, []);

  const decisions = posts.filter(p => p.category === '決定事項').slice(0, 3);
  const schedule = posts.filter(p => p.category === '予定・スケジュール')[0];
  const summary = posts.filter(p => p.category === '会議サマリー')[0];
  const alert = posts.filter(p => p.category === '重要なお知らせ')[0];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>H1情報ハブ</div>
        <div style={styles.headerSub}>H1法話グランプリ 公式情報ポータル</div>
      </div>

      <div style={styles.body}>
        {alert && (
          <>
            <div style={styles.label}>重要なお知らせ</div>
            <div style={styles.alertCard}>
              <div style={styles.alertTag}>⚠ 重要</div>
              <div style={styles.alertTitle}>{alert.title}</div>
              <div style={styles.alertBody}>{alert.body}</div>
            </div>
          </>
        )}

        <div style={styles.label}>最新の決定事項</div>
        <div style={styles.card}>
          {decisions.map((d, i) => (
            <div key={i} style={styles.decisionItem}>
              <div style={styles.dot} />
              <div>
                <div style={styles.decisionText}>{d.title}</div>
                <div style={styles.decisionDate}>{d.date}</div>
              </div>
            </div>
          ))}
        </div>

        {schedule && (
          <>
            <div style={styles.label}>次回会議</div>
            <div style={styles.meetingCard}>
              <div style={styles.meetingBox}>
                <div style={styles.meetingDate}>{schedule.date}</div>
              </div>
              <div>
                <div style={styles.meetingName}>{schedule.title}</div>
                <div style={styles.meetingDetail}>{schedule.body}</div>
              </div>
            </div>
          </>
        )}

        {summary && (
          <>
            <div style={styles.label}>最近の会議サマリー</div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryHeader}>
                <div style={styles.summaryTitle}>{summary.title}</div>
                <div style={styles.summaryTag}>AI要約</div>
              </div>
              <div style={styles.summaryBody}>{summary.body}</div>
              <div style={styles.summaryDate}>{summary.date}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const C = { accent: '#1a4f8a', accentLight: '#e8f0fa', text: '#1a1a1a', sub: '#555', border: '#ddd', bg: '#f7f7f5' };
const styles = {
  page: { maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: 'sans-serif' },
  header: { background: C.accent, color: 'white', padding: '16px 20px' },
  headerTitle: { fontSize: 20, fontWeight: 700 },
  headerSub: { fontSize: 11, opacity: 0.8, marginTop: 3 },
  body: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '0.12em' },
  card: { background: 'white', borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 },
  decisionItem: { display: 'flex', gap: 10, alignItems: 'flex-start', background: C.accentLight, borderRadius: 7, padding: '9px 11px' },
  dot: { width: 7, height: 7, background: C.accent, borderRadius: '50%', marginTop: 6, flexShrink: 0 },
  decisionText: { fontSize: 14, fontWeight: 600, color: C.text },
  decisionDate: { fontSize: 11, color: C.sub, marginTop: 2 },
  alertCard: { background: '#fff8f7', border: '1.5px solid #e74c3c', borderRadius: 10, padding: '13px 15px' },
  alertTag: { display: 'inline-block', background: '#e74c3c', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, marginBottom: 7 },
  alertTitle: { fontSize: 14, fontWeight: 700, color: C.text },
  alertBody: { fontSize: 12, color: C.sub, marginTop: 5, lineHeight: 1.6 },
  meetingCard: { background: 'white', borderRadius: 10, border: `1px solid ${C.border}`, padding: 14, display: 'flex', gap: 12, alignItems: 'center' },
  meetingBox: { background: C.accent, color: 'white', borderRadius: 8, padding: '10px 14px', textAlign: 'center', minWidth: 56 },
  meetingDate: { fontSize: 15, fontWeight: 700 },
  meetingName: { fontSize: 14, fontWeight: 700, color: C.text },
  meetingDetail: { fontSize: 12, color: C.sub, marginTop: 4, lineHeight: 1.5 },
  summaryCard: { background: 'white', borderRadius: 10, border: `1px solid ${C.border}`, padding: '13px 15px' },
  summaryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  summaryTitle: { fontSize: 13, fontWeight: 700, color: C.text },
  summaryTag: { fontSize: 10, background: C.accentLight, color: C.accent, padding: '2px 7px', borderRadius: 4, fontWeight: 700 },
  summaryBody: { fontSize: 12, color: C.sub, lineHeight: 1.7 },
  summaryDate: { fontSize: 10, color: '#aaa', marginTop: 7 },
};