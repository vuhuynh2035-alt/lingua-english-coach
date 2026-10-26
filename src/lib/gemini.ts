const MODEL = "gemini-2.0-flash";

export type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

export async function validateGeminiKey(apiKey: string, model = MODEL): Promise<void> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}`,
    { headers: { "x-goog-api-key": apiKey }, signal: AbortSignal.timeout(15_000) },
  );
  if (!response.ok) throw new Error(await getGeminiError(response));
}

export async function generateWithGemini(
  apiKey: string,
  parts: GeminiPart[],
  model = MODEL,
): Promise<string> {
  return requestGemini(apiKey, model, {
    contents: [{ role: "user", parts }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 700 },
  });
}

export async function generateChatWithGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  const conversation = [...messages];
  let context = systemPrompt;
  if (conversation[0]?.role === "assistant") {
    context += `\n\nThe tutor has already said: ${conversation.shift()?.content ?? ""}`;
  }
  const generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    thinkingConfig?: { thinkingBudget: number };
  } = { temperature: 0.7, maxOutputTokens: 800 };

  // Set thinkingBudget: 0 for all models that might engage thinking mode
  if (/gemini-(?:2|flash|thinking)/i.test(model)) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  const payload = {
    systemInstruction: { parts: [{ text: context }] },
    contents: conversation.map((message) => ({
      role: message.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: message.content }],
    })),
    generationConfig,
  };

  try {
    return await requestGemini(apiKey, model, payload);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // If thinkingConfig is rejected by Google API (HTTP 400), retry immediately without it
    if (payload.generationConfig.thinkingConfig && /thinking/i.test(errorMsg)) {
      const fallbackPayload = {
        ...payload,
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
      };
      return await requestGemini(apiKey, model, fallbackPayload);
    }
    // If systemInstruction is rejected (HTTP 400), embed it into the first user message
    if (/system(?:_|\s)?instruction/i.test(errorMsg)) {
      const fallbackContents = payload.contents.map((msg, index) =>
        index === 0 && msg.role === "user"
          ? { ...msg, parts: [{ text: `[Hướng dẫn sư phạm: ${context}]\n\n${(msg.parts[0] as { text: string }).text}` }] }
          : msg
      );
      return await requestGemini(apiKey, model, {
        contents: fallbackContents,
        generationConfig: payload.generationConfig,
      });
    }
    throw error;
  }
}

async function requestGemini(
  apiKey: string,
  model: string,
  request: {
    systemInstruction?: { parts: { text: string }[] };
    contents: { role: "user" | "model"; parts: GeminiPart[] }[];
    generationConfig: {
      temperature: number;
      maxOutputTokens: number;
      thinkingConfig?: { thinkingBudget: number };
    };
  },
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(60_000),
    },
  );

  if (!response.ok) throw new Error(await getGeminiError(response));
  const result: unknown = await response.json();

  if (typeof result !== "object" || result === null || !("candidates" in result) ||
      !Array.isArray(result.candidates)) {
    throw new Error("AI trả về kết quả không đúng định dạng.");
  }
  const candidate = result.candidates[0];
  if (typeof candidate !== "object" || candidate === null || !("content" in candidate) ||
      typeof candidate.content !== "object" || candidate.content === null ||
      !("parts" in candidate.content) || !Array.isArray(candidate.content.parts)) {
    throw new Error("Gia sư AI chưa có câu trả lời. Vui lòng thử lại.");
  }
  const responseParts: unknown[] = candidate.content.parts;
  const text = responseParts
    .filter((part): part is { text: string } =>
      typeof part === "object" && part !== null && "text" in part && typeof part.text === "string")
    .map((part) => part.text)
    .join("")
    .trim();
  if (!text) throw new Error("Gia sư AI chưa có câu trả lời. Vui lòng thử lại.");
  return text;
}

export async function getAudioData(audio: Blob): Promise<{ mimeType: string; data: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không thể đọc bản ghi âm trên thiết bị này."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Không thể đọc bản ghi âm trên thiết bị này."));
        return;
      }
      resolve(reader.result);
    };
    reader.readAsDataURL(audio);
  });
  const separator = dataUrl.indexOf(",");
  if (separator < 0) throw new Error("Bản ghi âm không đúng định dạng.");
  return { mimeType: audio.type || "audio/mp4", data: dataUrl.slice(separator + 1) };
}

async function getGeminiError(response: Response): Promise<string> {
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

  if (response.status === 400 || response.status === 401 || response.status === 403) {
    return detail
      ? `Google AI từ chối API key hoặc yêu cầu (HTTP ${response.status}): ${detail}`
      : `Google AI từ chối API key hoặc yêu cầu (HTTP ${response.status}). Hãy kiểm tra key và mô hình trong Cài đặt.`;
  }
  if (response.status === 429) {
    return detail
      ? `API key Google AI đã hết hạn mức hoặc đang bị giới hạn (HTTP 429): ${detail}`
      : "API key đã hết hạn mức hoặc đang bị giới hạn (HTTP 429). Hãy chọn key khác trong Cài đặt hoặc kiểm tra gói Gemini.";
  }
  if (response.status === 503 || response.status === 504) {
    return "Dịch vụ AI hiện đang bận. Vui lòng thử lại sau.";
  }
  return detail
    ? `Không gửi được yêu cầu tới Gemini (mã ${response.status}): ${detail}`
    : `Không gửi được yêu cầu tới Gemini (mã ${response.status}).`;
}
