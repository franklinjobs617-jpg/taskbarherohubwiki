import type { ReactNode } from "react";
import type { Grade } from "@/lib/game-data/types";

type Props = {
  children: ReactNode;
  grade?: Grade;
  className?: string;
  hover?: boolean;
};

export function PixelCard({ children, grade, className = "", hover = true }: Props) {
  const borderClass = grade ? `rarity-border-${grade.toLowerCase()}` : "";
  const hoverClass = hover ? "pixel-card" : "";

  return (
    <div
      className={`bg-bg-secondary border border-border-default rounded-card ${borderClass} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}
