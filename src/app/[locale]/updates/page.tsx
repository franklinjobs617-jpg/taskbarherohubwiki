import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allItems, marketRows, UPDATED_AT, DATA_VERSION, type Locale } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

const steamNewsUrl = "https://store.steampowered.com/news/app/3678970";
const steamStoreUrl = "https://store.steampowered.com/app/3678970/TBH_Task_Bar_Hero/";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TaskBar Hero 更新记录-物品、掉率与市场变化" : "TaskBar Hero Updates",
    alternates: pageAlternates(locale, "/updates"),
  };
}

export default async function UpdatesPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const marketCount = marketRows().length;

  return (
    <PageShell>
      <PageHeader
        kicker="Updates"
        title={isZh ? "更新记录" : "Updates"}
        description={
          isZh
            ? "官方游戏更新、本站数据版本、Steam 市场数据状态，以及维护和错误事件引用。"
            : "Official game updates, wiki data refreshes, Steam market data status, and known maintenance/error references."
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
          <p className="text-xs text-[#6c6c6c]">Data version</p>
          <p className="mt-2 text-[#ffffff]">{DATA_VERSION}</p>
        </div>
        <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
          <p className="text-xs text-[#6c6c6c]">Updated</p>
          <p className="mt-2 text-[#ffffff]">{UPDATED_AT}</p>
        </div>
        <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
          <p className="text-xs text-[#6c6c6c]">Entities</p>
          <p className="mt-2 text-[#ffffff]">{allItems().length} items / {marketCount} market</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <section className="border border-[#27272a] bg-[#0d0d0d] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6c6c6c]">Official game updates</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Steam news remains the source of truth</h2>
          <p className="mt-3 text-sm leading-7 text-[#bbb]">
            This wiki does not replace official TBH: Task Bar Hero announcements. For patches, emergency maintenance, server changes, and release notes, check the Steam news hub and Steam store page first.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={steamNewsUrl} target="_blank" rel="noopener noreferrer" className="border border-[#5a3a1a] bg-[#171105] px-3 py-2 text-sm font-medium text-[#f0c040] hover:bg-[#211708]">
              Steam news
            </a>
            <a href={steamStoreUrl} target="_blank" rel="noopener noreferrer" className="border border-[#27272a] bg-[#111] px-3 py-2 text-sm font-medium text-white hover:border-[#d4a017]">
              Steam store
            </a>
          </div>
        </section>

        <section className="border border-[#27272a] bg-[#0d0d0d] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6c6c6c]">Wiki data version</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Datamined site data is separate from official patches</h2>
          <p className="mt-3 text-sm leading-7 text-[#bbb]">
            Site data version <span className="font-mono text-[#f0c040]">{DATA_VERSION}</span> was last refreshed on <span className="font-mono text-[#f0c040]">{UPDATED_AT}</span>. Item, hero, stage, rune, and drop references are based on normalized game data available to the site.
          </p>
        </section>

        <section className="border border-[#27272a] bg-[#0d0d0d] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6c6c6c]">Market data status</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Market rows are verified references, not profit guarantees</h2>
          <p className="mt-3 text-sm leading-7 text-[#bbb]">
            The wiki currently maps {marketCount} Steam market rows. Prices and listings are reference data only. When a market item, drop rate, or sale outcome lacks verified data, 当前没有足够证据支持这个结论。
          </p>
          <Link href={localizedPath(locale, "/market")} className="mt-4 inline-flex border border-[#27272a] bg-[#111] px-3 py-2 text-sm font-medium text-white hover:border-[#d4a017]">
            Open market references
          </Link>
        </section>

        <section className="border border-[#3a2d12] bg-[#171105] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d7b2b]">Maintenance and errors</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Known server issues belong in the troubleshooting hub</h2>
          <p className="mt-3 text-sm leading-7 text-[#d8d1c2]">
            For maintenance, error 500, error 401, Discord/server questions, market closed reports, and not launching symptoms, use the server status hub with official and community source links.
          </p>
          <Link href={localizedPath(locale, "/server-status")} className="mt-4 inline-flex border border-[#5a3a1a] bg-[#211708] px-3 py-2 text-sm font-medium text-[#f0c040] hover:bg-[#2b1f0b]">
            Open server status hub
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
