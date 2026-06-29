import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ConfidenceBadge } from "@/components/tbh/badges";
import { Section } from "@/components/tbh/cards";
import { DataNotice, PageShell } from "@/components/tbh/page";
import { hasIndexableMarketData, itemDetail, itemName, marketBySlug, resolveLegacyMarketRedirectTarget, slotNames, type Locale, ensureMarket } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; hash: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureMarket();

  const { locale, hash } = await params;
  const row = marketBySlug(hash);
  if (!row) return { title: "Not found" };
  const name = itemName(row.item, locale);
  const indexable = hasIndexableMarketData(row.market);
  return {
    title: locale === "zh" ? `${name} Steam 市场状态｜TaskBar Hero` : `${name} Steam Market Status`,
    description: locale === "zh" ? `${name} 的可交易状态、Steam 市场名称、数据状态和卖出风险。` : `${name} tradability, Steam market name, data status, and sale risk.`,
    alternates: pageAlternates(locale, `/market/${row.item.slug}`),
    robots: { index: indexable, follow: true },
  };
}

export default async function MarketDetailPage({ params }: Props) {
  await ensureMarket();

  const { locale, hash } = await params;
  const row = marketBySlug(hash);
  if (!row) {
    const legacyTarget = resolveLegacyMarketRedirectTarget(hash);
    if (legacyTarget) redirect(localizedPath(locale, legacyTarget));
    notFound();
  }
  if (hash !== row.item.slug) {
    const target = hasIndexableMarketData(row.market)
      ? `/market/${row.item.slug}`
      : `/items/${row.item.slug}`;
    redirect(localizedPath(locale, target));
  }
  const { item, market } = row;
  const isZh = locale === "zh";
  const detail = itemDetail(item.id);
  const name = itemName(item, locale);
  const lpath = (path: string) => localizedPath(locale, path);

  return (
    <PageShell>
      <nav className="mb-5 flex gap-2 text-xs text-text-muted">
        <Link href={lpath("/market")} className="hover:text-accent-bright">{isZh ? "市场" : "Market"}</Link>
        <span>/</span>
        <span className="text-text-secondary">{name}</span>
      </nav>
      <div className="mb-6 flex flex-col gap-3 border-b border-border-default pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Market status</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-primary">{name}</h1>
          <p className="mt-2 text-sm text-text-secondary">{itemName(item, "en")} / {item.gear ? slotNames[item.gear]?.[locale] ?? item.gear : item.type}</p>
        </div>
        <Link href={lpath(`/items/${item.slug}`)} className="border border-border-strong px-4 py-2 text-sm text-text-primary hover:border-accent">{isZh ? "返回物品详情" : "Open item detail"}</Link>
      </div>
      <DataNotice>
        {market.lowest
          ? (isZh ? "以下价格为 Steam 市场当前最低挂单价，不等于实际成交价。挂单价格可能随时变动，不能保证以此价格出售。" : "The price shown is the current lowest listing on the Steam Market, not a confirmed sale price. Listings can change at any time and do not guarantee a sale at this price.")
          : (isZh ? "这个物品还没有 Steam 市场真实价格数据。在价格数据获取到之前，无法显示价格、挂单数或价格趋势。" : "Real Steam Market price data is not available for this item yet. Price, listings, and trends will appear once data is obtained.")}
      </DataNotice>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="border border-border-default bg-bg-panel p-4"><p className="text-xs text-text-muted">{isZh ? "Steam 市场名称" : "Steam Market Name"}</p><p className="mt-2 text-text-primary">{market.marketHash}</p></div>
        <div className="border border-border-default bg-bg-panel p-4">
          <p className="text-xs text-text-muted">{isZh ? "市场价" : "Price"}</p>
          {market.lowest ? (
            <div>
              <p className="mt-2 text-2xl font-semibold text-accent-bright">${market.lowest.toFixed(2)}</p>
              <p className="mt-1 text-xs text-text-muted">{isZh ? "最低挂单价" : "Lowest listing"}</p>
            </div>
          ) : (
            <p className="mt-2 text-text-muted">{isZh ? "暂无市场数据" : "No market data"}</p>
          )}
        </div>
        <div className="border border-border-default bg-bg-panel p-4"><p className="text-xs text-text-muted">{isZh ? "数据状态" : "Data status"}</p><div className="mt-3"><ConfidenceBadge value={market.confidence} /></div></div>
      </div>
      {market.lowest ? (
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="border border-border-default bg-bg-panel p-4">
            <p className="text-xs text-text-muted">{isZh ? "挂单数" : "Listings"}</p>
            <p className="mt-2 text-xl text-text-primary">{market.listings?.toLocaleString() ?? "-"}</p>
          </div>
          <div className="border border-border-default bg-bg-panel p-4">
            <p className="text-xs text-text-muted">{isZh ? "中位价" : "Median"}</p>
            <p className="mt-2 text-xl text-text-muted">{isZh ? "暂无市场数据" : "No market data"}</p>
          </div>
          <div className="border border-border-default bg-bg-panel p-4">
            <p className="text-xs text-text-muted">{isZh ? "趋势" : "Trend"}</p>
            <p className="mt-2 text-xl text-text-muted">{isZh ? "暂无市场数据" : "No market data"}</p>
          </div>
        </div>
      ) : null}
      <Section title={isZh ? "卖出风险" : "Sale Risk"}>
        <div className="space-y-2 border border-border-default bg-bg-panel p-4 text-sm leading-7 text-text-secondary">
          <p>{isZh ? "可交易只代表物品允许进入市场，不代表存在真实需求。卖之前先确认你是否真的不需要它。" : "Tradable means the item can enter the market, not that demand exists. Check if you actually need it before selling."}</p>
          <p>{market.lowest ? (isZh ? "有挂单价时可以作参考，但不能当成确定收入。实际卖掉的价格取决于当时的市场供需。" : "A listing price is a reference, not guaranteed income. Actual sale price depends on current market supply and demand.") : (isZh ? "没有真实价格数据时，暂时无法评估市场收益。可以先关注关卡金币和经验效率。" : "Without real price data, market profit can't be evaluated yet. Focus on stage gold and XP efficiency for now.")}</p>
          <p>{isZh ? "判断价格时，同时关注挂单数量、近期成交记录和物品在你当前职业中的用途。" : "When evaluating price, also check listing volume, recent sale history, and whether the item fits your current class."}</p>
        </div>
      </Section>
      <Section title={isZh ? "掉落来源和可获得性" : "Drops and Availability"}>
        <div className="border border-border-default bg-bg-panel p-4 text-sm text-text-secondary">
          <p>DropKey: {detail?.dropKey ?? (isZh ? "掉率数据不足" : "Drop data unavailable")}</p>
          <p className="mt-2">{item.type === "MATERIAL" ? (isZh ? "材料通常需要结合材料效果和来源判断。" : "Materials should be judged with effect and source context.") : (isZh ? "装备需要结合等级、职业和来源判断。" : "Gear should be judged by level, class fit, and source.")}</p>
        </div>
      </Section>
    </PageShell>
  );
}
