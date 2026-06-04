import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const ROOT = path.resolve(process.cwd());
const RUNES_FILE = path.join(ROOT, "tbh_data", "runes.json");
const OUT_DIR = path.join(ROOT, "public", "game", "runes");
const BASE = "https://taskbarherowiki.com/icons";

/** Simple fetch that follows redirects, returns { buffer, status, contentType } */
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // follow redirect (could be relative or absolute)
          const loc = res.headers.location.startsWith("http")
            ? res.headers.location
            : new URL(res.headers.location, url).href;
          https.get(loc, { headers: { "User-Agent": "Mozilla/5.0" } }, (r2) => {
            const chunks = [];
            r2.on("data", (c) => chunks.push(c));
            r2.on("end", () => resolve({ buffer: Buffer.concat(chunks), status: r2.statusCode, contentType: r2.headers["content-type"] }));
            r2.on("error", reject);
          });
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ buffer: Buffer.concat(chunks), status: res.statusCode, contentType: res.headers["content-type"] }));
        res.on("error", reject);
      },
    ).on("error", reject);
  });
}

async function main() {
  console.log('Reading rune data…');
  const raw = JSON.parse(fs.readFileSync(RUNES_FILE, "utf8"));
  const icons = [...new Set(raw.map((r) => r.IconPath))];
  console.log(`Found ${icons.length} unique icons to download\n`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < icons.length; i++) {
    const name = icons[i];
    const url = `${BASE}/Rune_${name}.png`;
    const dest = path.join(OUT_DIR, `${name}.png`);

    try {
      process.stdout.write(`[${i + 1}/${icons.length}] ${name} … `);
      const { buffer, status, contentType } = await fetchBuffer(url);

      if (status !== 200 || !contentType?.includes("image")) {
        console.log(`❌ HTTP ${status} (${contentType ?? "?"})`);
        fail++;
        continue;
      }

      fs.writeFileSync(dest, buffer);
      console.log(`✅ ${buffer.length} bytes`);
      ok++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      fail++;
    }
  }

  console.log(`\nDone. ${ok} downloaded, ${fail} failed → ${OUT_DIR}`);
}

main();
