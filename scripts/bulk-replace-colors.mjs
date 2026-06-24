import fs from "node:fs";
import path from "node:path";
import { globSync } from "node:fs";

// Simple glob using fs
function findFiles(dir, pattern, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules") {
      findFiles(full, pattern, files);
    } else if (e.isFile() && /\.(tsx|ts|css|mjs)$/.test(e.name)) {
      files.push(full);
    }
  }
  return files;
}

const srcDir = path.resolve(process.cwd(), "src");
const files = findFiles(srcDir);

// Replacement map: old pattern -> new class
const replacements = [
  // Text colors
  [/text-\[#ffffff\]/g, "text-text-primary"],
  [/text-\[#f1e8d5\]/g, "text-text-primary"],
  [/text-\[\"#ffffff\"\]/g, "text-text-primary"],
  [/text-\[#9d9d9d\]/g, "text-text-secondary"],
  [/text-\[#8c8577\]/g, "text-text-secondary"],
  [/text-\[#b8ad98\]/g, "text-text-secondary"],
  [/text-\[\"#9d9d9d\"\]/g, "text-text-secondary"],
  [/text-\[#6c6c6c\]/g, "text-text-muted"],
  [/text-\[#666\]/g, "text-text-muted"],
  [/text-\[#555\]/g, "text-text-muted"],
  [/text-\[\"#6c6c6c\"\]/g, "text-text-muted"],
  [/text-\[#d4a017\]/g, "text-accent"],
  [/text-\[#f0c040\]/g, "text-accent-bright"],
  [/text-\[\"#f0c040\"\]/g, "text-accent-bright"],
  [/text-\[#d8d1c2\]/g, "text-text-secondary"],
  [/text-\[#fff7df\]/g, "text-text-primary"],
  [/text-\[#a89779\]/g, "text-text-secondary"],
  [/text-\[#8f826b\]/g, "text-text-muted"],

  // Background colors
  [/bg-\[#0a0a0a\]/g, "bg-bg-canvas"],
  [/bg-\[#090909\]/g, "bg-bg-deep"],
  [/bg-\[#0d0d0d\]/g, "bg-bg-panel"],
  [/bg-\[#111\]/g, "bg-bg-surface"],
  [/bg-\[#18181b\]/g, "bg-bg-surface"],
  [/bg-\[#1a1a1a\]/g, "bg-bg-surface"],
  [/bg-\[#13110b\]/g, "bg-bg-panel"],
  [/bg-\[#101010\]/g, "bg-bg-panel"],
  [/bg-\[#1b1206\]/g, "bg-accent-soft"],
  [/bg-\[\"#0d0d0d\"\]/g, "bg-bg-panel"],
  [/bg-\[#1a1508\]/g, "bg-accent-soft"],
  [/bg-\[#100d06\]/g, "bg-accent-soft"],
  [/bg-\[#090806\]/g, "bg-bg-deep"],
  [/bg-\[#0b0906\]/g, "bg-bg-deep"],

  // Border colors
  [/border-\[#27272a\]/g, "border-border-default"],
  [/border-\[\"#27272a\"\]/g, "border-border-default"],
  [/border-\[#3b3b3b\]/g, "border-border-strong"],
  [/border-\[#2a2a2e\]/g, "border-border-default"],
  [/border-\[#2a2a2a\]/g, "border-border-strong"],
  [/border-\[#d4a017\]/g, "border-accent"],
  [/border-\[\"#d4a017\"\]/g, "border-accent"],
  [/border-\[#f0c040\]/g, "border-accent-bright"],
  [/border-\[#4d281e\]/g, "border-accent-dim"],
  [/border-\[#3f2f10\]/g, "border-accent-dim"],
  [/border-\[#5a4315\]/g, "border-accent-dim"],
  [/border-\[#2e2619\]/g, "border-accent-dim"],
  [/border-\[#5a3a1a\]/g, "border-accent-dim"],

  // Border-radius
  [/border-\[#d4a017\]\/70/g, "border-accent-dim"],
  [/border-\[#d4a017\]\/60/g, "border-accent-dim"],

  // Hover colors
  [/hover:bg-\[#111\]/g, "hover:bg-bg-surface"],
  [/hover:bg-\[#18181b\]/g, "hover:bg-bg-surface"],
  [/hover:bg-\[\"#18181b\"\]/g, "hover:bg-bg-surface"],
  [/hover:border-\[#d4a017\]/g, "hover:border-accent"],
  [/hover:border-\[#d4a017\]\/70/g, "hover:border-accent-dim"],
  [/hover:border-\[#d4a017\]\/60/g, "hover:border-accent-dim"],
  [/hover:text-\[#f0c040\]/g, "hover:text-accent-bright"],
  [/hover:text-white/g, "hover:text-text-primary"],
  [/hover:text-\[\"#f0c040\"\]/g, "hover:text-accent-bright"],
  [/hover:bg-\[#f0c040\]/g, "hover:bg-accent-bright"],

  // Background opacity
  [/bg-\[#0a0a0a\]\/95/g, "bg-bg-deep/95"],
  [/bg-\[#0d0d0d\]\/95/g, "bg-bg-panel/95"],
  [/bg-\[#18181b\]\/50/g, "bg-bg-surface/50"],
  [/bg-black\/60/g, "bg-black/60"],

  // Specific component patterns
  [/border-amber-600\/30/g, "border-accent-dim"],
  [/bg-\[#18181b\]/g, "bg-bg-surface"],
  [/bg-\[\"#18181b\"\]/g, "bg-bg-surface"],

  // Dropdown/overlay backgrounds
  [/bg-\[#0d0d0d\]/g, "bg-bg-panel"],
  [/bg-\[\"#0d0d0d\"\]/g, "bg-bg-panel"],

  // Various shadow/edge cases
  [/bg-\[#0a0a0a\]\/90/g, "bg-bg-deep/90"],
  [/bg-white\/10/g, "bg-white/10"],
];

let totalChanges = 0;
let filesChanged = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;

  for (const [pattern, replacement] of replacements) {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, "utf8");
    totalChanges++;
    filesChanged++;
  }
}

console.log(`Updated ${filesChanged} files with ${totalChanges} total replacement groups.`);
