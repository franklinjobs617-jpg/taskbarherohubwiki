import type { Metadata } from "next";
import { StageCard } from "@/components/tbh/cards";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allStages, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero 关卡地图｜怪物、Boss 与宝箱掉落" : "TaskBar Hero Stage Map", alternates: pageAlternates(locale, "/map") };
}

export default async function MapPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const stages = allStages();
  const difficulties = Array.from(new Set(stages.map((stage) => stage.difficulty)));
  return (
    <PageShell>
      <PageHeader kicker="Map" title={isZh ? "关卡地图" : "Stage Map"} description={isZh ? "按难度、Act 和关卡浏览怪物、Boss、宝箱和收益入口。" : "Browse stages by difficulty, act, boss, chests, and farming entry."} />
      {difficulties.map((difficulty) => (
        <section key={difficulty} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-[#f1e8d5]">{difficulty}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {stages.filter((stage) => stage.difficulty === difficulty).slice(0, 32).map((stage) => <StageCard key={stage.key} stage={stage} locale={locale} />)}
          </div>
        </section>
      ))}
    </PageShell>
  );
}
