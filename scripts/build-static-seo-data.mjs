import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://taskbarherohub.wiki";
const cdnBase = process.env.NEXT_PUBLIC_R2_DATA_URL ?? "https://cdn.taskbarherohub.wiki";
const updatedAt = new Date().toISOString().split("T")[0];
const locales = ["en", "zh", "ja", "ko"];
const guideLocales = ["en", "zh", "ja", "ko"];
const sitemapLimit = 45000;

const paths = {
  v2Root: path.join(root, "data", "generated", "game", "v2"),
  publicSitemaps: path.join(root, "public", "sitemaps"),
  publicSitemapIndex: path.join(root, "public", "sitemap.xml"),
  publicManifest: path.join(root, "public", "game", "v2", "manifest.json"),
};

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function tryReadJson(filePath) {
  try {
    return await readJson(filePath);
  } catch {
    return null;
  }
}

async function fetchJson(remotePath) {
  const url = `${cdnBase}/${remotePath}`;
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
      }
      return response.json();
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }
  throw lastError;
}

async function readLocalOrRemote(candidates, remotePath) {
  for (const candidate of candidates) {
    const value = await tryReadJson(path.join(root, candidate));
    if (value) return value;
  }
  return fetchJson(remotePath);
}

function text(value, fallback = "") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value["en-US"] ?? value.en ?? value["zh-Hans"] ?? Object.values(value)[0] ?? fallback;
}

function stageSlug(stage) {
  return stage.slug ?? `${String(stage.difficulty ?? "normal").toLowerCase()}-${stage.act}-${stage.no}`;
}

function hasRealMarketData(market) {
  return Boolean(
    market &&
      market.confidence !== "missing" &&
      (market.lowest !== null || market.median !== null || market.listings !== null || market.trend7d !== null),
  );
}

function shouldIndexItem(item, dropsBySlug, marketBySlug) {
  if (item.type === "STAGEBOX") return false;
  const hasDrops = Boolean(dropsBySlug[item.slug]?.length);
  const market = marketBySlug.get(item.slug);
  const hasRealMarket = hasRealMarketData(market);
  return hasDrops || hasRealMarket;
}

function shouldIndexChest(chest, dropsBySlug, chestIdsInStages) {
  return chest.type === "STAGEBOX" && (Boolean(dropsBySlug[chest.slug]?.length) || chestIdsInStages.has(chest.id));
}

function toUrl(locale, urlPath) {
  return locale === "en" ? `${siteUrl}${urlPath}` : `${siteUrl}/${locale}${urlPath}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function urlEntry(url, lastModified, changeFrequency, priority) {
  return [
    "  <url>",
    `    <loc>${escapeXml(url)}</loc>`,
    `    <lastmod>${lastModified}</lastmod>`,
    `    <changefreq>${changeFrequency}</changefreq>`,
    `    <priority>${priority.toFixed(2)}</priority>`,
    "  </url>",
  ].join("\n");
}

function urlEntryWithAlternates(url, lastModified, changeFrequency, priority, alternates) {
  const lines = [
    "  <url>",
    `    <loc>${escapeXml(url)}</loc>`,
    ...alternates.map(
      ([hreflang, altUrl]) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(altUrl)}"/>`,
    ),
    `    <lastmod>${lastModified}</lastmod>`,
    `    <changefreq>${changeFrequency}</changefreq>`,
    `    <priority>${priority.toFixed(2)}</priority>`,
    "  </url>",
  ];
  return lines.join("\n");
}

function sitemapXml(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`;
}

function sitemapIndexXml(files) {
  const entries = files
    .map((file) =>
      [
        "  <sitemap>",
        `    <loc>${escapeXml(`${siteUrl}/sitemaps/${file}`)}</loc>`,
        `    <lastmod>${updatedAt}</lastmod>`,
        "  </sitemap>",
      ].join("\n"),
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value)}\n`);
}

async function writeSitemapFile(fileName, entries) {
  await fs.mkdir(paths.publicSitemaps, { recursive: true });
  await fs.writeFile(path.join(paths.publicSitemaps, fileName), sitemapXml(entries));
  return fileName;
}

function extractSlugObjects(source, exportName) {
  const start = source.indexOf(`export const ${exportName}`);
  if (start === -1) return [];
  const end = source.indexOf("];", start);
  if (end === -1) return [];
  const block = source.slice(start, end);
  const rows = [];
  const regex = /slug:\s*"([^"]+)"(?:[\s\S]{0,240}?category:\s*"([^"]+)")?/g;
  for (const match of block.matchAll(regex)) {
    rows.push({ slug: match[1], category: match[2] ?? null });
  }
  return rows;
}

async function readStaticContentSlugs() {
  const source = await fs.readFile(path.join(root, "src", "lib", "game-data", "data.ts"), "utf8");
  return {
    guides: extractSlugObjects(source, "guides").filter((row) => row.category),
    builds: extractSlugObjects(source, "builds"),
    wikiArticles: extractSlugObjects(source, "wikiArticles"),
    achievements: extractSlugObjects(source, "achievements"),
  };
}

function itemSummary(item, details, dropsBySlug, marketBySlug, extItemById) {
  const market = marketBySlug.get(item.slug) ?? null;
  const extItem = extItemById.get(item.id);
  return {
    id: item.id,
    slug: item.slug,
    type: item.type,
    grade: item.grade,
    gear: item.gear,
    level: item.level,
    name: item.name,
    icon: item.icon,
    marketable: item.marketable,
    hasDrops: Boolean(dropsBySlug[item.slug]?.length),
    hasMarketData: hasRealMarketData(market),
    market,
    classFit: extItem?.classes ?? [],
    obtainable: extItem?.obtainable ?? true,
    detailSummary: {
      desc: details[String(item.id)]?.desc ?? null,
      stats: details[String(item.id)]?.stats ?? null,
      synthType: details[String(item.id)]?.synthType ?? null,
      dropKey: details[String(item.id)]?.dropKey ?? null,
      uniqueMod: details[String(item.id)]?.uniqueMod ?? null,
    },
  };
}

function relatedItemsFor(item, items) {
  return items
    .filter((entry) => entry.id !== item.id && entry.type === item.type && (entry.grade === item.grade || entry.gear === item.gear))
    .slice(0, 8)
    .map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      type: entry.type,
      grade: entry.grade,
      gear: entry.gear,
      level: entry.level,
      name: entry.name,
      icon: entry.icon,
      marketable: entry.marketable,
    }));
}

async function main() {
  const [
    items,
    details,
    heroes,
    stages,
    monsters,
    runes,
    skills,
    dropsBySlug,
    marketRaw,
    extItems,
    extStages,
  ] = await Promise.all([
    readLocalOrRemote(["data/generated/game/v1/items/index.en.json"], "game/v1/items/index.en.json"),
    readLocalOrRemote(["tbh_data/items_detail.json"], "game/v1/items_detail.json"),
    readLocalOrRemote(["data/generated/game/v1/heroes/index.en.json"], "game/v1/heroes/index.en.json"),
    readLocalOrRemote(["data/generated/game/v1/stages/index.en.json"], "game/v1/stages/index.en.json"),
    readLocalOrRemote(["tbh_data/monsters.json", "data/generated/game/v1/monsters/index.en.json"], "game/v1/monsters/index.en.json"),
    readLocalOrRemote(["data/generated/game/v1/runes/index.en.json"], "game/v1/runes/index.en.json"),
    readLocalOrRemote(["data/generated/game/v1/skills/index.en.json"], "game/v1/skills/index.en.json"),
    readLocalOrRemote(["data/generated/drops.json"], "game/v1/drops.json"),
    readLocalOrRemote(["data/generated/market/v1/latest.json"], "market/v1/latest.json").catch(() => []),
    readLocalOrRemote(["tbh_external/items.json"], "game/v1/enriched/items.json").catch(() => []),
    readLocalOrRemote(["tbh_external/stages.json"], "game/v1/enriched/stages.json").catch(() => []),
  ]);

  const marketItems = Array.isArray(marketRaw) ? marketRaw : marketRaw.items ?? [];
  const marketBySlug = new Map(marketItems.map((row) => [row.slug, row]));
  const extItemById = new Map(extItems.map((row) => [row.key, row]));
  const chestIdsInStages = new Set(extStages.flatMap((stage) => (stage.drops ?? []).map((drop) => drop.itemKey)));
  const staticSlugs = await readStaticContentSlugs();

  await fs.rm(paths.v2Root, { recursive: true, force: true });
  const indexLight = items.map((item) => itemSummary(item, details, dropsBySlug, marketBySlug, extItemById));
  const indexPreview = [...indexLight]
    .sort((a, b) => (b.level ?? 0) - (a.level ?? 0))
    .slice(0, 120);
  await writeJson(path.join(paths.v2Root, "items", "index-light.json"), indexLight);
  await writeJson(path.join(paths.v2Root, "items", "index-preview.json"), indexPreview);

  for (const item of items) {
    const summary = itemSummary(item, details, dropsBySlug, marketBySlug, extItemById);
    await writeJson(path.join(paths.v2Root, "items", "by-slug", `${item.slug}.json`), {
      item: summary,
      detail: details[String(item.id)] ?? null,
      market: marketBySlug.get(item.slug) ?? null,
      drops: dropsBySlug[item.slug] ?? [],
      related: relatedItemsFor(item, items),
      shouldIndex: shouldIndexItem(item, dropsBySlug, marketBySlug),
    });
    await writeJson(path.join(paths.v2Root, "items", "detail-by-id", `${item.id}.json`), details[String(item.id)] ?? null);
    await writeJson(path.join(paths.v2Root, "drops", "by-item", `${item.slug}.json`), dropsBySlug[item.slug] ?? []);
    await writeJson(path.join(paths.v2Root, "market", "by-slug", `${item.slug}.json`), marketBySlug.get(item.slug) ?? null);
    if (item.type === "STAGEBOX") {
      await writeJson(path.join(paths.v2Root, "chests", "by-slug", `${item.slug}.json`), {
        chest: summary,
        drops: dropsBySlug[item.slug] ?? [],
        shouldIndex: shouldIndexChest(item, dropsBySlug, chestIdsInStages),
      });
    }
  }

  const manifest = {
    version: "game-v2",
    generatedAt: new Date().toISOString(),
    updatedAt,
    entityCounts: {
      items: items.length,
      indexableItems: items.filter((item) => shouldIndexItem(item, dropsBySlug, marketBySlug)).length,
      heroes: heroes.length,
      monsters: monsters.length,
      stages: stages.length,
      runes: runes.length,
      skills: skills.length,
    },
    sitemapIndex: `${siteUrl}/sitemap.xml`,
  };
  await writeJson(path.join(paths.v2Root, "manifest.json"), manifest);
  await writeJson(paths.publicManifest, manifest);

  const updated = updatedAt;
  const staticPaths = [
    "", "/items", "/market", "/chests", "/effects", "/map", "/stages",
    "/heroes", "/runes", "/skills", "/pets", "/monsters", "/guides", "/builds",
    "/buffs", "/cube", "/guides/farming",
    "/tools/drop-finder", "/tools/farming-optimizer", "/tools/profit-calculator",
    "/tools/farming-compare", "/tools/farming-calculator",
    "/server-status", "/updates", "/faq", "/about", "/privacy", "/terms", "/contact",
    "/tools", "/wiki", "/database", "/achievements",
  ];

  function allLocaleAlts(localeList, urlPath) {
    return localeList.map((l) => [l, toUrl(l, urlPath)]);
  }

  function withDefault(localeList, urlPath) {
    const alts = allLocaleAlts(localeList, urlPath);
    alts.push(["x-default", toUrl("en", urlPath)]);
    return alts;
  }

  const groups = {
    "static.xml": staticPaths.map((urlPath) =>
      urlEntryWithAlternates(toUrl("en", urlPath), updated, "weekly", urlPath === "" ? 1 : 0.7, withDefault(locales, urlPath)),
    ),
    "items-1.xml": items
      .filter((item) => item.type !== "STAGEBOX" && shouldIndexItem(item, dropsBySlug, marketBySlug))
      .map((item) => {
        const urlPath = `/items/${item.slug}`;
        return urlEntryWithAlternates(toUrl("en", urlPath), updated, "monthly", 0.65, withDefault(locales, urlPath));
      }),
    "market-1.xml": items
      .filter((item) => hasRealMarketData(marketBySlug.get(item.slug)))
      .map((item) => {
        const urlPath = `/market/${item.slug}`;
        return urlEntryWithAlternates(toUrl("en", urlPath), updated, "daily", 0.7, withDefault(locales, urlPath));
      }),
    "chests.xml": items
      .filter((item) => shouldIndexChest(item, dropsBySlug, chestIdsInStages))
      .map((item) => {
        const urlPath = `/chests/${item.slug}`;
        return urlEntryWithAlternates(toUrl("en", urlPath), updated, "monthly", 0.6, withDefault(locales, urlPath));
      }),
    "stages.xml": stages.map((stage) => {
      const urlPath = `/stages/${stageSlug(stage)}`;
      return urlEntryWithAlternates(toUrl("en", urlPath), updated, "monthly", 0.6, withDefault(locales, urlPath));
    }),
    "heroes.xml": heroes.map((hero) => {
      const urlPath = `/heroes/${hero.slug ?? hero.ClassType?.toLowerCase() ?? hero.HeroKey}`;
      return urlEntryWithAlternates(toUrl("en", urlPath), updated, "monthly", 0.6, withDefault(locales, urlPath));
    }),
    "monsters.xml": monsters.map((monster) => {
      const urlPath = `/monsters/${monster.slug ?? monster.MonsterKey}`;
      return urlEntryWithAlternates(toUrl("en", urlPath), updated, "monthly", 0.6, withDefault(locales, urlPath));
    }),
    "guides.xml": [
      ...staticSlugs.guides.map((guide) => {
        const urlPath = `/guides/${guide.category}/${guide.slug}`;
        return urlEntryWithAlternates(toUrl("en", urlPath), updated, "weekly", 0.75, withDefault(guideLocales, urlPath));
      }),
      ...staticSlugs.builds.map((build) => {
        const urlPath = `/builds/${build.slug}`;
        return urlEntryWithAlternates(toUrl("en", urlPath), updated, "weekly", 0.6, withDefault(locales, urlPath));
      }),
      ...staticSlugs.wikiArticles.map((article) => {
        const urlPath = `/wiki/${article.slug}`;
        return urlEntryWithAlternates(toUrl("en", urlPath), updated, "weekly", 0.7, withDefault(locales, urlPath));
      }),
      ...staticSlugs.achievements.map((achievement) => {
        const urlPath = `/achievements/${achievement.slug}`;
        return urlEntryWithAlternates(toUrl("en", urlPath), updated, "monthly", 0.6, withDefault(locales, urlPath));
      }),
    ],
  };

  await fs.rm(paths.publicSitemaps, { recursive: true, force: true });
  const sitemapFiles = [];
  for (const [name, entries] of Object.entries(groups)) {
    if (entries.length <= sitemapLimit) {
      sitemapFiles.push(await writeSitemapFile(name, entries));
      continue;
    }
    for (let index = 0; index < entries.length; index += sitemapLimit) {
      const fileName = name.replace(".xml", `-${Math.floor(index / sitemapLimit) + 1}.xml`);
      sitemapFiles.push(await writeSitemapFile(fileName, entries.slice(index, index + sitemapLimit)));
    }
  }

  await fs.writeFile(paths.publicSitemapIndex, sitemapIndexXml(sitemapFiles));

  const totalUrls = Object.values(groups).reduce((sum, entries) => sum + entries.length, 0);
  console.log(`Generated game/v2 data for ${items.length} items`);
  console.log(`Generated ${sitemapFiles.length} sitemap files with ${totalUrls} URLs`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
