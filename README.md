# TaskBar Hero Fan Site

双语 TaskBar Hero 粉丝资料站。当前版本目标是中文优先、英文完整，并以保守数据策略上线：有真实数据才显示市场价格、掉率和收益；数据不足时只显示正式说明。

## 本地开发

```bash
npm install
npm run normalize
npm run dev
```

访问：

- `http://localhost:3000/zh`
- `http://localhost:3000/en`

## 数据目录

原始数据：

- `data/raw/*.json`
- `data/raw/images/**`

生成数据：

- `data/generated/**`

攻略内容：

- `content/guides/zh/**`
- `content/guides/en/**`

项目内置的页面读取规范化后的本地数据。上线后，R2 用于公开分发 JSON 和图片。

## 内容规则

- 中文和英文页面必须等价完整。
- 不生成假 Steam 价格。
- 不生成假掉率。
- 收益工具在缺少掉率、市场价或清图时间时不输出收益数字。
- 攻略只写数据决策口径，不写保证收益、稳赚或最强结论。

## Vercel 部署

项目根目录：

```text
D:\Vir\tbh-fan-site
```

Build command：

```bash
npm run build
```

`package.json` 已固定：

```bash
next build --webpack
```

必填环境变量：

```text
NEXT_PUBLIC_SITE_URL=https://你的域名
NEXT_PUBLIC_R2_DATA_URL=https://你的R2公开域名或自定义域名
```

可选环境变量：

```text
NEXT_PUBLIC_GAME_VERSION=game-v1
```

## Cloudflare R2

Bucket：

```text
taskbarhero
```

上传路径：

```text
game/v1/**
market/v1/**
assets/game/**
```

本地生成：

```bash
npm run normalize
```

批量上传到 R2：

```bash
npm run upload:r2
```

脚本会上传：

- `data/generated/game/**` -> `game/**`
- `data/generated/market/**` -> `market/**`
- `public/game/**` -> `assets/game/**`

默认 bucket 是 `taskbarhero`。如果 bucket 名不同：

```bash
$env:R2_BUCKET="你的bucket名"
npm run upload:r2
```

R2 必须开启公开访问或绑定自定义域名，否则前台无法读取 JSON 和图片。

## 市场数据同步

目录：

```text
workers/market-fetcher
```

配置：

```text
workers/market-fetcher/wrangler.toml
```

绑定：

```text
R2_BUCKET=taskbarhero
```

定时：

```text
*/15 * * * *
```

当前市场同步只写入缺失状态，不抓取也不伪造价格：

- `market/v1/latest.json`
- `market/v1/unmatched.json`

只有真实抓到并匹配到 Steam 市场名称的数据，才能写入最低价、中位价、挂单数和趋势。

部署市场同步：

```bash
npm run deploy:worker
```

## 验证命令

```bash
npm run normalize
npm run lint
npm run build
```

上线后检查：

- `/zh`
- `/en`
- `/zh/items`
- `/en/items`
- `/zh/guides`
- `/en/guides`
- `/zh/market`
- `/en/market`
- `/sitemap.xml`
- `/robots.txt`
