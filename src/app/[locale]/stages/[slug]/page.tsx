import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Boxes, Coins, Map, PackageOpen, PawPrint, Search, Shield, Swords, Zap } from "lucide-react";
import { RarityBadge } from "@/components/tbh/badges";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allItems, stageBySlug, stageName, type Locale } from "@/lib/game-data/data";
import { formatChance, getStageDecision } from "@/lib/game-data/decisions";
import { graphChestByKey, graphStageByKey } from "@/lib/game-data/graph";
import { localizedPath } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

function txt(locale: Locale, values: Record<Locale | "en", string>) {
  return values[locale] ?? values.en;
}

function localItemSlug(itemKey: number, fallback: string) {
  return allItems().find((item) => item.id === itemKey)?.slug ?? fallback;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const localStage = stageBySlug(slug);
  const graphStage = localStage ? graphStageByKey(localStage.key) : graphStageByKey(Number(slug));
  const name = localStage ? stageName(localStage, locale) : graphStage?.name ?? "Stage";
  return {
    title: txt(locale, {
      zh: `${name} 掉落、宝箱、经验与金币 | TBH Wiki`,
      en: `${name} Drops, Chests, EXP & Gold | TBH Wiki`,
      ja: `${name} ドロップ、宝箱、EXP、ゴールド | TBH Wiki`,
      ko: `${name} 드롭, 상자, EXP, 골드 | TBH Wiki`,
    }),
    description: txt(locale, {
      zh: `查看 ${name} 最适合刷什么、掉哪些宝箱、掉率、50%/90%预计次数和相关入口。`,
      en: `See what ${name} is best for, chest drops, rates, 50%/90% expected runs, and related actions.`,
      ja: `${name} の用途、宝箱、確率、50%/90%必要周回数、関連操作を確認。`,
      ko: `${name} 의 용도, 상자, 확률, 50%/90% 예상 횟수와 관련 작업을 확인합니다.`,
    }),
    alternates: pageAlternates(locale, `/stages/${slug}`),
  };
}

export default async function StageDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const decision = getStageDecision(slug, locale);
  if (!decision?.graphStage) notFound();

  const stage = decision.graphStage;
  const displayName = decision.title;
  const dropRows = decision.drops;
  const contentPreview = dropRows
    .flatMap(({ drop }) => {
      const chest = graphChestByKey(drop.itemKey);
      return (chest?.contents ?? []).slice(0, 4).map((content) => ({
        ...content,
        chestName: drop.name,
        chestRate: drop.ratePercent,
      }));
    })
    .slice(0, 12);

  const actions = [
    { href: "/tools/drop-finder", icon: Search, label: "Open Drop Finder" },
    { href: "/tools/farming-optimizer", icon: Map, label: "Compare Stage" },
    { href: dropRows[0] ? `/chests/${localItemSlug(dropRows[0].drop.itemKey, dropRows[0].drop.itemSlug)}` : "/chests", icon: Boxes, label: "View Chest" },
    { href: stage.boss ? `/monsters/${stage.boss.monsterKey}` : "/map", icon: Swords, label: "View Monster" },
    { href: "/market", icon: PackageOpen, label: "View Market Items" },
  ];

  return (
    <PageShell>
      <PageHeader
        kicker={`${stage.difficulty} / Act ${stage.act}-${stage.stageNo}`}
        title={displayName}
        description={txt(locale, {
          zh: `Lv.${stage.level}。先看这关适合刷什么、会掉什么、预计刷多少次，再决定下一步。`,
          en: `Lv.${stage.level}. Check what this stage is best for, what drops here, and expected runs before deciding.`,
          ja: `Lv.${stage.level}。用途、ドロップ、必要周回数を見てから判断。`,
          ko: `Lv.${stage.level}. 용도, 드롭, 예상 횟수를 보고 다음 행동을 정합니다.`,
        })}
      />

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border border-[#3f2f10] bg-[#100d06] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d4a017]">Best for</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {decision.bestFor.map((label) => (
              <span key={label} className="border border-[#5a4315] bg-[#0a0a0a] px-3 py-1.5 text-sm font-semibold text-[#f0c040]">{label}</span>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            <Metric icon={<Shield className="h-4 w-4" />} label="Level" value={`Lv.${stage.level}`} />
            <Metric icon={<Zap className="h-4 w-4" />} label="EXP" value={decision.expPerClear?.toLocaleString() ?? "-"} accent="text-emerald-300" />
            <Metric icon={<Coins className="h-4 w-4" />} label="Gold" value={decision.goldPerClear?.toLocaleString() ?? "-"} accent="text-[#f0c040]" />
            <Metric icon={<PawPrint className="h-4 w-4" />} label="Targets" value={`${stage.monsters.length + (stage.boss ? 1 : 0)}`} />
          </div>
        </div>
        <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6c6c6c]">Related actions</p>
          <div className="mt-3 grid gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={localizedPath(locale, action.href)} className="flex items-center justify-between border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-white hover:border-[#d4a017]">
                  <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4 text-[#d4a017]" /> {action.label}</span>
                  <ArrowRight className="h-4 w-4 text-[#6c6c6c]" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-6 border border-[#27272a] bg-[#0d0d0d]">
        <div className="border-b border-[#27272a] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#6c6c6c]">Drops here</p>
          <h2 className="text-lg font-semibold text-white">{txt(locale, { zh: "宝箱、掉率、预计次数", en: "Chests, rates, expected runs", ja: "宝箱、確率、必要回数", ko: "상자, 확률, 예상 횟수" })}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#18181b] text-xs uppercase tracking-[0.12em] text-[#6c6c6c]">
              <tr>
                <th className="px-4 py-3">Chest</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">50%</th>
                <th className="px-4 py-3">90%</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {dropRows.map(({ drop, expectedRuns }) => (
                <tr key={`${drop.itemKey}-${drop.sourceType}`} className="border-t border-[#27272a]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <RarityBadge grade={drop.grade} locale={locale} />
                      <span className="font-medium text-white">{drop.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#9d9d9d]">{drop.sourceType}</td>
                  <td className="px-4 py-3 font-mono text-[#f0c040]">{formatChance(drop.ratePercent / 100)}</td>
                  <td className="px-4 py-3 font-mono text-white">{expectedRuns.p50 ?? "-"}</td>
                  <td className="px-4 py-3 font-mono text-white">{expectedRuns.p90 ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Link href={localizedPath(locale, `/chests/${localItemSlug(drop.itemKey, drop.itemSlug)}`)} className="text-xs font-semibold text-[#f0c040] hover:underline">View Chest</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="border border-[#27272a] bg-[#0d0d0d]">
          <div className="border-b border-[#27272a] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">{txt(locale, { zh: "本关目标", en: "Targets here", ja: "出現対象", ko: "등장 대상" })}</h2>
          </div>
          <div className="grid gap-2 p-3 sm:grid-cols-2">
            {stage.monsters.map((monster) => (
              <Link key={monster.monsterKey} href={localizedPath(locale, `/monsters/${monster.monsterKey}`)} className="border border-[#27272a] bg-[#0a0a0a] p-3 text-sm text-white hover:border-[#d4a017]">
                <p className="font-semibold">{monster.name ?? `Monster ${monster.monsterKey}`}</p>
                <p className="mt-1 text-xs text-[#6c6c6c]">Weight {monster.weight}</p>
              </Link>
            ))}
            {stage.boss ? (
              <Link href={localizedPath(locale, `/monsters/${stage.boss.monsterKey}`)} className="border border-red-900/50 bg-[#160c0c] p-3 text-sm text-white hover:border-red-400">
                <p className="font-semibold">Boss: {stage.boss.name}</p>
                <p className="mt-1 text-xs text-[#c8a0a0]">HP x{((stage.boss.multipliers?.hp ?? 1000) / 1000).toFixed(1)}</p>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="border border-[#27272a] bg-[#0d0d0d]">
          <div className="border-b border-[#27272a] px-4 py-3">
            <h2 className="text-lg font-semibold text-white">{txt(locale, { zh: "箱子内容预览", en: "Chest content preview", ja: "宝箱内容", ko: "상자 내용 미리보기" })}</h2>
          </div>
          <div className="grid gap-2 p-3 sm:grid-cols-2">
            {contentPreview.map((content) => (
              <Link key={`${content.chestName}-${content.itemKey}-${content.condition ?? "base"}`} href={localizedPath(locale, `/items/${localItemSlug(content.itemKey, content.itemSlug)}`)} className="border border-[#27272a] bg-[#0a0a0a] p-3 hover:border-[#d4a017]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{content.name}</p>
                    <p className="mt-1 truncate text-xs text-[#6c6c6c]">{content.chestName}</p>
                  </div>
                  <RarityBadge grade={content.grade} locale={locale} />
                </div>
                <p className="mt-2 font-mono text-xs text-[#f0c040]">{content.chancePercent == null ? "-" : `${content.chancePercent.toFixed(2)}%`}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Metric({ icon, label, value, accent = "text-white" }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className="border border-[#3f2f10] bg-[#0a0a0a] p-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[#9d7b33]">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`mt-2 text-lg font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
