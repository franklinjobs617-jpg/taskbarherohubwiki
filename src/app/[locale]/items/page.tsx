import type { Metadata } from "next";
import Link from "next/link";
import { ItemCard } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allItems, gradeNames, itemName, marketForItem, slotNames, type Locale } from "@/lib/game-data/data";
import { extItems } from "@/lib/game-data/external";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string; grade?: string; slot?: string; type?: string; market?: string; class?: string }>;
};

const HERO_CLASSES = ["Knight", "Ranger", "Sorcerer", "Priest", "Hunter", "Slayer"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TaskBar Hero 物品数据库｜装备、材料、掉落与市场价格" : "TaskBar Hero Item Database",
    description: locale === "zh"
      ? "按名称、稀有度、部位、职业和类型筛选全部装备、材料和宝箱。支持中英文搜索和市场价格筛选。"
      : "Filter all gear, materials, and chests by name, rarity, slot, class, and type. Supports bilingual search and market status.",
    alternates: { canonical: `/${locale}/items`, languages: { zh: "/zh/items", en: "/en/items", "x-default": "/zh/items" } },
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
  const classCounts = Object.fromEntries(
    HERO_CLASSES.map((cls) => [cls, extData.filter((ei) => ei.classes.includes(cls) && ei.type !== "STAGEBOX").length])
  );

  return (
    <PageShell>
      <PageHeader
        kicker="Items"
        title={isZh ? "物品数据库" : "Item Database"}
        description={isZh
          ? "按名称、稀有度、部位、职业和类型筛选全部装备、材料和宝箱。"
          : "Filter all gear, materials, and chests by name, rarity, slot, class, and type."}
      />

      {/* ── Filter form ── */}
      <form className="mb-5 grid gap-2 border border-[#252525] bg-[#101010] p-3 sm:grid-cols-[1fr_auto_auto_auto_auto_auto]">
        <input name="q" defaultValue={sp.q} placeholder={isZh ? "名称、英文名" : "Name"} className="border border-[#333] bg-[#080808] px-3 py-2 text-sm outline-none" />
        <select name="type" defaultValue={sp.type ?? ""} className="border border-[#333] bg-[#080808] px-3 py-2 text-sm">
          <option value="">{isZh ? "全部类型" : "All types"}</option>
          <option value="GEAR">{isZh ? "装备" : "Gear"}</option>
          <option value="MATERIAL">{isZh ? "材料" : "Material"}</option>
          <option value="STAGEBOX">{isZh ? "宝箱" : "Chest"}</option>
        </select>
        <select name="grade" defaultValue={sp.grade ?? ""} className="border border-[#333] bg-[#080808] px-3 py-2 text-sm">
          <option value="">{isZh ? "全部稀有度" : "All grades"}</option>
          {grades.map((grade) => <option key={grade} value={grade}>{gradeNames[grade][locale]}</option>)}
        </select>
        <select name="slot" defaultValue={sp.slot ?? ""} className="border border-[#333] bg-[#080808] px-3 py-2 text-sm">
          <option value="">{isZh ? "全部部位" : "All slots"}</option>
          {slots.map((slot) => <option key={slot} value={slot}>{slotNames[slot][locale]}</option>)}
        </select>
        <select name="class" defaultValue={sp.class ?? ""} className="border border-[#333] bg-[#080808] px-3 py-2 text-sm">
          <option value="">{isZh ? "全部职业" : "All classes"}</option>
          {HERO_CLASSES.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
        </select>
        <button className="bg-[#d4a017] px-4 py-2 text-sm font-semibold text-black">{isZh ? "筛选" : "Filter"}</button>
      </form>

      {/* ── Quick filters ── */}
      <div className="mb-4 space-y-2">
        {/* Class quick links */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-[#777] self-center mr-1">{isZh ? "职业：" : "Class:"}</span>
          {HERO_CLASSES.map((cls) => (
            <Link
              key={cls}
              href={`/${locale}/items?class=${cls}`}
              className={`border px-2 py-1 text-xs transition-colors ${
                sp.class === cls
                  ? "border-[#d4a017] bg-[#1a1508] text-[#f0c040]"
                  : "border-[#333] text-[#aaa] hover:border-[#d4a017]"
              }`}
            >
              {cls} <span className="text-[#666]">{classCounts[cls] ?? 0}</span>
            </Link>
          ))}
        </div>
        {/* Type + market quick links */}
        <div className="flex flex-wrap gap-1.5">
          <Link href={`/${locale}/items?market=1`} className={`border px-2 py-1 text-xs ${sp.market === "1" ? "border-[#d4a017] text-[#f0c040]" : "border-[#333] text-[#aaa] hover:border-[#d4a017]"}`}>
            {isZh ? "可交易" : "Marketable"}
          </Link>
          <Link href={`/${locale}/items?type=GEAR`} className={`border px-2 py-1 text-xs ${sp.type === "GEAR" ? "border-[#d4a017] text-[#f0c040]" : "border-[#333] text-[#aaa] hover:border-[#d4a017]"}`}>
            {isZh ? "装备" : "Gear"}
          </Link>
          <Link href={`/${locale}/items?type=MATERIAL`} className={`border px-2 py-1 text-xs ${sp.type === "MATERIAL" ? "border-[#d4a017] text-[#f0c040]" : "border-[#333] text-[#aaa] hover:border-[#d4a017]"}`}>
            {isZh ? "材料" : "Materials"}
          </Link>
          <Link href={`/${locale}/items?type=STAGEBOX`} className={`border px-2 py-1 text-xs ${sp.type === "STAGEBOX" ? "border-[#d4a017] text-[#f0c040]" : "border-[#333] text-[#aaa] hover:border-[#d4a017]"}`}>
            {isZh ? "宝箱" : "Chests"}
          </Link>
          {(sp.class || sp.type || sp.grade || sp.slot || sp.market) ? (
            <Link href={`/${locale}/items`} className="border border-[#5a3a1a] px-2 py-1 text-xs text-[#ff6b6b] hover:border-[#ff6b6b]">
              {isZh ? "清除筛选" : "Clear filters"}
            </Link>
          ) : null}
        </div>
      </div>

      <p className="mb-3 text-sm text-[#777]">
        {isZh ? `显示 ${rows.length} 条结果` : `Showing ${rows.length} results`}
        {sp.class ? (isZh ? ` · 职业: ${sp.class}` : ` · Class: ${sp.class}`) : ""}
      </p>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((item) => <ItemCard key={item.id} item={item} locale={locale} />)}
      </div>
    </PageShell>
  );
}
