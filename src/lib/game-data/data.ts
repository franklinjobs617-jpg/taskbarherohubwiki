import itemsJson from "@/../tbh_data/items.json";
import itemDetailsJson from "@/../tbh_data/items_detail.json";
import heroesJson from "@/../tbh_data/heroes.json";
import stagesJson from "@/../tbh_data/stages.json";
import runesJson from "@/../tbh_data/runes.json";
import skillsJson from "@/../tbh_data/skills.json";
import monstersJson from "@/../tbh_data/monsters.json";
import marketLatestJson from "@/../data/generated/market/v1/latest.json";
import dropsJson from "@/../data/generated/drops.json";

export type Locale = "zh" | "en" | "ja";
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
const dropsRaw = dropsJson as Record<string, unknown>;
const dropsByItemSlug: Record<string, DropSource[]> = {};
// Filter out invalid entries
for (const [slug, sources] of Object.entries(dropsRaw)) {
  if (Array.isArray(sources) && sources.length > 0 && typeof sources[0] === "object" && sources[0] !== null) {
    dropsByItemSlug[slug] = sources as DropSource[];
  }
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://taskbarhero.nanobananas.me";
export const DATA_VERSION = process.env.NEXT_PUBLIC_GAME_VERSION ?? "game-v1";
export const UPDATED_AT = "2026-06-03";
export const MARKET_UPDATED_AT = marketLatest.updatedAt ?? UPDATED_AT;

export const gradeNames: Record<string, Record<Locale, string>> = {
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

export const slotNames: Record<string, Record<Locale, string>> = {
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
  return value === "zh" || value === "en" || value === "ja";
}

export function text(value: Localized | string | null | undefined, locale: Locale, fallback = "") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  const key = locale === "zh" ? "zh-Hans" : locale === "ja" ? "ja-JP" : "en-US";
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

export function dropsForItem(slug: string): DropSource[] {
  return dropsByItemSlug[slug] ?? [];
}

export function hasDropData(slug: string): boolean {
  const drops = dropsByItemSlug[slug];
  return Array.isArray(drops) && drops.length > 0;
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
  return Object.entries(dropsByItemSlug)
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
    description: { ja: "ゴールド、クリア時間、安定性を比較し、架空の市場利益は使わない。", zh: "优先比较金币、清图时间和稳定性，不伪造市场收益。", en: "Compare gold, clear time, and reliability without invented market profit." },
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
  {
    slug: "knight-shield-early",
    hero: "Knight",
    phase: "early",
    goal: "survival",
    title: { zh: "骑士前期盾牌路线", en: "Knight Early Shield Route", ja: "ナイト盾ルート" },
    description: { zh: "基于 Knight 的 130 基础 HP + 45 护甲（全职业最高生存属性），优先生命、防御和格挡属性，适合稳定推进前期关卡。", en: "Knight has 130 base HP + 45 armor (highest survivability). Prioritize HP, armor, and block for stable early progression. Ideal for learning stage mechanics.", ja: "Knight の基礎 HP 130 + 装甲 45（全職業最高の生存力）に基づき、HP、防御、ブロックを優先。安定した序盤進行に最適。" },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "ranger-farm-mid",
    hero: "Ranger",
    phase: "mid",
    goal: "farming",
    title: { zh: "游侠中期刷图路线", en: "Ranger Mid Farming Route", ja: "レンジャー中盤ルート" },
    description: { zh: "Ranger 拥有全职业最高基础攻速 100，配合理想暴击率 40%。优先攻速、物理伤害和暴击属性，适合中期快速清图刷材料。", en: "Ranger has the highest base attack speed (100) and 40% crit chance. Prioritize ASPD, physical damage, and critical for fast mid-game clear speed and material farming.", ja: "Ranger は全職業最高の基礎攻撃速度 100 とクリ率 40% を持つ。攻撃速度、物理ダメージ、クリティカルを優先し、中盤の高速周回と素材収集に最適。" },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "sorcerer-material-endgame",
    hero: "Sorcerer",
    phase: "endgame",
    goal: "materials",
    title: { zh: "法师后期材料路线", en: "Sorcerer Endgame Material Route", ja: "ソーサラー後期ルート" },
    description: { zh: "Sorcerer 拥有全职业最高暴击伤害 1650% 和暴击率 50%。围绕法系伤害、冷却缩减和材料效果筛选装备，适合后期高价值材料刷取。注意生存能力最低（50 HP, 5 护甲）。", en: "Sorcerer has the highest crit damage (1650%) and crit chance (50%). Build around caster damage, cooldown, and material effects. Best for late-game high-value material farming. Note: lowest survivability (50 HP, 5 armor).", ja: "Sorcerer は全職業最高のクリダメ 1650% とクリ率 50% を持つ。魔法ダメージ、クールダウン短縮、素材効果を中心に構築。後期の高価値素材収集に最適。注意：最低の生存力（HP 50, 装甲 5）。" },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "priest-sustain-support",
    hero: "Priest",
    phase: "early",
    goal: "survival",
    title: { zh: "牧师续航辅助路线", en: "Priest Sustain Support Route", ja: "プリースト持続サポートルート" },
    description: { zh: "Priest 拥有均衡的生存属性（95 HP, 30 护甲）。优先生命恢复、冷却缩减和防御属性，适合长时间挂机 farming 和团队辅助。是 Knight 之外最稳定的前期选择。", en: "Priest has balanced survivability (95 HP, 30 armor). Prioritize HP recovery, cooldown, and defense. Ideal for long-session idle farming and team support. Most stable early pick after Knight.", ja: "Priest はバランスの良い生存力（HP 95, 装甲 30）を持つ。HP 回復、クールダウン、防御を優先。長時間の放置周回とチームサポートに最適。Knight に次ぐ安定した序盤の選択肢。" },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "hunter-crit-burst",
    hero: "Hunter",
    phase: "mid",
    goal: "farming",
    title: { zh: "猎人暴击爆发路线（DLC）", en: "Hunter Crit Burst Route (DLC)", ja: "ハンタークリティカルバーストルート（DLC）" },
    description: { zh: "Hunter 是 DLC 英雄，拥有高暴击率 45% + 暴击伤害 1550%。优先暴击、攻速和物理伤害。适合已有装备基础后追求远程爆发效率。⚠ 需要购买 DLC。", en: "Hunter is a DLC hero with high crit (45%) and crit damage (1550%). Prioritize crit, ASPD, and physical damage. Best after having gear foundation for ranged burst efficiency. ⚠ Requires DLC purchase.", ja: "Hunter は DLC 英雄で、高クリ率 45% + クリダメ 1550% を持つ。クリティカル、攻撃速度、物理ダメージを優先。装備基盤がある場合の遠距離バースト効率に最適。⚠ DLC 購入が必要。" },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "slayer-high-risk-dps",
    hero: "Slayer",
    phase: "endgame",
    goal: "farming",
    title: { zh: "杀戮者高风险输出路线（DLC）", en: "Slayer High-Risk DPS Route (DLC)", ja: "スレイヤーハイリスク DPS ルート（DLC）" },
    description: { zh: "Slayer 是 DLC 英雄，拥有全职业最高暴击伤害 1800%。优先暴击伤害、攻击力和攻速。技能消耗 HP，需要特定装备和属性支撑才能稳定发挥。⚠ 高风险高回报，不适合新手。需要购买 DLC。", en: "Slayer is a DLC hero with the highest crit damage (1800%). Prioritize crit damage, ATK, and ASPD. Skills cost HP — requires specific gear and stat support for consistency. ⚠ High risk, high reward — not for beginners. Requires DLC.", ja: "Slayer は DLC 英雄で、全職業最高のクリダメ 1800% を持つ。クリダメ、攻撃力、攻撃速度を優先。スキルは HP を消費するため、安定運用には特定の装備とステータスが必要。⚠ ハイリスクハイリターン、初心者非推奨。DLC 購入が必要。" },
    evidence: "editorial",
    updatedAt: UPDATED_AT,
  },
];

export function guideBySlug(category: string, slug: string) {
  return guides.find((guide) => guide.category === category && guide.slug === slug) ?? null;
}

export function buildBySlug(slug: string) {
  return builds.find((build) => build.slug === slug) ?? null;
}
