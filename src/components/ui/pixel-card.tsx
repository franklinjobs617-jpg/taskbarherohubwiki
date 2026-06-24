import type { ReactNode } from "react";
import type { Grade } from "@/lib/game-data/types";

const rarityCardClass: Record<string, string> = {
  COMMON: "card-rarity-c",
  UNCOMMON: "card-rarity-u",
  RARE: "card-rarity-r",
  LEGENDARY: "card-rarity-l",
  IMMORTAL: "card-rarity-i",
  ARCANA: "card-rarity-a",
  BEYOND: "card-rarity-b",
  CELESTIAL: "card-rarity-ce",
  DIVINE: "card-rarity-d",
  COSMIC: "card-rarity-co",
};

type Props = {
  children: ReactNode;
  grade?: Grade;
  className?: string;
  hover?: boolean;
};

export function PixelCard({ children, grade, className = "", hover = true }: Props) {
  const rarityClass = grade ? rarityCardClass[grade] ?? "" : "";
  const hoverClass = hover ? "card-interactive" : "";

  return (
    <div className={`card ${rarityClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}
