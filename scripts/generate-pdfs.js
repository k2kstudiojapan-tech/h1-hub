const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const FONT = 'C:\\Windows\\Fonts\\NotoSansJP-VF.ttf';
const OUTPUT_DIR = path.join(__dirname, '..', 'public');
const NAVY = '#1a4f8a';
const NAVY_LIGHT = '#e8f0f9';
const NAVY_MID = '#4a7cb5';
const RED = '#c0392b';
const RED_LIGHT = '#fdf0ef';
const GREEN = '#27ae60';
const GREEN_LIGHT = '#eafaf1';
const ORANGE = '#e67e22';
const ORANGE_LIGHT = '#fef9e7';
const GRAY_BG = '#f5f7fa';
const GRAY_TEXT = '#555555';
const GRAY_BORDER = '#d0d7e3';
const BLACK = '#1a1a2e';

function createDoc() {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 50, right: 50 },
    bufferPages: true,
  });
  doc.registerFont('JP', FONT);
  doc.registerFont('JP-Bold', FONT);
  return doc;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function pageWidth(doc) { return doc.page.width - doc.page.margins.left - doc.page.margins.right; }

function coverBand(doc, color, yStart, height) {
  doc.rect(0, yStart, doc.page.width, height).fill(color);
}

function sectionHeader(doc, num, title, color = NAVY) {
  const y = doc.y + 10;
  // left bar
  doc.rect(doc.page.margins.left, y, 4, 22).fill(color);
  doc.font('JP-Bold').fontSize(13).fillColor(color)
     .text(`${num}. ${title}`, doc.page.margins.left + 12, y + 3, { width: pageWidth(doc) - 12 });
  doc.y = doc.y + 6;
  doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + pageWidth(doc), doc.y)
     .strokeColor(GRAY_BORDER).lineWidth(0.5).stroke();
  doc.y = doc.y + 8;
}

function infoBox(doc, icon, text, bg = NAVY_LIGHT, textColor = NAVY) {
  const margin = doc.page.margins.left;
  const w = pageWidth(doc);
  const startY = doc.y;
  // measure height
  doc.font('JP').fontSize(9.5).fillColor(textColor);
  const textH = doc.heightOfString(`${icon}  ${text}`, { width: w - 24 });
  const boxH = Math.max(textH + 16, 36);
  doc.rect(margin, startY, w, boxH).fill(bg);
  doc.rect(margin, startY, 3, boxH).fill(textColor === NAVY ? NAVY : textColor);
  doc.font('JP').fontSize(9.5).fillColor(textColor)
     .text(`${icon}  ${text}`, margin + 12, startY + 8, { width: w - 24 });
  doc.y = startY + boxH + 6;
}

function warningBox(doc, text) {
  infoBox(doc, '⚠', text, RED_LIGHT, RED);
}

function tipBox(doc, text) {
  infoBox(doc, '💡', text, ORANGE_LIGHT, ORANGE);
}

function checkBox(doc, text) {
  infoBox(doc, '✅', text, GREEN_LIGHT, GREEN);
}

function stepRow(doc, num, text) {
  const margin = doc.page.margins.left;
  const circleX = margin + 12;
  const circleY = doc.y + 9;
  doc.circle(circleX, circleY, 10).fill(NAVY);
  doc.font('JP-Bold').fontSize(10).fillColor('white').text(`${num}`, circleX - 3.5, circleY - 6, { width: 7, align: 'center' });
  doc.font('JP').fontSize(10.5).fillColor(BLACK).text(text, margin + 28, doc.y - 12, { width: pageWidth(doc) - 28 });
  doc.y = doc.y + 4;
}

function subHeader(doc, text, color = NAVY_MID) {
  doc.y += 6;
  doc.font('JP-Bold').fontSize(10.5).fillColor(color).text(text, { indent: 0 });
  doc.y += 2;
}

function bodyText(doc, text) {
  doc.font('JP').fontSize(10).fillColor(GRAY_TEXT).text(text, { indent: 0, lineGap: 2 });
  doc.y += 4;
}

function bullet(doc, text) {
  const margin = doc.page.margins.left;
  doc.font('JP').fontSize(10).fillColor(GRAY_TEXT)
     .text('・', margin, doc.y, { continued: true, width: 12 })
     .text(text, margin + 12, doc.y, { width: pageWidth(doc) - 12, lineGap: 1 });
}

function keyValueRow(doc, key, value) {
  const margin = doc.page.margins.left;
  const w = pageWidth(doc);
  doc.font('JP-Bold').fontSize(9.5).fillColor(NAVY).text(key, margin, doc.y, { continued: true, width: 110 });
  doc.font('JP').fontSize(9.5).fillColor(BLACK).text(value, margin + 115, doc.y, { width: w - 115 });
  doc.y += 2;
}

function drawHR(doc) {
  doc.y += 4;
  doc.moveTo(doc.page.margins.left, doc.y)
     .lineTo(doc.page.margins.left + pageWidth(doc), doc.y)
     .strokeColor(GRAY_BORDER).lineWidth(0.5).stroke();
  doc.y += 8;
}

function ensureSpace(doc, needed) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
    doc.y = doc.page.margins.top;
  }
}

// ─── page numbers ────────────────────────────────────────────────────────────

function addPageNumbers(doc, total) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const pageNum = i - range.start + 1;
    doc.font('JP').fontSize(8).fillColor(GRAY_TEXT)
       .text(`${pageNum} / ${total}`, 0, doc.page.height - 28, { align: 'center', width: doc.page.width });
  }
}

// ─── Cover page ──────────────────────────────────────────────────────────────

function drawCover(doc, title, subtitle, warningText = null) {
  // Header band
  coverBand(doc, NAVY, 0, 180);
  // App icon circle
  doc.circle(doc.page.width / 2, 80, 36).fill('white');
  doc.font('JP-Bold').fontSize(22).fillColor(NAVY)
     .text('H1', doc.page.width / 2 - 18, 67);

  // Title
  doc.font('JP-Bold').fontSize(20).fillColor('white')
     .text(title, 0, 128, { align: 'center', width: doc.page.width });

  // Subtitle band
  coverBand(doc, NAVY_MID, 180, 44);
  doc.font('JP').fontSize(12).fillColor('white')
     .text(subtitle, 0, 192, { align: 'center', width: doc.page.width });

  doc.y = 248;

  if (warningText) {
    const margin = doc.page.margins.left;
    const w = pageWidth(doc);
    doc.rect(margin, doc.y, w, 50).fill(RED_LIGHT);
    doc.rect(margin, doc.y, 4, 50).fill(RED);
    doc.font('JP-Bold').fontSize(10.5).fillColor(RED)
       .text(warningText, margin + 14, doc.y + 12, { width: w - 20 });
    doc.y += 64;
  }

  // version / date
  doc.y = doc.page.height - 100;
  doc.font('JP').fontSize(9).fillColor(GRAY_TEXT)
     .text('H1法話グランプリ実行委員会', { align: 'center', width: doc.page.width })
     .text('2026年度版', { align: 'center', width: doc.page.width });
}

// ═══════════════════════════════════════════════════════════════════════════
// PDF①  manual-general.pdf
// ═══════════════════════════════════════════════════════════════════════════

function buildGeneralManual() {
  const doc = createDoc();
  const out = path.join(OUTPUT_DIR, 'manual-general.pdf');
  const stream = fs.createWriteStream(out);
  doc.pipe(stream);

  // ── Cover ──
  drawCover(doc, 'H1ポータル 使い方マニュアル', '一般実行委員向け');
  doc.addPage();

  // ── 1. H1ポータルとは ──
  sectionHeader(doc, 1, 'H1ポータルとは');
  bodyText(doc, 'H1ポータルは、H1法話グランプリ実行委員のための情報共有アプリです。お知らせ・決定事項・会議サマリー・Zoom会議室へのリンクをまとめて確認できます。');
  checkBox(doc, 'スマートフォンのホーム画面に追加すると、専用アプリのように使えます。');

  // ── 2. ホーム画面に追加する ──
  ensureSpace(doc, 80);
  sectionHeader(doc, 2, 'ホーム画面に追加する方法');

  subHeader(doc, '● iPhone の場合（必ず Safari で開くこと）');
  ['SafariでポータルのURLを開く', '画面下部の「↑（共有ボタン）」をタップ', '「ホーム画面に追加」をタップ', '名前を確認して「追加」をタップ'].forEach((s, i) => stepRow(doc, i + 1, s));
  checkBox(doc, 'ホーム画面に「H1」アイコンが追加されます。');
  warningBox(doc, 'ChromeやLINEブラウザでは追加できません。必ずSafariをご使用ください。');

  ensureSpace(doc, 80);
  subHeader(doc, '● Android の場合');
  ['ChromeでポータルのURLを開く', '右上の「⋮」（点3つ）をタップ', '「ホーム画面に追加」をタップ', '「追加」をタップして完了'].forEach((s, i) => stepRow(doc, i + 1, s));

  // ── 3. 画面の見方 ──
  doc.addPage();
  sectionHeader(doc, 3, '画面の見方');

  subHeader(doc, 'トップ画面の構成');
  [
    ['①  ヘッダー', 'アプリ名（H1ポータル）と通知ボタン'],
    ['②  クイックアクション', 'Zoom会議室・資料Drive・決定事項・投稿管理への直通ボタン'],
    ['③  カテゴリタブ', 'すべて／お知らせ／決定事項／会議サマリー／予定'],
    ['④  投稿一覧', 'タップすると詳細が読めます'],
    ['⑤  ボトムナビゲーション', 'ホーム・Zoom・決定事項・投稿'],
  ].forEach(([k, v]) => keyValueRow(doc, k, v));

  doc.y += 6;
  subHeader(doc, 'カテゴリの種類');
  [
    ['お知らせ', '一般的なお知らせや連絡事項'],
    ['決定事項', '会議で決まったことの記録'],
    ['会議サマリー', '会議の要約・議事録'],
    ['予定・スケジュール', '今後の会議日程・イベント'],
  ].forEach(([k, v]) => keyValueRow(doc, `・${k}`, v));

  // Phone mockup (text-art style box)
  doc.y += 10;
  const mx = doc.page.margins.left + (pageWidth(doc) - 200) / 2;
  const my = doc.y;
  doc.roundedRect(mx, my, 200, 280, 16).strokeColor(NAVY_MID).lineWidth(1.5).stroke();
  doc.rect(mx + 80, my + 8, 40, 6).fill(NAVY_MID); // notch
  doc.font('JP-Bold').fontSize(8).fillColor(NAVY).text('H1ポータル', mx + 4, my + 22, { width: 192, align: 'center' });
  const rows = [
    { y: 0,   bg: NAVY_LIGHT, text: 'ヘッダー ①' },
    { y: 32,  bg: '#dce8f7',  text: 'クイックアクション ②' },
    { y: 72,  bg: 'white',    text: 'カテゴリタブ ③' },
    { y: 100, bg: GRAY_BG,    text: '投稿一覧 ④' },
    { y: 220, bg: NAVY,       text: 'ナビゲーション ⑤' },
  ];
  rows.forEach(({ y: ry, bg, text }) => {
    const rh = (text.includes('投稿') ? 120 : text.includes('ナビ') ? 36 : 32);
    doc.rect(mx + 1, my + 36 + ry, 198, rh).fill(bg);
    doc.font('JP').fontSize(8).fillColor(text.includes('ナビ') ? 'white' : NAVY)
       .text(text, mx + 1, my + 46 + ry, { width: 198, align: 'center' });
  });
  doc.y = my + 298;

  // ── 4. Zoom会議に参加する ──
  ensureSpace(doc, 80);
  sectionHeader(doc, 4, 'Zoom会議に参加する方法');
  ['トップ画面の「📹 Zoom会議室」をタップ', '自分の部署の会議室を探す', '「Zoomに参加」ボタンをタップ', 'Zoomアプリが起動して会議に接続されます'].forEach((s, i) => stepRow(doc, i + 1, s));
  tipBox(doc, 'パスコードが求められた場合は、画面に表示されているパスコードを入力してください。');
  tipBox(doc, 'Zoomアプリが入っていない場合は、App Store / Google Play からインストールしてください。');

  // ── 5. お知らせを読む ──
  ensureSpace(doc, 60);
  sectionHeader(doc, 5, 'お知らせ・決定事項を読む方法');
  ['トップ画面の投稿一覧から読みたい記事をタップ', '詳細画面で本文・TODO・リンクなどを確認', '戻るときは「← トップへ戻る」をタップ'].forEach((s, i) => stepRow(doc, i + 1, s));

  // ── 6. FAQ ──
  doc.addPage();
  sectionHeader(doc, 6, 'よくある質問（FAQ）');

  const faqs = [
    ['ポータルが開かない', 'インターネット接続を確認してください。Wi-Fiまたはモバイルデータ通信が必要です。'],
    ['通知が来ない', 'スマホの設定でH1ポータルの通知を許可してください。iPhoneはホーム画面追加後（iOS 16.4以上）でのみ通知が届きます。'],
    ['Zoomに入れない', 'Zoomアプリを最新版に更新してください。パスコードはZoom会議室ページに記載されています。'],
    ['表示がおかしい', 'ページを引っ張って更新するか、ブラウザを閉じて開き直してください。'],
    ['投稿・内容の変更をしたい', '投稿は役員のみが行えます。担当役員にお声がけください。'],
  ];

  faqs.forEach(([q, a]) => {
    ensureSpace(doc, 60);
    const margin = doc.page.margins.left;
    const w = pageWidth(doc);
    const qY = doc.y;
    doc.rect(margin, qY, w, 22).fill(NAVY_LIGHT);
    doc.font('JP-Bold').fontSize(10).fillColor(NAVY).text(`Q. ${q}`, margin + 8, qY + 5, { width: w - 16 });
    doc.y = qY + 24;
    doc.font('JP').fontSize(10).fillColor(GRAY_TEXT).text(`A. ${a}`, margin + 8, doc.y, { width: w - 16, lineGap: 2 });
    doc.y += 10;
    drawHR(doc);
  });

  // finalize
  doc.flushPages();
  const total = doc.bufferedPageRange().count;
  addPageNumbers(doc, total);
  doc.end();

  return new Promise((resolve) => stream.on('finish', resolve));
}

// ═══════════════════════════════════════════════════════════════════════════
// PDF②  manual-officer.pdf
// ═══════════════════════════════════════════════════════════════════════════

function buildOfficerManual() {
  const doc = createDoc();
  const out = path.join(OUTPUT_DIR, 'manual-officer.pdf');
  const stream = fs.createWriteStream(out);
  doc.pipe(stream);

  // ── Cover ──
  drawCover(
    doc,
    'H1ポータル 役員マニュアル',
    '役員限定・取り扱い注意',
    '⚠  このマニュアルの内容（特にホストキー）は\n役員以外に共有しないでください'
  );
  doc.addPage();

  // ── 目次 ──
  sectionHeader(doc, '', '目次', NAVY);
  const toc = [
    ['1', '投稿を作成する'],
    ['2', '投稿を承認する'],
    ['3', 'ファイルをアップロードする'],
    ['4', 'Zoom会議をホストとして開催する'],
    ['5', 'AI議事録について'],
  ];
  toc.forEach(([n, t]) => {
    doc.font('JP').fontSize(11).fillColor(BLACK).text(`  ${n}.  ${t}`, doc.page.margins.left, doc.y, { width: pageWidth(doc) });
    doc.y += 2;
    drawHR(doc);
  });

  // ── 1. 投稿を作成する ──
  doc.addPage();
  sectionHeader(doc, 1, '投稿を作成する');
  ['トップ画面の「✏️ 投稿・管理」をタップ', '管理用パスワードを入力してログイン', '「新規投稿」フォームに必要事項を入力', '「下書き保存・承認待ちにする」をタップ', '他の役員が承認するとポータルに掲載されます'].forEach((s, i) => stepRow(doc, i + 1, s));
  tipBox(doc, '自分で投稿して自分で承認することもできます。');

  ensureSpace(doc, 60);
  subHeader(doc, '入力項目');
  [
    ['カテゴリ（必須）', '決定事項／会議サマリー／お知らせ／予定・スケジュール'],
    ['部署（必須）', '役員・執行部会・運営チームなど'],
    ['タイトル（必須）', '件名（短く分かりやすく）'],
    ['要約', '一覧画面に表示される簡単な説明'],
    ['本文', '詳細内容'],
    ['TODO', '担当者へのタスク（改行区切りで複数入力可）'],
    ['リンク', '関連URL（DriveやURLなど）'],
    ['会議日', '会議の開催日（例：2026-06-15）'],
  ].forEach(([k, v]) => keyValueRow(doc, `・${k}`, v));

  // ── 2. 承認 ──
  ensureSpace(doc, 80);
  sectionHeader(doc, 2, '投稿を承認する');
  ['管理画面（投稿・管理）にログイン', '「承認待ち一覧」に届いている投稿を確認', '内容を確認し、必要に応じてタイトルや本文を修正', '「承認して掲載する」をタップ → 即座にポータルに表示される'].forEach((s, i) => stepRow(doc, i + 1, s));
  checkBox(doc, '承認後すぐにポータルのトップ画面に表示されます。');

  // ── 3. ファイルアップロード ──
  ensureSpace(doc, 80);
  sectionHeader(doc, 3, 'ファイルをアップロードする');
  ['管理画面にログイン', '「ファイルアップロード」セクションを探す', '「閲覧用」または「編集用」フォルダを選んでアップロード', '表示されたURLを投稿のリンク欄に貼り付ける'].forEach((s, i) => stepRow(doc, i + 1, s));

  ensureSpace(doc, 40);
  subHeader(doc, 'フォルダの種類');
  keyValueRow(doc, '・閲覧用', '誰でも見られるフォルダ（資料・議事録など）');
  keyValueRow(doc, '・編集用', '編集権限付きフォルダ（共同作業する文書など）');

  // ── 4. Zoom ホスト ──
  doc.addPage();
  sectionHeader(doc, 4, 'Zoom会議をホストとして開催する', RED);

  // ── Host Key Box ──
  const hkMargin = doc.page.margins.left;
  const hkW = pageWidth(doc);
  const hkY = doc.y + 4;
  doc.rect(hkMargin, hkY, hkW, 88).fill(RED_LIGHT);
  doc.rect(hkMargin, hkY, 4, 88).fill(RED);
  doc.rect(hkMargin + 4, hkY, hkW - 4, 88).strokeColor(RED).lineWidth(1).stroke();
  doc.font('JP-Bold').fontSize(11).fillColor(RED).text('🔑  ホストキー', hkMargin + 16, hkY + 12, { width: hkW - 24 });
  doc.font('JP-Bold').fontSize(42).fillColor(RED).text('25016', hkMargin + 16, hkY + 30, { width: hkW - 24, align: 'center', letterSpacing: 10 });
  doc.font('JP').fontSize(9).fillColor(RED).text('※ 絶対に外部に漏らさないでください', hkMargin + 16, hkY + 70, { width: hkW - 24 });
  doc.y = hkY + 100;

  bodyText(doc, 'ホストキーとは：参加者として入室後にホスト（主催者）権限を取得するためのコードです。');

  ensureSpace(doc, 120);
  subHeader(doc, '● スマートフォン（iPhone / Android）の手順');
  ['ポータルから「Zoomに参加」をタップして会議に入る', '画面下部の「参加者」をタップ', '画面右上の「…」→「ホストの要求」をタップ', 'ホストキー「25016」を入力して「OK」をタップ', 'ホストになれました！'].forEach((s, i) => stepRow(doc, i + 1, s));

  ensureSpace(doc, 100);
  subHeader(doc, '● パソコン（Mac / Windows）の手順');
  ['Zoomでミーティングに参加する', '画面下部ツールバーの「参加者」をクリック', '参加者パネル下部の「ホストを要求」をクリック', 'ホストキー「25016」を入力して「ホストを要求」をクリック', 'ホストに切り替わります'].forEach((s, i) => stepRow(doc, i + 1, s));

  ensureSpace(doc, 80);
  subHeader(doc, 'ホストとしてできること');
  ['録画の開始・停止', '参加者のミュート', '待合室の管理', 'ブレイクアウトルーム', '画面共有の許可'].forEach((t) => bullet(doc, t));

  doc.y += 6;
  ensureSpace(doc, 60);
  subHeader(doc, '会議を終了する方法');
  keyValueRow(doc, '全員を退出させる', '「終了」→「全員に対してミーティングを終了」をタップ');
  keyValueRow(doc, '自分だけ退出', '「終了」→「ミーティングを退出」をタップ（会議は継続）');

  doc.y += 4;
  warningBox(doc, 'ホストキーは役員のみが使用できる重要な情報です。参加者に見せたり、チャットに貼り付けたりしないでください。');

  // ── 5. AI議事録 ──
  ensureSpace(doc, 80);
  sectionHeader(doc, 5, 'AI議事録について');
  bodyText(doc, 'ZoomのWebhook連携により、ミーティング終了後にAI（OpenAI）が自動で議事録を生成し、ポータルに「会議サマリー」として投稿します。');

  ensureSpace(doc, 50);
  subHeader(doc, '自動化の流れ');
  const flow = ['Zoom会議終了', '録音データ取得', 'AI要約生成', 'ポータルに承認待ちで投稿'];
  const fw = pageWidth(doc) / flow.length;
  const fy = doc.y;
  flow.forEach((f, i) => {
    const fx = doc.page.margins.left + fw * i;
    doc.rect(fx + 4, fy, fw - 8, 32).fill(i % 2 === 0 ? NAVY_LIGHT : NAVY);
    doc.font('JP').fontSize(8.5).fillColor(i % 2 === 0 ? NAVY : 'white').text(f, fx + 4, fy + 10, { width: fw - 8, align: 'center' });
    if (i < flow.length - 1) {
      doc.font('JP-Bold').fontSize(14).fillColor(NAVY_MID).text('→', fx + fw - 8, fy + 9, { width: 12 });
    }
  });
  doc.y = fy + 44;

  ensureSpace(doc, 50);
  subHeader(doc, 'AI議事録が機能する条件');
  bullet(doc, 'ホストがクラウド録音を開始していること');
  bullet(doc, 'ZoomウェブフックPOST連携が有効なこと');

  doc.y += 4;
  warningBox(doc, 'AI要約は完璧ではありません。重要な決定事項は人間が確認・修正した上で承認してください。');

  // finalize
  doc.flushPages();
  const total = doc.bufferedPageRange().count;
  addPageNumbers(doc, total);
  doc.end();

  return new Promise((resolve) => stream.on('finish', resolve));
}

// ─── main ────────────────────────────────────────────────────────────────────

(async () => {
  console.log('Generating manual-general.pdf ...');
  await buildGeneralManual();
  console.log('  ✓ manual-general.pdf');

  console.log('Generating manual-officer.pdf ...');
  await buildOfficerManual();
  console.log('  ✓ manual-officer.pdf');

  console.log('Done!');
})();
