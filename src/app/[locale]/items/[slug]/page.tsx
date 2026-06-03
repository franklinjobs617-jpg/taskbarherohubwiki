import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfidenceBadge, RarityBadge } from "@/components/tbh/badges";
import { DropRateTable, ItemCard, MarketPrice, Section } from "@/components/tbh/cards";
import { PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { allItems, assetPath, itemBySlug, itemDetail, itemName, marketForItem, slotNames, text, type Locale } from "@/lib/game-data/data";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = itemBySlug(slug);
  if (!item) return { title: "Not found" };
  const name = itemName(item, locale);
  return {
    title: locale === "zh" ? `${name}｜TaskBar Hero 属性、来源与市场状态` : `${name}｜Stats, Sources & Market Status`,
    description: locale === "zh" ? `${name} 的稀有度、类型、等级、属性、来源线索和可交易状态。` : `${name} rarity, type, level, stats, source hints, and tradability.`,
    alternates: { canonical: `/${locale}/items/${slug}`, languages: { zh: `/zh/items/${slug}`, en: `/en/items/${slug}`, "x-default": `/zh/items/${slug}` } },
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
  const related = allItems().filter((entry) => entry.id !== item.id && (entry.gear === item.gear || entry.grade === item.grade) && entry.type === item.type).slice(0, 8);

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
      <nav className="mb-5 flex flex-wrap gap-2 text-xs text-[#777]">
        <Link href={`/${locale}`} className="hover:text-[#f0c040]">TBH</Link><span>/</span>
        <Link href={`/${locale}/items`} className="hover:text-[#f0c040]">{isZh ? "物品" : "Items"}</Link><span>/</span>
        <span className="text-[#aaa]">{name}</span>
      </nav>
      <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="h-fit border border-[#252525] bg-[#101010] p-5 lg:sticky lg:top-16">
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-[#333] bg-[#080808]">
              {icon ? <Image src={icon} alt={name} width={80} height={80} className="object-contain" data-pixel unoptimized /> : <span className="text-xs text-[#555]">No image</span>}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-[#f1e8d5]">{name}</h1>
              {enName !== name ? <p className="mt-1 text-sm text-[#777]">{enName}</p> : null}
              <p className="mt-2 text-xs text-[#666]">ID {item.id}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <RarityBadge grade={item.grade} locale={locale} />
            <span className="border border-[#333] px-2 py-0.5 text-[11px] text-[#aaa]">{item.type}</span>
            {item.gear ? <span className="border border-[#333] px-2 py-0.5 text-[11px] text-[#aaa]">{slotNames[item.gear]?.[locale] ?? item.gear}</span> : null}
            {item.level ? <span className="border border-[#333] px-2 py-0.5 text-[11px] text-[#aaa]">Lv.{item.level}</span> : null}
          </div>
          <div className="mt-5 border-t border-[#242424] pt-4">
            <p className="text-xs text-[#777]">{isZh ? "市场状态" : "Market status"}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <MarketPrice item={item} />
              <ConfidenceBadge value={market?.confidence ?? "missing"} />
            </div>
            {market ? <Link href={`/${locale}/market/${item.slug}`} className="mt-2 inline-block text-xs text-[#f0c040] hover:underline">{isZh ? "查看市场状态" : "Open market status"}</Link> : null}
          </div>
        </aside>
        <div className="space-y-8">
          <Section title={isZh ? "基础说明" : "Overview"}>
            <p className="border border-[#252525] bg-[#101010] p-4 text-sm leading-7 text-[#aaa]">{description}</p>
          </Section>
          <Section title={isZh ? "属性与合成" : "Stats and Synthesis"}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="border border-[#252525] bg-[#101010] p-4">
                <p className="mb-3 text-sm font-medium text-[#ddd]">{isZh ? "结构化属性" : "Structured stats"}</p>
                {detail?.stats && Object.keys(detail.stats).length ? (
                  <dl className="grid grid-cols-2 gap-2 text-sm">{Object.entries(detail.stats).map(([key, value]) => <div key={key} className="border border-[#242424] p-2"><dt className="text-xs text-[#777]">{key}</dt><dd className="text-[#ddd]">{String(value)}</dd></div>)}</dl>
                ) : <p className="text-sm text-[#777]">{isZh ? "该物品没有结构化属性。" : "No structured stats for this item."}</p>}
              </div>
              <div className="border border-[#252525] bg-[#101010] p-4 text-sm text-[#aaa]">
                <p><span className="text-[#777]">Synth:</span> {detail?.synthType ?? "-"}</p>
                <p className="mt-2"><span className="text-[#777]">DropKey:</span> {detail?.dropKey ?? (isZh ? "掉率数据不足" : "Drop data unavailable")}</p>
                <p className="mt-2"><span className="text-[#777]">Unique:</span> {detail?.uniqueMod ?? "-"}</p>
              </div>
            </div>
          </Section>
          <Section title={isZh ? "来源与决策" : "Source and Decision"}>
            <DropRateTable rows={[
              { name, rate: detail?.dropKey ? (isZh ? "掉率数据不足" : "Drop data unavailable") : (isZh ? "掉率数据不足" : "Drop data unavailable"), source: detail?.dropKey ? `DropKey ${detail.dropKey}` : "-" },
              { name: isZh ? "市场状态" : "Market status", rate: market ? (isZh ? "可交易，暂无市场数据" : "Tradable, no market data") : (isZh ? "不可交易" : "Not tradable"), source: market?.marketHash ?? "-" },
            ]} />
            <div className="mt-3 border border-[#252525] bg-[#101010] p-4 text-sm leading-7 text-[#aaa]">
              {isZh ? "决策顺序：先看是否自用，再看是否可交易，最后看真实市场数据。没有真实价格或掉率时，不计算市场收益。" : "Decision order: check self-use, then tradability, then real market data. Without real price or drop rates, market profit is not calculated."}
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
