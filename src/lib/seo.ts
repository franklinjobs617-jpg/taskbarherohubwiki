import type { Metadata } from "next";
import type { Locale } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";

export function pageAlternates(locale: Locale, path: string): Metadata["alternates"] {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const enPath = localizedPath("en", normalizedPath);
  const zhPath = localizedPath("zh", normalizedPath);
  const jaPath = localizedPath("ja", normalizedPath);
  const koPath = localizedPath("ko", normalizedPath);

  return {
    canonical: localizedPath(locale, normalizedPath),
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
