"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  PACK_INFO,
  downloadPack,
  installedPacks,
  isReady,
  lookup,
  packsFor,
  removePack,
  type DictHit,
  type PackId,
} from "@/lib/dictionary";
import type { LangConfig } from "@/lib/language";

type Side = "target" | "vi";

type RecognitionInstance = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};

type RecognitionConstructor = new () => RecognitionInstance;

type DictionaryPanelProps = {
  language: LangConfig;
  visible: boolean;
  speechBusy: boolean;
  onReadyChange: (ready: boolean) => void;
  onSearchOnline: (text: string) => Promise<string>;
  onPlayTarget: (text: string) => void;
  onPlayVietnamese: (text: string) => void;
  onPlayHit: (key: string, text: string) => void;
  speakerIcon: (key: string) => ReactNode;
};

export default function DictionaryPanel({
  language,
  visible,
  speechBusy,
  onReadyChange,
  onSearchOnline,
  onPlayTarget,
  onPlayVietnamese,
  onPlayHit,
  speakerIcon,
}: DictionaryPanelProps) {
  const [dictPacks, setDictPacks] = useState<PackId[]>([]);
  const [dictBusy, setDictBusy] = useState("");
  const [dictError, setDictError] = useState("");
  const [dictText, setDictText] = useState({ target: "", vi: "" });
  const [dictSide, setDictSide] = useState<Side>("target");
  const [dictHits, setDictHits] = useState<DictHit[]>([]);
  const [dictSearching, setDictSearching] = useState(false);
  const [dictAi, setDictAi] = useState("");
  const [dictMore, setDictMore] = useState(false);
  const [dictListening, setDictListening] = useState<Side | null>(null);
  const [dictVoiceNote, setDictVoiceNote] = useState("");
  const [dictAiBusy, setDictAiBusy] = useState(false);
  const dictRecognitionRef = useRef<RecognitionInstance | null>(null);
  const dictSource = dictSide === "target" ? dictText.target : dictText.vi;
  const ready = isReady(language.id, dictPacks);

  useEffect(() => {
    void installedPacks().then(setDictPacks);
    return () => { dictRecognitionRef.current?.stop(); };
  }, []);

  useEffect(() => {
    onReadyChange(ready);
  }, [onReadyChange, ready]);

  useEffect(() => {
    if (!visible || !ready) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setDictSearching(true);
      void lookup(language.id, dictSide, dictSource)
        .then((result) => {
          if (cancelled) return;
          setDictHits(result.hits);
          setDictText((current) => {
            const other = dictSide === "target" ? "vi" : "target";
            return dictSource.trim() && current[other] !== result.summary
              ? { ...current, [other]: result.summary }
              : dictSource.trim() ? current : { ...current, [other]: "" };
          });
        })
        .catch((error: unknown) => {
          if (!cancelled) setDictError(error instanceof Error ? error.message : "Không tra được từ điển.");
        })
        .finally(() => { if (!cancelled) setDictSearching(false); });
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [dictPacks, dictSide, dictSource, language.id, ready, visible]);

  async function refreshDictPacks() {
    setDictPacks(await installedPacks());
  }

  async function downloadDictionary(ids: PackId[]) {
    setDictError("");
    try {
      for (const id of ids) {
        setDictBusy(`Đang tải ${PACK_INFO[id].label}…`);
        await downloadPack(id, (done, total) => setDictBusy(
          `Đang tải ${PACK_INFO[id].label}… ${Math.round((done / total) * 100)}%`,
        ));
      }
      await refreshDictPacks();
    } catch (error) {
      setDictError(error instanceof Error ? error.message : "Không tải được từ điển. Hãy kiểm tra kết nối mạng rồi thử lại.");
    } finally {
      setDictBusy("");
    }
  }

  async function deleteDictionary(id: PackId) {
    setDictError("");
    try {
      await removePack(id);
      await refreshDictPacks();
    } catch (error) {
      setDictError(error instanceof Error ? error.message : "Không xóa được dữ liệu từ điển trên thiết bị.");
    }
  }

  function startDictVoice(side: Side) {
    if (dictRecognitionRef.current) {
      dictRecognitionRef.current.stop();
      return;
    }
    const speechWindow = window as Window & {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setDictVoiceNote("Trình duyệt này chưa hỗ trợ nhập bằng giọng nói. Hãy mở bằng Chrome, hoặc dùng biểu tượng micro ngay trên bàn phím điện thoại.");
      return;
    }
    setDictVoiceNote("");
    const recognition = new Recognition();
    recognition.lang = side === "vi" ? "vi-VN" : language.speechLang;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join(" ").trim();
      setDictSide(side);
      setDictAi("");
      setDictMore(false);
      setDictText((current) => ({ ...current, [side]: transcript }));
    };
    recognition.onerror = (event) => {
      setDictVoiceNote(event.error === "not-allowed" || event.error === "service-not-allowed"
        ? "Chưa được phép dùng micro. Hãy cho phép micro cho trang này trong cài đặt trình duyệt rồi thử lại."
        : event.error === "no-speech" ? "Không nghe thấy tiếng nói, hãy nói gần micro hơn rồi thử lại."
          : `Micro bị lỗi (${event.error}). Hãy thử lại.`);
    };
    recognition.onend = () => { dictRecognitionRef.current = null; setDictListening(null); };
    dictRecognitionRef.current = recognition;
    setDictListening(side);
    try {
      recognition.start();
    } catch {
      dictRecognitionRef.current = null;
      setDictListening(null);
    }
  }

  function dictLangCode(side: Side): string {
    return side === "vi" ? "vi" : language.id === "zh" ? "zh-CN" : language.id;
  }

  async function searchDictionaryOnline() {
    const text = dictSource.trim();
    if (!text) return;
    setDictAiBusy(true);
    setDictAi("");
    try {
      const translator = (window as unknown as {
        Translator?: {
          availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<string>;
          create(options: { sourceLanguage: string; targetLanguage: string }): Promise<{ translate(value: string): Promise<string> }>;
        };
      }).Translator;
      if (translator) {
        try {
          const options = {
            sourceLanguage: dictSide === "target" ? language.id : "vi",
            targetLanguage: dictSide === "target" ? "vi" : language.id,
          };
          if ((await translator.availability(options)) !== "unavailable") {
            const result = await (await translator.create(options)).translate(text);
            if (result.trim()) {
              setDictAi(`${result}\n\n(Dịch bằng bộ dịch của trình duyệt.)`);
              return;
            }
          }
        } catch {}
      }
      setDictAi(await onSearchOnline(text));
    } catch (error) {
      setDictAi(error instanceof Error ? error.message : "Không tìm được trực tuyến lúc này.");
    } finally {
      setDictAiBusy(false);
    }
  }

  const need = packsFor(language.id).filter((id) => !dictPacks.includes(id));
  const totalMb = need.reduce((sum, id) => sum + PACK_INFO[id].mb, 0);
  const sourceText = dictSource;
  const googleLink = `https://translate.google.com/?sl=${dictLangCode(dictSide)}&tl=${dictLangCode(dictSide === "target" ? "vi" : "target")}&text=${encodeURIComponent(sourceText)}&op=translate`;
  const visibleHits = dictMore ? dictHits : dictHits.slice(0, 4);
  const repeatsBox = language.id === "en" && dictHits.length === 1 && dictHits[0].head.toLowerCase() === dictText.target.trim().toLowerCase();
  const details = sourceText.trim() && dictHits.length > 0 && !repeatsBox ? (
    <ul className="dict-details">
      {visibleHits.map((hit, index) => (
        <li key={`${hit.head}-${hit.reading}-${index}`}>
          <div className="dict-detail-main">
            <strong lang={language.speechLang}>{hit.head}</strong>
            {hit.alt && <span className="dict-alt" lang={language.speechLang}>{hit.alt}</span>}
            {hit.reading && <span className="dict-reading">{hit.reading}</span>}
            {hit.hanviet && <span className="dict-hanviet" title="Âm đọc tiếng Việt của chữ (Hán-Việt hoặc Nôm, theo Unicode Unihan)">{hit.hanviet}</span>}
            <button type="button" className="vocab-mini-btn" aria-label={`Nghe ${hit.head}`} onClick={() => onPlayHit(`dict:${hit.head}`, hit.head)}>{speakerIcon(`dict:${hit.head}`)}</button>
            <button type="button" className="vocab-mini-btn" aria-label={`Chép ${hit.head} vào khung`} title="Chép vào khung nhập" onClick={() => { setDictSide("target"); setDictText({ target: hit.head, vi: "" }); }}>📋</button>
          </div>
          <small className="dict-detail-mean">{hit.vietnamese.length > 0 && <b>{hit.vietnamese.join(" · ")} — </b>}{hit.english}</small>
        </li>
      ))}
      {dictHits.length > 4 && (
        <li><button type="button" className="text-button" onClick={() => setDictMore((value) => !value)}>{dictMore ? "Thu gọn" : `Xem thêm ${dictHits.length - 4} kết quả`}</button></li>
      )}
    </ul>
  ) : null;

  return (
    <section className="dict-wrap" aria-labelledby="dict-title" hidden={!visible}>
      <div className="page-intro">
        <span className="eyebrow">TỪ ĐIỂN</span>
        <h2 id="dict-title">Từ điển {language.viName} ↔ Tiếng Việt</h2>
        <p>Gõ hoặc nhấn 🎤 để nói vào khung nào cũng được, khung còn lại sẽ hiện nghĩa. Nhấn 🔊 để nghe phát âm từng khung.</p>
      </div>
      {language.id !== "en" && (
        <details className="dict-typing">
          <summary>⌨ Chưa có bàn phím {language.viName}? Cách nhập chữ</summary>
          <ul>{language.id === "ja" ? (
            <>
              <li><b>Không cần cài gì:</b> gõ chữ Latinh (romaji), ví dụ <b>reizouko</b>, app tự tra từ <b>れいぞうこ</b> (冷蔵庫).</li>
              <li><b>Muốn gõ thẳng chữ Nhật:</b> Android (Gboard): Cài đặt → Hệ thống → Bàn phím → Gboard → Ngôn ngữ → Thêm bàn phím → Tiếng Nhật. iPhone: Cài đặt → Cài đặt chung → Bàn phím → Bàn phím → Thêm bàn phím mới → Tiếng Nhật (Romaji hoặc Kana). Windows: Cài đặt → Thời gian &amp; ngôn ngữ → Ngôn ngữ → Thêm Nhật Bản.</li>
              <li><b>Chữ lạ chưa biết đọc:</b> dùng bàn phím <b>viết tay</b> (Gboard có “Nhật – viết tay”), hoặc gõ nghĩa tiếng Việt vào khung dưới để app gợi ý chữ rồi nhấn 📋 chép.</li>
            </>
          ) : (
            <>
              <li><b>Không cần cài gì:</b> gõ <b>pinyin</b> không dấu, ví dụ <b>ya suo ji</b> hoặc <b>yasuoji</b>, app tìm ra 压缩机.</li>
              <li><b>Muốn gõ thẳng chữ Hán:</b> Android (Gboard): Cài đặt → Hệ thống → Bàn phím → Gboard → Ngôn ngữ → Thêm bàn phím → Trung Quốc (Pinyin). iPhone: Cài đặt → Cài đặt chung → Bàn phím → Thêm bàn phím mới → Tiếng Trung giản thể (Pinyin). Windows: Thêm ngôn ngữ Trung Quốc (giản thể).</li>
              <li><b>Chữ lạ chưa biết đọc:</b> dùng bàn phím <b>viết tay</b> (Gboard có “Trung – viết tay”), hoặc gõ nghĩa tiếng Việt vào khung dưới để app gợi ý chữ rồi nhấn 📋 chép.</li>
            </>
          )}</ul>
        </details>
      )}
      {!ready && (
        <div className="dict-download">
          <strong>Tải từ điển về máy để dùng offline</strong>
          <p>Gồm: {need.map((id) => PACK_INFO[id].label).join(", ")}. Dung lượng khoảng {totalMb.toFixed(1)} MB, chỉ tải một lần.</p>
          <div className="sg-spot" data-hint="Nhấn để tải">
            <button type="button" className="button button-primary sg-big" disabled={!!dictBusy} onClick={() => { void downloadDictionary(need); }}>
              {dictBusy || `⬇ Tải từ điển (${totalMb.toFixed(1)} MB)`}
            </button>
          </div>
          {dictError && <p className="error-message" role="alert">{dictError}</p>}
          <small>Chưa tải vẫn dùng được nút tìm mở rộng online bên dưới.</small>
        </div>
      )}
      <div className="dict-boxes">
        <div className="dict-box">
          <div className="dict-box-head">
            <strong><span aria-hidden="true">{language.flag}</span> {language.nameNative}</strong>
            <span className="dict-tools">
              <button type="button" className={dictListening === "target" ? "vocab-mini-btn listening" : "vocab-mini-btn"} aria-label="Nói để nhập" title="Nói để nhập" onClick={() => startDictVoice("target")}>🎤</button>
              <button type="button" className="vocab-mini-btn" aria-label="Nghe phát âm" disabled={!dictText.target.trim() || speechBusy} onClick={() => onPlayTarget(dictText.target)}>🔊</button>
              <button type="button" className="vocab-mini-btn" aria-label="Xóa" disabled={!dictText.target} onClick={() => { setDictText({ target: "", vi: "" }); setDictHits([]); setDictAi(""); }}>✕</button>
            </span>
          </div>
          <textarea className="dict-input" rows={3} value={dictText.target} lang={language.speechLang} placeholder={language.id === "en" ? "Nhập từ hoặc câu tiếng Anh…" : `Nhập ${language.viName}${language.id === "zh" ? " (chữ Hán hoặc pinyin không dấu)" : " (kanji hoặc kana)"}…`}
            onChange={(event) => { setDictSide("target"); setDictAi(""); setDictMore(false); setDictText((current) => ({ ...current, target: event.target.value })); }} />
          {details}
        </div>
        <div className="dict-arrow" aria-hidden="true">⇅</div>
        <div className="dict-box">
          <div className="dict-box-head">
            <strong><span aria-hidden="true">🇻🇳</span> Tiếng Việt</strong>
            <span className="dict-tools">
              <button type="button" className={dictListening === "vi" ? "vocab-mini-btn listening" : "vocab-mini-btn"} aria-label="Nói để nhập" title="Nói để nhập" onClick={() => startDictVoice("vi")}>🎤</button>
              <button type="button" className="vocab-mini-btn" aria-label="Nghe tiếng Việt" disabled={!dictText.vi.trim()} onClick={() => onPlayVietnamese(dictText.vi)}>🔊</button>
              <button type="button" className="vocab-mini-btn" aria-label="Xóa" disabled={!dictText.vi} onClick={() => { setDictText({ target: "", vi: "" }); setDictHits([]); setDictAi(""); }}>✕</button>
            </span>
          </div>
          <textarea className="dict-input" rows={3} value={dictText.vi} lang="vi" placeholder="Nhập từ tiếng Việt (có dấu hoặc không dấu)…"
            onChange={(event) => { setDictSide("vi"); setDictAi(""); setDictMore(false); setDictText((current) => ({ ...current, vi: event.target.value })); }} />
        </div>
      </div>
      {dictListening && <p className="dict-listening" role="status">🎤 Đang nghe… hãy nói {dictListening === "vi" ? "tiếng Việt" : language.viName}. Nhấn micro lần nữa để dừng.</p>}
      {dictVoiceNote && <p className="error-message" role="alert">{dictVoiceNote}</p>}
      {ready && sourceText.trim() && !dictHits.length && !dictSearching && <p className="dict-empty">Không tìm thấy trong từ điển offline. Hãy thử tìm mở rộng online ở bên dưới.</p>}
      {ready && language.id !== "en" && !dictHits.some((hit) => hit.vietnamese.length) && dictHits.length > 0 && (
        <p className="dict-note">Nghĩa tiếng Việt chưa có sẵn cho từ này, bạn xem nghĩa tiếng Anh ở trên hoặc dùng tìm mở rộng online.</p>
      )}
      <div className="dict-online">
        <strong>Không tìm được? Tìm mở rộng online</strong>
        <div className="dict-online-actions">
          <button type="button" className="button button-primary" disabled={!sourceText.trim() || dictAiBusy} onClick={() => { void searchDictionaryOnline(); }}>
            {dictAiBusy ? "Đang tìm…" : "🔎 Tìm bằng AI / bộ dịch trình duyệt"}
          </button>
          <a className={`button button-outline${sourceText.trim() ? "" : " disabled"}`} href={sourceText.trim() ? googleLink : undefined} target="_blank" rel="noreferrer">🌐 Mở bằng Google Dịch ↗</a>
        </div>
        {dictAi && <pre className="dict-ai" role="status">{dictAi}</pre>}
        <small>Trên Android, nút Google Dịch thường mở thẳng ứng dụng Google Dịch nếu máy đã cài. Dữ liệu offline của ứng dụng đó không dùng chung được với web app.</small>
      </div>
      {dictPacks.length > 0 && (
        <details className="dict-manage">
          <summary>Quản lý dữ liệu từ điển trên máy</summary>
          <ul>{dictPacks.map((id) => (
            <li key={id}><span>{PACK_INFO[id].label} · ~{PACK_INFO[id].mb} MB</span><button type="button" className="remove-key-button" onClick={() => { void deleteDictionary(id); }}>Xóa</button></li>
          ))}</ul>
          {dictError && <p className="error-message" role="alert">{dictError}</p>}
          <small>Nguồn dữ liệu: CC-CEDICT, JMdict (EDRDG), Wiktionary, Unicode Unihan, theo giấy phép CC BY-SA.</small>
        </details>
      )}
    </section>
  );
}
