"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

const T: Record<string, { title: string; desc: string; home: string; search: string; popular: string }> = {
  zh: { title: "页面未找到", desc: "你访问的页面不存在。试试搜索或浏览热门页面。", home: "返回首页", search: "搜索物品...", popular: "热门页面" },
  en: { title: "Page Not Found", desc: "The page you're looking for doesn't exist. Try searching or browse popular pages.", home: "Go Home", search: "Search items...", popular: "Popular Pages" },
  ja: { title: "ページが見つかりません", desc: "お探しのページは存在しません。検索するか人気ページを見てください。", home: "ホームに戻る", search: "アイテムを検索...", popular: "人気ページ" },
  ko: { title: "페이지를 찾을 수 없습니다", desc: "찾으시는 페이지가 존재하지 않습니다. 검색하거나 인기 페이지를 둘러보세요.", home: "홈으로", search: "아이템 검색...", popular: "인기 페이지" },
};

export default function NotFound() {
  const pathname = usePathname();
  const seg = pathname.split("/")[1];
  const locale = ["en", "zh", "ja", "ko"].includes(seg) ? seg : "en";
  const t = T[locale] ?? T.en;
  const homeHref = locale === "en" ? "/" : `/${locale}`;
  const lpath = (path: string) => locale === "en" ? path : `/${locale}${path}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-4xl font-semibold text-accent mb-4">404</h1>
      <p className="text-text-secondary text-lg mb-2">{t.title}</p>
      <p className="text-text-muted text-sm mb-8">{t.desc}</p>

      <form action={lpath("/items")} className="mb-8 flex w-full max-w-md border border-border-strong bg-bg-panel">
        <Search className="ml-3 h-4 w-4 shrink-0 self-center text-text-muted" />
        <input name="q" placeholder={t.search} className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-text-muted" />
        <button className="bg-[#d4a017] px-4 text-sm font-medium text-black hover:bg-accent-bright transition-colors">Search</button>
      </form>

      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">{t.popular}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href={lpath("/items")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Items <span className="text-text-muted">5,944</span></Link>
        <Link href={lpath("/heroes")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Heroes <span className="text-text-muted">6</span></Link>
        <Link href={lpath("/map")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Map <span className="text-text-muted">120</span></Link>
        <Link href={lpath("/monsters")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Monsters <span className="text-text-muted">61</span></Link>
        <Link href={lpath("/runes")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Runes <span className="text-text-muted">197</span></Link>
        <Link href={lpath("/chests")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Chests <span className="text-text-muted">59</span></Link>
        <Link href={lpath("/market")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Market</Link>
        <Link href={lpath("/tools/drop-finder")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Drop Finder</Link>
        <Link href={lpath("/guides/farming")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Farming Guide</Link>
        <Link href={lpath("/tools/farming-calculator")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Calculator</Link>
        <Link href={lpath("/guides/beginner/getting-started")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Beginner Guide</Link>
      </div>

      <Link href={homeHref} className="mt-8 rounded-md bg-[#d4a017] px-5 py-2.5 text-sm font-medium text-black hover:bg-accent-bright transition-colors">
        {t.home}
      </Link>
    </div>
  );
}
