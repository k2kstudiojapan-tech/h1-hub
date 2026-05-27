import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const DEPT_COLORS = {
  '役員':      '#7b2d8b',
  '執行部会':  '#1a4f8a',
  '運営チーム':'#2e7d32',
  '開発チーム':'#6a1b9a',
  'SNS':       '#c62828',
  '企業連携チーム': '#e65100',
  '事務局':    '#37474f',
};

const CATEGORY_TABS = ['すべて', 'お知らせ', '決定事項', '会議サマリー', '予定'];
const TAB_TO_CATEGORY = {
  'すべて':       null,
  'お知らせ':     'お知らせ',
  '決定事項':     '決定事項',
  '会議サマリー': '会議サマリー',
  '予定':         '予定・スケジュール',
};

export default function Archive() {
  const router = useRouter();
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('すべて');

  // URLクエリでタブ初期化
  useEffect(() => {
    if (router.isReady && router.query.tab) {
      const tab = decodeURIComponent(router.query.tab);
      if (CATEGORY_TABS.includes(tab)) setActiveTab(tab);
    }
  }, [router.isReady, router.query.tab]);

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'すべて'
    ? posts
    : posts.filter(p => p.category === TAB_TO_CATEGORY[activeTab]);

  return (
    <div style={S.page}>
      {/* ヘッダー */}
      <div style={S.header}>
        <Link href="/" style={S.backLink}>← トップへ戻る</Link>
        <div style={S.headerTitle}>過去の投稿</div>
        <div style={S.headerSub}>全 {filtered.length} 件</div>
      </div>

      {/* カテゴリタブ */}
      <div style={S.tabsScroll}>
        <div style={S.tabs}>
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{...S.tab, ...(activeTab === tab ? S.tabActive : {})}}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 投稿リスト */}
      <div style={S.posts}>
        {loading ? (
          <div style={S.stateText}>読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div style={S.stateText}>
            {activeTab === 'すべて' ? '投稿がありません' : `「${activeTab}」の投稿はありません`}
          </div>
        ) : (
          filtered.map(post => {
            const isSchedule = post.category === '予定・スケジュール';
            const card = (
              <div style={S.card}>
                <div style={S.cardMeta}>
                  {post.category && <span style={S.catTag}>{post.category}</span>}
                  {post.department && (
                    <span style={{...S.deptTag, background: DEPT_COLORS[post.department] || '#555'}}>
                      {post.department}
                    </span>
                  )}
                  <span style={S.dateText}>{post.meeting_date || post.created_at}</span>
                </div>
                <div style={S.cardTitle}>{post.title}</div>
                {post.summary && <div style={S.cardSummary}>{post.summary}</div>}
                {isSchedule && (post.zoom_recording_url || post.transcript_url) && (
                  <div style={S.cardActions}>
                    {post.zoom_recording_url && (
                      <a href={post.zoom_recording_url} target="_blank" rel="noopener noreferrer"
                        style={S.zoomBtn} onClick={e => e.stopPropagation()}>
                        📹 Zoomに参加
                      </a>
                    )}
                    {post.transcript_url && (
                      <a href={post.transcript_url} target="_blank" rel="noopener noreferrer"
                        style={S.chouseiBtn} onClick={e => e.stopPropagation()}>
                        📅 日程調整
                      </a>
                    )}
                  </div>
                )}
              </div>
            );

            return isSchedule ? (
              <div key={post.id} style={S.cardLink}
                onClick={() => router.push(`/posts/${post.id}`)} role="link">
                {card}
              </div>
            ) : (
              <Link key={post.id} href={`/posts/${post.id}`} style={S.cardLink}>
                {card}
              </Link>
            );
          })
        )}
      </div>

      <div style={{height: 32}} />
    </div>
  );
}

const C = {
  accent: '#1a4f8a',
  text:   '#1a1a2e',
  sub:    '#666',
  border: '#e8edf5',
  white:  '#ffffff',
  bg:     '#f4f6fb',
};

const S = {
  page: {
    maxWidth: 480,
    margin: '0 auto',
    minHeight: '100vh',
    background: C.bg,
    fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
  },
  header: {
    background: C.accent,
    padding: '16px 16px 14px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  backLink: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    textDecoration: 'none',
    display: 'inline-block',
    marginBottom: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 700,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  tabsScroll: {
    overflowX: 'auto',
    background: C.white,
    borderBottom: `1px solid ${C.border}`,
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
  },
  tabs: {
    display: 'flex',
    padding: '0 12px',
    gap: 4,
    whiteSpace: 'nowrap',
  },
  tab: {
    padding: '10px 14px',
    border: 'none',
    background: 'none',
    fontSize: 13,
    fontWeight: 500,
    color: C.sub,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    flexShrink: 0,
  },
  tabActive: {
    color: C.accent,
    fontWeight: 700,
    borderBottom: `2px solid ${C.accent}`,
  },
  posts: {
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  stateText: {
    textAlign: 'center',
    padding: '40px 0',
    color: C.sub,
    fontSize: 14,
  },
  cardLink: { textDecoration: 'none', display: 'block', cursor: 'pointer' },
  card: {
    background: C.white,
    borderRadius: 14,
    padding: '15px 16px',
    border: `1px solid ${C.border}`,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  catTag: {
    fontSize: 10, fontWeight: 700,
    padding: '2px 8px', borderRadius: 4,
    background: '#e8f0fa', color: C.accent,
  },
  deptTag: {
    fontSize: 10, fontWeight: 700,
    padding: '2px 8px', borderRadius: 4,
    color: 'white',
  },
  dateText:    { fontSize: 11, color: '#aaa', marginLeft: 'auto' },
  cardTitle:   { fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.45 },
  cardSummary: { fontSize: 12, color: C.sub, marginTop: 6, lineHeight: 1.65 },
  cardActions: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  zoomBtn: {
    fontSize: 13, fontWeight: 700,
    padding: '9px 16px', borderRadius: 8,
    background: C.accent, color: 'white',
    textDecoration: 'none',
  },
  chouseiBtn: {
    fontSize: 13, fontWeight: 700,
    padding: '9px 16px', borderRadius: 8,
    background: '#e8f0fa', color: C.accent,
    textDecoration: 'none',
  },
};
