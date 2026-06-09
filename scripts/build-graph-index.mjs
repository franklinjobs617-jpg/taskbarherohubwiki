import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const generatedAt = new Date().toISOString();
const outDir = path.join(root, "data", "generated", "game", "v1", "graph");

function readJson(file, fallback = null) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function localName(names, fallback = "") {
  if (!names) return fallback;
  return names["en-US"] ?? names["en-us"] ?? names.en ?? names["zh-Hans"] ?? names["zh-hans"] ?? Object.values(names)[0] ?? fallback;
}

function routeFor(kind, key, name) {
  const slug = `${key}-${slugify(name)}`;
  if (kind === "material") return `https://tbherohelper.com/materials/${slug}`;
  if (kind === "monster") return `https://tbherohelper.com/monsters/${slug}`;
  if (kind === "stage") return `https://tbherohelper.com/stages/${key}`;
  return `https://tbherohelper.com/items/${key}`;
}

function meta(sourceUrl, confidence = "high", mergePolicy = "competitor-public-structured > local-datamined > steam-market") {
  return {
    source: "merged-internal-graph",
    sourceUrl,
    updatedAt: generatedAt,
    confidence,
    mergePolicy,
  };
}

function marketFreshness(row) {
  if (!row?.updatedAt) return "missing";
  const ageMs = Date.now() - new Date(row.updatedAt).getTime();
  if (!Number.isFinite(ageMs)) return "missing";
  return ageMs > 24 * 60 * 60 * 1000 ? "stale" : "fresh";
}

function formatStatName(stat) {
  return String(stat ?? "")
    .replace(/Percent$/i, " Percent")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\bHp\b/g, "HP")
    .trim();
}

function normalizeStatValue(stat) {
  if (stat == null) return null;
  const mod = stat.mod ?? stat.modType;
  const raw = stat.value ?? stat.min ?? stat.max;
  if (raw == null) return null;
  if (mod === "ADDITIVE") return Number((raw / 10).toFixed(1));
  if (/Percent$/i.test(stat.stat ?? stat.statType ?? "")) return Number((raw / 10).toFixed(1));
  return raw;
}

function formatStatRow(stat) {
  const statName = stat.stat ?? stat.statType;
  const min = stat.min != null ? normalizeStatValue({ ...stat, value: stat.min }) : null;
  const max = stat.max != null ? normalizeStatValue({ ...stat, value: stat.max }) : null;
  const value = stat.value != null ? normalizeStatValue(stat) : null;
  const suffix = /Percent$/i.test(statName) || stat.mod === "ADDITIVE" || stat.modType === "ADDITIVE" ? "%" : "";
  const displayValue = min != null && max != null
    ? `+${min}${min === max ? "" : `~${max}`}${suffix}`
    : value != null
      ? `+${value}${suffix}`
      : null;

  return {
    stat: statName,
    label: formatStatName(statName),
    mod: stat.mod ?? stat.modType ?? null,
    value: stat.value ?? null,
    min: stat.min ?? null,
    max: stat.max ?? null,
    minTier: stat.minTier ?? null,
    maxTier: stat.maxTier ?? null,
    chance: stat.chance ?? null,
    displayValue,
    display: displayValue ? `${formatStatName(statName)} ${displayValue}` : formatStatName(statName),
  };
}

function rateToPercent(rate) {
  if (rate == null) return null;
  return Number((Number(rate) / 10).toFixed(4));
}

const localItems = readJson(path.join(root, "tbh_data", "items.json"), []);
const localDetails = readJson(path.join(root, "tbh_data", "items_detail.json"), {});
const localStages = readJson(path.join(root, "tbh_data", "stages.json"), []);
const marketLatest = readJson(path.join(root, "data", "generated", "market", "v1", "latest.json"), { items: [] });
const competitor = readJson(path.join(root, "data", "generated", "game", "v1", "competitor-public", "tbh-helper.json"), null);

if (!competitor) {
  throw new Error("Missing competitor public data. Run npm run competitor:fetch first.");
}

const comp = competitor.data;
const compItemByKey = new Map((comp.items ?? []).map((item) => [item.key, item]));
const localItemById = new Map(localItems.map((item) => [item.id, item]));
const compStageByKey = new Map((comp.stages ?? []).map((stage) => [stage.key, stage]));
const compMonsterByKey = new Map((comp.monsters ?? []).map((monster) => [monster.key, monster]));
const marketBySlug = new Map((marketLatest.items ?? []).map((row) => [row.slug, row]));
const marketByName = new Map((marketLatest.items ?? []).map((row) => [String(row.name ?? "").toLowerCase(), row]));

const graphItemsByKey = new Map();
const chestContentsByChestKey = new Map();
const itemSourcesByItemKey = new Map();
const chestSourcesByChestKey = new Map();
const stageDropsByStageKey = new Map();

function itemIdentity(key) {
  const compItem = compItemByKey.get(key);
  const localItem = localItemById.get(key);
  const name = compItem?.name ?? localName(localItem?.name, String(key));
  return {
    key,
    slug: localItem?.slug ?? `${key}-${slugify(name)}`,
    name,
    names: compItem?.names ?? localItem?.name ?? null,
    grade: compItem?.grade ?? localItem?.grade ?? null,
    type: compItem?.itemType ?? localItem?.type ?? null,
    icon: compItem?.iconPath ? `/sprites/${compItem.iconPath}.png` : localItem?.icon ?? null,
  };
}

function pushMapArray(map, key, value) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

function uniqueBy(rows, keyFn) {
  const seen = new Set();
  const out = [];
  for (const row of rows) {
    const key = keyFn(row);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

for (const box of comp.boxDrops?.boxes ?? []) {
  const identity = itemIdentity(box.key);
  const totalWeight = box.pool.reduce((sum, poolRow) => sum + Number(poolRow.w ?? 0), 0);
  const contents = [];

  for (const poolRow of box.pool) {
    const groupItems = comp.boxDrops.groups?.[String(poolRow.group)] ?? [];
    if (!groupItems.length) continue;
    const groupChance = totalWeight > 0 ? (Number(poolRow.w ?? 0) / totalWeight) * 100 : null;
    const itemChance = groupChance == null ? null : groupChance / groupItems.length;
    for (const itemKey of groupItems) {
      const item = itemIdentity(itemKey);
      const row = {
        itemKey,
        itemSlug: item.slug,
        name: item.name,
        grade: item.grade,
        type: item.type,
        groupKey: poolRow.group,
        groupWeight: poolRow.w,
        groupSize: groupItems.length,
        condition: poolRow.cond ?? null,
        groupChancePercent: groupChance == null ? null : Number(groupChance.toFixed(6)),
        chancePercent: itemChance == null ? null : Number(itemChance.toFixed(6)),
      };
      contents.push(row);
      pushMapArray(itemSourcesByItemKey, itemKey, {
        sourceType: "chest-content",
        chestKey: box.key,
        chestSlug: identity.slug,
        chestName: identity.name,
        chancePercent: row.chancePercent,
        condition: row.condition,
      });
    }
  }

  chestContentsByChestKey.set(box.key, contents.sort((a, b) => (b.chancePercent ?? 0) - (a.chancePercent ?? 0)));
}

const stageBoxItems = (comp.items ?? []).filter((item) => item.itemType === "STAGEBOX");
for (const item of stageBoxItems) {
  if (chestContentsByChestKey.has(item.key) || !item.dropKey) continue;
  const aliasSource = stageBoxItems.find((candidate) => (
    candidate.key !== item.key
    && candidate.dropKey === item.dropKey
    && (chestContentsByChestKey.get(candidate.key)?.length ?? 0) > 0
  ));
  if (!aliasSource) continue;

  const aliasIdentity = itemIdentity(item.key);
  const clonedContents = (chestContentsByChestKey.get(aliasSource.key) ?? []).map((row) => ({
    ...row,
    derivedFromChestKey: aliasSource.key,
    confidence: "derived",
    mergePolicy: "same-dropKey-alias",
  }));
  chestContentsByChestKey.set(item.key, clonedContents);

  for (const row of clonedContents) {
    pushMapArray(itemSourcesByItemKey, row.itemKey, {
      sourceType: "chest-content-alias",
      chestKey: item.key,
      chestSlug: aliasIdentity.slug,
      chestName: aliasIdentity.name,
      chancePercent: row.chancePercent,
      condition: row.condition,
      derivedFromChestKey: aliasSource.key,
      confidence: "derived",
    });
  }
}

for (const stage of comp.stages ?? []) {
  const stageDrops = [];
  for (const [sourceType, drop] of [["monster", stage.monsterDrop], ["boss", stage.bossDrop]]) {
    if (!drop?.itemKey) continue;
    const item = itemIdentity(drop.itemKey);
    const row = {
      itemKey: drop.itemKey,
      itemSlug: item.slug,
      name: item.name,
      grade: item.grade,
      sourceType,
      rate: drop.rate,
      ratePercent: rateToPercent(drop.rate),
    };
    stageDrops.push(row);
    pushMapArray(chestSourcesByChestKey, drop.itemKey, {
      stageKey: stage.key,
      stageName: stage.name,
      difficulty: stage.difficulty,
      act: stage.act,
      stageNo: stage.stageNo,
      sourceType,
      rate: drop.rate,
      ratePercent: rateToPercent(drop.rate),
    });
  }
  stageDropsByStageKey.set(stage.key, stageDrops);
}

for (const item of comp.items ?? []) {
  const local = localItemById.get(item.key);
  const detail = localDetails[String(item.key)] ?? null;
  const name = item.name ?? localName(local?.name, String(item.key));
  const market = marketBySlug.get(local?.slug) ?? marketByName.get(String(name).toLowerCase()) ?? null;
  const gear = item.gear ?? null;
  const material = item.material ?? null;
  const sourceRows = uniqueBy(itemSourcesByItemKey.get(item.key) ?? [], (row) => `${row.chestKey}:${row.condition ?? ""}:${row.chancePercent ?? ""}`);
  const chestRows = sourceRows.map((source) => ({
    ...source,
    stages: chestSourcesByChestKey.get(source.chestKey) ?? [],
  }));

  graphItemsByKey.set(item.key, {
    key: item.key,
    slug: local?.slug ?? `${item.key}-${slugify(name)}`,
    name,
    names: item.names ?? local?.name ?? null,
    type: item.itemType ?? local?.type ?? null,
    grade: item.grade ?? local?.grade ?? null,
    gradeRank: item.gradeRank ?? null,
    level: item.level ?? local?.level ?? null,
    parts: item.parts ?? null,
    gearType: item.gearType ?? null,
    classes: item.classes ?? [],
    obtainable: item.obtainable ?? null,
    tradable: item.tradable ?? Boolean(local?.marketable),
    removed: item.removed ?? Boolean(local?.deleted),
    gold: item.gold ?? null,
    dropKey: item.dropKey ?? null,
    icon: item.iconPath ? `/sprites/${item.iconPath}.png` : local?.icon ?? null,
    formattedStats: {
      base: (gear?.base ?? []).map(formatStatRow),
      inherent: (gear?.inherent ?? []).map(formatStatRow),
      uniqueMod: gear?.uniqueMod ?? null,
      confidence: gear ? "high" : detail?.stats ? "medium" : "missing",
    },
    slots: gear?.slots ?? null,
    material: material
      ? {
          type: material.materialType,
          effectsBySlot: Object.fromEntries(
            Object.entries(material.effects ?? {}).map(([slot, effects]) => [slot, effects.map(formatStatRow)]),
          ),
        }
      : null,
    sourceChain: {
      chests: chestRows,
      bestChest: chestRows.slice().sort((a, b) => (b.chancePercent ?? 0) - (a.chancePercent ?? 0))[0] ?? null,
      confidence: chestRows.length ? "high" : "missing",
    },
    market: market
      ? {
          name: market.name,
          lowest: market.lowest,
          listings: market.listings,
          updatedAt: market.updatedAt,
          freshness: marketFreshness(market),
          confidence: market.confidence ?? "medium",
          usableForRecommendation: marketFreshness(market) === "fresh",
        }
      : null,
    decision: {
      primaryAction: chestRows.length ? "farm" : market ? "market-check" : "reference",
      canFarm: chestRows.length > 0,
      canTrade: Boolean(item.tradable ?? local?.marketable),
      hasReliableMarket: Boolean(market && marketFreshness(market) === "fresh"),
      hasStats: Boolean(gear?.base?.length || gear?.inherent?.length),
      hasMaterialEffects: Boolean(material?.effects && Object.keys(material.effects).length),
    },
    _meta: meta(routeFor(material ? "material" : "item", item.key, name)),
  });
}

const graphChests = (comp.items ?? [])
  .filter((item) => item.itemType === "STAGEBOX")
  .map((item) => {
    const identity = itemIdentity(item.key);
    const contents = chestContentsByChestKey.get(item.key) ?? [];
    const dropSources = chestSourcesByChestKey.get(item.key) ?? [];
    return {
      key: item.key,
      slug: identity.slug,
      name: identity.name,
      grade: identity.grade,
      obtainable: item.obtainable,
      tradable: item.tradable,
      removed: item.removed,
      dropKey: item.dropKey,
      contents,
      dropSources,
      bestSource: dropSources.slice().sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0))[0] ?? null,
      decision: {
        hasContents: contents.length > 0,
        hasDropSources: dropSources.length > 0,
        contentCount: contents.length,
        sourceStageCount: dropSources.length,
      },
      _meta: meta(routeFor("item", item.key, identity.name), contents.length || dropSources.length ? "high" : "missing"),
    };
  });

const graphMonsters = (comp.monsters ?? []).map((monster) => {
  const drops = (monster.drops ?? []).map((drop) => {
    const item = itemIdentity(drop.itemKey);
    return {
      itemKey: drop.itemKey,
      itemSlug: item.slug,
      name: item.name,
      grade: item.grade,
      rate: drop.rate,
      ratePercent: rateToPercent(drop.rate),
      stages: (drop.stages ?? []).map((stageKey) => {
        const stage = compStageByKey.get(stageKey);
        return {
          stageKey,
          name: stage?.name ?? null,
          difficulty: stage?.difficulty ?? null,
          act: stage?.act ?? null,
          stageNo: stage?.stageNo ?? null,
        };
      }),
    };
  });

  return {
    key: monster.key,
    slug: `${monster.key}-${slugify(monster.name)}`,
    name: monster.name,
    names: monster.names ?? null,
    type: monster.type,
    isBoss: monster.isBoss,
    stats: {
      rewardGold: monster.rewardGold,
      rewardExp: monster.rewardExp,
      attackDamage: monster.attackDamage,
      attackSpeed: monster.attackSpeed,
      maxLife: monster.maxLife,
      movementSpeed: monster.movementSpeed,
      attackTypes: monster.attackTypes ?? [],
    },
    drops,
    stages: monster.stages ?? [],
    bestStages: (monster.stages ?? []).slice(0, 12),
    decision: {
      dropCount: drops.length,
      stageCount: monster.stages?.length ?? 0,
      bestDrop: drops.slice().sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0))[0] ?? null,
    },
    _meta: meta(routeFor("monster", monster.key, monster.name), drops.length ? "high" : "medium"),
  };
});

const graphStages = (comp.stages ?? []).map((stage) => {
  const local = localStages.find((row) => row.key === stage.key);
  const monsters = (stage.monsters ?? []).map((row) => {
    const monster = compMonsterByKey.get(Number(row.monster));
    return {
      monsterKey: Number(row.monster),
      name: monster?.name ?? null,
      weight: row.weight,
      isBoss: false,
    };
  });
  const boss = stage.bossMonsterKey ? compMonsterByKey.get(stage.bossMonsterKey) : null;
  const drops = stageDropsByStageKey.get(stage.key) ?? [];

  return {
    key: stage.key,
    slug: local?.slug ?? `${stage.key}-${slugify(stage.name)}`,
    name: stage.name,
    names: stage.names ?? null,
    difficulty: stage.difficulty,
    act: stage.act,
    stageNo: stage.stageNo,
    level: stage.stageLevel,
    type: stage.type,
    waveAmount: stage.waveAmount,
    waveMonsterAmount: stage.waveMonsterAmount,
    monsters,
    boss: boss
      ? {
          monsterKey: boss.key,
          name: boss.name,
          multipliers: stage.bossMultipliers ?? null,
        }
      : null,
    drops,
    firstClearDropKey: stage.firstClearDropKey ?? null,
    soulstone: stage.soulstone ?? null,
    rewards: {
      goldPerClear: local?.goldPerClear ?? null,
      expPerClear: local?.expPerClear ?? null,
      offline: (comp.offlineRewards ?? []).find((row) => row.stageLevel === stage.stageLevel) ?? null,
      levelScaling: stage.levelScaling ?? null,
    },
    decision: {
      monsterCount: monsters.length,
      hasBoss: Boolean(boss),
      dropCount: drops.length,
      bestDrop: drops.slice().sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0))[0] ?? null,
    },
    _meta: meta(routeFor("stage", stage.key, stage.name), "high"),
  };
});

const graphMaterials = (comp.materials ?? []).map((material) => {
  const item = graphItemsByKey.get(material.key);
  const effect = (comp.materialEffects ?? []).find((row) => row.key === material.key);
  const effectsBySlot = Object.fromEntries(
    Object.entries(material.effects ?? {}).map(([slot, effects]) => [slot, effects.map(formatStatRow)]),
  );

  return {
    key: material.key,
    slug: item?.slug ?? `${material.key}-${slugify(material.name)}`,
    name: material.name,
    names: material.names ?? null,
    grade: material.grade,
    icon: material.iconPath ? `/sprites/${material.iconPath}.png` : item?.icon ?? null,
    materialType: material.materialType,
    effectsBySlot,
    effectGroups: effect?.groups ?? [],
    sourceChain: item?.sourceChain ?? { chests: [], confidence: "missing" },
    market: item?.market ?? null,
    decision: {
      hasEffects: Object.keys(effectsBySlot).length > 0,
      affectedSlots: Object.keys(effectsBySlot),
      canFarm: Boolean(item?.decision.canFarm),
      canTrade: Boolean(item?.decision.canTrade),
      primaryAction: item?.decision.primaryAction ?? "reference",
    },
    _meta: meta(routeFor("material", material.key, material.name), Object.keys(effectsBySlot).length ? "high" : "medium"),
  };
});

const graphMarket = (marketLatest.items ?? []).map((row) => {
  const match = [...graphItemsByKey.values()].find((item) => item.slug === row.slug || item.name === row.name);
  return {
    ...row,
    itemKey: match?.key ?? null,
    itemSlug: match?.slug ?? row.slug ?? null,
    freshness: marketFreshness(row),
    usableForRecommendation: marketFreshness(row) === "fresh",
    _meta: meta(row.url ?? "https://steamcommunity.com/market/", row.confidence ?? "medium", "steam-market > local-name-match"),
  };
});

const graphItems = [...graphItemsByKey.values()];
const manifest = {
  version: "game-v1-graph",
  generatedAt,
  inputs: {
    competitorPublic: "data/generated/game/v1/competitor-public/tbh-helper.json",
    localItems: "tbh_data/items.json",
    localDetails: "tbh_data/items_detail.json",
    localStages: "tbh_data/stages.json",
    market: "data/generated/market/v1/latest.json",
  },
  entityCounts: {
    items: graphItems.length,
    chests: graphChests.length,
    monsters: graphMonsters.length,
    stages: graphStages.length,
    materials: graphMaterials.length,
    market: graphMarket.length,
  },
  coverage: {
    itemsWithSourceChain: graphItems.filter((item) => item.sourceChain.chests.length > 0).length,
    chestsWithContents: graphChests.filter((chest) => chest.contents.length > 0).length,
    chestsWithDropSources: graphChests.filter((chest) => chest.dropSources.length > 0).length,
    monstersWithDrops: graphMonsters.filter((monster) => monster.drops.length > 0).length,
    stagesWithDrops: graphStages.filter((stage) => stage.drops.length > 0).length,
    materialsWithEffects: graphMaterials.filter((material) => Object.keys(material.effectsBySlot).length > 0).length,
    freshMarketRows: graphMarket.filter((row) => row.usableForRecommendation).length,
  },
  rules: {
    userVisibleSource: false,
    internalSourceRequired: true,
    staleMarketExcludedFromRecommendation: true,
    noEditorialCopy: true,
  },
  _meta: meta(competitor.competitor?.dataAssetUrl ?? "https://tbherohelper.com/assets/data-*.js"),
};

writeJson(path.join(outDir, "items.json"), graphItems);
writeJson(path.join(outDir, "chests.json"), graphChests);
writeJson(path.join(outDir, "monsters.json"), graphMonsters);
writeJson(path.join(outDir, "stages.json"), graphStages);
writeJson(path.join(outDir, "materials.json"), graphMaterials);
writeJson(path.join(outDir, "market.json"), graphMarket);
writeJson(path.join(outDir, "manifest.json"), manifest);

console.log(`Wrote graph data to ${outDir}`);
console.log(JSON.stringify({ entityCounts: manifest.entityCounts, coverage: manifest.coverage }, null, 2));
