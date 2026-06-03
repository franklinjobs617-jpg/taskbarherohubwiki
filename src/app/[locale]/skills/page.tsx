import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allSkills, skillName, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero 技能数据库｜主动技能与被动技能" : "TaskBar Hero Skills", alternates: pageAlternates(locale, "/skills") };
}

export default async function SkillsPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  return (
    <PageShell>
      <PageHeader kicker="Skills" title={isZh ? "技能数据库" : "Skills"} description={isZh ? "按主动/被动、伤害类型、冷却和关键词继续扩展筛选。" : "Expandable filters for active/passive, damage type, cooldown, and keywords."} />
      <div className="overflow-x-auto border border-[#252525]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#151515] text-xs text-[#777]"><tr><th className="px-3 py-2">Skill</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Damage</th><th className="px-3 py-2">Range</th><th className="px-3 py-2">Value</th></tr></thead>
          <tbody>{allSkills().map((skill) => <tr key={skill.SkillKey} className="border-t border-[#252525]"><td className="px-3 py-2 text-[#ddd]">{skillName(skill, locale)}</td><td className="px-3 py-2 text-[#aaa]">{skill.ACTIVATIONTYPE ?? skill.SLOTTYPE ?? "-"}</td><td className="px-3 py-2 text-[#aaa]">{skill.DamageType ?? "-"}</td><td className="px-3 py-2 text-[#aaa]">{skill.Range ?? "-"}</td><td className="px-3 py-2 text-[#aaa]">{skill.Value ?? "-"}</td></tr>)}</tbody>
        </table>
      </div>
    </PageShell>
  );
}
