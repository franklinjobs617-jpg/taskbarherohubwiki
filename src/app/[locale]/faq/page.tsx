import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import type { Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TaskBar Hero FAQ｜数据来源、市场价格、职业选择与收益计算" : "TaskBar Hero FAQ｜Data, Market, Classes and Profit",
    description: locale === "zh"
      ? "TaskBar Hero 最常见问题的解答：数据来源、市场状态、职业选择、宝箱掉率、收益计算、符文解锁、宠物条件和更多。"
      : "Answers to the most common TaskBar Hero questions: data sources, market status, class choice, chest drops, profit calculation, runes, pets, and more.",
    alternates: pageAlternates(locale, "/faq"),
  };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const rows: Array<[string, string]> = isZh
    ? [
        ["这是官网吗？", "不是。这是非官方粉丝站（TaskBar Hero Wiki），由社区维护，与游戏开发者无关。"],
        ["数据从哪里来？", "来自本地已取得的游戏 JSON 和图片，经过规范化处理后展示。不使用猜测或 AI 生成的数据。"],
        ["为什么某些物品没有价格？", "物品可能不可交易、尚未匹配到 Steam 市场名称，或还没有抓取到真实市场数据。只展示已验证的价格。"],
        ["收益计算准吗？", "金币和经验可以按关卡基础数据估算。市场收益必须同时具备真实掉率和真实价格，缺少任何一项都不输出收益数字。"],
        ["哪个职业最适合新手？", "骑士（Knight）。高生命、高防御和盾牌让容错率更高，适合先熟悉关卡压力、装备等级和材料系统。"],
        ["DLC 职业值得买吗？", "Hunter 和 Slayer 是 DLC 职业。建议先用基础职业熟悉游戏机制后再考虑。DLC 职业在所有页面都会明确标注。"],
        ["宝箱掉率为什么不显示？", "只有当 chest → item → dropRate 映射有真实数据时才会显示掉率。数据不足时只标注来源和等级范围。"],
        ["宠物怎么解锁？", "宠物通过击杀特定怪物解锁。每种宠物有对应的怪物目标、所需击杀数和推荐关卡。详见宠物页面。"],
        ["符文系统怎么用？", "符文提供被动属性加成，有多级升级路径。符文页面按类别分组展示，包含效果说明和升级消耗。"],
        ["如何判断物品该留还是卖？", "按以下顺序判断：是否当前职业可用 → 是否可交易且有真实市场价 → 是否可用于 Cube 制作 → 替换成本是否高。"],
        ["市场价格多久更新一次？", "市场数据通过 Cloudflare Worker 每 15 分钟检查一次匹配状态。真实价格在有数据源接入后才会显示。"],
        ["如何报告错误或建议？", "通过联系页面发送物品 slug、页面 URL、问题截图和期望的修正。不接受没有证据的修改请求。"],
      ]
    : [
        ["Is this official?", "No. This is an unofficial fan site (TaskBar Hero Wiki), maintained by the community, not affiliated with the game developer."],
        ["Where does the data come from?", "It comes from locally obtained game JSON and images, normalized for the site. No guessed or AI-generated data is used."],
        ["Why do some items have no price?", "The item may not be tradable, may not be matched to a Steam market name, or real market data has not been fetched. Only verified prices are shown."],
        ["Is profit calculation accurate?", "Gold and XP can use stage base data. Market profit needs both real drop rates and real prices; numbers are not shown when either is missing."],
        ["Which class is best for beginners?", "Knight. High HP, armor, and shield make it forgiving. Use it to learn stage pressure, gear levels, and material systems before trying other classes."],
        ["Are DLC classes worth buying?", "Hunter and Slayer are DLC classes. Learn the game with base classes first, then decide. DLC classes are clearly labeled on all pages."],
        ["Why are chest drop rates not shown?", "Drop rates are only shown when chest → item → dropRate mapping has real data. When incomplete, only source and level range are displayed — no fake rate tables."],
        ["How do pets unlock?", "Pets unlock by killing specific monsters. Each pet has a target monster, required kill count, and recommended stage. See the Pets page for details."],
        ["How do runes work?", "Runes provide passive stat bonuses with multi-level upgrade paths. The Runes page groups them by category with effect descriptions and upgrade costs."],
        ["How do I decide keep or sell?", "Check in this order: useful for current class → tradable with real market price → usable for Cube crafting → replacement cost is low."],
        ["How often does market data update?", "Market data match status is checked every 15 minutes via a Cloudflare Worker. Real price data is shown only when a data source is connected."],
        ["How do I report errors or suggest changes?", "Send the item slug, page URL, screenshot, and expected fix via the Contact page. Requests without evidence are not accepted."],
      ];

  return (
    <PageShell>
      <SeoJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: rows.map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />
      <PageHeader
        kicker="FAQ"
        title={isZh ? "常见问题" : "Frequently Asked Questions"}
        description={
          isZh
            ? "关于数据来源、市场价格、职业选择、宝箱掉率、收益计算、符文、宠物、DLC 和错误反馈的解答。"
            : "Answers about data sources, market prices, class choice, chest drops, profit calculation, runes, pets, DLC, and error reporting."
        }
      />
      <div className="space-y-3">
        {rows.map(([q, a]) => (
          <div key={q} className="border border-[#27272a] bg-[#0d0d0d] p-5">
            <h2 className="text-base font-semibold text-[#f0c040]">{q}</h2>
            <p className="mt-2 text-sm leading-7 text-[#bbb]">{a}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
