import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, PawPrint, Swords } from "lucide-react";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allMonsters, allStages, text, type Locale } from "@/lib/game-data/data";
import { extPets } from "@/lib/game-data/external";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

function monsterPortrait(portrait?: string | null): string | null {
  if (!portrait) return null;
  const parts = portrait.split("/");
  return `/game/monsters/${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const monster = allMonsters().find((m) => (m.slug ?? String(m.MonsterKey)) === slug);
  if (!monster) return { title: "Not found" };
  const name = text(monster.MonsterNameStringKey_i18n, locale, `Monster ${monster.MonsterKey}`);
  return {
    title: locale === "zh" ? `${name}｜TBH 怪物图鉴` : `${name} — TBH Monster Bestiary`,
    description: locale === "zh"
      ? `${name}：类型 ${monster.MONSTERTYPE ?? "?"}，奖励 ${monster.RewardGold ?? "?"} 金币/${monster.RewardExp ?? "?"} EXP。出现于 ${monster.stages?.length ?? 0} 个关卡。`
      : `${name}: ${monster.MONSTERTYPE ?? "?"} type, ${monster.RewardGold ?? "?"} gold/${monster.RewardExp ?? "?"} EXP reward. Appears in ${monster.stages?.length ?? 0} stages.`,
    alternates: pageAlternates(locale, `/monsters/${slug}`),
  };
}

export default async function MonsterDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const monster = allMonsters().find((m) => (m.slug ?? String(m.MonsterKey)) === slug);
  if (!monster) notFound();

  const isZh = locale === "zh";
  const name = text(monster.MonsterNameStringKey_i18n, locale, `Monster ${monster.MonsterKey}`);
  const img = monsterPortrait(monster.portrait);
  const stages = allStages();

  // Find stages where this monster appears
  const monsterStages = (monster.stages ?? [])
    .map((ms) => {
      const stage = stages.find((s) => s.key === ms.key);
      return { ...ms, stage };
    })
    .filter((s) => s.stage)
    .sort((a, b) => (a.stage?.key ?? 0) - (b.stage?.key ?? 0));

  const isBoss = monsterStages.some((s) => s.boss);

  return (
    <PageShell>
      <PageHeader
        kicker={isBoss ? "Boss" : "Monster"}
        title={name}
        description={
          isZh
            ? `类型: ${monster.MONSTERTYPE ?? "?"} · 金币: ${monster.RewardGold ?? "-"} · EXP: ${monster.RewardExp ?? "-"} · 出现于 ${monsterStages.length} 个关卡`
            : `Type: ${monster.MONSTERTYPE ?? "?"} · Gold: ${monster.RewardGold ?? "-"} · EXP: ${monster.RewardExp ?? "-"} · Appears in ${monsterStages.length} stages`
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Portrait */}
        <div className="flex flex-col items-center gap-3 rounded-sm border border-[#27272a] bg-[#0d0d0d] p-6">
          <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-sm border border-[#3b3b3b] bg-[#0a0a0a]">
            {img ? (
              <Image src={img} alt={name} width={160} height={160} className="object-contain" unoptimized />
            ) : (
              <span className="text-sm text-[#555]">No image</span>
            )}
          </div>
          <div className="text-center">
            <span className="rounded bg-[#18181b] px-2 py-0.5 text-[10px] text-[#9d9d9d]">{monster.MONSTERTYPE ?? "Unknown"}</span>
            {isBoss && (
              <span className="ml-1 rounded bg-red-900/30 px-2 py-0.5 text-[10px] text-red-400">Boss</span>
            )}
          </div>
        </div>

        {/* Stage list */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-[#6c6c6c]">
            {isZh ? `出现关卡 (${monsterStages.length})` : `Stage Appearances (${monsterStages.length})`}
          </h2>
          {monsterStages.length > 0 ? (
            <div className="grid gap-1 sm:grid-cols-2">
              {monsterStages.map(({ key, boss, spawnPct, perClear, stage }) => (
                <Link
                  key={key}
                  href={`/${locale}/stages/${stage!.key}`}
                  className="flex items-center gap-2 rounded-sm border border-[#27272a] bg-[#0d0d0d] px-3 py-2 text-xs transition-colors hover:border-amber-600/30"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${boss ? "bg-red-400" : "bg-emerald-400"}`} />
                  <span className="font-mono text-[#9d9d9d]">
                    {stage!.difficulty} A{stage!.act}-{stage!.no}
                  </span>
                  <span className="truncate text-[#6c6c6c]">
                    {text(stage!.name, locale, `Stage ${stage!.key}`)}
                  </span>
                  <span className="ml-auto shrink-0 text-[10px] text-[#555]">
                    {spawnPct != null ? `${spawnPct}%` : ""}{" "}
                    ×{perClear}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6c6c6c]">
              {isZh ? "暂无出现关卡数据" : "No stage data available"}
            </p>
          )}
        </div>
      </div>

      {/* Bottom nav: pet unlock + farming */}
      {(() => {
        const relatedPets = extPets().filter((p) => p.unlock.type === "KillMonster" && p.unlock.monsterKey === monster.MonsterKey);
        return (
          <div className="mt-8 grid gap-3 border-t border-[#27272a] pt-6 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
                {isZh ? "← 相关系统" : "← Related"}
              </p>
              <Link href={`/${locale}/monsters`} className="flex items-center gap-2 rounded-sm border border-[#27272a] bg-[#0d0d0d] p-3 text-xs transition-colors hover:border-amber-600/30 group">
                <Swords className="h-4 w-4 shrink-0 text-[#6c6c6c] group-hover:text-amber-400" />
                <span className="text-[#9d9d9d] group-hover:text-white">{isZh ? "全部怪物图鉴" : "All Monsters"}</span>
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
                {isZh ? "下一步 →" : "Next Steps →"}
              </p>
              {relatedPets.length > 0 && relatedPets.map((pet) => (
                <Link key={pet.key} href={`/${locale}/pets`} className="flex items-center gap-2 rounded-sm border border-amber-600/20 bg-amber-600/5 p-3 text-xs transition-colors hover:border-amber-400 group">
                  <PawPrint className="h-4 w-4 shrink-0 text-amber-400" />
                  <span className="flex-1 text-[#9d9d9d] group-hover:text-white">
                    {isZh ? `击杀 ${pet.unlock.count ?? "?"} 只可解锁宠物: ${pet.name}` : `Kill ${pet.unlock.count ?? "?"} to unlock pet: ${pet.name}`}
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-[#555] group-hover:text-amber-400" />
                </Link>
              ))}
              {monsterStages.length > 0 && (
                <Link href={`/${locale}/tools/farming-calculator`} className="flex items-center gap-2 rounded-sm border border-[#27272a] bg-[#0d0d0d] p-3 text-xs transition-colors hover:border-amber-600/30 group">
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#6c6c6c] group-hover:text-amber-400" />
                  <span className="text-[#9d9d9d] group-hover:text-white">{isZh ? "Farming 计算器 — 找出最佳刷怪关卡" : "Farming Calculator — find best stage"}</span>
                </Link>
              )}
            </div>
          </div>
        );
      })()}
    </PageShell>
  );
}
