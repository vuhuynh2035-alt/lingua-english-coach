import { LANG } from "@/lib/language";

const DATABASE_NAME = "lingua-speech-cache";
const DATABASE_VERSION = 1;
const SPEECH_STORE = "audio";
const MAX_CACHED_SPEECHES = 100;

type CachedSpeech = { id: string; blob: Blob; savedAt: number };

function openSpeechDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(SPEECH_STORE)) {
        request.result.createObjectStore(SPEECH_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Không thể mở bộ nhớ âm thanh trên thiết bị."));
    request.onblocked = () => reject(new Error("Hãy đóng các thẻ Teacher AI khác để mở bộ nhớ âm thanh."));
  });
}

function speechCacheId(cacheKey: string, text: string): string {
  return `${cacheKey}:${text}`;
}

export async function getCachedSpeech(cacheKey: string, text: string): Promise<Blob | null> {
  const database = await openSpeechDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(SPEECH_STORE, "readonly");
    const request = transaction.objectStore(SPEECH_STORE).get(speechCacheId(cacheKey, text));
    request.onsuccess = () => resolve(
      request.result && request.result.blob instanceof Blob ? request.result.blob : null,
    );
    request.onerror = () => reject(request.error ?? new Error("Không thể đọc âm thanh đã lưu."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("Không thể đọc âm thanh đã lưu."));
    };
  });
}

export async function saveCachedSpeech(
  cacheKey: string,
  text: string,
  blob: Blob,
): Promise<void> {
  const database = await openSpeechDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(SPEECH_STORE, "readwrite");
    const store = transaction.objectStore(SPEECH_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const cached = request.result as CachedSpeech[];
      cached.sort((first, second) => first.savedAt - second.savedAt);
      for (const item of cached.slice(0, Math.max(0, cached.length - MAX_CACHED_SPEECHES + 1))) {
        store.delete(item.id);
      }
      store.put({ id: speechCacheId(cacheKey, text), blob, savedAt: Date.now() } satisfies CachedSpeech);
    };
    request.onerror = () => transaction.abort();
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Không thể lưu âm thanh trên thiết bị."));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("Không thể lưu âm thanh trên thiết bị."));
    };
  });
}

export async function clearSpeechCache(): Promise<void> {
  const database = await openSpeechDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(SPEECH_STORE, "readwrite");
    transaction.objectStore(SPEECH_STORE).clear();
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Không thể xóa âm thanh đã lưu."));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("Không thể xóa âm thanh đã lưu."));
    };
  });
}

export type SpeechSegment = {
  text: string;
  /** "en" is kept as the id of the language being learned (here: Japanese/Chinese); "vi" is Vietnamese. */
  lang: "vi" | "en";
};

const VIETNAMESE_DIACRITICS_REGEX = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

/**
 * Readings (romaji / pinyin) are written in [square brackets] for the eyes only: they are
 * removed before anything is read aloud or used as a practice sentence.
 */
export function stripReadings(text: string): string {
  return text.replace(/\[[^\]]*\]/g, " ");
}

/**
 * Remove ALL markdown symbols (*, **, ***, _, backticks, bullet dashes, decorative emojis)
 * and normalize whitespace so text-to-speech NEVER reads out asterisks or stutters.
 */
export function cleanSpeechText(text: string): string {
  return text
    .replace(/\*+/g, "") // remove ALL asterisks (*, **, ***) everywhere!
    .replace(/_+/g, "")  // remove all underscores
    .replace(/^#+\s+/gm, "") // remove markdown headers #, ##
    .replace(/^[\s\-*•·✦💡🎯🎙️🔊✨]+\s*/gmu, "") // remove bullets and decorative icons (u: emoji are surrogate pairs)
    .replace(/[`~]/g, "") // remove backticks and strikethrough
    .replace(/[-–—]\s*$/g, "") // remove trailing dashes
    .replace(/^\s*[-–—]/g, "") // remove leading dashes
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sentences of the language being learned that the teacher put in quotes (or bold), for the
 * "practise this sentence" buttons. Vietnamese explanations and readings are skipped.
 */
function extractPracticePhrasesCjk(text: string): string[] {
  const phrases: string[] = [];
  const add = (raw: string) => {
    const candidate = cleanSpeechText(stripReadings(raw))
      .replace(/^["“「'`]+|["”」'`]+$/g, "")
      .replace(/[:;–-]+$/, "")
      .trim();
    if (candidate.length >= 2 && LANG.targetScript.test(candidate) &&
        !VIETNAMESE_DIACRITICS_REGEX.test(candidate) && !phrases.includes(candidate)) {
      phrases.push(candidate);
    }
  };

  for (const match of text.matchAll(/["“「`]([^"”」`\n]+)["”」`]/g)) add(match[1]);
  for (const match of text.matchAll(/\*\*([^*]+)\*\*/g)) {
    if (!/[:：]$/.test(match[1].trim())) add(match[1]);
  }
  // Nothing quoted: fall back to any run of the target language in the text.
  if (!phrases.length) {
    for (const match of stripReadings(text).matchAll(new RegExp(LANG.targetRun.source, "g"))) add(match[0]);
  }
  return phrases;
}

/**
 * Split text into segments for text-to-speech: runs of the language being learned go to
 * the practice voice, everything else (Vietnamese explanations) to the Vietnamese voice.
 * Scripts do not overlap (kana/kanji/hanzi vs Latin), so this works inside a sentence too:
 * “Hôm nay học 「こんにちは」 nhé” becomes three segments.
 */
function splitBilingualTextCjk(text: string): SpeechSegment[] {
  const cleaned = stripReadings(text).trim();
  if (!cleaned) return [];

  const raw: SpeechSegment[] = [];
  const push = (part: string, lang: "vi" | "en") => {
    const value = cleanSpeechText(part);
    // Skip pieces that carry no letters or digits at all (stray quotes, dashes).
    if (value && /[\p{L}\p{N}]/u.test(value)) raw.push({ text: value, lang });
  };

  let last = 0;
  for (const match of cleaned.matchAll(new RegExp(LANG.targetRun.source, "g"))) {
    const start = match.index ?? 0;
    if (start > last) push(cleaned.slice(last, start), "vi");
    push(match[0], "en");
    last = start + match[0].length;
  }
  if (last < cleaned.length) push(cleaned.slice(last), "vi");

  // Merge neighbours of the same language so the voice does not stutter.
  const merged: SpeechSegment[] = [];
  for (const segment of raw) {
    const previous = merged[merged.length - 1];
    if (previous && previous.lang === segment.lang) previous.text = cleanSpeechText(`${previous.text} ${segment.text}`);
    else merged.push({ ...segment });
  }
  return merged;
}

// ---- Languages that share the Latin script with Vietnamese (English) ----

/**
 * Extract targeted English practice phrases/sentences from assistant responses.
 * Detects quoted dialogue/examples ("...", “...”, *"..."*) and bold English sentences,
 * filtering out Vietnamese explanations, structural labels (Tình huống:, Senior Manager),
 * and stripping all markdown asterisks.
 */
function extractPracticePhrasesLatin(text: string): string[] {
  const phrases: string[] = [];
  const trimmed = text.trim();
  if (!trimmed) return phrases;

  // 1. Quoted English sentences: "...", “...”, *"...", `...`
  const quoteMatches = trimmed.matchAll(/(?:\*?["“\`'])([^"”\`'\n]+)(?:["”\`']\*?)/g);
  for (const match of quoteMatches) {
    let candidate = match[1].trim();
    candidate = cleanSpeechText(candidate);
    candidate = candidate.replace(/^["“'\`](.*)["”'\`]$/, "$1").trim();
    candidate = candidate.replace(/[:;–-]+$/, "").trim();

    if (candidate.length >= 8 && /[a-zA-Z]{2,}/.test(candidate) && !VIETNAMESE_DIACRITICS_REGEX.test(candidate)) {
      if (!phrases.includes(candidate)) {
        phrases.push(candidate);
      }
    }
  }

  // 2. Bold sections **...** that are ACTUAL sentences (not structural labels)
  const boldMatches = trimmed.matchAll(/\*\*([^*]+)\*\*/g);
  for (const match of boldMatches) {
    const raw = match[1].trim();
    // Exclude if it ends with colon (it is a section label like "Tình huống:" or "Maya (Manager):")
    if (/[:：]$/.test(raw)) continue;
    // Exclude meta role labels or directives like "Your turn!", "Step 1", "Senior Manager"
    if (/^(your turn|step \d+|note|tip|warning|gợi ý|tình huống|senior manager|junior developer)/i.test(raw)) continue;

    let candidate = cleanSpeechText(raw);
    candidate = candidate.replace(/^["“'\`](.*)["”'\`]$/, "$1").trim();
    candidate = candidate.replace(/[:;–-]+$/, "").trim();

    const words = candidate.split(/\s+/).filter(Boolean);
    if (words.length >= 3 && candidate.length >= 10 && /[a-zA-Z]{2,}/.test(candidate) && !VIETNAMESE_DIACRITICS_REGEX.test(candidate)) {
      if (!phrases.includes(candidate)) {
        phrases.push(candidate);
      }
    }
  }

  // 3. Fallback: inspect full standalone English sentences
  if (phrases.length === 0) {
    if (!VIETNAMESE_DIACRITICS_REGEX.test(trimmed)) {
      const sentences = trimmed.split(/(?<=[.!?])\s+/);
      for (const s of sentences) {
        const cleaned = cleanSpeechText(s);
        if (cleaned.length >= 5 && /[a-zA-Z]{2,}/.test(cleaned)) {
          phrases.push(cleaned);
        }
      }
    } else {
      const sentences = trimmed.split(/([.!?\n]+)/);
      for (const s of sentences) {
        const cleaned = cleanSpeechText(s);
        if (cleaned.length >= 10 && /[a-zA-Z]{2,}/.test(cleaned) && !VIETNAMESE_DIACRITICS_REGEX.test(cleaned)) {
          const words = cleaned.split(/\s+/).filter(Boolean);
          if (words.length >= 3 && !phrases.includes(cleaned)) {
            phrases.push(cleaned);
          }
        }
      }
    }
  }

  return phrases;
}

/**
 * Split text into bilingual segments (Vietnamese explanations vs English sample sentences).
 * Cleans all markdown formatting and asterisks (*) so TTS plays each segment cleanly
 * with the appropriate native voice.
 */
/**
 * Vietnamese when at least 30% of the words carry Vietnamese diacritics. A short phrase
 * without them (a label like "Senior Manager") stays Vietnamese outside quotes, to keep the
 * Vietnamese flow; inside quotes it is an English sample.
 */
function sentenceLanguage(sentence: string, quoted: boolean): "vi" | "en" {
  const words = sentence.split(/\s+/).filter((word) => /\p{L}/u.test(word));
  if (!words.length) return "vi";
  const vietnamese = words.filter((word) => VIETNAMESE_DIACRITICS_REGEX.test(word)).length;
  if (vietnamese === 0) {
    return quoted || words.length >= 3 || /[.?!]$/.test(sentence) ? "en" : "vi";
  }
  return vietnamese / words.length >= 0.3 ? "vi" : "en";
}

function splitBilingualTextLatin(text: string): SpeechSegment[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const hasVietnamese = VIETNAMESE_DIACRITICS_REGEX.test(trimmed);
  if (!hasVietnamese) {
    const cleaned = cleanSpeechText(trimmed);
    return cleaned ? [{ text: cleaned, lang: "en" }] : [];
  }

  const hasEnglish = /[a-zA-Z]{2,}/.test(trimmed);
  if (!hasEnglish) {
    const cleaned = cleanSpeechText(trimmed);
    return cleaned ? [{ text: cleaned, lang: "vi" }] : [];
  }

  // Split tokens by quoted sections (dialogue/examples). Only double quotes and backticks:
  // a single quote is usually an apostrophe ("Today's") and would break the split.
  const tokens = trimmed.split(/(\*?["“`][^"”`]+["”`]\*?)/);
  const rawSegments: SpeechSegment[] = [];

  for (const token of tokens) {
    const s = token.trim();
    if (!s) continue;

    // Quoted section
    if (/^(\*?["“`].*["”`]\*?)$/.test(s)) {
      const inner = cleanSpeechText(s).replace(/^["“`](.*)["”`]$/, "$1").trim();
      if (!inner) continue;
      rawSegments.push({ text: inner, lang: sentenceLanguage(inner, true) });
      continue;
    }

    // Unquoted text: judge each sentence on its own, so an English sentence that mentions a
    // Vietnamese name ("I am Cô Maya") is still read by the English voice.
    for (const sentence of s.split(/\n+|(?<=[.!?…])\s+/)) {
      const cleaned = cleanSpeechText(sentence);
      if (!cleaned) continue;
      rawSegments.push({ text: cleaned, lang: sentenceLanguage(cleaned, false) });
    }
  }

  // Merge consecutive segments of the same language
  const merged: SpeechSegment[] = [];
  for (const seg of rawSegments) {
    const cleaned = cleanSpeechText(seg.text);
    if (!cleaned || /^[^\w\s]*$/.test(cleaned)) continue; // ignore pure punctuation
    if (merged.length > 0 && merged[merged.length - 1].lang === seg.lang) {
      merged[merged.length - 1].text = cleanSpeechText(merged[merged.length - 1].text + " " + cleaned);
    } else {
      merged.push({ text: cleaned, lang: seg.lang });
    }
  }

  const finalCleaned = cleanSpeechText(trimmed);
  return merged.length > 0 ? merged : (finalCleaned ? [{ text: finalCleaned, lang: hasVietnamese ? "vi" : "en" }] : []);
}

/** Sample sentences of the language being learned that the teacher put in quotes or bold. */
export function extractPracticePhrases(text: string): string[] {
  return LANG.scriptMode === "latin" ? extractPracticePhrasesLatin(text) : extractPracticePhrasesCjk(text);
}

/** Splits text into segments for the practice voice and the Vietnamese voice. */
export function splitBilingualText(text: string): SpeechSegment[] {
  return LANG.scriptMode === "latin" ? splitBilingualTextLatin(text) : splitBilingualTextCjk(text);
}
