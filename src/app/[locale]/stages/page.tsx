import type { Metadata } from "next";
import MapPage from "../map/page";
import type { Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh" ? "TaskBar Hero 关卡列表 - 怪物、Boss 与掉落" : "TaskBar Hero Stages - Monsters, Bosses & Drops",
    description: locale === "zh"
      ? "按难度和 Act 查看每一关会出现什么怪物、Boss 掉什么箱子、箱子里能开出什么。"
      : "Browse every stage by difficulty and Act. See monsters, bosses, chest drops, and chest contents.",
    alternates: pageAlternates(locale, "/stages"),
  };
}

export default MapPage;
