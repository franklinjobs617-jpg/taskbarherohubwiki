"use client";

import { Database, Home, Menu, Swords } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizedPath } from "@/lib/locale-path";
import { useNav } from "./nav-provider";

function label(locale: string, key: "home" | "items" | "heroes" | "guides" | "more") {
  const labels = {
    zh: { home: "\u9996\u9875", items: "\u7269\u54c1", heroes: "\u82f1\u96c4", guides: "\u653b\u7565", more: "\u66f4\u591a" },
    en: { home: "Home", items: "Items", heroes: "Heroes", guides: "Guides", more: "More" },
    ja: { home: "\u30db\u30fc\u30e0", items: "\u30a2\u30a4\u30c6\u30e0", heroes: "\u30d2\u30fc\u30ed\u30fc", guides: "\u653b\u7565", more: "\u305d\u306e\u4ed6" },
    ko: { home: "\ud648", items: "\uc544\uc774\ud15c", heroes: "\uc601\uc6c5", guides: "\uacf5\ub7b5", more: "\ub354\ubcf4\uae30" },
  } satisfies Record<string, Record<"home" | "items" | "heroes" | "guides" | "more", string>>;

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
    <nav className="header-glass fixed bottom-0 left-0 right-0 z-40 grid h-14 grid-cols-5 border-t-2 md:hidden">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href || (link.href !== homeHref && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center gap-0.5 font-pixel text-caption ${active ? "text-accent" : "text-text-muted"}`}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={openMenu}
        className="flex flex-col items-center justify-center gap-0.5 font-pixel text-caption text-text-muted active:text-accent"
      >
        <Menu className="h-4 w-4" />
        {label(locale, "more")}
      </button>
    </nav>
  );
}
