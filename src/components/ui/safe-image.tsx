"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  /** For pixel art rendering */
  "data-pixel"?: string | boolean;
  /** Always true — we serve from public/ */
  unoptimized?: boolean;
  /** Next.js priority loading */
  priority?: boolean;
  /** Custom fallback element */
  fallback?: React.ReactNode;
  /** Inline styles */
  style?: React.CSSProperties;
};

export function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  fallback,
  style,
  ...rest
}: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    if (fallback) return <>{fallback}</>;
    return (
      <div
        className={`flex items-center justify-center bg-bg-panel border border-border-default ${className ?? ""}`}
        style={{ width, height, ...style }}
      >
        <ImageOff className="h-4 w-4 text-text-muted" />
      </div>
    );
  }

  // Use native <img> to avoid Next.js Image optimizer issues.
  // All images are local (public/) and served directly.
  const isPixel = rest["data-pixel"] || rest["data-pixel"] === "";

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{
        imageRendering: isPixel ? "pixelated" : undefined,
        ...style,
      }}
      onError={() => setErrored(true)}
      loading={rest.priority ? "eager" : "lazy"}
    />
  );
}
