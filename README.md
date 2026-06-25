# TaskBar Hero Fan Site

TaskBar Hero fan site built with Next.js, Tailwind CSS, and `next-intl`.

## Local Development

```bash
npm install
npm run normalize
npm run dev
```

Default local URLs:

- `http://localhost:3000/zh`
- `http://localhost:3000/en`
- `http://localhost:3000/ja`
- `http://localhost:3000/ko`

## Data Layout

Source data:

- `tbh_data/**`
- `tbh_external/**`

Generated data:

- `data/generated/**`

Static media:

- `public/game/**`

## Cloudflare Workers Deployment

This repository is configured for Next.js on Cloudflare Workers through `@opennextjs/cloudflare`.

Key deployment files:

- `wrangler.jsonc`
- `open-next.config.ts`
- `public/_headers`

Required environment variables:

```text
NEXT_PUBLIC_SITE_URL=https://taskbarherohub.wiki
NEXT_PUBLIC_R2_DATA_URL=https://your-r2-public-domain
NEXT_PUBLIC_GAME_VERSION=game-v1
NEXT_PUBLIC_GA_ID=G-NCXRNDQ4Q0
```

Recommended deployment flow:

```bash
npm run normalize
npm run upload:r2
npm run deploy
```

Local Cloudflare preview:

```bash
npm run preview
```

## R2 Upload

Upload generated JSON and static game assets to R2:

```bash
npm run upload:r2
```

Default bucket:

```text
taskbarhero
```

Override bucket name:

```bash
$env:R2_BUCKET="your-bucket-name"
npm run upload:r2
```

The upload script maps:

- `data/generated/game/**` -> `game/**`
- `data/generated/market/**` -> `market/**`
- `public/game/**` -> `assets/game/**`

## Verification

Non-build checks:

```bash
npm run check:mojibake
npm run lint
npm run cf-typegen
```

Important production routes:

- `/zh`
- `/en`
- `/ja`
- `/ko`
- `/zh/items`
- `/zh/heroes`
- `/zh/market`
- `/sitemap.xml`
- `/robots.txt`
