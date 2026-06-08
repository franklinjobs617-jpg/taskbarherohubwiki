import type { Metadata } from "next";
import type { Locale } from "@/lib/game-data/data";

export function pageAlternates(locale: Locale, path: string): Metadata["alternates"] {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const enPath = normalizedPath;                       // English: /...  (no /en prefix — en is the default locale at root)
  const zhPath = `/zh${normalizedPath}`;               // Chinese: /zh/...
  const jaPath = `/ja${normalizedPath}`;               // Japanese: /ja/...
  const canonical = locale === "en" ? normalizedPath : `/${locale}${normalizedPath}`;
  return {
    canonical,
    languages: {
      en: enPath,
      zh: zhPath,
      ja: jaPath,
      ko: `/ko${normalizedPath}`,
      "x-default": enPath,
    },
  };
}

export function localizedPageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description?: string,
): Metadata {
  return {
    title,
    description,
    alternates: pageAlternates(locale, path),
  };
}
