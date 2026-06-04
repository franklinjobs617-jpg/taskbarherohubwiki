import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Boxes, Coins, Swords, Zap } from "lucide-react";
import { RarityBadge } from "@/components/tbh/badges";
import { Section } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allItems, stageBySlug, stageName, type Locale } from "@/lib/game-data/data";
import { extIconPath, extStages, formatDropRate } from "@/lib/game-data/external";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const stage = stageBySlug(slug);
  return {
    title: locale === "zh"
      ? `${stage ? stageName(stage, locale) : "关卡"}｜TaskBar Hero 掉落、怪物与刷取判断`
      : `${stage ? stageName(stage, locale) : "Stage"}｜Drops, Monsters & Farming`,
    alternates: pageAlternates(locale, `/stages/${slug}`),
  };
}

export default async function StageDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const stage = stageBySlug(slug);
  if (!stage) notFound();
  const isZh = locale === "zh";

  // Get external drops data
  const extStage = extStages().find((s) => s.key === stage.key);
  const drops = extStage?.drops ?? [];
  const monsterDrops = drops.filter((d) => d.source === "monster");
  const bossDrops = drops.filter((d) => d.source === "boss");
  const uniqueChests = [...new Map(drops.map((d) => [d.itemKey, d])).values()];

  return (
    <PageShell>
      <PageHeader
        kicker="Stage detail"
        title={stageName(stage, locale)}
        description={`${stage.difficulty} / Act ${stage.act}-${stage.no} / Lv.${stage.level}`}
      />

      {/* ── Stats row ── */}
      <div className="grid gap-2.5 sm:grid-cols-4">
        <StatCard icon={<Coins className="h-4 w-4" />} label={isZh ? "金币" : "Gold"} value={stage.goldPerClear ?? "-"} accent />
        <StatCard icon={<Zap className="h-4 w-4" />} label={isZh ? "经验" : "EXP"} value={stage.expPerClear ?? "-"} />
        <StatCard icon={<Swords className="h-4 w-4" />} label={isZh ? "击杀数" : "Kills"} value={stage.kills ?? "-"} />
        <StatCard icon={<Boxes className="h-4 w-4" />} label="Boss" value={stage.boss?.name ? (stage.boss.name["zh-Hans"] ?? stage.boss.name["en-US"] ?? "-") : "-"} />
      </div>

      {/* ── Drop Table ── */}
      {drops.length > 0 && (
        <Section title={isZh ? "掉落物品" : "Drop Table"} eyebrow={isZh ? "含掉率" : "With drop rates"}>
          <div className="overflow-x-auto border border-[#252525]">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-[#151515] text-xs text-[#777]">
                <tr>
                  <th className="px-3 py-2.5">{isZh ? "物品" : "Item"}</th>
                  <th className="px-3 py-2.5">{isZh ? "稀有度" : "Grade"}</th>
                  <th className="px-3 py-2.5">{isZh ? "来源" : "Source"}</th>
                  <th className="px-3 py-2.5">{isZh ? "掉率" : "Rate"}</th>
                  <th className="px-3 py-2.5">{isZh ? "操作" : "Action"}</th>
                </tr>
              </thead>
              <tbody>
                {uniqueChests.map((drop) => {
                  const icon = extIconPath(drop.icon, "STAGEBOX");
                  return (
                    <tr key={drop.itemKey} className="border-t border-[#252525] hover:bg-[#0d0d0d]">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {icon ? (
                            <Image src={icon} alt={drop.name} width={32} height={32} className="object-contain" data-pixel unoptimized />
                          ) : null}
                          <span className="font-medium text-[#ddd]">{drop.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <RarityBadge grade={drop.grade} locale={locale} />
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] ${drop.source === "boss" ? "bg-[#2a1515] text-[#ff6b6b]" : "bg-[#152a15] text-[#6bff6b]"}`}>
                          {drop.source === "boss" ? (isZh ? "Boss" : "Boss") : (isZh ? "怪物" : "Monster")}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-semibold text-[#f0c040]">{formatDropRate(drop.rate)}</span>
                      </td>
                      <td className="px-3 py-3">
                        {(() => {
                          const itemSlug = allItems().find((i) => i.id === drop.itemKey)?.slug;
                          return itemSlug ? (
                            <Link href={`/${locale}/items/${itemSlug}`} className="text-xs text-[#f0c040] hover:underline">
                              {isZh ? "查看" : "View"} →
                            </Link>
                          ) : (
                            <span className="text-xs text-[#666]">{isZh ? "详情" : "N/A"}</span>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ── Farming tips ── */}
      <Section title={isZh ? "刷取建议" : "Farming Tips"} eyebrow={isZh ? "效率指南" : "Efficiency guide"}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-[#252525] bg-[#101010] p-4">
            <h3 className="text-sm font-semibold text-[#f0c040]">
              {isZh ? "金币效率" : "Gold Efficiency"}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#aaa]">
              {isZh
                ? `每轮 ${stage.goldPerClear ?? "?"} 金币。记录你的实际清图时间，除以分钟数得到每分钟金币效率。`
                : `${stage.goldPerClear ?? "?"} gold per clear. Time your actual clears and divide to get gold per minute.`}
            </p>
          </div>
          <div className="border border-[#252525] bg-[#101010] p-4">
            <h3 className="text-sm font-semibold text-[#f0c040]">
              {isZh ? "经验效率" : "EXP Efficiency"}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#aaa]">
              {isZh
                ? `每轮 ${stage.expPerClear ?? "?"} 经验 + ${stage.kills ?? "?"} 击杀经验。稳定清理优于勉强推图。`
                : `${stage.expPerClear ?? "?"} EXP per clear + ${stage.kills ?? "?"} kill EXP. Stable clears beat risky pushes.`}
            </p>
          </div>
        </div>
      </Section>

      {/* ── Cross-links ── */}
      <Section title={isZh ? "相关入口" : "Related Links"} eyebrow={isZh ? "更多数据" : "More data"}>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${locale}/map`} className="border border-[#333] px-3 py-2 text-sm text-[#ddd] hover:border-[#d4a017]">
            {isZh ? "关卡地图" : "Stage Map"}
          </Link>
          <Link href={`/${locale}/chests`} className="border border-[#333] px-3 py-2 text-sm text-[#ddd] hover:border-[#d4a017]">
            {isZh ? "全部宝箱" : "All Chests"}
          </Link>
          <Link href={`/${locale}/tools/farming-compare`} className="border border-[#333] px-3 py-2 text-sm text-[#ddd] hover:border-[#d4a017]">
            {isZh ? "刷图对比" : "Farming Compare"}
          </Link>
          {bossDrops.length > 0 && (
            <Link href={`/${locale}/market`} className="border border-[#333] px-3 py-2 text-sm text-[#ddd] hover:border-[#d4a017]">
              {isZh ? "市场状态" : "Market"}
            </Link>
          )}
        </div>
      </Section>
    </PageShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="border border-[#252525] bg-[#101010] p-4">
      <div className="flex items-center gap-2 text-xs text-[#777]">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`mt-2 text-xl font-semibold ${accent ? "text-[#f0c040]" : "text-[#ddd]"}`}>
        {value}
      </p>
    </div>
  );
}
