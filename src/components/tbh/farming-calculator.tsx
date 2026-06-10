"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Coins, PackageOpen, ShieldCheck, Zap } from "lucide-react";
import { allStages, stageName, stageSlug, type Locale } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";

type Goal = "exp" | "gold" | "chest" | "pet";
const difficultyRank: Record<string, number> = { NORMAL: 1, NIGHTMARE: 2, HELL: 3, TORMENT: 4 };

function t(locale: Locale, values: Record<Locale | "en", string>) {
  return values[locale] ?? values.en;
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString();
}

export function FarmingCalculator({ locale }: { locale: Locale }) {
  const [heroLevel, setHeroLevel] = useState(30);
  const [highestStageKey, setHighestStageKey] = useState(() => allStages().find((stage) => stage.difficulty === "NORMAL" && stage.act === 3 && stage.no === 1)?.key ?? allStages()[0]?.key ?? 0);
  const [clearSeconds, setClearSeconds] = useState(90);
  const [goal, setGoal] = useState<Goal>("exp");

  const highestStage = allStages().find((stage) => stage.key === highestStageKey) ?? allStages()[0];
  const maxRank = difficultyRank[highestStage?.difficulty ?? "NORMAL"] ?? 1;
  const maxProgress = `${highestStage?.act ?? 1}-${highestStage?.no ?? 1}`;

  const rows = useMemo(() => {
    const seconds = Math.max(20, clearSeconds || 20);
    return allStages()
      .filter((stage) => (difficultyRank[stage.difficulty] ?? 0) <= maxRank)
      .filter((stage) => stage.difficulty !== highestStage?.difficulty || stage.act < highestStage.act || (stage.act === highestStage.act && stage.no <= highestStage.no))
      .filter((stage) => stage.level <= heroLevel + 20)
      .map((stage) => {
        const clearsPerHour = 3600 / seconds;
        const expPerHour = Number(stage.expPerClear ?? 0) * clearsPerHour;
        const goldPerHour = Number(stage.goldPerClear ?? 0) * clearsPerHour;
        const levelGap = stage.level - heroLevel;
        const stability = levelGap > 12 ? 0.72 : levelGap > 8 ? 0.84 : levelGap > 4 ? 0.94 : 1;
        const chestScore = Number(stage.kills ?? stage.monsterCount ?? 0) + (stage.boss ? 30 : 0);
        const petScore = Number(stage.kills ?? stage.monsterCount ?? 0);
        const baseScore =
          goal === "exp"
            ? expPerHour
            : goal === "gold"
              ? goldPerHour
              : goal === "chest"
                ? chestScore * clearsPerHour
                : petScore * clearsPerHour;
        return {
          stage,
          expPerHour,
          goldPerHour,
          clearStability: stability,
          levelGap,
          score: baseScore * stability,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [clearSeconds, goal, heroLevel, highestStage, maxRank]);

  const best = rows[0] ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <aside className="space-y-4 border border-[#27272a] bg-[#0d0d0d] p-4">
        <Field label={t(locale, { zh: "英雄等级", en: "Hero level", ja: "ヒーローレベル", ko: "영웅 레벨" })}>
          <input type="number" min={1} max={200} value={heroLevel} onChange={(event) => setHeroLevel(Number(event.target.value))} className="w-full border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none" />
        </Field>
        <Field label={t(locale, { zh: "最高稳定关卡", en: "Highest reliable stage", ja: "安定クリア上限", ko: "안정 클리어 최고 스테이지" })}>
          <select value={highestStageKey} onChange={(event) => setHighestStageKey(Number(event.target.value))} className="w-full border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm text-white">
            {allStages().map((stage) => (
              <option key={stage.key} value={stage.key}>
                {stage.difficulty} {stage.act}-{stage.no} / Lv.{stage.level}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t(locale, { zh: "该关通关秒数", en: "Clear seconds", ja: "クリア秒数", ko: "클리어 초" })}>
          <input type="number" min={20} value={clearSeconds} onChange={(event) => setClearSeconds(Number(event.target.value))} className="w-full border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none" />
        </Field>
        <Field label={t(locale, { zh: "目标", en: "Goal", ja: "目的", ko: "목표" })}>
          <div className="grid grid-cols-2 gap-2">
            {(["exp", "gold", "chest", "pet"] as const).map((value) => (
              <button key={value} onClick={() => setGoal(value)} className={`border px-3 py-2 text-sm ${goal === value ? "border-[#d4a017] bg-[#1a1508] text-[#f0c040]" : "border-[#27272a] text-[#9d9d9d] hover:border-[#3b3b3b]"}`}>
                {value === "pet" ? "Pet kills" : value.toUpperCase()}
              </button>
            ))}
          </div>
        </Field>
        <p className="border-t border-[#27272a] pt-3 text-xs leading-5 text-[#6c6c6c]">
          {t(locale, {
            zh: `当前进度上限：${maxProgress}`,
            en: `Current progress cap: ${maxProgress}`,
            ja: `現在の進行上限: ${maxProgress}`,
            ko: `현재 진행 한도: ${maxProgress}`,
          })}
        </p>
      </aside>

      <section className="space-y-4">
        {best ? (
          <div className="border border-[#3f2f10] bg-[#100d06] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d4a017]">
              {t(locale, { zh: "现在该刷", en: "Farm now", ja: "今周回する場所", ko: "지금 돌 곳" })}
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">{best.stage.difficulty} Act {best.stage.act}-{best.stage.no}</h2>
                <p className="mt-1 text-sm text-[#d8d1c2]">{stageName(best.stage, locale)}</p>
              </div>
              <Link href={localizedPath(locale, `/stages/${stageSlug(best.stage)}`)} className="inline-flex items-center gap-2 bg-[#d4a017] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c040]">
                {t(locale, { zh: "打开关卡详情", en: "Open stage", ja: "ステージ詳細", ko: "스테이지 열기" })}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              <Metric icon={<Zap className="h-4 w-4" />} label="EXP/hour" value={formatNumber(best.expPerHour)} accent="text-emerald-300" />
              <Metric icon={<Coins className="h-4 w-4" />} label="Gold/hour" value={formatNumber(best.goldPerHour)} accent="text-[#f0c040]" />
              <Metric icon={<ShieldCheck className="h-4 w-4" />} label={t(locale, { zh: "稳定性", en: "Stability", ja: "安定性", ko: "안정성" })} value={`${Math.round(best.clearStability * 100)}%`} accent="text-cyan-300" />
              <Metric icon={<PackageOpen className="h-4 w-4" />} label={t(locale, { zh: "原因", en: "Why", ja: "理由", ko: "이유" })} value={goal === "exp" ? "EXP" : goal === "gold" ? "Gold" : goal === "chest" ? "Chests" : "Kills"} />
            </div>
          </div>
        ) : null}

        <div className="border border-[#27272a] bg-[#0d0d0d]">
          <div className="border-b border-[#27272a] px-4 py-3">
            <p className="text-sm font-semibold text-white">{t(locale, { zh: "后 5 个备选", en: "Next 5 alternatives", ja: "次の候補 5 件", ko: "다음 대안 5개" })}</p>
          </div>
          <div className="divide-y divide-[#27272a]">
            {rows.map(({ stage, expPerHour, goldPerHour, clearStability }, index) => (
              <Link key={stage.key} href={localizedPath(locale, `/stages/${stageSlug(stage)}`)} className="grid gap-2 p-3 hover:bg-[#111] sm:grid-cols-[60px_1fr_120px_120px_90px]">
                <span className="font-mono text-sm text-[#f0c040]">#{index + 1}</span>
                <span className="text-sm text-white">{stage.difficulty} Act {stage.act}-{stage.no}</span>
                <span className="font-mono text-sm text-emerald-300">{formatNumber(expPerHour)} EXP/h</span>
                <span className="font-mono text-sm text-[#f0c040]">{formatNumber(goldPerHour)} Gold/h</span>
                <span className="text-sm text-[#9d9d9d]">{Math.round(clearStability * 100)}%</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6c6c6c]">{label}</label>
      {children}
    </div>
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
