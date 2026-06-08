import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfidenceBadge, RarityBadge } from "@/components/tbh/badges";
import { ItemCard, MarketPrice, Section } from "@/components/tbh/cards";
import { DropHeatmap } from "@/components/tbh/drop-heatmap";
import { DropSourceDetails, ItemQuickAnswer } from "@/components/tbh/item-drop-details";
import { PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { allItems, assetPath, bestFarmingStages, bestStageForItem, dropsForItem, hasDropData, itemBySlug, itemDetail, itemName, marketForItem, slotNames, text, type Locale } from "@/lib/game-data/data";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = itemBySlug(slug);
  if (!item) return { title: "Not found" };
  const name = itemName(item, locale);
  const market = marketForItem(item);
  const hasDrops = hasDropData(slug);

  const titleByLocale: Record<string, string> = {
    zh: `${name}｜掉落位置、属性与市场状态 — TBH Wiki`,
    en: `${name} — Drop Locations, Stats & Market Price | TBH Wiki`,
    ja: `${name}｜ドロップ場所、ステータスと市場価格 — TBH Wiki`,
  };

  const descByLocale: Record<string, string> = {
    zh: hasDrops
      ? `${name} 的完整信息：掉落位置（${dropsForItem(slug).length} 个宝箱来源）、属性、合成类型和 Steam 市场状态。数据来源：游戏文件解包。`
      : `${name} 的稀有度、类型、属性和 Steam 市场状态。掉落数据正在收集和验证中。`,
    en: hasDrops
      ? `${name}: drop locations (${dropsForItem(slug).length} chest sources), stats, synthesis type, and Steam Market status. Data mined from game files.`
      : `${name} rarity, type, stats, and Steam Market status. Drop data being collected.`,
    ja: hasDrops
      ? `${name} の詳細：ドロップ場所（${dropsForItem(slug).length} 個の宝箱ソース）、ステータス、合成タイプ、Steam マーケット状態。ゲームファイルからデータ抽出。`
      : `${name} のレア度、タイプ、ステータス、Steam マーケット状態。ドロップデータ収集中。`,
  };

  return {
    title: titleByLocale[locale] ?? titleByLocale.en,
    description: descByLocale[locale] ?? descByLocale.en,
    alternates: { canonical: `/${locale}/items/${slug}`, languages: { zh: `/zh/items/${slug}`, en: `/en/items/${slug}`, ja: `/ja/items/${slug}`, "x-default": `/en/items/${slug}` } },
  };
}

export default async function ItemDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const item = itemBySlug(slug);
  if (!item) notFound();
  const detail = itemDetail(item.id);
  const market = marketForItem(item);
  const name = itemName(item, locale);
  const enName = itemName(item, "en");
  const isZh = locale === "zh";
  const icon = assetPath(item.icon);
  const description = text(detail?.desc, locale, isZh ? "该物品已有基础数据；详细来源取决于掉率数据是否完整。" : "Base data is available; detailed source depends on drop data completeness.");
  const related = allItems().filter((entry) => entry.id !== item.id && (entry.grade === item.grade || entry.gear === item.gear) && entry.type === item.type).slice(0, 8);

  return (
    <PageShell>
      <SeoJsonLd data={[
        { "@context": "https://schema.org", "@type": "WebPage", name, inLanguage: locale, dateModified: "2026-06-03" },
        ...(item.marketable ? [{
          "@context": "https://schema.org",
          "@type": "Product",
          name,
          description: description,
          sku: String(item.id),
          category: item.gear ? `${item.type}/${item.gear}` : item.type,
          image: icon ? [`${icon}`] : [],
          offers: market?.lowest ? {
            "@type": "Offer",
            price: market.lowest.toFixed(2),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          } : {
            "@type": "Offer",
            priceCurrency: "USD",
            availability: "https://schema.org/SoldOut",
          },
        }] : []),
      ]} />
      <nav className="mb-5 flex flex-wrap gap-2 text-xs text-[#6c6c6c]">
        <Link href={`/${locale}`} className="hover:text-[#f0c040]">TBH</Link><span>/</span>
        <Link href={`/${locale}/items`} className="hover:text-[#f0c040]">{isZh ? "物品" : "Items"}</Link><span>/</span>
        <span className="text-[#9d9d9d]">{name}</span>
      </nav>

      {/* Quick Answer Bar */}
      <ItemQuickAnswer itemSlug={slug} marketPrice={market?.lowest} locale={locale} />

      <section className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="h-fit border border-[#27272a] bg-[#0d0d0d] p-5 lg:sticky lg:top-16">
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-[#3b3b3b] bg-[#0a0a0a]">
              {icon ? <Image src={icon} alt={name} width={80} height={80} className="object-contain" data-pixel unoptimized /> : <span className="text-xs text-[#6c6c6c]">No image</span>}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-[#f1e8d5]">{name}</h1>
              {enName !== name ? <p className="mt-1 text-sm text-[#6c6c6c]">{enName}</p> : null}
              <p className="mt-2 text-xs text-[#6c6c6c]">ID {item.id}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <RarityBadge grade={item.grade} locale={locale} />
            <span className="border border-[#3b3b3b] px-2 py-0.5 text-[11px] text-[#9d9d9d]">{item.type}</span>
            {item.gear ? <span className="border border-[#3b3b3b] px-2 py-0.5 text-[11px] text-[#9d9d9d]">{slotNames[item.gear]?.[locale] ?? item.gear}</span> : null}
            {item.level ? <span className="border border-[#3b3b3b] px-2 py-0.5 text-[11px] text-[#9d9d9d]">Lv.{item.level}</span> : null}
          </div>
          <div className="mt-5 border-t border-[#27272a] pt-4">
            <p className="text-xs text-[#6c6c6c]">{isZh ? "市场状态" : "Market status"}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <MarketPrice item={item} />
              <ConfidenceBadge value={market?.confidence ?? "missing"} />
            </div>
            {market ? <Link href={`/${locale}/market/${item.slug}`} className="mt-2 inline-block text-xs text-[#f0c040] hover:underline">{isZh ? "查看市场状态" : "Open market status"}</Link> : null}
          </div>
        </aside>
        <div className="space-y-8">
          {/* Drop Heatmap — the main visualization */}
          <Section title={isZh ? "掉落热力图" : "Drop Heatmap"} eyebrow={isZh ? "点击关卡查看详情" : "Click a stage for details"}>
            <DropHeatmap itemSlug={slug} locale={locale} />
          </Section>

          <Section title={isZh ? "基础说明" : "Overview"}>
            <p className="border border-[#27272a] bg-[#0d0d0d] p-4 text-sm leading-7 text-[#9d9d9d]">{description}</p>
          </Section>
          <Section title={isZh ? "属性与合成" : "Stats and Synthesis"}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
                <p className="mb-3 text-sm font-medium text-[#ffffff]">{isZh ? "结构化属性" : "Structured stats"}</p>
                {detail?.stats && Object.keys(detail.stats).length ? (
                  <dl className="grid grid-cols-2 gap-2 text-sm">{Object.entries(detail.stats).map(([key, value]) => <div key={key} className="border border-[#27272a] p-2"><dt className="text-xs text-[#6c6c6c]">{key}</dt><dd className="text-[#ffffff]">{String(value)}</dd></div>)}</dl>
                ) : <p className="text-sm text-[#6c6c6c]">{isZh ? "该物品没有结构化属性。" : "No structured stats for this item."}</p>}
              </div>
              <div className="border border-[#27272a] bg-[#0d0d0d] p-4 text-sm text-[#9d9d9d]">
                <p><span className="text-[#6c6c6c]">Synth:</span> {detail?.synthType ?? "-"}</p>
                <p className="mt-2"><span className="text-[#6c6c6c]">DropKey:</span> {detail?.dropKey ?? (isZh ? "掉率数据不足" : "Drop data unavailable")}</p>
                <p className="mt-2"><span className="text-[#6c6c6c]">Unique:</span> {detail?.uniqueMod ?? "-"}</p>
              </div>
            </div>
          </Section>

          {/* Drop Source Details */}
          <Section title={isZh ? "掉落来源详情" : "Drop Source Details"} eyebrow={isZh ? "按宝箱类型分组" : "Grouped by chest type"}>
            <DropSourceDetails itemSlug={slug} selectedStage={null} locale={locale} />
          </Section>

          <Section title={isZh ? "如何使用" : "How to Use This Data"}>
            <div className="border border-[#27272a] bg-[#0d0d0d] p-4 text-sm leading-7 text-[#9d9d9d]">
              {isZh
                ? "热力图中颜色越深的关卡掉落密度越高。点击关卡格子可以查看具体的宝箱和概率。结合 Steam 市场价格判断是否值得刷取。"
                : "Darker stages on the heatmap have higher drop density. Click a stage to see specific chests and rates. Cross-reference with Steam Market price to decide if it's worth farming."}
            </div>
          </Section>
          <Section title={isZh ? "相关物品" : "Related Items"}>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{related.map((entry) => <ItemCard key={entry.id} item={entry} locale={locale} />)}</div>
          </Section>
        </div>
      </section>
    </PageShell>
  );
}
