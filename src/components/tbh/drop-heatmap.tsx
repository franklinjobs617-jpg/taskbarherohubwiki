"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { bestFarmingStages, dropsForItem, type DropSource, type FarmingStage, type Locale } from "@/lib/game-data/data";

const DIFFICULTIES = ["NORMAL", "NIGHTMARE", "HELL", "TORMENT"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const DIFF_LABELS: Record<Locale, Record<Difficulty, string>> = {
  en: { NORMAL: "Normal", NIGHTMARE: "Nightmare", HELL: "Hell", TORMENT: "Torment" },
  zh: { NORMAL: "普通", NIGHTMARE: "噩梦", HELL: "地狱", TORMENT: "折磨" },
  ja: { NORMAL: "通常", NIGHTMARE: "悪夢", HELL: "地獄", TORMENT: "苦痛" },
};

function getDropDensity(stageKey: number, dropSources: DropSource[]): number {
  // Count how many unique boxes drop in this stage
  const boxes = new Set<string>();
  for (const source of dropSources) {
    for (const stage of source.stages) {
      if (stage.key === stageKey) {
        boxes.add(source.box_slug);
      }
    }
  }
  return boxes.size;
}

function densityColor(density: number): string {
  if (density >= 3) return "bg-amber-600 hover:bg-amber-500";
  if (density === 2) return "bg-amber-700/80 hover:bg-amber-600/80";
  if (density === 1) return "bg-amber-900/50 hover:bg-amber-800/50";
  return "bg-zinc-900/30 hover:bg-zinc-800/30";
}

function densityLabel(density: number, locale: Locale): string {
  if (locale === "zh") {
    if (density >= 3) return "3+ 个宝箱";
    if (density === 2) return "2 个宝箱";
    if (density === 1) return "1 个宝箱";
    return "无掉落";
  }
  if (density >= 3) return "3+ boxes";
  if (density === 2) return "2 boxes";
  if (density === 1) return "1 box";
  return "No drops";
}

export function DropHeatmap({
  itemSlug,
  locale,
  onStageSelect,
  selectedStage,
}: {
  itemSlug: string;
  locale: Locale;
  onStageSelect?: (stage: FarmingStage | null) => void;
  selectedStage?: number | null;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>("NORMAL");
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  const isZh = locale === "zh";
  const dropSources = useMemo(() => dropsForItem(itemSlug), [itemSlug]);
  const bestStages = useMemo(() => bestFarmingStages(itemSlug, 10), [itemSlug]);

  // Build stage grid: 3 acts × 10 stages
  const stageGrid = useMemo(() => {
    const grid: Array<{ act: number; no: number; key: number; density: number }> = [];
    for (let act = 1; act <= 3; act++) {
      for (let no = 1; no <= 10; no++) {
        // Generate stage key: 1act00no + type(0=normal field) + diff
        const diffCode = DIFFICULTIES.indexOf(difficulty) + 1;
        const key = diffCode * 1000 + act * 100 + no;
        const density = getDropDensity(key, dropSources);
        grid.push({ act, no, key, density });
      }
    }
    return grid;
  }, [dropSources, difficulty]);

  // Best stage for this item
  const bestStage = bestStages[0];

  if (!dropSources.length) {
    return (
      <div className="border border-[#27272a] bg-[#0d0d0d] p-4 text-center text-sm text-[#6c6c6c]">
        {isZh ? "暂无掉落数据" : "No drop data available yet"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Difficulty tabs */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
          {isZh ? "掉落热力图" : "Drop Heatmap"}
        </p>
        <div className="flex gap-1">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-2.5 py-1 text-[11px] font-medium transition-colors border ${
                difficulty === diff
                  ? "border-amber-600/60 bg-amber-600/20 text-amber-400"
                  : "border-[#27272a] text-[#6c6c6c] hover:border-[#3b3b3b] hover:text-[#9d9d9d]"
              }`}
            >
              {DIFF_LABELS[locale][diff]}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-[#6c6c6c]">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 bg-amber-600" /> {densityLabel(3, locale)}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 bg-amber-700/80" /> {densityLabel(2, locale)}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 bg-amber-900/50" /> {densityLabel(1, locale)}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 bg-zinc-900/30 border border-[#27272a]" /> {isZh ? "无" : "None"}
        </span>
      </div>

      {/* 3×10 Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((act) => (
          <div key={act} className="space-y-1.5">
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
              {isZh ? `第 ${act} 章` : `Act ${act}`}
            </p>
            <div className="grid grid-cols-1 gap-1">
              {stageGrid
                .filter((s) => s.act === act)
                .sort((a, b) => b.no - a.no)
                .map((stage) => {
                  const isBest = bestStage?.stageKey === stage.key;
                  const isHovered = hoveredStage === stage.key;
                  const isSelected = selectedStage === stage.key;
                  const stageBest = bestStages.find((s) => s.stageKey === stage.key);

                  return (
                    <Link
                      key={stage.key}
                      href={stage.density > 0 ? `/${locale}/stages/${stage.key}` : "#"}
                      className={`relative flex items-center justify-between rounded-sm border px-2 py-1.5 text-[11px] transition-all cursor-pointer no-underline
                        ${densityColor(stage.density)}
                        ${isBest ? "ring-1 ring-amber-400/50" : "border-transparent"}
                        ${isSelected ? "ring-2 ring-amber-400" : ""}
                      `}
                      onMouseEnter={() => setHoveredStage(stage.key)}
                      onMouseLeave={() => setHoveredStage(null)}
                      onClick={(e) => {
                        if (stage.density === 0) e.preventDefault();
                        if (onStageSelect && stageBest) {
                          e.preventDefault();
                          onStageSelect(stageBest);
                        }
                      }}
                    >
                      <span className={`font-mono tabular-nums ${stage.density > 0 ? "text-white" : "text-[#6c6c6c]"}`}>
                        {act}-{stage.no}
                      </span>
                      {stage.density > 0 && (
                        <span className="text-[9px] text-amber-300/70">
                          {stage.density > 1 ? `×${stage.density}` : "·"}
                        </span>
                      )}

                      {/* Tooltip on hover */}
                      {isHovered && stage.density > 0 && stageBest && (
                        <div className="absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded border border-[#3b3b3b] bg-[#18181b] px-2 py-1 text-[10px] text-[#9d9d9d] shadow-lg pointer-events-none">
                          {stageBest.boxes.map((box, i) => (
                            <div key={i}>
                              {box.name}: {(box.rate * 100).toFixed(2)}%
                            </div>
                          ))}
                          <div className="mt-0.5 text-amber-400">
                            {isZh ? "合计: " : "Total: "}
                            {(stageBest.totalDropChance * 100).toFixed(2)}%
                          </div>
                        </div>
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Best stage highlight */}
      {bestStage && (
        <div className="flex items-center gap-2 border border-amber-600/30 bg-amber-600/10 px-3 py-2 text-xs">
          <span className="text-amber-400">★</span>
          <span className="text-[#9d9d9d]">
            {isZh ? "最佳刷取关卡:" : "Best farming stage:"}{" "}
          </span>
          <Link
            href={`/${locale}/stages/${bestStage.stageSlug}`}
            className="font-semibold text-amber-400 hover:underline"
          >
            {bestStage.diff} ACT {bestStage.act}-{bestStage.no}
          </Link>
          <span className="text-[#6c6c6c]">
            ({(bestStage.totalDropChance * 100).toFixed(2)}%/{isZh ? "轮" : "run"})
          </span>
        </div>
      )}
    </div>
  );
}
