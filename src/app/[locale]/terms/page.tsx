import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import type { Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero Terms｜免责声明与市场风险" : "TaskBar Hero Terms", alternates: pageAlternates(locale, "/terms") };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  return <PageShell><PageHeader kicker="Terms" title="Terms" description={isZh ? "市场数据有延迟和误差。本站不保证收益，不对交易损失负责。" : "Market data may lag or be wrong. No profit guarantee and no liability for trading loss."} /></PageShell>;
}
