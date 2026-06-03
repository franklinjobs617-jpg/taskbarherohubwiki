import Link from "next/link";
import { DATA_VERSION, UPDATED_AT } from "@/lib/game-data/data";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#242424] bg-[#080808]">
      <div className="mx-auto grid max-w-[1440px] gap-3 px-3 py-6 text-xs text-[#777] md:grid-cols-[1fr_auto]">
        <p>
          非官方粉丝站。游戏内容归开发商所有。Steam 市场价格只作参考，不代表成交价，不保证收益。
          <span className="ml-2 text-[#555]">
            {DATA_VERSION} / {UPDATED_AT}
          </span>
        </p>
        <div className="flex gap-4">
          <Link href="/zh/privacy" className="hover:text-[#f0c040]">Privacy</Link>
          <Link href="/zh/terms" className="hover:text-[#f0c040]">Terms</Link>
          <Link href="/zh/contact" className="hover:text-[#f0c040]">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
