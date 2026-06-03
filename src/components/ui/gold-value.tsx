import { Coins } from "lucide-react";

type Props = {
  value: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
};

export function GoldValue({ value, size = "sm", showIcon = true }: Props) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-display",
  };

  return (
    <span className={`inline-flex items-center gap-1 text-gold ${sizeClasses[size]}`}>
      {showIcon && <Coins className="w-3.5 h-3.5" />}
      ${value.toFixed(2)}
    </span>
  );
}
