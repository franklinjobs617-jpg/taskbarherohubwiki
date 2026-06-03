import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const bucket = process.env.R2_BUCKET || "taskbarhero";
const wrangler = process.platform === "win32"
  ? path.join(root, "node_modules", ".bin", "wrangler.cmd")
  : path.join(root, "node_modules", ".bin", "wrangler");

const uploadRoots = [
  { local: path.join(root, "data", "generated", "game"), remote: "game" },
  { local: path.join(root, "data", "generated", "market"), remote: "market" },
  { local: path.join(root, "public", "game"), remote: "assets/game" },
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return absolute;
  });
}

function contentType(file) {
  if (file.endsWith(".json")) return "application/json";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".webp")) return "image/webp";
  if (file.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

const files = uploadRoots.flatMap(({ local, remote }) =>
  walk(local).map((file) => ({
    file,
    key: `${remote}/${path.relative(local, file).replaceAll("\\", "/")}`,
  })),
);

if (!files.length) {
  console.error("No files found. Run npm run normalize first.");
  process.exit(1);
}

console.log(`Uploading ${files.length} files to R2 bucket ${bucket}`);

for (const { file, key } of files) {
  const result = spawnSync(
    fs.existsSync(wrangler) ? wrangler : "wrangler",
    ["r2", "object", "put", `${bucket}/${key}`, "--file", file, "--content-type", contentType(file), "--remote"],
    { stdio: "inherit", shell: process.platform === "win32" },
  );
  if (result.status !== 0) {
    console.error(`Upload failed: ${key}`);
    process.exit(result.status ?? 1);
  }
}

console.log("R2 upload complete.");
