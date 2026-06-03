import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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
  experimental: {
    cpus: 2,
    staticGenerationMaxConcurrency: 1,
  },
  // Enable React strict mode for development
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
