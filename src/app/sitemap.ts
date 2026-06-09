import type { MetadataRoute } from "next";
import { allHeroes, allItems, allMonsters, allStages, builds, chestItems, guides, SITE_URL, stageSlug, UPDATED_AT } from "@/lib/game-data/data";

const locales = ["en", "zh"] as const;

const toUrl = (locale: string, path: string) =>
  locale === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;

function hreflang(path: string): Record<string, string> {
  return {
    en: toUrl("en", path),
    zh: toUrl("zh", path),
    "x-default": toUrl("en", path),
  };
}

function withAlternates(locale: string, path: string) {
  return { languages: hreflang(path) };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date(UPDATED_AT);
  const staticPaths = [
    "", "/items", "/market", "/chests", "/effects", "/map", "/stages",
    "/heroes", "/runes", "/skills", "/pets", "/monsters", "/guides", "/builds",
    "/buffs", "/cube", "/guides/farming",
    "/tools/profit-calculator", "/tools/farming-compare", "/tools/farming-calculator",
    "/updates", "/faq", "/about", "/privacy", "/terms", "/contact",
  ];

  const staticUrls = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: toUrl(locale, path),
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: withAlternates(locale, path),
    })),
  );

  const itemUrls = allItems().filter((item) => item.type !== "STAGEBOX").slice(0, 1200)
    .flatMap((item) => locales.map((locale) => ({ url: toUrl(locale, `/items/${item.slug}`), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.65, alternates: withAlternates(locale, `/items/${item.slug}`) })));
  const marketUrls = allItems().filter((item) => item.marketable).slice(0, 400)
    .flatMap((item) => locales.map((locale) => ({ url: toUrl(locale, `/market/${item.slug}`), lastModified: updated, changeFrequency: "daily" as const, priority: 0.7, alternates: withAlternates(locale, `/market/${item.slug}`) })));
  const chestUrls = chestItems().flatMap((item) => locales.map((locale) => ({ url: toUrl(locale, `/chests/${item.slug}`), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6, alternates: withAlternates(locale, `/chests/${item.slug}`) })));
  const stageUrls = allStages().flatMap((stage) => locales.map((locale) => ({ url: toUrl(locale, `/stages/${stageSlug(stage)}`), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6, alternates: withAlternates(locale, `/stages/${stageSlug(stage)}`) })));
  const heroUrls = allHeroes().flatMap((hero) => locales.map((locale) => ({ url: toUrl(locale, `/heroes/${hero.slug ?? hero.ClassType?.toLowerCase() ?? hero.HeroKey}`), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6, alternates: withAlternates(locale, `/heroes/${hero.slug ?? hero.ClassType?.toLowerCase() ?? hero.HeroKey}`) })));
  const guideUrls = guides.flatMap((guide) => locales.map((locale) => ({ url: toUrl(locale, `/guides/${guide.category}/${guide.slug}`), lastModified: updated, changeFrequency: "weekly" as const, priority: 0.75, alternates: withAlternates(locale, `/guides/${guide.category}/${guide.slug}`) })));
  const buildUrls = builds.flatMap((build) => locales.map((locale) => ({ url: toUrl(locale, `/builds/${build.slug}`), lastModified: updated, changeFrequency: "weekly" as const, priority: 0.6, alternates: withAlternates(locale, `/builds/${build.slug}`) })));
  const monsterUrls = allMonsters().flatMap((m) => locales.map((locale) => ({ url: toUrl(locale, `/monsters/${m.slug ?? m.MonsterKey}`), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6, alternates: withAlternates(locale, `/monsters/${m.slug ?? m.MonsterKey}`) })));

  return [...staticUrls, ...itemUrls, ...marketUrls, ...chestUrls, ...stageUrls, ...heroUrls, ...guideUrls, ...buildUrls, ...monsterUrls];
}
