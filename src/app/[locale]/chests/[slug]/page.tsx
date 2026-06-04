import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { RarityBadge } from "@/components/tbh/badges";
import { Section } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { itemBySlug, itemName, type Locale } from "@/lib/game-data/data";
import { extStages, formatDropRate } from "@/lib/game-data/external";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const chest = itemBySlug(slug);
  const name = chest ? itemName(chest, locale) : "Chest";
  return {
    title: locale === "zh" ? `${name} 掉落来源｜TaskBar Hero` : `${name} Drop Sources`,
    alternates: pageAlternates(locale, `/chests/${slug}`),
  };
}

export default async function ChestDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const chest = itemBySlug(slug);
  if (!chest || chest.type !== "STAGEBOX") notFound();
  const isZh = locale === "zh";
  const name = itemName(chest, locale);

  // Find all stages that drop this chest
  const stages = extStages();
  const dropStages = stages
    .filter((s) => s.drops.some((d) => d.itemKey === chest.id))
    .map((s) => ({ stage: s, drop: s.drops.find((d) => d.itemKey === chest.id)! }))
    .sort((a, b) => b.drop.rate - a.drop.rate);

  // Count by difficulty
  const byDifficulty = new Map<string, number>();
  for (const ds of dropStages) {
    const diff = ds.stage.difficulty;
    byDifficulty.set(diff, (byDifficulty.get(diff) ?? 0) + 1);
  }

  return (
    <PageShell>
      <PageHeader
        kicker="Chest detail"
        title={name}
        description={isZh
          ? "宝箱基础信息和掉落来源关卡。"
          : "Chest info and drop source stages."}
      />

      {/* ── Chest info ── */}
      <div className="grid gap-2.5 sm:grid-cols-3">
        <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
          <p className="text-xs text-[#6c6c6c]">{isZh ? "稀有度" : "Rarity"}</p>
          <div className="mt-2"><RarityBadge grade={chest.grade} locale={locale} /></div>
        </div>
        <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
          <p className="text-xs text-[#6c6c6c]">{isZh ? "可获取关卡" : "Available in"}</p>
          <p className="mt-2 text-xl font-semibold text-[#f0c040]">{dropStages.length}</p>
        </div>
        <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
          <p className="text-xs text-[#6c6c6c]">{isZh ? "难度分布" : "By difficulty"}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[...byDifficulty.entries()].map(([diff, count]) => (
              <span key={diff} className="rounded border border-[#3b3b3b] px-2 py-0.5 text-xs text-[#9d9d9d]">
                {diff}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Drop Sources ── */}
      {dropStages.length > 0 ? (
        <Section title={isZh ? "掉落来源" : "Drop Sources"} eyebrow={isZh ? `${dropStages.length} 个关卡` : `${dropStages.length} stages`}>
          <div className="overflow-x-auto border border-[#27272a]">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="bg-[#151515] text-xs text-[#6c6c6c]">
                <tr>
                  <th className="px-3 py-2.5">{isZh ? "关卡" : "Stage"}</th>
                  <th className="px-3 py-2.5">Act</th>
                  <th className="px-3 py-2.5">{isZh ? "难度" : "Difficulty"}</th>
                  <th className="px-3 py-2.5">{isZh ? "来源" : "Source"}</th>
                  <th className="px-3 py-2.5 text-right">{isZh ? "掉率" : "Rate"}</th>
                </tr>
              </thead>
              <tbody>
                {dropStages.map(({ stage: s, drop }) => (
                  <tr key={s.key} className="border-t border-[#27272a] hover:bg-[#0d0d0d]">
                    <td className="px-3 py-3">
                      <Link href={`/${locale}/stages/${s.label.toLowerCase().replace(".", "-")}`} className="font-medium text-[#f0c040] hover:underline">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          {s.label} {s.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-[#9d9d9d]">{s.act}</td>
                    <td className="px-3 py-3 text-[#9d9d9d]">{s.difficulty}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${drop.source === "boss" ? "bg-[#2a1515] text-[#ff6b6b]" : "bg-[#152a15] text-[#6bff6b]"}`}>
                        {drop.source === "boss" ? "Boss" : (isZh ? "怪物" : "Monster")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-[#f0c040]">{formatDropRate(drop.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : (
        <Section title={isZh ? "掉落来源" : "Drop Sources"}>
          <div className="border border-[#27272a] bg-[#0d0d0d] p-6 text-center text-sm text-[#6c6c6c]">
            {isZh
              ? "暂未找到此宝箱的掉落来源数据。"
              : "No drop source data found for this chest yet."}
          </div>
        </Section>
      )}

      {/* ── Cross-links ── */}
      <Section title={isZh ? "相关入口" : "Related"}>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${locale}/chests`} className="border border-[#3b3b3b] px-3 py-2 text-sm text-[#ffffff] hover:border-[#d4a017]">
            {isZh ? "全部宝箱" : "All Chests"}
          </Link>
          <Link href={`/${locale}/map`} className="border border-[#3b3b3b] px-3 py-2 text-sm text-[#ffffff] hover:border-[#d4a017]">
            {isZh ? "关卡地图" : "Map"}
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
