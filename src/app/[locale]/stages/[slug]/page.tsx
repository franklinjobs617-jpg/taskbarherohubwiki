import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Boxes, Coins, Shield, Skull, Swords, Zap } from "lucide-react";
import { RarityBadge } from "@/components/tbh/badges";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allItems, allMonsters, stageBySlug, stageName, type Locale } from "@/lib/game-data/data";
import { graphChestByKey, graphMonsterByKey, graphStageByKey, type GraphChest, type GraphDrop, type GraphStage } from "@/lib/game-data/graph";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

function label(locale: Locale, zh: string, en: string, ja = en) {
  if (locale === "zh") return zh;
  if (locale === "ja") return ja;
  return en;
}

function rateLabel(rate: number | null | undefined) {
  if (rate == null) return "-";
  if (rate >= 100) return "100%";
  if (rate >= 10) return `${rate.toFixed(0)}%`;
  return `${rate.toFixed(2)}%`;
}

function monsterPortrait(monsterKey: number): string | null {
  const monster = allMonsters().find((row) => row.MonsterKey === monsterKey);
  if (!monster?.portrait) return null;
  const parts = monster.portrait.split("/");
  return `/game/monsters/${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

function localItemSlug(itemKey: number, fallback: string) {
  return allItems().find((item) => item.id === itemKey)?.slug ?? fallback;
}

function chestForDrop(drop: GraphDrop): GraphChest | null {
  return graphChestByKey(drop.itemKey);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const localStage = stageBySlug(slug);
  const graphStage = localStage ? graphStageByKey(localStage.key) : graphStageByKey(Number(slug));
  const name = localStage ? stageName(localStage, locale) : graphStage?.name ?? "Stage";

  return {
    title: label(locale, `${name} - 怪物、Boss、掉落与刷图决策`, `${name} - Monsters, Bosses, Drops & Farming`, `${name} - ドロップと周回`),
    description: label(
      locale,
      `查看 ${name} 会出现什么怪物、Boss 掉什么箱子、箱子能开出什么，以及是否值得刷。`,
      `See which monsters appear in ${name}, what chests drop, what those chests contain, and whether it is worth farming.`,
      `${name} の敵、ボス、ドロップ、周回価値を確認できます。`,
    ),
    alternates: pageAlternates(locale, `/stages/${slug}`),
  };
}

export default async function StageDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const localStage = stageBySlug(slug);
  const graphStage = localStage ? graphStageByKey(localStage.key) : graphStageByKey(Number(slug));
  if (!localStage && !graphStage) notFound();

  const stage = graphStage as GraphStage;
  const displayName = localStage ? stageName(localStage, locale) : stage.name;
  const monsterDrops = stage.drops.filter((drop) => drop.sourceType === "monster");
  const bossDrops = stage.drops.filter((drop) => drop.sourceType === "boss");
  const dropChests = stage.drops.map((drop) => ({ drop, chest: chestForDrop(drop) }));
  const topContents = dropChests.flatMap(({ drop, chest }) =>
    (chest?.contents ?? []).slice(0, 8).map((content) => ({
      ...content,
      chestName: chest?.name ?? drop.name,
      chestRate: drop.ratePercent,
    })),
  ).sort((a, b) => (b.chancePercent ?? 0) - (a.chancePercent ?? 0)).slice(0, 16);

  return (
    <PageShell>
      <PageHeader
        kicker={label(locale, "Dungeon Panel", "Dungeon Panel")}
        title={displayName}
        description={label(
          locale,
          `${stage.difficulty} / Act ${stage.act}-${stage.stageNo} / Lv.${stage.level}。先看怪物和掉落，再决定是否刷这关。`,
          `${stage.difficulty} / Act ${stage.act}-${stage.stageNo} / Lv.${stage.level}. Read monsters and drops first, then decide whether to farm it.`,
        )}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Metric icon={<Shield className="h-4 w-4" />} label={label(locale, "等级", "Level")} value={`Lv.${stage.level}`} />
        <Metric icon={<Coins className="h-4 w-4" />} label={label(locale, "金币", "Gold")} value={stage.rewards.goldPerClear ?? "-"} accent="gold" />
        <Metric icon={<Zap className="h-4 w-4" />} label="EXP" value={stage.rewards.expPerClear ?? "-"} accent="exp" />
        <Metric icon={<Swords className="h-4 w-4" />} label={label(locale, "怪物", "Monsters")} value={stage.monsters.length} />
        <Metric icon={<Boxes className="h-4 w-4" />} label={label(locale, "掉落入口", "Drop Entries")} value={stage.drops.length} accent="drop" />
      </div>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="border border-[#27272a] bg-[#0d0d0d]">
          <div className="flex items-center justify-between border-b border-[#27272a] px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#6c6c6c]">{label(locale, "怪物组成", "Monster Composition")}</p>
              <h2 className="text-lg font-semibold text-[#ffffff]">{label(locale, "这一关会出现什么", "What Spawns Here")}</h2>
            </div>
            <span className="text-xs text-[#9d9d9d]">{stage.waveAmount ?? "?"} waves</span>
          </div>

          <div className="grid gap-2 p-3 sm:grid-cols-2">
            {stage.monsters.map((monster) => {
              const graphMonster = graphMonsterByKey(monster.monsterKey);
              const portrait = monsterPortrait(monster.monsterKey);
              return (
                <Link
                  key={monster.monsterKey}
                  href={`/${locale}/monsters/${monster.monsterKey}`}
                  className="group flex items-center gap-3 border border-[#27272a] bg-[#0a0a0a] p-3 transition hover:border-[#d4a017]/70"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[#27272a] bg-[#050505]">
                    {portrait ? <Image src={portrait} alt={monster.name ?? ""} width={52} height={52} className="object-contain" unoptimized /> : <Skull className="h-6 w-6 text-[#6c6c6c]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#f1e8d5] group-hover:text-[#f0c040]">{monster.name ?? `Monster ${monster.monsterKey}`}</p>
                    <p className="mt-1 text-xs text-[#6c6c6c]">
                      HP {graphMonster?.stats.maxLife ?? "-"} / ATK {graphMonster?.stats.attackDamage ?? "-"}
                    </p>
                    <p className="mt-1 text-[11px] text-[#9d9d9d]">
                      {label(locale, "掉落表", "Drop table")}: {graphMonster?.drops.length ?? 0}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {stage.boss ? (
            <div className="border-t border-[#27272a] bg-[#160c0c] p-3">
              <Link href={`/${locale}/monsters/${stage.boss.monsterKey}`} className="group flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-red-900/50 bg-[#090404]">
                  {monsterPortrait(stage.boss.monsterKey) ? (
                    <Image src={monsterPortrait(stage.boss.monsterKey)!} alt={stage.boss.name} width={62} height={62} className="object-contain" unoptimized />
                  ) : (
                    <Skull className="h-7 w-7 text-red-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-red-300">{label(locale, "Boss", "Boss")}</p>
                  <p className="truncate text-base font-semibold text-[#ffffff] group-hover:text-red-300">{stage.boss.name}</p>
                  <p className="mt-1 text-xs text-[#a1a1aa]">
                    DMG x{((stage.boss.multipliers?.damage ?? 1000) / 1000).toFixed(1)} / HP x{((stage.boss.multipliers?.hp ?? 1000) / 1000).toFixed(1)}
                  </p>
                </div>
              </Link>
            </div>
          ) : null}
        </div>

        <div className="border border-[#3f2f10] bg-[#100d06]">
          <div className="border-b border-[#3f2f10] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#9d7b33]">{label(locale, "刷图判断", "Farming Decision")}</p>
            <h2 className="text-lg font-semibold text-[#f6d98a]">{label(locale, "先刷什么", "What To Farm")}</h2>
          </div>
          <div className="space-y-3 p-4 text-sm leading-6 text-[#d8d1c2]">
            <DecisionLine
              label={label(locale, "目标", "Target")}
              value={stage.decision.bestDrop ? `${stage.decision.bestDrop.name} (${rateLabel(stage.decision.bestDrop.ratePercent)})` : label(locale, "没有可靠掉落", "No reliable drop")}
            />
            <DecisionLine
              label={label(locale, "适合", "Best For")}
              value={bossDrops.length ? label(locale, "Boss 箱与推进", "Boss chest and progression") : label(locale, "普通怪箱与材料", "Monster boxes and materials")}
            />
            <DecisionLine
              label={label(locale, "风险", "Risk")}
              value={stage.level > 70 ? label(locale, "高等级关卡，先保证稳定清图", "High-level stage; clear stability first") : label(locale, "低到中等风险，可用于补材料", "Low to medium risk; useful for materials")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 border border-[#27272a] bg-[#0d0d0d]">
        <div className="flex flex-col gap-2 border-b border-[#27272a] px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#6c6c6c]">{label(locale, "掉落表", "Drop Table")}</p>
            <h2 className="text-lg font-semibold text-[#ffffff]">{label(locale, "这一关掉什么箱子", "Which Chests Drop Here")}</h2>
          </div>
          <p className="text-xs text-[#9d9d9d]">
            {label(locale, "普通怪", "Monster")} {monsterDrops.length} / Boss {bossDrops.length}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#18181b] text-xs uppercase tracking-[0.12em] text-[#6c6c6c]">
              <tr>
                <th className="px-4 py-3">{label(locale, "箱子", "Chest")}</th>
                <th className="px-4 py-3">{label(locale, "来源", "Source")}</th>
                <th className="px-4 py-3">{label(locale, "掉率", "Rate")}</th>
                <th className="px-4 py-3">{label(locale, "内容数", "Contents")}</th>
                <th className="px-4 py-3">{label(locale, "操作", "Action")}</th>
              </tr>
            </thead>
            <tbody>
              {dropChests.map(({ drop, chest }) => (
                <tr key={`${drop.itemKey}-${drop.sourceType}`} className="border-t border-[#27272a]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <RarityBadge grade={drop.grade} locale={locale} />
                      <span className="font-medium text-[#ffffff]">{drop.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={drop.sourceType === "boss" ? "text-red-300" : "text-emerald-300"}>
                      {drop.sourceType === "boss" ? "Boss" : label(locale, "怪物", "Monster")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-[#f0c040]">{rateLabel(drop.ratePercent)}</td>
                  <td className="px-4 py-3 text-[#9d9d9d]">{chest?.contents.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <Link href={`/${locale}/chests/${localItemSlug(drop.itemKey, drop.itemSlug)}`} className="text-xs font-semibold text-[#f0c040] hover:underline">
                      {label(locale, "看箱子", "Open chest")} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 border border-[#27272a] bg-[#0d0d0d]">
        <div className="border-b border-[#27272a] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#6c6c6c]">{label(locale, "箱子内容预览", "Chest Content Preview")}</p>
          <h2 className="text-lg font-semibold text-[#ffffff]">{label(locale, "开箱可能得到什么", "What You Can Open")}</h2>
        </div>
        <div className="grid gap-2 p-3 md:grid-cols-2 xl:grid-cols-4">
          {topContents.map((content) => (
            <Link
              key={`${content.chestName}-${content.itemKey}-${content.condition ?? "base"}`}
              href={`/${locale}/items/${localItemSlug(content.itemKey, content.itemSlug)}`}
              className="group border border-[#27272a] bg-[#0a0a0a] p-3 transition hover:border-[#d4a017]/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#f1e8d5] group-hover:text-[#f0c040]">{content.name}</p>
                  <p className="mt-1 truncate text-xs text-[#6c6c6c]">{content.chestName}</p>
                </div>
                <RarityBadge grade={content.grade} locale={locale} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-[#9d9d9d]">{content.type}</span>
                <span className="font-mono font-semibold text-[#f0c040]">{rateLabel(content.chancePercent)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function Metric({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: "gold" | "exp" | "drop" }) {
  const color = accent === "gold" ? "text-[#f0c040]" : accent === "exp" ? "text-emerald-300" : accent === "drop" ? "text-cyan-300" : "text-[#ffffff]";
  return (
    <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
      <div className="flex items-center gap-2 text-xs text-[#6c6c6c]">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`mt-2 text-xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function DecisionLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[86px_1fr] gap-3 border-b border-[#3f2f10] pb-3 last:border-0 last:pb-0">
      <span className="text-xs uppercase tracking-[0.14em] text-[#9d7b33]">{label}</span>
      <span className="text-[#f1e8d5]">{value}</span>
    </div>
  );
}
