import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, "tbh_data");
const externalDir = path.join(root, "tbh_external");
const marketFile = path.join(root, "data", "generated", "market", "v1", "latest.json");
const dropsFile = path.join(root, "data", "generated", "drops.json");
const outDir = path.join(root, "data", "generated", "game", "v1", "enriched");
const generatedAt = new Date().toISOString();

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function safeReadJson(file, fallback) {
  return fs.existsSync(file) ? readJson(file) : fallback;
}

function localizedName(record, locale = "en-US") {
  return record?.[locale] ?? record?.["en-US"] ?? record?.["zh-Hans"] ?? Object.values(record ?? {})[0] ?? "";
}

function marketFreshness(record) {
  if (!record?.updatedAt) return "missing";
  const ageMs = Date.now() - new Date(record.updatedAt).getTime();
  if (!Number.isFinite(ageMs)) return "missing";
  if (ageMs > 24 * 60 * 60 * 1000) return "stale";
  return "fresh";
}

function confidenceRank(value) {
  return { datamined: 4, high: 4, medium: 3, low: 2, editorial: 2, community: 2, missing: 1, unverified: 0 }[value] ?? 0;
}

const items = readJson(path.join(sourceDir, "items.json"));
const details = readJson(path.join(sourceDir, "items_detail.json"));
const stages = readJson(path.join(sourceDir, "stages.json"));
const heroes = readJson(path.join(sourceDir, "heroes.json"));
const runes = readJson(path.join(sourceDir, "runes.json"));
const extItems = safeReadJson(path.join(externalDir, "items.json"), []);
const extStages = safeReadJson(path.join(externalDir, "stages.json"), []);
const extHeroes = safeReadJson(path.join(externalDir, "heroes.json"), []);
const marketLatest = safeReadJson(marketFile, { items: [] });
const drops = safeReadJson(dropsFile, {});

const extItemById = new Map(extItems.map((item) => [item.key, item]));
const extStageByKey = new Map(extStages.map((stage) => [stage.key, stage]));
const extHeroByKey = new Map(extHeroes.map((hero) => [hero.key ?? hero.HeroKey, hero]));
const marketBySlug = new Map((marketLatest.items ?? []).map((row) => [row.slug, row]));

function dropSummary(slug) {
  const sources = Array.isArray(drops[slug]) ? drops[slug] : [];
  let bestStage = null;
  let bestChance = 0;
  let stageCount = 0;

  for (const source of sources) {
    for (const stage of source.stages ?? []) {
      stageCount += 1;
      const chance = (Number(source.drop_chance ?? 0) / 100) * (Number(stage.rate ?? 0) / 1000);
      if (chance > bestChance) {
        bestChance = chance;
        bestStage = {
          key: stage.key,
          slug: stage.slug,
          act: stage.act,
          no: stage.no,
          difficulty: stage.diff,
          chance,
          box: source.box_name,
        };
      }
    }
  }

  return {
    hasData: sources.length > 0,
    sourceCount: sources.length,
    stageCount,
    bestStage,
    confidence: sources.length > 0 ? "community" : "missing",
  };
}

const enrichedItems = items.map((item) => {
  const ext = extItemById.get(item.id);
  const market = marketBySlug.get(item.slug) ?? null;
  const drop = dropSummary(item.slug);
  const detail = details[String(item.id)] ?? null;

  return {
    id: item.id,
    slug: item.slug,
    type: item.type,
    name: item.name,
    displayName: localizedName(item.name),
    grade: item.grade,
    gear: item.gear,
    level: item.level,
    icon: item.icon,
    marketable: Boolean(item.marketable),
    decision: {
      classFit: ext?.classes ?? [],
      obtainable: ext?.obtainable ?? drop.hasData,
      tradable: Boolean(item.marketable || ext?.tradable),
      hasStats: Boolean(detail?.stats || ext?.stats),
      hasDropData: drop.hasData,
      marketFreshness: marketFreshness(market),
      action: drop.hasData ? "farm" : item.marketable ? "market-check" : "reference-only",
    },
    drops: drop,
    market: market
      ? {
          lowest: market.lowest,
          listings: market.listings,
          confidence: market.confidence,
          updatedAt: market.updatedAt,
          freshness: marketFreshness(market),
        }
      : null,
    _meta: {
      source: "merged",
      sourceUrl: item.slug ? `/items/${item.slug}` : null,
      updatedAt: generatedAt,
      confidence: confidenceRank(drop.confidence) > 1 ? "medium" : "datamined",
      mergePolicy: "local-datamined > steam-market > external-structured > editorial",
      contributors: {
        local: true,
        externalStructured: Boolean(ext),
        steamMarket: Boolean(market),
        drops: drop.hasData,
      },
    },
  };
});

const enrichedStages = stages.map((stage) => {
  const ext = extStageByKey.get(stage.key);
  const stageDrops = enrichedItems
    .filter((item) => item.drops.bestStage?.key === stage.key)
    .sort((a, b) => (b.drops.bestStage?.chance ?? 0) - (a.drops.bestStage?.chance ?? 0))
    .slice(0, 20)
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.displayName,
      grade: item.grade,
      chance: item.drops.bestStage?.chance ?? 0,
    }));

  return {
    key: stage.key,
    slug: stage.slug ?? `${String(stage.difficulty).toLowerCase()}-${stage.act}-${stage.no}`,
    difficulty: stage.difficulty,
    act: stage.act,
    no: stage.no,
    level: stage.level,
    name: stage.name,
    goldPerClear: stage.goldPerClear ?? null,
    expPerClear: stage.expPerClear ?? null,
    kills: stage.kills ?? null,
    decision: {
      hasRewardData: stage.goldPerClear != null || stage.expPerClear != null,
      notableDropCount: stageDrops.length,
      monsterCount: ext?.monsters?.length ?? stage.monsterCount ?? null,
      bossName: ext?.boss?.name ?? localizedName(stage.boss?.name),
    },
    notableDrops: stageDrops,
    _meta: {
      source: "merged",
      sourceUrl: `/stages/${stage.key}`,
      updatedAt: generatedAt,
      confidence: "datamined",
      mergePolicy: "local-datamined > external-structured",
      contributors: {
        local: true,
        externalStructured: Boolean(ext),
      },
    },
  };
});

const enrichedHeroes = heroes.map((hero) => {
  const key = hero.HeroKey;
  const ext = extHeroByKey.get(key);
  const classType = hero.ClassType ?? ext?.name ?? String(key);
  const compatibleItems = enrichedItems.filter((item) => item.decision.classFit.includes(classType));

  return {
    key,
    slug: hero.slug ?? String(classType).toLowerCase(),
    classType,
    name: hero.HeroNameKey_i18n ?? ext?.name ?? {},
    stats: {
      hp: hero.MaxHp ?? null,
      armor: hero.Armor ?? null,
      attackDamage: hero.AttackDamage ?? null,
      attackSpeed: hero.AttackSpeed ?? null,
      critChance: hero.CriticalChance ?? null,
      critDamage: hero.CriticalDamage ?? null,
    },
    decision: {
      compatibleItemCount: compatibleItems.length,
      earlyGear: compatibleItems.filter((item) => (item.level ?? 999) <= 30).slice(0, 12).map((item) => item.slug),
      endgameGear: compatibleItems.filter((item) => (item.level ?? 0) >= 80).slice(0, 12).map((item) => item.slug),
    },
    _meta: {
      source: "merged",
      sourceUrl: `/heroes/${hero.slug ?? String(classType).toLowerCase()}`,
      updatedAt: generatedAt,
      confidence: "datamined",
      mergePolicy: "local-datamined > external-structured > editorial",
      contributors: {
        local: true,
        externalStructured: Boolean(ext),
      },
    },
  };
});

const manifest = {
  version: "game-v1",
  generatedAt,
  source: "local enrichment pipeline",
  entityCounts: {
    items: enrichedItems.length,
    stages: enrichedStages.length,
    heroes: enrichedHeroes.length,
    runes: runes.length,
  },
  rules: {
    userVisibleSource: false,
    internalSourceRequired: true,
    marketStaleAfterHours: 24,
    mergePolicy: "local-datamined > steam-market > external-structured > editorial",
  },
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "items.json"), JSON.stringify(enrichedItems, null, 2));
fs.writeFileSync(path.join(outDir, "stages.json"), JSON.stringify(enrichedStages, null, 2));
fs.writeFileSync(path.join(outDir, "heroes.json"), JSON.stringify(enrichedHeroes, null, 2));
fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(`Wrote enriched data to ${outDir}`);
console.log(JSON.stringify(manifest.entityCounts));
