import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, Filter, PackageOpen } from "lucide-react";
import { RarityBadge } from "@/components/tbh/badges";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { ItemIcon } from "@/components/ui/item-icon";
import { SITE_URL, assetPath, chestItems, type Locale } from "@/lib/game-data/data";
import { getChestDecision } from "@/lib/game-data/decisions";
import { localizedPath } from "@/lib/locale-path";
import { RelatedPages } from "@/components/tbh/related-pages";
import { HowToUse } from "@/components/tbh/how-to-use";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string; level?: string; type?: string; source?: string; marketable?: string }>;
};

function text(locale: Locale, values: Record<Locale | "en", string>) {
  return values[locale] ?? values.en;
}

function rate(value: number | null | undefined) {
  return value == null ? "No drop rate" : `${value.toFixed(2)}%`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: text(locale, {
      zh: "TBH 宝箱 | 装备等级、来源关卡与掉率",
      en: "TBH Chests | Gear Level, Source Stages & Drop Rates",
      ja: "TBH 宝箱 | 装備レベル、入手ステージ、ドロップ率",
      ko: "TBH 상자 | 장비 레벨, 출처 스테이지, 드롭률",
    }),
    description: text(locale, {
      zh: "按装备等级、宝箱类型、来源关卡和可交易内容反查宝箱，查看最佳来源、内容数量和用途判断。",
      en: "Filter chests by gear level, chest type, source stage, and marketable contents with top source and use decision.",
      ja: "装備レベル、宝箱タイプ、入手ステージ、取引可能内容で宝箱を絞り込みます。",
      ko: "장비 레벨, 상자 유형, 출처 스테이지, 거래 가능 내용으로 상자를 필터링합니다.",
    }),
    alternates: {
      canonical: locale === "en" ? "/chests" : `/${locale}/chests`,
      languages: { zh: "/zh/chests", en: "/chests", ja: "/ja/chests", ko: "/ko/chests", "x-default": "/chests" },
    },
  };
}

export default async function ChestsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const q = sp.q?.trim().toLowerCase() ?? "";
  const level = Number(sp.level || 0);
  const rows = chestItems()
    .map((item) => getChestDecision(item.slug, locale))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .filter((row) => !q || row.name.toLowerCase().includes(q) || row.localItem?.slug.includes(q))
    .filter((row) => !level || (row.gearLevelMin == null && row.gearLevelMax == null) || ((row.gearLevelMin ?? 0) <= level && (row.gearLevelMax ?? 999) >= level))
    .filter((row) => !sp.type || row.localItem?.grade === sp.type || row.bestUse === sp.type)
    .filter((row) => !sp.source || row.sources.some((source) => source.label.toLowerCase().includes(sp.source!.toLowerCase())))
    .filter((row) => sp.marketable !== "1" || row.marketableContentCount > 0);

  return (
    <PageShell>
      <SeoJsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: text(locale, { zh: "宝箱数据库", en: "Chests Database", ja: "宝箱データベース", ko: "상자 데이터베이스" }),
        numberOfItems: rows.length,
        itemListElement: rows.slice(0, 50).map((row, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}${locale === "en" ? "" : "/" + locale}/chests/${row.localItem?.slug ?? row.chest?.slug}`,
        })),
      }} />
      <PageHeader
        kicker="Chests"
        title={text(locale, { zh: "按装备等级反查宝箱", en: "Find chests by gear level", ja: "装備レベルから宝箱を探す", ko: "장비 레벨로 상자 찾기" })}
        description={text(locale, {
          zh: "120 个宝箱，覆盖装备等级 1-150。按等级、来源关卡、内容数量和用途筛选，看 Top source 和 Best use。",
          en: "120 chests covering gear levels 1-150. Filter by level, source stage, content count, and best use. See top source and recommended action.",
          ja: "装備レベル、入手ステージ、内容数、用途で宝箱を絞り込みます。",
          ko: "장비 레벨, 출처 스테이지, 내용 수, 용도로 상자를 필터링합니다.",
        })}
      />

      <HowToUse pageKey="/chests" locale={locale} />
      <form className="mb-5 grid gap-2 lg:grid-cols-[1fr_140px_150px_160px_auto]">
        <input name="q" defaultValue={sp.q} placeholder={text(locale, { zh: "搜索宝箱", en: "Search chest", ja: "宝箱検索", ko: "상자 검색" })} className="border border-border-strong bg-bg-canvas px-3 py-2 text-sm text-white outline-none" />
        <input name="level" defaultValue={sp.level} placeholder="Lv 1 / 20 / 50" className="border border-border-strong bg-bg-canvas px-3 py-2 text-sm text-white outline-none" />
        <select name="type" defaultValue={sp.type ?? ""} className="border border-border-strong bg-bg-canvas px-3 py-2 text-sm text-white">
          <option value="">{text(locale, { zh: "全部用途", en: "All use", ja: "全用途", ko: "전체 용도" })}</option>
          <option value="gear">gear</option>
          <option value="material">material</option>
          <option value="market">market</option>
          <option value="COMMON">COMMON</option>
          <option value="RARE">RARE</option>
        </select>
        <input name="source" defaultValue={sp.source} placeholder={text(locale, { zh: "来源关卡", en: "Source stage", ja: "入手ステージ", ko: "출처 스테이지" })} className="border border-border-strong bg-bg-canvas px-3 py-2 text-sm text-white outline-none" />
        <button className="inline-flex items-center justify-center gap-2 bg-[#d4a017] px-4 py-2 text-sm font-semibold text-black">
          <Filter className="h-4 w-4" />
          {text(locale, { zh: "筛选", en: "Filter", ja: "絞り込み", ko: "필터" })}
        </button>
      </form>

      <div className="mb-4 flex flex-wrap gap-2">
        {[1, 20, 50, 80].map((value) => (
          <Link key={value} href={localizedPath(locale, `/chests?level=${value}`)} className="border border-border-default bg-bg-panel px-3 py-1.5 text-xs text-text-secondary hover:border-accent">
            Lv {value}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <Link key={row.localItem?.id ?? row.chest?.key} href={localizedPath(locale, `/chests/${row.localItem?.slug ?? row.chest?.slug}`)} className="border border-border-default bg-bg-panel p-4 transition hover:border-accent">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <ItemIcon src={assetPath(row.localItem?.icon)} alt={row.name} size={44} className="shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{row.name}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Lv {row.gearLevelMin ?? "?"}-{row.gearLevelMax ?? "?"} / {row.contentCount} contents
                  </p>
                </div>
              </div>
              {row.localItem ? <RarityBadge grade={row.localItem.grade} locale={locale} /> : null}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Info icon={<Boxes className="h-3.5 w-3.5" />} label="Top source" value={row.topSource?.label ?? "Unknown"} />
              <Info icon={<PackageOpen className="h-3.5 w-3.5" />} label="Best use" value={row.bestUse} />
              <Info label="Sources" value={`${row.sourceStageCount}`} />
              <Info label="Marketable" value={`${row.marketableContentCount}`} />
            </div>
            {row.contents && row.contents.length > 0 ? (
              <div className="mt-3 truncate border-t border-border-default pt-3 text-[10px] text-text-secondary">
                <span className="text-text-muted">{text(locale, { zh: "含:", en: "Contains:", ja: "含有:", ko: "포함:" })} </span>
                <span className="text-text-secondary">{row.contents.slice(0, 3).map((c) => c.name).join(", ")}</span>
                {row.contents.length > 3 ? <span className="text-text-muted"> +{row.contents.length - 3}</span> : null}
                {row.marketableContentCount > 0 ? (
                  <span className="ml-2 text-accent">· {row.marketableContentCount} {text(locale, { zh: "件可卖", en: "tradable", ja: "取引可", ko: "거래가능" })}</span>
                ) : null}
              </div>
            ) : null}
            <div className="mt-3 flex items-center justify-between border-t border-border-default pt-3 text-xs">
              <span className="text-text-muted">{rate(row.topSource?.ratePercent)}</span>
              <span className="font-semibold text-accent-bright">{text(locale, { zh: "查看", en: "Open", ja: "開く", ko: "열기" })}</span>
            </div>
          </Link>
        ))}
      </div>
      <RelatedPages pageKey="/chests" locale={locale} />
    </PageShell>
  );
}

function Info({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-border-default bg-bg-canvas p-2">
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-text-muted">{icon}{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
