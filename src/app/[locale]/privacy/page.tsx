import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import type { Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero Privacy｜隐私与数据使用" : "TaskBar Hero Privacy", alternates: pageAlternates(locale, "/privacy") };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  return (
    <PageShell>
      <PageHeader
        kicker="Privacy"
        title="Privacy"
        description={isZh ? "本站不提供账号系统。基础访问日志、性能分析和必要 Cookie 只用于安全、统计和站点改进。" : "This site does not provide an account system. Basic logs, analytics, and necessary cookies are used only for security, measurement, and site improvement."}
      />
      <div className="space-y-3 border border-[#252525] bg-[#101010] p-5 text-sm leading-7 text-[#aaa]">
        <p>{isZh ? "本站不会要求你输入 Steam 密码、交易链接或支付信息。" : "This site never asks for your Steam password, trade link, or payment information."}</p>
        <p>{isZh ? "如果部署 analytics，应只记录匿名访问数据，例如页面访问、设备类型和加载性能。" : "If analytics are deployed, only anonymous page views, device type, and performance data should be collected."}</p>
      </div>
    </PageShell>
  );
}
