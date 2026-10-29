/**
 * Voices that ship with the app and run on the phone itself (Piper models, CC BY 4.0), so they sound
 * the same on every device and need no API key: one Vietnamese voice and an English voice set.
 * The files are downloaded once into the browser cache and used offline afterwards.
 */
export type PackId = "vi" | "en";

const CACHE = "lingua-tts-v1";
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const FLAGS: Record<PackId, string> = { vi: "lingua-vi-pack", en: "lingua-en-pack" };

const SHARED = [
  { name: "piper_phonemize.data", bytes: 18_077_249 },
  { name: "ort-wasm-simd.wasm", bytes: 10_595_041 },
  { name: "piper_phonemize.wasm", bytes: 635_212 },
  { name: "ort.min.js", bytes: 540_716 },
  { name: "piper_phonemize.js", bytes: 120_714 },
];

export const PACKS: Record<PackId, { model: string; files: { name: string; bytes: number }[] }> = {
  vi: {
    model: "vi_VN-vais1000-medium.onnx",
    files: [{ name: "vi_VN-vais1000-medium.onnx", bytes: 63_201_294 }, { name: "vi_VN-vais1000-medium.onnx.json", bytes: 4_860 }, ...SHARED],
  },
  en: {
    model: "en_US-libritts_r-medium.onnx",
    files: [{ name: "en_US-libritts_r-medium.onnx", bytes: 78_580_914 }, { name: "en_US-libritts_r-medium.onnx.json", bytes: 20_123 }, ...SHARED],
  },
};

/** Download size in MB; the files both packs share are counted only for the first one. */
export function packMB(id: PackId, otherInstalled = false): number {
  const own = PACKS[id].files.filter((file) => !(otherInstalled && SHARED.some((item) => item.name === file.name)));
  return Math.round(own.reduce((sum, file) => sum + file.bytes, 0) / 1_000_000);
}

const fileUrl = (name: string) => new URL(`${base}/tts/vi/${name}`, location.href).href;

/** Quick answer from a flag; `packInstalled` checks the cache itself. */
export function packFlag(id: PackId): boolean {
  try { return localStorage.getItem(FLAGS[id]) === "1"; } catch { return false; }
}

export async function packInstalled(id: PackId): Promise<boolean> {
  try {
    const cache = await caches.open(CACHE);
    for (const file of PACKS[id].files) if (!(await cache.match(fileUrl(file.name)))) return false;
    return true;
  } catch { return false; }
}

export async function downloadPack(id: PackId, onProgress: (fraction: number) => void, signal?: AbortSignal): Promise<void> {
  const cache = await caches.open(CACHE);
  const files = PACKS[id].files;
  const total = files.reduce((sum, file) => sum + file.bytes, 0);
  let done = 0;
  for (const file of files) {
    const url = fileUrl(file.name);
    if (await cache.match(url)) { done += file.bytes; onProgress(done / total); continue; }
    const response = await fetch(url, { signal, cache: "no-cache" });
    if (!response.ok || !response.body) throw new Error(`Không tải được ${file.name} (HTTP ${response.status}).`);
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    for (;;) {
      const { done: finished, value } = await reader.read();
      if (finished) break;
      chunks.push(value);
      loaded += value.length;
      onProgress((done + loaded) / total);
    }
    await cache.put(url, new Response(new Blob(chunks as BlobPart[]), { headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream" } }));
    done += file.bytes;
  }
  try { localStorage.setItem(FLAGS[id], "1"); } catch {}
  try { await navigator.storage?.persist?.(); } catch {}
}

export async function removePack(id: PackId): Promise<void> {
  stopWorker();
  try {
    const cache = await caches.open(CACHE);
    for (const file of PACKS[id].files) if (!SHARED.some((item) => item.name === file.name)) await cache.delete(fileUrl(file.name));
    const other: PackId = id === "vi" ? "en" : "vi";
    if (!(await packInstalled(other))) for (const file of SHARED) await cache.delete(fileUrl(file.name));
  } catch {}
  try { localStorage.removeItem(FLAGS[id]); } catch {}
}

// ---------------------------------------------------------------- synthesis in a worker
type Pending = { resolve: (blob: Blob | null) => void };
let worker: Worker | null = null;
let nextId = 1;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
const pending = new Map<number, Pending>();
const memory = new Map<string, Blob>();
const offlineClips = new WeakSet<Blob>();

/** True for audio made by these built-in voices. */
export const isOfflineClip = (blob: Blob) => offlineClips.has(blob);

function stopWorker() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = null;
  worker?.terminate();
  worker = null;
  for (const item of pending.values()) item.resolve(null);
  pending.clear();
}

function getWorker(): Worker {
  if (worker) return worker;
  const created = new Worker(`${base}/tts/vi/worker.js`);
  created.onmessage = (event: MessageEvent<{ id: number; wav?: ArrayBuffer; error?: string }>) => {
    const item = pending.get(event.data.id);
    if (!item) return;
    pending.delete(event.data.id);
    // The voice takes a few hundred MB of memory: let it go when nobody is listening.
    if (idleTimer) clearTimeout(idleTimer);
    if (!pending.size) idleTimer = setTimeout(stopWorker, 90_000);
    item.resolve(event.data.wav ? new Blob([event.data.wav], { type: "audio/wav" }) : null);
  };
  created.onerror = () => stopWorker();
  worker = created;
  return created;
}

/** Loads a voice into memory ahead of the first sentence (it takes a few seconds on a phone). */
export function warmVoice(id: PackId): void {
  try { getWorker().postMessage({ type: "warm", id: 0, voice: id }); } catch {}
}

/** One sentence as audio, or null when the voice is not installed or cannot run on this device. */
export function synthesize(id: PackId, text: string, options: { sid?: number; speed?: number } = {}): Promise<Blob | null> {
  const clean = text.trim();
  if (!clean) return Promise.resolve(null);
  const key = `${id}:${options.sid ?? 0}:${options.speed ?? 1}:${clean}`;
  const cached = memory.get(key);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve) => {
    try {
      const jobId = nextId++;
      pending.set(jobId, {
        resolve: (blob) => {
          if (blob) {
            offlineClips.add(blob);
            memory.set(key, blob);
            if (memory.size > 40) memory.delete(memory.keys().next().value as string);
          }
          resolve(blob);
        },
      });
      getWorker().postMessage({ type: "speak", id: jobId, text: clean, voice: id, sid: options.sid ?? 0, speed: options.speed ?? 1 });
    } catch { resolve(null); }
  });
}

/** Drops sentences that are still waiting, e.g. when the learner stops the reading. */
export function cancelOfflineSynthesis(): void {
  worker?.postMessage({ type: "cancel", before: nextId });
}

// ---------------------------------------------------------------- English speakers of the "en" pack
// LibriTTS-R speaker ids picked by measured pitch and clarity: clear adult women and men.
const EN_FEMALE = [8410, 28, 64, 5570];
const EN_MALE = [7314, 2053, 6701, 4586];
const EN_CHILD = 16;
let enSpeakerIds: Record<string, number> | null = null;

/** Model input index of a LibriTTS-R speaker for a slot (gender, and which of the four voices of that gender). */
export async function englishSpeaker(slot: { gender: "female" | "male"; index: number; child?: boolean }): Promise<number> {
  if (!enSpeakerIds) {
    try {
      const response = await fetch(fileUrl(`${PACKS.en.model}.json`));
      enSpeakerIds = (await response.json() as { speaker_id_map: Record<string, number> }).speaker_id_map;
    } catch { enSpeakerIds = {}; }
  }
  const corpusId = slot.child ? EN_CHILD : (slot.gender === "female" ? EN_FEMALE : EN_MALE)[slot.index % 4];
  return enSpeakerIds[String(corpusId)] ?? 0;
}
