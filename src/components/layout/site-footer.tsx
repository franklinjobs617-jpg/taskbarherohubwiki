"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DATA_VERSION, UPDATED_AT } from "@/lib/game-data/data";

const KNOWN = ["zh", "ja"];

const T = {
  zh: {
    disclaimer: "非官方粉丝站。游戏内容归开发商所有。Steam 市场价格只作参考，不代表成交价，不保证收益。",
    privacy: "隐私政策",
    terms: "服务条款",
    contact: "联系我们",
  },
  en: {
    disclaimer: "Unofficial fan site. Game content belongs to the developer. Steam Market prices are for reference only — not sale prices, not profit guarantees.",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
  },
  ja: {
    disclaimer: "非公式ファンサイトです。ゲームコンテンツは開発元に帰属します。Steamマーケット価格は参考値であり、成約価格や利益を保証するものではありません。",
    privacy: "プライバシー",
    terms: "利用規約",
    contact: "お問い合わせ",
  },
} as const;

export function SiteFooter() {
  const pathname = usePathname();
  const seg = pathname.split("/")[1];
  const locale = KNOWN.includes(seg) ? seg : "en";
  const t = T[locale as keyof typeof T] ?? T.en;
  const lpath = (path: string) => locale === "en" ? path : `/${locale}${path}`;

  return (
    <footer className="border-t border-[#27272a] bg-[#0a0a0a]">
      <div className="mx-auto grid max-w-[1440px] gap-3 px-3 py-6 text-xs text-[#6c6c6c] md:grid-cols-[1fr_auto]">
        <p>
          {t.disclaimer}
          <span className="ml-2 text-[#6c6c6c]">{DATA_VERSION} / {UPDATED_AT}</span>
        </p>
        <div className="flex gap-4">
          <Link href={lpath("/privacy")} className="hover:text-[#f0c040]">{t.privacy}</Link>
          <Link href={lpath("/terms")} className="hover:text-[#f0c040]">{t.terms}</Link>
          <Link href={lpath("/contact")} className="hover:text-[#f0c040]">{t.contact}</Link>
        </div>
      </div>
    </footer>
  );
}
