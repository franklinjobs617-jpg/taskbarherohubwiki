/**
 * Schema.org JSON-LD factory functions.
 * Each returns a plain object suitable for JSON.stringify and injection via <script type="application/ld+json">.
 */

import { SITE_URL } from "@/lib/locale-path";

const BASE_URL = SITE_URL;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function localeUrl(path: string, locale?: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const prefix = locale && locale !== "en" ? `/${locale}` : "";
  return `${BASE_URL}${prefix}${normalizedPath === "/" && prefix ? "" : normalizedPath}`;
}

function personOrOrganization(): object {
  return { "@type": "Organization", name: "TBH Guide" };
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

export function breadcrumbList(
  items: Array<{ name: string; url?: string }>,
  locale?: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export function faqPage(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// Article (for guides, news, wiki)
// ---------------------------------------------------------------------------

export function articleSchema(meta: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.headline,
    description: meta.description,
    url: meta.url,
    datePublished: meta.datePublished,
    dateModified: meta.dateModified ?? meta.datePublished,
    ...(meta.image ? { image: meta.image } : {}),
    author: meta.authorName
      ? { "@type": "Person", name: meta.authorName }
      : personOrOrganization(),
    publisher: personOrOrganization(),
  };
}

// ---------------------------------------------------------------------------
// NewsArticle (for patch notes / updates)
// ---------------------------------------------------------------------------

export function newsArticleSchema(meta: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: meta.headline,
    description: meta.description,
    url: meta.url,
    datePublished: meta.datePublished,
    dateModified: meta.dateModified ?? meta.datePublished,
    author: personOrOrganization(),
    publisher: personOrOrganization(),
  };
}

// ---------------------------------------------------------------------------
// ItemList (for listing / hub pages)
// ---------------------------------------------------------------------------

export function itemList(
  items: Array<{ name: string; url: string; position?: number }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: item.position ?? i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

// ---------------------------------------------------------------------------
// Dataset (for database index / entity data pages)
// ---------------------------------------------------------------------------

export function datasetSchema(meta: {
  name: string;
  description: string;
  url: string;
  dateModified: string;
  variables?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: meta.name,
    description: meta.description,
    url: meta.url,
    dateModified: meta.dateModified,
    ...(meta.variables != null
      ? {
          variableMeasured: {
            "@type": "PropertyValue",
            name: "entity count",
            value: meta.variables,
          },
        }
      : {}),
    creator: personOrOrganization(),
  };
}

// ---------------------------------------------------------------------------
// SoftwareApplication (for tools)
// ---------------------------------------------------------------------------

export function softwareApplicationSchema(meta: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.name,
    description: meta.description,
    url: meta.url,
    applicationCategory: meta.applicationCategory ?? "GameApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

// ---------------------------------------------------------------------------
// CollectionPage (for hub / category pages)
// ---------------------------------------------------------------------------

export function collectionPage(meta: {
  name: string;
  description: string;
  url: string;
  hasPart?: Array<{ name: string; url: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: meta.name,
    description: meta.description,
    url: meta.url,
    ...(meta.hasPart?.length
      ? {
          hasPart: meta.hasPart.map((p) => ({
            "@type": "WebPage",
            name: p.name,
            url: p.url,
          })),
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// WebSite (global — used once in root layout)
// ---------------------------------------------------------------------------

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TBH Guide",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/items?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TBH Guide",
    url: BASE_URL,
    sameAs: ["https://discord.gg/taskbarhero"],
  };
}

// ---------------------------------------------------------------------------
// Helper — merge multiple JSON-LD blocks into one array
// ---------------------------------------------------------------------------

export function mergeJsonLd(
  ...blocks: Array<object | null | undefined>
): object[] {
  return blocks.filter(Boolean) as object[];
}
