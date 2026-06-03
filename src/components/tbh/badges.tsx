import { DATA_VERSION, UPDATED_AT, gradeNames, type Locale } from "@/lib/game-data/data";

const gradeClass: Record<string, string> = {
  COMMON: "border-zinc-500 text-zinc-300",
  UNCOMMON: "border-green-600 text-green-400",
  RARE: "border-blue-600 text-blue-400",
  LEGENDARY: "border-purple-600 text-purple-400",
  IMMORTAL: "border-orange-600 text-orange-400",
  ARCANA: "border-amber-600 text-amber-400",
  BEYOND: "border-rose-600 text-rose-400",
  CELESTIAL: "border-cyan-600 text-cyan-400",
  DIVINE: "border-yellow-500 text-yellow-300",
  COSMIC: "border-fuchsia-600 text-fuchsia-400",
};

export function RarityBadge({ grade, locale }: { grade: string; locale: Locale }) {
  return (
    <span className={`inline-flex border px-2 py-0.5 text-[11px] ${gradeClass[grade] ?? gradeClass.COMMON}`}>
      {gradeNames[grade]?.[locale] ?? grade}
    </span>
  );
}

export function ConfidenceBadge({ value }: { value?: string | null }) {
  const label =
    value === "high" ? "高置信度" : value === "medium" ? "中置信度" : value === "missing" ? "缺数据" : "低置信度";
  const cls =
    value === "high"
      ? "border-green-700 text-green-400"
      : value === "medium"
        ? "border-amber-700 text-amber-400"
        : "border-red-800 text-red-400";
  return <span className={`inline-flex border px-2 py-0.5 text-[11px] ${cls}`}>{label}</span>;
}

export function UpdatedBadge() {
  return (
    <span className="inline-flex border border-[#333] bg-[#101010] px-2 py-0.5 text-[11px] text-[#777]">
      {DATA_VERSION} / {UPDATED_AT}
    </span>
  );
}
