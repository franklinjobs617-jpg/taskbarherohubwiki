import type { Metadata } from "next";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeInfo, Shield, Swords } from "lucide-react";
import { Breadcrumb } from "@/components/tbh/breadcrumb";
import { FaqBlock } from "@/components/tbh/faq-block";
import { entityFaqs } from "@/lib/game-data/faqs";
import { Section } from "@/components/tbh/cards";
import { HeroPortrait } from "@/components/tbh/hero-portrait";
import { DataNotice, PageHeader, PageShell } from "@/components/tbh/page";
import {
  allSkills,
  assetPath,
  builds,
  ensureGameData,
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
  await ensureGameData();
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
  const phase = relatedBuilds[0]?.phase ?? profile.phase;
  const classSynonym =
    hero.ClassType === "Ranger"
      ? " Rangers are the archer-style bow class, so bow speed and physical scaling matter."
      : hero.ClassType === "Hunter"
        ? " Hunter is the crossbow DLC class, so evaluate the DLC purchase before planning around it."
        : "";
  const quickAnswer = isZh
    ? `${heroName(hero, locale)} 的推荐路线应先看阶段、核心属性和装备可得性。当前推荐阶段：${phase}。核心属性优先参考 ${profile.statPriority.join(" / ")}，装备方向先从 ${heroWeaponLabel(hero, locale)} 与材料效果筛选开始。风险点：${profile.risk} 证据等级：editorial route based on datamined stats；不是官方 meta 排名，也不是无条件 best build。当前没有足够证据支持无来源的掉率、收益或绝对强度结论。`
    : `${heroName(hero, locale)} should be planned by phase, core stats, and gear availability, not by an unsupported best-build claim. Recommended phase: ${phase}. Prioritize ${profile.statPriority.join(", ")} and start gear filtering from ${heroWeaponLabel(hero, locale)} plus material effects.${classSynonym} Main risk: ${profile.risk} Evidence level: editorial route based on current datamined stats, with build advice treated as a recommended route rather than an official meta ranking. 当前没有足够证据支持这个结论。 for any exact drop rate, profit, or power ranking without source data.`;

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
      <Breadcrumb locale={locale} items={[{ label: "Home", href: "/" }, { label: isZh ? "英雄" : locale === "ja" ? "ヒーロー" : "Heroes", href: "/heroes" }, { label: heroName(hero, locale) }]} />
      <PageHeader
        kicker="Hero detail"
        title={heroName(hero, locale)}
        description={text(hero.DescriptionKey_i18n, locale, hero.ClassType ?? "")}
      />

      <section className="mb-6 border border-[#3a2d12] bg-[#171105] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d7b2b]">
          {isZh ? "Quick answer" : "Quick answer"}
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">
          {isZh ? `${heroName(hero, locale)} 配装路线怎么选？` : `How should you build ${heroName(hero, locale)}?`}
        </h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{quickAnswer}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="border border-border-strong bg-bg-panel p-4">
          <HeroPortrait heroKey={hero.HeroKey} fallbackText={heroName(hero, locale)} size="lg" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[mainIcon, subIcon].map((icon, index) => (
              <div key={index} className="flex h-20 items-center justify-center border border-border-default bg-bg-canvas">
                {icon ? <SafeImage src={icon} alt="" width={54} height={54} className="object-contain" data-pixel unoptimized /> : <span className="text-xs text-text-muted">GEAR</span>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-text-secondary">{heroWeaponLabel(hero, locale)}</p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="border border-border-default bg-bg-panel p-4">
              <p className="text-xs text-text-muted">{isZh ? "定位" : "Role"}</p>
              <p className="mt-2 text-lg font-semibold text-text-primary">{profile.role}</p>
            </div>
            <div className="border border-border-default bg-bg-panel p-4">
              <p className="text-xs text-text-muted">{isZh ? "上手难度" : "Difficulty"}</p>
              <p className="mt-2 text-lg font-semibold text-text-primary">{profile.difficulty}</p>
            </div>
            <div className="border border-border-default bg-bg-panel p-4">
              <p className="text-xs text-text-muted">{isZh ? "解锁" : "Unlock"}</p>
              <p className="mt-2 text-lg font-semibold text-text-primary">{hero.DLCAppId ? "DLC" : hero.UnlockCost ?? "-"}</p>
            </div>
          </div>

          <div className="border border-border-default bg-bg-panel p-4">
            <p className="text-sm font-medium text-text-primary">{isZh ? "使用建议" : "Usage Tips"}</p>
            <p className="mt-2 text-sm leading-7 text-text-secondary">{profile.decision}</p>
            <p className="mt-2 text-sm leading-7 text-text-secondary">{profile.risk}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(([label, value]) => (
              <div key={String(label)} className="border border-border-default bg-bg-panel p-3">
                <p className="text-xs text-text-muted">{label}</p>
                <p className="mt-1 text-base font-semibold text-text-primary">{value ?? "-"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section title={isZh ? "这个英雄应该优先堆什么属性？" : "What stats should this hero prioritize?"} eyebrow={isZh ? "装备判断" : "Stat priority"}>
        <div className="grid gap-2 md:grid-cols-3">
          {profile.statPriority.map((stat) => (
            <div key={stat} className="border border-border-default bg-bg-panel p-4">
              <Shield className="mb-3 h-4 w-4 text-accent" />
              <p className="font-medium text-text-primary">{stat}</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
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
              <Swords className="mt-1 h-4 w-4 text-accent-bright" />
              <div>
                <p className="font-medium text-text-primary">{skillName(activeSkill, locale)}</p>
                <p className="mt-1 text-sm text-text-secondary">
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
              <div key={String(attr.key)} className="border border-border-default bg-bg-panel p-3 text-sm">
                <p className="font-medium text-text-primary">{text(passive?.name_i18n ?? active?.name_i18n, locale, String(attr.type ?? attr.key))}</p>
                <p className="mt-1 text-xs text-text-muted">{String(attr.type ?? "-")} / Lv {String(attr.maxLevel ?? "-")}</p>
                {passive?.stat ? <p className="mt-1 text-xs text-text-secondary">{passive.stat}: {passive.value}</p> : null}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title={isZh ? "选了这个英雄之后该看什么？" : "What should I check after choosing this hero?"} eyebrow={isZh ? "下一步" : "Next steps"}>
        <div className="grid gap-2 md:grid-cols-3">
          <Link href={`/${locale}/items?slot=${hero.MainWeaponGearType ?? ""}`} className="border border-border-default bg-bg-panel p-4 hover:border-accent">
            <BadgeInfo className="mb-3 h-4 w-4 text-accent" />
            <p className="font-medium text-text-primary">{isZh ? "查看主武器物品" : "Open main-weapon items"}</p>
            <p className="mt-2 text-sm text-text-secondary">{hero.MainWeaponGearType ? slotNames[hero.MainWeaponGearType]?.[locale] ?? hero.MainWeaponGearType : "-"}</p>
          </Link>
          <Link href={`/${locale}/effects`} className="border border-border-default bg-bg-panel p-4 hover:border-accent">
            <Shield className="mb-3 h-4 w-4 text-accent" />
            <p className="font-medium text-text-primary">{isZh ? "匹配材料效果" : "Match material effects"}</p>
            <p className="mt-2 text-sm text-text-secondary">{profile.statPriority.join(" / ")}</p>
          </Link>
          <Link href={`/${locale}/guides/beginner/class-guide`} className="border border-border-default bg-bg-panel p-4 hover:border-accent">
            <ArrowRight className="mb-3 h-4 w-4 text-accent" />
            <p className="font-medium text-text-primary">{isZh ? "阅读职业选择指南" : "Read class guide"}</p>
            <p className="mt-2 text-sm text-text-secondary">{isZh ? "用阶段、武器和风险反推职业。" : "Choose by phase, weapons, and risk."}</p>
          </Link>
        </div>
      </Section>

      <Section title={isZh ? "这个英雄有什么推荐 Build？" : "Which builds work for this hero?"} eyebrow={isZh ? "证据等级" : "Evidence level"}>
        {relatedBuilds.length ? (
          <div className="grid gap-2 md:grid-cols-3">
            {relatedBuilds.map((build) => (
              <Link key={build.slug} href={`/${locale}/builds/${build.slug}`} className="border border-border-default bg-bg-panel p-4 hover:border-accent">
                <p className="text-text-primary">{build.title[locale]}</p>
                <p className="mt-2 text-xs text-text-muted">{build.evidence}</p>
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

      <FaqBlock faqs={(entityFaqs.heroes?.[locale] ?? entityFaqs.heroes?.en ?? []).map(f => ({question: f.q, answer: f.a}))} title={isZh ? "常见问题" : locale === "ja" ? "よくある質問" : "FAQ"} />
    </PageShell>
  );
}
