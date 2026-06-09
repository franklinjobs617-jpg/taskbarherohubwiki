import type { Metadata } from "next";
import { DropFinder } from "@/components/tbh/drop-finder";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "TBH Drop Finder | Item Drops, Stage Loot & Chest Tables",
    description: "Find where TBH items drop, compare stage loot tables, and inspect chest sources without browsing every item page.",
    alternates: pageAlternates(locale, "/tools/drop-finder"),
  };
}

export default async function DropFinderPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";

  return (
    <PageShell>
      <PageHeader
        kicker="Tool"
        title={isZh ? "Drop Finder" : "Drop Finder"}
        description={
          isZh
            ? "按物品、关卡或宝箱查掉落。结果直接给推荐关卡、概率和替代路线。"
            : "Search by item, stage, or chest. Results show recommended stages, rates, and fallback routes."
        }
      />
      <DropFinder locale={locale} />
    </PageShell>
  );
}
