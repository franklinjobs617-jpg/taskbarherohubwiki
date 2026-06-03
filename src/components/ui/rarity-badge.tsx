import type { Grade } from "@/lib/game-data/types";

type Props = {
  grade: Grade;
  label?: string;
  size?: "sm" | "md";
};

export function RarityBadge({ grade, label, size = "sm" }: Props) {
  const sizeClasses = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";
  const borderClass = `rarity-border-${grade.toLowerCase()}`;

  return (
    <span
      className={`inline-flex items-center ${sizeClasses} rounded font-medium ${borderClass} bg-bg-tertiary`}
      style={{ color: `var(--color-rarity-${grade.toLowerCase()})` }}
    >
      {label ?? grade}
    </span>
  );
}
