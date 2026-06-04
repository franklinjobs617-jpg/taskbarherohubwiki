import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allItems, marketRows, UPDATED_AT, DATA_VERSION, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero 更新记录｜物品、掉率与市场变化" : "TaskBar Hero Updates", alternates: pageAlternates(locale, "/updates") };
}

export default async function UpdatesPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  return (
    <PageShell>
      <PageHeader kicker="Updates" title={isZh ? "更新记录" : "Updates"} description={isZh ? "记录游戏版本、数据更新时间、物品增删、可交易状态和市场规则变化。" : "Game version, data updates, item changes, tradability, and market rules."} />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="border border-[#27272a] bg-[#0d0d0d] p-4"><p className="text-xs text-[#6c6c6c]">Data version</p><p className="mt-2 text-[#ffffff]">{DATA_VERSION}</p></div>
        <div className="border border-[#27272a] bg-[#0d0d0d] p-4"><p className="text-xs text-[#6c6c6c]">Updated</p><p className="mt-2 text-[#ffffff]">{UPDATED_AT}</p></div>
        <div className="border border-[#27272a] bg-[#0d0d0d] p-4"><p className="text-xs text-[#6c6c6c]">Entities</p><p className="mt-2 text-[#ffffff]">{allItems().length} items / {marketRows().length} market</p></div>
      </div>
    </PageShell>
  );
}
