"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import { InAppBrowserNotice } from "@/components/in-app-browser-notice";
import { TutorAvatar } from "@/components/tutor-avatar";
import { loadLanguage, type LangId } from "@/lib/language";
import { LANGUAGES, rememberLanguage, savedLanguage } from "@/lib/language-meta";
import { captureInstallPrompt } from "@/lib/install-prompt";
import packageJson from "../../package.json";

// Chrome sends its "install" offer once, early: catch it before the learning app is even loaded.
captureInstallPrompt();

type Phase = "boot" | "choose" | "loading" | "ready" | "error";

/**
 * The first screen: pick the language to learn. The language is loaded before the learning
 * app is imported, so the app itself can treat the language as a constant. Progress, history
 * and course data of each language are kept apart; settings are shared.
 */
export default function Page() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [Learning, setLearning] = useState<ComponentType | null>(null);
  const [error, setError] = useState("");

  const start = useCallback(async (id: LangId) => {
    setPhase("loading");
    try {
      const config = await loadLanguage(id);
      rememberLanguage(id);
      document.title = config.appTitle;
      // Drop ?choose=1 so a refresh goes straight back to the lesson.
      const url = new URL(window.location.href);
      if (url.searchParams.has("choose")) {
        url.searchParams.delete("choose");
        window.history.replaceState(null, "", url.toString());
      }
      const learning = await import("./learning-app");
      setLearning(() => learning.default);
      setPhase("ready");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không tải được ngôn ngữ này.");
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    const saved = savedLanguage();
    if (saved) void start(saved);
    else setPhase("choose");
  }, [start]);

  if (phase === "ready" && Learning) return <Learning />;

  if (phase === "choose" || phase === "error") {
    return (
      <main className="lc-page">
        <div className="lc-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon-192.png`} alt="" width={44} height={44} />
          <strong>Teacher AI</strong>
          <small>v{packageJson.version}</small>
        </div>
        <InAppBrowserNotice />
        <span className="eyebrow">CHÀO MỪNG</span>
        <h1>Bạn muốn học ngoại ngữ nào?</h1>
        <p className="lc-lead">
          Chọn một ngôn ngữ để bắt đầu. Tiến độ, lịch sử trò chuyện và bài học của từng ngôn ngữ được lưu <b>riêng</b>;
          còn cài đặt (API key, giọng đọc, giao diện) chỉ cần thiết lập <b>một lần</b> cho cả ba.
        </p>
        {phase === "error" && <p className="error-message" role="alert">{error}</p>}
        <div className="lc-grid">
          {LANGUAGES.map((item) => (
            <button key={item.id} type="button" className="lc-card" style={{ "--lc": item.color } as React.CSSProperties} onClick={() => void start(item.id)}>
              <TutorAvatar kind="mascot" mascot={item.mascot} size={92} interactive={false} entrance />
              <strong><span aria-hidden="true">{item.flag}</span> {item.nameVi}</strong>
              <span className="lc-native">{item.nameNative}</span>
              <small>{item.tagline}</small>
              <em>{item.id === "en" ? "124 bài · 10 khóa học" : "88 bài · 7 khóa học"}</em>
            </button>
          ))}
        </div>
        <p className="lc-foot">Có thể đổi ngôn ngữ bất cứ lúc nào ở trang chào của ứng dụng.</p>
      </main>
    );
  }

  return (
    <main className="lc-page lc-loading" aria-busy="true">
      <div className="lc-spinner" aria-hidden="true" />
      <p>Đang tải…</p>
    </main>
  );
}
