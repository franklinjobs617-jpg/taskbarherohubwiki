type R2Bucket = {
  get(key: string): Promise<{ text(): Promise<string> } | null>;
  put(
    key: string,
    value: string,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
};

type ScheduledEvent = unknown;
type ExecutionContext = { waitUntil(promise: Promise<unknown>): void };

export interface Env {
  R2_BUCKET: R2Bucket;
  STEAM_APP_ID?: string;
}

type MarketRecord = {
  marketHash: string;
  slug?: string;
  lowest: number | null;
  median: number | null;
  listings: number | null;
  confidence: "low" | "missing";
  updatedAt: string;
};

const worker = {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(writeMissingMarketStatus(env));
  },
  async fetch(_request: Request, env: Env) {
    await writeMissingMarketStatus(env);
    return Response.json({ ok: true });
  },
};

export default worker;

async function writeMissingMarketStatus(env: Env) {
  const now = new Date().toISOString();
  const existing = await env.R2_BUCKET.get("market/v1/latest.json");
  const parsed = existing ? await existing.text().then((text) => JSON.parse(text)).catch(() => null) : null;
  const latest: MarketRecord[] = Array.isArray(parsed?.items)
    ? parsed.items.map((item: MarketRecord) => ({
        ...item,
        lowest: typeof item.lowest === "number" ? item.lowest : null,
        median: typeof item.median === "number" ? item.median : null,
        listings: typeof item.listings === "number" ? item.listings : null,
        confidence: item.lowest || item.median || item.listings ? item.confidence : "missing",
        updatedAt: now,
      }))
    : [];

  await env.R2_BUCKET.put("market/v1/latest.json", JSON.stringify({ updatedAt: now, items: latest }, null, 2), {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
  });
}
