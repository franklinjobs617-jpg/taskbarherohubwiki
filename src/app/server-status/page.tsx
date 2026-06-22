import ServerStatusPage, { generateMetadata as generateLocaleMetadata } from "../[locale]/server-status/page";

export function generateMetadata() {
  return generateLocaleMetadata({ params: Promise.resolve({ locale: "en" as const }) });
}

export default function EnglishServerStatusPage() {
  return <ServerStatusPage params={Promise.resolve({ locale: "en" as const })} />;
}
