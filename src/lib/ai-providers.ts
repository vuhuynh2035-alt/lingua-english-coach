import { GeminiPart, generateChatWithGemini, generateWithGemini } from "@/lib/gemini";
import {
  GoogleSpeechVoice,
  SpeechDeliveryStyle,
  getSpeechDeliveryInstruction,
  isSpeechVoiceId,
} from "@/lib/speech";

export type AiProvider = "google" | "openai";
export type AiModel = { id: string; label: string };

export const DEFAULT_MODELS: Record<AiProvider, string> = {
  google: "gemini-2.5-flash",
  openai: "gpt-4o-mini",
};

export const OPENAI_SPEECH_VOICES = [
  { id: "alloy", label: "Alloy" },
  { id: "ash", label: "Ash" },
  { id: "ballad", label: "Ballad" },
  { id: "coral", label: "Coral" },
  { id: "echo", label: "Echo" },
  { id: "fable", label: "Fable" },
  { id: "onyx", label: "Onyx" },
  { id: "nova", label: "Nova" },
  { id: "sage", label: "Sage" },
  { id: "shimmer", label: "Shimmer" },
  { id: "verse", label: "Verse" },
  { id: "marin", label: "Marin" },
  { id: "cedar", label: "Cedar" },
] as const;

const GOOGLE_ACCENT_FILTERS = ["American", "Australian", "British", "Indian", "Chinese", "German"] as const;

export type GoogleSpeechVoiceCatalog = {
  voices: GoogleSpeechVoice[];
  failedRegions: (typeof GOOGLE_ACCENT_FILTERS)[number][];
};

function accentMatchesRegion(accent: string, region: string): boolean {
  const normalized = accent.toLowerCase();
  const terms: Record<(typeof GOOGLE_ACCENT_FILTERS)[number], string[]> = {
    American: ["american", "united states", "u.s.", "usa"],
    Australian: ["australian", "australia"],
    British: ["british", "united kingdom", "uk", "england"],
    Indian: ["indian", "india"],
    Chinese: ["chinese", "china"],
    German: ["german", "germany"],
  };
  return terms[region as (typeof GOOGLE_ACCENT_FILTERS)[number]]
    .some((term) => normalized.includes(term));
}

export function isAiProvider(value: string): value is AiProvider {
  return value === "google" || value === "openai";
}

export async function fetchAiModels(provider: AiProvider, apiKey: string): Promise<AiModel[]> {
  const endpoint = provider === "google"
    ? "https://generativelanguage.googleapis.com/v1beta/models"
    : "https://api.openai.com/v1/models";
  const response = await fetch(endpoint, {
    headers: provider === "google"
      ? { "x-goog-api-key": apiKey }
      : { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(30_000),
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(getProviderError(provider, response.status, result));
  if (provider === "google") {
    if (!isRecord(result) || !Array.isArray(result.models)) {
      throw new Error("Google không trả về danh sách mô hình đúng định dạng.");
    }
    const models = result.models.flatMap((item): AiModel[] => {
      if (!isRecord(item) || typeof item.name !== "string" ||
          !Array.isArray(item.supportedGenerationMethods) ||
          !item.supportedGenerationMethods.includes("generateContent")) return [];
      const id = item.name.replace(/^models\//, "");
      return [{ id, label: typeof item.displayName === "string" ? item.displayName : id }];
    });
    if (!models.length) throw new Error("API key Google không có mô hình hỗ trợ tạo nội dung.");
    return models.sort((first, second) => first.id.localeCompare(second.id));
  }

  if (!isRecord(result) || !Array.isArray(result.data)) {
    throw new Error("OpenAI không trả về danh sách mô hình đúng định dạng.");
  }
  const models = result.data.flatMap((item): AiModel[] => {
    if (!isRecord(item) || typeof item.id !== "string") return [];
    const id = item.id;
    if (!/^(gpt-|o[134](?:-|$))/.test(id) ||
        /(audio|transcri|tts|embedding|moderation|realtime|search|image|video)/i.test(id)) return [];
    return [{ id, label: id }];
  });
  if (!models.length) throw new Error("Không tìm thấy mô hình chat OpenAI tương thích trong tài khoản này.");
  return models.sort((first, second) => second.id.localeCompare(first.id));
}

export async function fetchGoogleSpeechVoices(apiKey: string): Promise<GoogleSpeechVoiceCatalog> {
  const accentResults = await Promise.allSettled(GOOGLE_ACCENT_FILTERS.map(async (accent) => {
    const query = new URLSearchParams({ type: "prebuilt", page_size: "100", accent });
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/voices?${query}`, {
      headers: { "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(30_000),
    });
    const result: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error(getProviderError("google", response.status, result));
    if (!isRecord(result) || !Array.isArray(result.voices)) {
      throw new Error(`Google không trả về danh sách giọng ${accent} đúng định dạng.`);
    }

    const voices = result.voices.flatMap((item): GoogleSpeechVoice[] => {
      if (!isRecord(item) || typeof item.id !== "string" ||
          (item.gender !== "male" && item.gender !== "female") ||
          typeof item.accent !== "string" || !accentMatchesRegion(item.accent, accent)) return [];
      const id = item.id;
      if (!isSpeechVoiceId(id)) return [];
      return [{
        id,
        gender: item.gender,
        accent: item.accent,
        label: typeof item.displayName === "string" && item.displayName.trim()
          ? item.displayName.trim()
          : id,
        description: typeof item.description === "string" ? item.description : "",
      }];
    });
    return { accent, voices };
  }));

  const selected: GoogleSpeechVoice[] = [];
  const failedRegions = accentResults.flatMap((result, index) =>
    result.status === "rejected" ? [GOOGLE_ACCENT_FILTERS[index]] : []);
  const successfulResults = accentResults.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : []);
  for (const { voices } of successfulResults) {
    for (const gender of ["male", "female"] as const) {
      const voice = voices
        .filter((item) => item.gender === gender)
        .sort((first, second) => first.id.localeCompare(second.id))[0];
      if (voice && !selected.some((item) => item.id === voice.id)) selected.push(voice);
    }
  }
  if (!selected.length) {
    const firstFailure = accentResults.find((result): result is PromiseRejectedResult => result.status === "rejected");
    if (firstFailure) throw firstFailure.reason;
    throw new Error("Chưa tìm thấy giọng nam/nữ theo các vùng đã chọn. Hãy kiểm tra API key hoặc thử lại sau.");
  }
  return { voices: selected, failedRegions };
}

export async function generateAiText(
  provider: AiProvider,
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  if (provider === "google") {
    return generateChatWithGemini(apiKey, model, systemPrompt, messages);
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
      temperature: 0.7,
      max_completion_tokens: 300,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(getProviderError(provider, response.status, result));
  if (!isRecord(result) || !Array.isArray(result.choices) || !isRecord(result.choices[0]) ||
      !isRecord(result.choices[0].message) || typeof result.choices[0].message.content !== "string" ||
      !result.choices[0].message.content.trim()) {
    throw new Error("OpenAI trả về câu trả lời không đúng định dạng.");
  }
  return result.choices[0].message.content.trim();
}

export async function transcribeWithOpenAi(apiKey: string, audio: Blob): Promise<string> {
  const mimeType = audio.type || "audio/webm";
  const extension = mimeType.includes("mp4") || mimeType.includes("m4a") ? "m4a"
    : mimeType.includes("wav") ? "wav"
    : mimeType.includes("ogg") ? "ogg"
    : "webm";
  const audioFile = new File([audio], `learner-audio.${extension}`, { type: mimeType });
  const form = new FormData();
  form.set("file", audioFile);
  form.set("model", "gpt-4o-mini-transcribe");
  form.set("response_format", "json");
  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(90_000),
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(getProviderError("openai", response.status, result));
  if (!isRecord(result) || typeof result.text !== "string" || !result.text.trim()) {
    throw new Error("OpenAI không trả về bản chép lời đúng định dạng.");
  }
  return result.text.trim();
}

export async function generateProviderSpeech(
  provider: AiProvider,
  apiKey: string,
  model: string,
  voice: string,
  text: string,
  accent = "",
  deliveryStyle: SpeechDeliveryStyle = "balanced",
): Promise<Blob> {
  if (provider === "google") {
    const { generateSpeech } = await import("@/lib/speech");
    if (!isSpeechVoiceId(voice)) throw new Error("Hãy chọn một giọng đọc Google hợp lệ trong Cài đặt.");
    return generateSpeech(apiKey, text, voice, accent, deliveryStyle);
  }
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice,
      input: text,
      instructions: `Read in English for a language learner. ${getSpeechDeliveryInstruction(deliveryStyle)}${accent ? ` Preserve a clear ${accent} English accent.` : ""}`,
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok) {
    const result: unknown = await response.json().catch(() => null);
    throw new Error(getProviderError(provider, response.status, result));
  }
  return response.blob();
}

export function generateGeminiMultimodalResponse(
  apiKey: string,
  parts: GeminiPart[],
  model = DEFAULT_MODELS.google,
): Promise<string> {
  return generateWithGemini(apiKey, parts, model);
}

export function getProviderError(provider: AiProvider, status: number, result: unknown): string {
  const message = isRecord(result) && isRecord(result.error) && typeof result.error.message === "string"
    ? result.error.message
    : "";
  if (status === 401 || status === 403) {
    return `${provider === "google" ? "Google Gemini" : "OpenAI"} từ chối API key (HTTP ${status}). Kiểm tra key hoặc chọn key khác trong Cài đặt.`;
  }
  if (status === 429) {
    return `API key ${provider === "google" ? "Google Gemini" : "OpenAI"} đã hết hạn mức hoặc bị giới hạn. Hãy chọn key khác trong Cài đặt.`;
  }
  if (status === 404) {
    return `Không tìm thấy mô hình hoặc API (HTTP 404). Hãy tải lại danh sách và chọn mô hình còn hoạt động.`;
  }
  if (status === 503 || status === 504) return "Dịch vụ AI đang bận. Vui lòng thử lại sau.";
  return message
    ? `Yêu cầu ${provider === "google" ? "Google Gemini" : "OpenAI"} thất bại (HTTP ${status}): ${message}`
    : `Yêu cầu ${provider === "google" ? "Google Gemini" : "OpenAI"} thất bại (HTTP ${status}).`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
