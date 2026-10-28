/**
 * Counts network requests that are still running (including streamed bodies), so the UI
 * can show a "please wait" indicator instead of looking frozen on a slow connection.
 */
type Listener = (state: NetState) => void;
export type NetState = { active: number; since: number | null };

let active = 0;
let since: number | null = null;
const listeners = new Set<Listener>();
let installed = false;

function emit() {
  const state = { active, since };
  listeners.forEach((listener) => listener(state));
}

function begin(): () => void {
  active += 1;
  if (active === 1) since = Date.now();
  emit();
  let finished = false;
  // A body that is never read (or an aborted stream) must not keep the indicator on.
  const safety = setTimeout(() => end(), 90_000);
  function end() {
    if (finished) return;
    finished = true;
    clearTimeout(safety);
    active = Math.max(0, active - 1);
    if (active === 0) since = null;
    emit();
  }
  return end;
}

/** Wraps window.fetch once. Only requests worth waiting for are tracked. */
export function installNetActivityTracker() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const original = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!/googleapis\.com|openai\.com|\/courses\//.test(url)) return original(input, init);
    const end = begin();
    try {
      const response = await original(input, init);
      if (!response.body) {
        end();
        return response;
      }
      // Stay "busy" until the whole body (e.g. a streamed AI answer) has arrived; the pipe
      // settles on completion, error, abort or when the reader cancels.
      const { readable, writable } = new TransformStream();
      response.body.pipeTo(writable).then(end, end);
      return new Response(readable, { status: response.status, statusText: response.statusText, headers: response.headers });
    } catch (error) {
      end();
      throw error;
    }
  };
}

export function subscribeNetActivity(listener: Listener): () => void {
  listeners.add(listener);
  listener({ active, since });
  return () => { listeners.delete(listener); };
}
