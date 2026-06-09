import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
  // Default locale (en) has no prefix; Chinese uses /zh.
  localePrefix: "as-needed",
});
