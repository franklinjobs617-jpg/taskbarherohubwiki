"use client";

import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface SearchItem {
  id: number;
  slug: string;
  type: string;
  grade?: string;
  gear?: string;
  name: string;
  marketable?: boolean;
}

type Props = { locale: string; items: SearchItem[]; open: boolean; onClose: () => void };

export function SearchCommand({ locale, items, open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const router = useRouter();
  const fuse = useMemo(() => new Fuse(items, { keys: ["name", "slug", "gear", "type"], threshold: 0.3 }), [items]);
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).map((x) => x.item).slice(0, 20);
  }, [query, fuse]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const select = useCallback(
    (item: SearchItem) => {
      const typePath = item.type === "STAGEBOX" ? "chests" : "items";
      router.push(`/${locale}/${typePath}/${item.slug}`);
      onClose();
    },
    [locale, router, onClose],
  );

  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIdx((index) => Math.min(index + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIdx((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && results[selectedIdx]) select(results[selectedIdx]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60" />
      <div className="relative w-full max-w-lg border border-[#3b3b3b] bg-[#111] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-[#222] px-3 py-2">
          <Search className="h-4 w-4 text-[#6c6c6c]" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIdx(0);
            }}
            onKeyDown={handleKey}
            placeholder={locale === "zh" ? "搜索物品、英雄、关卡..." : "Search items, heroes, stages..."}
            className="flex-1 bg-transparent text-[13px] text-[#9d9d9d] outline-none placeholder:text-[#6c6c6c]"
          />
          <button onClick={onClose} className="text-[#6c6c6c] hover:text-[#9d9d9d]">
            <X className="h-4 w-4" />
          </button>
        </div>
        {results.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            {results.map((item, index) => (
              <button
                key={item.id}
                onClick={() => select(item)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors ${
                  index === selectedIdx ? "bg-[#1a1a1a] text-[#d4a017]" : "text-[#999] hover:bg-[#18181b]"
                }`}
              >
                <span className="w-10 text-[10px] text-[#666]">{item.type === "STAGEBOX" ? "BOX" : item.gear ? "GEAR" : "MAT"}</span>
                <span className="flex-1 truncate">{item.name}</span>
                {item.grade ? <span className="text-[10px] text-[#6c6c6c]">{item.grade}</span> : null}
              </button>
            ))}
          </div>
        ) : query ? (
          <div className="px-3 py-6 text-center text-[12px] text-[#6c6c6c]">{locale === "zh" ? "没有找到结果" : "No results found"}</div>
        ) : null}
        <div className="flex justify-between border-t border-[#222] px-3 py-1.5 text-[9px] text-[#6c6c6c]">
          <span>Up/Down {locale === "zh" ? "导航" : "navigate"}</span>
          <span>Enter {locale === "zh" ? "选择" : "select"}</span>
          <span>Esc {locale === "zh" ? "关闭" : "close"}</span>
        </div>
      </div>
    </div>
  );
}
