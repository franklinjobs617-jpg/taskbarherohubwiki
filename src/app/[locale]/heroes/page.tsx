import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Shield, Swords, Timer } from "lucide-react";
import { HeroCard, Section } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allHeroes, heroName, heroSlug, type Locale } from "@/lib/game-data/data";
import { heroProfile, heroWeaponLabel } from "@/lib/hero-content";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TaskBar Hero 英雄资料｜职业、技能与被动树" : "TaskBar Hero Heroes, Skills and Passive Trees",
    description:
      locale === "zh"
        ? "查看 TaskBar Hero 6 个英雄的定位、武器、基础属性、技能树方向、推荐阶段和职业选择建议。"
        : "Compare all TaskBar Hero heroes by role, weapons, base stats, skill-tree direction, recommended phase, and class-selection notes.",
    alternates: pageAlternates(locale, "/heroes"),
  };
}

export default async function HeroesPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const heroes = allHeroes();
  const firstHero = heroes[0];

  const decisionCards = [
    {
      icon: Shield,
      title: isZh ? "先选稳的" : "Start safe",
      body: isZh ? "不熟悉游戏时，先用骑士这种高容错职业判断关卡压力和装备等级。" : "If you are new, use a forgiving class such as Knight to judge stage pressure and gear level.",
    },
    {
      icon: Timer,
      title: isZh ? "再比效率" : "Then compare speed",
      body: isZh ? "刷图目标看每轮时间、金币、经验和宝箱来源，不只看面板伤害。" : "Farming decisions need clear time, gold, XP, and chest source context, not only damage stats.",
    },
    {
      icon: Swords,
      title: isZh ? "DLC 单独看" : "Treat DLC separately",
      body: isZh ? "Hunter、Slayer 这类 DLC 职业必须明确标注，不该被写成默认新手路线。" : "DLC classes such as Hunter and Slayer need explicit labels and should not be default beginner routes.",
    },
  ];

  return (
    <PageShell>
      <PageHeader
        kicker="Heroes"
        title={isZh ? "英雄资料与职业选择" : "Heroes and Class Decisions"}
        description={
          isZh
            ? "这里不是只列英雄名。每个英雄都要回答：适合什么阶段、用什么武器、优先什么属性、风险在哪里、下一步该看哪个 Build 或攻略。"
            : "This page is not just a roster. Each hero answers phase fit, weapon direction, stat priority, risk, and the next build or guide to read."
        }
      />

      <section className="grid gap-4 border border-[#27272a] bg-[#0d0d0d] p-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#d4a017]">{isZh ? "快速结论" : "Quick verdict"}</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#f1e8d5]">
            {isZh ? "先用英雄决定路线，再用物品和宝箱验证路线" : "Choose a route with heroes, then verify it with items and chests"}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9d9d9d]">
            {isZh
              ? "每个英雄都标注了定位、武器路径、属性优先级、适合阶段和上手难度。选职业前先看这里，再配合 Build 页面和职业选择指南做最终决定。"
              : "Each hero is labeled with role, weapon path, stat priority, best phase, and difficulty. Start here before checking build pages and the class guide."}
          </p>
          {firstHero ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="border border-[#2c2c2c] bg-[#0a0a0a] p-3">
                <p className="text-xs text-[#6c6c6c]">{isZh ? "新手基准" : "Beginner baseline"}</p>
                <p className="mt-1 text-lg font-semibold text-[#ffffff]">{heroName(firstHero, locale)}</p>
              </div>
              <div className="border border-[#2c2c2c] bg-[#0a0a0a] p-3">
                <p className="text-xs text-[#6c6c6c]">{isZh ? "可分析英雄" : "Playable heroes"}</p>
                <p className="mt-1 text-lg font-semibold text-[#ffffff]">{heroes.length}</p>
              </div>
              <div className="border border-[#2c2c2c] bg-[#0a0a0a] p-3">
                <p className="text-xs text-[#6c6c6c]">{isZh ? "下一步" : "Next step"}</p>
                <Link href={`/${locale}/guides/beginner/class-guide`} className="mt-1 inline-flex items-center gap-1 text-sm text-[#f0c040]">
                  {isZh ? "职业选择指南" : "Class guide"} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
        <div className="grid gap-2">
          {decisionCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="flex gap-3 border border-[#2c2c2c] bg-[#0a0a0a] p-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#d4a017]" />
                <div>
                  <p className="text-sm font-medium text-[#ffffff]">{card.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#9d9d9d]">{card.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {heroes.map((hero) => <HeroCard key={hero.HeroKey} hero={hero} locale={locale} />)}
      </div>

      <Section title={isZh ? "各个职业怎么比较？" : "How do the classes compare?"} eyebrow={isZh ? "决策表" : "Decision table"}>
        <div className="overflow-x-auto border border-[#27272a]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#151515] text-xs text-[#6c6c6c]">
              <tr>
                <th className="px-3 py-2">{isZh ? "英雄" : "Hero"}</th>
                <th className="px-3 py-2">{isZh ? "定位" : "Role"}</th>
                <th className="px-3 py-2">{isZh ? "武器" : "Weapons"}</th>
                <th className="px-3 py-2">{isZh ? "适合阶段" : "Best phase"}</th>
                <th className="px-3 py-2">{isZh ? "优先属性" : "Priority stats"}</th>
                <th className="px-3 py-2">{isZh ? "详情" : "Detail"}</th>
              </tr>
            </thead>
            <tbody>
              {heroes.map((hero) => {
                const profile = heroProfile(hero, locale);
                const slug = heroSlug(hero);
                return (
                  <tr key={hero.HeroKey} className="border-t border-[#27272a]">
                    <td className="px-3 py-3 font-medium text-[#ffffff]">{heroName(hero, locale)}</td>
                    <td className="px-3 py-3 text-[#9d9d9d]">{profile.role}</td>
                    <td className="px-3 py-3 text-[#9d9d9d]">{heroWeaponLabel(hero, locale)}</td>
                    <td className="px-3 py-3 text-[#9d9d9d]">{profile.phase}</td>
                    <td className="px-3 py-3 text-[#9d9d9d]">{profile.statPriority.join(" / ")}</td>
                    <td className="px-3 py-3">
                      <Link href={`/${locale}/heroes/${slug}`} className="inline-flex items-center gap-1 text-[#f0c040] hover:text-[#ffd76a]">
                        {isZh ? "打开" : "Open"} <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={isZh ? "选好英雄后还要看什么？" : "What should I check after picking a hero?"} eyebrow="Journey">
        <div className="grid gap-2 md:grid-cols-3">
          <Link href={`/${locale}/skills`} className="border border-[#27272a] bg-[#0d0d0d] p-4 hover:border-[#d4a017]">
            <BookOpen className="mb-3 h-4 w-4 text-[#d4a017]" />
            <p className="font-medium text-[#ffffff]">{isZh ? "查主动/被动技能" : "Check active and passive skills"}</p>
            <p className="mt-2 text-sm leading-6 text-[#9d9d9d]">{isZh ? "确认技能类型、伤害关键词和节点方向。" : "Verify skill type, damage keywords, and node direction."}</p>
          </Link>
          <Link href={`/${locale}/effects`} className="border border-[#27272a] bg-[#0d0d0d] p-4 hover:border-[#d4a017]">
            <Shield className="mb-3 h-4 w-4 text-[#d4a017]" />
            <p className="font-medium text-[#ffffff]">{isZh ? "匹配材料效果" : "Match material effects"}</p>
            <p className="mt-2 text-sm leading-6 text-[#9d9d9d]">{isZh ? "把职业优先属性映射到 Decoration、Engraving、Inscription。" : "Map class stat priority to Decoration, Engraving, and Inscription effects."}</p>
          </Link>
          <Link href={`/${locale}/builds`} className="border border-[#27272a] bg-[#0d0d0d] p-4 hover:border-[#d4a017]">
            <Swords className="mb-3 h-4 w-4 text-[#d4a017]" />
            <p className="font-medium text-[#ffffff]">{isZh ? "看证据等级 Build" : "Read evidence-labeled builds"}</p>
            <p className="mt-2 text-sm leading-6 text-[#9d9d9d]">{isZh ? "只写推荐路线和社区参考，不写没有证据的最强结论。" : "Use recommended routes and community references, not unsupported best claims."}</p>
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
