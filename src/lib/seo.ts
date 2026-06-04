import type { Metadata } from "next";
import type { Locale } from "@/lib/game-data/data";

export function pageAlternates(locale: Locale, path: string): Metadata["alternates"] {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return {
    canonical: `/${locale}${normalizedPath}`,
    languages: {
      zh: `/zh${normalizedPath}`,
      en: `/en${normalizedPath}`,
      ja: `/ja${normalizedPath}`,
      "x-default": `/zh${normalizedPath}`,
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
