import { fetchR2Json } from "@/lib/r2-fetch";

export type Locale = "zh" | "en" | "ja" | "ko";
export type Localized = Record<string, string>;

export type RawItem = {
  id: number;
  slug: string;
  type: "GEAR" | "MATERIAL" | "STAGEBOX";
  grade: string;
  gear: string | null;
  level: number | null;
  name: Localized;
  icon: string | null;
  marketable?: boolean;
};

export type ItemDetail = {
  desc?: Localized | string | null;
  stats?: Record<string, unknown> | null;
  synthType?: string | null;
  dropKey?: number | null;
  uniqueMod?: string | null;
  matEffects?: { type?: string; groups?: Record<string, Array<Record<string, unknown>>> } | null;
};

export type Hero = {
  HeroKey: number;
  ClassType?: string;
  SkillKey?: number;
  slug?: string;
  HeroNameKey_i18n?: Localized;
  DescriptionKey_i18n?: Localized;
  MainWeaponGearType?: string;
  SubWeaponGearType?: string;
  AttackDamage?: number;
  AttackSpeed?: number;
  CastSpeed?: number;
  CriticalChance?: number;
  CriticalDamage?: number;
  MaxHp?: number;
  Armor?: number;
  MovementSpeed?: number;
  UnlockCost?: number;
  IsAvailable?: boolean;
  DLCAppId?: number;
  HasDLCDrop?: boolean;
  icon?: string | null;
  attributes?: Array<Record<string, unknown>>;
};

export type Stage = {
  key: number;
  act: number;
  no: number;
  level: number;
  type: string;
  difficulty: string;
  slug?: string;
  name: Localized;
  waves?: number;
  monsterCount?: number;
  kills?: number;
  goldPerClear?: number;
  expPerClear?: number;
  boss?: { name?: Localized; portrait?: string | null } | null;
};

export type Rune = {
  RuneKey: number;
  slug?: string;
  NameKey_i18n?: Localized;
  MaxLevel?: number;
  icon?: string | null;
  next_runes?: Array<{ key?: string; name_i18n?: Localized }>;
};

export type Skill = {
  SkillKey: number;
  slug?: string;
  SkillNameKey_i18n?: Localized | null;
  ACTIVATIONTYPE?: string;
  SLOTTYPE?: string;
  DamageType?: string | null;
  DamageDeliveryType?: string | null;
  Range?: number | null;
  Value?: number | null;
  levels?: Array<Record<string, unknown>>;
  icon?: string | null;
};

export type Monster = {
  MonsterKey: number;
  slug?: string;
  MonsterNameStringKey_i18n?: Localized;
  MONSTERTYPE?: string;
  RewardGold?: number;
  RewardExp?: number;
  portrait?: string | null;
  stages?: Array<{ key: number; boss?: boolean; spawnPct?: number; perClear?: number }>;
};

export type MarketRecord = {
  slug: string;
  marketHash: string;
  lowest: number | null;
  median: number | null;
  listings: number | null;
  trend7d: number | null;
  confidence: "high" | "medium" | "low" | "missing";
  updatedAt: string;
};

export type DropStage = {
  key: number;
  act: number;
  no: number;
  diff: string;
  slug: string;
  rate: number;
};

export type DropSource = {
  box_name: string;
  box_type: "boss" | "monster";
  box_grade: string;
  box_slug: string;
  drop_chance: number;
  stages: DropStage[];
};

export type FarmingStage = {
  stageKey: number;
  act: number;
  no: number;
  diff: string;
  stageSlug: string;
  totalDropChance: number;
  boxes: Array<{ name: string; rate: number }>;
};

export type Guide = {
  slug: string;
  category: string;
  title: Partial<Record<Locale, string>>;
  description: Partial<Record<Locale, string>>;
  evidence: "editorial" | "datamined" | "community" | "unverified";
  updatedAt: string;
};

export type Build = {
  slug: string;
  hero: string;
  phase: "early" | "mid" | "endgame";
  goal: "survival" | "farming" | "materials" | "boss";
  title: Partial<Record<Locale, string>>;
  description: Partial<Record<Locale, string>>;
  evidence: "editorial" | "community" | "unverified";
  /** Specific gear recommendations per slot with reasoning */
  recommendedGear?: Array<{ slot: string; itemSlug: string; label: Partial<Record<Locale, string>>; reason: Partial<Record<Locale, string>> }>;
  /** Skill priority (ordered list of skill name keys) */
  skillPriority?: string[];
  /** Rune path with priority */
  runePath?: Array<{ runeName: string; priority: "must" | "optional"; reason: Partial<Record<Locale, string>> }>;
  /** Stat priority ordered list */
  statPriority?: string[];
  /** Recommended farming stage */
  farmingRoute?: { stageKey: number; reason: Partial<Record<Locale, string>> } | null;
  /** Related alternative build slugs */
  alternativeBuilds?: string[];
  updatedAt: string;
};

// ── Runtime data loading (from R2 CDN in production) ──

/** R2/CDN paths for game data files */
const R2 = {
  items: "game/v1/items/index.en.json",
  itemsDetail: "game/v1/items_detail.json",
  heroes: "game/v1/heroes/index.en.json",
  stages: "game/v1/stages/index.en.json",
  runes: "game/v1/runes/index.en.json",
  skills: "game/v1/skills/index.en.json",
  monsters: "game/v1/monsters/index.en.json",
  drops: "game/v1/drops.json",
  market: "market/v1/latest.json",
};

// Module-level cache — shared across requests within the same Worker instance
let _items: RawItem[] | null = null;
let _details: Record<string, ItemDetail> = {};
let _heroes: Hero[] | null = null;
let _stages: Stage[] | null = null;
let _runes: Rune[] | null = null;
let _skills: Skill[] | null = null;
let _monsters: Monster[] | null = null;
let _marketLatest: { updatedAt?: string; items?: MarketRecord[] } = {};
const _marketByItemSlug = new Map<string, MarketRecord>();
const _dropsByItemSlug: Record<string, DropSource[]> = {};

// Deduplicate concurrent preloads
let _preloadItems: Promise<void> | null = null;
export async function ensureItemIndex(): Promise<void> {
  if (_items) return;
  if (_preloadItems) return _preloadItems;
  _preloadItems = (async () => {
    try {
      _items = await fetchR2Json<RawItem[]>(R2.items);
    } catch (error) {
      console.error("Failed to preload items:", error);
      _items = [];
    }
  })();
  return _preloadItems;
}

let _preloadItemDetails: Promise<void> | null = null;
export async function ensureItemDetails(): Promise<void> {
  if (Object.keys(_details).length > 0) return;
  if (_preloadItemDetails) return _preloadItemDetails;
  _preloadItemDetails = (async () => {
    try {
      const detail = await fetchR2Json<Record<string, ItemDetail>>(R2.itemsDetail).catch(() => ({}));
      _details = detail as Record<string, ItemDetail>;
    } catch (error) {
      console.error("Failed to preload item details:", error);
      _details = {};
    }
  })();
  return _preloadItemDetails;
}

export async function ensureItems(): Promise<void> {
  await ensureItemIndex();
  await ensureItemDetails();
}

let _preloadHeroes: Promise<void> | null = null;
export async function ensureHeroes(): Promise<void> {
  if (_heroes) return;
  if (_preloadHeroes) return _preloadHeroes;
  _preloadHeroes = (async () => {
    try {
      _heroes = await fetchR2Json<Hero[]>(R2.heroes);
    } catch (error) {
      console.error("Failed to preload heroes:", error);
      _heroes = [];
    }
  })();
  return _preloadHeroes;
}

let _preloadStages: Promise<void> | null = null;
export async function ensureStages(): Promise<void> {
  if (_stages) return;
  if (_preloadStages) return _preloadStages;
  _preloadStages = (async () => {
    try {
      _stages = await fetchR2Json<Stage[]>(R2.stages);
    } catch (error) {
      console.error("Failed to preload stages:", error);
      _stages = [];
    }
  })();
  return _preloadStages;
}

let _preloadRunes: Promise<void> | null = null;
export async function ensureRunes(): Promise<void> {
  if (_runes) return;
  if (_preloadRunes) return _preloadRunes;
  _preloadRunes = (async () => {
    try {
      _runes = await fetchR2Json<Rune[]>(R2.runes);
    } catch (error) {
      console.error("Failed to preload runes:", error);
      _runes = [];
    }
  })();
  return _preloadRunes;
}

let _preloadSkills: Promise<void> | null = null;
export async function ensureSkills(): Promise<void> {
  if (_skills) return;
  if (_preloadSkills) return _preloadSkills;
  _preloadSkills = (async () => {
    try {
      _skills = await fetchR2Json<Skill[]>(R2.skills);
    } catch (error) {
      console.error("Failed to preload skills:", error);
      _skills = [];
    }
  })();
  return _preloadSkills;
}

let _preloadMonsters: Promise<void> | null = null;
export async function ensureMonsters(): Promise<void> {
  if (_monsters) return;
  if (_preloadMonsters) return _preloadMonsters;
  _preloadMonsters = (async () => {
    try {
      _monsters = await fetchR2Json<Monster[]>(R2.monsters).catch(() => []);
    } catch (error) {
      console.error("Failed to preload monsters:", error);
      _monsters = [];
    }
  })();
  return _preloadMonsters;
}

let _preloadDrops: Promise<void> | null = null;
export async function ensureDrops(): Promise<void> {
  if (Object.keys(_dropsByItemSlug).length > 0) return;
  if (_preloadDrops) return _preloadDrops;
  _preloadDrops = (async () => {
    try {
      const dropsRaw = await fetchR2Json<Record<string, unknown>>(R2.drops).catch(() => ({}));
      for (const [slug, sources] of Object.entries(dropsRaw)) {
        if (
          Array.isArray(sources) &&
          sources.length > 0 &&
          typeof sources[0] === "object" &&
          sources[0] !== null
        ) {
          _dropsByItemSlug[slug] = sources as DropSource[];
        }
      }
    } catch (error) {
      console.error("Failed to preload drops:", error);
    }
  })();
  return _preloadDrops;
}

let _preloadMarket: Promise<void> | null = null;
export async function ensureMarket(): Promise<void> {
  if (_marketLatest.items) return;
  if (_preloadMarket) return _preloadMarket;
  _preloadMarket = (async () => {
    try {
      const marketLatestRaw = await fetchR2Json<MarketRecord[] | { updatedAt?: string; items?: MarketRecord[] }>(R2.market).catch(() => []);
      const marketLatest = marketLatestRaw as MarketRecord[] | { updatedAt?: string; items?: MarketRecord[] };
      if (Array.isArray(marketLatest)) {
        _marketLatest = { items: marketLatest };
        for (const row of marketLatest) {
          _marketByItemSlug.set(row.slug, row);
        }
      } else {
        _marketLatest = marketLatest;
        if (marketLatest.items) {
          for (const row of marketLatest.items) {
            _marketByItemSlug.set(row.slug, row);
          }
        }
      }
    } catch (error) {
      console.error("Failed to preload market:", error);
    }
  })();
  return _preloadMarket;
}

/**
 * Preload all game data from R2 CDN.
 * Prefer calling the granular ensure* functions (e.g. ensureItems(), ensureHeroes()) 
 * when you only need specific datasets.
 */
export async function ensureGameData(): Promise<void> {
  await Promise.all([
    ensureItems(),
    ensureHeroes(),
    ensureStages(),
    ensureRunes(),
    ensureSkills(),
    ensureMonsters(),
    ensureDrops(),
    ensureMarket(),
  ]);
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://taskbarherohub.wiki";
export const DATA_VERSION = process.env.NEXT_PUBLIC_GAME_VERSION ?? "game-v1";
export const UPDATED_AT = "2026-06-08";
export function MARKET_UPDATED_AT() {
  return _marketLatest.updatedAt ?? UPDATED_AT;
}

export const gradeNames: Record<string, Partial<Record<Locale, string>>> = {
  COMMON: { zh: "普通", en: "Common", ja: "コモン" },
  UNCOMMON: { zh: "优秀", en: "Uncommon", ja: "アンコモン" },
  RARE: { zh: "稀有", en: "Rare", ja: "レア" },
  LEGENDARY: { zh: "传说", en: "Legendary", ja: "レジェンダリー" },
  IMMORTAL: { zh: "不朽", en: "Immortal", ja: "イモータル" },
  ARCANA: { zh: "奥秘", en: "Arcana", ja: "アルカナ" },
  BEYOND: { zh: "超越", en: "Beyond", ja: "ビヨンド" },
  CELESTIAL: { zh: "天界", en: "Celestial", ja: "セレスティアル" },
  DIVINE: { zh: "神圣", en: "Divine", ja: "ディバイン" },
  COSMIC: { zh: "宇宙", en: "Cosmic", ja: "コズミック" },
};

export const slotNames: Record<string, Partial<Record<Locale, string>>> = {
  SWORD: { zh: "剑", en: "Sword", ja: "剣" },
  BOW: { zh: "弓", en: "Bow", ja: "弓" },
  STAFF: { zh: "法杖", en: "Staff", ja: "杖" },
  SCEPTER: { zh: "权杖", en: "Scepter", ja: "王笏" },
  TOME: { zh: "法典", en: "Tome", ja: "書物" },
  CROSSBOW: { zh: "弩", en: "Crossbow", ja: "クロスボウ" },
  HATCHET: { zh: "手斧", en: "Hatchet", ja: "手斧" },
  ORB: { zh: "法球", en: "Orb", ja: "オーブ" },
  ARROW: { zh: "箭矢", en: "Arrow", ja: "矢" },
  BOLT: { zh: "弩箭", en: "Bolt", ja: "ボルト" },
  AXE: { zh: "斧", en: "Axe", ja: "斧" },
  ARMOR: { zh: "护甲", en: "Armor", ja: "鎧" },
  HELMET: { zh: "头盔", en: "Helmet", ja: "兜" },
  GLOVES: { zh: "手套", en: "Gloves", ja: "手袋" },
  BOOTS: { zh: "靴子", en: "Boots", ja: "靴" },
  SHIELD: { zh: "盾牌", en: "Shield", ja: "盾" },
  AMULET: { zh: "护符", en: "Amulet", ja: "お守り" },
  RING: { zh: "戒指", en: "Ring", ja: "指輪" },
  BRACER: { zh: "护腕", en: "Bracer", ja: "腕輪" },
  EARING: { zh: "耳环", en: "Earring", ja: "耳飾り" },
};

export function isLocale(value: string): value is Locale {
  return value === "zh" || value === "en" || value === "ja" || value === "ko";
}

export function text(value: Localized | string | null | undefined, locale: Locale, fallback = "") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  const key = locale === "zh" ? "zh-Hans" : locale === "ja" ? "ja-JP" : locale === "ko" ? "ko-KR" : "en-US";
  return value[key] ?? value["en-US"] ?? value["zh-Hans"] ?? Object.values(value)[0] ?? fallback;
}

export function itemName(item: RawItem, locale: Locale) {
  return text(item.name, locale, `Item ${item.id}`);
}

export function assetPath(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("/game/game/")) return path;
  if (path.startsWith("/game/")) return `/game${path}`;
  return path;
}

export function allItems() {
  return _items ?? [];
}

export function gearPreviewItem(gear: string | null | undefined) {
  if (!gear || !_items) return null;
  return _items.find((item) => item.type === "GEAR" && item.gear === gear && item.icon) ?? null;
}

export function itemBySlug(slug: string) {
  if (!_items) return null;
  return _items.find((item) => item.slug === slug) ?? null;
}

export function itemDetail(id: number) {
  return _details[String(id)] ?? null;
}

export function allHeroes() {
  return _heroes ?? [];
}

export function heroBySlug(slug: string) {
  if (!_heroes) return null;
  return _heroes.find((hero) => (hero.slug ?? hero.ClassType?.toLowerCase()) === slug) ?? null;
}

export function heroName(hero: Hero, locale: Locale) {
  return text(hero.HeroNameKey_i18n, locale, hero.ClassType ?? `Hero ${hero.HeroKey}`);
}

export function heroSlug(hero: Hero) {
  return hero.slug ?? hero.ClassType?.toLowerCase() ?? String(hero.HeroKey);
}

export function allStages() {
  return _stages ?? [];
}

export function stageSlug(stage: Stage) {
  return stage.slug ?? `${stage.difficulty.toLowerCase()}-${stage.act}-${stage.no}`;
}

export function stageBySlug(slug: string) {
  if (!_stages) return null;
  const normalized = decodeURIComponent(slug).toLowerCase();
  const alias = parseStageAlias(normalized);
  return _stages.find((stage) => {
    if (stageSlug(stage) === normalized || String(stage.key) === normalized) return true;
    return Boolean(
      alias &&
        stage.difficulty.toLowerCase() === alias.difficulty &&
        stage.act === alias.act &&
        stage.no === alias.no,
    );
  }) ?? null;
}

function parseStageAlias(slug: string) {
  const match = /^(normal|nightmare|hell|torment)-(\d+)-(\d+)$/.exec(slug);
  if (!match) return null;
  return {
    difficulty: match[1],
    act: Number(match[2]),
    no: Number(match[3]),
  };
}

export function stageName(stage: Stage, locale: Locale) {
  return text(stage.name, locale, `Stage ${stage.key}`);
}

export function allRunes() {
  return _runes ?? [];
}

export function allSkills() {
  return _skills ?? [];
}

export function skillName(skill: Skill, locale: Locale) {
  return text(skill.SkillNameKey_i18n ?? undefined, locale, `Skill ${skill.SkillKey}`);
}

export function skillBySlug(slug: string) {
  if (!_skills) return null;
  return _skills.find((s) => s.slug === slug) ?? null;
}

export function allMonsters() {
  return _monsters ?? [];
}

export function chestItems() {
  if (!_items) return [];
  return _items.filter((item) => item.type === "STAGEBOX");
}

export function effectRows(locale: Locale) {
  if (!_items) return [];
  return Object.entries(_details).flatMap(([id, detail]) => {
    if (!detail.matEffects?.groups) return [];
    const item = _items!.find((entry) => String(entry.id) === id);
    if (!item) return [];
    return Object.entries(detail.matEffects.groups).flatMap(([part, rows]) =>
      rows.map((row, index) => ({
        id: `${id}-${part}-${index}`,
        item,
        material: itemName(item, locale),
        part,
        effectType: detail.matEffects?.type ?? "MATERIAL",
        stat: String(row.stat ?? row.StatType ?? row.type ?? "Effect"),
        value: String(row.value ?? row.Value ?? row.min ?? row.max ?? "-"),
        market: marketForItem(item),
      })),
    );
  });
}

export function marketForItem(item: RawItem): MarketRecord | null {
  if (!item.marketable) return null;
  const realMarket = _marketByItemSlug.get(item.slug);
  if (realMarket) return realMarket;
  return {
    slug: item.slug,
    marketHash: itemName(item, "en"),
    lowest: null,
    median: null,
    listings: null,
    trend7d: null,
    confidence: "missing",
    updatedAt: UPDATED_AT,
  };
}

export function hasIndexableMarketData(market: MarketRecord | null | undefined): boolean {
  return Boolean(
    market &&
      market.confidence !== "missing" &&
      (market.lowest !== null || market.median !== null || market.listings !== null || market.trend7d !== null),
  );
}

export function marketRows() {
  if (!_items) return [];
  return _items
    .map((item) => ({ item, market: marketForItem(item) }))
    .filter((row): row is { item: RawItem; market: MarketRecord } => Boolean(row.market))
    .sort((a, b) => itemName(a.item, "en").localeCompare(itemName(b.item, "en")));
}

function normalizeMarketLookup(value: string) {
  return decodeURIComponent(value).trim().toLowerCase();
}

function slugifyMarketLookup(value: string) {
  return normalizeMarketLookup(value)
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function humanizeMarketLookup(value: string) {
  return normalizeMarketLookup(value)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function itemMatchesMarketAlias(item: RawItem, rawValue: string) {
  const normalized = normalizeMarketLookup(rawValue);
  const slugified = slugifyMarketLookup(rawValue);
  const aliases = new Set([
    normalizeMarketLookup(item.slug),
    normalizeMarketLookup(itemName(item, "en")),
    slugifyMarketLookup(itemName(item, "en")),
  ]);
  const market = _marketByItemSlug.get(item.slug);
  if (market?.marketHash) {
    aliases.add(normalizeMarketLookup(market.marketHash));
    aliases.add(slugifyMarketLookup(market.marketHash));
  }
  return aliases.has(normalized) || aliases.has(slugified);
}

function itemFromMarketAlias(rawValue: string) {
  if (!_items) return null;
  return _items.find((item) => itemMatchesMarketAlias(item, rawValue)) ?? null;
}

export function marketBySlug(slug: string) {
  if (!_items) return null;
  const decoded = decodeURIComponent(slug);
  const item = _items.find((entry) => entry.slug === decoded || itemName(entry, "en") === decoded) ?? null;
  if (!item) return null;
  const market = marketForItem(item);
  if (!market) return null;
  return { item, market };
}

export function resolveLegacyMarketRedirectTarget(rawSlug: string): string | null {
  if (!_items) return null;

  const decoded = decodeURIComponent(rawSlug).trim();
  if (!decoded) return null;

  const directItem = itemFromMarketAlias(decoded);
  if (directItem && decoded !== directItem.slug) {
    return shouldIndexMarket(directItem.slug)
      ? `/market/${directItem.slug}`
      : `/items/${directItem.slug}`;
  }

  const strippedNumericPrefix = decoded.replace(/^\d+(?:[-_]+)?/, "");
  if (strippedNumericPrefix && strippedNumericPrefix !== decoded) {
    const legacyItem = itemFromMarketAlias(strippedNumericPrefix);
    if (legacyItem) {
      return shouldIndexMarket(legacyItem.slug)
        ? `/market/${legacyItem.slug}`
        : `/items/${legacyItem.slug}`;
    }
  }

  const searchTerm = humanizeMarketLookup(strippedNumericPrefix || decoded);
  if (searchTerm && searchTerm.length >= 3) {
    return `/market?q=${encodeURIComponent(searchTerm)}`;
  }

  return null;
}

export function dropsForItem(slug: string): DropSource[] {
  return _dropsByItemSlug[slug] ?? [];
}

export function hasDropData(slug: string): boolean {
  const drops = _dropsByItemSlug[slug];
  return Array.isArray(drops) && drops.length > 0;
}

/**
 * Whether an item detail page should be indexed by search engines.
 * No-index items that are STAGEBOX or have zero data signals (no drops, no market).
 * This keeps ~90 rich item pages out of ~5,944 — a 98% reduction that signals quality to Google.
 */
export function shouldIndexItem(slug: string): boolean {
  const item = itemBySlug(slug);
  if (!item) return false;
  // STAGEBOX items are internal game objects, not user-searchable
  if (item.type === "STAGEBOX") return false;
  const hasDrops = hasDropData(slug);
  const market = marketForItem(item);
  const hasRealMarket = hasIndexableMarketData(market);
  // Index only if it has at least one real data signal
  return hasDrops || hasRealMarket;
}

/**
 * Whether a market detail page should be indexed by search engines.
 * Market pages need real data (listings, prices, trends) to be useful.
 */
export function shouldIndexMarket(slug: string): boolean {
  const item = itemBySlug(slug);
  if (!item) return false;
  const market = marketForItem(item);
  return hasIndexableMarketData(market);
}

/**
 * Whether a chest detail page should be indexed.
 * Chests that aren't a drop source for any indexed item are noise.
 */
export function shouldIndexChest(slug: string): boolean {
  const item = itemBySlug(slug);
  if (!item || item.type !== "STAGEBOX") return false;
  return hasDropData(slug);
}

export function bestFarmingStages(slug: string, limit = 5): FarmingStage[] {
  const dropSources = dropsForItem(slug);
  if (!dropSources.length) return [];

  // Aggregate all stage drops, combining multiple boxes in the same stage
  const stageMap = new Map<number, {
    stageKey: number;
    act: number;
    no: number;
    diff: string;
    stageSlug: string;
    boxes: Array<{ name: string; rate: number }>;
    totalDropChance: number;
  }>();

  for (const source of dropSources) {
    for (const stage of source.stages) {
      const existing = stageMap.get(stage.key);
      // rate is the drop chance per run (need to combine with box drop chance)
      const effectiveRate = (source.drop_chance / 100) * (stage.rate / 1000);

      if (existing) {
        existing.boxes.push({ name: source.box_name, rate: effectiveRate });
        existing.totalDropChance += effectiveRate;
      } else {
        stageMap.set(stage.key, {
          stageKey: stage.key,
          act: stage.act,
          no: stage.no,
          diff: stage.diff,
          stageSlug: stage.slug,
          boxes: [{ name: source.box_name, rate: effectiveRate }],
          totalDropChance: effectiveRate,
        });
      }
    }
  }

  // Sort by total drop chance descending
  return Array.from(stageMap.values())
    .sort((a, b) => b.totalDropChance - a.totalDropChance)
    .slice(0, limit);
}

export function bestStageForItem(slug: string): FarmingStage | null {
  const stages = bestFarmingStages(slug, 1);
  return stages[0] ?? null;
}

export function allItemsWithDrops(): Array<{ slug: string; sourceCount: number; stageCount: number }> {
  return Object.entries(_dropsByItemSlug)
    .filter(([, sources]) => Array.isArray(sources) && sources.length > 0)
    .map(([slug, sources]) => ({
      slug,
      sourceCount: sources.length,
      stageCount: sources.reduce((sum, s) => sum + s.stages.length, 0),
    }))
    .sort((a, b) => b.sourceCount - a.sourceCount);
}

export const guides: Guide[] = [
  {
    slug: "getting-started",
    category: "beginner",
    title: { zh: "新手开局攻略", en: "Beginner Guide", ja: "初心者ガイド" },
    description: { ja: "解放、装備、素材、リスク管理の順で序盤ルートを作る。", zh: "按解锁、装备、材料和风险顺序建立前期路线。", en: "Build an early route around unlocks, gear, materials, and risk control." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "class-guide",
    category: "beginner",
    title: { zh: "职业选择指南", en: "Class Selection Guide", ja: "クラス選択ガイド" },
    description: { ja: "武器ルート、必要ステータス、周回目的で職業を選ぶ。", zh: "根据武器路径、属性需求和刷图目标选择职业。", en: "Choose a class by weapon path, stat needs, and farming goal." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "cube-materials",
    category: "cube",
    title: { zh: "Cube 合成与材料指南", en: "Cube and Materials Guide", ja: "キューブと素材ガイド" },
    description: { ja: "素材効果、レア度、取引可否で残す順番を決める。", zh: "用材料效果、稀有度和可交易状态决定保留顺序。", en: "Use material effects, rarity, and tradability to decide what to keep." },
    evidence: "datamined",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "steam-market-guide",
    category: "economy",
    title: { zh: "Steam 市场卖东西教程", en: "Steam Market Selling Guide", ja: "Steamマーケット販売ガイド" },
    description: { ja: "出品、成約、供給、市場名一致を分けて読む。", zh: "区分挂单、成交、供应和市场匹配状态。", en: "Separate listings, sales, supply, and market matching status." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "tradable-items",
    category: "economy",
    title: { zh: "可交易装备怎么看", en: "Tradable Items Guide", ja: "トレード可能アイテムガイド" },
    description: { ja: "取引可能は売るべきという意味ではない。用途を先に見る。", zh: "可交易不等于值得卖，先判断用途再判断价格。", en: "Tradable does not automatically mean worth selling." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "chest-drop-guide",
    category: "farming",
    title: { zh: "宝箱掉率怎么用", en: "Chest Drop Guide", ja: "宝箱ドロップ率ガイド" },
    description: { ja: "宝箱レベル、来源ステージ、ドロップ率で周回対象を選ぶ。", zh: "用宝箱等级、来源关卡和掉率数据判断刷取目标。", en: "Use chest level, source stage, and rates to choose farming targets." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "gold-farming-route",
    category: "farming",
    title: { zh: "刷金币路线", en: "Gold Farming Route", ja: "ゴールド稼ぎルート" },
    description: { ja: "ゴールド効率、クリア時間、安定性を比較して最適な周回先を選ぶ。", zh: "比较金币效率、清图时间和稳定性，选择最优刷图关卡。", en: "Compare gold efficiency, clear time, and stability to pick the best farming stage." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "exp-farming-route",
    category: "farming",
    title: { zh: "刷经验路线", en: "EXP Farming Route", ja: "経験値稼ぎルート" },
    description: { ja: "ステージ経験値、撃破数、クリア速度でレベル上げを計画する。", zh: "用关卡经验、击杀数量和清图速度建立升级路线。", en: "Use stage XP, kill count, and clear speed to plan leveling." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
];

export const builds: Build[] = [
  // ── Knight ──
  {
    slug: "knight-shield-early", hero: "Knight", phase: "early", goal: "survival",
    title: { zh: "骑士前期盾牌路线", en: "Knight Early Shield Route", ja: "ナイト盾ルート" },
    description: { zh: "基于 Knight 的 130 基础 HP + 45 护甲（全职业最高生存属性），优先生命、防御和格挡属性，适合稳定推进前期关卡。", en: "Knight has 130 base HP + 45 armor (highest survivability). Prioritize HP, armor, and block for stable early progression.", ja: "Knight の基礎 HP 130 + 装甲 45（全職業最高の生存力）に基づき、HP、防御、ブロックを優先。" },
    evidence: "editorial",
    skillPriority: ["Block", "Shield Bash", "Taunt"],
    runePath: [{ runeName: "AllHeroMaxHp", priority: "must", reason: { en: "Scales knight's massive HP pool", zh: "放大骑士的高血量优势" } }, { runeName: "AllHeroArmor", priority: "must", reason: { en: "Stack with base 45 armor", zh: "叠加基础 45 护甲" } }, { runeName: "AllHeroAttackDamage", priority: "optional", reason: { en: "Boost clear speed", zh: "提升清图速度" } }],
    statPriority: ["HP", "Armor", "Block", "HP Regen"],
    farmingRoute: { stageKey: 2, reason: { en: "Normal 1-2 — safe for early gear building", zh: "普通 1-2 — 安全刷前期装备" } },
    alternativeBuilds: ["knight-farm-mid", "knight-boss-endgame"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "knight-farm-mid", hero: "Knight", phase: "mid", goal: "farming",
    title: { zh: "骑士中期刷图路线", en: "Knight Mid Farming Route", ja: "ナイト中盤周回ルート" },
    description: { zh: "Knight 中期转型刷图。平衡攻防属性，利用高生存能力长时间挂机刷材料和金币。", en: "Mid-game farming build balancing offense and defense. Leverage high survivability for long idle sessions.", ja: "中盤の周回ビルド。攻守バランス型で、高い生存力を活かした長時間放置周回。" },
    evidence: "editorial",
    skillPriority: ["Cleave", "Block", "Shield Bash", "War Cry"],
    runePath: [{ runeName: "AllHeroMaxHp", priority: "must", reason: { en: "Survival foundation", zh: "生存基础" } }, { runeName: "NormalChestDropChance", priority: "must", reason: { en: "More loot per clear", zh: "每次掉落更多" } }, { runeName: "AllHeroAttackDamage", priority: "must", reason: { en: "Core damage scaling", zh: "核心伤害" } }],
    statPriority: ["HP", "Attack Damage", "Armor", "Attack Speed"],
    farmingRoute: { stageKey: 22, reason: { en: "Nightmare 1-2 — good balance of gold and survivability", zh: "噩梦 1-2 — 金币与生存的平衡点" } },
    alternativeBuilds: ["knight-shield-early", "knight-boss-endgame"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "knight-boss-endgame", hero: "Knight", phase: "endgame", goal: "boss",
    title: { zh: "骑士后期 Boss 路线", en: "Knight Endgame Boss Route", ja: "ナイト後期ボスルート" },
    description: { zh: "Knight 后期 Boss 特化。极限堆 HP 和防御，利用 Block 机制硬扛 Boss 技能。", en: "Endgame boss-tanking build. Stack HP and defense to the limit, use Block to absorb boss abilities.", ja: "後期ボス特化ビルド。HPと防御を限界まで積み、Blockでボススキルを吸収。" },
    evidence: "editorial",
    skillPriority: ["Block", "Shield Wall", "Taunt", "Shield Bash"],
    runePath: [{ runeName: "AllHeroMaxHp", priority: "must", reason: { en: "Essential for boss survival", zh: "Boss 生存必备" } }, { runeName: "AllHeroArmor", priority: "must", reason: { en: "Reduce boss damage", zh: "降低 Boss 伤害" } }, { runeName: "BossChestDropChance", priority: "must", reason: { en: "Better boss loot", zh: "Boss 掉落提升" } }],
    statPriority: ["HP", "Armor", "Block", "HP Regen"],
    farmingRoute: { stageKey: 82, reason: { en: "Hell 1-2 — boss drops high-grade gear", zh: "地狱 1-2 — Boss 掉高品装备" } },
    alternativeBuilds: ["knight-shield-early", "knight-farm-mid"],
    updatedAt: UPDATED_AT,
  },
  // ── Ranger ──
  {
    slug: "ranger-farm-early", hero: "Ranger", phase: "early", goal: "farming",
    title: { zh: "游侠前期速刷路线", en: "Ranger Early Speed Farm", ja: "レンジャー序盤速攻ルート" },
    description: { zh: "利用 Ranger 最高基础攻速 100 快速清图。前期优先攻速和移速，快速完成关卡积累资源。", en: "Leverage Ranger's top base attack speed (100) for fast clears. Prioritize ASPD and move speed for early resource accumulation.", ja: "レンジャーの最高基礎攻撃速度100を活かした高速周回。攻撃速度と移動速度を優先し、早期リソース蓄積。" },
    evidence: "editorial",
    skillPriority: ["Multi Shot", "Quick Draw", "Evasion"],
    runePath: [{ runeName: "AllHeroAttackSpeed", priority: "must", reason: { en: "Synergy with base 100 ASPD", zh: "与基础 100 攻速叠加" } }, { runeName: "AllHeroMovementSpeed", priority: "must", reason: { en: "Faster stage traversal", zh: "更快跑图" } }],
    statPriority: ["Attack Speed", "Attack Damage", "Movement Speed", "Critical Chance"],
    farmingRoute: { stageKey: 3, reason: { en: "Normal 1-3 — fast clear, good early drops", zh: "普通 1-3 — 快速清图，掉落不错" } },
    alternativeBuilds: ["ranger-farm-mid", "ranger-boss-mid"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "ranger-farm-mid", hero: "Ranger", phase: "mid", goal: "farming",
    title: { zh: "游侠中期刷图路线", en: "Ranger Mid Farming Route", ja: "レンジャー中盤ルート" },
    description: { zh: "Ranger 拥有全职业最高基础攻速 100，配合理想暴击率 40%。优先攻速、物理伤害和暴击属性。", en: "Ranger has the highest base attack speed (100) and 40% crit chance. Prioritize ASPD, physical damage, and critical.", ja: "レンジャーは全職業最高の基礎攻撃速度100とクリ率40%を持つ。攻撃速度、物理ダメージ、クリティカルを優先。" },
    evidence: "editorial",
    skillPriority: ["Multi Shot", "Critical Eye", "Quick Draw", "Evasion"],
    runePath: [{ runeName: "AllHeroAttackSpeed", priority: "must", reason: { en: "Stack on 100 base ASPD", zh: "在 100 基础攻速上叠加" } }, { runeName: "AllHeroCriticalChance", priority: "must", reason: { en: "Push to 60%+ total", zh: "推到 60%+ 总暴击率" } }, { runeName: "AdditionalExp", priority: "optional", reason: { en: "Level faster while farming", zh: "刷图时更快升级" } }],
    statPriority: ["Attack Speed", "Critical Chance", "Attack Damage", "Critical Damage"],
    farmingRoute: { stageKey: 23, reason: { en: "Nightmare 1-3 — high monster density, fast clears", zh: "噩梦 1-3 — 怪物密集，清图快" } },
    alternativeBuilds: ["ranger-farm-early", "ranger-boss-mid"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "ranger-boss-mid", hero: "Ranger", phase: "mid", goal: "boss",
    title: { zh: "游侠中期 Boss 路线", en: "Ranger Mid Boss Route", ja: "レンジャー中盤ボスルート" },
    description: { zh: "Ranger Boss 特化。牺牲部分攻速换取暴击伤害，确保对 Boss 的爆发输出。", en: "Boss-focused Ranger. Trade some ASPD for crit damage to ensure burst against bosses.", ja: "ボス特化レンジャー。攻撃速度を一部クリダメに振り替え、ボスへのバースト火力を確保。" },
    evidence: "editorial",
    skillPriority: ["Critical Eye", "Snipe", "Multi Shot", "Quick Draw"],
    runePath: [{ runeName: "AllHeroCriticalDamage", priority: "must", reason: { en: "Maximize boss burst", zh: "最大化 Boss 爆发" } }, { runeName: "AllHeroCriticalChance", priority: "must", reason: { en: "Consistent crits", zh: "稳定暴击" } }],
    statPriority: ["Critical Damage", "Critical Chance", "Attack Damage", "Attack Speed"],
    farmingRoute: { stageKey: 43, reason: { en: "Nightmare 3-3 — boss drops rare materials", zh: "噩梦 3-3 — Boss 掉稀有材料" } },
    alternativeBuilds: ["ranger-farm-mid"],
    updatedAt: UPDATED_AT,
  },
  // ── Sorcerer ──
  {
    slug: "sorcerer-farm-early", hero: "Sorcerer", phase: "early", goal: "farming",
    title: { zh: "法师前期法系速刷", en: "Sorcerer Early Caster Farm", ja: "ソーサラー序盤魔法ルート" },
    description: { zh: "利用 Sorcerer 高暴击率（50%）前期清图。注意生存能力最低（50 HP），需要保持距离。", en: "Use Sorcerer's high crit (50%) for early clearing. Watch out for lowest survivability (50 HP).", ja: "ソーサラーの高クリ率50%を活かした序盤周回。最低の生存力（HP50）に注意。" },
    evidence: "editorial",
    skillPriority: ["Fireball", "Arcane Blast", "Teleport"],
    runePath: [{ runeName: "AllHeroCriticalChance", priority: "must", reason: { en: "Push to 65%+", zh: "推到 65%+" } }, { runeName: "AllHeroCriticalDamage", priority: "must", reason: { en: "Scale with 1650% base", zh: "与 1650% 基础叠加" } }],
    statPriority: ["Critical Chance", "Critical Damage", "Cast Speed", "Attack Damage"],
    farmingRoute: { stageKey: 1, reason: { en: "Normal 1-1 — safe start for fragile caster", zh: "普通 1-1 — 脆皮法师的安全起手" } },
    alternativeBuilds: ["sorcerer-material-endgame"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "sorcerer-material-endgame", hero: "Sorcerer", phase: "endgame", goal: "materials",
    title: { zh: "法师后期材料路线", en: "Sorcerer Endgame Material Route", ja: "ソーサラー後期ルート" },
    description: { zh: "Sorcerer 拥有全职业最高暴击伤害 1650% 和暴击率 50%。围绕法系伤害、冷却缩减和材料效果筛选装备。注意生存能力最低（50 HP, 5 护甲）。", en: "Sorcerer has the highest crit damage (1650%) and crit chance (50%). Build around caster damage, cooldown, and material effects. Note: lowest survivability (50 HP, 5 armor).", ja: "ソーサラーは全職業最高のクリダメ1650%とクリ率50%を持つ。魔法ダメージ、クールダウン短縮、素材効果を中心に構築。注意：最低の生存力（HP 50, 装甲 5）。" },
    evidence: "editorial",
    skillPriority: ["Arcane Nova", "Firestorm", "Teleport", "Mana Shield"],
    runePath: [{ runeName: "AllHeroCriticalDamage", priority: "must", reason: { en: "Scale 1650% base to 2000%+", zh: "1650% 基础推到 2000%+" } }, { runeName: "AllHeroCriticalChance", priority: "must", reason: { en: "Reach 70%+ total", zh: "达到 70%+ 总暴击率" } }, { runeName: "AdditionalGold", priority: "optional", reason: { en: "Extra gold from high-value stages", zh: "高价值关卡额外金币" } }],
    statPriority: ["Critical Damage", "Critical Chance", "Cast Speed", "Attack Damage"],
    farmingRoute: { stageKey: 83, reason: { en: "Hell 1-3 — high material drop rate", zh: "地狱 1-3 — 高材料掉率" } },
    alternativeBuilds: ["sorcerer-farm-early", "sorcerer-boss-endgame"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "sorcerer-boss-endgame", hero: "Sorcerer", phase: "endgame", goal: "boss",
    title: { zh: "法师后期 Boss 爆发", en: "Sorcerer Endgame Boss Burst", ja: "ソーサラー後期ボスバースト" },
    description: { zh: "极限暴击伤害路线，追求对 Boss 的一击最高伤害。极度脆皮，需要精确走位。", en: "Maximum crit damage build for highest single-hit boss damage. Extremely fragile — requires precise positioning.", ja: "限界クリダメビルド。ボスへの最大単発ダメージを追求。極度の紙装甲のため正確なポジショニングが必要。" },
    evidence: "editorial",
    skillPriority: ["Arcane Nova", "Firestorm", "Mana Shield", "Teleport"],
    runePath: [{ runeName: "AllHeroCriticalDamage", priority: "must", reason: { en: "Push beyond 2200%", zh: "推到 2200%+" } }, { runeName: "BossChestDropChance", priority: "must", reason: { en: "Better boss loot per kill", zh: "每次 Boss 击杀更好掉落" } }],
    statPriority: ["Critical Damage", "Critical Chance", "Cast Speed", "Max HP"],
    farmingRoute: { stageKey: 93, reason: { en: "Torment 1-3 — highest-grade boss loot", zh: "折磨 1-3 — 最高品 Boss 掉落" } },
    alternativeBuilds: ["sorcerer-material-endgame"],
    updatedAt: UPDATED_AT,
  },
  // ── Priest ──
  {
    slug: "priest-sustain-early", hero: "Priest", phase: "early", goal: "survival",
    title: { zh: "牧师前期续航路线", en: "Priest Early Sustain Route", ja: "プリースト序盤持続ルート" },
    description: { zh: "Priest 拥有均衡的生存属性（95 HP, 30 护甲）。优先生命恢复、冷却缩减和防御属性，适合长时间挂机。", en: "Priest has balanced survivability (95 HP, 30 armor). Prioritize HP recovery, cooldown, and defense for long idle sessions.", ja: "プリーストはバランスの良い生存力（HP 95, 装甲 30）を持つ。HP回復、クールダウン、防御を優先し長時間放置に最適。" },
    evidence: "editorial",
    skillPriority: ["Heal", "Holy Shield", "Smite"],
    runePath: [{ runeName: "AllHeroMaxHp", priority: "must", reason: { en: "Survival base", zh: "生存基础" } }, { runeName: "AllHeroHpRegen", priority: "must", reason: { en: "Sustain engine", zh: "续航引擎" } }],
    statPriority: ["HP Regen", "Max HP", "Armor", "Cooldown"],
    farmingRoute: { stageKey: 4, reason: { en: "Normal 1-4 — gentle start, safe idle", zh: "普通 1-4 — 温和起手，安全挂机" } },
    alternativeBuilds: ["priest-sustain-support", "priest-farm-mid"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "priest-sustain-support", hero: "Priest", phase: "mid", goal: "survival",
    title: { zh: "牧师续航辅助路线", en: "Priest Sustain Support Route", ja: "プリースト持続サポートルート" },
    description: { zh: "Priest 拥有均衡的生存属性（95 HP, 30 护甲）。优先生命恢复、冷却缩减和防御属性，适合长时间挂机 farming 和团队辅助。", en: "Priest has balanced survivability (95 HP, 30 armor). Prioritize HP recovery, cooldown, and defense. Ideal for long-session idle farming and team support.", ja: "プリーストはバランスの良い生存力（HP 95, 装甲 30）を持つ。HP回復、クールダウン、防御を優先。長時間の放置周回とチームサポートに最適。" },
    evidence: "editorial",
    skillPriority: ["Heal", "Holy Shield", "Blessing", "Smite"],
    runePath: [{ runeName: "AllHeroHpRegen", priority: "must", reason: { en: "Infinite sustain", zh: "无限续航" } }, { runeName: "AllHeroArmor", priority: "must", reason: { en: "Damage reduction", zh: "减伤" } }, { runeName: "AdditionalExp", priority: "optional", reason: { en: "Passive leveling", zh: "被动升级" } }],
    statPriority: ["HP Regen", "Max HP", "Cooldown", "Armor"],
    farmingRoute: { stageKey: 24, reason: { en: "Nightmare 1-4 — consistent idle returns", zh: "噩梦 1-4 — 稳定挂机收益" } },
    alternativeBuilds: ["priest-sustain-early", "priest-farm-mid"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "priest-farm-mid", hero: "Priest", phase: "mid", goal: "farming",
    title: { zh: "牧师中期刷图路线", en: "Priest Mid Farming Route", ja: "プリースト中盤周回ルート" },
    description: { zh: "Priest 平衡输出和续航。在保持不死的前提下最大化清图效率。", en: "Balanced Priest build for farming. Maximize clear speed while maintaining immortality.", ja: "バランス型プリースト周回ビルド。不死身を維持しつつ周回速度を最大化。" },
    evidence: "editorial",
    skillPriority: ["Smite", "Holy Nova", "Heal", "Blessing"],
    runePath: [{ runeName: "AllHeroAttackDamage", priority: "must", reason: { en: "Clear speed", zh: "清图速度" } }, { runeName: "AllHeroHpRegen", priority: "must", reason: { en: "Never die", zh: "永不死" } }],
    statPriority: ["Attack Damage", "HP Regen", "Max HP", "Attack Speed"],
    farmingRoute: { stageKey: 34, reason: { en: "Nightmare 2-4 — gold efficiency sweet spot", zh: "噩梦 2-4 — 金币效率甜点" } },
    alternativeBuilds: ["priest-sustain-support"],
    updatedAt: UPDATED_AT,
  },
  // ── Hunter (DLC) ──
  {
    slug: "hunter-farm-early", hero: "Hunter", phase: "early", goal: "farming",
    title: { zh: "猎人前期暴击速刷（DLC）", en: "Hunter Early Crit Farm (DLC)", ja: "ハンター序盤クリファーム（DLC）" },
    description: { zh: "Hunter DLC 英雄。利用高暴击率 45% 前期速刷。需要购买 DLC。", en: "Hunter DLC hero. Use high 45% crit chance for early speed farming. Requires DLC.", ja: "ハンターDLC英雄。高クリ率45%で序盤高速周回。DLC購入が必要。" },
    evidence: "editorial",
    skillPriority: ["Precision Shot", "Rapid Fire", "Hunters Mark"],
    runePath: [{ runeName: "AllHeroCriticalChance", priority: "must", reason: { en: "Push 45% to 60%+", zh: "45% 推到 60%+" } }, { runeName: "AllHeroAttackSpeed", priority: "must", reason: { en: "Faster DPS cycles", zh: "更快输出循环" } }],
    statPriority: ["Critical Chance", "Attack Speed", "Attack Damage", "Critical Damage"],
    farmingRoute: { stageKey: 5, reason: { en: "Normal 1-5 — build early gear foundation", zh: "普通 1-5 — 建立前期装备基础" } },
    alternativeBuilds: ["hunter-crit-burst"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "hunter-crit-burst", hero: "Hunter", phase: "mid", goal: "farming",
    title: { zh: "猎人暴击爆发路线（DLC）", en: "Hunter Crit Burst Route (DLC)", ja: "ハンタークリティカルバーストルート（DLC）" },
    description: { zh: "Hunter 拥有高暴击率 45% + 暴击伤害 1550%。优先暴击、攻速和物理伤害。⚠ 需要购买 DLC。", en: "Hunter has high crit (45%) and crit damage (1550%). Prioritize crit, ASPD, and physical damage. ⚠ Requires DLC.", ja: "ハンターは高クリ率45%＋クリダメ1550%を持つ。クリティカル、攻撃速度、物理ダメージを優先。⚠ DLC購入が必要。" },
    evidence: "editorial",
    skillPriority: ["Precision Shot", "Rapid Fire", "Hunters Mark", "Critical Aim"],
    runePath: [{ runeName: "AllHeroCriticalChance", priority: "must", reason: { en: "Hit 65%+ total", zh: "达到 65%+ 总暴击率" } }, { runeName: "AllHeroCriticalDamage", priority: "must", reason: { en: "Scale 1550% higher", zh: "1550% 再往上涨" } }, { runeName: "AdditionalGold", priority: "optional", reason: { en: "DLC investment payoff", zh: "DLC 投入回报" } }],
    statPriority: ["Critical Chance", "Critical Damage", "Attack Speed", "Attack Damage"],
    farmingRoute: { stageKey: 45, reason: { en: "Nightmare 3-5 — DLC hero sweet spot", zh: "噩梦 3-5 — DLC 英雄甜点" } },
    alternativeBuilds: ["hunter-farm-early", "hunter-boss-endgame"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "hunter-boss-endgame", hero: "Hunter", phase: "endgame", goal: "boss",
    title: { zh: "猎人后期 Boss 狙击（DLC）", en: "Hunter Endgame Boss Sniper (DLC)", ja: "ハンター後期ボススナイパー（DLC）" },
    description: { zh: "极限暴击 Hunter。对 Boss 单体极高伤害。需要精确走位和装备支撑。", en: "Maximum crit Hunter for single-target boss destruction. Requires precise positioning and gear.", ja: "限界クリハンター。ボスへの単体超火力。正確なポジショニングと装備が必要。" },
    evidence: "editorial",
    skillPriority: ["Precision Shot", "Critical Aim", "Hunters Mark", "Rapid Fire"],
    runePath: [{ runeName: "AllHeroCriticalDamage", priority: "must", reason: { en: "Over 2000% crit damage", zh: "超过 2000% 暴伤" } }, { runeName: "BossChestDropChance", priority: "must", reason: { en: "Premium boss loot", zh: "高级 Boss 掉落" } }],
    statPriority: ["Critical Damage", "Critical Chance", "Attack Damage", "Attack Speed"],
    farmingRoute: { stageKey: 95, reason: { en: "Torment 3-5 — ultimate boss farming", zh: "折磨 3-5 — 终极 Boss 刷取" } },
    alternativeBuilds: ["hunter-crit-burst"],
    updatedAt: UPDATED_AT,
  },
  // ── Slayer (DLC) ──
  {
    slug: "slayer-farm-early", hero: "Slayer", phase: "early", goal: "survival",
    title: { zh: "狂战前期生存路线（DLC）", en: "Slayer Early Survival (DLC)", ja: "スレイヤー序盤生存ルート（DLC）" },
    description: { zh: "Slayer DLC 英雄，技能消耗 HP。前期需要平衡生命恢复和输出，避免自伤致死。⚠ 高风险，需要购买 DLC。", en: "Slayer DLC hero — skills cost HP. Balance recovery and damage early to avoid self-kill. ⚠ High risk, requires DLC.", ja: "スレイヤーDLC英雄、スキルはHPを消費。自傷死を避けるため回復とダメージのバランスが必要。⚠ ハイリスク、DLC購入が必要。" },
    evidence: "editorial",
    skillPriority: ["Blood Strike", "Vampiric Aura", "Frenzy"],
    runePath: [{ runeName: "AllHeroHpRegen", priority: "must", reason: { en: "Counter self-damage", zh: "抵消自伤" } }, { runeName: "AllHeroMaxHp", priority: "must", reason: { en: "Bigger HP pool for skills", zh: "更大血量池放技能" } }],
    statPriority: ["HP Regen", "Max HP", "Attack Damage", "Life Steal"],
    farmingRoute: { stageKey: 6, reason: { en: "Normal 1-6 — learn Slayer mechanics safely", zh: "普通 1-6 — 安全学习狂战机制" } },
    alternativeBuilds: ["slayer-high-risk-dps"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "slayer-high-risk-dps", hero: "Slayer", phase: "endgame", goal: "farming",
    title: { zh: "狂战高风险输出路线（DLC）", en: "Slayer High-Risk DPS Route (DLC)", ja: "スレイヤーハイリスクDPSルート（DLC）" },
    description: { zh: "Slayer 拥有全职业最高暴击伤害 1800%。优先暴击伤害、攻击力和攻速。⚠ 高风险高回报，不适合新手。需要 DLC。", en: "Slayer has the highest crit damage (1800%). Prioritize crit damage, ATK, and ASPD. ⚠ High risk, high reward — not for beginners. Requires DLC.", ja: "スレイヤーは全職業最高のクリダメ1800%を持つ。クリダメ、攻撃力、攻撃速度を優先。⚠ ハイリスクハイリターン、初心者非推奨。DLC購入が必要。" },
    evidence: "editorial",
    skillPriority: ["Frenzy", "Blood Strike", "Vampiric Aura", "Berserk"],
    runePath: [{ runeName: "AllHeroCriticalDamage", priority: "must", reason: { en: "Scale 1800% to 2200%+", zh: "1800% 推到 2200%+" } }, { runeName: "AllHeroHpRegen", priority: "must", reason: { en: "Must out-heal self-damage", zh: "必须超过自伤速度" } }, { runeName: "AllHeroAttackDamage", priority: "must", reason: { en: "Raw damage scaling", zh: "基础伤害" } }],
    statPriority: ["Critical Damage", "HP Regen", "Attack Damage", "Attack Speed"],
    farmingRoute: { stageKey: 96, reason: { en: "Torment 3-6 — maximum risk, maximum reward", zh: "折磨 3-6 — 最高风险，最高回报" } },
    alternativeBuilds: ["slayer-farm-early", "slayer-boss-endgame"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "slayer-boss-endgame", hero: "Slayer", phase: "endgame", goal: "boss",
    title: { zh: "狂战后期 Boss 速杀（DLC）", en: "Slayer Endgame Boss Speedkill (DLC)", ja: "スレイヤー後期ボス速殺（DLC）" },
    description: { zh: "Slayer Boss 速杀特化。最大化暴击伤害和攻击力，以最快速度击杀 Boss。极度依赖操作。", en: "Slayer boss speedkill. Maximize crit damage and ATK for fastest boss kills. Extremely skill-dependent.", ja: "スレイヤーボス速殺特化。クリダメと攻撃力を最大化し最速ボス撃破。極度の操作依存。" },
    evidence: "editorial",
    skillPriority: ["Berserk", "Frenzy", "Blood Strike", "Vampiric Aura"],
    runePath: [{ runeName: "AllHeroCriticalDamage", priority: "must", reason: { en: "Over 2200% crit damage", zh: "超 2200% 暴伤" } }, { runeName: "BossChestDropChance", priority: "must", reason: { en: "Speedkill = more kills = more loot", zh: "速杀 = 更多击杀 = 更多掉落" } }],
    statPriority: ["Critical Damage", "Attack Damage", "HP Regen", "Attack Speed"],
    farmingRoute: { stageKey: 100, reason: { en: "Torment 3-10 — marathon boss farming", zh: "折磨 3-10 — 马拉松式 Boss 刷取" } },
    alternativeBuilds: ["slayer-high-risk-dps"],
    updatedAt: UPDATED_AT,
  },
];

export function guideBySlug(category: string, slug: string) {
  return guides.find((guide) => guide.category === category && guide.slug === slug) ?? null;
}

export function buildBySlug(slug: string) {
  return builds.find((build) => build.slug === slug) ?? null;
}

// ── Cross-link helpers ──

/** Get builds for a specific hero */
export function buildsForHero(heroName: string): Build[] {
  return builds.filter((b) => b.hero === heroName);
}

/** Get heroes that can equip a given gear type slot */
export function heroesForGearType(gearType: string | null | undefined): Hero[] {
  if (!gearType || !_heroes) return [];
  return _heroes.filter((h) => h.MainWeaponGearType === gearType || h.SubWeaponGearType === gearType);
}

/** Get monsters that appear in a given stage */
export function monstersForStage(stageKey: number): Monster[] {
  if (!_monsters) return [];
  return _monsters.filter((m) => m.stages?.some((s) => s.key === stageKey));
}

/** Get stages where a given monster appears */
export function stagesForMonster(monsterKey: number): Stage[] {
  if (!_monsters || !_stages) return [];
  const monster = _monsters.find((m) => m.MonsterKey === monsterKey);
  if (!monster?.stages) return [];
  return monster.stages
    .map((s) => _stages!.find((st) => st.key === s.key))
    .filter((s): s is Stage => s != null);
}

/** Get guides for a given topic (category match) */
export function guidesForTopic(category: string) {
  return guides.filter((g) => g.category === category);
}

// ── Wiki data ──

export type WikiArticle = {
  slug: string;
  category: "mechanics" | "economy" | "combat" | "progression" | "stages";
  title: Partial<Record<Locale, string>>;
  description: Partial<Record<Locale, string>>;
  evidence: "datamined" | "editorial" | "community";
  updatedAt: string;
};

export const wikiArticles: WikiArticle[] = [
  { slug: "damage-types", category: "mechanics", title: { en: "Damage Types Explained", zh: "伤害类型详解", ja: "ダメージタイプ解説" }, description: { en: "Physical vs Magical damage, damage delivery types, and how to counter each.", zh: "物理 vs 魔法伤害、伤害传递类型及克制方式。", ja: "物理 vs 魔法ダメージ、ダメージ伝達タイプと対策。" }, evidence: "datamined", updatedAt: UPDATED_AT },
  { slug: "rarity-system", category: "mechanics", title: { en: "Rarity and Grade System", zh: "稀有度与品级系统", ja: "レアリティとグレードシステム" }, description: { en: "How COMMON through COSMIC grades work, stat scaling per grade, and drop rate differences.", zh: "COMMON 到 COSMIC 品级如何运作、各级属性缩放和掉率差异。", ja: "COMMONからCOSMICまでのグレードの仕組み、グレードごとのステータススケーリングとドロップ率の違い。" }, evidence: "datamined", updatedAt: UPDATED_AT },
  { slug: "stat-priority", category: "mechanics", title: { en: "Stat Priority Guide", zh: "属性优先级指南", ja: "ステータス優先度ガイド" }, description: { en: "Which stats matter most for each hero class and phase of the game.", zh: "各职业和游戏阶段哪些属性最重要。", ja: "各ヒーロークラスとゲーム段階で最も重要なステータス。" }, evidence: "editorial", updatedAt: UPDATED_AT },
  { slug: "drop-mechanics", category: "mechanics", title: { en: "How Drops Work", zh: "掉落机制详解", ja: "ドロップメカニクス解説" }, description: { en: "Drop tables, probability mechanics, chest vs monster drops, and how difficulty affects loot.", zh: "掉落表、概率机制、宝箱 vs 怪物掉落、难度如何影响战利品。", ja: "ドロップテーブル、確率メカニクス、宝箱vsモンスタードロップ、難易度による戦利品への影響。" }, evidence: "datamined", updatedAt: UPDATED_AT },
  { slug: "cube-system", category: "mechanics", title: { en: "Hero-dric Cube Deep Dive", zh: "Hero-dric Cube 深度解析", ja: "Hero-dric Cube 詳細解説" }, description: { en: "Complete cube system breakdown: material types, slot effects, crafting recipes, and optimization.", zh: "完整 Cube 系统拆解：材料类型、槽位效果、合成配方和优化策略。", ja: "完全Cubeシステム解説：素材タイプ、スロット効果、クラフトレシピ、最適化戦略。" }, evidence: "datamined", updatedAt: UPDATED_AT },
  { slug: "market-fees", category: "economy", title: { en: "Steam Market Fees & Taxes", zh: "Steam 市场手续费与税务", ja: "Steamマーケット手数料と税金" }, description: { en: "How Steam Market fees work, net profit calculation, and trading restrictions for TBH items.", zh: "Steam 市场手续费如何运作、净收益计算和 TBH 物品交易限制。", ja: "Steamマーケット手数料の仕組み、純利益計算、TBHアイテムの取引制限。" }, evidence: "editorial", updatedAt: UPDATED_AT },
  { slug: "skill-system", category: "combat", title: { en: "Active vs Passive Skills", zh: "主动 vs 被动技能", ja: "アクティブ vs パッシブスキル" }, description: { en: "How skills work: activation types, slot types, damage scaling, and skill level progression.", zh: "技能如何运作：激活类型、槽位类型、伤害缩放和技能等级进阶。", ja: "スキルの仕組み：発動タイプ、スロットタイプ、ダメージスケーリング、スキルレベル進行。" }, evidence: "datamined", updatedAt: UPDATED_AT },
  { slug: "rune-tree", category: "combat", title: { en: "Rune Tree Mechanics", zh: "符文树机制", ja: "ルーンツリーメカニクス" }, description: { en: "Rune tree layout, unlock requirements, cost scaling, and recommended paths per hero class.", zh: "符文树布局、解锁条件、花费缩放和各职业推荐路径。", ja: "ルーンツリーのレイアウト、アンロック条件、コストスケーリング、クラス別推奨パス。" }, evidence: "datamined", updatedAt: UPDATED_AT },
  { slug: "pet-system", category: "progression", title: { en: "Pet Unlock & Progression", zh: "宠物解锁与进阶", ja: "ペットアンロックと進行" }, description: { en: "How to unlock every pet, kill requirements, best farming stages, and DLC vs free pets.", zh: "如何解锁所有宠物、击杀要求、最佳刷取关卡、DLC vs 免费宠物。", ja: "全ペットのアンロック方法、討伐数要件、最適周回ステージ、DLC vs 無料ペット。" }, evidence: "editorial", updatedAt: UPDATED_AT },
  { slug: "difficulty-scaling", category: "stages", title: { en: "Difficulty Scaling (Normal to Torment)", zh: "难度缩放（普通到折磨）", ja: "難易度スケーリング（通常～トーメント）" }, description: { en: "How enemy HP, gold, EXP, and drop rates scale across Normal, Nightmare, Hell, and Torment difficulties.", zh: "敌人血量、金币、经验和掉率如何随普通→噩梦→地狱→折磨难度变化。", ja: "敵HP、ゴールド、EXP、ドロップ率が通常→悪夢→地獄→苦痛でどう変化するか。" }, evidence: "datamined", updatedAt: UPDATED_AT },
];

export function wikiBySlug(slug: string) {
  return wikiArticles.find((a) => a.slug === slug) ?? null;
}

// ── Achievement data ──

export type Achievement = {
  id: number;
  slug: string;
  name: Partial<Record<Locale, string>>;
  description: Partial<Record<Locale, string>>;
  category: "progression" | "collection" | "combat" | "farming" | "challenge";
  unlockCondition: Partial<Record<Locale, string>>;
  reward?: Partial<Record<Locale, string>>;
  hidden?: boolean;
  relatedEntity?: { type: string; slug: string };
};

export const achievements: Achievement[] = [
  { id: 1, slug: "first-steps", category: "progression", name: { en: "First Steps", zh: "初出茅庐", ja: "最初の一歩" }, description: { en: "Complete the tutorial and reach Normal 1-1.", zh: "完成教程并到达普通 1-1。", ja: "チュートリアルを完了し、Normal 1-1に到達する。" }, unlockCondition: { en: "Reach Normal Stage 1-1", zh: "到达普通关卡 1-1", ja: "Normal ステージ 1-1に到達" }, relatedEntity: { type: "stage", slug: "normal-1-1" } },
  { id: 2, slug: "act-1-clear", category: "progression", name: { en: "Act I Clear", zh: "通关第一章", ja: "Act I クリア" }, description: { en: "Defeat the Act 1 boss and clear all Normal Act 1 stages.", zh: "击败第一章 Boss 并通关所有普通第一章关卡。", ja: "Act 1のボスを倒し、全てのNormal Act 1ステージをクリアする。" }, unlockCondition: { en: "Clear Normal Act 1 (all 10 stages)", zh: "通关普通第一章（全部 10 关）", ja: "Normal Act 1を全10ステージクリア" } },
  { id: 3, slug: "nightmare-unlock", category: "progression", name: { en: "Into the Nightmare", zh: "踏入噩梦", ja: "悪夢への突入" }, description: { en: "Unlock Nightmare difficulty by clearing all Normal acts.", zh: "通关全部普通章节解锁噩梦难度。", ja: "全てのNormal ActをクリアしてNightmare難易度を解放する。" }, unlockCondition: { en: "Clear Normal Act 3-10", zh: "通关普通 3-10", ja: "Normal 3-10をクリア" }, relatedEntity: { type: "stage", slug: "normal-3-10" } },
  { id: 4, slug: "hell-unlock", category: "progression", name: { en: "Through Hell and Back", zh: "地狱归来", ja: "地獄からの帰還" }, description: { en: "Unlock Hell difficulty.", zh: "解锁地狱难度。", ja: "Hell難易度を解放する。" }, unlockCondition: { en: "Clear Nightmare Act 3-10", zh: "通关噩梦 3-10", ja: "Nightmare 3-10をクリア" } },
  { id: 5, slug: "torment-unlock", category: "progression", name: { en: "Eternal Torment", zh: "永恒折磨", ja: "永遠の苦痛" }, description: { en: "Unlock Torment difficulty — the ultimate challenge.", zh: "解锁折磨难度——终极挑战。", ja: "Torment難易度を解放——究極の挑戦。" }, unlockCondition: { en: "Clear Hell Act 3-10", zh: "通关地狱 3-10", ja: "Hell 3-10をクリア" } },
  { id: 6, slug: "collector-100", category: "collection", name: { en: "Collector: 100 Items", zh: "收藏家：100 件物品", ja: "コレクター：100アイテム" }, description: { en: "Collect 100 unique items in your inventory.", zh: "在背包中收集 100 件不同物品。", ja: "インベントリに100種類のアイテムを集める。" }, unlockCondition: { en: "Own 100 unique items simultaneously", zh: "同时持有 100 件不同物品", ja: "100種類のアイテムを同時に所持" } },
  { id: 7, slug: "collector-500", category: "collection", name: { en: "Collector: 500 Items", zh: "收藏家：500 件物品", ja: "コレクター：500アイテム" }, description: { en: "Collect 500 unique items.", zh: "收集 500 件不同物品。", ja: "500種類のアイテムを集める。" }, unlockCondition: { en: "Own 500 unique items simultaneously", zh: "同时持有 500 件不同物品", ja: "500種類のアイテムを同時に所持" } },
  { id: 8, slug: "first-legendary", category: "collection", name: { en: "Legendary Find", zh: "传说发现", ja: "伝説の発見" }, description: { en: "Obtain your first LEGENDARY grade item.", zh: "获得第一件 LEGENDARY 品级物品。", ja: "初めてのLEGENDARYグレードアイテムを入手する。" }, unlockCondition: { en: "Loot or craft a LEGENDARY item", zh: "掉落或合成一件 LEGENDARY 物品", ja: "LEGENDARYアイテムをドロップまたはクラフト" } },
  { id: 9, slug: "first-immortal", category: "collection", name: { en: "Immortal Touch", zh: "不朽之触", ja: "不朽の触れ" }, description: { en: "Obtain your first IMMORTAL grade item.", zh: "获得第一件 IMMORTAL 品级物品。", ja: "初めてのIMMORTALグレードアイテムを入手する。" }, unlockCondition: { en: "Loot or craft an IMMORTAL item", zh: "掉落或合成一件 IMMORTAL 物品", ja: "IMMORTALアイテムをドロップまたはクラフト" } },
  { id: 10, slug: "monster-slayer-1000", category: "combat", name: { en: "Monster Slayer I", zh: "怪物杀手 I", ja: "モンスタースレイヤー I" }, description: { en: "Defeat 1,000 monsters.", zh: "击败 1,000 只怪物。", ja: "1,000体のモンスターを倒す。" }, unlockCondition: { en: "Kill 1,000 monsters total", zh: "累计击杀 1,000 只怪物", ja: "累計1,000体討伐" } },
  { id: 11, slug: "monster-slayer-10000", category: "combat", name: { en: "Monster Slayer II", zh: "怪物杀手 II", ja: "モンスタースレイヤー II" }, description: { en: "Defeat 10,000 monsters.", zh: "击败 10,000 只怪物。", ja: "10,000体のモンスターを倒す。" }, unlockCondition: { en: "Kill 10,000 monsters total", zh: "累计击杀 10,000 只怪物", ja: "累計10,000体討伐" } },
  { id: 12, slug: "boss-slayer-10", category: "combat", name: { en: "Boss Slayer", zh: "Boss 杀手", ja: "ボススレイヤー" }, description: { en: "Defeat 10 different bosses.", zh: "击败 10 个不同的 Boss。", ja: "10種類のボスを倒す。" }, unlockCondition: { en: "Kill 10 unique boss monsters", zh: "击杀 10 个不同的 Boss 怪物", ja: "10種類のユニークボスを討伐" } },
  { id: 13, slug: "gold-hoarder", category: "farming", name: { en: "Gold Hoarder", zh: "金币囤积者", ja: "ゴールドの貯め手" }, description: { en: "Accumulate 1,000,000 gold.", zh: "累计获得 1,000,000 金币。", ja: "累計1,000,000ゴールドを獲得する。" }, unlockCondition: { en: "Earn 1,000,000 gold total", zh: "累计获得 1,000,000 金币", ja: "累計1,000,000ゴールド獲得" } },
  { id: 14, slug: "pet-tamer", category: "collection", name: { en: "Pet Tamer", zh: "宠物驯服师", ja: "ペット調教師" }, description: { en: "Unlock your first pet.", zh: "解锁第一只宠物。", ja: "初めてのペットをアンロックする。" }, unlockCondition: { en: "Unlock any pet", zh: "解锁任意宠物", ja: "任意のペットをアンロック" } },
  { id: 15, slug: "full-party", category: "collection", name: { en: "Full Party", zh: "全员集结", ja: "フルパーティー" }, description: { en: "Unlock all 5 free pets.", zh: "解锁全部 5 只免费宠物。", ja: "5匹全ての無料ペットをアンロックする。" }, unlockCondition: { en: "Unlock Bat, Watcher, Burning Skeleton, Blue Golem, and Dark Spirit", zh: "解锁蝙蝠、守望者、燃烧骷髅、蓝魔像和暗灵", ja: "コウモリ、ウォッチャー、バーニングスケルトン、ブルーゴーレム、ダークスピリットをアンロック" } },
  { id: 16, slug: "rune-master", category: "combat", name: { en: "Rune Master", zh: "符文大师", ja: "ルーンマスター" }, description: { en: "Max out any rune to its highest level.", zh: "将任意符文升到最高等级。", ja: "任意のルーンを最大レベルまで強化する。" }, unlockCondition: { en: "Upgrade any rune to max level", zh: "将任意符文升到最高级", ja: "任意のルーンを最大Lvまでアップグレード" } },
  { id: 17, slug: "market-trader", category: "farming", name: { en: "Market Trader", zh: "市场交易者", ja: "マーケットトレーダー" }, description: { en: "Complete your first Steam Market sale.", zh: "完成第一次 Steam 市场卖出交易。", ja: "初めてのSteamマーケット売却を完了する。" }, unlockCondition: { en: "Sell an item on Steam Community Market", zh: "在 Steam 社区市场卖出一件物品", ja: "Steamコミュニティマーケットでアイテムを売却" } },
  { id: 18, slug: "cube-apprentice", category: "progression", name: { en: "Cube Apprentice", zh: "Cube 学徒", ja: "Cube 見習い" }, description: { en: "Use the Hero-dric Cube to craft an item.", zh: "使用 Hero-dric Cube 合成一件物品。", ja: "Hero-dric Cubeでアイテムをクラフトする。" }, unlockCondition: { en: "Craft any item in the Cube", zh: "在 Cube 中合成任意物品", ja: "Cubeで任意のアイテムをクラフト" } },
  { id: 19, slug: "speedrunner", category: "challenge", name: { en: "Speedrunner", zh: "速通达人", ja: "スピードランナー" }, description: { en: "Clear a Normal stage in under 30 seconds.", zh: "在 30 秒内通关一个普通关卡。", ja: "Normalステージを30秒以内にクリアする。" }, unlockCondition: { en: "Clear any Normal stage in <30s", zh: "任意普通关卡 30 秒内通关", ja: "任意のNormalステージを30秒未満でクリア" }, hidden: true },
  { id: 20, slug: "immortal-warrior", category: "challenge", name: { en: "Immortal Warrior", zh: "不朽战士", ja: "不死の戦士" }, description: { en: "Clear a stage without taking any damage.", zh: "无伤通关一个关卡。", ja: "ダメージを受けずにステージをクリアする。" }, unlockCondition: { en: "Clear any stage with 0 damage taken", zh: "无伤通关任意关卡", ja: "被ダメージ0で任意のステージをクリア" }, hidden: true },
];

export function allAchievements() {
  return achievements;
}

export function achievementBySlug(slug: string) {
  return achievements.find((a) => a.slug === slug) ?? null;
}
