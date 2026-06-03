import type { MetadataRoute } from "next";
import { allHeroes, allItems, allStages, builds, chestItems, guides, SITE_URL, stageSlug, UPDATED_AT } from "@/lib/game-data/data";

const locales = ["zh", "en"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date(UPDATED_AT);
  const staticPaths = [
    "",
    "/items",
    "/market",
    "/chests",
    "/effects",
    "/map",
    "/stages",
    "/heroes",
    "/runes",
    "/skills",
    "/pets",
    "/monsters",
    "/guides",
    "/builds",
    "/tools/profit-calculator",
    "/tools/farming-compare",
    "/updates",
    "/faq",
    "/about",
    "/privacy",
    "/terms",
    "/contact",
  ];
  const staticUrls = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  );
  const itemUrls = allItems()
    .filter((item) => item.type !== "STAGEBOX")
    .slice(0, 1200)
    .flatMap((item) => locales.map((locale) => ({ url: `${SITE_URL}/${locale}/items/${item.slug}`, lastModified: updated, changeFrequency: "monthly" as const, priority: 0.65 })));
  const marketUrls = allItems()
    .filter((item) => item.marketable)
    .slice(0, 400)
    .flatMap((item) => locales.map((locale) => ({ url: `${SITE_URL}/${locale}/market/${item.slug}`, lastModified: updated, changeFrequency: "daily" as const, priority: 0.7 })));
  const chestUrls = chestItems().flatMap((item) => locales.map((locale) => ({ url: `${SITE_URL}/${locale}/chests/${item.slug}`, lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6 })));
  const stageUrls = allStages().flatMap((stage) => locales.map((locale) => ({ url: `${SITE_URL}/${locale}/stages/${stageSlug(stage)}`, lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6 })));
  const heroUrls = allHeroes().flatMap((hero) => locales.map((locale) => ({ url: `${SITE_URL}/${locale}/heroes/${hero.slug ?? hero.ClassType?.toLowerCase() ?? hero.HeroKey}`, lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6 })));
  const guideUrls = guides.flatMap((guide) => locales.map((locale) => ({ url: `${SITE_URL}/${locale}/guides/${guide.category}/${guide.slug}`, lastModified: updated, changeFrequency: "weekly" as const, priority: 0.75 })));
  const buildUrls = builds.flatMap((build) => locales.map((locale) => ({ url: `${SITE_URL}/${locale}/builds/${build.slug}`, lastModified: updated, changeFrequency: "weekly" as const, priority: 0.6 })));

  return [...staticUrls, ...itemUrls, ...marketUrls, ...chestUrls, ...stageUrls, ...heroUrls, ...guideUrls, ...buildUrls];
}
