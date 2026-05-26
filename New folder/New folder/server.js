const express = require("express");
const { spawn } = require("child_process");
const https   = require("https");
const http    = require("http");
const fs      = require("fs");
const path    = require("path");

/* ─────────────────────────────────────────────────
   SEO UPGRADE — load programmatic SEO modules
   These three require()s are the ONLY additions
   to the original file header.
───────────────────────────────────────────────── */
const { createSEORouter, getAllSEOUrls } = require("./seo-routes");
const {
    buildCoreSitemap,
    buildSEOSitemap,
    buildSitemapIndex,
    buildRobotsTxt,
} = require("./sitemap-builder");

const app = express();

/* ================= CONFIG ================= */
const FFMPEG   = "C:\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe";
const BASE_URL = "https://yourdomain.com"; // ← غيّر للدومين بتاعك
const __dir    = __dirname;

/* ================= LOAD LANGUAGES ================= */
let LANGS = {};
try {
    LANGS = JSON.parse(fs.readFileSync(path.join(__dir, "languages.json"), "utf8"));
} catch (e) {
    console.error("❌ languages.json not found:", e.message);
    process.exit(1);
}
const LANG_CODES   = Object.keys(LANGS);
const DEFAULT_LANG = "en";

/* ================= PROGRESS & CACHE ================= */
const progressMap    = new Map();
const sizeCacheMap   = new Map();
const downloadProgress = new Map();

/* ================= HELPERS ================= */
function getPlatform(url) {
    if (url.includes("music.youtube.com"))                        return "youtube_music";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("facebook.com") || url.includes("fb.watch"))return "facebook";
    if (url.includes("tiktok.com"))                              return "tiktok";
    if (url.includes("instagram.com"))                           return "instagram";
    if (url.includes("twitter.com") || url.includes("x.com"))   return "twitter";
    return "other";
}
const isYT   = p => p === "youtube" || p === "youtube_music";
const NO1080 = ["tiktok","instagram","twitter"];

function safeTitle(name) {
    return (name || "video").replace(/[\r\n"<>:|?*\\/]/g,"").trim().slice(0,120) || "video";
}

function ytArgs(platform) {
    const a = ["--no-playlist","--no-warnings"];
    if (isYT(platform)) a.push("--js-runtime","node");
    return a;
}

function videoFormat(platform, quality) {
    if (isYT(platform)) {
        if (quality && quality !== "best") {
            return [
                `bestvideo[vcodec^=avc1][height<=${quality}][ext=mp4]+bestaudio[ext=m4a]`,
                `bestvideo[vcodec^=avc1][height<=${quality}]+bestaudio`,
                `bestvideo[height<=${quality}]+bestaudio`,
                `best[height<=${quality}]`,
                "bestvideo[vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]",
                "best"
            ].join("/");
        }
        return ["bestvideo[vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]","bestvideo[vcodec^=avc1]+bestaudio","bestvideo+bestaudio","best"].join("/");
    }
    if (platform === "facebook")  return "best[ext=mp4][protocol!=dash]/best[ext=mp4]/best";
    if (platform === "tiktok" || platform === "instagram") return "best[vcodec!=none][acodec!=none][ext=mp4]/best[vcodec!=none][acodec!=none]/best";
    return "best[ext=mp4]/best";
}

function parseProgress(line, id) {
    const m = line.match(/\[download\]\s+([\d.]+)%\s+of[\s~]+([\d.]+\S+)\s+at\s+([\d.]+\S+)\s+ETA\s+(\S+)/);
    if (m) progressMap.set(id, { percent: parseFloat(m[1]), total: m[2], speed: m[3], eta: m[4], done: false });
}

function detectBrowserLang(req) {
    const accept = req.headers["accept-language"] || "";
    for (const part of accept.split(",")) {
        const tag  = part.split(";")[0].trim().toLowerCase();
        const base = tag.split("-")[0];
        if (LANG_CODES.includes(tag))  return tag;
        if (LANG_CODES.includes(base)) return base;
    }
    return DEFAULT_LANG;
}

/* ================= BUILD PAGE (unchanged — original code) ================= */
function buildPage(langCode, page) {
    const L   = LANGS[langCode] || LANGS[DEFAULT_LANG];
    const base = langCode === DEFAULT_LANG ? "" : `/${langCode}`;
    const hreflangs = LANG_CODES.map(code => {
        const l    = LANGS[code];
        const pref = code === DEFAULT_LANG ? "" : `/${code}`;
        const slug = page === "index" ? "" : page === "howto" ? "/how-to-use" : `/${page}`;
        return `<link rel="alternate" hreflang="${l.hreflang}" href="${BASE_URL}${pref}${slug}"/>`;
    }).join("\n    ") + `\n    <link rel="alternate" hreflang="x-default" href="${BASE_URL}/"/>`;
    const canonical = (() => {
        const pref = langCode === DEFAULT_LANG ? "" : `/${langCode}`;
        const slug = page === "index" ? "" : page === "howto" ? "/how-to-use" : `/${page}`;
        return `${BASE_URL}${pref}${slug}`;
    })();
    const navHref = (targetPage) => {
        const slug = targetPage === "index" ? "" : targetPage === "howto" ? "/how-to-use" : `/${targetPage}`;
        return `${base}${slug || "/"}`;
    };
    const navLink = (targetPage, label) =>
        `<a href="${navHref(targetPage)}"${page===targetPage?' class="active"':''}>${label}</a>`;
    const langOptions = LANG_CODES.map(code => {
        const l    = LANGS[code];
        const pref = code === DEFAULT_LANG ? "" : `/${code}`;
        const slug = page === "index" ? "/" : page === "howto" ? "/how-to-use" : `/${page}`;
        const href = `${pref}${slug}`;
        return `<div class="lo${code===langCode?' act':''}" onclick="location='${href || "/"}'"><span>${l.flag}</span> ${l.name}</div>`;
    }).join("");
    const NAV = `<nav class="nav">
  <a class="nlogo" href="${base || '/'}"><div class="ni">⬇</div><div class="nt">All<span>In</span>One</div></a>
  <div class="nr">
    <div class="nl">${navLink("index",L.nav_home)} ${navLink("howto",L.nav_howto)} ${navLink("faq",L.nav_faq)}</div>
    <div class="lw">
      <button class="lb" onclick="document.getElementById('ldd').classList.toggle('op')">${L.flag} ${langCode.toUpperCase()} <svg width="9" height="5" viewBox="0 0 9 5" fill="none"><path d="M1 1l3.5 3L8 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
      <div class="ld" id="ldd">${langOptions}</div>
    </div>
  </div>
</nav>`;
    const FOOTER = `<footer>© 2025 All In One Downloader — <a href="${navHref('index')}">${L.nav_home}</a> <a href="${navHref('howto')}">${L.nav_howto}</a> <a href="${navHref('faq')}">${L.nav_faq}</a></footer>`;
    const CSS_BASE = `:root{--bg:#020408;--card:rgba(255,255,255,.035);--br:rgba(255,255,255,.08);--tx:#f0f4ff;--mu:rgba(240,244,255,.45);--ac:#4f8eff;--a2:#a259ff;--gr:#22d3a5;--rd:#ff6b6b;}*{margin:0;padding:0;box-sizing:border-box;}body{background:var(--bg);color:var(--tx);font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden;}.bg{position:fixed;inset:0;z-index:0;overflow:hidden;}.bg::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 20% 10%,rgba(79,142,255,.12) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 80%,rgba(162,89,255,.1) 0%,transparent 60%);}.gd{position:absolute;inset:0;background-image:linear-gradient(rgba(79,142,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,255,.04) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 100% 100% at 50% 50%,black 30%,transparent 80%);}.grad{background:linear-gradient(90deg,var(--ac),var(--a2),var(--gr));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}footer{position:relative;z-index:1;text-align:center;padding:18px;color:rgba(255,255,255,.15);font-size:12px;border-top:1px solid var(--br);}footer a{color:rgba(255,255,255,.25);text-decoration:none;margin:0 7px;}.nav{position:fixed;top:0;left:0;right:0;z-index:200;padding:11px 18px;display:flex;align-items:center;justify-content:space-between;background:rgba(2,4,8,.92);backdrop-filter:blur(20px);border-bottom:1px solid var(--br);}.nlogo{display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--tx);}.ni{width:29px;height:29px;border-radius:8px;background:linear-gradient(135deg,var(--ac),var(--a2));display:flex;align-items:center;justify-content:center;font-size:13px;}.nt{font-family:'Syne',sans-serif;font-weight:800;font-size:15px;}.nt span{color:var(--ac);}.nr{display:flex;align-items:center;gap:13px;}.nl{display:flex;gap:17px;}.nl a{color:var(--mu);font-size:13px;text-decoration:none;transition:color .2s;}.nl a:hover,.nl a.active{color:var(--tx);}.lw{position:relative;}.lb{display:flex;align-items:center;gap:5px;padding:6px 10px;background:rgba(255,255,255,.05);border:1px solid var(--br);border-radius:20px;color:rgba(240,244,255,.6);font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;}.lb:hover{border-color:rgba(255,255,255,.15);color:var(--tx);}.ld{position:absolute;top:calc(100% + 7px);right:0;width:185px;background:#0d1320;border:1px solid var(--br);border-radius:13px;padding:5px;z-index:300;display:none;box-shadow:0 20px 60px rgba(0,0,0,.6);max-height:310px;overflow-y:auto;}.ld.op{display:block;}.ld::-webkit-scrollbar{width:3px;}.ld::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:3px;}.lo{padding:8px 10px;border-radius:8px;cursor:pointer;font-size:13px;color:var(--mu);transition:all .15s;display:flex;align-items:center;gap:8px;}.lo:hover{background:rgba(255,255,255,.05);color:var(--tx);}.lo.act{background:rgba(79,142,255,.1);color:var(--ac);}@media(max-width:520px){.nl{display:none;}}@keyframes fD{from{opacity:0;transform:translateY(-13px);}to{opacity:1;transform:translateY(0);}}@keyframes fU{from{opacity:0;transform:translateY(13px);}to{opacity:1;transform:translateY(0);}}@keyframes bk{0%,100%{opacity:1;}50%{opacity:.3;}}`;
    const CLOSE_DD = `document.addEventListener('click',e=>{if(!e.target.closest('.lw')){const d=document.getElementById('ldd');if(d)d.classList.remove('op');}});`;

    if (page === "index") {
        return `<!DOCTYPE html>
<html lang="${langCode}" dir="${L.dir}">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${L.h1} | All In One Downloader</title>
<meta name="description" content="${L.hero_sub}"/>
<meta property="og:title" content="${L.h1} | All In One Downloader"/>
<meta property="og:type" content="website"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="${canonical}"/>
${hreflangs}
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"All In One Downloader","url":"${BASE_URL}","applicationCategory":"MultimediaApplication","operatingSystem":"Any","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
${CSS_BASE}
.pg{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:96px 20px 56px;}
.lbig{display:flex;align-items:center;gap:10px;margin-bottom:22px;animation:fD .7s cubic-bezier(.16,1,.3,1) both;}
.libig{width:46px;height:46px;border-radius:13px;background:linear-gradient(135deg,var(--ac),var(--a2));display:flex;align-items:center;justify-content:center;font-size:21px;box-shadow:0 0 30px rgba(79,142,255,.4);}
.ltbig{font-family:'Syne',sans-serif;font-weight:800;font-size:24px;letter-spacing:-1px;}
.ltbig span{color:var(--ac);}
.hero{text-align:center;margin-bottom:22px;animation:fD .7s cubic-bezier(.16,1,.3,1) .1s both;}
.hbadge{display:inline-flex;align-items:center;gap:6px;padding:5px 13px;border-radius:50px;background:rgba(79,142,255,.1);border:1px solid rgba(79,142,255,.25);font-size:12px;color:var(--ac);font-weight:500;margin-bottom:11px;}
.hbadge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--gr);animation:bk 2s infinite;}
h1{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(21px,3.5vw,38px);line-height:1.1;letter-spacing:-1px;margin-bottom:9px;}
.hsub{font-size:14px;color:var(--mu);font-weight:300;max-width:380px;margin:0 auto;}
.plats{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;}
.plat{display:flex;align-items:center;gap:6px;padding:5px 11px;border-radius:50px;font-size:11px;font-weight:500;border:1px solid;transition:transform .2s;cursor:default;}
.plat svg{width:12px;height:12px;display:block;flex-shrink:0;}
.plat:hover{transform:translateY(-2px);}
.pyt{background:rgba(255,0,0,.08);border-color:rgba(255,0,0,.2);color:#ff6b6b;}
.pytm{background:rgba(255,0,60,.08);border-color:rgba(255,0,60,.2);color:#ff4d7a;}
.pfb{background:rgba(24,119,242,.08);border-color:rgba(24,119,242,.2);color:#60a5fa;}
.ptt{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);color:#e5e5e5;}
.pig{background:rgba(200,55,170,.08);border-color:rgba(200,55,170,.2);color:#f472b6;}
.ptw{background:rgba(29,161,242,.08);border-color:rgba(29,161,242,.2);color:#7dd3fc;}
.card{width:100%;max-width:510px;background:var(--card);border:1px solid var(--br);border-radius:21px;padding:24px;backdrop-filter:blur(30px);box-shadow:0 30px 80px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.06);position:relative;overflow:hidden;animation:fU .7s cubic-bezier(.16,1,.3,1) .2s both;}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(79,142,255,.5),rgba(162,89,255,.5),transparent);}
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
.fb{width:100%;padding:13px;border:none;border-radius:11px;background:linear-gradient(135deg,var(--ac),var(--a2));color:white;font-size:14px;font-weight:600;font-family:'Syne',sans-serif;cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s;position:relative;overflow:hidden;}
.fb::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.1),transparent);}
.fb:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(79,142,255,.35);}
.fb:active{transform:scale(.98);}
.fb:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.dots{display:inline-flex;gap:4px;vertical-align:middle;}
.dots span{width:4px;height:4px;border-radius:50%;background:white;animation:dot 1.2s infinite;}
.dots span:nth-child(2){animation-delay:.2s;}.dots span:nth-child(3){animation-delay:.4s;}
@keyframes dot{0%,80%,100%{transform:scale(0);opacity:.3;}40%{transform:scale(1);opacity:1;}}
.em{margin-top:9px;padding:9px 12px;border-radius:9px;background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.2);color:var(--rd);font-size:13px;text-align:center;display:none;}
.em.sh{display:block;}
.feats{display:flex;gap:14px;margin-top:20px;animation:fU .7s cubic-bezier(.16,1,.3,1) .4s both;}
.feat{text-align:center;color:var(--mu);font-size:12px;}
.fi{font-size:15px;margin-bottom:3px;}
@media(max-width:460px){.card{padding:16px;}h1{font-size:19px;}.feats{gap:9px;}}
</style>
</head>
<body>
<div class="bg"><div class="gd"></div></div>
${NAV}
<main class="pg">
  <div class="lbig"><div class="libig">⬇</div><div class="ltbig">All<span>In</span>One</div></div>
  <div class="hero">
    <div class="hbadge"><span></span> ${L.badge}</div>
    <h1>${L.h1}</h1>
    <p class="hsub">${L.hero_sub}</p>
  </div>
  <div class="plats">
    <div class="plat pyt"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-2.7A12.94 12.94 0 0012 3.5a12.94 12.94 0 00-3.82.49A4.83 4.83 0 014.41 6.69 11.46 11.46 0 003 12a11.46 11.46 0 001.41 5.31 4.83 4.83 0 003.77 2.7A12.94 12.94 0 0012 20.5a12.94 12.94 0 003.82-.49 4.83 4.83 0 003.77-2.7A11.46 11.46 0 0021 12a11.46 11.46 0 00-1.41-5.31zM10 15.5v-7l6 3.5z"/></svg>YouTube</div>
    <div class="plat pytm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="currentColor" stroke="none"/><circle cx="18" cy="16" r="3" fill="currentColor" stroke="none"/></svg>YT Music</div>
    <div class="plat pfb"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>Facebook</div>
    <div class="plat ptt"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-2.7V3h-3.45v13a2.92 2.92 0 01-5.86 0 2.92 2.92 0 012.93-2.92c.28 0 .54.04.79.1V9.23a6.37 6.37 0 00-.79-.05 6.37 6.37 0 000 12.74 6.37 6.37 0 006.37-6.37V9.38a8.15 8.15 0 004.77 1.52V7.45a4.85 4.85 0 01-2.99-.76z"/></svg>TikTok</div>
    <div class="plat pig"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>Instagram</div>
    <div class="plat ptw"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>Twitter</div>
  </div>
  <div class="card">
    <div class="iw">
      <span class="ii"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg></span>
      <input class="ui" id="url" placeholder="${L.input_ph}" oninput="dP(this.value)" autocomplete="off" spellcheck="false"/>
      <div class="dp" id="dp"></div>
    </div>
    <button class="pb" id="pb" onclick="paste()">
      <svg viewBox="0 0 24 24"><rect x="9" y="2" width="10" height="4" rx="1"/><path d="M9 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-3"/></svg>
      <span id="pbt">${L.paste_btn}</span>
    </button>
    <div class="tr">
      <button class="tb act" id="bv" onclick="sT('video')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
        ${L.type_video}
      </button>
      <button class="tb" id="ba" onclick="sT('mp3')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        ${L.type_audio}
      </button>
    </div>
    <button class="fb" id="go" onclick="go()">${L.continue_btn}</button>
    <div class="em" id="em"></div>
  </div>
  <div class="feats">
    <div class="feat"><div class="fi">⚡</div>${L.feat1}</div>
    <div class="feat"><div class="fi">🔒</div>${L.feat2}</div>
    <div class="feat"><div class="fi">🎯</div>${L.feat3}</div>
    <div class="feat"><div class="fi">📱</div>${L.feat4}</div>
  </div>
</main>
${FOOTER}
<input type="hidden" id="dt" value="video"/>
<script>
${CLOSE_DD}
const PL={ym:{k:['music.youtube.com'],l:'YT Music',c:'#ff4d7a'},yt:{k:['youtube.com','youtu.be'],l:'YouTube',c:'#ff6b6b'},fb:{k:['facebook.com','fb.watch'],l:'Facebook',c:'#60a5fa'},tt:{k:['tiktok.com'],l:'TikTok',c:'#e5e5e5'},ig:{k:['instagram.com'],l:'Instagram',c:'#f472b6'},tw:{k:['twitter.com','x.com'],l:'Twitter',c:'#7dd3fc'}};
function dP(u){const d=document.getElementById('dp');for(const p of Object.values(PL)){if(p.k.some(k=>u.includes(k))){d.textContent=p.l;d.className='dp sh';d.style.cssText='display:block;color:'+p.c+';background:'+p.c+'22;border:1px solid '+p.c+'44';return;}}d.className='dp';}
function sT(t){document.getElementById('dt').value=t;document.getElementById('bv').classList.toggle('act',t==='video');document.getElementById('ba').classList.toggle('act',t==='mp3');}
async function paste(){const b=document.getElementById('pb');try{const tx=(await navigator.clipboard.readText()).trim();if(!tx)return;document.getElementById('url').value=tx;dP(tx);b.classList.add('ok');document.getElementById('pbt').textContent='✓ ${L.pasted}';setTimeout(()=>{b.classList.remove('ok');document.getElementById('pbt').textContent='${L.paste_btn}';},2000);}catch{showErr('Allow clipboard');}}
async function go(){const u=document.getElementById('url').value.trim();const tp=document.getElementById('dt').value;const btn=document.getElementById('go');if(!u){showErr('${L.err_no_url}');return;}const allK=Object.values(PL).flatMap(p=>p.k);if(!allK.some(k=>u.includes(k))){showErr('${L.err_plat}');return;}btn.disabled=true;btn.innerHTML='${L.fetching} <span class="dots"><span></span><span></span><span></span></span>';document.getElementById('em').classList.remove('sh');try{const r=await fetch('/fetch-info?url='+encodeURIComponent(u));if(!r.ok)throw 0;const d=await r.json();sessionStorage.setItem('vInfo',JSON.stringify({...d,url:u,type:tp,lang:'${langCode}',base:'${base}'}));window.location='${base}/download';}catch{btn.disabled=false;btn.textContent='${L.continue_btn}';showErr('${L.err_fetch}');}}
function showErr(m){const e=document.getElementById('em');e.textContent=m;e.classList.add('sh');}
</script>
</body>
</html>`;
    }

    /* ── HOW TO USE (unchanged) ── */
    if (page === "howto") {
        return `<!DOCTYPE html>
<html lang="${langCode}" dir="${L.dir}">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${L.howto_title} | All In One Downloader</title>
<meta name="description" content="${L.howto_sub}"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="${canonical}"/>
${hreflangs}
<script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"${L.howto_title}","description":"${L.howto_sub}","totalTime":"PT1M","estimatedCost":{"@type":"MonetaryAmount","currency":"USD","value":"0"},"step":[{"@type":"HowToStep","position":1,"name":"${L.howto_step1_title}","text":"${L.howto_step1}"},{"@type":"HowToStep","position":2,"name":"${L.howto_step2_title}","text":"${L.howto_step2}"},{"@type":"HowToStep","position":3,"name":"${L.howto_step3_title}","text":"${L.howto_step3}"},{"@type":"HowToStep","position":4,"name":"${L.howto_step4_title}","text":"${L.howto_step4}"}]}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
${CSS_BASE}
.wr{position:relative;z-index:1;max-width:760px;margin:0 auto;padding:96px 22px 56px;}
.ph{text-align:center;margin-bottom:44px;}
.badge{display:inline-flex;align-items:center;gap:6px;padding:4px 13px;border-radius:50px;background:rgba(79,142,255,.1);border:1px solid rgba(79,142,255,.25);font-size:12px;color:var(--ac);font-weight:500;margin-bottom:13px;}
h1{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(21px,4vw,36px);line-height:1.1;letter-spacing:-1px;margin-bottom:10px;}
.sub{font-size:14px;color:var(--mu);max-width:460px;margin:0 auto;}
.steps{display:flex;flex-direction:column;gap:12px;margin-bottom:44px;}
.step{display:flex;gap:14px;padding:18px;background:var(--card);border:1px solid var(--br);border-radius:14px;}
.sn{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,var(--ac),var(--a2));display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:14px;flex-shrink:0;}
.sb h3{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;margin-bottom:4px;}
.sb p{color:var(--mu);font-size:13px;}
h2{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(17px,3vw,24px);letter-spacing:-.5px;margin-bottom:14px;}
.pg{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:44px;}
.pc{padding:15px;background:var(--card);border:1px solid var(--br);border-radius:13px;}
.pn{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;margin-bottom:4px;}
.pd{font-size:12px;color:var(--mu);line-height:1.5;}
.cta{text-align:center;padding:36px 22px;background:var(--card);border:1px solid var(--br);border-radius:20px;position:relative;overflow:hidden;}
.cta::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(79,142,255,.5),transparent);}
.cb{display:inline-block;padding:12px 26px;border-radius:11px;background:linear-gradient(135deg,var(--ac),var(--a2));color:white;font-size:14px;font-weight:600;font-family:'Syne',sans-serif;text-decoration:none;margin-top:13px;}
@media(max-width:540px){.step{flex-direction:column;}.wr{padding:78px 15px 38px;}}
</style>
</head>
<body>
<div class="bg"><div class="gd"></div></div>
${NAV}
<div class="wr">
  <div class="ph"><div class="badge">📖</div><h1>${L.howto_title}</h1><p class="sub">${L.howto_sub}</p></div>
  <div class="steps">
    <div class="step"><div class="sn">1</div><div class="sb"><h3>${L.howto_step1_title}</h3><p>${L.howto_step1}</p></div></div>
    <div class="step"><div class="sn">2</div><div class="sb"><h3>${L.howto_step2_title}</h3><p>${L.howto_step2}</p></div></div>
    <div class="step"><div class="sn">3</div><div class="sb"><h3>${L.howto_step3_title}</h3><p>${L.howto_step3}</p></div></div>
    <div class="step"><div class="sn">4</div><div class="sb"><h3>${L.howto_step4_title}</h3><p>${L.howto_step4}</p></div></div>
  </div>
  <h2>Supported Platforms</h2>
  <div class="pg">
    <div class="pc"><div class="pn" style="color:#ff6b6b">▶ YouTube & YT Music</div><div class="pd">Download videos up to 1080p HD. Supports MP4, MP3 and YouTube Shorts.</div></div>
    <div class="pc"><div class="pn" style="color:#e5e5e5">♪ TikTok</div><div class="pd">Save TikTok videos without watermark. Download video or extract MP3 audio.</div></div>
    <div class="pc"><div class="pn" style="color:#f472b6">◉ Instagram</div><div class="pd">Download Instagram Reels and posts directly to your device.</div></div>
    <div class="pc"><div class="pn" style="color:#60a5fa">f Facebook</div><div class="pd">Download Facebook videos in HD. Supports public posts and reels.</div></div>
    <div class="pc"><div class="pn" style="color:#7dd3fc">𝕏 Twitter / X</div><div class="pd">Save Twitter and X videos in original quality.</div></div>
  </div>
  <div class="cta">
    <h2>${L.nav_dl}</h2>
    <p style="color:var(--mu);font-size:14px;">${L.hero_sub}</p>
    <a class="cb" href="${base || '/'}">${L.nav_dl}</a>
  </div>
</div>
${FOOTER}
<script>${CLOSE_DD}</script>
</body>
</html>`;
    }

    /* ── FAQ (unchanged) ── */
    if (page === "faq") {
        const schema = JSON.stringify({
            "@context":"https://schema.org","@type":"FAQPage",
            "mainEntity": (L.faqs||[]).map(f=>({
                "@type":"Question","name":f.q,
                "acceptedAnswer":{"@type":"Answer","text":f.a}
            }))
        });
        const items = (L.faqs||[]).map(f => `
<div class="fi"><button class="fq" onclick="tog(this)">${f.q}<span class="fic">+</span></button><div class="fa">${f.a}</div></div>`).join('');

        return `<!DOCTYPE html>
<html lang="${langCode}" dir="${L.dir}">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${L.faq_title} | All In One Downloader</title>
<meta name="description" content="${L.faq_sub}"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="${canonical}"/>
${hreflangs}
<script type="application/ld+json">${schema}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
${CSS_BASE}
.wr{position:relative;z-index:1;max-width:720px;margin:0 auto;padding:96px 22px 56px;}
.ph{text-align:center;margin-bottom:40px;}
.badge{display:inline-flex;align-items:center;gap:6px;padding:4px 13px;border-radius:50px;background:rgba(79,142,255,.1);border:1px solid rgba(79,142,255,.25);font-size:12px;color:var(--ac);font-weight:500;margin-bottom:12px;}
h1{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(19px,4vw,34px);line-height:1.1;letter-spacing:-1px;margin-bottom:9px;}
.sub{font-size:14px;color:var(--mu);max-width:420px;margin:0 auto;}
.fl{display:flex;flex-direction:column;gap:9px;margin-bottom:44px;}
.fi{background:var(--card);border:1px solid var(--br);border-radius:13px;overflow:hidden;transition:border-color .2s;}
.fi.op{border-color:rgba(79,142,255,.25);}
.fq{width:100%;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;background:transparent;border:none;color:var(--tx);font-size:14px;font-weight:600;font-family:'Syne',sans-serif;cursor:pointer;text-align:left;}
.fq:hover{background:rgba(255,255,255,.02);}
.fic{width:22px;height:22px;border-radius:7px;flex-shrink:0;background:rgba(79,142,255,.1);border:1px solid rgba(79,142,255,.18);display:flex;align-items:center;justify-content:center;transition:transform .3s;color:var(--ac);font-size:14px;}
.fi.op .fic{transform:rotate(45deg);}
.fa{max-height:0;overflow:hidden;transition:max-height .35s ease,padding .35s ease;padding:0 18px;color:var(--mu);font-size:13px;line-height:1.7;}
.fi.op .fa{max-height:200px;padding:0 18px 16px;}
h2{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(16px,3vw,24px);letter-spacing:-.5px;margin-bottom:11px;}
.cta{text-align:center;padding:36px 22px;background:var(--card);border:1px solid var(--br);border-radius:20px;position:relative;overflow:hidden;}
.cta::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(79,142,255,.5),transparent);}
.cb{display:inline-block;padding:12px 26px;border-radius:11px;background:linear-gradient(135deg,var(--ac),var(--a2));color:white;font-size:14px;font-weight:600;font-family:'Syne',sans-serif;text-decoration:none;margin-top:12px;}
@media(max-width:540px){.wr{padding:78px 15px 38px;}.fq{font-size:13px;padding:13px 15px;}.fa,.fi.op .fa{padding-left:15px;padding-right:15px;}}
</style>
</head>
<body>
<div class="bg"><div class="gd"></div></div>
${NAV}
<div class="wr">
  <div class="ph"><div class="badge">❓ FAQ</div><h1>${L.faq_title}</h1><p class="sub">${L.faq_sub}</p></div>
  <div class="fl">${items}</div>
  <div class="cta">
    <h2>${L.nav_dl}</h2>
    <p style="color:var(--mu);font-size:14px;">${L.hero_sub}</p>
    <a class="cb" href="${base || '/'}">${L.nav_dl}</a>
  </div>
</div>
${FOOTER}
<script>
${CLOSE_DD}
function tog(btn){const i=btn.closest('.fi');const o=i.classList.contains('op');document.querySelectorAll('.fi.op').forEach(e=>e.classList.remove('op'));if(!o)i.classList.add('op');}
</script>
</body>
</html>`;
    }
    return "<h1>404</h1>";
}

/* ================= STATIC FILES ================= */
app.use(express.static(__dir, { index: false }));

/* ─────────────────────────────────────────────────
   SEO UPGRADE — mount programmatic SEO router
   MUST come BEFORE the generic /:lang/* routes so
   that /fr/telecharger-video-youtube is matched by
   the SEO router, not the lang-404 fallback.
   The router internally guards with SLUG_INDEX so
   it never intercepts /fr/, /fr/faq, /fr/download.
───────────────────────────────────────────────── */
app.use(createSEORouter(LANGS, LANG_CODES, DEFAULT_LANG, BASE_URL));

/* ─────────────────────────────────────────────────
   SEO UPGRADE — Sitemap index  /sitemap.xml
   Replaces the original single-file sitemap with
   a proper sitemap index pointing to two sitemaps.
   Original /sitemap.xml behaviour is preserved at
   /sitemap-core.xml for backward compatibility.
───────────────────────────────────────────────── */
app.get("/sitemap.xml", (req, res) => {
    res.setHeader("Content-Type", "application/xml");
    res.send(buildSitemapIndex(BASE_URL));
});

/* Core pages sitemap (what the original /sitemap.xml generated) */
app.get("/sitemap-core.xml", (req, res) => {
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(buildCoreSitemap(LANG_CODES, DEFAULT_LANG, BASE_URL, LANGS));
});

/* SEO pages sitemap — all 8 platforms × 20 languages = 160 URLs */
app.get("/sitemap-seo.xml", (req, res) => {
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(buildSEOSitemap(LANG_CODES, DEFAULT_LANG, BASE_URL, LANGS));
});

/* ─────────────────────────────────────────────────
   SEO UPGRADE — robots.txt
   Adds sitemap index and blocks internal API paths.
   Backward-compatible: same Disallow rules as before.
───────────────────────────────────────────────── */
app.get("/robots.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.send(buildRobotsTxt(BASE_URL));
});

/* ================= ROOT (unchanged) ================= */
app.get("/", (req, res) => {
    const lang = detectBrowserLang(req);
    if (lang !== DEFAULT_LANG) return res.redirect(302, `/${lang}/`);
    res.send(buildPage(DEFAULT_LANG, "index"));
});

/* ================= EN ROUTES (unchanged) ================= */
app.get("/how-to-use", (req, res) => res.send(buildPage(DEFAULT_LANG, "howto")));
app.get("/faq",        (req, res) => res.send(buildPage(DEFAULT_LANG, "faq")));
app.get("/download",   (req, res) => res.sendFile(path.join(__dir, "download.html")));
app.get("/thanks",     (req, res) => res.sendFile(path.join(__dir, "thanks.html")));

/* ================= LANG ROUTES (unchanged) ================= */
app.get("/:lang", (req, res, next) => {
    const code = req.params.lang;
    if (!LANG_CODES.includes(code)) return next();
    if (req.path.endsWith("/")) {
        return res.send(buildPage(code, "index"));
    }
    res.redirect(301, `/${code}/`);
});

app.get("/:lang/", (req, res, next) => {
    const code = req.params.lang;
    if (!LANG_CODES.includes(code)) return next();
    res.send(buildPage(code, "index"));
});

app.get("/:lang/how-to-use", (req, res, next) => {
    const code = req.params.lang;
    if (!LANG_CODES.includes(code)) return next();
    res.send(buildPage(code, "howto"));
});

app.get("/:lang/faq", (req, res, next) => {
    const code = req.params.lang;
    if (!LANG_CODES.includes(code)) return next();
    res.send(buildPage(code, "faq"));
});

app.get("/:lang/download", (req, res, next) => {
    const code = req.params.lang;
    if (!LANG_CODES.includes(code)) return next();
    res.sendFile(path.join(__dir, "download.html"));
});

app.get("/:lang/thanks", (req, res, next) => {
    const code = req.params.lang;
    if (!LANG_CODES.includes(code)) return next();
    res.sendFile(path.join(__dir, "thanks.html"));
});

/* ================= API: fetch-info (unchanged) ================= */
app.get("/fetch-info", (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error:"No URL" });
    const p = getPlatform(url);
    const proc = spawn("yt-dlp", [...ytArgs(p), "--dump-json", url]);
    let out = "", timer;
    proc.stdout.on("data", d => out += d);
    proc.stderr.on("data", d => process.stdout.write(d.toString()));
    timer = setTimeout(() => { try{proc.kill();}catch{} if(!res.headersSent) res.status(504).json({error:"Timeout"}); }, 25000);
    proc.on("close", code => {
        clearTimeout(timer); if (res.headersSent) return;
        if (code !== 0 || !out.trim()) return res.status(500).json({ error: "Fetch failed" });
        try {
            const info = JSON.parse(out.trim().split("\n")[0]);
            let thumb = info.thumbnail || (info.thumbnails?.length ? info.thumbnails[info.thumbnails.length-1].url : null);
            if (p === "instagram" && thumb) thumb = "/thumb-proxy?url=" + encodeURIComponent(thumb);
            res.json({ title: info.title||"video", thumbnail: thumb,
                duration: info.duration_string || (info.duration ? `${Math.floor(info.duration/60)}:${String(info.duration%60).padStart(2,"0")}` : null),
                uploader: info.uploader || info.channel || null,
                platform: p, has1080: !NO1080.includes(p), isMusic: p === "youtube_music" });
        } catch { res.status(500).json({ error:"Parse error" }); }
    });
    proc.on("error", () => { clearTimeout(timer); if (!res.headersSent) res.status(500).json({error:"yt-dlp error"}); });
});

/* ================= API: thumb-proxy (unchanged) ================= */
app.get("/thumb-proxy", (req, res) => {
    const { url } = req.query; if (!url) return res.status(400).send("No URL");
    const lib = url.startsWith("https") ? https : http;
    lib.get(url, { headers: { "User-Agent":"Mozilla/5.0", "Referer":"https://www.instagram.com/" } }, r => {
        res.setHeader("Content-Type", r.headers["content-type"] || "image/jpeg");
        res.setHeader("Cache-Control", "public, max-age=3600");
        r.pipe(res);
    }).on("error", () => res.status(500).send("Proxy error"));
});

/* ================= API: get-size (unchanged) ================= */
app.get("/get-size", (req, res) => {
    const { url, type="video", quality } = req.query; if (!url) return res.status(400).json({error:"No URL"});
    const cacheKey = `${type}::${quality || "best"}::${url}`;
    const cached = sizeCacheMap.get(cacheKey);
    if (cached) return res.json(cached);
    const p = getPlatform(url);
    const fmt = type === "mp3" ? "bestaudio/best" : videoFormat(p, quality);
    const proc = spawn("yt-dlp", [...ytArgs(p), "-f", fmt, "--print", "%(filesize,filesize_approx)s", url]);
    let out = "", timer;
    proc.stdout.on("data", d => out += d);
    timer = setTimeout(() => { try{proc.kill();}catch{} if (!res.headersSent) res.json({size:null,bytes:null}); }, 20000);
    proc.on("close", () => {
        clearTimeout(timer); if (res.headersSent) return;
        const b = parseInt(out.trim().split("\n")[0]);
        if (!b || isNaN(b)) return res.json({ size: null, bytes: null });
        let s; if (b>=1073741824) s=(b/1073741824).toFixed(2)+" GB"; else if (b>=1048576) s=(b/1048576).toFixed(1)+" MB"; else if (b>=1024) s=(b/1024).toFixed(0)+" KB"; else s=b+" B";
        const payload = { size: s, bytes: b };
        sizeCacheMap.set(cacheKey, payload);
        res.json(payload);
    });
    proc.on("error", () => { clearTimeout(timer); if (!res.headersSent) res.json({size:null,bytes:null}); });
});

/* ================= API: progress (unchanged) ================= */
app.get("/progress", (req, res) => {
    const { id } = req.query; if (!id) return res.status(400).send("No ID");
    res.setHeader("Content-Type","text/event-stream");
    res.setHeader("Cache-Control","no-cache");
    res.setHeader("Connection","keep-alive");
    res.flushHeaders();

    let lastSent = 0;
    const iv = setInterval(() => {
        const d  = progressMap.get(id);
        const dp = downloadProgress.get(id);

        if (d && d.done) {
            res.write("data: " + JSON.stringify({percent:100,done:true}) + "\n\n");
            clearInterval(iv);
            progressMap.delete(id);
            downloadProgress.delete(id);
            res.end();
            return;
        }

        if (dp && dp.totalSize && dp.bytesSent > 0) {
            const pct = Math.min(99, Math.round((dp.bytesSent / dp.totalSize) * 100));
            if (pct > lastSent) {
                lastSent = pct;
                res.write("data: " + JSON.stringify({
                    percent: pct,
                    speed: dp.speed || "",
                    eta: dp.eta || "",
                    done: false
                }) + "\n\n");
            }
        } else if (d) {
            res.write("data: " + JSON.stringify(d) + "\n\n");
        }
    }, 500);
    req.on("close", () => { clearInterval(iv); progressMap.delete(id); downloadProgress.delete(id); });
});

/* ================= API: download-file (unchanged) ================= */
app.get("/download-file", async (req, res) => {
    try {
        const { url, type="video", quality="best", id="default" } = req.query;
        if (!url) return res.status(400).send("No URL");
        const p = getPlatform(url);
        const fmt = type === "mp3" ? "bestaudio/best" : videoFormat(p, quality);

        const metadata = await new Promise(resolve => {
            const pr = spawn("yt-dlp", [...ytArgs(p), "-f", fmt, "--print", "%(title)s|||%(filesize,filesize_approx)s", url]);
            let o = "";
            pr.stdout.on("data", d => o += d);
            pr.on("close", () => {
                const parts = o.trim().split("|||");
                resolve({
                    title: parts[0] ? safeTitle(parts[0]) : "video",
                    bytes: parts[1] ? parseInt(parts[1]) : null
                });
            });
            pr.on("error", () => resolve({ title: "video", bytes: null }));
            setTimeout(() => { try{pr.kill();}catch{} resolve({ title: "video", bytes: null }); }, 15000);
        });

        const title     = metadata.title;
        const totalSize = metadata.bytes;

        progressMap.set(id, { percent:0, done:false });
        downloadProgress.set(id, { totalSize, bytesSent: 0, speed: "", eta: "" });

        let bytesReceived = 0;
        let lastTime  = Date.now();
        let lastBytes = 0;

        res.on("close", () => { progressMap.set(id, { percent:100, done:true }); });
        res.on("data", (chunk) => {
            const now = Date.now();
            bytesReceived += chunk.length;
            const timeDiff = (now - lastTime) / 1000;
            if (timeDiff >= 1) {
                const bytesDiff = bytesReceived - lastBytes;
                const speed     = bytesDiff / timeDiff;
                downloadProgress.set(id, {
                    totalSize,
                    bytesSent: bytesReceived,
                    speed: speed > 1024*1024 ? (speed/1024/1024).toFixed(1)+" MB/s" : (speed/1024).toFixed(0)+" KB/s",
                    eta: ""
                });
                lastTime  = now;
                lastBytes = bytesReceived;
            }
        });

        console.log(`⬇ [${type.toUpperCase()}] platform=${p} quality=${quality} title="${title}" size=${totalSize}`);

        if (type === "mp3") {
            res.setHeader("Content-Type","audio/mpeg");
            res.setHeader("Content-Disposition",`attachment; filename="audio.mp3"; filename*=UTF-8''${encodeURIComponent(title)}.mp3`);
            const br = ["320","256","192","128","96"].includes(String(quality)) ? String(quality) : "192";
            const ya = [...ytArgs(p), "-f","bestaudio/best", "-o","-", url];
            if (url.includes("tiktok.com")) ya.splice(-1,0,"--extractor-args","tiktok:api_hostname=api16-normal-c-useast1a.tiktokv.com");

            const yt = spawn("yt-dlp", ya, { stdio:["ignore","pipe","pipe"] });
            yt.stderr.on("data", d => parseProgress(d.toString(), id));

            const ff = spawn(FFMPEG, ["-i","pipe:0","-vn","-acodec","libmp3lame","-b:a",`${br}k`,"-ar","44100","-ac","2","-f","mp3","pipe:1"]);

            yt.stdout.pipe(ff.stdin);
            ff.stdout.pipe(res);

            ff.on("close", () => { progressMap.set(id,{percent:100,done:true}); });
            yt.on("error", () => { if (!res.headersSent) res.status(500).send("Failed"); });
            ff.on("error", () => { if (!res.headersSent) res.status(500).send("Failed"); });
        } else {
            res.setHeader("Content-Type","video/mp4");
            res.setHeader("Content-Disposition",`attachment; filename="video.mp4"; filename*=UTF-8''${encodeURIComponent(title)}.mp4`);
            const args = [...ytArgs(p), "-f",fmt, "--merge-output-format","mp4", "--ffmpeg-location",FFMPEG, "--remux-video","mp4", "-o","-", url];
            const pr = spawn("yt-dlp", args, { stdio:["ignore","pipe","pipe"] });
            pr.stderr.on("data", d => { const l=d.toString(); process.stdout.write(l); parseProgress(l,id); });
            pr.stdout.pipe(res);
            pr.on("close", () => { progressMap.set(id,{percent:100,done:true}); });
            pr.on("error", () => { if (!res.headersSent) res.status(500).send("Failed"); });
        }
    } catch(e) {
        console.error("❌",e);
        if (!res.headersSent) res.status(500).send("Download failed");
    }
});

/* ================= START ================= */
app.listen(3000, () => {
    /* ─── SEO UPGRADE: log SEO page counts at startup ─── */
    const { SEO_PAGES, SEO_SLUGS } = require("./seo-data");
    const totalSEOPages = Object.keys(SEO_SLUGS).reduce((acc, lang) =>
        acc + Object.keys(SEO_SLUGS[lang]).length, 0);

    console.log("🔥 ALL IN ONE on http://localhost:3000");
    console.log(`   ${LANG_CODES.length} languages loaded`);
    console.log(`   ${SEO_PAGES.length} SEO platforms × ${LANG_CODES.length} languages = ${totalSEOPages} SEO pages`);
    console.log("   Sitemaps: /sitemap.xml  /sitemap-core.xml  /sitemap-seo.xml");
    console.log("   Test existing:  http://localhost:3000/ar/");
    console.log("   Test SEO (EN):  http://localhost:3000/youtube-downloader");
    console.log("   Test SEO (FR):  http://localhost:3000/fr/telecharger-video-youtube");
    console.log("   Test SEO (AR):  http://localhost:3000/ar/تحميل-فيديو-يوتيوب");
    console.log("   ⚠️  Change BASE_URL before deploying!");
});
