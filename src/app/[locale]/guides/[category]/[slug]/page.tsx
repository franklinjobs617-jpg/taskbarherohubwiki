import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Coins, PackageCheck, ShieldAlert } from "lucide-react";
import { ConfidenceBadge } from "@/components/tbh/badges";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { allItems, assetPath, itemName, marketForItem, type Locale, type RawItem } from "@/lib/game-data/data";
import { getGuideContent, getGuideStaticParams, renderMarkdownish, type MarkdownBlock } from "@/lib/guides";

type Props = { params: Promise<{ locale: Locale; category: string; slug: string }> };

const guideVisuals: Record<string, { image: string; zh: string; en: string }> = {
  "getting-started": { image: "/game/guide-images/getting-started.jpg", zh: "先把路线跑稳，再谈稀有度和市场。", en: "Stabilize the route before chasing rarity or market value." },
  "class-guide": { image: "/game/guide-images/class-guide.jpg", zh: "职业选择本质是武器路径、容错和清图目标的组合。", en: "Class choice is a mix of weapon path, safety margin, and farming goal." },
  "cube-materials": { image: "/game/guide-images/cube-materials.jpg", zh: "材料不是杂物，它们决定装备后期方向。", en: "Materials are not clutter; they define late gear direction." },
  "steam-market-guide": { image: "/game/guide-images/steam-market-guide.jpg", zh: "市场数据只做风险判断，不做收益承诺。", en: "Market data is a risk signal, not a profit promise." },
  "tradable-items": { image: "/game/guide-images/tradable-items.jpg", zh: "可交易是状态，不是立刻出售的命令。", en: "Tradable is a state, not an instruction to sell immediately." },
  "chest-drop-guide": { image: "/game/guide-images/chest-drop-guide.jpg", zh: "宝箱要同时看来源、等级范围和真实掉率。", en: "Chests need source, level range, and real drop-rate context." },
  "gold-farming-route": { image: "/game/guide-images/gold-farming-route.jpg", zh: "金币效率来自稳定清图，不来自想象中的高价掉落。", en: "Gold efficiency comes from stable clears, not imagined rare drops." },
  "exp-farming-route": { image: "/game/guide-images/exp-farming-route.jpg", zh: "经验路线要看每分钟击杀、每轮经验和清图时间。", en: "EXP routes depend on kills per minute, XP per run, and clear time." },
};

export function generateStaticParams() { return getGuideStaticParams(); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const guide = await getGuideContent(locale, category, slug);
  if (!guide) return { title: "Guide" };
  return {
    title: guide.title[locale],
    description: guide.description[locale],
    alternates: { canonical: `/${locale}/guides/${category}/${slug}`, languages: { zh: `/zh/guides/${category}/${slug}`, en: `/en/guides/${category}/${slug}`, "x-default": `/zh/guides/${category}/${slug}` } },
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const { locale, category, slug } = await params;
  const guide = await getGuideContent(locale, category, slug);
  if (!guide) notFound();
  const relatedItems = allItems().filter((i) => guide.relatedItems.includes(i.slug)).slice(0, 8);
  const visual = guideVisuals[slug] ?? guideVisuals["getting-started"];
  const isZh = locale === "zh";
  const bodyBlocks = renderMarkdownish(guide.body);
  const imageInsertIndex = bodyBlocks.findIndex((block, index) => block.type === "h2" && index > 1);

  return (
    <div className="min-h-screen bg-[#070706]" style={{ backgroundImage: "radial-gradient(circle at 18% 0%, rgba(200,121,37,0.06), transparent 34rem)" }}>
      <SeoJsonLd data={[
        { "@context": "https://schema.org", "@type": "Article", headline: guide.title[locale], description: guide.description[locale], dateModified: guide.updatedAt, inLanguage: locale },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Guides", item: `/${locale}/guides` }, { "@type": "ListItem", position: 2, name: guide.title[locale] }] },
      ]} />

      <div className="mx-auto max-w-[1080px] px-5 py-8 sm:py-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-10">
          {/* ── Main content ── */}
          <article className="min-w-0">
            {/* Breadcrumb */}
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[12px] text-[#8b8170]">
              <Link href={`/${locale}/guides`} className="hover:text-[#f0c040] transition-colors">{isZh ? "攻略" : "Guides"}</Link>
              <span className="text-[#555]">/</span>
              <span className="uppercase tracking-[0.16em] text-[#c87925]">{guide.category}</span>
            </div>

            {/* Meta badges */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <ConfidenceBadge value={guide.evidence === "datamined" ? "high" : guide.evidence === "editorial" ? "medium" : "low"} locale={locale} />
              <span className="rounded-sm border border-[#2f2b22] bg-[#0d0d0d] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#776f61]">{guide.gameVersion}</span>
              <span className="text-[12px] text-[#776f61]">{guide.updatedAt}</span>
            </div>

            {/* Title */}
            <h1 className="max-w-2xl text-[32px] font-bold leading-[1.1] text-[#f6e8c8] sm:text-[40px]">{guide.title[locale]}</h1>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#b8a98a] sm:text-[16px]">{guide.description[locale]}</p>

            {/* Key insight */}
            <div className="mt-5 border-l-[3px] border-[#c87925] bg-gradient-to-r from-[rgba(200,121,37,0.1)] to-transparent px-4 py-3 sm:px-5 sm:py-3.5">
              <p className="text-[14px] font-semibold leading-6 text-[#f0c040] sm:text-[15px]">{isZh ? visual.zh : visual.en}</p>
            </div>

            {/* Hero image */}
            <figure className="mt-7 overflow-hidden border border-[#2f2b22] bg-[#0a0a08] sm:mt-8">
              <Image src={visual.image} alt={guide.title[locale]} width={1200} height={600} className="w-full object-cover" priority unoptimized />
            </figure>

            {/* TL;DR Quick Take */}
            <section className="my-8 border-y border-[#2c281f] py-6">
              <h2 className="mb-4 text-[18px] font-semibold text-[#f6e8c8] sm:text-[20px]">{isZh ? "快速结论" : "Quick Take"}</h2>
              <ol className="space-y-3">
                {guide.tldr.map((item, i) => (
                  <li key={item} className="flex gap-3 text-[14px] leading-7 text-[#dfd2b8] sm:text-[15px]">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c87925] text-[11px] font-bold text-[#070706]">{i + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Article body */}
            <section className="space-y-5 text-[15px] leading-[1.8] text-[#d8cab0] sm:space-y-6 sm:text-[16px]">
              {bodyBlocks.map((block, i) => {
                if (i === imageInsertIndex) {
                  return (
                    <div key={`img-${i}`} className="space-y-5 sm:space-y-6">
                      <figure className="overflow-hidden border border-[#2f2b22] bg-[#0a0a08]">
                        <Image src={visual.image} alt={isZh ? "游戏界面参考" : "Gameplay reference"} width={1200} height={600} className="w-full object-cover" unoptimized />
                      </figure>
                      <BlockRender block={block} i={i} />
                    </div>
                  );
                }
                return <BlockRender key={i} block={block} i={i} />;
              })}
            </section>

            {/* Mistakes */}
            <section className="mt-12 border-t border-[#2c281f] pt-8">
              <h2 className="mb-5 text-[20px] font-semibold text-[#f6e8c8] sm:text-[22px]">{isZh ? "常见错误" : "Common Mistakes"}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {guide.mistakes.map((m) => (
                  <div key={m} className="flex gap-3 rounded-sm border border-[#2c281f] bg-[#0d0c0a] p-4">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#c87925]" />
                    <p className="text-[13px] leading-6 text-[#d8cab0] sm:text-[14px]">{m}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="mt-12 border-t border-[#2c281f] pt-8">
              <h2 className="mb-5 text-[20px] font-semibold text-[#f6e8c8] sm:text-[22px]">{isZh ? "常见问题" : "FAQ"}</h2>
              <div className="space-y-4">
                {guide.faq.map((entry) => (
                  <div key={entry.question}>
                    <h3 className="text-[16px] font-semibold text-[#f1d39a] sm:text-[18px]">{entry.question}</h3>
                    <p className="mt-2 text-[14px] leading-7 text-[#d8cab0] sm:text-[15px]">{entry.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Related items */}
            {relatedItems.length > 0 && (
              <section className="mt-12 border-t border-[#2c281f] pt-8">
                <h2 className="mb-5 text-[20px] font-semibold text-[#f6e8c8] sm:text-[22px]">{isZh ? "文中提到的物品" : "Items Mentioned"}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {relatedItems.map((item) => <RefItem key={item.id} item={item} locale={locale} />)}
                </div>
              </section>
            )}
          </article>

          {/* ── Sidebar ── */}
          <aside className="mt-12 hidden lg:block lg:sticky lg:top-24 lg:mt-0 lg:self-start">
            <div className="space-y-7">
              <SidebarBlock title={isZh ? "文章信息" : "Article"}>
                <SidebarRow label={isZh ? "版本" : "Version"} value={guide.gameVersion} />
                <SidebarRow label={isZh ? "更新" : "Updated"} value={guide.updatedAt} />
                <SidebarRow label={isZh ? "证据" : "Evidence"} value={guide.evidence} />
              </SidebarBlock>
              {relatedItems.length > 0 && (
                <SidebarBlock title={isZh ? "速查物品" : "Quick Refs"}>
                  {relatedItems.slice(0, 5).map((item) => <RefItem key={item.id} item={item} locale={locale} compact />)}
                </SidebarBlock>
              )}
              <SidebarBlock title={isZh ? "下一步" : "Next"}>
                <SidebarLink href={`/${locale}/market`} icon={<Coins className="h-3.5 w-3.5" />} label={isZh ? "市场价格" : "Market"} />
                <SidebarLink href={`/${locale}/chests`} icon={<PackageCheck className="h-3.5 w-3.5" />} label={isZh ? "宝箱掉落" : "Chests"} />
                {guide.relatedTools.map((tool) => <SidebarLink key={tool} href={`/${locale}/tools/${tool}`} icon={<Clock3 className="h-3.5 w-3.5" />} label={tool} />)}
                <SidebarLink href={`/${locale}/guides`} icon={<ArrowRight className="h-3.5 w-3.5" />} label={isZh ? "全部攻略" : "All guides"} />
              </SidebarBlock>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function BlockRender({ block, i }: { block: MarkdownBlock; i: number }) {
  if (block.type === "h2") return <h2 key={i} className="pt-4 text-[20px] font-semibold leading-tight text-[#f6e8c8] sm:pt-5 sm:text-[22px]"><Rich text={block.text} /></h2>;
  if (block.type === "h3") return <h3 key={i} className="pt-2 text-[17px] font-semibold leading-tight text-[#f1d39a] sm:text-[18px]"><Rich text={block.text} /></h3>;
  if (block.type === "ul") return <ul key={i} className="space-y-1.5">{block.items.map((item, j) => <li key={j} className="flex gap-2.5"><span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c87925]" /><span><Rich text={item} /></span></li>)}</ul>;
  if (block.type === "ol") return <ol key={i} className="space-y-1.5">{block.items.map((item, j) => <li key={j} className="flex gap-2"><span className="w-5 shrink-0 text-right text-sm font-semibold text-[#c87925]">{j + 1}.</span><span><Rich text={item} /></span></li>)}</ol>;
  if (block.type === "img") return <figure key={i} className="my-6 overflow-hidden border border-[#2f2b22] bg-[#0a0a08]"><Image src={block.src.startsWith("http") ? "/game/screenshots/screenshot-1.jpg" : block.src} alt={block.alt} width={1200} height={600} className="w-full object-cover" unoptimized /></figure>;
  if (block.type === "table") return <div key={i} className="my-6 overflow-x-auto border border-[#2c281f]"><table className="w-full min-w-[480px] text-left text-[13px] sm:text-[14px]"><thead className="bg-[#11100d] text-[11px] uppercase tracking-[0.1em] text-[#8b8170]"><tr>{block.headers.map((h) => <th key={h} className="px-3 py-2.5">{h}</th>)}</tr></thead><tbody>{block.rows.filter((r) => !r.every((c) => /^-+$/.test(c))).map((r, ri) => <tr key={ri} className="border-t border-[#2c281f]">{r.map((c, ci) => <td key={ci} className="px-3 py-2.5 text-[#d8cab0]">{c}</td>)}</tr>)}</tbody></table></div>;
  return <p key={i}><Rich text={block.text} /></p>;
}

function Rich({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="font-semibold text-[#fff2c7]">{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>)}</>;
}

function SidebarBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="border-l border-[#2c281f] pl-4"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b8170]">{title}</p><div className="space-y-1.5 text-[13px]">{children}</div></div>;
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-2"><span className="text-[#8b8170]">{label}</span><span className="text-right text-[#eadfca]">{value}</span></div>;
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return <Link href={href} className="flex items-center justify-between gap-2 rounded-sm py-1.5 text-[#d8cab0] transition-colors hover:bg-[#11100d] hover:text-[#f0c040]"><span className="flex items-center gap-2 truncate">{icon}{label}</span><ArrowRight className="h-3 w-3 shrink-0" /></Link>;
}

function RefItem({ item, locale, compact }: { item: RawItem; locale: Locale; compact?: boolean }) {
  const icon = assetPath(item.icon);
  const market = marketForItem(item);
  const name = itemName(item, locale);
  if (compact) {
    return (
      <Link href={`/${locale}/items/${item.slug}`} className="flex items-center gap-2.5 rounded-sm py-1 text-[13px] transition-colors hover:text-[#f0c040]">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#2c281f] bg-[#070706]">{icon ? <Image src={icon} alt={name} width={18} height={18} className="object-contain" data-pixel unoptimized /> : <CheckCircle2 className="h-3 w-3 text-[#8b8170]" />}</span>
        <span className="min-w-0 truncate text-[#eadfca]">{name}</span>
      </Link>
    );
  }
  return (
    <Link href={`/${locale}/items/${item.slug}`} className="flex items-center gap-3 rounded-sm border border-[#2c281f] bg-[#0d0c0a] p-3 transition-colors hover:border-[#c87925]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#2c281f] bg-[#070706]">{icon ? <Image src={icon} alt={name} width={28} height={28} className="object-contain" data-pixel unoptimized /> : <CheckCircle2 className="h-4 w-4 text-[#8b8170]" />}</span>
      <span className="min-w-0"><span className="block truncate text-[13px] font-medium text-[#eadfca]">{name}</span><span className="block text-[11px] text-[#8b8170]">{market?.lowest ? `$${market.lowest.toFixed(2)}` : item.type}</span></span>
    </Link>
  );
}
