import type { Metadata } from "next";
import Link from "next/link";

export function generateMetadata(): Metadata {
  return {
    title: "404｜TaskBar Hero Wiki",
    robots: { index: false, follow: false },
  };
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="font-pixel text-4xl text-gold mb-4">404</h1>
      <p className="text-text-secondary text-lg mb-6">页面未找到 / Page Not Found</p>
      <Link
        href="/zh"
        className="px-5 py-2.5 bg-gold text-bg-primary rounded font-medium text-sm hover:bg-gold/90 transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}
