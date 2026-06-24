import { SafeImage } from "@/components/ui/safe-image";
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
import { localizedPath } from "@/lib/locale-path";
import { ConfidenceBadge, RarityBadge } from "./badges";
import { HeroPortrait } from "./hero-portrait";

function l(locale: string | undefined, values: Record<string, string>) {
  return values[locale ?? "en"] ?? values.en;
}

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
        {eyebrow ? <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted">{eyebrow}</p> : null}
        <h2 className="text-[18px] font-semibold leading-tight text-text-primary">{title}</h2>
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
    <Link href={href} className="card block transition hover:border-accent/60">
      <p className="text-[14px] font-medium text-text-primary">{title}</p>
      {meta ? <p className="mt-1 text-[12px] text-text-muted">{meta}</p> : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </Link>
  );
}

export function ItemCard({ item, locale }: { item: RawItem; locale: Locale }) {
  const name = itemName(item, locale);
  const icon = assetPath(item.icon);
  return (
    <Link
      href={localizedPath(locale, `/items/${item.slug}`)}
      className="group grid min-h-28 grid-rows-[auto_1fr_auto] border-2 border-border-default bg-bg-panel p-3 transition hover:border-accent"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-border-default bg-bg-canvas">
          {icon ? (
            <SafeImage src={icon} alt={name} width={40} height={40} className="object-contain" data-pixel unoptimized />
          ) : (
            <span className="text-xs text-text-muted">IMG</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary group-hover:text-accent-bright">{name}</p>
          <p className="mt-1 text-xs text-text-muted">
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

export function MarketPrice({ item, locale, compact = false }: { item: RawItem; locale?: string; compact?: boolean }) {
  const market = marketForItem(item);
  if (!item.marketable) {
    return <span className="text-[11px] text-text-muted">{l(locale, { zh: "不可交易", en: "Not tradable", ja: "取引不可", ko: "거래 불가" })}</span>;
  }
  if (!market?.lowest) {
    return <span className="text-[11px] text-text-muted">{l(locale, { zh: "暂无市场数据", en: "No market data", ja: "市場データなし", ko: "시장 데이터 없음" })}</span>;
  }
  return (
    <span className={compact ? "text-[12px] font-semibold text-accent-bright" : "text-lg font-semibold text-accent-bright"}>
      ${market.lowest.toFixed(2)}
    </span>
  );
}

export function PriceChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-20 items-end gap-1 border-2 border-border-default bg-bg-panel p-2">
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
    <EntityCard href={localizedPath(locale, `/chests/${chest.slug}`)} title={itemName(chest, locale)} meta={`${chest.grade} / ${chest.id}`}>
      <div className="flex items-center justify-between">
        <RarityBadge grade={chest.grade} locale={locale} />
        <span className="text-xs text-text-muted">{l(locale, { zh: "掉落表", en: "Drop table", ja: "ドロップ表", ko: "드롭표" })}</span>
      </div>
    </EntityCard>
  );
}

export function StageCard({ stage, locale }: { stage: Stage; locale: Locale }) {
  return (
    <EntityCard
      href={localizedPath(locale, `/stages/${stageSlug(stage)}`)}
      title={stageName(stage, locale)}
      meta={`${stage.difficulty} / Act ${stage.act}-${stage.no} / Lv.${stage.level}`}
    >
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <span className="border-2 border-border-default p-1 text-text-secondary">{stage.goldPerClear ?? "-"} {l(locale, { zh: "金币", en: "Gold", ja: "ゴールド", ko: "골드" })}</span>
        <span className="border-2 border-border-default p-1 text-text-secondary">{stage.expPerClear ?? "-"} EXP</span>
        <span className="border-2 border-border-default p-1 text-text-secondary">{stage.kills ?? "-"} {l(locale, { zh: "击杀", en: "Kills", ja: "討伐", ko: "처치" })}</span>
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

  return (
    <Link
      href={localizedPath(locale, `/heroes/${slug}`)}
      className="group block overflow-hidden border border-border-strong bg-bg-panel transition hover:-translate-y-0.5 hover:border-accent hover:bg-bg-panel"
    >
      <HeroPortrait heroKey={hero.HeroKey} fallbackText={name} size="card" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-text-primary group-hover:text-accent-bright">{name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-text-muted">{hero.ClassType ?? slug}</p>
          </div>
          {hero.DLCAppId ? (
            <span className="shrink-0 border border-accent-dim bg-accent-soft px-2 py-1 text-[10px] font-semibold text-accent-bright">DLC</span>
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            {[mainIcon, subIcon].map((icon, index) => (
              <div key={`${slug}-${index}`} className="flex h-9 w-9 items-center justify-center border-2 border-border-default bg-bg-canvas">
                {icon ? <SafeImage src={icon} alt="" width={30} height={30} className="object-contain" data-pixel unoptimized /> : <span className="text-[10px] text-text-muted">-</span>}
              </div>
            ))}
          </div>
          <p className="min-w-0 text-xs leading-5 text-text-secondary">{heroWeaponLabel(hero, locale)}</p>
        </div>

        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-text-secondary">{profile.playstyle}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <span className="border-2 border-border-default bg-bg-panel px-2 py-1.5 text-text-primary">HP {hero.MaxHp ?? "-"}</span>
          <span className="border-2 border-border-default bg-bg-panel px-2 py-1.5 text-text-primary">ATK {hero.AttackDamage ?? "-"}</span>
          <span className="border-2 border-border-default bg-bg-panel px-2 py-1.5 text-text-primary">{l(locale, { zh: "难度", en: "Diff", ja: "難度", ko: "난이도" })} {profile.difficulty}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border-default pt-3">
          <p className="truncate text-xs text-text-secondary">{profile.phase}</p>
          <span className="shrink-0 text-xs font-medium text-accent-bright">{l(locale, { zh: "查看详情", en: "Open", ja: "詳細", ko: "열기" })}</span>
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
    <div className="overflow-x-auto border-2 border-border-default">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="bg-bg-surface text-xs text-text-muted">
          <tr>
            <th className="px-3 py-2">{l(locale, { zh: "掉落物", en: "Drop", ja: "アイテム", ko: "아이템" })}</th>
            <th className="px-3 py-2">{l(locale, { zh: "掉率", en: "Rate", ja: "確率", ko: "확률" })}</th>
            <th className="px-3 py-2">{l(locale, { zh: "来源", en: "Source", ja: "入手元", ko: "출처" })}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.name}-${row.source}`} className="border-t border-border-default">
              <td className="px-3 py-2 text-text-primary">{row.name}</td>
              <td className="px-3 py-2 text-accent-bright">{row.rate}</td>
              <td className="px-3 py-2 text-text-secondary">{row.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
