import type { Grade } from "@/lib/game-data/types";

const rarityVars: Record<string, string> = {
  COMMON: "var(--color-rarity-common)",
  UNCOMMON: "var(--color-rarity-uncommon)",
  RARE: "var(--color-rarity-rare)",
  LEGENDARY: "var(--color-rarity-legendary)",
  IMMORTAL: "var(--color-rarity-immortal)",
  ARCANA: "var(--color-rarity-arcana)",
  BEYOND: "var(--color-rarity-beyond)",
  CELESTIAL: "var(--color-rarity-celestial)",
  DIVINE: "var(--color-rarity-divine)",
  COSMIC: "var(--color-rarity-cosmic)",
};

type Props = {
  grade: Grade;
  label?: string;
  size?: "sm" | "md";
};

export function RarityBadge({ grade, label, size = "sm" }: Props) {
  const sizeClasses = size === "sm" ? "text-caption px-1.5 py-0.5" : "text-caption-lg px-2 py-1";
  const color = rarityVars[grade] ?? "var(--color-rarity-common)";

  return (
    <span
      className={`inline-flex items-center ${sizeClasses} font-mono font-medium chip`}
      style={{ borderColor: color, color: color }}
    >
      {label ?? grade}
    </span>
  );
}
