"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { allStages, type Locale, type Stage } from "@/lib/game-data/data";

const DIFFICULTIES = ["NORMAL", "NIGHTMARE", "HELL", "TORMENT"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const DIFF_LABELS: Partial<Record<Locale, Record<Difficulty, string>>> = {
  en: { NORMAL: "Normal", NIGHTMARE: "Nightmare", HELL: "Hell", TORMENT: "Torment" },
  zh: { NORMAL: "普通", NIGHTMARE: "噩梦", HELL: "地狱", TORMENT: "折磨" },
  ja: { NORMAL: "通常", NIGHTMARE: "悪夢", HELL: "地獄", TORMENT: "苦痛" },
};

const DIFF_COLORS: Record<Difficulty, string> = {
  NORMAL: "border-emerald-800/40 bg-emerald-950/20",
  NIGHTMARE: "border-purple-800/40 bg-purple-950/20",
  HELL: "border-red-800/40 bg-red-950/20",
  TORMENT: "border-amber-800/40 bg-amber-950/20",
};

const DIFF_TEXT: Record<Difficulty, string> = {
  NORMAL: "text-emerald-400",
  NIGHTMARE: "text-purple-400",
  HELL: "text-red-400",
  TORMENT: "text-amber-400",
};

function stageImage(stage: Stage): string | null {
  const boss = stage.boss;
  if (boss?.portrait) {
    const parts = boss.portrait.split("/");
    const dir = parts[parts.length - 2];
    const file = parts[parts.length - 1];
    return `/game/monsters/${dir}/${file}`;
  }
  return null;
}

export function StageMap({ locale }: { locale: Locale }) {
  const [difficulty, setDifficulty] = useState<Difficulty>("NORMAL");
  const isZh = locale === "zh";
  const stages = allStages().filter((s) => s.difficulty === difficulty);

  // Group by act
  const acts = [1, 2, 3].map((act) => ({
    act,
    stages: stages
      .filter((s) => s.act === act)
      .sort((a, b) => a.no - b.no),
  }));

  return (
    <div className="space-y-6">
      {/* Difficulty Tabs */}
      <div className="flex gap-1">
        {DIFFICULTIES.map((diff) => (
          <button
            key={diff}
            onClick={() => setDifficulty(diff)}
            className={`px-4 py-2 text-sm font-medium transition-colors border ${
              difficulty === diff
                ? `${DIFF_COLORS[diff]} ${DIFF_TEXT[diff]} border-current`
                : "border-[#27272a] text-[#6c6c6c] hover:border-[#3b3b3b]"
            }`}
          >
            {(DIFF_LABELS[locale] ?? DIFF_LABELS.en!)[diff]}
          </button>
        ))}
      </div>

      {/* Act×Stage Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {acts.map(({ act, stages: actStages }) => (
          <div key={act} className="space-y-1">
            {/* Act Header */}
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
                {isZh ? `第 ${act} 章` : `Act ${act}`}
              </h3>
              <span className="text-[10px] text-[#555]">
                {isZh ? `${actStages.length} 关` : `${actStages.length} stages`}
              </span>
            </div>

            {/* Stage Cards */}
            <div className="space-y-1">
              {actStages.map((stage) => {
                const img = stageImage(stage);
                const boss = stage.boss;

                return (
                  <Link
                    key={stage.key}
                    href={`/${locale}/stages/${stage.key}`}
                    className={`group flex items-center gap-3 rounded-sm border px-3 py-2 transition-all hover:border-amber-600/40 ${DIFF_COLORS[difficulty]}`}
                  >
                    {/* Stage Number */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-[#27272a] bg-[#0a0a0a] font-mono text-xs text-[#9d9d9d] group-hover:text-amber-400">
                      {act}-{stage.no}
                    </div>

                    {/* Boss/Monster Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-[#27272a] bg-[#0a0a0a]">
                      {img ? (
                        <Image
                          src={img}
                          alt={boss?.name?.["en-US"] ?? `Stage ${stage.key}`}
                          width={40}
                          height={40}
                          className="object-contain p-1"
                          unoptimized
                        />
                      ) : (
                        <span className="text-[8px] text-[#555]">-</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[#d8d1c2] group-hover:text-amber-400 transition-colors">
                        {stage.name?.["en-US"] ?? `Stage ${stage.key}`}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[#6c6c6c]">
                        {boss && (
                          <span className="truncate">
                            Boss: {boss.name?.["en-US"] ?? "?"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex shrink-0 items-center gap-3 text-right">
                      <div className="text-[10px]">
                        <p className="text-[#6c6c6c]">{isZh ? "金币" : "Gold"}</p>
                        <p className="font-mono font-medium text-amber-400/70">
                          {stage.goldPerClear?.toLocaleString() ?? "-"}
                        </p>
                      </div>
                      <div className="text-[10px]">
                        <p className="text-[#6c6c6c]">{isZh ? "经验" : "EXP"}</p>
                        <p className="font-mono font-medium text-emerald-400/70">
                          {stage.expPerClear?.toLocaleString() ?? "-"}
                        </p>
                      </div>
                      <div className="text-[10px]">
                        <p className="text-[#6c6c6c]">Lv</p>
                        <p className="font-mono font-medium text-[#9d9d9d]">{stage.level ?? "-"}</p>
                      </div>
                      <span className="text-[10px] text-[#555] group-hover:text-amber-400 transition-colors">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
