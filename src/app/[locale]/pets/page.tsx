import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allMonsters, type Locale, text } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero 宠物解锁｜怪物与推荐关卡" : "TaskBar Hero Pet Unlock Route", alternates: pageAlternates(locale, "/pets") };
}

export default async function PetsPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const monsters = allMonsters().slice(0, 24);
  return (
    <PageShell>
      <PageHeader
        kicker="Pets"
        title={isZh ? "宠物解锁路线" : "Pet Unlock Route"}
        description={isZh ? "查看怪物出现关卡和击杀需求，规划宠物解锁路线。宠物属性在独立数据表完成后补充。" : "Plan pet unlock routes using monster stage appearances and kill requirements. Pet stats will be added when the dedicated data table is complete."}
      />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {monsters.map((monster) => (
          <div key={monster.MonsterKey} className="border border-[#252525] bg-[#101010] p-3">
            <p className="font-medium text-[#ddd]">{text(monster.MonsterNameStringKey_i18n, locale, `Monster ${monster.MonsterKey}`)}</p>
            <p className="mt-1 text-xs text-[#777]">{isZh ? "关联关卡数：" : "Linked stages: "}{monster.stages?.length ?? 0}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
