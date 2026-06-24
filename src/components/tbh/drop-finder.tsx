"use client";

import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Boxes, Map, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  allItems,
  allStages,
  assetPath,
  bestFarmingStages,
  chestItems,
  dropsForItem,
  itemName,
  marketForItem,
  stageName,
  type Locale,
  type RawItem,
} from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";

type Mode = "stage" | "chest";

const hotTargets = ["soulstone", "bronze-ingot", "kingdom-coin", "normal-monster-box"];

function t(locale: Locale, values: Record<Locale | "en", string>) {
  return values[locale] ?? values.en;
}

function pct(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "-";
  const percent = value * 100;
  if (percent >= 10) return `${percent.toFixed(1)}%`;
  if (percent >= 1) return `${percent.toFixed(2)}%`;
  return `${percent.toFixed(3)}%`;
}

function expectedRuns(chance: number | null | undefined) {
  if (!chance || chance <= 0) return { p50: null, p90: null };
  if (chance >= 1) return { p50: 1, p90: 1 };
  return {
    p50: Math.ceil(Math.log(0.5) / Math.log(1 - chance)),
    p90: Math.ceil(Math.log(0.1) / Math.log(1 - chance)),
  };
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
      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-border-default bg-bg-canvas">
        {icon ? <SafeImage src={icon} alt={name} width={34} height={34} className="object-contain" data-pixel unoptimized /> : null}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="text-[11px] text-text-muted">{item.grade} / {item.type}</p>
      </div>
    </div>
  );
}

export function DropFinder({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("stage");
  const searchableItems = useMemo(() => allItems().filter((item) => item.type !== "GEAR"), []);
  const candidates = useMemo(() => {
    const rows = searchableItems
      .filter((item) => itemMatches(item, query, locale))
      .sort((a, b) => Number(bestFarmingStages(b.slug, 1).length > 0) - Number(bestFarmingStages(a.slug, 1).length > 0));
    return rows.slice(0, query.trim() ? 18 : 8);
  }, [query, locale, searchableItems]);

  const selected = useMemo(() => {
    if (selectedSlug) return searchableItems.find((item) => item.slug === selectedSlug) ?? null;
    if (query.trim()) return candidates[0] ?? null;
    return null;
  }, [selectedSlug, searchableItems, candidates, query]);

  const bestStages = selected ? bestFarmingStages(selected.slug, 6) : [];
  const best = bestStages[0] ?? null;
  const sources = selected ? dropsForItem(selected.slug) : [];
  const runs = expectedRuns(best?.totalDropChance);
  const market = selected ? marketForItem(selected) : null;

  return (
    <div className="space-y-5">
      <section className="border border-accent-dim bg-accent-soft p-4">
        <div className="flex items-center gap-2 text-accent-bright">
          <Search className="h-4 w-4" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
            {t(locale, { zh: "掉落查询", en: "Drop Finder", ja: "ドロップ検索", ko: "드롭 검색" })}
          </span>
        </div>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedSlug(null);
          }}
          placeholder={t(locale, {
            zh: "输入 Soulstone、Bronze Ingot、Kingdom Coin、箱子名...",
            en: "Type Soulstone, Bronze Ingot, Kingdom Coin, chest name...",
            ja: "Soulstone、Bronze Ingot、Kingdom Coin、宝箱名...",
            ko: "Soulstone, Bronze Ingot, Kingdom Coin, 상자 이름...",
          })}
          className="mt-3 w-full border border-accent-dim bg-bg-canvas px-4 py-3 text-base text-white outline-none placeholder:text-text-muted"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {hotTargets.map((target) => {
            const item = searchableItems.find((row) => row.slug.includes(target));
            if (!item) return null;
            return (
              <button
                key={item.slug}
                onClick={() => {
                  setSelectedSlug(item.slug);
                  setQuery(itemName(item, locale));
                }}
                className="border border-border-strong bg-bg-panel px-3 py-1.5 text-xs text-text-secondary hover:border-accent"
              >
                {itemName(item, locale)}
              </button>
            );
          })}
        </div>
      </section>

      {query.trim() && !selectedSlug ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((item) => (
            <button
              key={item.slug}
              onClick={() => {
                setSelectedSlug(item.slug);
                setQuery(itemName(item, locale));
              }}
              className="border border-border-default bg-bg-panel p-3 text-left transition hover:border-accent"
            >
              <ItemThumb item={item} locale={locale} />
            </button>
          ))}
        </div>
      ) : null}

      {selected ? (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="border border-border-default bg-bg-panel p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <ItemThumb item={selected} locale={locale} />
              <div className="flex flex-wrap gap-2">
                <Link href={localizedPath(locale, `/items/${selected.slug}`)} className="inline-flex items-center gap-2 border border-border-strong px-3 py-2 text-sm text-accent-bright hover:border-accent">
                  Item <ArrowRight className="h-4 w-4" />
                </Link>
                {market ? (
                  <Link href={localizedPath(locale, `/market/${selected.slug}`)} className="inline-flex items-center gap-2 border border-border-strong px-3 py-2 text-sm text-accent-bright hover:border-accent">
                    Market <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              <AnswerStat label={t(locale, { zh: "最佳关卡", en: "Best stage", ja: "最適ステージ", ko: "추천 스테이지" })} value={best ? `${best.diff} ${best.act}-${best.no}` : t(locale, { zh: "未知", en: "Unknown", ja: "不明", ko: "알 수 없음" })} />
              <AnswerStat label={t(locale, { zh: "单次概率", en: "Per run", ja: "1周あたり", ko: "1회 확률" })} value={best ? pct(best.totalDropChance) : "-"} accent />
              <AnswerStat label="50%" value={runs.p50 ? `${runs.p50}` : "-"} />
              <AnswerStat label="90%" value={runs.p90 ? `${runs.p90}` : "-"} />
            </div>

            {best ? (
              <Link href={localizedPath(locale, `/stages/${best.stageSlug}`)} className="mt-4 inline-flex items-center gap-2 bg-[#d4a017] px-4 py-2 text-sm font-semibold text-black hover:bg-accent-bright">
                {t(locale, { zh: "打开最佳关卡", en: "Open best stage", ja: "最適ステージを開く", ko: "추천 스테이지 열기" })}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <p className="mt-4 border border-border-default bg-bg-canvas p-3 text-sm text-text-secondary">
                {t(locale, { zh: "暂无掉落路线", en: "No drop route found", ja: "ドロップルートなし", ko: "드롭 경로 없음" })}
              </p>
            )}
          </div>

          <aside className="border border-border-default bg-bg-panel p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
              {t(locale, { zh: "箱子来源", en: "Chest source", ja: "宝箱元", ko: "상자 출처" })}
            </p>
            <div className="mt-3 space-y-2">
              {sources.length ? sources.slice(0, 5).map((source) => (
                <Link key={`${source.box_slug}-${source.box_type}`} href={localizedPath(locale, `/chests/${source.box_slug}`)} className="block border border-border-default bg-bg-canvas p-3 hover:border-accent">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-white">{source.box_name}</span>
                    <span className="font-mono text-xs text-accent-bright">{Number(source.drop_chance).toFixed(2)}%</span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{source.box_type} / {source.stages.length} stages</p>
                </Link>
              )) : (
                <p className="text-sm text-text-muted">{t(locale, { zh: "暂无箱子来源", en: "No chest source", ja: "宝箱元なし", ko: "상자 출처 없음" })}</p>
              )}
            </div>
          </aside>
        </section>
      ) : null}

      {bestStages.length > 1 ? (
        <section className="border border-border-default bg-bg-panel">
          <div className="border-b border-border-default px-4 py-3">
            <p className="text-sm font-semibold text-white">{t(locale, { zh: "备选关卡", en: "Next alternatives", ja: "代替ステージ", ko: "대체 스테이지" })}</p>
          </div>
          <div className="divide-y divide-[#27272a]">
            {bestStages.slice(1).map((stage, index) => (
              <Link key={stage.stageKey} href={localizedPath(locale, `/stages/${stage.stageSlug}`)} className="grid gap-2 p-3 hover:bg-bg-surface sm:grid-cols-[60px_1fr_120px]">
                <span className="font-mono text-sm text-accent-bright">#{index + 2}</span>
                <span className="text-sm text-white">{stage.diff} Act {stage.act}-{stage.no}</span>
                <span className="font-mono text-sm text-accent-bright">{pct(stage.totalDropChance)}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-t border-border-default pt-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {([
            ["stage", Map, t(locale, { zh: "按关卡查看", en: "By stage", ja: "ステージ別", ko: "스테이지별" })],
            ["chest", Boxes, t(locale, { zh: "按箱子查看", en: "By chest", ja: "宝箱別", ko: "상자별" })],
          ] as const).map(([key, Icon, label]) => (
            <button key={key} onClick={() => setMode(key)} className={`inline-flex items-center gap-2 border px-3 py-2 text-sm ${mode === key ? "border-accent bg-accent-soft text-accent-bright" : "border-border-default text-text-secondary"}`}>
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        {mode === "stage" ? <StageDropMode locale={locale} /> : <ChestDropMode locale={locale} />}
      </section>
    </div>
  );
}

function AnswerStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-border-default bg-bg-canvas p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-text-muted">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accent ? "text-accent-bright" : "text-white"}`}>{value}</p>
    </div>
  );
}

function StageDropMode({ locale }: { locale: Locale }) {
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
      .sort((a, b) => b.chance - a.chance)
      .slice(0, 30);
  }, [selectedStage]);

  return (
    <div className="space-y-3">
      <select value={stageKey} onChange={(event) => setStageKey(Number(event.target.value))} className="w-full border border-border-strong bg-bg-canvas px-3 py-2 text-sm text-white">
        {allStages().map((stage) => (
          <option key={stage.key} value={stage.key}>
            {stage.difficulty} Act {stage.act}-{stage.no} / Lv.{stage.level} / {stageName(stage, locale)}
          </option>
        ))}
      </select>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ item, sources, chance }) => (
          <Link key={item.slug} href={localizedPath(locale, `/items/${item.slug}`)} className="border border-border-default bg-bg-panel p-3 hover:border-accent">
            <ItemThumb item={item} locale={locale} />
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-text-muted">{sources.map((source) => source.box_name).join(" / ")}</span>
              <span className="font-mono text-accent-bright">{pct(chance)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ChestDropMode({ locale }: { locale: Locale }) {
  const [chestSlug, setChestSlug] = useState(chestItems()[0]?.slug ?? "");
  const selectedChest = chestItems().find((item) => item.slug === chestSlug);
  const rows = useMemo(() => {
    if (!selectedChest) return [];
    return allItems()
      .map((item) => {
        const source = dropsForItem(item.slug).find((entry) => entry.box_slug === selectedChest.slug);
        return source ? { item, source } : null;
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .sort((a, b) => Number(b.source.drop_chance) - Number(a.source.drop_chance))
      .slice(0, 60);
  }, [selectedChest]);

  return (
    <div className="space-y-3">
      <select value={chestSlug} onChange={(event) => setChestSlug(event.target.value)} className="w-full border border-border-strong bg-bg-canvas px-3 py-2 text-sm text-white">
        {chestItems().map((chest) => (
          <option key={chest.slug} value={chest.slug}>{itemName(chest, locale)} / {chest.grade}</option>
        ))}
      </select>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ item, source }) => (
          <Link key={item.slug} href={localizedPath(locale, `/items/${item.slug}`)} className="border border-border-default bg-bg-panel p-3 hover:border-accent">
            <ItemThumb item={item} locale={locale} />
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-text-muted">{source.box_type}</span>
              <span className="font-mono text-accent-bright">{Number(source.drop_chance).toFixed(2)}%</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
