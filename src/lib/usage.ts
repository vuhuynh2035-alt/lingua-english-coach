/**
 * Usage, limits and costs of the AI services (Gemini, OpenAI, Google Cloud TTS), counted on the device.
 *
 * Every request is checked here first and recorded after it worked:
 * - each key and model has the provider's per-minute and per-day request limits (stopping at 95%),
 *   which reset like the provider's (a rolling minute; Google's day ends at midnight Pacific time);
 * - Cloud TTS gives each key (billing account) a free pool of characters per month;
 * - each service has a monthly spending cap in USD, from editable unit prices; a cap of 0 means
 *   "free use only".
 * Costs are estimates (characters → tokens / seconds of speech); the provider's bill is the reference.
 */
export type ServiceId = "gemini" | "openai" | "gcloud";
export type KeyTier = "free" | "paid";
export type UsageKind = "chat" | "speech";

export type Prices = {
  gemini: { chatIn: number; chatOut: number; ttsFlash: number; ttsLite: number };
  openai: { chatIn: number; chatOut: number; ttsPerMinute: number };
  gcloud: { perMillionChars: number; freeChars: number };
};

export type UsageSettings = {
  /** Voice: "auto" balances every enabled service; "manual" uses the one picked in the voice settings. */
  mode: "manual" | "auto";
  enabled: Record<ServiceId, boolean>;
  /** Monthly spending cap per service, USD (0 = only what is free). */
  caps: Record<ServiceId, number>;
  prices: Prices;
  /** Gemini key tier, by the key's last characters. */
  tiers: Record<string, KeyTier>;
};

/** Prices as published in October 2026 (USD per 1M tokens, per minute, or per 1M characters). */
export const DEFAULT_PRICES: Prices = {
  gemini: { chatIn: 0.75, chatOut: 3.75, ttsFlash: 9, ttsLite: 6 },
  openai: { chatIn: 0.15, chatOut: 0.6, ttsPerMinute: 0.015 },
  gcloud: { perMillionChars: 30, freeChars: 1_000_000 },
};

export const DEFAULT_SETTINGS: UsageSettings = {
  mode: "manual",
  enabled: { gemini: true, openai: false, gcloud: true },
  caps: { gemini: 5, openai: 0, gcloud: 0 },
  prices: DEFAULT_PRICES,
  tiers: {},
};

export const SERVICE_NAMES: Record<ServiceId, string> = { gemini: "Gemini", openai: "OpenAI", gcloud: "Google Cloud TTS" };

const SETTINGS_KEY = "lingua-usage-settings";
const LEDGER_KEY = "lingua-usage-ledger";
const SAFE = 0.95;
/** English and Vietnamese speech run at about 15 characters a second; Gemini counts 25 audio tokens a second. */
const CHARS_PER_SECOND = 15;
const AUDIO_TOKENS_PER_SECOND = 25;

export const keyTag = (key: string) => key.slice(-12);

// ---------------------------------------------------------------- settings
export function loadSettings(): UsageSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null") as Partial<UsageSettings> | null;
    if (!stored) return structuredClone(DEFAULT_SETTINGS);
    return {
      mode: stored.mode === "auto" ? "auto" : "manual",
      enabled: { ...DEFAULT_SETTINGS.enabled, ...stored.enabled },
      caps: { ...DEFAULT_SETTINGS.caps, ...stored.caps },
      prices: {
        gemini: { ...DEFAULT_PRICES.gemini, ...stored.prices?.gemini },
        openai: { ...DEFAULT_PRICES.openai, ...stored.prices?.openai },
        gcloud: { ...DEFAULT_PRICES.gcloud, ...stored.prices?.gcloud },
      },
      tiers: { ...stored.tiers },
    };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

export function saveSettings(settings: UsageSettings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
}

// ---------------------------------------------------------------- calendar (provider time)
const pacific = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", ...options }).format(new Date());
export const pacificDay = () => pacific({ year: "numeric", month: "2-digit", day: "2-digit" });
export const pacificMonth = () => pacificDay().slice(0, 7);

/** Milliseconds until the next midnight Pacific time (Google's daily reset). */
function untilPacificMidnight(): number {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(now);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0) % 24;
  return ((24 - get("hour")) * 3600 - get("minute") * 60 - get("second")) * 1000;
}

function untilNextMonth(): number {
  const now = new Date();
  // Close enough for a reset hint: first day of next month, Pacific midnight ≈ 08:00 UTC.
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 8);
  return Math.max(60_000, next - now.getTime());
}

// ---------------------------------------------------------------- ledger
type KeyLedger = {
  day: string;
  /** Requests today per model (and "chat" models). */
  dayCount: Record<string, number>;
  /** Models the provider closed for the day (it refused with a daily limit). */
  closed: Record<string, boolean>;
  /** Cloud TTS characters this month. */
  monthChars: number;
  month: string;
};
type Ledger = { month: string; spent: Record<ServiceId, number>; keys: Record<string, KeyLedger> };

let ledger: Ledger | null = null;
/** Request start times in the last minute per key|model (memory only: a minute is short). */
const minute: Record<string, number[]> = {};
/** A key refused as invalid / not enabled: skipped until this time. */
const blockedUntil: Record<string, { until: number; reason: string }> = {};

function load(): Ledger {
  const month = pacificMonth();
  if (!ledger) {
    try { ledger = JSON.parse(localStorage.getItem(LEDGER_KEY) ?? "null") as Ledger | null; } catch { ledger = null; }
  }
  if (!ledger || ledger.month !== month) ledger = { month, spent: { gemini: 0, openai: 0, gcloud: 0 }, keys: ledger?.keys ?? {} };
  return ledger;
}

function keyLedger(tag: string): KeyLedger {
  const data = load();
  const day = pacificDay();
  const month = pacificMonth();
  let entry = data.keys[tag];
  if (!entry) entry = data.keys[tag] = { day, dayCount: {}, closed: {}, monthChars: 0, month };
  if (entry.day !== day) Object.assign(entry, { day, dayCount: {}, closed: {} });
  if (entry.month !== month) Object.assign(entry, { month, monthChars: 0 });
  return entry;
}

function persist() {
  try { localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger)); } catch {}
}

// ---------------------------------------------------------------- provider limits
/** Requests per minute / per day of one model for one key (Tier 1 values seen in AI Studio, Oct 2026). */
export function limitsFor(service: ServiceId, tier: KeyTier, kind: UsageKind): { rpm: number; rpd: number } {
  if (service === "gemini") {
    if (kind === "speech") return tier === "paid" ? { rpm: 10, rpd: 100 } : { rpm: 3, rpd: 15 };
    return tier === "paid" ? { rpm: 1000, rpd: 10_000 } : { rpm: 5, rpd: 20 };
  }
  if (service === "openai") return { rpm: 500, rpd: Infinity };
  return { rpm: 1000, rpd: Infinity };
}

const safe = (limit: number) => (Number.isFinite(limit) ? Math.max(1, Math.floor(limit * SAFE)) : Infinity);

// ---------------------------------------------------------------- costs
export type Amount = { chars?: number; inTokens?: number; outTokens?: number };

export function estimateCost(settings: UsageSettings, service: ServiceId, tier: KeyTier, kind: UsageKind, model: string, amount: Amount, tag = ""): number {
  const p = settings.prices;
  if (service === "gemini" && tier === "free") return 0;
  if (kind === "chat") {
    const prices = service === "openai" ? p.openai : p.gemini;
    return ((amount.inTokens ?? 0) * prices.chatIn + (amount.outTokens ?? 0) * prices.chatOut) / 1e6;
  }
  const chars = amount.chars ?? 0;
  if (service === "gemini") return (chars / CHARS_PER_SECOND) * AUDIO_TOKENS_PER_SECOND * (/lite/i.test(model) ? p.gemini.ttsLite : p.gemini.ttsFlash) / 1e6;
  if (service === "openai") return (chars / CHARS_PER_SECOND / 60) * p.openai.ttsPerMinute;
  const free = Math.max(0, p.gcloud.freeChars * SAFE - keyLedger(tag).monthChars);
  return Math.max(0, chars - free) * p.gcloud.perMillionChars / 1e6;
}

export type Check = { ok: boolean; cost: number; reason?: string; resetIn?: number; renews: "minute" | "day" | "month" | "never" };

/** Whether one request may be sent now, what it would cost, and when a refused one becomes possible again. */
export function check(settings: UsageSettings, service: ServiceId, key: string, model: string, kind: UsageKind, amount: Amount): Check {
  const tag = keyTag(key);
  const tier = settings.tiers[tag] ?? "paid";
  const name = SERVICE_NAMES[service];
  const blocked = blockedUntil[tag];
  if (blocked && blocked.until > Date.now()) return { ok: false, cost: 0, reason: blocked.reason, resetIn: blocked.until - Date.now(), renews: "never" };
  const entry = keyLedger(tag);
  const { rpm, rpd } = limitsFor(service, tier, kind);
  const bucket = `${kind}:${model}`;
  if (entry.closed[bucket] || (entry.dayCount[bucket] ?? 0) >= safe(rpd)) {
    return { ok: false, cost: 0, reason: `${name} (${model}) đã dùng hết lượt hôm nay`, resetIn: untilPacificMidnight(), renews: "day" };
  }
  const now = Date.now();
  const recent = (minute[`${tag}|${bucket}`] ?? []).filter((time) => now - time < 60_000);
  minute[`${tag}|${bucket}`] = recent;
  if (recent.length >= safe(rpm)) {
    return { ok: false, cost: 0, reason: `${name} đang chờ lượt (giới hạn mỗi phút)`, resetIn: recent[0] + 60_000 - now, renews: "minute" };
  }
  const cost = estimateCost(settings, service, tier, kind, model, amount, tag);
  const spent = load().spent[service];
  if (cost > 0 && spent + cost > settings.caps[service] + 1e-9) {
    return {
      ok: false, cost,
      reason: settings.caps[service] > 0
        ? `${name} đã chạm trần chi phí ${settings.caps[service]} USD tháng này`
        : `${name} chỉ được dùng phần miễn phí (trần 0 USD) và phần miễn phí đã hết`,
      resetIn: untilNextMonth(), renews: "month",
    };
  }
  // Free capacity that renews soon is spent before capacity that only renews next month.
  const renews = cost > 0 ? "never" : service === "gcloud" ? "month" : tier === "free" ? "day" : "never";
  return { ok: true, cost, renews };
}

/** A request is about to be sent: it takes its place in the per-minute window at once. */
export function reserve(key: string, model: string, kind: UsageKind) {
  const tag = keyTag(key);
  (minute[`${tag}|${kind}:${model}`] ??= []).push(Date.now());
}

/** A request worked: counts and money are added to the ledger. */
export function record(settings: UsageSettings, service: ServiceId, key: string, model: string, kind: UsageKind, amount: Amount) {
  const tag = keyTag(key);
  const tier = settings.tiers[tag] ?? "paid";
  const cost = estimateCost(settings, service, tier, kind, model, amount, tag);
  const entry = keyLedger(tag);
  const bucket = `${kind}:${model}`;
  entry.dayCount[bucket] = (entry.dayCount[bucket] ?? 0) + 1;
  if (service === "gcloud") entry.monthChars += amount.chars ?? 0;
  load().spent[service] += cost;
  persist();
}

/** The provider refused: a daily limit closes the model for the day, a minute limit fills the minute, a bad key rests. */
export function refused(key: string, model: string, kind: UsageKind, how: "day" | "minute" | "key", reason = "") {
  const tag = keyTag(key);
  const bucket = `${kind}:${model}`;
  if (how === "day") { keyLedger(tag).closed[bucket] = true; persist(); }
  else if (how === "minute") { const now = Date.now(); minute[`${tag}|${bucket}`] = Array.from({ length: 1000 }, () => now); }
  else blockedUntil[tag] = { until: Date.now() + 30 * 60_000, reason: reason || "key bị từ chối" };
}

// ---------------------------------------------------------------- reports for the settings screen
export function spentThisMonth(service: ServiceId): number {
  return load().spent[service];
}

export function keyReport(settings: UsageSettings, service: ServiceId, key: string, models: { model: string; kind: UsageKind }[]) {
  const tag = keyTag(key);
  const tier = settings.tiers[tag] ?? "paid";
  const entry = keyLedger(tag);
  return {
    tier,
    monthChars: entry.monthChars,
    rows: models.map(({ model, kind }) => {
      const { rpd } = limitsFor(service, tier, kind);
      const state = check(settings, service, key, model, kind, kind === "speech" ? { chars: 1 } : { inTokens: 1 });
      return { model, kind, today: entry.dayCount[`${kind}:${model}`] ?? 0, perDay: Number.isFinite(rpd) ? safe(rpd) : null, ok: state.ok, reason: state.reason, resetIn: state.resetIn };
    }),
  };
}

/** "khoảng 3 giờ 20 phút", "40 giây"… */
export function inWords(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 90) return `${seconds} giây`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 90) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} giờ ${minutes % 60} phút`;
  return `${Math.round(hours / 24)} ngày`;
}

// ---------------------------------------------------------------- the planner (Auto mode, speech)
export type Candidate = { service: ServiceId; key: string; model: string };

/**
 * Order in which to try speech candidates: allowed ones first; free before paid; among free ones,
 * capacity that renews soon (a free Gemini key, daily) before Cloud TTS's monthly pool; among paid
 * ones, the cheapest; ties keep the given order (the learner's preference).
 */
export function planSpeech(settings: UsageSettings, candidates: Candidate[], chars: number) {
  const rank = { day: 0, minute: 0, month: 1, never: 2 } as const;
  const scored = candidates.map((candidate, index) => ({ candidate, index, state: check(settings, candidate.service, candidate.key, candidate.model, "speech", { chars }) }));
  const allowed = scored.filter((item) => item.state.ok)
    .sort((a, b) => a.state.cost - b.state.cost || rank[a.state.renews] - rank[b.state.renews] || a.index - b.index)
    .map((item) => item.candidate);
  const refusals = scored.filter((item) => !item.state.ok).map((item) => item.state);
  return { order: allowed, refusals };
}
