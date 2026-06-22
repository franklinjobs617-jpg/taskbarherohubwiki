import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Boxes, Calculator, Cpu, Wrench } from "lucide-react";
import { ConfidenceBadge, RarityBadge } from "@/components/tbh/badges";
import { ItemCard, MarketPrice, Section } from "@/components/tbh/cards";
import { DropHeatmap } from "@/components/tbh/drop-heatmap";
import { DropSourceDetails, ItemQuickAnswer } from "@/components/tbh/item-drop-details";
import { PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { allItems, assetPath, dropsForItem, hasDropData, itemBySlug, itemDetail, itemName, marketForItem, shouldIndexItem, slotNames, text, type Locale } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

function itemContext(itemSlug: string, itemType: string, locale: Locale): string | null {
  const isZh = locale === "zh";
  const isJa = locale === "ja";

  if (itemType === "MATERIAL") {
    if (itemSlug.includes("ruby") || itemSlug.includes("sapphire") || itemSlug.includes("topaz") || itemSlug.includes("emerald") || itemSlug.includes("amethyst") || itemSlug.includes("diamond") || itemSlug.includes("pearl") || itemSlug.includes("crystal") || itemSlug.includes("shard") || itemSlug.includes("stone")) {
      if (isZh) return "DECORATION 材料。嵌入装备获得属性加成。不同部位（武器/护甲/饰品）效果不同，优先匹配你当前职业的堆属性方向。";
      if (isJa) return "DECORATION 素材。装備に埋め込んでステータスボーナスを得る。部位（武器/防具/アクセサリー）によって効果が異なり、職業の優先ステータスに合わせて選ぶ。";
      return "DECORATION material. Socket into gear for stat bonuses. Different slots (weapon/armor/accessory) give different effects — match your class stat priority.";
    }
    if (itemSlug.includes("ingot") || itemSlug.includes("nugget") || itemSlug.includes("wood") || itemSlug.includes("leather") || itemSlug.includes("ore") || itemSlug.includes("herb") || itemSlug.includes("bone") || itemSlug.includes("claw") || itemSlug.includes("hide") || itemSlug.includes("fang") || itemSlug.includes("silk") || itemSlug.includes("blood") || itemSlug.includes("spore") || itemSlug.includes("sap") || itemSlug.includes("feather") || itemSlug.includes("scale") || itemSlug.includes("horn") || itemSlug.includes("beak") || itemSlug.includes("ash") || itemSlug.includes("bile") || itemSlug.includes("essence") || itemSlug.includes("ink") || itemSlug.includes("marrow") || itemSlug.includes("mucus") || itemSlug.includes("ichor") || itemSlug.includes("tendril") || itemSlug.includes("venom") || itemSlug.includes("dice")) {
      if (isZh) return "CRAFTING 材料。用于合成装备的基础原料。通过宝箱掉落获取，优先去颜色最深的关卡刷。可在 Hero-dric Cube 中使用。";
      if (isJa) return "CRAFTING 素材。装備を作るための基礎原料。宝箱からドロップし、色が最も濃いステージで集めるのが効率的。Hero-dric Cube で使用。";
      return "CRAFTING material. Base ingredient for synthesizing gear. Obtained from chest drops — farm the darkest stages on the heatmap. Used in the Hero-dric Cube.";
    }
    if (itemSlug.includes("soulstone")) {
      if (isZh) return "SOULSTONE 材料。击败特定 Boss 获取，用于英雄强化。不同难度（Normal/Nightmare/Hell/Torment）产出不同等级。";
      if (isJa) return "SOULSTONE 素材。特定ボスを倒して入手し、英雄強化に使用。難易度（Normal/Nightmare/Hell/Torment）によって入手できる等級が異なる。";
      return "SOULSTONE material. Obtained from specific boss kills. Used for hero enhancement. Different difficulties (Normal/Nightmare/Hell/Torment) yield different grades.";
    }
    if (itemSlug.includes("scroll")) {
      if (isZh) return "INSCRIPTION 材料。铭文卷轴，赋予装备特殊词缀。稀有度越高效果越强。";
      if (isJa) return "INSCRIPTION 素材。装備に特殊な接辞を付与する巻物。レア度が高いほど効果が強い。";
      return "INSCRIPTION material. Scrolls that grant special affixes to gear. Higher rarity = stronger effects.";
    }
    if (itemSlug.includes("coin")) {
      if (isZh) return "纪念币。活动限定物品，部分可在 Steam 市场交易。查看市场价格判断流通性。";
      if (isJa) return "記念コイン。イベント限定アイテム。一部は Steam マーケットで取引可能。市場価格で流通性を判断。";
      return "Anniversary coin. Event-limited item. Some are tradable on Steam Market — check listings for liquidity.";
    }
  }

  if (itemType === "STAGEBOX") {
    if (isZh) return "关卡宝箱。击败 Boss 或怪物后掉落。每个宝箱有独立的物品池和概率。点击热力图查看该宝箱在哪些关卡掉落。";
    if (isJa) return "ステージボックス。ボスまたはモンスター撃破後にドロップ。各ボックスは独立したアイテムプールと確率を持つ。ヒートマップで落ちるステージを確認。";
    return "Stage box. Drops after defeating bosses or monsters. Each box has its own item pool and probability. Use the heatmap to find which stages drop this box.";
  }

  if (itemType === "GEAR") {
    if (isZh) return `装备物品。${itemSlug.includes("sword") || itemSlug.includes("blade") ? "剑类武器，适合 Knight。" : itemSlug.includes("bow") || itemSlug.includes("crossbow") ? "弓/弩类武器，适合 Ranger/Hunter。" : itemSlug.includes("staff") || itemSlug.includes("scepter") || itemSlug.includes("tome") || itemSlug.includes("orb") ? "法系武器，适合 Sorcerer。" : itemSlug.includes("armor") || itemSlug.includes("helmet") || itemSlug.includes("shield") ? "防具，所有职业可用，优先高等级。" : "检查属性是否匹配你的职业优先属性。"}`;
    if (isJa) return `装備アイテム。${itemSlug.includes("sword") || itemSlug.includes("blade") ? "剣系武器。Knight 向け。" : itemSlug.includes("bow") || itemSlug.includes("crossbow") ? "弓/クロスボウ系武器。Ranger/Hunter 向け。" : itemSlug.includes("staff") || itemSlug.includes("scepter") || itemSlug.includes("tome") || itemSlug.includes("orb") ? "魔法系武器。Sorcerer 向け。" : itemSlug.includes("armor") || itemSlug.includes("helmet") || itemSlug.includes("shield") ? "防具。全職業で使用可能。高レベルのものを優先。" : "ステータスが職業の優先属性と一致するか確認。"}`;
    return `Equipment item. ${itemSlug.includes("sword") || itemSlug.includes("blade") ? "Sword-type weapon. Best for Knight." : itemSlug.includes("bow") || itemSlug.includes("crossbow") ? "Bow/crossbow weapon. Best for Ranger/Hunter." : itemSlug.includes("staff") || itemSlug.includes("scepter") || itemSlug.includes("tome") || itemSlug.includes("orb") ? "Caster weapon. Best for Sorcerer." : itemSlug.includes("armor") || itemSlug.includes("helmet") || itemSlug.includes("shield") ? "Armor piece. All classes can use. Prioritize higher level." : "Check if stats match your class priority."}`;
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = itemBySlug(slug);
  if (!item) return { title: "Not found" };
  const name = itemName(item, locale);
  const hasDrops = hasDropData(slug);
  const dropCount = hasDrops ? dropsForItem(slug).length : 0;

  const titleByLocale: Record<string, string> = {
    zh: `${name}｜掉落位置、属性与市场状态 — TBH Wiki`,
    en: `${name} — Drop Locations, Stats & Market Price | TBH Wiki`,
    ja: `${name}｜ドロップ場所、ステータスと市場価格 — TBH Wiki`,
    ko: `${name} — 드롭 위치, 스탯 & 마켓 가격 | TBH Wiki`,
  };

  const descByLocale: Record<string, string> = {
    zh: hasDrops
      ? `${name}: ${dropCount} 个宝箱来源的完整掉落位置、属性和 Steam 市场价格。`
      : `${name}：稀有度、类型、属性。${item.type === "MATERIAL" ? "该材料可能为合成专用或活动限定，暂无常规掉落数据。" : "掉落数据收集中。"}`,
    en: hasDrops
      ? `${name}: complete drop locations from ${dropCount} chest sources, stats, and Steam Market price.`
      : `${name}: rarity, type, stats. ${item.type === "MATERIAL" ? "May be synthesis-only or event-exclusive — no regular drop data available." : "Drop data being collected."}`,
    ja: hasDrops
      ? `${name}: ${dropCount} 個の宝箱ソースからのドロップ場所、ステータス、Steam マーケット価格。`
      : `${name}：レア度、タイプ、ステータス。${item.type === "MATERIAL" ? "合成専用またはイベント限定の可能性があり、通常ドロップデータなし。" : "ドロップデータ収集中。"}`,
    ko: hasDrops
      ? `${name}: ${dropCount}개 상자 소스의 드롭 위치, 스탯, Steam 마켓 가격.`
      : `${name}: 등급, 유형, 스탯. ${item.type === "MATERIAL" ? "합성 전용 또는 이벤트 한정일 수 있음." : "드롭 데이터 수집 중."}`,
  };

  return {
    title: titleByLocale[locale] ?? titleByLocale.en,
    description: descByLocale[locale] ?? descByLocale.en,
    alternates: { canonical: locale === "en" ? `/items/${slug}` : `/${locale}/items/${slug}`, languages: { zh: `/zh/items/${slug}`, en: `/items/${slug}`, ja: `/ja/items/${slug}`, ko: `/ko/items/${slug}`, "x-default": `/items/${slug}` } },
    robots: shouldIndexItem(slug) ? undefined : { index: false, follow: true },
  };
}

export default async function ItemDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const item = itemBySlug(slug);
  if (!item) notFound();
  const detail = itemDetail(item.id);
  const market = marketForItem(item);
  const name = itemName(item, locale);
  const enName = itemName(item, "en");
  const isZh = locale === "zh";
  const icon = assetPath(item.icon);
  const description = text(detail?.desc, locale, "");
  const related = allItems().filter((entry) => entry.id !== item.id && (entry.grade === item.grade || entry.gear === item.gear) && entry.type === item.type).slice(0, 8);
  const context = itemContext(slug, item.type, locale);
  const hasDrops = hasDropData(slug);
  const drops = dropsForItem(slug);
  const lpath = (path: string) => localizedPath(locale, path);
  const isEntityGapTarget = slug.includes("soulstone") || slug.includes("anniversary-coin") || enName === "Stage Boss Box 6";

  return (
    <PageShell>
      <SeoJsonLd data={[
        { "@context": "https://schema.org", "@type": "WebPage", name, inLanguage: locale, dateModified: "2026-06-08" },
        ...(item.marketable ? [{
          "@context": "https://schema.org",
          "@type": "Product",
          name,
          description: context ?? description,
          sku: String(item.id),
          category: item.gear ? `${item.type}/${item.gear}` : item.type,
          image: icon ? [`${icon}`] : [],
          offers: market?.lowest ? {
            "@type": "Offer",
            price: market.lowest.toFixed(2),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          } : {
            "@type": "Offer",
            priceCurrency: "USD",
            availability: "https://schema.org/SoldOut",
          },
        }] : []),
      ]} />
      <nav className="mb-5 flex flex-wrap gap-2 text-xs text-[#6c6c6c]">
        <Link href={lpath("/")} className="hover:text-[#f0c040]">TBH</Link><span>/</span>
        <Link href={lpath("/items")} className="hover:text-[#f0c040]">{isZh ? "物品" : "Items"}</Link><span>/</span>
        <span className="text-[#9d9d9d]">{name}</span>
      </nav>

      <ItemQuickAnswer itemSlug={slug} marketPrice={market?.lowest} locale={locale} />

      {isEntityGapTarget ? (
        <section className="mt-6 border border-[#3a2d12] bg-[#171105] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d7b2b]">
            {isZh ? "Entity answer" : "Entity answer"}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            {isZh ? `${name} 用来做什么？` : `What is ${name} used for?`}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#d8d1c2]">
            {context ?? (isZh ? "该实体已有基础数据，但用途说明仍需结合来源、市场和关卡数据判断。" : "This entity has base data, but its use should be checked against source, market, and stage data.")}
            {" "}
            {hasDrops
              ? (isZh ? `当前记录到 ${drops.length} 个掉落来源；请以下方掉落来源和热力图为准。` : `Current data records ${drops.length} drop sources; use the drop source table and heatmap below.`)
              : "当前没有足够证据支持具体掉率结论。"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={lpath(`/tools/drop-finder?q=${encodeURIComponent(enName)}`)} className="border border-[#4a3510] bg-[#0d0d0d] px-3 py-2 text-sm text-[#f0c040] hover:border-[#d4a017]">
              {isZh ? "推荐刷取入口" : "Recommended farming entry"}
            </Link>
            <Link href={lpath("/tools/farming-calculator")} className="border border-[#4a3510] bg-[#0d0d0d] px-3 py-2 text-sm text-[#f0c040] hover:border-[#d4a017]">
              Farming calculator
            </Link>
            {market ? (
              <Link href={lpath(`/market/${item.slug}`)} className="border border-[#4a3510] bg-[#0d0d0d] px-3 py-2 text-sm text-[#f0c040] hover:border-[#d4a017]">
                {isZh ? "市场链接" : "Market link"}
              </Link>
            ) : null}
            {item.type === "MATERIAL" ? (
              <Link href={lpath("/cube")} className="border border-[#4a3510] bg-[#0d0d0d] px-3 py-2 text-sm text-[#f0c040] hover:border-[#d4a017]">
                Hero-dric Cube
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="h-fit border border-[#27272a] bg-[#0d0d0d] p-5 lg:sticky lg:top-16">
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-[#3b3b3b] bg-[#0a0a0a]">
              {icon ? <Image src={icon} alt={`${name} item icon`} width={80} height={80} className="object-contain" data-pixel unoptimized /> : <span className="text-xs text-[#6c6c6c]">No image</span>}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-[#f1e8d5]">{name}</h1>
              {enName !== name ? <p className="mt-1 text-sm text-[#6c6c6c]">{enName}</p> : null}
              <p className="mt-2 text-xs text-[#6c6c6c]">ID {item.id}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <RarityBadge grade={item.grade} locale={locale} />
            <span className="border border-[#3b3b3b] px-2 py-0.5 text-[11px] text-[#9d9d9d]">{item.type}</span>
            {item.gear ? <span className="border border-[#3b3b3b] px-2 py-0.5 text-[11px] text-[#9d9d9d]">{slotNames[item.gear]?.[locale] ?? item.gear}</span> : null}
            {item.level ? <span className="border border-[#3b3b3b] px-2 py-0.5 text-[11px] text-[#9d9d9d]">Lv.{item.level}</span> : null}
          </div>
          <div className="mt-5 border-t border-[#27272a] pt-4">
            <p className="text-xs text-[#6c6c6c]">{isZh ? "市场状态" : "Market status"}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <MarketPrice item={item} />
              <ConfidenceBadge value={market?.confidence ?? "missing"} />
            </div>
            {market ? <Link href={lpath(`/market/${item.slug}`)} className="mt-2 inline-block text-xs text-[#f0c040] hover:underline">{isZh ? "查看市场状态" : "Open market status"}</Link> : null}
          </div>
        </aside>
        <div className="space-y-8">
          {/* Why this matters */}
          {context && (
            <div className="rounded-sm border-l-[3px] border-amber-500 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-[#9d9d9d]">
              <strong className="text-amber-400">{isZh ? "📌 " : "📌 "}{isZh ? "用途" : "Purpose"}:</strong>{" "}{context}
            </div>
          )}

          {/* Empty state for no drops */}
          {!hasDrops && item.type === "MATERIAL" && (
            <div className="rounded-sm border border-amber-600/30 bg-amber-600/5 p-4 text-sm leading-6 text-[#9d9d9d]">
              <p className="font-semibold text-amber-400">{isZh ? "⚠️ 该物品暂无常规掉落数据" : "⚠️ No regular drop data available"}</p>
              <p className="mt-1">
                {isZh
                  ? "此材料可能是合成专用、活动限定或尚未实装。你可以："
                  : "This material may be synthesis-only, event-exclusive, or not yet implemented. You can:"}
              </p>
              <ul className="mt-2 space-y-1">
                <li>• <Link href={lpath("/cube")} className="text-amber-400 hover:underline">{isZh ? "查看 Cube 系统" : "Check Cube system"}</Link> — {isZh ? "了解材料分类和用途" : "learn material types and uses"}</li>
                <li>• <Link href={lpath("/tools/farming-calculator")} className="text-amber-400 hover:underline">{isZh ? "使用 Farming 计算器" : "Use Farming Calculator"}</Link> — {isZh ? "搜索其他可刷取材料" : "find other farmable materials"}</li>
                {market?.lowest ? (
                  <li>• <Link href={lpath(`/market/${item.slug}`)} className="text-amber-400 hover:underline">{isZh ? "查看 Steam 市场" : "View Steam Market"}</Link> — {isZh ? `当前有 ${market.listings ?? "?"} 个挂单，可直接购买` : `${market.listings ?? "?"} listings available for direct purchase`}</li>
                ) : null}
              </ul>
            </div>
          )}

          {/* Drop Heatmap */}
          {hasDrops && (
            <Section title={isZh ? "掉落热力图" : "Drop Heatmap"} eyebrow={isZh ? "点击关卡查看详情，颜色越深掉落越多" : "Click for details — darker = more drops"}>
              <DropHeatmap itemSlug={slug} locale={locale} />
            </Section>
          )}

          <Section title={isZh ? "基础信息" : "Overview"}>
            <p className="border border-[#27272a] bg-[#0d0d0d] p-4 text-sm leading-7 text-[#9d9d9d]">{description || (isZh ? "该物品的基础数据已收录。" : "Base data is available for this item.")}</p>
          </Section>

          <Section title={isZh ? "属性与合成" : "Stats & Synthesis"}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
                <p className="mb-3 text-sm font-medium text-[#ffffff]">{isZh ? "属性" : "Stats"}</p>
                {detail?.stats && Object.keys(detail.stats).length ? (
                  <dl className="grid grid-cols-2 gap-2 text-sm">{Object.entries(detail.stats).map(([key, value]) => <div key={key} className="border border-[#27272a] p-2"><dt className="text-xs text-[#6c6c6c]">{key}</dt><dd className="text-[#ffffff]">{String(value)}</dd></div>)}</dl>
                ) : <p className="text-sm text-[#6c6c6c]">{isZh ? "无结构化属性。" : "No structured stats."}</p>}
              </div>
              <div className="border border-[#27272a] bg-[#0d0d0d] p-4 text-sm text-[#9d9d9d]">
                <p><span className="text-[#6c6c6c]">{isZh ? "合成类型" : "Synthesis"}:</span> {detail?.synthType ?? "-"}</p>
                <p className="mt-2"><span className="text-[#6c6c6c]">{isZh ? "来源数据" : "Drop data"}:</span> {drops.length > 0 ? `${drops.length} ${isZh ? "个宝箱来源" : "chest sources"}` : (isZh ? "暂无掉落数据" : "No drop data")}</p>
                <p className="mt-2"><span className="text-[#6c6c6c]">ID:</span> {item.id} · <span className="text-[#6c6c6c]">{isZh ? "可交易" : "Tradable"}:</span> {item.marketable ? (isZh ? "是" : "Yes") : (isZh ? "否" : "No")}</p>
              </div>
            </div>
          </Section>

          {hasDrops && (
            <Section title={isZh ? "掉落来源详情" : "Drop Source Details"} eyebrow={isZh ? "按宝箱类型分组，点击展开" : "Grouped by chest type — click to expand"}>
              <DropSourceDetails itemSlug={slug} selectedStage={null} locale={locale} />
            </Section>
          )}

          {/* Bottom nav: prerequisite + next steps */}
          <div className="grid gap-3 border-t border-[#27272a] pt-6 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
                {isZh ? "← 相关系统" : "← Related Systems"}
              </p>
              {item.type === "MATERIAL" && (
                <Link href={lpath("/cube")} className="flex items-center gap-2 rounded-sm border border-[#27272a] bg-[#0d0d0d] p-3 text-xs transition-colors hover:border-amber-600/30 group">
                  <Cpu className="h-4 w-4 shrink-0 text-[#6c6c6c] group-hover:text-amber-400" />
                  <span className="text-[#9d9d9d] group-hover:text-white">{isZh ? "Hero-dric Cube 系统" : "Hero-dric Cube System"}</span>
                </Link>
              )}
              <Link href={lpath("/chests")} className="flex items-center gap-2 rounded-sm border border-[#27272a] bg-[#0d0d0d] p-3 text-xs transition-colors hover:border-amber-600/30 group">
                <Boxes className="h-4 w-4 shrink-0 text-[#6c6c6c] group-hover:text-amber-400" />
                <span className="text-[#9d9d9d] group-hover:text-white">{isZh ? "宝箱数据库" : "Chest Database"}</span>
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6c6c6c]">
                {isZh ? "下一步 →" : "Next Steps →"}
              </p>
              {hasDrops && (
                <Link href={lpath("/tools/farming-calculator")} className="flex items-center gap-2 rounded-sm border border-[#27272a] bg-[#0d0d0d] p-3 text-xs transition-colors hover:border-amber-600/30 group">
                  <Calculator className="h-4 w-4 shrink-0 text-[#6c6c6c] group-hover:text-amber-400" />
                  <span className="text-[#9d9d9d] group-hover:text-white">{isZh ? "Farming 计算器 — 算期望收益" : "Farming Calculator — estimate profit"}</span>
                  <ArrowRight className="ml-auto h-3 w-3 shrink-0 text-[#555] group-hover:text-amber-400" />
                </Link>
              )}
              <Link href={lpath("/effects")} className="flex items-center gap-2 rounded-sm border border-[#27272a] bg-[#0d0d0d] p-3 text-xs transition-colors hover:border-amber-600/30 group">
                <Wrench className="h-4 w-4 shrink-0 text-[#6c6c6c] group-hover:text-amber-400" />
                <span className="text-[#9d9d9d] group-hover:text-white">{isZh ? "材料效果表 — 找最佳属性" : "Material Effects — find best stats"}</span>
                <ArrowRight className="ml-auto h-3 w-3 shrink-0 text-[#555] group-hover:text-amber-400" />
              </Link>
            </div>
          </div>

          <Section title={isZh ? "相关物品" : "Related Items"}>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{related.map((entry) => <ItemCard key={entry.id} item={entry} locale={locale} />)}</div>
          </Section>
        </div>
      </section>
    </PageShell>
  );
}
