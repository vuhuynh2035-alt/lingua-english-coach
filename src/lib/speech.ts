export type SpeechVoiceId = string;
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

export function splitBilingualText(text: string): SpeechSegment[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const viRegex = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
  const hasVietnamese = viRegex.test(trimmed);
  if (!hasVietnamese) {
    return [{ text: trimmed, lang: "en" }];
  }

  const hasEnglish = /[a-zA-Z]{2,}/.test(trimmed);
  if (!hasEnglish) {
    return [{ text: trimmed, lang: "vi" }];
  }

  // Split quotes: "...", “...”, '...', `...`
  const tokens = trimmed.split(/(["“`'][^"”`']+["”`'])/);
  const rawSegments: SpeechSegment[] = [];

  for (const token of tokens) {
    const s = token.trim();
    if (!s) continue;

    // Quoted text
    if (/^["“`'].*["”`']$/.test(s)) {
      const inner = s.slice(1, -1).trim();
      if (!inner) continue;
      const innerHasVi = viRegex.test(inner);
      rawSegments.push({ text: inner, lang: innerHasVi ? "vi" : "en" });
      continue;
    }

    // Split unquoted text into clauses
    const subClauses = s.split(/([.!?\n]+)/);
    let currentClause = "";
    for (const sub of subClauses) {
      if (!sub) continue;
      if (/^[.!?\n]+$/.test(sub)) {
        currentClause += sub;
        const clauseTrimmed = currentClause.trim();
        if (clauseTrimmed) {
          const isVi = viRegex.test(clauseTrimmed);
          const hasEn = /[a-zA-Z]{2,}/.test(clauseTrimmed);
          rawSegments.push({ text: clauseTrimmed, lang: isVi ? "vi" : (hasEn ? "en" : "vi") });
        }
        currentClause = "";
      } else {
        currentClause += sub;
      }
    }
    if (currentClause.trim()) {
      const clauseTrimmed = currentClause.trim();
      const isVi = viRegex.test(clauseTrimmed);
      const hasEn = /[a-zA-Z]{2,}/.test(clauseTrimmed);
      rawSegments.push({ text: clauseTrimmed, lang: isVi ? "vi" : (hasEn ? "en" : "vi") });
    }
  }

  // Merge consecutive segments of the same language
  const merged: SpeechSegment[] = [];
  for (const seg of rawSegments) {
    if (!seg.text.trim()) continue;
    if (merged.length > 0 && merged[merged.length - 1].lang === seg.lang) {
      merged[merged.length - 1].text += " " + seg.text;
    } else {
      merged.push({ text: seg.text, lang: seg.lang });
    }
  }

  return merged.length > 0 ? merged : [{ text: trimmed, lang: hasVietnamese ? "vi" : "en" }];
}
