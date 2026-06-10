import type { Metadata } from "next";
import Link from "next/link";
import { Filter, ShieldAlert } from "lucide-react";
import { RarityBadge } from "@/components/tbh/badges";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { itemName, marketRows, slotNames, type Locale } from "@/lib/game-data/data";
import { getMarketDecision } from "@/lib/game-data/decisions";
import { localizedPath } from "@/lib/locale-path";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string; type?: string; status?: string }>;
};

function txt(locale: Locale, values: Record<Locale | "en", string>) {
  return values[locale] ?? values.en;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TBH 市场风险 | Sell、Keep、Farm 判断" : "TBH Market Risk | Sell, Keep, Farm Decisions",
    description: locale === "zh" ? "查看最低挂单、挂单数、数据更新时间、自用价值、掉落上下文和 Sell/Keep/Farm 风险标签。" : "Check lowest listing, listing count, freshness, self-use value, drop context, and Sell/Keep/Farm risk labels.",
    alternates: { canonical: locale === "en" ? "/market" : `/${locale}/market`, languages: { zh: "/zh/market", en: "/market", ja: "/ja/market", ko: "/ko/market", "x-default": "/market" } },
  };
}

export default async function MarketPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const q = sp.q?.toLowerCase().trim();
  const lpath = (path: string) => localizedPath(locale, path);
  let rows = marketRows().map(({ item, market }) => ({ item, market, decision: getMarketDecision(item.slug, locale) }));
  if (q) rows = rows.filter(({ item }) => itemName(item, locale).toLowerCase().includes(q) || itemName(item, "en").toLowerCase().includes(q) || item.slug.includes(q));
  if (sp.type) rows = rows.filter(({ item }) => item.type === sp.type);
  if (sp.status) rows = rows.filter(({ decision }) => decision?.label === sp.status);
  rows = rows.slice(0, 240);

  return (
    <PageShell>
      <SeoJsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: txt(locale, { zh: "TBH 市场风险", en: "TBH Market Risk", ja: "TBH 市場リスク", ko: "TBH 시장 위험" }),
        numberOfItems: rows.length,
        itemListElement: rows.slice(0, 50).map(({ item }, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `https://taskbarhero.nanobananas.me${locale === "en" ? "" : "/" + locale}/market/${item.slug}`,
        })),
      }} />
      <PageHeader
        kicker="Market"
        title={txt(locale, { zh: "市场风险判断", en: "Market Risk Decisions", ja: "市場リスク判断", ko: "시장 위험 판단" })}
        description={txt(locale, {
          zh: "最低挂单、挂单数、刷新时间、自用价值、掉落上下文和风险标签。",
          en: "Lowest listing, listing count, freshness, self-use value, drop context, and risk label.",
          ja: "最安出品、出品数、更新時刻、自用価値、入手文脈、リスクラベル。",
          ko: "최저 매물, 매물 수, 갱신 시간, 사용 가치, 드롭 맥락, 위험 라벨.",
        })}
      />

      <form className="my-5 grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <input name="q" defaultValue={sp.q} placeholder={txt(locale, { zh: "搜索可交易物品", en: "Search tradable items", ja: "取引可能アイテム検索", ko: "거래 가능 아이템 검색" })} className="border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none" />
        <select name="type" defaultValue={sp.type ?? ""} className="border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm text-white">
          <option value="">{txt(locale, { zh: "全部类型", en: "All types", ja: "全タイプ", ko: "전체 유형" })}</option>
          <option value="GEAR">{txt(locale, { zh: "装备", en: "Gear", ja: "装備", ko: "장비" })}</option>
          <option value="MATERIAL">{txt(locale, { zh: "材料", en: "Materials", ja: "素材", ko: "재료" })}</option>
          <option value="STAGEBOX">{txt(locale, { zh: "宝箱", en: "Chests", ja: "宝箱", ko: "상자" })}</option>
        </select>
        <button className="inline-flex items-center justify-center gap-2 bg-[#d4a017] px-4 py-2 text-sm font-semibold text-black">
          <Filter className="h-4 w-4" />
          {txt(locale, { zh: "筛选", en: "Filter", ja: "絞り込み", ko: "필터" })}
        </button>
      </form>

      <div className="overflow-x-auto border border-[#27272a]">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[#18181b] text-xs text-[#6c6c6c]">
            <tr>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Lowest</th>
              <th className="px-3 py-2">Listings</th>
              <th className="px-3 py-2">Freshness</th>
              <th className="px-3 py-2">Self-use</th>
              <th className="px-3 py-2">Drop context</th>
              <th className="px-3 py-2">Decision</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, market, decision }) => (
              <tr key={item.id} className="border-t border-[#27272a] hover:bg-[#0d0d0d]">
                <td className="px-3 py-2">
                  <Link href={lpath(`/market/${item.slug}`)} className="font-medium text-white hover:text-[#f0c040]">{itemName(item, locale)}</Link>
                  <div className="mt-1 flex items-center gap-2">
                    <RarityBadge grade={item.grade} locale={locale} />
                    <span className="text-xs text-[#6c6c6c]">{item.gear ? slotNames[item.gear]?.[locale] ?? item.gear : item.type}</span>
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-[#f0c040]">{market.lowest ? `$${market.lowest.toFixed(2)}` : "-"}</td>
                <td className="px-3 py-2 font-mono text-[#9d9d9d]">{market.listings?.toLocaleString() ?? "-"}</td>
                <td className="px-3 py-2 text-xs text-[#9d9d9d]">{market.updatedAt}</td>
                <td className="px-3 py-2 text-[#d8d1c2]">{decision?.selfUseValue ?? "-"}</td>
                <td className="px-3 py-2 text-[#d8d1c2]">{decision?.farmContext ?? "-"}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1 border border-[#3f2f10] bg-[#100d06] px-2 py-1 text-xs font-semibold text-[#f0c040]">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {decision?.label ?? "Unknown"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
