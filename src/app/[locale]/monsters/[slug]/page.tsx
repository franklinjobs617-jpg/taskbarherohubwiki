import type { Metadata } from "next";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, PawPrint, Swords } from "lucide-react";
import { Breadcrumb } from "@/components/tbh/breadcrumb";
import { FaqBlock } from "@/components/tbh/faq-block";
import { entityFaqs } from "@/lib/game-data/faqs";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allMonsters, allStages, text, type Locale } from "@/lib/game-data/data";
import { extPets } from "@/lib/game-data/external";
import { localizedPath } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

function monsterPortrait(portrait?: string | null): string | null {
  if (!portrait) return null;
  const parts = portrait.split("/");
  return `/game/monsters/${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

function findMonster(slug: string) {
  const decoded = decodeURIComponent(slug);
  return allMonsters().find((m) => m.slug === decoded || String(m.MonsterKey) === decoded) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const monster = findMonster(slug);
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
  const monster = findMonster(slug);
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
  const relatedPets = extPets().filter((p) => p.unlock.type === "KillMonster" && p.unlock.monsterKey === monster.MonsterKey);
  const lpath = (path: string) => localizedPath(locale, path);

  return (
    <PageShell>
      <Breadcrumb locale={locale} items={[{ label: "Home", href: "/" }, { label: isZh ? "怪物" : locale === "ja" ? "モンスター" : "Monsters", href: "/monsters" }, { label: name }]} />
      <PageHeader
        kicker={isBoss ? "Boss" : "Monster"}
        title={name}
        description={
          isZh
            ? `类型: ${monster.MONSTERTYPE ?? "?"} · 金币: ${monster.RewardGold ?? "-"} · EXP: ${monster.RewardExp ?? "-"} · 出现于 ${monsterStages.length} 个关卡`
            : `Type: ${monster.MONSTERTYPE ?? "?"} · Gold: ${monster.RewardGold ?? "-"} · EXP: ${monster.RewardExp ?? "-"} · Appears in ${monsterStages.length} stages`
        }
      />

      <section className="mb-6 border border-[#3a2d12] bg-[#171105] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d7b2b]">
          {isZh ? "Quick answer" : "Quick answer"}
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">
          {isZh ? `${name} 是什么？` : `What is ${name}?`}
        </h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          {isZh
            ? `${name} 是 TBH: Task Bar Hero 的 ${monster.MONSTERTYPE ?? "monster"} 实体，当前数据记录显示它出现在 ${monsterStages.length} 个关卡。${relatedPets.length ? `它关联 ${relatedPets.map((p) => p.name).join(", ")} 宠物解锁。` : "当前未发现直接宠物解锁关联。"} 掉落、材料用途和最佳刷取入口需要结合下方关卡列表、宠物页和 farming calculator 判断；当前没有足够证据支持具体掉率结论。`
            : `${name} is a TBH: Task Bar Hero ${monster.MONSTERTYPE ?? "monster"} entity. Current data shows it appears in ${monsterStages.length} stage entries. ${relatedPets.length ? `It is linked to pet unlocks for ${relatedPets.map((p) => p.name).join(", ")}.` : "No direct pet unlock link is recorded for this monster."} Use the stage list below, the Pets page, and the farming calculator to choose a farming entry. 当前没有足够证据支持具体掉率结论。`}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={lpath("/pets")} className="border border-[#4a3510] bg-bg-panel px-3 py-2 text-sm text-accent-bright hover:border-accent">{isZh ? "宠物解锁" : "Pet unlocks"}</Link>
          <Link href={lpath("/tools/farming-calculator")} className="border border-[#4a3510] bg-bg-panel px-3 py-2 text-sm text-accent-bright hover:border-accent">{isZh ? "刷取入口" : "Farming entry"}</Link>
          <Link href={lpath("/market")} className="border border-[#4a3510] bg-bg-panel px-3 py-2 text-sm text-accent-bright hover:border-accent">{isZh ? "市场参考" : "Market references"}</Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Portrait */}
        <div className="flex flex-col items-center gap-3 rounded-sm border border-border-default bg-bg-panel p-6">
          <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-sm border border-border-strong bg-bg-canvas">
            {img ? (
              <SafeImage src={img} alt={name} width={160} height={160} className="object-contain" unoptimized />
            ) : (
              <span className="text-sm text-text-muted">No image</span>
            )}
          </div>
          <div className="text-center">
            <span className="rounded bg-bg-surface px-2 py-0.5 text-[10px] text-text-secondary">{monster.MONSTERTYPE ?? "Unknown"}</span>
            {isBoss && (
              <span className="ml-1 rounded bg-red-900/30 px-2 py-0.5 text-[10px] text-red-400">Boss</span>
            )}
          </div>
        </div>

        {/* Stage list */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-text-muted">
            {isZh ? `出现关卡 (${monsterStages.length})` : `Stage Appearances (${monsterStages.length})`}
          </h2>
          {monsterStages.length > 0 ? (
            <div className="grid gap-1 sm:grid-cols-2">
              {monsterStages.map(({ key, boss, spawnPct, perClear, stage }) => (
                <Link
                  key={key}
                  href={`/${locale}/stages/${stage!.key}`}
                  className="flex items-center gap-2 rounded-sm border border-border-default bg-bg-panel px-3 py-2 text-xs transition-colors hover:border-accent-dim"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${boss ? "bg-red-400" : "bg-emerald-400"}`} />
                  <span className="font-mono text-text-secondary">
                    {stage!.difficulty} A{stage!.act}-{stage!.no}
                  </span>
                  <span className="truncate text-text-muted">
                    {text(stage!.name, locale, `Stage ${stage!.key}`)}
                  </span>
                  <span className="ml-auto shrink-0 text-[10px] text-text-muted">
                    {spawnPct != null ? `${spawnPct}%` : ""}{" "}
                    ×{perClear}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              {isZh ? "暂无出现关卡数据" : "No stage data available"}
            </p>
          )}
        </div>
      </div>

      {/* Bottom nav: pet unlock + farming */}
      {(() => {
        return (
          <div className="mt-8 grid gap-3 border-t border-border-default pt-6 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
                {isZh ? "← 相关系统" : "← Related"}
              </p>
              <Link href={`/${locale}/monsters`} className="flex items-center gap-2 rounded-sm border border-border-default bg-bg-panel p-3 text-xs transition-colors hover:border-accent-dim group">
                <Swords className="h-4 w-4 shrink-0 text-text-muted group-hover:text-amber-400" />
                <span className="text-text-secondary group-hover:text-text-primary">{isZh ? "全部怪物图鉴" : "All Monsters"}</span>
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
                {isZh ? "下一步 →" : "Next Steps →"}
              </p>
              {relatedPets.length > 0 && relatedPets.map((pet) => (
                <Link key={pet.key} href={`/${locale}/pets`} className="flex items-center gap-2 rounded-sm border border-amber-600/20 bg-amber-600/5 p-3 text-xs transition-colors hover:border-amber-400 group">
                  <PawPrint className="h-4 w-4 shrink-0 text-amber-400" />
                  <span className="flex-1 text-text-secondary group-hover:text-text-primary">
                    {isZh ? `击杀 ${pet.unlock.count ?? "?"} 只可解锁宠物: ${pet.name}` : `Kill ${pet.unlock.count ?? "?"} to unlock pet: ${pet.name}`}
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-text-muted group-hover:text-amber-400" />
                </Link>
              ))}
              {monsterStages.length > 0 && (
                <Link href={`/${locale}/tools/farming-calculator`} className="flex items-center gap-2 rounded-sm border border-border-default bg-bg-panel p-3 text-xs transition-colors hover:border-accent-dim group">
                  <ArrowRight className="h-4 w-4 shrink-0 text-text-muted group-hover:text-amber-400" />
                  <span className="text-text-secondary group-hover:text-text-primary">{isZh ? "Farming 计算器 — 找出最佳刷怪关卡" : "Farming Calculator — find best stage"}</span>
                </Link>
              )}
            </div>
          </div>
        );
      })()}
      <FaqBlock faqs={(entityFaqs.monsters?.[locale] ?? entityFaqs.monsters?.en ?? []).map(f => ({question: f.q, answer: f.a}))} title={isZh ? "常见问题" : locale === "ja" ? "よくある質問" : "FAQ"} />
    </PageShell>
  );
}
