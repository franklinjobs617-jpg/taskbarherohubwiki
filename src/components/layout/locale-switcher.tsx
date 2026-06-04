"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LOCALES = [
  { code: "en", label: "EN", short: "EN" },
  { code: "zh", label: "中文", short: "中" },
  { code: "ja", label: "日本語", short: "日" },
] as const;

const KNOWN = ["en", "zh", "ja"];

function getLocale(pathname: string) {
  const seg = pathname.split("/")[1];
  return KNOWN.includes(seg) ? seg : "en";
}

export function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = getLocale(pathname);
  const [open, setOpen] = useState(false);

  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0];

  const switchTo = (code: string) => {
    if (code === currentLocale) { setOpen(false); return; }
    const parts = pathname.split("/").filter(Boolean);
    const base = KNOWN.includes(parts[0]) ? `/${parts.slice(1).join("/")}` : pathname;
    const normalizedBase = base === "/" ? "" : base;
    const next = `/${code}${normalizedBase}`;
    router.push(next);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md border border-[#3b3b3b] bg-[#0d0d0d] px-2.5 py-1.5 text-[12px] text-[#ffffff] transition-colors hover:border-[#d4a017]/60 font-mono"
        aria-label="Switch language">
        <span className="text-[#d4a017]">{current.short}</span>
        <span className="hidden sm:inline text-[#9d9d9d]">{current.label}</span>
        <svg className="h-3 w-3 text-[#6c6c6c]" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" strokeWidth="1.5" d="M1 1l4 4 4-4" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-32 overflow-hidden rounded-lg border border-[#27272a] bg-[#0d0d0d] shadow-lg">
            {LOCALES.map((locale) => (
              <button key={locale.code} onClick={() => switchTo(locale.code)}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-[13px] transition-colors font-mono ${
                  currentLocale === locale.code
                    ? "bg-[#18181b] text-[#f0c040]"
                    : "text-[#9d9d9d] hover:bg-[#18181b] hover:text-[#ffffff]"
                }`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-medium ${
                  currentLocale === locale.code ? "bg-[#d4a017] text-black" : "bg-[#18181b] text-[#6c6c6c]"
                }`}>{locale.short}</span>
                {locale.label}
                {currentLocale === locale.code && (
                  <svg className="ml-auto h-3.5 w-3.5 text-[#d4a017]" fill="none" viewBox="0 0 12 12"><path stroke="currentColor" strokeWidth="2" d="M2 6l3 3 5-6" /></svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
