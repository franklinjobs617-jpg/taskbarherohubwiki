import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://taskbarhero.nanobananas.me"),
  title: "TaskBar Hero Wiki",
  description: "TaskBar Hero item database, drops, guides, and Steam Market references.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
