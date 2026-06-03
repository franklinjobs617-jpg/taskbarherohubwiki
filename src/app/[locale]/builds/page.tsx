import type { Metadata } from "next";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/tbh/badges";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { builds, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero Build 推荐路线｜职业、阶段与装备方向" : "TaskBar Hero Build Routes", alternates: pageAlternates(locale, "/builds") };
}

export default async function BuildsPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  return (
    <PageShell>
      <PageHeader
        kicker="Builds"
        title={isZh ? "精选 Build 路线" : "Curated Build Routes"}
        description={isZh ? "只展示编辑精选和社区参考路线。每条路线都标注证据等级，不写绝对最强。" : "Curated and community-reference routes only. Every route shows evidence level and avoids absolute best claims."}
      />
      <div className="grid gap-2 md:grid-cols-3">
        {builds.map((build) => (
          <Link key={build.slug} href={`/${locale}/builds/${build.slug}`} className="border border-[#252525] bg-[#101010] p-4 hover:border-[#d4a017]">
            <p className="font-medium text-[#ddd]">{build.title[locale]}</p>
            <p className="mt-2 text-sm text-[#888]">{build.description[locale]}</p>
            <div className="mt-3"><ConfidenceBadge value={build.evidence === "editorial" ? "medium" : "low"} /></div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
