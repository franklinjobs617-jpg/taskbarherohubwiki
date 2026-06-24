import Link from "next/link";
import { localizedPath } from "@/lib/locale-path";
import type { Locale } from "@/lib/game-data/data";

export type CrossLink = {
  href: string;
  label: string;
  meta?: string;
};

export function CrossLinks({
  links,
  locale,
  title,
}: {
  links: CrossLink[];
  locale: Locale;
  title: string;
}) {
  if (!links.length) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-text-primary">{title}</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={localizedPath(locale, link.href)}
            className="group block border border-border-default bg-bg-panel p-3 transition hover:border-accent hover:bg-bg-surface"
          >
            <p className="text-sm font-medium text-text-primary transition-colors group-hover:text-accent-bright">
              {link.label}
            </p>
            {link.meta ? (
              <p className="mt-1 text-xs text-text-muted">{link.meta}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
