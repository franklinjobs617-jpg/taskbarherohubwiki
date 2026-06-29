"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { localizedPath } from "@/lib/locale-path";

const T: Record<string, { title: string; desc: string; home: string; search: string; popular: string }> = {
  zh: { title: "椤甸潰鏈壘鍒?", desc: "浣犺闂殑椤甸潰涓嶅瓨鍦ㄣ€傝瘯璇曟悳绱㈡垨娴忚鐑棬椤甸潰銆?", home: "杩斿洖棣栭〉", search: "鎼滅储鐗╁搧...", popular: "鐑棬椤甸潰" },
  en: { title: "Page Not Found", desc: "The page you're looking for doesn't exist. Try searching or browse popular pages.", home: "Go Home", search: "Search items...", popular: "Popular Pages" },
  ja: { title: "銉氥兗銈稿亴瑕嬨仱銇嬨倞銇俱仜銈?", desc: "銇婃帰銇椼伄銉氥兗銈稿伅瀛樺湪銇椼伨銇涖倱銆傛绱仚銈嬨亱浜烘皸銉氥兗銈搞倰瑕嬨仸銇忋仩銇曘亜銆?", home: "銉涖兗銉犮伀鎴汇倠", search: "銈偆銉嗐儬銈掓绱?..", popular: "浜烘皸銉氥兗銈?" },
  ko: { title: "韼橃澊歆€毳?彀眷潉 靾?鞐嗢姷雼堧嫟", desc: "彀眷溂鞁滊姅 韼橃澊歆€臧€ 臁挫灛頃橃 鞎婌姷雼堧嫟. 瓴€靸夗晿瓯半倶 鞚戈赴 韼橃澊歆€毳?霊橂煬氤挫劯鞖?", home: "頇堨溂搿?", search: "鞎勳澊韰?瓴€靸?..", popular: "鞚戈赴 韼橃澊歆€" },
};

export function NotFoundContent() {
  const pathname = usePathname();
  const seg = pathname.split("/")[1];
  const locale = ["en", "zh", "ja", "ko"].includes(seg) ? seg : "en";
  const t = T[locale] ?? T.en;
  const homeHref = localizedPath(locale, "/");
  const lpath = (path: string) => localizedPath(locale, path);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="mb-4 text-4xl font-semibold text-accent">404</h1>
      <p className="mb-2 text-lg text-text-secondary">{t.title}</p>
      <p className="mb-8 text-sm text-text-muted">{t.desc}</p>

      <form action={lpath("/items")} className="mb-8 flex w-full max-w-md border border-border-strong bg-bg-panel">
        <Search className="ml-3 h-4 w-4 shrink-0 self-center text-text-muted" />
        <input name="q" placeholder={t.search} className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-text-muted" />
        <button className="bg-[#d4a017] px-4 text-sm font-medium text-black transition-colors hover:bg-accent-bright">Search</button>
      </form>

      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">{t.popular}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href={lpath("/items")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Items <span className="text-text-muted">5,944</span></Link>
        <Link href={lpath("/heroes")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Heroes <span className="text-text-muted">6</span></Link>
        <Link href={lpath("/map")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Map <span className="text-text-muted">120</span></Link>
        <Link href={lpath("/monsters")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Monsters <span className="text-text-muted">61</span></Link>
        <Link href={lpath("/runes")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Runes <span className="text-text-muted">197</span></Link>
        <Link href={lpath("/chests")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Chests <span className="text-text-muted">59</span></Link>
        <Link href={lpath("/market")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Market</Link>
        <Link href={lpath("/tools/drop-finder")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Drop Finder</Link>
        <Link href={lpath("/guides/farming")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Farming Guide</Link>
        <Link href={lpath("/tools/farming-calculator")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Calculator</Link>
        <Link href={lpath("/guides/beginner/getting-started")} className="rounded-sm border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-text-primary">Beginner Guide</Link>
      </div>

      <Link href={homeHref} className="mt-8 rounded-md bg-[#d4a017] px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-accent-bright">
        {t.home}
      </Link>
    </div>
  );
}
