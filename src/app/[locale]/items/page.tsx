import type { Metadata } from "next";
import Link from "next/link";
import { ItemCard } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allItems, gradeNames, itemName, marketForItem, slotNames, type Locale } from "@/lib/game-data/data";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string; grade?: string; slot?: string; type?: string; market?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TaskBar Hero 物品数据库｜装备、材料、掉落与市场价格" : "TaskBar Hero Item Database",
    description: locale === "zh" ? "服务端渲染的 TaskBar Hero 物品列表，支持名称、稀有度、部位、类型和市场价格筛选。" : "Server-rendered TaskBar Hero item database with filters.",
    alternates: { canonical: `/${locale}/items`, languages: { zh: "/zh/items", en: "/en/items", "x-default": "/zh/items" } },
  };
}

export default async function ItemsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const isZh = locale === "zh";
  const query = sp.q?.trim().toLowerCase();
  let rows = allItems();
  if (sp.type) rows = rows.filter((item) => item.type === sp.type);
  if (sp.grade) rows = rows.filter((item) => item.grade === sp.grade);
  if (sp.slot) rows = rows.filter((item) => item.gear === sp.slot);
  if (sp.market === "1") rows = rows.filter((item) => Boolean(marketForItem(item)));
  if (query) rows = rows.filter((item) => itemName(item, locale).toLowerCase().includes(query) || itemName(item, "en").toLowerCase().includes(query) || item.slug.includes(query));
  rows = rows.sort((a, b) => (b.level ?? 0) - (a.level ?? 0)).slice(0, 360);
  const grades = Object.keys(gradeNames);
  const slots = Object.keys(slotNames);

  return (
    <PageShell>
      <PageHeader
        kicker="Items"
        title={isZh ? "物品数据库" : "Item Database"}
        description={isZh ? "按名称、稀有度、部位和类型筛选全部装备、材料和宝箱。支持中英文搜索和市场价格筛选。" : "Filter all gear, materials, and chests by name, rarity, slot, and type. Supports bilingual search and market status filtering."}
      />
      <form className="mb-5 grid gap-2 border border-[#252525] bg-[#101010] p-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <input name="q" defaultValue={sp.q} placeholder={isZh ? "名称、英文名、slug" : "Name, English name, slug"} className="border border-[#333] bg-[#080808] px-3 py-2 text-sm outline-none" />
        <select name="type" defaultValue={sp.type ?? ""} className="border border-[#333] bg-[#080808] px-3 py-2 text-sm">
          <option value="">{isZh ? "全部类型" : "All types"}</option>
          <option value="GEAR">{isZh ? "装备" : "Gear"}</option>
          <option value="MATERIAL">{isZh ? "材料" : "Material"}</option>
          <option value="STAGEBOX">{isZh ? "宝箱" : "Chest"}</option>
        </select>
        <select name="grade" defaultValue={sp.grade ?? ""} className="border border-[#333] bg-[#080808] px-3 py-2 text-sm">
          <option value="">{isZh ? "全部稀有度" : "All rarities"}</option>
          {grades.map((grade) => <option key={grade} value={grade}>{gradeNames[grade][locale]}</option>)}
        </select>
        <select name="slot" defaultValue={sp.slot ?? ""} className="border border-[#333] bg-[#080808] px-3 py-2 text-sm">
          <option value="">{isZh ? "全部部位" : "All slots"}</option>
          {slots.map((slot) => <option key={slot} value={slot}>{slotNames[slot][locale]}</option>)}
        </select>
        <button className="bg-[#d4a017] px-4 py-2 text-sm font-semibold text-black">{isZh ? "筛选" : "Filter"}</button>
      </form>
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <Link href={`/${locale}/items?market=1`} className="border border-[#333] px-3 py-1 text-[#aaa] hover:border-[#d4a017]">{isZh ? "只看有市场价" : "With market price"}</Link>
        <Link href={`/${locale}/items?type=GEAR`} className="border border-[#333] px-3 py-1 text-[#aaa] hover:border-[#d4a017]">{isZh ? "装备" : "Gear"}</Link>
        <Link href={`/${locale}/items?type=MATERIAL`} className="border border-[#333] px-3 py-1 text-[#aaa] hover:border-[#d4a017]">{isZh ? "材料" : "Materials"}</Link>
        <Link href={`/${locale}/items?type=STAGEBOX`} className="border border-[#333] px-3 py-1 text-[#aaa] hover:border-[#d4a017]">{isZh ? "宝箱" : "Chests"}</Link>
      </div>
      <p className="mb-3 text-sm text-[#777]">{isZh ? `当前显示 ${rows.length} 条结果` : `Showing ${rows.length} results`}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((item) => <ItemCard key={item.id} item={item} locale={locale} />)}
      </div>
    </PageShell>
  );
}
