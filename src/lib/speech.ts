export type SpeechVoiceId = string;

export type AccentRegion = "all" | "us" | "uk" | "in" | "au" | "ca" | "de";

export type AccentPreset = {
  id: AccentRegion;
  code: string;
  name: string;
  flag: string;
  label: string;
  sampleSentence: string;
  description: string;
  tuning: {
    rateMultiplier: number;
    pitchMultiplier: number;
  };
};

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: "us",
    code: "en-US",
    flag: "🇺🇸",
    name: "Mỹ (USA)",
    label: "Tiếng Anh - Mỹ (General American)",
    sampleSentence: "Hello! Welcome to your English lesson. Great to have you here today.",
    description: "Âm r rõ ràng, nhấn trọng âm dứt khoát. Giọng phổ biến nhất trong phim ảnh, truyền thông và kinh doanh toàn cầu.",
    tuning: { rateMultiplier: 1.0, pitchMultiplier: 1.0 },
  },
  {
    id: "uk",
    code: "en-GB",
    flag: "🇬🇧",
    name: "Anh (UK)",
    label: "Tiếng Anh - Anh (British RP)",
    sampleSentence: "Good day! It is an absolute pleasure to practice speaking English with you.",
    description: "Ngữ điệu trang trọng, nguyên âm tròn, âm t rõ nét. Chuẩn kỳ thi học thuật quốc tế IELTS và Cambridge.",
    tuning: { rateMultiplier: 0.98, pitchMultiplier: 1.03 },
  },
  {
    id: "in",
    code: "en-IN",
    flag: "🇮🇳",
    name: "Ấn Độ (India)",
    label: "Tiếng Anh - Ấn Độ (Indian English)",
    sampleSentence: "Hello my friend! Let us practice this important topic together right now.",
    description: "Nhịp điệu nhanh đặc trưng, uốn lưỡi nhẹ các âm t/d. Rất quan trọng khi làm việc trong ngành CNTT, kỹ thuật và đối tác quốc tế.",
    tuning: { rateMultiplier: 1.04, pitchMultiplier: 1.05 },
  },
  {
    id: "au",
    code: "en-AU",
    flag: "🇦🇺",
    name: "Úc (Australia)",
    label: "Tiếng Anh - Úc (Australian English)",
    sampleSentence: "G'day! How are you going today? Let's have a great practice session together.",
    description: "Âm a kéo dài, ngữ điệu thân thiện cởi mở. Rất hữu ích cho người có mục tiêu du học hoặc định cư tại Úc & New Zealand.",
    tuning: { rateMultiplier: 0.97, pitchMultiplier: 0.98 },
  },
  {
    id: "ca",
    code: "en-CA",
    flag: "🇨🇦",
    name: "Canada",
    label: "Tiếng Anh - Canada (Canadian)",
    sampleSentence: "Hi there! I am very excited to practice speaking English with you today.",
    description: "Hài hòa giữa âm điệu Bắc Mỹ và ngữ điệu Anh quốc, nguyên âm nhẹ nhàng, dễ nghe.",
    tuning: { rateMultiplier: 1.0, pitchMultiplier: 1.0 },
  },
  {
    id: "de",
    code: "de-DE",
    flag: "🇩🇪",
    name: "Đức / Châu Âu (EU)",
    label: "Tiếng Anh - Châu Âu (Euro Accent)",
    sampleSentence: "Hello! We should systematically review the key English structures today.",
    description: "Phát âm phụ âm sắc bén, nhịp điệu logic gãy gọn, thường gặp trong môi trường doanh nghiệp đa quốc gia tại châu Âu.",
    tuning: { rateMultiplier: 0.95, pitchMultiplier: 0.96 },
  },
];

export function getAccentPreset(id: string): AccentPreset {
  return ACCENT_PRESETS.find((p) => p.id === id) || ACCENT_PRESETS[0];
}

export type ParsedVoiceInfo = {
  countryCode: "us" | "uk" | "in" | "au" | "ca" | "de" | "other";
  countryName: string;
  flag: string;
  gender: "female" | "male";
  isNatural: boolean;
};

export function parseVoiceInfo(name: string, lang: string): ParsedVoiceInfo {
  const nameLower = name.toLowerCase();
  const langLower = lang.toLowerCase();

  let countryCode: "us" | "uk" | "in" | "au" | "ca" | "de" | "other" = "other";
  let countryName = "Quốc tế";
  let flag = "🌐";

  if (langLower.startsWith("en-us") || nameLower.includes("united states") || nameLower.includes("us english") || nameLower.includes("(us)")) {
    countryCode = "us";
    countryName = "Mỹ (USA)";
    flag = "🇺🇸";
  } else if (langLower.startsWith("en-gb") || langLower.startsWith("en-uk") || nameLower.includes("united kingdom") || nameLower.includes("uk english") || nameLower.includes("(uk)")) {
    countryCode = "uk";
    countryName = "Anh (UK)";
    flag = "🇬🇧";
  } else if (langLower.startsWith("en-in") || nameLower.includes("india") || nameLower.includes("indian")) {
    countryCode = "in";
    countryName = "Ấn Độ (India)";
    flag = "🇮🇳";
  } else if (langLower.startsWith("en-au") || nameLower.includes("australia") || nameLower.includes("australian")) {
    countryCode = "au";
    countryName = "Úc (Australia)";
    flag = "🇦🇺";
  } else if (langLower.startsWith("en-ca") || nameLower.includes("canada") || nameLower.includes("canadian")) {
    countryCode = "ca";
    countryName = "Canada";
    flag = "🇨🇦";
  } else if (langLower.startsWith("de") || nameLower.includes("german") || nameLower.includes("deutsch")) {
    countryCode = "de";
    countryName = "Đức (Germany)";
    flag = "🇩🇪";
  }

  const femaleKeywords = [
    "female", "zira", "susan", "heera", "catherine", "linda", "hedda", "jenny", "aria",
    "samantha", "karen", "moira", "fiona", "tessa", "veena", "priya", "neerja", "sangeeta",
    "victoria", "hazel", "alice", "helena", "eva", "stefanie", "natural female", "wavenet-a", "wavenet-c", "wavenet-e", "wavenet-f"
  ];
  const isFemale = femaleKeywords.some((k) => nameLower.includes(k));
  const gender: "female" | "male" = isFemale ? "female" : "male";

  const isNatural = nameLower.includes("natural") || nameLower.includes("online") || nameLower.includes("google") || nameLower.includes("neural");

  return {
    countryCode,
    countryName,
    flag,
    gender,
    isNatural,
  };
}

export const SPEECH_DELIVERY_STYLES = [
  { id: "clear", label: "Rõ, dứt khoát", instruction: "Use crisp consonants, clear enunciation, and a confident, slightly firm delivery." },
  { id: "balanced", label: "Tự nhiên, cân bằng", instruction: "Use a natural conversational rhythm with balanced warmth and clarity." },
  { id: "gentle", label: "Êm, nhẹ nhàng", instruction: "Use a gentle, warm tone, smooth phrasing, and a relaxed moderate pace." },
] as const;
export type SpeechDeliveryStyle = (typeof SPEECH_DELIVERY_STYLES)[number]["id"];

export function getSpeechDeliveryInstruction(style: SpeechDeliveryStyle): string {
  return SPEECH_DELIVERY_STYLES.find((item) => item.id === style)?.instruction
    ?? SPEECH_DELIVERY_STYLES[1].instruction;
}

export type GoogleSpeechVoice = {
  id: string;
  label: string;
  gender: "male" | "female";
  accent: string;
  description: string;
};

const DATABASE_NAME = "lingua-speech-cache";
const DATABASE_VERSION = 1;
const SPEECH_STORE = "audio";
const MAX_CACHED_SPEECHES = 100;

type CachedSpeech = { id: string; blob: Blob; savedAt: number };

export function isSpeechVoiceId(value: string): value is SpeechVoiceId {
  return /^[A-Za-z0-9_-]{1,100}$/.test(value);
}

export async function generateSpeech(
  apiKey: string,
  text: string,
  voice: SpeechVoiceId,
  accent = "",
  deliveryStyle: SpeechDeliveryStyle = "balanced",
): Promise<Blob> {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      model: "gemini-3.8-flash-tts",
      input: [{
        type: "user_input",
        content: [{
          type: "text",
          text,
          annotations: [{
            type: "speech_metadata",
            style: `Read the English text carefully for an English learner. ${getSpeechDeliveryInstruction(deliveryStyle)}${accent ? ` Preserve the voice's ${accent} English accent.` : ""}`,
          }],
        }],
      }],
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice }] },
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const result: unknown = await response.json();
      if (typeof result === "object" && result !== null && "error" in result &&
          typeof result.error === "object" && result.error !== null && "message" in result.error) {
        detail = String(result.error.message);
      }
    } catch {
      detail = "";
    }
    throw new Error(detail
      ? `Không tạo được giọng đọc Google AI (HTTP ${response.status}): ${detail}`
      : `Không tạo được giọng đọc Google AI (HTTP ${response.status}).`);
  }

  const result: unknown = await response.json();
  if (typeof result !== "object" || result === null || !("steps" in result) ||
      !Array.isArray(result.steps)) {
    throw new Error("Gemini không trả về dữ liệu âm thanh đúng định dạng.");
  }
  const audioPart = result.steps
    .filter((step): step is { content: unknown[] } =>
      typeof step === "object" && step !== null && "content" in step &&
      Array.isArray(step.content))
    .flatMap((step) => step.content)
    .find((part): part is { data: string; mime_type?: string } =>
      typeof part === "object" && part !== null && "type" in part && part.type === "audio" &&
      "data" in part && typeof part.data === "string");
  if (!audioPart) throw new Error("Gemini chưa tạo được âm thanh. Vui lòng thử lại.");

  const bytes = Uint8Array.from(atob(audioPart.data), (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: audioPart.mime_type ?? "audio/wav" });
}

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
  lang: "vi" | "en";
};

const VIETNAMESE_DIACRITICS_REGEX = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

/**
 * Remove ALL markdown symbols (*, **, ***, _, backticks, bullet dashes, decorative emojis)
 * and normalize whitespace so text-to-speech NEVER reads out asterisks or stutters.
 */
export function cleanSpeechText(text: string): string {
  return text
    .replace(/\*+/g, "") // remove ALL asterisks (*, **, ***) everywhere!
    .replace(/_+/g, "")  // remove all underscores
    .replace(/^#+\s+/gm, "") // remove markdown headers #, ##
    .replace(/^[\s-*•·✦💡🎯🎙️🔊✨]+\s*/gm, "") // remove bullets and decorative icons
    .replace(/[\`~]/g, "") // remove backticks and strikethrough
    .replace(/[-–—]\s*$/g, "") // remove trailing dashes
    .replace(/^\s*[-–—]/g, "") // remove leading dashes
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract targeted English practice phrases/sentences from assistant responses.
 * Detects quoted dialogue/examples ("...", “...”, *"..."*) and bold English sentences,
 * filtering out Vietnamese explanations, structural labels (Tình huống:, Senior Manager),
 * and stripping all markdown asterisks.
 */
export function extractEnglishPracticePhrases(text: string): string[] {
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
export function splitBilingualText(text: string): SpeechSegment[] {
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

  // Split tokens by quoted sections (which are typically dialogue/examples)
  const tokens = trimmed.split(/(\*?["“\`'][^"”\`']+["”\`']\*?)/);
  const rawSegments: SpeechSegment[] = [];

  for (const token of tokens) {
    const s = token.trim();
    if (!s) continue;

    // Quoted section
    if (/^(\*?["“\`'].*["”\`']\*?)$/.test(s)) {
      const inner = cleanSpeechText(s).replace(/^["“'\`](.*)["”'\`]$/, "$1").trim();
      if (!inner) continue;
      const isVi = VIETNAMESE_DIACRITICS_REGEX.test(inner);
      const isEnSample = !isVi && /[a-zA-Z]{2,}/.test(inner) && (inner.split(/\s+/).length >= 2 || inner.length > 8);
      rawSegments.push({ text: inner, lang: isEnSample ? "en" : "vi" });
      continue;
    }

    // Unquoted text: split by lines/clauses
    const lines = s.split(/(\n+)/);
    for (const line of lines) {
      if (!line.trim()) continue;
      const cleaned = cleanSpeechText(line);
      if (!cleaned) continue;

      const isVi = VIETNAMESE_DIACRITICS_REGEX.test(cleaned);
      if (isVi) {
        rawSegments.push({ text: cleaned, lang: "vi" });
      } else {
        const words = cleaned.split(/\s+/).filter(Boolean);
        if (words.length >= 4 || /[.?!]$/.test(cleaned)) {
          rawSegments.push({ text: cleaned, lang: "en" });
        } else {
          // Short label or role term inside Vietnamese context (e.g. Senior Manager, Maya (Manager):)
          // read as Vietnamese to maintain smooth flow
          rawSegments.push({ text: cleaned, lang: "vi" });
        }
      }
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
