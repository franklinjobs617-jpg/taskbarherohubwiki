import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { SkillIcon } from "@/components/tbh/skill-icon";
import { allHeroes, allSkills, heroName, skillName, type Locale , ensureHeroes, ensureSkills } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };
type SearchParams = Promise<{ hero?: string }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureHeroes();
  await ensureSkills();

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
  await ensureHeroes();
  await ensureSkills();

  const { locale } = await params;
  const sp = await searchParams;
  const isZh = locale === "zh";
  const heroes = allHeroes();
  const skills = allSkills();

  const skillHeroByKey = new Map<number, (typeof heroes)[number]>();
  for (const hero of heroes) {
    if (hero.SkillKey) {
      skillHeroByKey.set(Number(hero.SkillKey), hero);
    }
    for (const attr of hero.attributes ?? []) {
      const activeSkill = attr.activeSkill as { key?: unknown } | undefined;
      const key = Number(activeSkill?.key);
      if (Number.isFinite(key)) {
        skillHeroByKey.set(key, hero);
      }
    }
  }

  // Filter by hero if selected
  const selectedHero = sp.hero ? heroes.find((h) => String(h.HeroKey) === sp.hero || h.ClassType === sp.hero) : null;
  const filteredSkills = selectedHero && selectedHero.SkillKey
    ? skills.filter((s) => skillHeroByKey.get(Number(s.SkillKey))?.HeroKey === selectedHero.HeroKey)
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
        <span className="self-center text-xs text-text-muted mr-1">{isZh ? "筛选：" : "Filter:"}</span>
        <Link
          href={localizedPath(locale, `/skills`)}
          className={`border px-2.5 py-1 text-xs ${!selectedHero ? "border-accent bg-accent-soft text-accent-bright" : "border-border-strong text-text-secondary hover:border-accent"}`}
        >
          {isZh ? "全部" : "All"}
        </Link>
        {heroes.map((hero) => (
          <Link
            key={hero.HeroKey}
            href={localizedPath(locale, `/skills?hero=${hero.ClassType ?? hero.HeroKey}`)}
            className={`border px-2.5 py-1 text-xs ${
              (selectedHero?.HeroKey === hero.HeroKey)
                ? "border-accent bg-accent-soft text-accent-bright"
                : "border-border-strong text-text-secondary hover:border-accent"
            }`}
          >
            {heroName(hero, locale)}
          </Link>
        ))}
      </div>

      {/* Skills table */}
      <div className="overflow-x-auto border border-border-default">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-bg-surface text-xs text-text-muted">
            <tr>
              <th className="px-3 py-2.5 w-10"></th>
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
              const hero = skillHeroByKey.get(Number(skill.SkillKey));
              return (
                <tr key={skill.SkillKey} className="border-t border-border-default hover:bg-bg-panel">
                  <td className="px-3 py-3">
                    <SkillIcon skillKey={skill.SkillKey} src={skill.icon} damageType={skill.DamageType} size={28} />
                  </td>
                  <td className="px-3 py-3 font-medium text-text-primary">
                    <Link href={localizedPath(locale, `/skills/${skill.slug ?? skill.SkillKey}`)} className="text-accent-bright hover:underline">
                      {skillName(skill, locale)}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-text-secondary">{skill.ACTIVATIONTYPE ?? skill.SLOTTYPE ?? "-"}</td>
                  <td className="px-3 py-3 text-text-secondary">{skill.DamageType ?? "-"}</td>
                  <td className="px-3 py-3 text-text-secondary">{skill.Range ?? "-"}</td>
                  <td className="px-3 py-3 text-text-secondary">{skill.Value ?? "-"}</td>
                  {selectedHero ? null : (
                    <td className="px-3 py-3">
                      {hero ? (
                        <Link href={localizedPath(locale, `/heroes/${hero.ClassType?.toLowerCase() ?? hero.HeroKey}`)} className="text-accent-bright hover:underline">
                          {heroName(hero, locale)}
                        </Link>
                      ) : <span className="text-text-muted">-</span>}
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
