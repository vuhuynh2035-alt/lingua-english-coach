/**
 * Backup / restore of what the app keeps in this browser's localStorage, in three independent parts:
 *  - data: progress, badges, scores, chat history (all languages)
 *  - settings: theme, font, voices, AI provider/model, cost limits ... (no API keys)
 *  - keys: API keys only
 * Used to move data between two addresses (GitHub Pages / home server) or to hand a ready-made
 * setup (with the owner's keys) to family members.
 */

const FORMAT = "teacher-ai-backup";
const FORMAT_VERSION = 2;
const PREFIX = "lingua-";

/** Flags and counters that only describe this device or this address. */
const DEVICE_ONLY = new Set([
  "lingua-install-ready",
  "lingua-inapp-dismissed",
  "lingua-vi-pack",
  "lingua-en-pack",
  "lingua-tts-no-direction",
  "lingua-gcloud-no-chirp",
  "lingua-usage-ledger", // money already spent on this device, must not be inherited
  "lingua-line-ai-v1", // cached AI answers about lesson sentences, rebuilt on demand
]);

const SECRET_KEYS = /^lingua-(gemini-api-key|gcloud-tts-key.*)$/;
const AI_SETTINGS = "lingua-ai-settings";
const AI_SECRET_FIELDS = ["keys", "activeKeyIds"] as const;
/** Names (after the language prefix) of the learning data. */
const DATA_NAMES = /^lingua-(ja-|zh-)?(progress|messages-.*|grammar-scores|course-progress-v2|course-lesson-scores-v2|lesson-view)$/;

export type BackupParts = { data: boolean; settings: boolean; keys: boolean };

export type BackupFile = {
  format: typeof FORMAT;
  version: number;
  appVersion: string;
  createdAt: string;
  parts: BackupParts;
  entries: Record<string, string>;
};

function parseObject(text: string | null): Record<string, unknown> | null {
  if (!text) return null;
  try {
    const value: unknown = JSON.parse(text);
    return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function splitAiSettings(value: string): { plain: Record<string, unknown>; secret: Record<string, unknown> } | null {
  const all = parseObject(value);
  if (!all) return null;
  const plain: Record<string, unknown> = {};
  const secret: Record<string, unknown> = {};
  for (const [name, field] of Object.entries(all)) {
    ((AI_SECRET_FIELDS as readonly string[]).includes(name) ? secret : plain)[name] = field;
  }
  return { plain, secret };
}

export function createBackup(appVersion: string, parts: BackupParts): BackupFile {
  const entries: Record<string, string> = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(PREFIX) || DEVICE_ONLY.has(key)) continue;
    const value = localStorage.getItem(key);
    if (value === null) continue;
    if (SECRET_KEYS.test(key)) {
      if (parts.keys) entries[key] = value;
    } else if (key === AI_SETTINGS) {
      const split = splitAiSettings(value);
      if (!split) continue;
      const chosen = { ...(parts.settings ? split.plain : {}), ...(parts.keys ? split.secret : {}) };
      if (Object.keys(chosen).length > 0) entries[key] = JSON.stringify(chosen);
    } else if (DATA_NAMES.test(key)) {
      if (parts.data) entries[key] = value;
    } else if (parts.settings) {
      entries[key] = value;
    }
  }
  return { format: FORMAT, version: FORMAT_VERSION, appVersion, createdAt: new Date().toISOString(), parts, entries };
}

export function readBackup(text: string): BackupFile {
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error("Tệp không phải bản sao lưu của Teacher AI."); }
  const file = parsed as (Partial<BackupFile> & { data?: unknown; includesKeys?: unknown }) | null;
  if (!file || file.format !== FORMAT) throw new Error("Tệp không phải bản sao lưu của Teacher AI.");
  if (typeof file.version !== "number" || file.version > FORMAT_VERSION) {
    throw new Error("Bản sao lưu này tạo bởi phiên bản mới hơn. Hãy cập nhật ứng dụng rồi thử lại.");
  }
  // Version 1 (2.17.12 first release) kept everything under "data" and flagged keys with includesKeys.
  const source = file.version === 1 ? file.data : file.entries;
  if (typeof source !== "object" || source === null) throw new Error("Tệp không phải bản sao lưu của Teacher AI.");
  const entries: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (key.startsWith(PREFIX) && !DEVICE_ONLY.has(key) && typeof value === "string") entries[key] = value;
  }
  if (Object.keys(entries).length === 0) throw new Error("Bản sao lưu không có dữ liệu nào.");
  const keyLike = (key: string) => SECRET_KEYS.test(key) || (key === AI_SETTINGS && AI_SECRET_FIELDS.some((f) => f in (parseObject(entries[key]) ?? {})));
  const parts: BackupParts = file.version === 1
    ? { data: true, settings: true, keys: file.includesKeys === true }
    : {
        data: file.parts?.data === true,
        settings: file.parts?.settings === true,
        keys: file.parts?.keys === true || Object.keys(entries).some(keyLike),
      };
  return {
    format: FORMAT,
    version: file.version,
    appVersion: typeof file.appVersion === "string" ? file.appVersion : "?",
    createdAt: typeof file.createdAt === "string" ? file.createdAt : "",
    parts,
    entries,
  };
}

/** Writes the backup into localStorage. AI settings are merged, so keys already on this device
 * survive a backup that has none. Returns how many entries were written. */
export function applyBackup(file: BackupFile): number {
  let written = 0;
  for (const [key, value] of Object.entries(file.entries)) {
    let next = value;
    if (key === AI_SETTINGS) {
      const incoming = parseObject(value) ?? {};
      const current = parseObject(localStorage.getItem(AI_SETTINGS)) ?? {};
      next = JSON.stringify({ ...current, ...incoming });
    }
    localStorage.setItem(key, next);
    written += 1;
  }
  return written;
}

export function backupFileName(parts: BackupParts): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const kind = [parts.data && "du-lieu", parts.settings && "cai-dat", parts.keys && "api-key"].filter(Boolean).join("+");
  return `teacher-ai-${kind}-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}
