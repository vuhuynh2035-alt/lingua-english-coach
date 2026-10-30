/**
 * Mouth openness (0–1) for the tutor avatar, from the real speech when possible:
 * - AI voices play through one <audio> element; its loudness is measured with Web Audio.
 * - Device voices report word boundaries; each word gives the mouth a pulse.
 * The avatar falls back to a synthetic babble when neither source is active.
 */
let context: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let samples: Uint8Array<ArrayBuffer> | null = null;
let connected: HTMLAudioElement | null = null;
let pulseLevel = 0;
let lastRealAt = 0;

let bufferSource: AudioBufferSourceNode | null = null;

/**
 * Plays a clip through the AudioContext started in an earlier tap. Some phones (e.g. Chinese ROM
 * browsers) refuse <audio>.play() once a network wait has passed, but let a running context play.
 */
export async function playThroughContext(blob: Blob): Promise<void> {
  const ctx = context;
  if (!ctx) throw new Error("chưa có Web Audio");
  // resume() never settles on a phone that still wants a tap, so it gets a short time limit.
  if (ctx.state !== "running") await Promise.race([ctx.resume(), new Promise((resolve) => setTimeout(resolve, 1500))]);
  if (ctx.state !== "running") throw new Error("Web Audio đang bị tạm dừng");
  const buffer = await ctx.decodeAudioData(await blob.arrayBuffer());
  stopContextPlayback();
  await new Promise<void>((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser ?? ctx.destination);
    source.onended = () => { if (bufferSource === source) bufferSource = null; resolve(); };
    bufferSource = source;
    source.start();
  });
}

export function stopContextPlayback() {
  try { bufferSource?.stop(); } catch {}
  bufferSource = null;
}

/** Call inside a tap: browsers only start an AudioContext from a user gesture. */
export function attachLipSync(player: HTMLAudioElement) {
  try {
    if (typeof window === "undefined" || !("AudioContext" in window)) return;
    context ??= new AudioContext();
    const ctx = context;
    void ctx.resume().then(() => {
      // Once wired, the element plays only through the context, so wire it only when the
      // context is really running — otherwise the AI voice would go silent.
      if (ctx.state !== "running" || connected === player) return;
      const source = ctx.createMediaElementSource(player);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      samples = new Uint8Array(new ArrayBuffer(analyser.fftSize));
      connected = player;
    }).catch(() => {});
  } catch {
    // Lip sync is decoration: the avatar falls back to synthetic movement.
  }
}

/** Before playing: a context paused by the system (call, other app) must run again. */
export function resumeLipSync() {
  if (context && context.state !== "running") void context.resume().catch(() => {});
}

/** A device voice reached a new word. */
export function pulseMouth() {
  pulseLevel = 1;
  lastRealAt = performance.now();
}

/** Mouth openness from real speech, or null when no real signal arrived recently. */
export function realMouthLevel(): number | null {
  const now = performance.now();
  if (analyser && samples && connected && !connected.paused) {
    analyser.getByteTimeDomainData(samples);
    let sum = 0;
    for (const value of samples) {
      const centred = (value - 128) / 128;
      sum += centred * centred;
    }
    const rms = Math.sqrt(sum / samples.length);
    lastRealAt = now;
    return Math.min(1, Math.max(0, (rms - 0.015) * 6));
  }
  pulseLevel *= 0.82;
  return now - lastRealAt < 350 ? pulseLevel : null;
}
