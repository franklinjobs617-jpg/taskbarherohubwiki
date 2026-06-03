import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RarityBadge } from "@/components/tbh/badges";
import { Section } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { itemBySlug, itemName, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const chest = itemBySlug(slug);
  const name = chest ? itemName(chest, locale) : "Chest";
  return { title: locale === "zh" ? `${name} 掉落信息｜TaskBar Hero` : `${name} Drop Information`, alternates: pageAlternates(locale, `/chests/${slug}`) };
}

export default async function ChestDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const chest = itemBySlug(slug);
  if (!chest || chest.type !== "STAGEBOX") notFound();
  const isZh = locale === "zh";

  return (
    <PageShell>
      <PageHeader
        kicker="Chest detail"
        title={itemName(chest, locale)}
        description={isZh ? "宝箱基础信息、等级线索和掉率数据状态。" : "Chest base information, level hints, and drop data status."}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="border border-[#252525] bg-[#101010] p-4">
          <p className="text-xs text-[#777]">{isZh ? "稀有度" : "Rarity"}</p>
          <div className="mt-2"><RarityBadge grade={chest.grade} locale={locale} /></div>
        </div>
        <div className="border border-[#252525] bg-[#101010] p-4">
          <p className="text-xs text-[#777]">ID</p>
          <p className="mt-2 text-[#ddd]">{chest.id}</p>
        </div>
        <div className="border border-[#252525] bg-[#101010] p-4">
          <p className="text-xs text-[#777]">{isZh ? "掉率状态" : "Drop status"}</p>
          <p className="mt-2 text-[#aaa]">{isZh ? "掉率数据不足" : "Drop data unavailable"}</p>
        </div>
      </div>
      <Section title={isZh ? "掉落说明" : "Drop Notes"}>
        <div className="border border-[#252525] bg-[#101010] p-4 text-sm leading-7 text-[#aaa]">
          {isZh
            ? "这个宝箱的掉落物品清单和概率需要可验证的数据支持。目前还没有完整的宝箱→物品→掉率数据，因此不显示具体百分比。等数据充足后，这里会展示每个物品的掉落概率。"
            : "This chest's drop table needs verified data before specific rates can be shown. A full list of possible items with probabilities will appear here once the chest-to-item mapping is complete."}
        </div>
      </Section>
      <Section title={isZh ? "刷取判断" : "Farming Decision"}>
        <div className="border border-[#252525] bg-[#101010] p-4 text-sm leading-7 text-[#aaa]">
          {isZh
            ? "刷宝箱之前先确定目标：为了经验和金币，直接用关卡数据对比效率更高。为了特定物品或市场收益，需要同时有物品掉率和 Steam 市场真实价格才能做出准确判断。"
            : "Before farming a chest, decide your goal first. For XP and gold, compare stage base data directly — it's more reliable. For specific items or market profit, you need both the item's drop rate and real Steam Market prices to make an informed decision."}
        </div>
      </Section>
    </PageShell>
  );
}
