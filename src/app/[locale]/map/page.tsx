import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { StageMap } from "@/components/tbh/stage-map";
import { type Locale } from "@/lib/game-data/data";
import { stageExplorerData } from "@/lib/game-data/graph";
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
    title: t(locale, "TBH 关卡工作台 - 怪物、掉落与刷图路线", "TBH Stage Console - Monsters, Drops & Farming Routes", "TBH ステージコンソール"),
    description: t(
      locale,
      "左侧选择关卡，右侧即时查看怪物、Boss、箱子掉落、箱子内容和刷图收益。",
      "Select a stage on the left and inspect monsters, bosses, chest drops, chest contents, and farming returns on the right.",
      "左でステージを選び、右で敵、ボス、ドロップ、周回効率を確認できます。",
    ),
    alternates: pageAlternates(locale, "/map"),
  };
}

export default async function MapPage({ params }: Props) {
  const { locale } = await params;
  const stages = stageExplorerData();

  return (
    <PageShell>
      <PageHeader
        kicker="Stage Console"
        title={t(locale, "关卡工作台", "Stage Console", "ステージコンソール")}
        description={t(
          locale,
          "左侧点关卡，右侧立刻显示该关的怪物、Boss、掉落箱、箱子内容和收益计算。用户不用再在多个页面之间跳来跳去。",
          "Click a stage on the left; the right panel updates with monsters, bosses, chest drops, chest contents, and farming math.",
          "左でステージを選択すると、右側に敵、ボス、ドロップ、報酬計算がまとまって表示されます。",
        )}
      />
      <StageMap locale={locale} stages={stages} />
    </PageShell>
  );
}
