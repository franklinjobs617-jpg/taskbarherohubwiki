import type { Metadata } from "next";
import type { Locale } from "@/lib/game-data/data";

export function pageAlternates(locale: Locale, path: string): Metadata["alternates"] {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const enPath = normalizedPath;
  const zhPath = `/zh${normalizedPath}`;
  const jaPath = `/ja${normalizedPath}`;
  const koPath = `/ko${normalizedPath}`;

  return {
    canonical: locale === "en" ? enPath : `/${locale}${normalizedPath}`,
    languages: {
      en: enPath,
      zh: zhPath,
      ja: jaPath,
      ko: koPath,
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
