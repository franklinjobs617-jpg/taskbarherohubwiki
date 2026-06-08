import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { FarmingCalculator } from "@/components/tbh/farming-calculator";
import { type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh"
      ? "TBH Farming 计算器｜物品掉落查询、关卡收益对比"
      : "TBH Farming Calculator — Item Drops, Stage Profit Comparison",
    description: locale === "zh"
      ? "找物品最佳掉落关卡、查看关卡掉落列表、并排对比关卡收益。支持概率模拟和市场价格估算。"
      : "Find best drop stages for any item, browse stage drop tables, and compare stage profits side by side. Probability simulation and market price estimates included.",
    alternates: pageAlternates(locale, "/tools/farming-calculator"),
  };
}

export default async function FarmingCalculatorPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";

  return (
    <PageShell>
      <PageHeader
        kicker="Tool"
        title={isZh ? "Farming 计算器" : "Farming Calculator"}
        description={
          isZh
            ? "三种模式：找物品最佳掉落关卡、查看关卡掉落列表、并排对比关卡收益。包含概率模拟——选择刷取次数，实时计算至少获得1个的概率。"
            : "Three modes: find where an item drops, browse stage drop tables, compare stage profits. Probability simulation included — pick run count, see real-time chance of getting at least one drop."
        }
      />
      <FarmingCalculator locale={locale} />
    </PageShell>
  );
}
