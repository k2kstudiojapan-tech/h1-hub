import Link from 'next/link';

const ROOMS = [
  { id: 1, department: '全体',       passcode: '1111', url: 'https://us02web.zoom.us/j/86395338905?pwd=nrvPnQRH2KaL0lW1AXPutAkM2pue6A.1' },
  { id: 2, department: '役員',       passcode: '2222', url: 'https://us02web.zoom.us/j/83863635589?pwd=H8RAOsEsqsk5pgzbQNbJRsvnJgpuJb.1' },
  { id: 3, department: '執行部会',   passcode: '3333', url: 'https://us02web.zoom.us/j/89397572415?pwd=hfEHX9kkvH2BkQVtFxh7whZmcZOfuI.1' },
  { id: 4, department: '開発',       passcode: '4444', url: 'https://us02web.zoom.us/j/88457604930?pwd=iTbIb9JMyZt2lcveeYsaYeOtkJowNa.1' },
  { id: 5, department: '運営',       passcode: '5555', url: 'https://us02web.zoom.us/j/89970981219?pwd=2xP9LwwibR2NLnHoeOfhbzSEiCoLBJ.1' },
  { id: 6, department: 'SNS・企業連携', passcode: '6666', url: 'https://us02web.zoom.us/j/85342110171?pwd=oTwFt8QQebmLBix0rlyMmaIZUPEtlD.1' },
];

const DEPT_COLORS = {
  '全体':      '#1a4f8a',
  '役員':      '#7b2d8b',
  '執行部':    '#1565c0',
  '開発':      '#6a1b9a',
  '運営':      '#2e7d32',
  'SNS・企業連携': '#e65100',
};

export default function Zoom() {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <Link href="/" style={styles.backLink}>← トップへ戻る</Link>
        <div style={styles.headerTitle}>Zoom 会議室一覧</div>
        <div style={styles.headerSub}>H1法話グランプリ 各部署ミーティング</div>
      </div>

      <div style={styles.body}>
        {ROOMS.map(room => (
          <div key={room.id} style={styles.card}>
            <div style={styles.cardTop}>
              <span style={{ ...styles.deptBadge, background: DEPT_COLORS[room.department] || '#555' }}>
                {room.department}
              </span>
            </div>
            <div style={styles.cardTitle}>{room.department}会議室</div>
            <div style={styles.passcodeRow}>
              <span style={styles.passcodeLabel}>パスコード</span>
              <span style={styles.passcode}>{room.passcode}</span>
            </div>
            <a href={room.url} target="_blank" rel="noopener noreferrer" style={styles.joinBtn}>
              📹 Zoomに参加
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

const C = { accent: '#1a4f8a', text: '#1a1a1a', sub: '#555', border: '#e0e0e0', bg: '#f7f7f5' };
const styles = {
  page: { maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: 'sans-serif' },
  header: { background: C.accent, color: 'white', padding: '16px 20px' },
  backLink: { display: 'inline-block', color: 'rgba(255,255,255,0.75)', fontSize: 12, textDecoration: 'none', marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 700 },
  headerSub: { fontSize: 11, opacity: 0.8, marginTop: 3 },
  body: { padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    background: 'white', borderRadius: 12, padding: '16px 18px',
    border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  cardTop: { display: 'flex', alignItems: 'center' },
  deptBadge: {
    fontSize: 11, fontWeight: 700, color: 'white',
    padding: '3px 10px', borderRadius: 20,
  },
  cardTitle: { fontSize: 17, fontWeight: 700, color: C.text },
  passcodeRow: { display: 'flex', alignItems: 'center', gap: 10, background: '#f5f5f5', borderRadius: 8, padding: '10px 14px' },
  passcodeLabel: { fontSize: 12, color: C.sub, fontWeight: 600 },
  passcode: { fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: '0.15em', fontFamily: 'monospace' },
  joinBtn: {
    display: 'block', textAlign: 'center', textDecoration: 'none',
    background: C.accent, color: 'white',
    fontSize: 16, fontWeight: 700, padding: '15px 0',
    borderRadius: 10, marginTop: 4,
  },
};
