import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Shield, Swords, Target, TrendingUp, Zap } from "lucide-react";
import { ConfidenceBadge } from "@/components/tbh/badges";
import { Breadcrumb } from "@/components/tbh/breadcrumb";
import { Section } from "@/components/tbh/cards";
import { CrossLinks } from "@/components/tbh/cross-links";
import { FaqBlock } from "@/components/tbh/faq-block";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { HeroPortrait } from "@/components/tbh/hero-portrait";
import { entityFaqs } from "@/lib/game-data/faqs";
import {
  buildBySlug,
  builds,
  buildsForHero,
  heroBySlug,
  heroName,
  type Locale,
  ensureHeroes,
} from "@/lib/game-data/data";
import { localizedPath, localizedUrl } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";
import { articleSchema } from "@/lib/schema-ld";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

function txt(locale: Locale, values: Record<string, string>) {
  return values[locale] ?? values.en ?? "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureHeroes();

  const { locale, slug } = await params;
  const build = buildBySlug(slug);
  return {
    title: build ? txt(locale, build.title) : "Build",
    description: build ? txt(locale, build.description) : undefined,
    alternates: pageAlternates(locale, `/builds/${slug}`),
  };
}

export default async function BuildDetailPage({ params }: Props) {
  await ensureHeroes();

  const { locale, slug } = await params;
  const build = buildBySlug(slug);
  if (!build) notFound();

  const isZh = locale === "zh";
  const isJa = locale === "ja";
  const title = txt(locale, build.title);
  const description = txt(locale, build.description);
  const hero = heroBySlug(build.hero.toLowerCase());
  const heroLabel = hero ? heroName(hero, locale) : build.hero;
  const heroKey = hero?.HeroKey;

  const jsonLd = articleSchema({
    headline: title,
    description,
    url: localizedUrl(locale, `/builds/${slug}`),
    datePublished: build.updatedAt,
    dateModified: build.updatedAt,
  });

  const relatedBuilds = build.alternativeBuilds
    ?.map((bs) => builds.find((b) => b.slug === bs))
    .filter(Boolean) as typeof builds | undefined;

  const faqData = entityFaqs.builds?.[locale] ?? entityFaqs.builds?.en ?? [];
  const faqs = faqData.map((f) => ({ question: f.q, answer: f.a }));

  // Phase badge color
  const phaseColor =
    build.phase === "early"
      ? "text-emerald-400"
      : build.phase === "mid"
        ? "text-amber-400"
        : "text-red-400";
  const GoalIcon =
    build.goal === "survival"
      ? Shield
      : build.goal === "farming"
        ? TrendingUp
        : build.goal === "boss"
          ? Target
          : Zap;

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
          {
            label: isZh ? "配装" : isJa ? "ビルド" : "Builds",
            href: "/builds",
          },
          { label: title },
        ]}
      />

      <PageHeader kicker="Build" title={title} description={description} />

      {/* Build Strategy — unique per build, added to eliminate thin content */}
      {build.strategy ? (
        <section className="mt-6 border-l-[3px] border-amber-500 bg-amber-500/5 px-5 py-4">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400">
            {isZh ? "玩法策略" : isJa ? "戦略" : "Strategy"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-text-secondary">
            {txt(locale, build.strategy)}
          </p>
        </section>
      ) : null}

      {/* Hero + Phase overview */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 border border-border-default bg-bg-panel p-4">
          {heroKey ? (
            <HeroPortrait heroKey={heroKey} fallbackText={heroLabel} size="sm" />
          ) : null}
          <div>
            <p className="text-xs text-text-muted">
              {isZh ? "英雄" : isJa ? "ヒーロー" : "Hero"}
            </p>
            <p className="mt-1 text-lg font-semibold text-text-primary">
              {heroLabel}
            </p>
            {hero?.DLCAppId ? (
              <span className="mt-1 inline-block border border-accent-dim bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-bright">
                DLC
              </span>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="border border-border-default bg-bg-panel p-3 text-center">
            <p className="text-xs text-text-muted">
              {isZh ? "阶段" : isJa ? "フェーズ" : "Phase"}
            </p>
            <p className={`mt-1 text-sm font-semibold ${phaseColor}`}>
              {build.phase === "early"
                ? isZh
                  ? "前期"
                  : isJa
                    ? "序盤"
                    : "Early"
                : build.phase === "mid"
                  ? isZh
                    ? "中期"
                    : isJa
                      ? "中盤"
                      : "Mid"
                  : isZh
                    ? "后期"
                    : isJa
                      ? "終盤"
                      : "Endgame"}
            </p>
          </div>
          <div className="border border-border-default bg-bg-panel p-3 text-center">
            <p className="text-xs text-text-muted">
              {isZh ? "目标" : isJa ? "目標" : "Goal"}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-text-primary">
              <GoalIcon className="h-3.5 w-3.5" />
              {build.goal === "survival"
                ? isZh
                  ? "生存"
                  : isJa
                    ? "生存"
                    : "Survival"
                : build.goal === "farming"
                  ? isZh
                    ? "刷图"
                    : isJa
                      ? "周回"
                      : "Farming"
                  : build.goal === "boss"
                    ? isZh
                      ? "Boss"
                      : "Boss"
                    : isZh
                      ? "材料"
                      : isJa
                        ? "素材"
                        : "Materials"}
            </p>
          </div>
          <div className="border border-border-default bg-bg-panel p-3 text-center">
            <p className="text-xs text-text-muted">
              {isZh ? "证据" : isJa ? "証拠" : "Evidence"}
            </p>
            <ConfidenceBadge
              value={
                build.evidence === "editorial"
                  ? "medium"
                  : build.evidence === "community"
                    ? "high"
                    : "low"
              }
            />
          </div>
        </div>
      </div>

      {/* Stat Priority */}
      {build.statPriority && build.statPriority.length > 0 ? (
        <Section
          title={
            isZh
              ? "属性优先级"
              : isJa
                ? "ステータス優先度"
                : "Stat Priority"
          }
        >
          <div className="flex flex-wrap gap-2">
            {build.statPriority.map((stat, i) => (
              <span
                key={stat}
                className="border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary"
              >
                <span className="mr-1 font-mono text-xs text-accent-bright">
                  #{i + 1}
                </span>
                {stat}
              </span>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Skill Priority */}
      {build.skillPriority && build.skillPriority.length > 0 ? (
        <Section
          title={
            isZh ? "技能优先级" : isJa ? "スキル優先度" : "Skill Priority"
          }
        >
          <ol className="list-inside list-decimal space-y-2 border border-border-default bg-bg-panel p-4">
            {build.skillPriority.map((skill) => (
              <li
                key={skill}
                className="text-sm text-text-primary marker:text-accent-bright"
              >
                {skill}
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {/* Rune Path */}
      {build.runePath && build.runePath.length > 0 ? (
        <Section
          title={isZh ? "符文路径" : isJa ? "ルーンパス" : "Rune Path"}
        >
          <div className="divide-y divide-border-default border border-border-default">
            {build.runePath.map((rune) => (
              <div
                key={rune.runeName}
                className="flex items-start gap-3 bg-bg-panel p-3"
              >
                <span
                  className={`mt-0.5 shrink-0 px-2 py-0.5 text-[10px] font-semibold ${
                    rune.priority === "must"
                      ? "bg-accent-soft text-accent-bright"
                      : "bg-bg-surface text-text-muted"
                  }`}
                >
                  {rune.priority === "must"
                    ? isZh
                      ? "必选"
                      : isJa
                        ? "必須"
                        : "Must"
                    : isZh
                      ? "可选"
                      : isJa
                        ? "任意"
                        : "Opt"}
                </span>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {rune.runeName}
                  </p>
                  {rune.reason ? (
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {txt(locale, rune.reason)}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Farming Route */}
      {build.farmingRoute ? (
        <Section
          title={
            isZh ? "推荐刷图关卡" : isJa ? "推奨周回ステージ" : "Recommended Stage"
          }
        >
          <p className="text-sm text-text-secondary">
            {txt(locale, build.farmingRoute.reason)}
          </p>
        </Section>
      ) : null}

      {/* Related Builds */}
      {relatedBuilds && relatedBuilds.length > 0 ? (
        <CrossLinks
          locale={locale}
          title={isZh ? "相关 Build" : isJa ? "関連ビルド" : "Related Builds"}
          links={relatedBuilds.map((b) => ({
            href: `/builds/${b.slug}`,
            label: txt(locale, b.title),
            meta: `${b.phase} / ${b.goal}`,
          }))}
        />
      ) : null}

      {/* Other builds for same hero */}
      {buildsForHero(build.hero).length > 1 ? (
        <CrossLinks
          locale={locale}
          title={
            isZh
              ? `${heroLabel} 其他 Build`
              : isJa
                ? `${heroLabel} の他のビルド`
                : `Other ${heroLabel} Builds`
          }
          links={buildsForHero(build.hero)
            .filter((b) => b.slug !== build.slug)
            .map((b) => ({
              href: `/builds/${b.slug}`,
              label: txt(locale, b.title),
              meta: `${b.phase} / ${b.goal}`,
            }))}
        />
      ) : null}

      {/* Related links */}
      <Section
        title={isZh ? "相关链接" : isJa ? "関連リンク" : "Related Links"}
      >
        <div className="flex flex-wrap gap-2">
          <Link
            href={localizedPath(
              locale,
              `/heroes/${build.hero.toLowerCase()}`,
            )}
            className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
          >
            <ArrowRight className="mr-1 inline h-3.5 w-3.5" />
            {isZh ? "英雄详情" : isJa ? "ヒーロー詳細" : "Hero detail"}
          </Link>
          <Link
            href={localizedPath(locale, "/items")}
            className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
          >
            {isZh ? "物品数据库" : isJa ? "アイテムDB" : "Items"}
          </Link>
          <Link
            href={localizedPath(locale, "/runes")}
            className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
          >
            {isZh ? "符文树" : isJa ? "ルーンツリー" : "Rune Tree"}
          </Link>
          <Link
            href={localizedPath(locale, "/tools/farming-calculator")}
            className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
          >
            {isZh ? "刷图计算器" : isJa ? "周回計算機" : "Farming Calc"}
          </Link>
          <Link
            href={localizedPath(locale, "/market")}
            className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
          >
            {isZh ? "市场价格" : isJa ? "マーケット" : "Market"}
          </Link>
        </div>
      </Section>

      {/* FAQ */}
      <FaqBlock faqs={faqs} title={isZh ? "常见问题" : isJa ? "よくある質問" : "FAQ"} />
    </PageShell>
  );
}
