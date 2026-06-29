import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ConfidenceBadge } from "@/components/tbh/badges";
import { Breadcrumb } from "@/components/tbh/breadcrumb";
import { Section } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { wikiArticles, wikiBySlug, type Locale } from "@/lib/game-data/data";
import { localizedPath, localizedUrl } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";
import { articleSchema } from "@/lib/schema-ld";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

function txt(locale: Locale, values: Record<string, string>) {
  return values[locale] ?? values.en ?? "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = wikiBySlug(slug);
  return {
    title: article ? txt(locale, article.title) : "Wiki",
    description: article ? txt(locale, article.description) : undefined,
    alternates: pageAlternates(locale, `/wiki/${slug}`),
  };
}

export default async function WikiDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const article = wikiBySlug(slug);
  if (!article) notFound();

  const isZh = locale === "zh";
  const isJa = locale === "ja";
  const title = txt(locale, article.title);
  const description = txt(locale, article.description);

  const jsonLd = articleSchema({
    headline: title,
    description,
    url: localizedUrl(locale, `/wiki/${slug}`),
    datePublished: article.updatedAt,
    dateModified: article.updatedAt,
  });

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb
        locale={locale}
        items={[
          { label: "Home", href: "/" },
          { label: isZh ? "百科" : isJa ? "Wiki" : "Wiki", href: "/wiki" },
          { label: title },
        ]}
      />

      <PageHeader
        kicker={txt(locale, { en: "Wiki Article", zh: "百科文章", ja: "Wiki記事", ko: "위키 문서" })}
        title={title}
        description={description}
      />

      <ConfidenceBadge
        value={
          article.evidence === "datamined"
            ? "high"
            : article.evidence === "editorial"
              ? "medium"
              : "low"
        }
      />

      <Section
        title={isZh ? "要点总结" : isJa ? "要点まとめ" : "Key Points"}
      >
        <div className="border border-border-default bg-bg-panel p-5">
          <p className="text-sm leading-7 text-text-secondary">
            {isZh
              ? "本文基于数据挖掘的游戏数据和社区验证经验编写。具体数值可能随游戏版本更新而变化，请以游戏内实际数据为准。"
              : isJa
                ? "この記事はデータ抽出されたゲームデータとコミュニティ検証済みの経験に基づいています。数値はゲームのバージョンアップデートにより変更される可能性があります。"
                : "This article is based on datamined game data and community-verified experience. Specific values may change with game version updates — always verify in-game."
            }
          </p>
        </div>
      </Section>

      <Section
        title={isZh ? "相关链接" : isJa ? "関連リンク" : "Related Links"}
      >
        <div className="flex flex-wrap gap-2">
          <Link
            href={localizedPath(locale, "/wiki")}
            className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
          >
            <ArrowRight className="mr-1 inline h-3.5 w-3.5" />
            {isZh ? "返回百科" : isJa ? "Wikiに戻る" : "Back to Wiki"}
          </Link>
          {article.category === "mechanics" && (
            <Link
              href={localizedPath(locale, "/guides")}
              className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
            >
              {isZh ? "相关攻略" : isJa ? "関連ガイド" : "Related Guides"}
            </Link>
          )}
          {article.category === "combat" && (
            <>
              <Link
                href={localizedPath(locale, "/skills")}
                className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
              >
                {isZh ? "技能数据库" : isJa ? "スキルDB" : "Skills DB"}
              </Link>
              <Link
                href={localizedPath(locale, "/runes")}
                className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
              >
                {isZh ? "符文树" : isJa ? "ルーンツリー" : "Rune Tree"}
              </Link>
            </>
          )}
        </div>
      </Section>

      <Section
        title={isZh ? "其他百科文章" : isJa ? "他のWiki記事" : "Other Wiki Articles"}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {wikiArticles
            .filter((a) => a.slug !== slug)
            .slice(0, 6)
            .map((a) => (
              <Link
                key={a.slug}
                href={localizedPath(locale, `/wiki/${a.slug}`)}
                className="group block border border-border-default bg-bg-panel p-3 transition hover:border-accent hover:bg-bg-surface"
              >
                <p className="text-sm font-medium text-text-primary transition-colors group-hover:text-accent-bright">
                  {txt(locale, a.title)}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {txt(locale, a.description)}
                </p>
              </Link>
            ))}
        </div>
      </Section>
    </PageShell>
  );
}
