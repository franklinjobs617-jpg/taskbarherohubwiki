import "server-only";

import {
  allItems,
  allStages,
  bestFarmingStages,
  dropsForItem,
  itemBySlug,
  itemName,
  marketForItem,
  stageBySlug,
  stageName,
  stageSlug,
  type Locale,
  type RawItem,
} from "./data";
import { localizedPath } from "@/lib/locale-path";
import { extPets } from "./external";
import { graphChestByKey, graphChests, graphStageByKey, type GraphChest } from "./graph";

type CopyKey = "unknown" | "sell" | "sellRisk" | "keep" | "useFirst" | "farmable" | "noPrice" | "lowSupply";

const copy: Record<Locale, Record<CopyKey, string>> = {
  en: {
    unknown: "Unknown",
    sell: "Sell",
    sellRisk: "Sell risk",
    keep: "Keep",
    useFirst: "Use first",
    farmable: "Farmable",
    noPrice: "No real price",
    lowSupply: "Low supply",
  },
  zh: {
    unknown: "未知",
    sell: "可卖",
    sellRisk: "卖出有风险",
    keep: "保留",
    useFirst: "先自用",
    farmable: "可刷",
    noPrice: "无真实价格",
    lowSupply: "供给低",
  },
  ja: {
    unknown: "不明",
    sell: "売却",
    sellRisk: "売却リスク",
    keep: "保持",
    useFirst: "先に使う",
    farmable: "周回可能",
    noPrice: "実価格なし",
    lowSupply: "供給少",
  },
  ko: {
    unknown: "알 수 없음",
    sell: "판매",
    sellRisk: "판매 위험",
    keep: "보관",
    useFirst: "먼저 사용",
    farmable: "파밍 가능",
    noPrice: "실제 가격 없음",
    lowSupply: "공급 낮음",
  },
};

export function getExpectedRuns(chance: number | null | undefined) {
  if (!chance || chance <= 0 || chance >= 1) {
    return {
      chance: chance ?? null,
      p50: chance && chance >= 1 ? 1 : null,
      p90: chance && chance >= 1 ? 1 : null,
    };
  }
  return {
    chance,
    p50: Math.ceil(Math.log(0.5) / Math.log(1 - chance)),
    p90: Math.ceil(Math.log(0.1) / Math.log(1 - chance)),
  };
}

export function formatChance(chance: number | null | undefined) {
  if (chance == null || Number.isNaN(chance)) return "-";
  const pct = chance * 100;
  if (pct >= 10) return `${pct.toFixed(1)}%`;
  if (pct >= 1) return `${pct.toFixed(2)}%`;
  return `${pct.toFixed(3)}%`;
}

export function getItemDecision(slug: string, locale: Locale) {
  const item = itemBySlug(slug);
  if (!item) return null;
  const bestStage = bestFarmingStages(slug, 1)[0] ?? null;
  const expectedRuns = getExpectedRuns(bestStage?.totalDropChance ?? null);
  const sources = dropsForItem(slug);
  const market = marketForItem(item);
  return {
    item,
    name: itemName(item, locale),
    bestStage,
    expectedRuns,
    sources,
    market,
    marketDecision: getMarketDecision(slug, locale),
    hasDropAnswer: Boolean(bestStage),
  };
}

function stageFromInput(stageKeyOrSlug: string | number) {
  const key = typeof stageKeyOrSlug === "number" ? stageKeyOrSlug : Number(stageKeyOrSlug);
  const local = typeof stageKeyOrSlug === "string" ? stageBySlug(stageKeyOrSlug) : null;
  return {
    localStage: local,
    graphStage: local ? graphStageByKey(local.key) : graphStageByKey(key),
  };
}

export function getStageDecision(stageKeyOrSlug: string | number, locale: Locale) {
  const { localStage, graphStage } = stageFromInput(stageKeyOrSlug);
  if (!graphStage && !localStage) return null;
  const stage = graphStage;
  const local = localStage ?? (stage ? allStages().find((row) => row.key === stage.key) ?? null : null);
  const title = local ? stageName(local, locale) : stage?.name ?? "Stage";
  const drops = stage?.drops ?? [];
  const topDrop = drops.slice().sort((a, b) => b.ratePercent - a.ratePercent)[0] ?? null;
  const expectedRuns = getExpectedRuns(topDrop ? topDrop.ratePercent / 100 : null);
  const chestDrops = drops.map((drop) => ({
    drop,
    chest: graphChestByKey(drop.itemKey),
    expectedRuns: getExpectedRuns(drop.ratePercent / 100),
  }));
  const bestFor = [
    stage?.rewards.expPerClear ? "EXP" : null,
    stage?.rewards.goldPerClear ? "Gold" : null,
    drops.some((drop) => drop.sourceType === "boss") ? "Chest" : null,
    stage?.monsters.length ? "Pet kills" : null,
    drops.length ? "Material" : null,
  ].filter(Boolean) as string[];

  return {
    key: stage?.key ?? local?.key ?? 0,
    slug: local ? stageSlug(local) : stage?.slug ?? String(stageKeyOrSlug),
    title,
    graphStage: stage,
    localStage: local,
    bestFor,
    drops: chestDrops,
    topDrop,
    expectedRuns,
    expPerClear: stage?.rewards.expPerClear ?? local?.expPerClear ?? null,
    goldPerClear: stage?.rewards.goldPerClear ?? local?.goldPerClear ?? null,
  };
}

function levelRange(chest: GraphChest) {
  const levels = chest.contents
    .map((content) => content.condition)
    .filter((value): value is number => Number.isFinite(value));
  return {
    min: levels.length ? Math.min(...levels) : null,
    max: levels.length ? Math.max(...levels) : null,
  };
}

export function getChestDecision(chestSlug: string, locale: Locale) {
  const localItem = itemBySlug(chestSlug);
  const chest = graphChests().find((row) => row.slug === chestSlug || row.key === localItem?.id) ?? null;
  if (!chest && !localItem) return null;
  const graphChest = chest;
  const sources = graphChest?.dropSources
    .map((source) => {
      const stage = graphStageByKey(source.stageKey);
      return {
        ...source,
        stage,
        label: stage ? `${stage.difficulty} ${stage.act}-${stage.stageNo}` : String(source.stageKey),
      };
    })
    .sort((a, b) => b.ratePercent - a.ratePercent) ?? [];
  const contents = graphChest?.contents ?? [];
  const range = graphChest ? levelRange(graphChest) : { min: localItem?.level ?? null, max: localItem?.level ?? null };
  const marketableContents = contents.filter((content) => {
    const item = allItems().find((row) => row.id === content.itemKey || row.slug === content.itemSlug);
    return item?.marketable;
  });

  return {
    chest: graphChest,
    localItem,
    name: localItem ? itemName(localItem, locale) : graphChest?.name ?? chestSlug,
    gearLevelMin: range.min,
    gearLevelMax: range.max,
    topSource: sources[0] ?? null,
    sourceStageCount: sources.length,
    contentCount: contents.length,
    marketableContentCount: marketableContents.length,
    bestUse: marketableContents.length ? "market" : contents.some((row) => row.type === "GEAR") ? "gear" : contents.length ? "material" : "unknown",
    sources,
    contents,
  };
}

export function getPetUnlockPlan(locale: Locale) {
  const pets = extPets().map((pet) => {
    const stats = pet.stats.map((stat) => `${stat.label} ${stat.disp}`);
    const statText = stats.join(" / ");
    const priority = pet.dlc
      ? "DLC"
      : /Gold/i.test(statText)
        ? "gold"
        : /Boss|Chest/i.test(statText)
          ? "chest"
          : /EXP/i.test(statText)
            ? "early"
            : "early";
    return {
      pet,
      name: pet.name,
      bonus: statText,
      unlockType: pet.unlock.type,
      targetMonster: pet.unlock.monsterName ?? null,
      killCount: pet.unlock.count ?? null,
      bestFarmStage: pet.unlock.farm ?? null,
      priority,
      mapLink: pet.unlock.farm ? localizedPath(locale, `/stages/${pet.unlock.farm.act}-${pet.unlock.farm.stageNo}`) : null,
    };
  });
  const find = (predicate: (row: (typeof pets)[number]) => boolean) => pets.find(predicate) ?? null;
  return {
    pets,
    firstPet: find((row) => row.name === "Bat") ?? pets[0] ?? null,
    bestGoldPet: find((row) => row.priority === "gold"),
    bestChestPet: find((row) => row.priority === "chest"),
    bestDlcPet: find((row) => row.pet.dlc && /Chest|Gold|EXP/i.test(row.bonus)) ?? find((row) => row.pet.dlc),
  };
}

export function getMarketDecision(slug: string, locale: Locale) {
  const item = itemBySlug(slug);
  if (!item) return null;
  const market = marketForItem(item);
  const hasDrop = bestFarmingStages(slug, 1).length > 0;
  const label = marketLabel(item, market, hasDrop, locale);
  return {
    item,
    market,
    label,
    selfUseValue: item.type === "GEAR" ? copy[locale].useFirst : item.type === "MATERIAL" ? copy[locale].keep : copy[locale].unknown,
    farmContext: hasDrop ? copy[locale].farmable : copy[locale].unknown,
  };
}

function marketLabel(item: RawItem, market: ReturnType<typeof marketForItem>, hasDrop: boolean, locale: Locale) {
  if (!item.marketable) return copy[locale].keep;
  if (!market?.lowest) return hasDrop ? copy[locale].farmable : copy[locale].noPrice;
  if ((market.listings ?? 0) > 0 && (market.listings ?? 0) <= 3) return copy[locale].lowSupply;
  if (item.type === "GEAR") return copy[locale].useFirst;
  if (hasDrop) return copy[locale].sellRisk;
  return copy[locale].sell;
}
