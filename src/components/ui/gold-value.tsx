import { Coins } from "lucide-react";

type Props = {
  value: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
};

export function GoldValue({ value, size = "sm", showIcon = true }: Props) {
  const sizeClasses = {
    sm: "text-body-sm",
    md: "text-body-lg",
    lg: "text-subheading font-pixel",
  };

  return (
    <span className={`inline-flex items-center gap-1 text-accent ${sizeClasses[size]}`}>
      {showIcon && <Coins className="w-3.5 h-3.5" />}
      <span className="font-mono tabular-nums">${value.toFixed(2)}</span>
    </span>
  );
}
