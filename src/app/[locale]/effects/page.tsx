import type { Metadata } from "next";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/tbh/badges";
import { PageHeader, PageShell } from "@/components/tbh/page";
import { effectRows, type Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero 材料效果表｜装饰、雕刻、铭刻属性" : "TaskBar Hero Material Effects", alternates: pageAlternates(locale, "/effects") };
}

export default async function EffectsPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const rows = effectRows(locale).slice(0, 260);
  return (
    <PageShell>
      <PageHeader
        kicker="Effects"
        title={isZh ? "材料效果表" : "Material Effects"}
        description={isZh ? "查看材料效果类型、适用部位、属性和值，用于判断材料是否值得保留。" : "Review material effect type, part, stat, and value to decide whether a material is worth keeping."}
      />
      <div className="overflow-x-auto border border-[#27272a]">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-[#18181b] text-xs text-[#6c6c6c]">
            <tr>
              <th className="px-3 py-2">{isZh ? "材料" : "Material"}</th>
              <th className="px-3 py-2">{isZh ? "部位" : "Part"}</th>
              <th className="px-3 py-2">{isZh ? "类型" : "Type"}</th>
              <th className="px-3 py-2">{isZh ? "属性" : "Stat"}</th>
              <th className="px-3 py-2">{isZh ? "数值" : "Value"}</th>
              <th className="px-3 py-2">{isZh ? "市场状态" : "Market status"}</th>
              <th className="px-3 py-2">{isZh ? "判断" : "Decision"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[#27272a]">
                <td className="px-3 py-2"><Link href={`/${locale}/items/${row.item.slug}`} className="text-[#ffffff] hover:text-[#f0c040]">{row.material}</Link></td>
                <td className="px-3 py-2 text-[#9d9d9d]">{row.part}</td>
                <td className="px-3 py-2 text-[#9d9d9d]">{row.effectType}</td>
                <td className="px-3 py-2 text-[#ffffff]">{row.stat}</td>
                <td className="px-3 py-2 text-[#f0c040]">{row.value}</td>
                <td className="px-3 py-2 text-[#6c6c6c]">{row.market ? (isZh ? "可交易，暂无市场数据" : "Tradable, no market data") : "-"}</td>
                <td className="px-3 py-2"><ConfidenceBadge value={row.market ? "missing" : "low"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
