import type { Metadata } from "next";
import { Suspense } from "react";
import { DropFinder } from "@/components/tbh/drop-finder";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TBH 掉落查询 | 最佳关卡、宝箱来源与预计次数" : "TBH Drop Finder | Best Stages, Chest Sources & Expected Runs",
    description: locale === "zh" ? "输入物品或宝箱名，直接查看最佳关卡、单次概率、50%/90%预计次数和市场入口。" : "Search an item or chest and get the best stage, per-run chance, 50%/90% expected runs, and market link.",
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
        title="Drop Finder"
        description={
          isZh
            ? "查看最佳关卡、单次概率、50%/90%预计次数、宝箱来源和相关入口。"
            : "View best stage, per-run chance, 50%/90% expected runs, chest source, and related links."
        }
      />
      <Suspense>
        <DropFinder locale={locale} />
      </Suspense>
    </PageShell>
  );
}
