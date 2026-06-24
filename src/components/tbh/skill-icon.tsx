import { SafeImage } from "@/components/ui/safe-image";

export function SkillIcon({
  skillKey,
  src,
  damageType,
  size = 40,
  className = "",
}: {
  skillKey?: number | string | null;
  src?: string | null;
  damageType?: string | null;
  size?: number;
  className?: string;
}) {
  const resolvedSrc = src ?? (skillKey ? `/game/skills/Skill_${String(skillKey).trim()}.png` : null);
  const fallback = <SkillBadge damageType={damageType} size={size} className={className} />;

  if (resolvedSrc) {
    return (
      <div
        className={`relative overflow-hidden border-2 border-border-default bg-bg-surface ${className}`}
        style={{ width: size, height: size }}
        title={damageType ?? "Skill"}
      >
        <SafeImage
          src={resolvedSrc}
          alt={`Skill ${skillKey ?? ""}`.trim()}
          width={size}
          height={size}
          className="h-full w-full object-contain pixel-img"
          data-pixel="true"
          unoptimized
          fallback={fallback}
        />
      </div>
    );
  }

  return fallback;
}

function SkillBadge({
  damageType,
  size,
  className,
}: {
  damageType?: string | null;
  size: number;
  className: string;
}) {
  const { bg, text, label } = styleForDamageType(damageType);

  return (
    <div
      className={`flex items-center justify-center border-2 font-semibold ${bg} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.3 }}
      title={damageType ?? "Unknown"}
    >
      <span className={text}>{label}</span>
    </div>
  );
}

function styleForDamageType(damageType?: string | null) {
  switch (damageType?.toUpperCase()) {
    case "PHYSICAL":
      return { bg: "bg-red-950/60 border-red-700/40", text: "text-red-300", label: "PHY" };
    case "MAGICAL":
      return { bg: "bg-blue-950/60 border-blue-700/40", text: "text-blue-300", label: "MAG" };
    case "FIRE":
      return { bg: "bg-orange-950/60 border-orange-700/40", text: "text-orange-300", label: "FIR" };
    case "ICE":
      return { bg: "bg-cyan-950/60 border-cyan-700/40", text: "text-cyan-300", label: "ICE" };
    case "LIGHTNING":
      return { bg: "bg-yellow-950/60 border-yellow-700/40", text: "text-yellow-300", label: "LIT" };
    case "POISON":
      return { bg: "bg-green-950/60 border-green-700/40", text: "text-green-300", label: "PSN" };
    case "HOLY":
      return { bg: "bg-amber-950/60 border-amber-700/40", text: "text-amber-300", label: "HLY" };
    case "DARK":
      return { bg: "bg-purple-950/60 border-purple-700/40", text: "text-purple-300", label: "DRK" };
    default:
      return { bg: "bg-zinc-900/60 border-zinc-700/40", text: "text-zinc-400", label: "SKL" };
  }
}
