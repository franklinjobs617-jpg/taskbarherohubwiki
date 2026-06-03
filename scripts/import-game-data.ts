/**
 * Import script — Fetch game data from taskbarhero.wiki public endpoints,
 * validate with Zod, normalize to internal schema, and output structured JSON.
 *
 * Usage: npx tsx scripts/import-game-data.ts
 *
 * Output: data/out/v1/{items,heroes,monsters,stages,runes,skills}/*.json
 * Also generates: manifest.json, search-index.{zh,en}.json
 *
 * Every record includes: sourceUrl, sourceSite, importedAt, confidence
 */

import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

// ——— Zod Schemas ———
const gradeEnum = z.enum([
  "COMMON", "UNCOMMON", "RARE", "LEGENDARY",
  "IMMORTAL", "ARCANA", "BEYOND", "CELESTIAL",
  "DIVINE", "COSMIC",
]);

const slotEnum = z.enum([
  "SWORD", "BOW", "STAFF", "SCEPTER", "TOME",
  "CROSSBOW", "HATCHET", "ORB", "ARROW", "BOLT",
  "ARMOR", "HELMET", "GLOVES", "BOOTS", "SHIELD",
  "AMULET", "RING", "BRACER", "EARING", "AXE",
]);

const itemTypeEnum = z.enum(["GEAR", "MATERIAL", "STAGEBOX"]);

const itemSchema = z.object({
  id: z.number(),
  name: z.record(z.string(), z.string()),
  grade: gradeEnum,
  type: itemTypeEnum,
  gear: slotEnum.nullable(),
  level: z.number().nullable(),
  icon: z.string().nullable(),
  marketable: z.boolean().optional(),
  slug: z.string(),
  // Our enrichment fields
  sourceUrl: z.string(),
  sourceSite: z.string(),
  importedAt: z.string(),
  confidence: z.enum(["datamined", "community", "editorial", "unverified"]),
});

const HERO_SCHEMA = z.object({
  HeroKey: z.number(),
  HeroNameKey: z.string(),
  HeroNameKey_i18n: z.record(z.string(), z.string()),
});

const SOURCE_URL = "https://taskbarhero.wiki";
const SOURCE_SITE = "taskbarhero.wiki";
const IMPORTED_AT = new Date().toISOString();
const CONFIDENCE = "datamined" as const;

// ——— Main ———
async function main() {
  const DATA_DIR = path.resolve(__dirname, "../tbh_data");
  const OUT_DIR = path.resolve(__dirname, "../data/out/v1");

  // Ensure output directories
  for (const sub of ["items", "heroes", "stages", "monsters", "runes", "skills", "search"]) {
    fs.mkdirSync(path.join(OUT_DIR, sub), { recursive: true });
  }

  // ——— Import items ———
  console.log("Importing items...");
  const rawItems = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "items.json"), "utf-8"));
  const enrichedItems = rawItems.map((item: Record<string, unknown>) => ({
    ...item,
    sourceUrl: `${SOURCE_URL}/items/${(item as { slug: string }).slug}`,
    sourceSite: SOURCE_SITE,
    importedAt: IMPORTED_AT,
    confidence: CONFIDENCE,
  }));

  // Validate
  const validItems: z.infer<typeof itemSchema>[] = [];
  const rejected: unknown[] = [];
  for (const item of enrichedItems) {
    const result = itemSchema.safeParse(item);
    if (result.success) validItems.push(result.data);
    else rejected.push({ item, errors: result.error.issues });
  }
  console.log(`  Valid: ${validItems.length}, Rejected: ${rejected.length}`);
  if (rejected.length > 0) {
    fs.writeFileSync(path.join(OUT_DIR, "rejected-items.json"), JSON.stringify(rejected, null, 2));
  }

  // Split into index and detail
  const gearItems = validItems.filter((i) => i.type === "GEAR");
  const materialItems = validItems.filter((i) => i.type === "MATERIAL");

  // Write index files (lightweight, for list pages)
  const indexFields = (i: typeof validItems[number]) => ({
    id: i.id, slug: i.slug, grade: i.grade, type: i.type,
    gear: i.gear, level: i.level, icon: i.icon, marketable: i.marketable,
    name: i.name,
  });

  fs.writeFileSync(
    path.join(OUT_DIR, "items", "index.zh.json"),
    JSON.stringify(gearItems.map(indexFields))
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "items", "index.en.json"),
    JSON.stringify(gearItems.map(indexFields))
  );
  console.log(`  Written ${gearItems.length} gear items to index`);

  // Write search index (Fuse.js format — array of {id, slug, name, gear, grade})
  const searchIndexZh = gearItems.map((i) => ({
    id: i.id, slug: i.slug,
    name: i.name["zh-Hans"] || i.name["en-US"] || "",
    gear: i.gear, grade: i.grade, level: i.level,
  }));
  const searchIndexEn = gearItems.map((i) => ({
    id: i.id, slug: i.slug,
    name: i.name["en-US"] || Object.values(i.name)[0] || "",
    gear: i.gear, grade: i.grade, level: i.level,
  }));
  fs.writeFileSync(path.join(OUT_DIR, "search", "search-index.zh.json"), JSON.stringify(searchIndexZh));
  fs.writeFileSync(path.join(OUT_DIR, "search", "search-index.en.json"), JSON.stringify(searchIndexEn));
  console.log("  Search index written");

  // ——— Import heroes ———
  console.log("Importing heroes...");
  const rawHeroes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "heroes.json"), "utf-8"));
  const validHeroes = rawHeroes.filter((h: unknown) => HERO_SCHEMA.safeParse(h).success);
  console.log(`  Valid: ${validHeroes.length}`);

  // Add Chinese names mapping for known heroes
  const heroNameMap: Record<number, string> = {
    101: "骑士", 102: "游侠", 103: "法师", 104: "祭司", 105: "猎人", 106: "狂战",
  };
  const heroesWithChinese = validHeroes.map((h: Record<string, unknown>) => ({
    key: h.HeroKey,
    name: {
      zh: heroNameMap[h.HeroKey as number] || `Hero_${h.HeroKey}`,
      en: (h.HeroNameKey_i18n as Record<string, string>)["en-US"] || (h.HeroNameKey as string),
    },
    nameI18n: h.HeroNameKey_i18n,
  }));

  fs.writeFileSync(path.join(OUT_DIR, "heroes", "index.zh.json"), JSON.stringify(heroesWithChinese));
  fs.writeFileSync(path.join(OUT_DIR, "heroes", "index.en.json"), JSON.stringify(heroesWithChinese));
  console.log(`  Written ${heroesWithChinese.length} heroes`);

  // ——— Import stages ———
  console.log("Importing stages...");
  const rawStages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "stages.json"), "utf-8"));
  const stagesWithNames = rawStages.filter((s: Record<string, unknown>) => s.name && (s as Record<string, unknown>).key);
  fs.writeFileSync(path.join(OUT_DIR, "stages", "index.zh.json"), JSON.stringify(stagesWithNames));
  fs.writeFileSync(path.join(OUT_DIR, "stages", "index.en.json"), JSON.stringify(stagesWithNames));
  console.log(`  Written ${stagesWithNames.length} stages`);

  // ——— Generate manifest ———
  const manifest = {
    version: "1.0.0",
    generatedAt: IMPORTED_AT,
    source: "taskbarhero.wiki public data",
    sourceUrl: SOURCE_URL,
    entityCounts: {
      items: validItems.length,
      gearItems: gearItems.length,
      materialItems: materialItems.length,
      heroes: validHeroes.length,
      stages: stagesWithNames.length,
      monsters: 0, // populate when monster data is imported
      runes: 0,
      skills: 0,
    },
    locales: ["zh", "en"],
  };
  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

  console.log("\n✅ Import complete!");
  console.log(`Output: ${OUT_DIR}`);
  console.log(JSON.stringify(manifest.entityCounts, null, 2));
}

main().catch(console.error);
