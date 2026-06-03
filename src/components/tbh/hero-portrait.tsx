import Image from "next/image";

export function HeroPortrait({
  heroKey,
  fallbackText,
  size = "lg",
  variant = "full",
}: {
  heroKey?: number | null;
  fallbackText: string;
  size?: "sm" | "md" | "card" | "lg";
  variant?: "portrait" | "full";
}) {
  const abbreviation = fallbackText.slice(0, 2).toUpperCase();
  const imageSize = {
    sm: { width: 86, height: 80 },
    md: { width: 120, height: 150 },
    card: { width: 170, height: 210 },
    lg: { width: 240, height: 300 },
  }[size];
  const heroArtPath = heroKey
    ? variant === "portrait"
      ? `/game/heroes/art/HeroArt_${heroKey}.png`
      : `/game/heroes/anim/HeroAnim_${heroKey}.png`
    : null;

  return (
    <div className={frameClass(size)}>
      {heroArtPath ? (
        <Image
          src={heroArtPath}
          alt={fallbackText}
          width={imageSize.width}
          height={imageSize.height}
          className="max-h-full object-contain drop-shadow-[0_14px_20px_rgba(0,0,0,0.55)] transition duration-200 group-hover:scale-[1.04]"
          data-pixel
          unoptimized
        />
      ) : (
        <div className="text-center">
          <p className={letterClass(size)}>{abbreviation}</p>
        </div>
      )}
    </div>
  );
}

function frameClass(size: string) {
  const base =
    "flex items-end justify-center overflow-hidden border border-[#333] bg-[radial-gradient(circle_at_50%_82%,rgba(212,160,23,0.22),rgba(42,33,16,0.42)_34%,#080808_72%)]";
  const sizes: Record<string, string> = {
    sm: "h-16 w-16 shrink-0 p-1",
    md: "h-32 w-28 shrink-0 px-2 pt-2",
    card: "h-44 w-full px-3 pt-3",
    lg: "h-[320px] w-full px-5 pt-5",
  };
  return `${base} ${sizes[size] ?? sizes.lg}`;
}

function letterClass(size: string) {
  const sizes: Record<string, string> = {
    sm: "text-lg font-semibold text-[#f0c040]",
    md: "text-2xl font-semibold text-[#f0c040]",
    card: "text-4xl font-semibold text-[#f0c040]",
    lg: "text-5xl font-semibold text-[#f0c040]",
  };
  return sizes[size] ?? sizes.lg;
}
