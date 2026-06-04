"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const T: Record<string, { title: string; home: string }> = {
  zh: { title: "页面未找到", home: "返回首页" },
  en: { title: "Page Not Found", home: "Go Home" },
  ja: { title: "ページが見つかりません", home: "ホームに戻る" },
};

export default function NotFound() {
  const pathname = usePathname();
  const seg = pathname.split("/")[1];
  const locale = ["zh", "ja"].includes(seg) ? seg : "en";
  const t = T[locale] ?? T.en;
  const homeHref = locale === "en" ? "/" : `/${locale}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-4xl font-semibold text-[#d4a017] mb-4">404</h1>
      <p className="text-[#9d9d9d] text-lg mb-6">{t.title}</p>
      <Link href={homeHref}
        className="rounded-md bg-[#d4a017] px-5 py-2.5 text-sm font-medium text-black hover:bg-[#f0c040] transition-colors">
        {t.home}
      </Link>
    </div>
  );
}
