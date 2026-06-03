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
    <form action={`/${locale}/items`} className="flex border border-[#333] bg-[#101010] p-2">
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
    <div className="overflow-x-auto border border-[#252525]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-[#151515] text-xs text-[#777]">
          <tr><th className="px-3 py-2">Material</th><th className="px-3 py-2">Part</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Stat</th><th className="px-3 py-2">Value</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-[#252525]">
              <td className="px-3 py-2 text-[#ddd]">{row.material}</td>
              <td className="px-3 py-2 text-[#aaa]">{row.part}</td>
              <td className="px-3 py-2 text-[#aaa]">{row.effectType}</td>
              <td className="px-3 py-2 text-[#aaa]">{row.stat}</td>
              <td className="px-3 py-2 text-[#f0c040]">{row.value}</td>
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
        <Link key={item.id} href={`/${locale}/items/${item.slug}`} className="border border-[#252525] bg-[#101010] p-3 hover:border-[#d4a017]">
          <p className="truncate text-sm text-[#ddd]">{itemName(item, locale)}</p>
          <p className="mt-1 text-xs text-[#777]">{item.grade}</p>
        </Link>
      ))}
    </div>
  );
}
