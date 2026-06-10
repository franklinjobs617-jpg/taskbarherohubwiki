import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Boxes, Map, PawPrint, Search, ShieldAlert, Sparkles, Target } from "lucide-react";
import { HeroCard } from "@/components/tbh/cards";
import { PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { allHeroes, allItems, allRunes, allStages, chestItems, marketRows, SITE_URL, type Locale } from "@/lib/game-data/data";
import { extPets } from "@/lib/game-data/external";
import { localizedPath } from "@/lib/locale-path";

type Props = { params: Promise<{ locale: Locale }> };

function copy(locale: Locale, values: Record<Locale | "en", string>) {
  return values[locale] ?? values.en;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: copy(locale, {
      zh: "TBH Wiki | 掉落查询、最佳刷图、宠物解锁与市场判断",
      en: "TBH Wiki | Drop Finder, Best Farm Stages, Pet Unlocks & Market Risk",
      ja: "TBH Wiki | ドロップ検索、周回、ペット、マーケット",
      ko: "TBH Wiki | 드롭 검색, 파밍, 펫, 시장",
    }),
    description: copy(locale, {
      zh: "搜索物品、材料、宝箱、怪物、关卡和宠物，查看刷图关卡、掉率、预计次数、宠物路线和市场状态。",
      en: "Search items, materials, chests, monsters, stages, and pets for farming stages, rates, expected runs, unlock routes, and market status.",
      ja: "アイテム、素材、宝箱、モンスター、ステージ、ペットを検索し、周回先、確率、必要回数、解放ルート、市場状態を確認。",
      ko: "아이템, 재료, 상자, 몬스터, 스테이지, 펫을 검색하고 파밍 장소, 확률, 예상 횟수, 해금 루트, 시장 상태를 확인합니다.",
    }),
    alternates: {
      canonical: locale === "en" ? "/" : `/${locale}`,
      languages: { en: "/", zh: "/zh", ja: "/ja", ko: "/ko", "x-default": "/" },
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const heroes = allHeroes();
  const stats = [
    { href: "/items", label: copy(locale, { zh: "物品", en: "Items", ja: "アイテム", ko: "아이템" }), value: allItems().length },
    { href: "/chests", label: copy(locale, { zh: "宝箱", en: "Chests", ja: "宝箱", ko: "상자" }), value: chestItems().length },
    { href: "/map", label: copy(locale, { zh: "关卡", en: "Stages", ja: "ステージ", ko: "스테이지" }), value: allStages().length },
    { href: "/pets", label: copy(locale, { zh: "宠物", en: "Pets", ja: "ペット", ko: "펫" }), value: extPets().length },
    { href: "/runes", label: copy(locale, { zh: "符文", en: "Runes", ja: "ルーン", ko: "룬" }), value: allRunes().length },
    { href: "/market", label: copy(locale, { zh: "市场", en: "Market", ja: "市場", ko: "시장" }), value: marketRows().length },
  ];
  const tasks = [
    { href: "/tools/drop-finder", icon: Target, label: "Find Drops", desc: copy(locale, { zh: "最佳关卡、概率、预计次数", en: "Best stage, chance, expected runs", ja: "周回先、確率、必要回数", ko: "추천 장소, 확률, 예상 횟수" }) },
    { href: "/tools/farming-optimizer", icon: Map, label: "Best Farm Stage", desc: copy(locale, { zh: "按目标排序刷图关卡", en: "Rank stages by goal", ja: "目的別に周回先を比較", ko: "목표별 스테이지 비교" }) },
    { href: "/chests", icon: Boxes, label: "Chest by Gear Level", desc: copy(locale, { zh: "按装备等级反查宝箱", en: "Reverse lookup by gear level", ja: "装備レベルで宝箱検索", ko: "장비 레벨로 상자 찾기" }) },
    { href: "/pets", icon: PawPrint, label: "Pet Unlock Route", desc: copy(locale, { zh: "目标、击杀数、最佳关卡", en: "Target, kills, best stage", ja: "対象、討伐数、最適場所", ko: "대상, 처치 수, 추천 장소" }) },
    { href: "/runes", icon: Sparkles, label: "Rune Priority", desc: copy(locale, { zh: "规划符文优先级", en: "Plan rune priorities", ja: "ルーン優先度", ko: "룬 우선순위" }) },
    { href: "/market", icon: ShieldAlert, label: "Market Risk", desc: copy(locale, { zh: "价格、挂单和风险标签", en: "Price, listings, risk labels", ja: "価格、出品数、リスク", ko: "가격, 매물, 위험 라벨" }) },
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
            {copy(locale, { zh: "玩家操作台", en: "Player action hub", ja: "プレイヤーハブ", ko: "플레이어 허브" })}
          </p>
          <h1 className="mt-3 max-w-3xl text-[28px] font-semibold leading-tight text-white sm:text-[38px]">
            TBH: Task Bar Hero Wiki
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-[#9d9d9d] sm:text-[15px]">
            {copy(locale, {
              zh: "搜索目标，查看刷图关卡、掉率、预计次数、宠物路线和市场状态。",
              en: "Search a target for farming stages, drop chance, expected runs, pet routes, and market status.",
              ja: "検索して周回先、確率、必要回数、ペットルート、市場状態を確認。",
              ko: "검색으로 파밍 장소, 확률, 예상 횟수, 펫 루트, 시장 상태를 확인합니다.",
            })}
          </p>
          <form action={localizedPath(locale, "/tools/drop-finder")} className="mt-5 flex max-w-2xl border border-[#3f2f10] bg-[#0d0d0d]">
            <Search className="ml-3 h-4 w-4 shrink-0 self-center text-[#d4a017]" />
            <input
              name="q"
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[14px] text-white outline-none placeholder:text-[#6c6c6c]"
              placeholder={copy(locale, { zh: "搜索 item、material、chest、monster、stage、pet", en: "Search item, material, chest, monster, stage, pet", ja: "item / material / chest / monster / stage / pet", ko: "item / material / chest / monster / stage / pet" })}
            />
            <button className="shrink-0 bg-[#d4a017] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f0c040]">
              {copy(locale, { zh: "搜索", en: "Search", ja: "検索", ko: "검색" })}
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

      <section className="border-b border-[#27272a] py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6c6c6c]">Heroes</p>
            <h2 className="mt-1 text-[22px] font-semibold text-white">
              {copy(locale, { zh: "英雄职业", en: "Hero Classes", ja: "ヒーロークラス", ko: "영웅 클래스" })}
            </h2>
          </div>
          <Link href={localizedPath(locale, "/heroes")} className="text-sm text-[#f0c040] hover:underline">
            {copy(locale, { zh: "全部英雄", en: "All heroes", ja: "全ヒーロー", ko: "전체 영웅" })}
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {heroes.map((hero) => (
            <HeroCard key={hero.HeroKey} hero={hero} locale={locale} />
          ))}
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
