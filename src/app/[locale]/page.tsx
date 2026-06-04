import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Boxes, Database, Map, Search, Shield, Sparkles, Swords, Wrench } from "lucide-react";
import { HeroCard } from "@/components/tbh/cards";
import { PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import {
  allHeroes, allItems, allRunes, allSkills, allStages,
  chestItems, effectRows, marketRows,
  SITE_URL, type Locale,
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
  const liquidMarketRows = [...pricedMarket].sort((a, b) => (b.market.listings ?? 0) - (a.market.listings ?? 0)).slice(0, 5);

  const stats = [
    { href: "/items", label: isZh ? "物品" : "Items", value: items.length },
    { href: "/market", label: isZh ? "可交易" : "Tradable", value: market.length },
    { href: "/heroes", label: isZh ? "英雄" : "Heroes", value: heroes.length },
    { href: "/chests", label: isZh ? "宝箱" : "Chests", value: chests.length },
    { href: "/map", label: isZh ? "关卡" : "Stages", value: allStages().length },
    { href: "/runes", label: isZh ? "符文" : "Runes", value: allRunes().length },
    { href: "/skills", label: isZh ? "技能" : "Skills", value: allSkills().length },
    { href: "/effects", label: isZh ? "效果" : "Effects", value: effectRows(locale).length },
  ];

  const quickLinks = [
    { href: "/guides", icon: BookOpen, label: isZh ? "攻略" : "Guides", desc: isZh ? "新手 · 职业 · 市场 · 刷图" : "Beginner · Class · Market · Farming" },
    { href: "/pets", icon: Sparkles, label: isZh ? "宠物" : "Pets", desc: isZh ? "解锁条件与最佳关卡" : "Unlock conditions & best stages" },
    { href: "/builds", icon: Shield, label: isZh ? "Build" : "Builds", desc: isZh ? "职业推荐路线" : "Recommended class routes" },
    { href: "/tools/profit-calculator", icon: Wrench, label: isZh ? "工具" : "Tools", desc: isZh ? "收益计算 · 刷图对比" : "Profit calc · Farming compare" },
  ];

  return (
    <PageShell>
      <SeoJsonLd data={[
        { "@context": "https://schema.org", "@type": "WebSite", name: "TaskBar Hero Wiki", url: SITE_URL, potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/${locale}/items?q={search_term_string}`, "query-input": "required name=search_term_string" } },
        { "@context": "https://schema.org", "@type": "VideoGame", name: "TaskBar Hero", genre: "Idle RPG" },
      ]} />

      {/* ══════ Hero ══════ */}
      <section className="border-b border-[#27272a] pb-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#d4a017]">Database Console</p>
          <h1 className="mt-3 text-[32px] font-semibold leading-tight text-[#ffffff]">
            {isZh ? "TaskBar Hero 中文 Wiki" : "TaskBar Hero Wiki"}
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-[#9d9d9d]">
            {isZh
              ? "物品 · 英雄 · 宝箱 · 关卡 · 符文 · 技能 · Steam 市场"
              : "Items · Heroes · Chests · Stages · Runes · Skills · Steam Market"}
          </p>
          <form action={`/${locale}/items`} className="mx-auto mt-6 flex max-w-lg border border-[#3b3b3b] bg-[#0d0d0d]">
            <Search className="ml-3 h-4 w-4 shrink-0 self-center text-[#6c6c6c]" />
            <input name="q" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[14px] outline-none placeholder:text-[#6c6c6c]"
              placeholder={isZh ? "搜索物品、材料、宝箱..." : "Search items, materials, chests..."} />
            <button className="bg-[#d4a017] px-6 text-[14px] font-medium text-black hover:bg-[#f0c040] transition-colors">
              {isZh ? "搜索" : "Search"}
            </button>
          </form>
        </div>
      </section>

      {/* ══════ Stats ══════ */}
      <div className="border-b border-[#27272a] py-6">
        <div className="grid grid-cols-4 sm:grid-cols-8">
          {stats.map((stat) => (
            <Link key={stat.href} href={`/${locale}${stat.href}`}
              className="group flex flex-col items-center gap-1.5 py-2 text-center transition-colors hover:bg-[#18181b]/50">
              <span className="font-mono text-[22px] font-medium text-[#ffffff] group-hover:text-[#f0c040] transition-colors">
                {stat.value.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-[0.1em] text-[#6c6c6c]">{stat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ══════ Main Content: Heroes + Market ══════ */}
      <div className="grid gap-8 py-8 lg:grid-cols-[1fr_380px]">
        {/* Heroes */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
              {isZh ? "英雄职业" : "Hero Classes"}
            </h2>
            <Link href={`/${locale}/heroes`} className="flex items-center gap-1 text-[12px] text-[#d4a017] hover:text-[#f0c040] transition-colors">
              {isZh ? "全部英雄" : "All heroes"} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {heroes.map((hero) => <HeroCard key={hero.HeroKey} hero={hero} locale={locale} />)}
          </div>
        </section>

        {/* Market + Quick Links sidebar */}
        <aside className="flex flex-col gap-6">
          {/* Market table */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
                {isZh ? "市场行情" : "Market"}
              </h2>
              <Link href={`/${locale}/market`} className="text-[12px] text-[#d4a017] hover:text-[#f0c040] transition-colors">
                {isZh ? "全部 →" : "All →"}
              </Link>
            </div>
            <div className="border border-[#27272a] bg-[#0d0d0d]">
              <table className="w-full font-mono text-[12px]">
                <thead>
                  <tr className="border-b border-[#27272a] text-[10px] uppercase text-[#6c6c6c]">
                    <th className="px-3 py-2 text-left font-medium">{isZh ? "物品" : "Item"}</th>
                    <th className="px-3 py-2 text-right font-medium">{isZh ? "价格" : "Price"}</th>
                    <th className="px-3 py-2 text-right font-medium">{isZh ? "挂单" : "Vol"}</th>
                  </tr>
                </thead>
                <tbody>
                  {liquidMarketRows.slice(0, 7).map(({ item, market: row }) => (
                    <tr key={item.id} className="border-b border-[#27272a] hover:bg-[#18181b]">
                      <td className="px-3 py-2">
                        <Link href={`/${locale}/market/${item.slug}`} className="text-[#ffffff] hover:text-[#f0c040] transition-colors">
                          {item.name[locale === "zh" ? "zh-Hans" : "en-US"] ?? item.slug}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-[#f0c040]">
                        {row.lowest ? `$${row.lowest.toFixed(2)}` : "-"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-[#9d9d9d]">
                        {row.listings?.toLocaleString() ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={`/${locale}${link.href}`}
                  className="card flex flex-col gap-1.5 p-3 transition hover:border-[#d4a017]/60">
                  <Icon className="h-4 w-4 text-[#d4a017]" />
                  <p className="text-[13px] font-medium text-[#ffffff]">{link.label}</p>
                  <p className="text-[11px] leading-4 text-[#6c6c6c]">{link.desc}</p>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
