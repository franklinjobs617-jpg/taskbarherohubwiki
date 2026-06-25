import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/tbh/breadcrumb";
import { Section } from "@/components/tbh/cards";
import { CrossLinks } from "@/components/tbh/cross-links";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { SkillIcon } from "@/components/tbh/skill-icon";
import {
  allHeroes,
  allSkills,
  ensureGameData,
  heroName,
  skillBySlug,
  skillName,
  type Locale,
} from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

function txt(locale: Locale, values: Record<string, string>) {
  return values[locale] ?? values.en ?? "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  await ensureGameData();
  const skill = skillBySlug(slug);
  return {
    title: skill ? skillName(skill, locale) : "Skill",
    alternates: pageAlternates(locale, `/skills/${slug}`),
  };
}

export async function generateStaticParams() {
  await ensureGameData();
  return allSkills().map((s) => ({ slug: s.slug ?? String(s.SkillKey) }));
}

export default async function SkillDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const skill = skillBySlug(slug);
  if (!skill) notFound();

  const isZh = locale === "zh";
  const isJa = locale === "ja";
  const name = skillName(skill, locale);
  const heroes = allHeroes();
  const skillHeroByKey = new Map<number, (typeof heroes)[number]>();
  for (const row of heroes) {
    if (row.SkillKey) {
      skillHeroByKey.set(Number(row.SkillKey), row);
    }
    for (const attr of row.attributes ?? []) {
      const activeSkill = attr.activeSkill as { key?: unknown } | undefined;
      const key = Number(activeSkill?.key);
      if (Number.isFinite(key)) {
        skillHeroByKey.set(key, row);
      }
    }
  }
  const hero = skillHeroByKey.get(Number(skill.SkillKey));
  const heroLabel = hero ? heroName(hero, locale) : null;

  // Related skills (same hero)
  const relatedSkills = hero
    ? allSkills()
        .filter((s) => skillHeroByKey.get(Number(s.SkillKey))?.HeroKey === hero.HeroKey && s.SkillKey !== skill.SkillKey)
        .slice(0, 6)
    : [];

  return (
    <PageShell>
      <Breadcrumb
        locale={locale}
        items={[
          { label: "Home", href: "/" },
          { label: isZh ? "技能" : isJa ? "スキル" : "Skills", href: "/skills" },
          { label: name },
        ]}
      />

      <PageHeader
        kicker="Skill"
        title={name}
        description={
          isZh
            ? `${skill.ACTIVATIONTYPE ?? skill.SLOTTYPE ?? "技能"} / ${skill.DamageType ?? "未知伤害类型"}`
            : `${skill.ACTIVATIONTYPE ?? skill.SLOTTYPE ?? "Skill"} / ${skill.DamageType ?? "Unknown damage type"}`
        }
      />

      {/* Overview card */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 border border-border-default bg-bg-panel p-5">
          <SkillIcon skillKey={skill.SkillKey} src={skill.icon} damageType={skill.DamageType} size={64} />
          <div>
            <p className="text-xs text-text-muted">
              {skill.ACTIVATIONTYPE ?? skill.SLOTTYPE ?? "Skill"}
            </p>
            <p className="mt-1 text-xl font-semibold text-text-primary">{name}</p>
            {heroLabel ? (
              <Link
                href={localizedPath(
                  locale,
                  `/heroes/${hero?.ClassType?.toLowerCase() ?? hero?.HeroKey}`,
                )}
                className="mt-1 inline-block text-sm text-accent-bright hover:underline"
              >
                {heroLabel}
              </Link>
            ) : null}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: { en: "Damage Type", zh: "伤害类型", ja: "ダメージタイプ" }, value: skill.DamageType ?? "-" },
            { label: { en: "Range", zh: "范围", ja: "範囲" }, value: skill.Range != null ? String(skill.Range) : "-" },
            { label: { en: "Value", zh: "数值", ja: "数値" }, value: skill.Value != null ? String(skill.Value) : "-" },
            { label: { en: "Delivery", zh: "传递方式", ja: "伝達方式" }, value: skill.DamageDeliveryType ?? "-" },
          ].map((stat) => (
            <div
              key={stat.label.en}
              className="border border-border-default bg-bg-panel p-3 text-center"
            >
              <p className="text-xs text-text-muted">{txt(locale, stat.label)}</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Level scaling table (if data available) */}
      {skill.levels && skill.levels.length > 0 ? (
        <Section title={isZh ? "等级缩放" : isJa ? "レベルスケーリング" : "Level Scaling"}>
          <div className="overflow-x-auto border border-border-default">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg-surface text-xs text-text-muted">
                <tr>
                  <th className="px-3 py-2">{isZh ? "等级" : isJa ? "Lv" : "Lv"}</th>
                  {Object.keys(skill.levels[0])
                    .filter((k) => k !== "level")
                    .map((k) => (
                      <th key={k} className="px-3 py-2">{k}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {skill.levels.map((lvl: Record<string, unknown>, i: number) => (
                  <tr key={i} className="border-t border-border-default">
                    <td className="px-3 py-2 font-mono text-text-primary">{String(lvl.level ?? i + 1)}</td>
                    {Object.keys(lvl)
                      .filter((k) => k !== "level")
                      .map((k) => (
                        <td key={k} className="px-3 py-2 text-text-secondary">{String(lvl[k] ?? "-")}</td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      {/* Related Skills */}
      {relatedSkills.length > 0 ? (
        <CrossLinks
          locale={locale}
          title={isZh ? "同英雄其他技能" : isJa ? "同じヒーローの他のスキル" : "Other skills from this hero"}
          links={relatedSkills.map((s) => ({
            href: `/skills/${s.slug ?? s.SkillKey}`,
            label: skillName(s, locale),
            meta: `${s.ACTIVATIONTYPE ?? s.SLOTTYPE ?? ""} / ${s.DamageType ?? ""}`,
          }))}
        />
      ) : null}

      {/* Related links */}
      <Section title={isZh ? "相关链接" : isJa ? "関連リンク" : "Related Links"}>
        <div className="flex flex-wrap gap-2">
          {hero ? (
            <Link
              href={localizedPath(locale, `/heroes/${hero.ClassType?.toLowerCase() ?? hero.HeroKey}`)}
              className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
            >
              <ArrowRight className="mr-1 inline h-3.5 w-3.5" />
              {heroLabel}
            </Link>
          ) : null}
          <Link
            href={localizedPath(locale, "/skills")}
            className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
          >
            {isZh ? "返回技能列表" : isJa ? "スキル一覧に戻る" : "Back to Skills"}
          </Link>
          <Link
            href={localizedPath(locale, "/wiki/skill-system")}
            className="border border-border-strong px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent-bright"
          >
            {isZh ? "技能系统百科" : isJa ? "スキルシステムWiki" : "Skill System Wiki"}
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
