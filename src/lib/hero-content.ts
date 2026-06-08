import { type Hero, type Locale, slotNames } from "@/lib/game-data/data";

type HeroProfile = {
  role: string;
  difficulty: string;
  phase: string;
  playstyle: string;
  statPriority: string[];
  decision: string;
  risk: string;
};

const profiles: Record<string, Partial<Record<Locale, HeroProfile>>> = {
  Knight: {
    zh: {
      role: "稳推进前排",
      difficulty: "低",
      phase: "开荒 / 稳定刷图",
      playstyle: "用高生命、防御和盾牌容错推进，适合先熟悉关卡、宝箱和装备等级。",
      statPriority: ["生命", "防御", "格挡", "物理伤害"],
      decision: "新手推荐。高容错可以让你安全地测试未知关卡、判断装备需求和宝箱价值。",
      risk: "清图速度偏慢，后期刷材料效率不如 Ranger 或 Sorcerer。",
    },
    en: {
      role: "Stable frontliner",
      difficulty: "Low",
      phase: "Early progress / safe farming",
      playstyle: "Uses HP, armor, and shield value to survive while you learn stages, chests, and gear levels.",
      statPriority: ["HP", "Armor", "Block", "Physical damage"],
      decision: "Recommended for beginners. High survivability lets you safely test new stages and evaluate gear.",
      risk: "Slowest clear speed — less efficient for late-game material farming than Ranger or Sorcerer.",
    },
  },
  Ranger: {
    zh: {
      role: "远程清图",
      difficulty: "中",
      phase: "中期刷图 / 材料积累",
      playstyle: "依赖攻速、物理伤害和远程输出节奏，适合比较每小时经验和金币。",
      statPriority: ["攻速", "物理伤害", "暴击", "移动速度"],
      decision: "中期刷材料首选。全职业最高攻速，适合快速清图和每小时收益最大化。",
      risk: "生存能力低（HP 60, Armor 8），装备等级跟不上的时候容易暴毙。",
    },
    en: {
      role: "Ranged clearer",
      difficulty: "Medium",
      phase: "Mid-game farming / material stockpiling",
      playstyle: "Uses attack speed, physical damage, and ranged uptime to compare XP and gold per hour.",
      statPriority: ["Attack speed", "Physical damage", "Critical", "Movement speed"],
      decision: "Best for mid-game material farming. Highest base attack speed (100) for fast clears and max profit per hour.",
      risk: "Low survivability (HP 60, Armor 8). Glass cannon — dies fast if gear level lags behind.",
    },
  },
  Sorcerer: {
    zh: {
      role: "法系爆发",
      difficulty: "中高",
      phase: "中后期 / 材料效果筛选",
      playstyle: "围绕法系伤害、冷却和施法节奏建立路线，适合研究材料效果表。",
      statPriority: ["法系伤害", "冷却", "施法速度", "范围伤害"],
      decision: "后期材料效果筛选。全职业最高暴击率 50% + 暴伤 1650%，适合围绕材料效果构建输出。",
      risk: "生存能力最低（HP 50, Armor 5）。建议优先确保不被秒杀，再堆输出属性。",
    },
    en: {
      role: "Caster burst",
      difficulty: "Medium-high",
      phase: "Mid to late game / effect filtering",
      playstyle: "Builds around caster damage, cooldown, and cast rhythm, making it useful for material-effect decisions.",
      statPriority: ["Caster damage", "Cooldown", "Cast speed", "Area damage"],
      decision: "Best for late-game material effect optimization. Highest crit rate (50%) and crit damage (1650%).",
      risk: "Lowest survivability (HP 50, Armor 5). Prioritize survival baseline before stacking damage.",
    },
  },
  Priest: {
    zh: {
      role: "续航辅助",
      difficulty: "中",
      phase: "稳定推进 / 长线刷取",
      playstyle: "偏向续航、生存和稳定性，适合比较长时间挂机路线。",
      statPriority: ["生命", "恢复", "冷却", "防御"],
      decision: "长时间挂机首选。均衡的生存属性（HP 95, Armor 30）适合稳定推进和团队辅助。",
      risk: "输出能力不如专职输出职业，清图速度偏慢。",
    },
    en: {
      role: "Sustain support",
      difficulty: "Medium",
      phase: "Stable progress / long-session farming",
      playstyle: "Prioritizes sustain and safety, useful when comparing longer idle farming routes.",
      statPriority: ["HP", "Recovery", "Cooldown", "Armor"],
      decision: "Best for long idle sessions. Balanced survivability (HP 95, Armor 30) excels at stable progression and team support.",
      risk: "Lower damage output than dedicated DPS classes — slower clear speed.",
    },
  },
  Hunter: {
    zh: {
      role: "DLC 远程爆发",
      difficulty: "中高",
      phase: "进阶刷图 / DLC 路线",
      playstyle: "更适合已有装备基础后追求远程爆发和效率。",
      statPriority: ["攻速", "暴击", "物理伤害", "材料效果"],
      decision: "DLC 职业，已有装备基础后追求远程爆发效率的最佳选择。高暴击率 45% + 暴伤 1550%。",
      risk: "需要购买 DLC。不适合作为第一个职业开荒，建议先用免费职业积累装备。",
    },
    en: {
      role: "DLC ranged burst",
      difficulty: "Medium-high",
      phase: "Advanced farming / DLC route",
      playstyle: "Better once the user has gear and wants ranged burst efficiency.",
      statPriority: ["Attack speed", "Critical", "Physical damage", "Material effects"],
      decision: "DLC hero. Best for ranged burst efficiency once you have a gear foundation. High crit rate (45%) and crit damage (1550%).",
      risk: "Requires DLC purchase. Not recommended as starter — build gear on free classes first.",
    },
  },
  Slayer: {
    zh: {
      role: "DLC 高风险输出",
      difficulty: "高",
      phase: "后期 / 输出路线",
      playstyle: "偏向高输出和更激进的路线，适合已有数据后做 Build 页面。",
      statPriority: ["伤害", "暴击", "攻速", "生存底线"],
      decision: "DLC 后期极限输出。全职业最高暴击伤害 1800%，适合追求极限输出的玩家。",
      risk: "技能消耗 HP，操作失误容易暴毙。需要吸血/回复装备支撑。不适合新手。需要购买 DLC。",
    },
    en: {
      role: "DLC high-risk damage",
      difficulty: "High",
      phase: "Late game / damage route",
      playstyle: "A more aggressive damage route that needs stronger evidence before build claims.",
      statPriority: ["Damage", "Critical", "Attack speed", "Minimum survival"],
      decision: "DLC endgame DPS. Highest crit damage (1800%) in the game — built for max output.",
      risk: "Skills cost HP — needs lifesteal/regen gear. High risk, high reward. Requires DLC. Not beginner-friendly.",
    },
  },
};

const fallback: Partial<Record<Locale, HeroProfile>> = {
  zh: {
    role: "资料待分类",
    difficulty: "未评估",
    phase: "需要结合数据判断",
    playstyle: "先看基础属性、武器类型和技能节点，再决定装备方向。",
    statPriority: ["核心属性", "装备等级", "材料效果"],
    decision: "查看基础属性、武器类型和技能节点，再决定装备方向。",
    risk: "先用骑士等容错高的职业测试关卡，了解机制后再投资装备。",
  },
  en: {
    role: "Unclassified",
    difficulty: "Unrated",
    phase: "Needs data context",
    playstyle: "Check base stats, weapon types, and skill nodes before choosing gear direction.",
    statPriority: ["Core stat", "Gear level", "Material effects"],
    decision: "Check base stats, weapon types, and skill nodes before choosing gear direction.",
    risk: "Test with forgiving classes (Knight) first to learn stage mechanics before heavy investment.",
  },
};

export function heroProfile(hero: Hero, locale: Locale) {
  return profiles[hero.ClassType ?? ""]?.[locale] ?? fallback[locale] ?? fallback["en"]!;
}

export function heroWeaponLabel(hero: Hero, locale: Locale) {
  const main = hero.MainWeaponGearType ? slotNames[hero.MainWeaponGearType]?.[locale] ?? hero.MainWeaponGearType : "-";
  const sub = hero.SubWeaponGearType ? slotNames[hero.SubWeaponGearType]?.[locale] ?? hero.SubWeaponGearType : "-";
  return `${main} + ${sub}`;
}
