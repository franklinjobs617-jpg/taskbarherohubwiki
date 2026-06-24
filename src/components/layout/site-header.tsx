"use client";

import {
  BarChart3,
  BookOpen,
  Boxes,
  Bug,
  Calculator,
  Database,
  Map,
  Menu,
  MoreHorizontal,
  Search,
  Shield,
  Skull,
  Swords,
  Wrench,
  X,
} from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { localizedPath } from "@/lib/locale-path";
import { LocaleSwitcher } from "./locale-switcher";
import { useNav } from "./nav-provider";

type NavItem = { href: string; icon: typeof Database; zh: string; en: string; count?: number; group?: string; new?: boolean };

const NAV_GROUPS: { key: string; zh: string; en: string; items: { href: string; icon: typeof Database; zh: string; en: string; count?: number; new?: boolean }[] }[] = [
  { key: "database", zh: "数据", en: "Database", items: [
    { href: "/items", icon: Database, zh: "物品", en: "Items", count: 5944 },
    { href: "/heroes", icon: Swords, zh: "英雄", en: "Heroes", count: 6 },
    { href: "/monsters", icon: Skull, zh: "怪物", en: "Monsters", count: 61 },
    { href: "/chests", icon: Boxes, zh: "宝箱", en: "Chests", count: 59 },
    { href: "/pets", icon: BookOpen, zh: "宠物", en: "Pets", count: 8 },
    { href: "/database", icon: Database, zh: "数据库", en: "Database", new: true },
  ]},
  { key: "combat", zh: "战斗", en: "Combat", items: [
    { href: "/runes", icon: Shield, zh: "符文", en: "Runes", count: 197 },
    { href: "/skills", icon: Swords, zh: "技能", en: "Skills", count: 106 },
    { href: "/buffs", icon: Bug, zh: "Buff", en: "Buffs", count: 29 },
    { href: "/effects", icon: Search, zh: "效果", en: "Effects", count: 79 },
    { href: "/wiki", icon: BookOpen, zh: "百科", en: "Wiki", count: 10, new: true },
  ]},
  { key: "stages", zh: "关卡", en: "Stages", items: [
    { href: "/map", icon: Map, zh: "关卡", en: "Stages", count: 120 },
    { href: "/market", icon: BarChart3, zh: "市场", en: "Market" },
    { href: "/guides/farming", icon: Calculator, zh: "刷图", en: "Farming", count: 8 },
    { href: "/builds", icon: Swords, zh: "Build", en: "Builds", count: 20 },
  ]},
  { key: "tools", zh: "工具", en: "Tools", items: [
    { href: "/tools", icon: Wrench, zh: "工具", en: "Tools", count: 5, new: true },
    { href: "/cube", icon: Boxes, zh: "Cube", en: "Cube", count: 9 },
  ]},
];

const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) =>
  g.items.map((item) => ({ ...item, group: g.key }))
);

const PRIMARY_NAV_ITEMS = NAV_ITEMS.slice(0, 8);
const SECONDARY_NAV_ITEMS = NAV_ITEMS.slice(8);

export function SiteHeader() {
  const pathname = usePathname();
  const locale = useLocale();
  const { menuOpen, toggleMenu, closeMenu } = useNav();
  const [moreOpen, setMoreOpen] = useState(false);
  const lpath = (path: string) => localizedPath(locale, path);
  const label = (item: (typeof NAV_ITEMS)[number]) => (locale === "zh" ? item.zh : item.en);
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));
  const moreActive = SECONDARY_NAV_ITEMS.some((item) => isActive(lpath(item.href)));

  return (
    <header className="header-glass sticky top-0 z-50">
      <div className="mx-auto flex min-h-[50px] max-w-[1440px] items-center gap-2 overflow-visible px-3 sm:px-5 lg:px-6">
        <Link href={lpath("/")} className="flex shrink-0 items-center gap-2 font-pixel text-ui-lg font-semibold text-accent hover:text-accent-bright transition-colors">
          <span className="tracking-wide">TBH Wiki</span>
        </Link>

        <nav className="hidden h-12 min-w-0 flex-1 items-center lg:flex">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const href = lpath(item.href);
            const active = isActive(href);
            return (
              <Link
                key={item.href}
                href={href}
                className={`flex h-full shrink-0 items-center gap-1 border-b-2 px-2.5 text-ui transition-colors font-pixel ${
                  active
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-transparent text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                }`}
              >
                <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                <span>{label(item)}</span>
                {item.count ? (
                  <span className={`text-caption tabular-nums font-mono ${active ? "text-accent/80" : "text-text-muted"}`}>
                    {item.count >= 1000 ? `${(item.count / 1000).toFixed(1)}k` : item.count}
                  </span>
                ) : null}
              </Link>
            );
          })}

          <div className="relative h-full shrink-0">
            <button
              type="button"
              onClick={() => setMoreOpen((value) => !value)}
              className={`flex h-full items-center gap-1.5 border-b-2 px-2 text-xs transition-colors ${
                moreActive
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-transparent text-text-secondary hover:bg-bg-surface hover:text-text-primary"
              }`}
              aria-label={locale === "zh" ? "\u66f4\u591a\u5bfc\u822a" : "More navigation"}
              aria-expanded={moreOpen}
            >
              <MoreHorizontal aria-hidden="true" className="h-3.5 w-3.5" />
              <span>{locale === "zh" ? "\u66f4\u591a" : "More"}</span>
            </button>

            {moreOpen ? (
              <>
                <button type="button" className="fixed inset-0 z-[60] cursor-default" aria-label="Close more menu" onClick={() => setMoreOpen(false)} />
                <div className="absolute right-0 top-full z-[70] mt-1 w-48 overflow-hidden border-2 border-border-strong bg-bg-panel shadow-lg">
                  {SECONDARY_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const href = lpath(item.href);
                    const active = isActive(href);
                    return (
                      <Link
                        key={item.href}
                        href={href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 text-body-sm transition-colors font-pixel ${
                          active ? "bg-accent-soft text-accent" : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                        }`}
                      >
                        <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                        <span className="truncate">{label(item)}</span>
                    {item.count ? <span className="ml-auto text-caption font-mono text-text-muted">{item.count >= 1000 ? `${(item.count / 1000).toFixed(1)}k` : item.count}</span> : null}
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        </nav>

        <form action={lpath("/items")} className="ml-auto hidden w-40 shrink-0 items-center border-2 border-border-default bg-bg-panel px-2 md:flex xl:w-44 2xl:w-56" role="search" aria-label={locale === "zh" ? "\u641c\u7d22\u7269\u54c1" : "Search items"}>
          <Search aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-text-muted" />
          <input
            name="q"
            aria-label={locale === "zh" ? "\u641c\u7d22\u7269\u54c1" : "Search items"}
            placeholder={locale === "zh" ? "\u641c\u7d22\u7269\u54c1..." : "Search items..."}
            className="h-8 w-full bg-transparent px-2 text-body-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        </form>

        <LocaleSwitcher />

        <button
          type="button"
          onClick={toggleMenu}
          className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-border-default text-text-secondary hover:border-accent lg:hidden"
          aria-label="Menu"
        >
          {menuOpen ? <X aria-hidden="true" className="h-4 w-4" /> : <Menu aria-hidden="true" className="h-4 w-4" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 top-12 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={closeMenu} />
          <nav className="absolute right-0 top-0 h-[calc(100vh-3rem)] w-72 max-w-[86vw] overflow-y-auto border-l-2 border-border-default bg-bg-canvas p-4 shadow-lg">
            <form action={lpath("/items")} className="search-glass mb-4 flex items-center" role="search" aria-label={locale === "zh" ? "\u641c\u7d22\u7269\u54c1" : "Search items"}>
              <Search aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-text-muted ml-3" />
              <input
                name="q"
                aria-label={locale === "zh" ? "\u641c\u7d22\u7269\u54c1" : "Search items"}
                placeholder={locale === "zh" ? "\u641c\u7d22\u7269\u54c1..." : "Search items..."}
                className="search-glass-input py-2.5 text-body-sm"
              />
            </form>
            <p className="section-eyebrow mb-2">
              {locale === "zh" ? "\u5bfc\u822a" : "Navigation"}
            </p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const href = lpath(item.href);
              const active = isActive(href);
              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-3 py-2.5 text-body transition font-pixel ${
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-text-secondary hover:bg-bg-panel hover:text-text-primary"
                  }`}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {label(item)}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
