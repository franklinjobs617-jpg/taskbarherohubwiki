import type { Metadata } from "next";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { MapPin, PawPrint, Star, Target } from "lucide-react";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allStages, stageSlug, type Locale , ensureStages } from "@/lib/game-data/data";
import { getPetUnlockPlan } from "@/lib/game-data/decisions";
import { ensureExtPets } from "@/lib/game-data/external";
import { localizedPath } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";
import { RelatedPages } from "@/components/tbh/related-pages";
import { HowToUse } from "@/components/tbh/how-to-use";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ priority?: string }> };

function txt(locale: Locale, values: Record<Locale | "en", string>) {
  return values[locale] ?? values.en;
}

function stageHref(locale: Locale, farm: { act: number; stageNo: number } | null | undefined) {
  if (!farm) return localizedPath(locale, "/map");
  const stage = allStages().find((row) => row.difficulty === "NORMAL" && row.act === farm.act && row.no === farm.stageNo);
  return localizedPath(locale, `/stages/${stage ? stageSlug(stage) : `normal-${farm.act}-${farm.stageNo}`}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureStages();

  const { locale } = await params;
  return {
    title: locale === "zh" ? "TBH 宠物解锁 | 最佳关卡、目标与击杀数" : "TBH Pets Unlock | Best Stages, Targets & Kill Counts",
    description: locale === "zh" ? "查看每个宠物的 bonus、解锁目标、击杀数、最佳刷取关卡、怪物占比和前期/金币/宝箱/DLC 优先级。" : "See each pet bonus, unlock target, kill count, best farming stage, spawn share, and early/gold/chest/DLC priority.",
    alternates: pageAlternates(locale, "/pets"),
  };
}

export default async function PetsPage({ params, searchParams }: Props) {
  await Promise.all([ensureStages(), ensureExtPets()]);

  const { locale } = await params;
  const sp = await searchParams;
  const plan = getPetUnlockPlan(locale);
  const filterPriority = sp.priority;
  const picks = [
    { label: "First pet", row: plan.firstPet },
    { label: "Best gold pet", row: plan.bestGoldPet },
    { label: "Best chest pet", row: plan.bestChestPet },
    { label: "Best DLC pet", row: plan.bestDlcPet },
  ].filter((entry) => entry.row);

  return (
    <PageShell>
      <PageHeader
        kicker="Pets"
        title={txt(locale, { zh: "宠物解锁路线", en: "Pet Unlock Routes", ja: "ペット解放ルート", ko: "펫 해금 루트" })}
        description={txt(locale, {
          zh: "推荐优先级、目标怪、击杀数、最佳关卡和占比。",
          en: "Priority picks, target, kill count, best stage, and spawn share.",
          ja: "優先度、対象、討伐数、最適ステージ、出現比率。",
          ko: "우선순위, 대상, 처치 수, 추천 스테이지, 출현 비율.",
        })}
      />

      <HowToUse pageKey="/pets" locale={locale} />
      <section className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {picks.map(({ label, row }) => row ? (
          <Link key={label} href={stageHref(locale, row.bestFarmStage)} className="border border-accent-dim bg-accent-soft p-4 hover:border-accent">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9d7b33]">{label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{row.name}</p>
            <p className="mt-1 text-xs text-text-secondary">{row.bestFarmStage ? `${row.bestFarmStage.label} ${row.bestFarmStage.stageName}` : row.priority}</p>
          </Link>
        ) : null)}
      </section>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <span className="text-xs text-text-muted self-center mr-1">{txt(locale, { zh: "按优先级：", en: "Priority:", ja: "優先度：", ko: "우선순위：" })}</span>
        {[
          { k: "any", zh: "全部", en: "Any", ja: "全て", ko: "전체" },
          { k: "Early", zh: "新手先开", en: "Early", ja: "初心者優先", ko: "초보 우선" },
          { k: "Gold", zh: "金币优先", en: "Gold", ja: "金策", ko: "골드" },
          { k: "Chest", zh: "宝箱优先", en: "Chest", ja: "宝箱", ko: "상자" },
          { k: "DLC", zh: "DLC", en: "DLC", ja: "DLC", ko: "DLC" },
        ].map((p) => (
          <Link key={p.k} href={localizedPath(locale, `/pets?priority=${p.k}`)} className={`pill text-xs ${filterPriority === p.k ? "active" : ""}`}>
            {locale === "zh" ? p.zh : locale === "ja" ? p.ja : locale === "ko" ? p.ko : p.en}
          </Link>
        ))}
        {filterPriority && filterPriority !== "any" ? (
          <Link href={localizedPath(locale, `/pets`)} className="pill text-xs text-text-secondary hover:text-text-primary">
            {txt(locale, { zh: "清除", en: "Clear", ja: "クリア", ko: "초기화" })}
          </Link>
        ) : null}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {plan.pets.filter((row) => !filterPriority || filterPriority === "any" || row.priority === filterPriority).map((row) => (
          <div key={row.pet.key} className={`border bg-bg-panel p-5 ${row.pet.dlc ? "border-accent-dim" : "border-border-default"}`}>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-border-default bg-bg-canvas">
                <SafeImage src={`/game/pets/${row.pet.icon}.png`} alt={row.name} width={40} height={40} className="object-contain" data-pixel unoptimized />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-text-primary">{row.name}</h2>
                  <span className="border border-border-strong px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-bright">{row.priority}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-text-secondary">{row.bonus}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <Line icon={<Target className="h-4 w-4" />} label={txt(locale, { zh: "目标", en: "Target", ja: "対象", ko: "대상" })} value={row.targetMonster ?? row.unlockType} />
              <Line icon={<PawPrint className="h-4 w-4" />} label={txt(locale, { zh: "击杀数", en: "Kill count", ja: "討伐数", ko: "처치 수" })} value={row.killCount?.toLocaleString() ?? "-"} />
              <Line icon={<MapPin className="h-4 w-4" />} label={txt(locale, { zh: "最佳关卡", en: "Best stage", ja: "最適ステージ", ko: "추천 스테이지" })} value={row.bestFarmStage ? `${row.bestFarmStage.label} ${row.bestFarmStage.stageName}` : "DLC"} href={stageHref(locale, row.bestFarmStage)} />
              <Line icon={<Star className="h-4 w-4" />} label={txt(locale, { zh: "占比", en: "Spawn share", ja: "出現比率", ko: "출현 비율" })} value={row.bestFarmStage ? `${row.bestFarmStage.share}%` : "-"} />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border-default pt-3 text-[11px]">
              <span className="text-text-muted">{txt(locale, { zh: "按优先级", en: "Priority", ja: "優先度", ko: "우선순위" })}: {row.priority}</span>
              <Link
                href={localizedPath(locale, `/pets?priority=${row.priority}&compare=${row.pet.key}`)}
                className="text-accent hover:text-accent-bright"
                title={txt(locale, { zh: "对比同优先级其他宠物", en: "Compare with other pets of same priority", ja: "同優先度のペットと比較", ko: "같은 우선순위 펫과 비교" })}
              >
                {txt(locale, { zh: "对比 →", en: "Compare →", ja: "比較 →", ko: "비교 →" })} ↗
              </Link>
            </div>
          </div>
        ))}
      </section>
      <RelatedPages pageKey="/pets" locale={locale} />
    </PageShell>
  );
}

function Line({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <>
      <span className="flex items-center gap-2 text-text-secondary">{icon}{label}</span>
      <span className="min-w-0 truncate font-semibold text-accent-bright">{value}</span>
    </>
  );
  if (href) {
    return <Link href={href} className="flex items-center justify-between gap-3 border border-border-default bg-bg-canvas px-3 py-2 hover:border-accent">{content}</Link>;
  }
  return <div className="flex items-center justify-between gap-3 border border-border-default bg-bg-canvas px-3 py-2">{content}</div>;
}
