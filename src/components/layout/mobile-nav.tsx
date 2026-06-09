"use client";

import { Database, Home, Menu, Swords } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizedPath } from "@/lib/locale-path";
import { useNav } from "./nav-provider";

function label(locale: string, key: "home" | "items" | "heroes" | "guides" | "more") {
  const labels = {
    zh: { home: "首页", items: "物品", heroes: "英雄", guides: "攻略", more: "更多" },
    en: { home: "Home", items: "Items", heroes: "Heroes", guides: "Guides", more: "More" },
  };
  return labels[locale as keyof typeof labels]?.[key] ?? labels.en[key];
}

export function MobileNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const { openMenu } = useNav();
  const homeHref = localizedPath(locale, "/");

  const links = [
    { href: homeHref, label: label(locale, "home"), icon: Home },
    { href: localizedPath(locale, "/items"), label: label(locale, "items"), icon: Database },
    { href: localizedPath(locale, "/heroes"), label: label(locale, "heroes"), icon: Swords },
    { href: localizedPath(locale, "/guides"), label: label(locale, "guides"), icon: Home },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid h-14 grid-cols-5 border-t border-[#27272a] bg-[#0a0a0a]/95 backdrop-blur md:hidden">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href || (link.href !== homeHref && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] ${active ? "text-[#f0c040]" : "text-[#6c6c6c]"}`}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={openMenu}
        className="flex flex-col items-center justify-center gap-1 text-[10px] text-[#6c6c6c] active:text-[#f0c040]"
      >
        <Menu className="h-4 w-4" />
        {label(locale, "more")}
      </button>
    </nav>
  );
}
