"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/components/ui/safe-image";
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
const NODE = 32; // DNF-style hexagonal node

/** Flat-top hexagon clip-path used by DNF skill-tree nodes */
const HEX_CLIP = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

const tones: Record<string, { bg: string; border: string; glow: string; text: string; line: string; label: Partial<Record<Locale, string>> }> = {
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
    const lockPageScroll = (event: WheelEvent) => {
      event.preventDefault();
    };
    node.addEventListener("wheel", lockPageScroll, { passive: false });
    return () => {
      observer.disconnect();
      node.removeEventListener("wheel", lockPageScroll);
    };
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
        <h2 className="mt-2 text-xl font-semibold text-text-primary">{copy(locale, "按目标加点", "Pick by goal", "目的別に選ぶ")}</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
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
                route === key ? "border-accent bg-[#261706] shadow-[inset_3px_0_0_#d4a017]" : "border-accent-dim bg-bg-deep hover:border-[#8a6736]"
              }`}
            >
              <span className="block text-sm font-semibold text-text-primary">{routeLabel(key, locale)}</span>
              <span className="mt-1 block text-xs leading-5 text-text-secondary">{routeDescription(key, locale)}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 border border-accent-dim bg-bg-deep p-3">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>{copy(locale, "路线节点", "Route nodes", "ルートノード")}</span>
            <span>{routeNodes[route].length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent-bright">
              <Coins className="h-4 w-4" />
              {formatNumber(routeTotal)}
            </span>
            <span className="text-xs text-text-muted">{copy(locale, "总成本", "total cost", "合計")}</span>
          </div>
        </div>
      </aside>

      <section className="overflow-hidden border border-[#3b2b17] bg-[#080706]">
        <div className="flex flex-col gap-3 border-b border-[#3b2b17] bg-[#100c08] p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c87925]">Rune board</span>
            <span className="text-sm text-text-secondary">{runes.length} / {edges.length}</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block sm:w-[300px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#756850]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy(locale, "搜索符文、属性、效果", "Search rune, stat, effect", "ルーン、属性、効果")}
                className="w-full border border-[#342a1a] bg-bg-deep py-2 pl-9 pr-3 text-sm text-text-primary outline-none placeholder:text-[#756850] focus:border-accent"
              />
            </label>
            <div className="flex gap-1">
              <ControlButton label="Zoom out" onClick={() => zoomBy(-0.08)}><Minus className="h-4 w-4" /></ControlButton>
              <ControlButton label="Reset" onClick={resetView}><Maximize2 className="h-4 w-4" /></ControlButton>
              <ControlButton label="Zoom in" onClick={() => zoomBy(0.08)}><Plus className="h-4 w-4" /></ControlButton>
            </div>
          </div>
        </div>

        <div className="border-b border-accent-dim bg-bg-deep px-3 py-2">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(tones).map(([category, tone]) => (
              <span key={category} className="inline-flex items-center gap-1.5 border border-[#342a1a] bg-bg-deep px-2 py-1 text-[11px] text-[#cdbb9c]">
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
          className="relative h-[520px] touch-none overscroll-contain overflow-hidden bg-[#161008] cursor-grab active:cursor-grabbing sm:h-[620px]"
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
              <defs>
                <filter id="dnf-glow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {/* glow layer */}
              {edges.map((edge) => {
                const tone = tones[edge.from.category] ?? tones.Hero;
                if (!edge.route) return null;
                return (
                  <line
                    key={`glow-${edge.from.key}-${edge.to.key}`}
                    x1={edge.from.x}
                    y1={edge.from.y}
                    x2={edge.to.x}
                    y2={edge.to.y}
                    stroke="#f0c040"
                    strokeWidth={5}
                    strokeOpacity={0.55}
                    strokeLinecap="round"
                    filter="url(#dnf-glow)"
                  />
                );
              })}
              {/* main lines */}
              {edges.map((edge) => {
                const tone = tones[edge.from.category] ?? tones.Hero;
                return (
                  <line
                    key={`${edge.from.key}-${edge.to.key}`}
                    x1={edge.from.x}
                    y1={edge.from.y}
                    x2={edge.to.x}
                    y2={edge.to.y}
                    stroke={edge.route ? "#ffe180" : tone.line}
                    strokeWidth={edge.route ? 2.5 : 1.5}
                    strokeOpacity={edge.route ? 0.9 : 0.35}
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
              const iconSrc = rune.icon ? runeIconSrc(rune.icon) : null;
              return (
                <button
                  key={rune.key}
                  onClick={() => setSelectedKey(rune.key)}
                  onPointerDown={(event) => event.stopPropagation()}
                  title={`${rune.name}: ${rune.effect}`}
                  className={`absolute transition-all duration-150 hover:z-20 ${
                    active ? "z-30 scale-125" : inRoute ? "z-20" : "z-10"
                  } ${matched ? "opacity-100" : "opacity-20"}`}
                  style={{
                    left: rune.x - NODE / 2,
                    top: rune.y - NODE / 2,
                    width: NODE,
                    height: NODE,
                  }}
                >
                  {/* Hex outer glow */}
                  <span
                    className="absolute -inset-[3px] transition-opacity duration-150"
                    style={{
                      clipPath: HEX_CLIP,
                      opacity: active || inRoute ? 1 : 0,
                      boxShadow: active || inRoute ? `0 0 18px ${tone.glow}, 0 0 36px ${tone.glow}` : "none",
                    }}
                  />
                  {/* Hex body */}
                  <span
                    className="absolute inset-0 flex items-center justify-center transition-colors duration-150"
                    style={{
                      clipPath: HEX_CLIP,
                      backgroundColor: tone.bg,
                      border: `2px solid ${inRoute ? "#f0c040" : tone.border}`,
                      boxShadow: active ? `inset 0 0 12px ${tone.glow}` : inRoute ? `inset 0 0 6px ${tone.glow}` : "inset 0 1px 3px rgba(0,0,0,0.5)",
                    }}
                  >
                    {/* Hex highlight (top-left sheen) */}
                    <span
                      className="absolute inset-0 opacity-25"
                      style={{
                        clipPath: HEX_CLIP,
                        background: `linear-gradient(135deg, ${tone.border}44 0%, transparent 50%)`,
                      }}
                    />
                    {/* Icon */}
                    {iconSrc ? (
                      <SafeImage
                        src={iconSrc}
                        alt={rune.name}
                        width={32}
                        height={32}
                        className="relative z-10 h-5 w-5 object-contain"
                        style={{ imageRendering: "pixelated" }}
                        unoptimized
                      />
                    ) : (
                      <span className="relative z-10 h-2 w-2 rounded-full bg-[#fff7df]/85" />
                    )}
                  </span>
                  {/* maxLevel badge */}
                  <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 border border-[#3b2b17] bg-[#0a0806] px-1.5 text-[10px] font-bold leading-3 text-accent-bright shadow-[0_0_6px_rgba(240,192,64,0.3)]">
                    {rune.maxLevel > 1 ? `Lv${rune.maxLevel}` : ""}
                  </span>
                  {/* Unlock icon */}
                  {rune.isUnlock ? (
                    <span className="absolute -right-1 -top-1 z-20 flex h-5 w-5 items-center justify-center rounded-full border border-accent-bright bg-[#120d06] shadow-[0_0_8px_rgba(240,192,64,0.4)]">
                      <UnlockKeyhole className="h-3 w-3 text-accent-bright" />
                    </span>
                  ) : null}
                  {/* Route step number */}
                  {step ? (
                    <span className="absolute -left-1 -top-1 z-20 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#120d06] bg-[#f0c040] px-1 text-[9px] font-black leading-4 text-[#120d06] shadow-[0_0_8px_rgba(240,192,64,0.5)]">
                      {step}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="pointer-events-none absolute bottom-3 left-3 border border-[#342a1a] bg-bg-deep/90 px-2 py-1 text-[11px] text-text-secondary">
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
        <div
          className="relative flex h-14 w-14 items-center justify-center"
          style={{
            clipPath: HEX_CLIP,
            backgroundColor: tone.bg,
            border: `2.5px solid ${tone.border}`,
            boxShadow: `0 0 16px ${tone.glow}, inset 0 0 10px ${tone.glow}`,
          }}
        >
          <span
            className="absolute inset-0 opacity-20"
            style={{
              clipPath: HEX_CLIP,
              background: `linear-gradient(135deg, ${tone.border}66 0%, transparent 55%)`,
            }}
          />
          {rune.icon ? (
            <SafeImage
              src={runeIconSrc(rune.icon)!}
              alt={rune.name}
              width={48}
              height={48}
              className="relative z-10 h-7 w-7 object-contain"
              style={{ imageRendering: "pixelated" }}
              unoptimized
            />
          ) : (
            <span className="relative z-10 h-3 w-3 rounded-full bg-[#fff7df]/90" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-text-primary">{rune.name}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-text-muted">{categoryLabel(rune.category, locale)}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#d8c7a6]">{rune.effect}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <InfoTile icon={<Zap className="h-4 w-4" />} label={copy(locale, "最高等级", "Max level", "最大Lv")} value={`Lv.${rune.maxLevel}`} />
        <InfoTile icon={<Coins className="h-4 w-4" />} label={copy(locale, "总成本", "Total cost", "合計")} value={formatNumber(rune.totalCost)} />
        <InfoTile icon={<Gem className="h-4 w-4" />} label={copy(locale, "属性", "Stat", "属性")} value={rune.stat} wide />
        <InfoTile icon={<Target className="h-4 w-4" />} label={copy(locale, "路线位置", "Route step", "ルート順")} value={routeStep ? `${routeStep} / ${routeNodes[route].length}` : copy(locale, "非推荐节点", "Off route", "推奨外")} wide />
      </div>

      <div className="mt-4 overflow-hidden border border-accent-dim">
        <div className="grid grid-cols-[48px_1fr_90px] border-b border-accent-dim bg-bg-deep px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-text-muted">
          <span>Lv</span>
          <span>{copy(locale, "效果", "Effect", "効果")}</span>
          <span className="text-right">{copy(locale, "消耗", "Cost", "消費")}</span>
        </div>
        {rune.levels.map((level) => (
          <div key={level.level} className="grid grid-cols-[48px_1fr_90px] border-b border-[#211b12] px-3 py-2 text-sm last:border-b-0">
            <span className="text-[#9d8f78]">{level.level}</span>
            <span className="min-w-0 truncate text-text-primary">{level.value ?? copy(locale, "解锁", "Unlock", "解放")}</span>
            <span className="text-right font-semibold text-accent-bright">{formatNumber(level.cost)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <RelationRow label={copy(locale, "前置要求", "Required level", "前提")} value={rune.prevReq ? `Lv.${rune.prevReq}` : copy(locale, "无", "None", "なし")} />
        <RelationRow label={copy(locale, "后续节点", "Next nodes", "次ノード")} value={rune.next.length ? rune.next.join(", ") : copy(locale, "无", "None", "なし")} />
        <RelationRow label={copy(locale, "预览节点", "Preview nodes", "プレビュー")} value={rune.preview.length ? rune.preview.join(", ") : copy(locale, "无", "None", "なし")} />
      </div>

      <div className="mt-4 border border-[#3a2a16] bg-[#171006] p-3 text-xs leading-5 text-[#d8c7a6]">
        <span className="font-semibold text-accent-bright">{routeLabel(route, locale)}: </span>
        {routeTip(route, locale)}
      </div>
    </aside>
  );
}

function ControlButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex h-9 w-9 items-center justify-center border border-[#342a1a] bg-bg-deep text-[#d8c7a6] hover:border-accent hover:text-accent-bright">
      {children}
    </button>
  );
}

function InfoTile({ icon, label, value, wide = false }: { icon: React.ReactNode; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`border border-accent-dim bg-bg-deep p-3 ${wide ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span className="text-[#c87925]">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function RelationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border border-[#211b12] bg-bg-deep px-3 py-2">
      <span className="text-text-muted">{label}</span>
      <span className="truncate text-right text-text-primary">{value}</span>
    </div>
  );
}

function routeLabel(route: RouteKey, locale: Locale) {
  const labels: Record<RouteKey, Partial<Record<Locale, string>>> = {
    early: { zh: "新手开局", en: "Beginner route", ja: "初心者ルート" },
    heroSlots: { zh: "三英雄槽", en: "Hero slots", ja: "英雄枠" },
    farming: { zh: "金币/经验刷取", en: "Gold and EXP", ja: "金策/経験値" },
    automation: { zh: "自动开箱", en: "Chest automation", ja: "自動開封" },
  };
  return labels[route][locale];
}

function routeDescription(route: RouteKey, locale: Locale) {
  const text: Record<RouteKey, Partial<Record<Locale, string>>> = {
    early: {
      zh: "先拿 Growth、Command、离线收益和基础金币经验。",
      en: "Growth, Command, offline gains, and basic gold/EXP first.",
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
  const tips: Record<RouteKey, Partial<Record<Locale, string>>> = {
    early: {
      zh: "开局优先低成本功能节点，再推进高价深层节点。",
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
      zh: "自动开箱提供便利，收益评估需要结合掉率和真实价格。",
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
