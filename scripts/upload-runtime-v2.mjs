import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const bucket = process.env.R2_BUCKET || "taskbarhero";
const concurrency = Number(process.env.R2_UPLOAD_CONCURRENCY || 12);
const wrangler = process.platform === "win32"
  ? path.join(root, "node_modules", ".bin", "wrangler.cmd")
  : path.join(root, "node_modules", ".bin", "wrangler");

const requiredFiles = [
  path.join(root, "data", "generated", "game", "v2", "manifest.json"),
  path.join(root, "data", "generated", "game", "v2", "items", "index-light.json"),
  path.join(root, "data", "generated", "game", "v2", "items", "index-preview.json"),
  ...walk(path.join(root, "data", "generated", "game", "v2", "items", "by-slug")),
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return absolute;
  });
}

function r2Key(file) {
  return `game/${path.relative(path.join(root, "data", "generated", "game"), file).replaceAll("\\", "/")}`;
}

function upload(file) {
  return new Promise((resolve) => {
    const key = r2Key(file);
    const child = spawn(
      fs.existsSync(wrangler) ? wrangler : "wrangler",
      [
        "r2",
        "object",
        "put",
        `${bucket}/${key}`,
        "--file",
        file,
        "--content-type",
        "application/json",
        "--remote",
      ],
      { shell: process.platform === "win32" },
    );

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => {
      resolve({ ok: code === 0, key, stderr });
    });
  });
}

async function main() {
  const files = requiredFiles.filter((file) => fs.existsSync(file));
  if (!files.length) {
    console.error("No runtime v2 files found. Run npm run build:static-data first.");
    process.exit(1);
  }

  console.log(`Uploading ${files.length} runtime v2 files to R2 bucket ${bucket} with concurrency ${concurrency}`);
  let index = 0;
  let completed = 0;
  const failures = [];

  async function worker() {
    while (index < files.length) {
      const file = files[index++];
      const result = await upload(file);
      completed += 1;
      if (!result.ok) failures.push(result);
      if (completed % 100 === 0 || completed === files.length) {
        console.log(`Uploaded ${completed}/${files.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, () => worker()));

  if (failures.length) {
    console.error(`Runtime v2 upload failed for ${failures.length} files`);
    for (const failure of failures.slice(0, 20)) {
      console.error(`- ${failure.key}: ${failure.stderr.trim()}`);
    }
    process.exit(1);
  }

  console.log("Runtime v2 upload complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
