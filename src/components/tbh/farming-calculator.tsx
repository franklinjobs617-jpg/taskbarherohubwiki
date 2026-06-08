"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  allItems,
  allStages,
  bestFarmingStages,
  dropsForItem,
  itemName,
  marketForItem,
  type FarmingStage,
  type Locale,
  type RawItem,
} from "@/lib/game-data/data";

type Mode = "find-item" | "stage-drops" | "compare";

export function FarmingCalculator({ locale }: { locale: Locale }) {
  const [mode, setMode] = useState<Mode>("find-item");
  const isZh = locale === "zh";

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-1 border-b border-[#27272a]">
        {([
          ["find-item", isZh ? "找物品掉落" : "Find Item Drops"],
          ["stage-drops", isZh ? "查看关卡掉落" : "Stage Drops"],
          ["compare", isZh ? "关卡对比" : "Compare Stages"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              mode === key
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-[#6c6c6c] hover:text-[#9d9d9d]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "find-item" && <FindItemMode locale={locale} />}
      {mode === "stage-drops" && <StageDropsMode locale={locale} />}
      {mode === "compare" && <CompareMode locale={locale} />}
    </div>
  );
}

/** Mode 1: Find where an item drops */
function FindItemMode({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";
  const [search, setSearch] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [runs, setRuns] = useState(10);

  const allMatItems = useMemo(
    () => allItems().filter((i) => i.type === "MATERIAL" || i.type === "STAGEBOX"),
    [],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return allMatItems.slice(0, 20);
    const q = search.toLowerCase();
    return allMatItems
      .filter((i) => {
        const name = itemName(i, "en").toLowerCase();
        const zhName = (i.name as Record<string, string>)?.["zh-Hans"]?.toLowerCase() ?? "";
        const jaName = (i.name as Record<string, string>)?.["ja-JP"]?.toLowerCase() ?? "";
        return name.includes(q) || zhName.includes(q) || jaName.includes(q) || i.slug.includes(q);
      })
      .slice(0, 20);
  }, [search, allMatItems]);

  const selectedItem = useMemo(
    () => allMatItems.find((i) => i.slug === selectedSlug) ?? null,
    [selectedSlug, allMatItems],
  );

  const farmingStages = useMemo(
    () => (selectedSlug ? bestFarmingStages(selectedSlug, 10) : []),
    [selectedSlug],
  );

  const market = selectedItem ? marketForItem(selectedItem) : null;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#6c6c6c]">
          {isZh ? "搜索物品" : "Search Item"}
        </label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isZh ? "输入物品名（中/英/日）..." : "Type item name (CN/EN/JP)..."}
          className="w-full border border-[#3b3b3b] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#6c6c6c] focus:border-amber-600/60"
        />
        {search && filtered.length > 0 && !selectedSlug && (
          <div className="mt-1 max-h-64 overflow-y-auto border border-[#27272a] bg-[#0d0d0d]">
            {filtered.map((item) => (
              <button
                key={item.slug}
                onClick={() => {
                  setSelectedSlug(item.slug);
                  setSearch(itemName(item, locale));
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#18181b] transition-colors"
              >
                <span className="text-[#9d9d9d]">{item.type}</span>
                <span className="text-white">{itemName(item, locale)}</span>
                <span className="ml-auto text-[10px] text-[#555]">{item.grade}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {selectedItem && (
        <>
          {/* Item info + market */}
          <div className="flex items-center gap-3 rounded-sm border border-amber-600/30 bg-amber-600/5 px-4 py-3">
            <span className="text-sm font-semibold text-amber-400">
              {itemName(selectedItem, locale)}
            </span>
            <span className="text-xs text-[#6c6c6c]">{selectedItem.grade}</span>
            {market?.lowest != null && (
              <span className="ml-auto text-xs text-[#9d9d9d]">
                {isZh ? "市价" : "Market"}:{" "}
                <span className="font-semibold text-amber-400">${market.lowest.toFixed(2)}</span>
              </span>
            )}
          </div>

          {/* Best stages */}
          {farmingStages.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6c6c6c]">
                  {isZh ? `最佳刷取关卡 (${farmingStages.length})` : `Best Farming Stages (${farmingStages.length})`}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-[#6c6c6c]">
                  {isZh ? "模拟次数:" : "Simulate runs:"}
                  {[1, 5, 10, 25, 50, 100].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRuns(n)}
                      className={`rounded px-1.5 py-0.5 font-mono ${
                        runs === n
                          ? "bg-amber-600/30 text-amber-400"
                          : "text-[#6c6c6c] hover:text-[#9d9d9d]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {farmingStages.map((fs, i) => {
                const probAtLeast1 = 1 - Math.pow(1 - fs.totalDropChance, runs);
                const expected = fs.totalDropChance * runs;
                const profit = market?.lowest ? expected * market.lowest : 0;
                const stageData = allStages().find((s) => s.key === fs.stageKey);

                return (
                  <Link
                    key={fs.stageKey}
                    href={`/${locale}/stages/${fs.stageKey}`}
                    className="flex items-center gap-3 rounded-sm border border-[#27272a] bg-[#0d0d0d] px-3 py-2.5 transition-colors hover:border-amber-600/30 group"
                  >
                    {/* Rank */}
                    <span className="w-6 text-center font-mono text-xs text-[#555]">
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                    </span>

                    {/* Stage info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                        {fs.diff} A{fs.act}-{fs.no}
                        {stageData?.name?.["en-US"] ? ` — ${stageData.name["en-US"]}` : ""}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#6c6c6c]">
                        {fs.boxes.map((b) => b.name).join(" · ")}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex shrink-0 items-center gap-4 text-right">
                      <div className="text-[10px]">
                        <p className="text-[#555]">{isZh ? "每轮" : "Per run"}</p>
                        <p className="font-mono font-semibold text-amber-400">
                          {(fs.totalDropChance * 100).toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-[10px]">
                        <p className="text-[#555]">{runs}{isZh ? "次 ≥1" : "runs ≥1"}</p>
                        <p className="font-mono font-semibold text-white">
                          {(probAtLeast1 * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="text-[10px]">
                        <p className="text-[#555]">{isZh ? "期望" : "Expected"}</p>
                        <p className="font-mono font-semibold text-emerald-400">
                          {expected.toFixed(1)}×
                        </p>
                      </div>
                      {market?.lowest != null && (
                        <div className="text-[10px]">
                          <p className="text-[#555]">{isZh ? "收益" : "Profit"}</p>
                          <p className="font-mono font-semibold text-amber-400">
                            ${profit.toFixed(3)}
                          </p>
                        </div>
                      )}
                      <span className="text-[10px] text-[#555] group-hover:text-amber-400">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : selectedSlug ? (
            <div className="border border-[#27272a] bg-[#0d0d0d] p-6 text-center text-sm text-[#6c6c6c]">
              {isZh
                ? "该物品暂无掉落数据。可能是合成专用、活动限定或尚未实装。"
                : "No drop data for this item. It may be synthesis-only, event-exclusive, or not yet implemented."}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

/** Mode 2: See what drops from a stage */
function StageDropsMode({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";
  const [difficulty, setDifficulty] = useState("NORMAL");
  const [selectedAct, setSelectedAct] = useState(1);
  const [selectedNo, setSelectedNo] = useState(1);

  const stage = useMemo(() => {
    const key = (["NORMAL", "NIGHTMARE", "HELL", "TORMENT"].indexOf(difficulty) + 1) * 1000 + selectedAct * 100 + selectedNo;
    return allStages().find((s) => s.key === key) ?? null;
  }, [difficulty, selectedAct, selectedNo]);

  // Find items that drop in this stage
  const stageDrops = useMemo(() => {
    if (!stage) return [];
    const items = allItems().filter((i) => i.type === "MATERIAL" || i.type === "STAGEBOX");
    return items
      .map((item) => {
        const drops = dropsForItem(item.slug);
        const stageSources = drops.filter((d) => d.stages.some((s) => s.key === stage.key));
        if (!stageSources.length) return null;
        const totalChance = stageSources.reduce((sum, d) => {
          const stageEntry = d.stages.find((s) => s.key === stage.key);
          return sum + (d.drop_chance / 100) * ((stageEntry?.rate ?? 0) / 1000);
        }, 0);
        return { item, totalChance, sources: stageSources };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.totalChance - a.totalChance);
  }, [stage]);

  const diffs = ["NORMAL", "NIGHTMARE", "HELL", "TORMENT"];

  return (
    <div className="space-y-4">
      {/* Stage selector */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6c6c6c]">
            {isZh ? "难度" : "Difficulty"}
          </label>
          <div className="flex gap-1">
            {diffs.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-2 py-1.5 text-[11px] font-medium transition-colors border ${
                  difficulty === d
                    ? "border-amber-600/60 bg-amber-600/20 text-amber-400"
                    : "border-[#27272a] text-[#6c6c6c] hover:border-[#3b3b3b]"
                }`}
              >
                {d[0]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6c6c6c]">Act</label>
          <div className="flex gap-1">
            {[1, 2, 3].map((a) => (
              <button
                key={a}
                onClick={() => setSelectedAct(a)}
                className={`px-3 py-1.5 text-[11px] font-medium border ${
                  selectedAct === a
                    ? "border-amber-600/60 bg-amber-600/20 text-amber-400"
                    : "border-[#27272a] text-[#6c6c6c] hover:border-[#3b3b3b]"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6c6c6c]">
            {isZh ? "关卡" : "Stage"}
          </label>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setSelectedNo(n)}
                className={`px-2 py-1.5 text-[11px] font-medium border ${
                  selectedNo === n
                    ? "border-amber-600/60 bg-amber-600/20 text-amber-400"
                    : "border-[#27272a] text-[#6c6c6c] hover:border-[#3b3b3b]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stage info */}
      {stage && (
        <div className="rounded-sm border border-amber-600/20 bg-[#0d0d0d] px-4 py-3">
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold text-white">
              {difficulty} A{selectedAct}-{selectedNo}: {stage.name?.["en-US"] ?? `Stage ${stage.key}`}
            </p>
            <span className="text-xs text-[#6c6c6c]">
              Lv.{stage.level} · {isZh ? "金币" : "Gold"}: {stage.goldPerClear?.toLocaleString()} · EXP: {stage.expPerClear?.toLocaleString()}
            </span>
            {stage.boss && (
              <span className="text-xs text-red-400/70">
                Boss: {stage.boss.name?.["en-US"] ?? "?"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Item drops */}
      {stageDrops.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#6c6c6c]">
            {isZh ? `掉落物品 (${stageDrops.length})` : `Drops (${stageDrops.length})`}
          </p>
          <div className="space-y-1">
            {stageDrops.map(({ item, totalChance, sources }) => (
              <Link
                key={item.slug}
                href={`/${locale}/items/${item.slug}`}
                className="flex items-center gap-3 rounded-sm border border-[#27272a] bg-[#0d0d0d] px-3 py-2 text-xs transition-colors hover:border-amber-600/30"
              >
                <span className="w-20 truncate font-medium text-white">
                  {itemName(item, locale)}
                </span>
                <span className="text-[10px] text-[#555]">{item.grade}</span>
                <span className="flex-1 text-[10px] text-[#6c6c6c] truncate">
                  {sources.map((s) => s.box_name).join(" · ")}
                </span>
                <span className="font-mono font-semibold text-amber-400">
                  {(totalChance * 100).toFixed(2)}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-[#27272a] bg-[#0d0d0d] p-6 text-center text-xs text-[#6c6c6c]">
          {isZh ? "所选关卡暂无掉落数据" : "No drop data for selected stage"}
        </div>
      )}
    </div>
  );
}

/** Mode 3: Compare stages */
function CompareMode({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";
  const [slots, setSlots] = useState<Array<number | null>>([null, null]);

  const addSlot = () => {
    if (slots.length < 4) setSlots([...slots, null]);
  };

  const updateSlot = (index: number, key: number | null) => {
    const next = [...slots];
    next[index] = key;
    setSlots(next);
  };

  const selectedStages = slots
    .map((key) => (key ? allStages().find((s) => s.key === key) ?? null : null))
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#6c6c6c]">
        {isZh
          ? "选择 2-4 个关卡并排比较金币、经验和掉落密度。"
          : "Select 2-4 stages to compare gold, EXP, and drop density side by side."}
      </p>

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${slots.length}, 1fr)` }}>
        {slots.map((stageKey, i) => (
          <StagePicker
            key={i}
            index={i}
            selectedKey={stageKey}
            locale={locale}
            onSelect={(key) => updateSlot(i, key)}
            onRemove={slots.length > 2 ? () => {
              const next = slots.filter((_, j) => j !== i);
              setSlots(next);
            } : undefined}
          />
        ))}
      </div>

      {slots.length < 4 && (
        <button
          onClick={addSlot}
          className="border border-dashed border-[#3b3b3b] px-4 py-2 text-xs text-[#6c6c6c] hover:border-amber-600/40 hover:text-amber-400 transition-colors"
        >
          + {isZh ? "添加关卡" : "Add Stage"}
        </button>
      )}

      {/* Comparison table */}
      {selectedStages.length >= 2 && (
        <div className="overflow-x-auto border border-[#27272a]">
          <table className="w-full min-w-[400px] text-left text-xs">
            <thead className="bg-[#18181b] text-[#6c6c6c]">
              <tr>
                <th className="px-3 py-2">{isZh ? "关卡" : "Stage"}</th>
                <th className="px-3 py-2">Lv</th>
                <th className="px-3 py-2">{isZh ? "金币" : "Gold"}</th>
                <th className="px-3 py-2">EXP</th>
                <th className="px-3 py-2">{isZh ? "击杀" : "Kills"}</th>
                <th className="px-3 py-2">Boss</th>
              </tr>
            </thead>
            <tbody>
              {selectedStages.map((stage) => (
                <tr key={stage!.key} className="border-t border-[#27272a] hover:bg-[#0d0d0d]">
                  <td className="px-3 py-2 font-medium text-white">
                    <Link href={`/${locale}/stages/${stage!.key}`} className="hover:text-amber-400">
                      {stage!.difficulty} A{stage!.act}-{stage!.no}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-mono text-[#9d9d9d]">{stage!.level}</td>
                  <td className="px-3 py-2 font-mono text-amber-400">{stage!.goldPerClear?.toLocaleString()}</td>
                  <td className="px-3 py-2 font-mono text-emerald-400">{stage!.expPerClear?.toLocaleString()}</td>
                  <td className="px-3 py-2 font-mono text-[#9d9d9d]">{stage!.kills}</td>
                  <td className="px-3 py-2 text-[#9d9d9d]">{stage!.boss?.name?.["en-US"] ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StagePicker({
  index,
  selectedKey,
  locale,
  onSelect,
  onRemove,
}: {
  index: number;
  selectedKey: number | null;
  locale: Locale;
  onSelect: (key: number) => void;
  onRemove?: () => void;
}) {
  const isZh = locale === "zh";
  const [diff, setDiff] = useState("NORMAL");
  const [act, setAct] = useState(1);
  const [no, setNo] = useState(index + 1);

  const key = (["NORMAL", "NIGHTMARE", "HELL", "TORMENT"].indexOf(diff) + 1) * 1000 + act * 100 + no;
  const stage = allStages().find((s) => s.key === key);

  return (
    <div className="rounded-sm border border-[#27272a] bg-[#0d0d0d] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-[#6c6c6c]">#{index + 1}</span>
        {onRemove && (
          <button onClick={onRemove} className="text-[10px] text-[#555] hover:text-red-400">
            ×
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        <select value={diff} onChange={(e) => { setDiff(e.target.value); onSelect(key); }}
          className="w-full border border-[#27272a] bg-[#0a0a0a] px-2 py-1 text-[11px] text-white">
          {["NORMAL", "NIGHTMARE", "HELL", "TORMENT"].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <div className="flex gap-1">
          <select value={act} onChange={(e) => { setAct(Number(e.target.value)); onSelect(key); }}
            className="flex-1 border border-[#27272a] bg-[#0a0a0a] px-2 py-1 text-[11px] text-white">
            {[1, 2, 3].map((a) => (<option key={a} value={a}>Act {a}</option>))}
          </select>
          <select value={no} onChange={(e) => { setNo(Number(e.target.value)); onSelect(key); }}
            className="flex-1 border border-[#27272a] bg-[#0a0a0a] px-2 py-1 text-[11px] text-white">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (<option key={n} value={n}>#{n}</option>))}
          </select>
        </div>
      </div>
      {stage && (
        <div className="mt-2 border-t border-[#27272a] pt-2 text-[10px] text-[#6c6c6c]">
          <p>{stage.name?.["en-US"]}</p>
          <p className="mt-0.5">
            {isZh ? "金币" : "Gold"}: {stage.goldPerClear?.toLocaleString()} · EXP: {stage.expPerClear?.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
