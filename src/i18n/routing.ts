import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh", "ja", "ko"],
  defaultLocale: "en",
  // Default locale (en) has no prefix; other locales use their locale prefix.
  localePrefix: "as-needed",
  // The URL is the source of truth: unprefixed routes are always English.
  localeDetection: false,
});
