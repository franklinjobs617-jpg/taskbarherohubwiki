import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import type { Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero Contact｜错误反馈与联系" : "TaskBar Hero Contact", alternates: pageAlternates(locale, "/contact") };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  return <PageShell><PageHeader kicker="Contact" title="Contact" description={isZh ? "错误反馈：把物品 slug、页面 URL、问题截图和期望修正一起发送。" : "For corrections, send item slug, page URL, screenshot, and expected fix."} /></PageShell>;
}
