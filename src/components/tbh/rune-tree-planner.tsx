"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Coins, Gem, Maximize2, Minus, Plus, Search, Target, UnlockKeyhole, Zap } from "lucide-react";
import type { Locale } from "@/lib/game-data/data";

export type RuneNode = {
  key: number;
  name: string;
  icon?: string;
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

/** Convert ext rune icon name (e.g. "Rune_AllHeroAttackDamage") to a public asset path. */
export function runeIconSrc(icon?: string): string | null {
  if (!icon) return null;
  const name = icon.startsWith("Rune_") ? icon.slice(5) : icon;
  return `/game/runes/${name}.png`;
}

type RouteKey = "early" | "heroSlots" | "farming" | "automation";

const WIDTH = 2376;
const HEIGHT = 1080;
const NODE = 22;

const tones: Record<string, { bg: string; border: string; glow: string; text: string; line: string; label: Record<Locale, string> }> = {
  Hero: { bg: "#451615", border: "#ff6b4a", glow: "rgba(255,107,74,0.28)", text: "#ffd8b9", line: "#9c3e2c", label: { zh: "英雄", en: "Hero", ja: "英雄" } },
  Gold: { bg: "#463209", border: "#f0c040", glow: "rgba(240,192,64,0.3)", text: "#ffe995", line: "#a57d18", label: { zh: "金币", en: "Gold", ja: "金策" } },
  EXP: { bg: "#12334f", border: "#4bb3ff", glow: "rgba(75,179,255,0.24)", text: "#caeaff", line: "#2d78b5", label: { zh: "经验", en: "EXP", ja: "経験" } },
  Slots: { bg: "#291d54", border: "#9f7aea", glow: "rgba(159,122,234,0.25)", text: "#e8dcff", line: "#6c55a6", label: { zh: "栏位", en: "Slots", ja: "枠" } },
  Chests: { bg: "#103c2a", border: "#4cc38a", glow: "rgba(76,195,138,0.24)", text: "#c9ffe3", line: "#2f8f62", label: { zh: "宝箱", en: "Chests", ja: "宝箱" } },
  Offline: { bg: "#3b1c45", border: "#df77dc", glow: "rgba(223,119,220,0.24)", text: "#ffd6fb", line: "#934c91", label: { zh: "离线", en: "Offline", ja: "放置" } },
  Cube: { bg: "#4a1623", border: "#f05e7c", glow: "rgba(240,94,124,0.22)", text: "#ffd7df", line: "#a33b51", label: { zh: "Cube", en: "Cube", ja: "Cube" } },
  Combat: { bg: "#4a1518", border: "#ff646b", glow: "rgba(255,100,107,0.22)", text: "#ffd3d5", line: "#a43b40", label: { zh: "战斗", en: "Combat", ja: "戦闘" } },
};

const routeNodes: Record<RouteKey, number[]> = {
  early: [1, 20, 21, 22, 25, 26, 27, 10, 11, 11001, 110011, 110012],
  heroSlots: [1, 20, 21, 22, 23, 24, 25, 26, 27],
  farming: [1, 10, 101, 102, 103, 20, 301, 302, 303, 201, 202, 203],
  automation: [1, 10, 11, 12, 13, 13002, 130021, 14, 15, 15001, 150011, 16, 1901, 1902, 1902001],
};

export function RuneTreePlanner({ runes, locale }: { runes: RuneNode[]; locale: Locale }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [selectedKey, setSelectedKey] = useState<number>(101);
  const [route, setRoute] = useState<RouteKey>("early");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(0.42);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const byKey = useMemo(() => new Map(runes.map((rune) => [rune.key, rune])), [runes]);
  const selected = byKey.get(selectedKey) ?? runes[0];
  const routeSet = useMemo(() => new Set(routeNodes[route]), [route]);
  const routeIndex = useMemo(() => new Map(routeNodes[route].map((key, index) => [key, index + 1])), [route]);
  const routeTotal = routeNodes[route].reduce((sum, key) => sum + (byKey.get(key)?.totalCost ?? 0), 0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return new Set(runes.filter((rune) => `${rune.name} ${rune.effect} ${rune.stat} ${rune.category}`.toLowerCase().includes(q)).map((rune) => rune.key));
  }, [query, runes]);

  const edges = useMemo(() => {
    return runes.flatMap((from) =>
      from.next
        .map((key) => {
          const to = byKey.get(key);
          return to ? { from, to, route: routeSet.has(from.key) && routeSet.has(to.key) } : null;
        })
        .filter((edge): edge is { from: RuneNode; to: RuneNode; route: boolean } => Boolean(edge)),
    );
  }, [byKey, routeSet, runes]);

  function resetView() {
    const box = viewportRef.current?.getBoundingClientRect();
    if (!box) return;
    const nextZoom = Math.min(0.56, Math.max(0.28, Math.min((box.width - 56) / WIDTH, (box.height - 56) / HEIGHT)));
    setZoom(nextZoom);
    setPan({ x: (box.width - WIDTH * nextZoom) / 2, y: (box.height - HEIGHT * nextZoom) / 2 });
  }

  useEffect(() => {
    resetView();
    const node = viewportRef.current;
    if (!node) return;
    const observer = new ResizeObserver(resetView);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function zoomBy(delta: number) {
    const box = viewportRef.current?.getBoundingClientRect();
    if (!box) return;
    const cx = box.width / 2;
    const cy = box.height / 2;
    const nextZoom = clamp(zoom + delta, 0.22, 1.25);
    const worldX = (cx - pan.x) / zoom;
    const worldY = (cy - pan.y) / zoom;
    setZoom(nextZoom);
    setPan({ x: cx - worldX * nextZoom, y: cy - worldY * nextZoom });
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const box = viewportRef.current?.getBoundingClientRect();
    if (!box) return;
    const mouseX = event.clientX - box.left;
    const mouseY = event.clientY - box.top;
    const nextZoom = clamp(zoom * (event.deltaY > 0 ? 0.9 : 1.1), 0.22, 1.25);
    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;
    setZoom(nextZoom);
    setPan({ x: mouseX - worldX * nextZoom, y: mouseY - worldY * nextZoom });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_330px]">
      <aside className="border border-[#3b2b17] bg-[#100c08] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c87925]">{copy(locale, "推荐路线", "Priority routes", "推奨ルート")}</p>
        <h2 className="mt-2 text-xl font-semibold text-[#fff7df]">{copy(locale, "按目标加点", "Pick by goal", "目的別に選ぶ")}</h2>
        <p className="mt-2 text-sm leading-6 text-[#a89779]">
          {copy(
            locale,
            "先拿改变玩法的节点，再补数值。拖动画布查看全树，滚轮缩放。",
            "Take play-changing nodes first, then stats. Drag the board and use the wheel to zoom.",
            "プレイが変わるノードを先に取り、数値は後で伸ばします。ドラッグとホイールで操作できます。",
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
                route === key ? "border-[#d4a017] bg-[#261706] shadow-[inset_3px_0_0_#d4a017]" : "border-[#2e2619] bg-[#0b0906] hover:border-[#8a6736]"
              }`}
            >
              <span className="block text-sm font-semibold text-[#fff7df]">{routeLabel(key, locale)}</span>
              <span className="mt-1 block text-xs leading-5 text-[#a89779]">{routeDescription(key, locale)}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 border border-[#2e2619] bg-[#090806] p-3">
          <div className="flex items-center justify-between text-xs text-[#8f826b]">
            <span>{copy(locale, "路线节点", "Route nodes", "ルートノード")}</span>
            <span>{routeNodes[route].length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#f0c040]">
              <Coins className="h-4 w-4" />
              {formatNumber(routeTotal)}
            </span>
            <span className="text-xs text-[#8f826b]">{copy(locale, "总成本", "total cost", "合計")}</span>
          </div>
        </div>
      </aside>

      <section className="overflow-hidden border border-[#3b2b17] bg-[#080706]">
        <div className="flex flex-col gap-3 border-b border-[#3b2b17] bg-[#100c08] p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c87925]">Rune board</span>
            <span className="text-sm text-[#a89779]">{runes.length} / {edges.length}</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block sm:w-[300px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#756850]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy(locale, "搜索符文、属性、效果", "Search rune, stat, effect", "ルーン、属性、効果")}
                className="w-full border border-[#342a1a] bg-[#090806] py-2 pl-9 pr-3 text-sm text-[#fff7df] outline-none placeholder:text-[#756850] focus:border-[#d4a017]"
              />
            </label>
            <div className="flex gap-1">
              <ControlButton label="Zoom out" onClick={() => zoomBy(-0.08)}><Minus className="h-4 w-4" /></ControlButton>
              <ControlButton label="Reset" onClick={resetView}><Maximize2 className="h-4 w-4" /></ControlButton>
              <ControlButton label="Zoom in" onClick={() => zoomBy(0.08)}><Plus className="h-4 w-4" /></ControlButton>
            </div>
          </div>
        </div>

        <div className="border-b border-[#2e2619] bg-[#0b0906] px-3 py-2">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(tones).map(([category, tone]) => (
              <span key={category} className="inline-flex items-center gap-1.5 border border-[#342a1a] bg-[#090806] px-2 py-1 text-[11px] text-[#cdbb9c]">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: tone.border }} />
                {tone.label[locale]}
              </span>
            ))}
          </div>
        </div>

        <div
          ref={viewportRef}
          onWheel={handleWheel}
          onPointerDown={(event) => {
            dragRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag) return;
            setPan({ x: drag.panX + event.clientX - drag.x, y: drag.panY + event.clientY - drag.y });
          }}
          onPointerUp={() => {
            dragRef.current = null;
          }}
          className="relative h-[520px] touch-none overflow-hidden bg-[#161008] cursor-grab active:cursor-grabbing sm:h-[620px]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(240,192,64,0.14) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: WIDTH,
              height: HEIGHT,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
              {edges.map((edge) => {
                const tone = tones[edge.from.category] ?? tones.Hero;
                return (
                  <line
                    key={`${edge.from.key}-${edge.to.key}`}
                    x1={edge.from.x}
                    y1={edge.from.y}
                    x2={edge.to.x}
                    y2={edge.to.y}
                    stroke={edge.route ? "#f0c040" : tone.line}
                    strokeWidth={edge.route ? 5 : 2}
                    strokeOpacity={edge.route ? 0.95 : 0.46}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>

            {runes.map((rune) => {
              const tone = tones[rune.category] ?? tones.Hero;
              const active = rune.key === selected.key;
              const inRoute = routeSet.has(rune.key);
              const matched = !matches || matches.has(rune.key);
              const step = routeIndex.get(rune.key);
              return (
                <button
                  key={rune.key}
                  onClick={() => setSelectedKey(rune.key)}
                  onPointerDown={(event) => event.stopPropagation()}
                  title={`${rune.name}: ${rune.effect}`}
                  className={`absolute rounded-[4px] border transition hover:z-20 hover:scale-125 ${
                    active ? "z-30 scale-125 ring-4 ring-[#f0c040]/45" : inRoute ? "z-20" : "z-10"
                  } ${matched ? "opacity-100" : "opacity-20"}`}
                  style={{
                    left: rune.x - NODE / 2,
                    top: rune.y - NODE / 2,
                    width: NODE,
                    height: NODE,
                    backgroundColor: tone.bg,
                    borderColor: inRoute ? "#f0c040" : tone.border,
                    boxShadow: active || inRoute ? `0 0 20px ${tone.glow}` : "0 2px 8px rgba(0,0,0,0.45)",
                  }}
                >
                  {rune.icon ? (
                    <Image
                      src={runeIconSrc(rune.icon)!}
                      alt={rune.name}
                      width={22}
                      height={22}
                      className="absolute inset-0 h-full w-full rounded-[3px] object-cover"
                      unoptimized
                    />
                  ) : (
                    <>
                      <span className="absolute inset-[4px] rounded-[2px] border border-white/15" style={{ backgroundColor: tone.border }} />
                      <span className="absolute inset-[8px] rounded-full bg-[#fff7df]/85" />
                    </>
                  )}
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 border border-[#2e2619] bg-[#060504] px-1 text-[9px] font-semibold leading-3 text-[#f5db9a]">
                    {rune.maxLevel}
                  </span>
                  {rune.isUnlock ? <UnlockKeyhole className="absolute -right-2 -top-2 h-4 w-4 text-[#f0c040]" /> : null}
                  {step ? (
                    <span className="absolute -left-2 -top-2 flex h-4 min-w-4 items-center justify-center border border-[#f0c040] bg-[#f0c040] px-1 text-[9px] font-black leading-4 text-[#120d06]">
                      {step}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="pointer-events-none absolute bottom-3 left-3 border border-[#342a1a] bg-[#090806]/90 px-2 py-1 text-[11px] text-[#a89779]">
            {copy(locale, "拖动平移 · 滚轮缩放", "Drag to pan · Wheel to zoom", "ドラッグ移動 · ホイール拡大")}
          </div>
        </div>
      </section>

      <RuneDetail rune={selected} locale={locale} route={route} routeStep={routeIndex.get(selected.key)} />
    </div>
  );
}

function RuneDetail({ rune, locale, route, routeStep }: { rune: RuneNode; locale: Locale; route: RouteKey; routeStep?: number }) {
  const tone = tones[rune.category] ?? tones.Hero;
  return (
    <aside className="border border-[#3b2b17] bg-[#100c08] p-4 xl:sticky xl:top-20 xl:self-start">
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 rounded-[6px] border" style={{ backgroundColor: tone.bg, borderColor: tone.border }}>
          {rune.icon ? (
            <Image src={runeIconSrc(rune.icon)!} alt={rune.name} width={48} height={48} className="h-full w-full rounded-[5px] object-cover" unoptimized />
          ) : (
            <>
              <span className="absolute inset-[9px] rounded-[3px]" style={{ backgroundColor: tone.border }} />
              <span className="absolute inset-[18px] rounded-full bg-[#fff7df]" />
            </>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-[#fff7df]">{rune.name}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8f826b]">{categoryLabel(rune.category, locale)}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#d8c7a6]">{rune.effect}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <InfoTile icon={<Zap className="h-4 w-4" />} label={copy(locale, "最高等级", "Max level", "最大Lv")} value={`Lv.${rune.maxLevel}`} />
        <InfoTile icon={<Coins className="h-4 w-4" />} label={copy(locale, "总成本", "Total cost", "合計")} value={formatNumber(rune.totalCost)} />
        <InfoTile icon={<Gem className="h-4 w-4" />} label={copy(locale, "属性", "Stat", "属性")} value={rune.stat} wide />
        <InfoTile icon={<Target className="h-4 w-4" />} label={copy(locale, "路线位置", "Route step", "ルート順")} value={routeStep ? `${routeStep} / ${routeNodes[route].length}` : copy(locale, "非推荐节点", "Off route", "推奨外")} wide />
      </div>

      <div className="mt-4 overflow-hidden border border-[#2e2619]">
        <div className="grid grid-cols-[48px_1fr_90px] border-b border-[#2e2619] bg-[#0b0906] px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-[#8f826b]">
          <span>Lv</span>
          <span>{copy(locale, "效果", "Effect", "効果")}</span>
          <span className="text-right">{copy(locale, "消耗", "Cost", "消費")}</span>
        </div>
        {rune.levels.map((level) => (
          <div key={level.level} className="grid grid-cols-[48px_1fr_90px] border-b border-[#211b12] px-3 py-2 text-sm last:border-b-0">
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

function ControlButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex h-9 w-9 items-center justify-center border border-[#342a1a] bg-[#090806] text-[#d8c7a6] hover:border-[#d4a017] hover:text-[#f0c040]">
      {children}
    </button>
  );
}

function InfoTile({ icon, label, value, wide = false }: { icon: React.ReactNode; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`border border-[#2e2619] bg-[#090806] p-3 ${wide ? "col-span-2" : ""}`}>
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
      zh: "开局不要先冲高价深层节点，先拿低成本功能节点。",
      en: "Do not rush expensive deep nodes early; take low-cost utility first.",
      ja: "序盤は高額深層ノードを急がず、低コスト機能を先に取ります。",
    },
    heroSlots: {
      zh: "第二英雄槽改变推图稳定性，第三英雄槽成本更高，按金币压力推进。",
      en: "The second slot changes stability; the third is expensive, so pace it by gold pressure.",
      ja: "2枠目は安定性を変え、3枠目は高額なので金策状況で進めます。",
    },
    farming: {
      zh: "清图稳定后再补掉率和收益；卡关时先回到英雄、防御和生存节点。",
      en: "Add drops and income after clears are stable; if stuck, return to hero, defense, and survival nodes.",
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
  return tones[category]?.label[locale] ?? category;
}

function copy(locale: Locale, zh: string, en: string, ja: string) {
  if (locale === "zh") return zh;
  if (locale === "ja") return ja;
  return en;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 100000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
