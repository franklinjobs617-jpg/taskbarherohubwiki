import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const items = JSON.parse(fs.readFileSync(path.join(ROOT, "tbh_data/items.json"), "utf8"));
const heroes = JSON.parse(fs.readFileSync(path.join(ROOT, "tbh_data/heroes.json"), "utf8"));
const monsters = JSON.parse(fs.readFileSync(path.join(ROOT, "tbh_data/monsters.json"), "utf8"));
const runes = JSON.parse(fs.readFileSync(path.join(ROOT, "tbh_data/runes.json"), "utf8"));
const stages = JSON.parse(fs.readFileSync(path.join(ROOT, "tbh_data/stages.json"), "utf8"));
const extPets = JSON.parse(fs.readFileSync(path.join(ROOT, "tbh_external/pets.json"), "utf8"));
const extEffects = JSON.parse(fs.readFileSync(path.join(ROOT, "tbh_external/effects.json"), "utf8"));

const check = (rel) => fs.existsSync(path.join(PUBLIC, rel));

const results = [];
let totalN = 0, totalE = 0;
const missingList = [];

function report(name, needed, exist, missingItems) {
  results.push({ name, needed, exist });
  totalN += needed;
  totalE += exist;
  if (missingItems && missingItems.length > 0) {
    missingList.push({ category: name, items: missingItems.slice(0, 20) });
  }
}

// 1. MATERIALS
const matIcons = [...new Set(items.filter(i => i.type === "MATERIAL" && i.icon).map(i => {
  const f = i.icon.split("/").pop();
  return { filename: f, name: i.name?.["en-US"] || f, url: "https://taskbarhero.wiki" + i.icon, local: "game/game/items/materials/" + f };
}))];
const matMissing = matIcons.filter(m => !check(m.local));
report("材料图标 Materials", matIcons.length, matIcons.length - matMissing.length, matMissing);

// 2. BOXES
const boxIcons = [...new Set(items.filter(i => i.type === "STAGEBOX" && i.icon).map(i => {
  const f = i.icon.split("/").pop();
  return { filename: f, name: i.name?.["en-US"] || f, url: "https://taskbarhero.wiki" + i.icon, local: "game/game/items/boxes/" + f };
}))];
const boxMissing = boxIcons.filter(m => !check(m.local));
report("宝箱图标 Boxes", boxIcons.length, boxIcons.length - boxMissing.length, boxMissing);

// 3. GEAR
const gearIcons = [...new Set(items.filter(i => i.type === "GEAR" && i.icon && i.gear).map(i => {
  const f = i.icon.split("/").pop();
  return { filename: f, gear: i.gear, name: i.name?.["en-US"] || f, url: "https://taskbarhero.wiki" + i.icon, local: "game/game/gear/" + i.gear.toLowerCase() + "/" + f };
}))];
const gearMissing = gearIcons.filter(m => !check(m.local));
report("装备图标 Gear", gearIcons.length, gearIcons.length - gearMissing.length, gearMissing);

// 4. MONSTERS
const monPics = monsters.filter(m => m.portrait).map(m => {
  const clean = m.portrait.replace(/^\//, "");
  return { name: m.MonsterNameStringKey_i18n?.["en-US"] || "?", url: "https://taskbarhero.wiki" + m.portrait, local: "game/" + clean };
});
const monMissing = monPics.filter(m => !check(m.local));
report("怪物头像 Monsters", monPics.length, monPics.length - monMissing.length, monMissing);

// 5. BOSS (deduplicated)
const bossPics = stages.filter(s => s.boss?.portrait).map(s => {
  const clean = s.boss.portrait.replace(/^\//, "");
  return { stage: s.name?.["en-US"] || s.key, url: "https://taskbarhero.wiki" + s.boss.portrait, local: "game/" + clean };
});
const uniqueBoss = [];
const seenBoss = new Set();
for (const b of bossPics) { if (!seenBoss.has(b.local)) { seenBoss.add(b.local); uniqueBoss.push(b); } }
const bossMissing = uniqueBoss.filter(m => !check(m.local));
report("Boss头像 Boss", uniqueBoss.length, uniqueBoss.length - bossMissing.length, bossMissing);

// 6. HEROES
const heroPics = heroes.filter(h => h.icon).map(h => {
  const clean = h.icon.replace(/^\//, "");
  return { hero: h.HeroNameKey_i18n?.["en-US"] || h.HeroKey, url: "https://taskbarhero.wiki" + h.icon, local: "game/" + clean };
});
const heroMissing = heroPics.filter(m => !check(m.local));
report("英雄头像 Heroes", heroPics.length, heroPics.length - heroMissing.length, heroMissing);

// 7. RUNES
const runeIcons = [...new Set(runes.filter(r => r.icon).map(r => {
  const f = r.icon.split("/").pop();
  return { filename: f, url: "https://taskbarhero.wiki" + r.icon, local: "game/runes/" + f };
}))];
const runeMissing = runeIcons.filter(m => !check(m.local));
report("符文图标 Runes", runeIcons.length, runeIcons.length - runeMissing.length, runeMissing);

// 8. PETS
const petIcons = extPets.filter(p => p.icon).map(p => {
  const f = p.icon + ".png";
  return { name: p.name, local: "game/pets/" + f };
});
const petMissing = petIcons.filter(m => !check(m.local));
report("宠物图标 Pets", petIcons.length, petIcons.length - petMissing.length, petMissing);

// 9. EFFECTS
const effIcons = extEffects.filter(e => e.icon).map(e => {
  const f = e.icon + ".png";
  return { name: e.name, local: "game/game/items/materials/" + f };
});
const effMissing = effIcons.filter(m => !check(m.local));
report("效果图标 Effects", effIcons.length, effIcons.length - effMissing.length, effMissing);

// 10. HERO ANIMATIONS
const heroAnims = ["HeroAnim_101.png", "HeroAnim_201.png", "HeroAnim_301.png", "HeroAnim_401.png", "HeroAnim_501.png", "HeroAnim_601.png"];
const animExist = heroAnims.filter(f => check("game/heroes/anim/" + f)).length;
const animMissing = heroAnims.filter(f => !check("game/heroes/anim/" + f));
report("英雄动画精灵 Hero Anims", heroAnims.length, animExist, animMissing.map(f => ({ filename: f })));

// 11. HERO ART
const heroArts = ["HeroArt_101.png", "HeroArt_201.png", "HeroArt_301.png", "HeroArt_401.png", "HeroArt_501.png", "HeroArt_601.png"];
const artExist = heroArts.filter(f => check("game/heroes/art/" + f)).length;
const artMissing = heroArts.filter(f => !check("game/heroes/art/" + f));
report("英雄立绘 Hero Art", heroArts.length, artExist, artMissing.map(f => ({ filename: f })));

// PRINT REPORT
console.log("");
console.log("=".repeat(55));
console.log("           📊 图片完整性验证报告");
console.log("=".repeat(55));
for (const r of results) {
  const icon = r.exist === r.needed ? "✅" : "❌";
  console.log(`  ${icon} ${r.name}: ${r.exist}/${r.needed}`);
}
console.log("-".repeat(55));
const totalMissing = totalN - totalE;
console.log(`  总计: ${totalE}/${totalN} (缺失 ${totalMissing})`);
console.log("=".repeat(55));

if (missingList.length > 0) {
  console.log("");
  console.log("🔴 缺失详情:");
  for (const group of missingList) {
    console.log(`\n  [${group.category}] ${group.items.length} 个缺失:`);
    for (const item of group.items) {
      const label = item.name || item.filename || item.hero || item.stage || "?";
      console.log(`    - ${label}`);
      console.log(`      URL: ${item.url || "N/A"}`);
      console.log(`      Save: ${item.local}`);
    }
  }
  // Save missing list for download
  const toDownload = [];
  for (const group of missingList) {
    for (const item of group.items) {
      if (item.url) toDownload.push({ url: item.url, local: item.local });
    }
  }
  fs.writeFileSync(path.join(ROOT, ".tmp-missing-images.json"), JSON.stringify(toDownload, null, 2));
  console.log(`\n  缺失列表已保存到 .tmp-missing-images.json`);
} else {
  console.log("");
  console.log("🎉 所有图片资源完整！");
}

// Also check total disk count
function countFiles(dir, depth) {
  if (!fs.existsSync(dir) || depth <= 0) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) count += countFiles(path.join(dir, entry.name), depth - 1);
    else if (/\.(png|jpg|webp)$/i.test(entry.name)) count++;
  }
  return count;
}
const totalOnDisk = countFiles(path.join(PUBLIC, "game"), 6);
console.log(`\n磁盘总图片数: ${totalOnDisk}`);
