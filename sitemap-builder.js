/* ================================================
   sitemap-builder.js — Scalable Sitemap Generator
   ------------------------------------------------
   Generates both a sitemap index (for large sites)
   and individual sitemaps per language group.
   Covers:
     • Existing pages (/, /how-to-use, /faq) × 20 langs
     • All programmatic SEO pages × 20 langs
   ================================================ */

"use strict";

const { getAllSEOUrls } = require("./seo-routes");

/* ─── EXISTING CORE PAGES ─── */
const CORE_PAGES = [
  { slug: "",            priority: "1.0", freq: "weekly"  },
  { slug: "/how-to-use", priority: "0.8", freq: "monthly" },
  { slug: "/faq",        priority: "0.8", freq: "monthly" },
];

/* ─── XML helpers ─── */
function xmlEscape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function urlEntry({ loc, changefreq, priority, alternates }) {
  let xml = `<url>\n  <loc>${xmlEscape(loc)}</loc>\n`;
  if (changefreq) xml += `  <changefreq>${changefreq}</changefreq>\n`;
  if (priority)   xml += `  <priority>${priority}</priority>\n`;
  if (alternates && alternates.length) {
    for (const alt of alternates) {
      xml += `  <xhtml:link rel="alternate" hreflang="${xmlEscape(alt.hreflang)}" href="${xmlEscape(alt.href)}"/>\n`;
    }
  }
  xml += `</url>`;
  return xml;
}

const SITEMAP_HEADER = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">`;
const SITEMAP_FOOTER = `\n</urlset>`;

const INDEX_HEADER = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
const INDEX_FOOTER = `\n</sitemapindex>`;

/* ─── BUILD CORE SITEMAP ─── */
function buildCoreSitemap(LANG_CODES, DEFAULT_LANG, BASE_URL, LANGS) {
  const entries = [];

  for (const code of LANG_CODES) {
    const pref = code === DEFAULT_LANG ? "" : `/${code}`;
    const ll   = LANGS[code];

    for (const page of CORE_PAGES) {
      // Build alternates for this page
      const alternates = LANG_CODES.map(altCode => {
        const altPref = altCode === DEFAULT_LANG ? "" : `/${altCode}`;
        return { hreflang: LANGS[altCode].hreflang, href: `${BASE_URL}${altPref}${page.slug || "/"}` };
      });
      // x-default
      alternates.push({ hreflang: "x-default", href: `${BASE_URL}${page.slug || "/"}` });

      entries.push(urlEntry({
        loc:        `${BASE_URL}${pref}${page.slug || "/"}`,
        changefreq: page.freq,
        priority:   page.priority,
        alternates,
      }));
    }
  }

  return SITEMAP_HEADER + "\n" + entries.join("\n") + SITEMAP_FOOTER;
}

/* ─── BUILD SEO SITEMAP ─── */
function buildSEOSitemap(LANG_CODES, DEFAULT_LANG, BASE_URL, LANGS) {
  const allSEO = getAllSEOUrls(LANG_CODES, DEFAULT_LANG, BASE_URL);
  const entries = [];

  for (const item of allSEO) {
    // Build full xhtml alternates for this SEO page
    const alternates = item.alternates.map(alt => ({
      hreflang: (LANGS[alt.hreflang] && LANGS[alt.hreflang].hreflang) || alt.hreflang,
      href:     alt.href,
    }));
    // x-default → English
    const defaultSlug = item.alternates.find(a => a.hreflang === DEFAULT_LANG);
    if (defaultSlug) {
      alternates.push({ hreflang: "x-default", href: defaultSlug.href });
    }

    entries.push(urlEntry({
      loc:        item.loc,
      changefreq: "weekly",
      priority:   "0.9",
      alternates,
    }));
  }

  return SITEMAP_HEADER + "\n" + entries.join("\n") + SITEMAP_FOOTER;
}

/* ─── BUILD SITEMAP INDEX ─── */
function buildSitemapIndex(BASE_URL) {
  const now = new Date().toISOString().split("T")[0];
  return INDEX_HEADER + `
  <sitemap>
    <loc>${xmlEscape(BASE_URL)}/sitemap-core.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${xmlEscape(BASE_URL)}/sitemap-seo.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>` + INDEX_FOOTER;
}

/* ─── ROBOTS.TXT (upgraded with sitemap index) ─── */
function buildRobotsTxt(BASE_URL) {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    "# API endpoints — no indexing",
    "Disallow: /download-file",
    "Disallow: /fetch-info",
    "Disallow: /progress",
    "Disallow: /get-size",
    "Disallow: /thumb-proxy",
    "Disallow: /download",
    "Disallow: /thanks",
    "Disallow: /__seo-cache-clear",
    "Disallow: /__seo-pages",
    "",
    "# Sitemaps",
    `Sitemap: ${BASE_URL}/sitemap.xml`,
    `Sitemap: ${BASE_URL}/sitemap-core.xml`,
    `Sitemap: ${BASE_URL}/sitemap-seo.xml`,
  ].join("\n");
}

module.exports = {
  buildCoreSitemap,
  buildSEOSitemap,
  buildSitemapIndex,
  buildRobotsTxt,
};
