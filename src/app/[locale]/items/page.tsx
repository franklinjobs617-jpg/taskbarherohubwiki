import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ItemCard } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { allItems, assetPath, bestStageForItem, gradeNames, itemName, marketForItem, slotNames, type Locale } from "@/lib/game-data/data";
import { extItems } from "@/lib/game-data/external";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string; grade?: string; slot?: string; type?: string; market?: string; class?: string }>;
};

const HERO_CLASSES = ["Knight", "Ranger", "Sorcerer", "Priest", "Hunter", "Slayer"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "物品数据库 — 装备、材料、掉落与市场价格" : locale === "ja" ? "アイテムデータベース — 装備、材料、ドロップ" : "Item Database — Gear, Materials, Drops & Market Prices",
    description: locale === "zh"
      ? "按名称、稀有度、部位、职业和类型筛选全部装备、材料和宝箱。支持中英文搜索和市场价格筛选。"
      : "Filter all gear, materials, and chests by name, rarity, slot, class, and type. Supports bilingual search and market status.",
    alternates: { canonical: locale === "en" ? "/items" : `/${locale}/items`, languages: { zh: "/zh/items", en: "/items", ja: "/ja/items", ko: "/ko/items", "x-default": "/items" } },
  };
}

export default async function ItemsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const isZh = locale === "zh";
  const query = sp.q?.trim().toLowerCase();
  let rows = allItems();

  // Type filter
  if (sp.type) rows = rows.filter((item) => item.type === sp.type);
  // Grade filter
  if (sp.grade) rows = rows.filter((item) => item.grade === sp.grade);
  // Slot filter
  if (sp.slot) rows = rows.filter((item) => item.gear === sp.slot);
  // Market filter
  if (sp.market === "1") rows = rows.filter((item) => Boolean(marketForItem(item)));
  // Class filter — use external data for hero compatibility
  if (sp.class) {
    const extData = extItems();
    const classItemKeys = new Set(
      extData.filter((ei) => ei.classes.includes(sp.class!)).map((ei) => ei.key)
    );
    rows = rows.filter((item) => classItemKeys.has(item.id));
  }
  // Text search
  if (query) {
    rows = rows.filter((item) =>
      itemName(item, locale).toLowerCase().includes(query) ||
      itemName(item, "en").toLowerCase().includes(query) ||
      item.slug.includes(query)
    );
  }

  rows = rows.sort((a, b) => (b.level ?? 0) - (a.level ?? 0)).slice(0, 360);
  const grades = Object.keys(gradeNames);
  const slots = Object.keys(slotNames);

  // Count items per class for badge display
  const extData = extItems();
  const extById = new Map(extData.map((item) => [item.key, item]));
  const classCounts = Object.fromEntries(
    HERO_CLASSES.map((cls) => [cls, extData.filter((ei) => ei.classes.includes(cls) && ei.type !== "STAGEBOX").length])
  );

  return (
    <PageShell>
      <SeoJsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: isZh ? "物品数据库" : "Item Database",
        description: isZh
          ? "按名称、稀有度、部位、职业和类型筛选全部装备、材料和宝箱。"
          : "Filter all gear, materials, and chests by name, rarity, slot, class, and type.",
        numberOfItems: rows.length,
        itemListElement: rows.slice(0, 50).map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `https://taskbarhero.nanobananas.me${locale === "en" ? "" : "/" + locale}/items/${item.slug}`,
        })),
      }} />
      <PageHeader
        kicker="Items"
        title={isZh ? "物品数据库" : "Item Database"}
        description={isZh
          ? "按名称、稀有度、部位、职业和类型筛选全部装备、材料和宝箱。"
          : "Filter all gear, materials, and chests by name, rarity, slot, class, and type."}
      />

      {/* ── Filter form ── */}
      <form className="mb-5 grid gap-2 border border-[#27272a] bg-[#0d0d0d] p-3 sm:grid-cols-[1fr_auto_auto_auto_auto_auto]">
        <input name="q" defaultValue={sp.q} placeholder={isZh ? "名称、英文名" : "Name"} className="border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm outline-none" />
        <select name="type" defaultValue={sp.type ?? ""} className="border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm">
          <option value="">{isZh ? "全部类型" : "All types"}</option>
          <option value="GEAR">{isZh ? "装备" : "Gear"}</option>
          <option value="MATERIAL">{isZh ? "材料" : "Material"}</option>
          <option value="STAGEBOX">{isZh ? "宝箱" : "Chest"}</option>
        </select>
        <select name="grade" defaultValue={sp.grade ?? ""} className="border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm">
          <option value="">{isZh ? "全部稀有度" : "All grades"}</option>
          {grades.map((grade) => <option key={grade} value={grade}>{gradeNames[grade][locale]}</option>)}
        </select>
        <select name="slot" defaultValue={sp.slot ?? ""} className="border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm">
          <option value="">{isZh ? "全部部位" : "All slots"}</option>
          {slots.map((slot) => <option key={slot} value={slot}>{slotNames[slot][locale]}</option>)}
        </select>
        <select name="class" defaultValue={sp.class ?? ""} className="border border-[#3b3b3b] bg-[#0a0a0a] px-3 py-2 text-sm">
          <option value="">{isZh ? "全部职业" : "All classes"}</option>
          {HERO_CLASSES.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
        </select>
        <button className="bg-[#d4a017] px-4 py-2 text-sm font-semibold text-black">{isZh ? "筛选" : "Filter"}</button>
      </form>

      {/* ── Quick filters ── */}
      <div className="mb-4 space-y-2">
        {/* Class quick links */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-[#6c6c6c] self-center mr-1">{isZh ? "职业：" : "Class:"}</span>
          {HERO_CLASSES.map((cls) => (
            <Link
              key={cls}
              href={`/${locale}/items?class=${cls}`}
              className={`pill text-xs ${sp.class === cls ? "active" : ""}`}
            >
              {cls} <span className="text-[#6c6c6c]">{classCounts[cls] ?? 0}</span>
            </Link>
          ))}
        </div>
        {/* Type + market quick links */}
        <div className="flex flex-wrap gap-1.5">
          <Link href={`/${locale}/items?market=1`} className={`pill text-xs ${sp.market === "1" ? "active" : ""}`}>
            {isZh ? "可交易" : "Marketable"}
          </Link>
          <Link href={`/${locale}/items?type=GEAR`} className={`pill text-xs ${sp.type === "GEAR" ? "active" : ""}`}>
            {isZh ? "装备" : "Gear"}
          </Link>
          <Link href={`/${locale}/items?type=MATERIAL`} className={`pill text-xs ${sp.type === "MATERIAL" ? "active" : ""}`}>
            {isZh ? "材料" : "Materials"}
          </Link>
          <Link href={`/${locale}/items?type=STAGEBOX`} className={`pill text-xs ${sp.type === "STAGEBOX" ? "active" : ""}`}>
            {isZh ? "宝箱" : "Chests"}
          </Link>
          {(sp.class || sp.type || sp.grade || sp.slot || sp.market) ? (
            <Link href={`/${locale}/items`} className="pill text-xs text-[#9d9d9d] hover:text-[#ffffff]">
              {isZh ? "清除" : "Clear"}
            </Link>
          ) : null}
        </div>
      </div>

      <p className="mb-3 text-sm text-[#6c6c6c]">
        {isZh ? `显示 ${rows.length} 条结果` : `Showing ${rows.length} results`}
        {sp.class ? (isZh ? ` · 职业: ${sp.class}` : ` · Class: ${sp.class}`) : ""}
      </p>

      <div className="hidden overflow-x-auto border border-[#27272a] lg:block">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[#18181b] text-xs text-[#6c6c6c]">
            <tr>
              <th className="px-3 py-2">{isZh ? "物品" : "Item"}</th>
              <th className="px-3 py-2">{isZh ? "等级" : "Level"}</th>
              <th className="px-3 py-2">{isZh ? "类型" : "Type"}</th>
              <th className="px-3 py-2">{isZh ? "职业适配" : "Class fit"}</th>
              <th className="px-3 py-2">{isZh ? "掉落/获取" : "Drop / source"}</th>
              <th className="px-3 py-2">{isZh ? "市场" : "Market"}</th>
              <th className="px-3 py-2">{isZh ? "动作" : "Action"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const icon = assetPath(item.icon);
              const ext = extById.get(item.id);
              const market = marketForItem(item);
              const bestStage = bestStageForItem(item.slug);
              const classFit = ext?.classes?.slice(0, 3) ?? [];
              return (
                <tr key={item.id} className="border-t border-[#27272a] hover:bg-[#0d0d0d]">
                  <td className="px-3 py-2">
                    <Link href={`/${locale}/items/${item.slug}`} className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#27272a] bg-[#0a0a0a]">
                        {icon ? <Image src={icon} alt={itemName(item, locale)} width={32} height={32} className="object-contain" data-pixel unoptimized /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-white hover:text-[#f0c040]">{itemName(item, locale)}</span>
                        <span className="block text-[11px] text-[#6c6c6c]">{item.grade}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-mono text-[#9d9d9d]">{item.level ?? "-"}</td>
                  <td className="px-3 py-2 text-[#9d9d9d]">{item.gear ? slotNames[item.gear]?.[locale] ?? item.gear : item.type}</td>
                  <td className="px-3 py-2">
                    {classFit.length ? (
                      <div className="flex flex-wrap gap-1">
                        {classFit.map((cls) => <span key={cls} className="border border-[#27272a] px-2 py-0.5 text-[11px] text-[#d7d7d7]">{cls}</span>)}
                      </div>
                    ) : <span className="text-[#6c6c6c]">-</span>}
                  </td>
                  <td className="px-3 py-2">
                    {bestStage ? (
                      <Link href={`/${locale}/tools/drop-finder`} className="text-[#f0c040] hover:underline">
                        {bestStage.diff} {bestStage.act}-{bestStage.no} / {(bestStage.totalDropChance * 100).toFixed(2)}%
                      </Link>
                    ) : (
                      <span className="text-[#6c6c6c]">{ext?.obtainable ? (isZh ? "可获取" : "Obtainable") : (isZh ? "暂无掉落" : "No drop")}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {market?.lowest ? (
                      <div>
                        <p className="font-mono font-semibold text-[#f0c040]">${market.lowest.toFixed(2)}</p>
                        <p className="text-[11px] text-[#6c6c6c]">{market.listings?.toLocaleString() ?? "-"} listings</p>
                      </div>
                    ) : (
                      <span className="text-[#6c6c6c]">{item.marketable ? (isZh ? "待更新" : "Missing") : (isZh ? "不可交易" : "Not tradable")}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/${locale}/items/${item.slug}`} className="text-[#f0c040] hover:underline">{isZh ? "决策页" : "Decision"}</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:hidden">
        {rows.map((item) => <ItemCard key={item.id} item={item} locale={locale} />)}
      </div>
    </PageShell>
  );
}
