import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outFile = path.join(root, "data", "audit", "competitor-coverage.json");
const baseUrl = "https://tbherohelper.com";
const sitemapUrl = `${baseUrl}/sitemap.xml`;
const generatedAt = new Date().toISOString();

const routeGroups = [
  ["database", /^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?database(?:\/|$)/],
  ["items", /^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?items\//],
  ["monsters", /^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?monsters\//],
  ["skills", /^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?skills\//],
  ["runes", /^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?runes\//],
  ["stages", /^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?stages\//],
  ["tools", /^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?tools(?:\/|$)/],
  ["builds", /^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?builds(?:\/|$)/],
  ["leaderboards", /^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?leaderboards(?:\/|$)/],
  ["meter", /^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?meter(?:\/|$)/],
  ["cube", /^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?cube(?:\/|$)/],
  ["guides", /^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?guides(?:\/|$)/],
  ["patchNotes", /^\/(?:[a-z]{2}(?:-[a-z]{2,4})?\/)?patch-notes(?:\/|$)/],
];

function textBetween(xml, tag) {
  return [...xml.matchAll(new RegExp(`<${tag}>(.*?)</${tag}>`, "g"))].map((match) => match[1]);
}

function classify(url) {
  const parsed = new URL(url);
  for (const [name, pattern] of routeGroups) {
    if (pattern.test(parsed.pathname)) return name;
  }
  return parsed.pathname === "/" ? "home" : "other";
}

function localeFromPath(pathname) {
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && /^[a-z]{2}(?:-[a-z]{2,4})?$/.test(first)) return first;
  return "en";
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "TBH-Fan-Site-coverage-audit/1.0" },
  });
  if (!response.ok) throw new Error(`Fetch failed ${response.status} ${url}`);
  return response.text();
}

async function main() {
  const indexXml = await fetchText(sitemapUrl);
  const sitemapUrls = textBetween(indexXml, "loc").filter((url) => url.endsWith(".xml"));
  const urlRows = [];

  for (const url of sitemapUrls) {
    const xml = await fetchText(url);
    for (const loc of textBetween(xml, "loc")) {
      const parsed = new URL(loc);
      urlRows.push({
        url: loc,
        path: parsed.pathname,
        locale: localeFromPath(parsed.pathname),
        group: classify(loc),
      });
    }
  }

  const groups = {};
  const locales = {};
  for (const row of urlRows) {
    groups[row.group] ??= { count: 0, samples: [] };
    groups[row.group].count += 1;
    if (groups[row.group].samples.length < 12) groups[row.group].samples.push(row.path);
    locales[row.locale] = (locales[row.locale] ?? 0) + 1;
  }

  const internalCoverageTargets = [
    { route: "/tools/drop-finder", reason: "Competitors expose drop search as a first-class task." },
    { route: "/tools/farming-optimizer", reason: "Competitors optimize by player state, not only browse data." },
    { route: "/items", reason: "Decision table needs drop, market, class, and action columns." },
    { route: "/", reason: "Homepage should route users by task intent." },
  ];

  const report = {
    generatedAt,
    competitor: {
      name: "TBH Helper",
      baseUrl,
      sitemapUrl,
      usage: "Coverage audit only. Content is not copied into user-facing game data.",
    },
    totals: {
      sitemapCount: sitemapUrls.length,
      urlCount: urlRows.length,
    },
    locales,
    groups,
    internalCoverageTargets,
  };

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`Wrote ${outFile}`);
  console.log(`Audited ${urlRows.length} URLs from ${sitemapUrls.length} sitemaps`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
