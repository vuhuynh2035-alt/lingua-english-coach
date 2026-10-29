"use client";

import { useEffect, useState } from "react";

/** Browsers built into other apps (Zalo, Facebook, Messenger…) change text size and icons and cannot install the app. */
const IN_APP_BROWSER = /; wv\)|Zalo|FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\/|TikTok|musical_ly|MicroMessenger|Snapchat/i;

function appName(agent: string): string {
  if (/Zalo/i.test(agent)) return "Zalo";
  if (/FBAN|FBAV|FB_IAB|Messenger/i.test(agent)) return "Facebook / Messenger";
  if (/Instagram/i.test(agent)) return "Instagram";
  if (/TikTok|musical_ly/i.test(agent)) return "TikTok";
  return "một ứng dụng khác";
}

export function InAppBrowserNotice() {
  const [info, setInfo] = useState<{ name: string; android: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const agent = navigator.userAgent;
      if (IN_APP_BROWSER.test(agent) && sessionStorage.getItem("lingua-inapp-dismissed") !== "1") {
        setInfo({ name: appName(agent), android: /Android/i.test(agent) });
      }
    } catch {}
  }, []);

  if (!info) return null;
  const url = window.location.href.split("#")[0];
  const chromeLink = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); } catch { window.prompt("Sao chép liên kết này rồi dán vào Chrome / Safari:", url); }
  };

  return (
    <aside className="inapp-notice" role="alert">
      <strong>⚠ Bạn đang mở trong {info.name}</strong>
      <p>Trình duyệt tích hợp của {info.name} có thể làm chữ to lên, đổi biểu tượng, lỗi micro và <b>không cài được app</b>. Hãy mở bằng <b>{info.android ? "Chrome" : "Safari"}</b> để dùng đầy đủ.</p>
      <div className="inapp-actions">
        {info.android && <a className="button button-primary" href={chromeLink}>Mở bằng Chrome</a>}
        <button type="button" className="button button-outline" onClick={() => { void copy(); }}>{copied ? "✓ Đã chép liên kết, hãy dán vào trình duyệt" : "📋 Chép liên kết"}</button>
        <button type="button" className="text-button" onClick={() => { try { sessionStorage.setItem("lingua-inapp-dismissed", "1"); } catch {} setInfo(null); }}>Để sau</button>
      </div>
    </aside>
  );
}
