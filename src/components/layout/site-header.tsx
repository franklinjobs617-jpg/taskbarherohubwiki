"use client";

import { BarChart3, BookOpen, Boxes, Database, Map, Menu, Search, Shield, Swords, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { useNav } from "./nav-provider";

const NAV_ITEMS = [
  { href: "/items", icon: Database, zh: "物品", en: "Items" },
  { href: "/heroes", icon: Swords, zh: "英雄", en: "Heroes" },
  { href: "/market", icon: BarChart3, zh: "市场", en: "Market" },
  { href: "/chests", icon: Boxes, zh: "宝箱", en: "Chests" },
  { href: "/runes", icon: Shield, zh: "符文", en: "Runes" },
  { href: "/pets", icon: BookOpen, zh: "宠物", en: "Pets" },
  { href: "/effects", icon: Search, zh: "效果", en: "Effects" },
  { href: "/map", icon: Map, zh: "地图", en: "Map" },
  { href: "/guides", icon: BookOpen, zh: "攻略", en: "Guides" },
  { href: "/builds", icon: Swords, zh: "Build", en: "Builds" },
  { href: "/tools/profit-calculator", icon: Shield, zh: "工具", en: "Tools" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] === "en" ? "en" : "zh";
  const { menuOpen, toggleMenu, closeMenu } = useNav();

  return (
    <header className="sticky top-0 z-50 border-b border-[#27272a] bg-[#0a0a0a]/95 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-[1440px] items-center gap-1 px-3">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2 font-semibold text-[#f0c040]">
          <span className="text-sm tracking-wide">TBH Wiki</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden h-full items-center lg:flex">
          {NAV_ITEMS.slice(0, 8).map((item) => {
            const Icon = item.icon;
            const href = `/${locale}${item.href}`;
            const active = pathname.startsWith(href);
            return (
              <Link
                key={item.href}
                href={href}
                className={`flex h-full items-center gap-1.5 border-b-2 px-2.5 text-xs transition ${
                  active
                    ? "border-[#d4a017] bg-[#151515] text-[#f0c040]"
                    : "border-transparent text-[#8c8577] hover:bg-[#111] hover:text-[#ffffff]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {locale === "zh" ? item.zh : item.en}
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <form action={`/${locale}/items`} className="ml-auto hidden w-48 items-center border border-[#2b2b2b] bg-[#0d0d0d] px-2 lg:flex xl:w-64">
          <Search className="h-3.5 w-3.5 shrink-0 text-[#666]" />
          <input
            name="q"
            placeholder={locale === "zh" ? "搜索物品..." : "Search items..."}
            className="h-8 w-full bg-transparent px-2 text-xs text-[#ffffff] outline-none placeholder:text-[#555]"
          />
        </form>

        <LocaleSwitcher />

        {/* Hamburger */}
        <button
          onClick={toggleMenu}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#2b2b2b] text-[#9d9d9d] hover:border-[#d4a017] lg:hidden"
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 top-12 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={closeMenu} />
          <nav className="absolute right-0 top-0 h-full w-64 overflow-y-auto border-l border-[#27272a] bg-[#0d0d0d] p-4">
            <form action={`/${locale}/items`} className="mb-4 flex items-center border border-[#2b2b2b] bg-[#0d0d0d] px-2">
              <Search className="h-3.5 w-3.5 text-[#666]" />
              <input
                name="q"
                placeholder={locale === "zh" ? "搜索物品..." : "Search items..."}
                className="h-9 w-full bg-transparent px-2 text-sm text-[#ffffff] outline-none placeholder:text-[#555]"
              />
            </form>
            <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[#666]">
              {locale === "zh" ? "导航" : "Navigation"}
            </p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const href = `/${locale}${item.href}`;
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-[#1a1508] text-[#f0c040]"
                      : "text-[#9d9d9d] hover:bg-[#111] hover:text-[#ffffff]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {locale === "zh" ? item.zh : item.en}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
