import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { allRunes, text, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero 符文树｜效果、等级与金币消耗" : "TaskBar Hero Runes", alternates: pageAlternates(locale, "/runes") };
}

export default async function RunesPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  return (
    <PageShell>
      <PageHeader
        kicker="Runes"
        title={isZh ? "符文树" : "Runes"}
        description={isZh ? "浏览符文名称、最大等级和连接关系，用于规划长期成长方向。" : "Browse rune names, max levels, and links for long-term progression planning."}
      />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {allRunes().map((rune) => (
          <div key={rune.RuneKey} className="border border-[#252525] bg-[#101010] p-3">
            <p className="font-medium text-[#ddd]">{text(rune.NameKey_i18n, locale, `Rune ${rune.RuneKey}`)}</p>
            <p className="mt-1 text-xs text-[#777]">Max Lv {rune.MaxLevel ?? "-"}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
