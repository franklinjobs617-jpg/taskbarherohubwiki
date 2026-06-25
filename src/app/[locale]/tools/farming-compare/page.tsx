import type { Metadata } from "next";
import { StageCard } from "@/components/tbh/cards";
import { DataNotice, PageHeader, PageShell } from "@/components/tbh/page";
import { allStages, type Locale , ensureStages } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureStages();

  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero 刷图对比｜经验、金币与数据状态" : "TaskBar Hero Farming Compare", alternates: pageAlternates(locale, "/tools/farming-compare") };
}

export default async function FarmingComparePage({ params }: Props) {
  await ensureStages();

  const { locale } = await params;
  const isZh = locale === "zh";
  const stages = allStages().sort((a, b) => (b.expPerClear ?? 0) - (a.expPerClear ?? 0)).slice(0, 16);
  return (
    <PageShell>
      <PageHeader
        kicker="Tool"
        title={isZh ? "刷图对比" : "Farming Compare"}
        description={isZh ? "按关卡基础经验和金币比较刷图目标；市场价值需要真实掉率和价格后再计算。" : "Compare farming targets by base XP and gold; market value needs real rates and prices."}
      />
      <DataNotice>{isZh ? "市场价值暂不参与排序。先把经验和金币效率作为主要对比依据，市场收益等掉率和价格数据充足后再加入。" : "Market value is not included in ranking yet. Compare by XP and gold efficiency first; market profit will be added when drop-rate and price data is sufficient."}</DataNotice>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage) => <StageCard key={stage.key} stage={stage} locale={locale} />)}
      </div>
    </PageShell>
  );
}
