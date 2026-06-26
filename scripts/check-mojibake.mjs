import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const roots = ["src", "scripts", "package.json"];
const pattern = /鎺|鐗|鈥|銈|脳|锛|閫|绛|涓|甯|鏉|璇|杩|姣|寮|宸|绋|鍑|闂|澶|椤|鑰|銆|�/;
const textExtensions = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".json", ".md", ".css", ".scss", ".html"]);

function listFiles(root) {
  try {
    const output = execFileSync("git", ["ls-files", root], { encoding: "utf8" });
    return output.split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

const hits = [];
for (const root of roots) {
  for (const file of listFiles(root)) {
    if (file === "scripts/check-mojibake.mjs") continue;
    if (!textExtensions.has(file.slice(file.lastIndexOf(".")))) continue;
    if (!existsSync(join(process.cwd(), file))) continue;
    const text = readFileSync(join(process.cwd(), file), "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (pattern.test(line)) hits.push(`${file}:${index + 1}: ${line.trim()}`);
    });
  }
}

if (hits.length) {
  console.error("Mojibake check failed:");
  console.error(hits.slice(0, 80).join("\n"));
  if (hits.length > 80) console.error(`...and ${hits.length - 80} more`);
  process.exit(1);
}

console.log("Mojibake check passed.");
