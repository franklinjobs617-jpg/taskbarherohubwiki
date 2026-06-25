import type { Item, SlotType, Grade, ItemType, Locale } from "./types";
import { fetchR2Json } from "@/lib/r2-fetch";
import { allItems, itemBySlug as dataItemBySlug } from "./data";

// Re-export from data.ts for backward compatibility after ensureGameData() has been called
let _allItems: Item[] | null = null;

async function loadItems(): Promise<Item[]> {
  if (_allItems) return _allItems;
  // In production, items come from data.ts (loaded via R2 CDN)
  // The allItems() function there returns the cached R2 data
  const items = allItems();
  if (items.length > 0) {
    _allItems = items as unknown as Item[];
    return _allItems;
  }
  // Fallback: direct R2 fetch
  try {
    const data = await fetchR2Json<Item[]>("game/v1/items/index.en.json");
    _allItems = data;
    return _allItems;
  } catch {
    // Final fallback — return empty
    return [];
  }
}

export async function getAllItems(): Promise<Item[]> {
  return loadItems();
}

export async function getItemBySlug(slug: string): Promise<Item | null> {
  // Prefer the data.ts cache (faster, synchronous)
  const fromData = dataItemBySlug(slug);
  if (fromData) return fromData as unknown as Item;

  const items = await loadItems();
  return items.find((i) => i.slug === slug) ?? null;
}

export async function getItemById(id: number): Promise<Item | null> {
  const items = await loadItems();
  return items.find((i) => i.id === id) ?? null;
}

export async function getItemsBySlot(slot: SlotType): Promise<Item[]> {
  const items = await loadItems();
  return items.filter((i) => i.gear === slot);
}

export async function getItemsByGrade(grade: Grade): Promise<Item[]> {
  const items = await loadItems();
  return items.filter((i) => i.grade === grade);
}

export async function getItemsByType(type: ItemType): Promise<Item[]> {
  const items = await loadItems();
  return items.filter((i) => i.type === type);
}

export async function getMarketableItems(): Promise<Item[]> {
  const items = await loadItems();
  return items.filter((i) => i.marketable === true);
}

export function getItemName(item: Item, locale: Locale): string {
  // Try exact locale match first
  const localeKey = locale === "zh" ? "zh-Hans" : "en-US";
  const name = item.name[localeKey] ?? item.name["en-US"] ?? Object.values(item.name)[0];
  return name ?? `Item #${item.id}`;
}

export function getRarityColor(grade: Grade): string {
  const colors: Record<Grade, string> = {
    COMMON: "var(--color-rarity-common)",
    UNCOMMON: "var(--color-rarity-uncommon)",
    RARE: "var(--color-rarity-rare)",
    LEGENDARY: "var(--color-rarity-legendary)",
    IMMORTAL: "var(--color-rarity-immortal)",
    ARCANA: "var(--color-rarity-arcana)",
    BEYOND: "var(--color-rarity-beyond)",
    CELESTIAL: "var(--color-rarity-celestial)",
    DIVINE: "var(--color-rarity-divine)",
    COSMIC: "var(--color-rarity-cosmic)",
  };
  return colors[grade];
}

export function getRarityBorderClass(grade: Grade): string {
  return `rarity-border-${grade.toLowerCase()}`;
}
