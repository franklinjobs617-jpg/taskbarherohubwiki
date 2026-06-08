import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";
import buffsJson from "@/../tbh_data/buffs.json";

type Props = { params: Promise<{ locale: Locale }> };

type RawBuff = {
  BuffKey: number;
  BuffType: string;
  STATTYPE: string;
  MODTYPE: string;
  Value: number;
  icon?: string;
};

const buffs = buffsJson as RawBuff[];

const STAT_LABELS: Record<string, Partial<Record<Locale, string>>> = {
  AttackSpeed: { zh: "攻击速度", en: "Attack Speed", ja: "攻撃速度" },
  MovementSpeed: { zh: "移动速度", en: "Movement Speed", ja: "移動速度" },
  FireDamageAddition: { zh: "火伤附加", en: "Fire Damage", ja: "火炎ダメージ" },
  LightningDamageAddition: { zh: "雷伤附加", en: "Lightning Damage", ja: "雷ダメージ" },
  PhysicalDamageAddition: { zh: "物理伤附加", en: "Physical Damage", ja: "物理ダメージ" },
  ColdDamageAddition: { zh: "冰伤附加", en: "Cold Damage", ja: "氷ダメージ" },
  ChaosDamageAddition: { zh: "混沌伤附加", en: "Chaos Damage", ja: "混沌ダメージ" },
  MaxHp: { zh: "最大生命", en: "Max HP", ja: "最大HP" },
  Armor: { zh: "护甲", en: "Armor", ja: "装甲" },
  AttackDamage: { zh: "攻击力", en: "Attack Damage", ja: "攻撃力" },
  CriticalChance: { zh: "暴击率", en: "Crit Chance", ja: "クリ率" },
  CriticalDamage: { zh: "暴击伤害", en: "Crit Damage", ja: "クリダメ" },
  CooldownReduction: { zh: "冷却缩减", en: "Cooldown", ja: "クールダウン" },
  FireResistance: { zh: "火抗", en: "Fire Resist", ja: "火耐性" },
  ColdResistance: { zh: "冰抗", en: "Cold Resist", ja: "氷耐性" },
  LightningResistance: { zh: "雷抗", en: "Lightning Resist", ja: "雷耐性" },
  ChaosResistance: { zh: "混沌抗", en: "Chaos Resist", ja: "混沌耐性" },
};

function statLabel(stat: string, locale: Locale): string {
  return STAT_LABELS[stat]?.[locale] ?? stat;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TBH Buff 与 Debuff 效果表" : "TBH Buffs & Debuffs",
    description: locale === "zh"
      ? `全部 ${buffs.length} 个 Buff 和 Debuff 效果：属性类型、加成方式和数值。`
      : `All ${buffs.length} buffs and debuffs: stat type, modifier, and values.`,
    alternates: pageAlternates(locale, "/buffs"),
  };
}

export default async function BuffsPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";

  const debuffs = buffs.filter((b) => b.BuffType === "Debuff");
  const positiveBuffs = buffs.filter((b) => b.BuffType === "Buff");

  return (
    <PageShell>
      <PageHeader
        kicker="Buffs & Debuffs"
        title={isZh ? "Buff 与 Debuff 效果" : "Buffs & Debuffs"}
        description={
          isZh
            ? `${buffs.length} 个效果：${debuffs.length} 个 Debuff + ${positiveBuffs.length} 个 Buff。包含属性类型、加成方式和数值。`
            : `${buffs.length} effects: ${debuffs.length} debuffs + ${positiveBuffs.length} buffs. Showing stat type, modifier, and value.`
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <BuffGroup
          title={isZh ? `Debuff (${debuffs.length})` : `Debuffs (${debuffs.length})`}
          items={debuffs}
          locale={locale}
          color="red"
        />
        <BuffGroup
          title={isZh ? `Buff (${positiveBuffs.length})` : `Buffs (${positiveBuffs.length})`}
          items={positiveBuffs}
          locale={locale}
          color="green"
        />
      </div>
    </PageShell>
  );
}

function BuffGroup({
  title,
  items,
  locale,
  color,
}: {
  title: string;
  items: RawBuff[];
  locale: Locale;
  color: "red" | "green";
}) {
  const isZh = locale === "zh";
  const colorClasses =
    color === "red"
      ? "border-red-800/30 bg-red-950/10"
      : "border-emerald-800/30 bg-emerald-950/10";

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-[#6c6c6c]">
        {title}
      </h2>
      <div className="space-y-1">
        {items.map((buff) => (
          <div
            key={buff.BuffKey}
            className={`flex items-center gap-3 rounded-sm border px-3 py-2 text-xs ${colorClasses}`}
          >
            <span className="w-12 shrink-0 font-mono text-[#6c6c6c]">
              #{buff.BuffKey}
            </span>
            <span className="flex-1 font-medium text-[#d8d1c2]">
              {statLabel(buff.STATTYPE, locale)}
            </span>
            <span className="w-28 shrink-0 font-mono text-[#6c6c6c]">
              {buff.MODTYPE === "MULTIPLICATIVE"
                ? isZh ? "乘算" : "Multiplicative"
                : isZh ? "加算" : "Flat"}
            </span>
            <span
              className={`w-16 shrink-0 text-right font-mono font-semibold ${
                color === "red" ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {buff.MODTYPE === "MULTIPLICATIVE"
                ? `${(buff.Value / 10).toFixed(0)}%`
                : buff.Value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
