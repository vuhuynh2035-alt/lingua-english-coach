import { LANG } from "@/lib/language";

/**
 * Settings shared by every language (API keys, provider, theme, font size, recording and
 * Vietnamese voice). The names are the ones the English-only app already used, so people who
 * used it keep their key and settings.
 */
export const sharedKey = (name: string) => `lingua-${name}`;

/**
 * Data that belongs to one language: progress, scores, chat history, lesson view, voice accent.
 * English keeps its original names ("lingua-progress"); other languages get their own prefix.
 */
export const langKey = (name: string) => `${LANG.storagePrefix}${name}`;
