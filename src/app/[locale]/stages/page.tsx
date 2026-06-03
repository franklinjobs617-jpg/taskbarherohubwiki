import type { Metadata } from "next";
import MapPage from "../map/page";
import type { Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero 关卡列表｜怪物、Boss 与宝箱掉落" : "TaskBar Hero Stages", alternates: pageAlternates(locale, "/stages") };
}

export default MapPage;
