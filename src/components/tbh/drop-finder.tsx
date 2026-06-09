"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, Map, Search, Target } from "lucide-react";
import { useMemo, useState } from "react";
import {
  allItems,
  allStages,
  assetPath,
  bestFarmingStages,
  chestItems,
  dropsForItem,
  itemName,
  stageName,
  type Locale,
  type RawItem,
} from "@/lib/game-data/data";

type Mode = "item" | "stage" | "chest";

function pct(value: number) {
  return `${(value * 100).toFixed(value * 100 >= 10 ? 1 : 2)}%`;
}

function itemMatches(item: RawItem, query: string, locale: Locale) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    itemName(item, locale).toLowerCase().includes(q) ||
    itemName(item, "en").toLowerCase().includes(q) ||
    item.slug.includes(q) ||
    String(item.id).includes(q)
  );
}

function ItemThumb({ item, locale }: { item: RawItem; locale: Locale }) {
  const icon = assetPath(item.icon);
  const name = itemName(item, locale);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#27272a] bg-[#0a0a0a]">
        {icon ? <Image src={icon} alt={name} width={34} height={34} className="object-contain" data-pixel unoptimized /> : null}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="text-[11px] text-[#6c6c6c]">{item.grade} / {item.type}</p>
      </div>
    </div>
  );
}

export function DropFinder({ locale }: { locale: Locale }) {
  const [mode, setMode] = useState<Mode>("item");
  const isZh = locale === "zh";

  const modes: Array<[Mode, React.ReactNode, string]> = [
    ["item", <Search key="item" className="h-4 w-4" />, isZh ? "按物品" : "By item"],
    ["stage", <Map key="stage" className="h-4 w-4" />, isZh ? "按关卡" : "By stage"],
    ["chest", <Boxes key="chest" className="h-4 w-4" />, isZh ? "按宝箱" : "By chest"],
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-2 border border-[#27272a] bg-[#0d0d0d] p-2 sm:inline-grid sm:grid-cols-3">
        {modes.map(([key, icon, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm transition ${
              mode === key ? "bg-[#d4a017] text-black" : "text-[#9d9d9d] hover:bg-[#18181b] hover:text-white"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {mode === "item" ? <ItemDropMode locale={locale} /> : null}
      {mode === "stage" ? <StageDropMode locale={locale} /> : null}
      {mode === "chest" ? <ChestDropMode locale={locale} /> : null}
    </div>
  );
}

function ItemDropMode({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";
  const [query, setQuery] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const searchableItems = useMemo(() => allItems().filter((item) => item.type !== "GEAR"), []);
  const defaultSlug = useMemo(
    () => searchableItems.find((item) => bestFarmingStages(item.slug, 1).length > 0)?.slug ?? searchableItems[0]?.slug ?? null,
    [searchableItems],
  );

  const candidates = useMemo(
    () => searchableItems
      .filter((item) => itemMatches(item, query, locale))
      .sort((a, b) => Number(bestFarmingStages(b.slug, 1).length > 0) - Number(bestFarmingStages(a.slug, 1).length > 0))
      .slice(0, 28),
    [query, locale, searchableItems],
  );
  const selected = useMemo(() => {
    if (slug) return searchableItems.find((item) => item.slug === slug) ?? candidates[0] ?? null;
    if (query.trim()) return candidates[0] ?? null;
    return searchableItems.find((item) => item.slug === defaultSlug) ?? candidates[0] ?? null;
  }, [slug, searchableItems, candidates, query, defaultSlug]);
  const bestStages = selected ? bestFarmingStages(selected.slug, 8) : [];
  const sources = selected ? dropsForItem(selected.slug) : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <aside className="border border-[#27272a] bg-[#0d0d0d] p-3">
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
          {isZh ? "搜索材料或宝箱" : "Search material or chest"}
        </label>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSlug(null);
          }}
          placeholder={isZh ? "wood, ruby, soulstone..." : "wood, ruby, soulstone..."}
          className="mb-3 w-full border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none"
        />
        <div className="max-h-[560px] space-y-1 overflow-y-auto">
          {candidates.map((item) => (
            <button
              key={item.slug}
              onClick={() => setSlug(item.slug)}
              className={`w-full border px-3 py-2 text-left transition ${
                selected?.slug === item.slug ? "border-[#d4a017] bg-[#1a1508]" : "border-[#27272a] hover:border-[#3b3b3b]"
              }`}
            >
              <ItemThumb item={item} locale={locale} />
            </button>
          ))}
        </div>
      </aside>

      <section className="space-y-4">
        {selected ? (
          <>
            <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ItemThumb item={selected} locale={locale} />
                <Link href={`/${locale}/items/${selected.slug}`} className="inline-flex items-center gap-2 text-sm text-[#f0c040] hover:underline">
                  {isZh ? "打开物品页" : "Open item page"} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {bestStages.length ? (
              <div className="grid gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
                  {isZh ? "推荐刷取路线" : "Recommended farming routes"}
                </p>
                {bestStages.map((stage, index) => (
                  <Link
                    key={`${stage.stageKey}-${index}`}
                    href={`/${locale}/stages/${stage.stageSlug}`}
                    className="grid gap-3 border border-[#27272a] bg-[#0d0d0d] p-3 transition hover:border-[#d4a017]/70 sm:grid-cols-[80px_1fr_auto]"
                  >
                    <div className="font-mono text-sm text-[#f0c040]">#{index + 1}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{stage.diff} Act {stage.act}-{stage.no}</p>
                      <p className="mt-1 text-xs text-[#6c6c6c]">{stage.boxes.map((box) => box.name).join(" / ")}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-mono text-sm text-[#f0c040]">{pct(stage.totalDropChance)}</p>
                      <p className="text-[10px] text-[#6c6c6c]">{isZh ? "每次通关估算" : "per clear estimate"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border border-[#27272a] bg-[#0d0d0d] p-6 text-sm text-[#6c6c6c]">
                {isZh ? "暂无可信掉落数据。不会编造来源。" : "No trusted drop data. Sources are not invented."}
              </div>
            )}

            {sources.length ? (
              <div className="overflow-x-auto border border-[#27272a]">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-[#18181b] text-xs text-[#6c6c6c]">
                    <tr>
                      <th className="px-3 py-2">{isZh ? "宝箱" : "Chest"}</th>
                      <th className="px-3 py-2">{isZh ? "类型" : "Type"}</th>
                      <th className="px-3 py-2">{isZh ? "基础概率" : "Base rate"}</th>
                      <th className="px-3 py-2">{isZh ? "出现关卡" : "Stages"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((source) => (
                      <tr key={`${source.box_slug}-${source.box_type}`} className="border-t border-[#27272a]">
                        <td className="px-3 py-2 text-white">{source.box_name}</td>
                        <td className="px-3 py-2 text-[#9d9d9d]">{source.box_type}</td>
                        <td className="px-3 py-2 font-mono text-[#f0c040]">{Number(source.drop_chance).toFixed(2)}%</td>
                        <td className="px-3 py-2 text-[#9d9d9d]">{source.stages.slice(0, 6).map((stage) => `${stage.diff} ${stage.act}-${stage.no}`).join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}

function StageDropMode({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";
  const [stageKey, setStageKey] = useState(() => allStages()[0]?.key ?? 0);
  const selectedStage = allStages().find((stage) => stage.key === stageKey) ?? allStages()[0];

  const rows = useMemo(() => {
    if (!selectedStage) return [];
    return allItems()
      .filter((item) => item.type !== "GEAR")
      .map((item) => {
        const sources = dropsForItem(item.slug).filter((source) => source.stages.some((stage) => stage.key === selectedStage.key));
        if (!sources.length) return null;
        const chance = sources.reduce((sum, source) => {
          const stage = source.stages.find((entry) => entry.key === selectedStage.key);
          return sum + (Number(source.drop_chance) / 100) * (Number(stage?.rate ?? 0) / 1000);
        }, 0);
        return { item, sources, chance };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .sort((a, b) => b.chance - a.chance);
  }, [selectedStage]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 border border-[#27272a] bg-[#0d0d0d] p-3 md:grid-cols-[1fr_auto]">
        <select
          value={stageKey}
          onChange={(event) => setStageKey(Number(event.target.value))}
          className="border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm text-white"
        >
          {allStages().map((stage) => (
            <option key={stage.key} value={stage.key}>
              {stage.difficulty} Act {stage.act}-{stage.no} / Lv.{stage.level} / {stageName(stage, locale)}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 text-xs text-[#6c6c6c]">
          <Target className="h-4 w-4 text-[#f0c040]" />
          {rows.length} {isZh ? "项可信掉落" : "trusted drops"}
        </div>
      </div>

      <div className="overflow-x-auto border border-[#27272a]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#18181b] text-xs text-[#6c6c6c]">
            <tr>
              <th className="px-3 py-2">{isZh ? "物品" : "Item"}</th>
              <th className="px-3 py-2">{isZh ? "概率" : "Rate"}</th>
              <th className="px-3 py-2">{isZh ? "来源" : "Source"}</th>
              <th className="px-3 py-2">{isZh ? "动作" : "Action"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, sources, chance }) => (
              <tr key={item.slug} className="border-t border-[#27272a] hover:bg-[#0d0d0d]">
                <td className="px-3 py-2"><ItemThumb item={item} locale={locale} /></td>
                <td className="px-3 py-2 font-mono text-[#f0c040]">{pct(chance)}</td>
                <td className="px-3 py-2 text-[#9d9d9d]">{sources.map((source) => source.box_name).join(" / ")}</td>
                <td className="px-3 py-2">
                  <Link href={`/${locale}/items/${item.slug}`} className="text-[#f0c040] hover:underline">
                    {isZh ? "查看" : "Open"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChestDropMode({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";
  const [chestSlug, setChestSlug] = useState(chestItems()[0]?.slug ?? "");
  const selectedChest = chestItems().find((item) => item.slug === chestSlug);

  const rows = useMemo(() => {
    if (!selectedChest) return [];
    return allItems()
      .map((item) => {
        const sources = dropsForItem(item.slug).filter((source) => source.box_slug === selectedChest.slug);
        if (!sources.length) return null;
        return { item, source: sources[0] };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .sort((a, b) => Number(b.source.drop_chance) - Number(a.source.drop_chance));
  }, [selectedChest]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 border border-[#27272a] bg-[#0d0d0d] p-3 md:grid-cols-[1fr_auto]">
        <select
          value={chestSlug}
          onChange={(event) => setChestSlug(event.target.value)}
          className="border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm text-white"
        >
          {chestItems().map((chest) => (
            <option key={chest.slug} value={chest.slug}>{itemName(chest, locale)} / {chest.grade}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 text-xs text-[#6c6c6c]">
          <Boxes className="h-4 w-4 text-[#f0c040]" />
          {rows.length} {isZh ? "项内容" : "contents"}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {rows.length ? rows.map(({ item, source }) => (
          <Link
            key={item.slug}
            href={`/${locale}/items/${item.slug}`}
            className="border border-[#27272a] bg-[#0d0d0d] p-3 transition hover:border-[#d4a017]/70"
          >
            <ItemThumb item={item} locale={locale} />
            <div className="mt-3 flex items-center justify-between border-t border-[#27272a] pt-2 text-xs">
              <span className="text-[#6c6c6c]">{isZh ? "基础概率" : "Base rate"}</span>
              <span className="font-mono text-[#f0c040]">{Number(source.drop_chance).toFixed(2)}%</span>
            </div>
          </Link>
        )) : (
          <div className="border border-[#27272a] bg-[#0d0d0d] p-6 text-sm text-[#6c6c6c]">
            {isZh ? "这个宝箱暂无内容数据。" : "No content data for this chest."}
          </div>
        )}
      </div>
    </div>
  );
}
