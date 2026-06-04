import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allMonsters, text, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero 怪物资料｜奖励、关卡与宠物路线" : "TaskBar Hero Monsters", alternates: pageAlternates(locale, "/monsters") };
}

export default async function MonstersPage({ params }: Props) {
  const { locale } = await params;
  return (
    <PageShell>
      <PageHeader kicker="Monsters" title={locale === "zh" ? "怪物资料" : "Monsters"} description={locale === "zh" ? "怪物、奖励、出现关卡和宠物路线的底层数据。" : "Monster rewards, stages, and pet route base data."} />
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-4">
        {allMonsters().map((monster) => <div key={monster.MonsterKey} className="border border-[#27272a] bg-[#0d0d0d] p-3"><p className="text-[#ffffff]">{text(monster.MonsterNameStringKey_i18n, locale, String(monster.MonsterKey))}</p><p className="mt-1 text-xs text-[#6c6c6c]">Gold {monster.RewardGold ?? "-"} / EXP {monster.RewardExp ?? "-"}</p></div>)}
      </div>
    </PageShell>
  );
}
