import { DATA_VERSION, UPDATED_AT, gradeNames, type Locale } from "@/lib/game-data/data";

const gradeClass: Record<string, string> = {
  COMMON: "border-rarity-common text-rarity-common-text",
  UNCOMMON: "border-rarity-uncommon text-rarity-uncommon-text",
  RARE: "border-rarity-rare text-rarity-rare-text",
  LEGENDARY: "border-rarity-legendary text-rarity-legendary-text",
  IMMORTAL: "border-rarity-immortal text-rarity-immortal-text",
  ARCANA: "border-rarity-arcana text-rarity-arcana-text",
  BEYOND: "border-rarity-beyond text-rarity-beyond-text",
  CELESTIAL: "border-rarity-celestial text-rarity-celestial-text",
  DIVINE: "border-rarity-divine text-rarity-divine-text",
  COSMIC: "border-rarity-cosmic text-rarity-cosmic-text",
};

export function RarityBadge({ grade, locale }: { grade: string; locale: Locale }) {
  return (
    <span className={`inline-flex border-2 px-2.5 py-0.5 text-caption-lg font-medium font-mono ${gradeClass[grade] ?? gradeClass.COMMON}`}>
      {gradeNames[grade]?.[locale] ?? grade}
    </span>
  );
}

const CF_LABELS: Record<string, Record<string, string>> = {
  zh: { high: "高置信度", medium: "中置信度", missing: "缺数据", low: "低置信度" },
  en: { high: "High", medium: "Medium", missing: "No data", low: "Low" },
  ja: { high: "高", medium: "中", missing: "データなし", low: "低" },
};

export function ConfidenceBadge({ value, locale }: { value?: string | null; locale?: string }) {
  const labels = CF_LABELS[locale ?? "en"] ?? CF_LABELS.en;
  const label = labels[value ?? "low"] ?? labels.low;
  const cls =
    value === "high"
      ? "border-success/50 text-success"
      : value === "medium"
        ? "border-accent/50 text-accent"
        : "border-danger/50 text-danger";
  return (
    <span className={`inline-flex border-2 px-2.5 py-0.5 text-caption-lg font-medium font-mono ${cls}`}>
      {label}
    </span>
  );
}

export function UpdatedBadge() {
  return (
    <span className="inline-flex border-2 border-border-default px-2.5 py-0.5 text-caption text-text-muted font-mono bg-bg-panel">
      {DATA_VERSION} / {UPDATED_AT}
    </span>
  );
}
