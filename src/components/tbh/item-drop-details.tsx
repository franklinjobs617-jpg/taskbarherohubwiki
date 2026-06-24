"use client";

import Link from "next/link";
import { useState } from "react";
import { bestFarmingStages, dropsForItem, type DropSource, type FarmingStage, type Locale } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";

export function ItemQuickAnswer({
  itemSlug,
  marketPrice,
  locale,
}: {
  itemSlug: string;
  marketPrice?: number | null;
  locale: Locale;
}) {
  const isZh = locale === "zh";
  const bestStages = bestFarmingStages(itemSlug, 1);
  const best = bestStages[0];
  const drops = dropsForItem(itemSlug);
  const lpath = (path: string) => localizedPath(locale, path);

  if (!drops.length) return null;

  return (
    <div className="sticky top-16 z-20 border border-amber-600/40 bg-[#0d0c0a] px-4 py-2.5 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-400">
            {isZh ? "快速结论" : "Quick Answer"}
          </span>
          {best ? (
            <>
              <span className="text-text-secondary">
                {isZh ? "最佳掉落:" : "Best drop:"}{" "}
              </span>
              <Link
                href={lpath(`/stages/${best.stageSlug}`)}
                className="font-semibold text-white hover:text-amber-400 transition-colors"
              >
                {best.diff} ACT {best.act}-{best.no}
              </Link>
              <span className="text-text-muted">
                ({(best.totalDropChance * 100).toFixed(2)}%/{isZh ? "轮" : "run"})
              </span>
            </>
          ) : (
            <span className="text-text-muted">{isZh ? "掉落数据收集中" : "Drop data being collected"}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          {marketPrice != null && (
            <span>
              {isZh ? "市场价: " : "Market: "}
              <span className="font-semibold text-amber-400">${marketPrice.toFixed(2)}</span>
            </span>
          )}
          <span>
            {drops.length} {isZh ? "个宝箱来源" : "chest sources"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function DropSourceDetails({
  itemSlug,
  selectedStage,
  locale,
}: {
  itemSlug: string;
  selectedStage: FarmingStage | null;
  locale: Locale;
}) {
  const isZh = locale === "zh";
  const drops = dropsForItem(itemSlug);

  if (!drops.length) {
    return (
      <div className="border border-border-default bg-bg-panel p-4 text-center text-sm text-text-muted">
        {isZh ? "暂无掉落数据。数据正在从社区收集和验证中。" : "No drop data yet. Data is being collected and verified from the community."}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* If a stage is selected, show only that stage's boxes */}
      {selectedStage ? (
        <SelectedStageView stage={selectedStage} locale={locale} />
      ) : (
        <AllSourcesView drops={drops} locale={locale} />
      )}
    </div>
  );
}

function SelectedStageView({ stage, locale }: { stage: FarmingStage; locale: Locale }) {
  const isZh = locale === "zh";
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {stage.diff} ACT {stage.act}-{stage.no}
        </h3>
        <span className="text-xs text-text-muted">
          {isZh ? "合计概率: " : "Total chance: "}
          <span className="font-semibold text-amber-400">{(stage.totalDropChance * 100).toFixed(2)}%</span>
        </span>
      </div>
      <div className="space-y-1.5">
        {stage.boxes.map((box, i) => (
          <div key={i} className="flex items-center justify-between rounded-sm border border-border-default bg-bg-panel px-3 py-2 text-xs">
            <span className="text-text-secondary">{box.name}</span>
            <span className="font-mono font-semibold text-amber-400">{(box.rate * 100).toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AllSourcesView({ drops, locale }: { drops: DropSource[]; locale: Locale }) {
  const isZh = locale === "zh";
  const [expandedBoxes, setExpandedBoxes] = useState<Set<string>>(new Set());

  const toggleBox = (slug: string) => {
    const next = new Set(expandedBoxes);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setExpandedBoxes(next);
  };

  // Group by box_type
  const bossBoxes = drops.filter((d) => d.box_type === "boss");
  const monsterBoxes = drops.filter((d) => d.box_type === "monster");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BoxGroup
        title={isZh ? "Boss 宝箱" : "Boss Chests"}
        boxes={bossBoxes}
        locale={locale}
        expandedBoxes={expandedBoxes}
        onToggle={toggleBox}
      />
      <BoxGroup
        title={isZh ? "怪物宝箱" : "Monster Chests"}
        boxes={monsterBoxes}
        locale={locale}
        expandedBoxes={expandedBoxes}
        onToggle={toggleBox}
      />
    </div>
  );
}

function BoxGroup({
  title,
  boxes,
  locale,
  expandedBoxes,
  onToggle,
}: {
  title: string;
  boxes: DropSource[];
  locale: Locale;
  expandedBoxes: Set<string>;
  onToggle: (slug: string) => void;
}) {
  const isZh = locale === "zh";
  const lpath = (path: string) => localizedPath(locale, path);
  if (!boxes.length) return null;

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
        {title} ({boxes.length})
      </p>
      <div className="space-y-1.5">
        {boxes
          .sort((a, b) => b.drop_chance - a.drop_chance)
          .map((box) => {
            const isExpanded = expandedBoxes.has(box.box_slug);
            return (
              <div key={box.box_slug} className="rounded-sm border border-border-default bg-bg-panel">
                <button
                  onClick={() => onToggle(box.box_slug)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-bg-surface transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-text-muted">{isExpanded ? "▼" : "▶"}</span>
                    <span className="truncate text-text-secondary">{box.box_name}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${box.box_grade === "RARE" ? "bg-blue-900/30 text-blue-400" : box.box_grade === "COMMON" ? "bg-zinc-800 text-zinc-400" : "bg-purple-900/30 text-purple-400"}`}>
                      {box.box_grade}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-amber-400">{box.drop_chance.toFixed(2)}%</span>
                    <span className="text-[10px] text-text-muted">{box.stages.length} {isZh ? "关卡" : "stages"}</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-border-default px-3 py-2">
                    <div className="grid gap-1">
                      {box.stages
                        .sort((a, b) => b.rate - a.rate)
                        .slice(0, 8)
                        .map((stage) => (
                          <div key={stage.key} className="flex items-center justify-between text-[11px]">
                            <Link
                              href={lpath(`/stages/${stage.slug}`)}
                              className="text-text-secondary hover:text-amber-400 transition-colors"
                            >
                              {stage.diff} A{stage.act}-{stage.no}
                            </Link>
                            <span className="font-mono text-text-muted">{stage.rate}</span>
                          </div>
                        ))}
                      {box.stages.length > 8 && (
                        <p className="text-[10px] text-text-muted mt-1">
                          {isZh ? `...还有 ${box.stages.length - 8} 个关卡` : `...${box.stages.length - 8} more stages`}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
