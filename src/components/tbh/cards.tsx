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
      className="group grid min-h-28 grid-rows-[auto_1fr_auto] border border-[#252525] bg-[#101010] p-3 transition hover:border-[#d4a017]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#2b2b2b] bg-[#080808]">
          {icon ? (
            <Image src={icon} alt={name} width={40} height={40} className="object-contain" data-pixel unoptimized />
          ) : (
            <span className="text-xs text-[#555]">IMG</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#ddd] group-hover:text-[#f0c040]">{name}</p>
          <p className="mt-1 text-xs text-[#777]">
            {item.gear ? slotNames[item.gear]?.[locale] ?? item.gear : item.type}
            {item.level ? ` / Lv.${item.level}` : ""}
          </p>
        </div>
      </div>
      <div />
      <div className="mt-3 flex items-center justify-between gap-2">
        <RarityBadge grade={item.grade} locale={locale} />
        <MarketPrice item={item} compact />
      </div>
    </Link>
  );
}

export function MarketPrice({ item, compact = false }: { item: RawItem; compact?: boolean }) {
  const market = marketForItem(item);
  if (!item.marketable) return <span className="text-[11px] text-[#555]">不可交易</span>;
  if (!market?.lowest) return <span className="text-[11px] text-[#777]">暂无市场数据</span>;
  return (
    <span className={compact ? "text-[12px] font-semibold text-[#f0c040]" : "text-lg font-semibold text-[#f0c040]"}>
      ${market.lowest.toFixed(2)}
    </span>
  );
}

export function PriceChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-20 items-end gap-1 border border-[#252525] bg-[#0b0b0b] p-2">
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
        <span className="text-xs text-[#777]">掉落表</span>
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
        <span className="border border-[#242424] p-1 text-[#aaa]">{stage.goldPerClear ?? "-"} 金币</span>
        <span className="border border-[#242424] p-1 text-[#aaa]">{stage.expPerClear ?? "-"} 经验</span>
        <span className="border border-[#242424] p-1 text-[#aaa]">{stage.kills ?? "-"} 击杀</span>
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
      className="group block overflow-hidden border border-[#2a2a2a] bg-[#101010] transition hover:-translate-y-0.5 hover:border-[#d4a017] hover:bg-[#13110b]"
    >
      <HeroPortrait heroKey={hero.HeroKey} fallbackText={name} size="card" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-[#f1e8d5] group-hover:text-[#f0c040]">{name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#777]">{hero.ClassType ?? slug}</p>
          </div>
          {hero.DLCAppId ? (
            <span className="shrink-0 border border-[#5a3a1a] bg-[#1b1206] px-2 py-1 text-[10px] font-semibold text-[#f0c040]">DLC</span>
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            {[mainIcon, subIcon].map((icon, index) => (
              <div key={`${slug}-${index}`} className="flex h-9 w-9 items-center justify-center border border-[#2b2b2b] bg-[#080808]">
                {icon ? <Image src={icon} alt="" width={30} height={30} className="object-contain" data-pixel unoptimized /> : <span className="text-[10px] text-[#555]">-</span>}
              </div>
            ))}
          </div>
          <p className="min-w-0 text-xs leading-5 text-[#aaa]">{heroWeaponLabel(hero, locale)}</p>
        </div>

        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-[#aaa]">{profile.playstyle}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <span className="border border-[#242424] bg-[#0b0b0b] px-2 py-1.5 text-[#ddd]">HP {hero.MaxHp ?? "-"}</span>
          <span className="border border-[#242424] bg-[#0b0b0b] px-2 py-1.5 text-[#ddd]">ATK {hero.AttackDamage ?? "-"}</span>
          <span className="border border-[#242424] bg-[#0b0b0b] px-2 py-1.5 text-[#ddd]">{isZh ? "难度" : "Diff"} {profile.difficulty}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#242424] pt-3">
          <p className="truncate text-xs text-[#888]">{profile.phase}</p>
          <span className="shrink-0 text-xs font-medium text-[#f0c040]">{isZh ? "查看详情" : "Open"}</span>
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

export function DropRateTable({ rows }: { rows: Array<{ name: string; rate: string; source: string }> }) {
  return (
    <div className="overflow-x-auto border border-[#252525]">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="bg-[#151515] text-xs text-[#777]">
          <tr>
            <th className="px-3 py-2">掉落物</th>
            <th className="px-3 py-2">掉率</th>
            <th className="px-3 py-2">来源</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.name}-${row.source}`} className="border-t border-[#252525]">
              <td className="px-3 py-2 text-[#ddd]">{row.name}</td>
              <td className="px-3 py-2 text-[#f0c040]">{row.rate}</td>
              <td className="px-3 py-2 text-[#888]">{row.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
