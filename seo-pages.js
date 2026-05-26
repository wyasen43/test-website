/* ================================================
   seo-pages.js — SEO Landing Page Template Engine
   Generates platform-specific downloader pages
   with full hreflang, canonical, structured data,
   internal linking, and rich SEO content.
   ================================================ */

const { PLATFORMS, RELATED_LABELS, SECTION_LABELS, t, getSEOPage, getSlug } = require("./seo-data");

/* ─── SHARED CSS (reuses server.js CSS_BASE variables) ─── */
const SEO_PAGE_CSS = `
:root{--bg:#020408;--card:rgba(255,255,255,.035);--br:rgba(255,255,255,.08);--tx:#f0f4ff;--mu:rgba(240,244,255,.45);--ac:#4f8eff;--a2:#a259ff;--gr:#22d3a5;--rd:#ff6b6b;}
*{margin:0;padding:0;box-sizing:border-box;}
body{background:var(--bg);color:var(--tx);font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden;}
.bg{position:fixed;inset:0;z-index:0;overflow:hidden;}
.bg::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 20% 10%,rgba(79,142,255,.12) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 80%,rgba(162,89,255,.1) 0%,transparent 60%);}
.gd{position:absolute;inset:0;background-image:linear-gradient(rgba(79,142,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,255,.04) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 100% 100% at 50% 50%,black 30%,transparent 80%);}
.grad{background:linear-gradient(90deg,var(--ac),var(--a2),var(--gr));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
footer{position:relative;z-index:1;text-align:center;padding:18px;color:rgba(255,255,255,.15);font-size:12px;border-top:1px solid var(--br);}
footer a{color:rgba(255,255,255,.25);text-decoration:none;margin:0 7px;}
.nav{position:fixed;top:0;left:0;right:0;z-index:200;padding:11px 18px;display:flex;align-items:center;justify-content:space-between;background:rgba(2,4,8,.92);backdrop-filter:blur(20px);border-bottom:1px solid var(--br);}
.nlogo{display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--tx);}
.ni{width:29px;height:29px;border-radius:8px;background:linear-gradient(135deg,var(--ac),var(--a2));display:flex;align-items:center;justify-content:center;font-size:13px;}
.nt{font-family:'Syne',sans-serif;font-weight:800;font-size:15px;}.nt span{color:var(--ac);}
.nr{display:flex;align-items:center;gap:13px;}
.nl{display:flex;gap:17px;}
.nl a{color:var(--mu);font-size:13px;text-decoration:none;transition:color .2s;}
.nl a:hover,.nl a.active{color:var(--tx);}
.lw{position:relative;}
.lb{display:flex;align-items:center;gap:5px;padding:6px 10px;background:rgba(255,255,255,.05);border:1px solid var(--br);border-radius:20px;color:rgba(240,244,255,.6);font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;}
.lb:hover{border-color:rgba(255,255,255,.15);color:var(--tx);}
.ld{position:absolute;top:calc(100% + 7px);right:0;width:185px;background:#0d1320;border:1px solid var(--br);border-radius:13px;padding:5px;z-index:300;display:none;box-shadow:0 20px 60px rgba(0,0,0,.6);max-height:310px;overflow-y:auto;}
.ld.op{display:block;}
.ld::-webkit-scrollbar{width:3px;}
.ld::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:3px;}
.lo{padding:8px 10px;border-radius:8px;cursor:pointer;font-size:13px;color:var(--mu);transition:all .15s;display:flex;align-items:center;gap:8px;}
.lo:hover{background:rgba(255,255,255,.05);color:var(--tx);}
.lo.act{background:rgba(79,142,255,.1);color:var(--ac);}
/* Page layout */
.seo-page{position:relative;z-index:1;max-width:880px;margin:0 auto;padding:100px 22px 60px;}
.seo-hero{text-align:center;margin-bottom:40px;}
.seo-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 13px;border-radius:50px;background:rgba(79,142,255,.1);border:1px solid rgba(79,142,255,.25);font-size:12px;color:var(--ac);font-weight:500;margin-bottom:14px;}
.seo-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--gr);}
h1{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(22px,4vw,40px);line-height:1.1;letter-spacing:-1px;margin-bottom:12px;}
.seo-intro{font-size:15px;color:var(--mu);max-width:620px;margin:0 auto 26px;line-height:1.7;}
/* Download card (embedded) */
.dl-card{max-width:520px;margin:0 auto 44px;background:var(--card);border:1px solid var(--br);border-radius:21px;padding:24px;backdrop-filter:blur(30px);box-shadow:0 30px 80px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.06);position:relative;overflow:hidden;}
.dl-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(79,142,255,.5),rgba(162,89,255,.5),transparent);}
.iw{position:relative;margin-bottom:9px;}
.ui{width:100%;padding:13px 95px 13px 42px;background:rgba(255,255,255,.04);border:1px solid var(--br);border-radius:11px;color:var(--tx);font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:all .3s;}
.ui::placeholder{color:rgba(255,255,255,.25);}
.ui:focus{border-color:rgba(79,142,255,.5);background:rgba(79,142,255,.05);box-shadow:0 0 0 3px rgba(79,142,255,.1);}
.ii{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--mu);pointer-events:none;}
.ii svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;}
.dp{position:absolute;right:8px;top:50%;transform:translateY(-50%);padding:3px 8px;border-radius:20px;font-size:10px;font-weight:600;display:none;pointer-events:none;}
.dp.sh{display:block;}
.pb{width:100%;padding:10px;background:rgba(79,142,255,.07);border:1px solid rgba(79,142,255,.18);border-radius:10px;color:var(--ac);font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:7px;margin-bottom:11px;}
.pb:hover{background:rgba(79,142,255,.13);}
.pb.ok{background:rgba(34,211,165,.08);border-color:rgba(34,211,165,.25);color:var(--gr);}
.pb svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;}
.tr{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:11px;}
.tb{padding:10px;border-radius:10px;border:1px solid var(--br);background:transparent;color:var(--mu);font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;}
.tb.act{background:rgba(79,142,255,.1);border-color:rgba(79,142,255,.32);color:var(--tx);}
.fb{width:100%;padding:13px;border:none;border-radius:11px;background:linear-gradient(135deg,var(--ac),var(--a2));color:white;font-size:14px;font-weight:600;font-family:'Syne',sans-serif;cursor:pointer;transition:transform .2s,box-shadow .2s;}
.fb:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(79,142,255,.35);}
.fb:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.dots{display:inline-flex;gap:4px;vertical-align:middle;}
.dots span{width:4px;height:4px;border-radius:50%;background:white;animation:dot 1.2s infinite;}
.dots span:nth-child(2){animation-delay:.2s;}.dots span:nth-child(3){animation-delay:.4s;}
@keyframes dot{0%,80%,100%{transform:scale(0);opacity:.3;}40%{transform:scale(1);opacity:1;}}
.em{margin-top:9px;padding:9px 12px;border-radius:9px;background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.2);color:var(--rd);font-size:13px;text-align:center;display:none;}
.em.sh{display:block;}
/* Steps */
.steps-section{margin-bottom:44px;}
.section-title{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(18px,3vw,26px);letter-spacing:-.5px;margin-bottom:18px;text-align:center;}
.steps-grid{display:flex;flex-direction:column;gap:12px;}
.step-card{display:flex;gap:14px;padding:18px 20px;background:var(--card);border:1px solid var(--br);border-radius:14px;}
.step-num{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--ac),var(--a2));display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:15px;flex-shrink:0;}
.step-body h3{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;margin-bottom:4px;}
.step-body p{color:var(--mu);font-size:13px;line-height:1.6;}
/* Features */
.features-section{margin-bottom:44px;}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;}
.feature-card{padding:16px;background:var(--card);border:1px solid var(--br);border-radius:13px;text-align:center;}
.feature-icon{font-size:20px;margin-bottom:6px;}
.feature-name{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;}
/* Related tools */
.related-section{margin-bottom:44px;}
.related-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;}
.related-card{display:block;padding:14px 16px;background:var(--card);border:1px solid var(--br);border-radius:13px;text-decoration:none;color:var(--tx);transition:all .2s;position:relative;overflow:hidden;}
.related-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(79,142,255,.03),transparent);opacity:0;transition:opacity .2s;}
.related-card:hover{border-color:rgba(79,142,255,.3);transform:translateY(-2px);}
.related-card:hover::before{opacity:1;}
.rc-emoji{font-size:16px;margin-bottom:5px;}
.rc-name{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;margin-bottom:2px;}
.rc-desc{font-size:11px;color:var(--mu);}
/* CTA */
.cta-section{text-align:center;padding:36px 22px;background:var(--card);border:1px solid var(--br);border-radius:20px;position:relative;overflow:hidden;margin-bottom:44px;}
.cta-section::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(79,142,255,.5),rgba(162,89,255,.5),transparent);}
.cta-btn{display:inline-block;padding:13px 28px;border-radius:11px;background:linear-gradient(135deg,var(--ac),var(--a2));color:white;font-size:14px;font-weight:600;font-family:'Syne',sans-serif;text-decoration:none;margin-top:14px;transition:transform .2s,box-shadow .2s;}
.cta-btn:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(79,142,255,.35);}
/* Platform badge */
.platform-badge{display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:50px;font-size:12px;font-weight:600;border:1px solid;margin-bottom:14px;}
@keyframes fD{from{opacity:0;transform:translateY(-13px);}to{opacity:1;transform:translateY(0);}}
@keyframes fU{from{opacity:0;transform:translateY(13px);}to{opacity:1;transform:translateY(0);}}
@keyframes bk{0%,100%{opacity:1;}50%{opacity:.3;}}
@media(max-width:500px){.nl{display:none;}.step-card{flex-direction:column;}.seo-page{padding:86px 15px 40px;}}
`;

/* ─── FEATURE ICONS by platform ─── */
const FEATURE_ICONS = {
  youtube:        ["🎬","🎵","⚡","🔒","📱","♾️"],
  youtube_mp3:    ["🎵","🔊","⚡","🔒","📱","♾️"],
  youtube_shorts: ["⚡","📱","🎬","🔒","♾️","✅"],
  tiktok:         ["🚫","📱","🎬","⚡","🔒","♾️"],
  tiktok_mp3:     ["🎵","🔊","⚡","🚫","📱","♾️"],
  instagram:      ["📸","🎬","⚡","🔒","📱","✅"],
  facebook:       ["🎬","📱","⚡","🔒","✅","♾️"],
  twitter:        ["🐦","🎬","⚡","🔒","📱","♾️"],
};

/* ─── RELATED TOOL DESCRIPTIONS (for cards) ─── */
const RELATED_DESCS = {
  youtube:        { en:"HD video & MP3", es:"Video HD y MP3", ar:"فيديو HD وMP3", pt:"Vídeo HD e MP3", id:"Video HD & MP3", fr:"Vidéo HD & MP3", de:"HD-Video & MP3", ja:"HD動画とMP3", tr:"HD video ve MP3", ru:"HD видео и MP3", hi:"HD वीडियो और MP3", vi:"Video HD & MP3", th:"วิดีโอ HD & MP3", it:"Video HD e MP3", ko:"HD 동영상 & MP3", fil:"HD video & MP3", pl:"Wideo HD i MP3", nl:"HD video & MP3", zh:"HD视频和MP3", uk:"HD відео та MP3" },
  youtube_mp3:    { en:"320kbps audio", es:"Audio 320kbps", ar:"صوت 320kbps", pt:"Áudio 320kbps", id:"Audio 320kbps", fr:"Audio 320kbps", de:"320kbps Audio", ja:"320kbps音声", tr:"320kbps ses", ru:"Аудио 320kbps", hi:"320kbps ऑडियो", vi:"Âm thanh 320kbps", th:"เสียง 320kbps", it:"Audio 320kbps", ko:"320kbps 오디오", fil:"320kbps audio", pl:"Audio 320kbps", nl:"320kbps audio", zh:"320kbps音频", uk:"320kbps аудіо" },
  youtube_shorts: { en:"Vertical shorts", es:"Shorts verticales", ar:"شورتس عمودية", pt:"Shorts verticais", id:"Shorts vertikal", fr:"Shorts verticaux", de:"Vertikale Shorts", ja:"縦型Shorts", tr:"Dikey Shorts", ru:"Вертикальные Shorts", hi:"वर्टिकल Shorts", vi:"Shorts dọc", th:"Shorts แนวตั้ง", it:"Shorts verticali", ko:"세로 쇼츠", fil:"Vertical shorts", pl:"Pionowe Shorts", nl:"Verticale Shorts", zh:"竖版Shorts", uk:"Вертикальні Shorts" },
  tiktok:         { en:"No watermark", es:"Sin marca de agua", ar:"بدون علامة مائية", pt:"Sem marca d'água", id:"Tanpa watermark", fr:"Sans filigrane", de:"Kein Wasserzeichen", ja:"透かしなし", tr:"Filigrансыз", ru:"Без водяного знака", hi:"बिना वॉटरमार्क", vi:"Không watermark", th:"ไม่มีลายน้ำ", it:"Senza filigrana", ko:"워터마크 없음", fil:"Walang watermark", pl:"Bez znaku wodnego", nl:"Geen watermerk", zh:"无水印", uk:"Без водяного знаку" },
  tiktok_mp3:     { en:"Viral sounds", es:"Sonidos virales", ar:"أصوات فيروسية", pt:"Sons virais", id:"Suara viral", fr:"Sons viraux", de:"Virale Sounds", ja:"バイラルサウンド", tr:"Viral sesler", ru:"Вирусные звуки", hi:"वायरल साउंड", vi:"Âm thanh viral", th:"เสียงไวรัล", it:"Suoni virali", ko:"바이럴 사운드", fil:"Viral sounds", pl:"Wirusowe dźwięki", nl:"Virale geluiden", zh:"热门音效", uk:"Вірусні звуки" },
  instagram:      { en:"Reels & posts", es:"Reels y posts", ar:"ريلز وبوستات", pt:"Reels e posts", id:"Reels & postingan", fr:"Reels et posts", de:"Reels & Posts", ja:"Reels＆投稿", tr:"Reels ve gönderiler", ru:"Reels и посты", hi:"Reels और पोस्ट", vi:"Reels & bài đăng", th:"Reels & โพสต์", it:"Reels e post", ko:"릴스 & 게시물", fil:"Reels & posts", pl:"Reels i posty", nl:"Reels & posts", zh:"Reels和帖子", uk:"Reels та пости" },
  facebook:       { en:"HD public videos", es:"Videos HD públicos", ar:"فيديوهات HD عامة", pt:"Vídeos HD públicos", id:"Video HD publik", fr:"Vidéos HD publiques", de:"HD-öffentliche Videos", ja:"HD公開動画", tr:"HD genel videolar", ru:"HD публичные видео", hi:"HD सार्वजनिक वीडियो", vi:"Video HD công khai", th:"วิดีโอ HD สาธารณะ", it:"Video HD pubblici", ko:"HD 공개 동영상", fil:"HD public videos", pl:"Publiczne filmy HD", nl:"HD publieke video's", zh:"高清公开视频", uk:"HD публічні відео" },
  twitter:        { en:"Original quality", es:"Calidad original", ar:"الجودة الأصلية", pt:"Qualidade original", id:"Kualitas asli", fr:"Qualité originale", de:"Originalqualität", ja:"オリジナル画質", tr:"Orijinal kalite", ru:"Оригинальное качество", hi:"मूल गुणवत्ता", vi:"Chất lượng gốc", th:"คุณภาพดั้งเดิม", it:"Qualità originale", ko:"원본 화질", fil:"Original na kalidad", pl:"Oryginalna jakość", nl:"Originele kwaliteit", zh:"原始质量", uk:"Оригінальна якість" },
};

/**
 * Build a complete SEO landing page HTML.
 * @param {object} opts
 * @param {object} opts.seoPageData   - entry from SEO_PAGES
 * @param {string} opts.langCode       - e.g. "en"
 * @param {object} opts.L              - full language object from languages.json
 * @param {string} opts.BASE_URL
 * @param {string[]} opts.LANG_CODES
 * @param {object} opts.LANGS          - full LANGS map from languages.json
 * @param {string} opts.DEFAULT_LANG
 * @param {object} opts.slugIndex      - prebuilt slug index
 * @param {string} opts.CSS_BASE       - from server.js (reuse)
 * @returns {string} full HTML
 */
function buildSEOPage(opts) {
  const { seoPageData, langCode, L, BASE_URL, LANG_CODES, LANGS, DEFAULT_LANG, CSS_BASE } = opts;
  const pd = seoPageData;
  const platform = PLATFORMS[pd.platform];

  // ─── Canonical & hreflang ───
  const langPref = langCode === DEFAULT_LANG ? "" : `/${langCode}`;
  const currentSlug = getSlug(langCode, pd.platform);
  const canonical = `${BASE_URL}${langPref}/${currentSlug}`;

  const hreflangs = LANG_CODES.map(code => {
    const ll    = LANGS[code];
    const pref  = code === DEFAULT_LANG ? "" : `/${code}`;
    const slug  = getSlug(code, pd.platform);
    return `<link rel="alternate" hreflang="${ll.hreflang}" href="${BASE_URL}${pref}/${slug}"/>`;
  }).join("\n    ") + `\n    <link rel="alternate" hreflang="x-default" href="${BASE_URL}/${getSlug(DEFAULT_LANG, pd.platform)}"/>`;

  // ─── Nav base ───
  const base = langCode === DEFAULT_LANG ? "" : `/${langCode}`;

  const navHref = (page) => {
    if (page === "index") return base || "/";
    if (page === "howto") return `${base}/how-to-use`;
    return `${base}/${page}`;
  };
  const navLink = (page, label) => `<a href="${navHref(page)}">${label}</a>`;

  const langOptions = LANG_CODES.map(code => {
    const ll   = LANGS[code];
    const pref = code === DEFAULT_LANG ? "" : `/${code}`;
    const slug = getSlug(code, pd.platform);
    const href = `${pref}/${slug}`;
    return `<div class="lo${code === langCode ? " act" : ""}" onclick="location='${href}'">${ll.flag} ${ll.name}</div>`;
  }).join("");

  const NAV = `<nav class="nav">
  <a class="nlogo" href="${base || '/'}"><div class="ni">⬇</div><div class="nt">All<span>In</span>One</div></a>
  <div class="nr">
    <div class="nl">${navLink("index", t(L, "nav_home") || "Home")} ${navLink("howto", t(L, "nav_howto") || "How to Use")} ${navLink("faq", t(L, "nav_faq") || "FAQ")}</div>
    <div class="lw">
      <button class="lb" onclick="document.getElementById('ldd').classList.toggle('op')">${L.flag} ${langCode.toUpperCase()} <svg width="9" height="5" viewBox="0 0 9 5" fill="none"><path d="M1 1l3.5 3L8 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
      <div class="ld" id="ldd">${langOptions}</div>
    </div>
  </div>
</nav>`;

  const FOOTER = `<footer>
  © 2025 All In One Downloader —
  <a href="${base || '/'}">Home</a>
  <a href="${navHref('howto')}">How to Use</a>
  <a href="${navHref('faq')}">FAQ</a>
  ${LANG_CODES.slice(0,6).map(code => {
    const pref = code === DEFAULT_LANG ? "" : `/${code}`;
    const slug = getSlug(code, pd.platform);
    return `<a href="${pref}/${slug}">${LANGS[code].name}</a>`;
  }).join(" ")}
</footer>`;

  // ─── Texts ───
  const title    = t(pd.titles, langCode);
  const desc     = t(pd.descriptions, langCode);
  const h1text   = t(pd.h1s, langCode);
  const introTxt = t(pd.intros, langCode);
  const features = pd.features || [];

  // ─── Structured Data ───
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": h1text,
    "description": desc,
    "url": canonical,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  });

  // ─── Steps section ───
  const stepsHTML = `
<section class="steps-section">
  <h2 class="section-title">${t(SECTION_LABELS.how_it_works, langCode)}</h2>
  <div class="steps-grid">
    <div class="step-card">
      <div class="step-num">1</div>
      <div class="step-body"><h3>${t(SECTION_LABELS.step1_title, langCode)}</h3><p>${t(SECTION_LABELS.step1_desc, langCode)}</p></div>
    </div>
    <div class="step-card">
      <div class="step-num">2</div>
      <div class="step-body"><h3>${t(SECTION_LABELS.step2_title, langCode)}</h3><p>${t(SECTION_LABELS.step2_desc, langCode)}</p></div>
    </div>
    <div class="step-card">
      <div class="step-num">3</div>
      <div class="step-body"><h3>${t(SECTION_LABELS.step3_title, langCode)}</h3><p>${t(SECTION_LABELS.step3_desc, langCode)}</p></div>
    </div>
  </div>
</section>`;

  // ─── Features section ───
  const icons = FEATURE_ICONS[pd.platform] || ["✅","⚡","🔒","📱","♾️","🎯"];
  const featuresHTML = `
<section class="features-section">
  <h2 class="section-title">${t(SECTION_LABELS.key_features, langCode)}</h2>
  <div class="features-grid">
    ${features.map((f, i) => `
    <div class="feature-card">
      <div class="feature-icon">${icons[i] || "✅"}</div>
      <div class="feature-name">${f}</div>
    </div>`).join("")}
  </div>
</section>`;

  // ─── Related tools ───
  const relatedIds = platform.related || [];
  const relatedHTML = `
<section class="related-section">
  <h2 class="section-title">${t(SECTION_LABELS.related_tools, langCode)}</h2>
  <div class="related-grid">
    ${relatedIds.map(relId => {
      const relPlatform = PLATFORMS[relId];
      if (!relPlatform) return "";
      const relSlug = getSlug(langCode, relId);
      const relHref = `${base}/${relSlug}`;
      const relLabel = t(RELATED_LABELS[relId], langCode) || relId;
      const relDesc  = t(RELATED_DESCS[relId], langCode) || "";
      return `<a class="related-card" href="${relHref}">
        <div class="rc-emoji">${relPlatform.emoji}</div>
        <div class="rc-name">${relLabel}</div>
        <div class="rc-desc">${relDesc}</div>
      </a>`;
    }).join("")}
  </div>
</section>`;

  // ─── Download card JS ─── (reuse from main page)
  const dlBase = base || "";
  const CLOSE_DD = `document.addEventListener('click',e=>{if(!e.target.closest('.lw')){const d=document.getElementById('ldd');if(d)d.classList.remove('op');}});`;
  const inputPh  = (L && L.input_ph)  || "Paste video URL here...";
  const pasteTxt = (L && L.paste_btn) || "Paste from clipboard";
  const pastedTxt = (L && L.pasted)   || "Pasted!";
  const typeVideo = (L && L.type_video)|| "Video (MP4)";
  const typeAudio = (L && L.type_audio)|| "Audio (MP3)";
  const continueTxt = (L && L.continue_btn) || "Continue →";
  const fetchingTxt = (L && L.fetching) || "Fetching info";
  const errNoUrl  = (L && L.err_no_url) || "Please paste a video URL first.";
  const errPlat   = (L && L.err_plat)   || "Unsupported platform.";
  const errFetch  = (L && L.err_fetch)  || "Could not fetch video info.";

  // Pre-select MP3 if this is a mp3 page
  const isMP3Page = pd.platform.includes("mp3");
  const videoActClass = isMP3Page ? "" : " act";
  const audioActClass = isMP3Page ? " act" : "";
  const defaultType   = isMP3Page ? "mp3" : "video";

  return `<!DOCTYPE html>
<html lang="${langCode}" dir="${L.dir || 'ltr'}">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title}</title>
<meta name="description" content="${desc}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${canonical}"/>
<meta name="twitter:card" content="summary"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${desc}"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="${canonical}"/>
${hreflangs}
<script type="application/ld+json">${schema}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
${SEO_PAGE_CSS}
</style>
</head>
<body>
<div class="bg"><div class="gd"></div></div>
${NAV}
<main class="seo-page">
  <!-- Hero -->
  <div class="seo-hero">
    <div class="platform-badge" style="background:${platform.bgColor};border-color:${platform.borderColor};color:${platform.color}">
      <span>${platform.emoji}</span> ${h1text.split(" ")[0]}
    </div>
    <div class="seo-badge"><span></span> Free · No Watermark · No Registration</div>
    <h1>${h1text}</h1>
    <p class="seo-intro">${introTxt}</p>
  </div>

  <!-- Download Card -->
  <div class="dl-card">
    <div class="iw">
      <span class="ii"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg></span>
      <input class="ui" id="url" placeholder="${inputPh}" oninput="dP(this.value)" autocomplete="off" spellcheck="false"/>
      <div class="dp" id="dp"></div>
    </div>
    <button class="pb" id="pb" onclick="paste()">
      <svg viewBox="0 0 24 24"><rect x="9" y="2" width="10" height="4" rx="1"/><path d="M9 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-3"/></svg>
      <span id="pbt">${pasteTxt}</span>
    </button>
    <div class="tr">
      <button class="tb${videoActClass}" id="bv" onclick="sT('video')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
        ${typeVideo}
      </button>
      <button class="tb${audioActClass}" id="ba" onclick="sT('mp3')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        ${typeAudio}
      </button>
    </div>
    <button class="fb" id="go" onclick="go()">${continueTxt}</button>
    <div class="em" id="em"></div>
  </div>

  ${stepsHTML}
  ${featuresHTML}
  ${relatedHTML}

  <!-- CTA -->
  <div class="cta-section">
    <h2 class="section-title" style="margin-bottom:8px">Free, Fast &amp; Unlimited</h2>
    <p style="color:var(--mu);font-size:14px;max-width:420px;margin:0 auto">${introTxt}</p>
    <a class="cta-btn" href="${base || '/'}">${t(SECTION_LABELS.start_download, langCode)}</a>
  </div>
</main>
${FOOTER}
<input type="hidden" id="dt" value="${defaultType}"/>
<script>
${CLOSE_DD}
const PL={ym:{k:['music.youtube.com'],l:'YT Music',c:'#ff4d7a'},yt:{k:['youtube.com','youtu.be'],l:'YouTube',c:'#ff6b6b'},fb:{k:['facebook.com','fb.watch'],l:'Facebook',c:'#60a5fa'},tt:{k:['tiktok.com'],l:'TikTok',c:'#e5e5e5'},ig:{k:['instagram.com'],l:'Instagram',c:'#f472b6'},tw:{k:['twitter.com','x.com'],l:'Twitter',c:'#7dd3fc'}};
function dP(u){const d=document.getElementById('dp');for(const p of Object.values(PL)){if(p.k.some(k=>u.includes(k))){d.textContent=p.l;d.className='dp sh';d.style.cssText='display:block;color:'+p.c+';background:'+p.c+'22;border:1px solid '+p.c+'44';return;}}d.className='dp';}
function sT(t){document.getElementById('dt').value=t;document.getElementById('bv').classList.toggle('act',t==='video');document.getElementById('ba').classList.toggle('act',t==='mp3');}
async function paste(){const b=document.getElementById('pb');try{const tx=(await navigator.clipboard.readText()).trim();if(!tx)return;document.getElementById('url').value=tx;dP(tx);b.classList.add('ok');document.getElementById('pbt').textContent='✓ ${pastedTxt}';setTimeout(()=>{b.classList.remove('ok');document.getElementById('pbt').textContent='${pasteTxt}';},2000);}catch{showErr('Allow clipboard');}}
async function go(){const u=document.getElementById('url').value.trim();const tp=document.getElementById('dt').value;const btn=document.getElementById('go');if(!u){showErr('${errNoUrl}');return;}const allK=Object.values(PL).flatMap(p=>p.k);if(!allK.some(k=>u.includes(k))){showErr('${errPlat}');return;}btn.disabled=true;btn.innerHTML='${fetchingTxt} <span class="dots"><span></span><span></span><span></span></span>';document.getElementById('em').classList.remove('sh');try{const r=await fetch('/fetch-info?url='+encodeURIComponent(u));if(!r.ok)throw 0;const d=await r.json();sessionStorage.setItem('vInfo',JSON.stringify({...d,url:u,type:tp,lang:'${langCode}',base:'${dlBase}'}));window.location='${dlBase}/download';}catch{btn.disabled=false;btn.textContent='${continueTxt}';showErr('${errFetch}');}}
function showErr(m){const e=document.getElementById('em');e.textContent=m;e.classList.add('sh');}
</script>
</body>
</html>`;
}

module.exports = { buildSEOPage };
