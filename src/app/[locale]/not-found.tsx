import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundContent />;
}
