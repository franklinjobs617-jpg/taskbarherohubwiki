import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const outDir = join(root, "data", "generated", "competitor");

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function writeJson(name, value) {
  const file = join(outDir, name);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const pets = readJson("tbh_external/pets.json");
const chests = readJson("data/generated/game/v1/graph/chests.json");
const stages = readJson("data/generated/game/v1/graph/stages.json");

writeJson("pets.json", {
  generatedAt: new Date().toISOString(),
  rows: pets.map((pet) => ({
    key: pet.key,
    name: pet.name,
    bonus: pet.stats?.map((stat) => `${stat.label} ${stat.disp}`).join("; ") ?? "",
    unlockType: pet.unlock?.type ?? "Unknown",
    unlockMonster: pet.unlock?.monsterName ?? null,
    killCount: pet.unlock?.count ?? null,
    bestStage: pet.unlock?.farm
      ? {
          label: pet.unlock.farm.label,
          act: pet.unlock.farm.act,
          stageNo: pet.unlock.farm.stageNo,
          name: pet.unlock.farm.stageName,
          spawnShare: pet.unlock.farm.share,
          mapTarget: `/stages/${pet.unlock.farm.act}-${pet.unlock.farm.stageNo}`,
        }
      : null,
    dlc: Boolean(pet.dlc),
  })),
});

writeJson("chests.json", {
  generatedAt: new Date().toISOString(),
  rows: chests.map((chest) => {
    const levels = chest.contents
      .map((content) => content.condition)
      .filter((value) => Number.isFinite(value));
    const sourceStages = chest.dropSources.map((source) => {
      const stage = stages.find((entry) => entry.key === source.stageKey);
      return {
        stageKey: source.stageKey,
        slug: stage?.slug ?? String(source.stageKey),
        label: stage ? `${stage.difficulty} ${stage.act}-${stage.stageNo}` : String(source.stageKey),
        sourceType: source.sourceType,
        dropRate: source.ratePercent,
      };
    });

    return {
      key: chest.key,
      slug: chest.slug,
      name: chest.name,
      gearLevelMin: levels.length ? Math.min(...levels) : null,
      gearLevelMax: levels.length ? Math.max(...levels) : null,
      sourceStages,
      contentPool: chest.contents.map((content) => ({
        itemKey: content.itemKey,
        slug: content.itemSlug,
        name: content.name,
        type: content.type,
        grade: content.grade,
        chance: content.chancePercent,
      })),
      dropRates: chest.dropSources.map((source) => ({
        stageKey: source.stageKey,
        sourceType: source.sourceType,
        probability: source.ratePercent,
      })),
    };
  }),
});

writeJson("farm.json", {
  generatedAt: new Date().toISOString(),
  rows: stages.map((stage) => ({
    stageKey: stage.key,
    slug: stage.slug,
    label: `${stage.difficulty} ${stage.act}-${stage.stageNo}`,
    act: stage.act,
    stageNo: stage.stageNo,
    level: stage.level,
    exp: stage.rewards?.expPerClear ?? null,
    gold: stage.rewards?.goldPerClear ?? null,
    hpSignal: stage.boss?.multipliers?.hp ?? null,
    chestEntries: stage.drops?.length ?? 0,
  })),
  rankingReference: {
    expPerHour: "exp * 3600 / clearSeconds",
    goldPerHour: "gold * 3600 / clearSeconds",
  },
});
