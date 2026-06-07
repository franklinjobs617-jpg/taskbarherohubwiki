import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh", "ja"],
  defaultLocale: "en",
  // Default locale (en) has no prefix, other locales use /zh, /ja
  localePrefix: "as-needed",
});
