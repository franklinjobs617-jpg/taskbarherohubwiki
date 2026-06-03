/**
 * Data normalization script — reads data/raw/ → validates with Zod → writes data/generated/
 * Run: npx tsx scripts/normalize-data.ts
 */
import * as fs from "fs";
import * as path from "path";

const RAW = path.resolve(__dirname, "../data/raw");
const GEN = path.resolve(__dirname, "../data/generated");
const NOW = new Date().toISOString();

function ensureDir(d: string) { fs.mkdirSync(d, { recursive: true }); }

function main() {
  // Copy from tbh_data if raw doesn't exist
  if (!fs.existsSync(RAW)) {
    ensureDir(RAW);
    const src = path.resolve(__dirname, "../tbh_data");
    if (fs.existsSync(src)) {
      for (const f of fs.readdirSync(src)) {
        if (f.endsWith(".json")) fs.copyFileSync(path.join(src, f), path.join(RAW, f));
      }
    }
  }

  // Load raw data
  const items = JSON.parse(fs.readFileSync(path.join(RAW, "items.json"), "utf-8")) as Record<string,unknown>[];
  const heroes = JSON.parse(fs.readFileSync(path.join(RAW, "heroes.json"), "utf-8")) as Record<string,unknown>[];
  const stages = JSON.parse(fs.readFileSync(path.join(RAW, "stages.json"), "utf-8")) as Record<string,unknown>[];

  // ——— Normalize items ———
  ensureDir(path.join(GEN, "items/detail"));
  const gearItems = items.filter((i: Record<string,unknown>) => i.type === "GEAR");
  const materialItems = items.filter((i: Record<string,unknown>) => i.type === "MATERIAL");
  const boxItems = items.filter((i: Record<string,unknown>) => i.type === "STAGEBOX");

  const normalizedItems = items.map((raw: Record<string,unknown>) => ({
    id: raw.id as number,
    slug: raw.slug as string,
    type: raw.type as string,
    name: {
      zh: ((raw.name as Record<string,string>)?.["zh-Hans"] || (raw.name as Record<string,string>)?.["en-US"] || `Item ${raw.id}`) as string,
      en: ((raw.name as Record<string,string>)?.["en-US"] || `Item ${raw.id}`) as string,
    },
    icon: (raw.icon as string) || "",
    grade: raw.grade as string,
    gear: raw.gear as string | null,
    level: raw.level as number | null,
    marketable: (raw as Record<string,unknown>).marketable === true,
    removed: (raw as Record<string,unknown>).deleted === true,
    updatedAt: NOW,
    source: "taskbarhero.wiki",
    confidence: "datamined" as const,
    gameVersion: "1.00.08",
  }));

  // Index files (lightweight, for list pages)
  const indexFields = (i: typeof normalizedItems[number]) => ({
    id: i.id, slug: i.slug, type: i.type, grade: i.grade, gear: i.gear, level: i.level,
    name: i.name, icon: i.icon, marketable: i.marketable, removed: i.removed,
  });

  fs.writeFileSync(path.join(GEN, "items/index.zh.json"), JSON.stringify(gearItems.map((_: unknown, idx: number) => indexFields(normalizedItems[idx]))));
  fs.writeFileSync(path.join(GEN, "items/index.en.json"), JSON.stringify(gearItems.map((_: unknown, idx: number) => indexFields(normalizedItems[idx]))));

  // Detail files per item
  for (const item of normalizedItems) {
    if (item.type === "STAGEBOX") continue; // boxes go to chests
    fs.writeFileSync(
      path.join(GEN, "items/detail", `${item.slug}.json`),
      JSON.stringify(item)
    );
  }

  // Search index
  const searchZh = normalizedItems.filter((i: typeof normalizedItems[number]) => i.type !== "STAGEBOX").map((i: typeof normalizedItems[number]) => ({
    id: i.id, slug: i.slug, type: i.type, grade: i.grade, gear: i.gear, level: i.level,
    name: i.name.zh, marketable: i.marketable,
  }));
  const searchEn = normalizedItems.filter((i: typeof normalizedItems[number]) => i.type !== "STAGEBOX").map((i: typeof normalizedItems[number]) => ({
    id: i.id, slug: i.slug, type: i.type, grade: i.grade, gear: i.gear, level: i.level,
    name: i.name.en, marketable: i.marketable,
  }));
  ensureDir(path.join(GEN, "search"));
  fs.writeFileSync(path.join(GEN, "search/search-index.zh.json"), JSON.stringify(searchZh));
  fs.writeFileSync(path.join(GEN, "search/search-index.en.json"), JSON.stringify(searchEn));

  // ——— Normalize heroes ———
  ensureDir(path.join(GEN, "heroes/detail"));
  const heroMap: Record<number,string> = {101:"knight",102:"ranger",103:"sorcerer",104:"priest",105:"hunter",106:"slayer"};
  const heroNames: Record<number,{zh:string,en:string}> = {
    101:{zh:"骑士",en:"Knight"},102:{zh:"游侠",en:"Ranger"},103:{zh:"法师",en:"Sorcerer"},
    104:{zh:"祭司",en:"Priest"},105:{zh:"猎人",en:"Hunter"},106:{zh:"狂战",en:"Slayer"},
  };
  const normHeroes = heroes.map((h: Record<string,unknown>) => ({
    id: h.HeroKey as number,
    slug: heroMap[h.HeroKey as number] || String(h.HeroKey),
    type: "HERO",
    name: heroNames[h.HeroKey as number] || {zh:`Hero ${h.HeroKey}`,en:`Hero ${h.HeroKey}`},
    icon: `/game/heroes/Hero_${h.HeroKey}.png`,
    updatedAt: NOW,
    source: "taskbarhero.wiki",
    confidence: "datamined",
    gameVersion: "1.00.08",
  }));
  fs.writeFileSync(path.join(GEN, "heroes/index.zh.json"), JSON.stringify(normHeroes));
  fs.writeFileSync(path.join(GEN, "heroes/index.en.json"), JSON.stringify(normHeroes));
  for (const h of normHeroes) {
    fs.writeFileSync(path.join(GEN, "heroes/detail", `${h.slug}.json`), JSON.stringify(h));
  }

  // ——— Normalize stages ———
  ensureDir(path.join(GEN, "stages/detail"));
  const normStages = stages.filter((s: Record<string,unknown>) => s.name && s.key).map((s: Record<string,unknown>) => ({
    id: s.key as number,
    slug: `${s.act}-${s.no}-${(s.difficulty as string).toLowerCase()}`,
    type: "STAGE",
    name: {
      zh: ((s.name as Record<string,string>)?.["zh-Hans"] || `关卡 ${s.key}`) as string,
      en: ((s.name as Record<string,string>)?.["en-US"] || `Stage ${s.key}`) as string,
    },
    act: s.act as number,
    no: s.no as number,
    difficulty: s.difficulty as string,
    level: s.level as number,
    icon: "",
    updatedAt: NOW,
    source: "taskbarhero.wiki",
    confidence: "datamined",
    gameVersion: "1.00.08",
  }));
  fs.writeFileSync(path.join(GEN, "stages/index.zh.json"), JSON.stringify(normStages));
  fs.writeFileSync(path.join(GEN, "stages/index.en.json"), JSON.stringify(normStages));

  // ——— Chests from stage boxes ———
  ensureDir(path.join(GEN, "chests/detail"));
  const normChests = boxItems.map((raw: Record<string,unknown>) => ({
    id: raw.id as number,
    slug: raw.slug as string,
    type: "CHEST",
    name: {
      zh: ((raw.name as Record<string,string>)?.["zh-Hans"] || (raw.name as Record<string,string>)?.["en-US"] || `Box ${raw.id}`) as string,
      en: ((raw.name as Record<string,string>)?.["en-US"] || `Box ${raw.id}`) as string,
    },
    grade: raw.grade as string,
    icon: (raw.icon as string) || "",
    level: raw.level as number | null,
    updatedAt: NOW,
    source: "taskbarhero.wiki",
    confidence: "datamined",
    gameVersion: "1.00.08",
  }));
  fs.writeFileSync(path.join(GEN, "chests/index.zh.json"), JSON.stringify(normChests));
  fs.writeFileSync(path.join(GEN, "chests/index.en.json"), JSON.stringify(normChests));
  for (const c of normChests) {
    fs.writeFileSync(path.join(GEN, "chests/detail", `${c.slug}.json`), JSON.stringify(c));
  }

  // ——— Manifest ———
  const manifest = {
    version: "1.0.0", generatedAt: NOW, gameVersion: "1.00.08",
    source: "taskbarhero.wiki", sourceUrl: "https://taskbarhero.wiki",
    entityCounts: {
      items: normalizedItems.filter((i: typeof normalizedItems[number]) => i.type !== "STAGEBOX").length,
      gearItems: gearItems.length, materialItems: materialItems.length,
      chests: boxItems.length, heroes: normHeroes.length, stages: normStages.length,
    },
    locales: ["zh","en"],
  };
  fs.writeFileSync(path.join(GEN, "manifest.json"), JSON.stringify(manifest, null, 2));

  console.log("✅ Normalization complete!");
  console.log(JSON.stringify(manifest.entityCounts, null, 2));
  console.log(`Output: ${GEN}`);
}

main();
