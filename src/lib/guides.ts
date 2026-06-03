import fs from "node:fs/promises";
import path from "node:path";
import { guides, type Guide, type Locale } from "@/lib/game-data/data";

export type GuideContent = Guide & {
  locale: Locale;
  gameVersion: string;
  tldr: string[];
  body: string;
  mistakes: string[];
  faq: Array<{ question: string; answer: string }>;
  relatedItems: string[];
  relatedTools: string[];
};

function parseList(value: string | undefined) {
  return value ? value.split("|").map((item) => item.trim()).filter(Boolean) : [];
}

function parseFaq(value: string | undefined) {
  return parseList(value).map((entry) => {
    const [question, answer] = entry.split("=>").map((part) => part.trim());
    return { question: question ?? "", answer: answer ?? "" };
  }).filter((entry) => entry.question && entry.answer);
}

function stripQuotes(value: string | undefined) {
  return (value ?? "").replace(/^["']|["']$/g, "");
}

export async function getGuideContent(locale: Locale, category: string, slug: string): Promise<GuideContent | null> {
  const meta = guides.find((guide) => guide.category === category && guide.slug === slug);
  if (!meta) return null;

  const filePath = path.join(process.cwd(), "content", "guides", locale, category, `${slug}.mdx`);
  const raw = await fs.readFile(filePath, "utf8").catch(() => null);
  if (!raw) return null;

  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  const frontmatter = Object.fromEntries(
    match[1].split("\n").map((line) => {
      const index = line.indexOf(":");
      if (index === -1) return [line, ""];
      return [line.slice(0, index).trim(), stripQuotes(line.slice(index + 1).trim())];
    }),
  );

  return {
    ...meta,
    locale,
    gameVersion: frontmatter.gameVersion || "game-v1",
    tldr: parseList(frontmatter.tldr),
    body: match[2].trim(),
    mistakes: parseList(frontmatter.mistakes),
    faq: parseFaq(frontmatter.faq),
    relatedItems: parseList(frontmatter.relatedItems),
    relatedTools: parseList(frontmatter.relatedTools),
  };
}

export function getGuideStaticParams() {
  return guides.flatMap((guide) =>
    (["zh", "en"] as const).map((locale) => ({
      locale,
      category: guide.category,
      slug: guide.slug,
    })),
  );
}

export type MarkdownBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string }
  | { type: "img"; src: string; alt: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export function renderMarkdownish(content: string): MarkdownBlock[] {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("## ")) return { type: "h2" as const, text: block.slice(3).trim() };
      if (block.startsWith("### ")) return { type: "h3" as const, text: block.slice(4).trim() };
      if (block.startsWith("- ")) return { type: "ul" as const, items: block.split("\n").map((line) => line.replace(/^- /, "").trim()) };
      if (/^\d+\.\s/.test(block)) return { type: "ol" as const, items: block.split("\n").map((line) => line.replace(/^\d+\.\s/, "").trim()) };
      const imgMatch = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imgMatch) return { type: "img" as const, alt: imgMatch[1] ?? "", src: imgMatch[2] ?? "" };
      // Simple table: each line is | col1 | col2 | col3 |
      if (block.includes("|") && block.split("\n").every((line) => line.trim().startsWith("|"))) {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        if (lines.length >= 2) {
          const headers = lines[0].split("|").map((cell) => cell.trim()).filter(Boolean);
          const rows = lines.slice(1).map((line) =>
            line.split("|").map((cell) => cell.trim()).filter(Boolean),
          );
          return { type: "table" as const, headers, rows };
        }
      }
      return { type: "p" as const, text: block.replace(/\n/g, " ") };
    });
}
