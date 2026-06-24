import { Package } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";

type Props = {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
};

export function ItemIcon({ src, alt, size = 48, className = "" }: Props) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-bg-surface border-2 border-border-default ${className}`}
        style={{ width: size, height: size }}
      >
        <Package className="w-5 h-5 text-text-muted" />
      </div>
    );
  }

  return (
    <div
      className={`relative bg-bg-surface border-2 border-border-default overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <SafeImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-contain pixel-img"
        data-pixel="true"
        unoptimized
      />
    </div>
  );
}
