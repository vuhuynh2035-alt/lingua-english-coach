/**
 * Chrome (Android and desktop) offers "install this app" once, right after the page opens.
 * The event is caught here, as early as possible, and kept until the learner presses the button.
 */
export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

let captured: InstallPromptEvent | null = null;
let started = false;

export function captureInstallPrompt() {
  if (typeof window === "undefined" || started) return;
  started = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    captured = event as InstallPromptEvent;
    window.dispatchEvent(new Event("lingua-install-ready"));
  });
  window.addEventListener("appinstalled", () => { captured = null; });
}

export const capturedInstallPrompt = () => captured;
export const clearInstallPrompt = () => { captured = null; };
