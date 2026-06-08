import type { Metadata } from "next";
import { ChestCard, Section } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { chestItems, marketRows, type Locale } from "@/lib/game-data/data";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "宝箱掉率 — 装备等级、关卡来源与掉落表" : locale === "ja" ? "宝箱ドロップ — 装備レベルとステージ" : "Chests & Drop Tables",
    alternates: { canonical: locale === "en" ? "/chests" : `/${locale}/chests`, languages: { zh: "/zh/chests", en: "/chests", ja: "/ja/chests", ko: "/ko/chests", "x-default": "/chests" } },
  };
}

export default async function ChestsPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const chests = chestItems();
  const marketableCount = marketRows().filter(({ item }) => item.type !== "STAGEBOX").length;
  return (
    <PageShell>
      <SeoJsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: isZh ? "宝箱数据库" : "Chests Database",
        numberOfItems: chests.length,
        itemListElement: chests.slice(0, 50).map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `https://taskbarhero.nanobananas.me${locale === "en" ? "" : "/" + locale}/chests/${item.slug}`,
        })),
      }} />
      <PageHeader kicker="Chests" title={isZh ? "宝箱和掉率数据库" : "Chests and Drops"} description={isZh ? "查看宝箱的掉落物品清单、等级范围、关联关卡和市场价值线索。有充分数据后才讨论掉率。" : "Browse chest drop tables, level ranges, linked stages, and market value context. Drop rates are discussed when data is sufficient."} />
      <Section title={isZh ? "增强字段" : "Enhanced Fields"}>
        <div className="grid gap-2 md:grid-cols-3">
          <div className="border border-[#27272a] bg-[#0d0d0d] p-4"><p className="text-sm text-[#ffffff]">{isZh ? "市场价值列" : "Market value column"}</p><p className="mt-1 text-xs text-[#6c6c6c]">{marketableCount} marketable records</p></div>
          <div className="border border-[#27272a] bg-[#0d0d0d] p-4"><p className="text-sm text-[#ffffff]">{isZh ? "推荐刷取目标" : "Farming target"}</p><p className="mt-1 text-xs text-[#6c6c6c]">{isZh ? "按掉率和价格合并判断" : "Combines drops and price"}</p></div>
          <div className="border border-[#27272a] bg-[#0d0d0d] p-4"><p className="text-sm text-[#ffffff]">{isZh ? "可交易机会" : "Tradable chance"}</p><p className="mt-1 text-xs text-[#6c6c6c]">{isZh ? "缺掉率时不输出收益" : "No profit without drop rates"}</p></div>
        </div>
      </Section>
      <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {chests.map((chest) => <ChestCard key={chest.id} chest={chest} locale={locale} />)}
      </div>
    </PageShell>
  );
}
