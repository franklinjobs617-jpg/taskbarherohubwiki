import type { Metadata } from "next";
import { Coins, Route, Sparkles, UnlockKeyhole } from "lucide-react";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { RuneTreePlanner, type RuneNode } from "@/components/tbh/rune-tree-planner";
import { type Locale } from "@/lib/game-data/data";
import { extRunes , ensureExtRunes } from "@/lib/game-data/external";
import { pageAlternates } from "@/lib/seo";
import { RelatedPages } from "@/components/tbh/related-pages";
import { HowToUse } from "@/components/tbh/how-to-use";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureExtRunes();

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
  await ensureExtRunes();

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

      <HowToUse pageKey="/runes" locale={locale} />
      <section className="mb-6 border-l-2 border-accent bg-accent-soft px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Quick answer</p>
        <p className="mt-1 text-sm leading-6 text-text-primary">
          {copy(
            locale,
            "先点你卡在哪一关的瓶颈。Rune of Command 解锁英雄槽（首要），离线收益次之，最后金币/经验。新手别散点。",
            "Spend Rune Tree points on the bottleneck you can see right now. Rune of Command (hero slots) first, offline gains second, gold/EXP last. Avoid spreading points early.",
            "まず詰まっている箇所に投資。Command（英雄枠）最優先、放置報酬、その次に金策・経験値。序盤の散点是NG。",
          )}
        </p>
      </section>

      <section className="mb-6 overflow-hidden border border-[#2d281e] bg-[#0d0b08]">
        <div className="grid gap-px bg-[#2d281e] md:grid-cols-4">
          <Metric icon={<Sparkles className="h-4 w-4" />} label={copy(locale, "符文", "Runes", "ルーン")} value={runes.length} />
          <Metric icon={<Route className="h-4 w-4" />} label={copy(locale, "连接", "Links", "接続")} value={edges} />
          <Metric icon={<UnlockKeyhole className="h-4 w-4" />} label={copy(locale, "关键解锁", "Unlocks", "重要解放")} value={unlocks.length} />
          <Metric icon={<Coins className="h-4 w-4" />} label={copy(locale, "全满总成本", "Full cost", "全取得コスト")} value={formatNumber(totalCost)} />
        </div>
      </section>

      <RuneTreePlanner runes={runes} locale={locale} />

      <section className="mt-8 border-t border-border-default pt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">FAQ</p>
        <h2 className="mt-1 text-[18px] font-semibold leading-tight text-white">
          {copy(locale, "符文树常见问题", "Rune Tree FAQ", "ルーンツリー FAQ")}
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            { q: copy(locale, "先点哪个符文？", "Which rune should I unlock first?", "最初に解放すべきルーンは？"), a: copy(locale, "Rune of Command 解锁第二个英雄槽，这是单点收益最大的节点。然后才是离线收益和金币。", "Rune of Command (second hero slot) is the highest single-point ROI. Then offline gains, then gold/EXP.", "Command（2 番目の英雄枠）が単点リターン最大。次いで放置報酬、金策・経験値へ。") },
            { q: copy(locale, "要不要散点？", "Should I spread rune points?", "ルーンツリーは分散投資すべき？"), a: copy(locale, "不要。新手期金币有限，散点每条都不到关键阈值，体感不到收益。先把一条线走到下一阶解锁。", "No. Early gold is limited. Spread points never hit threshold breakpoints. Push one line to the next unlock first.", "序盤は金策が限られるため、分散は閾値に達せず効果体感薄い。1 つのラインを伸ばして次の解放まで進めましょう。") },
            { q: copy(locale, "什么时候改方向？", "When should I change rune direction?", "いつ方向転換すべき？"), a: copy(locale, "当前阶段卡关 30 分钟以上、或已经解锁了所有想要的英雄槽之后，再考虑换线。", "When you've been stuck on a stage for 30+ minutes, or after unlocking all the hero slots you wanted.", "30 分以上同じステージで詰まったら、または欲しい英雄枠を全部解放したら方向転換を考える。") },
            { q: copy(locale, "符文树影响 Build 选择吗？", "Does the Rune Tree affect build choice?", "ルーンツリーはビルド選択に影響する？"), a: copy(locale, "影响。Rune of Command 决定你能上几个英雄，自动化符文决定你能离线刷几关。Build 路线要看符文解锁进度。", "Yes. Rune of Command decides how many heroes you can field; automation runes decide how far you can idle. Build routes depend on rune unlock progress.", "影響あり。Command は出撃可能人数、自動符文は放置周回可能距離を決める。ビルドはルーン解放状況に依存。") },
          ].map((item, i) => (
            <details key={i} className="border border-border-default bg-bg-panel p-3" open={i === 0}>
              <summary className="cursor-pointer text-sm font-semibold text-white hover:text-accent-bright">{item.q}</summary>
              <p className="mt-2 text-xs leading-5 text-text-secondary">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
      <RelatedPages pageKey="/runes" locale={locale} />
    </PageShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-[#0d0b08] p-4">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span className="text-[#c87925]">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
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
