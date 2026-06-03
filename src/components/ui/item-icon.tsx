import Image from "next/image";
import { Package } from "lucide-react";

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
        className={`flex items-center justify-center bg-bg-tertiary rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <Package className="w-5 h-5 text-text-muted" />
      </div>
    );
  }

  return (
    <div
      className={`relative bg-bg-tertiary rounded overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-contain"
        data-pixel="true"
        unoptimized
      />
    </div>
  );
}
