import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Coins, PackageCheck, ShieldAlert } from "lucide-react";
import { ConfidenceBadge } from "@/components/tbh/badges";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { allItems, assetPath, itemName, marketForItem, type Locale, type RawItem } from "@/lib/game-data/data";
import { getGuideContent, getGuideStaticParams, renderMarkdownish, type GuideContent, type MarkdownBlock } from "@/lib/guides";

type Props = { params: Promise<{ locale: Locale; category: string; slug: string }> };

const guideVisuals: Record<string, { image: string; zh: string; en: string }> = {
  "getting-started": {
    image: "/game/screenshots/screenshot-9.jpg",
    zh: "先把路线跑稳，再谈稀有度和市场。",
    en: "Stabilize the route before chasing rarity or market value.",
  },
  "class-guide": {
    image: "/game/screenshots/screenshot-6.jpg",
    zh: "职业选择本质是武器路径、容错和清图目标的组合。",
    en: "Class choice is a mix of weapon path, safety margin, and farming goal.",
  },
  "cube-materials": {
    image: "/game/screenshots/screenshot-10.jpg",
    zh: "材料不是杂物，它们决定装备后期方向。",
    en: "Materials are not clutter; they define late gear direction.",
  },
  "steam-market-guide": {
    image: "/game/screenshots/screenshot-5.jpg",
    zh: "市场数据只做风险判断，不做收益承诺。",
    en: "Market data is a risk signal, not a profit promise.",
  },
  "tradable-items": {
    image: "/game/screenshots/screenshot-4.jpg",
    zh: "可交易是状态，不是立刻出售的命令。",
    en: "Tradable is a state, not an instruction to sell immediately.",
  },
  "chest-drop-guide": {
    image: "/game/screenshots/screenshot-3.jpg",
    zh: "宝箱要同时看来源、等级范围和真实掉率。",
    en: "Chests need source, level range, and real drop-rate context.",
  },
  "gold-farming-route": {
    image: "/game/screenshots/screenshot-7.jpg",
    zh: "金币效率来自稳定清图，不来自想象中的高价掉落。",
    en: "Gold efficiency comes from stable clears, not imagined rare drops.",
  },
  "exp-farming-route": {
    image: "/game/screenshots/screenshot-8.jpg",
    zh: "经验路线要看每分钟击杀、每轮经验和清图时间。",
    en: "EXP routes depend on kills per minute, XP per run, and clear time.",
  },
};

export function generateStaticParams() {
  return getGuideStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const guide = await getGuideContent(locale, category, slug);
  if (!guide) return { title: "Guide" };
  return {
    title: guide.title[locale],
    description: guide.description[locale],
    alternates: {
      canonical: `/${locale}/guides/${category}/${slug}`,
      languages: {
        zh: `/zh/guides/${category}/${slug}`,
        en: `/en/guides/${category}/${slug}`,
        "x-default": `/zh/guides/${category}/${slug}`,
      },
    },
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const { locale, category, slug } = await params;
  const guide = await getGuideContent(locale, category, slug);
  if (!guide) notFound();

  const relatedItems = allItems().filter((item) => guide.relatedItems.includes(item.slug)).slice(0, 8);
  const visual = guideVisuals[slug] ?? guideVisuals["getting-started"];

  return (
    <main className="guide-page">
      <SeoJsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.title[locale],
            description: guide.description[locale],
            dateModified: guide.updatedAt,
            inLanguage: locale,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Guides", item: `/${locale}/guides` },
              { "@type": "ListItem", position: 2, name: guide.title[locale] },
            ],
          },
        ]}
      />

      <div className="guide-shell">
        <article className="guide-main">
          <ArticleHeader guide={guide} locale={locale} visual={visual} />
          <QuickTake guide={guide} locale={locale} />
          <ArticleBody blocks={renderMarkdownish(guide.body)} fallbackImage={visual.image} locale={locale} />
          <Mistakes mistakes={guide.mistakes} locale={locale} />
          <Faq faq={guide.faq} locale={locale} />
          <RelatedItems items={relatedItems} locale={locale} />
        </article>

        <ArticleAside guide={guide} locale={locale} items={relatedItems} />
      </div>
    </main>
  );
}

function ArticleHeader({
  guide,
  locale,
  visual,
}: {
  guide: GuideContent;
  locale: Locale;
  visual: { image: string; zh: string; en: string };
}) {
  return (
    <header className="guide-hero">
      <div className="guide-breadcrumb">
        <Link href={`/${locale}/guides`}>{locale === "zh" ? "攻略" : "Guides"}</Link>
        <span>/</span>
        <span>{guide.category}</span>
      </div>

      <div className="guide-meta-row">
        <ConfidenceBadge value={guide.evidence === "datamined" ? "high" : guide.evidence === "editorial" ? "medium" : "low"} />
        <span>{guide.gameVersion}</span>
        <span>{guide.updatedAt}</span>
      </div>

      <h1>{guide.title[locale]}</h1>
      <p className="guide-deck">{guide.description[locale]}</p>
      <p className="guide-answer">{locale === "zh" ? visual.zh : visual.en}</p>

      <figure className="guide-figure guide-hero-image">
        <Image src={visual.image} alt={guide.title[locale]} width={1200} height={675} priority unoptimized />
      </figure>
    </header>
  );
}

function QuickTake({ guide, locale }: { guide: GuideContent; locale: Locale }) {
  return (
    <section className="guide-section guide-take">
      <h2>{locale === "zh" ? "快速结论" : "Quick Take"}</h2>
      <ol>
        {guide.tldr.map((item, index) => (
          <li key={item}>
            <span>{index + 1}</span>
            <p>{item}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ArticleBody({ blocks, fallbackImage, locale }: { blocks: MarkdownBlock[]; fallbackImage: string; locale: Locale }) {
  let inserted = false;
  return (
    <section className="guide-body">
      {blocks.map((block, index) => {
        const rendered = renderBlock(block, index);
        if (!inserted && block.type === "h2" && index > 1) {
          inserted = true;
          return (
            <div key={`image-${index}`}>
              <InlineImage src={fallbackImage} alt={locale === "zh" ? "游戏界面参考" : "Gameplay reference"} />
              {rendered}
            </div>
          );
        }
        return rendered;
      })}
    </section>
  );
}

function renderBlock(block: MarkdownBlock, index: number) {
  if (block.type === "h2") return <h2 key={index}>{block.text}</h2>;
  if (block.type === "h3") return <h3 key={index}>{block.text}</h3>;
  if (block.type === "p") return <p key={index}><RichText text={block.text} /></p>;
  if (block.type === "img") {
    return <InlineImage key={index} src={block.src.startsWith("http") ? "/game/screenshots/screenshot-1.jpg" : block.src} alt={block.alt} />;
  }
  if (block.type === "ul" || block.type === "ol") {
    const Tag = block.type;
    return (
      <Tag key={index}>
        {block.items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}><RichText text={item} /></li>)}
      </Tag>
    );
  }
  return (
    <div key={index} className="guide-table-wrap">
      <table>
        <thead>
          <tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {block.rows.filter((row) => !row.every((cell) => /^-+$/.test(cell))).map((row, rowIndex) => (
            <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InlineImage({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="guide-figure">
      <Image src={src} alt={alt} width={1200} height={675} unoptimized />
      {alt ? <figcaption>{alt}</figcaption> : null}
    </figure>
  );
}

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function Mistakes({ mistakes, locale }: { mistakes: string[]; locale: Locale }) {
  return (
    <section className="guide-section">
      <h2>{locale === "zh" ? "常见错误" : "Common Mistakes"}</h2>
      <div className="guide-note-grid">
        {mistakes.map((mistake) => (
          <div key={mistake} className="guide-note">
            <ShieldAlert />
            <p>{mistake}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq({ faq, locale }: { faq: Array<{ question: string; answer: string }>; locale: Locale }) {
  return (
    <section className="guide-section">
      <h2>{locale === "zh" ? "常见问题" : "FAQ"}</h2>
      <div className="guide-faq">
        {faq.map((entry) => (
          <div key={entry.question}>
            <h3>{entry.question}</h3>
            <p>{entry.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedItems({ items, locale }: { items: RawItem[]; locale: Locale }) {
  if (!items.length) return null;
  return (
    <section className="guide-section">
      <h2>{locale === "zh" ? "文中提到的物品" : "Items Mentioned"}</h2>
      <div className="guide-items">
        {items.map((item) => <ReferenceItem key={item.id} item={item} locale={locale} />)}
      </div>
    </section>
  );
}

function ArticleAside({ guide, locale, items }: { guide: GuideContent; locale: Locale; items: RawItem[] }) {
  const isZh = locale === "zh";
  return (
    <aside className="guide-aside">
      <div className="guide-aside-card">
        <p className="guide-aside-title">{isZh ? "文章信息" : "Article"}</p>
        <AsideRow label={isZh ? "版本" : "Version"} value={guide.gameVersion} />
        <AsideRow label={isZh ? "更新" : "Updated"} value={guide.updatedAt} />
        <AsideRow label={isZh ? "证据" : "Evidence"} value={guide.evidence} />
      </div>

      {items.length ? (
        <div className="guide-aside-card">
          <p className="guide-aside-title">{isZh ? "速查物品" : "Quick Refs"}</p>
          {items.slice(0, 5).map((item) => <ReferenceItem key={item.id} item={item} locale={locale} compact />)}
        </div>
      ) : null}

      <div className="guide-aside-card">
        <p className="guide-aside-title">{isZh ? "下一步" : "Next"}</p>
        <AsideLink href={`/${locale}/market`} icon={<Coins />} label={isZh ? "市场价格" : "Market"} />
        <AsideLink href={`/${locale}/chests`} icon={<PackageCheck />} label={isZh ? "宝箱掉落" : "Chests"} />
        {guide.relatedTools.map((tool) => <AsideLink key={tool} href={`/${locale}/tools/${tool}`} icon={<Clock3 />} label={tool} />)}
      </div>
    </aside>
  );
}

function AsideRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="guide-aside-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AsideLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="guide-aside-link">
      <span>{icon}{label}</span>
      <ArrowRight />
    </Link>
  );
}

function ReferenceItem({ item, locale, compact = false }: { item: RawItem; locale: Locale; compact?: boolean }) {
  const icon = assetPath(item.icon);
  const market = marketForItem(item);
  const name = itemName(item, locale);
  return (
    <Link href={`/${locale}/items/${item.slug}`} className={compact ? "guide-ref guide-ref-compact" : "guide-ref"}>
      <span className="guide-ref-icon">
        {icon ? <Image src={icon} alt={name} width={30} height={30} className="object-contain" data-pixel unoptimized /> : <CheckCircle2 />}
      </span>
      <span>
        <strong>{name}</strong>
        <small>{market?.lowest ? `$${market.lowest.toFixed(2)}` : item.type}</small>
      </span>
    </Link>
  );
}
