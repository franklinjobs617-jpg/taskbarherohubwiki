import type { Metadata } from "next";
import { FarmingCalculator } from "@/components/tbh/farming-calculator";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TBH 最佳刷图关卡 | EXP、金币、宝箱与宠物击杀" : "TBH Best Farming Stage | EXP, Gold, Chests & Pet Kills",
    description: locale === "zh" ? "输入等级、最高稳定关卡、通关时间和目标，直接得到现在该刷哪关、原因、收益和备选关卡。" : "Enter level, reliable stage, clear time, and goal to get the best stage now with reasons, hourly yields, and alternatives.",
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
        title={isZh ? "我现在该刷哪关" : "What stage should I farm now?"}
        description={
          isZh
            ? "设置等级、最高稳定关卡、通关时间和目标，查看最佳关卡、原因、EXP/h、Gold/h 和后 5 个备选。"
            : "Set level, highest reliable stage, clear time, and goal to view the best stage, reason, EXP/h, Gold/h, and 5 alternatives."
        }
      />
      <FarmingCalculator locale={locale} />
    </PageShell>
  );
}
