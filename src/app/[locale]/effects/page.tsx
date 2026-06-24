import type { Metadata } from "next";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/tbh/badges";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { assetPath, effectRows, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "材料效果表 — 装饰、雕刻、铭刻属性" : locale === "ja" ? "素材効果表 — 装飾、刻印、銘刻" : "Material Effects — Decoration, Engraving & Inscription",
    alternates: pageAlternates(locale, "/effects"),
  };
}

export default async function EffectsPage({ params }: Props) {
  const { locale } = await params;
  const rows = effectRows(locale).slice(0, 260);
  const groups = Array.from(
    rows.reduce((map, row) => {
      const current = map.get(row.item.slug) ?? [];
      current.push(row);
      map.set(row.item.slug, current);
      return map;
    }, new Map<string, typeof rows>()),
  ).map(([slug, effects]) => ({ slug, item: effects[0].item, material: effects[0].material, effects }));

  return (
    <PageShell>
      <PageHeader
        kicker="Effects"
        title={copy(locale, "材料效果表", "Material Effects", "素材効果表")}
        description={copy(
          locale,
          "按 79 种材料横向查看适用部位、属性和值，用于判断材料是否值得保留或用于 Cube。",
          "Review all 79 materials by part, stat, and value to decide whether it is worth keeping or using in Cube.",
          "素材ごとに部位、効果、数値を横並びで確認し、残すか Cube に使うか判断します。",
        )}
      />

      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <SummaryCard label={copy(locale, "材料数量", "Materials", "素材数")} value={groups.length} />
        <SummaryCard label={copy(locale, "效果记录", "Effect rows", "効果数")} value={rows.length} />
        <SummaryCard label={copy(locale, "展示方式", "Layout", "表示")} value={copy(locale, "横向卡片", "Horizontal cards", "横並びカード")} />
      </div>

      <div className="space-y-3">
        {groups.map((group) => {
          const icon = assetPath(group.item.icon);
          const market = group.effects.find((effect) => effect.market)?.market;
          return (
            <article key={group.slug} className="overflow-hidden border border-border-default bg-bg-panel transition-colors hover:border-accent/60">
              <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
                <Link href={`/${locale}/items/${group.item.slug}`} className="flex items-center gap-4 border-b border-border-default bg-[#11100d] p-4 lg:border-b-0 lg:border-r">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-border-strong bg-[#070707]">
                    {icon ? (
                      <SafeImage src={icon} alt={group.material} width={40} height={40} className="object-contain" data-pixel unoptimized />
                    ) : (
                      <span className="text-xs text-text-muted">?</span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold text-text-primary">{group.material}</span>
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] text-text-secondary">{group.effects[0].effectType}</span>
                    <span className="mt-2 inline-flex">
                      <ConfidenceBadge value={market ? "missing" : "low"} />
                    </span>
                  </span>
                </Link>

                <div className="flex gap-2 overflow-x-auto p-3">
                  {group.effects.map((effect) => (
                    <div key={effect.id} className="min-w-[210px] flex-1 border border-border-default bg-bg-deep p-3">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="rounded-sm border border-border-strong px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c8bda7]">
                          {partLabel(effect.part, locale)}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.12em] text-text-muted">{effect.effectType}</span>
                      </div>
                      <p className="break-words text-[14px] font-medium text-text-primary">{formatStat(effect.stat)}</p>
                      <p className="mt-2 font-mono text-[22px] font-semibold text-accent-bright">{effect.value}</p>
                      <p className="mt-2 text-[12px] leading-5 text-text-muted">
                        {effect.market
                          ? copy(locale, "可交易，暂无市场数据", "Tradable, no market data", "取引可能、価格データなし")
                          : copy(locale, "未标记市场数据", "No market record", "市場記録なし")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}

function copy(locale: Locale, zh: string, en: string, ja: string) {
  if (locale === "zh") return zh;
  if (locale === "ja") return ja;
  return en;
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border-default bg-bg-panel px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">{label}</p>
      <p className="mt-1 text-[20px] font-semibold text-accent-bright">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

function partLabel(part: string, locale: Locale) {
  const labels: Record<string, Partial<Record<Locale, string>>> = {
    WEAPON: { zh: "武器", en: "Weapon", ja: "武器" },
    ARMOR: { zh: "护甲", en: "Armor", ja: "防具" },
    ACCESSORY: { zh: "饰品", en: "Accessory", ja: "アクセサリ" },
  };
  return labels[part]?.[locale] ?? part;
}

function formatStat(stat: string) {
  return stat.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/Percent$/, " %");
}
