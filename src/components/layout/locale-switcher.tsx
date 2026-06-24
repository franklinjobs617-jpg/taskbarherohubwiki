"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { localizedPath, withoutLocalePrefix } from "@/lib/locale-path";

const LOCALES = [
  { code: "en", label: "English", short: "EN" },
  { code: "zh", label: "\u4e2d\u6587", short: "\u4e2d" },
  { code: "ja", label: "\u65e5\u672c\u8a9e", short: "\u65e5" },
  { code: "ko", label: "\ud55c\uad6d\uc5b4", short: "\ud55c" },
] as const;

export function LocaleSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((locale) => locale.code === currentLocale) ?? LOCALES[0];
  const basePath = withoutLocalePrefix(pathname);
  const query = searchParams.toString();

  const hrefFor = (code: string) => {
    const next = localizedPath(code, basePath);
    return query ? `${next}?${query}` : next;
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 items-center gap-1.5 border-2 border-border-strong bg-bg-panel px-2.5 text-caption-lg font-medium text-text-primary transition-colors hover:border-accent-dim"
        aria-label="Switch language"
        aria-expanded={open}
      >
        <span className="font-mono text-accent">{current.short}</span>
        <span className="hidden text-text-secondary sm:inline">{current.label}</span>
        <svg className="h-3 w-3 text-text-muted" fill="none" viewBox="0 0 10 6" aria-hidden="true">
          <path stroke="currentColor" strokeWidth="1.5" d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {open ? (
        <>
          <button className="fixed inset-0 z-[60] cursor-default" aria-label="Close language menu" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] z-[70] w-44 overflow-hidden border-2 border-border-strong bg-bg-panel shadow-lg">
            {LOCALES.map((locale) => {
              const active = currentLocale === locale.code;
              return (
                <Link
                  key={locale.code}
                  href={hrefFor(locale.code)}
                  onClick={() => setOpen(false)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-body-sm transition-colors font-pixel ${
                    active ? "bg-accent-soft text-accent" : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                  }`}
                >
                  <span
                    className={`flex h-5 w-7 items-center justify-center text-caption font-semibold ${
                      active ? "bg-accent text-bg-deep" : "bg-bg-surface text-text-secondary"
                    }`}
                  >
                    {locale.short}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{locale.label}</span>
                </Link>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
