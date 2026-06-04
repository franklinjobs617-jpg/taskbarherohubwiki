import Image from "next/image";
import Link from "next/link";
import {
  assetPath,
  gearPreviewItem,
  heroName,
  heroSlug,
  itemName,
  marketForItem,
  stageName,
  stageSlug,
  slotNames,
  type Hero,
  type Locale,
  type RawItem,
  type Stage,
} from "@/lib/game-data/data";
import { heroProfile, heroWeaponLabel } from "@/lib/hero-content";
import { ConfidenceBadge, RarityBadge } from "./badges";
import { HeroPortrait } from "./hero-portrait";

export function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 space-y-3 first:mt-0">
      <div>
        {eyebrow ? <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6c6c6c]">{eyebrow}</p> : null}
        <h2 className="text-[18px] font-semibold leading-tight text-[#ffffff]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function EntityCard({
  href,
  title,
  meta,
  children,
}: {
  href: string;
  title: string;
  meta?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link href={href} className="card block transition hover:border-[#d4a017]/60">
      <p className="text-[14px] font-medium text-[#ffffff]">{title}</p>
      {meta ? <p className="mt-1 text-[12px] text-[#6c6c6c]">{meta}</p> : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </Link>
  );
}

export function ItemCard({ item, locale }: { item: RawItem; locale: Locale }) {
  const name = itemName(item, locale);
  const icon = assetPath(item.icon);
  return (
    <Link
      href={`/${locale}/items/${item.slug}`}
      className="group grid min-h-28 grid-rows-[auto_1fr_auto] border border-[#27272a] bg-[#0d0d0d] p-3 transition hover:border-[#d4a017]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#27272a] bg-[#0a0a0a]">
          {icon ? (
            <Image src={icon} alt={name} width={40} height={40} className="object-contain" data-pixel unoptimized />
          ) : (
            <span className="text-xs text-[#6c6c6c]">IMG</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#ffffff] group-hover:text-[#f0c040]">{name}</p>
          <p className="mt-1 text-xs text-[#6c6c6c]">
            {item.gear ? slotNames[item.gear]?.[locale] ?? item.gear : item.type}
            {item.level ? ` / Lv.${item.level}` : ""}
          </p>
        </div>
      </div>
      <div />
      <div className="mt-3 flex items-center justify-between gap-2">
        <RarityBadge grade={item.grade} locale={locale} />
        <MarketPrice item={item} locale={locale} compact />
      </div>
    </Link>
  );
}

const ML: Record<string,{no:String;na:String}> = {zh:{no:"不可交易",na:"暂无市场数据"},en:{no:"Not tradable",na:"No market data"},ja:{no:"取引不可",na:"データなし"}};
export function MarketPrice({ item, locale, compact = false }: { item: RawItem; locale?: string; compact?: boolean }) {
  const ml = ML[locale ?? "en"] ?? ML.en;
  const market = marketForItem(item);
  if (!item.marketable) return <span className="text-[11px] text-[#6c6c6c]">{ml.no}</span>;
  if (!market?.lowest) return <span className="text-[11px] text-[#6c6c6c]">{ml.na}</span>;
  return (
    <span className={compact ? "text-[12px] font-semibold text-[#f0c040]" : "text-lg font-semibold text-[#f0c040]"}>
      ${market.lowest.toFixed(2)}
    </span>
  );
}

export function PriceChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-20 items-end gap-1 border border-[#27272a] bg-[#0d0d0d] p-2">
      {values.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className="flex-1 bg-[#d4a017]"
          style={{ height: `${Math.max(8, (value / max) * 100)}%`, opacity: 0.45 + index / values.length / 2 }}
        />
      ))}
    </div>
  );
}

export function ChestCard({ chest, locale }: { chest: RawItem; locale: Locale }) {
  return (
    <EntityCard href={`/${locale}/chests/${chest.slug}`} title={itemName(chest, locale)} meta={`${chest.grade} / ${chest.id}`}>
      <div className="flex items-center justify-between">
        <RarityBadge grade={chest.grade} locale={locale} />
        <span className="text-xs text-[#6c6c6c]">{locale === "zh" ? "掉落表" : locale === "ja" ? "ドロップ表" : "Drop table"}</span>
      </div>
    </EntityCard>
  );
}

export function StageCard({ stage, locale }: { stage: Stage; locale: Locale }) {
  return (
    <EntityCard
      href={`/${locale}/stages/${stageSlug(stage)}`}
      title={stageName(stage, locale)}
      meta={`${stage.difficulty} / Act ${stage.act}-${stage.no} / Lv.${stage.level}`}
    >
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <span className="border border-[#27272a] p-1 text-[#9d9d9d]">{stage.goldPerClear ?? "-"} {locale === "zh" ? "金币" : locale === "ja" ? "ゴールド" : "Gold"}</span>
        <span className="border border-[#27272a] p-1 text-[#9d9d9d]">{stage.expPerClear ?? "-"} {locale === "zh" ? "EXP" : locale === "ja" ? "経験値" : "EXP"}</span>
        <span className="border border-[#27272a] p-1 text-[#9d9d9d]">{stage.kills ?? "-"} {locale === "zh" ? "击杀" : locale === "ja" ? "討伐" : "Kills"}</span>
      </div>
    </EntityCard>
  );
}

export function HeroCard({ hero, locale }: { hero: Hero; locale: Locale }) {
  const slug = heroSlug(hero);
  const profile = heroProfile(hero, locale);
  const mainIcon = assetPath(gearPreviewItem(hero.MainWeaponGearType)?.icon);
  const subIcon = assetPath(gearPreviewItem(hero.SubWeaponGearType)?.icon);
  const name = heroName(hero, locale);
  const isZh = locale === "zh";

  return (
    <Link
      href={`/${locale}/heroes/${slug}`}
      className="group block overflow-hidden border border-[#2a2a2a] bg-[#0d0d0d] transition hover:-translate-y-0.5 hover:border-[#d4a017] hover:bg-[#13110b]"
    >
      <HeroPortrait heroKey={hero.HeroKey} fallbackText={name} size="card" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-[#f1e8d5] group-hover:text-[#f0c040]">{name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6c6c6c]">{hero.ClassType ?? slug}</p>
          </div>
          {hero.DLCAppId ? (
            <span className="shrink-0 border border-[#5a3a1a] bg-[#1b1206] px-2 py-1 text-[10px] font-semibold text-[#f0c040]">DLC</span>
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            {[mainIcon, subIcon].map((icon, index) => (
              <div key={`${slug}-${index}`} className="flex h-9 w-9 items-center justify-center border border-[#27272a] bg-[#0a0a0a]">
                {icon ? <Image src={icon} alt="" width={30} height={30} className="object-contain" data-pixel unoptimized /> : <span className="text-[10px] text-[#6c6c6c]">-</span>}
              </div>
            ))}
          </div>
          <p className="min-w-0 text-xs leading-5 text-[#9d9d9d]">{heroWeaponLabel(hero, locale)}</p>
        </div>

        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-[#9d9d9d]">{profile.playstyle}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <span className="border border-[#27272a] bg-[#0d0d0d] px-2 py-1.5 text-[#ffffff]">HP {hero.MaxHp ?? "-"}</span>
          <span className="border border-[#27272a] bg-[#0d0d0d] px-2 py-1.5 text-[#ffffff]">ATK {hero.AttackDamage ?? "-"}</span>
          <span className="border border-[#27272a] bg-[#0d0d0d] px-2 py-1.5 text-[#ffffff]">{locale === "zh" ? "难度" : locale === "ja" ? "難易度" : "Diff"} {profile.difficulty}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#27272a] pt-3">
          <p className="truncate text-xs text-[#9d9d9d]">{profile.phase}</p>
          <span className="shrink-0 text-xs font-medium text-[#f0c040]">{locale === "zh" ? "查看详情" : locale === "ja" ? "詳細" : "Open"}</span>
        </div>
      </div>
    </Link>
  );
}

export function GuideCard({
  href,
  title,
  description,
  evidence,
}: {
  href: string;
  title: string;
  description: string;
  evidence: string;
}) {
  return (
    <EntityCard href={href} title={title} meta={description}>
      <ConfidenceBadge value={evidence === "datamined" ? "high" : evidence === "editorial" ? "medium" : "low"} />
    </EntityCard>
  );
}

export function DropRateTable({ rows, locale }: { rows: Array<{ name: string; rate: string; source: string }>; locale?: string }) {
  return (
    <div className="overflow-x-auto border border-[#27272a]">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="bg-[#18181b] text-xs text-[#6c6c6c]">
          <tr>
            <th className="px-3 py-2">{locale === "zh" ? "掉落物" : locale === "ja" ? "アイテム" : "Drop"}</th>
            <th className="px-3 py-2">{locale === "zh" ? "掉率" : locale === "ja" ? "確率" : "Rate"}</th>
            <th className="px-3 py-2">{locale === "zh" ? "来源" : locale === "ja" ? "ソース" : "Source"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.name}-${row.source}`} className="border-t border-[#27272a]">
              <td className="px-3 py-2 text-[#ffffff]">{row.name}</td>
              <td className="px-3 py-2 text-[#f0c040]">{row.rate}</td>
              <td className="px-3 py-2 text-[#9d9d9d]">{row.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
