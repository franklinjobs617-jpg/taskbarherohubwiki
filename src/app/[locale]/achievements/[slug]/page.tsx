import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, EyeOff, Trophy } from "lucide-react";
import { Breadcrumb } from "@/components/tbh/breadcrumb";
import { Section } from "@/components/tbh/cards";
import { CrossLinks } from "@/components/tbh/cross-links";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { achievementBySlug, allAchievements, type Locale } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

function txt(locale: Locale, values: Record<string, string>) {
  return values[locale] ?? values.en ?? "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = achievementBySlug(slug);
  return {
    title: a ? txt(locale, a.name) : "Achievement",
    description: a ? txt(locale, a.description) : undefined,
    alternates: pageAlternates(locale, `/achievements/${slug}`),
  };
}

export default async function AchievementDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const a = achievementBySlug(slug);
  if (!a) notFound();

  const isZh = locale === "zh";
  const isJa = locale === "ja";
  const title = a.hidden ? "???" : txt(locale, a.name);

  const related = allAchievements()
    .filter((r) => r.category === a.category && r.slug !== a.slug)
    .slice(0, 6);

  return (
    <PageShell>
      <Breadcrumb
        locale={locale}
        items={[
          { label: "Home", href: "/" },
          { label: isZh ? "成就" : isJa ? "実績" : "Achievements", href: "/achievements" },
          { label: title },
        ]}
      />

      <PageHeader
        kicker={a.hidden ? (isZh ? "隐藏成就" : isJa ? "隠し実績" : "Hidden Achievement") : "Achievement"}
        title={title}
        description={a.hidden ? (isZh ? "此成就详情在解锁前隐藏。继续游戏以发现条件。" : isJa ? "この実績の詳細は解除前に非表示です。プレイを続けて条件を発見してください。" : "This achievement's details are hidden until unlocked. Keep playing to discover the conditions.") : txt(locale, a.description)}
      />

      {!a.hidden ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-border-default bg-bg-panel p-4">
              <p className="text-xs text-text-muted">
                {isZh ? "解锁条件" : isJa ? "解除条件" : "Unlock Condition"}
              </p>
              <p className="mt-2 text-sm text-text-primary">
                {txt(locale, a.unlockCondition)}
              </p>
            </div>
            <div className="border border-border-default bg-bg-panel p-4">
              <p className="text-xs text-text-muted">
                {isZh ? "奖励" : isJa ? "報酬" : "Reward"}
              </p>
              <p className="mt-2 text-sm text-text-primary">
                {a.reward ? txt(locale, a.reward) : (isZh ? "成就点数 / Steam 成就" : isJa ? "実績ポイント / Steam実績" : "Achievement Points / Steam Achievement")}
              </p>
            </div>
          </div>

          {a.relatedEntity ? (
            <Section title={isZh ? "关联内容" : isJa ? "関連コンテンツ" : "Related Content"}>
              <Link
                href={localizedPath(locale, `/${a.relatedEntity.type}s/${a.relatedEntity.slug}`)}
                className="inline-flex items-center gap-2 border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                {isZh ? `查看关联${a.relatedEntity.type}` : isJa ? `関連${a.relatedEntity.type}を見る` : `View related ${a.relatedEntity.type}`}
              </Link>
            </Section>
          ) : null}
        </>
      ) : null}

      {related.length > 0 ? (
        <CrossLinks
          locale={locale}
          title={isZh ? "同类型其他成就" : isJa ? "同じカテゴリの他の実績" : "Other achievements in this category"}
          links={related.map((r) => ({
            href: `/achievements/${r.slug}`,
            label: r.hidden ? "???" : txt(locale, r.name),
            meta: r.hidden ? undefined : txt(locale, r.description).slice(0, 60) + "...",
          }))}
        />
      ) : null}

      <Section title={isZh ? "相关链接" : isJa ? "関連リンク" : "Related Links"}>
        <div className="flex flex-wrap gap-2">
          <Link
            href={localizedPath(locale, "/achievements")}
            className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
          >
            <ArrowRight className="mr-1 inline h-3.5 w-3.5" />
            {isZh ? "返回成就列表" : isJa ? "実績一覧に戻る" : "Back to Achievements"}
          </Link>
          <Link
            href={localizedPath(locale, "/guides")}
            className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
          >
            {isZh ? "相关攻略" : isJa ? "関連ガイド" : "Related Guides"}
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
