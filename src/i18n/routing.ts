import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
  // Always prefix with locale for SEO
  localePrefix: "always",
  // Domain-based routing can be added later
  // domains: [{ domain: 'taskbarhero.nanobananas.me', defaultLocale: 'zh' }],
});
