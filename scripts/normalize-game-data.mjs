import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const sourceDir = path.join(root, "tbh_data");
const out = path.join(root, "data", "generated");
const now = new Date().toISOString();

const read = (name) => JSON.parse(fs.readFileSync(path.join(sourceDir, name), "utf8"));
const write = (file, data) => {
  fs.mkdirSync(path.dirname(path.join(out, file)), { recursive: true });
  fs.writeFileSync(path.join(out, file), JSON.stringify(data, null, 2));
};
const name = (record, locale) => record?.[locale === "zh" ? "zh-Hans" : "en-US"] ?? record?.["en-US"] ?? Object.values(record ?? {})[0] ?? "";
const asset = (value) => {
  if (!value) return null;
  if (value.startsWith("/game/game/")) return value;
  if (value.startsWith("/game/")) return `/game${value}`;
  return value;
};

const items = read("items.json");
const details = read("items_detail.json");
const heroes = read("heroes.json");
const stages = read("stages.json");
const runes = read("runes.json");
const skills = read("skills.json");

const entity = (item) => ({
  id: item.id,
  slug: item.slug,
  type: item.type,
  name: { zh: name(item.name, "zh"), en: name(item.name, "en") },
  description: {
    zh: name(details[String(item.id)]?.desc, "zh"),
    en: name(details[String(item.id)]?.desc, "en"),
  },
  icon: asset(item.icon),
  image: asset(item.icon),
  grade: item.grade,
  gear: item.gear,
  level: item.level,
  gameVersion: "game-v1",
  updatedAt: now,
  source: "local-json",
  marketable: Boolean(item.marketable),
  removed: false,
  confidence: "datamined",
});

for (const locale of ["zh", "en"]) {
  write(`game/v1/items/index.${locale}.json`, items.map(entity));
  write(`game/v1/heroes/index.${locale}.json`, heroes.map((hero) => ({ ...hero, icon: asset(hero.icon), slug: hero.slug ?? hero.ClassType?.toLowerCase() })));
  write(`game/v1/stages/index.${locale}.json`, stages.map((stage) => ({ ...stage, slug: stage.slug ?? `${stage.difficulty.toLowerCase()}-${stage.act}-${stage.no}` })));
  write(`game/v1/runes/index.${locale}.json`, runes);
  write(`game/v1/skills/index.${locale}.json`, skills);
  write(`game/v1/search/search-index.${locale}.json`, items.map((item) => ({ id: item.id, slug: item.slug, name: name(item.name, locale), type: item.type, grade: item.grade, gear: item.gear })));
}

for (const item of items) {
  write(`game/v1/items/detail/${item.slug}.json`, { ...entity(item), detail: details[String(item.id)] ?? null });
}
for (const chest of items.filter((item) => item.type === "STAGEBOX")) {
  write(`game/v1/chests/detail/${chest.slug}.json`, entity(chest));
}
for (const hero of heroes) write(`game/v1/heroes/detail/${hero.slug ?? hero.ClassType?.toLowerCase()}.json`, hero);
for (const stage of stages) write(`game/v1/stages/detail/${stage.slug ?? `${stage.difficulty.toLowerCase()}-${stage.act}-${stage.no}`}.json`, stage);

write("game/v1/manifest.json", {
  version: "game-v1",
  generatedAt: now,
  source: "tbh_data local JSON",
  locales: ["zh", "en"],
  entityCounts: {
    items: items.length,
    heroes: heroes.length,
    stages: stages.length,
    runes: runes.length,
    skills: skills.length,
    chests: items.filter((item) => item.type === "STAGEBOX").length,
  },
});
write("market/v1/latest.json", items.filter((item) => item.marketable).map((item) => ({ slug: item.slug, marketHash: name(item.name, "en"), confidence: "missing", updatedAt: now })));

console.log(`Generated data in ${out}`);
