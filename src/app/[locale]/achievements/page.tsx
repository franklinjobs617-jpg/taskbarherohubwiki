import type { Metadata } from "next";
import Link from "next/link";
import { EyeOff, Shield, Swords, Target, TrendingUp, Trophy } from "lucide-react";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allAchievements, type Locale } from "@/lib/game-data/data";
import { localizedPath, localizedUrl } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";
import { itemList } from "@/lib/schema-ld";

type Props = { params: Promise<{ locale: Locale }> };

const CATEGORY_ICONS: Record<string, typeof Trophy> = {
  progression: TrendingUp,
  collection: Trophy,
  combat: Swords,
  farming: Target,
  challenge: Shield,
};

const CATEGORY_LABELS: Record<string, Partial<Record<Locale, string>>> = {
  progression: { en: "Progression", zh: "进度", ja: "進行", ko: "진행" },
  collection: { en: "Collection", zh: "收集", ja: "収集", ko: "수집" },
  combat: { en: "Combat", zh: "战斗", ja: "戦闘", ko: "전투" },
  farming: { en: "Farming", zh: "刷图", ja: "周回", ko: "파밍" },
  challenge: { en: "Challenge", zh: "挑战", ja: "挑戦", ko: "도전" },
};

function txt(locale: Locale, values: Record<string, string>) {
  return values[locale] ?? values.en ?? "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "zh"
        ? "TBH 成就列表 | 全成就、隐藏成就与解锁条件"
        : locale === "ja"
          ? "TBH 実績一覧 | 全実績、隠し実績と解除条件"
          : "TBH Achievements | Full List, Hidden & Unlock Conditions",
    description:
      locale === "zh"
        ? `追踪 ${allAchievements().length}+ TBH 成就。包含进度、收集、战斗、刷图和挑战类成就，附解锁条件和奖励说明。`
        : `Track ${allAchievements().length}+ TBH achievements across progression, collection, combat, farming, and challenge categories.`,
    alternates: pageAlternates(locale, "/achievements"),
  };
}

export default async function AchievementsPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const isJa = locale === "ja";
  const all = allAchievements();
  const categories = [...new Set(all.map((a) => a.category))];

  const jsonLd = itemList(
    all.map((a, i) => ({
      name: txt(locale, a.name),
      url: localizedUrl(locale, `/achievements/${a.slug}`),
      position: i + 1,
    })),
  );

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        kicker="Achievements"
        title={isZh ? "成就列表" : isJa ? "実績一覧" : "Achievements"}
        description={
          isZh
            ? `${all.length} 个成就，包含进度、收集、战斗、刷图和挑战类型。隐藏成就用 👁️‍🗨️ 标记。`
            : isJa
              ? `${all.length}個の実績。進行、収集、戦闘、周回、挑戦タイプ。隠し実績は👁️‍🗨️で表示。`
              : `${all.length} achievements across progression, collection, combat, farming, and challenge. Hidden achievements marked with 👁️‍🗨️.`
        }
      />

      {categories.map((cat) => {
        const Icon = CATEGORY_ICONS[cat] ?? Trophy;
        const items = all.filter((a) => a.category === cat);
        return (
          <section key={cat} className="mt-8 first:mt-0">
            <div className="mb-3 flex items-center gap-2">
              <Icon className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">
                {txt(locale, CATEGORY_LABELS[cat] ?? { en: cat })}
              </h2>
              <span className="text-xs text-text-muted">({items.length})</span>
            </div>
            <div className="divide-y divide-border-default border border-border-default">
              {items.map((a) => (
                <Link
                  key={a.slug}
                  href={localizedPath(locale, `/achievements/${a.slug}`)}
                  className="flex items-start gap-3 bg-bg-panel p-3 transition hover:bg-bg-surface"
                >
                  <div className="mt-0.5 shrink-0">
                    {a.hidden ? (
                      <EyeOff className="h-5 w-5 text-text-muted" />
                    ) : (
                      <Trophy className="h-5 w-5 text-accent-bright" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {a.hidden
                        ? isZh
                          ? "???（隐藏成就）"
                          : isJa
                            ? "???（隠し実績）"
                            : "??? (Hidden)"
                        : txt(locale, a.name)}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {a.hidden
                        ? isZh
                          ? "此成就的描述在解锁前隐藏"
                          : isJa
                            ? "この実績の説明は解除前に非表示です"
                            : "Description hidden until unlocked"
                        : txt(locale, a.description)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </PageShell>
  );
}
