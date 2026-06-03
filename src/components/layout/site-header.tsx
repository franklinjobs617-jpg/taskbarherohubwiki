"use client";

import { BarChart3, BookOpen, Boxes, Database, Home, Map, Search, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleSwitcher } from "./locale-switcher";

export function SiteHeader() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] === "en" ? "en" : "zh";
  const nav = [
    { href: `/${locale}/items`, label: locale === "zh" ? "物品" : "Items", icon: Database },
    { href: `/${locale}/market`, label: locale === "zh" ? "市场" : "Market", icon: BarChart3 },
    { href: `/${locale}/chests`, label: locale === "zh" ? "宝箱" : "Chests", icon: Boxes },
    { href: `/${locale}/effects`, label: locale === "zh" ? "效果" : "Effects", icon: Search },
    { href: `/${locale}/map`, label: locale === "zh" ? "地图" : "Map", icon: Map },
    { href: `/${locale}/guides`, label: locale === "zh" ? "攻略" : "Guides", icon: BookOpen },
    { href: `/${locale}/tools/profit-calculator`, label: locale === "zh" ? "工具" : "Tools", icon: Wrench },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#242424] bg-[#080808]/95 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-[1440px] items-center gap-3 px-3">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-semibold text-[#f0c040]">
          <Home className="h-4 w-4" />
          <span className="text-sm tracking-wide">TBH Wiki</span>
        </Link>
        <nav className="hidden h-full items-center md:flex">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-full items-center gap-1.5 border-b-2 px-3 text-xs transition ${
                  active
                    ? "border-[#d4a017] bg-[#151515] text-[#f0c040]"
                    : "border-transparent text-[#8c8577] hover:bg-[#111] hover:text-[#ddd]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action={`/${locale}/items`} className="ml-auto hidden w-64 items-center border border-[#2b2b2b] bg-[#101010] px-2 md:flex">
          <Search className="h-3.5 w-3.5 text-[#666]" />
          <input
            name="q"
            placeholder={locale === "zh" ? "搜索物品、材料、宝箱" : "Search items, materials, chests"}
            className="h-8 w-full bg-transparent px-2 text-xs text-[#ddd] outline-none placeholder:text-[#555]"
          />
        </form>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
