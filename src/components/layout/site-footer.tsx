"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DATA_VERSION, UPDATED_AT } from "@/lib/game-data/data";

const KNOWN = ["en", "zh", "ja"];

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
  const lpath = (path: string) => `/${locale}${path === "/" ? "" : path}`;
  const isZh = locale === "zh";

  return (
    <footer className="border-t border-[#27272a] bg-[#0a0a0a]">
      <div className="mx-auto max-w-[1440px] px-3 py-6">
        {/* Link columns */}
        <div className="grid gap-6 text-xs sm:grid-cols-4">
          <div>
            <p className="mb-2 font-semibold text-[#9d9d9d]">{isZh ? "数据库" : "Database"}</p>
            <div className="space-y-1.5">
              <Link href={lpath("/items")} className="block text-[#6c6c6c] hover:text-[#f0c040]">{isZh ? "物品" : "Items"}</Link>
              <Link href={lpath("/heroes")} className="block text-[#6c6c6c] hover:text-[#f0c040]">{isZh ? "英雄" : "Heroes"}</Link>
              <Link href={lpath("/monsters")} className="block text-[#6c6c6c] hover:text-[#f0c040]">{isZh ? "怪物" : "Monsters"}</Link>
              <Link href={lpath("/map")} className="block text-[#6c6c6c] hover:text-[#f0c040]">{isZh ? "地图" : "Map"}</Link>
            </div>
          </div>
          <div>
            <p className="mb-2 font-semibold text-[#9d9d9d]">{isZh ? "系统" : "Systems"}</p>
            <div className="space-y-1.5">
              <Link href={lpath("/runes")} className="block text-[#6c6c6c] hover:text-[#f0c040]">{isZh ? "符文" : "Runes"}</Link>
              <Link href={lpath("/cube")} className="block text-[#6c6c6c] hover:text-[#f0c040]">Cube</Link>
              <Link href={lpath("/buffs")} className="block text-[#6c6c6c] hover:text-[#f0c040]">{isZh ? "Buff" : "Buffs"}</Link>
              <Link href={lpath("/effects")} className="block text-[#6c6c6c] hover:text-[#f0c040]">{isZh ? "效果" : "Effects"}</Link>
            </div>
          </div>
          <div>
            <p className="mb-2 font-semibold text-[#9d9d9d]">{isZh ? "内容" : "Content"}</p>
            <div className="space-y-1.5">
              <Link href={lpath("/guides")} className="block text-[#6c6c6c] hover:text-[#f0c040]">{isZh ? "攻略" : "Guides"}</Link>
              <Link href={lpath("/builds")} className="block text-[#6c6c6c] hover:text-[#f0c040]">Builds</Link>
              <Link href={lpath("/guides/farming")} className="block text-[#6c6c6c] hover:text-[#f0c040]">{isZh ? "刷图指南" : "Farming Guide"}</Link>
              <Link href={lpath("/tools/farming-calculator")} className="block text-[#6c6c6c] hover:text-[#f0c040]">{isZh ? "计算器" : "Calculator"}</Link>
            </div>
          </div>
          <div>
            <p className="mb-2 font-semibold text-[#9d9d9d]">{isZh ? "市场" : "Market"}</p>
            <div className="space-y-1.5">
              <Link href={lpath("/market")} className="block text-[#6c6c6c] hover:text-[#f0c040]">{isZh ? "Steam 市场" : "Steam Market"}</Link>
              <Link href={lpath("/chests")} className="block text-[#6c6c6c] hover:text-[#f0c040]">{isZh ? "宝箱" : "Chests"}</Link>
              <Link href={lpath("/pets")} className="block text-[#6c6c6c] hover:text-[#f0c040]">{isZh ? "宠物" : "Pets"}</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#27272a] pt-4 text-[11px] text-[#555]">
          <p>
            {t.disclaimer}
            <span className="ml-2">{DATA_VERSION} / {UPDATED_AT}</span>
          </p>
          <div className="flex gap-4">
            <Link href={lpath("/privacy")} className="hover:text-[#f0c040]">{t.privacy}</Link>
            <Link href={lpath("/terms")} className="hover:text-[#f0c040]">{t.terms}</Link>
            <Link href={lpath("/contact")} className="hover:text-[#f0c040]">{t.contact}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
