/* Voices that run on the phone itself: the espeak-ng phonemizer plus Piper VITS models in ONNX Runtime Web.
   "vi": vais1000 (CC BY 4.0, VAIS-1000 corpus); "en": libritts_r (CC BY 4.0, LibriTTS-R, many speakers).
   Nothing needs the network once the files are cached, and every device sounds the same. */
/* The files are downloaded once by the app (lib/offline-tts.ts) from where they are published and
   kept in the cache "lingua-tts-v1"; here they are read from that cache, so the voice works offline.
   Files saved by older app versions under this folder are still used. Keep SOURCES in step with the app. */
const LEGACY = self.location.href.replace(/[^/]*$/, "");
const HF = "https://huggingface.co/rhasspy/piper-voices/resolve/b4e358ffcb232591bf73a540e70f7de528e4174a/";
const PIPER_WASM = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/";
const ORT = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/";
const SOURCES = {
  "vi_VN-vais1000-medium.onnx": HF + "vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx",
  "vi_VN-vais1000-medium.onnx.json": HF + "vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx.json",
  "en_US-libritts_r-medium.onnx": HF + "en/en_US/libritts_r/medium/en_US-libritts_r-medium.onnx",
  "en_US-libritts_r-medium.onnx.json": HF + "en/en_US/libritts_r/medium/en_US-libritts_r-medium.onnx.json",
  "piper_phonemize.data": PIPER_WASM + "piper_phonemize.data",
  "piper_phonemize.wasm": PIPER_WASM + "piper_phonemize.wasm",
  "piper_phonemize.js": PIPER_WASM + "piper_phonemize.js",
  "ort-wasm-simd.wasm": ORT + "ort-wasm-simd.wasm",
  "ort.min.js": ORT + "ort.min.js",
};
const MODELS = { vi: "vi_VN-vais1000-medium.onnx", en: "en_US-libritts_r-medium.onnx" };
let phonemizer = null;
let phonemizerLoading = null;
let current = null; // { voice, config, session }
let chain = Promise.resolve();
let cancelBefore = 0;
const lines = [];

/** A file's bytes: from the cache (new or old address), else from the network. */
async function bytes(name) {
  for (const url of [SOURCES[name], LEGACY + name]) {
    try {
      const hit = await caches.match(url);
      if (hit) return await hit.arrayBuffer();
    } catch (error) { /* no cache in this browser */ }
  }
  const response = await fetch(SOURCES[name] || LEGACY + name);
  if (!response.ok) throw new Error(`HTTP ${response.status} ${name}`);
  return response.arrayBuffer();
}

async function blobUrl(name, type) {
  return URL.createObjectURL(new Blob([await bytes(name)], { type }));
}

function loadPhonemizer() {
  if (!phonemizerLoading) {
    phonemizerLoading = (async () => {
      importScripts(await blobUrl("ort.min.js", "text/javascript"), await blobUrl("piper_phonemize.js", "text/javascript"));
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.wasmPaths = { "ort-wasm-simd.wasm": await blobUrl("ort-wasm-simd.wasm", "application/wasm") };
      const [wasm, data] = await Promise.all([bytes("piper_phonemize.wasm"), bytes("piper_phonemize.data")]);
      phonemizer = await createPiperPhonemize({
        print: (line) => { try { lines.push(JSON.parse(line).phoneme_ids); } catch (error) { /* not a phoneme line */ } },
        printErr: () => {},
        wasmBinary: wasm,
        getPreloadedPackage: () => data,
        locateFile: (file) => file,
      });
    })();
    phonemizerLoading.catch(() => { phonemizerLoading = null; });
  }
  return phonemizerLoading;
}

async function loadVoice(voice) {
  if (current && current.voice === voice) return current;
  if (current) { try { await current.session.release(); } catch (error) { /* already gone */ } current = null; }
  const config = JSON.parse(new TextDecoder().decode(await bytes(MODELS[voice] + ".json")));
  const model = await bytes(MODELS[voice]);
  const session = await ort.InferenceSession.create(model, { executionProviders: ["wasm"] });
  current = { voice, config, session };
  return current;
}

function phonemize(config, text) {
  lines.length = 0;
  phonemizer.callMain(["-l", config.espeak.voice, "--input", JSON.stringify([{ text }]), "--espeak_data", "/espeak-ng-data"]);
  return lines.slice();
}

function wav(samples, rate) {
  const view = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const write = (offset, value) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); };
  write(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true); write(8, "WAVEfmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  write(36, "data"); view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 32767, true);
  return view.buffer;
}

async function speak(message) {
  await loadPhonemizer();
  const { config, session } = await loadVoice(message.voice);
  const parts = [];
  let total = 0;
  const speed = Math.min(1.4, Math.max(0.6, message.speed || 1));
  // The model only half follows length_scale (measured), so it is stretched by speed squared to give the asked pace.
  const stretch = 1 / (speed * speed);
  const pause = new Float32Array(Math.round(config.audio.sample_rate * 0.3 / speed));
  for (const ids of phonemize(config, message.text)) {
    if (!ids.length) continue;
    const { noise_scale, length_scale, noise_w } = config.inference;
    const inputs = {
      input: new ort.Tensor("int64", BigInt64Array.from(ids, (id) => BigInt(id)), [1, ids.length]),
      input_lengths: new ort.Tensor("int64", BigInt64Array.from([BigInt(ids.length)]), [1]),
      scales: new ort.Tensor("float32", Float32Array.from([noise_scale, length_scale * stretch, noise_w]), [3]),
    };
    if (config.num_speakers > 1) inputs.sid = new ort.Tensor("int64", BigInt64Array.from([BigInt(message.sid || 0)]), [1]);
    const result = await session.run(inputs);
    const data = result.output.data;
    parts.push(data, pause);
    total += data.length + pause.length;
  }
  const all = new Float32Array(total);
  let at = 0;
  for (const part of parts) { all.set(part, at); at += part.length; }
  return wav(all, config.audio.sample_rate);
}

self.onmessage = (event) => {
  const message = event.data;
  if (message.type === "cancel") { cancelBefore = message.before; return; }
  if (message.type === "warm") {
    chain = chain.then(() => loadPhonemizer().then(() => loadVoice(message.voice))).then(() => self.postMessage({ id: message.id, ok: true }), (error) => self.postMessage({ id: message.id, error: String(error) }));
    return;
  }
  chain = chain.then(async () => {
    if (message.id < cancelBefore) { self.postMessage({ id: message.id, cancelled: true }); return; }
    try {
      const buffer = await speak(message);
      self.postMessage({ id: message.id, wav: buffer }, [buffer]);
    } catch (error) {
      self.postMessage({ id: message.id, error: String(error) });
    }
  });
};
