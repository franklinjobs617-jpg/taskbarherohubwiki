import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Boxes, Database, Map, Search, Shield, Sparkles, Swords, Wrench } from "lucide-react";
import { ChestCard, HeroCard, ItemCard, Section } from "@/components/tbh/cards";
import { PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import {
  allHeroes, allItems, allRunes, allSkills, allStages,
  assetPath, chestItems, effectRows, guides, marketRows,
  SITE_URL, type Locale, MARKET_UPDATED_AT,
} from "@/lib/game-data/data";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TaskBar Hero 中文 Wiki｜物品、英雄、掉率、Steam 市场" : "TaskBar Hero Wiki｜Items, Heroes, Drops & Steam Market",
    description: locale === "zh"
      ? "中文优先的 TaskBar Hero 数据库，覆盖物品、英雄、技能、符文、宝箱、关卡、材料效果、攻略和 Steam 市场状态。"
      : "A bilingual TaskBar Hero database for items, heroes, skills, runes, chests, stages, material effects, guides, and Steam Market status.",
    alternates: { canonical: `/${locale}`, languages: { zh: "/zh", en: "/en", "x-default": "/zh" } },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const items = allItems();
  const heroes = allHeroes();
  const chests = chestItems();
  const market = marketRows();
  const pricedMarket = market.filter(({ market: row }) => row.lowest);
  const marketCoverage = Math.round((pricedMarket.length / Math.max(market.length, 1)) * 100);
  const topPriceMarketRows = [...pricedMarket].sort((a, b) => (b.market.lowest ?? 0) - (a.market.lowest ?? 0)).slice(0, 5);
  const liquidMarketRows = [...pricedMarket].sort((a, b) => (b.market.listings ?? 0) - (a.market.listings ?? 0)).slice(0, 5);
  const topPriceMarket = topPriceMarketRows[0];
  const mostListedMarket = liquidMarketRows[0];
  const featuredMarketIds = new Set([topPriceMarket?.item.id, mostListedMarket?.item.id].filter(Boolean));
  const homeMarketRows = liquidMarketRows.length
    ? liquidMarketRows.filter(({ item }) => !featuredMarketIds.has(item.id))
    : market.slice(0, 5);
  const sampleItems = items.filter((item) => item.type !== "STAGEBOX").slice(0, 8);

  const stats = [
    { href: `/${locale}/items`, label: isZh ? "物品" : "Items", value: items.length, icon: Database },
    { href: `/${locale}/market`, label: isZh ? "可交易" : "Tradable", value: market.length, icon: BarChart3 },
    { href: `/${locale}/heroes`, label: isZh ? "英雄" : "Heroes", value: heroes.length, icon: Swords },
    { href: `/${locale}/chests`, label: isZh ? "宝箱" : "Chests", value: chests.length, icon: Boxes },
    { href: `/${locale}/map`, label: isZh ? "关卡" : "Stages", value: allStages().length, icon: Map },
    { href: `/${locale}/runes`, label: isZh ? "符文" : "Runes", value: allRunes().length, icon: Sparkles },
    { href: `/${locale}/skills`, label: isZh ? "技能" : "Skills", value: allSkills().length, icon: Shield },
    { href: `/${locale}/effects`, label: isZh ? "效果" : "Effects", value: effectRows(locale).length, icon: BookOpen },
  ];

  return (
    <PageShell>
      <SeoJsonLd data={[
        { "@context": "https://schema.org", "@type": "WebSite", name: "TaskBar Hero Wiki", url: SITE_URL, potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/${locale}/items?q={search_term_string}`, "query-input": "required name=search_term_string" } },
        { "@context": "https://schema.org", "@type": "VideoGame", name: "TaskBar Hero", genre: "Idle RPG" },
      ]} />

      {/* ── Hero + Search ── */}
      <div className="mb-8 border-b border-[#27272a] pb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#d4a017]">TaskBar Hero Database</p>
            <h1 className="text-[28px] font-semibold leading-tight text-[#ffffff]">
              {isZh ? "TaskBar Hero 中文数据库" : "TaskBar Hero Database"}
            </h1>
            <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#9d9d9d]">
              {isZh ? "物品 · 英雄 · 掉落 · Steam 市场 — 双语可查可筛" : "Items · Heroes · Drops · Steam Market — bilingual, searchable, filterable"}
            </p>
          </div>
          <form action={`/${locale}/items`} className="flex w-full max-w-md border border-[#3b3b3b] bg-[#0d0d0d]">
            <Search className="ml-3 h-4 w-4 shrink-0 self-center text-[#6c6c6c]" />
            <input name="q" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[14px] outline-none placeholder:text-[#6c6c6c]"
              placeholder={isZh ? "搜索装备、材料、宝箱、关卡、攻略" : "Search gear, materials, chests, stages, guides"} />
            <button className="bg-[#d4a017] px-5 text-[14px] font-medium text-black hover:bg-[#f0c040]">
              {isZh ? "搜索" : "Search"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="mb-8 grid grid-cols-4 gap-px bg-[#27272a] overflow-hidden sm:grid-cols-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.href} href={stat.href}
              className="flex flex-col items-center gap-1 bg-[#0d0d0d] px-2 py-4 text-center transition hover:bg-[#18181b]">
              <Icon className="h-4 w-4 text-[#d4a017]" />
              <span className="font-mono text-[18px] font-medium text-[#ffffff]">{stat.value.toLocaleString()}</span>
              <span className="text-[10px] text-[#6c6c6c]">{stat.label}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Main 2-col: Heroes + Market ── */}
      <div className="mb-8 grid gap-8 xl:grid-cols-[1fr_1fr]">
        {/* Heroes quick view */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[#6c6c6c]">{isZh ? "英雄" : "Heroes"}</h2>
            <Link href={`/${locale}/heroes`} className="text-[12px] text-[#d4a017] hover:text-[#f0c040]">
              {isZh ? "全部 →" : "All →"}
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {heroes.slice(0, 4).map((hero) => <HeroCard key={hero.HeroKey} hero={hero} locale={locale} />)}
          </div>
        </section>

        {/* Market snapshot */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[#6c6c6c]">{isZh ? "市场行情" : "Market"}</h2>
            <Link href={`/${locale}/market`} className="text-[12px] text-[#d4a017] hover:text-[#f0c040]">
              {isZh ? "全部 →" : "All →"}
            </Link>
          </div>
          <div className="border border-[#27272a] bg-[#0d0d0d]">
            <table className="w-full font-mono text-[13px]">
              <thead>
                <tr className="border-b border-[#27272a] text-[10px] uppercase text-[#6c6c6c]">
                  <th className="px-3 py-2 text-left font-medium">{isZh ? "物品" : "Item"}</th>
                  <th className="px-3 py-2 text-right font-medium">{isZh ? "价格" : "Price"}</th>
                  <th className="px-3 py-2 text-right font-medium">{isZh ? "挂单" : "Listings"}</th>
                </tr>
              </thead>
              <tbody>
                {homeMarketRows.slice(0, 6).map(({ item, market: row }) => (
                  <tr key={item.id} className="border-b border-[#27272a] hover:bg-[#18181b]">
                    <td className="px-3 py-2.5">
                      <Link href={`/${locale}/market/${item.slug}`} className="text-[#ffffff] hover:text-[#f0c040]">
                        {item.name[locale === "zh" ? "zh-Hans" : "en-US"] ?? item.slug}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-right text-[#f0c040]">
                      {row.lowest ? `$${row.lowest.toFixed(2)}` : "-"}
                    </td>
                    <td className="px-3 py-2.5 text-right text-[#9d9d9d]">
                      {row.listings?.toLocaleString() ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ── Items + Chests ── */}
      <div className="mb-8 grid gap-8 xl:grid-cols-[1fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[#6c6c6c]">{isZh ? "物品图鉴" : "Item Preview"}</h2>
            <Link href={`/${locale}/items`} className="text-[12px] text-[#d4a017] hover:text-[#f0c040]">
              {isZh ? "全部 →" : "All →"}
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {sampleItems.map((item) => <ItemCard key={item.id} item={item} locale={locale} />)}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[#6c6c6c]">{isZh ? "宝箱" : "Chests"}</h2>
            <Link href={`/${locale}/chests`} className="text-[12px] text-[#d4a017] hover:text-[#f0c040]">
              {isZh ? "全部 →" : "All →"}
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {chests.slice(0, 6).map((chest) => <ChestCard key={chest.id} chest={chest} locale={locale} />)}
          </div>
        </section>
      </div>

      {/* ── Guides + Tools ── */}
      <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[#6c6c6c]">{isZh ? "攻略" : "Guides"}</h2>
            <Link href={`/${locale}/guides`} className="text-[12px] text-[#d4a017] hover:text-[#f0c040]">
              {isZh ? "全部 →" : "All →"}
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {guides.slice(0, 6).map((guide) => (
              <Link key={guide.slug} href={`/${locale}/guides/${guide.category}/${guide.slug}`}
                className="card flex items-start gap-3 p-3 transition hover:border-[#d4a017]/60">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[#d4a017]" />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#ffffff]">{guide.title[locale]}</p>
                  <p className="mt-1 text-[12px] leading-5 text-[#6c6c6c] line-clamp-2">{guide.description[locale]}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[#6c6c6c]">{isZh ? "工具" : "Tools"}</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href={`/${locale}/tools/profit-calculator`} className="card flex items-start gap-3 p-3 transition hover:border-[#d4a017]/60">
              <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-[#d4a017]" />
              <div>
                <p className="text-[13px] font-medium text-[#ffffff]">{isZh ? "收益计算器" : "Profit Calculator"}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#6c6c6c]">{isZh ? "关卡金币经验 + 市场收益估算" : "Stage gold/XP + market profit estimate"}</p>
              </div>
            </Link>
            <Link href={`/${locale}/tools/farming-compare`} className="card flex items-start gap-3 p-3 transition hover:border-[#d4a017]/60">
              <Map className="mt-0.5 h-4 w-4 shrink-0 text-[#d4a017]" />
              <div>
                <p className="text-[13px] font-medium text-[#ffffff]">{isZh ? "刷图对比" : "Farming Compare"}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#6c6c6c]">{isZh ? "按金币/经验效率排序关卡" : "Sort stages by gold/XP efficiency"}</p>
              </div>
            </Link>
            <Link href={`/${locale}/pets`} className="card flex items-start gap-3 p-3 transition hover:border-[#d4a017]/60">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#d4a017]" />
              <div>
                <p className="text-[13px] font-medium text-[#ffffff]">{isZh ? "宠物解锁" : "Pet Unlocks"}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#6c6c6c]">{isZh ? "条件 + 属性 + 推荐关卡" : "Conditions + stats + best stages"}</p>
              </div>
            </Link>
            <Link href={`/${locale}/builds`} className="card flex items-start gap-3 p-3 transition hover:border-[#d4a017]/60">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#d4a017]" />
              <div>
                <p className="text-[13px] font-medium text-[#ffffff]">{isZh ? "Build 路线" : "Build Routes"}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#6c6c6c]">{isZh ? "职业推荐装备和技能方向" : "Recommended gear and skill direction"}</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
