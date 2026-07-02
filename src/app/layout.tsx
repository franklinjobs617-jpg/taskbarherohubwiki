import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/locale-path";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TaskBar Hero Wiki",
  description: "TaskBar Hero item database, drops, guides, and Steam Market references.",
  verification: {
    google: "ONkWDp2eHVeWUDjNlPgBak1oArCVkQWER2dlAtRoxQM",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
