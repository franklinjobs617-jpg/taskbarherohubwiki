import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Boxes, Database, Map, Search, Swords, Wrench } from "lucide-react";
import { HeroCard } from "@/components/tbh/cards";
import { PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import {
  allHeroes,
  allItems,
  allRunes,
  allSkills,
  allStages,
  chestItems,
  effectRows,
  marketRows,
  SITE_URL,
  type Locale,
} from "@/lib/game-data/data";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "zh"
    ? "TBH: Task Bar Hero Wiki - 掉落查询、刷图优化、物品数据库"
    : "TBH: Task Bar Hero Wiki - Drop Finder, Farming Optimizer & Item Database";
  const description = locale === "zh"
    ? "用真实游戏数据查询物品掉落、推荐刷图关卡、比较职业装备和查看 Steam 市场状态。"
    : "Use game data to find item drops, rank farming stages, compare class gear, and check Steam Market status.";

  return {
    title,
    description,
    alternates: {
      canonical: locale === "en" ? "/" : `/${locale}`,
      languages: { en: "/", zh: "/zh", ja: "/ja", ko: "/ko", "x-default": "/" },
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const lp = (path: string) => locale === "en" ? path : `/${locale}${path}`;
  const items = allItems();
  const heroes = allHeroes();
  const market = marketRows();
  const pricedMarket = market.filter(({ market: row }) => row.lowest);
  const liquidMarketRows = [...pricedMarket].sort((a, b) => (b.market.listings ?? 0) - (a.market.listings ?? 0)).slice(0, 7);

  const stats = [
    { href: "/items", label: isZh ? "物品" : "Items", value: items.length },
    { href: "/market", label: isZh ? "可交易" : "Tradable", value: market.length },
    { href: "/heroes", label: isZh ? "英雄" : "Heroes", value: heroes.length },
    { href: "/chests", label: isZh ? "宝箱" : "Chests", value: chestItems().length },
    { href: "/map", label: isZh ? "关卡" : "Stages", value: allStages().length },
    { href: "/runes", label: isZh ? "符文" : "Runes", value: allRunes().length },
    { href: "/skills", label: isZh ? "技能" : "Skills", value: allSkills().length },
    { href: "/effects", label: isZh ? "效果" : "Effects", value: effectRows(locale).length },
  ];

  const taskLinks = [
    { href: "/tools/drop-finder", icon: Search, label: isZh ? "找掉落" : "Find drops", desc: isZh ? "输入物品，直接看哪里掉、概率和推荐关卡" : "Search an item and get stages, rates, and routes" },
    { href: "/tools/farming-optimizer", icon: Wrench, label: isZh ? "刷图优化" : "Farming optimizer", desc: isZh ? "按等级、目标和通关时间排序当前最值得刷的关卡" : "Rank stages by level, goal, and clear speed" },
    { href: "/items", icon: Database, label: isZh ? "物品决策表" : "Item decision table", desc: isZh ? "一屏比较职业适配、掉落、市场和用途" : "Compare class fit, drops, market, and use" },
    { href: "/heroes", icon: Swords, label: isZh ? "职业配装" : "Class builds", desc: isZh ? "按英雄查看武器路线、属性优先级和装备方向" : "Open weapon routes and stat priorities by hero" },
    { href: "/market", icon: BarChart3, label: isZh ? "市场风险" : "Market risk", desc: isZh ? "只展示真实价格和挂单，不用过期价格做收益结论" : "Check real listings without fake profit promises" },
    { href: "/cube", icon: Boxes, label: isZh ? "Cube 规划" : "Cube planning", desc: isZh ? "查看材料、效果、合成和升级系统" : "Plan materials, effects, synthesis, and upgrades" },
    { href: "/map", icon: Map, label: isZh ? "关卡地图" : "Stage map", desc: isZh ? "按区域、难度和 Boss 找推进路线" : "Browse route, difficulty, and boss progression" },
    { href: "/guides", icon: BookOpen, label: isZh ? "新手路线" : "Start route", desc: isZh ? "先解决开局、职业、刷图和市场判断" : "Beginner, class, farming, and market decisions" },
  ];

  return (
    <PageShell>
      <SeoJsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "TBH: Task Bar Hero Wiki",
          url: SITE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/items?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "VideoGame",
          name: "TBH: Task Bar Hero",
          genre: "Idle RPG",
          playMode: "SinglePlayer",
          applicationCategory: "Game",
          operatingSystem: "Windows",
        },
      ]} />

      <section className="border-b border-[#27272a] pb-9">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 overflow-hidden border border-[#4d281e] bg-[#1e2c3d] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
            <Image
              src="/game/home-hero-overview.png"
              alt="TaskBar Hero game overview"
              width={786}
              height={186}
              priority
              unoptimized
              className="h-auto w-full object-cover"
              data-pixel
            />
          </div>
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#d4a017]">
            {isZh ? "玩家决策工具" : "Player decision hub"}
          </p>
          <h1 className="mx-auto mt-3 max-w-[320px] break-words text-[24px] font-semibold leading-tight text-white sm:max-w-3xl sm:text-[34px]">
            TBH: Task Bar Hero Wiki
          </h1>
          <p className="mx-auto mt-3 max-w-[340px] text-[14px] leading-6 text-[#9d9d9d] sm:max-w-2xl sm:text-[15px] sm:leading-7">
            {isZh
              ? "查掉落、排刷图路线、比职业装备、看市场状态。不要只浏览资料，直接找到下一步。"
              : "Find drops, rank farming routes, compare class gear, and check market status. Do not just browse data; get the next action."}
          </p>
          <form action={lp("/items")} className="mx-auto mt-6 flex w-full max-w-[calc(100vw-24px)] border border-[#3b3b3b] bg-[#0d0d0d] sm:max-w-lg">
            <Search className="ml-3 h-4 w-4 shrink-0 self-center text-[#6c6c6c]" />
            <input
              name="q"
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[14px] outline-none placeholder:text-[#6c6c6c]"
              placeholder={isZh ? "搜索物品、材料、宝箱、关卡..." : "Search items, materials, chests, stages..."}
            />
            <button className="w-20 shrink-0 bg-[#d4a017] text-[14px] font-medium text-black transition-colors hover:bg-[#f0c040] sm:w-auto sm:px-6">
              {isZh ? "搜索" : "Search"}
            </button>
          </form>
        </div>
      </section>

      <div className="border-b border-[#27272a] py-6">
        <div className="grid grid-cols-4 sm:grid-cols-8">
          {stats.map((stat) => (
            <Link key={stat.href} href={lp(stat.href)} className="group flex flex-col items-center gap-1.5 py-2 text-center transition-colors hover:bg-[#18181b]/50">
              <span className="font-mono text-[22px] font-medium text-white transition-colors group-hover:text-[#f0c040]">
                {stat.value.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-[0.1em] text-[#6c6c6c]">{stat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <section className="border-b border-[#27272a] py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d4a017]">
              {isZh ? "按任务开始" : "Start by task"}
            </p>
            <h2 className="mt-1 text-[22px] font-semibold text-white">
              {isZh ? "你现在想解决什么？" : "What are you trying to solve now?"}
            </h2>
          </div>
          <Link href={lp("/tools/drop-finder")} className="hidden text-sm text-[#f0c040] hover:underline sm:inline-flex">
            {isZh ? "打开 Drop Finder" : "Open Drop Finder"} →
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {taskLinks.map((task) => {
            const Icon = task.icon;
            return (
              <Link key={task.href} href={lp(task.href)} className="group border border-[#27272a] bg-[#0d0d0d] p-4 transition hover:border-[#d4a017]/70 hover:bg-[#111]">
                <Icon className="h-5 w-5 text-[#d4a017]" />
                <p className="mt-3 text-[15px] font-semibold text-white group-hover:text-[#f0c040]">{task.label}</p>
                <p className="mt-1 min-h-10 text-[12px] leading-5 text-[#8c8577]">{task.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-8 pt-8 lg:grid-cols-[1fr_380px]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
              {isZh ? "英雄职业" : "Hero Classes"}
            </h2>
            <Link href={lp("/heroes")} className="flex items-center gap-1 text-[12px] text-[#d4a017] transition-colors hover:text-[#f0c040]">
              {isZh ? "全部英雄" : "All heroes"} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {heroes.map((hero) => <HeroCard key={hero.HeroKey} hero={hero} locale={locale} />)}
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
                {isZh ? "市场状态" : "Market"}
              </h2>
              <Link href={lp("/market")} className="text-[12px] text-[#d4a017] transition-colors hover:text-[#f0c040]">
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
                  {liquidMarketRows.map(({ item, market: row }) => (
                    <tr key={item.id} className="border-b border-[#27272a] hover:bg-[#18181b]">
                      <td className="px-3 py-2">
                        <Link href={lp(`/market/${item.slug}`)} className="text-white transition-colors hover:text-[#f0c040]">
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

          <div className="grid grid-cols-2 gap-2">
            {taskLinks.slice(0, 4).map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={lp(link.href)} className="card flex flex-col gap-1.5 p-3 transition hover:border-[#d4a017]/60">
                  <Icon className="h-4 w-4 text-[#d4a017]" />
                  <p className="text-[13px] font-medium text-white">{link.label}</p>
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
