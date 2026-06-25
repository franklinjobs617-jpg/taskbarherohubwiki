import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Boxes,
  Database,
  Map,
  PawPrint,
  Shield,
  Skull,
  Swords,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allHeroes, allItems, allMonsters, allStages, chestItems, type Locale , ensureItems, ensureHeroes, ensureStages, ensureMonsters } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

const SECTIONS = [
  { href: "/items", icon: Database, title: { en: "Items", zh: "物品", ja: "アイテム", ko: "아이템" }, desc: { en: "5,944 gear items, materials, and stage boxes", zh: "5,944 件装备、材料和关卡宝箱", ja: "5,944の装備、素材、ステージボックス", ko: "5,944개의 장비, 재료, 스테이지 상자" } },
  { href: "/heroes", icon: Swords, title: { en: "Heroes", zh: "英雄", ja: "ヒーロー", ko: "영웅" }, desc: { en: "6 playable classes with base stats and skills", zh: "6 个可玩职业，含基础属性和技能", ja: "6つのプレイアブルクラス、基礎ステータスとスキル", ko: "6개의 플레이 가능 클래스, 기본 스탯과 스킬" } },
  { href: "/monsters", icon: Skull, title: { en: "Monsters", zh: "怪物", ja: "モンスター", ko: "몬스터" }, desc: { en: "61 monsters with stats, drops, and stage spawns", zh: "61 种怪物，含属性、掉落和出现关卡", ja: "61体のモンスター、ステータス、ドロップ、出現ステージ", ko: "61종의 몬스터, 스탯, 드롭, 스테이지 출현" } },
  { href: "/chests", icon: Boxes, title: { en: "Chests", zh: "宝箱", ja: "宝箱", ko: "상자" }, desc: { en: "59 stage chests with contents and drop sources", zh: "59 种关卡宝箱，含内容物和掉落来源", ja: "59種類のステージ宝箱、内容物とドロップソース", ko: "59종의 스테이지 상자, 내용물과 드롭 출처" } },
  { href: "/stages", icon: Map, title: { en: "Stages", zh: "关卡", ja: "ステージ", ko: "스테이지" }, desc: { en: "120 stages across 4 difficulties with rewards and monsters", zh: "120 个关卡，4 种难度，含奖励和怪物", ja: "120ステージ、4難易度、報酬とモンスター", ko: "120개 스테이지, 4가지 난이도, 보상과 몬스터" } },
  { href: "/runes", icon: Shield, title: { en: "Runes", zh: "符文", ja: "ルーン", ko: "룬" }, desc: { en: "197 runes with tree layout and upgrade costs", zh: "197 个符文，含树状布局和升级花费", ja: "197ルーン、ツリーレイアウトとアップグレードコスト", ko: "197개 룬, 트리 레이아웃과 업그레이드 비용" } },
  { href: "/skills", icon: Swords, title: { en: "Skills", zh: "技能", ja: "スキル", ko: "스킬" }, desc: { en: "106 active and passive skills with level scaling", zh: "106 个主动和被动技能，含等级缩放", ja: "106のアクティブ/パッシブスキル、レベルスケーリング", ko: "106개의 액티브/패시브 스킬, 레벨 스케일링" } },
  { href: "/pets", icon: PawPrint, title: { en: "Pets", zh: "宠物", ja: "ペット", ko: "펫" }, desc: { en: "8 pets with unlock conditions and bonuses", zh: "8 种宠物，含解锁条件和加成", ja: "8匹のペット、アンロック条件とボーナス", ko: "8마리 펫, 해금 조건과 보너스" } },
  { href: "/market", icon: BarChart3, title: { en: "Market", zh: "市场", ja: "マーケット", ko: "마켓" }, desc: { en: "Steam Market price tracking for tradable items", zh: "可交易物品的 Steam 市场价格追踪", ja: "取引可能アイテムのSteam市場価格追跡", ko: "거래 가능 아이템의 Steam 마켓 가격 추적" } },
];

function txt(locale: Locale, values: Record<string, string>) {
  return values[locale] ?? values.en ?? "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureItems();
  await ensureHeroes();
  await ensureStages();
  await ensureMonsters();

  const { locale } = await params;
  return {
    title:
      locale === "zh"
        ? "TBH 数据库 | 物品、英雄、怪物、关卡数据"
        : locale === "ja"
          ? "TBH データベース | アイテム、ヒーロー、モンスター、ステージ"
          : "TBH Database | Items, Heroes, Monsters, Stages",
    description:
      locale === "zh"
        ? "查询 TBH 所有实体数据：5,944 件物品、6 个英雄、61 种怪物、120 个关卡、197 个符文。支持筛选、搜索和对比。"
        : locale === "ja"
          ? "TBHの全エンティティデータを検索：5,944アイテム、6ヒーロー、61モンスター、120ステージ、197ルーン。フィルター、検索、比較対応。"
          : "Search every TBH entity: 5,944 items, 6 heroes, 61 monsters, 120 stages, 197 runes. Filter, search, and compare.",
    alternates: pageAlternates(locale, "/database"),
  };
}

export default async function DatabaseHubPage({ params }: Props) {
  await ensureItems();
  await ensureHeroes();
  await ensureStages();
  await ensureMonsters();

  const { locale } = await params;
  const itemCount = allItems().length;
  const heroCount = allHeroes().length;
  const monsterCount = allMonsters().length;
  const stageCount = allStages().length;
  const chestCount = chestItems().length;

  return (
    <PageShell>
      <PageHeader
        kicker="Database"
        title={txt(locale, { en: "Database Hub", zh: "数据库中心", ja: "データベース", ko: "데이터베이스" })}
        description={
          locale === "zh"
            ? `搜索 TBH 全部游戏实体。当前收录 ${itemCount} 件物品、${heroCount} 个英雄、${monsterCount} 种怪物、${stageCount} 个关卡、${chestCount} 种宝箱。`
            : locale === "ja"
              ? `TBHの全ゲームエンティティを検索。現在${itemCount}アイテム、${heroCount}ヒーロー、${monsterCount}モンスター、${stageCount}ステージ、${chestCount}宝箱を収録。`
              : `Search every TBH game entity. Currently tracking ${itemCount} items, ${heroCount} heroes, ${monsterCount} monsters, ${stageCount} stages, and ${chestCount} chests.`
        }
      />

      {/* Stats bar */}
      <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {[
          { label: { en: "Items", zh: "物品", ja: "アイテム" }, count: itemCount },
          { label: { en: "Heroes", zh: "英雄", ja: "ヒーロー" }, count: heroCount },
          { label: { en: "Monsters", zh: "怪物", ja: "モンスター" }, count: monsterCount },
          { label: { en: "Stages", zh: "关卡", ja: "ステージ" }, count: stageCount },
          { label: { en: "Chests", zh: "宝箱", ja: "宝箱" }, count: chestCount },
        ].map((stat) => (
          <div
            key={stat.label.en}
            className="border border-border-default bg-bg-panel p-3 text-center"
          >
            <p className="text-2xl font-bold text-accent-bright">
              {stat.count >= 1000
                ? `${(stat.count / 1000).toFixed(1)}k`
                : stat.count}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {txt(locale, stat.label)}
            </p>
          </div>
        ))}
      </div>

      {/* Section grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={localizedPath(locale, section.href)}
              className="group flex items-start gap-3 border border-border-default bg-bg-panel p-4 transition hover:border-accent hover:bg-bg-surface"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border-strong bg-bg-surface text-text-secondary transition-colors group-hover:border-accent group-hover:text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-primary transition-colors group-hover:text-accent-bright">
                  {txt(locale, section.title)}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {txt(locale, section.desc)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
