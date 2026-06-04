import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Boxes, Database, Map, Search, Shield, Sparkles, Swords, Wrench } from "lucide-react";
import { ChestCard, HeroCard, ItemCard, Section } from "@/components/tbh/cards";
import { PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import {
  allHeroes,
  allItems,
  allRunes,
  allSkills,
  allStages,
  assetPath,
  chestItems,
  effectRows,
  guides,
  MARKET_UPDATED_AT,
  marketRows,
  SITE_URL,
  type Locale,
} from "@/lib/game-data/data";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TaskBar Hero 中文 Wiki｜物品、英雄、掉率、Steam 市场" : "TaskBar Hero Wiki｜Items, Heroes, Drops and Steam Market",
    description:
      locale === "zh"
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
  const topPriceMarketRows = [...pricedMarket]
    .sort((a, b) => (b.market.lowest ?? 0) - (a.market.lowest ?? 0))
    .slice(0, 5);
  const liquidMarketRows = [...pricedMarket]
    .sort((a, b) => (b.market.listings ?? 0) - (a.market.listings ?? 0))
    .slice(0, 5);
  const topPriceMarket = topPriceMarketRows[0];
  const mostListedMarket = liquidMarketRows[0];
  const featuredMarketIds = new Set([topPriceMarket?.item.id, mostListedMarket?.item.id].filter(Boolean));
  const homeMarketRows = liquidMarketRows.length
    ? liquidMarketRows.filter(({ item }) => !featuredMarketIds.has(item.id))
    : market.slice(0, 5);
  const sampleItems = items.filter((item) => item.type !== "STAGEBOX").slice(0, 8);

  const stats = [
    { label: isZh ? "物品" : "Items", value: items.length, icon: Database },
    { label: isZh ? "可交易" : "Tradable", value: market.length, icon: BarChart3 },
    { label: isZh ? "英雄" : "Heroes", value: heroes.length, icon: Swords },
    { label: isZh ? "宝箱" : "Chests", value: chests.length, icon: Boxes },
    { label: isZh ? "关卡" : "Stages", value: allStages().length, icon: Map },
    { label: isZh ? "符文" : "Runes", value: allRunes().length, icon: Sparkles },
    { label: isZh ? "技能" : "Skills", value: allSkills().length, icon: Shield },
    { label: isZh ? "材料效果" : "Effects", value: effectRows(locale).length, icon: BookOpen },
  ];

  const journeys = [
    {
      href: `/${locale}/heroes`,
      icon: Swords,
      title: isZh ? "先选职业" : "Choose a class",
      body: isZh ? "看英雄定位、主副武器、属性优先级和风险。" : "Compare role, weapons, stat priority, and risk.",
    },
    {
      href: `/${locale}/items`,
      icon: Database,
      title: isZh ? "再查物品" : "Search items",
      body: isZh ? "按稀有度、等级、部位、可交易状态筛选。" : "Filter by rarity, level, slot, and tradable status.",
    },
    {
      href: `/${locale}/chests`,
      icon: Boxes,
      title: isZh ? "确认来源" : "Check sources",
      body: isZh ? "宝箱页用于判断来源和数据缺口，不伪造掉率。" : "Chest pages show sources and data gaps without invented rates.",
    },
    {
      href: `/${locale}/market`,
      icon: BarChart3,
      title: isZh ? "最后看市场" : "Then check market",
      body: isZh ? "查看最低挂单价、挂单数和未匹配物品。" : "Check lowest listings, listing counts, and unmatched items.",
    },
  ];

  return (
    <PageShell>
      <SeoJsonLd
        data={[
          { "@context": "https://schema.org", "@type": "WebSite", name: "TaskBar Hero Wiki", url: SITE_URL, potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/${locale}/items?q={search_term_string}`, "query-input": "required name=search_term_string" } },
          { "@context": "https://schema.org", "@type": "VideoGame", name: "TaskBar Hero", genre: "Idle RPG" },
        ]}
      />

      <section className="grid gap-5 border-b border-[#27272a] pb-7 lg:grid-cols-[1fr_520px]">
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-[#d4a017]">TaskBar Hero Database</p>
          <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-[#f1e8d5] md:text-5xl">
            {isZh ? "中文优先的 TaskBar Hero 数据库和决策工具" : "A bilingual TaskBar Hero database built for decisions"}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#a69d8e]">
            {isZh
              ? "用户来到这里不是看宣传，而是要快速解决问题：这个职业怎么玩、这个物品能不能交易、这个宝箱信息是否足够、市场价格是否真实、该刷哪条路线。"
              : "Users come here to solve concrete questions: which class to choose, whether an item is tradable, whether chest data is complete, whether market data is real, and which route to farm."}
          </p>
          <form action={`/${locale}/items`} className="mt-6 flex max-w-2xl border border-[#3b3b3b] bg-[#0d0d0d] p-2">
            <Search className="mt-2 h-4 w-4 shrink-0 text-[#6c6c6c]" />
            <input name="q" className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#6c6c6c]" placeholder={isZh ? "搜索装备、材料、宝箱、关卡、攻略" : "Search gear, materials, chests, stages, guides"} />
            <button className="bg-[#d4a017] px-4 text-sm font-semibold text-black">{isZh ? "搜索" : "Search"}</button>
          </form>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={`/${locale}/${stat.label === (isZh ? "英雄" : "Heroes") ? "heroes" : stat.label === (isZh ? "宝箱" : "Chests") ? "chests" : stat.label === (isZh ? "关卡" : "Stages") ? "map" : stat.label === (isZh ? "符文" : "Runes") ? "runes" : stat.label === (isZh ? "技能" : "Skills") ? "skills" : stat.label === (isZh ? "材料效果" : "Effects") ? "effects" : stat.label === (isZh ? "可交易" : "Tradable") ? "market" : "items"}`} className="border border-[#27272a] bg-[#0d0d0d] p-4 hover:border-[#d4a017]">
                <Icon className="mb-3 h-5 w-5 text-[#d4a017]" />
                <p className="text-2xl font-semibold text-[#ffffff]">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-[#6c6c6c]">{stat.label}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-2 md:grid-cols-4">
        {journeys.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="border border-[#27272a] bg-[#0d0d0d] p-4 hover:border-[#d4a017]">
              <Icon className="mb-3 h-4 w-4 text-[#d4a017]" />
              <p className="font-medium text-[#ffffff]">{link.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#9d9d9d]">{link.body}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <Section title={isZh ? "英雄入口" : "Hero Entry"} eyebrow={isZh ? "先决定职业路线" : "Start with class route"}>
          <div className="grid gap-2 md:grid-cols-2">
            {heroes.slice(0, 4).map((hero) => <HeroCard key={hero.HeroKey} hero={hero} locale={locale} />)}
          </div>
          <Link href={`/${locale}/heroes`} className="mt-3 inline-flex items-center gap-2 border border-[#3b3b3b] px-3 py-2 text-sm text-[#ffffff] hover:border-[#d4a017]">
            {isZh ? "查看全部英雄" : "View all heroes"}
          </Link>
        </Section>

        <Section title={isZh ? "市场行情" : "Market Snapshot"} eyebrow="Steam">
          <div className="border border-[#27272a] bg-[#0d0d0d]">
            <div className="flex flex-col gap-3 border-b border-[#27272a] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="border border-[#3a3325] bg-[#0d0d0d] px-2 py-1 text-xs font-medium text-[#f0c040]">
                    {pricedMarket.length} {isZh ? "个价格" : "prices"}
                  </span>
                  <span className="border border-[#292929] bg-[#0d0d0d] px-2 py-1 text-xs text-[#9d9d9d]">
                    {marketCoverage}% {isZh ? "覆盖" : "coverage"}
                  </span>
                  <span className="border border-[#292929] bg-[#0d0d0d] px-2 py-1 text-xs text-[#6c6c6c]">
                    {isZh ? "更新" : "Updated"} {new Date(MARKET_UPDATED_AT).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#9a9183]">
                  {isZh ? "按最低挂单价和供应量快速判断市场热度；成交风险进入详情页再看。" : "Scan lowest listings and supply first; sale risk is handled on detail pages."}
                </p>
              </div>
              <Link href={`/${locale}/market`} className="inline-flex shrink-0 items-center justify-center gap-2 bg-[#d4a017] px-3 py-2 text-sm font-semibold text-black hover:bg-[#f0c040]">
                {isZh ? "市场表" : "Market table"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-px bg-[#242424] md:grid-cols-2">
              {[topPriceMarket, mostListedMarket].filter(Boolean).map((entry, index) => {
                const { item, market: row } = entry!;
                const icon = assetPath(item.icon);
                const name = item.name[locale === "zh" ? "zh-Hans" : "en-US"] ?? item.slug;
                return (
                  <Link key={`${item.id}-${index}`} href={`/${locale}/market/${item.slug}`} className="group bg-[#0d0d0d] p-4 hover:bg-[#14120d]">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#6c6c6c]">
                      {index === 0 ? (isZh ? "最高挂单价" : "Highest listing") : (isZh ? "供应最多" : "Most listed")}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center border border-[#27272a] bg-[#070707]">
                        {icon ? <Image src={icon} alt={name} width={36} height={36} className="object-contain" data-pixel unoptimized /> : <span className="text-[10px] text-[#6c6c6c]">ITEM</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#ffffff] group-hover:text-[#f0c040]">{name}</p>
                        <p className="mt-1 text-xs text-[#6c6c6c]">{row.listings ? `${row.listings.toLocaleString()} ${isZh ? "挂单" : "listings"}` : row.marketHash}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-[#f0c040]">{row.lowest ? `$${row.lowest.toFixed(2)}` : "-"}</p>
                  </Link>
                );
              })}
            </div>

            <div className="divide-y divide-[#242424]">
              {homeMarketRows.slice(0, 5).map(({ item, market: row }) => {
                const icon = assetPath(item.icon);
                const name = item.name[locale === "zh" ? "zh-Hans" : "en-US"] ?? item.slug;
                return (
                  <Link key={item.id} href={`/${locale}/market/${item.slug}`} className="group grid grid-cols-[34px_1fr_auto] items-center gap-3 px-4 py-3 hover:bg-[#151515]">
                    <div className="flex h-8 w-8 items-center justify-center border border-[#2a2a2a] bg-[#0a0a0a]">
                      {icon ? <Image src={icon} alt={name} width={24} height={24} className="object-contain" data-pixel unoptimized /> : <span className="text-[9px] text-[#6c6c6c]">IT</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[#ffffff] group-hover:text-[#f0c040]">{name}</p>
                      <p className="mt-0.5 text-xs text-[#6c6c6c]">{row.listings ? `${row.listings.toLocaleString()} ${isZh ? "挂单" : "listings"}` : row.marketHash}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#f0c040]">{row.lowest ? `$${row.lowest.toFixed(2)}` : (isZh ? "暂无" : "N/A")}</p>
                      <p className="text-[10px] text-[#6c6c6c]">{isZh ? "最低" : "low"}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-[#27272a] p-3">
              <Link href={`/${locale}/items?market=1`} className="text-sm text-[#9d9d9d] hover:text-[#f0c040]">
                {isZh ? "查看全部可交易物品" : "View all tradable items"}
              </Link>
            </div>
          </div>
        </Section>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_1fr]">
        <Section title={isZh ? "物品图鉴预览" : "Item Visual Preview"} eyebrow="Items">
          <div className="grid gap-2 sm:grid-cols-2">
            {sampleItems.map((item) => <ItemCard key={item.id} item={item} locale={locale} />)}
          </div>
        </Section>

        <Section title={isZh ? "宝箱入口" : "Chest Entry"} eyebrow="Drops">
          <div className="grid gap-2 sm:grid-cols-2">
            {chests.slice(0, 6).map((chest) => <ChestCard key={chest.id} chest={chest} locale={locale} />)}
          </div>
          <p className="mt-3 text-xs leading-5 text-[#6c6c6c]">
            {isZh ? "没有真实 chest -> item -> dropRate 映射时，只显示数据状态，不显示随机掉率表。" : "When chest-to-item drop-rate mapping is incomplete, data status is shown instead of random rate tables."}
          </p>
        </Section>
      </div>

      <Section title={isZh ? "攻略从这里开始" : "Start With These Guides"} eyebrow="Guides">
        <div className="grid gap-2 md:grid-cols-4">
          {guides.slice(0, 8).map((guide) => (
            <Link key={guide.slug} href={`/${locale}/guides/${guide.category}/${guide.slug}`} className="border border-[#27272a] bg-[#0d0d0d] p-4 hover:border-[#d4a017]">
              <BookOpen className="mb-3 h-4 w-4 text-[#d4a017]" />
              <p className="font-medium text-[#ffffff]">{guide.title[locale]}</p>
              <p className="mt-2 text-sm leading-6 text-[#9d9d9d]">{guide.description[locale]}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title={isZh ? "常用工具" : "Tools"} eyebrow={isZh ? "只在数据足够时计算" : "Calculate only with enough data"}>
        <div className="grid gap-2 md:grid-cols-2">
          <Link href={`/${locale}/tools/profit-calculator`} className="flex items-start gap-3 border border-[#27272a] bg-[#0d0d0d] p-4 hover:border-[#d4a017]">
            <Wrench className="mt-1 h-4 w-4 text-[#d4a017]" />
            <div>
              <p className="font-medium text-[#ffffff]">{isZh ? "收益计算器" : "Profit calculator"}</p>
              <p className="mt-1 text-sm text-[#9d9d9d]">{isZh ? "缺掉率、缺价格或缺清图时间时不输出收益数字。" : "No profit number is shown without rates, prices, and clear time."}</p>
            </div>
          </Link>
          <Link href={`/${locale}/tools/farming-compare`} className="flex items-start gap-3 border border-[#27272a] bg-[#0d0d0d] p-4 hover:border-[#d4a017]">
            <Map className="mt-1 h-4 w-4 text-[#d4a017]" />
            <div>
              <p className="font-medium text-[#ffffff]">{isZh ? "刷图对比" : "Farming compare"}</p>
              <p className="mt-1 text-sm text-[#9d9d9d]">{isZh ? "先比较金币、经验和清图时间，再看市场数据是否真实。" : "Compare gold, XP, and clear time before using market data."}</p>
            </div>
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
