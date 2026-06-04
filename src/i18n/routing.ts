import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh", "ja"],
  defaultLocale: "en",
  // Default locale (en) at root, others prefixed: /zh /ja
  localePrefix: "as-needed",
});
