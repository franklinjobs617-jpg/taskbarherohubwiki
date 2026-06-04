import type { Metadata } from "next";
import { DataNotice, PageHeader, PageShell } from "@/components/tbh/page";
import { allStages, chestItems, stageName, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero 收益计算器｜金币、经验与市场数据检查" : "TaskBar Hero Profit Calculator", alternates: pageAlternates(locale, "/tools/profit-calculator") };
}

export default async function ProfitCalculatorPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const stages = allStages().slice(0, 40);
  const chests = chestItems().slice(0, 20);
  return (
    <PageShell>
      <PageHeader
        kicker="Tool"
        title={isZh ? "收益计算器" : "Profit Calculator"}
        description={isZh ? "结合关卡数据、宝箱掉率和清图时间来评估刷图收益。市场收益需要掉率和真实价格都齐全。" : "Evaluate farming profit using stage data, chest drops, and clear time. Market profit requires both drop rates and real prices."}
      />
      <DataNotice>{isZh ? "宝箱掉率数据目前还不完整，所以市场收益部分暂时只显示数据状态。金币和经验收益可以直接用关卡基础数据来估算。" : "Chest drop-rate data is not yet complete, so market profit shows data status for now. Gold and XP can still be estimated using stage base data."}</DataNotice>
      <div className="mt-5 grid gap-4 lg:grid-cols-[420px_1fr]">
        <form className="space-y-3 border border-[#27272a] bg-[#0d0d0d] p-4">
          <label className="block text-sm text-[#9d9d9d]">{isZh ? "选择关卡" : "Stage"}<select className="mt-1 w-full border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2">{stages.map((stage) => <option key={stage.key}>{stageName(stage, locale)}</option>)}</select></label>
          <label className="block text-sm text-[#9d9d9d]">{isZh ? "选择宝箱" : "Chest"}<select className="mt-1 w-full border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2">{chests.map((chest) => <option key={chest.id}>{chest.name[locale === "zh" ? "zh-Hans" : "en-US"] ?? chest.slug}</option>)}</select></label>
          <label className="block text-sm text-[#9d9d9d]">{isZh ? "每轮时间（秒）" : "Clear time (sec)"}<input type="number" min="1" defaultValue="60" className="mt-1 w-full border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2" /></label>
          <label className="block text-sm text-[#9d9d9d]">{isZh ? "Steam 手续费比例" : "Steam fee"}<input type="number" min="0" max="0.3" step="0.01" defaultValue="0.15" className="mt-1 w-full border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2" /></label>
        </form>
        <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
          <h2 className="text-lg font-semibold text-[#f1e8d5]">{isZh ? "数据状态" : "Data Status"}</h2>
          <div className="mt-4 space-y-2 text-sm text-[#9d9d9d]">
            <p>{isZh ? "金币/经验：可用关卡基础数据判断。" : "Gold/XP: available through stage base data."}</p>
            <p>{isZh ? "市场收益：掉率数据不完整，暂时无法计算市场收益。" : "Market profit: drop-rate data is incomplete, so market profit can't be calculated yet."}</p>
            <p>{isZh ? "需要的条件：宝箱到物品的掉率数据、真实 Steam 市场价、你的实际清图时间。" : "Requirements: chest-to-item drop rates, real Steam Market prices, and your actual clear time."}</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
