"use client";

import { useMemo, useState } from "react";
import { Coins, Gem, Search, Target, UnlockKeyhole, Zap } from "lucide-react";
import type { Locale } from "@/lib/game-data/data";

export type RuneNode = {
  key: number;
  name: string;
  x: number;
  y: number;
  maxLevel: number;
  next: number[];
  preview: number[];
  prevReq: number | null;
  stat: string;
  effect: string;
  category: string;
  isUnlock: boolean;
  levels: Array<{ level: number; value: string | null; cost: number }>;
  totalCost: number;
};

type RouteKey = "early" | "heroSlots" | "farming" | "automation";

const WIDTH = 2376;
const HEIGHT = 1080;
const SCALE = 0.46;
const PAD = 64;

const categoryTone: Record<string, { bg: string; border: string; text: string; line: string; short: string }> = {
  Hero: { bg: "#2a1712", border: "#d87038", text: "#ffd7a1", line: "#8a4b25", short: "H" },
  Gold: { bg: "#241a08", border: "#d4a017", text: "#ffe08a", line: "#8f6a19", short: "G" },
  EXP: { bg: "#101d28", border: "#4aa3ff", text: "#bfe1ff", line: "#2d6caa", short: "X" },
  Slots: { bg: "#1a1527", border: "#9f7aea", text: "#dfd1ff", line: "#6d51a8", short: "S" },
  Chests: { bg: "#102019", border: "#4cc38a", text: "#c8ffe1", line: "#2e875d", short: "C" },
  Offline: { bg: "#221526", border: "#da73d6", text: "#ffd2fb", line: "#934a90", short: "O" },
  Cube: { bg: "#241314", border: "#e85d75", text: "#ffd3da", line: "#9d3849", short: "U" },
  Combat: { bg: "#2a1215", border: "#ff5f66", text: "#ffd1d4", line: "#9f3539", short: "B" },
};

const routeNodes: Record<RouteKey, number[]> = {
  early: [1, 20, 21, 22, 25, 26, 27, 10, 11, 11001, 110011, 110012],
  heroSlots: [1, 20, 21, 22, 23, 24, 25, 26, 27],
  farming: [1, 10, 101, 102, 103, 20, 301, 302, 303, 201, 202, 203],
  automation: [1, 10, 11, 12, 13, 13002, 130021, 14, 15, 15001, 150011, 16, 1901, 1902, 1902001],
};

export function RuneTreePlanner({ runes, locale }: { runes: RuneNode[]; locale: Locale }) {
  const [selectedKey, setSelectedKey] = useState<number>(21);
  const [route, setRoute] = useState<RouteKey>("early");
  const [query, setQuery] = useState("");

  const byKey = useMemo(() => new Map(runes.map((rune) => [rune.key, rune])), [runes]);
  const selected = byKey.get(selectedKey) ?? runes[0];
  const routeSet = useMemo(() => new Set(routeNodes[route]), [route]);
  const routeIndex = useMemo(() => new Map(routeNodes[route].map((key, index) => [key, index + 1])), [route]);
  const q = query.trim().toLowerCase();
  const matchingKeys = useMemo(() => {
    if (!q) return null;
    return new Set(runes.filter((rune) => `${rune.name} ${rune.effect} ${rune.stat} ${rune.category}`.toLowerCase().includes(q)).map((rune) => rune.key));
  }, [q, runes]);

  const edges = useMemo(() => {
    return runes.flatMap((rune) =>
      rune.next
        .map((nextKey) => {
          const next = byKey.get(nextKey);
          return next ? { from: rune, to: next, route: routeSet.has(rune.key) && routeSet.has(next.key) } : null;
        })
        .filter((edge): edge is { from: RuneNode; to: RuneNode; route: boolean } => Boolean(edge)),
    );
  }, [byKey, routeSet, runes]);

  const routeTotal = routeNodes[route].reduce((sum, key) => sum + (byKey.get(key)?.totalCost ?? 0), 0);

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside className="border border-[#2d281e] bg-[#0d0b08] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c87925]">{copy(locale, "推荐路线", "Priority routes", "推奨ルート")}</p>
        <h2 className="mt-2 text-xl font-semibold text-[#fff7df]">{copy(locale, "先解决关键解锁，再补收益", "Unlock key nodes first", "重要解放を先に取る")}</h2>
        <p className="mt-2 text-sm leading-6 text-[#9d8f78]">
          {copy(
            locale,
            "符文加点的核心不是全点满，而是先拿英雄槽、离线收益、经验/金币和自动开箱这些改变玩法的节点。",
            "Rune planning is not about maxing everything. Prioritize nodes that change play: hero slots, offline gains, EXP/gold, and auto-open.",
            "全取得ではなく、英雄枠、放置報酬、経験値/ゴールド、自動開封などプレイが変わるノードを先に取ります。",
          )}
        </p>

        <div className="mt-4 space-y-2">
          {(Object.keys(routeNodes) as RouteKey[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                setRoute(key);
                setSelectedKey(routeNodes[key][0]);
              }}
              className={`w-full border px-3 py-3 text-left transition ${
                route === key ? "border-[#c87925] bg-[#211408]" : "border-[#2d281e] bg-[#11100d] hover:border-[#7c5a2c]"
              }`}
            >
              <span className="block text-sm font-semibold text-[#fff7df]">{routeLabel(key, locale)}</span>
              <span className="mt-1 block text-xs leading-5 text-[#9d8f78]">{routeDescription(key, locale)}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 border border-[#2d281e] bg-[#090806] p-3">
          <div className="flex items-center justify-between gap-3 text-xs text-[#8f826b]">
            <span>{copy(locale, "路线节点", "Route nodes", "ルートノード")}</span>
            <span>{routeNodes[route].length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#f0c040]">
              <Coins className="h-4 w-4" />
              {formatNumber(routeTotal)}
            </span>
            <span className="text-xs text-[#8f826b]">{copy(locale, "总成本", "total cost", "合計コスト")}</span>
          </div>
        </div>
      </aside>

      <section className="overflow-hidden border border-[#2d281e] bg-[#070706]">
        <div className="flex flex-col gap-3 border-b border-[#2d281e] bg-[#0d0b08] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c87925]">Rune board</p>
            <p className="mt-1 text-sm text-[#9d8f78]">
              {runes.length} {copy(locale, "个符文", "runes", "ルーン")} / {edges.length} {copy(locale, "条连接", "links", "接続")}
            </p>
          </div>
          <label className="relative block w-full sm:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#756850]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy(locale, "搜索符文、属性、效果", "Search rune, stat, effect", "ルーン、効果、属性を検索")}
              className="w-full border border-[#342a1a] bg-[#090806] py-2 pl-9 pr-3 text-sm text-[#fff7df] outline-none transition placeholder:text-[#756850] focus:border-[#c87925]"
            />
          </label>
        </div>

        <div className="overflow-auto">
          <div
            className="relative"
            style={{
              width: WIDTH * SCALE + PAD * 2,
              height: HEIGHT * SCALE + PAD * 2,
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(200,121,37,0.12) 1px, transparent 0)",
              backgroundSize: "36px 36px",
            }}
          >
            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
              {edges.map((edge) => {
                const fromTone = categoryTone[edge.from.category] ?? categoryTone.Hero;
                const x1 = edge.from.x * SCALE + PAD;
                const y1 = edge.from.y * SCALE + PAD;
                const x2 = edge.to.x * SCALE + PAD;
                const y2 = edge.to.y * SCALE + PAD;
                return (
                  <line
                    key={`${edge.from.key}-${edge.to.key}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={edge.route ? "#f0c040" : fromTone.line}
                    strokeWidth={edge.route ? 3 : 1.4}
                    strokeOpacity={edge.route ? 0.95 : 0.48}
                  />
                );
              })}
            </svg>

            {runes.map((rune) => {
              const tone = categoryTone[rune.category] ?? categoryTone.Hero;
              const active = selected.key === rune.key;
              const inRoute = routeSet.has(rune.key);
              const matched = !matchingKeys || matchingKeys.has(rune.key);
              const step = routeIndex.get(rune.key);
              return (
                <button
                  key={rune.key}
                  onClick={() => setSelectedKey(rune.key)}
                  title={`${rune.name}: ${rune.effect}`}
                  className={`absolute flex h-11 w-11 items-center justify-center border text-sm font-black shadow-lg transition hover:z-20 hover:scale-110 ${
                    active ? "z-20 scale-110 ring-2 ring-[#f0c040]" : "z-10"
                  } ${matched ? "opacity-100" : "opacity-25"}`}
                  style={{
                    left: rune.x * SCALE + PAD - 22,
                    top: rune.y * SCALE + PAD - 22,
                    backgroundColor: tone.bg,
                    borderColor: inRoute ? "#f0c040" : tone.border,
                    color: tone.text,
                    boxShadow: inRoute ? "0 0 24px rgba(240,192,64,0.28)" : undefined,
                  }}
                >
                  <span>{tone.short}</span>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 border border-[#2d281e] bg-[#090806] px-1 text-[9px] font-semibold text-[#d8c7a6]">
                    {rune.maxLevel}
                  </span>
                  {rune.isUnlock ? <UnlockKeyhole className="absolute -right-2 -top-2 h-4 w-4 text-[#f0c040]" /> : null}
                  {step ? (
                    <span className="absolute -left-2 -top-2 flex h-5 min-w-5 items-center justify-center border border-[#f0c040] bg-[#f0c040] px-1 text-[10px] font-black text-[#120d06]">
                      {step}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <RuneDetail rune={selected} locale={locale} route={route} routeStep={routeIndex.get(selected.key)} />
    </div>
  );
}

function RuneDetail({ rune, locale, route, routeStep }: { rune: RuneNode; locale: Locale; route: RouteKey; routeStep?: number }) {
  const tone = categoryTone[rune.category] ?? categoryTone.Hero;
  return (
    <aside className="border border-[#2d281e] bg-[#0d0b08] p-4 xl:sticky xl:top-20 xl:self-start">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 items-center justify-center border text-xl font-black" style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.text }}>
          {tone.short}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-[#fff7df]">{rune.name}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8f826b]">{categoryLabel(rune.category, locale)}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#d8c7a6]">{rune.effect}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <InfoTile icon={<Zap className="h-4 w-4" />} label={copy(locale, "最高等级", "Max level", "最大Lv")} value={`Lv.${rune.maxLevel}`} />
        <InfoTile icon={<Coins className="h-4 w-4" />} label={copy(locale, "总成本", "Total cost", "合計コスト")} value={formatNumber(rune.totalCost)} />
        <InfoTile icon={<Gem className="h-4 w-4" />} label={copy(locale, "属性", "Stat", "属性")} value={rune.stat} wide />
        <InfoTile icon={<Target className="h-4 w-4" />} label={copy(locale, "路线位置", "Route step", "ルート順")} value={routeStep ? `${routeStep} / ${routeNodes[route].length}` : copy(locale, "非推荐节点", "Off route", "推奨外")} wide />
      </div>

      <div className="mt-4 border border-[#2d281e]">
        <div className="grid grid-cols-[64px_1fr_96px] border-b border-[#2d281e] bg-[#11100d] px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-[#8f826b]">
          <span>Lv</span>
          <span>{copy(locale, "效果", "Effect", "効果")}</span>
          <span className="text-right">{copy(locale, "成本", "Cost", "コスト")}</span>
        </div>
        {rune.levels.map((level) => (
          <div key={level.level} className="grid grid-cols-[64px_1fr_96px] border-b border-[#211b12] px-3 py-2 text-sm last:border-b-0">
            <span className="text-[#9d8f78]">{level.level}</span>
            <span className="min-w-0 truncate text-[#fff7df]">{level.value ?? copy(locale, "解锁", "Unlock", "解放")}</span>
            <span className="text-right font-semibold text-[#f0c040]">{formatNumber(level.cost)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <RelationRow label={copy(locale, "前置要求", "Required level", "前提")} value={rune.prevReq ? `Lv.${rune.prevReq}` : copy(locale, "无", "None", "なし")} />
        <RelationRow label={copy(locale, "后续节点", "Next nodes", "次ノード")} value={rune.next.length ? rune.next.join(", ") : copy(locale, "无", "None", "なし")} />
        <RelationRow label={copy(locale, "预览节点", "Preview nodes", "プレビュー")} value={rune.preview.length ? rune.preview.join(", ") : copy(locale, "无", "None", "なし")} />
      </div>

      <div className="mt-4 border border-[#3a2a16] bg-[#171006] p-3 text-xs leading-5 text-[#d8c7a6]">
        <span className="font-semibold text-[#f0c040]">{routeLabel(route, locale)}: </span>
        {routeTip(route, locale)}
      </div>
    </aside>
  );
}

function InfoTile({ icon, label, value, wide = false }: { icon: React.ReactNode; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`border border-[#2d281e] bg-[#090806] p-3 ${wide ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-2 text-xs text-[#8f826b]">
        <span className="text-[#c87925]">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-[#fff7df]">{value}</p>
    </div>
  );
}

function RelationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border border-[#211b12] bg-[#090806] px-3 py-2">
      <span className="text-[#8f826b]">{label}</span>
      <span className="truncate text-right text-[#fff7df]">{value}</span>
    </div>
  );
}

function routeLabel(route: RouteKey, locale: Locale) {
  const labels: Record<RouteKey, Record<Locale, string>> = {
    early: { zh: "新手开局", en: "Beginner route", ja: "初心者ルート" },
    heroSlots: { zh: "三英雄槽", en: "Hero slots", ja: "英雄枠" },
    farming: { zh: "金币/经验刷取", en: "Gold and EXP", ja: "金策/経験値" },
    automation: { zh: "自动开箱", en: "Chest automation", ja: "自動開封" },
  };
  return labels[route][locale];
}

function routeDescription(route: RouteKey, locale: Locale) {
  const text: Record<RouteKey, Record<Locale, string>> = {
    early: {
      zh: "先拿 Growth、Command、离线收益和基础金币经验。",
      en: "Start with Growth, Command, offline gains, and basic gold/EXP.",
      ja: "Growth、Command、放置報酬、基本金策/経験値を先に取る。",
    },
    heroSlots: {
      zh: "围绕 Rune of Command 解锁第二、第三英雄槽。",
      en: "Push Rune of Command to unlock extra hero slots.",
      ja: "Rune of Command を軸に追加英雄枠を解放する。",
    },
    farming: {
      zh: "优先经验、金币和宝箱掉率，适合刷图推进。",
      en: "Prioritize EXP, gold, and chest chances for farming.",
      ja: "周回向けに経験値、ゴールド、宝箱率を優先する。",
    },
    automation: {
      zh: "拿自动开普通、Stage Boss、Act Boss 宝箱节点。",
      en: "Unlock auto-open for normal, stage boss, and act boss chests.",
      ja: "通常、Stage Boss、Act Boss 宝箱の自動開封を取る。",
    },
  };
  return text[route][locale];
}

function routeTip(route: RouteKey, locale: Locale) {
  const tips: Record<RouteKey, Record<Locale, string>> = {
    early: {
      zh: "不熟悉游戏时不要先点深层高价节点，先拿低成本功能节点。",
      en: "Do not rush expensive deep nodes early; take low-cost utility first.",
      ja: "序盤は高額深層ノードを急がず、低コスト機能を先に取ります。",
    },
    heroSlots: {
      zh: "第二英雄槽改变推图稳定性，第三英雄槽成本更高，按金币压力推进。",
      en: "The second slot changes stability; the third is expensive, so pace it by gold pressure.",
      ja: "2枠目は安定性を変え、3枠目は高額なので金策状況で進めます。",
    },
    farming: {
      zh: "只在清图稳定后补掉率和收益，卡关时先回到英雄与防御节点。",
      en: "Add drops and income after clears are stable; if stuck, return to hero and defense nodes.",
      ja: "安定クリア後にドロップと報酬を伸ばし、詰まるなら英雄/防御へ戻ります。",
    },
    automation: {
      zh: "自动开箱是便利节点，不等于收益保证；缺掉率和真实价格时不要估算市场收益。",
      en: "Auto-open is convenience, not guaranteed profit; avoid market estimates without rates and real prices.",
      ja: "自動開封は便利機能であり利益保証ではありません。率と実価格がない時は市場収益を見積もりません。",
    },
  };
  return tips[route][locale];
}

function categoryLabel(category: string, locale: Locale) {
  const labels: Record<string, Record<Locale, string>> = {
    Hero: { zh: "英雄属性", en: "Hero stats", ja: "英雄ステータス" },
    Gold: { zh: "金币", en: "Gold", ja: "ゴールド" },
    EXP: { zh: "经验", en: "EXP", ja: "経験値" },
    Slots: { zh: "槽位/背包", en: "Slots", ja: "枠/バッグ" },
    Chests: { zh: "宝箱", en: "Chests", ja: "宝箱" },
    Offline: { zh: "离线收益", en: "Offline", ja: "放置報酬" },
    Cube: { zh: "Cube", en: "Cube", ja: "Cube" },
    Combat: { zh: "战斗", en: "Combat", ja: "戦闘" },
  };
  return labels[category]?.[locale] ?? category;
}

function copy(locale: Locale, zh: string, en: string, ja: string) {
  if (locale === "zh") return zh;
  if (locale === "ja") return ja;
  return en;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 100000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}
