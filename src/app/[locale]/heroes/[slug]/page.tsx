import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeInfo, Shield, Swords } from "lucide-react";
import { Section } from "@/components/tbh/cards";
import { HeroPortrait } from "@/components/tbh/hero-portrait";
import { DataNotice, PageHeader, PageShell } from "@/components/tbh/page";
import {
  allSkills,
  assetPath,
  builds,
  gearPreviewItem,
  heroBySlug,
  heroName,
  heroSlug,
  skillName,
  slotNames,
  text,
  type Locale,
} from "@/lib/game-data/data";
import { heroProfile, heroWeaponLabel } from "@/lib/hero-content";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const hero = heroBySlug(slug);
  const name = hero ? heroName(hero, locale) : locale === "zh" ? "英雄" : "Hero";
  return {
    title: locale === "zh" ? `${name} 攻略｜TaskBar Hero 技能、被动与装备推荐` : `${name} Guide, Skills and Gear Direction`,
    description:
      locale === "zh"
        ? `${name} 的职业定位、基础属性、主副武器、技能树节点、推荐属性和 Build 入口。`
        : `${name} role, base stats, weapons, skill-tree nodes, priority stats, and related build routes.`,
    alternates: pageAlternates(locale, `/heroes/${slug}`),
  };
}

export default async function HeroDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const hero = heroBySlug(slug);
  if (!hero) notFound();

  const isZh = locale === "zh";
  const profile = heroProfile(hero, locale);
  const relatedBuilds = builds.filter((build) => build.hero === hero.ClassType);
  const attrs = (hero.attributes ?? []).slice(0, 24);
  const activeSkill = allSkills().find((skill) => skill.SkillKey === hero.SkillKey);
  const mainIcon = assetPath(gearPreviewItem(hero.MainWeaponGearType)?.icon);
  const subIcon = assetPath(gearPreviewItem(hero.SubWeaponGearType)?.icon);
  const slugValue = heroSlug(hero);

  const stats = [
    [isZh ? "最大生命" : "Max HP", hero.MaxHp],
    [isZh ? "护甲" : "Armor", hero.Armor],
    [isZh ? "攻击伤害" : "Attack Damage", hero.AttackDamage],
    [isZh ? "攻击速度" : "Attack Speed", hero.AttackSpeed],
    [isZh ? "施法速度" : "Cast Speed", hero.CastSpeed ? `${hero.CastSpeed}%` : null],
    [isZh ? "暴击率" : "Critical Chance", hero.CriticalChance ? `${hero.CriticalChance / 10}%` : null],
    [isZh ? "暴击伤害" : "Critical Damage", hero.CriticalDamage ? `${hero.CriticalDamage / 10}%` : null],
    [isZh ? "移动速度" : "Movement Speed", hero.MovementSpeed],
  ];

  return (
    <PageShell>
      <PageHeader
        kicker="Hero detail"
        title={heroName(hero, locale)}
        description={text(hero.DescriptionKey_i18n, locale, hero.ClassType ?? "")}
      />

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="border border-[#2a2a2a] bg-[#0d0d0d] p-4">
          <HeroPortrait heroKey={hero.HeroKey} fallbackText={heroName(hero, locale)} size="lg" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[mainIcon, subIcon].map((icon, index) => (
              <div key={index} className="flex h-20 items-center justify-center border border-[#27272a] bg-[#0a0a0a]">
                {icon ? <Image src={icon} alt="" width={54} height={54} className="object-contain" data-pixel unoptimized /> : <span className="text-xs text-[#6c6c6c]">GEAR</span>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-[#9d9d9d]">{heroWeaponLabel(hero, locale)}</p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
              <p className="text-xs text-[#6c6c6c]">{isZh ? "定位" : "Role"}</p>
              <p className="mt-2 text-lg font-semibold text-[#ffffff]">{profile.role}</p>
            </div>
            <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
              <p className="text-xs text-[#6c6c6c]">{isZh ? "上手难度" : "Difficulty"}</p>
              <p className="mt-2 text-lg font-semibold text-[#ffffff]">{profile.difficulty}</p>
            </div>
            <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
              <p className="text-xs text-[#6c6c6c]">{isZh ? "解锁" : "Unlock"}</p>
              <p className="mt-2 text-lg font-semibold text-[#ffffff]">{hero.DLCAppId ? "DLC" : hero.UnlockCost ?? "-"}</p>
            </div>
          </div>

          <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
            <p className="text-sm font-medium text-[#ffffff]">{isZh ? "使用建议" : "Usage Tips"}</p>
            <p className="mt-2 text-sm leading-7 text-[#9d9d9d]">{profile.decision}</p>
            <p className="mt-2 text-sm leading-7 text-[#9d9d9d]">{profile.risk}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(([label, value]) => (
              <div key={String(label)} className="border border-[#27272a] bg-[#0d0d0d] p-3">
                <p className="text-xs text-[#6c6c6c]">{label}</p>
                <p className="mt-1 text-base font-semibold text-[#ffffff]">{value ?? "-"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section title={isZh ? "这个英雄应该优先堆什么属性？" : "What stats should this hero prioritize?"} eyebrow={isZh ? "装备判断" : "Stat priority"}>
        <div className="grid gap-2 md:grid-cols-3">
          {profile.statPriority.map((stat) => (
            <div key={stat} className="border border-[#27272a] bg-[#0d0d0d] p-4">
              <Shield className="mb-3 h-4 w-4 text-[#d4a017]" />
              <p className="font-medium text-[#ffffff]">{stat}</p>
              <p className="mt-2 text-sm leading-6 text-[#9d9d9d]">
                {isZh ? "在物品、材料效果和 Build 页面里优先查这个方向。" : "Use this as the first filter on items, material effects, and builds."}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={isZh ? "这个英雄有什么技能和被动？" : "What skills and passives does this hero have?"} eyebrow={isZh ? "技能树" : "Skill tree"}>
        {activeSkill ? (
          <div className="mb-3 border border-[#3a2d12] bg-[#171105] p-4">
            <div className="flex items-start gap-3">
              <Swords className="mt-1 h-4 w-4 text-[#f0c040]" />
              <div>
                <p className="font-medium text-[#f1e8d5]">{skillName(activeSkill, locale)}</p>
                <p className="mt-1 text-sm text-[#9d9d9d]">
                  {activeSkill.DamageType ?? "-"} / {activeSkill.DamageDeliveryType ?? activeSkill.SLOTTYPE ?? "-"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <DataNotice>{isZh ? "这个英雄的主动技能数据尚未完整收录。下面先展示已知的被动节点和基础属性。" : "Active skill data for this hero is not yet complete. Known passive nodes and base stats are shown below."}</DataNotice>
        )}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {attrs.map((attr) => {
            const passive = attr.passive as { name_i18n?: Record<string, string>; stat?: string; value?: string } | undefined;
            const active = attr.activeSkill as { name_i18n?: Record<string, string> } | undefined;
            return (
              <div key={String(attr.key)} className="border border-[#27272a] bg-[#0d0d0d] p-3 text-sm">
                <p className="font-medium text-[#ffffff]">{text(passive?.name_i18n ?? active?.name_i18n, locale, String(attr.type ?? attr.key))}</p>
                <p className="mt-1 text-xs text-[#6c6c6c]">{String(attr.type ?? "-")} / Lv {String(attr.maxLevel ?? "-")}</p>
                {passive?.stat ? <p className="mt-1 text-xs text-[#9d9d9d]">{passive.stat}: {passive.value}</p> : null}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title={isZh ? "选了这个英雄之后该看什么？" : "What should I check after choosing this hero?"} eyebrow={isZh ? "下一步" : "Next steps"}>
        <div className="grid gap-2 md:grid-cols-3">
          <Link href={`/${locale}/items?slot=${hero.MainWeaponGearType ?? ""}`} className="border border-[#27272a] bg-[#0d0d0d] p-4 hover:border-[#d4a017]">
            <BadgeInfo className="mb-3 h-4 w-4 text-[#d4a017]" />
            <p className="font-medium text-[#ffffff]">{isZh ? "查看主武器物品" : "Open main-weapon items"}</p>
            <p className="mt-2 text-sm text-[#9d9d9d]">{hero.MainWeaponGearType ? slotNames[hero.MainWeaponGearType]?.[locale] ?? hero.MainWeaponGearType : "-"}</p>
          </Link>
          <Link href={`/${locale}/effects`} className="border border-[#27272a] bg-[#0d0d0d] p-4 hover:border-[#d4a017]">
            <Shield className="mb-3 h-4 w-4 text-[#d4a017]" />
            <p className="font-medium text-[#ffffff]">{isZh ? "匹配材料效果" : "Match material effects"}</p>
            <p className="mt-2 text-sm text-[#9d9d9d]">{profile.statPriority.join(" / ")}</p>
          </Link>
          <Link href={`/${locale}/guides/beginner/class-guide`} className="border border-[#27272a] bg-[#0d0d0d] p-4 hover:border-[#d4a017]">
            <ArrowRight className="mb-3 h-4 w-4 text-[#d4a017]" />
            <p className="font-medium text-[#ffffff]">{isZh ? "阅读职业选择指南" : "Read class guide"}</p>
            <p className="mt-2 text-sm text-[#9d9d9d]">{isZh ? "用阶段、武器和风险反推职业。" : "Choose by phase, weapons, and risk."}</p>
          </Link>
        </div>
      </Section>

      <Section title={isZh ? "这个英雄有什么推荐 Build？" : "Which builds work for this hero?"} eyebrow={isZh ? "证据等级" : "Evidence level"}>
        {relatedBuilds.length ? (
          <div className="grid gap-2 md:grid-cols-3">
            {relatedBuilds.map((build) => (
              <Link key={build.slug} href={`/${locale}/builds/${build.slug}`} className="border border-[#27272a] bg-[#0d0d0d] p-4 hover:border-[#d4a017]">
                <p className="text-[#ffffff]">{build.title[locale]}</p>
                <p className="mt-2 text-xs text-[#6c6c6c]">{build.evidence}</p>
              </Link>
            ))}
          </div>
        ) : (
          <DataNotice>
            {isZh
              ? `${heroName(hero, locale)} 的精选 Build 还没有发布。你可以先参考上方的属性方向和职业定位来配装，等 Build 更新后再来查看。`
              : `No curated build for ${heroName(hero, locale)} is available yet. Use the stat direction and role info above to plan your gear, and check back when builds are added.`}
          </DataNotice>
        )}
      </Section>

      <p className="sr-only">{slugValue}</p>
    </PageShell>
  );
}
