import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfidenceBadge, RarityBadge } from "@/components/tbh/badges";
import { DropRateTable, ItemCard, MarketPrice, Section } from "@/components/tbh/cards";
import { PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { allItems, assetPath, itemBySlug, itemDetail, itemName, marketForItem, slotNames, text, type Locale } from "@/lib/game-data/data";
import { extIconPath, extItems, extStages, formatDropRate } from "@/lib/game-data/external";

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

  // Get drop sources from external data
  const extItem = extItems().find((ei) => ei.key === item.id);
  const dropSources = extItem
    ? extStages()
        .filter((s) => s.drops.some((d) => d.itemKey === item.id))
        .map((s) => ({ stage: s, drop: s.drops.find((d) => d.itemKey === item.id)! }))
        .slice(0, 12)
    : [];

  // Get which heroes can use this item
  const usableBy = extItem?.classes ?? [];

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
      <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
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
          {/* ── Drop Sources ── */}
          {dropSources.length > 0 && (
            <Section title={isZh ? "掉落来源" : "Drop Sources"} eyebrow={isZh ? `${dropSources.length} 个关卡掉落` : `Drops from ${dropSources.length} stages`}>
              <div className="overflow-x-auto border border-[#27272a]">
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead className="bg-[#18181b] text-xs text-[#6c6c6c]">
                    <tr>
                      <th className="px-3 py-2.5">{isZh ? "关卡" : "Stage"}</th>
                      <th className="px-3 py-2.5">{isZh ? "难度" : "Diff"}</th>
                      <th className="px-3 py-2.5">{isZh ? "来源" : "Source"}</th>
                      <th className="px-3 py-2.5">{isZh ? "掉率" : "Rate"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dropSources.map(({ stage: s, drop }) => (
                      <tr key={s.key} className="border-t border-[#27272a] hover:bg-[#0d0d0d]">
                        <td className="px-3 py-3">
                          <Link href={`/${locale}/stages/${s.label.toLowerCase().replace(".", "-")}`} className="font-medium text-[#f0c040] hover:underline">
                            {s.label} {s.name}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-[#9d9d9d]">{s.difficulty}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] ${drop.source === "boss" ? "bg-[#2a1515] text-[#ff6b6b]" : "bg-[#152a15] text-[#6bff6b]"}`}>
                            {drop.source === "boss" ? "Boss" : (isZh ? "怪物" : "Monster")}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-semibold text-[#f0c040]">{formatDropRate(drop.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ── Hero compatibility ── */}
          {usableBy.length > 0 && (
            <Section title={isZh ? "适用职业" : "Usable By"} eyebrow={isZh ? "职业匹配" : "Class match"}>
              <div className="flex flex-wrap gap-2">
                {usableBy.map((cls) => (
                  <Link
                    key={cls}
                    href={`/${locale}/heroes/${cls.toLowerCase()}`}
                    className="border border-[#3b3b3b] bg-[#0d0d0d] px-3 py-2 text-sm text-[#ffffff] hover:border-[#d4a017] hover:text-[#f0c040]"
                  >
                    {cls}
                  </Link>
                ))}
              </div>
            </Section>
          )}

          <Section title={isZh ? "决策建议" : "Decision Guide"}>
            <div className="border border-[#27272a] bg-[#0d0d0d] p-4 text-sm leading-7 text-[#9d9d9d]">
              {isZh
                ? "使用顺序：先确认是否当前职业可用 → 再看是否可交易 → 最后看真实市场数据。有掉率时优先刷高掉率关卡，有市场价时结合掉率计算期望收益。"
                : "Priority: check if your class can use it → check tradability → check real market data. Farm high-rate stages first, combine with market price for profit estimates when both exist."}
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
