import { z } from "zod";

// Rarity grades
export const GRADE = [
  "COMMON", "UNCOMMON", "RARE", "LEGENDARY",
  "IMMORTAL", "ARCANA", "BEYOND", "CELESTIAL",
  "DIVINE", "COSMIC",
] as const;
export type Grade = (typeof GRADE)[number];

// Item types
export const ITEM_TYPE = ["GEAR", "MATERIAL", "STAGEBOX"] as const;
export type ItemType = (typeof ITEM_TYPE)[number];

// Equipment slots
export const SLOT = [
  "SWORD", "BOW", "STAFF", "SCEPTER", "TOME",
  "CROSSBOW", "HATCHET", "ORB", "ARROW", "BOLT",
  "ARMOR", "HELMET", "GLOVES", "BOOTS", "SHIELD",
  "AMULET", "RING", "BRACER", "EARING", "AXE",
] as const;
export type SlotType = (typeof SLOT)[number];

// Locale
export type Locale = "zh" | "en" | "ja" | "ko";

// Item schema
export const itemSchema = z.object({
  id: z.number(),
  name: z.record(z.string(), z.string()),
  grade: z.enum(GRADE),
  type: z.enum(ITEM_TYPE),
  gear: z.enum(SLOT).nullable(),
  level: z.number().nullable(),
  icon: z.string().nullable(),
  marketable: z.boolean().optional(),
  slug: z.string(),
  sourceUrl: z.string().optional(),
  sourceSite: z.string().optional(),
  importedAt: z.string().optional(),
  confidence: z.enum(["datamined", "community", "editorial", "unverified"]).optional(),
});

export type Item = z.infer<typeof itemSchema>;

// Item detail (from items_detail.json)
export const itemDetailSchema = z.object({
  desc: z.string().nullable().optional(),
  stats: z.record(z.string(), z.unknown()).nullable().optional(),
  synthType: z.string().nullable().optional(),
  dropKey: z.number().nullable().optional(),
  uniqueMod: z.string().nullable().optional(),
});

export type ItemDetail = z.infer<typeof itemDetailSchema>;

// Hero schema
export const heroSchema = z.object({
  HeroKey: z.number(),
  HeroNameKey: z.string(),
  HeroNameKey_i18n: z.record(z.string(), z.string()),
});

export type Hero = z.infer<typeof heroSchema>;

// Stage schema
export const stageSchema = z.object({
  key: z.number(),
  act: z.number(),
  no: z.number(),
  level: z.number(),
  type: z.string(),
  difficulty: z.string(),
  name: z.record(z.string(), z.string()),
});

export type Stage = z.infer<typeof stageSchema>;

// Monster schema
export const monsterSchema = z.object({
  MonsterKey: z.number(),
  MonsterNameStringKey: z.string(),
  MonsterNameStringKey_i18n: z.record(z.string(), z.string()),
});

export type Monster = z.infer<typeof monsterSchema>;

// Market item (from Steam API)
export const marketItemSchema = z.object({
  name: z.string(),
  hash_name: z.string(),
  sell_price: z.number(),
  sell_listings: z.number(),
  sell_price_text: z.string().optional(),
  type: z.string().optional(),
});

export type MarketItem = z.infer<typeof marketItemSchema>;

// Build schema (curated)
export const buildSchema = z.object({
  slug: z.string(),
  heroClass: z.string(),
  title: z.record(z.string(), z.string()),
  description: z.record(z.string(), z.string()),
  gearSlots: z.record(z.string(), z.string()).optional(),
  skillPriority: z.array(z.string()).optional(),
  runePriority: z.array(z.string()).optional(),
  evidenceLevel: z.enum(["datamined", "community", "editorial", "unverified"]),
  source: z.string().optional(),
  sourceUrl: z.string().optional(),
  updatedAt: z.string(),
});

export type Build = z.infer<typeof buildSchema>;

// Guide metadata
export const guideMetaSchema = z.object({
  slug: z.string(),
  category: z.string(),
  title: z.record(z.string(), z.string()),
  description: z.record(z.string(), z.string()),
  evidenceLevel: z.enum(["datamined", "community", "editorial", "unverified"]),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
});

export type GuideMeta = z.infer<typeof guideMetaSchema>;
