/**
 * The Vietnamese voice that ships with the app: a small neural voice (Piper "vais1000", CC BY 4.0)
 * that runs on the phone itself, so it sounds the same on every device and needs no API key.
 * Its files (about 93 MB) are downloaded once into the browser cache and used offline afterwards.
 */
const CACHE = "lingua-tts-v1";
const FLAG = "lingua-vi-pack";
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const VI_PACK_FILES = [
  { name: "vi_VN-vais1000-medium.onnx", bytes: 63_201_294 },
  { name: "piper_phonemize.data", bytes: 18_077_249 },
  { name: "ort-wasm-simd.wasm", bytes: 10_595_041 },
  { name: "piper_phonemize.wasm", bytes: 635_212 },
  { name: "ort.min.js", bytes: 540_716 },
  { name: "piper_phonemize.js", bytes: 120_714 },
  { name: "vi_VN-vais1000-medium.onnx.json", bytes: 4_860 },
];
export const VI_PACK_MB = Math.round(VI_PACK_FILES.reduce((sum, file) => sum + file.bytes, 0) / 1_000_000);

const fileUrl = (name: string) => new URL(`${base}/tts/vi/${name}`, location.href).href;

/** Quick answer from a flag; `viPackInstalled` checks the cache itself. */
export function viPackFlag(): boolean {
  try { return localStorage.getItem(FLAG) === "1"; } catch { return false; }
}

export async function viPackInstalled(): Promise<boolean> {
  try {
    const cache = await caches.open(CACHE);
    for (const file of VI_PACK_FILES) if (!(await cache.match(fileUrl(file.name)))) return false;
    return true;
  } catch { return false; }
}

export async function downloadViPack(onProgress: (fraction: number) => void, signal?: AbortSignal): Promise<void> {
  const cache = await caches.open(CACHE);
  const total = VI_PACK_FILES.reduce((sum, file) => sum + file.bytes, 0);
  let done = 0;
  for (const file of VI_PACK_FILES) {
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
  try { localStorage.setItem(FLAG, "1"); } catch {}
  try { await navigator.storage?.persist?.(); } catch {}
}

export async function removeViPack(): Promise<void> {
  stopWorker();
  try { await caches.delete(CACHE); } catch {}
  try { localStorage.removeItem(FLAG); } catch {}
}

// ---------------------------------------------------------------- synthesis in a worker
type Pending = { resolve: (blob: Blob | null) => void };
let worker: Worker | null = null;
let nextId = 1;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
const pending = new Map<number, Pending>();
const memory = new Map<string, Blob>();

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

/** Loads the voice into memory ahead of the first sentence (it takes a few seconds on a phone). */
export function warmViVoice(): void {
  try { getWorker().postMessage({ type: "warm", id: 0 }); } catch {}
}

/** One sentence as audio, or null when the voice is not installed or cannot run on this device. */
export function synthesizeVietnamese(text: string): Promise<Blob | null> {
  const key = text.trim();
  if (!key) return Promise.resolve(null);
  const cached = memory.get(key);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve) => {
    try {
      const id = nextId++;
      pending.set(id, {
        resolve: (blob) => {
          if (blob) {
            memory.set(key, blob);
            if (memory.size > 40) memory.delete(memory.keys().next().value as string);
          }
          resolve(blob);
        },
      });
      getWorker().postMessage({ type: "speak", id, text: key });
    } catch { resolve(null); }
  });
}

/** Drops sentences that are still waiting, e.g. when the learner stops the reading. */
export function cancelVietnameseSynthesis(): void {
  worker?.postMessage({ type: "cancel", before: nextId });
}
