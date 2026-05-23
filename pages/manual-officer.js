import { useState } from 'react';
import Link from 'next/link';

export default function ManualOfficer() {
  const [password, setPassword] = useState('');
  const [auth, setAuth]         = useState(false);
  const [authError, setAuthError] = useState('');

  const handleLogin = () => {
    if (!password) { setAuthError('パスワードを入力してください'); return; }
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, category: '__check__' }),
    }).then(r => {
      if (r.status === 401) { setAuthError('パスワードが違います'); }
      else { setAuth(true); }
    });
  };

  if (!auth) {
    return (
      <div style={S.page}>
        <div style={S.header}>
          <Link href="/" style={S.backLink}>← トップへ戻る</Link>
          <div style={S.headerTitle}>🔐 役員マニュアル</div>
          <div style={S.headerSub}>役員限定・取り扱い注意</div>
        </div>
        <div style={S.loginWrap}>
          <div style={S.loginCard}>
            <div style={S.loginIcon}>🔐</div>
            <div style={S.loginTitle}>役員専用ページ</div>
            <div style={S.loginSub}>管理用パスワードを入力してください</div>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setAuthError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="パスワード"
              style={S.loginInput}
            />
            {authError && <div style={S.loginError}>{authError}</div>}
            <button onClick={handleLogin} style={S.loginBtn}>確認する</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={{...S.header, background: '#37474f'}}>
        <Link href="/" style={S.backLink}>← トップへ戻る</Link>
        <div style={S.headerTitle}>🔐 役員マニュアル</div>
        <div style={S.headerSub}>役員限定・取り扱い注意</div>
      </div>

      <div style={S.alertBanner}>
        ⚠️ このページの内容（特にホストキー）は<strong>役員以外に共有しないでください</strong>
      </div>

      <div style={S.body}>

        {/* ─── 目次 ─── */}
        <div style={S.toc}>
          <div style={S.tocTitle}>目次</div>
          {[
            ['① 投稿を作成する', '#post'],
            ['② 投稿を承認する', '#approve'],
            ['③ ファイルをアップロードする', '#upload'],
            ['④ Zoom会議をホストとして開催する', '#zoom-host'],
            ['⑤ AI議事録について', '#ai-minutes'],
          ].map(([label, href]) => (
            <a key={href} href={href} style={S.tocLink}>{label}</a>
          ))}
        </div>

        {/* ─── 一般マニュアルへのリンク ─── */}
        <InfoBox color="#e8f0fa" border="#1a4f8a">
          📖 ホーム画面追加・Zoom参加・お知らせ閲覧など<strong>基本的な使い方</strong>は
          <Link href="/manual" style={{color: '#1a4f8a', fontWeight: 700}}> 一般マニュアル </Link>
          をご参照ください。
        </InfoBox>

        <Divider />

        {/* ─── ① 投稿を作成する ─── */}
        <Section id="post" icon="✏️" title="① 投稿を作成する">
          <p style={S.text}>
            お知らせ・決定事項・会議サマリー・予定などを<strong>投稿</strong>してポータルに掲載できます。
          </p>

          <StepList steps={[
            {
              label: 'トップ画面の「✏️ 投稿・管理」をタップ（またはボトムナビの「投稿」）',
              image: (
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, maxWidth: 200, margin: '0 auto'}}>
                  <QBtn bg="#5c35a0" icon="📋" label="決定事項" size="sm" />
                  <QBtn bg="#37474f" icon="✏️" label="投稿・管理" size="sm" highlight />
                </div>
              ),
            },
            {
              label: '管理用パスワードを入力して「ログイン」',
              image: (
                <div style={{...S.phoneBorder, padding: 12}}>
                  <div style={{fontSize: 11, fontWeight: 700, marginBottom: 8, textAlign: 'center'}}>🔐 管理画面</div>
                  <div style={{background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, padding: '8px 10px', fontSize: 10, color: '#999', marginBottom: 8}}>パスワードを入力</div>
                  <div style={{background: '#1a4f8a', color: 'white', textAlign: 'center', borderRadius: 6, padding: '7px', fontSize: 11, fontWeight: 700}}>ログイン</div>
                </div>
              ),
            },
            {
              label: '「新規投稿」フォームに必要事項を入力する',
              image: (
                <div style={{...S.phoneBorder, padding: 10}}>
                  {[
                    {label: 'カテゴリ', ex: '決定事項 ▼'},
                    {label: '部署', ex: '役員 ▼'},
                    {label: 'タイトル', ex: '第3回全体会議の決定事項'},
                    {label: '要約（任意）', ex: '短い説明文...'},
                  ].map(({label, ex}) => (
                    <div key={label} style={{marginBottom: 7}}>
                      <div style={{fontSize: 9, color: '#666', marginBottom: 2}}>{label}</div>
                      <div style={{border: '1px solid #ddd', borderRadius: 5, padding: '5px 8px', fontSize: 9, color: '#999', background: 'white'}}>{ex}</div>
                    </div>
                  ))}
                </div>
              ),
            },
            { label: '「下書き保存・承認待ちにする」ボタンをタップ' },
            { label: '他の役員が承認するとポータルに掲載されます（次のセクション参照）' },
          ]} />

          <InfoBox color="#fff8e1" border="#ffc107">
            💡 自分で投稿して自分で承認することもできます（一人で確認して掲載したい場合）。
          </InfoBox>

          <div style={S.subTitle}>入力項目の説明</div>
          <table style={S.table}>
            <tbody>
              {[
                ['カテゴリ', '決定事項 / 会議サマリー / お知らせ / 予定・スケジュール', true],
                ['部署', '役員・執行部会・運営チーム など担当部署', true],
                ['タイトル', '件名（短く分かりやすく）', true],
                ['要約', '一覧画面に表示される簡単な説明', false],
                ['本文', '詳細内容', false],
                ['TODO', '担当者へのタスク（改行区切りで複数入力可）', false],
                ['リンク', '関連URL（Drive・調整さんなど）', false],
                ['会議日', '会議の開催日（例: 2026-06-15）', false],
              ].map(([name, desc, required]) => (
                <tr key={name} style={{borderBottom: '1px solid #eee'}}>
                  <td style={{...S.tdTag, width: '30%'}}>
                    <span style={{fontWeight: 700, fontSize: 12}}>{name}</span>
                    {required && <span style={{fontSize: 9, color: '#e53935', marginLeft: 4}}>必須</span>}
                  </td>
                  <td style={{...S.tdDesc, fontSize: 12}}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Divider />

        {/* ─── ② 投稿を承認する ─── */}
        <Section id="approve" icon="✅" title="② 投稿を承認する">
          <p style={S.text}>
            他の役員が作成した投稿を確認・承認してポータルに掲載します。
          </p>

          <StepList steps={[
            { label: '管理画面（投稿・管理）にログインする' },
            {
              label: '「承認待ち一覧」に届いている投稿を確認する',
              image: (
                <div style={{...S.phoneBorder, padding: 10}}>
                  <div style={{fontSize: 10, fontWeight: 700, marginBottom: 8, color: '#37474f'}}>承認待ち一覧</div>
                  <div style={{background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 6, padding: 8, marginBottom: 6}}>
                    <div style={{fontSize: 9, color: '#666', marginBottom: 2}}>決定事項 / 役員</div>
                    <div style={{fontSize: 11, fontWeight: 700}}>次回全体会議の日程</div>
                    <div style={{display: 'flex', gap: 4, marginTop: 6}}>
                      <div style={{background: '#1a4f8a', color: 'white', borderRadius: 4, padding: '4px 8px', fontSize: 9, fontWeight: 700}}>確認・承認</div>
                    </div>
                  </div>
                </div>
              ),
            },
            { label: '内容を確認し、必要に応じてタイトルや本文を修正する' },
            { label: '「承認して掲載する」ボタンをタップ → 即座にポータルに表示される' },
          ]} />

          <InfoBox color="#e8f5e9" border="#4caf50">
            ✅ 承認後すぐにポータルのトップ画面に表示されます。内容に問題がある場合は修正してから承認してください。
          </InfoBox>
        </Section>

        <Divider />

        {/* ─── ③ ファイルアップロード ─── */}
        <Section id="upload" icon="📁" title="③ ファイルをアップロードする">
          <p style={S.text}>
            PDFや画像などのファイルをGoogle Driveにアップロードできます。
          </p>

          <StepList steps={[
            { label: '管理画面（投稿・管理）にログインする' },
            { label: '「ファイルアップロード」セクションを探す' },
            {
              label: '「閲覧用」または「編集用」フォルダを選んでアップロード',
              image: (
                <div style={{...S.phoneBorder, padding: 10}}>
                  <div style={{fontSize: 10, fontWeight: 700, marginBottom: 8}}>📁 ファイルアップロード</div>
                  <div style={{display: 'flex', gap: 6, marginBottom: 8}}>
                    <div style={{flex: 1, border: '1px solid #1a4f8a', borderRadius: 6, padding: '5px', textAlign: 'center', fontSize: 9, background: '#e8f0fa', color: '#1a4f8a', fontWeight: 700}}>閲覧用</div>
                    <div style={{flex: 1, border: '1px solid #ddd', borderRadius: 6, padding: '5px', textAlign: 'center', fontSize: 9, color: '#666'}}>編集用</div>
                  </div>
                  <div style={{border: '2px dashed #ccc', borderRadius: 6, padding: '10px', textAlign: 'center', fontSize: 9, color: '#999'}}>
                    ファイルを選択
                  </div>
                </div>
              ),
            },
            { label: 'アップロード完了後、表示されたURLを投稿のリンク欄に貼り付けることができます' },
          ]} />

          <table style={S.table}>
            <tbody>
              <tr style={{borderBottom: '1px solid #eee'}}>
                <td style={{...S.tdTag, fontWeight: 700}}>閲覧用</td>
                <td style={S.tdDesc}>誰でも見られるフォルダ（資料・議事録など）</td>
              </tr>
              <tr>
                <td style={{...S.tdTag, fontWeight: 700}}>編集用</td>
                <td style={S.tdDesc}>編集権限付きフォルダ（共同作業する文書など）</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Divider />

        {/* ─── ④ Zoomホスト ─── */}
        <Section id="zoom-host" icon="📹" title="④ Zoom会議をホストとして開催する">
          <p style={S.text}>
            ポータルのZoom会議室は<strong>固定のミーティングURL</strong>です。<br />
            「ホストキー」を使うと、参加後にホスト（主催者）の権限を取得できます。
          </p>

          {/* ホストキー表示 */}
          <div style={S.hostKeyBox}>
            <div style={S.hostKeyLabel}>🔑 ホストキー</div>
            <div style={S.hostKeyNumber}>25016</div>
            <div style={S.hostKeyNote}>※絶対に外部に漏らさないでください</div>
          </div>

          <div style={S.subTitle}>ホストキーの使い方</div>

          <InfoBox color="#e8f0fa" border="#1a4f8a">
            💡 まず<strong>参加者として</strong>Zoom会議に入ります。その後、以下の手順でホストキーを使ってホストになります。
          </InfoBox>

          {/* スマホ */}
          <div style={S.deviceSection}>
            <div style={S.deviceTitle}>📱 スマートフォン（iPhone / Android）の場合</div>
            <StepList steps={[
              {
                label: 'ポータルから「📹 Zoomに参加」をタップして会議に入る',
              },
              {
                label: '画面下部の「参加者」をタップ',
                image: (
                  <div style={{background: '#1a1a1a', borderRadius: 10, padding: '8px 4px', maxWidth: 220, margin: '0 auto'}}>
                    <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                      {[['🔇','ミュート'], ['📹','ビデオ'], ['👥','参加者'], ['⋯','詳細']].map(([ic, lb]) => (
                        <div key={lb} style={{textAlign: 'center'}}>
                          <div style={{
                            fontSize: 18,
                            background: lb === '参加者' ? '#007aff' : 'rgba(255,255,255,0.15)',
                            borderRadius: 8, padding: '4px 8px',
                          }}>{ic}</div>
                          <div style={{fontSize: 8, color: 'white', marginTop: 2}}>{lb}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                label: '画面右上の「…」をタップ → 「ホストの要求」をタップ',
                image: (
                  <div style={{...S.phoneBorder, padding: 0}}>
                    {['招待', 'ホストの要求 ← ✅', '録音/録画', 'チャット'].map((item, i) => (
                      <div key={i} style={{
                        padding: '9px 14px', fontSize: 11, borderBottom: '1px solid #eee',
                        background: item.includes('✅') ? '#e8f0fa' : 'white',
                        fontWeight: item.includes('✅') ? 700 : 400,
                        color: item.includes('✅') ? '#1a4f8a' : '#333',
                      }}>
                        {item.replace(' ← ✅', '')}
                        {item.includes('✅') && <span style={{color: '#1a4f8a', marginLeft: 6}}>← これ！</span>}
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                label: 'ホストキー「25016」を入力して「OK」をタップ',
                image: (
                  <div style={{...S.phoneBorder, padding: 12}}>
                    <div style={{fontSize: 11, fontWeight: 700, textAlign: 'center', marginBottom: 8}}>ホストの要求</div>
                    <div style={{fontSize: 10, color: '#666', marginBottom: 6, textAlign: 'center'}}>ホストキーを入力してください</div>
                    <div style={{background: '#f5f5f5', border: '2px solid #1a4f8a', borderRadius: 6, padding: '10px', textAlign: 'center', fontSize: 20, fontWeight: 800, letterSpacing: 6, marginBottom: 10}}>25016</div>
                    <div style={{background: '#007aff', color: 'white', textAlign: 'center', borderRadius: 6, padding: '8px', fontSize: 12, fontWeight: 700}}>OK</div>
                  </div>
                ),
              },
              { label: 'ホストになれました！録画・ミュート操作・参加者管理ができるようになります' },
            ]} />
          </div>

          {/* PC */}
          <div style={{...S.deviceSection, marginTop: 20}}>
            <div style={S.deviceTitle}>💻 パソコン（Mac / Windows）の場合</div>
            <StepList steps={[
              { label: 'ポータルまたはZoomアプリからミーティングに参加する' },
              {
                label: '画面下部ツールバーの「参加者」をクリック',
                image: (
                  <div style={{background: '#2d2d2d', borderRadius: 8, padding: '8px 16px', maxWidth: 280, margin: '0 auto', display: 'flex', justifyContent: 'space-between'}}>
                    {[['🔇','ミュート解除'], ['📹','ビデオ停止'], ['👥','参加者'], ['⋯','詳細']].map(([ic, lb]) => (
                      <div key={lb} style={{textAlign: 'center'}}>
                        <div style={{fontSize: 16}}>{ic}</div>
                        <div style={{fontSize: 7, color: lb === '参加者' ? '#5ba4f8' : '#ccc', marginTop: 2, whiteSpace: 'nowrap'}}>{lb}</div>
                      </div>
                    ))}
                  </div>
                ),
              },
              { label: '右側に参加者パネルが開く → 下部の「ホストを要求」ボタンをクリック' },
              {
                label: 'ホストキー「25016」を入力して「ホストを要求」をクリック',
                image: (
                  <div style={{border: '1px solid #ccc', borderRadius: 8, padding: 12, maxWidth: 220, margin: '0 auto', background: 'white'}}>
                    <div style={{fontSize: 11, fontWeight: 700, marginBottom: 6}}>ホストを要求</div>
                    <div style={{fontSize: 9, color: '#666', marginBottom: 6}}>ホストキーを入力</div>
                    <div style={{border: '1px solid #ccc', borderRadius: 4, padding: '6px 10px', fontSize: 14, fontWeight: 800, letterSpacing: 4, marginBottom: 8, color: '#1a4f8a'}}>25016</div>
                    <div style={{background: '#0e71eb', color: 'white', textAlign: 'center', borderRadius: 4, padding: '6px', fontSize: 10, fontWeight: 700}}>ホストを要求</div>
                  </div>
                ),
              },
              { label: 'ホストに切り替わります' },
            ]} />
          </div>

          <InfoBox color="#ffebee" border="#e53935">
            🔴 <strong>ホストとしてできること:</strong> 録画の開始・停止 / 参加者のミュート / 待合室の管理 / ブレイクアウトルーム / 画面共有の許可
          </InfoBox>

          <InfoBox color="#fff3e0" border="#e65100">
            ⚠️ <strong>注意:</strong> ホストキーは役員のみが使用できる重要な情報です。参加者に見せたり、チャットに貼り付けたりしないでください。
          </InfoBox>

          <div style={S.subTitle}>会議を終了する</div>
          <StepList steps={[
            { label: '画面右下（スマホは右下）の赤い「終了」ボタンをタップ' },
            { label: '「全員に対してミーティングを終了」を選ぶ（全員を退出させる場合）' },
            { label: '「ミーティングを退出」を選ぶと自分だけ退出（会議は継続）' },
          ]} />
        </Section>

        <Divider />

        {/* ─── ⑤ AI議事録 ─── */}
        <Section id="ai-minutes" icon="🤖" title="⑤ AI議事録について">
          <p style={S.text}>
            ZoomのWebhook連携により、ミーティング終了後に<strong>AI（OpenAI）が自動で議事録を生成</strong>し、ポータルに「会議サマリー」として投稿します。
          </p>

          <div style={S.flowDiagram}>
            {[
              { icon: '📹', label: 'Zoom会議終了' },
              { icon: '→', label: '', arrow: true },
              { icon: '🎙️', label: '録音データ取得' },
              { icon: '→', label: '', arrow: true },
              { icon: '🤖', label: 'AI要約生成' },
              { icon: '→', label: '', arrow: true },
              { icon: '📋', label: 'ポータルに掲載' },
            ].map(({icon, label, arrow}, i) => (
              arrow
                ? <div key={i} style={{fontSize: 18, color: '#999', alignSelf: 'center'}}>→</div>
                : (
                  <div key={i} style={{textAlign: 'center', minWidth: 56}}>
                    <div style={{fontSize: 22}}>{icon}</div>
                    <div style={{fontSize: 9, color: '#666', marginTop: 3, lineHeight: 1.3}}>{label}</div>
                  </div>
                )
            ))}
          </div>

          <InfoBox color="#e8f0fa" border="#1a4f8a">
            💡 AIが自動投稿した内容は「会議サマリー」カテゴリで「承認待ち」になります。<strong>役員が確認・承認</strong>することでポータルに掲載されます。
          </InfoBox>

          <InfoBox color="#fff8e1" border="#ffc107">
            ⚠️ AI要約は完璧ではありません。重要な決定事項は人間が確認・修正した上で承認してください。
          </InfoBox>

          <div style={S.subTitle}>AI議事録が生成される条件</div>
          <table style={S.table}>
            <tbody>
              {[
                ['Zoomウェブフック連携', '設定済み（開発チームが管理）'],
                ['録音', 'ホストがクラウド録音を開始している必要あり'],
                ['言語', '日本語での発話に対応'],
                ['精度', 'AI要約のため、細部は修正が必要な場合あり'],
              ].map(([k, v]) => (
                <tr key={k} style={{borderBottom: '1px solid #eee'}}>
                  <td style={{...S.tdTag, fontWeight: 700}}>{k}</td>
                  <td style={S.tdDesc}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Divider />

        <div style={S.footer}>
          <div style={S.footerText}>
            <Link href="/manual" style={{color: '#1a4f8a'}}>📖 一般マニュアルはこちら</Link>
          </div>
          <div style={{...S.footerText, marginTop: 10}}>
            <Link href="/" style={{color: '#1a4f8a'}}>← ポータルトップに戻る</Link>
          </div>
          <div style={{...S.footerText, marginTop: 16, fontSize: 11, color: '#aaa'}}>
            ⚠️ このページは役員専用です。ブラウザのスクリーンショットや転送はお控えください。
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── 共通コンポーネント ─────────────────────────────────────────────────────────

function Section({ id, icon, title, children }) {
  return (
    <div id={id} style={{marginBottom: 8, scrollMarginTop: 16}}>
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
    <div style={{background: color, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, lineHeight: 1.65, margin: '12px 0'}}>
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
            background: '#37474f',
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
              <div style={{maxWidth: 240, margin: '0 auto'}}>{step.image}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function QBtn({ bg, icon, label, size = 'md', highlight }) {
  const pad = size === 'sm' ? '6px 4px' : '10px 4px';
  const fs  = size === 'sm' ? 9 : 11;
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

// ─── スタイル ──────────────────────────────────────────────────────────────────
const C = { accent: '#37474f', text: '#1a1a1a', sub: '#666', border: '#e0e0e0', bg: '#f7f7f5' };

const S = {
  page:       { maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: C.bg, fontFamily: "'Hiragino Kaku Gothic ProN', 'Hiragino Sans', sans-serif" },
  header:     { background: '#37474f', color: 'white', padding: '16px 20px' },
  backLink:   { display: 'inline-block', color: 'rgba(255,255,255,0.75)', fontSize: 12, textDecoration: 'none', marginBottom: 8 },
  headerTitle:{ fontSize: 20, fontWeight: 800 },
  headerSub:  { fontSize: 11, opacity: 0.75, marginTop: 3 },
  alertBanner:{ background: '#ffebee', borderBottom: '1px solid #ffcdd2', padding: '10px 16px', fontSize: 13, color: '#b71c1c', textAlign: 'center' },
  body:       { padding: '16px 16px 32px' },
  text:       { fontSize: 14, lineHeight: 1.8, color: C.text, margin: '10px 0' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle:  { fontSize: 18, fontWeight: 800, color: '#37474f' },
  sectionBody:   { paddingLeft: 4 },
  subTitle:      { fontSize: 15, fontWeight: 700, color: C.text, margin: '16px 0 10px', borderLeft: '4px solid #37474f', paddingLeft: 10 },
  divider:       { height: 1, background: '#e8e8e8', margin: '24px 0' },

  // 目次
  toc:       { background: 'white', borderRadius: 12, padding: '14px 16px', border: `1px solid ${C.border}`, marginBottom: 16 },
  tocTitle:  { fontSize: 13, fontWeight: 700, color: '#37474f', marginBottom: 8 },
  tocLink:   { display: 'block', fontSize: 13, color: '#1a4f8a', textDecoration: 'none', padding: '5px 0', borderBottom: '1px solid #f0f0f0' },

  // ログイン
  loginWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 90px)', padding: 24 },
  loginCard: { background: 'white', borderRadius: 16, padding: '32px 24px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  loginIcon: { fontSize: 48, textAlign: 'center', marginBottom: 12 },
  loginTitle:{ fontSize: 18, fontWeight: 800, textAlign: 'center', color: '#37474f', marginBottom: 6 },
  loginSub:  { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 20 },
  loginInput:{ width: '100%', padding: '14px 16px', fontSize: 16, border: '1px solid #ddd', borderRadius: 10, boxSizing: 'border-box', marginBottom: 8 },
  loginError:{ fontSize: 13, color: '#e53935', textAlign: 'center', marginBottom: 8 },
  loginBtn:  { width: '100%', padding: '14px', background: '#37474f', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer' },

  // ホストキー
  hostKeyBox: { background: '#1a4f8a', borderRadius: 16, padding: '20px 16px', margin: '16px 0', textAlign: 'center' },
  hostKeyLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  hostKeyNumber: { fontSize: 52, fontWeight: 900, color: 'white', letterSpacing: 8, fontFamily: 'monospace' },
  hostKeyNote: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8 },

  // デバイスセクション
  deviceSection: { background: 'white', borderRadius: 12, padding: '14px 16px', border: `1px solid ${C.border}`, marginTop: 14 },
  deviceTitle:   { fontSize: 14, fontWeight: 700, color: '#37474f', marginBottom: 12 },

  // フローダイアグラム
  flowDiagram: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap', background: 'white', borderRadius: 12, padding: 16, margin: '12px 0', border: `1px solid ${C.border}` },

  // Phone mockup
  phoneBorder: { border: '2px solid #ccc', borderRadius: 14, overflow: 'hidden', maxWidth: 220, margin: '0 auto', background: '#f7f7f5', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' },

  // Table
  table:  { width: '100%', borderCollapse: 'collapse', fontSize: 13, margin: '10px 0' },
  tdTag:  { padding: '8px 8px', verticalAlign: 'top', width: '38%', borderBottom: '1px solid #eee' },
  tdDesc: { padding: '8px 8px', color: C.sub, lineHeight: 1.6, borderBottom: '1px solid #eee' },

  // Footer
  footer:     { textAlign: 'center', padding: '20px 0' },
  footerText: { fontSize: 13, color: C.sub, marginBottom: 6 },
};
