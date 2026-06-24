import type { Metadata } from "next";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { allMonsters, allStages, text, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";
import { RelatedPages } from "@/components/tbh/related-pages";
import { HowToUse } from "@/components/tbh/how-to-use";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TBH 怪物图鉴｜61 种怪物、掉落与出现关卡" : "TBH Monster Bestiary — 61 Monsters, Drops & Stage Locations",
    description: locale === "zh"
      ? "全部 61 种怪物的完整图鉴：属性、奖励金币/经验、出现关卡、Boss 信息。包含怪物头像。"
      : "Complete bestiary of all 61 monsters: stats, gold/EXP rewards, stage locations, and boss info. Monster portraits included.",
    alternates: pageAlternates(locale, "/monsters"),
  };
}

function monsterPortrait(monster: { portrait?: string | null }): string | null {
  if (!monster.portrait) return null;
  const parts = monster.portrait.split("/");
  const dir = parts[parts.length - 2];
  const file = parts[parts.length - 1];
  return `/game/monsters/${dir}/${file}`;
}

export default async function MonstersPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const monsters = allMonsters();
  const stages = allStages();

  return (
    <PageShell>
      <SeoJsonLd data={[{
        "@context": "https://schema.org", "@type": "ItemList",
        name: isZh ? "TBH 怪物图鉴" : "TBH Monster Bestiary",
        numberOfItems: monsters.length,
        itemListElement: monsters.map((m, i) => ({
          "@type": "ListItem", position: i + 1,
          name: text(m.MonsterNameStringKey_i18n, locale, `Monster ${m.MonsterKey}`),
          url: `${locale === "en" ? "" : "/" + locale}/monsters/${m.slug ?? m.MonsterKey}`,
        })),
      }]} />
      <PageHeader
        kicker="Bestiary"
        title={isZh ? "怪物图鉴" : "Monster Bestiary"}
        description={
          isZh
            ? `${monsters.length} 种怪物，含 Boss。展示头像、类型、奖励、出现关卡和主要掉落物。点击查看完整掉落表。`
            : `${monsters.length} monsters, including bosses. Shows portrait, type, gold/EXP reward, stage locations, and top drops. Click for the full drop table.`
        }
      />

      <HowToUse pageKey="/monsters" locale={locale} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {monsters.map((monster) => {
          const img = monsterPortrait(monster);
          const name = text(monster.MonsterNameStringKey_i18n, locale, `Monster ${monster.MonsterKey}`);
          const stageCount = monster.stages?.length ?? 0;
          const isBoss = monster.stages?.some((s) => s.boss);

          return (
            <Link
              key={monster.MonsterKey}
              href={`/${locale}/monsters/${monster.slug ?? monster.MonsterKey}`}
              className="group flex items-center gap-3 rounded-sm border border-border-default bg-bg-panel p-3 transition-colors hover:border-amber-600/40"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border-default bg-bg-canvas">
                {img ? (
                  <SafeImage src={img} alt={name} width={48} height={48} className="object-contain p-1" unoptimized />
                ) : (
                  <span className="text-[8px] text-text-muted">-</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                  {name}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-text-muted">
                  <span>{monster.MONSTERTYPE ?? "-"}</span>
                  {isBoss && (
                    <span className="rounded bg-red-900/30 px-1 py-0.5 text-[9px] text-red-400">Boss</span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-text-muted">
                  <span>{isZh ? "金币" : "Gold"}: {monster.RewardGold ?? "-"}</span>
                  <span>EXP: {monster.RewardExp ?? "-"}</span>
                  <span>{stageCount} {isZh ? "关" : "stages"}</span>
                </div>
                {(() => {
                  const firstStage = monster.stages && monster.stages.length > 0
                    ? stages.find((s) => s.key === monster.stages![0].key)
                    : null;
                  if (!firstStage) return null;
                  return (
                    <div className="mt-1 truncate text-[10px] text-text-muted" title={isZh ? "主要出现关卡" : "Top stage"}>
                      {isZh ? "主要关卡" : "Top stage"}: <span className="text-text-secondary">{firstStage.difficulty} {firstStage.act}-{firstStage.no}</span>
                      {monster.stages!.length > 1 ? <span className="text-text-muted"> · +{monster.stages!.length - 1}</span> : null}
                    </div>
                  );
                })()}
              </div>
            </Link>
          );
        })}
      </div>
      <RelatedPages pageKey="/monsters" locale={locale} />
    </PageShell>
  );
}
