import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseUrl = "https://tbherohelper.com";
const probeUrl = `${baseUrl}/stage-boxes`;
const outDir = path.join(root, "data", "generated", "game", "v1", "competitor-public");
const outFile = path.join(outDir, "tbh-helper.json");
const generatedAt = new Date().toISOString();

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "NucoDataHarvester/1.0",
      accept: "text/html,application/javascript,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!response.ok) throw new Error(`Fetch failed ${response.status} ${url}`);
  return response.text();
}

async function findDataAsset() {
  const html = await fetchText(probeUrl);
  const asset = [...html.matchAll(/href="(\/assets\/data-[^"]+\.js)"/g)].map((match) => match[1])[0];
  if (!asset) throw new Error(`Could not find public data asset on ${probeUrl}`);
  return new URL(asset, baseUrl).toString();
}

async function importRemoteModule(url) {
  const source = await fetchText(url);
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  return import(moduleUrl);
}

function meta(sourceUrl) {
  return {
    source: "competitor-public-frontend-data",
    sourceUrl,
    updatedAt: generatedAt,
    confidence: "high",
    mergePolicy: "public structured facts only; no editorial copy or community user data",
  };
}

async function main() {
  const dataAssetUrl = await findDataAsset();
  const mod = await importRemoteModule(dataAssetUrl);

  const dataset = {
    generatedAt,
    competitor: {
      name: "TBH Helper",
      baseUrl,
      dataAssetUrl,
      usage: "Internal structured fact extraction. Do not expose source labels in user UI.",
    },
    version: mod.C?.gameVersion ?? mod.b ?? null,
    counts: mod.C?.counts ?? {},
    data: {
      items: mod.v ?? [],
      stages: mod.I ?? [],
      monsters: mod.E ?? [],
      heroes: mod.g ?? [],
      runes: mod.N ?? [],
      skills: mod.F ?? [],
      passives: mod.j ?? [],
      materials: mod.S ?? [],
      materialEffects: mod.u ?? [],
      pets: mod.M ?? [],
      buffs: mod.a ?? [],
      grades: mod.m ?? [],
      currencies: mod.l ?? [],
      boxDrops: mod.i ?? { boxes: [], groups: {} },
      cube: mod.z ?? {},
      crafting: mod.s ?? {},
      cubeLevels: mod.c ?? {},
      offering: mod.O ?? {},
      scaling: mod.P ?? {},
      levels: mod.y ?? [],
      offlineRewards: mod.k ?? [],
      extractionCosts: mod.d ?? [],
      gearTypes: mod.f ?? [],
    },
    _meta: meta(dataAssetUrl),
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(dataset, null, 2));

  console.log(`Wrote ${outFile}`);
  console.log(JSON.stringify({
    dataAssetUrl,
    counts: {
      items: dataset.data.items.length,
      stages: dataset.data.stages.length,
      monsters: dataset.data.monsters.length,
      boxDropBoxes: dataset.data.boxDrops.boxes?.length ?? 0,
      materials: dataset.data.materials.length,
      materialEffects: dataset.data.materialEffects.length,
      runes: dataset.data.runes.length,
      skills: dataset.data.skills.length,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
