# Google SEO, Trends, SERP and Content Gap Report

Date: 2026-06-22
Site: https://taskbarhero.nanobananas.me
Scope: Google Trends exports, Google Search Console export, current live site checks, git history, SERP/competitor research.

## Executive Conclusion

【事实】

- Google Search Console export shows that Google traffic was not always near zero. It peaked on 2026-06-08 with 352 clicks and 8,703 impressions, then 2026-06-09 had 345 clicks and 5,643 impressions. From 2026-06-10 onward it dropped sharply; the final 7 days in the export have only 12 clicks and 526 impressions.
- The current live site redirects old English `/en` URLs to unprefixed English URLs. Examples checked on 2026-06-22:
  - `https://taskbarhero.nanobananas.me/en` returns 307 to `/`.
  - `https://taskbarhero.nanobananas.me/en/heroes` returns 307 to `/heroes`.
- GSC still attributes 240 clicks and 9,059 impressions to old `/en...` URLs in the exported period. Canonical unprefixed English URLs account for 596 clicks and 13,500 impressions.
- Git history shows a 2026-06-04 URL structure change: "英文作为默认语言放根路径". There were also multiple SEO/layout-related commits around 2026-06-08 to 2026-06-10.
- Robots and sitemap are not currently blocking crawling. `robots.txt` allows all users and points to `https://taskbarhero.nanobananas.me/sitemap.xml`. The sitemap returns 200 OK and is cached.
- Google Trends rising terms for 2026-06-15 to 2026-06-22 are heavily about maintenance, errors, server status, Discord, updates, and specific builds/entities.

【推论】

- The most likely technical cause of the Google traffic collapse is URL migration / canonical reprocessing after the English default moved from `/en` to root paths. This is strongly correlated with the timing and with GSC still showing old `/en...` URLs, but it is not proven as the only cause.
- The biggest content gap is not generic "wiki" coverage. It is missing or weak coverage for live-service intent: server status, maintenance, error 500, error 401, Discord, update/news, and "what should I do now?" troubleshooting.
- The second content gap is decision-oriented build coverage. Google and competitor SERPs show strong demand for beginner guides, class guides, cube/crafting guides, money/market guides, and meta team/build pages.

【猜测】

- Google may be temporarily testing/reranking the new canonical URL set after the URL change. 当前没有足够证据支持这个结论。
- The AdSense or layout changes on 2026-06-09/10 may have contributed to crawl/render volatility. 当前没有足够证据支持这个结论。
- The current domain may be competing against several newer exact-match TBH wiki domains, which could dilute Google confidence. This is plausible from SERP competition, but current data does not prove direct causality.

## Data Sources

Local files:

- `D:/searched_with_rising-searches_Worldwide_20260615-1054_20260622-1054.csv`
- `D:/searched_with_rising-searches_Worldwide_20260522-1055_20260622-1055.csv`
- `D:/taskbarhero.nanobananas.me-Performance-on-Search-2026-06-22.xlsx`

Live checks:

- `https://taskbarhero.nanobananas.me/en`
- `https://taskbarhero.nanobananas.me/en/heroes`
- `https://taskbarhero.nanobananas.me/robots.txt`
- `https://taskbarhero.nanobananas.me/sitemap.xml`

SERP / competitor sources:

- Official Steam page: https://store.steampowered.com/app/3678970/TBH_Task_Bar_Hero/
- Official Steam news maintenance notice: https://store.steampowered.com/news/app/3678970/view/693138414001720473
- Steam error 500 discussion: https://steamcommunity.com/app/3678970/discussions/0/569289747256591621/
- Steam community guide: https://steamcommunity.com/sharedfiles/filedetails/?id=3734611647
- taskbarhero.wiki: https://taskbarhero.wiki/
- TBH.City: https://tbh.city/
- TBH.City map: https://tbh.city/map
- Probonk materials: https://probonk.com/tbh-task-bar-hero/materials
- Probonk cube: https://probonk.com/tbh-task-bar-hero/cube
- taskbarherowiki.com: https://taskbarherowiki.com/
- taskbarhero.app: https://taskbarhero.app/
- SteamDB items: https://steamdb.info/app/3678970/items/

SERP-observed but not used as hard factual evidence because command-line HEAD checks returned 403:

- Mobalytics guide URLs for money, beginner, tips, cube crafting, knight, and meta team intent.
- PCGamingWiki TBH page.

## Google Search Console Findings

### Traffic Timeline

【事实】

| Date | Clicks | Impressions | CTR | Position |
|---|---:|---:|---:|---:|
| 2026-06-05 | 162 | 3,534 | 4.58% | 7.1 |
| 2026-06-06 | 298 | 6,517 | 4.57% | 7.1 |
| 2026-06-07 | 258 | 7,372 | 3.50% | 7.6 |
| 2026-06-08 | 352 | 8,703 | 4.04% | 7.6 |
| 2026-06-09 | 345 | 5,643 | 6.11% | 7.0 |
| 2026-06-10 | 11 | 206 | 5.34% | 3.5 |
| 2026-06-20 | 0 | 21 | 0.00% | 3.3 |

The last 7 days in the export total only 12 clicks and 526 impressions.

【推论】

The ranking position did not collapse in the same way as impressions. This suggests Google reduced the set of queries/pages being shown, rather than every visible page suddenly ranking much worse.

### URL Bucket Split

【事实】

| URL bucket | Clicks | Impressions |
|---|---:|---:|
| Canonical English, unprefixed | 596 | 13,500 |
| Japanese | 481 | 7,659 |
| Old English `/en...` | 240 | 9,059 |
| Korean | 99 | 2,831 |
| Chinese | 88 | 1,384 |

【推论】

Old `/en...` URLs were still materially visible to Google in the export period. Because those URLs now redirect, Google may need time to consolidate signals from `/en/...` to `/...`.

### Query Pattern

【事实】

High-impression / low-CTR brand queries:

- `taskbar hero wiki`: 2,637 impressions, 15 clicks, 0.57% CTR, position 9.02.
- `taskbarhero wiki`: 699 impressions, 5 clicks, 0.72% CTR, position 9.31.
- `taskbarherowiki`: 289 impressions, 3 clicks, 1.04% CTR, position 8.37.
- `tbh wiki`: 220 impressions, 2 clicks, 0.91% CTR, position 10.63.

Higher-performing tool queries:

- `tbh farm calculator`: 49 impressions, 17 clicks, 34.69% CTR, position 3.33.
- `tbh drop finder`: 53 impressions, 15 clicks, 28.30% CTR, position 3.68.
- `task bar hero calculator`: 196 impressions, 16 clicks, 8.16% CTR, position 5.61.

【推论】

Google users respond better when the result promises a concrete tool or answer. Generic wiki intent has more competition and lower CTR.

## Trends Keyword Gap

### 7-Day Rising Terms: 2026-06-15 to 2026-06-22

【事实】

Top rising terms include:

- `task bar hero maintenance`
- `task bar hero error 500`
- `task bar hero manutenção`
- `task bar hero server status`
- `task bar hero error 401`
- `task bar hero не запускается`
- `task bar hero discord server`
- `task bar hero server`
- `task bar hero status`
- `task bar hero discord`
- `task bar hero update`
- `task bar hero blue golem`
- `task bar hero ranger build`
- `task bar hero sorcerer build`
- `task bar hero archer build`

【推论】

The short-term demand spike is caused by live-service instability and community/support intent. A static database alone does not satisfy these users.

### 30-Day Rising Terms: 2026-05-22 to 2026-06-22

【事实】

The 30-day file contains these demand clusters:

- Brand/wiki: `task bar hero`, `taskbar hero`, `task bar hero wiki`, `taskbar hero wiki`, `tbh wiki`.
- Tools: `calculator`, `farm calculator`, `drop finder`, `rune planner`.
- Guides: `guide`, `build`, `chest`, `market`, `steam`.
- Community/status: `discord`, `server`.

【推论】

The site already covers database and tools well, but needs a better layer for "current issue + decision + troubleshooting" queries.

## SERP and Competitor Findings

### What Google Is Rewarding

【事实】

SERP competitors fall into these page types:

1. Datamined database hubs:
   - taskbarhero.wiki presents items, classes, stages, runes, builds, skills, loot, and version info.
   - TBH.City presents a broad searchable database, 16 languages, map, calculator, class ranking, builds, cube, leaderboard, and FAQ.
   - taskbarherowiki.com positions around searchable items, stats, grades, classes, chest drop rates, and stage lookup.

2. Interactive tools:
   - Probonk has dedicated materials and cube pages.
   - TBH.City has an interactive stage map and farm calculator-style positioning.

3. Editorial guides:
   - SERP results include editorial pages for beginner, money/Steam wallet, tips, cube, class, and meta team guide intent. Some of these pages returned 403 to command-line checks, so they are used as SERP type evidence, not as hard content evidence.
   - Steam Community guide pages are ranking for practical user problems and FAQ-style walkthroughs.

4. Live-service issue pages:
   - Steam news has an emergency maintenance notice.
   - Steam discussions and third-party pages are appearing for error 500 / maintenance style queries.

【推论】

Google's intent model for this game is mixed: database + tools + guide + troubleshooting. A page architecture that only behaves like a database will miss short-term breakout traffic and some beginner/build traffic.

## Current Site Strengths

【事实】

- Site has a large data footprint: items, heroes, stages, monsters, chests, market, runes, pets, tools, guides.
- Live `robots.txt` and sitemap are accessible.
- Live pages checked have canonical/hreflang metadata.
- Tool pages already perform well in GSC.
- Product snippets appear in GSC export: 297 clicks / 6,109 impressions.

【推论】

The site has enough underlying data to compete. The main missing layer is packaging and query-intent matching, not raw data volume.

## Main Gaps To Fix

### Gap 1: Server Status / Maintenance / Error Center

Missing or weak intent:

- `task bar hero maintenance`
- `task bar hero error 500`
- `task bar hero error 401`
- `task bar hero server status`
- `task bar hero server`
- `task bar hero status`
- non-English variants: Portuguese, Russian, Turkish.

Recommended page:

- `/server-status` or `/guides/troubleshooting/server-status-error-500`

Must include:

- A clear statement that this is not the official server status.
- Links to official Steam news, Steam discussions, Discord/community links, and Steam store.
- Current known issue summary with "last checked" timestamp.
- Error 500 explanation: server-side or backend communication issue, do not promise a local fix unless verified.
- Error 401 explanation: authentication/session/authorization issue; suggest restarting Steam/game, checking maintenance notices, and waiting if server maintenance is active.
- Maintenance FAQ: what users can check, what not to do with valuable items during server instability.
- Evidence block: cite Steam maintenance/news and discussions.
- Multilingual terms section: `manutenção`, `не запускается`, Turkish market/opening phrasing, without claiming full localization.

Decision analysis:

- 目标: Capture breakout support intent and help users during server incidents.
- 约束条件: Do not claim official status or real-time uptime unless there is a verifiable source.
- 成本: Medium; one page plus a small "current issue" data block.
- 风险: High if the page invents status; low if it is framed as an evidence-based troubleshooting hub.
- ROI: High in spikes; medium evergreen value.
- 替代方案: Add a smaller FAQ section first, then expand to a full hub if GSC impressions appear.

### Gap 2: Update / News Hub

Missing or weak intent:

- `task bar hero update`
- `task bar hero news`
- maintenance notice searches.

Recommended page:

- Improve `/updates`.

Must include:

- Official updates / Steam news links.
- Site data update timestamp.
- Difference between game version, site data version, and market data version.
- Recent known changes affecting trading, cube, market, chests, and drop rates.

Decision analysis:

- 目标: Give Google and users a stable page for update/news intent.
- 约束条件: Must separate official patch facts from site-side data updates.
- 成本: Low to medium.
- 风险: Medium if not maintained.
- ROI: Medium; high during maintenance/update spikes.
- 替代方案: Add a compact "Latest official notices" module to homepage and FAQ.

### Gap 3: Discord / Community Entry

Missing or weak intent:

- `task bar hero discord`
- `taskbar hero discord`
- `task bar hero discord server`
- `discord task bar hero`

Recommended page:

- Add a section to `/faq` and `/updates`; optionally a `/community` page.

Must include:

- Discord link only if verified and current.
- Steam Discussions link.
- Explain which problems should go to Discord vs Steam Discussions vs this fan site.

Decision analysis:

- 目标: Capture community navigation searches and reduce pogo-sticking.
- 约束条件: Links must be current; avoid implying official ownership if not official.
- 成本: Low.
- 风险: Low.
- ROI: Medium.
- 替代方案: Footer-only link, but current data suggests footer-only is insufficient.

### Gap 4: Build and Class Search Intent

Missing or weak intent:

- `task bar hero build`
- `taskbar hero ranger build`
- `taskbar hero sorcerer build`
- `task bar hero ranger skills`
- `taskbar hero hunter build`
- `taskbar hero priest build`
- `task bar hero archer build` (likely user synonym for Ranger/Hunter)

Recommended work:

- Add quick-answer blocks to every hero page.
- Add class-specific build sections that answer:
  - best early stat priority,
  - best skill direction,
  - best gear direction,
  - safe farming phase,
  - risk,
  - evidence level.
- Add synonym handling: Ranger = archer-like bow class; Hunter = crossbow DLC class. Do not rename game classes, but include user wording.

Decision analysis:

- 目标: Match SERP guide intent while preserving evidence quality.
- 约束条件: Build claims must be labeled as datamined, editorial, community-verified, or unverified.
- 成本: Medium.
- 风险: Medium; bad build advice can hurt trust.
- ROI: High because GSC already shows build impressions/clicks.
- 替代方案: Create one "best builds" hub first, then split into class pages after impressions prove demand.

### Gap 5: Entity Pages for Monsters, Pets, Materials

Missing or weak intent:

- `task bar hero blue golem`
- `task bar hero hell golem`
- `taskbar hero giant fly`
- `tbh bat`
- Japanese/Korean material and monster names.

Recommended work:

- Add or strengthen entity pages with:
  - what it is,
  - where it appears,
  - best stage to farm,
  - related pet/unlock if applicable,
  - drops,
  - related items/materials,
  - localized names.

Decision analysis:

- 目标: Win long-tail entity searches.
- 约束条件: Must rely on game data; no guessed drops.
- 成本: Medium if generated from existing data.
- 风险: Low.
- ROI: Medium; long-tail but scalable.
- 替代方案: Add entity sections to existing monster/pet pages before creating many standalone pages.

### Gap 6: Market / Steam Wallet / Trading Intent

Missing or weak intent:

- `task bar hero steam`
- `task bar hero market`
- money/Steam Wallet guide intent shown by Mobalytics and other guides.

Recommended work:

- Strengthen market guide pages with:
  - what can be sold,
  - Cube level/trading restrictions if verified,
  - risk warning,
  - item transfer/mailbox workflow,
  - price data limitations,
  - "do not sell before checking craft/build utility" decision tree.

Decision analysis:

- 目标: Capture market monetization searches while protecting trust.
- 约束条件: Financial-like claims require caution; do not promise income.
- 成本: Medium.
- 风险: High if claims sound like guaranteed earnings.
- ROI: High because market/Steam intent is commercially and user-value relevant.
- 替代方案: Add a stricter disclaimer and decision block to existing Steam market guide first.

## Technical Recovery Plan For Google

### Priority 0: GSC URL Migration Audit

Actions:

1. In GSC, inspect old `/en` URLs and their new canonical URLs.
2. Confirm "Google-selected canonical" for old URLs points to unprefixed equivalents.
3. Submit sitemap again after confirming it contains only intended canonical URLs.
4. Request indexing for top migrated pages:
   - `/`
   - `/heroes`
   - `/guides`
   - `/guides/farming`
   - `/tools/farming-calculator`
   - `/tools/drop-finder`
   - `/builds`
   - `/runes`
   - `/pets`
   - `/updates`

Decision analysis:

- 目标: Prove whether Google has consolidated `/en` into canonical root paths.
- 约束条件: GSC UI/API data is needed; local export alone cannot prove current canonical state.
- 成本: Low.
- 风险: Low.
- ROI: High.
- 替代方案: Wait for natural consolidation, but this risks a longer traffic trough.

### Priority 1: Do Not Randomly Change TDK/TDH

Actions:

1. Keep existing indexed page titles stable unless a page has clear mismatch.
2. Only create TDK for new pages or pages with proven poor CTR/high impressions.
3. Preserve `Task Bar Hero`, `TaskBar Hero`, and `TBH` variants naturally in content, not by stuffing titles.

Decision analysis:

- 目标: Avoid resetting Google's understanding during a migration period.
- 约束条件: Existing pages are already being reprocessed.
- 成本: Low.
- 风险: Low.
- ROI: High.
- 替代方案: Full title rewrite. Not recommended now because the current problem is likely canonical/index consolidation plus content gaps.

### Priority 2: Monitor Split By URL Bucket

Weekly tracking:

- Old `/en` impressions should decline.
- New unprefixed English impressions should rise.
- If both decline, the issue is broader than migration.
- If position remains good but impressions stay low, Google is not matching enough queries to pages.

## Content Roadmap

### Week 1

1. Create Server Status / Maintenance / Error 500 / Error 401 page.
2. Expand `/updates` with official notices and site data version history.
3. Add Discord/community support section to FAQ and Updates.
4. Add quick-answer block to `/builds` and top hero pages.

### Week 2

1. Add class-specific build sections to Ranger, Sorcerer, Knight, Priest, Hunter, Slayer.
2. Add "Ranger / archer wording" naturally to Ranger/Hunter pages.
3. Expand market guide with trading restrictions, risk, and verified workflow.
4. Add internal links from homepage and FAQ to status/update/community pages.

### Week 3

1. Strengthen monsters and pets entity pages for terms with GSC impressions.
2. Add localized name tables for Japanese/Korean material and monster searches.
3. Add Article/Breadcrumb schema where it helps extraction, but do not add FAQ schema solely for Google rich results on commercial-style pages.

## What Not To Do

- Do not mass rewrite all titles/descriptions now.
- Do not claim real-time server status unless backed by official source or an automated status feed.
- Do not make income claims around Steam Market or "earn real money" without clear risk framing.
- Do not create thin one-keyword pages for every rising query. Combine related support queries into one useful troubleshooting hub.
- Do not treat Bing traffic success as proof that Google will accept the same page format. Google SERPs currently show stronger preference for guide/tool/status packaging.

## Completion Checklist

To consider this recovery work complete, verify:

- GSC old `/en` impressions are declining while canonical unprefixed English impressions recover.
- New status/error page receives impressions for maintenance/error/server queries.
- Build pages receive impressions for class-specific build queries.
- `/updates` receives impressions for update/news/maintenance queries.
- CTR improves for `taskbar hero wiki`, `taskbarhero wiki`, `tbh wiki`, and related brand queries.
- No new TDK/TDH changes were made without page-level evidence.
