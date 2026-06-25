import "server-only";
import { allItems, allMonsters, assetPath } from "./data";
import { fetchR2Json } from "@/lib/r2-fetch";

export type GraphDrop = {
  itemKey: number;
  itemSlug: string;
  name: string;
  grade: string;
  sourceType: "monster" | "boss";
  rate: number;
  ratePercent: number;
};

export type GraphMonsterInStage = {
  monsterKey: number;
  name: string | null;
  weight: number;
  isBoss: boolean;
};

export type GraphStage = {
  key: number;
  slug: string;
  name: string;
  names?: Record<string, string> | null;
  difficulty: string;
  act: number;
  stageNo: number;
  level: number;
  type: string;
  waveAmount?: number | null;
  waveMonsterAmount?: number | null;
  monsters: GraphMonsterInStage[];
  boss: { monsterKey: number; name: string; multipliers?: Record<string, number> | null } | null;
  drops: GraphDrop[];
  rewards: {
    goldPerClear: number | null;
    expPerClear: number | null;
    offline?: { baseGold?: number; baseExp?: number; killCount?: number; clearCount?: number } | null;
  };
  decision: { monsterCount: number; hasBoss: boolean; dropCount: number; bestDrop?: GraphDrop | null };
};

export type GraphChestContent = {
  itemKey: number;
  itemSlug: string;
  name: string;
  grade: string;
  type: string;
  chancePercent: number | null;
  condition?: number | null;
};

export type GraphChest = {
  key: number;
  slug: string;
  name: string;
  grade: string;
  contents: GraphChestContent[];
  dropSources: Array<{ stageKey: number; sourceType: "monster" | "boss"; ratePercent: number }>;
};

export type GraphMonster = {
  key: number;
  slug: string;
  name: string;
  stats: {
    rewardGold?: number;
    rewardExp?: number;
    attackDamage?: number;
    maxLife?: number;
    attackTypes?: string[];
  };
  drops: Array<GraphDrop & { stages: Array<{ stageKey: number; name: string | null; difficulty: string | null; act: number | null; stageNo: number | null }> }>;
};

export type StageExplorerStage = {
  key: number;
  act: number;
  no: number;
  difficulty: string;
  level: number;
  name: string;
  waves: number | null;
  goldPerClear: number | null;
  expPerClear: number | null;
  monsters: Array<{
    key: number;
    name: string;
    portrait: string | null;
    hp: number | null;
    atk: number | null;
    attackTypes: string[];
    dropCount: number;
    isBoss: boolean;
  }>;
  boss: {
    key: number;
    name: string;
    portrait: string | null;
    hpMultiplier: number | null;
    damageMultiplier: number | null;
  } | null;
  drops: Array<{
    itemKey: number;
    itemSlug: string;
    name: string;
    grade: string;
    sourceType: "monster" | "boss";
    ratePercent: number;
    icon: string | null;
    contents: Array<{
      itemKey: number;
      itemSlug: string;
      name: string;
      grade: string;
      type: string;
      chancePercent: number | null;
      icon: string | null;
    }>;
  }>;
};

const R2_GRAPH = {
  stages: "game/v1/graph/stages.json",
  chests: "game/v1/graph/chests.json",
  monsters: "game/v1/graph/monsters.json",
};

let stagesCache: GraphStage[] | null = null;
let chestsCache: GraphChest[] | null = null;
let monstersCache: GraphMonster[] | null = null;

async function loadGraphData<T>(path: string, cacheRef: { current: T | null }): Promise<T> {
  if (cacheRef.current) return cacheRef.current;
  try {
    const data = await fetchR2Json<T>(path);
    cacheRef.current = data;
    return data;
  } catch {
    return [] as unknown as T;
  }
}

let _preloadGraphStages: Promise<void> | null = null;
export async function ensureGraphStages(): Promise<void> {
  if (stagesCache) return;
  if (_preloadGraphStages) return _preloadGraphStages;
  _preloadGraphStages = (async () => {
    try {
      stagesCache = await fetchR2Json<GraphStage[]>(R2_GRAPH.stages).catch(() => []);
    } catch (e) {
      console.error("Failed to preload graph stages:", e);
    }
  })();
  return _preloadGraphStages;
}

let _preloadGraphChests: Promise<void> | null = null;
export async function ensureGraphChests(): Promise<void> {
  if (chestsCache) return;
  if (_preloadGraphChests) return _preloadGraphChests;
  _preloadGraphChests = (async () => {
    try {
      chestsCache = await fetchR2Json<GraphChest[]>(R2_GRAPH.chests).catch(() => []);
    } catch (e) {
      console.error("Failed to preload graph chests:", e);
    }
  })();
  return _preloadGraphChests;
}

let _preloadGraphMonsters: Promise<void> | null = null;
export async function ensureGraphMonsters(): Promise<void> {
  if (monstersCache) return;
  if (_preloadGraphMonsters) return _preloadGraphMonsters;
  _preloadGraphMonsters = (async () => {
    try {
      monstersCache = await fetchR2Json<GraphMonster[]>(R2_GRAPH.monsters).catch(() => []);
    } catch (e) {
      console.error("Failed to preload graph monsters:", e);
    }
  })();
  return _preloadGraphMonsters;
}

export async function ensureGraphData(): Promise<void> {
  await Promise.all([
    ensureGraphStages(),
    ensureGraphChests(),
    ensureGraphMonsters(),
  ]);
}

export function graphStages() {
  return stagesCache ?? [];
}

export function graphChests() {
  return chestsCache ?? [];
}

export function graphMonsters() {
  return monstersCache ?? [];
}

export function graphStageByKey(key: number) {
  return graphStages().find((stage) => stage.key === key) ?? null;
}

export function graphChestByKey(key: number) {
  return graphChests().find((chest) => chest.key === key) ?? null;
}

export function graphMonsterByKey(key: number) {
  return graphMonsters().find((monster) => monster.key === key) ?? null;
}

export function stageMapSummaries() {
  return graphStages().map((stage) => ({
    key: stage.key,
    monsterCount: stage.monsters.length,
    dropCount: stage.drops.length,
    bossName: stage.boss?.name ?? null,
    topDrop: stage.decision.bestDrop?.name ?? stage.drops[0]?.name ?? null,
    topDropRate: stage.decision.bestDrop?.ratePercent ?? stage.drops[0]?.ratePercent ?? null,
  }));
}

function monsterPortrait(monsterKey: number) {
  const monster = allMonsters().find((row) => row.MonsterKey === monsterKey);
  if (!monster?.portrait) return null;
  const parts = monster.portrait.split("/");
  return `/game/monsters/${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

function itemIcon(itemKey: number) {
  const item = allItems().find((row) => row.id === itemKey);
  return assetPath(item?.icon);
}

function localItemSlug(itemKey: number, fallback: string) {
  return allItems().find((item) => item.id === itemKey)?.slug ?? fallback;
}

export function stageExplorerData(): StageExplorerStage[] {
  return graphStages().map((stage) => {
    return {
      key: stage.key,
      act: stage.act,
      no: stage.stageNo,
      difficulty: stage.difficulty,
      level: stage.level,
      name: stage.name,
      waves: stage.waveAmount ?? null,
      goldPerClear: stage.rewards.goldPerClear,
      expPerClear: stage.rewards.expPerClear,
      monsters: stage.monsters.map((monster) => {
        const graphMonster = graphMonsterByKey(monster.monsterKey);
        return {
          key: monster.monsterKey,
          name: monster.name ?? graphMonster?.name ?? `Monster ${monster.monsterKey}`,
          portrait: monsterPortrait(monster.monsterKey),
          hp: graphMonster?.stats.maxLife ?? null,
          atk: graphMonster?.stats.attackDamage ?? null,
          attackTypes: graphMonster?.stats.attackTypes ?? [],
          dropCount: graphMonster?.drops.length ?? 0,
          isBoss: false,
        };
      }),
      boss: stage.boss
        ? {
            key: stage.boss.monsterKey,
            name: stage.boss.name,
            portrait: monsterPortrait(stage.boss.monsterKey),
            hpMultiplier: stage.boss.multipliers?.hp ? stage.boss.multipliers.hp / 1000 : null,
            damageMultiplier: stage.boss.multipliers?.damage ? stage.boss.multipliers.damage / 1000 : null,
          }
        : null,
      drops: stage.drops.map((drop) => {
        const chest = graphChestByKey(drop.itemKey);
        return {
          itemKey: drop.itemKey,
          itemSlug: localItemSlug(drop.itemKey, drop.itemSlug),
          name: drop.name,
          grade: drop.grade,
          sourceType: drop.sourceType,
          ratePercent: drop.ratePercent,
          icon: itemIcon(drop.itemKey),
          contents: (chest?.contents ?? []).slice(0, 10).map((content) => ({
            itemKey: content.itemKey,
            itemSlug: localItemSlug(content.itemKey, content.itemSlug),
            name: content.name,
            grade: content.grade,
            type: content.type,
            chancePercent: content.chancePercent,
            icon: itemIcon(content.itemKey),
          })),
        };
      }),
    };
  });
}
