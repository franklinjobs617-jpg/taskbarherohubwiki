import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ExternalLink, ShieldAlert, Wrench } from "lucide-react";
import { Section } from "@/components/tbh/cards";
import { DataNotice, PageHeader, PageShell } from "@/components/tbh/page";
import { SeoJsonLd } from "@/components/tbh/seo-json-ld";
import { SITE_URL, type Locale } from "@/lib/game-data/data";
import { localizedPath } from "@/lib/locale-path";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

const steamStoreUrl = "https://store.steampowered.com/app/3678970/TBH_Task_Bar_Hero/";
const steamNewsUrl = "https://store.steampowered.com/news/app/3678970";
const steamDiscussionsUrl = "https://steamcommunity.com/app/3678970/discussions/0/";
const discordUrl = "https://discord.gg/kSRUY8N8GA";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Task Bar Hero Server Status, Maintenance, Error 500 & 401 | TBH Wiki",
    description:
      "Check what to do when TBH: Task Bar Hero shows maintenance, server errors, error 500, error 401, or Discord/server status questions. Unofficial troubleshooting with official source links.",
    alternates: pageAlternates(locale, "/server-status"),
  };
}

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#f0c040] hover:underline">
      {children}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export default async function ServerStatusPage({ params }: Props) {
  const { locale } = await params;

  const checks = [
    {
      title: "Maintenance",
      text: "If TBH shows maintenance or the market is closed, check Steam news and Steam Discussions first. Avoid trading high-value items or making price decisions while service state is unstable.",
    },
    {
      title: "Error 500",
      text: "Treat error 500 as a server-side or backend communication problem first. Restarting Steam or the game may refresh a stale session, but this page cannot promise a local fix.",
    },
    {
      title: "Error 401",
      text: "Treat error 401 as an authorization, login, Steam session, or maintenance-window symptom. Confirm Steam is logged in, then check official/community posts before changing files.",
    },
    {
      title: "Not launching",
      text: "For black screen, infinite loading, or launch failures, compare your issue with recent Steam Discussion threads and official announcements before following third-party fixes.",
    },
  ];

  return (
    <PageShell>
      <SeoJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Task Bar Hero Server Status, Maintenance, Error 500 & 401",
          description:
            "Unofficial TBH: Task Bar Hero troubleshooting hub for maintenance, server errors, error 500, error 401, Discord, and server status questions.",
          url: `${SITE_URL}${localizedPath(locale, "/server-status")}`,
          isPartOf: { "@type": "WebSite", name: "TBH Wiki", url: SITE_URL },
          about: [
            "TBH: Task Bar Hero maintenance",
            "Task Bar Hero error 500",
            "Task Bar Hero error 401",
            "Task Bar Hero Discord server",
          ],
        }}
      />

      <PageHeader
        kicker="Server status"
        title="Task Bar Hero server status, maintenance, error 500 & 401"
        description="Unofficial troubleshooting hub for TBH: Task Bar Hero server status, maintenance windows, error 500, error 401, Discord/community checks, and launch issues."
      />

      <DataNotice>
        This is not an official TBH: Task Bar Hero server status page and it does not provide real-time uptime monitoring.
        Use it as a checklist with source links. 当前没有足够证据支持这个结论。 applies to any exact live server state, drop rate, market return time, or revenue claim not backed by official data.
      </DataNotice>

      <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {checks.map((item) => (
          <div key={item.title} className="border border-[#27272a] bg-[#0d0d0d] p-4">
            <ShieldAlert className="mb-3 h-5 w-5 text-[#f0c040]" />
            <h2 className="text-base font-semibold text-white">{item.title}</h2>
            <p className="mt-2 text-sm leading-7 text-[#bbb]">{item.text}</p>
          </div>
        ))}
      </section>

      <Section title="Official and community sources" eyebrow="Evidence first">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
            <h2 className="font-semibold text-white">Check official channels first</h2>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-[#bbb]">
              <li>Steam news/update history: <SourceLink href={steamNewsUrl}>official announcements</SourceLink></li>
              <li>Steam store page: <SourceLink href={steamStoreUrl}>game, DLC, language, and system info</SourceLink></li>
              <li>Steam Discussions: <SourceLink href={steamDiscussionsUrl}>bug reports, market questions, and answered threads</SourceLink></li>
              <li>Discord/community: <SourceLink href={discordUrl}>community support link</SourceLink></li>
            </ul>
          </div>
          <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
            <h2 className="font-semibold text-white">What this page will not claim</h2>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-[#bbb]">
              <li>It will not say the server is online or offline unless an official source says so.</li>
              <li>It will not promise a fix for error 500, because server-side failures may require developer action.</li>
              <li>It will not estimate when maintenance, Steam market access, or item delivery will return without evidence.</li>
              <li>It will not turn community screenshots into verified facts without a source trail.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Troubleshooting flow" eyebrow="Player checklist">
        <div className="space-y-3">
          {[
            "Open Steam news/update history and look for maintenance or emergency maintenance posts.",
            "Search Steam Discussions for your exact symptom: error 500, error 401, market closed, infinite loading, black screen, or not launching.",
            "If the issue is tied to login or authorization, restart Steam and the game once, then re-check the official/community channels.",
            "Do not trade high-value items, price rare drops, or rely on market profit calculators during active maintenance or unstable market state.",
            "Use this wiki for item, build, drop, and market reference after the game state is stable again.",
          ].map((step, index) => (
            <div key={step} className="flex gap-3 border border-[#27272a] bg-[#0d0d0d] p-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#4a3510] bg-[#171105] text-xs font-semibold text-[#f0c040]">{index + 1}</span>
              <p className="text-sm leading-7 text-[#bbb]">{step}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Multilingual search terms" eyebrow="Search intent">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
            <p className="text-sm font-semibold text-white">Portuguese</p>
            <p className="mt-2 text-sm leading-7 text-[#bbb]">Users may search for TBH manutenção, manutenção servidor, erro 500, or erro 401. Check Steam sources before local fixes.</p>
          </div>
          <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
            <p className="text-sm font-semibold text-white">Russian</p>
            <p className="mt-2 text-sm leading-7 text-[#bbb]">Users may search не запускается, ошибка 500, ошибка 401, сервер, or рынок. Community threads can help identify shared symptoms.</p>
          </div>
          <div className="border border-[#27272a] bg-[#0d0d0d] p-4">
            <p className="text-sm font-semibold text-white">Turkish</p>
            <p className="mt-2 text-sm leading-7 text-[#bbb]">Users may ask pazar ne zaman açılacak, sunucu durumu, bakım, hata 500, or hata 401. Do not assume a market reopening time.</p>
          </div>
        </div>
      </Section>

      <Section title="Related wiki pages" eyebrow="Internal links">
        <div className="grid gap-2 md:grid-cols-4">
          {[
            ["/updates", "Updates and data status"],
            ["/faq", "FAQ and community support"],
            ["/market", "Steam market references"],
            ["/tools/drop-finder", "Drop finder"],
          ].map(([href, label]) => (
            <Link key={href} href={localizedPath(locale, href)} className="border border-[#27272a] bg-[#0d0d0d] p-4 text-sm font-medium text-white hover:border-[#d4a017]">
              <Wrench className="mb-3 h-4 w-4 text-[#d4a017]" />
              {label}
            </Link>
          ))}
        </div>
      </Section>

      <div className="mt-8 flex items-start gap-3 border border-[#3a2d12] bg-[#171105] p-4 text-sm leading-7 text-[#d8d1c2]">
        <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-[#f0c040]" />
        <p>
          If an official post contradicts this page, trust the official post. This wiki should only help players find the right source, understand likely error categories, and avoid risky market decisions during unstable service periods.
        </p>
      </div>
    </PageShell>
  );
}
