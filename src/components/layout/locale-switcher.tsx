"use client";

import { usePathname, useRouter } from "next/navigation";

export function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1];
  const target = currentLocale === "zh" ? "en" : "zh";

  return (
    <button
      onClick={() => {
        const next = pathname.replace(`/${currentLocale}`, `/${target}`);
        router.push(next);
      }}
      className="text-[10px] text-[#9d9d9d] hover:text-[#ffffff] bg-[#18181b] border border-[#2a2a2a] rounded px-1.5 py-0.5 font-mono tracking-wider transition-colors"
    >
      {target.toUpperCase()}
    </button>
  );
}
