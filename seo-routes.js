/* ================================================
   seo-routes.js — Programmatic SEO Route Handler
   ------------------------------------------------
   Mounts dynamic /:lang/:seo-slug routes for all
   platforms × all 20 languages WITHOUT touching
   any existing route (/, /en/, /fr/, /ar/,
   /how-to-use, /faq, /download, /thanks …).

   Call once from server.js:
     const seoRouter = require("./seo-routes");
     app.use(seoRouter(LANGS, LANG_CODES, DEFAULT_LANG, BASE_URL));
   ================================================ */

"use strict";

const express  = require("express");
const { SEO_PAGES, SEO_SLUGS, buildSlugIndex, getSEOPage, getSlug } = require("./seo-data");
const { buildSEOPage } = require("./seo-pages");

/* Pre-build the reverse slug → {lang, platformId} index once at startup */
const SLUG_INDEX = buildSlugIndex();

/**
 * Returns a configured Express Router with all SEO routes attached.
 *
 * @param {object}   LANGS        Full language map loaded from languages.json
 * @param {string[]} LANG_CODES   Array of all language codes
 * @param {string}   DEFAULT_LANG "en"
 * @param {string}   BASE_URL     e.g. "https://yourdomain.com"
 */
function createSEORouter(LANGS, LANG_CODES, DEFAULT_LANG, BASE_URL) {
  const router = express.Router();

  /* ─── Cache layer: store rendered HTML in memory (reset on restart) ─── */
  const pageCache = new Map();
  const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  function getCached(key) {
    const entry = pageCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) { pageCache.delete(key); return null; }
    return entry.html;
  }
  function setCache(key, html) {
    pageCache.set(key, { html, ts: Date.now() });
  }

  /* ─── ENGLISH SEO routes (no lang prefix) ───
     e.g. /youtube-downloader, /tiktok-mp3-downloader
     These must be registered BEFORE the /:lang/* catchall.
  ─── */
  const enSlugs = SEO_SLUGS[DEFAULT_LANG] || {};
  for (const [platformId, slug] of Object.entries(enSlugs)) {
    const seoPageData = getSEOPage(platformId);
    if (!seoPageData) continue;

    router.get(`/${slug}`, (req, res) => {
      const cacheKey = `${DEFAULT_LANG}:${platformId}`;
      let html = getCached(cacheKey);
      if (!html) {
        const L = LANGS[DEFAULT_LANG];
        html = buildSEOPage({
          seoPageData,
          langCode:    DEFAULT_LANG,
          L,
          BASE_URL,
          LANG_CODES,
          LANGS,
          DEFAULT_LANG,
          slugIndex: SLUG_INDEX,
        });
        setCache(cacheKey, html);
      }
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(html);
    });
  }

  /* ─── LANG-PREFIXED SEO routes ───
     e.g. /fr/telecharger-video-youtube
          /ar/تحميل-فيديو-يوتيوب
     Route pattern: /:lang/:seoSlug
     Guard: only fire when lang is a known language code
             AND slug maps to a known SEO page.
  ─── */
  router.get("/:lang/:seoSlug", (req, res, next) => {
    const { lang, seoSlug } = req.params;

    // Guard 1: must be a known language (not a static file request)
    if (!LANG_CODES.includes(lang)) return next();

    // Guard 2: slug must exist in the SEO index for this language
    const indexKey = `${lang}:${seoSlug}`;
    const match    = SLUG_INDEX[indexKey];
    if (!match) return next();  // fall through to 404 or other routes

    const { platformId } = match;
    const seoPageData = getSEOPage(platformId);
    if (!seoPageData) return next();

    const cacheKey = `${lang}:${platformId}`;
    let html = getCached(cacheKey);
    if (!html) {
      const L = LANGS[lang] || LANGS[DEFAULT_LANG];
      html = buildSEOPage({
        seoPageData,
        langCode:    lang,
        L,
        BASE_URL,
        LANG_CODES,
        LANGS,
        DEFAULT_LANG,
        slugIndex: SLUG_INDEX,
      });
      setCache(cacheKey, html);
    }

    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(html);
  });

  /* ─── Cache-bust endpoint (optional, hit in deployment scripts) ─── */
  router.get("/__seo-cache-clear", (req, res) => {
    const secret = process.env.CACHE_CLEAR_SECRET || "seo-clear-2025";
    if (req.query.secret !== secret) return res.status(403).send("Forbidden");
    pageCache.clear();
    res.send(`✅ SEO cache cleared (${new Date().toISOString()})`);
  });

  /* ─── Info endpoint: list all SEO URLs (dev only) ─── */
  router.get("/__seo-pages", (req, res) => {
    if (process.env.NODE_ENV === "production") return res.status(404).send("Not Found");
    const urls = [];
    // English (no prefix)
    for (const [platformId, slug] of Object.entries(SEO_SLUGS[DEFAULT_LANG] || {})) {
      urls.push({ lang: DEFAULT_LANG, platform: platformId, url: `/${slug}` });
    }
    // All other languages
    for (const lang of LANG_CODES) {
      if (lang === DEFAULT_LANG) continue;
      for (const [platformId, slug] of Object.entries(SEO_SLUGS[lang] || {})) {
        urls.push({ lang, platform: platformId, url: `/${lang}/${slug}` });
      }
    }
    res.json({ total: urls.length, pages: urls });
  });

  return router;
}

/* ─── Helper: get all SEO URLs (used by sitemap) ─── */
function getAllSEOUrls(LANG_CODES, DEFAULT_LANG, BASE_URL) {
  const urls = [];

  // English pages (no prefix)
  for (const [platformId, slug] of Object.entries(SEO_SLUGS[DEFAULT_LANG] || {})) {
    urls.push({
      loc:        `${BASE_URL}/${slug}`,
      lang:       DEFAULT_LANG,
      platformId,
      alternates: buildAlternates(platformId, LANG_CODES, DEFAULT_LANG, BASE_URL),
    });
  }

  // All other languages
  for (const lang of LANG_CODES) {
    if (lang === DEFAULT_LANG) continue;
    for (const [platformId, slug] of Object.entries(SEO_SLUGS[lang] || {})) {
      urls.push({
        loc:        `${BASE_URL}/${lang}/${slug}`,
        lang,
        platformId,
        alternates: buildAlternates(platformId, LANG_CODES, DEFAULT_LANG, BASE_URL),
      });
    }
  }

  return urls;
}

function buildAlternates(platformId, LANG_CODES, DEFAULT_LANG, BASE_URL) {
  return LANG_CODES.map(code => {
    const slug = getSlug(code, platformId);
    const pref = code === DEFAULT_LANG ? "" : `/${code}`;
    return { hreflang: code, href: `${BASE_URL}${pref}/${slug}` };
  });
}

module.exports = { createSEORouter, getAllSEOUrls };
