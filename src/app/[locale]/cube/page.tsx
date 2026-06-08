import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";
import itemsJson from "@/../tbh_data/items.json";

type Props = { params: Promise<{ locale: Locale }> };

type RawItem = {
  id: number;
  slug: string;
  name: Record<string, string>;
  grade: string;
  type: string;
  gear: string | null;
  icon: string | null;
};

const items = itemsJson as RawItem[];

const MATERIAL_TYPES = [
  { key: "DECORATION", zh: "装饰 (Decoration)", en: "Decoration", ja: "装飾", desc_zh: "嵌入装备获得属性加成。不同部位有不同效果。", desc_en: "Socket into gear for stat bonuses. Different slots get different effects." },
  { key: "ENGRAVING", zh: "雕刻 (Engraving)", en: "Engraving", ja: "彫刻", desc_zh: "在装备上雕刻符文式效果。", desc_en: "Engrave rune-like effects onto gear." },
  { key: "CRAFTING", zh: "制作 (Crafting)", en: "Crafting", ja: "製作", desc_zh: "用于合成新装备的基础材料。铜块、银锭等。", desc_en: "Base materials used to craft new gear. Copper nuggets, silver ingots, etc." },
  { key: "INSCRIPTION", zh: "铭文 (Inscription)", en: "Inscription", ja: "碑文", desc_zh: "铭文卷轴，赋予装备特殊词缀。", desc_en: "Inscription scrolls that grant special affixes to gear." },
  { key: "OFFERING", zh: "献祭 (Offering)", en: "Offering", ja: "供物", desc_zh: "献祭材料，用于特殊合成或兑换。", desc_en: "Offering materials for special synthesis or exchange." },
  { key: "SOULSTONE", zh: "灵魂石 (Soulstone)", en: "Soulstone", ja: "ソウルストーン", desc_zh: "击败特定 Boss 获取，用于英雄强化。", desc_en: "Obtained from specific bosses, used for hero enhancement." },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TBH Hero-dric Cube 系统｜材料分类与合成指南" : "TBH Hero-dric Cube — Materials & Synthesis Guide",
    description: locale === "zh"
      ? "Hero-dric Cube 系统完整说明：6 种材料类型、合成配方、材料效果速查。Decoration、Engraving、Crafting、Inscription、Offering、Soulstone。"
      : "Complete Hero-dric Cube system guide: 6 material types, synthesis recipes, material effects reference.",
    alternates: pageAlternates(locale, "/cube"),
  };
}

export default async function CubePage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";

  const materialsByType: Record<string, RawItem[]> = {};
  for (const mt of MATERIAL_TYPES) {
    materialsByType[mt.key] = [];
  }

  for (const item of items) {
    if (item.type !== "MATERIAL") continue;
    // Determine type from ID range (game-specific logic)
    const id = item.id;
    if (id >= 110001 && id < 120000) materialsByType["DECORATION"]?.push(item);
    else if (id >= 120001 && id < 130000) materialsByType["ENGRAVING"]?.push(item);
    else if (id >= 140001 && id < 150000) materialsByType["CRAFTING"]?.push(item);
    else if (id >= 130001 && id < 140000) materialsByType["INSCRIPTION"]?.push(item);
    else if (id >= 160001 && id < 170000) materialsByType["OFFERING"]?.push(item);
    else if (id >= 150001 && id < 160000) materialsByType["SOULSTONE"]?.push(item);
  }

  return (
    <PageShell>
      <PageHeader
        kicker="Cube System"
        title={isZh ? "Hero-dric Cube 系统" : "Hero-dric Cube System"}
        description={
          isZh
            ? "Hero-dric Cube 是 TBH 的核心装备强化系统。使用不同类型的材料来装饰、雕刻、铭文和合成装备。以下按材料类型分类说明。"
            : "The Hero-dric Cube is TBH's core gear enhancement system. Use different material types to decorate, engrave, inscribe, and synthesize gear."
        }
      />

      <div className="space-y-8">
        {MATERIAL_TYPES.map((mt) => {
          const matItems = materialsByType[mt.key] ?? [];
          if (!matItems.length) return null;

          return (
            <section key={mt.key}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-base font-semibold text-white">
                  {mt[locale as keyof typeof mt] ?? mt.en}
                </h2>
                <span className="text-[11px] text-[#6c6c6c]">
                  {matItems.length} {isZh ? "种材料" : "materials"}
                </span>
              </div>
              <p className="mb-3 text-xs leading-6 text-[#9d9d9d]">
                {mt[`desc_${locale === "zh" ? "zh" : locale === "ja" ? "en" : "en"}` as keyof typeof mt] ?? mt.desc_en}
              </p>

              <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {matItems.slice(0, 12).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/${locale}/items/${item.slug}`}
                    className="flex items-center gap-2 rounded-sm border border-[#27272a] bg-[#0d0d0d] px-3 py-1.5 text-xs transition-colors hover:border-amber-600/30 group"
                  >
                    <span className="truncate text-[#9d9d9d] group-hover:text-white transition-colors">
                      {item.name?.[locale === "zh" ? "zh-Hans" : locale === "ja" ? "ja-JP" : "en-US"] ?? item.slug}
                    </span>
                    <span className="ml-auto shrink-0 text-[10px] text-[#555]">{item.grade}</span>
                  </Link>
                ))}
                {matItems.length > 12 && (
                  <div className="flex items-center justify-center rounded-sm border border-dashed border-[#27272a] px-3 py-1.5 text-[10px] text-[#555]">
                    +{matItems.length - 12} {isZh ? "更多" : "more"}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="mt-8 grid gap-2 border-t border-[#27272a] pt-6 sm:grid-cols-3">
        <Link
          href={`/${locale}/effects`}
          className="rounded-sm border border-[#27272a] bg-[#0d0d0d] p-3 text-xs transition-colors hover:border-amber-600/30"
        >
          <p className="font-medium text-white">{isZh ? "材料效果速查" : "Material Effects"}</p>
          <p className="mt-1 text-[#6c6c6c]">{isZh ? "查看每种材料的具体属性加成" : "Check specific stat bonuses per material"}</p>
        </Link>
        <Link
          href={`/${locale}/guides/cube/cube-materials`}
          className="rounded-sm border border-[#27272a] bg-[#0d0d0d] p-3 text-xs transition-colors hover:border-amber-600/30"
        >
          <p className="font-medium text-white">{isZh ? "Cube 材料指南" : "Cube Materials Guide"}</p>
          <p className="mt-1 text-[#6c6c6c]">{isZh ? "深度攻略：如何选择和保留材料" : "In-depth guide on material selection"}</p>
        </Link>
        <Link
          href={`/${locale}/tools/farming-calculator`}
          className="rounded-sm border border-[#27272a] bg-[#0d0d0d] p-3 text-xs transition-colors hover:border-amber-600/30"
        >
          <p className="font-medium text-white">{isZh ? "Farming 计算器" : "Farming Calculator"}</p>
          <p className="mt-1 text-[#6c6c6c]">{isZh ? "查找材料的最佳掉落关卡" : "Find best stages to farm materials"}</p>
        </Link>
      </div>
    </PageShell>
  );
}
