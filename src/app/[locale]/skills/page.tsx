import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allHeroes, allSkills, heroName, skillName, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };
type SearchParams = Promise<{ hero?: string }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TaskBar Hero 技能数据库｜主动与被动技能" : "TaskBar Hero Skills Database",
    description: locale === "zh"
      ? "按英雄筛选主动技能和被动技能，查看伤害类型、范围、冷却和数值。"
      : "Filter active and passive skills by hero. View damage type, range, cooldown, and values.",
    alternates: pageAlternates(locale, "/skills"),
  };
}

export default async function SkillsPage({ params, searchParams }: Props & { searchParams: SearchParams }) {
  const { locale } = await params;
  const sp = await searchParams;
  const isZh = locale === "zh";
  const heroes = allHeroes();
  const skills = allSkills();

  // Build hero→skill mapping
  const heroSkills = new Map<number, typeof skills>();
  for (const hero of heroes) {
    if (hero.SkillKey) {
      const heroSkillList = skills.filter((s) => s.SkillKey === hero.SkillKey);
      if (heroSkillList.length) heroSkills.set(hero.HeroKey, heroSkillList);
    }
  }

  // Filter by hero if selected
  const selectedHero = sp.hero ? heroes.find((h) => String(h.HeroKey) === sp.hero || h.ClassType === sp.hero) : null;
  const filteredSkills = selectedHero && selectedHero.SkillKey
    ? skills.filter((s) => s.SkillKey === selectedHero.SkillKey)
    : skills;

  return (
    <PageShell>
      <PageHeader
        kicker="Skills"
        title={isZh ? "技能数据库" : "Skills Database"}
        description={isZh
          ? `共 ${skills.length} 个技能。按英雄筛选，查看技能类型、伤害、范围和数值。`
          : `${skills.length} skills total. Filter by hero to view type, damage, range, and values.`}
      />

      {/* Hero quick filters */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        <span className="self-center text-xs text-[#6c6c6c] mr-1">{isZh ? "筛选：" : "Filter:"}</span>
        <Link
          href={`/${locale}/skills`}
          className={`border px-2.5 py-1 text-xs ${!selectedHero ? "border-[#d4a017] bg-[#1a1508] text-[#f0c040]" : "border-[#3b3b3b] text-[#9d9d9d] hover:border-[#d4a017]"}`}
        >
          {isZh ? "全部" : "All"}
        </Link>
        {heroes.map((hero) => (
          <Link
            key={hero.HeroKey}
            href={`/${locale}/skills?hero=${hero.ClassType ?? hero.HeroKey}`}
            className={`border px-2.5 py-1 text-xs ${
              (selectedHero?.HeroKey === hero.HeroKey)
                ? "border-[#d4a017] bg-[#1a1508] text-[#f0c040]"
                : "border-[#3b3b3b] text-[#9d9d9d] hover:border-[#d4a017]"
            }`}
          >
            {heroName(hero, locale)}
          </Link>
        ))}
      </div>

      {/* Skills table */}
      <div className="overflow-x-auto border border-[#27272a]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[#18181b] text-xs text-[#6c6c6c]">
            <tr>
              <th className="px-3 py-2.5">{isZh ? "技能名" : "Skill"}</th>
              <th className="px-3 py-2.5">{isZh ? "类型" : "Type"}</th>
              <th className="px-3 py-2.5">{isZh ? "伤害类型" : "Damage"}</th>
              <th className="px-3 py-2.5">{isZh ? "范围" : "Range"}</th>
              <th className="px-3 py-2.5">{isZh ? "数值" : "Value"}</th>
              {selectedHero ? null : <th className="px-3 py-2.5">{isZh ? "英雄" : "Hero"}</th>}
            </tr>
          </thead>
          <tbody>
            {filteredSkills.map((skill) => {
              const hero = heroes.find((h) => h.SkillKey === skill.SkillKey);
              return (
                <tr key={skill.SkillKey} className="border-t border-[#27272a] hover:bg-[#0d0d0d]">
                  <td className="px-3 py-3 font-medium text-[#ffffff]">{skillName(skill, locale)}</td>
                  <td className="px-3 py-3 text-[#9d9d9d]">{skill.ACTIVATIONTYPE ?? skill.SLOTTYPE ?? "-"}</td>
                  <td className="px-3 py-3 text-[#9d9d9d]">{skill.DamageType ?? "-"}</td>
                  <td className="px-3 py-3 text-[#9d9d9d]">{skill.Range ?? "-"}</td>
                  <td className="px-3 py-3 text-[#9d9d9d]">{skill.Value ?? "-"}</td>
                  {selectedHero ? null : (
                    <td className="px-3 py-3">
                      {hero ? (
                        <Link href={`/${locale}/heroes/${hero.ClassType?.toLowerCase() ?? hero.HeroKey}`} className="text-[#f0c040] hover:underline">
                          {heroName(hero, locale)}
                        </Link>
                      ) : <span className="text-[#6c6c6c]">-</span>}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
