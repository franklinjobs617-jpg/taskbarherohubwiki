import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**.nanobananas.me",
      },
    ],
    unoptimized: false,
  },
  // The app reads large local JSON payloads from the R2/CDN runtime path in production.
  // Keep them out of Next.js server output tracing so they are not copied into the Worker bundle.
  outputFileTracingExcludes: {
    "/*": [
      "./tbh_data/**/*",
      "./tbh_external/**/*",
      "./data/generated/**/*",
    ],
  },
  // Keep local dev watchers off the large data trees.
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/tbh_data/**", "**/tbh_external/**"],
    };
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://www.google-analytics.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.r2.cloudflarestorage.com https://cdn.taskbarherohub.wiki; frame-src https://*.googlesyndication.com https://googleads.g.doubleclick.net;" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
