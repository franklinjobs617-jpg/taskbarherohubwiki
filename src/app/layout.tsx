import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://taskbarherohub.wiki"),
  title: "TaskBar Hero Wiki",
  description: "TaskBar Hero item database, drops, guides, and Steam Market references.",
  verification: {
    google: "ONkWDp2eHVeWUDjNlPgBak1oArCVkQWER2dlAtRoxQM",
  },
  other: {
    "google-adsense-account": "ca-pub-3383070348689557",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
