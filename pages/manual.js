import Link from 'next/link';

export default function Manual() {
  return (
    <div style={S.page}>
      <div style={S.header}>
        <Link href="/" style={S.backLink}>← トップへ戻る</Link>
        <div style={S.headerTitle}>📖 使い方マニュアル</div>
        <div style={S.headerSub}>一般実行委員向け</div>
      </div>

      <div style={S.body}>

        {/* ─── はじめに ─── */}
        <Section id="intro" icon="🏠" title="H1ポータルとは">
          <p style={S.text}>
            H1ポータルは、H1法話グランプリ実行委員のための<strong>情報共有アプリ</strong>です。<br />
            お知らせ・決定事項・会議サマリー・Zoom会議室へのリンクをまとめて確認できます。
          </p>

          {/* アプリ画面イメージ */}
          <div style={S.phoneWrap}>
            <div style={S.phoneBorder}>
              <div style={S.phoneHeader}>
                <div style={{fontSize: 13, fontWeight: 800}}>H1ポータル</div>
                <div style={{fontSize: 9, opacity: 0.75, marginTop: 2}}>H1法話グランプリ 情報ハブ</div>
              </div>
              <div style={{padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5}}>
                <QBtn bg="#1a4f8a" icon="📹" label="Zoom会議室" />
                <QBtn bg="#2e7d32" icon="📁" label="資料・Drive" />
                <QBtn bg="#5c35a0" icon="📋" label="決定事項" />
                <QBtn bg="#37474f" icon="✏️" label="投稿・管理" />
              </div>
              <div style={{background: '#f0f0f0', padding: '6px 0', display: 'flex', justifyContent: 'space-around'}}>
                {['🏠', '📹', '📋', '✏️'].map(ic => (
                  <div key={ic} style={{fontSize: 14, textAlign: 'center'}}>{ic}</div>
                ))}
              </div>
            </div>
            <div style={S.caption}>↑ ホーム画面のイメージ</div>
          </div>

          <InfoBox color="#e8f0fa" border="#1a4f8a">
            💡 スマホのホーム画面に追加すると、アプリのように使えます（次のセクションで説明します）
          </InfoBox>
        </Section>

        <Divider />

        {/* ─── ホーム画面追加 ─── */}
        <Section id="install" icon="📲" title="ホーム画面に追加する方法">
          <p style={S.text}>ホーム画面に追加すると、<strong>アイコンをタップするだけ</strong>でポータルを開けます。</p>

          {/* iPhone */}
          <div style={S.subTitle}>📱 iPhone の場合</div>
          <InfoBox color="#fff3e0" border="#e65100">
            ⚠️ 必ず <strong>Safari（サファリ）</strong> で開いてください。ChromeやLINEブラウザでは追加できません。
          </InfoBox>

          <StepList steps={[
            {
              label: 'Safariでポータルのページを開く',
              image: (
                <div style={S.phoneBorder}>
                  <div style={{background: '#e5e5ea', padding: '5px 8px', fontSize: 9, color: '#333', display: 'flex', alignItems: 'center', gap: 4}}>
                    <div style={{flex: 1, background: 'white', borderRadius: 6, padding: '3px 6px', fontSize: 8}}>h1-hub.vercel.app</div>
                  </div>
                  <div style={{...S.phoneHeader, padding: '8px 10px'}}>
                    <div style={{fontSize: 11, fontWeight: 800}}>H1ポータル</div>
                  </div>
                  <div style={{background: '#f7f7f5', height: 40}} />
                  <div style={{background: '#f0f0f0', padding: '5px 0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '1px solid #ddd'}}>
                    <span style={{fontSize: 14}}>◁</span>
                    <span style={{fontSize: 14}}>▷</span>
                    <span style={{fontSize: 16, color: '#007aff', fontWeight: 700}}>⬆︎</span>
                    <span style={{fontSize: 14}}>⊞</span>
                    <span style={{fontSize: 14}}>☰</span>
                  </div>
                </div>
              ),
            },
            {
              label: '画面下の「⬆︎（上矢印）」ボタンをタップ',
              highlight: true,
              image: (
                <div style={{...S.phoneBorder, background: '#f0f0f0'}}>
                  <div style={{background: 'rgba(0,0,0,0.4)', padding: '6px 0', display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                    <span style={{fontSize: 14, color: 'white'}}>◁</span>
                    <span style={{fontSize: 14, color: 'white'}}>▷</span>
                    <div style={{background: '#007aff', borderRadius: 8, padding: '3px 10px', fontSize: 14, fontWeight: 700, color: 'white'}}>⬆︎ タップ！</div>
                    <span style={{fontSize: 14, color: 'white'}}>⊞</span>
                    <span style={{fontSize: 14, color: 'white'}}>☰</span>
                  </div>
                </div>
              ),
            },
            {
              label: '「ホーム画面に追加」をタップ',
              image: (
                <div style={{...S.phoneBorder, padding: 0}}>
                  {['Safari で開く', 'リーダーを表示', 'ホーム画面に追加 ← ✅', 'ブックマークを追加', 'リンクをコピー'].map((item, i) => (
                    <div key={i} style={{
                      padding: '10px 14px',
                      fontSize: 11,
                      borderBottom: '1px solid #eee',
                      background: item.includes('✅') ? '#e8f0fa' : 'white',
                      fontWeight: item.includes('✅') ? 700 : 400,
                      color: item.includes('✅') ? '#1a4f8a' : '#333',
                    }}>{item.replace(' ← ✅', '')}{item.includes('✅') && <span style={{color: '#1a4f8a', marginLeft: 6}}>← これ！</span>}</div>
                  ))}
                </div>
              ),
            },
            {
              label: '名前を確認して「追加」をタップ',
              image: (
                <div style={{...S.phoneBorder, padding: 12, background: '#f7f7f7'}}>
                  <div style={{textAlign: 'center', marginBottom: 10}}>
                    <div style={{width: 44, height: 44, background: '#1a4f8a', borderRadius: 10, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 800}}>H1</div>
                    <div style={{fontSize: 11, fontWeight: 700}}>H1ポータル</div>
                    <div style={{fontSize: 9, color: '#666'}}>h1-hub.vercel.app</div>
                  </div>
                  <div style={{background: '#007aff', color: 'white', textAlign: 'center', borderRadius: 8, padding: '8px 0', fontSize: 13, fontWeight: 700}}>追加</div>
                </div>
              ),
            },
          ]} />

          <InfoBox color="#e8f4fd" border="#2196f3">
            ✅ ホーム画面に「H1」のアイコンが追加されました！次回からはアイコンをタップするだけで開けます。
          </InfoBox>

          {/* Android */}
          <div style={{...S.subTitle, marginTop: 24}}>🤖 Android の場合</div>
          <StepList steps={[
            { label: 'Chrome（クローム）でポータルのページを開く' },
            { label: '画面右上の「⋮」（点3つ）をタップ' },
            { label: '「ホーム画面に追加」をタップ' },
            { label: '「追加」をタップして完了' },
          ]} />
        </Section>

        <Divider />

        {/* ─── 画面の見方 ─── */}
        <Section id="ui" icon="🗺️" title="画面の見方">

          <div style={S.subTitle}>トップ画面</div>

          <div style={S.annotatedWrap}>
            <div style={{...S.phoneBorder, position: 'relative'}}>
              <div style={S.phoneHeader}>
                <div style={{fontSize: 13, fontWeight: 800}}>H1ポータル</div>
                <span style={{fontSize: 16}}>🔕</span>
              </div>
              <div style={{padding: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4}}>
                <QBtn bg="#1a4f8a" icon="📹" label="Zoom会議室" size="sm" />
                <QBtn bg="#2e7d32" icon="📁" label="資料・Drive" size="sm" />
                <QBtn bg="#5c35a0" icon="📋" label="決定事項" size="sm" />
                <QBtn bg="#37474f" icon="✏️" label="投稿・管理" size="sm" />
              </div>
              <div style={{display: 'flex', gap: 4, padding: '4px 6px', overflowX: 'auto'}}>
                {['すべて', 'お知らせ', '決定事項'].map((t, i) => (
                  <div key={t} style={{fontSize: 9, padding: '3px 8px', borderRadius: 10, background: i === 0 ? '#1a4f8a' : 'white', color: i === 0 ? 'white' : '#666', border: '1px solid #ddd', whiteSpace: 'nowrap'}}>{t}</div>
                ))}
              </div>
              {[
                {cat: 'お知らせ', dept: '役員', title: '次回会議の日程'},
                {cat: '決定事項', dept: '執行部会', title: '運営方針について'},
              ].map((p, i) => (
                <div key={i} style={{margin: '4px 6px', background: 'white', borderRadius: 6, padding: '6px 8px', border: '1px solid #eee'}}>
                  <div style={{display: 'flex', gap: 3, marginBottom: 3}}>
                    <span style={{fontSize: 8, background: '#e8f0fa', color: '#1a4f8a', padding: '1px 5px', borderRadius: 3}}>{p.cat}</span>
                    <span style={{fontSize: 8, background: '#7b2d8b', color: 'white', padding: '1px 5px', borderRadius: 3}}>{p.dept}</span>
                  </div>
                  <div style={{fontSize: 10, fontWeight: 700}}>{p.title}</div>
                </div>
              ))}
              <div style={{background: 'white', borderTop: '1px solid #eee', padding: '4px 0', display: 'flex', justifyContent: 'space-around', marginTop: 4}}>
                {['🏠', '📹', '📋', '✏️'].map(ic => (
                  <div key={ic} style={{fontSize: 12, textAlign: 'center'}}>{ic}</div>
                ))}
              </div>
            </div>

            <div style={S.annotations}>
              <AnnotationItem num="①" text="アプリ名。タップしてもなにも起きません" />
              <AnnotationItem num="②" text="クイックアクション。よく使う機能へ素早くアクセス" />
              <AnnotationItem num="③" text="カテゴリタブ。種類ごとに絞り込めます" />
              <AnnotationItem num="④" text="投稿一覧。タップすると詳細が見られます" />
              <AnnotationItem num="⑤" text="ナビゲーション。各ページへ移動できます" />
            </div>
          </div>

          <div style={S.subTitle}>カテゴリの種類</div>
          <table style={S.table}>
            <tbody>
              <tr>
                <td style={S.tdTag}><span style={{...S.tag, background: '#e8f0fa', color: '#1a4f8a'}}>お知らせ</span></td>
                <td style={S.tdDesc}>一般的なお知らせや連絡事項</td>
              </tr>
              <tr>
                <td style={S.tdTag}><span style={{...S.tag, background: '#e8f0fa', color: '#1a4f8a'}}>決定事項</span></td>
                <td style={S.tdDesc}>会議で決まったことの記録</td>
              </tr>
              <tr>
                <td style={S.tdTag}><span style={{...S.tag, background: '#e8f0fa', color: '#1a4f8a'}}>会議サマリー</span></td>
                <td style={S.tdDesc}>会議の要約・議事録</td>
              </tr>
              <tr>
                <td style={S.tdTag}><span style={{...S.tag, background: '#e8f0fa', color: '#1a4f8a'}}>予定・スケジュール</span></td>
                <td style={S.tdDesc}>今後の会議日程・イベント</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Divider />

        {/* ─── お知らせを読む ─── */}
        <Section id="read" icon="📋" title="お知らせ・決定事項を読む">
          <StepList steps={[
            { label: 'トップ画面の投稿一覧から読みたい記事をタップ' },
            { label: '詳細画面が開き、本文・TODO・リンクなどを確認できます' },
            { label: '戻るときは「← トップへ戻る」をタップ' },
          ]} />

          <div style={S.phoneBorder}>
            <div style={{background: '#1a4f8a', padding: '6px 10px'}}>
              <div style={{fontSize: 9, color: 'rgba(255,255,255,0.7)'}}>← トップへ戻る</div>
            </div>
            <div style={{padding: 10}}>
              <div style={{display: 'flex', gap: 4, marginBottom: 6}}>
                <span style={{fontSize: 9, background: '#e8f0fa', color: '#1a4f8a', padding: '2px 6px', borderRadius: 3}}>決定事項</span>
                <span style={{fontSize: 9, background: '#1a4f8a', color: 'white', padding: '2px 6px', borderRadius: 3}}>役員</span>
              </div>
              <div style={{fontSize: 12, fontWeight: 800, marginBottom: 6}}>次回全体会議の日程について</div>
              <div style={{fontSize: 9, color: '#444', lineHeight: 1.6}}>
                6月15日（土）14:00〜 にて開催することが決定しました。<br />
                ZoomのURLは下記よりご参加ください。
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ─── Zoom ─── */}
        <Section id="zoom" icon="📹" title="Zoom会議に参加する">
          <StepList steps={[
            {
              label: 'トップ画面の「📹 Zoom会議室」をタップ',
              image: (
                <div style={{...S.phoneBorder, padding: 6}}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4}}>
                    <QBtn bg="#1a4f8a" icon="📹" label="Zoom会議室" size="sm" highlight />
                    <QBtn bg="#2e7d32" icon="📁" label="資料・Drive" size="sm" />
                  </div>
                </div>
              ),
            },
            {
              label: '自分の部署の会議室を探し「📹 Zoomに参加」をタップ',
              image: (
                <div style={S.phoneBorder}>
                  {[
                    {dept: '全体', color: '#1a4f8a'},
                    {dept: '役員', color: '#7b2d8b'},
                  ].map(({dept, color}) => (
                    <div key={dept} style={{margin: '4px 6px', background: 'white', borderRadius: 6, padding: '8px', border: '1px solid #eee'}}>
                      <span style={{fontSize: 9, background: color, color: 'white', padding: '2px 8px', borderRadius: 10}}>{dept}</span>
                      <div style={{fontSize: 10, fontWeight: 700, margin: '4px 0'}}>{dept}会議室</div>
                      <div style={{background: color, color: 'white', textAlign: 'center', borderRadius: 6, padding: '5px', fontSize: 10, fontWeight: 700}}>📹 Zoomに参加</div>
                    </div>
                  ))}
                </div>
              ),
            },
            { label: 'Zoomアプリが起動し、会議に接続されます' },
          ]} />

          <InfoBox color="#e8f4fd" border="#2196f3">
            💡 パスコード（数字）が求められた場合は、画面に表示されている「パスコード」を入力してください。
          </InfoBox>

          <InfoBox color="#fff3e0" border="#e65100">
            📱 Zoomアプリが入っていない場合は、先にApp Store / Google PlayからZoomをインストールしてください。
          </InfoBox>
        </Section>

        <Divider />

        {/* ─── FAQ ─── */}
        <Section id="faq" icon="❓" title="よくある質問">
          {[
            { q: 'ポータルが開かない', a: 'インターネットに接続されているか確認してください。Wi-Fiまたはモバイルデータ通信が必要です。' },
            { q: '通知が来ない', a: 'スマホの設定で「H1ポータル」の通知を許可してください。またiPhoneの場合はホーム画面に追加した状態でのみ通知が届きます（iOS 16.4以上）。' },
            { q: 'Zoomに入れない', a: 'Zoomアプリを最新版に更新してください。パスコードはZoom会議室のページに記載されています。' },
            { q: '表示がおかしい', a: 'ページを引っ張って更新（プルダウン更新）するか、ブラウザを閉じて開き直してください。' },
            { q: '投稿・内容の変更をしたい', a: '投稿は役員のみが行えます。内容の修正依頼は担当役員にお声がけください。' },
          ].map(({q, a}, i) => (
            <div key={i} style={S.faqItem}>
              <div style={S.faqQ}>Q. {q}</div>
              <div style={S.faqA}>A. {a}</div>
            </div>
          ))}
        </Section>

        <Divider />

        <div style={S.footer}>
          <div style={S.footerText}>役員の方はこちら</div>
          <Link href="/manual-officer" style={S.officerLink}>
            🔐 役員マニュアルを見る
          </Link>
          <div style={{...S.footerText, marginTop: 16}}>
            <Link href="/" style={{color: '#1a4f8a'}}>← ポータルトップに戻る</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── 共通コンポーネント ─────────────────────────────────────────────────────────

function Section({ icon, title, children }) {
  return (
    <div style={{marginBottom: 8}}>
      <div style={S.sectionHeader}>
        <span style={{fontSize: 22}}>{icon}</span>
        <span style={S.sectionTitle}>{title}</span>
      </div>
      <div style={S.sectionBody}>{children}</div>
    </div>
  );
}

function Divider() {
  return <div style={S.divider} />;
}

function InfoBox({ color, border, children }) {
  return (
    <div style={{background: color, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, lineHeight: 1.6, margin: '12px 0'}}>
      {children}
    </div>
  );
}

function StepList({ steps }) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 14, margin: '14px 0'}}>
      {steps.map((step, i) => (
        <div key={i} style={{display: 'flex', gap: 12, alignItems: 'flex-start'}}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: step.highlight ? '#f44336' : '#1a4f8a',
            color: 'white', fontWeight: 800, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 1,
          }}>
            {i + 1}
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 600, lineHeight: 1.5, marginBottom: step.image ? 10 : 0}}>
              {step.label}
            </div>
            {step.image && (
              <div style={{maxWidth: 200, margin: '0 auto'}}>{step.image}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function QBtn({ bg, icon, label, size = 'md', highlight }) {
  const pad = size === 'sm' ? '6px 4px' : '10px 4px';
  const fs = size === 'sm' ? 9 : 11;
  const iFs = size === 'sm' ? 14 : 20;
  return (
    <div style={{
      background: bg, borderRadius: 8, padding: pad, textAlign: 'center', color: 'white',
      boxShadow: highlight ? '0 0 0 2px #f44336' : 'none',
    }}>
      <div style={{fontSize: iFs}}>{icon}</div>
      <div style={{fontSize: fs, fontWeight: 700, marginTop: 2}}>{label}</div>
    </div>
  );
}

function AnnotationItem({ num, text }) {
  return (
    <div style={{display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8}}>
      <span style={{
        width: 22, height: 22, background: '#f44336', color: 'white',
        borderRadius: '50%', fontSize: 11, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{num}</span>
      <span style={{fontSize: 11, lineHeight: 1.5, color: '#444'}}>{text}</span>
    </div>
  );
}

// ─── スタイル ──────────────────────────────────────────────────────────────────
const C = { accent: '#1a4f8a', text: '#1a1a1a', sub: '#666', border: '#e0e0e0', bg: '#f7f7f5' };

const S = {
  page: { maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: "'Hiragino Kaku Gothic ProN', 'Hiragino Sans', sans-serif" },
  header: { background: C.accent, color: 'white', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  backLink: { display: 'inline-block', color: 'rgba(255,255,255,0.75)', fontSize: 12, textDecoration: 'none', marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: 800 },
  headerSub: { fontSize: 11, opacity: 0.75, marginTop: 3 },
  body: { padding: '16px 16px 32px' },
  text: { fontSize: 14, lineHeight: 1.8, color: C.text, margin: '10px 0' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 800, color: C.accent },
  sectionBody: { paddingLeft: 4 },
  subTitle: { fontSize: 15, fontWeight: 700, color: C.text, margin: '16px 0 10px', borderLeft: `4px solid ${C.accent}`, paddingLeft: 10 },
  divider: { height: 1, background: '#e8e8e8', margin: '24px 0' },

  // Phone mockup
  phoneWrap: { textAlign: 'center', margin: '16px 0' },
  phoneBorder: { border: '2px solid #ccc', borderRadius: 14, overflow: 'hidden', maxWidth: 220, margin: '0 auto', background: '#f7f7f5', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' },
  phoneHeader: { background: '#1a4f8a', color: 'white', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  caption: { fontSize: 11, color: C.sub, marginTop: 8 },

  // Annotated layout
  annotatedWrap: { display: 'flex', gap: 14, alignItems: 'flex-start', margin: '12px 0' },
  annotations: { flex: 1 },

  // Table
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, margin: '10px 0' },
  tdTag: { padding: '7px 8px', verticalAlign: 'middle', width: '45%' },
  tdDesc: { padding: '7px 8px', color: C.sub, lineHeight: 1.5 },
  tag: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, display: 'inline-block' },

  // FAQ
  faqItem: { background: 'white', borderRadius: 10, padding: '12px 14px', marginBottom: 10, border: `1px solid ${C.border}` },
  faqQ: { fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 6 },
  faqA: { fontSize: 13, color: C.sub, lineHeight: 1.7 },

  // Footer
  footer: { textAlign: 'center', padding: '20px 0' },
  footerText: { fontSize: 13, color: C.sub, marginBottom: 10 },
  officerLink: { display: 'inline-block', background: '#37474f', color: 'white', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 },
};
