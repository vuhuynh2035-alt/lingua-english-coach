/* Vietnamese voice that runs on the phone itself: the espeak-ng phonemizer plus the Piper "vais1000"
   VITS model (CC BY 4.0, VAIS-1000 corpus) in ONNX Runtime Web. It needs no network once the files
   are cached, and sounds the same on every device. */
importScripts("ort.min.js", "piper_phonemize.js");

const BASE = self.location.href.replace(/[^/]*$/, "");
const MODEL = "vi_VN-vais1000-medium.onnx";
let config = null;
let session = null;
let phonemizer = null;
let loading = null;
let chain = Promise.resolve();
let cancelBefore = 0;
const lines = [];

function load() {
  if (!loading) {
    loading = (async () => {
      config = await (await fetch(BASE + MODEL + ".json")).json();
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.wasmPaths = BASE;
      phonemizer = await createPiperPhonemize({
        print: (line) => { try { lines.push(JSON.parse(line).phoneme_ids); } catch (error) { /* not a phoneme line */ } },
        printErr: () => {},
        locateFile: (file) => BASE + file,
      });
      const model = await (await fetch(BASE + MODEL)).arrayBuffer();
      session = await ort.InferenceSession.create(model, { executionProviders: ["wasm"] });
    })();
    loading.catch(() => { loading = null; });
  }
  return loading;
}

function phonemize(text) {
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

async function speak(text) {
  await load();
  const parts = [];
  let total = 0;
  const pause = new Float32Array(Math.round(config.audio.sample_rate * 0.18));
  for (const ids of phonemize(text)) {
    if (!ids.length) continue;
    const { noise_scale, length_scale, noise_w } = config.inference;
    const result = await session.run({
      input: new ort.Tensor("int64", BigInt64Array.from(ids, (id) => BigInt(id)), [1, ids.length]),
      input_lengths: new ort.Tensor("int64", BigInt64Array.from([BigInt(ids.length)]), [1]),
      scales: new ort.Tensor("float32", Float32Array.from([noise_scale, length_scale, noise_w]), [3]),
    });
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
  if (message.type === "warm") { load().then(() => self.postMessage({ id: message.id, ok: true }), (error) => self.postMessage({ id: message.id, error: String(error) })); return; }
  chain = chain.then(async () => {
    if (message.id < cancelBefore) { self.postMessage({ id: message.id, cancelled: true }); return; }
    try {
      const buffer = await speak(message.text);
      self.postMessage({ id: message.id, wav: buffer }, [buffer]);
    } catch (error) {
      self.postMessage({ id: message.id, error: String(error) });
    }
  });
};
