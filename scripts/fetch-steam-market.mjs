import fs from "node:fs";
import path from "node:path";
import { ProxyAgent, setGlobalDispatcher } from "undici";

const root = process.cwd();
const appId = process.env.STEAM_APP_ID || "3678970";
const currency = process.env.STEAM_CURRENCY || "1";
const count = Number(process.env.STEAM_MARKET_PAGE_SIZE || "100");
const delayMs = Number(process.env.STEAM_MARKET_DELAY_MS || "1200");
const outDir = path.join(root, "data", "generated", "market", "v1");
const items = JSON.parse(fs.readFileSync(path.join(root, "tbh_data", "items.json"), "utf8"));
const marketableItems = items.filter((item) => item.marketable);
const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

if (proxy) {
  setGlobalDispatcher(new ProxyAgent(proxy));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parsePrice(result) {
  if (typeof result.sell_price === "number") return result.sell_price / 100;
  const text = result.sell_price_text || result.sale_price_text || "";
  const match = text.replace(",", "").match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : null;
}

function safeFileName(value) {
  return encodeURIComponent(value).replace(/%/g, "_");
}

async function fetchPage(start) {
  const url = new URL("https://steamcommunity.com/market/search/render/");
  url.searchParams.set("query", "");
  url.searchParams.set("appid", appId);
  url.searchParams.set("currency", currency);
  url.searchParams.set("norender", "1");
  url.searchParams.set("start", String(start));
  url.searchParams.set("count", String(count));

  const response = await fetch(url, {
    headers: {
      "accept": "application/json,text/plain,*/*",
      "user-agent": "TaskBarHeroWiki/1.0 market data fetcher",
    },
  });

  if (!response.ok) {
    throw new Error(`Steam market request failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(`Steam market response was not successful at start=${start}`);
  }
  return json;
}

async function fetchAllMarketRows() {
  const rows = [];
  let start = 0;
  let total = null;

  while (total === null || start < total) {
    const page = await fetchPage(start);
    total = Number(page.total_count ?? page.searchdata?.total_count ?? page.results?.length ?? 0);
    const pageRows = page.results ?? [];
    rows.push(...pageRows);
    console.log(`Fetched ${rows.length}/${total} Steam market rows`);
    start += pageRows.length || count;
    if (start < total) await sleep(delayMs);
  }

  return rows;
}

function matchRows(steamRows) {
  const steamByName = new Map();
  for (const row of steamRows) {
    const names = [row.hash_name, row.asset_description?.market_hash_name, row.name, row.asset_description?.market_name];
    for (const name of names) {
      const key = normalizeName(name);
      if (key && !steamByName.has(key)) steamByName.set(key, row);
    }
  }

  const matched = [];
  const unmatched = [];
  const now = new Date().toISOString();

  for (const item of marketableItems) {
    const englishName = item.name?.["en-US"] || item.slug;
    const row = steamByName.get(normalizeName(englishName));
    if (!row) {
      unmatched.push({
        slug: item.slug,
        id: item.id,
        name: englishName,
        reason: "No exact Steam market_hash_name match",
      });
      continue;
    }

    const marketHash = row.hash_name || row.asset_description?.market_hash_name || englishName;
    const lowest = parsePrice(row);
    const record = {
      slug: item.slug,
      id: item.id,
      marketHash,
      lowest,
      median: null,
      listings: typeof row.sell_listings === "number" ? row.sell_listings : null,
      trend7d: null,
      confidence: lowest ? "low" : "missing",
      updatedAt: now,
      source: "steamcommunity_market_search",
    };
    matched.push(record);
  }

  return { matched, unmatched, updatedAt: now };
}

function writeOutputs({ matched, unmatched, updatedAt }, steamRows) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.join(outDir, "items"), { recursive: true });

  fs.writeFileSync(path.join(outDir, "latest.json"), JSON.stringify({ updatedAt, appId, currency, items: matched }, null, 2));
  fs.writeFileSync(path.join(outDir, "unmatched.json"), JSON.stringify(unmatched, null, 2));
  fs.writeFileSync(path.join(outDir, "top-movers.json"), JSON.stringify([], null, 2));
  fs.writeFileSync(path.join(outDir, "steam-search-raw.json"), JSON.stringify({ updatedAt, appId, total: steamRows.length, results: steamRows }, null, 2));

  for (const record of matched) {
    fs.writeFileSync(path.join(outDir, "items", `${safeFileName(record.marketHash)}.json`), JSON.stringify(record, null, 2));
  }
}

try {
  const steamRows = await fetchAllMarketRows();
  const result = matchRows(steamRows);
  writeOutputs(result, steamRows);
  console.log(`Matched ${result.matched.length} items. Unmatched ${result.unmatched.length} items.`);
} catch (error) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "fetch-error.json"),
    JSON.stringify({ updatedAt: new Date().toISOString(), message: error instanceof Error ? error.message : String(error) }, null, 2),
  );
  console.error(error);
  process.exit(1);
}
