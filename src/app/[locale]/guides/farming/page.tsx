import type { Metadata } from "next";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allMonsters, allStages, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

function monsterPortrait(portrait?: string | null): string | null {
  if (!portrait) return null;
  const parts = portrait.split("/");
  return `/game/monsters/${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh"
      ? "TBH Farming 刷图指南｜最佳金币、经验与材料关卡"
      : "TBH Farming Guide — Best Gold, EXP & Material Stages",
    description: locale === "zh"
      ? "TBH 刷图完整指南：金币 farming 路线、经验 farming 路线、宝箱掉落机制、材料刷取策略。包含 Farming 计算器。"
      : "Complete TBH farming guide: gold routes, EXP routes, chest drop mechanics, material farming strategy. Includes Farming Calculator.",
    alternates: pageAlternates(locale, "/guides/farming"),
  };
}

export default async function FarmingHubPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const stages = allStages();
  const monsters = allMonsters();

  // Top gold stages
  const topGold = [...stages]
    .sort((a, b) => (b.goldPerClear ?? 0) - (a.goldPerClear ?? 0))
    .slice(0, 10);
  const topExp = [...stages]
    .sort((a, b) => (b.expPerClear ?? 0) - (a.expPerClear ?? 0))
    .slice(0, 10);

  return (
    <PageShell>
      <PageHeader
        kicker="Farming Guide"
        title={isZh ? "刷图 Farming 指南" : "Farming Guide"}
        description={
          isZh
            ? "从金币、经验、宝箱和材料四个维度理解 TBH 的刷图系统。包含关卡排行榜和 Farming 计算器。"
            : "Understand TBH's farming system across four dimensions: gold, EXP, chests, and materials. Includes stage rankings and Farming Calculator."
        }
      />

      {/* Hero image */}
      <div className="mb-8 overflow-hidden border border-border-default">
        <SafeImage
          src="/game/screenshots/screenshot-2.jpg"
          alt="TBH Farming"
          width={1200}
          height={400}
          className="w-full object-cover opacity-60"
          priority
          unoptimized
        />
      </div>

      <div className="space-y-8">
        {/* Quick tools */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href={`/${locale}/tools/farming-calculator`} className="group rounded-sm border border-amber-600/40 bg-amber-600/5 p-4 transition-colors hover:border-amber-400">
            <p className="text-sm font-semibold text-amber-400">{isZh ? "🧮 Farming 计算器" : "🧮 Farming Calculator"}</p>
            <p className="mt-1 text-xs text-text-secondary">{isZh ? "找物品掉落、查关卡收益、并排对比，含概率模拟" : "Find item drops, stage profits, comparison, probability sim"}</p>
            <span className="mt-2 inline-block text-[10px] text-amber-400/60 group-hover:text-amber-400 transition-colors">
              {isZh ? "打开工具 →" : "Open tool →"}
            </span>
          </Link>
          <Link href={`/${locale}/guides/farming/gold-farming-route`} className="group rounded-sm border border-border-default bg-bg-panel p-4 transition-colors hover:border-accent-dim">
            <p className="text-sm font-semibold text-white">{isZh ? "💰 金币路线" : "💰 Gold Route"}</p>
            <p className="mt-1 text-xs text-text-secondary">{isZh ? "最赚钱的关卡和策略" : "Most profitable stages and strategy"}</p>
          </Link>
          <Link href={`/${locale}/guides/farming/exp-farming-route`} className="group rounded-sm border border-border-default bg-bg-panel p-4 transition-colors hover:border-accent-dim">
            <p className="text-sm font-semibold text-white">{isZh ? "⭐ 经验路线" : "⭐ EXP Route"}</p>
            <p className="mt-1 text-xs text-text-secondary">{isZh ? "快速升级的最佳关卡" : "Best stages for fast leveling"}</p>
          </Link>
        </div>

        {/* Gold Ranking */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-text-muted">
            {isZh ? "🥇 金币排行榜" : "🥇 Top Gold Stages"}
          </h2>
          <div className="overflow-x-auto border border-border-default">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead className="bg-bg-surface text-text-muted">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">{isZh ? "关卡" : "Stage"}</th>
                  <th className="px-3 py-2">Boss</th>
                  <th className="px-3 py-2">Lv</th>
                  <th className="px-3 py-2">{isZh ? "金币" : "Gold"}</th>
                  <th className="px-3 py-2">EXP</th>
                  <th className="px-3 py-2">{isZh ? "击杀" : "Kills"}</th>
                </tr>
              </thead>
              <tbody>
                {topGold.map((s, i) => {
                  const bossImg = s.boss?.portrait
                    ? monsterPortrait(s.boss.portrait)
                    : null;
                  return (
                    <tr key={s.key} className="border-t border-border-default hover:bg-bg-panel">
                      <td className="px-3 py-2 font-mono text-text-muted">
                        {i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}
                      </td>
                      <td className="px-3 py-2">
                        <Link href={`/${locale}/stages/${s.key}`} className="font-medium text-white hover:text-amber-400">
                          {s.difficulty} A{s.act}-{s.no} {s.name?.["en-US"] ?? ""}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {bossImg ? (
                            <SafeImage src={bossImg} alt="" width={24} height={24} className="rounded-sm object-contain" unoptimized />
                          ) : null}
                          <span className="text-text-secondary">{s.boss?.name?.["en-US"] ?? "-"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono text-text-secondary">{s.level}</td>
                      <td className="px-3 py-2 font-mono font-semibold text-amber-400">{s.goldPerClear?.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono text-emerald-400">{s.expPerClear?.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono text-text-secondary">{s.kills}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* EXP Ranking */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-text-muted">
            {isZh ? "⭐ 经验排行榜" : "⭐ Top EXP Stages"}
          </h2>
          <div className="overflow-x-auto border border-border-default">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead className="bg-bg-surface text-text-muted">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">{isZh ? "关卡" : "Stage"}</th>
                  <th className="px-3 py-2">Boss</th>
                  <th className="px-3 py-2">Lv</th>
                  <th className="px-3 py-2">EXP</th>
                  <th className="px-3 py-2">{isZh ? "金币" : "Gold"}</th>
                  <th className="px-3 py-2">{isZh ? "击杀" : "Kills"}</th>
                </tr>
              </thead>
              <tbody>
                {topExp.map((s, i) => {
                  const bossImg = s.boss?.portrait
                    ? monsterPortrait(s.boss.portrait)
                    : null;
                  return (
                    <tr key={s.key} className="border-t border-border-default hover:bg-bg-panel">
                      <td className="px-3 py-2 font-mono text-text-muted">
                        {i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}
                      </td>
                      <td className="px-3 py-2">
                        <Link href={`/${locale}/stages/${s.key}`} className="font-medium text-white hover:text-amber-400">
                          {s.difficulty} A{s.act}-{s.no} {s.name?.["en-US"] ?? ""}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {bossImg ? (
                            <SafeImage src={bossImg} alt="" width={24} height={24} className="rounded-sm object-contain" unoptimized />
                          ) : null}
                          <span className="text-text-secondary">{s.boss?.name?.["en-US"] ?? "-"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono text-text-secondary">{s.level}</td>
                      <td className="px-3 py-2 font-mono font-semibold text-emerald-400">{s.expPerClear?.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono text-amber-400">{s.goldPerClear?.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono text-text-secondary">{s.kills}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom links */}
        <section className="grid gap-2 border-t border-border-default pt-6 sm:grid-cols-2">
          <Link href={`/${locale}/guides/farming/chest-drop-guide`} className="group rounded-sm border border-border-default bg-bg-panel p-3 text-xs transition-colors hover:border-accent-dim">
            <p className="font-medium text-white group-hover:text-amber-400 transition-colors">{isZh ? "宝箱掉落指南" : "Chest Drop Guide"}</p>
            <p className="mt-1 text-text-muted">{isZh ? "宝箱类型、掉落机制和如何判断刷取目标" : "Chest types, drop mechanics, and how to choose farming targets"}</p>
          </Link>
          <Link href={`/${locale}/guides/economy/steam-market-guide`} className="group rounded-sm border border-border-default bg-bg-panel p-3 text-xs transition-colors hover:border-accent-dim">
            <p className="font-medium text-white group-hover:text-amber-400 transition-colors">{isZh ? "Steam 市场指南" : "Steam Market Guide"}</p>
            <p className="mt-1 text-text-muted">{isZh ? "如何判断物品是否值得卖" : "How to decide if an item is worth selling"}</p>
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
