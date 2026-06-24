import Link from "next/link";
import { Fragment } from "react";
import { localizedPath } from "@/lib/locale-path";
import type { Locale } from "@/lib/game-data/data";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({
  items,
  locale,
}: {
  items: BreadcrumbItem[];
  locale: Locale;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-5 flex flex-wrap items-center gap-2 text-xs text-text-muted"
    >
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span className="text-border-strong" aria-hidden="true">
              /
            </span>
          )}
          {item.href ? (
            <Link
              href={localizedPath(locale, item.href)}
              className="transition-colors hover:text-accent-bright"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-secondary">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

/** Generate BreadcrumbList JSON-LD from breadcrumb items */
export function breadcrumbJsonLd(
  items: BreadcrumbItem[],
  locale: Locale,
) {
  const baseUrl = "https://tbhguides.com";
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: item.href
        ? `${baseUrl}${localePrefix}${item.href}`
        : undefined,
    })),
  };
}
