import Link from "next/link";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import {
  DropRateTable,
  EntityCard,
  GuideCard,
  HeroCard,
  ItemCard,
  MarketPrice,
  PriceChart,
  StageCard,
  ChestCard,
} from "./cards";
import { ConfidenceBadge, RarityBadge, UpdatedBadge } from "./badges";
import { SeoJsonLd } from "./seo-json-ld";
import { effectRows, itemName, type Locale, type RawItem } from "@/lib/game-data/data";

export {
  ChestCard,
  ConfidenceBadge,
  DropRateTable,
  EntityCard,
  GuideCard,
  HeroCard,
  ItemCard,
  LocaleSwitcher as LanguageSwitcher,
  MarketPrice,
  PriceChart,
  RarityBadge,
  SeoJsonLd,
  StageCard,
  UpdatedBadge,
};

export function SearchCommand({ locale }: { locale: Locale }) {
  return (
    <form action={`/${locale}/items`} className="flex border border-border-strong bg-bg-panel p-2">
      <input
        name="q"
        className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
        placeholder={locale === "zh" ? "搜索物品、英雄、关卡、材料、攻略" : "Search items, heroes, stages, materials, guides"}
      />
      <button className="bg-[#d4a017] px-3 text-sm font-semibold text-black">{locale === "zh" ? "搜索" : "Search"}</button>
    </form>
  );
}

export function EffectTable({ locale }: { locale: Locale }) {
  const rows = effectRows(locale).slice(0, 80);
  return (
    <div className="overflow-x-auto border border-border-default">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-bg-surface text-xs text-text-muted">
          <tr><th className="px-3 py-2">Material</th><th className="px-3 py-2">Part</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Stat</th><th className="px-3 py-2">Value</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-border-default">
              <td className="px-3 py-2 text-text-primary">{row.material}</td>
              <td className="px-3 py-2 text-text-secondary">{row.part}</td>
              <td className="px-3 py-2 text-text-secondary">{row.effectType}</td>
              <td className="px-3 py-2 text-text-secondary">{row.stat}</td>
              <td className="px-3 py-2 text-accent-bright">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RelatedItems({ items, locale }: { items: RawItem[]; locale: Locale }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Link key={item.id} href={`/${locale}/items/${item.slug}`} className="border border-border-default bg-bg-panel p-3 hover:border-accent">
          <p className="truncate text-sm text-text-primary">{itemName(item, locale)}</p>
          <p className="mt-1 text-xs text-text-muted">{item.grade}</p>
        </Link>
      ))}
    </div>
  );
}
