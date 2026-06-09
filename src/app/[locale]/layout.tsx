import type { Metadata } from "next";
import Script from "next/script";
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
        ? "TBH: Task Bar Hero Wiki - 物品数据库、英雄配装、掉落查询与 Steam 市场"
        : "TBH: Task Bar Hero Wiki - Items, Builds, Drop Finder & Steam Market",
      template: "%s | TBH: Task Bar Hero Wiki",
    },
    description: isZh
      ? "完整的 TBH: Task Bar Hero Wiki。搜索物品、对比英雄、查询掉落位置、查看 Steam 市场价格，并规划刷图路线。"
      : "The complete TBH: Task Bar Hero wiki. Search items, compare hero classes, find drop locations, check Steam Market prices, and plan your farming route.",
    metadataBase: new URL(SITE_URL),
    robots: { index: true, follow: true },
    alternates: {
      canonical: locale === "en" ? "/" : `/${locale}`,
      languages: { en: "/", zh: "/zh", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: "TBH: Task Bar Hero Wiki",
      locale: isZh ? "zh_CN" : "en_US",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "TBH: Task Bar Hero Wiki",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "TBH: Task Bar Hero Wiki - 物品数据库、英雄配装、掉落查询与 Steam 市场"
        : "TBH: Task Bar Hero Wiki - Items, Builds, Drop Finder & Steam Market",
      description: isZh
        ? "搜索物品、对比英雄、查询掉落位置、查看 Steam 市场价格，并规划刷图路线。"
        : "Search items, compare heroes, find drops, check Steam Market prices, and plan farming routes.",
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
      <head>
        <link rel="llms" href="/llms.txt" />
        <meta name="llms:generated" content="2026-06-08" />
      </head>
      <body className="min-h-full bg-[#090909] text-[#d8d1c2] antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <NavProvider>{children}</NavProvider>
            <SiteFooter />
          </div>
        </NextIntlClientProvider>
        <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3383070348689557" crossOrigin="anonymous" strategy="afterInteractive" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-87KVJGHX8D" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-87KVJGHX8D');`}</Script>
      </body>
    </html>
  );
}
