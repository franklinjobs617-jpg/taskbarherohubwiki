import type { Metadata } from "next";
import { FarmingCalculator } from "@/components/tbh/farming-calculator";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "TBH Farming Optimizer | Best Stage by Level, EXP & Gold",
    description: "Rank TBH farming stages by your hero level, EXP bonus, clear speed, and goal.",
    alternates: pageAlternates(locale, "/tools/farming-optimizer"),
  };
}

export default async function FarmingOptimizerPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";

  return (
    <PageShell>
      <PageHeader
        kicker="Tool"
        title={isZh ? "Farming Optimizer" : "Farming Optimizer"}
        description={
          isZh
            ? "输入等级、经验加成、通关时间和目标，直接排序当前最值得刷的关卡。"
            : "Enter level, EXP bonus, clear time, and goal to rank the best stages to farm now."
        }
      />
      <FarmingCalculator locale={locale} />
    </PageShell>
  );
}
