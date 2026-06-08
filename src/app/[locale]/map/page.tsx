import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { StageMap } from "@/components/tbh/stage-map";
import { type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

function t(locale: Locale, zh: string, en: string, ja: string) {
  if (locale === "zh") return zh;
  if (locale === "ja") return ja;
  return en;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t(locale, "TBH 关卡地图｜Boss、怪物与刷图路线", "TBH Stage Map — Bosses, Monsters & Farming Routes", "TBH ステージマップ｜ボス、モンスター、周回ルート"),
    description: t(
      locale,
      "按难度和 Act 浏览全部 120 个关卡。点击查看 Boss 头像、怪物分布、金币、经验和掉落。",
      "Browse all 120 stages by difficulty and Act. Click to see boss portraits, monsters, gold, EXP, and drops.",
      "120ステージを難易度とAct別に表示。クリックでボス画像、モンスター、ゴールド、経験値、ドロップを確認。",
    ),
    alternates: pageAlternates(locale, "/map"),
  };
}

export default async function MapPage({ params }: Props) {
  const { locale } = await params;
  return (
    <PageShell>
      <PageHeader
        kicker="Stage Map"
        title={t(locale, "关卡地图", "Stage Map", "ステージマップ")}
        description={t(
          locale,
          "选择难度标签，按 Act 浏览关卡。每个关卡显示 Boss 头像、金币和经验。点击进入详情页查看掉落和怪物分布。",
          "Select a difficulty tab, browse stages by Act. Each stage shows boss portrait, gold, and EXP. Click for drops and monster details.",
          "難易度タブを選び、Act別にステージを表示。ボス画像、ゴールド、経験値を確認。クリックでドロップとモンスター詳細。",
        )}
      />
      <StageMap locale={locale} />
    </PageShell>
  );
}
