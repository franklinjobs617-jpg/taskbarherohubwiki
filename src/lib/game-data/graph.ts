import "server-only";
import { allItems, allMonsters, assetPath } from "./data";

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

function loadJson<T>(filename: string): T {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(`@/../data/generated/game/v1/graph/${filename}`) as T;
}

let stagesCache: GraphStage[] | null = null;
let chestsCache: GraphChest[] | null = null;
let monstersCache: GraphMonster[] | null = null;

export function graphStages() {
  stagesCache ??= loadJson<GraphStage[]>("stages.json");
  return stagesCache;
}

export function graphChests() {
  chestsCache ??= loadJson<GraphChest[]>("chests.json");
  return chestsCache;
}

export function graphMonsters() {
  monstersCache ??= loadJson<GraphMonster[]>("monsters.json");
  return monstersCache;
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
