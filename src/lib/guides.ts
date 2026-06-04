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
  const blocks: MarkdownBlock[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;
  let table: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "p", text: paragraph.join(" ").trim() });
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    blocks.push(list);
    list = null;
  };

  const flushTable = () => {
    if (table.length < 2) {
      table = [];
      return;
    }
    const headers = splitTableRow(table[0]);
    const rows = table.slice(1).map(splitTableRow);
    blocks.push({ type: "table", headers, rows });
    table = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushTable();
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushAll();
      continue;
    }

    if (line.startsWith("|")) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }

    flushTable();

    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: "img", alt: imgMatch[1] ?? "", src: imgMatch[2] ?? "" });
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      const item = line.replace(/^- /, "").trim();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(item);
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      flushParagraph();
      const item = line.replace(/^\d+\.\s/, "").trim();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(item);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushAll();
  return blocks;
}

function splitTableRow(line: string) {
  return line.split("|").map((cell) => cell.trim()).filter(Boolean);
}
