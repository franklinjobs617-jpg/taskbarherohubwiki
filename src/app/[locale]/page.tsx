import type { Metadata } from "next";
import Image from "next/image";
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
  const titles: Record<string, string> = {
    zh: "TBH: Task Bar Hero Wiki — 物品数据库、英雄配装、掉落查询与 Steam 市场",
    en: "TBH: Task Bar Hero Wiki — Items, Builds, Drop Finder & Steam Market",
    ja: "TBH: Task Bar Hero Wiki — アイテム、ビルド、ドロップ検索と Steam マーケット",
  };
  const descriptions: Record<string, string> = {
    zh: "最完整的 TBH: Task Bar Hero Wiki。搜索 5,944 件物品、对比 6 位英雄属性、查找掉落位置、查看 Steam 市场价格、规划刷图路线。数据来自游戏文件解包。",
    en: "The complete TBH: Task Bar Hero wiki. Search 5,944 items, compare 6 hero classes, find drop locations, check Steam Market prices, and plan your farming route. Data mined from game files.",
    ja: "TBH: Task Bar Hero の完全な Wiki。5,944 アイテムの検索、6 職業の比較、ドロップ場所の確認、Steam マーケット価格のチェック、周回ルートの計画ができます。ゲームファイルからデータ抽出。",
  };
  return {
    title: titles[locale] ?? titles.en,
    description: descriptions[locale] ?? descriptions.en,
    alternates: { canonical: `/${locale}`, languages: { en: "/", zh: "/zh", ja: "/ja", ko: "/ko", "x-default": "/" } },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const lp = (path: string) => locale === "en" ? path : `/${locale}${path}`;
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
        { "@context": "https://schema.org", "@type": "WebSite", name: "TBH: Task Bar Hero Wiki", url: SITE_URL, potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/items?q={search_term_string}`, "query-input": "required name=search_term_string" } },
        { "@context": "https://schema.org", "@type": "VideoGame", name: "TBH: Task Bar Hero", genre: "Idle RPG", playMode: "SinglePlayer", applicationCategory: "Game", operatingSystem: "Windows" },
      ]} />

      {/* ══════ Hero ══════ */}
      <section className="border-b border-[#27272a] pb-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 overflow-hidden border border-[#4d281e] bg-[#1e2c3d] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
            <Image
              src="/game/home-hero-overview.png"
              alt="TaskBar Hero Game Overview"
              width={786}
              height={186}
              priority
              unoptimized
              className="h-auto w-full object-cover"
              data-pixel
            />
          </div>
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#d4a017]">Community Wiki &amp; Database</p>
          <h1 className="mt-3 text-[32px] font-semibold leading-tight text-[#ffffff]">
            {isZh ? "TBH: Task Bar Hero Wiki" : "TBH: Task Bar Hero Wiki"}
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-[#9d9d9d]">
            {isZh
              ? "5,944 物品 · 6 英雄 · 120 关卡 · 197 符文 · 掉落查询 · Steam 市场 · 刷图规划"
              : "5,944 Items · 6 Heroes · 120 Stages · 197 Runes · Drop Finder · Steam Market · Farming Planner"}
          </p>
          <form action={lp("/items")} className="mx-auto mt-6 flex max-w-lg border border-[#3b3b3b] bg-[#0d0d0d]">
            <Search className="ml-3 h-4 w-4 shrink-0 self-center text-[#6c6c6c]" />
            <input name="q" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[14px] outline-none placeholder:text-[#6c6c6c]"
              placeholder={isZh ? "搜索物品、材料、宝箱、关卡..." : "Search items, materials, chests, stages..."} />
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
            <Link key={stat.href} href={lp(stat.href)}
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
      <div className="grid gap-8 pt-8 lg:grid-cols-[1fr_380px]">
        {/* Heroes */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
              {isZh ? "英雄职业" : "Hero Classes"}
            </h2>
            <Link href={lp("/heroes")} className="flex items-center gap-1 text-[12px] text-[#d4a017] hover:text-[#f0c040] transition-colors">
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
              <Link href={lp("/market")} className="text-[12px] text-[#d4a017] hover:text-[#f0c040] transition-colors">
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
                        <Link href={lp(`/market/${item.slug}`)} className="text-[#ffffff] hover:text-[#f0c040] transition-colors">
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
                <Link key={link.href} href={lp(link.href)}
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

      {/* ══════ Bottom: Patch Notes + FAQ ══════ */}
      <div className="grid gap-8 border-t border-[#27272a] py-8 lg:grid-cols-2">
        {/* Patch Notes */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#d4a017]">
              {isZh ? "更新日志" : "Patch Notes"}
            </h2>
            <Link href={lp("/updates")} className="text-[12px] text-[#9d9d9d] hover:text-[#f0c040] transition-colors">
              {isZh ? "完整记录 →" : "Full log →"}
            </Link>
          </div>
          <div className="space-y-3">
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-[#d4a017] px-2 py-0.5 text-[10px] font-medium text-black">v1.00.09</span>
                <span className="text-[11px] text-[#6c6c6c]">2026-06-03</span>
              </div>
              <p className="text-[14px] leading-6 text-[#ffffff]">
                {isZh
                  ? "游戏版本 v1.00.09 数据同步。5934 件物品、120 个关卡、197 个符文、6 位英雄数据完整。"
                  : "Game v1.00.09 data sync. 5,934 items, 120 stages, 197 runes, 6 heroes with complete data."}
              </p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-[#18181b] px-2 py-0.5 text-[10px] text-[#9d9d9d]">v1.00.08</span>
                <span className="text-[11px] text-[#6c6c6c]">2026-05-31</span>
              </div>
              <p className="text-[14px] leading-6 text-[#9d9d9d]">
                {isZh
                  ? "Steam 市场匹配状态更新。新增关卡掉落数据关联，物品页支持按职业筛选。"
                  : "Steam Market match status update. Stage drop data linked, items filterable by class."}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#d4a017]">
              {isZh ? "常见问题" : "FAQ"}
            </h2>
            <Link href={lp("/faq")} className="text-[12px] text-[#9d9d9d] hover:text-[#f0c040] transition-colors">
              {isZh ? "全部 FAQ →" : "All FAQs →"}
            </Link>
          </div>
          <div className="space-y-2">
            {[
              [isZh ? "哪个职业适合新手？" : "Best class for beginners?", isZh ? "骑士。高生命、高护甲和盾牌让它成为最宽容的职业。" : "Knight. High HP, armor, and shield make it the most forgiving class."],
              [isZh ? "物品值多少钱？" : "How much are items worth?", isZh ? "可交易物品在 Steam 市场有真实价格时才会显示。没有数据时不编造价格。" : "Prices are shown only when real Steam Market data exists. No invented numbers."],
              [isZh ? "宝箱掉率怎么看？" : "How to read chest drop rates?", isZh ? "关卡详情页展示每个宝箱的掉落概率。有数据才有百分比，不完整的只标注来源。" : "Stage detail pages show drop rates for each chest. Only displayed when data is complete."],
              [isZh ? "怎么判断装备好坏？" : "How to judge gear?", isZh ? "先看等级和槽位覆盖，再比稀有度。一把 Common 50 级剑 > Legendary 20 级剑。" : "Level and slot coverage before rarity. A Common Lv50 sword beats a Legendary Lv20 one."],
            ].map(([q, a]) => (
              <details key={q} className="card group cursor-pointer [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-3 text-[13px] font-medium text-[#ffffff] group-open:text-[#f0c040] select-none">
                  {q}
                  <span className="text-[10px] text-[#6c6c6c] group-open:hidden">+</span>
                  <span className="text-[10px] text-[#f0c040] hidden group-open:inline">−</span>
                </summary>
                <p className="px-3 pb-3 text-[13px] leading-6 text-[#9d9d9d]">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
