import "server-only";
import { fetchR2Json } from "@/lib/r2-fetch";
import {
  type DropSource,
  type ItemDetail,
  type MarketRecord,
  type RawItem,
} from "@/lib/game-data/data";

export type ItemIndexEntry = RawItem & {
  hasDrops?: boolean;
  hasMarketData?: boolean;
  market?: MarketRecord | null;
  classFit?: string[];
  obtainable?: boolean;
  detailSummary?: {
    desc?: ItemDetail["desc"] | null;
    stats?: ItemDetail["stats"] | null;
    synthType?: string | null;
    dropKey?: number | null;
    uniqueMod?: string | null;
  };
};

export type ItemPageData = {
  item: ItemIndexEntry;
  detail: ItemDetail | null;
  market: MarketRecord | null;
  drops: DropSource[];
  related: RawItem[];
  shouldIndex: boolean;
};

const V2 = {
  itemIndex: "game/v2/items/index-light.json",
  itemPreview: "game/v2/items/index-preview.json",
  itemBySlug: (slug: string) => `game/v2/items/by-slug/${encodeURIComponent(slug)}.json`,
  dropsByItem: (slug: string) => `game/v2/drops/by-item/${encodeURIComponent(slug)}.json`,
  marketBySlug: (slug: string) => `game/v2/market/by-slug/${encodeURIComponent(slug)}.json`,
};

let itemIndexPromise: Promise<ItemIndexEntry[]> | null = null;
let itemPreviewPromise: Promise<ItemIndexEntry[]> | null = null;

export async function getItemIndexLight(): Promise<ItemIndexEntry[]> {
  if (!itemIndexPromise) {
    itemIndexPromise = fetchR2Json<ItemIndexEntry[]>(V2.itemIndex).catch((error) => {
      itemIndexPromise = null;
      throw error;
    });
  }
  return itemIndexPromise;
}

export async function getItemIndexPreview(): Promise<ItemIndexEntry[]> {
  if (!itemPreviewPromise) {
    itemPreviewPromise = fetchR2Json<ItemIndexEntry[]>(V2.itemPreview).catch((error) => {
      itemPreviewPromise = null;
      throw error;
    });
  }
  return itemPreviewPromise;
}

export async function getItemPageData(slug: string): Promise<ItemPageData | null> {
  return fetchR2Json<ItemPageData>(V2.itemBySlug(slug)).catch(() => null);
}

export async function getItemDrops(slug: string): Promise<DropSource[]> {
  return fetchR2Json<DropSource[]>(V2.dropsByItem(slug)).catch(() => []);
}

export async function getMarketBySlug(slug: string): Promise<MarketRecord | null> {
  return fetchR2Json<MarketRecord | null>(V2.marketBySlug(slug)).catch(() => null);
}

export function itemIndexName(item: ItemIndexEntry, locale: string): string {
  const key = locale === "zh" ? "zh-Hans" : locale === "ja" ? "ja-JP" : locale === "ko" ? "ko-KR" : "en-US";
  return item.name[key] ?? item.name["en-US"] ?? item.name["zh-Hans"] ?? Object.values(item.name)[0] ?? item.slug;
}

export function indexMarketForItem(item: ItemIndexEntry): MarketRecord | null {
  return item.market ?? null;
}
