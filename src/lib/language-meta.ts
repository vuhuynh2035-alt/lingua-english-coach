import type { LangId, MascotKind } from "@/lib/language";

/** What the first screen needs to know about each language without loading it. */
export type LanguageMeta = {
  id: LangId;
  flag: string;
  nameVi: string;
  nameNative: string;
  tagline: string;
  mascot: MascotKind;
  mascotName: string;
  color: string;
};

export const LANGUAGES: LanguageMeta[] = [
  { id: "en", flag: "🇬🇧", nameVi: "Tiếng Anh", nameNative: "English", tagline: "CEFR A1–B2 · giao tiếp, công sở, du lịch, IT, y khoa, tài chính, kỹ thuật lạnh", mascot: "nova", mascotName: "Nova", color: "#15966d" },
  { id: "ja", flag: "🇯🇵", nameVi: "Tiếng Nhật", nameNative: "日本語", tagline: "JLPT N5–N2 · romaji, kính ngữ, tiếng Nhật công sở", mascot: "owl", mascotName: "Alex", color: "#e11d48" },
  { id: "zh", flag: "🇨🇳", nameVi: "Tiếng Trung", nameNative: "中文", tagline: "HSK 1–5 · pinyin, thanh điệu, tiếng Trung công sở", mascot: "panda", mascotName: "Panda", color: "#dc2626" },
];

const LANGUAGE_STORAGE = "lingua-language";

export function isLangId(value: unknown): value is LangId {
  return value === "en" || value === "ja" || value === "zh";
}

/** The language chosen last time, from the link (?lang=ja) or the browser; null on a first visit. */
export function savedLanguage(): LangId | null {
  try {
    const query = new URLSearchParams(window.location.search);
    if (query.has("choose")) return null;
    const fromLink = query.get("lang");
    if (isLangId(fromLink)) return fromLink;
    const saved = localStorage.getItem(LANGUAGE_STORAGE);
    if (isLangId(saved)) return saved;
    // Someone who used the English-only app before: keep them on English.
    if (localStorage.getItem("lingua-progress") || localStorage.getItem("lingua-gemini-api-key")) return "en";
  } catch {}
  return null;
}

export function rememberLanguage(id: LangId) {
  try { localStorage.setItem(LANGUAGE_STORAGE, id); } catch {}
}

/** Changing language reloads the page, so every module starts again with the new language. */
export function switchLanguage(id: LangId | null) {
  if (id) rememberLanguage(id);
  const url = new URL(window.location.href);
  url.searchParams.delete("lang");
  url.searchParams.delete("choose");
  if (!id) url.searchParams.set("choose", "1");
  url.hash = "";
  window.location.assign(url.toString());
}
