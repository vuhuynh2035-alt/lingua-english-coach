/**
 * Published prices of the chat models the app may use, USD per 1M tokens, as read on the providers'
 * pricing pages in November 2026 (https://aistudio.google.com/docs/pricing and
 * https://developers.openai.com/api/docs/pricing). Providers change prices: update this file.
 */
export type TokenPrice = { in: number; out: number };

/** Gemini 3.6 / 3.8 Flash and the Gemini text-to-speech models double their price on this date. */
const PRICE_CHANGE = Date.UTC(2027, 0, 1);

/** A usual tutor turn: about 3,000 tokens in (prompt and history) and 700 out. */
export const TURN_TOKENS = { in: 3000, out: 700 };

export function geminiChatPrice(model: string, now = Date.now()): TokenPrice | null {
  const id = model.toLowerCase();
  if (/^gemini-3\.[68]-flash(?!-lite)/.test(id)) return now < PRICE_CHANGE ? { in: 0.75, out: 3.75 } : { in: 1.5, out: 7.5 };
  if (/^gemini-3\.5-flash-lite/.test(id)) return { in: 0.3, out: 2.5 };
  if (/^gemini-3\.1-flash-lite/.test(id)) return { in: 0.25, out: 1.5 };
  if (/^gemini-3-flash/.test(id)) return { in: 0.5, out: 3 };
  if (/^gemini-3\.1-pro/.test(id)) return { in: 2, out: 12 };
  return null;
}

export function openAiChatPrice(model: string): TokenPrice | null {
  const id = model.toLowerCase();
  if (/^gpt-5-nano/.test(id)) return { in: 0.05, out: 0.4 };
  if (/^gpt-5-mini/.test(id)) return { in: 0.25, out: 2 };
  if (/^gpt-4o-mini(?!-tts)/.test(id)) return { in: 0.15, out: 0.6 };
  if (/^gpt-4\.1-mini/.test(id)) return { in: 0.4, out: 1.6 };
  return null;
}

/** Gemini text-to-speech prices follow the same date: 1 now, 2 from 1 January 2027. */
export function geminiSpeechFactor(now = Date.now()): number {
  return now < PRICE_CHANGE ? 1 : 2;
}

/** USD for one usual tutor turn. */
export const turnCost = (price: TokenPrice) => (price.in * TURN_TOKENS.in + price.out * TURN_TOKENS.out) / 1e6;

/** "gemini-3.8-flash" -> 3.8 */
export function geminiGeneration(id: string): number {
  return Number(/gemini-(\d+(?:\.\d+)?)/.exec(id)?.[1] ?? 0);
}

/** The oldest Flash generation still good enough to teach (explain grammar in Vietnamese, hold a conversation). */
export const MIN_TUTOR_GENERATION = 3.5;

/**
 * Gemini chat models good enough to tutor: Flash of generation 3.5 or newer and stable. Left out:
 * Flash-Lite (too weak for explanations), Pro (needlessly costly), previews (small quotas) and older Flash.
 * The "-latest" alias is kept as the last resort.
 */
export function suitsTutor(model: string): boolean {
  const id = model.toLowerCase();
  if (id === "gemini-flash-latest") return true;
  return /^gemini-[\d.]+-flash/.test(id)
    && !/lite|pro|preview|thinking|exp|image|tts|live|audio|embed/.test(id)
    && geminiGeneration(id) >= MIN_TUTOR_GENERATION;
}

/** Price used to rank a Gemini model whose price is not listed: that of the current standard Flash. */
export function rankingCost(model: string): number {
  const price = geminiChatPrice(model) ?? geminiChatPrice("gemini-3.8-flash");
  return price ? turnCost(price) : Infinity;
}
