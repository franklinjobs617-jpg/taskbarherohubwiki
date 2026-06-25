import type { MetadataRoute } from "next";
import { achievements, allHeroes, allItems, allMonsters, allStages, builds, chestItems, ensureGameData, guides, hasIndexableMarketData, marketForItem, shouldIndexItem, SITE_URL, stageSlug, UPDATED_AT, wikiArticles } from "@/lib/game-data/data";
import { ensureExternalData, extStages } from "@/lib/game-data/external";

const locales = ["en", "zh", "ja", "ko"] as const;
const guideLocales = ["en", "zh", "ja"] as const;
type SitemapLocale = (typeof locales)[number];

const toUrl = (locale: string, path: string) =>
  locale === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;

function hreflang(path: string, availableLocales: readonly SitemapLocale[] = locales): Record<string, string> {
  return Object.fromEntries([
    ...availableLocales.map((locale) => [locale, toUrl(locale, path)]),
    ["x-default", toUrl("en", path)],
  ]);
}

function withAlternates(path: string, availableLocales: readonly SitemapLocale[] = locales) {
  return { languages: hreflang(path, availableLocales) };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await ensureGameData();
  await ensureExternalData();

  const updated = new Date(UPDATED_AT);
  const staticPaths = [
    "", "/items", "/market", "/chests", "/effects", "/map", "/stages",
    "/heroes", "/runes", "/skills", "/pets", "/monsters", "/guides", "/builds",
    "/buffs", "/cube", "/guides/farming",
    "/tools/drop-finder", "/tools/farming-optimizer", "/tools/profit-calculator",
    "/tools/farming-compare", "/tools/farming-calculator",
    "/server-status", "/updates", "/faq", "/about", "/privacy", "/terms", "/contact",
    "/tools", "/wiki", "/database", "/achievements",
  ];

  const staticUrls = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: toUrl(locale, path),
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: withAlternates(path),
    })),
  );

  const itemUrls = allItems()
    .filter((item) => item.type !== "STAGEBOX" && shouldIndexItem(item.slug))
    .flatMap((item) => locales.map((locale) => ({ url: toUrl(locale, `/items/${item.slug}`), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.65, alternates: withAlternates(`/items/${item.slug}`) })));
  const marketUrls = allItems()
    .filter((item) => hasIndexableMarketData(marketForItem(item)))
    .flatMap((item) => locales.map((locale) => ({ url: toUrl(locale, `/market/${item.slug}`), lastModified: updated, changeFrequency: "daily" as const, priority: 0.7, alternates: withAlternates(`/market/${item.slug}`) })));
  // Pre-compute which chest IDs appear in stage drops (uses extStages, not dropsByItemSlug)
  const chestIdsInStages = new Set(extStages().flatMap((s) => s.drops.map((d) => d.itemKey)));
  const chestUrls = chestItems().filter((item) => chestIdsInStages.has(item.id)).flatMap((item) => locales.map((locale) => ({ url: toUrl(locale, `/chests/${item.slug}`), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6, alternates: withAlternates(`/chests/${item.slug}`) })));
  const stageUrls = allStages().flatMap((stage) => {
    const path = `/stages/${stageSlug(stage)}`;
    return locales.map((locale) => ({ url: toUrl(locale, path), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6, alternates: withAlternates(path) }));
  });
  const heroUrls = allHeroes().flatMap((hero) => {
    const path = `/heroes/${hero.slug ?? hero.ClassType?.toLowerCase() ?? hero.HeroKey}`;
    return locales.map((locale) => ({ url: toUrl(locale, path), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6, alternates: withAlternates(path) }));
  });
  const guideUrls = guides.flatMap((guide) => {
    const path = `/guides/${guide.category}/${guide.slug}`;
    return guideLocales.map((locale) => ({ url: toUrl(locale, path), lastModified: updated, changeFrequency: "weekly" as const, priority: 0.75, alternates: withAlternates(path, guideLocales) }));
  });
  const buildUrls = builds.flatMap((build) => locales.map((locale) => ({ url: toUrl(locale, `/builds/${build.slug}`), lastModified: updated, changeFrequency: "weekly" as const, priority: 0.6, alternates: withAlternates(`/builds/${build.slug}`) })));
  const monsterUrls = allMonsters().flatMap((m) => {
    const path = `/monsters/${m.slug ?? m.MonsterKey}`;
    return locales.map((locale) => ({ url: toUrl(locale, path), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6, alternates: withAlternates(path) }));
  });
  const wikiUrls = wikiArticles.flatMap((a) => {
    const path = `/wiki/${a.slug}`;
    return locales.map((locale) => ({ url: toUrl(locale, path), lastModified: updated, changeFrequency: "weekly" as const, priority: 0.7, alternates: withAlternates(path) }));
  });
  const achievementUrls = achievements.flatMap((a) => {
    const path = `/achievements/${a.slug}`;
    return locales.map((locale) => ({ url: toUrl(locale, path), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6, alternates: withAlternates(path) }));
  });

  return [...staticUrls, ...itemUrls, ...marketUrls, ...chestUrls, ...stageUrls, ...heroUrls, ...guideUrls, ...buildUrls, ...monsterUrls, ...wikiUrls, ...achievementUrls];
}
