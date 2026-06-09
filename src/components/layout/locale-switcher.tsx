"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { localizedPath, withoutLocalePrefix } from "@/lib/locale-path";

const LOCALES = [
  { code: "en", label: "English", short: "EN" },
  { code: "zh", label: "\u4e2d\u6587", short: "\u4e2d" },
  { code: "ja", label: "\u65e5\u672c\u8a9e", short: "\u65e5" },
  { code: "ko", label: "\ud55c\uad6d\uc5b4", short: "\ud55c" },
] as const;

export function LocaleSwitcher() {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((locale) => locale.code === currentLocale) ?? LOCALES[0];
  const basePath = withoutLocalePrefix(pathname);

  const switchTo = (code: string) => {
    const next = localizedPath(code, basePath);
    if (next === pathname) {
      setOpen(false);
      return;
    }
    window.location.assign(next);
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 items-center gap-1.5 rounded-md border border-[#3b3b3b] bg-[#0d0d0d] px-2.5 text-[12px] font-medium text-white transition-colors hover:border-[#d4a017]/70"
        aria-label="Switch language"
        aria-expanded={open}
      >
        <span className="font-mono text-[#f0c040]">{current.short}</span>
        <span className="hidden text-[#9d9d9d] sm:inline">{current.label}</span>
        <svg className="h-3 w-3 text-[#6c6c6c]" fill="none" viewBox="0 0 10 6" aria-hidden="true">
          <path stroke="currentColor" strokeWidth="1.5" d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {open ? (
        <>
          <button className="fixed inset-0 z-[60] cursor-default" aria-label="Close language menu" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] z-[70] w-44 overflow-hidden rounded-md border border-[#3b3b3b] bg-[#0d0d0d] shadow-2xl shadow-black/40">
            {LOCALES.map((locale) => {
              const active = currentLocale === locale.code;
              return (
                <button
                  key={locale.code}
                  type="button"
                  onClick={() => switchTo(locale.code)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] transition-colors ${
                    active ? "bg-[#18181b] text-[#f0c040]" : "text-[#b8ad98] hover:bg-[#18181b] hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-5 w-7 items-center justify-center rounded-sm text-[10px] font-semibold ${
                      active ? "bg-[#d4a017] text-black" : "bg-[#18181b] text-[#9d9d9d]"
                    }`}
                  >
                    {locale.short}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{locale.label}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
