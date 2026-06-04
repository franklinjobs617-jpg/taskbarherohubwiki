import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, BookOpen, Boxes, Coins, Route, ShieldQuestion, Swords } from "lucide-react";
import { GuideCard, Section } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { guides, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

function copy(locale: Locale, zh: string, en: string, ja: string) {
  if (locale === "zh") return zh;
  if (locale === "ja") return ja;
  return en;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: copy(locale, "TaskBar Hero 攻略大全｜新手、职业、Cube 与 Steam 市场", "TaskBar Hero Guides", "TaskBar Hero 攻略｜初心者、職業、Cube、Steam 市場"),
    description: copy(
      locale,
      "按新手开局、职业选择、Cube 材料、Steam 市场、宝箱掉率、金币和经验路线组织的 TaskBar Hero 攻略。",
      "TaskBar Hero guides organized by beginner path, class choice, Cube materials, Steam Market, chest drops, gold, and EXP routes.",
      "初心者ルート、職業選択、Cube 素材、Steam 市場、宝箱、ゴールド、経験値ルートで整理した TaskBar Hero 攻略。",
    ),
    alternates: pageAlternates(locale, "/guides"),
  };
}

export default async function GuidesPage({ params }: Props) {
  const { locale } = await params;
  const guideHref = (category: string, slug: string) => `/${locale}/guides/${category}/${slug}`;
  const tasks = [
    {
      icon: ShieldQuestion,
      href: guideHref("beginner", "getting-started"),
      title: copy(locale, "我刚开始，先做什么？", "I just started. What first?", "始めたばかり。何から？"),
      body: copy(locale, "先建立关卡、装备、材料和市场风险的判断顺序。", "Build the first decision order for stages, gear, materials, and market risk.", "ステージ、装備、素材、市場リスクの判断順を作ります。"),
    },
    {
      icon: Swords,
      href: guideHref("beginner", "class-guide"),
      title: copy(locale, "我不玩游戏，职业怎么写？", "How do I write class advice?", "職業はどう選ぶ？"),
      body: copy(locale, "用武器、阶段、属性优先级和证据等级写，不靠亲测口吻。", "Use weapons, phase, stat priority, and evidence level instead of personal-play claims.", "武器、段階、優先ステータス、根拠レベルで判断します。"),
    },
    {
      icon: BarChart3,
      href: guideHref("economy", "steam-market-guide"),
      title: copy(locale, "市场价格怎么看？", "How should market data be read?", "市場価格はどう読む？"),
      body: copy(locale, "区分可交易、匹配、挂单、成交和供应风险。", "Separate tradable status, matching, listings, sales, and supply risk.", "取引可否、名称一致、出品、成約、供給リスクを分けます。"),
    },
    {
      icon: Boxes,
      href: guideHref("farming", "chest-drop-guide"),
      title: copy(locale, "宝箱掉率怎么用？", "How do chest drops work?", "宝箱ドロップはどう使う？"),
      body: copy(locale, "有真实映射才显示掉率；没有就标注数据不足。", "Show rates only with real mapping; otherwise label missing data.", "実マッピングがある時だけ率を表示し、不足時は不足と示します。"),
    },
  ];

  const categories = [
    { key: "beginner", label: copy(locale, "新手和职业", "Beginner and classes", "初心者と職業"), icon: BookOpen },
    { key: "cube", label: copy(locale, "Cube 和材料", "Cube and materials", "Cube と素材"), icon: Route },
    { key: "economy", label: copy(locale, "Steam 市场", "Steam Market", "Steam 市場"), icon: BarChart3 },
    { key: "farming", label: copy(locale, "刷钱和刷经验", "Gold and EXP farming", "ゴールドと経験値周回"), icon: Coins },
  ];

  return (
    <PageShell>
      <PageHeader
        kicker="Guides"
        title={copy(locale, "攻略中心", "Guide Center", "攻略センター")}
        description={copy(
          locale,
          "攻略不是随便写经验贴。每篇都要给出适用版本、证据等级、常见错误、FAQ、相关物品、相关市场入口和工具入口。",
          "Guides are decision documents. Each one includes version, evidence level, common mistakes, FAQ, related items, market links, and tools.",
          "各ガイドは判断用の記事です。適用バージョン、根拠レベル、よくあるミス、FAQ、関連アイテム、工具入口を含みます。",
        )}
      />

      <section className="grid gap-2 md:grid-cols-4">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <Link key={task.href} href={task.href} className="border border-[#27272a] bg-[#0d0d0d] p-4 hover:border-[#d4a017]">
              <Icon className="mb-3 h-4 w-4 text-[#d4a017]" />
              <p className="font-medium text-[#ffffff]">{task.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#9d9d9d]">{task.body}</p>
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
            <div className="mb-3 flex items-center gap-2 text-xs text-[#6c6c6c]">
              <Icon className="h-4 w-4 text-[#d4a017]" />
              <span>{copy(locale, "按任务阅读，不按页面顺序硬读。", "Read by task, not by page order.", "ページ順ではなく目的別に読む。")}</span>
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
