// Manifest reader for game data.
// Local JSON is used during development; hosted JSON can be read from R2.

export interface DataManifest {
  version: string;
  generatedAt: string;
  source: string;
  sourceUrl: string;
  entityCounts: {
    items: number;
    heroes: number;
    monsters: number;
    stages: number;
    runes: number;
    skills: number;
  };
  locales: string[];
}

const MANIFEST_URL = process.env.NEXT_PUBLIC_R2_DATA_URL
  ? `${process.env.NEXT_PUBLIC_R2_DATA_URL}/game/v1/manifest.json`
  : null;

export async function getManifest(): Promise<DataManifest | null> {
  if (MANIFEST_URL) {
    try {
      const res = await fetch(MANIFEST_URL, { next: { revalidate: 3600 } });
      if (res.ok) return res.json();
    } catch {
      // Fall through to local data
    }
  }
  return null;
}

export function getLocalManifest(): DataManifest {
  return {
    version: "game-v1",
    generatedAt: "2026-06-24T07:09:17.476Z",
    source: "tbh_data local JSON",
    sourceUrl: "https://taskbarherohub.wiki",
    entityCounts: {
      items: 5944,
      heroes: 6,
      monsters: 61,
      stages: 120,
      runes: 197,
      skills: 106,
    },
    locales: ["zh", "en"],
  };
}
