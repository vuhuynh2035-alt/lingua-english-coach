"use client";

import { useRef, useState } from "react";
import { applyBackup, backupFileName, createBackup, readBackup, summarize, type BackupFile } from "@/lib/backup";

export default function BackupPanel({ appVersion }: { appVersion: string }) {
  const [includeKeys, setIncludeKeys] = useState(false);
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function exportBackup() {
    try {
      const backup = createBackup(appVersion, includeKeys);
      const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = backupFileName();
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setMessage({ ok: true, text: `Đã lưu ${Object.keys(backup.data).length} mục vào tệp ${link.download}. Hãy chép tệp này sang nơi cần khôi phục.` });
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Không thể tạo bản sao lưu." });
    }
  }

  async function chooseFile(file: File | undefined) {
    setPending(null);
    if (!file) return;
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error("Tệp quá lớn, không phải bản sao lưu của Teacher AI.");
      setPending(readBackup(await file.text()));
      setMessage(null);
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Không đọc được tệp." });
    }
  }

  function restore() {
    if (!pending) return;
    try {
      const count = applyBackup(pending);
      setMessage({ ok: true, text: `Đã khôi phục ${count} mục. Đang tải lại ứng dụng…` });
      setPending(null);
      setTimeout(() => location.reload(), 800);
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Không thể khôi phục (bộ nhớ trình duyệt có thể đã đầy)." });
    }
  }

  const info = pending ? summarize(pending) : null;

  return (
    <section className="panel settings-panel">
      <h3>Sao lưu &amp; chuyển dữ liệu</h3>
      <p>
        Bài đã học, huy chương, điểm và lịch sử của cả 3 ngôn ngữ chỉ lưu trong trình duyệt ở đúng địa chỉ web này.
        Muốn dùng ở địa chỉ khác (GitHub hoặc máy chủ riêng), hãy sao lưu ở đây rồi khôi phục ở đó.
      </p>
      <label style={{ display: "block", margin: "12px 0" }}>
        <input type="checkbox" checked={includeKeys} onChange={(event) => setIncludeKeys(event.target.checked)} />
        {" "}Kèm cả API key (tệp sẽ chứa key, chỉ giữ ở nơi an toàn)
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>
        <button type="button" className="button" onClick={exportBackup}>⬇️ Sao lưu ra tệp</button>
        <button type="button" className="button button-outline" onClick={() => fileInput.current?.click()}>⬆️ Khôi phục từ tệp…</button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => { void chooseFile(event.target.files?.[0]); event.target.value = ""; }}
        />
      </div>
      {info && (
        <div className="panel">
          <p>
            Tệp có <strong>{info.entries}</strong> mục
            {info.createdAt ? `, tạo lúc ${new Date(info.createdAt).toLocaleString("vi-VN")}` : ""}
            {` (bản ${info.appVersion})`}{info.includesKeys ? ", có kèm API key" : ""}.
            Khôi phục sẽ <strong>ghi đè</strong> tiến độ và cài đặt cùng loại đang có trên thiết bị này.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>
            <button type="button" className="button" onClick={restore}>Khôi phục và ghi đè</button>
            <button type="button" className="button button-outline" onClick={() => setPending(null)}>Hủy</button>
          </div>
        </div>
      )}
      {message && <small className={message.ok ? "api-key-success" : "error-message"} role="status">{message.text}</small>}
    </section>
  );
}
