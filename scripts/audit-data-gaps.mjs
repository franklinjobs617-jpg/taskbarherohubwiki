import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outFile = path.join(root, "data", "audit", "data-gap-report.json");
const generatedAt = new Date().toISOString();

function readJson(file, fallback = null) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function countTruthy(rows, predicate) {
  return rows.reduce((total, row) => total + (predicate(row) ? 1 : 0), 0);
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))];
}

function pct(part, whole) {
  if (!whole) return 0;
  return Number(((part / whole) * 100).toFixed(2));
}

function objectHasKeys(value) {
  return value && typeof value === "object" && Object.keys(value).length > 0;
}

const local = {
  items: readJson(path.join(root, "tbh_data", "items.json"), []),
  itemDetails: readJson(path.join(root, "tbh_data", "items_detail.json"), {}),
  stages: readJson(path.join(root, "tbh_data", "stages.json"), []),
  monsters: readJson(path.join(root, "tbh_data", "monsters.json"), []),
  heroes: readJson(path.join(root, "tbh_data", "heroes.json"), []),
  runes: readJson(path.join(root, "tbh_data", "runes.json"), []),
  skills: readJson(path.join(root, "tbh_data", "skills.json"), []),
  buffs: readJson(path.join(root, "tbh_data", "buffs.json"), []),
  grades: readJson(path.join(root, "tbh_data", "grades.json"), []),
};

const external = {
  items: readJson(path.join(root, "tbh_external", "items.json"), []),
  stages: readJson(path.join(root, "tbh_external", "stages.json"), []),
  effects: readJson(path.join(root, "tbh_external", "effects.json"), []),
  runes: readJson(path.join(root, "tbh_external", "runes.json"), { runes: [] }).runes ?? [],
  pets: readJson(path.join(root, "tbh_external", "pets.json"), []),
  heroes: readJson(path.join(root, "tbh_external", "heroes.json"), []),
};

const generated = {
  drops: readJson(path.join(root, "data", "generated", "drops.json"), {}),
  enrichedItems: readJson(path.join(root, "data", "generated", "game", "v1", "enriched", "items.json"), []),
  enrichedStages: readJson(path.join(root, "data", "generated", "game", "v1", "enriched", "stages.json"), []),
  graphItems: readJson(path.join(root, "data", "generated", "game", "v1", "graph", "items.json"), []),
  graphChests: readJson(path.join(root, "data", "generated", "game", "v1", "graph", "chests.json"), []),
  graphMonsters: readJson(path.join(root, "data", "generated", "game", "v1", "graph", "monsters.json"), []),
  graphStages: readJson(path.join(root, "data", "generated", "game", "v1", "graph", "stages.json"), []),
  graphMaterials: readJson(path.join(root, "data", "generated", "game", "v1", "graph", "materials.json"), []),
  graphManifest: readJson(path.join(root, "data", "generated", "game", "v1", "graph", "manifest.json"), null),
  market: readJson(path.join(root, "data", "generated", "market", "v1", "latest.json"), { items: [] }),
};

const competitorCoverage = readJson(path.join(root, "data", "audit", "competitor-coverage.json"), {});

const localItemIds = new Set(local.items.map((item) => item.id));
const externalItemIds = new Set(external.items.map((item) => item.key));
const dropSlugs = new Set(Object.entries(generated.drops).filter(([, sources]) => Array.isArray(sources) && sources.length > 0).map(([slug]) => slug));
const marketSlugs = new Set((generated.market.items ?? []).map((row) => row.slug));
const externalStageKeys = new Set(external.stages.map((stage) => stage.key));
const localStageKeys = new Set(local.stages.map((stage) => stage.key));

const itemDetails = local.items.map((item) => ({
  item,
  detail: local.itemDetails[String(item.id)] ?? null,
  external: external.items.find((ext) => ext.key === item.id) ?? null,
}));

const itemCoverage = {
  total: local.items.length,
  withLocalizedName: countTruthy(local.items, (item) => objectHasKeys(item.name)),
  withDetailRecord: countTruthy(itemDetails, ({ detail }) => Boolean(detail)),
  withDescription: countTruthy(itemDetails, ({ detail }) => Boolean(detail?.desc)),
  withStructuredStats: countTruthy(itemDetails, ({ detail }) => objectHasKeys(detail?.stats)),
  withExternalClassFit: countTruthy(itemDetails, ({ external }) => (external?.classes ?? []).length > 0),
  withExternalSlots: countTruthy(itemDetails, ({ external }) => objectHasKeys(external?.slots)),
  withExternalFormattedStats: countTruthy(itemDetails, ({ external }) => objectHasKeys(external?.stats)),
  withDropData: countTruthy(local.items, (item) => dropSlugs.has(item.slug)),
  withMarketData: countTruthy(local.items, (item) => marketSlugs.has(item.slug)),
  marketable: countTruthy(local.items, (item) => Boolean(item.marketable)),
  externalOnlyItems: external.items.filter((item) => !localItemIds.has(item.key)).length,
  localOnlyItems: local.items.filter((item) => !externalItemIds.has(item.id)).length,
};

const stageCoverage = {
  total: local.stages.length,
  withRewards: countTruthy(local.stages, (stage) => stage.goldPerClear != null && stage.expPerClear != null),
  withBoss: countTruthy(local.stages, (stage) => Boolean(stage.boss)),
  withExternalMonsterComposition: countTruthy(local.stages, (stage) => externalStageKeys.has(stage.key) && (external.stages.find((ext) => ext.key === stage.key)?.monsters ?? []).length > 0),
  withExternalDropTable: countTruthy(local.stages, (stage) => externalStageKeys.has(stage.key) && (external.stages.find((ext) => ext.key === stage.key)?.drops ?? []).length > 0),
  externalOnlyStages: external.stages.filter((stage) => !localStageKeys.has(stage.key)).length,
  localOnlyStages: local.stages.filter((stage) => !externalStageKeys.has(stage.key)).length,
};

const monsterCoverage = {
  total: local.monsters.length,
  withStats: countTruthy(local.monsters, (monster) => monster.AttackDamage != null && monster.AttackSpeed != null && monster.MaxLife != null),
  withStageAppearances: countTruthy(local.monsters, (monster) => (monster.stages ?? []).length > 0),
  withPortrait: countTruthy(local.monsters, (monster) => Boolean(monster.portrait)),
  withReverseDrops: 0,
};

const chestItems = local.items.filter((item) => item.type === "STAGEBOX");
const externalStageDropItemIds = new Set(external.stages.flatMap((stage) => (stage.drops ?? []).map((drop) => drop.itemKey)));
const chestContentSlugs = new Set(
  Object.values(generated.drops)
    .filter((sources) => Array.isArray(sources))
    .flatMap((sources) => sources.map((source) => source.box_slug)),
);
const chestCoverage = {
  total: chestItems.length,
  withDropSources: countTruthy(chestItems, (item) => externalStageDropItemIds.has(item.id)),
  withContents: countTruthy(chestItems, (item) => chestContentSlugs.has(item.slug)),
};

const monsterKeysWithReverseDrops = new Set(
  local.monsters
    .filter((monster) => {
      const stageKeys = new Set((monster.stages ?? []).map((stage) => stage.key));
      return external.stages.some((stage) => stageKeys.has(stage.key) && (stage.drops ?? []).length > 0);
    })
    .map((monster) => monster.MonsterKey),
);
monsterCoverage.withReverseDrops = monsterKeysWithReverseDrops.size;

const materialItems = local.items.filter((item) => item.type === "MATERIAL");
const materialsWithEffects = new Set(external.effects.map((effect) => effect.key));
const materialCoverage = {
  total: materialItems.length,
  withDescription: countTruthy(materialItems, (item) => Boolean(local.itemDetails[String(item.id)]?.desc)),
  withEffectMatrix: countTruthy(materialItems, (item) => materialsWithEffects.has(item.id)),
  withDropData: countTruthy(materialItems, (item) => dropSlugs.has(item.slug)),
  withMarketData: countTruthy(materialItems, (item) => marketSlugs.has(item.slug)),
};

const graphCoverage = {
  available: Boolean(generated.graphManifest),
  items: generated.graphItems.length,
  itemsWithSourceChain: countTruthy(generated.graphItems, (item) => (item.sourceChain?.chests ?? []).length > 0),
  chests: generated.graphChests.length,
  chestsWithContents: countTruthy(generated.graphChests, (chest) => (chest.contents ?? []).length > 0),
  chestsWithDropSources: countTruthy(generated.graphChests, (chest) => (chest.dropSources ?? []).length > 0),
  monsters: generated.graphMonsters.length,
  monstersWithDrops: countTruthy(generated.graphMonsters, (monster) => (monster.drops ?? []).length > 0),
  stages: generated.graphStages.length,
  stagesWithDrops: countTruthy(generated.graphStages, (stage) => (stage.drops ?? []).length > 0),
  materials: generated.graphMaterials.length,
  materialsWithEffects: countTruthy(generated.graphMaterials, (material) => objectHasKeys(material.effectsBySlot)),
};

const fieldGaps = [
  {
    area: "Item Detail",
    missingOrUnderused: [
      "formattedStatRows",
      "classFitDecision",
      "slotMatrix",
      "sourceChain:item->chest->monster/stage",
      "bestFarmRoutes",
      "buyVsFarmDecision",
    ],
    availableFrom: ["tbh_data/items_detail.json", "tbh_external/items.json", "data/generated/drops.json", "data/generated/market/v1/latest.json"],
    status: "data mostly exists; page rendering and graph index missing",
  },
  {
    area: "Chest Detail",
    missingOrUnderused: [
      "contentsTable",
      "contentDropChance",
      "droppedByMonsters",
      "droppedInStages",
      "bestStageForChest",
    ],
    availableFrom: ["data/generated/drops.json", "tbh_external/stages.json", "tbh_data/monsters.json"],
    status: "relationship index missing",
  },
  {
    area: "Monster Detail",
    missingOrUnderused: [
      "monsterDropTable",
      "bestStageToFarmMonster",
      "stageDropContext",
      "petUnlockContext",
    ],
    availableFrom: ["tbh_data/monsters.json", "tbh_external/stages.json", "tbh_external/pets.json"],
    status: "drops need reverse index from stage/drop boxes",
  },
  {
    area: "Stage Detail",
    missingOrUnderused: [
      "monsterComposition",
      "bossMultiplier",
      "dropValueSummary",
      "targetLevelFit",
      "hourlyExpGoldEstimator",
    ],
    availableFrom: ["tbh_data/stages.json", "tbh_external/stages.json", "data/generated/market/v1/latest.json"],
    status: "data exists; UI underuses it",
  },
  {
    area: "Database Index",
    missingOrUnderused: [
      "statFilter",
      "slotFilter",
      "classFilterWithCounts",
      "obtainableTradableDeletedFilter",
      "cardsTableToggle",
      "sortByLevelGradeMarketDropConfidence",
    ],
    availableFrom: ["tbh_external/items.json", "tbh_data/items.json", "data/generated/drops.json", "data/generated/market/v1/latest.json"],
    status: "data exists; search UI missing",
  },
];

const report = {
  generatedAt,
  sources: {
    localDatamined: {
      files: ["items.json", "items_detail.json", "stages.json", "monsters.json", "heroes.json", "runes.json", "skills.json", "buffs.json", "grades.json"],
      counts: {
        items: local.items.length,
        itemDetails: Object.keys(local.itemDetails).length,
        stages: local.stages.length,
        monsters: local.monsters.length,
        heroes: local.heroes.length,
        runes: local.runes.length,
        skills: local.skills.length,
        buffs: local.buffs.length,
        grades: local.grades.length,
      },
      trust: "highest",
      use: "primary facts, names, stats, stages, monsters, heroes",
    },
    externalStructured: {
      files: ["items.json", "stages.json", "effects.json", "runes.json", "pets.json", "heroes.json"],
      counts: {
        items: external.items.length,
        stages: external.stages.length,
        effects: external.effects.length,
        runes: external.runes.length,
        pets: external.pets.length,
        heroes: external.heroes.length,
      },
      trust: "medium",
      use: "class fit, formatted stats, slots, stage monsters, stage drops, material effects, pet unlocks",
    },
    generatedDrops: {
      file: "data/generated/drops.json",
      itemsWithDrops: dropSlugs.size,
      use: "item->box->stage drop source graph",
    },
    graphIndex: {
      file: "data/generated/game/v1/graph",
      generatedAt: generated.graphManifest?.generatedAt ?? null,
      counts: generated.graphManifest?.entityCounts ?? null,
      use: "query-ready entity graph: item->chest->monster/stage, material effects, stage drops, market decisions",
    },
    steamMarket: {
      file: "data/generated/market/v1/latest.json",
      updatedAt: generated.market.updatedAt ?? null,
      rows: generated.market.items?.length ?? 0,
      use: "market status only; stale prices excluded from recommendations",
    },
    competitorCoverage: {
      file: "data/audit/competitor-coverage.json",
      urlCount: competitorCoverage.totals?.urlCount ?? null,
      sitemapCount: competitorCoverage.totals?.sitemapCount ?? null,
      use: "coverage comparison and field inspiration only; not copied as user-facing content",
    },
  },
  coverage: {
    items: { ...itemCoverage, rates: Object.fromEntries(Object.entries(itemCoverage).filter(([, value]) => typeof value === "number").map(([key, value]) => [key, key === "total" ? 100 : pct(value, itemCoverage.total)])) },
    stages: { ...stageCoverage, rates: Object.fromEntries(Object.entries(stageCoverage).filter(([, value]) => typeof value === "number").map(([key, value]) => [key, key === "total" ? 100 : pct(value, stageCoverage.total)])) },
    monsters: { ...monsterCoverage, rates: Object.fromEntries(Object.entries(monsterCoverage).filter(([, value]) => typeof value === "number").map(([key, value]) => [key, key === "total" ? 100 : pct(value, monsterCoverage.total)])) },
    chests: { ...chestCoverage, rates: Object.fromEntries(Object.entries(chestCoverage).filter(([, value]) => typeof value === "number").map(([key, value]) => [key, key === "total" ? 100 : pct(value, chestCoverage.total)])) },
    materials: { ...materialCoverage, rates: Object.fromEntries(Object.entries(materialCoverage).filter(([, value]) => typeof value === "number").map(([key, value]) => [key, key === "total" ? 100 : pct(value, materialCoverage.total)])) },
    graph: {
      ...graphCoverage,
      rates: {
        itemsWithSourceChain: pct(graphCoverage.itemsWithSourceChain, graphCoverage.items),
        chestsWithContents: pct(graphCoverage.chestsWithContents, graphCoverage.chests),
        chestsWithDropSources: pct(graphCoverage.chestsWithDropSources, graphCoverage.chests),
        monstersWithDrops: pct(graphCoverage.monstersWithDrops, graphCoverage.monsters),
        stagesWithDrops: pct(graphCoverage.stagesWithDrops, graphCoverage.stages),
        materialsWithEffects: pct(graphCoverage.materialsWithEffects, graphCoverage.materials),
      },
    },
  },
  vocabularies: {
    itemTypes: unique(local.items.map((item) => item.type)),
    grades: unique(local.items.map((item) => item.grade)),
    gearTypes: unique(local.items.map((item) => item.gear)),
    externalClasses: unique(external.items.flatMap((item) => item.classes ?? [])),
    externalStatNames: unique(external.items.flatMap((item) => [
      ...((item.stats?.base ?? []).map((stat) => stat.stat) ?? []),
      ...((item.stats?.inherent ?? []).map((stat) => stat.stat) ?? []),
    ])),
    materialEffectStats: unique(external.effects.flatMap((effect) => (effect.groups ?? []).map((group) => group.stat))),
  },
  fieldGaps,
  prioritizedDataWork: [
    "Build graph index: item->chest contents->stage->monster and reverse indexes.",
    "Normalize item stats into formatted rows from tbh_external/items.json first, fallback to tbh_data/items_detail.json.",
    "Generate chest contents tables from data/generated/drops.json.",
    "Generate monster reverse drop tables from tbh_external/stages.json + drop boxes.",
    "Generate stage decision summaries using rewards, monster composition, drops, and market freshness.",
    "Expose database filters from existing vocabularies: class, stat, slot, level, obtainable, tradable, grade, gear type.",
  ],
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

console.log(`Wrote ${outFile}`);
console.log(JSON.stringify({
  sources: report.sources,
  coverage: report.coverage,
  prioritizedDataWork: report.prioritizedDataWork,
}, null, 2));
