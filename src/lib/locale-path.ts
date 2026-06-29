export const PUBLIC_LOCALES = ["en", "zh", "ja", "ko"] as const;
export const KNOWN_LOCALES = ["en", "zh", "ja", "ko"] as const;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://taskbarherohub.wiki";

export function currentLocaleFromPath(pathname: string): string {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return KNOWN_LOCALES.includes(firstSegment as (typeof KNOWN_LOCALES)[number]) ? firstSegment : "en";
}

export function withoutLocalePrefix(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (KNOWN_LOCALES.includes(parts[0] as (typeof KNOWN_LOCALES)[number])) {
    const rest = parts.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname || "/";
}

export function localizedPath(locale: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (locale === "en") return normalizedPath;
  return `/${locale}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function absoluteUrl(path: string, baseUrl = SITE_URL): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, baseUrl).toString();
}

export function localizedUrl(locale: string, path: string, baseUrl = SITE_URL): string {
  return absoluteUrl(localizedPath(locale, path), baseUrl);
}
