import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type Locale } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";

type LinkItem = { href: string; title: string; desc: string };

const HUB_LINKS_BY_PAGE: Record<string, (locale: Locale) => LinkItem[]> = {
  "/items": (locale) => [
    { href: "/tools/drop-finder", title: locale === "zh" ? "掉落查询" : "Drop Finder", desc: locale === "zh" ? "按物品反查最佳关卡" : "Reverse-lookup the best stage for any item" },
    { href: "/chests", title: locale === "zh" ? "宝箱数据库" : "Chest Database", desc: locale === "zh" ? "按装备等级反查宝箱内容" : "Find chests by gear level" },
    { href: "/market", title: locale === "zh" ? "市场风险" : "Market Risk", desc: locale === "zh" ? "看 Sell/Keep/Farm 判断" : "Sell, Keep, or Farm decisions" },
    { href: "/heroes", title: locale === "zh" ? "英雄对比" : "Hero Comparison", desc: locale === "zh" ? "6 职业属性雷达与配装" : "Radar charts and stat matrix" },
    { href: "/guides/beginner/getting-started", title: locale === "zh" ? "新手指南" : "Beginner Guide", desc: locale === "zh" ? "前 10 小时该做什么" : "What to do in your first 10 hours" },
  ],
  "/chests": (locale) => [
    { href: "/items", title: locale === "zh" ? "物品数据库" : "Item Database", desc: locale === "zh" ? "装备、材料、5,944 条目" : "5,944 gear, materials, and chests" },
    { href: "/tools/drop-finder", title: locale === "zh" ? "掉落查询" : "Drop Finder", desc: locale === "zh" ? "宝箱里物品的刷取关卡" : "Where each chest item drops" },
    { href: "/map", title: locale === "zh" ? "关卡工作台" : "Stage Console", desc: locale === "zh" ? "关卡怪物 + 宝箱 + 收益" : "Monsters, bosses, chest contents per stage" },
    { href: "/market", title: locale === "zh" ? "市场风险" : "Market Risk", desc: locale === "zh" ? "宝箱内容是否值得卖" : "Should you sell chest contents?" },
    { href: "/guides/farming", title: locale === "zh" ? "刷图指南" : "Farming Guide", desc: locale === "zh" ? "金币、经验、装备收益排序" : "Rank farming stages by goal" },
  ],
  "/monsters": (locale) => [
    { href: "/map", title: locale === "zh" ? "关卡工作台" : "Stage Console", desc: locale === "zh" ? "看每只怪在哪关出现" : "See which stages spawn this monster" },
    { href: "/items", title: locale === "zh" ? "物品数据库" : "Item Database", desc: locale === "zh" ? "怪物掉落的装备" : "Gear dropped by monsters" },
    { href: "/chests", title: locale === "zh" ? "宝箱数据库" : "Chest Database", desc: locale === "zh" ? "Boss 掉落宝箱" : "Chests dropped by bosses" },
    { href: "/tools/drop-finder", title: locale === "zh" ? "掉落查询" : "Drop Finder", desc: locale === "zh" ? "按掉落物反查" : "Find stages by target item" },
    { href: "/guides/farming", title: locale === "zh" ? "刷图指南" : "Farming Guide", desc: locale === "zh" ? "哪只怪最划算" : "Which monster gives the best returns" },
  ],
  "/market": (locale) => [
    { href: "/items", title: locale === "zh" ? "物品数据库" : "Item Database", desc: locale === "zh" ? "查询可交易物品" : "Search tradable items" },
    { href: "/chests", title: locale === "zh" ? "宝箱数据库" : "Chest Database", desc: locale === "zh" ? "市场里的宝箱" : "Chests on the market" },
    { href: "/tools/profit-calculator", title: locale === "zh" ? "利润计算器" : "Profit Calculator", desc: locale === "zh" ? "算刷图-卖物品净收益" : "Net profit from farming then selling" },
    { href: "/tools/farming-optimizer", title: locale === "zh" ? "刷图优化器" : "Farming Optimizer", desc: locale === "zh" ? "找最赚的关卡" : "Find the most profitable stage" },
    { href: "/guides/economy/steam-market-guide", title: locale === "zh" ? "Steam 市场指南" : "Steam Market Guide", desc: locale === "zh" ? "手续费、定价策略" : "Fees, pricing, and strategy" },
  ],
  "/runes": (locale) => [
    { href: "/guides/beginner/getting-started", title: locale === "zh" ? "新手指南" : "Beginner Guide", desc: locale === "zh" ? "Rune 树什么时候点" : "When to start putting points in" },
    { href: "/builds", title: locale === "zh" ? "配装推荐" : "Builds", desc: locale === "zh" ? "Rune 选择影响 Build 路线" : "Rune choices shape your build" },
    { href: "/pets", title: locale === "zh" ? "宠物解锁" : "Pet Unlocks", desc: locale === "zh" ? "离线收益相关宠物" : "Pets that boost idle gains" },
    { href: "/items", title: locale === "zh" ? "物品数据库" : "Item Database", desc: locale === "zh" ? "符文附加属性对装备" : "Items affected by rune stats" },
    { href: "/effects", title: locale === "zh" ? "效果说明" : "Effects", desc: locale === "zh" ? "Decay/Engraving/Inscription" : "Material effects explained" },
  ],
  "/pets": (locale) => [
    { href: "/guides/beginner/getting-started", title: locale === "zh" ? "新手指南" : "Beginner Guide", desc: locale === "zh" ? "先解锁哪只宠物" : "Which pet to unlock first" },
    { href: "/map", title: locale === "zh" ? "关卡工作台" : "Stage Console", desc: locale === "zh" ? "宠物最优刷图关卡" : "Best stage for each pet target" },
    { href: "/items", title: locale === "zh" ? "物品数据库" : "Item Database", desc: locale === "zh" ? "击杀爆的装备" : "Gear that drops while you grind" },
    { href: "/market", title: locale === "zh" ? "市场风险" : "Market Risk", desc: locale === "zh" ? "宠物是否值得金币买" : "Buy pets or grind manually" },
    { href: "/runes", title: locale === "zh" ? "符文树" : "Rune Tree", desc: locale === "zh" ? "宠物槽位与解锁符文" : "Pet slot unlock runes" },
  ],
};

export function RelatedPages({ pageKey, locale }: { pageKey: keyof typeof HUB_LINKS_BY_PAGE; locale: Locale }) {
  const items = HUB_LINKS_BY_PAGE[pageKey]?.(locale) ?? [];
  if (items.length === 0) return null;
  return (
    <section className="mt-10 border-t border-[#27272a] pt-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6c6c6c]">
        {locale === "zh" ? "看完这页再看" : "Related pages"}
      </p>
      <h2 className="mt-1 text-[18px] font-semibold leading-tight text-white">
        {locale === "zh" ? "继续往下走" : "Keep going"}
      </h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={localizedPath(locale, item.href)}
            className="group flex items-start justify-between gap-3 border border-[#27272a] bg-[#0d0d0d] p-3 transition hover:border-[#d4a017]"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-[#f0c040]">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-[#9d9d9d]">{item.desc}</p>
            </div>
            <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-[#6c6c6c] group-hover:text-[#f0c040]" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
