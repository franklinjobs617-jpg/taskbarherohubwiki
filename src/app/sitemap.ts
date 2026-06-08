import type { MetadataRoute } from "next";
import { allHeroes, allItems, allMonsters, allStages, builds, chestItems, guides, SITE_URL, stageSlug, UPDATED_AT } from "@/lib/game-data/data";

const locales = ["en", "zh", "ja", "ko"] as const;

const toUrl = (locale: string, path: string) =>
  locale === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;

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
    })),
  );

  const itemUrls = allItems().filter((item) => item.type !== "STAGEBOX").slice(0, 1200)
    .flatMap((item) => locales.map((locale) => ({ url: toUrl(locale, `/items/${item.slug}`), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.65 })));
  const marketUrls = allItems().filter((item) => item.marketable).slice(0, 400)
    .flatMap((item) => locales.map((locale) => ({ url: toUrl(locale, `/market/${item.slug}`), lastModified: updated, changeFrequency: "daily" as const, priority: 0.7 })));
  const chestUrls = chestItems().flatMap((item) => locales.map((locale) => ({ url: toUrl(locale, `/chests/${item.slug}`), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6 })));
  const stageUrls = allStages().flatMap((stage) => locales.map((locale) => ({ url: toUrl(locale, `/stages/${stageSlug(stage)}`), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6 })));
  const heroUrls = allHeroes().flatMap((hero) => locales.map((locale) => ({ url: toUrl(locale, `/heroes/${hero.slug ?? hero.ClassType?.toLowerCase() ?? hero.HeroKey}`), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6 })));
  const guideUrls = guides.flatMap((guide) => locales.map((locale) => ({ url: toUrl(locale, `/guides/${guide.category}/${guide.slug}`), lastModified: updated, changeFrequency: "weekly" as const, priority: 0.75 })));
  const buildUrls = builds.flatMap((build) => locales.map((locale) => ({ url: toUrl(locale, `/builds/${build.slug}`), lastModified: updated, changeFrequency: "weekly" as const, priority: 0.6 })));
  const monsterUrls = allMonsters().flatMap((m) => locales.map((locale) => ({ url: toUrl(locale, `/monsters/${m.slug ?? m.MonsterKey}`), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6 })));

  return [...staticUrls, ...itemUrls, ...marketUrls, ...chestUrls, ...stageUrls, ...heroUrls, ...guideUrls, ...buildUrls, ...monsterUrls];
}
