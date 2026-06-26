import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageShell } from "@/components/tbh/page";
import type { Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";
import { localizedPath } from "@/lib/locale-path";

export const dynamic = "force-static";

type Props = { params: Promise<{ locale: Locale }> };

const discordUrl = "https://discord.gg/kSRUY8N8GA";
const steamDiscussionsUrl = "https://steamcommunity.com/app/3678970/discussions/0/";
const githubUrl = "https://github.com/yantoumu/tbh-fan-site";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero Contact｜错误反馈与联系" : "TaskBar Hero Contact", alternates: pageAlternates(locale, "/contact") };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  return (
    <PageShell>
      <PageHeader
        kicker="Contact"
        title={isZh ? "联系我们" : "Contact Us"}
        description={isZh
          ? "数据错误反馈、功能建议、合作洽谈 — 请通过以下任一渠道联系我们。反馈时请附上物品 slug、页面 URL 和问题截图以加快处理。"
          : "Data corrections, feature suggestions, collaboration inquiries — reach us through any channel below. Please include item slug, page URL, and a screenshot to help us respond faster."}
      />

      <div className="space-y-4">
        {/* Discord */}
        <div className="border border-border-default bg-bg-panel p-5">
          <h2 className="text-base font-semibold text-white">Discord</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {isZh
              ? "加入我们的 Discord 社区获取实时帮助、讨论数据问题或提出建议。这是最快的反馈渠道。"
              : "Join our Discord community for real-time help, data discussions, and suggestions. This is the fastest way to reach us."}
          </p>
          <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block border border-accent-dim bg-[#171105] px-4 py-2 text-sm font-medium text-accent-bright hover:bg-[#211708] transition-colors">
            {isZh ? "加入 Discord 社区 ↗" : "Join Discord Community ↗"}
          </a>
        </div>

        {/* Steam Discussions */}
        <div className="border border-border-default bg-bg-panel p-5">
          <h2 className="text-base font-semibold text-white">Steam Discussions</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {isZh
              ? "游戏内问题、Bug 报告和官方讨论请在 Steam 社区进行。本站不提供官方客服支持。"
              : "For in-game issues, bug reports, and official discussions, please use the Steam Community hub. This site does not provide official support."}
          </p>
          <a href={steamDiscussionsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block border border-border-default bg-bg-surface px-4 py-2 text-sm font-medium text-white hover:border-accent transition-colors">
            Steam Discussions ↗
          </a>
        </div>

        {/* GitHub Issues */}
        <div className="border border-border-default bg-bg-panel p-5">
          <h2 className="text-base font-semibold text-white">GitHub</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {isZh
              ? "发现网站 Bug 或数据问题？在 GitHub 提交 Issue。请在 Issue 中包含受影响的 URL 和问题描述。"
              : "Found a site bug or data issue? Open a GitHub Issue. Please include the affected URL and a description of the problem."}
          </p>
          <a href={`${githubUrl}/issues`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block border border-border-default bg-bg-surface px-4 py-2 text-sm font-medium text-white hover:border-accent transition-colors">
            GitHub Issues ↗
          </a>
        </div>

        {/* Other pages */}
        <div className="mt-6 border-t border-border-default pt-6 flex flex-wrap gap-3">
          <Link href={localizedPath(locale, "/faq")} className="border border-border-default bg-bg-surface px-3 py-2 text-sm font-medium text-white hover:border-accent transition-colors">
            {isZh ? "常见问题 FAQ" : "FAQ"}
          </Link>
          <Link href={localizedPath(locale, "/privacy")} className="border border-border-default bg-bg-surface px-3 py-2 text-sm font-medium text-white hover:border-accent transition-colors">
            {isZh ? "隐私政策" : "Privacy Policy"}
          </Link>
          <Link href={localizedPath(locale, "/terms")} className="border border-border-default bg-bg-surface px-3 py-2 text-sm font-medium text-white hover:border-accent transition-colors">
            {isZh ? "服务条款" : "Terms of Service"}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
