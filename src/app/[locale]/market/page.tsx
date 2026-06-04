import type { Metadata } from "next";
import Link from "next/link";
import { ConfidenceBadge, RarityBadge } from "@/components/tbh/badges";
import { DataNotice, PageHeader, PageShell } from "@/components/tbh/page";
import { itemName, marketRows, slotNames, type Locale } from "@/lib/game-data/data";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string; type?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TaskBar Hero Steam 市场｜可交易物品与匹配状态" : "TaskBar Hero Steam Market｜Tradable Items and Match Status",
    description: locale === "zh" ? "查看 TaskBar Hero 可交易物品、Steam 名称匹配状态、数据更新时间和市场风险。" : "Check tradable items, Steam name matching status, data freshness, and market risk.",
    alternates: { canonical: `/${locale}/market`, languages: { zh: "/zh/market", en: "/en/market", "x-default": "/zh/market" } },
  };
}

export default async function MarketPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const isZh = locale === "zh";
  const q = sp.q?.toLowerCase().trim();
  let rows = marketRows();
  if (q) rows = rows.filter(({ item }) => itemName(item, locale).toLowerCase().includes(q) || itemName(item, "en").toLowerCase().includes(q));
  if (sp.type) rows = rows.filter(({ item }) => item.type === sp.type);
  rows = rows.slice(0, 240);

  return (
    <PageShell>
      <PageHeader
        kicker="Market"
        title={isZh ? "Steam 市场状态" : "Steam Market Status"}
        description={isZh ? "这里展示可交易物品和 Steam 市场名称匹配状态。没有真实抓价数据时，不显示价格数字。" : "This page shows tradable items and Steam market name matching. Price numbers are hidden until real data exists."}
      />
      <DataNotice>
        {isZh
          ? "市场信息只用于风险判断。当前显示的是 Steam 返回的最低挂单价和挂单数，不等于成交价；缺少真实数据的物品继续显示暂无市场数据。"
          : "Market data is a risk signal. Current prices are Steam listing prices and listing counts, not sale prices; items without real data still show no market data."}
      </DataNotice>
      <form className="my-5 grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <input name="q" defaultValue={sp.q} placeholder={isZh ? "搜索可交易物品" : "Search tradable items"} className="border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm outline-none" />
        <select name="type" defaultValue={sp.type ?? ""} className="border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm">
          <option value="">{isZh ? "全部类型" : "All types"}</option>
          <option value="GEAR">{isZh ? "装备" : "Gear"}</option>
          <option value="MATERIAL">{isZh ? "材料" : "Materials"}</option>
        </select>
        <button className="bg-[#d4a017] px-4 py-2 text-sm font-semibold text-black">{isZh ? "筛选" : "Filter"}</button>
      </form>
      <div className="overflow-x-auto border border-[#27272a]">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-[#18181b] text-xs text-[#6c6c6c]">
            <tr>
              <th className="px-3 py-2">{isZh ? "物品" : "Item"}</th>
              <th className="px-3 py-2">{isZh ? "稀有度" : "Rarity"}</th>
              <th className="px-3 py-2">{isZh ? "类型" : "Type"}</th>
              <th className="px-3 py-2">Steam marketHash</th>
              <th className="px-3 py-2">{isZh ? "市场价" : "Price"}</th>
              <th className="px-3 py-2">{isZh ? "状态" : "Status"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, market }) => (
              <tr key={item.id} className="border-t border-[#27272a] hover:bg-[#0d0d0d]">
                <td className="px-3 py-2">
                  <Link href={`/${locale}/market/${item.slug}`} className="font-medium text-[#ffffff] hover:text-[#f0c040]">{itemName(item, locale)}</Link>
                  <Link href={`/${locale}/items/${item.slug}`} className="ml-2 text-xs text-[#6c6c6c] hover:text-[#f0c040]">item</Link>
                </td>
                <td className="px-3 py-2"><RarityBadge grade={item.grade} locale={locale} /></td>
                <td className="px-3 py-2 text-[#9d9d9d]">{item.gear ? slotNames[item.gear]?.[locale] ?? item.gear : item.type}</td>
                <td className="px-3 py-2 text-[#9d9d9d]">{market.marketHash}</td>
                <td className="px-3 py-2">
                  {market.lowest ? (
                    <div>
                      <p className="font-semibold text-[#f0c040]">${market.lowest.toFixed(2)}</p>
                      <p className="text-xs text-[#6c6c6c]">{market.listings ? `${market.listings.toLocaleString()} ${isZh ? "挂单" : "listings"}` : isZh ? "挂单数不足" : "Listings unavailable"}</p>
                    </div>
                  ) : (
                    <span className="text-[#6c6c6c]">{isZh ? "暂无市场数据" : "No market data"}</span>
                  )}
                </td>
                <td className="px-3 py-2"><ConfidenceBadge value={market.confidence} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
