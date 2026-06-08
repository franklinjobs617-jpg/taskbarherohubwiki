import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allStages, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

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

  // Top gold stages
  const topGold = [...stages]
    .sort((a, b) => (b.goldPerClear ?? 0) - (a.goldPerClear ?? 0))
    .slice(0, 8);

  // Top EXP stages
  const topExp = [...stages]
    .sort((a, b) => (b.expPerClear ?? 0) - (a.expPerClear ?? 0))
    .slice(0, 8);

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

      <div className="space-y-8">
        {/* Quick tools */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href={`/${locale}/tools/farming-calculator`} className="rounded-sm border border-amber-600/40 bg-amber-600/5 p-4 transition-colors hover:border-amber-400">
            <p className="text-sm font-semibold text-amber-400">{isZh ? "🧮 Farming 计算器" : "🧮 Farming Calculator"}</p>
            <p className="mt-1 text-xs text-[#9d9d9d]">{isZh ? "找物品掉落、查关卡收益、并排对比" : "Find item drops, stage profits, side-by-side comparison"}</p>
          </Link>
          <Link href={`/${locale}/guides/farming/gold-farming-route`} className="rounded-sm border border-[#27272a] bg-[#0d0d0d] p-4 transition-colors hover:border-amber-600/30">
            <p className="text-sm font-semibold text-white">{isZh ? "💰 金币路线" : "💰 Gold Route"}</p>
            <p className="mt-1 text-xs text-[#9d9d9d]">{isZh ? "最赚钱的关卡和策略" : "Most profitable stages and strategy"}</p>
          </Link>
          <Link href={`/${locale}/guides/farming/exp-farming-route`} className="rounded-sm border border-[#27272a] bg-[#0d0d0d] p-4 transition-colors hover:border-amber-600/30">
            <p className="text-sm font-semibold text-white">{isZh ? "⭐ 经验路线" : "⭐ EXP Route"}</p>
            <p className="mt-1 text-xs text-[#9d9d9d]">{isZh ? "快速升级的最佳关卡" : "Best stages for fast leveling"}</p>
          </Link>
        </div>

        {/* Gold Ranking */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-[#6c6c6c]">
            {isZh ? "🥇 金币排行榜" : "🥇 Top Gold Stages"}
          </h2>
          <div className="overflow-x-auto border border-[#27272a]">
            <table className="w-full min-w-[500px] text-left text-xs">
              <thead className="bg-[#18181b] text-[#6c6c6c]">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">{isZh ? "关卡" : "Stage"}</th>
                  <th className="px-3 py-2">{isZh ? "难度" : "Diff"}</th>
                  <th className="px-3 py-2">Lv</th>
                  <th className="px-3 py-2">{isZh ? "金币" : "Gold"}</th>
                  <th className="px-3 py-2">EXP</th>
                  <th className="px-3 py-2">{isZh ? "击杀" : "Kills"}</th>
                </tr>
              </thead>
              <tbody>
                {topGold.map((s, i) => (
                  <tr key={s.key} className="border-t border-[#27272a] hover:bg-[#0d0d0d]">
                    <td className="px-3 py-2 font-mono text-[#555]">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link href={`/${locale}/stages/${s.key}`} className="font-medium text-white hover:text-amber-400">
                        A{s.act}-{s.no} {s.name?.["en-US"] ?? ""}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[#9d9d9d]">{s.difficulty}</td>
                    <td className="px-3 py-2 font-mono text-[#9d9d9d]">{s.level}</td>
                    <td className="px-3 py-2 font-mono font-semibold text-amber-400">{s.goldPerClear?.toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono text-emerald-400">{s.expPerClear?.toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono text-[#9d9d9d]">{s.kills}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* EXP Ranking */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-[#6c6c6c]">
            {isZh ? "⭐ 经验排行榜" : "⭐ Top EXP Stages"}
          </h2>
          <div className="overflow-x-auto border border-[#27272a]">
            <table className="w-full min-w-[500px] text-left text-xs">
              <thead className="bg-[#18181b] text-[#6c6c6c]">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">{isZh ? "关卡" : "Stage"}</th>
                  <th className="px-3 py-2">{isZh ? "难度" : "Diff"}</th>
                  <th className="px-3 py-2">Lv</th>
                  <th className="px-3 py-2">EXP</th>
                  <th className="px-3 py-2">{isZh ? "金币" : "Gold"}</th>
                  <th className="px-3 py-2">{isZh ? "击杀" : "Kills"}</th>
                </tr>
              </thead>
              <tbody>
                {topExp.map((s, i) => (
                  <tr key={s.key} className="border-t border-[#27272a] hover:bg-[#0d0d0d]">
                    <td className="px-3 py-2 font-mono text-[#555]">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link href={`/${locale}/stages/${s.key}`} className="font-medium text-white hover:text-amber-400">
                        A{s.act}-{s.no} {s.name?.["en-US"] ?? ""}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[#9d9d9d]">{s.difficulty}</td>
                    <td className="px-3 py-2 font-mono text-[#9d9d9d]">{s.level}</td>
                    <td className="px-3 py-2 font-mono font-semibold text-emerald-400">{s.expPerClear?.toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono text-amber-400">{s.goldPerClear?.toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono text-[#9d9d9d]">{s.kills}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Links to other guides */}
        <section className="grid gap-2 border-t border-[#27272a] pt-6 sm:grid-cols-2">
          <Link href={`/${locale}/guides/farming/chest-drop-guide`} className="rounded-sm border border-[#27272a] bg-[#0d0d0d] p-3 text-xs transition-colors hover:border-amber-600/30">
            <p className="font-medium text-white">{isZh ? "宝箱掉落指南" : "Chest Drop Guide"}</p>
            <p className="mt-1 text-[#6c6c6c]">{isZh ? "宝箱类型、掉落机制和如何判断刷取目标" : "Chest types, drop mechanics, and how to choose farming targets"}</p>
          </Link>
          <Link href={`/${locale}/guides/economy/steam-market-guide`} className="rounded-sm border border-[#27272a] bg-[#0d0d0d] p-3 text-xs transition-colors hover:border-amber-600/30">
            <p className="font-medium text-white">{isZh ? "Steam 市场指南" : "Steam Market Guide"}</p>
            <p className="mt-1 text-[#6c6c6c]">{isZh ? "如何判断物品是否值得卖" : "How to decide if an item is worth selling"}</p>
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
