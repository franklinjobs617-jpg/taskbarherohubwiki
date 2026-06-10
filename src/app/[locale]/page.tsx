import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Boxes, Map, PawPrint, Search, ShieldAlert, Sparkles, Target } from "lucide-react";
import { PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { allItems, allRunes, allStages, chestItems, marketRows, SITE_URL, type Locale } from "@/lib/game-data/data";
import { extPets } from "@/lib/game-data/external";
import { localizedPath } from "@/lib/locale-path";

type Props = { params: Promise<{ locale: Locale }> };

function txt(locale: Locale, values: Record<Locale | "en", string>) {
  return values[locale] ?? values.en;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "zh"
    ? "TBH Wiki | 掉落查询、最佳刷图、宠物解锁与市场判断"
    : "TBH Wiki | Drop Finder, Best Farm Stages, Pet Unlocks & Market Risk";
  const description = locale === "zh"
    ? "搜索物品、材料、宝箱、怪物、关卡和宠物，查看刷图关卡、掉率、预计次数、宠物路线和市场状态。"
    : "Search items, materials, chests, monsters, stages, and pets for farming stages, rates, expected runs, unlock routes, and market status.";
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
  const items = allItems();
  const stats = [
    { href: "/items", label: txt(locale, { zh: "物品", en: "Items", ja: "アイテム", ko: "아이템" }), value: items.length },
    { href: "/chests", label: txt(locale, { zh: "宝箱", en: "Chests", ja: "宝箱", ko: "상자" }), value: chestItems().length },
    { href: "/map", label: txt(locale, { zh: "关卡", en: "Stages", ja: "ステージ", ko: "스테이지" }), value: allStages().length },
    { href: "/pets", label: txt(locale, { zh: "宠物", en: "Pets", ja: "ペット", ko: "펫" }), value: extPets().length },
    { href: "/runes", label: txt(locale, { zh: "符文", en: "Runes", ja: "ルーン", ko: "룬" }), value: allRunes().length },
    { href: "/market", label: txt(locale, { zh: "可交易", en: "Market", ja: "市場", ko: "시장" }), value: marketRows().length },
  ];
  const tasks = [
    { href: "/tools/drop-finder", icon: Target, label: "Find Drops", desc: txt(locale, { zh: "查去哪刷、概率和预计次数", en: "Best stage, chance, expected runs", ja: "周回先、確率、必要回数", ko: "추천 장소, 확률, 예상 횟수" }) },
    { href: "/tools/farming-optimizer", icon: Map, label: "Best Farm Stage", desc: txt(locale, { zh: "按目标排序当前最佳关卡", en: "Rank the best stage for your goal", ja: "目的別に最適周回先を出す", ko: "목표별 최적 스테이지" }) },
    { href: "/chests", icon: Boxes, label: "Chest by Gear Level", desc: txt(locale, { zh: "按装备等级反查宝箱", en: "Reverse lookup by gear level", ja: "装備レベルから宝箱を探す", ko: "장비 레벨로 상자 찾기" }) },
    { href: "/pets", icon: PawPrint, label: "Pet Unlock Route", desc: txt(locale, { zh: "看目标、击杀数、最佳关卡", en: "Target, kills, best stage", ja: "対象、討伐数、最適場所", ko: "대상, 처치 수, 추천 장소" }) },
    { href: "/runes", icon: Sparkles, label: "Rune Priority", desc: txt(locale, { zh: "按路线规划符文优先级", en: "Plan rune priorities", ja: "ルーン優先度を決める", ko: "룬 우선순위 계획" }) },
    { href: "/market", icon: ShieldAlert, label: "Market Risk", desc: txt(locale, { zh: "判断卖、留、自用或刷", en: "Sell, keep, use, or farm", ja: "売却、保持、使用、周回", ko: "판매, 보관, 사용, 파밍" }) },
  ];
  const targets = [
    { label: "Soulstone", href: "/tools/drop-finder?q=Soulstone" },
    { label: "Bronze Ingot", href: "/tools/drop-finder?q=Bronze%20Ingot" },
    { label: "Kingdom Coin", href: "/tools/drop-finder?q=Kingdom%20Coin" },
    { label: "Hell Golem", href: "/pets" },
    { label: "Giant Fly", href: "/pets" },
    { label: "Bat", href: "/pets" },
    { label: "Normal Monster Box", href: "/chests?q=normal%20monster" },
  ];

  return (
    <PageShell>
      <SeoJsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "TBH: Task Bar Hero Wiki",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/tools/drop-finder?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }} />

      <section className="grid gap-6 border-b border-[#27272a] pb-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d4a017]">
            {txt(locale, { zh: "玩家操作台", en: "Player action hub", ja: "プレイヤー操作ハブ", ko: "플레이어 실행 허브" })}
          </p>
          <h1 className="mt-3 max-w-3xl text-[28px] font-semibold leading-tight text-white sm:text-[38px]">
            TBH: Task Bar Hero Wiki
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-[#9d9d9d] sm:text-[15px]">
            {txt(locale, {
              zh: "搜索目标，查看刷图关卡、掉率、预计次数、宠物路线和市场状态。",
              en: "Search a target for farming stages, drop chance, expected runs, pet routes, and market status.",
              ja: "目標を入力すると、周回先、確率、必要回数、売るか保持かをすぐ確認できます。",
              ko: "목표를 입력하면 파밍 장소, 확률, 예상 횟수, 판매/보관 판단을 바로 봅니다.",
            })}
          </p>
          <form action={localizedPath(locale, "/tools/drop-finder")} className="mt-5 flex max-w-2xl border border-[#3f2f10] bg-[#0d0d0d]">
            <Search className="ml-3 h-4 w-4 shrink-0 self-center text-[#d4a017]" />
            <input
              name="q"
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[14px] text-white outline-none placeholder:text-[#6c6c6c]"
              placeholder={txt(locale, { zh: "搜索 item、material、chest、monster、stage、pet", en: "Search item, material, chest, monster, stage, pet", ja: "item / material / chest / monster / stage / pet", ko: "item / material / chest / monster / stage / pet" })}
            />
            <button className="shrink-0 bg-[#d4a017] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f0c040]">
              {txt(locale, { zh: "搜索", en: "Search", ja: "検索", ko: "검색" })}
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {targets.map((target) => (
              <Link key={target.label} href={localizedPath(locale, target.href)} className="border border-[#27272a] bg-[#0d0d0d] px-3 py-1.5 text-xs text-[#d8d1c2] hover:border-[#d4a017]">
                {target.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="overflow-hidden border border-[#4d281e] bg-[#101010]">
          <Image src="/game/home-hero-overview.png" alt="TaskBar Hero overview" width={786} height={186} priority unoptimized className="h-auto w-full object-cover" data-pixel />
        </div>
      </section>

      <section className="border-b border-[#27272a] py-6">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <Link key={task.href} href={localizedPath(locale, task.href)} className="group border border-[#27272a] bg-[#0d0d0d] p-4 transition hover:border-[#d4a017]/70 hover:bg-[#111]">
                <Icon className="h-5 w-5 text-[#d4a017]" />
                <p className="mt-3 text-[15px] font-semibold text-white group-hover:text-[#f0c040]">{task.label}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#8c8577]">{task.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="py-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <Link key={stat.href} href={localizedPath(locale, stat.href)} className="border border-[#27272a] bg-[#0d0d0d] p-4 text-center hover:border-[#d4a017]">
              <p className="font-mono text-2xl font-semibold text-white">{stat.value.toLocaleString()}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#6c6c6c]">{stat.label}</p>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-[#6c6c6c]">v1 / 2026-06-08</p>
      </section>
    </PageShell>
  );
}
