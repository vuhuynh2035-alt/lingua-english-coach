import type { IllustrationName } from "@/components/illustration-icon";
import type { GrammarTopic } from "@/lib/grammar";

/**
 * Everything that differs between the languages the app teaches (English, Japanese, Chinese).
 * The language is chosen once on the first screen; its config is loaded on demand
 * (`loadLanguage`) before the learning app is imported, so the rest of the code can read
 * `LANG` as if it were a constant.
 */
export type LevelId = "A1" | "A2" | "B1" | "B2";
export type LangId = "en" | "ja" | "zh";
export type MascotKind = "nova" | "owl" | "panda";

export type Accent = {
  id: string;
  group: string;
  flag: string;
  name: string;
  /** Device voices are matched on these BCP-47 locales (lower-case). */
  locales: string[];
  /** How the accent is described to a cloud TTS model ("a standard Tokyo Japanese"). */
  prompt: string;
  sample: string;
};

export type Profile = {
  id: string;
  title: string;
  subtitle: string;
  icon: IllustrationName;
  color: string;
  scene: string;
  prompt: string;
  words: string[];
};

export type PlacementQuestion = { question: string; options: string[]; answer: number; explanation: string };
export type TutorText = { name: string; title: string; tagline: string; description: string; greeting: string };

export type LangConfig = {
  id: LangId;
  /** The language as Vietnamese people name it: "tiếng Nhật". */
  viName: string;
  /** English name of the language, used when talking to the AI. */
  nameEn: string;
  nameNative: string;
  flag: string;
  appTitle: string;
  appDescription: string;
  shortName: string;
  speechLang: string;
  /** Device voices of this language start with this. */
  langPrefix: string;
  levelSystem: string;
  levelLabels: Record<LevelId, string>;
  /** Plain-text name of the reading aid shown next to the script (empty when there is none). */
  phoneticName: string;
  /** "latin": the language shares the Latin script with Vietnamese; "cjk": scripts do not overlap. */
  scriptMode: "latin" | "cjk";
  /** Characters of the language being learned. */
  targetScript: RegExp;
  /** A run of target-language text: script characters plus the punctuation that joins them. */
  targetRun: RegExp;
  /** Sentence end marks that need no space after them. */
  sentenceEnd: string;
  /** A quoted sample sentence needs at least this many characters to get a practice card. */
  minDialogueChars: number;
  /** A bold phrase needs at least this many words to count as a sample sentence. */
  minBoldWords: number;
  recognitionHint: string;
  welcome: { headline: string; greeting: string };
  pronunciationFocus: string;
  promptNotes: string;
  pedagogy: Record<LevelId, string>;
  accents: Accent[];
  profiles: Profile[];
  phraseMeanings: Record<string, string>;
  suggestions: Record<string, string[]>;
  placement: PlacementQuestion[];
  tutors: Record<"maya" | "david" | "alex", TutorText>;
  grammarTopics: GrammarTopic[];
  /** Prefix of this language's storage keys: progress, history and scores never mix. */
  storagePrefix: string;
  defaults: { level: LevelId; profile: string };
  mascot: { kind: MascotKind; badge: string };
};

let current: LangConfig | null = null;

/** The language being learned. Only readable once `loadLanguage` has finished. */
export const LANG: LangConfig = new Proxy({} as LangConfig, {
  get(_target, key) {
    if (!current) throw new Error("The language has not been loaded yet.");
    return current[key as keyof LangConfig];
  },
});

export function setLanguage(config: LangConfig) {
  current = config;
}

export function levelLabel(level: string): string {
  return LANG.levelLabels[level as LevelId] ?? level;
}

export async function loadLanguage(id: LangId): Promise<LangConfig> {
  const config = id === "ja" ? (await import("@/lib/languages/ja")).default
    : id === "zh" ? (await import("@/lib/languages/zh")).default
      : (await import("@/lib/languages/en")).default;
  setLanguage(config);
  return config;
}
