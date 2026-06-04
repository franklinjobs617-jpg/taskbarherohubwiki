import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh", "ja"],
  defaultLocale: "en",
  // Keep all languages explicit so switching never falls back through `/`.
  localePrefix: "always",
});
