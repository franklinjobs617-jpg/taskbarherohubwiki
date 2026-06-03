# TaskBar Hero SERP and Content Gap Research

Updated: 2026-06-03

## What Searchers Want

The current visible search intent around TaskBar Hero is not brand storytelling. It is lookup intent:

- item name
- item stats
- drop source
- chest odds
- hero stats
- skill tree
- pet unlock route
- rune cost
- stage farming
- Steam Market tradability

The page that wins must answer the next action immediately.

## Competitor Signals

`taskbarherowiki.com` positions itself as an items and drop-rates database. Its home page exposes:

- 5,934 items
- 79 effects
- 41 chests
- 120 stages
- 6 heroes
- 8 pets
- 197 runes
- EXP farming tool

Its hero page is strong because it combines base attributes, active skills, passive tree, level controls, and visual art. Its pet page is strong because every pet has unlock condition and best farming stage. Its item page is strong because it shows marketability, material effects, and chest drop sources on the same page.

## Our Gaps

- Heroes were too thin: no decision layer, no weapon visual, no role comparison, no next action.
- Guides were card-only: users had to guess which article solved their question.
- Home page did not act like a database console.
- Market status was safe but not explained enough.
- Pets need unlock conditions and best farming stage logic.
- Runes need a usable visual tree or at least grouped cost/effect navigation.
- Chests need clearer missing-data states until real chest-to-item rates are mapped.
- Item detail pages need stronger “keep / sell / craft / farm” decision blocks.

## Implemented In This Pass

- Home page rebuilt as a database console with stats, task journeys, hero entry, item preview, chest entry, market state, guides, and tools.
- Heroes page rebuilt with role comparison, decision cards, weapon direction, difficulty, phase, and next actions.
- Hero detail pages rebuilt with class visual, weapon icons, base stat grid, active skill, passive nodes, stat priority, risks, related items, effects, guides, and builds.
- Guide center rebuilt around user tasks rather than raw categories.
- R2 upload script added: `npm run upload:r2`.
- Market sync deploy script added: `npm run deploy:worker`.

## Next Content Blocks

1. Pets: unlock target, required kills, best stage, bonus, map link.
2. Runes: grouped rune browser, selected rune panel, cost summary.
3. Items: decision block for keep/sell/craft/farm.
4. Chests: source stage list, level range explanation, missing rate status.
5. Guides: expand each guide to 1,200-1,800 words per language with tables and examples.
