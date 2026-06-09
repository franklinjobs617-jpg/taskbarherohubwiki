# TBH Fan Site Competitor Review

Date: 2026-06-09

## First Principles

Single-game traffic does not grow because a site has more pages. It grows when players can solve repeated game tasks faster than on competing sites.

For TBH, the core user tasks are:

- Find where an item drops.
- Decide which stage to farm.
- Compare gear, rarity, level, class fit, and market value.
- Build or import a team setup.
- Check game version changes and market status.
- Return later because the tool keeps tracking something useful.

The current site is worth improving because it already has strong extracted data and many indexed pages. The bottleneck is not raw data volume. The bottleneck is task execution and retention.

## Screenshots Captured

Own site:

- `output/playwright/own-home-desktop.png`
- `output/playwright/own-home-mobile.png`
- `output/playwright/own-items-desktop.png`
- `output/playwright/own-farming-tool-desktop.png`

Competitors:

- `output/playwright/competitor-taskbarhero-wiki-desktop.png`
- `output/playwright/competitor-taskbarhero-wiki-mobile.png`
- `output/playwright/competitor-taskbarhero-wiki-gear.png`
- `output/playwright/competitor-taskbarhero-wiki-drops.png`
- `output/playwright/competitor-taskbarhero-wiki-farming.png`
- `output/playwright/competitor-tbherohelper-desktop.png`
- `output/playwright/competitor-tbherohelper-mobile.png`
- `output/playwright/competitor-tbherohelper-database.png`
- `output/playwright/competitor-tbherohelper-builds.png`
- `output/playwright/competitor-tbherohelper-meter.png`
- `output/playwright/competitor-task-bar-hero-wiki-desktop.png`
- `output/playwright/competitor-task-bar-hero-wiki-mobile.png`
- `output/playwright/competitor-taskbarhero-app-desktop.png`
- `output/playwright/competitor-taskbarhero-app-mobile.png`
- `output/playwright/competitor-tbhtaskbarhero-wiki-desktop.png`

## Competitor Map

| Site | Type | Strong Point | Weak Point | Threat Level |
|---|---|---|---|---|
| `taskbarhero.wiki` | Database + tools | Full sidebar taxonomy, Drop Finder, Farming Optimizer, Save Inspector | Heavy HTML, mobile overflow | High |
| `tbherohelper.com` | Product tool + community | TBH Meter, tracker, leaderboards, builds, global search | Some pages show skeleton/empty states | Very high |
| `taskbarhero.app` | SEO landing + beginner guide | Strong beginner funnel, tier list, quick start hub | Less database depth | Medium |
| `task-bar-hero.wiki` | Chinese SEO guide | Clear new-user explanation, guide/tier navigation | Shallow tools/data | Medium |
| `tbhtaskbarhero.wiki` | Content guide | Covers broad guide keywords | Generic, low product depth | Low-medium |

## Hard Gaps

### 1. Task execution is weaker than competitors

This is the biggest problem.

Our homepage says the site has `5,944 Items`, `Drop Finder`, `Steam Market`, and `Farming Planner`, but the user still has to infer what to click.

`taskbarhero.wiki` exposes concrete tools immediately:

- Farming Optimizer
- Drop Finder
- Save Inspector
- Gear
- Stages
- Runes
- Cube systems

`tbherohelper.com` goes further:

- TBH Meter
- Tracker
- Leaderboards
- Build Planner
- Build import
- DPS proof loop

This is not a cosmetic gap. This is a retention gap.

### 2. Mobile first screen has functional defects

The current mobile homepage cuts off the H1 horizontally and pushes the search button partly out of view. This is a direct usability failure.

Competitors also have some mobile overflow, but their primary action remains obvious. Our mobile first screen damages trust because the main title and search entry are broken.

### 3. Item database is too card-heavy and too slow

Observed HTML size:

- Own `/en/items`: `929,480` bytes
- `tbherohelper.com/database`: `39,666` bytes
- `taskbarhero.wiki/gear`: `8,394,067` bytes

The competitor `taskbarhero.wiki` is heavier, but its filters are more player-oriented:

- rarity buttons
- type buttons
- level slider
- obtainable-only toggle

Our item page shows many cards, but not enough decision columns. The user cannot quickly answer:

- where does this drop?
- is it marketable?
- which class uses it?
- is it obtainable?
- what level band is it in?

### 4. Farming tool is less actionable

Our farming calculator has the right idea, but the first screen is mostly empty until the user searches.

`taskbarhero.wiki/tools/farming` starts with a route model:

- hero level
- EXP bonus
- clear time
- optimize for EXP or gold
- calibration stages

This matches the real player question: "Given my current state, where should I farm now?"

Our tool currently answers a narrower question: "Can I calculate a specific thing after selecting data?"

### 5. No community loop

`tbherohelper.com` has a loop:

1. Track DPS.
2. Save run history.
3. Upload or compare.
4. See leaderboards.
5. Return to improve.

Our site has no equivalent loop. This means users can get one answer and leave.

### 6. New-user funnel is weaker

`taskbarhero.app` and `task-bar-hero.wiki` are not stronger databases, but they are better landing pages for beginners.

They answer:

- what is this game?
- where do I start?
- what class should I pick?
- what route should I follow?

Our homepage is more useful to someone who already knows they need a database. It is weaker for new players coming from search.

## What Not To Do

Do not spend the next cycle making the homepage prettier. That has low ROI.

Do not write 30 more generic guides before fixing task pages. That will add surface area without solving bounce or retention.

Do not copy `tbherohelper.com` visually. Its advantage is not its palette. Its advantage is the player loop.

Do not compete on fake market/profit promises. The current restraint around real market data is correct and should stay.

## Priority Plan

### P0: Fix obvious mobile and trust defects

- Fix mobile H1 wrapping on homepage.
- Fix mobile search form width/button visibility.
- Make version/date/data source visible near primary tools.
- Ensure Chinese/Japanese/Korean strings render correctly in source and UI.

### P1: Turn the homepage into a task hub

Replace generic quick links with task cards:

- "Find where an item drops"
- "Compare farming stages"
- "Check tradable market items"
- "Pick a beginner class"
- "Plan Cube upgrades"
- "Browse latest patch impact"

Each card should lead to a specific executable page, not a broad category.

### P1: Build a real Drop Finder page

This should be a first-class route, not buried inside farming calculator tabs.

Required modes:

- by item: show all sources, stage, chest, rate, availability
- by stage: show loot table and important drops
- by chest: show contents and probabilities

### P1: Upgrade Farming Calculator into Farming Optimizer

Inputs:

- current hero level
- EXP bonus
- gold priority vs EXP priority
- average clear time
- optional current unlocked stage

Output:

- best stage now
- second-best fallback
- expected EXP/hour or gold/hour
- confidence/data limitation notice

### P2: Make Item Database more decision-oriented

Add dense table mode or compact rows:

- icon
- name
- level
- rarity
- slot/type
- class fit
- market status
- source/drop shortcut

Keep cards as visual mode, but default to the faster decision view on desktop.

### P2: Create retention hooks

Small version first:

- local build planner saved in browser
- compare saved builds
- shareable build URL
- recent searches/history
- "my farming route" saved locally

Do not attempt a full downloadable DPS meter first. That is high effort and high trust risk.

### P3: SEO content coverage

Create or strengthen pages around high-intent tasks:

- best class for beginners
- class tier list
- best farming stage by level
- cube upgrade guide
- item drop locations
- Steam market status
- patch notes impact

Each guide should have a quick-answer block before long prose.

## Bottom Line

The site already has enough data to compete. The current problem is that the data is presented as a library, while the strongest competitors present it as a set of tools.

The highest ROI direction is:

1. Fix mobile first-screen defects.
2. Promote task-based navigation.
3. Build a first-class Drop Finder.
4. Convert farming calculator into an optimizer.
5. Add saved/shareable player workflows.

