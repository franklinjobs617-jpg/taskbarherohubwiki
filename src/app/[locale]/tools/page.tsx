import type { Metadata } from "next";
import Link from "next/link";
import {
  Calculator,
  Search,
  BarChart3,
  LineChart,
  DollarSign,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { type Locale } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

const TOOLS = [
  {
    slug: "drop-finder",
    icon: Search,
    title: { en: "Drop Finder", zh: "掉落查询", ja: "ドロップ検索", ko: "드롭 찾기" },
    desc: {
      en: "Reverse-lookup any item or chest to find the best stage, expected runs, and drop chance.",
      zh: "反向查询任意物品或宝箱，找到最佳关卡、预计次数和掉落概率。",
      ja: "アイテムや宝箱を逆引きし、最適ステージ・予想回数・ドロップ率を確認。",
      ko: "아이템이나 상자를 역검색하여 최적 스테이지, 예상 횟수, 드롭 확률을 확인하세요.",
    },
  },
  {
    slug: "farming-calculator",
    icon: Calculator,
    title: { en: "Farming Calculator", zh: "刷图计算器", ja: "周回計算機", ko: "파밍 계산기" },
    desc: {
      en: "Calculate expected gold and EXP per run and per hour for any stage and difficulty.",
      zh: "计算任意关卡和难度下每轮、每小时的金币和经验预期。",
      ja: "任意のステージと難易度で、1周・1時間あたりのゴールドとEXPを計算。",
      ko: "모든 스테이지와 난이도에서 회당/시간당 골드 및 경험치 기대값을 계산합니다.",
    },
  },
  {
    slug: "farming-compare",
    icon: BarChart3,
    title: { en: "Farming Compare", zh: "刷图对比", ja: "周回比較", ko: "파밍 비교" },
    desc: {
      en: "Compare farming efficiency side-by-side across multiple stages and difficulties.",
      zh: "并排对比多个关卡和难度的刷图效率。",
      ja: "複数ステージ・難易度の周回効率を並べて比較。",
      ko: "여러 스테이지와 난이도의 파밍 효율을 나란히 비교하세요.",
    },
  },
  {
    slug: "farming-optimizer",
    icon: LineChart,
    title: { en: "Farming Optimizer", zh: "最优刷图方案", ja: "周回最適化", ko: "파밍 최적화" },
    desc: {
      en: "Find the optimal farming stage for your goal — gold, EXP, materials, or chest drops.",
      zh: "根据你的目标（金币、经验、材料或宝箱掉落）找到最优刷图关卡。",
      ja: "ゴールド・EXP・素材・宝箱ドロップの目的別に最適な周回ステージを検索。",
      ko: "목표(골드, 경험치, 재료, 상자 드롭)에 맞는 최적의 파밍 스테이지를 찾으세요.",
    },
  },
  {
    slug: "profit-calculator",
    icon: DollarSign,
    title: { en: "Profit Calculator", zh: "收益计算器", ja: "利益計算機", ko: "수익 계산기" },
    desc: {
      en: "Calculate net profit from farming drops + Steam Market sales, factoring in fees.",
      zh: "综合刷图掉落和 Steam 市场售价，扣除手续费后计算净收益。",
      ja: "周回ドロップとSteam市場価格から手数料を差し引いた純利益を計算。",
      ko: "파밍 드롭 + Steam 마켓 판매 수익에서 수수료를 제외한 순수익을 계산합니다.",
    },
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "zh"
        ? "TBH 工具中心 | 掉落查询、刷图计算器、收益对比"
        : locale === "ja"
          ? "TBH ツール | ドロップ検索、周回計算機、利益比較"
          : locale === "ko"
            ? "TBH 도구 | 드롭 찾기, 파밍 계산기, 수익 비교"
            : "TBH Tools Hub | Drop Finder, Farming Calculator, Profit Compare",
    description:
      locale === "zh"
        ? "TBH 全套工具：掉落查询、刷图计算器、收益对比、最优刷图方案和利润计算器。"
        : locale === "ja"
          ? "TBH全ツール：ドロップ検索、周回計算機、効率比較、最適化、利益計算機。"
          : locale === "ko"
            ? "TBH 모든 도구: 드롭 찾기, 파밍 계산기, 효율 비교, 최적화, 수익 계산기."
            : "Complete TBH tools suite: drop finder, farming calculator, efficiency compare, optimizer, and profit calculator.",
    alternates: pageAlternates(locale, "/tools"),
  };
}

function txt(locale: Locale, values: Record<string, string>) {
  return values[locale] ?? values.en ?? "";
}

export default async function ToolsPage({ params }: Props) {
  const { locale } = await params;

  return (
    <PageShell>
      <PageHeader
        kicker="Tools"
        title={
          locale === "zh"
            ? "工具中心"
            : locale === "ja"
              ? "ツール"
              : locale === "ko"
                ? "도구"
                : "Tools Hub"
        }
        description={
          locale === "zh"
            ? "TBH 全套交互工具：掉落反向查询、刷图效率计算、多关卡对比、最优方案推荐和 Steam 市场利润计算。所有工具基于数据挖掘数据，结果实时计算。"
            : locale === "ja"
              ? "TBHの全インタラクティブツール：ドロップ逆引き、周回効率計算、マルチステージ比較、最適化、Steam市場利益計算。すべてデータ抽出に基づき、結果はリアルタイム計算。"
              : locale === "ko"
                ? "TBH의 모든 대화형 도구: 드롭 역검색, 파밍 효율 계산, 다중 스테이지 비교, 최적화, Steam 마켓 수익 계산. 모든 데이터는 데이터마이닝 기반이며 실시간으로 계산됩니다."
                : "Complete interactive TBH tools: reverse drop lookup, farming efficiency calc, multi-stage compare, optimizer, and Steam Market profit calc. All data is datamined and results are computed in real-time."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.slug}
              href={localizedPath(locale, `/tools/${tool.slug}`)}
              className="group border-2 border-border-default bg-bg-panel p-5 transition-all hover:border-accent hover:bg-bg-surface"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center border-2 border-border-strong bg-bg-surface text-accent transition-colors group-hover:border-accent group-hover:bg-accent-soft">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-text-primary transition-colors group-hover:text-accent-bright">
                {txt(locale, tool.title)}
              </h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                {txt(locale, tool.desc)}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 border border-border-default bg-bg-panel p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          {locale === "zh" ? "关于工具" : locale === "ja" ? "ツールについて" : locale === "ko" ? "도구 정보" : "About tools"}
        </p>
        <p className="mt-2 text-sm leading-7 text-text-secondary">
          {locale === "zh"
            ? "所有工具均基于数据挖掘的游戏数据运行，结果仅供参考。掉落概率为多次采样的统计值，实际结果可能因 RNG 不同。市场价格每 15 分钟更新一次，但可能因 Steam 服务延迟而略有偏差。"
            : locale === "ja"
              ? "すべてのツールはデータ抽出されたゲームデータに基づいて動作します。結果は参考値です。ドロップ確率は複数サンプルの統計値であり、実際の結果はRNGにより異なる場合があります。市場価格は15分ごとに更新されますが、Steamサービスの遅延により若干のずれが生じる可能性があります。"
              : locale === "ko"
                ? "모든 도구는 데이터마이닝된 게임 데이터를 기반으로 작동합니다. 결과는 참고용입니다. 드롭 확률은 여러 샘플의 통계값이며 실제 결과는 RNG에 따라 다를 수 있습니다. 마켓 가격은 15분마다 업데이트되지만 Steam 서비스 지연으로 약간의 차이가 있을 수 있습니다."
                : "All tools run on datamined game data. Results are for reference only. Drop chances are statistical values from multiple samples — actual outcomes may vary by RNG. Market prices refresh every 15 minutes but may lag slightly due to Steam service delays."
          }
        </p>
      </div>
    </PageShell>
  );
}
