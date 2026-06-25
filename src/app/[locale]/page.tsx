import type { Metadata } from "next";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { Boxes, Map, PawPrint, Search, ShieldAlert, Sparkles, Target } from "lucide-react";
import { HeroCard } from "@/components/tbh/cards";
import { PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { allHeroes, allItems, allRunes, allStages, chestItems, marketRows, SITE_URL, type Locale , ensureItems, ensureHeroes, ensureStages, ensureRunes, ensureMarket } from "@/lib/game-data/data";
import { extPets , ensureExtPets } from "@/lib/game-data/external";
import { localizedPath } from "@/lib/locale-path";

type Props = { params: Promise<{ locale: Locale }> };

function copy(locale: Locale, values: Record<Locale | "en", string>) {
  return values[locale] ?? values.en;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureItems();
  await ensureHeroes();
  await ensureStages();
  await ensureRunes();
  await ensureMarket();
  await ensureExtPets();

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
  await ensureItems();
  await ensureHeroes();
  await ensureStages();
  await ensureRunes();
  await ensureMarket();
  await ensureExtPets();

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
    { label: "Anniversary Coin", href: "/tools/drop-finder?q=Anniversary%20Coin" },
    { label: "Bronze Ingot", href: "/tools/drop-finder?q=Bronze%20Ingot" },
    { label: "Kingdom Coin", href: "/tools/drop-finder?q=Kingdom%20Coin" },
    { label: "Blue Golem", href: "/monsters" },
    { label: "Hell Golem", href: "/pets" },
    { label: "Giant Fly", href: "/pets" },
    { label: "Bat", href: "/pets" },
    { label: "Stage Boss Box 6", href: "/tools/drop-finder?q=Stage%20Boss%20Box%206" },
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

      {/* Hero Section */}
      <section className="grid gap-6 border-b-2 border-border-default pb-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div className="animate-fade-in-up">
          <p className="section-eyebrow">
            {copy(locale, { zh: "玩家操作台", en: "Player action hub", ja: "プレイヤーハブ", ko: "플레이어 허브" })}
          </p>
          <h1 className="mt-3 max-w-3xl font-pixel text-heading-xl font-bold leading-tight text-text-primary sm:text-[42px]">
            TBH: Task Bar Hero Wiki
          </h1>
          <p className="mt-3 max-w-2xl text-body-lg leading-relaxed text-text-secondary">
            {copy(locale, {
              zh: "5,944 装备与材料、6 职业、197 符文、120 关卡、61 怪物，4 语种。全部数据直接来自游戏文件挖掘，可查可验证。",
              en: "5,944 items, 6 classes, 197 runes, 120 stages, 61 monsters in 4 languages. Every number is datamined and verifiable.",
              ja: "5,944 アイテム、6 職業、197 ルーン、120 ステージ、61 モンスター、4 言語。ゲームファイルから直接抽出。",
              ko: "5,944 아이템, 6 직업, 197 룬, 120 스테이지, 61 몬스터, 4 개 언어. 전부 게임 파일에서 직접 추출.",
            })}
          </p>

          {/* Quick Stats */}
          <div className="mt-5 grid max-w-2xl grid-cols-2 gap-0 border-2 border-border-default bg-bg-panel sm:grid-cols-4">
            {[
              { v: "5,944", l: copy(locale, { zh: "装备/材料/宝箱", en: "items", ja: "アイテム", ko: "아이템" }), href: "/items" },
              { v: "6", l: copy(locale, { zh: "可玩职业", en: "hero classes", ja: "ヒーロー", ko: "직업" }), href: "/heroes" },
              { v: "120", l: copy(locale, { zh: "关卡", en: "stages", ja: "ステージ", ko: "스테이지" }), href: "/map" },
              { v: "197", l: copy(locale, { zh: "符文节点", en: "runes", ja: "ルーン", ko: "룬" }), href: "/runes" },
            ].map((s) => (
              <Link key={s.l} href={localizedPath(locale, s.href)} className="px-3 py-4 text-center hover:bg-bg-surface transition-colors border-r-2 border-border-default last:border-r-0">
                <p className="font-pixel text-heading font-semibold text-accent">{s.v}</p>
                <p className="mt-1 text-caption font-mono uppercase tracking-[0.1em] text-text-muted">{s.l}</p>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={localizedPath(locale, "/items")} className="btn btn-primary">
              <Boxes className="h-4 w-4" />
              {copy(locale, { zh: "浏览装备", en: "Browse gear", ja: "装備を見る", ko: "장비 보기" })}
            </Link>
            <Link href={localizedPath(locale, "/map")} className="btn">
              <Map className="h-4 w-4" />
              {copy(locale, { zh: "关卡地图", en: "Stage Map", ja: "ポータル", ko: "포털" })}
            </Link>
          </div>

          {/* Search Bar */}
          <form action={localizedPath(locale, "/tools/drop-finder")} className="search-glass mt-5 flex max-w-2xl">
            <Search className="ml-4 h-4 w-4 shrink-0 self-center text-accent" />
            <input
              name="q"
              className="search-glass-input"
              placeholder={copy(locale, { zh: "搜索 item、material、chest、monster、stage、pet", en: "Search item, material, chest, monster, stage, pet", ja: "item / material / chest / monster / stage / pet", ko: "item / material / chest / monster / stage / pet" })}
            />
            <button className="btn-primary shrink-0 m-1.5">
              {copy(locale, { zh: "搜索", en: "Search", ja: "検索", ko: "검색" })}
            </button>
          </form>

          {/* Quick Links */}
          <div className="mt-4 flex flex-wrap gap-2">
            {targets.map((target) => (
              <Link key={target.label} href={localizedPath(locale, target.href)} className="chip hover:border-accent-dim hover:text-text-primary transition-colors">
                {target.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Hero Image */}
        <div className="panel-gold overflow-hidden">
          <SafeImage src="/game/home-hero-overview.png" alt="TaskBar Hero overview" width={786} height={186} priority unoptimized className="h-auto w-full object-cover" data-pixel />
        </div>
      </section>

      {/* Task Cards */}
      <section className="border-b-2 border-border-default py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <Link key={task.href} href={localizedPath(locale, task.href)} className="card card-interactive p-5">
                <Icon className="h-5 w-5 text-accent" />
                <p className="mt-3 font-pixel text-ui-lg font-semibold text-text-primary group-hover:text-accent">{task.label}</p>
                <p className="mt-1.5 text-body-sm leading-5 text-text-secondary">{task.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Hero Classes */}
      <section className="border-b-2 border-border-default py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="section-eyebrow">Heroes</p>
            <h2 className="section-title mt-1">
              {copy(locale, { zh: "英雄职业", en: "Hero Classes", ja: "ヒーロークラス", ko: "영웅 클래스" })}
            </h2>
          </div>
          <Link href={localizedPath(locale, "/heroes")} className="text-body text-accent hover:text-accent-bright font-pixel transition-colors">
            {copy(locale, { zh: "全部英雄 →", en: "All heroes →", ja: "全ヒーロー →", ko: "전체 영웅 →" })}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 stagger-children">
          {heroes.map((hero) => (
            <HeroCard key={hero.HeroKey} hero={hero} locale={locale} />
          ))}
        </div>
      </section>

      {/* Stats Footer */}
      <section className="py-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 stagger-children">
          {stats.map((stat) => (
            <Link key={stat.href} href={localizedPath(locale, stat.href)} className="stat-tile text-center hover:border-accent-dim transition-colors">
              <p className="stat-value">{stat.value.toLocaleString()}</p>
              <p className="stat-label">{stat.label}</p>
            </Link>
          ))}
        </div>
        <p className="mt-5 text-center text-caption font-mono text-text-muted">v1 / 2026-06-08 · Datamined daily · 4 languages</p>
      </section>
    </PageShell>
  );
}
