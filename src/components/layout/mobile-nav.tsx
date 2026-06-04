"use client";

import { Database, Home, Menu, Swords } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNav } from "./nav-provider";

export function MobileNav() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] === "en" ? "en" : "zh";
  const { openMenu } = useNav();

  const links = [
    { href: `/${locale}`, label: locale === "zh" ? "首页" : "Home", icon: Home },
    { href: `/${locale}/items`, label: locale === "zh" ? "物品" : "Items", icon: Database },
    { href: `/${locale}/heroes`, label: locale === "zh" ? "英雄" : "Heroes", icon: Swords },
    { href: `/${locale}/guides`, label: locale === "zh" ? "攻略" : "Guides", icon: Home },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid h-14 grid-cols-5 border-t border-[#27272a] bg-[#0a0a0a]/95 backdrop-blur md:hidden">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href || (link.href !== `/${locale}` && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] ${
              active ? "text-[#f0c040]" : "text-[#6c6c6c]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
      <button
        onClick={openMenu}
        className="flex flex-col items-center justify-center gap-1 text-[10px] text-[#6c6c6c] active:text-[#f0c040]"
      >
        <Menu className="h-4 w-4" />
        {locale === "zh" ? "更多" : "More"}
      </button>
    </nav>
  );
}
