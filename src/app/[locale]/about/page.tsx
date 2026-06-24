import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import type { Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "关于 TaskBar Hero 中文 Wiki" : "About TaskBar Hero Wiki", alternates: pageAlternates(locale, "/about") };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  return (
    <PageShell>
      <PageHeader kicker="About" title={isZh ? "关于本站" : "About"} description={isZh ? "非官方粉丝站，目标是中文优先 database + Steam market + 决策工具。" : "Unofficial fan site focused on database, market, and decision tools."} />
      <div className="space-y-3 border border-border-default bg-bg-panel p-5 text-sm leading-7 text-text-secondary">
        <p>{isZh ? "本站不是官网。游戏内容、名称和素材归开发商所有。" : "This is not the official site. Game content, names, and assets belong to their owners."}</p>
        <p>{isZh ? "数据来自已取得的 JSON 和图片，并经过本地规范化。市场价格只作参考。" : "Data comes from obtained JSON and assets, normalized locally. Market prices are references."}</p>
        <p>{isZh ? "本站不保证收益，不提供投资建议，不承诺任何物品一定能卖出。" : "No profit guarantee, no financial advice, no promise that any item will sell."}</p>
        <p className="mt-4 border-t border-border-default pt-4">{isZh ? "🌐 TBH Wiki 生态：本站和 taskbarhero.wiki、taskbarherowiki.com 等都是社区驱动的 TBH 数据站。我们之所以选择用中文做 datamined 数据，是为了给用户可以直接核对来源的数据库——你能在页面上看到底层数据版本和时间，自己判断信息是否可靠。" : "🌐 TBH Wiki ecosystem: This site, taskbarhero.wiki, taskbarherowiki.com, and others are all community-run TBH data sites. We chose datamined data with Chinese support so you can independently verify every number — every page shows the data version and timestamp right on the page, so you know exactly what you're working with."}</p>
      </div>
    </PageShell>
  );
}
