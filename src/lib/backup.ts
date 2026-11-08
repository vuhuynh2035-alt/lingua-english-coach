/**
 * Backup / restore of everything the app keeps in this browser's localStorage: progress, badges,
 * scores, chat history and settings of all languages. Used to move data between two addresses
 * (for example GitHub Pages and the home server), because each address has its own storage.
 */

const FORMAT = "teacher-ai-backup";
const FORMAT_VERSION = 1;
const PREFIX = "lingua-";

/** Flags that only describe this device or this address (downloaded voice packs, install banners). */
const DEVICE_ONLY = new Set([
  "lingua-install-ready",
  "lingua-inapp-dismissed",
  "lingua-vi-pack",
  "lingua-en-pack",
  "lingua-tts-no-direction",
  "lingua-gcloud-no-chirp",
]);

const SECRET_KEYS = /^lingua-(gemini-api-key|gcloud-tts-key.*)$/;
const AI_SETTINGS = "lingua-ai-settings";

export type BackupFile = {
  format: typeof FORMAT;
  version: number;
  appVersion: string;
  createdAt: string;
  includesKeys: boolean;
  data: Record<string, string>;
};

export type BackupSummary = { entries: number; createdAt: string; appVersion: string; includesKeys: boolean };

function parseObject(text: string | null): Record<string, unknown> | null {
  if (!text) return null;
  try {
    const value: unknown = JSON.parse(text);
    return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function createBackup(appVersion: string, includeKeys: boolean): BackupFile {
  const data: Record<string, string> = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(PREFIX) || DEVICE_ONLY.has(key)) continue;
    const value = localStorage.getItem(key);
    if (value === null) continue;
    if (!includeKeys && SECRET_KEYS.test(key)) continue;
    if (!includeKeys && key === AI_SETTINGS) {
      const settings = parseObject(value);
      if (!settings) continue;
      const { keys: _keys, activeKeyIds: _active, ...rest } = settings;
      void _keys; void _active;
      data[key] = JSON.stringify(rest);
      continue;
    }
    data[key] = value;
  }
  return { format: FORMAT, version: FORMAT_VERSION, appVersion, createdAt: new Date().toISOString(), includesKeys: includeKeys, data };
}

export function readBackup(text: string): BackupFile {
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error("Tệp không phải bản sao lưu của Teacher AI."); }
  const file = parsed as Partial<BackupFile> | null;
  if (!file || file.format !== FORMAT || typeof file.data !== "object" || file.data === null) {
    throw new Error("Tệp không phải bản sao lưu của Teacher AI.");
  }
  if (typeof file.version !== "number" || file.version > FORMAT_VERSION) {
    throw new Error("Bản sao lưu này tạo bởi phiên bản mới hơn. Hãy cập nhật ứng dụng rồi thử lại.");
  }
  const data: Record<string, string> = {};
  for (const [key, value] of Object.entries(file.data)) {
    if (key.startsWith(PREFIX) && !DEVICE_ONLY.has(key) && typeof value === "string") data[key] = value;
  }
  if (Object.keys(data).length === 0) throw new Error("Bản sao lưu không có dữ liệu nào.");
  return {
    format: FORMAT,
    version: file.version,
    appVersion: typeof file.appVersion === "string" ? file.appVersion : "?",
    createdAt: typeof file.createdAt === "string" ? file.createdAt : "",
    includesKeys: file.includesKeys === true,
    data,
  };
}

export function summarize(file: BackupFile): BackupSummary {
  return { entries: Object.keys(file.data).length, createdAt: file.createdAt, appVersion: file.appVersion, includesKeys: file.includesKeys };
}

/** Writes the backup into localStorage. Keys on this device are kept when the file has none. */
export function applyBackup(file: BackupFile): number {
  let written = 0;
  for (const [key, value] of Object.entries(file.data)) {
    let next = value;
    if (key === AI_SETTINGS && !file.includesKeys) {
      const incoming = parseObject(value) ?? {};
      const current = parseObject(localStorage.getItem(AI_SETTINGS)) ?? {};
      next = JSON.stringify({ ...incoming, keys: current.keys, activeKeyIds: current.activeKeyIds });
    }
    localStorage.setItem(key, next);
    written += 1;
  }
  return written;
}

export function backupFileName(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `teacher-ai-backup-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}
