import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { stageBySlug, stageName, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const stage = stageBySlug(slug);
  return { title: locale === "zh" ? `${stage ? stageName(stage, locale) : "关卡"}｜TaskBar Hero 怪物、宝箱与刷取判断` : `${stage ? stageName(stage, locale) : "Stage"}｜TaskBar Hero`, alternates: pageAlternates(locale, `/stages/${slug}`) };
}

export default async function StageDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const stage = stageBySlug(slug);
  if (!stage) notFound();
  const isZh = locale === "zh";
  return (
    <PageShell>
      <PageHeader kicker="Stage detail" title={stageName(stage, locale)} description={`${stage.difficulty} / Act ${stage.act}-${stage.no} / Lv.${stage.level}`} />
      <div className="grid gap-3 md:grid-cols-4">
        <div className="border border-[#252525] bg-[#101010] p-4"><p className="text-xs text-[#777]">{isZh ? "金币" : "Gold"}</p><p className="mt-2 text-xl text-[#f0c040]">{stage.goldPerClear ?? "-"}</p></div>
        <div className="border border-[#252525] bg-[#101010] p-4"><p className="text-xs text-[#777]">{isZh ? "经验" : "EXP"}</p><p className="mt-2 text-xl text-[#ddd]">{stage.expPerClear ?? "-"}</p></div>
        <div className="border border-[#252525] bg-[#101010] p-4"><p className="text-xs text-[#777]">{isZh ? "波数" : "Waves"}</p><p className="mt-2 text-xl text-[#ddd]">{stage.waves ?? "-"}</p></div>
        <div className="border border-[#252525] bg-[#101010] p-4"><p className="text-xs text-[#777]">Boss</p><p className="mt-2 text-xl text-[#ddd]">{stage.boss?.name ? stageName({ ...stage, name: stage.boss.name }, locale) : "-"}</p></div>
      </div>
      <Section title={isZh ? "刷取判断" : "Farming Decision"}>
        <div className="border border-[#252525] bg-[#101010] p-4 text-sm leading-7 text-[#aaa]">
          {isZh ? "用关卡基础数据来对比金币和经验效率。如果要评估市场收益，需要同时有宝箱掉率和真实 Steam 市场价。" : "Compare gold and XP using stage base data. To evaluate market profit, you need both chest drop rates and real Steam Market prices."}
        </div>
      </Section>
    </PageShell>
  );
}
