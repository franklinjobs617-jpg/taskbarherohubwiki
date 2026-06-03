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

const profiles: Record<string, Record<Locale, HeroProfile>> = {
  Knight: {
    zh: {
      role: "稳推进前排",
      difficulty: "低",
      phase: "开荒 / 稳定刷图",
      playstyle: "用高生命、防御和盾牌容错推进，适合先熟悉关卡、宝箱和装备等级。",
      statPriority: ["生命", "防御", "格挡", "物理伤害"],
      decision: "不玩游戏也能先把骑士当作基准职业：用它判断关卡压力、装备等级和宝箱来源是否合理。",
      risk: "清图速度通常不是最高，市场刷取路线不要只看生存，要同时看每轮时间。",
    },
    en: {
      role: "Stable frontliner",
      difficulty: "Low",
      phase: "Early progress / safe farming",
      playstyle: "Uses HP, armor, and shield value to survive while you learn stages, chests, and gear levels.",
      statPriority: ["HP", "Armor", "Block", "Physical damage"],
      decision: "Use Knight as the baseline class when judging stage pressure, gear level, and chest source quality.",
      risk: "Clear speed is usually not the highest, so farming decisions still need clear-time context.",
    },
  },
  Ranger: {
    zh: {
      role: "远程清图",
      difficulty: "中",
      phase: "中期刷图 / 材料积累",
      playstyle: "依赖攻速、物理伤害和远程输出节奏，适合比较每小时经验和金币。",
      statPriority: ["攻速", "物理伤害", "暴击", "移动速度"],
      decision: "如果目标是更快清图，游侠比骑士更适合做刷图效率参考。",
      risk: "生存冗余较低，装备等级不足时不要只堆输出。",
    },
    en: {
      role: "Ranged clearer",
      difficulty: "Medium",
      phase: "Mid-game farming / material stockpiling",
      playstyle: "Uses attack speed, physical damage, and ranged uptime to compare XP and gold per hour.",
      statPriority: ["Attack speed", "Physical damage", "Critical", "Movement speed"],
      decision: "Use Ranger as the efficiency reference when the goal is faster clears.",
      risk: "Lower defensive margin means output-only gear can fail when item level is behind.",
    },
  },
  Sorcerer: {
    zh: {
      role: "法系爆发",
      difficulty: "中高",
      phase: "中后期 / 材料效果筛选",
      playstyle: "围绕法系伤害、冷却和施法节奏建立路线，适合研究材料效果表。",
      statPriority: ["法系伤害", "冷却", "施法速度", "范围伤害"],
      decision: "适合用来判断材料词条是否真的服务于输出循环。",
      risk: "缺少真实技能倍率和清图时间时，不要把法系路线写成绝对收益最高。",
    },
    en: {
      role: "Caster burst",
      difficulty: "Medium-high",
      phase: "Mid to late game / effect filtering",
      playstyle: "Builds around caster damage, cooldown, and cast rhythm, making it useful for material-effect decisions.",
      statPriority: ["Caster damage", "Cooldown", "Cast speed", "Area damage"],
      decision: "Good for checking whether an effect actually supports the damage loop.",
      risk: "Without real skill scaling and clear-time data, avoid absolute profit claims.",
    },
  },
  Priest: {
    zh: {
      role: "续航辅助",
      difficulty: "中",
      phase: "稳定推进 / 长线刷取",
      playstyle: "偏向续航、生存和稳定性，适合比较长时间挂机路线。",
      statPriority: ["生命", "恢复", "冷却", "防御"],
      decision: "当用户目标是稳定而不是极限速度时，Priest 是更合理的参考职业。",
      risk: "市场价值判断仍然要回到掉率和真实价格，职业稳定性不能替代市场数据。",
    },
    en: {
      role: "Sustain support",
      difficulty: "Medium",
      phase: "Stable progress / long-session farming",
      playstyle: "Prioritizes sustain and safety, useful when comparing longer idle farming routes.",
      statPriority: ["HP", "Recovery", "Cooldown", "Armor"],
      decision: "Use Priest when the user cares more about stability than peak speed.",
      risk: "Class stability does not replace drop-rate and real market data.",
    },
  },
  Hunter: {
    zh: {
      role: "DLC 远程爆发",
      difficulty: "中高",
      phase: "进阶刷图 / DLC 路线",
      playstyle: "更适合已有装备基础后追求远程爆发和效率。",
      statPriority: ["攻速", "暴击", "物理伤害", "材料效果"],
      decision: "如果没有 DLC 或装备基础，先不要把 Hunter 当新手首选。",
      risk: "这是付费 DLC 职业，需要购买才能使用。没有 DLC 或装备基础时不要作为首选。",
    },
    en: {
      role: "DLC ranged burst",
      difficulty: "Medium-high",
      phase: "Advanced farming / DLC route",
      playstyle: "Better once the user has gear and wants ranged burst efficiency.",
      statPriority: ["Attack speed", "Critical", "Physical damage", "Material effects"],
      decision: "Do not present Hunter as the default beginner choice when DLC or gear base is missing.",
      risk: "This is a paid DLC class. Do not pick it as your first class unless you own the DLC and have gear ready.",
    },
  },
  Slayer: {
    zh: {
      role: "DLC 高风险输出",
      difficulty: "高",
      phase: "后期 / 输出路线",
      playstyle: "偏向高输出和更激进的路线，适合已有数据后做 Build 页面。",
      statPriority: ["伤害", "暴击", "攻速", "生存底线"],
      decision: "Slayer 适合做后期参考，不适合在缺少证据时写成最强路线。",
      risk: "高伤害但风险极大——技能消耗 HP，操作失误容易暴毙。需要特定装备和属性支撑才能稳定发挥。",
    },
    en: {
      role: "DLC high-risk damage",
      difficulty: "High",
      phase: "Late game / damage route",
      playstyle: "A more aggressive damage route that needs stronger evidence before build claims.",
      statPriority: ["Damage", "Critical", "Attack speed", "Minimum survival"],
      decision: "Use Slayer as a late-game reference, not an unsupported best route.",
      risk: "High burst damage but skills cost HP — easy to die without perfect play. Requires specific gear and stat support to be consistent.",
    },
  },
};

const fallback: Record<Locale, HeroProfile> = {
  zh: {
    role: "资料待分类",
    difficulty: "未评估",
    phase: "需要结合数据判断",
    playstyle: "先看基础属性、武器类型和技能节点，再决定装备方向。",
    statPriority: ["核心属性", "装备等级", "材料效果"],
    decision: "不要只看名称，必须结合武器、技能和关卡压力判断。",
    risk: "数据不完整时建议先用稳健路线测试，不要投入大量资源。等更多数据后再做最终决定。",
  },
  en: {
    role: "Unclassified",
    difficulty: "Unrated",
    phase: "Needs data context",
    playstyle: "Check base stats, weapon types, and skill nodes before choosing gear direction.",
    statPriority: ["Core stat", "Gear level", "Material effects"],
    decision: "Do not judge by name only; combine weapon, skills, and stage pressure.",
    risk: "When data is incomplete, test with conservative routes first. Avoid heavy investment until more data is available.",
  },
};

export function heroProfile(hero: Hero, locale: Locale) {
  return profiles[hero.ClassType ?? ""]?.[locale] ?? fallback[locale];
}

export function heroWeaponLabel(hero: Hero, locale: Locale) {
  const main = hero.MainWeaponGearType ? slotNames[hero.MainWeaponGearType]?.[locale] ?? hero.MainWeaponGearType : "-";
  const sub = hero.SubWeaponGearType ? slotNames[hero.SubWeaponGearType]?.[locale] ?? hero.SubWeaponGearType : "-";
  return `${main} + ${sub}`;
}
