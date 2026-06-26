import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/tbh/page";
import type { Locale } from "@/lib/game-data/data";
import { pageAlternates } from "@/lib/seo";

export const dynamic = "force-static";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? "TaskBar Hero Privacy｜隐私与数据使用" : "TaskBar Hero Privacy", alternates: pageAlternates(locale, "/privacy") };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";
  return (
    <PageShell>
      <PageHeader
        kicker="Privacy"
        title={isZh ? "隐私政策" : "Privacy Policy"}
        description={isZh ? "本站如何收集、使用和保护你的信息。我们使用 Cookie 和第三方服务来改进网站和提供广告。" : "How we collect, use, and protect your information. We use cookies and third-party services to improve the site and serve ads."}
      />

      <div className="space-y-6 border border-border-default bg-bg-panel p-5 text-sm leading-7 text-text-secondary">

        {/* 1. No Account System */}
        <section>
          <h2 className="text-base font-semibold text-white mb-2">{isZh ? "1. 无账号系统" : "1. No Account System"}</h2>
          <p>{isZh ? "本站不提供用户注册或登录功能。我们不会要求你输入 Steam 密码、交易链接、支付信息或任何个人身份信息。" : "This site does not offer user registration or login. We never ask for your Steam password, trade link, payment information, or any personally identifiable information."}</p>
        </section>

        {/* 2. Data We Collect */}
        <section>
          <h2 className="text-base font-semibold text-white mb-2">{isZh ? "2. 我们收集的数据" : "2. Data We Collect"}</h2>
          <p>{isZh ? "我们通过以下方式自动收集非个人身份信息：" : "We automatically collect non-personally identifiable information through:"}</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>{isZh ? "Google Analytics：页面浏览量、设备类型、浏览器信息、访问时长和性能数据。用于了解网站使用情况和改进体验。" : "Google Analytics: page views, device type, browser information, visit duration, and performance data. Used to understand site usage and improve the experience."}</li>
            <li>{isZh ? "服务器日志：IP 地址、访问时间、请求的页面。仅用于安全监控和故障排除。" : "Server logs: IP address, access time, requested pages. Used only for security monitoring and troubleshooting."}</li>
            <li>{isZh ? "必要的 Cookie：用于语言偏好和多语言路由。" : "Necessary cookies: used for language preference and multi-language routing."}</li>
          </ul>
        </section>

        {/* 3. Cookies and Tracking */}
        <section>
          <h2 className="text-base font-semibold text-white mb-2">{isZh ? "3. Cookie 与追踪技术" : "3. Cookies and Tracking Technologies"}</h2>
          <p>{isZh ? "本网站使用 Cookie 和类似追踪技术。Cookie 是你浏览器中存储的小文本文件。" : "This site uses cookies and similar tracking technologies. Cookies are small text files stored in your browser."}</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>{isZh ? "必要 Cookie" : "Necessary Cookies"}:</strong>{" "}
              {isZh ? "用于记忆你的语言偏好。这些 Cookie 不存储个人身份信息。" : "Used to remember your language preference. These cookies do not store personally identifiable information."}
            </li>
            <li>
              <strong>{isZh ? "分析 Cookie" : "Analytics Cookies"}:</strong>{" "}
              {isZh ? "Google Analytics 使用 Cookie 来收集匿名的使用统计数据。你可以通过安装 Google Analytics Opt-out Browser Add-on 来选择退出。" : "Google Analytics uses cookies to collect anonymous usage statistics. You can opt out by installing the Google Analytics Opt-out Browser Add-on."}
            </li>
            <li>
              <strong>{isZh ? "广告 Cookie" : "Advertising Cookies"}:</strong>{" "}
              {isZh ? "如果我们启用 Google AdSense 广告，Google 和第三方供应商将使用 Cookie（包括 DART Cookie）根据你之前对本网站和其他网站的访问来投放广告。Google 使用广告 Cookie 使它和其合作伙伴能够根据用户对本站和互联网上其他网站的访问向他们投放广告。" : "If we enable Google AdSense advertising, Google and third-party vendors will use cookies (including the DART cookie) to serve ads based on your prior visits to this site and other websites. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and other sites on the Internet."}
            </li>
          </ul>
        </section>

        {/* 4. Third-Party Services */}
        <section>
          <h2 className="text-base font-semibold text-white mb-2">{isZh ? "4. 第三方服务" : "4. Third-Party Services"}</h2>
          <p>{isZh ? "我们使用以下第三方服务，它们可能独立收集数据：" : "We use the following third-party services which may independently collect data:"}</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Google Analytics</strong> —{" "}
              {isZh ? "网站分析。Google 的隐私政策：" : "Website analytics. Google's privacy policy: "}
              <a href="https://policies.google.com/privacy" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>
            </li>
            <li>
              <strong>Google AdSense</strong> —{" "}
              {isZh ? "广告投放（如已启用）。Google 使用 Cookie 来投放广告。关于 Google 如何使用数据的详情：" : "Ad serving (if enabled). Google uses cookies to serve ads. How Google uses data: "}
              <a href="https://policies.google.com/technologies/ads" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a>
            </li>
            <li>
              <strong>Cloudflare</strong> —{" "}
              {isZh ? "内容分发网络和安全服务。Cloudflare 的隐私政策：" : "CDN and security services. Cloudflare's privacy policy: "}
              <a href="https://www.cloudflare.com/privacypolicy/" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">https://www.cloudflare.com/privacypolicy/</a>
            </li>
          </ul>
        </section>

        {/* 5. Advertising & Opt-out */}
        <section>
          <h2 className="text-base font-semibold text-white mb-2">{isZh ? "5. 广告与退出选项" : "5. Advertising and Opt-out"}</h2>
          <p>
            {isZh
              ? "如果本站显示 Google AdSense 广告，第三方供应商（包括 Google）使用 Cookie 根据用户的先前访问来投放广告。你可以通过以下方式退出个性化广告："
              : "If this site displays Google AdSense ads, third-party vendors (including Google) use cookies to serve ads based on a user's prior visits. You can opt out of personalized advertising by:"}
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              {isZh ? "访问 Google 广告设置：" : "Visiting Google Ads Settings: "}
              <a href="https://adssettings.google.com" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">https://adssettings.google.com</a>
            </li>
            <li>
              {isZh ? "访问网络广告促进会 (NAI) 退出页面：" : "Visiting the Network Advertising Initiative opt-out page: "}
              <a href="https://www.aboutads.info" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">https://www.aboutads.info</a>
            </li>
            <li>
              {isZh ? "安装 Google Analytics 退出浏览器插件：" : "Installing the Google Analytics Opt-out Browser Add-on: "}
              <a href="https://tools.google.com/dlpage/gaoptout" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">https://tools.google.com/dlpage/gaoptout</a>
            </li>
          </ul>
          <p className="mt-2">
            {isZh
              ? "你还可以通过在浏览器设置中禁用 Cookie 或设置\"禁止追踪\"（Do Not Track）来选择退出某些第三方 Cookie。"
              : "You may also opt out of certain third-party cookies by disabling cookies in your browser settings or by enabling Do Not Track."}
          </p>
        </section>

        {/* 6. GDPR */}
        <section>
          <h2 className="text-base font-semibold text-white mb-2">{isZh ? "6. 欧盟用户 (GDPR)" : "6. EU Users (GDPR)"}</h2>
          <p>
            {isZh
              ? "如果你位于欧洲经济区 (EEA) 或英国，根据《通用数据保护条例》(GDPR)，你拥有以下权利：访问我们持有的你的个人数据、更正不准确的数据、请求删除你的数据、限制或反对数据处理、数据可携带权。由于本站不收集个人身份信息，这些权利主要适用于第三方服务（Google、Cloudflare）可能收集的数据。"
              : "If you are located in the European Economic Area (EEA) or the UK, under the General Data Protection Regulation (GDPR), you have the following rights: access the personal data we hold about you, correct inaccurate data, request deletion of your data, restrict or object to data processing, and data portability. Since this site does not collect personally identifiable information, these rights primarily apply to data that third-party services (Google, Cloudflare) may collect."}
          </p>
          <p className="mt-2">
            {isZh
              ? "如果本网站启用广告投放，我们会在加载广告 Cookie 之前征求你的同意。"
              : "If this site enables ad serving, we will request your consent before loading advertising cookies."}
          </p>
        </section>

        {/* 7. Data Retention */}
        <section>
          <h2 className="text-base font-semibold text-white mb-2">{isZh ? "7. 数据保留" : "7. Data Retention"}</h2>
          <p>
            {isZh
              ? "匿名分析数据由 Google Analytics 根据其数据保留政策存储。服务器日志由 Cloudflare 临时保留以用于安全和性能监控。本站不在自有服务器上存储任何用户数据。"
              : "Anonymous analytics data is stored by Google Analytics according to their data retention policies. Server logs are temporarily retained by Cloudflare for security and performance monitoring. This site does not store any user data on its own servers."}
          </p>
        </section>

        {/* 8. Children's Privacy */}
        <section>
          <h2 className="text-base font-semibold text-white mb-2">{isZh ? "8. 儿童隐私" : "8. Children's Privacy"}</h2>
          <p>
            {isZh
              ? "本网站是一个游戏维基，面向一般受众。我们不会有意收集 13 岁以下儿童的个人信息。如果你认为我们无意中收集了此类信息，请联系我们，我们将立即删除。"
              : "This site is a gaming wiki intended for a general audience. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us and we will promptly delete it."}
          </p>
        </section>

        {/* 9. Changes & Contact */}
        <section>
          <h2 className="text-base font-semibold text-white mb-2">{isZh ? "9. 政策更新与联系方式" : "9. Policy Updates and Contact"}</h2>
          <p>
            {isZh
              ? "我们可能会不时更新本隐私政策。更新后，我们会在本页面发布修订版本。如有关于本隐私政策的问题，请通过我们的联系页面与我们联系。"
              : "We may update this privacy policy from time to time. When we do, we will post the revised version on this page. For questions about this privacy policy, please contact us through our contact page."}
          </p>
          <p className="mt-3 text-text-muted text-xs">
            {isZh ? "最后更新：2026-06-26" : "Last updated: 2026-06-26"}
          </p>
        </section>

      </div>
    </PageShell>
  );
}
