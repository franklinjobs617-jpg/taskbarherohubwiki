# TBH Fan Site — SEO Audit

**Date:** 2026-06-08 | **Tool:** Manual audit + GSC data | **Score: 64/100**

---

## Executive Summary

| Category | Score | Status |
|----------|-------|--------|
| Technical SEO | 55/100 | 🟡 Sitemap stale, hreflang gaps |
| Content Quality | 60/100 | 🟡 Meta improved (local), not deployed |
| On-Page SEO | 70/100 | 🟢 Title/Desc/H1 fixed (local) |
| Schema/Structured Data | 65/100 | 🟡 JSON-LD present, missing on new pages |
| Performance (CWV) | 70/100 | 🟢 Next.js SSG, fast |
| AI Search Readiness | 40/100 | 🔴 No llms.txt, no citations |
| Images | 55/100 | 🟡 Alt texts sparse, no WebP |
| **Overall** | **64/100** | 🟡 |

---

## 🔴 Critical

### 1. Sitemap Missing New Pages
**Impact:** Google won't discover `/buffs`, `/cube`, `/tools/farming-calculator`, `/guides/farming`, `/monsters/[slug]`, `/ko/*`
**Sitemap lastmod:** 2026-06-03 (5 days stale)
**Fix:** Run `next build` to regenerate sitemap, or update `sitemap.ts` to include all routes.

### 2. No Korean hreflang on Live Site
**Impact:** Korean users (49 imp in GSC, plus `태스크바 히어로 위키` queries) get English pages
**Fix:** Deploy latest code which adds `/ko` locale + hreflang.

### 3. Deploy Gap — All SEO fixes are local
**Impact:** Homepage title still says "TaskBar Hero Wiki" instead of "TBH: Task Bar Hero Wiki"; all item meta improvements not live
**Fix:** Push + deploy to Vercel.

---

## 🟡 High

### 4. Missing Meta Descriptions on New Pages
- `/buffs` — has meta ✅
- `/cube` — has meta ✅
- `/tools/farming-calculator` — has meta ✅
- `/monsters/[slug]` — has meta ✅
- `/guides/farming` — has meta ✅

### 5. Internal Linking Gaps
- No breadcrumbs on `/buffs`, `/cube` pages
- New pages not cross-linked from related content (e.g. Cube page doesn't link to Buffs)

### 6. Image alt Text Coverage
- Item icons use `alt=""` (decorative, OK)
- Monster portraits on map page are linked but some lack descriptive alt text
- Game screenshots on guide pages have no alt text

---

## 🟢 Medium

### 7. llms.txt Missing
**Impact:** AI crawlers (ChatGPT, Perplexity, Google AI) can't discover structured site content
**Fix:** Create `/llms.txt` with site structure and key endpoints.

### 8. Core Web Vitals
- Next.js SSG → fast initial load ✅
- drops.json (2.1MB) loaded at build time, not client-side ✅
- Monster images are unoptimized PNGs → could use WebP

### 9. JSON-LD Coverage
- Homepage: ✅ WebSite + VideoGame + FAQPage (local code, not deployed)
- Item pages: ✅ Product
- Builds page: ❌ No schema
- Cube page: ❌ No schema
- Monsters page: ❌ No schema
- Stage pages: ❌ No schema

---

## 📋 Immediate Action Items

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 1 | Update sitemap to include all new pages + ko locale | 🔴 Critical | 30 min |
| 2 | Push + deploy to Vercel | 🔴 Critical | 5 min |
| 3 | Submit new URLs to GSC | 🔴 Critical | 15 min |
| 4 | Create llms.txt | 🟢 Medium | 10 min |
| 5 | Add JSON-LD to Builds, Cube, Monsters, Stage pages | 🟢 Medium | 1 hr |
| 6 | Convert monster PNGs to WebP | 🟢 Medium | 30 min |
| 7 | Add descriptive alt text to non-decorative images | 🟢 Low | 1 hr |
