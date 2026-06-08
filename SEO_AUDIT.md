# TBH Fan Site — Full SEO Audit Report

**Date:** 2026-06-08 | **Auditor:** Automated multi-tool audit | **Score: 53/100**
**URL:** https://taskbarhero.nanobananas.me | **Platform:** Next.js SSG + Vercel

---

## Executive Summary

| Category | Score | Weight | Status |
|----------|-------|--------|--------|
| Technical SEO | 45/100 | 22% | 🔴 Missing hreflang on homepage, no sitemap annotations, no caching |
| Content Quality | 60/100 | 23% | 🟡 Guides are excellent but homepage is thin, E-E-A-T signals weak |
| On-Page SEO | 65/100 | 20% | 🟡 Title inconsistency across pages, JA/KO meta incomplete |
| Schema / Structured Data | 45/100 | 10% | 🔴 Only Homepage + Monsters + Cube have schema; 90% of pages missing |
| Performance (CWV) | 55/100 | 10% | 🔴 900KB item pages, no CDN caching, no compression |
| AI Search Readiness | 40/100 | 10% | 🔴 llms.txt not promoted, no AI crawler rules, low citability |
| Images | 65/100 | 5% | 🟡 Alt text present on items, missing on guide screenshots |
| **Overall** | **53/100** | | 🔴 Down from previous 64 (7 new criticals found) |

### Top 5 Critical Issues
1. **Homepage has ZERO hreflang tags** — Google sees 4 identical locales without language signals
2. **Cache-Control: no-store on all pages** — SSG pages rebuilt every request, no CDN edge caching
3. **Sitemap has NO hreflang/xhtml:link annotations** — 7,544 URLs, none with language alternates
4. **No security headers** — Only HSTS; missing CSP, X-Frame-Options, X-Content-Type-Options
5. **Items listing page hreflang missing JA + KO in source** — 2 of 4 locales invisible to search engines

### Top 5 Quick Wins (under 1 hour)
1. Fix items page hreflang (add ja + ko + fix x-default) — 5 min
2. Fix homepage hreflang — 5 min
3. Add `Cache-Control: public, max-age=86400` to SSG pages — 10 min (next.config.ts)
4. Add security headers via `next.config.ts` headers() — 15 min
5. Submit updated sitemap to GSC after rebuilding — 15 min

---

## 🔴 Technical SEO — 45/100

### 1. Homepage Has Zero Hreflang Tags (CRITICAL)

**Finding:** `https://taskbarhero.nanobananas.me/en` returns **0 `<link rel="alternate" hreflang="...">`** tags. The homepage is the most important page for multilingual sites — without hreflang, Google will index the 4 locale versions as competing duplicate content rather than language alternates.

**Impact:** Google may de-index zh/ja/ko variants or show wrong language to wrong users, directly destroying traffic from Asian markets.

**Fix:** Add hreflang to the homepage's `generateMetadata` in `src/app/[locale]/layout.tsx` or the root page `src/app/[locale]/page.tsx`.

### 2. Items Listing Page Hreflang Incomplete (CRITICAL)

**Source:** `src/app/[locale]/items/page.tsx:22`
```typescript
alternates: { canonical: `/${locale}/items`, languages: { zh: "/zh/items", en: "/en/items", "x-default": "/zh/items" } },
```
Japanese (`ja`) and Korean (`ko`) are **missing** from the languages object. The x-default should be `/en/items` not `/zh/items`.

**Fix:**
```typescript
alternates: {
  canonical: `/${locale}/items`,
  languages: { zh: "/zh/items", en: "/en/items", ja: "/ja/items", ko: "/ko/items", "x-default": "/en/items" }
},
```

### 3. Sitemap Has No Hreflang Annotations (CRITICAL)

**Finding:** 7,544 URLs in sitemap.xml with zero `xhtml:link rel="alternate"` entries. Every URL should reference its 3 sibling locale URLs. Right now Google has to discover locale alternates only from HTML `<link>` tags — but those are inconsistent across pages.

**Fix:** In `src/app/sitemap.ts`, each URL entry should include `alternates.languages` with all 4 locale URLs. Next.js `MetadataRoute.Sitemap` supports `alternates: { languages: {...} }` per entry.

### 4. Cache-Control: no-store on All Pages (CRITICAL)

**Finding:** Response headers show:
```
Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
X-Vercel-Cache: MISS
```
This is applied to **SSG pages** that never change between builds. Vercel edge nodes never cache anything — every request hits the origin server and runs a full render.

**Impact:** Higher TTFB, higher server costs, worse Core Web Vitals, lower search rankings.

**Fix:** Add caching headers in `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800' },
      ],
    },
    {
      source: '/api/:path*',
      headers: [{ key: 'Cache-Control', value: 'no-store' }],
    },
  ];
}
```

### 5. No Security Headers (HIGH)

Only `Strict-Transport-Security` is set. Missing:
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`

**Fix:** Add to `next.config.ts` headers function (combined with cache fix above).

### 6. Root URL Returns 200 (MEDIUM)

`https://taskbarhero.nanobananas.me/` returns 200 OK (no redirect). `https://taskbarhero.nanobananas.me/en` returns 307 redirect. This means `/` and `/en` are potentially duplicate content from Google's perspective.

**Fix:** Either redirect `/` → `/en` (recommended for international audience) or use canonical tags to point `/` → `/en`.

### 7. 404 Page is Default Next.js (MEDIUM)

The 404 page shows generic Next.js error with no navigation, no search, no links back to main content. Users hitting dead links get zero help.

**Fix:** Create a custom `not-found.tsx` with search box, popular links, and locale-aware navigation.

### 8. No JSON-LD Breadcrumbs Anywhere (MEDIUM)

No breadcrumb schema on any page. This is a missed opportunity for rich results (breadcrumb trail in SERPs).

### 9. Items Pages Are ~900KB Each (HIGH)

Every locale's items listing page is ~900KB of HTML. This is 3-5x the recommended maximum for SEO. The page likely includes inline data for all items.

**Impact:** Slow TTFB, poor mobile experience, higher bounce rate (matching the 90% GA bounce rate).

**Fix:** Move the item data to a JSON endpoint loaded client-side, or implement pagination (currently limited to 360 items with `.slice(0, 360)` but still renders all inline).

---

## 🟡 Content Quality — 60/100

### 10. Guides Are Excellent — But Nobody Stays (CRITICAL)

The guide content (reviewed: getting-started.mdx, gold-farming-route.mdx, steam-market-guide.mdx) is **well-written, practical, evidence-based, and avoids common AI-content pitfalls**. Each guide cites sources, includes FAQ sections, and uses structured decision frameworks.

**Yet GA shows 94% bounce on guide pages.** This is NOT a content quality problem — it's a **SXO (Search Experience Optimization)** problem. Users arrive from SERPs expecting something different than what the page delivers. Likely causes:
- Title/meta promise one thing, page delivers another
- Important info is below the fold
- No visual "you're in the right place" signal (hero image, quick-answer box)

### 11. Homepage is Too Thin (HIGH)

Only 4 H2s (Hero Classes, Market, Patch Notes, FAQ) and 0 H3s. For a site claiming "5,944 items, 6 hero classes, drop locations, Steam Market prices", the homepage shows almost none of this value. Users landing on the homepage see a wall of text, not the database.

**Fix:** Add a homepage hero section with:
- Search bar (search items directly from homepage)
- Quick stats: "5,944 items • 6 classes • 61 monsters • 197 runes"
- Featured content: latest market trends, popular items, newest guides
- "Start here" CTA for each persona (new player, farmer, market trader)

### 12. E-E-A-T Signals Are Weak (HIGH)

- **Experience:** Mentioned data is "mined from game files" but no author attribution on guides
- **Expertise:** Guide content shows expertise, but no author names/bios
- **Authoritativeness:** No external citations on most pages; guides cite Mobalytics (good)
- **Trustworthiness:** About page exists, privacy/terms exist, market data transparency is excellent — leverage this more

### 13. Title Inconsistency Across Pages (MEDIUM)

| Page | Title |
|------|-------|
| Homepage (/en) | TBH: Task Bar Hero Wiki — Items, Builds, Drop Finder & Steam Market |
| Items (/en/items) | TaskBar Hero Item Database｜TaskBar Hero Wiki |
| Chests (/en/chests) | TaskBar Hero Chests and Drop Tables｜TaskBar Hero Wiki |
| Heroes (/en/heroes) | TBH Hero Comparison — Radar Charts, Builds & Weapon Guide｜TaskBar Hero Wiki |
| Market (/en/market) | TaskBar Hero Steam Market｜Tradable Items and Match Status｜TaskBar Hero Wiki |
| Monsters (/en/monsters) | TBH Monster Bestiary — 61 Monsters, Drops & Stage Locations｜TaskBar Hero Wiki |

Branding randomly switches between "TBH" and "TaskBar Hero". The separator also varies (`｜` vs `—` vs `|`).

**Fix:** Standardize to: `{Page Topic} | TBH: Task Bar Hero Wiki`

### 14. JA/KO Locale Content Appears Machine-Translated (MEDIUM)

Japanese items page shows English title "TaskBar Hero Item Database" instead of a Japanese translation. Same for Korean. Check if guide content is properly localized or machine-translated (Google penalizes low-quality machine translations).

---

## 🟢 On-Page SEO — 65/100

### 15. Meta Descriptions Present But Generic (MEDIUM)

Most pages have descriptions, but they're functional rather than compelling. Example:
- Items: "Filter all gear, materials, and chests by name, rarity, slot, class, and type."
- Better: "Search 5,944 gear, materials & chests from TBH: Task Bar Hero. Filter by class, rarity, slot & market status. Updated daily."

### 16. OG Tags Correct But Image Missing (LOW)

OG images referenced (`/og-image.jpg`) but need verification that the image actually exists and meets the 1200×630 standard.

---

## 🔴 Schema / Structured Data — 45/100

### 17. Schema Coverage by Page

| Page | Has Schema | Type | Status |
|------|-----------|------|--------|
| Homepage | ✅ | WebSite + VideoGame | Good |
| Item detail | ✅ | Product | Good |
| Monsters listing | ✅ | (present) | Good |
| Cube | ✅ | (present) | Good |
| **Items listing** | ❌ | None | Should be ItemList |
| **Heroes listing** | ❌ | None | Should be ItemList (VideoGame characters) |
| **Hero detail** | ❌ | None | Should be VideoGame + character |
| **Chests listing** | ❌ | None | Should be ItemList |
| **Stages listing** | ❌ | None | Should be ItemList |
| **Market listing** | ❌ | None | Should be ItemList with offers |
| **Guides listing** | ❌ | None | Should be ItemList (Articles) |
| **Builds listing** | ❌ | None | Should be ItemList |
| **Buffs listing** | ❌ | None | Should be ItemList |
| **All guide articles** | ❌ | None | Should be Article |
| **FAQ page** | ❌ | None | Should be FAQPage |
| **Any page** | ❌ | BreadcrumbList | Should be everywhere |

**10 of 14 page types missing schema.** This is the biggest quick-win gap.

### 18. Recommended Schema by Priority

**P1 — Add immediately (high-impact pages):**
- `/items` → `ItemList` with up to 50 `ListItem` entries (Google's max for rich results)
- `/guides/[slug]` → `Article` with author, datePublished, dateModified
- `/faq` → `FAQPage` with mainEntity array

**P2 — Add within 1 week:**
- Hero/chest/stage/market listing pages → `ItemList`
- Hero detail → character schema
- BreadcrumbList on all pages

---

## 🟡 Performance (CWV) — 55/100

### 19. Major Performance Blockers

| Issue | Impact |
|-------|--------|
| 900KB items pages | LCP likely >5s on mobile |
| 558KB market page | Same issue |
| AdSense script (synchronous in `<head>`) | Blocks rendering |
| GTag script (synchronous in `<head>`) | Blocks rendering |
| No CDN caching (Vercel MISS on every request) | TTFB penalty |
| Monster/hero images from R2 — unoptimized | Could use WebP + responsive sizes |
| No `fetchpriority` on hero/LCP images | Delays LCP |

### 20. AdSense + GTag Blocking (MEDIUM)

Both scripts are loaded synchronously in `<head>` without `async` or `defer`. GTag already has `async` but AdSense doesn't. This blocks first paint.

**Fix:** Add `async` to AdSense. Use Next.js `<Script strategy="afterInteractive">` for both:
```tsx
import Script from 'next/script';
<Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3383070348689557" crossOrigin="anonymous" strategy="afterInteractive" />
<Script async src="https://www.googletagmanager.com/gtag/js?id=G-87KVJGHX8D" strategy="afterInteractive" />
<Script id="gtag-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-87KVJGHX8D');`}</Script>
```

---

## 🔴 AI Search Readiness — 40/100

### 21. llms.txt Exists But Invisible (HIGH)

`https://taskbarhero.nanobananas.me/llms.txt` is well-structured and comprehensive. However:
- No reference on homepage or in `<head>`
- No `<link rel="llms"` or meta tag pointing to it
- No mention in sitemap or robots.txt

**Fix:** Add to layout.tsx `<head>`:
```html
<link rel="llms" href="/llms.txt" />
<meta name="llms:generated" content="2026-06-08" />
```

### 22. No AI Crawler Rules in robots.txt (MEDIUM)

Current robots.txt has no AI bot directives. Should clarify access:
```
User-agent: GPTBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: PerplexityBot
Allow: /
```

### 23. Low Passage-Level Citability (HIGH)

Item descriptions, hero profiles, and guide paragraphs are written for human reading, not AI citation. AI models need **self-contained paragraphs** with clear subject-predicate structure to cite.

**Fix:** Add a 2-3 sentence "summary" or "tl;dr" block at the top of each key page that answers the most likely question completely in one block.

---

## 🟢 Images — 65/100

### 24. Alt Text Coverage

- Items page: 360 `<img>` tags, 0 missing alt ✅
- Guide screenshots: alt text is empty or generic ❌
- Monster portraits: some missing descriptive alt ❌

### 25. Image Format

- Item icons from R2 — could benefit from WebP/AVIF
- Monster portraits are PNG — large files, no WebP conversion
- No responsive `<picture>` or `srcSet` for any images

---

## 📊 GA Data Analysis: SXO Findings

Combining the GA data with the audit reveals a clear pattern:

| GA Metric | Value | Root Cause |
|-----------|-------|------------|
| 90% new users | 166/184 | Zero retention mechanics |
| 28 sec avg engagement | wiki baseline: 3-5 min | Pages don't deliver expected content fast enough |
| Items page: 90% bounce | Core feature page | 900KB page, no schema, slow LCP, mobile users abandon |
| Guide pages: 94% bounce | Content is excellent | Title/SERP mismatch — users expect something else |
| Steam Market: 50% bounce | Best performing | Page has clear purpose, delivers immediately |
| Chests: 43% bounce | Second best | Simple, focused content with drop tables |

### SXO: Page-Type Mismatch Detection

The **items listing page** has the most severe mismatch:
- **What SERP shows:** "TaskBar Hero Item Database" — implies a searchable, browsable database
- **What user gets:** 900KB page with 360 item cards, slow to load, filters buried below search bar
- **What user wants:** Instant search, see item stats, check market price — ideally in one view

The **guide pages** also show mismatch:
- **What SERP shows:** "Getting Started Guide" / "Gold Farming Route"
- **What user expects:** A quick-reference cheat sheet or numbered step list
- **What user gets:** Long-form prose (excellent content, but not scannable at a glance)

---

## 📋 Prioritized Action Plan

### 🔴 CRITICAL — Fix This Week (blocks indexing)

| # | Action | File | Effort |
|---|--------|------|--------|
| 1 | Fix items page hreflang (add ja, ko, fix x-default) | `src/app/[locale]/items/page.tsx:22` | 5 min |
| 2 | Audit ALL pages for complete hreflang (all 4 locales) | All page.tsx files | 30 min |
| 3 | Add hreflang to homepage | `src/app/[locale]/page.tsx` or layout | 10 min |
| 4 | Add hreflang annotations to sitemap | `src/app/sitemap.ts` | 20 min |
| 5 | Add caching headers (Cache-Control) | `next.config.ts` | 10 min |
| 6 | Add security headers (CSP, XFO, XCTO, Referrer-Policy) | `next.config.ts` | 15 min |

### 🟡 HIGH — Fix Within 2 Weeks

| # | Action | Effort |
|---|--------|--------|
| 7 | Add Schema JSON-LD to top 10 page types | 2 hr |
| 8 | Optimize items page: pagination, reduce HTML to <200KB | 3 hr |
| 9 | Add "quick answer" box to guide pages (TL;DR before prose) | 1 hr |
| 10 | Add homepage hero section with search + stats | 2 hr |
| 11 | Migrate AdSense + GTag to Next.js Script afterInteractive | 15 min |
| 12 | Add llms.txt reference to `<head>` | 5 min |
| 13 | Add AI crawler rules to robots.txt | 5 min |
| 14 | Fix title consistency across all pages | 30 min |

### 🟢 MEDIUM — Fix Within 1 Month

| # | Action | Effort |
|---|--------|--------|
| 15 | Create custom 404 page with search + navigation | 1 hr |
| 16 | Add author attribution to guides | 30 min |
| 17 | Convert hero/monster images to WebP | 1 hr |
| 18 | Add BreadcrumbList schema to all pages | 1 hr |
| 19 | Implement FAQPage schema on /faq | 30 min |
| 20 | Add JA/KO translations for item page title | 15 min |
| 21 | Root URL redirect `/` → `/en` | 5 min |
| 22 | Verify OG image exists at /og-image.jpg | 5 min |

### 🔵 LOW — Backlog

| # | Action | Effort |
|---|--------|--------|
| 23 | Add responsive images with srcSet | 2 hr |
| 24 | Create PWA manifest + service worker for offline access | 3 hr |
| 25 | Add newsletter/email capture for return visitors | 2 hr |
| 26 | Implement page-level "last updated" dates | 1 hr |

---

## Estimated Impact of Fixing All Criticals

| Metric | Current | Projected After Fix |
|--------|---------|---------------------|
| SEO Health Score | 53 | 75+ |
| 28-sec avg engagement | — | 2+ min |
| 90% bounce (items) | — | 50-60% |
| Organic impressions | baseline | +40-80% (proper hreflang + sitemap) |
| CWV LCP | ~5s (est.) | <2.5s (caching + page size reduction) |
| AI search visibility | near zero | indexed by ChatGPT + Perplexity |

---

## Appendix: Source Files Reviewed

- `src/app/[locale]/layout.tsx` — Global layout, GA/AdSense scripts
- `src/app/[locale]/items/page.tsx` — Items listing (hreflang bug)
- `src/app/[locale]/items/[slug]/page.tsx` — Item detail (schema ✅)
- `src/app/sitemap.ts` — Sitemap generation (no hreflang)
- `src/lib/seo.ts` — Shared SEO utilities
- `src/lib/hero-content.ts` — Hero content profiles
- `src/lib/game-data/data.ts` — Core data, SITE_URL
- `next.config.ts` — Next.js config (no headers)
- `content/guides/en/beginner/getting-started.mdx` — Guide quality sample
- `content/guides/en/farming/gold-farming-route.mdx` — Guide quality sample
- `content/guides/en/economy/steam-market-guide.mdx` — Guide quality sample
- `public/llms.txt` — AI search readiness
- `robots.txt` — Crawl directives
- `sitemap.xml` — 7,544 URLs, no hreflang annotations
