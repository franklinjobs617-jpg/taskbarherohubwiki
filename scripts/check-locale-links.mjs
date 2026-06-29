import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["src/app", "src/components", "src/lib"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mdx"]);
const VIOLATIONS = [
  { label: 'English href', pattern: /href\s*=\s*["'`]\/en\//g },
  { label: 'English form action', pattern: /action\s*=\s*["'`]\/en\//g },
  { label: 'Absolute English canonical URL', pattern: /https:\/\/(?:taskbarherohub\.wiki|taskbarhero\.nanobananas\.me)\/en\//g },
  { label: 'Template English canonical URL', pattern: /\$\{SITE_URL\}\/en\//g },
];

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    if (EXTENSIONS.has(extname(entry.name)) && statSync(fullPath).isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

const failures = [];

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const source = readFileSync(file, "utf8");
    for (const { label, pattern } of VIOLATIONS) {
      pattern.lastIndex = 0;
      const match = pattern.exec(source);
      if (match) {
        const line = source.slice(0, match.index).split("\n").length;
        failures.push(`${file}:${line} ${label}: ${match[0]}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Locale link regression check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Locale link regression check passed.");
