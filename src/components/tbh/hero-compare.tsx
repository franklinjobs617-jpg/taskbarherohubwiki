"use client";

import { useState } from "react";
import { allHeroes, heroName, type Hero, type Locale } from "@/lib/game-data/data";

type HeroStat = { label: string; value: number; maxValue: number };

function getHeroStats(hero: Hero, locale: Locale): HeroStat[] {
  const isZh = locale === "zh";
  // Normalize stats to 0-100 scale for radar chart
  const all = allHeroes();
  const maxHp = Math.max(...all.map((h) => h.MaxHp ?? 0));
  const maxAtk = Math.max(...all.map((h) => h.AttackDamage ?? 0));
  const maxAspd = Math.max(...all.map((h) => h.AttackSpeed ?? 0));
  const maxCrit = Math.max(...all.map((h) => h.CriticalChance ?? 0));
  const maxCritDmg = Math.max(...all.map((h) => h.CriticalDamage ?? 0));
  const maxArmor = Math.max(...all.map((h) => h.Armor ?? 0));
  const maxSpeed = Math.max(...all.map((h) => h.MovementSpeed ?? 0));

  return [
    { label: isZh ? "生命" : "HP", value: ((hero.MaxHp ?? 0) / maxHp) * 100, maxValue: 100 },
    { label: isZh ? "攻击" : "ATK", value: ((hero.AttackDamage ?? 0) / maxAtk) * 100, maxValue: 100 },
    { label: isZh ? "攻速" : "ASPD", value: ((hero.AttackSpeed ?? 0) / maxAspd) * 100, maxValue: 100 },
    { label: isZh ? "暴击" : "Crit", value: ((hero.CriticalChance ?? 0) / maxCrit) * 100, maxValue: 100 },
    { label: isZh ? "暴伤" : "CDmg", value: ((hero.CriticalDamage ?? 0) / maxCritDmg) * 100, maxValue: 100 },
    { label: isZh ? "护甲" : "Armor", value: ((hero.Armor ?? 0) / maxArmor) * 100, maxValue: 100 },
  ];
}

// SVG Radar Chart for one hero
export function HeroRadar({
  hero,
  locale,
  size = 200,
}: {
  hero: Hero;
  locale: Locale;
  size?: number;
}) {
  const stats = getHeroStats(hero, locale);
  const center = size / 2;
  const radius = (size / 2) * 0.7;
  const angleStep = (2 * Math.PI) / stats.length;

  const points = stats.map((stat, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const r = (stat.value / stat.maxValue) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      labelX: center + radius * 1.15 * Math.cos(angle),
      labelY: center + radius * 1.15 * Math.sin(angle),
      label: stat.label,
      value: stat.value,
    };
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Background grid (50%, 100%)
  const grid50 = stats.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    return `${center + radius * 0.5 * Math.cos(angle)},${center + radius * 0.5 * Math.sin(angle)}`;
  }).join(" ");
  const grid100 = stats.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    return `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`;
  }).join(" ");

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Grid */}
      <polygon points={grid50} fill="none" stroke="#27272a" strokeWidth="0.5" />
      <polygon points={grid100} fill="none" stroke="#27272a" strokeWidth="0.5" />
      {/* Axis lines */}
      {stats.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="#27272a"
            strokeWidth="0.5"
          />
        );
      })}
      {/* Data polygon */}
      <polygon points={polygonPoints} fill="rgba(212, 160, 23, 0.15)" stroke="#d4a017" strokeWidth="1.5" />
      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#d4a017" />
      ))}
      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.labelX}
          y={p.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-[#6c6c6c] text-[9px]"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

// Side-by-side hero comparison
export function HeroCompareMatrix({ locale }: { locale: Locale }) {
  const heroes = allHeroes();
  const isZh = locale === "zh";

  // Calculate role scores from real stats
  const roles = [
    {
      key: "survivability",
      label: isZh ? "生存力" : "Survivability",
      desc: isZh ? "HP × Armor" : "HP × Armor",
      calc: (h: Hero) => (h.MaxHp ?? 0) * (h.Armor ?? 0) / 100,
    },
    {
      key: "burst",
      label: isZh ? "爆发" : "Burst",
      desc: isZh ? "Crit% × CritDmg" : "Crit% × CritDmg",
      calc: (h: Hero) => ((h.CriticalChance ?? 0) * (h.CriticalDamage ?? 0)) / 100000,
    },
    {
      key: "dps",
      label: isZh ? "持续输出" : "Sustained DPS",
      desc: isZh ? "ATK × ASPD" : "ATK × ASPD",
      calc: (h: Hero) => ((h.AttackDamage ?? 0) * (h.AttackSpeed ?? 0)) / 10,
    },
    {
      key: "speed",
      label: isZh ? "清图速度" : "Clear Speed",
      desc: isZh ? "Move SPD" : "Move SPD",
      calc: (h: Hero) => (h.MovementSpeed ?? 0) / 100,
    },
  ];

  // Calculate scores and rank
  const heroScores = heroes.map((hero) => {
    const scores: Record<string, number> = {};
    roles.forEach((role) => {
      scores[role.key] = role.calc(hero);
    });
    return { hero, scores };
  });

  // Find max for each role for relative comparison
  const maxScores: Record<string, number> = {};
  roles.forEach((role) => {
    maxScores[role.key] = Math.max(...heroScores.map((hs) => hs.scores[role.key]));
  });

  return (
    <div className="space-y-6">
      {/* Matrix */}
      <div className="overflow-x-auto border border-[#27272a]">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-[#18181b] text-xs text-[#6c6c6c]">
            <tr>
              <th className="px-3 py-2.5">{isZh ? "英雄" : "Hero"}</th>
              {roles.map((role) => (
                <th key={role.key} className="px-3 py-2.5">
                  {role.label}
                  <div className="text-[9px] font-normal text-[#555]">{role.desc}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heroScores.map(({ hero, scores }) => (
              <tr key={hero.HeroKey} className="border-t border-[#27272a] hover:bg-[#0d0d0d]">
                <td className="px-3 py-3 font-medium text-white">
                  {heroName(hero, locale)}
                  {hero.DLCAppId ? (
                    <span className="ml-1.5 rounded border border-amber-800/50 bg-amber-900/20 px-1 py-0.5 text-[9px] text-amber-500">
                      DLC
                    </span>
                  ) : null}
                </td>
                {roles.map((role) => {
                  const score = scores[role.key];
                  const pct = maxScores[role.key] > 0 ? (score / maxScores[role.key]) * 100 : 0;
                  const isBest = pct >= 95;
                  const isGood = pct >= 70;
                  return (
                    <td key={role.key} className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-[#18181b]">
                          <div
                            className={`h-full rounded-full ${isBest ? "bg-amber-400" : isGood ? "bg-amber-600" : "bg-zinc-600"}`}
                            style={{ width: `${Math.round(pct)}%` }}
                          />
                        </div>
                        <span className={`font-mono text-[11px] tabular-nums ${isBest ? "text-amber-400 font-semibold" : "text-[#6c6c6c]"}`}>
                          {role.key === "survivability" || role.key === "dps"
                            ? score.toFixed(1)
                            : score.toFixed(2)}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick verdict */}
      <div className="rounded-sm border border-amber-600/30 bg-amber-600/5 p-3 text-xs text-[#9d9d9d]">
        <span className="font-semibold text-amber-400">
          {isZh ? "📊 数据说明：" : "Data note: "}
        </span>
        {isZh
          ? "以上评分基于游戏文件 v1.00.09 的 Lv1 基础属性。实战表现受装备、技能等级和玩家操作影响。没有主观 Tier 排名，只有数据对比。"
          : "Scores based on game files v1.00.09 Lv1 base stats. Actual performance varies with gear, skills, and play. No subjective tier ranking — data comparison only."}
      </div>
    </div>
  );
}
