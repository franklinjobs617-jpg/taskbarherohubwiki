import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Coins, Shield, Swords, TrendingUp, Zap } from "lucide-react";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { wikiArticles, type Locale } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

const CATEGORY_ICONS: Record<string, typeof BookOpen> = {
  mechanics: Zap,
  economy: Coins,
  combat: Swords,
  progression: TrendingUp,
  stages: Shield,
};

const CATEGORY_LABELS: Record<string, Partial<Record<Locale, string>>> = {
  mechanics: { en: "Mechanics", zh: "机制", ja: "メカニクス", ko: "메커니즘" },
  economy: { en: "Economy", zh: "经济", ja: "経済", ko: "경제" },
  combat: { en: "Combat", zh: "战斗", ja: "戦闘", ko: "전투" },
  progression: { en: "Progression", zh: "进阶", ja: "進行", ko: "진행" },
  stages: { en: "Stages", zh: "关卡", ja: "ステージ", ko: "스테이지" },
};

function txt(locale: Locale, values: Record<string, string>) {
  return values[locale] ?? values.en ?? "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "zh"
        ? "TBH Wiki | 机制、系统与职业百科"
        : locale === "ja"
          ? "TBH Wiki | メカニクス・システム・クラス百科"
          : "TBH Wiki | Mechanics, Systems & Classes",
    description:
      locale === "zh"
        ? "全面了解 TBH: Task Bar Hero 的所有游戏机制、系统规则、伤害类型、符文树、Cube 系统和难度缩放。"
        : locale === "ja"
          ? "TBH: Task Bar Heroの全ゲームメカニクス、システムルール、ダメージタイプ、ルーンツリー、Cubeシステム、難易度スケーリングを解説。"
          : "Learn every game mechanic, system rule, damage type, rune tree, cube system, and difficulty scaling in TBH: Task Bar Hero.",
    alternates: pageAlternates(locale, "/wiki"),
  };
}

export default async function WikiHubPage({ params }: Props) {
  const { locale } = await params;

  const categories = [...new Set(wikiArticles.map((a) => a.category))];

  return (
    <PageShell>
      <PageHeader
        kicker="Wiki"
        title={txt(locale, { en: "Wiki Hub", zh: "百科中心", ja: "Wiki", ko: "위키" })}
        description={
          locale === "zh"
            ? "深入了解 TBH 的所有游戏机制。从伤害类型到符文树，从 Cube 系统到难度缩放——每个系统都有完整的规则和数值说明。"
            : locale === "ja"
              ? "TBHの全ゲームメカニクスを深く理解。ダメージタイプからルーンツリー、Cubeシステムから難易度スケーリングまで、各システムの完全なルールと数値解説。"
              : "Deep dive into every TBH game mechanic. From damage types to rune trees, from the cube system to difficulty scaling — every system explained with rules and numbers."
        }
      />

      {categories.map((cat) => {
        const Icon = CATEGORY_ICONS[cat] ?? BookOpen;
        const articles = wikiArticles.filter((a) => a.category === cat);
        return (
          <section key={cat} className="mt-8 first:mt-0">
            <div className="mb-3 flex items-center gap-2">
              <Icon className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">
                {txt(locale, CATEGORY_LABELS[cat] ?? { en: cat })}
              </h2>
              <span className="text-xs text-text-muted">({articles.length})</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={localizedPath(locale, `/wiki/${article.slug}`)}
                  className="group block border border-border-default bg-bg-panel p-4 transition hover:border-accent hover:bg-bg-surface"
                >
                  <h3 className="text-sm font-semibold text-text-primary transition-colors group-hover:text-accent-bright">
                    {txt(locale, article.title)}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                    {txt(locale, article.description)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <div className="mt-8 border border-border-default bg-bg-panel p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          {txt(locale, { en: "About the Wiki", zh: "关于百科", ja: "Wikiについて", ko: "위키 정보" })}
        </p>
        <p className="mt-2 text-sm leading-7 text-text-secondary">
          {locale === "zh"
            ? "百科文章基于数据挖掘的游戏数据和社区验证的经验编写。证据等级标注了每篇文章的可靠程度。如发现错误，请通过 Discord 或 Contact 页面反馈。"
            : locale === "ja"
              ? "Wikiの記事はデータ抽出されたゲームデータとコミュニティ検証済みの経験に基づいています。証拠レベルが各記事の信頼性を示します。誤りを見つけた場合はDiscordまたはお問い合わせページからご報告ください。"
              : "Wiki articles are based on datamined game data and community-verified experience. Evidence levels indicate the reliability of each article. If you spot an error, please report it via Discord or the Contact page."
          }
        </p>
      </div>
    </PageShell>
  );
}
