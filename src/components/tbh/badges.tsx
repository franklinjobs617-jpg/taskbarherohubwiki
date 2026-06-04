import { DATA_VERSION, UPDATED_AT, gradeNames, type Locale } from "@/lib/game-data/data";

const gradeClass: Record<string, string> = {
  COMMON: "border-zinc-500/40 text-zinc-400",
  UNCOMMON: "border-green-600/40 text-green-400",
  RARE: "border-blue-600/40 text-blue-400",
  LEGENDARY: "border-purple-600/40 text-purple-400",
  IMMORTAL: "border-orange-600/40 text-orange-400",
  ARCANA: "border-amber-600/40 text-amber-400",
  BEYOND: "border-rose-600/40 text-rose-400",
  CELESTIAL: "border-cyan-600/40 text-cyan-400",
  DIVINE: "border-yellow-500/40 text-yellow-300",
  COSMIC: "border-fuchsia-600/40 text-fuchsia-400",
};

export function RarityBadge({ grade, locale }: { grade: string; locale: Locale }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${gradeClass[grade] ?? gradeClass.COMMON}`}>
      {gradeNames[grade]?.[locale] ?? grade}
    </span>
  );
}

export function ConfidenceBadge({ value }: { value?: string | null }) {
  const label =
    value === "high" ? "High" : value === "medium" ? "Medium" : value === "missing" ? "No data" : "Low";
  const cls =
    value === "high"
      ? "border-green-700/50 text-green-400"
      : value === "medium"
        ? "border-amber-700/50 text-amber-400"
        : "border-red-800/50 text-red-400";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

export function UpdatedBadge() {
  return (
    <span className="inline-flex rounded-full border border-[#27272a] px-2.5 py-0.5 text-[10px] text-[#6c6c6c] font-mono">
      {DATA_VERSION} / {UPDATED_AT}
    </span>
  );
}
