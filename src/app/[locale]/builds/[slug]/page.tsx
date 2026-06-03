import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfidenceBadge } from "@/components/tbh/badges";
import { Section } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { buildBySlug, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const build = buildBySlug(slug);
  return { title: build ? build.title[locale] : "Build", alternates: pageAlternates(locale, `/builds/${slug}`) };
}

export default async function BuildDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const build = buildBySlug(slug);
  if (!build) notFound();
  const isZh = locale === "zh";
  return (
    <PageShell>
      <PageHeader kicker="Build detail" title={build.title[locale]} description={build.description[locale]} />
      <ConfidenceBadge value={build.evidence === "editorial" ? "medium" : "low"} />
      <Section title={isZh ? "路线结构" : "Route Structure"}>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="border border-[#252525] bg-[#101010] p-4"><p className="text-xs text-[#777]">{isZh ? "职业" : "Hero"}</p><p className="mt-2 text-[#ddd]">{build.hero}</p></div>
          <div className="border border-[#252525] bg-[#101010] p-4"><p className="text-xs text-[#777]">{isZh ? "阶段" : "Phase"}</p><p className="mt-2 text-[#ddd]">{build.phase}</p></div>
          <div className="border border-[#252525] bg-[#101010] p-4"><p className="text-xs text-[#777]">{isZh ? "目标" : "Goal"}</p><p className="mt-2 text-[#ddd]">{build.goal}</p></div>
        </div>
      </Section>
      <Section title={isZh ? "相关链接" : "Related Links"}>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${locale}/heroes/${build.hero.toLowerCase()}`} className="border border-[#333] px-3 py-2 text-sm hover:border-[#d4a017]">{isZh ? "英雄详情" : "Hero detail"}</Link>
          <Link href={`/${locale}/items`} className="border border-[#333] px-3 py-2 text-sm hover:border-[#d4a017]">{isZh ? "物品数据库" : "Items"}</Link>
          <Link href={`/${locale}/market`} className="border border-[#333] px-3 py-2 text-sm hover:border-[#d4a017]">{isZh ? "市场价格" : "Market"}</Link>
        </div>
      </Section>
    </PageShell>
  );
}
