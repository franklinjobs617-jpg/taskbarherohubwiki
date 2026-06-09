"use client";

import { BarChart3, BookOpen, Boxes, Bug, Calculator, Database, Map, Menu, Search, Shield, Skull, Swords, Wrench, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentLocaleFromPath, localizedPath } from "@/lib/locale-path";
import { LocaleSwitcher } from "./locale-switcher";
import { useNav } from "./nav-provider";

const NAV_ITEMS = [
  { href: "/items", icon: Database, zh: "物品", en: "Items" },
  { href: "/heroes", icon: Swords, zh: "英雄", en: "Heroes" },
  { href: "/map", icon: Map, zh: "关卡", en: "Stages" },
  { href: "/monsters", icon: Skull, zh: "怪物", en: "Monsters" },
  { href: "/market", icon: BarChart3, zh: "市场", en: "Market" },
  { href: "/chests", icon: Boxes, zh: "宝箱", en: "Chests" },
  { href: "/runes", icon: Shield, zh: "符文", en: "Runes" },
  { href: "/cube", icon: Boxes, zh: "Cube", en: "Cube" },
  { href: "/buffs", icon: Bug, zh: "Buff", en: "Buffs" },
  { href: "/effects", icon: Search, zh: "效果", en: "Effects" },
  { href: "/pets", icon: BookOpen, zh: "宠物", en: "Pets" },
  { href: "/builds", icon: Swords, zh: "Build", en: "Builds" },
  { href: "/guides/farming", icon: Calculator, zh: "刷图", en: "Farming" },
  { href: "/tools/farming-calculator", icon: Wrench, zh: "计算器", en: "Calculator" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const locale = currentLocaleFromPath(pathname);
  const { menuOpen, toggleMenu, closeMenu } = useNav();
  const lpath = (path: string) => localizedPath(locale, path);

  return (
    <header className="sticky top-0 z-50 border-b border-[#27272a] bg-[#0a0a0a]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0a]/90">
      <div className="mx-auto flex min-h-12 max-w-[1440px] items-center gap-2 px-3">
        <Link href={lpath("/")} className="flex shrink-0 items-center gap-2 font-semibold text-[#f0c040]">
          <span className="text-sm tracking-wide">TBH Wiki</span>
        </Link>

        <nav className="hidden h-12 min-w-0 flex-1 items-center overflow-x-auto lg:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const href = lpath(item.href);
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={item.href}
                href={href}
                className={`flex h-full shrink-0 items-center gap-1.5 border-b-2 px-2.5 text-xs transition ${
                  active
                    ? "border-[#d4a017] bg-[#18181b] text-[#f0c040]"
                    : "border-transparent text-[#8c8577] hover:bg-[#111] hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {locale === "zh" ? item.zh : item.en}
              </Link>
            );
          })}
        </nav>

        <form action={lpath("/items")} className="ml-auto hidden w-48 shrink-0 items-center border border-[#27272a] bg-[#0d0d0d] px-2 xl:flex 2xl:w-64">
          <Search className="h-3.5 w-3.5 shrink-0 text-[#666]" />
          <input
            name="q"
            placeholder={locale === "zh" ? "搜索物品..." : "Search items..."}
            className="h-8 w-full bg-transparent px-2 text-xs text-white outline-none placeholder:text-[#6c6c6c]"
          />
        </form>

        <LocaleSwitcher />

        <button
          type="button"
          onClick={toggleMenu}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#27272a] text-[#9d9d9d] hover:border-[#d4a017] lg:hidden"
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 top-12 z-40 lg:hidden">
          <button className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={closeMenu} />
          <nav className="absolute right-0 top-0 h-[calc(100vh-3rem)] w-72 max-w-[86vw] overflow-y-auto border-l border-[#27272a] bg-[#0d0d0d] p-4 shadow-2xl shadow-black/50">
            <form action={lpath("/items")} className="mb-4 flex items-center border border-[#27272a] bg-[#0d0d0d] px-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-[#666]" />
              <input
                name="q"
                placeholder={locale === "zh" ? "搜索物品..." : "Search items..."}
                className="h-9 w-full bg-transparent px-2 text-sm text-white outline-none placeholder:text-[#6c6c6c]"
              />
            </form>
            <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[#666]">
              {locale === "zh" ? "导航" : "Navigation"}
            </p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const href = lpath(item.href);
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-[#1a1508] text-[#f0c040]"
                      : "text-[#9d9d9d] hover:bg-[#111] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {locale === "zh" ? item.zh : item.en}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
