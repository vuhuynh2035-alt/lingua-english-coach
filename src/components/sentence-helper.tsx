"use client";

import { useEffect, useMemo, useState } from "react";
import { PACK_INFO, downloadPack, installedPacks, isReady, lookup, packsFor, type DictHit, type PackId } from "@/lib/dictionary";
import type { LangId } from "@/lib/language";

export type AskKind = "translate" | "grammar" | "word";

type Tab = "meaning" | "grammar" | "words";

const CACHE_KEY = "lingua-line-ai-v1";
const CACHE_LIMIT = 300;

function readCache(): Record<string, string> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
    return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, string> : {};
  } catch {
    return {};
  }
}

function writeCache(key: string, text: string) {
  try {
    const cache = readCache();
    delete cache[key];
    cache[key] = text;
    const keys = Object.keys(cache);
    for (const old of keys.slice(0, Math.max(0, keys.length - CACHE_LIMIT))) delete cache[old];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // the answer is still shown; it just will not be kept for offline use
  }
}

/** The word and the plain forms it may come from ("rescheduled" -> "reschedule", "doctors" -> "doctor"). */
function candidates(word: string): string[] {
  const w = word.toLowerCase().replace(/'s$/, "");
  const out = [w];
  if (w.endsWith("ies")) out.push(`${w.slice(0, -3)}y`);
  if (w.endsWith("es")) out.push(w.slice(0, -2));
  if (w.endsWith("s")) out.push(w.slice(0, -1));
  if (w.endsWith("ied")) out.push(`${w.slice(0, -3)}y`);
  if (w.endsWith("ed")) out.push(w.slice(0, -2), w.slice(0, -1));
  if (w.endsWith("ing")) out.push(w.slice(0, -3), `${w.slice(0, -3)}e`);
  if (w.endsWith("ly")) out.push(w.slice(0, -2));
  if (/(.)\1(ed|ing)$/.test(w)) out.push(w.replace(/(.)\1(ed|ing)$/, "$1"));
  return [...new Set(out)].filter((item) => item.length > 1);
}

export default function SentenceHelper({
  text,
  translation,
  context,
  lang,
  ask,
  onClose,
}: {
  text: string;
  translation?: string;
  context: string;
  lang: LangId;
  ask: (kind: AskKind, sentence: string, context: string, word?: string) => Promise<string>;
  onClose: () => void;
}) {
  // English: tap a word. Japanese / Chinese: the dictionary splits the sentence into its words itself.
  const canLookUpWords = true;
  const cjk = lang !== "en";
  const dictionaryName = lang === "ja" ? "Nhật – Việt" : lang === "zh" ? "Trung – Việt" : "Anh – Việt";
  const [tab, setTab] = useState<Tab>("meaning");
  const [segments, setSegments] = useState<DictHit[] | "loading" | "none">("loading");
  const [aiText, setAiText] = useState<Record<string, string>>(() => {
    const cache = readCache();
    return {
      translate: cache[`translate|${text}`] ?? "",
      grammar: cache[`grammar|${text}`] ?? "",
    };
  });
  const [busy, setBusy] = useState<AskKind | "">("");
  const [error, setError] = useState("");

  const [installed, setInstalled] = useState<PackId[] | null>(null);
  const [download, setDownload] = useState<{ busy: boolean; percent: number; error: string }>({ busy: false, percent: 0, error: "" });
  const [word, setWord] = useState("");
  const [hits, setHits] = useState<DictHit[] | "loading" | "none">("none");
  const [wordAi, setWordAi] = useState<{ busy: boolean; text: string; error: string }>({ busy: false, text: "", error: "" });

  const words = useMemo(() => [...new Set(text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [])], [text]);

  useEffect(() => {
    if (!canLookUpWords || tab !== "words" || installed) return;
    let cancelled = false;
    void installedPacks().then((packs) => { if (!cancelled) setInstalled(packs); });
    return () => { cancelled = true; };
  }, [canLookUpWords, tab, installed]);

  const dictionaryReady = installed ? isReady(lang, installed) : false;

  // Japanese / Chinese: look the whole sentence up once; the dictionary picks the longest known word at each point
  useEffect(() => {
    if (!cjk || tab !== "words" || !dictionaryReady) return;
    let cancelled = false;
    const query = text.replace(/[\s。、，．,.!?！？「」『』（）()…・~〜"“”'’:：;；—-]/g, "");
    void lookup(lang, "target", query)
      .then((found) => { if (!cancelled) setSegments(found.hits.length ? found.hits : "none"); })
      .catch(() => { if (!cancelled) setSegments("none"); });
    return () => { cancelled = true; };
  }, [cjk, tab, dictionaryReady, lang, text]);

  async function run(kind: AskKind) {
    setBusy(kind);
    setError("");
    try {
      const answer = (await ask(kind, text, context)).trim();
      if (!answer) throw new Error("AI chưa trả lời. Hãy thử lại.");
      writeCache(`${kind}|${text}`, answer);
      setAiText((current) => ({ ...current, [kind]: answer }));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Không thể nhờ AI lúc này. Hãy thử lại.");
    } finally {
      setBusy("");
    }
  }

  async function downloadDictionary() {
    setDownload({ busy: true, percent: 0, error: "" });
    try {
      const have = await installedPacks();
      const missing = packsFor(lang).filter((id) => !have.includes(id));
      for (let index = 0; index < missing.length; index += 1) {
        await downloadPack(missing[index], (done, total) => {
          const part = total > 0 ? done / total : 0;
          setDownload({ busy: true, percent: Math.round(((index + part) / missing.length) * 100), error: "" });
        });
      }
      setInstalled(await installedPacks());
      setDownload({ busy: false, percent: 100, error: "" });
    } catch (failure) {
      setDownload({ busy: false, percent: 0, error: failure instanceof Error ? failure.message : "Không tải được từ điển. Hãy kiểm tra kết nối mạng." });
    }
  }

  /** A word the dictionary does not know: ask the AI for its meaning in this sentence. */
  async function askAboutWord() {
    setWordAi({ busy: true, text: "", error: "" });
    try {
      const answer = (await ask("word", text, context, word)).trim();
      setWordAi({ busy: false, text: answer, error: "" });
    } catch (failure) {
      setWordAi({ busy: false, text: "", error: failure instanceof Error ? failure.message : "Không thể nhờ AI lúc này. Hãy thử lại." });
    }
  }

  async function lookUp(chosen: string) {
    setWord(chosen);
    setWordAi({ busy: false, text: "", error: "" });
    setHits("loading");
    for (const form of candidates(chosen)) {
      try {
        const found = await lookup(lang, "target", form);
        if (found.hits.some((hit) => hit.vietnamese.length > 0)) {
          setHits(found.hits.filter((hit) => hit.vietnamese.length > 0).slice(0, 3));
          return;
        }
      } catch {
        break;
      }
    }
    setHits("none");
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "meaning", label: "🇻🇳 Nghĩa" },
    { id: "grammar", label: "🧩 Ngữ pháp" },
    ...(canLookUpWords ? [{ id: "words" as const, label: "🔍 Từng từ" }] : []),
  ];

  return (
    <div className="sentence-helper" role="region" aria-label="Trợ giúp cho câu này">
      <div className="sh-head">
        <div className="sh-tabs" role="tablist">
          {tabs.map((item) => (
            <button type="button" role="tab" key={item.id} aria-selected={tab === item.id} className={tab === item.id ? "sh-tab active" : "sh-tab"} onClick={() => { setTab(item.id); setError(""); }}>
              {item.label}
            </button>
          ))}
        </div>
        <button type="button" className="sh-close" onClick={onClose} aria-label="Đóng trợ giúp">✕</button>
      </div>

      {tab === "meaning" && (
        <div className="sh-body">
          {translation ? (
            <p className="sh-answer">{translation}</p>
          ) : aiText.translate ? (
            <p className="sh-answer">{aiText.translate}</p>
          ) : (
            <button type="button" className="button button-outline" disabled={busy !== ""} onClick={() => { void run("translate"); }}>
              {busy === "translate" ? "AI đang dịch…" : "Dịch câu này bằng AI"}
            </button>
          )}
        </div>
      )}

      {tab === "grammar" && (
        <div className="sh-body">
          {aiText.grammar ? (
            <p className="sh-answer sh-pre">{aiText.grammar}</p>
          ) : (
            <>
              <p className="sh-hint">AI sẽ giải thích cấu trúc câu này bằng tiếng Việt (cần API key; kết quả được lưu lại để xem offline).</p>
              <button type="button" className="button button-outline" disabled={busy !== ""} onClick={() => { void run("grammar"); }}>
                {busy === "grammar" ? "AI đang phân tích…" : "Phân tích ngữ pháp bằng AI"}
              </button>
            </>
          )}
        </div>
      )}

      {tab === "words" && canLookUpWords && (
        <div className="sh-body">
          {!installed ? (
            <p className="sh-hint">Đang kiểm tra từ điển…</p>
          ) : !dictionaryReady ? (
            <>
              <p className="sh-hint">Cần tải từ điển {dictionaryName} một lần (khoảng {packsFor(lang).reduce((sum, id) => sum + PACK_INFO[id].mb, 0).toFixed(1)} MB), sau đó tra từ hoàn toàn offline.</p>
              <button type="button" className="button button-outline" disabled={download.busy} onClick={() => { void downloadDictionary(); }}>
                {download.busy ? `Đang tải… ${download.percent}%` : "Tải từ điển"}
              </button>
              {download.error && <small className="error-message">{download.error}</small>}
            </>
          ) : cjk ? (
            <>
              <p className="sh-hint">Các từ trong câu, theo thứ tự xuất hiện (tên riêng có thể bị tách thành từng chữ):</p>
              {segments === "loading" && <p className="sh-hint">Đang tra…</p>}
              {segments === "none" && <p className="sh-hint">Chưa tìm thấy từ nào của câu này trong từ điển.</p>}
              {Array.isArray(segments) && (
                <ul className="sh-result">
                  {segments.map((hit, index) => (
                    <li key={`${hit.head}-${index}`}>
                      <strong>{hit.head}</strong>
                      {hit.reading ? <em> {hit.reading}</em> : null}
                      {hit.hanviet ? <span> ({hit.hanviet})</span> : null}
                      {" — "}{hit.vietnamese.length ? hit.vietnamese.slice(0, 4).join("; ") : hit.english}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <p className="sh-hint">Chạm vào một từ để xem nghĩa.</p>
              <div className="sh-words">
                {words.map((item) => (
                  <button type="button" key={item} className={word === item ? "sh-word active" : "sh-word"} onClick={() => { void lookUp(item); }}>{item}</button>
                ))}
              </div>
              {hits === "loading" && <p className="sh-hint">Đang tra…</p>}
              {hits === "none" && word && (
                <>
                  <p className="sh-hint">Chưa tìm thấy “{word}” trong từ điển.</p>
                  {wordAi.text
                    ? <p className="sh-answer">{wordAi.text}</p>
                    : <button type="button" className="button button-outline" disabled={wordAi.busy} onClick={() => { void askAboutWord(); }}>{wordAi.busy ? "AI đang dịch…" : "Nhờ AI dịch từ này"}</button>}
                  {wordAi.error && <small className="error-message" role="alert">{wordAi.error}</small>}
                </>
              )}
              {Array.isArray(hits) && (
                <ul className="sh-result">
                  {hits.map((hit, index) => (
                    <li key={`${hit.head}-${index}`}><strong>{hit.head}</strong>{hit.reading ? <em> {hit.reading}</em> : null} — {hit.vietnamese.slice(0, 6).join("; ")}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {error && <small className="error-message" role="alert">{error}</small>}
    </div>
  );
}
