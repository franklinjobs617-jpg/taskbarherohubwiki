import itemsJson from "@/../tbh_data/items.json";
import itemDetailsJson from "@/../tbh_data/items_detail.json";
import heroesJson from "@/../tbh_data/heroes.json";
import stagesJson from "@/../tbh_data/stages.json";
import runesJson from "@/../tbh_data/runes.json";
import skillsJson from "@/../tbh_data/skills.json";
import monstersJson from "@/../tbh_data/monsters.json";
import marketLatestJson from "@/../data/generated/market/v1/latest.json";

export type Locale = "zh" | "en";
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

export type Guide = {
  slug: string;
  category: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  evidence: "editorial" | "datamined" | "community" | "unverified";
  updatedAt: string;
};

export type Build = {
  slug: string;
  hero: string;
  phase: "early" | "mid" | "endgame";
  goal: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  evidence: "editorial" | "community" | "unverified";
  updatedAt: string;
};

const items = itemsJson as RawItem[];
const details = itemDetailsJson as Record<string, ItemDetail>;
const heroes = heroesJson as Hero[];
const stages = stagesJson as Stage[];
const runes = runesJson as Rune[];
const skills = skillsJson as Skill[];
const monsters = monstersJson as Monster[];
const marketLatest = marketLatestJson as { updatedAt?: string; items?: MarketRecord[] };
const marketByItemSlug = new Map((marketLatest.items ?? []).map((row) => [row.slug, row]));

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://taskbarhero.nanobananas.me";
export const DATA_VERSION = process.env.NEXT_PUBLIC_GAME_VERSION ?? "game-v1";
export const UPDATED_AT = "2026-06-03";
export const MARKET_UPDATED_AT = marketLatest.updatedAt ?? UPDATED_AT;

export const gradeNames: Record<string, Record<Locale, string>> = {
  COMMON: { zh: "普通", en: "Common" },
  UNCOMMON: { zh: "优秀", en: "Uncommon" },
  RARE: { zh: "稀有", en: "Rare" },
  LEGENDARY: { zh: "传说", en: "Legendary" },
  IMMORTAL: { zh: "不朽", en: "Immortal" },
  ARCANA: { zh: "奥秘", en: "Arcana" },
  BEYOND: { zh: "超越", en: "Beyond" },
  CELESTIAL: { zh: "天界", en: "Celestial" },
  DIVINE: { zh: "神圣", en: "Divine" },
  COSMIC: { zh: "宇宙", en: "Cosmic" },
};

export const slotNames: Record<string, Record<Locale, string>> = {
  SWORD: { zh: "剑", en: "Sword" },
  BOW: { zh: "弓", en: "Bow" },
  STAFF: { zh: "法杖", en: "Staff" },
  SCEPTER: { zh: "权杖", en: "Scepter" },
  TOME: { zh: "法典", en: "Tome" },
  CROSSBOW: { zh: "弩", en: "Crossbow" },
  HATCHET: { zh: "手斧", en: "Hatchet" },
  ORB: { zh: "法球", en: "Orb" },
  ARROW: { zh: "箭矢", en: "Arrow" },
  BOLT: { zh: "弩箭", en: "Bolt" },
  AXE: { zh: "斧", en: "Axe" },
  ARMOR: { zh: "护甲", en: "Armor" },
  HELMET: { zh: "头盔", en: "Helmet" },
  GLOVES: { zh: "手套", en: "Gloves" },
  BOOTS: { zh: "靴子", en: "Boots" },
  SHIELD: { zh: "盾牌", en: "Shield" },
  AMULET: { zh: "护符", en: "Amulet" },
  RING: { zh: "戒指", en: "Ring" },
  BRACER: { zh: "护腕", en: "Bracer" },
  EARING: { zh: "耳环", en: "Earring" },
};

export function isLocale(value: string): value is Locale {
  return value === "zh" || value === "en";
}

export function text(value: Localized | string | null | undefined, locale: Locale, fallback = "") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  const key = locale === "zh" ? "zh-Hans" : "en-US";
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
  return items;
}

export function gearPreviewItem(gear: string | null | undefined) {
  if (!gear) return null;
  return items.find((item) => item.type === "GEAR" && item.gear === gear && item.icon) ?? null;
}

export function itemBySlug(slug: string) {
  return items.find((item) => item.slug === slug) ?? null;
}

export function itemDetail(id: number) {
  return details[String(id)] ?? null;
}

export function allHeroes() {
  return heroes;
}

export function heroBySlug(slug: string) {
  return heroes.find((hero) => (hero.slug ?? hero.ClassType?.toLowerCase()) === slug) ?? null;
}

export function heroName(hero: Hero, locale: Locale) {
  return text(hero.HeroNameKey_i18n, locale, hero.ClassType ?? `Hero ${hero.HeroKey}`);
}

export function heroSlug(hero: Hero) {
  return hero.slug ?? hero.ClassType?.toLowerCase() ?? String(hero.HeroKey);
}

export function allStages() {
  return stages;
}

export function stageSlug(stage: Stage) {
  return stage.slug ?? `${stage.difficulty.toLowerCase()}-${stage.act}-${stage.no}`;
}

export function stageBySlug(slug: string) {
  return stages.find((stage) => stageSlug(stage) === slug || String(stage.key) === slug) ?? null;
}

export function stageName(stage: Stage, locale: Locale) {
  return text(stage.name, locale, `Stage ${stage.key}`);
}

export function allRunes() {
  return runes;
}

export function allSkills() {
  return skills;
}

export function skillName(skill: Skill, locale: Locale) {
  return text(skill.SkillNameKey_i18n ?? undefined, locale, `Skill ${skill.SkillKey}`);
}

export function allMonsters() {
  return monsters;
}

export function chestItems() {
  return items.filter((item) => item.type === "STAGEBOX");
}

export function effectRows(locale: Locale) {
  return Object.entries(details).flatMap(([id, detail]) => {
    if (!detail.matEffects?.groups) return [];
    const item = items.find((entry) => String(entry.id) === id);
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
  const realMarket = marketByItemSlug.get(item.slug);
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

export function marketRows() {
  return items
    .map((item) => ({ item, market: marketForItem(item) }))
    .filter((row): row is { item: RawItem; market: MarketRecord } => Boolean(row.market))
    .sort((a, b) => itemName(a.item, "en").localeCompare(itemName(b.item, "en")));
}

export function marketBySlug(slug: string) {
  const decoded = decodeURIComponent(slug);
  const item = items.find((entry) => entry.slug === decoded || itemName(entry, "en") === decoded) ?? null;
  if (!item) return null;
  const market = marketForItem(item);
  if (!market) return null;
  return { item, market };
}

export const guides: Guide[] = [
  {
    slug: "getting-started",
    category: "beginner",
    title: { zh: "新手开局攻略", en: "Beginner Guide" },
    description: { zh: "按解锁、装备、材料和风险顺序建立前期路线。", en: "Build an early route around unlocks, gear, materials, and risk control." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "class-guide",
    category: "beginner",
    title: { zh: "职业选择指南", en: "Class Selection Guide" },
    description: { zh: "根据武器路径、属性需求和刷图目标选择职业。", en: "Choose a class by weapon path, stat needs, and farming goal." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "cube-materials",
    category: "cube",
    title: { zh: "Cube 合成与材料指南", en: "Cube and Materials Guide" },
    description: { zh: "用材料效果、稀有度和可交易状态决定保留顺序。", en: "Use material effects, rarity, and tradability to decide what to keep." },
    evidence: "datamined",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "steam-market-guide",
    category: "economy",
    title: { zh: "Steam 市场卖东西教程", en: "Steam Market Selling Guide" },
    description: { zh: "区分挂单、成交、供应和市场匹配状态。", en: "Separate listings, sales, supply, and market matching status." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "tradable-items",
    category: "economy",
    title: { zh: "可交易装备怎么看", en: "Tradable Items Guide" },
    description: { zh: "可交易不等于值得卖，先判断用途再判断价格。", en: "Tradable does not automatically mean worth selling." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "chest-drop-guide",
    category: "farming",
    title: { zh: "宝箱掉率怎么用", en: "Chest Drop Guide" },
    description: { zh: "用宝箱等级、来源关卡和掉率数据判断刷取目标。", en: "Use chest level, source stage, and rates to choose farming targets." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "gold-farming-route",
    category: "farming",
    title: { zh: "刷金币路线", en: "Gold Farming Route" },
    description: { zh: "优先比较金币、清图时间和稳定性，不伪造市场收益。", en: "Compare gold, clear time, and reliability without invented market profit." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "exp-farming-route",
    category: "farming",
    title: { zh: "刷经验路线", en: "EXP Farming Route" },
    description: { zh: "用关卡经验、击杀数量和清图速度建立升级路线。", en: "Use stage XP, kill count, and clear speed to plan leveling." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
];

export const builds: Build[] = [
  {
    slug: "knight-shield-early",
    hero: "Knight",
    phase: "early",
    goal: "survival",
    title: { zh: "骑士前期盾牌路线", en: "Knight Early Shield Route" },
    description: { zh: "优先生命、防御和格挡，适合稳定推进。", en: "Prioritize HP, armor, and block for stable progression." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "ranger-farm-mid",
    hero: "Ranger",
    phase: "mid",
    goal: "farming",
    title: { zh: "游侠中期刷图路线", en: "Ranger Mid Farming Route" },
    description: { zh: "优先攻速、物理伤害和清图效率。", en: "Prioritize attack speed, physical damage, and clear speed." },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "sorcerer-material-endgame",
    hero: "Sorcerer",
    phase: "endgame",
    goal: "materials",
    title: { zh: "法师后期材料路线", en: "Sorcerer Endgame Material Route" },
    description: { zh: "围绕高阶材料和法系属性建立保守路线。", en: "Use high-tier materials and caster stats as the route anchor." },
    evidence: "unverified",
    updatedAt: UPDATED_AT,
  },
];

export function guideBySlug(category: string, slug: string) {
  return guides.find((guide) => guide.category === category && guide.slug === slug) ?? null;
}

export function buildBySlug(slug: string) {
  return builds.find((build) => build.slug === slug) ?? null;
}
