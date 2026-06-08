import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Coins, Route, ShieldCheck, Sparkles, UnlockKeyhole } from "lucide-react";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { RuneTreePlanner, type RuneNode } from "@/components/tbh/rune-tree-planner";
import { type Locale } from "@/lib/game-data/data";
import { extRunes } from "@/lib/game-data/external";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: copy(
      locale,
      "TaskBar Hero 符文树加点｜Rune of Growth、英雄槽与自动开箱",
      "TaskBar Hero Rune Tree Planner | Growth, Hero Slots & Auto-Open",
      "TaskBar Hero ルーンツリー｜Growth、英雄枠、自動開封",
    ),
    description: copy(
      locale,
      "用可视化符文树查看 197 个符文、连接路线、每级成本、推荐加点顺序和关键解锁节点。",
      "Use a visual rune tree to inspect 197 runes, links, level costs, recommended priorities, and key unlock nodes.",
      "197個のルーン、接続、レベルコスト、推奨順、重要解放ノードを可視化します。",
    ),
    alternates: pageAlternates(locale, "/runes"),
  };
}

export default async function RunesPage({ params }: Props) {
  const { locale } = await params;
  const runes = extRunes() as RuneNode[];
  const categories = Array.from(new Set(runes.map((rune) => rune.category || "Other")));
  const unlocks = runes.filter((rune) => rune.isUnlock);
  const totalCost = runes.reduce((sum, rune) => sum + rune.totalCost, 0);
  const edges = runes.reduce((sum, rune) => sum + rune.next.length, 0);

  return (
    <PageShell>
      <PageHeader
        kicker="Rune planner"
        title={copy(locale, "符文树加点", "Rune Tree Planner", "ルーンツリー")}
        description={copy(
          locale,
          "按游戏内坐标还原的符文树，含推荐加点路线：Growth、Command、离线收益、自动开箱、金币、经验。",
          "Rune tree rebuilt from in-game coordinates, with recommended routes for Growth, Command, offline gains, auto-open, gold, and EXP.",
          "ゲーム内座標から再現したルーンツリー。Growth、Command、放置報酬、自動開封、金策、経験値の推奨ルート付き。",
        )}
      />

      <section className="mb-6 overflow-hidden border border-[#2d281e] bg-[#0d0b08]">
        <div className="grid gap-px bg-[#2d281e] md:grid-cols-4">
          <Metric icon={<Sparkles className="h-4 w-4" />} label={copy(locale, "符文", "Runes", "ルーン")} value={runes.length} />
          <Metric icon={<Route className="h-4 w-4" />} label={copy(locale, "连接", "Links", "接続")} value={edges} />
          <Metric icon={<UnlockKeyhole className="h-4 w-4" />} label={copy(locale, "关键解锁", "Unlocks", "重要解放")} value={unlocks.length} />
          <Metric icon={<Coins className="h-4 w-4" />} label={copy(locale, "全满总成本", "Full cost", "全取得コスト")} value={formatNumber(totalCost)} />
        </div>
      </section>

      <section className="mb-6 grid gap-3 lg:grid-cols-[1fr_360px]">
        <div className="border border-[#2d281e] bg-[#0d0b08] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c87925]">{copy(locale, "调研结论", "Research verdict", "調査結論")}</p>
          <h2 className="mt-2 text-xl font-semibold text-[#fff7df]">
            {copy(locale, "数据库足够做符文树，但不能只做列表", "The database can support a real tree, not just a list", "データは一覧ではなくツリー表示に十分")}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#d8c7a6]">
            {copy(
              locale,
              "Google Trends 里 rune、runes、rune tree 都在上涨，说明用户想要的是加点顺序。现有数据包含坐标、后续节点、前置等级、每级消耗和总消耗，已经能支撑类似 DNF 技能树的展示。",
              "Google Trends shows rising demand for rune, runes, and rune tree. Users want priority order, not a spreadsheet. The data already contains coordinates, outgoing links, required levels, per-level costs, and total costs, enough for a DNF-like skill tree.",
              "Google Trends では rune、runes、rune tree が上昇しています。ユーザーが欲しいのは表ではなく優先順です。既存データには座標、接続、前提レベル、各レベルコスト、総コストがあり、DNF風ツリー表示に十分です。",
            )}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category} className="border border-[#342a1a] bg-[#11100d] px-2.5 py-1 text-xs text-[#d8c7a6]">
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="border border-[#3a2a16] bg-[#171006] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#f0c040]" />
            <div>
              <p className="font-semibold text-[#fff7df]">{copy(locale, "加点口径", "Planning rule", "優先ルール")}</p>
              <p className="mt-2 text-sm leading-6 text-[#d8c7a6]">
                {copy(
                  locale,
                  "卡关时优先英雄/防御节点，稳定清图后补收益、宝箱和自动化。",
                  "If stuck, prioritize hero/defense nodes first. After stable clears, add income, chests, and automation.",
                  "詰まる時は英雄/防御ノードを優先。安定後に報酬、宝箱、自動化を追加。",
                )}
              </p>
              <Link href={`/${locale}/guides/beginner/getting-started`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#f0c040] hover:text-[#ffd76a]">
                {copy(locale, "查看新手路线", "Open beginner route", "初心者ルートを見る")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RuneTreePlanner runes={runes} locale={locale} />
    </PageShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-[#0d0b08] p-4">
      <div className="flex items-center gap-2 text-xs text-[#8f826b]">
        <span className="text-[#c87925]">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[#fff7df]">{value}</p>
    </div>
  );
}

function copy(locale: Locale, zh: string, en: string, ja: string) {
  if (locale === "zh") return zh;
  if (locale === "ja") return ja;
  return en;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 100000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}
