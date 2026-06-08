import type { Metadata } from "next";
import { Coins, Route, Sparkles, UnlockKeyhole } from "lucide-react";
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
