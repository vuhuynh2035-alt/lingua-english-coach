import type { LangId } from "@/lib/language";

/**
 * Offline dictionary. Chinese (CC-CEDICT) and Japanese (JMdict) give English meanings; a
 * Vietnamese word list (Wiktionary) with English meanings is the bridge to Vietnamese, and
 * Unihan gives the Sino-Vietnamese readings. Everything is downloaded once into IndexedDB.
 */
export type PackId = "vi" | "zh" | "ja" | "ja-full" | "hanviet";

type ZhEntry = [string, string, string, string]; // simplified, traditional, pinyin, english
type JaEntry = [string, string, string, number]; // kanji "a|b", readings "x|y", english, common
type ViEntry = [string, string]; // vietnamese, english

export type DictHit = {
  /** Headword in the language being learned (or the English word for English). */
  head: string;
  /** Other written form (traditional characters, other kanji spelling). */
  alt?: string;
  reading: string;
  hanviet: string;
  english: string;
  vietnamese: string[];
};
export type Lookup = { hits: DictHit[]; /** What goes into the other box. */ summary: string };

const DATABASE_NAME = "lingua-dict";
const STORE = "packs";
const PACK_VERSION = 1;

export const PACK_INFO: Record<PackId, { label: string; mb: number }> = {
  vi: { label: "Từ điển Việt ↔ Anh", mb: 0.6 },
  zh: { label: "Từ điển Trung (CC-CEDICT)", mb: 3.9 },
  ja: { label: "Từ điển Nhật cơ bản (30 nghìn từ thông dụng)", mb: 0.9 },
  "ja-full": { label: "Từ điển Nhật đầy đủ (219 nghìn từ)", mb: 6.8 },
  hanviet: { label: "Âm đọc tiếng Việt của chữ Hán", mb: 0.05 },
};

/** The packs a language needs; Japanese can add the full pack. */
export function packsFor(lang: LangId): PackId[] {
  return lang === "zh" ? ["zh", "vi", "hanviet"] : lang === "ja" ? ["ja", "vi", "hanviet"] : ["vi"];
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Không thể mở bộ nhớ từ điển trên thiết bị."));
  });
}

function transact<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then((database) => new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE, mode);
    const request = run(transaction.objectStore(STORE));
    transaction.oncomplete = () => { database.close(); resolve(request.result); };
    transaction.onerror = () => { database.close(); reject(transaction.error ?? new Error("Lỗi bộ nhớ từ điển.")); };
    transaction.onabort = () => { database.close(); reject(transaction.error ?? new Error("Không đủ dung lượng để lưu từ điển.")); };
  }));
}

const memory = new Map<string, unknown>();

export async function installedPacks(): Promise<PackId[]> {
  try {
    const keys = await transact("readonly", (store) => store.getAllKeys());
    return (keys as string[]).filter((key): key is PackId => key in PACK_INFO);
  } catch {
    return [];
  }
}

export async function downloadPack(id: PackId): Promise<void> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const response = await fetch(`${basePath}/dict/${id}.json`);
  if (!response.ok) throw new Error(`Không tải được ${PACK_INFO[id].label} (HTTP ${response.status}).`);
  const data: unknown = await response.json();
  await transact("readwrite", (store) => store.put({ id, version: PACK_VERSION, data, savedAt: Date.now() }));
  memory.delete(id);
}

export async function removePack(id: PackId): Promise<void> {
  await transact("readwrite", (store) => store.delete(id));
  memory.delete(id);
  indexes.clear();
}

async function pack<T>(id: PackId): Promise<T | null> {
  if (memory.has(id)) return memory.get(id) as T;
  try {
    const record = await transact("readonly", (store) => store.get(id)) as { data: T } | undefined;
    if (!record) return null;
    memory.set(id, record.data);
    return record.data;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- text helpers
export function fold(text: string): string {
  return text.toLowerCase().replace(/đ/g, "d").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const CJK = /[぀-ヿ㐀-鿿]/;
export const hasCjk = (text: string) => CJK.test(text);

/** "to run; (informal) sprint, a dash" → ["run", "sprint", "dash"]: the plain words used to match meanings. */
export function englishTerms(gloss: string, limit = 6): string[] {
  const terms: string[] = [];
  for (const part of gloss.split(/[;,]/)) {
    const term = part.replace(/\([^)]*\)/g, "").replace(/^\s*(to|a|an|the)\s+/i, "").trim().toLowerCase();
    if (term && term.length <= 40 && !terms.includes(term)) terms.push(term);
    if (terms.length >= limit) break;
  }
  return terms;
}


// ---------------------------------------------------------------- typing without a Japanese keyboard
const KANA_ROWS: Record<string, string> = {
  a: "あ", i: "い", u: "う", e: "え", o: "お", ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ", sa: "さ", si: "し", shi: "し", su: "す", se: "せ", so: "そ",
  ta: "た", ti: "ち", chi: "ち", tu: "つ", tsu: "つ", te: "て", to: "と", na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の", ha: "は", hi: "ひ", hu: "ふ", fu: "ふ", he: "へ", ho: "ほ",
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も", ya: "や", yu: "ゆ", yo: "よ", ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ", wa: "わ", wo: "を",
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご", za: "ざ", zi: "じ", ji: "じ", zu: "ず", ze: "ぜ", zo: "ぞ", da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ", pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  kya: "きゃ", kyu: "きゅ", kyo: "きょ", sha: "しゃ", shu: "しゅ", sho: "しょ", sya: "しゃ", syu: "しゅ", syo: "しょ", cha: "ちゃ", chu: "ちゅ", cho: "ちょ", tya: "ちゃ", tyu: "ちゅ", tyo: "ちょ",
  nya: "にゃ", nyu: "にゅ", nyo: "にょ", hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ", mya: "みゃ", myu: "みゅ", myo: "みょ", rya: "りゃ", ryu: "りゅ", ryo: "りょ",
  gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ", ja: "じゃ", ju: "じゅ", jo: "じょ", jya: "じゃ", jyu: "じゅ", jyo: "じょ", bya: "びゃ", byu: "びゅ", byo: "びょ", pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ",
  fa: "ふぁ", fi: "ふぃ", fe: "ふぇ", fo: "ふぉ", tsa: "つぁ", she: "しぇ", che: "ちぇ", je: "じぇ", ti2: "てぃ",
};
const MACRONS: Record<string, string> = { ā: "aa", ī: "ii", ū: "uu", ē: "ee", ō: "ou" };

/** "reizouko" → "れいぞうこ"; double consonants become っ, "n" before a consonant becomes ん. */
export function romajiToHiragana(input: string): string {
  const text = input.toLowerCase().replace(/[āīūēō]/g, (char) => MACRONS[char]).replace(/[^a-z' -]/g, "");
  let result = "";
  let at = 0;
  while (at < text.length) {
    const rest = text.slice(at);
    if (/^[ -]/.test(rest)) { at += 1; continue; }
    if (/^n'/.test(rest)) { result += "ん"; at += 2; continue; }
    if ((/^([bcdfghjklmpqrstvwxyz])\1/.test(rest) && rest[0] !== "n") || rest.startsWith("tch")) { result += "っ"; at += 1; continue; }
    let matched = false;
    for (const size of [3, 2, 1]) {
      const kana = KANA_ROWS[rest.slice(0, size)];
      if (kana) { result += kana; at += size; matched = true; break; }
    }
    if (matched) continue;
    if (rest[0] === "n" && !/^n[aiueoy]/.test(rest)) { result += "ん"; at += 1; continue; }
    return ""; // not romaji
  }
  return result;
}

export function hiraganaToKatakana(text: string): string {
  return text.replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));
}

// ---------------------------------------------------------------- indexes (built once, lazily)
const indexes = new Map<string, Map<string, number[]>>();

function addTo(map: Map<string, number[]>, key: string, index: number, cap = 8) {
  const list = map.get(key);
  if (!list) map.set(key, [index]);
  else if (list.length < cap && !list.includes(index)) list.push(index);
}

function index(name: string, build: (map: Map<string, number[]>) => void): Map<string, number[]> {
  let map = indexes.get(name);
  if (!map) {
    map = new Map();
    build(map);
    indexes.set(name, map);
  }
  return map;
}

async function viPack(): Promise<ViEntry[] | null> { return pack<ViEntry[]>("vi"); }
async function hanvietPack(): Promise<Record<string, string> | null> { return pack<Record<string, string>>("hanviet"); }

async function targetPack(lang: LangId): Promise<{ id: PackId; data: (ZhEntry | JaEntry)[] } | null> {
  if (lang === "zh") {
    const data = await pack<ZhEntry[]>("zh");
    return data ? { id: "zh", data } : null;
  }
  if (lang === "ja") {
    const full = await pack<JaEntry[]>("ja-full");
    if (full) return { id: "ja-full", data: full };
    const basic = await pack<JaEntry[]>("ja");
    return basic ? { id: "ja", data: basic } : null;
  }
  return null;
}

/** Vietnamese words for an English meaning, e.g. "refrigerator" → ["tủ lạnh"]. */
function vietnameseByEnglish(entries: ViEntry[]): Map<string, number[]> {
  return index("vi-by-english", (map) => {
    entries.forEach((entry, position) => {
      for (const term of englishTerms(entry[1], 6)) addTo(map, term, position, 6);
    });
  });
}

function vietnameseByFold(entries: ViEntry[]): Map<string, number[]> {
  return index("vi-by-fold", (map) => entries.forEach((entry, position) => addTo(map, fold(entry[0]), position, 12)));
}

function zhKeys(entries: ZhEntry[]): Map<string, number[]> {
  return index("zh-keys", (map) => {
    entries.forEach((entry, position) => {
      addTo(map, entry[0], position, 6);
      if (entry[1]) addTo(map, entry[1], position, 6);
    });
  });
}

function jaKeys(entries: JaEntry[], id: PackId): Map<string, number[]> {
  return index(`ja-keys-${id}`, (map) => {
    entries.forEach((entry, position) => {
      for (const form of entry[0].split("|")) if (form) addTo(map, form, position, 6);
      for (const reading of entry[1].split("|")) if (reading) addTo(map, reading, position, 6);
    });
  });
}

/** Target-language entries whose meaning is exactly an English term, common words first. */
function targetByEnglish(lang: LangId, id: PackId, entries: (ZhEntry | JaEntry)[]): Map<string, number[]> {
  return index(`target-by-english-${id}`, (map) => {
    const order = entries.map((_, position) => position);
    if (lang === "ja") order.sort((a, b) => Number((entries[b] as JaEntry)[3]) - Number((entries[a] as JaEntry)[3]));
    for (const position of order) {
      const gloss = lang === "zh" ? (entries[position] as ZhEntry)[3] : (entries[position] as JaEntry)[2];
      for (const term of englishTerms(gloss, 3)) addTo(map, term, position, 6);
    }
  });
}

// ---------------------------------------------------------------- lookups
function hanvietOf(text: string, map: Record<string, string> | null): string {
  if (!map) return "";
  const parts: string[] = [];
  for (const char of text) {
    const reading = map[char];
    if (reading) parts.push(reading.split("/")[0]);
  }
  return parts.length ? parts.join(" ") : "";
}

function vietnameseFor(english: string, vi: ViEntry[] | null): string[] {
  if (!vi) return [];
  const map = vietnameseByEnglish(vi);
  const result: string[] = [];
  for (const term of englishTerms(english, 4)) {
    for (const position of map.get(term) ?? []) {
      const word = vi[position][0];
      if (!result.includes(word)) result.push(word);
    }
    if (result.length >= 5) break;
  }
  return result.slice(0, 5);
}

function zhHit(entry: ZhEntry, vi: ViEntry[] | null, hanviet: Record<string, string> | null): DictHit {
  return { head: entry[0], alt: entry[1] || undefined, reading: entry[2], hanviet: hanvietOf(entry[0], hanviet), english: entry[3], vietnamese: vietnameseFor(entry[3], vi) };
}

function jaHit(entry: JaEntry, vi: ViEntry[] | null, hanviet: Record<string, string> | null): DictHit {
  const forms = entry[0].split("|").filter(Boolean);
  const readings = entry[1].split("|");
  return {
    head: forms[0] ?? readings[0], alt: forms.length ? readings[0] : undefined, reading: forms.length ? readings[0] : "",
    hanviet: hanvietOf(forms[0] ?? "", hanviet), english: entry[2], vietnamese: vietnameseFor(entry[2], vi),
  };
}

function plainPinyin(text: string): string {
  return fold(text).replace(/[^a-z]/g, "");
}

/** Looks up text in the language being learned (Chinese / Japanese) and gives Vietnamese through English. */
async function fromTarget(lang: LangId, query: string): Promise<DictHit[]> {
  const target = await targetPack(lang);
  if (!target) return [];
  const [vi, hanviet] = await Promise.all([viPack(), hanvietPack()]);
  const make = (position: number) => lang === "zh"
    ? zhHit(target.data[position] as ZhEntry, vi, hanviet)
    : jaHit(target.data[position] as JaEntry, vi, hanviet);
  const keys = lang === "zh" ? zhKeys(target.data as ZhEntry[]) : jaKeys(target.data as JaEntry[], target.id);
  const found: number[] = [];
  const push = (position: number) => { if (!found.includes(position) && found.length < 14) found.push(position); };

  // Japanese typed in romaji ("reizouko"): look the reading up as hiragana, then katakana.
  if (lang === "ja" && !hasCjk(query)) {
    const hiragana = romajiToHiragana(query);
    if (hiragana) {
      for (const form of [hiragana, hiraganaToKatakana(hiragana)]) for (const position of keys.get(form) ?? []) push(position);
      if (found.length < 8) {
        for (const [key, positions] of keys) {
          if (key.length > hiragana.length && (key.startsWith(hiragana) || key.startsWith(hiraganaToKatakana(hiragana)))) positions.forEach(push);
          if (found.length >= 12) break;
        }
      }
      return found.map(make);
    }
  }
  for (const position of keys.get(query) ?? []) push(position);
  if (found.length === 0 && query.length > 1 && hasCjk(query)) {
    // A phrase or sentence: take the longest known word at each point.
    let at = 0;
    while (at < query.length && found.length < 14) {
      let matched = 0;
      for (let end = Math.min(query.length, at + 8); end > at; end--) {
        const positions = keys.get(query.slice(at, end));
        if (positions) { push(positions[0]); matched = end - at; break; }
      }
      at += matched || 1;
    }
  }
  if (found.length < 8) {
    if (hasCjk(query)) {
      for (const [key, positions] of keys) {
        if (key.length > query.length && key.startsWith(query)) positions.forEach(push);
        if (found.length >= 12) break;
      }
    } else if (lang === "zh") {
      // pinyin without tones: "ni hao" finds 你好
      const wanted = plainPinyin(query);
      if (wanted.length >= 2) {
        const entries = target.data as ZhEntry[];
        for (let position = 0; position < entries.length && found.length < 12; position++) {
          if (plainPinyin(entries[position][2]) === wanted) push(position);
        }
      }
    }
  }
  return found.map(make);
}

/** Looks up a Vietnamese word (with or without diacritics) and finds words with the same meaning. */
async function fromVietnamese(lang: LangId, query: string): Promise<DictHit[]> {
  const vi = await viPack();
  if (!vi) return [];
  const folded = fold(query.trim());
  const entries: number[] = [];
  const exact = vietnameseByFold(vi).get(folded) ?? [];
  // a typed accent has to match first
  for (const position of exact) if (vi[position][0].toLowerCase() === query.trim().toLowerCase()) entries.push(position);
  for (const position of exact) if (!entries.includes(position)) entries.push(position);
  if (!entries.length && folded.length >= 2) {
    const map = vietnameseByFold(vi);
    for (const [key, positions] of map) {
      if (key.startsWith(folded)) positions.forEach((p) => entries.length < 8 && entries.push(p));
      if (entries.length >= 8) break;
    }
  }
  const hits: DictHit[] = [];
  const target = lang === "en" ? null : await targetPack(lang);
  const hanviet = target ? await hanvietPack() : null;
  const byEnglish = target ? targetByEnglish(lang, target.id, target.data) : null;
  const seen = new Set<string>();
  for (const position of entries.slice(0, 6)) {
    const [word, english] = vi[position];
    if (!target || !byEnglish) {
      hits.push({ head: englishTerms(english, 1)[0] ?? english, reading: "", hanviet: "", english, vietnamese: [word] });
      continue;
    }
    for (const term of englishTerms(english, 3)) {
      for (const entryPosition of byEnglish.get(term) ?? []) {
        const hit = lang === "zh" ? zhHit(target.data[entryPosition] as ZhEntry, null, hanviet) : jaHit(target.data[entryPosition] as JaEntry, null, hanviet);
        const key = `${hit.head}|${hit.reading}`;
        if (seen.has(key)) continue;
        seen.add(key);
        hit.vietnamese = [word];
        hits.push(hit);
        if (hits.length >= 14) return hits;
      }
    }
  }
  return hits;
}

/** English word → Vietnamese (English is the language being learned). */
async function fromEnglish(query: string): Promise<DictHit[]> {
  const vi = await viPack();
  if (!vi) return [];
  const map = vietnameseByEnglish(vi);
  const words = query.toLowerCase().replace(/[^a-z' -]/g, " ").trim().split(/\s+/).filter(Boolean);
  const terms = [words.join(" "), ...(words.length > 1 ? words : [])];
  const hits: DictHit[] = [];
  const seen = new Set<string>();
  for (const term of terms) {
    const positions = map.get(term) ?? map.get(term.replace(/^to /, "")) ?? [];
    if (!positions.length) continue;
    const vietnamese = [...new Set(positions.map((position) => vi[position][0]))].slice(0, 6);
    if (seen.has(term)) continue;
    seen.add(term);
    hits.push({ head: term, reading: "", hanviet: "", english: vi[positions[0]][1], vietnamese });
  }
  return hits;
}

function summaryFrom(hits: DictHit[], side: "target" | "vi"): string {
  if (side === "vi") {
    // output for the Vietnamese box
    return [...new Set(hits.flatMap((hit) => hit.vietnamese))].slice(0, 4).join("; ");
  }
  return [...new Set(hits.map((hit) => hit.head))].slice(0, 3).join("; ");
}

/** Translates `query` typed in one box; `summary` is the text for the other box. */
export async function lookup(lang: LangId, side: "target" | "vi", query: string): Promise<Lookup> {
  const text = query.trim();
  if (!text) return { hits: [], summary: "" };
  let hits: DictHit[];
  if (side === "target") hits = lang === "en" ? await fromEnglish(text) : await fromTarget(lang, text);
  else hits = await fromVietnamese(lang, text);
  return { hits, summary: summaryFrom(hits, side === "target" ? "vi" : "target") };
}

/** Is everything this language needs installed? */
export function isReady(lang: LangId, installed: PackId[]): boolean {
  return packsFor(lang).every((id) => installed.includes(id) || (id === "ja" && installed.includes("ja-full")));
}
