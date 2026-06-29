"use client";

import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Boxes, Clock3, Coins, Crosshair, Skull, Swords, Zap } from "lucide-react";
import type { Locale } from "@/lib/game-data/data";
import type { StageExplorerStage } from "@/lib/game-data/graph";
import { localizedPath } from "@/lib/locale-path";

const DIFFICULTIES = ["NORMAL", "NIGHTMARE", "HELL", "TORMENT"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const DIFF_LABELS: Partial<Record<Locale, Record<Difficulty, string>>> = {
  en: { NORMAL: "Normal", NIGHTMARE: "Nightmare", HELL: "Hell", TORMENT: "Torment" },
  zh: { NORMAL: "普通", NIGHTMARE: "噩梦", HELL: "地狱", TORMENT: "折磨" },
  ja: { NORMAL: "通常", NIGHTMARE: "悪夢", HELL: "地獄", TORMENT: "苦痛" },
};

const nodePositions = [
  { left: "50%", top: "88%" },
  { left: "58%", top: "79%" },
  { left: "53%", top: "69%" },
  { left: "61%", top: "60%" },
  { left: "55%", top: "51%" },
  { left: "60%", top: "42%" },
  { left: "52%", top: "33%" },
  { left: "46%", top: "25%" },
  { left: "38%", top: "18%" },
  { left: "52%", top: "11%" },
];

function t(locale: Locale, zh: string, en: string, ja = en) {
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

function gradeTone(grade: string) {
  if (grade === "COMMON") return "border-zinc-600/50 text-zinc-300";
  if (grade === "UNCOMMON") return "border-emerald-700/50 text-emerald-300";
  if (grade === "RARE") return "border-blue-700/50 text-blue-300";
  if (grade === "LEGENDARY") return "border-purple-700/50 text-purple-300";
  if (grade === "IMMORTAL") return "border-orange-700/50 text-orange-300";
  return "border-amber-700/50 text-amber-300";
}

function firstStage(stages: StageExplorerStage[], difficulty: Difficulty, act: number) {
  return stages.find((stage) => stage.difficulty === difficulty && stage.act === act) ?? stages[0];
}

function themeFor(difficulty: Difficulty, act: number) {
  if (difficulty === "HELL" || difficulty === "TORMENT") return "hell";
  if (act === 2) return "desert";
  if (act === 3) return "snow";
  return "meadow";
}

export function StageMap({ locale, stages }: { locale: Locale; stages: StageExplorerStage[] }) {
  const [difficulty, setDifficulty] = useState<Difficulty>("NORMAL");
  const [act, setAct] = useState(1);
  const [selectedKey, setSelectedKey] = useState(() => firstStage(stages, "NORMAL", 1)?.key ?? 0);
  const [clearTime, setClearTime] = useState(275);
  const [goldBonus, setGoldBonus] = useState(0);
  const [heroLevel, setHeroLevel] = useState(30);

  const difficultyStages = useMemo(
    () => stages.filter((stage) => stage.difficulty === difficulty),
    [difficulty, stages],
  );
  const actStages = useMemo(
    () => difficultyStages.filter((stage) => stage.act === act).sort((a, b) => a.no - b.no),
    [act, difficultyStages],
  );
  const selected = stages.find((stage) => stage.key === selectedKey) ?? actStages[0] ?? stages[0];

  const clearsPerHour = clearTime > 0 ? 3600 / clearTime : 0;
  const goldPerHour = Math.round((selected?.goldPerClear ?? 0) * clearsPerHour * (1 + goldBonus / 100));
  const expPerHour = Math.round((selected?.expPerClear ?? 0) * clearsPerHour);
  const levelGap = selected ? Math.max(0, selected.level - heroLevel) : 0;
  const expRetention = Math.max(0, 100 - levelGap * 12);

  function chooseDifficulty(next: Difficulty) {
    setDifficulty(next);
    const nextStage = firstStage(stages, next, act) ?? firstStage(stages, next, 1);
    if (!nextStage) return;
    setAct(nextStage.act);
    setSelectedKey(nextStage.key);
  }

  function chooseAct(next: number) {
    setAct(next);
    const nextStage = firstStage(stages, difficulty, next);
    if (nextStage) setSelectedKey(nextStage.key);
  }

  if (!selected) return null;

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto">
        <div className="grid gap-5" style={{ gridTemplateColumns: "420px minmax(720px, 1fr)", minWidth: "1160px" }}>
          <section className="border border-border-default bg-bg-panel p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">Stages</p>
                <h2 className="mt-1 text-lg font-semibold text-text-primary">{t(locale, "关卡路线", "Stage Route")}</h2>
              </div>
              <div className="flex gap-1">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => chooseDifficulty(diff)}
                    className={`border px-2.5 py-1.5 text-xs font-semibold transition ${
                      difficulty === diff
                        ? "border-[#5c6cff] bg-[#151a38] text-[#cbd2ff]"
                        : "border-border-default text-[#8a8a91] hover:border-[#4b4b55] hover:text-text-primary"
                    }`}
                  >
                    {(DIFF_LABELS[locale] ?? DIFF_LABELS.en!)[diff]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1">
              {[1, 2, 3].map((nextAct) => (
                <button
                  key={nextAct}
                  type="button"
                  onClick={() => chooseAct(nextAct)}
                  className={`border py-2 text-xs font-semibold transition ${
                    act === nextAct ? "border-accent bg-[#241806] text-[#ffd761]" : "border-border-default text-[#8a8a91] hover:text-text-primary"
                  }`}
                >
                  Act {nextAct}
                </button>
              ))}
            </div>

            <div className="relative mt-4 overflow-hidden border border-[#3b3420] bg-[#16120d] shadow-inner" style={{ height: "620px" }}>
              <PixelActMap theme={themeFor(difficulty, act)} />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 140" aria-hidden="true">
                <path d="M50 124 C60 112 49 101 58 88 C47 75 60 65 52 52 C66 40 39 35 52 18" fill="none" stroke="#4d231c" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="4 6" opacity="0.9" />
                <path d="M50 124 C60 112 49 101 58 88 C47 75 60 65 52 52 C66 40 39 35 52 18" fill="none" stroke="#9b6540" strokeWidth="1.35" strokeLinecap="round" strokeDasharray="4 6" opacity="0.85" />
              </svg>

              {actStages.map((stage, index) => {
                const active = stage.key === selected.key;
                const pos = nodePositions[index] ?? nodePositions[nodePositions.length - 1];
                return (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => setSelectedKey(stage.key)}
                    className={`absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-sm font-black shadow-lg transition ${
                      active
                        ? "z-20 scale-110 border-[#ffe78a] bg-[#ffb000] text-[#251300] shadow-[#ffb000]/40"
                        : "z-10 border-[#eadbc4] bg-[#251b20] text-[#fff2cf] hover:scale-105 hover:border-[#ffcf33]"
                    }`}
                    style={pos}
                    aria-label={`Stage ${stage.act}-${stage.no}`}
                  >
                    {stage.no}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 max-h-[280px] space-y-1 overflow-auto pr-1">
              {actStages.map((stage) => (
                <button
                  key={stage.key}
                  type="button"
                  onClick={() => setSelectedKey(stage.key)}
                  className={`grid w-full items-center gap-3 border px-3 py-2 text-left transition ${
                    stage.key === selected.key
                      ? "border-accent bg-accent-soft"
                      : "border-border-default bg-bg-deep hover:border-[#4b4b55]"
                  }`}
                  style={{ gridTemplateColumns: "44px minmax(0,1fr) auto" }}
                >
                  <span className="font-mono text-xs text-accent-bright">{stage.act}-{stage.no}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-text-primary">{stage.name}</span>
                    <span className="block truncate text-[11px] text-[#777]">
                      {stage.monsters.length} {t(locale, "怪", "mobs")} / {stage.drops.length} {t(locale, "掉落", "drops")}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-text-secondary">Lv.{stage.level}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="border border-border-default bg-bg-panel">
            <div className="flex flex-col gap-3 border-b border-border-default px-5 py-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-lg font-black text-[#ffcf33]">{selected.act}-{selected.no}</span>
                  <h2 className="text-2xl font-black tracking-tight text-text-primary">{selected.name}</h2>
                  <span className="rounded-full border border-[#5c6cff]/50 bg-[#151a38] px-2.5 py-0.5 text-xs font-semibold text-[#cbd2ff]">Lv {selected.level}</span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {selected.difficulty} / {selected.waves ?? "?"} waves / {selected.monsters.length} {t(locale, "种怪物", "monster types")}
                </p>
              </div>
              <Link href={localizedPath(locale, `/stages/${selected.key}`)} className="text-sm font-semibold text-[#7f8cff] hover:text-[#bcc4ff]">
                {t(locale, "完整详情", "Full details")} →
              </Link>
            </div>

            <div className="space-y-6 p-5">
              <div>
                <PanelTitle icon={<Crosshair className="h-4 w-4" />} title={t(locale, "刷图收益", "Farming")} meta={t(locale, "随下方参数即时变化", "updates from controls below")} />
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <ValueBox label={t(locale, "金币 / 小时", "Gold / hour")} value={goldPerHour.toLocaleString()} tone="gold" />
                  <ValueBox label={t(locale, "经验 / 小时", "EXP / hour")} value={expPerHour.toLocaleString()} tone="cyan" />
                  <ValueBox label={t(locale, "经验保留", "EXP retention")} value={`${expRetention}%`} tone={expRetention < 70 ? "red" : "cyan"} />
                  <ValueBox label={t(locale, "金币 / 次通关", "Gold / clear")} value={selected.goldPerClear?.toLocaleString() ?? "-"} tone="gold" />
                  <ValueBox label={t(locale, "经验 / 次通关", "EXP / clear")} value={selected.expPerClear?.toLocaleString() ?? "-"} tone="cyan" />
                  <ValueBox label={t(locale, "波次", "Waves")} value={selected.waves ?? "-"} />
                </div>
              </div>

              <div>
                <PanelTitle icon={<Skull className="h-4 w-4" />} title={t(locale, "怪物", "Monsters")} meta={`${selected.monsters.length + (selected.boss ? 1 : 0)} unique`} />
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {selected.boss ? (
                    <MonsterButton monster={{ ...selected.boss, hp: null, atk: null, attackTypes: ["Physical"], dropCount: selected.drops.filter((drop) => drop.sourceType === "boss").length, isBoss: true }} locale={locale} active />
                  ) : null}
                  {selected.monsters.map((monster) => (
                    <MonsterButton key={monster.key} monster={monster} locale={locale} />
                  ))}
                </div>
              </div>

              <div>
                <PanelTitle icon={<Boxes className="h-4 w-4" />} title={t(locale, "箱子掉落", "Chest Drops")} meta={`${selected.drops.length} entries`} />
                <div className="mt-3 space-y-2">
                  {selected.drops.map((drop) => (
                    <div key={`${drop.itemKey}-${drop.sourceType}`} className="grid items-center gap-3 border border-border-default bg-[#11111c] px-3 py-3 md:grid-cols-[92px_1fr_auto]">
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-[#777]">{drop.sourceType}</span>
                      <Link href={localizedPath(locale, `/chests/${drop.itemSlug}`)} className="flex min-w-0 items-center gap-3 text-[#7f8cff] hover:text-[#bcc4ff]">
                        {drop.icon ? <SafeImage src={drop.icon} alt="" width={24} height={24} className="object-contain" unoptimized /> : <Boxes className="h-4 w-4" />}
                        <span className="truncate font-semibold">{drop.name}</span>
                      </Link>
                      <span className="font-mono text-sm font-black text-[#00f0a8]">{rateLabel(drop.ratePercent)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <PanelTitle icon={<Swords className="h-4 w-4" />} title={t(locale, "箱子内容", "Chest Contents")} meta={t(locale, "本关可追踪目标", "stage targets")} />
                <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {selected.drops.flatMap((drop) => drop.contents.slice(0, 6).map((content) => ({ ...content, chest: drop.name }))).slice(0, 12).map((content) => (
                    <Link
                      key={`${content.chest}-${content.itemKey}`}
                      href={localizedPath(locale, `/items/${content.itemSlug}`)}
                      className="group border border-border-default bg-bg-deep p-3 transition hover:border-accent/70"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border-default bg-[#050505]">
                          {content.icon ? <SafeImage src={content.icon} alt="" width={34} height={34} className="object-contain" unoptimized /> : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-text-primary group-hover:text-accent-bright">{content.name}</p>
                          <p className="mt-1 truncate text-[11px] text-[#777]">{content.chest}</p>
                        </div>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${gradeTone(content.grade)}`}>{content.grade}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{content.type}</span>
                        <span className="font-mono font-black text-accent-bright">{rateLabel(content.chancePercent)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="grid gap-4 border border-border-default bg-bg-panel p-4 lg:grid-cols-3">
        <SliderControl icon={<Clock3 className="h-4 w-4" />} label={t(locale, "通关时间（秒）", "Clear time (sec)")} value={clearTime} min={30} max={900} step={5} onChange={setClearTime} suffix={`${(3600 / clearTime).toFixed(1)} / h`} />
        <SliderControl icon={<Coins className="h-4 w-4" />} label={t(locale, "金币加成（%）", "Gold bonus (%)")} value={goldBonus} min={0} max={300} step={5} onChange={setGoldBonus} suffix={goldBonus ? `+${goldBonus}%` : t(locale, "无加成", "none")} />
        <SliderControl icon={<Zap className="h-4 w-4" />} label={t(locale, "英雄等级", "Hero level")} value={heroLevel} min={1} max={100} step={1} onChange={setHeroLevel} suffix={t(locale, "用于经验衰减判断", "for EXP penalty")} />
      </section>
    </div>
  );
}

function PixelActMap({ theme }: { theme: "meadow" | "desert" | "snow" | "hell" }) {
  const palette = {
    meadow: { base: "#6f8f45", light: "#9fbd67", dark: "#3f5d2b", road: "#8a6037", water: "#436b8f", hill: "#b69254", roof: "#a3422f" },
    desert: { base: "#b89458", light: "#d7bd7c", dark: "#86683c", road: "#7d4c2e", water: "#446f88", hill: "#8f7445", roof: "#9d3e2f" },
    snow: { base: "#9aa7ad", light: "#d7e3e8", dark: "#596872", road: "#6b5546", water: "#385f7c", hill: "#7f8a91", roof: "#7b2e3c" },
    hell: { base: "#5a332b", light: "#9a5934", dark: "#231316", road: "#7b2d22", water: "#66202b", hill: "#3c1d1a", roof: "#c44b22" },
  }[theme];

  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 112 168" preserveAspectRatio="none" aria-hidden="true" style={{ imageRendering: "pixelated" }}>
      <rect width="112" height="168" fill={palette.base} />
      <path d="M0 0H112V168H0Z" fill="url(#grid)" opacity="0.35" />
      <rect x="0" y="0" width="112" height="168" fill="none" stroke="#2c2418" strokeWidth="2" />

      <g shapeRendering="crispEdges">
        <rect x="8" y="12" width="12" height="8" fill={palette.light} opacity="0.45" />
        <rect x="22" y="10" width="14" height="10" fill={palette.light} opacity="0.35" />
        <rect x="76" y="23" width="22" height="10" fill={palette.dark} opacity="0.35" />
        <rect x="11" y="118" width="24" height="18" fill={palette.dark} opacity="0.38" />
        <rect x="76" y="120" width="20" height="14" fill={palette.dark} opacity="0.32" />
        <rect x="6" y="145" width="100" height="7" fill="#1e1710" opacity="0.18" />
      </g>

      <g shapeRendering="crispEdges">
        {[10, 20, 30].map((x, index) => (
          <g key={`mountain-${x}`}>
            <rect x={x} y={24 + index * 5} width="8" height="6" fill={palette.hill} />
            <rect x={x + 2} y={20 + index * 5} width="4" height="4" fill={palette.light} />
            <rect x={x + 6} y={28 + index * 5} width="4" height="4" fill={palette.dark} opacity="0.55" />
          </g>
        ))}
        {[68, 79, 90].map((x, index) => (
          <g key={`forest-${x}`}>
            <rect x={x} y={66 + index * 6} width="5" height="5" fill={palette.dark} />
            <rect x={x - 2} y={71 + index * 6} width="9" height="5" fill={palette.dark} />
            <rect x={x + 1} y={76 + index * 6} width="3" height="4" fill="#4a2a19" />
          </g>
        ))}
        {[18, 26, 34].map((x, index) => (
          <g key={`village-${x}`}>
            <rect x={x} y={72 + index * 8} width="8" height="7" fill="#6c5230" />
            <rect x={x - 1} y={69 + index * 8} width="10" height="4" fill={palette.roof} />
            <rect x={x + 3} y={75 + index * 8} width="2" height="4" fill="#23170f" />
          </g>
        ))}
        <rect x="74" y="38" width="18" height="8" fill={palette.water} opacity="0.75" />
        <rect x="78" y="46" width="22" height="7" fill={palette.water} opacity="0.65" />
        <rect x="12" y="44" width="18" height="8" fill={palette.light} opacity="0.35" />
      </g>

      <defs>
        <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="#20180f" opacity="0.5" />
        </pattern>
      </defs>
    </svg>
  );
}

function PanelTitle({ icon, title, meta }: { icon: React.ReactNode; title: string; meta?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-text-secondary">{icon}</span>
        <h3 className="text-sm font-black uppercase tracking-[0.08em] text-text-primary">{title}</h3>
      </div>
      {meta ? <span className="text-xs text-[#777]">{meta}</span> : null}
    </div>
  );
}

function ValueBox({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "gold" | "cyan" | "red" }) {
  const color = tone === "gold" ? "text-[#ffcf33]" : tone === "cyan" ? "text-[#28e6ff]" : tone === "red" ? "text-[#ff4c6a]" : "text-text-primary";
  return (
    <div className="border border-border-default bg-[#151525] px-3 py-3">
      <p className="text-[11px] text-[#777]">{label}</p>
      <p className={`mt-1 font-mono text-lg font-black ${color}`}>{value}</p>
    </div>
  );
}

function MonsterButton({
  monster,
  locale,
  active = false,
}: {
  monster: {
    key: number;
    name: string;
    portrait: string | null;
    hp: number | null;
    atk: number | null;
    attackTypes: string[];
    dropCount: number;
    isBoss: boolean;
  };
  locale: Locale;
  active?: boolean;
}) {
  return (
    <Link
      href={localizedPath(locale, `/monsters/${monster.key}`)}
      className={`flex min-w-0 items-center gap-3 border px-3 py-2 transition ${
        active ? "border-[#a15a00] bg-[#2a120d]" : "border-border-default bg-[#11111c] hover:border-[#4b4b55]"
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border-default bg-[#050505]">
        {monster.portrait ? <SafeImage src={monster.portrait} alt="" width={30} height={30} className="object-contain" unoptimized /> : <Skull className="h-4 w-4 text-[#777]" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">{monster.name}</p>
        <p className="mt-0.5 truncate text-[11px] text-[#777]">
          HP {monster.hp ?? "-"} / ATK {monster.atk ?? "-"} / {monster.dropCount} {t(locale, "掉落", "drops")}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="rounded-full border border-[#64748b] bg-[#202437] px-2 py-0.5 text-[10px] font-bold text-[#dbeafe]">
          {monster.attackTypes[0] ?? "Physical"}
        </span>
        {monster.isBoss ? <span className="rounded-full bg-[#ffb000] px-2 py-0.5 text-[10px] font-black text-[#1b1200]">BOSS</span> : null}
      </div>
    </Link>
  );
}

function SliderControl({
  icon,
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-secondary">
        <span className="text-[#777]">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 72px" }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full accent-[#6b78ff]"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="border border-border-default bg-[#11111c] px-2 py-1 text-right font-mono text-sm text-text-primary"
        />
      </div>
      <p className="mt-2 text-xs text-[#777]">{suffix}</p>
    </div>
  );
}
