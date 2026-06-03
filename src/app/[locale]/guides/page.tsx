import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, BookOpen, Boxes, Coins, Route, ShieldQuestion, Swords } from "lucide-react";
import { GuideCard, Section } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { guides, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TaskBar Hero 攻略大全｜新手、职业、Cube 与 Steam 市场" : "TaskBar Hero Guides",
    description:
      locale === "zh"
        ? "按新手开局、职业选择、Cube 材料、Steam 市场、宝箱掉率、金币和经验路线组织的 TaskBar Hero 双语攻略。"
        : "TaskBar Hero bilingual guides organized by beginner path, class choice, Cube materials, Steam Market, chest drops, gold, and EXP routes.",
    alternates: pageAlternates(locale, "/guides"),
  };
}

export default async function GuidesPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const guideHref = (category: string, slug: string) => `/${locale}/guides/${category}/${slug}`;
  const tasks = [
    {
      icon: ShieldQuestion,
      href: guideHref("beginner", "getting-started"),
      title: isZh ? "我刚开始，先做什么？" : "I just started. What first?",
      body: isZh ? "先建立关卡、装备、材料和市场风险的判断顺序。" : "Build the first decision order for stages, gear, materials, and market risk.",
    },
    {
      icon: Swords,
      href: guideHref("beginner", "class-guide"),
      title: isZh ? "我不玩游戏，职业怎么写？" : "How do I write class advice?",
      body: isZh ? "用武器、阶段、属性优先级和证据等级写，不靠亲测口吻。" : "Use weapons, phase, stat priority, and evidence level instead of personal-play claims.",
    },
    {
      icon: BarChart3,
      href: guideHref("economy", "steam-market-guide"),
      title: isZh ? "市场价格怎么看？" : "How should market data be read?",
      body: isZh ? "区分可交易、匹配、挂单、成交和供应风险。" : "Separate tradable status, matching, listings, sales, and supply risk.",
    },
    {
      icon: Boxes,
      href: guideHref("farming", "chest-drop-guide"),
      title: isZh ? "宝箱掉率怎么用？" : "How do chest drops work?",
      body: isZh ? "有真实映射才显示掉率；没有就标注数据不足。" : "Show rates only with real mapping; otherwise label missing data.",
    },
  ];

  const categories = [
    { key: "beginner", label: isZh ? "新手和职业" : "Beginner and classes", icon: BookOpen },
    { key: "cube", label: isZh ? "Cube 和材料" : "Cube and materials", icon: Route },
    { key: "economy", label: isZh ? "Steam 市场" : "Steam Market", icon: BarChart3 },
    { key: "farming", label: isZh ? "刷钱和刷经验" : "Gold and EXP farming", icon: Coins },
  ];

  return (
    <PageShell>
      <PageHeader
        kicker="Guides"
        title={isZh ? "攻略中心" : "Guide Center"}
        description={
          isZh
            ? "攻略不是随便写经验贴。每篇都要给出适用版本、证据等级、常见错误、FAQ、相关物品、相关市场入口和工具入口。"
            : "Guides are decision documents. Each one includes version, evidence level, common mistakes, FAQ, related items, market links, and tools."
        }
      />

      <section className="grid gap-2 md:grid-cols-4">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <Link key={task.href} href={task.href} className="border border-[#252525] bg-[#101010] p-4 hover:border-[#d4a017]">
              <Icon className="mb-3 h-4 w-4 text-[#d4a017]" />
              <p className="font-medium text-[#ddd]">{task.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#888]">{task.body}</p>
            </Link>
          );
        })}
      </section>

      {categories.map((category) => {
        const Icon = category.icon;
        const rows = guides.filter((guide) => guide.category === category.key);
        if (!rows.length) return null;
        return (
          <Section key={category.key} title={category.label} eyebrow={category.key}>
            <div className="mb-3 flex items-center gap-2 text-xs text-[#777]">
              <Icon className="h-4 w-4 text-[#d4a017]" />
              <span>{isZh ? "按任务阅读，不按页面顺序硬读。" : "Read by task, not by page order."}</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {rows.map((guide) => (
                <GuideCard
                  key={guide.slug}
                  href={`/${locale}/guides/${guide.category}/${guide.slug}`}
                  title={guide.title[locale]}
                  description={guide.description[locale]}
                  evidence={guide.evidence}
                />
              ))}
            </div>
          </Section>
        );
      })}
    </PageShell>
  );
}
