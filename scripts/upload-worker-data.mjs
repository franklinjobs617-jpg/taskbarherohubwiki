/**
 * Upload worker-needed data files to R2 via S3 API.
 *
 * These are the monolithic JSON files that the Worker needs at runtime
 * but are NOT covered by the main upload-r2.mjs script (which uploads
 * from data/generated/game/, data/generated/market/, and public/game/).
 *
 * Usage:
 *   set R2_ACCESS_KEY_ID=xxx
 *   set R2_SECRET_ACCESS_KEY=yyy
 *   set R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
 *   node scripts/upload-worker-data.mjs
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_BUCKET = process.env.R2_BUCKET || "taskbarhero";

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT) {
  console.error("Missing R2 credentials. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Files to upload: [local path, R2 key]
 */
const files = [
  // Core game data (monolithic)
  [path.join(root, "tbh_data", "monsters.json"), "game/v1/monsters/index.en.json"],
  [path.join(root, "data", "generated", "drops.json"), "game/v1/drops.json"],
  [path.join(root, "tbh_data", "items_detail.json"), "game/v1/items_detail.json"],
  [path.join(root, "tbh_data", "buffs.json"), "game/v1/buffs.json"],

  // External/enriched data
  [path.join(root, "tbh_external", "items.json"), "game/v1/enriched/items.json"],
  [path.join(root, "tbh_external", "heroes.json"), "game/v1/enriched/heroes.json"],
  [path.join(root, "tbh_external", "stages.json"), "game/v1/enriched/stages.json"],
  [path.join(root, "tbh_external", "runes.json"), "game/v1/enriched/runes.json"],
  [path.join(root, "tbh_external", "pets.json"), "game/v1/enriched/pets.json"],
  [path.join(root, "tbh_external", "effects.json"), "game/v1/enriched/effects.json"],
];

function contentType(file) {
  if (file.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}

async function uploadFile(localPath, r2Key) {
  if (!fs.existsSync(localPath)) {
    console.warn(`  SKIP (not found): ${localPath}`);
    return "skip";
  }

  const body = fs.readFileSync(localPath);
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    Body: body,
    ContentType: contentType(localPath),
  });

  try {
    await s3.send(command);
    const sizeKB = (body.length / 1024).toFixed(1);
    console.log(`  OK  ${r2Key} (${sizeKB} KB)`);
    return "ok";
  } catch (error) {
    console.error(`  FAIL ${r2Key}: ${error.message}`);
    return "fail";
  }
}

async function main() {
  console.log(`Uploading ${files.length} worker data files to R2 bucket ${R2_BUCKET}...\n`);

  const startedAt = Date.now();
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const [localPath, r2Key] of files) {
    const result = await uploadFile(localPath, r2Key);
    if (result === "ok") ok++;
    else if (result === "skip") skip++;
    else fail++;
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\nWorker data upload complete in ${elapsed}s | OK ${ok} | skip ${skip} | fail ${fail}`);

  // Also upload monsters.json as zh variant (same data for now)
  const monstersZhPath = path.join(root, "tbh_data", "monsters.json");
  if (fs.existsSync(monstersZhPath)) {
    const body = fs.readFileSync(monstersZhPath);
    try {
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: "game/v1/monsters/index.zh.json",
        Body: body,
        ContentType: "application/json",
      }));
      console.log("  OK  game/v1/monsters/index.zh.json (copy)");
    } catch (error) {
      console.error(`  FAIL game/v1/monsters/index.zh.json: ${error.message}`);
    }
  }

  if (fail > 0) process.exit(1);
}

main();
