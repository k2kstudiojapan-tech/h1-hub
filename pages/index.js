import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const DRIVE_URL = process.env.NEXT_PUBLIC_DRIVE_URL || '#';

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

// '予定' タブは '予定・スケジュール' カテゴリに対応
const TAB_TO_CATEGORY = {
  'すべて':   null,
  'お知らせ': 'お知らせ',
  '決定事項': '決定事項',
  '会議サマリー': '会議サマリー',
  '予定':     '予定・スケジュール',
};

// ─── メインコンポーネント ──────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();

  const [posts,           setPosts]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [activeTab,       setActiveTab]       = useState('すべて');
  const [notifPerm,       setNotifPerm]       = useState('unsupported');
  const [isStandalone,    setIsStandalone]    = useState(true);
  const [isIOS,           setIsIOS]           = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [unreadCount,     setUnreadCount]     = useState(0);
  const [testBadgeCount,  setTestBadgeCount]  = useState(0);

  // ─── 初期化 ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    // スタンドアロンモード判定
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // iOS判定
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // iOS Safariでスタンドアロン未登録 → インストールバナー
    if (ios && !standalone && !localStorage.getItem('h1-install-dismissed')) {
      setShowInstallBanner(true);
    }

    // 通知権限確認
    if ('Notification' in window) {
      setNotifPerm(Notification.permission);
    }

    // 投稿取得
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
        calcUnread(data);
        // 閲覧済みとしてタイムスタンプを更新
        localStorage.setItem('h1-last-seen', new Date().toISOString());
      })
      .catch(() => setLoading(false));
  }, []);

  // ─── 未読計算 + バッジ設定 ───────────────────────────────────────────────────
  function calcUnread(data) {
    const lastSeen = localStorage.getItem('h1-last-seen');
    if (!lastSeen) return;
    const count = data.filter(p =>
      new Date(p.created_at) > new Date(lastSeen)
    ).length;
    setUnreadCount(count);
    setBadge(count);
    // アプリを開いたら数秒後にバッジをクリア
    if (count > 0) {
      setTimeout(() => clearBadge(), 5000);
    }
  }

  function setBadge(count) {
    if (!('setAppBadge' in navigator)) return;
    count > 0 ? navigator.setAppBadge(count) : navigator.clearAppBadge();
  }

  function clearBadge() {
    if ('clearAppBadge' in navigator) navigator.clearAppBadge();
    setUnreadCount(0);
  }

  // ─── テスト: バッジを3件表示 ─────────────────────────────────────────────────
  function handleTestBadge() {
    const next = testBadgeCount === 0 ? 3 : 0;
    setTestBadgeCount(next);
    setBadge(next);
    if (next > 0) setUnreadCount(next);
    else setUnreadCount(0);
  }

  // ─── 通知許可リクエスト ──────────────────────────────────────────────────────
  const requestNotification = useCallback(async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
    if (perm === 'granted') {
      showTestNotification('通知が有効になりました', '新着お知らせをお届けします。');
    }
  }, []);

  // ─── SWを使ったテスト通知 ────────────────────────────────────────────────────
  async function showTestNotification(title, body, url = '/') {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        data: { url },
      });
    } catch (e) {
      // serviceWorker未対応ブラウザは何もしない
    }
  }

  async function handleBellClick() {
    if (notifPerm !== 'granted') {
      await requestNotification();
    } else {
      await showTestNotification('H1ポータル テスト通知', '通知は正常に動作しています');
    }
  }

  // ─── インストールバナー閉じる ────────────────────────────────────────────────
  function dismissInstall() {
    setShowInstallBanner(false);
    localStorage.setItem('h1-install-dismissed', '1');
  }

  // ─── 投稿フィルター ──────────────────────────────────────────────────────────
  const filteredPosts = activeTab === 'すべて'
    ? posts
    : posts.filter(p => p.category === TAB_TO_CATEGORY[activeTab]);

  // ─── レンダリング ────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>

      {/* ════ ヘッダー ════ */}
      <div style={S.header}>
        <div>
          <div style={S.appName}>H1ポータル</div>
          <div style={S.appSub}>H1法話グランプリ 情報ハブ</div>
        </div>
        <div style={S.headerRight}>
          {unreadCount > 0 && (
            <span style={S.unreadBadge}>{unreadCount}</span>
          )}
          <button
            onClick={handleBellClick}
            style={S.bellBtn}
            title={notifPerm === 'granted' ? 'テスト通知を送る' : '通知を許可する'}
          >
            {notifPerm === 'granted' ? '🔔' : '🔕'}
          </button>
        </div>
      </div>

      {/* ════ iOSインストールバナー ════ */}
      {showInstallBanner && (
        <div style={S.installBanner}>
          <div style={S.installContent}>
            <span style={{fontSize: 28}}>📲</span>
            <div>
              <div style={S.installTitle}>ホーム画面に追加できます</div>
              <div style={S.installSteps}>
                Safariで <strong>「□↑」</strong> →「ホーム画面に追加」をタップ
              </div>
            </div>
          </div>
          <button onClick={dismissInstall} style={S.dismissBtn} aria-label="閉じる">✕</button>
        </div>
      )}

      {/* ════ 通知許可バナー（非iOS・未許可時） ════ */}
      {notifPerm === 'default' && !isIOS && (
        <div style={S.notifBanner}>
          <span style={{fontSize: 14}}>🔔 新着通知を受け取りますか？</span>
          <button onClick={requestNotification} style={S.notifBtn}>許可する</button>
        </div>
      )}

      {/* ════ iOS通知注記（スタンドアロン時・未許可） ════ */}
      {isIOS && isStandalone && notifPerm === 'default' && (
        <div style={S.iOSNote}>
          ⚠️ iPhoneの通知はiOS 16.4以上 + ホーム画面追加後に利用可能です
        </div>
      )}

      {/* ════ クイックアクション ════ */}
      <div style={S.section}>
        <div style={S.manualLinkRow}>
          <Link href="/manual" style={S.manualLink}>📖 使い方マニュアル</Link>
        </div>
        <div style={S.quickGrid}>
          <Link href="/zoom" style={{...S.qa, background: '#1a4f8a'}}>
            <span style={S.qaIcon}>📹</span>
            <span style={S.qaLabel}>Zoom会議室</span>
          </Link>
          <a
            href={DRIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{...S.qa, background: '#2e7d32'}}
          >
            <span style={S.qaIcon}>📁</span>
            <span style={S.qaLabel}>資料・Drive</span>
          </a>
          <Link href="/decisions" style={{...S.qa, background: '#5c35a0'}}>
            <span style={S.qaIcon}>📋</span>
            <span style={S.qaLabel}>決定事項</span>
          </Link>
          <Link href="/admin" style={{...S.qa, background: '#37474f'}}>
            <span style={S.qaIcon}>✏️</span>
            <span style={S.qaLabel}>投稿・管理</span>
          </Link>
        </div>
      </div>

      {/* ════ バッジテストボタン（開発確認用） ════ */}
      <div style={S.badgeTestRow}>
        <span style={S.badgeTestLabel}>バッジテスト：</span>
        <button onClick={handleTestBadge} style={S.badgeTestBtn}>
          {testBadgeCount === 0 ? '🔴 3件表示' : '⬜ バッジ消去'}
        </button>
        <span style={{fontSize: 11, color: '#999', marginLeft: 6}}>
          ※ホーム画面追加後に有効
        </span>
      </div>

      {/* ════ カテゴリタブ ════ */}
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

      {/* ════ 投稿リスト ════ */}
      <div style={S.posts}>
        {loading ? (
          <div style={S.stateText}>読み込み中...</div>
        ) : filteredPosts.length === 0 ? (
          <div style={S.stateText}>
            {activeTab === 'すべて' ? '投稿がありません' : `「${activeTab}」の投稿はありません`}
          </div>
        ) : (
          filteredPosts.map(post => {
            const isSchedule = post.category === '予定・スケジュール';
            const card = (
              <div style={S.card}>
                <div style={S.cardMeta}>
                  {post.category && (
                    <span style={S.catTag}>{post.category}</span>
                  )}
                  {post.department && (
                    <span style={{...S.deptTag, background: DEPT_COLORS[post.department] || '#555'}}>
                      {post.department}
                    </span>
                  )}
                  <span style={S.dateText}>{post.meeting_date || post.created_at}</span>
                </div>
                <div style={S.cardTitle}>{post.title}</div>
                {post.summary && (
                  <div style={S.cardSummary}>{post.summary}</div>
                )}
                {isSchedule && (post.zoom_recording_url || post.transcript_url) && (
                  <div style={S.cardActions}>
                    {post.zoom_recording_url && (
                      <a
                        href={post.zoom_recording_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={S.zoomJoinBtn}
                        onClick={e => e.stopPropagation()}
                      >
                        📹 Zoomに参加
                      </a>
                    )}
                    {post.transcript_url && (
                      <a
                        href={post.transcript_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={S.chouseiBtn}
                        onClick={e => e.stopPropagation()}
                      >
                        📅 日程調整
                      </a>
                    )}
                  </div>
                )}
              </div>
            );

            return isSchedule ? (
              <div
                key={post.id}
                style={S.cardLink}
                onClick={() => router.push(`/posts/${post.id}`)}
                role="link"
              >
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

      {/* ボトムナビ分のスペーサー */}
      <div style={{height: 76}} />

      {/* ════ ボトムナビゲーション ════ */}
      <nav style={S.bottomNav}>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{...S.navItem, ...(item.current ? S.navActive : {})}}
          >
            <span style={S.navIcon}>{item.icon}</span>
            <span style={S.navLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

// ─── ナビゲーション定義 ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/',           icon: '🏠', label: 'ホーム',  current: true  },
  { href: '/zoom',       icon: '📹', label: 'Zoom',    current: false },
  { href: '/decisions',  icon: '📋', label: '決定事項', current: false },
  { href: '/admin',      icon: '✏️', label: '投稿',    current: false },
];

// ─── スタイル定義 ──────────────────────────────────────────────────────────────
const C = {
  accent:  '#1a4f8a',
  text:    '#1a1a1a',
  sub:     '#666',
  border:  '#e8e8e8',
  bg:      '#f7f7f5',
  white:   '#ffffff',
};

const S = {
  // ページ全体
  page: {
    maxWidth: 480,
    margin: '0 auto',
    minHeight: '100vh',
    background: C.bg,
    fontFamily: "'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Noto Sans JP', sans-serif",
  },

  // ヘッダー
  header: {
    background: C.accent,
    color: 'white',
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  appName: { fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' },
  appSub:  { fontSize: 10, opacity: 0.75, marginTop: 2 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 8 },
  unreadBadge: {
    background: '#f44336',
    color: 'white',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    padding: '0 5px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 800,
  },
  bellBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: 10,
    width: 40,
    height: 40,
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },

  // iOSインストールバナー
  installBanner: {
    background: '#e8f0fa',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    borderBottom: '1px solid #c5d5ea',
  },
  installContent: { display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 },
  installTitle:   { fontSize: 13, fontWeight: 700, color: C.text },
  installSteps:   { fontSize: 11, color: C.sub, marginTop: 4, lineHeight: 1.5 },
  dismissBtn: {
    background: 'none', border: 'none',
    fontSize: 18, cursor: 'pointer',
    color: '#999', padding: '4px 8px',
    flexShrink: 0,
  },

  // 通知バナー
  notifBanner: {
    background: '#fff8e1',
    padding: '10px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ffe082',
    gap: 8,
  },
  notifBtn: {
    background: C.accent,
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  iOSNote: {
    background: '#fff3e0',
    padding: '10px 16px',
    fontSize: 12,
    color: '#bf360c',
    borderBottom: '1px solid #ffcc80',
  },

  // クイックアクション
  section: { padding: '14px 14px 0' },
  manualLinkRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: 8 },
  manualLink: { fontSize: 12, color: C.accent, textDecoration: 'none', fontWeight: 600, padding: '4px 10px', background: '#e8f0fa', borderRadius: 20 },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  qa: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: '20px 10px',
    textDecoration: 'none',
    gap: 8,
    minHeight: 88,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  qaIcon:  { fontSize: 30 },
  qaLabel: { fontSize: 13, fontWeight: 700, color: 'white', textAlign: 'center' },

  // バッジテスト
  badgeTestRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    gap: 8,
    borderBottom: '1px solid ' + C.border,
    background: C.white,
    marginTop: 12,
  },
  badgeTestLabel: { fontSize: 12, color: C.sub, whiteSpace: 'nowrap' },
  badgeTestBtn: {
    background: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  // カテゴリタブ
  tabsScroll: {
    overflowX: 'auto',
    padding: '12px 14px 0',
    WebkitOverflowScrolling: 'touch',
  },
  tabs: {
    display: 'flex',
    gap: 7,
    minWidth: 'max-content',
    paddingBottom: 2,
  },
  tab: {
    padding: '8px 16px',
    borderRadius: 20,
    border: '1px solid #d5d5d5',
    background: C.white,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    color: C.sub,
    whiteSpace: 'nowrap',
    WebkitTapHighlightColor: 'transparent',
  },
  tabActive: {
    background: C.accent,
    color: 'white',
    border: `1px solid ${C.accent}`,
  },

  // 投稿リスト
  posts: {
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  stateText: {
    textAlign: 'center',
    color: C.sub,
    fontSize: 14,
    padding: '40px 0',
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
  dateText: { fontSize: 11, color: '#aaa', marginLeft: 'auto' },
  cardTitle:   { fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.45 },
  cardSummary: { fontSize: 12, color: C.sub, marginTop: 6, lineHeight: 1.65 },
  cardActions: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  zoomJoinBtn: {
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

  // ボトムナビゲーション
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    background: C.white,
    borderTop: `1px solid ${C.border}`,
    display: 'flex',
    zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
  },
  navItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 4px',
    textDecoration: 'none',
    color: '#aaa',
    gap: 3,
    WebkitTapHighlightColor: 'transparent',
  },
  navActive: { color: C.accent },
  navIcon:   { fontSize: 22 },
  navLabel:  { fontSize: 10, fontWeight: 600 },
};
