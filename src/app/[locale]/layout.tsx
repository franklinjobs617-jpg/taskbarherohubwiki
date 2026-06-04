import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { NavProvider } from "@/components/layout/nav-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { isLocale, SITE_URL } from "@/lib/game-data/data";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: {
      default: isZh
        ? "TaskBar Hero 中文 Wiki｜物品、掉率、Steam 市场价格"
        : "TaskBar Hero Wiki｜Items, Drop Rates & Steam Market Prices",
      template: "%s｜TaskBar Hero Wiki",
    },
    description: isZh
      ? "中文优先的 TaskBar Hero 数据库，覆盖物品、宝箱、关卡、效果、英雄、攻略和 Steam 市场价格。"
      : "A TaskBar Hero database for items, chests, stages, effects, heroes, guides, and Steam Market references.",
    metadataBase: new URL(SITE_URL),
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: "TaskBar Hero Wiki",
      locale: isZh ? "zh_CN" : "en_US",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "TaskBar Hero Wiki",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "TaskBar Hero 中文 Wiki｜物品、掉率、Steam 市场价格"
        : "TaskBar Hero Wiki｜Items, Drop Rates & Steam Market Prices",
      description: isZh
        ? "中文优先的 TaskBar Hero 数据库，覆盖物品、宝箱、关卡、效果、英雄、攻略和 Steam 市场价格。"
        : "A TaskBar Hero database for items, chests, stages, effects, heroes, guides, and Steam Market references.",
      images: ["/og-image.jpg"],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full bg-[#090909] text-[#d8d1c2] antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <NavProvider>{children}</NavProvider>
            <SiteFooter />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
