import type { Metadata } from "next";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/tbh/badges";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { builds, heroBySlug, heroName, SITE_URL, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TBH Build 路线推荐｜6 英雄配装、属性优先与符文方向" : "TBH Build Routes — 6 Heroes Gear, Stats & Rune Direction",
    description: locale === "zh"
      ? `基于游戏真实数据的 TBH Build 推荐：${builds.map((b) => b.title.zh).join("、")}。每条路线标注证据等级和适用阶段。`
      : `Data-driven TBH build routes: ${builds.map((b) => b.title.en).join(", ")}. Each route labeled with evidence level and phase.`,
    alternates: pageAlternates(locale, "/builds"),
  };
}

export default async function BuildsPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";

  const phaseLabels: Record<string, string> = isZh
    ? { early: "前期", mid: "中期", endgame: "后期" }
    : { early: "Early Game", mid: "Mid Game", endgame: "Endgame" };

  const goalLabels: Record<string, string> = isZh
    ? { survival: "生存", farming: "刷图", materials: "材料" }
    : { survival: "Survival", farming: "Farming", materials: "Materials" };

  // Group builds by phase
  const byPhase: Record<string, typeof builds> = {};
  for (const build of builds) {
    if (!byPhase[build.phase]) byPhase[build.phase] = [];
    byPhase[build.phase].push(build);
  }

  return (
    <PageShell>
      <SeoJsonLd data={[{
        "@context": "https://schema.org", "@type": "ItemList",
        name: isZh ? "TBH Build 路线" : "TBH Build Routes",
        numberOfItems: builds.length,
        itemListElement: builds.map((b, i) => ({
          "@type": "ListItem", position: i + 1,
          name: b.title[locale] ?? b.title.en ?? "",
          url: `${SITE_URL}/${locale}/builds/${b.slug}`,
        })),
      }]} />
      <PageHeader
        kicker="Builds"
        title={isZh ? "Build 路线推荐" : "Build Routes"}
        description={
          isZh
            ? `${builds.length} 条配装路线，覆盖全部 6 个英雄的前期、中期和后期阶段。`
            : `${builds.length} build routes covering all 6 heroes across early, mid, and endgame phases.`
        }
      />

      {/* How to use this page */}
      <div className="mb-8 grid gap-3 md:grid-cols-3">
        <div className="border border-amber-600/30 bg-amber-600/5 p-4">
          <p className="text-xs font-semibold text-amber-400">{isZh ? "1. 选阶段" : "1. Pick Phase"}</p>
          <p className="mt-1 text-xs text-[#9d9d9d]">
            {isZh ? "前期 Build 优先生存和稳定推进，中期侧重清图效率，后期围绕高价值材料。" : "Early builds prioritize survival, mid builds focus on clear speed, endgame builds target high-value materials."}
          </p>
        </div>
        <div className="border border-amber-600/30 bg-amber-600/5 p-4">
          <p className="text-xs font-semibold text-amber-400">{isZh ? "2. 看属性" : "2. Check Stats"}</p>
          <p className="mt-1 text-xs text-[#9d9d9d]">
            {isZh ? "每个 Build 都基于真实英雄属性推导。去英雄页看雷达图，理解为什么推荐这些属性。" : "Each build is derived from real hero stats. Visit hero pages for radar charts to understand stat priorities."}
          </p>
        </div>
        <div className="border border-amber-600/30 bg-amber-600/5 p-4">
          <p className="text-xs font-semibold text-amber-400">{isZh ? "3. 验证路线" : "3. Verify Route"}</p>
          <p className="mt-1 text-xs text-[#9d9d9d]">
            {isZh ? "用物品掉落热力图和市场价查看装备获取难度和成本。" : "Check gear availability and cost with drop heatmaps and market prices."}
          </p>
        </div>
      </div>

      {/* Builds by phase */}
      {(["early", "mid", "endgame"] as const).map((phase) => {
        const phaseBuilds = byPhase[phase];
        if (!phaseBuilds?.length) return null;
        return (
          <section key={phase} className="mb-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-amber-400">
              {phaseLabels[phase]}
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {phaseBuilds.map((build) => {
                const heroData = heroBySlug(build.hero.toLowerCase());
                return (
                  <Link
                    key={build.slug}
                    href={`/${locale}/builds/${build.slug}`}
                    className="group border border-[#27272a] bg-[#0d0d0d] p-4 transition-colors hover:border-amber-600/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-[#18181b] px-2 py-0.5 text-[10px] text-[#6c6c6c]">
                        {heroData ? heroName(heroData, locale) : build.hero}
                        {heroData?.DLCAppId ? " DLC" : ""}
                      </span>
                      <span className="text-[10px] text-[#6c6c6c]">{goalLabels[build.goal] ?? build.goal}</span>
                    </div>
                    <p className="mt-2 font-medium text-white group-hover:text-amber-400 transition-colors">
                      {build.title[locale]}
                    </p>
                    <p className="mt-2 text-xs leading-6 text-[#9d9d9d]">
                      {build.description[locale]}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <ConfidenceBadge value={build.evidence === "editorial" ? "medium" : "low"} locale={locale} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Evidence explanation */}
      <div className="rounded-sm border border-[#27272a] bg-[#0d0d0d] p-4 text-xs text-[#6c6c6c]">
        <p className="font-semibold text-[#9d9d9d]">{isZh ? "证据等级说明" : "Evidence Levels"}</p>
        <ul className="mt-2 space-y-1">
          <li>• <span className="text-green-400">datamined</span> — {isZh ? "数据直接来自游戏文件" : "Data directly from game files"}</li>
          <li>• <span className="text-amber-400">editorial</span> — {isZh ? "基于游戏数据的编辑分析和推荐" : "Editorial analysis based on game data"}</li>
          <li>• <span className="text-blue-400">community</span> — {isZh ? "来自社区贡献和验证" : "Community contributed and verified"}</li>
          <li>• <span className="text-zinc-400">unverified</span> — {isZh ? "理论推导，未经充分实战验证" : "Theoretical derivation, not battle-tested"}</li>
        </ul>
      </div>
    </PageShell>
  );
}
