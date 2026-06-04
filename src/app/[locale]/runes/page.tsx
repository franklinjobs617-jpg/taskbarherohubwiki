import type { Metadata } from "next";
import { Coins, TrendingUp } from "lucide-react";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { type Locale } from "@/lib/game-data/data";
import { extRunes, type ExtRune } from "@/lib/game-data/external";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TaskBar Hero 符文树｜效果、升级消耗与路线" : "TaskBar Hero Rune Tree — Effects, Costs & Routes",
    description: locale === "zh"
      ? "全部符文的效果说明、升级消耗和分支路线。按类别分组，点击展开查看每级消耗和总价。"
      : "All runes with effects, upgrade costs, and branching routes. Grouped by category — click to expand costs.",
    alternates: pageAlternates(locale, "/runes"),
  };
}

const CATEGORY_LABELS: Record<string, { zh: string; en: string }> = {
  Hero: { zh: "英雄属性", en: "Hero Stats" },
  Gold: { zh: "金币", en: "Gold" },
  EXP: { zh: "经验", en: "EXP" },
  Drop: { zh: "掉落", en: "Drops" },
  Damage: { zh: "伤害", en: "Damage" },
  Defense: { zh: "防御", en: "Defense" },
  Utility: { zh: "功能", en: "Utility" },
};

function getCat(cat: string, isZh: boolean) {
  return CATEGORY_LABELS[cat]?.[isZh ? "zh" : "en"] ?? cat;
}

export default async function RunesPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const runes = extRunes();

  const grouped = new Map<string, ExtRune[]>();
  for (const r of runes) {
    const cat = r.category || "Other";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(r);
  }

  return (
    <PageShell>
      <PageHeader
        kicker="Runes"
        title={isZh ? "符文树" : "Rune Tree"}
        description={isZh
          ? `${runes.length} 个符文 · ${grouped.size} 个类别。点击展开查看每级效果和消耗。`
          : `${runes.length} runes · ${grouped.size} categories. Click to expand level costs.`}
      />

      <div className="space-y-8">
        {[...grouped.entries()].map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#f6e8c8]">
              <span className="h-2 w-2 rounded-full bg-[#d4a017]" />
              {getCat(category, isZh)}
              <span className="text-sm font-normal text-[#6c6c6c]">({items.length})</span>
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((rune) => (
                <details key={rune.key} className="group border border-[#27272a] bg-[#0d0d0d] hover:border-[#3a3a3a] [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-start justify-between gap-2 p-3 select-none">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#ffffff] group-open:text-[#f0c040]">{rune.name}</p>
                      <p className="mt-1 text-xs text-[#9d9d9d]">{rune.effect}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs">
                      <span className="text-[#6c6c6c]">Lv.{rune.maxLevel}</span>
                      {rune.next.length > 0 && <span className="text-[#62d394]">→{rune.next.length}</span>}
                    </div>
                  </summary>
                  <div className="border-t border-[#27272a] p-3 space-y-2">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-[#6c6c6c]">
                            <th className="pb-1 pr-3">{isZh ? "等级" : "Lv"}</th>
                            <th className="pb-1 pr-3">{isZh ? "效果" : "Effect"}</th>
                            <th className="pb-1 text-right">{isZh ? "消耗" : "Cost"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rune.levels.map((lvl) => (
                            <tr key={lvl.level} className="border-t border-[#1a1a1a]">
                              <td className="py-1 pr-3 text-[#9d9d9d]">{lvl.level}</td>
                              <td className="py-1 pr-3 text-[#ffffff]">{lvl.value}</td>
                              <td className="py-1 text-right">
                                <span className="inline-flex items-center gap-0.5 text-[#f0c040]">
                                  <Coins className="h-3 w-3" />{lvl.cost.toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#1a1a1a] pt-2 text-xs">
                      <span className="text-[#6c6c6c]">{isZh ? "总消耗" : "Total"}</span>
                      <span className="inline-flex items-center gap-0.5 font-semibold text-[#f0c040]">
                        <Coins className="h-3 w-3" />{rune.totalCost.toLocaleString()}
                      </span>
                    </div>
                    {rune.next.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 text-xs text-[#62d394]">
                        <TrendingUp className="h-3 w-3" />
                        <span>{isZh ? `解锁 ${rune.next.length} 个后续符文` : `Unlocks ${rune.next.length} more runes`}</span>
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
