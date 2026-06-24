"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { DATA_VERSION, UPDATED_AT } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";

const T = {
  zh: {
    disclaimer: "非官方粉丝站。游戏内容归开发商所有。Steam 市场价格仅供参考，不代表成交价，不保证收益。",
    brand: "TBH: Task Bar Hero Wiki",
    tagline: "由社区维护的游戏数据 Wiki，包含 5,944 件物品、6 个职业、120 个关卡和 197 个符文。所有数据直接来自游戏文件，可独立验证。",
    privacy: "隐私政策",
    terms: "服务条款",
    contact: "联系我们",
    database: "数据库",
    systems: "系统",
    content: "内容",
    market: "市场",
    more: "更多",
    sitemap: "站点地图",
    discord: "Discord 社区",
    methodology: "数据来源说明",
  },
  en: {
    disclaimer: "Unofficial fan site. Game content belongs to the developer. Steam Market prices are references only, not sale prices or profit guarantees.",
    brand: "TBH: Task Bar Hero Wiki",
    tagline: "Community-maintained datamined wiki: 5,944 items, 6 classes, 120 stages, 197 runes. Every number pulled from the game files and independently verifiable.",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
    database: "Database",
    systems: "Systems",
    content: "Content",
    market: "Market",
    more: "More",
    sitemap: "Sitemap",
    discord: "Discord",
    methodology: "Data methodology",
  },
} as const;

export function SiteFooter() {
  const locale = useLocale();
  const t = T[locale as keyof typeof T] ?? T.en;
  const lpath = (path: string) => localizedPath(locale, path);
  const isZh = locale === "zh";

  return (
    <footer className="border-t-2 border-border-default bg-bg-canvas">
      <div className="mx-auto max-w-[1440px] px-3 py-8 sm:px-5 lg:px-6">
        <div className="mb-6 flex flex-wrap items-baseline gap-3 border-b-2 border-border-default pb-5">
          <Link href={lpath("/")} className="font-pixel text-subheading font-semibold text-accent hover:text-accent-bright">
            {t.brand}
          </Link>
          <p className="text-caption-lg text-text-muted">{t.tagline}</p>
        </div>
        <div className="grid gap-6 text-body-sm sm:grid-cols-5">
          <div>
            <p className="mb-2 font-semibold font-pixel text-caption-lg tracking-wider uppercase text-text-secondary">{t.database}</p>
            <div className="space-y-1.5">
              <Link href={lpath("/items")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "物品" : "Items"}</Link>
              <Link href={lpath("/heroes")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "英雄" : "Heroes"}</Link>
              <Link href={lpath("/monsters")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "怪物" : "Monsters"}</Link>
              <Link href={lpath("/map")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "关卡" : "Stages"}</Link>
              <Link href={lpath("/database")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "数据库" : "Database"}</Link>
            </div>
          </div>
          <div>
            <p className="mb-2 font-semibold font-pixel text-caption-lg tracking-wider uppercase text-text-secondary">{t.systems}</p>
            <div className="space-y-1.5">
              <Link href={lpath("/runes")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "符文" : "Runes"}</Link>
              <Link href={lpath("/skills")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "技能" : "Skills"}</Link>
              <Link href={lpath("/cube")} className="block text-text-muted hover:text-accent transition-colors">Cube</Link>
              <Link href={lpath("/buffs")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "Buff" : "Buffs"}</Link>
              <Link href={lpath("/effects")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "效果" : "Effects"}</Link>
            </div>
          </div>
          <div>
            <p className="mb-2 font-semibold font-pixel text-caption-lg tracking-wider uppercase text-text-secondary">{t.content}</p>
            <div className="space-y-1.5">
              <Link href={lpath("/wiki")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "百科" : "Wiki"}</Link>
              <Link href={lpath("/guides")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "攻略" : "Guides"}</Link>
              <Link href={lpath("/builds")} className="block text-text-muted hover:text-accent transition-colors">Builds</Link>
              <Link href={lpath("/achievements")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "成就" : "Achievements"}</Link>
              <Link href={lpath("/guides/farming")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "刷图指南" : "Farming Guide"}</Link>
            </div>
          </div>
          <div>
            <p className="mb-2 font-semibold font-pixel text-caption-lg tracking-wider uppercase text-text-secondary">{t.market}</p>
            <div className="space-y-1.5">
              <Link href={lpath("/market")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "Steam 市场" : "Steam Market"}</Link>
              <Link href={lpath("/tools")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "工具" : "Tools"}</Link>
              <Link href={lpath("/chests")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "宝箱" : "Chests"}</Link>
              <Link href={lpath("/pets")} className="block text-text-muted hover:text-accent transition-colors">{isZh ? "宠物" : "Pets"}</Link>
            </div>
          </div>
          <div>
            <p className="mb-2 font-semibold font-pixel text-caption-lg tracking-wider uppercase text-text-secondary">{t.more}</p>
            <div className="space-y-1.5">
              <Link href="/sitemap.xml" className="block text-text-muted hover:text-accent transition-colors">{t.sitemap}</Link>
              <a href="https://discord.gg/kSRUY8N8GA" target="_blank" rel="noopener noreferrer" className="block text-text-muted hover:text-accent transition-colors">{t.discord} ↗</a>
              <Link href={lpath("/about")} className="block text-text-muted hover:text-accent transition-colors">{t.methodology}</Link>
              <a href="https://buymeacoffee.com/flaviomorek" target="_blank" rel="noopener noreferrer" className="block text-text-muted hover:text-accent transition-colors">Buy me a coffee ↗</a>
              <a href="https://bombanana.online/" target="_blank" rel="noopener noreferrer" className="block text-text-muted hover:text-accent transition-colors">Bombanana ↗</a>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-2 border-border-default pt-4 text-caption-lg text-text-muted">
          <p>
            {t.disclaimer}
            <span className="ml-2">{DATA_VERSION} / {UPDATED_AT}</span>
          </p>
          <div className="flex gap-4">
            <Link href={lpath("/privacy")} className="hover:text-accent">{t.privacy}</Link>
            <Link href={lpath("/terms")} className="hover:text-accent">{t.terms}</Link>
            <Link href={lpath("/contact")} className="hover:text-accent">{t.contact}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
