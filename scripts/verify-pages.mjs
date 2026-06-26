const DEFAULT_PATHS = [
  "/zh",
  "/ja",
  "/zh/items",
  "/zh/items/minor-ruby",
  "/zh/chests",
  "/zh/market",
  "/zh/map",
  "/zh/guides",
  "/sitemap.xml",
  "/sitemaps/items-1.xml",
  "/robots.txt",
];

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

const baseUrl = (argValue("--base") || process.env.PAGE_VERIFY_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const paths = (argValue("--paths") || process.env.PAGE_VERIFY_PATHS)?.split(",").map((path) => path.trim()).filter(Boolean) ?? DEFAULT_PATHS;

let failed = 0;

for (const path of paths) {
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    const response = await fetch(url, { redirect: "manual" });
    const ok = response.status >= 200 && response.status < 400;
    console.log(`${ok ? "OK" : "FAIL"} ${response.status} ${path}`);
    if (!ok) failed += 1;
  } catch (error) {
    failed += 1;
    console.log(`FAIL ERR ${path} ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed > 0) {
  console.error(`Page verification failed: ${failed}/${paths.length}`);
  process.exit(1);
}

console.log(`Page verification passed: ${paths.length}/${paths.length}`);
