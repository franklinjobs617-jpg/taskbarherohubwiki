# TBH Wiki Data and UX Completion Plan

## Goal

Build the site so a player can find any Task Bar Hero entity, understand what it is used for, and move between related items, stages, monsters, chests, skills, pets, runes, and market context without dead ends.

## Current Evidence

- Local datamined tables are the primary source for facts: 5,944 items, 120 stages, 61 monsters, 6 heroes, 197 runes, 106 active skills, 29 buffs, 10 grades.
- Local images verified by `scripts/verify-all-images.mjs`: materials, boxes, gear, monsters, bosses, heroes, runes, pets, effects, hero art, and hero animation sprites are covered.
- Skill icons are not complete: `public/game/skills` is absent, and current Unity texture objects do not expose reliable names for automatic `Skill_<id>` mapping.
- Steam market prices are not complete: current market rows are status-only/missing and contain no reliable lowest/listing/trend values.
- Drop/source graph is partial: item direct drop data and chest source coverage are not yet full.

## User Path Requirements

Every clickable user path must resolve to one of these outcomes:

- A real route with populated data.
- A filtered state that changes the visible result set.
- A disabled/unavailable state that clearly says why data is not available.

No link should point to a guessed route that can 404 for normal player behavior.

## Required Data Coverage

- Items: name, type, grade, icon, stats where applicable, material effects where applicable, related drops/source chain when known.
- Chests: icon, contents, content chance, source stages, best source when known.
- Stages: difficulty, act/stage number, level, monsters, boss, rewards, chest drops, expected runs.
- Monsters: image, stats/rewards, stage appearances, pet unlock context where applicable.
- Heroes: image, stats, weapons, active skill mapping, passive/attribute tree.
- Skills: name, description, activation, range/value/scaling, hero ownership, icon when a verified mapping exists.
- Pets: icon, unlock target, kill count, best known farming stage, stat bonus.
- Market: only show real prices when snapshot data exists; otherwise show tradable context without pretending prices exist.

## Verification Gates

Run these without `npm run build` unless build is explicitly requested:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run check:mojibake`
- `node scripts/verify-all-images.mjs`
- `node scripts/verify-pages.mjs --base http://localhost:3001`
- Browser click checks for: home search, skills hero filter, skill detail, chest list/detail, stage alias detail, stage-to-monster click, map-to-stage click, market unavailable state, mobile nav.

## Remaining Work

1. Skill icons: export candidate textures from Unity assets, create a verified mapping table, then add `public/game/skills/Skill_<id>.png`.
2. Drop graph: expand item->chest->stage source chains beyond current partial coverage and report unknowns explicitly.
3. Market: fetch or intentionally disable real price UI until Steam market snapshots contain price/listing/trend fields.
4. Link audit: add an automated crawler for rendered internal links across top pages, not only the static path list.
5. Mobile audit: verify all high-traffic paths at 390px and 768px viewports for overflow, hidden controls, and tap target issues.
