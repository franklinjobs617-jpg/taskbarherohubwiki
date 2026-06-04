/**
 * External data bridge — lazy-loads taskbarherowiki.com data at runtime.
 * Uses server-only dynamic require to avoid webpack bundling the 3.8MB JSON.
 */
import "server-only";

// ── Types ──

export type ExtItem = {
  key: number; name: string; type: "GEAR" | "MATERIAL" | "STAGEBOX";
  grade: string; gradeRank: number; parts: string | null; gearType: string | null;
  gearGroup: string | null; classes: string[]; level: number | null; icon: string;
  dropKey: number | null; obtainable: boolean; tradable: boolean; gold: number | null;
  slots: string[] | null; variant: string | null; stats: Record<string, number> | null;
  uniqueMod: string | null;
};

export type ExtStage = {
  key: number; difficulty: string; act: number; stageNo: number; label: string;
  type: string; level: number; name: string;
  monsters: Array<{ key: number; name: string; count: number }>;
  boss: { key: number; name: string } | null;
  drops: Array<{
    itemKey: number; name: string; icon: string; grade: string;
    source: "monster" | "boss"; rate: number; dropKey: number;
  }>;
};

export type ExtRune = {
  key: number; name: string; icon: string; x: number; y: number; maxLevel: number;
  next: number[]; preview: number[]; prevReq: number[] | null; stat: string;
  effect: string; category: string; isUnlock: boolean;
  levels: Array<{ level: number; value: string; cost: number }>; totalCost: number;
};

export type ExtPet = {
  key: number; name: string; icon: string; dlc: boolean;
  stats: Array<{ stat: string; disp: string; label: string }>;
  unlock: {
    type: string; monsterKey?: number; monsterName?: string; count?: number;
    note?: string; farm?: { label: string; act: number; stageNo: number;
    stageName: string; share: number; weight: number; alsoIn: number; };
  };
};

export type ExtEffect = {
  key: number; name: string; grade: string; gradeRank: number; icon: string;
  category: string;
  groups: Array<{ slot: string; stat: string; mod: string; min: number; max: number;
    minTier: number; maxTier: number; disp: string; slotOptions: number; chance: number; }>;
};

// ── Lazy runtime loaders (avoids webpack bundling) ──

function loadJson<T>(filename: string): T {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(`@/../tbh_external/${filename}`) as T;
}

let _items: ExtItem[] | null = null;
let _stages: ExtStage[] | null = null;
let _runes: ExtRune[] | null = null;
let _pets: ExtPet[] | null = null;
let _effects: ExtEffect[] | null = null;

export function extItems(): ExtItem[] {
  if (!_items) _items = loadJson<ExtItem[]>("items.json");
  return _items;
}
export function extStages(): ExtStage[] {
  if (!_stages) _stages = loadJson<ExtStage[]>("stages.json");
  return _stages;
}
export function extRunes(): ExtRune[] {
  if (!_runes) _runes = (loadJson<{ runes: ExtRune[] }>("runes.json")).runes;
  return _runes;
}
export function extPets(): ExtPet[] {
  if (!_pets) _pets = loadJson<ExtPet[]>("pets.json");
  return _pets;
}
export function extEffects(): ExtEffect[] {
  if (!_effects) _effects = loadJson<ExtEffect[]>("effects.json");
  return _effects;
}

// ── Image path converter ──

export function extIconPath(extIcon: string, type?: string): string {
  if (!extIcon) return "";
  if (type === "GEAR" || /^[A-Z]+_\d+/.test(extIcon)) {
    const gearType = extIcon.split("_")[0]?.toLowerCase() ?? "";
    return `/game/gear/${gearType}/${extIcon}.png`;
  }
  if (type === "MATERIAL" || /^Item_1\d+/.test(extIcon)) {
    return `/game/items/materials/${extIcon}.png`;
  }
  if (type === "STAGEBOX" || /^Item_9\d+/.test(extIcon)) {
    return `/game/items/boxes/${extIcon}.png`;
  }
  return `/game/items/materials/${extIcon}.png`;
}

// ── Cross-link helpers ──

export function getStageDrops(stageKey: number) {
  return extStages().find((s) => s.key === stageKey)?.drops ?? [];
}

export function getItemDropSources(itemKey: number) {
  return extStages()
    .filter((s) => s.drops.some((d) => d.itemKey === itemKey))
    .map((s) => ({ stage: s, drop: s.drops.find((d) => d.itemKey === itemKey)! }));
}

export function getItemsByClass(className: string): ExtItem[] {
  return extItems().filter((item) => item.classes.includes(className));
}

export function formatDropRate(rate: number): string {
  const pct = rate / 100;
  if (pct >= 100) return "100%";
  if (pct >= 10) return `${pct.toFixed(0)}%`;
  return `${pct.toFixed(1)}%`;
}
