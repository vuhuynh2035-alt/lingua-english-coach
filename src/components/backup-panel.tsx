"use client";

import { useRef, useState } from "react";
import { applyBackup, backupFileName, createBackup, readBackup, type BackupFile, type BackupParts } from "@/lib/backup";

const rowStyle = { display: "block", margin: "10px 0" } as const;
const hintStyle = { display: "block", opacity: 0.75, marginLeft: 26 } as const;

export default function BackupPanel({ appVersion }: { appVersion: string }) {
  const [parts, setParts] = useState<BackupParts>({ data: true, settings: false, keys: false });
  const [askKeys, setAskKeys] = useState(false);
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const nothing = !parts.data && !parts.settings && !parts.keys;

  function toggleKeys(checked: boolean) {
    if (checked) setAskKeys(true);
    else { setAskKeys(false); setParts((p) => ({ ...p, keys: false })); }
  }

  function exportBackup() {
    try {
      const backup = createBackup(appVersion, parts);
      const count = Object.keys(backup.entries).length;
      if (count === 0) throw new Error("Chưa có gì để sao lưu ở mục đã chọn trên thiết bị này.");
      const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = backupFileName(parts);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setMessage({ ok: true, text: `Đã lưu ${count} mục vào tệp ${link.download}.${parts.keys ? " Tệp này chứa API key của bạn — chỉ gửi cho người tin cậy." : ""}` });
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

  const contents = pending
    ? [pending.parts.data && "dữ liệu học", pending.parts.settings && "cài đặt", pending.parts.keys && "API key"].filter(Boolean).join(", ")
    : "";

  return (
    <section className="panel settings-panel">
      <h3>Sao lưu &amp; chuyển dữ liệu</h3>
      <p>
        Dữ liệu chỉ lưu trong trình duyệt ở đúng địa chỉ web này. Muốn dùng ở địa chỉ khác hoặc thiết bị khác,
        hãy sao lưu ở đây rồi khôi phục ở đó. Chọn những phần cần lưu:
      </p>
      <label style={rowStyle}>
        <input type="checkbox" checked={parts.data} onChange={(e) => setParts((p) => ({ ...p, data: e.target.checked }))} />
        {" "}<strong>Dữ liệu học</strong>
        <small style={hintStyle}>Lịch sử học, bài đã học, huy chương, điểm — cả 3 ngôn ngữ.</small>
      </label>
      <label style={rowStyle}>
        <input type="checkbox" checked={parts.settings} onChange={(e) => setParts((p) => ({ ...p, settings: e.target.checked }))} />
        {" "}<strong>Cài đặt</strong>
        <small style={hintStyle}>Giao diện, cỡ chữ, gia sư, giọng đọc, nhà cung cấp và mô hình AI, hạn mức chi phí (không gồm API key).</small>
      </label>
      <label style={rowStyle}>
        <input type="checkbox" checked={parts.keys || askKeys} onChange={(e) => toggleKeys(e.target.checked)} />
        {" "}<strong>API key</strong>
        <small style={hintStyle}>Cho người nhà dùng sẵn, không cần tự tạo key.</small>
      </label>
      {askKeys && (
        <div className="panel" role="alertdialog" aria-label="Xác nhận lưu API key">
          <p>
            <strong>⚠️ Cảnh báo:</strong> tệp sao lưu sẽ chứa <strong>API key thật</strong> của bạn, ai có tệp là dùng được key
            (và tốn tiền/quota của bạn). Chỉ gửi cho người tin cậy, không đăng lên mạng hay nhóm chat đông người.
            Người lạ thì nên gửi bản <strong>không kèm key</strong>.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" className="button" onClick={() => { setParts((p) => ({ ...p, keys: true })); setAskKeys(false); }}>Tôi hiểu, kèm API key</button>
            <button type="button" className="button button-outline" onClick={() => setAskKeys(false)}>Không kèm key</button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>
        <button type="button" className="button" disabled={nothing || askKeys} onClick={exportBackup}>⬇️ Sao lưu ra tệp</button>
        <button type="button" className="button button-outline" onClick={() => fileInput.current?.click()}>⬆️ Khôi phục từ tệp…</button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => { void chooseFile(event.target.files?.[0]); event.target.value = ""; }}
        />
      </div>
      {pending && (
        <div className="panel">
          <p>
            Tệp có <strong>{Object.keys(pending.entries).length}</strong> mục: <strong>{contents || "không rõ"}</strong>
            {pending.createdAt ? `, tạo lúc ${new Date(pending.createdAt).toLocaleString("vi-VN")}` : ""} (bản {pending.appVersion}).
            Khôi phục sẽ <strong>ghi đè</strong> những phần cùng loại đang có trên thiết bị này; phần không có trong tệp được giữ nguyên.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" className="button" onClick={restore}>Khôi phục và ghi đè</button>
            <button type="button" className="button button-outline" onClick={() => setPending(null)}>Hủy</button>
          </div>
        </div>
      )}
      {message && <small className={message.ok ? "api-key-success" : "error-message"} role="status">{message.text}</small>}
    </section>
  );
}
