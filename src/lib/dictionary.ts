import type { LangId } from "@/lib/language";

/**
 * Offline dictionary. Chinese (CC-CEDICT) and Japanese (JMdict, common words) give English
 * meanings; a Vietnamese word list (Wiktionary) with English meanings is the bridge to
 * Vietnamese, and Unicode Unihan gives the Vietnamese readings of Han characters.
 *
 * The Chinese and Japanese packs are cut into small "shards" by the first character of a word,
 * so a search only loads the few shards it needs and memory stays small. Everything is
 * downloaded once into IndexedDB.
 */
export type PackId = "vi" | "zh" | "ja" | "hanviet" | "envi";

type ZhEntry = [string, string, string, string]; // simplified, traditional, pinyin, english
type JaEntry = [string, string, string, number]; // kanji "a|b", readings "x|y", english, common
type Raw = ZhEntry | JaEntry;
type ViEntry = [string, string]; // vietnamese, english

export type DictHit = {
  /** Headword in the language being learned (or the English word for English). */
  head: string;
  /** Other written form (traditional characters, other kanji spelling). */
  alt?: string;
  reading: string;
  /** Vietnamese reading of the characters (Sino-Vietnamese or native). */
  hanviet: string;
  english: string;
  vietnamese: string[];
};
export type Lookup = { hits: DictHit[]; /** What goes into the other box. */ summary: string };

const DATABASE_NAME = "lingua-dict";
const STORE = "packs";
const SHARDED: PackId[] = ["zh", "ja", "envi"];
const BUCKETS = 128;
const SHARD_CACHE_LIMIT = 40;

export const PACK_INFO: Record<PackId, { label: string; mb: number }> = {
  vi: { label: "Từ điển Việt ↔ Anh", mb: 0.6 },
  zh: { label: "Từ điển Trung (CC-CEDICT)", mb: 7.7 },
  ja: { label: "Từ điển Nhật (30 nghìn từ thông dụng)", mb: 2.5 },
  hanviet: { label: "Âm đọc tiếng Việt của chữ Hán", mb: 0.05 },
  envi: { label: "Từ điển Anh ↔ Việt (Wiktionary, 112 nghìn từ)", mb: 5.3 },
};

/** The packs a language needs. */
export function packsFor(lang: LangId): PackId[] {
  return lang === "zh" ? ["zh", "envi", "vi", "hanviet"] : lang === "ja" ? ["ja", "envi", "vi", "hanviet"] : ["envi", "vi"];
}

/** Is everything this language needs installed? */
export function isReady(lang: LangId, installed: PackId[]): boolean {
  return packsFor(lang).every((id) => installed.includes(id));
}

// ---------------------------------------------------------------- storage
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

const wholePacks = new Map<string, unknown>();
const shardCache = new Map<string, unknown>();
const derived = new Map<string, unknown>();
/** Head shards with their key index, most recently used last. */
const builtShards = new Map<string, Shard>();

export async function installedPacks(): Promise<PackId[]> {
  try {
    const keys = await transact("readonly", (store) => store.getAllKeys()) as string[];
    const found = new Set<PackId>();
    for (const key of keys) {
      if (key === "vi" || key === "hanviet") found.add(key);
      else if (key.endsWith("/index.json")) {
        const id = key.split("/")[0];
        if (id === "zh" || id === "ja" || id === "envi") found.add(id);
      }
    }
    return [...found];
  } catch {
    return [];
  }
}

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/dict/${path}`);
  if (!response.ok) throw new Error(`Không tải được ${path} (HTTP ${response.status}).`);
  return response.json();
}

/** Downloads one pack; sharded packs are fetched a few files at a time and the index is stored last. */
export async function downloadPack(id: PackId, onProgress?: (done: number, total: number) => void): Promise<void> {
  if (!SHARDED.includes(id)) {
    const data = await fetchJson(`${id}.json`);
    await transact("readwrite", (store) => store.put({ id, data }));
    wholePacks.delete(id);
    return;
  }
  const manifest = await fetchJson(`${id}/index.json`) as { files: string[] };
  const files = manifest.files.filter((file) => file !== "index.json");
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < files.length) {
      const file = files[next++];
      const data = await fetchJson(`${id}/${file}`);
      await transact("readwrite", (store) => store.put({ id: `${id}/${file}`, data }));
      onProgress?.(++done, files.length);
    }
  };
  await Promise.all(Array.from({ length: 5 }, worker));
  await transact("readwrite", (store) => store.put({ id: `${id}/index.json`, data: manifest }));
  clearMemory();
}

function clearMemory() {
  wholePacks.clear();
  shardCache.clear();
  builtShards.clear();
  derived.clear();
}

export async function removePack(id: PackId): Promise<void> {
  const keys = await transact("readonly", (store) => store.getAllKeys()) as string[];
  for (const key of keys) {
    if (key === id || key.startsWith(`${id}/`)) await transact("readwrite", (store) => store.delete(key));
  }
  clearMemory();
}

async function record<T>(key: string): Promise<T | null> {
  try {
    const found = await transact("readonly", (store) => store.get(key)) as { data: T } | undefined;
    return found ? found.data : null;
  } catch {
    return null;
  }
}

async function whole<T>(id: PackId): Promise<T | null> {
  if (wholePacks.has(id)) return wholePacks.get(id) as T;
  const data = await record<T>(id);
  if (data) wholePacks.set(id, data);
  return data;
}

/** One shard file, kept in memory while the most recent ones are in use. */
async function shard<T>(id: PackId, file: string): Promise<T | null> {
  const key = `${id}/${file}`;
  if (shardCache.has(key)) {
    const value = shardCache.get(key) as T;
    shardCache.delete(key);
    shardCache.set(key, value); // most recently used goes last
    return value;
  }
  const data = await record<T>(key);
  if (data) {
    shardCache.set(key, data);
    if (shardCache.size > SHARD_CACHE_LIMIT) shardCache.delete(shardCache.keys().next().value as string);
  }
  return data;
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
  fa: "ふぁ", fi: "ふぃ", fe: "ふぇ", fo: "ふぉ", tsa: "つぁ", she: "しぇ", che: "ちぇ", je: "じぇ",
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

// ---------------------------------------------------------------- Vietnamese bridge (a small pack, kept whole)
function addTo(map: Map<string, number[]>, key: string, position: number, cap: number) {
  const list = map.get(key);
  if (!list) map.set(key, [position]);
  else if (list.length < cap && !list.includes(position)) list.push(position);
}

function cached<T>(name: string, build: () => T): T {
  if (!derived.has(name)) derived.set(name, build());
  return derived.get(name) as T;
}

function vietnameseByEnglish(entries: ViEntry[]): Map<string, number[]> {
  return cached("vi-by-english", () => {
    const map = new Map<string, number[]>();
    entries.forEach((entry, position) => { for (const term of englishTerms(entry[1], 6)) addTo(map, term, position, 6); });
    return map;
  });
}

function vietnameseByFold(entries: ViEntry[]): Map<string, number[]> {
  return cached("vi-by-fold", () => {
    const map = new Map<string, number[]>();
    entries.forEach((entry, position) => addTo(map, fold(entry[0]), position, 12));
    return map;
  });
}

async function vietnameseFor(english: string, vi: ViEntry[] | null): Promise<string[]> {
  const result: string[] = [];
  for (const term of englishTerms(english, 3)) {
    const found = await enviLookup(term);
    if (found) for (const part of meaningParts(found.meaning)) if (!result.includes(part)) result.push(part);
    if (result.length >= 3) break;
  }
  if (!result.length && vi) {
    const map = vietnameseByEnglish(vi);
    for (const term of englishTerms(english, 4)) {
      for (const position of map.get(term) ?? []) {
        const word = vi[position][0];
        if (!result.includes(word)) result.push(word);
      }
      if (result.length >= 4) break;
    }
  }
  return result.slice(0, 4);
}

function hanvietOf(text: string, map: Record<string, string> | null): string {
  if (!map) return "";
  const parts: string[] = [];
  for (const char of text) {
    const reading = map[char];
    if (reading) parts.push(reading.split("/")[0]);
  }
  return parts.join(" ");
}

// ---------------------------------------------------------------- English <-> Vietnamese (envi shards)
/** Plausible dictionary forms of an English word: books → book, running → run, studied → study. */
function baseForms(word: string): string[] {
  const forms = [word];
  const add = (form: string) => { if (form.length >= 2 && !forms.includes(form)) forms.push(form); };
  if (word.endsWith("ies")) add(word.slice(0, -3) + "y");
  if (word.endsWith("es")) add(word.slice(0, -2));
  if (word.endsWith("s")) add(word.slice(0, -1));
  if (word.endsWith("ied")) add(word.slice(0, -3) + "y");
  if (word.endsWith("ed")) { add(word.slice(0, -2)); add(word.slice(0, -1)); if (/(.)\1ed$/.test(word)) add(word.slice(0, -3)); }
  if (word.endsWith("ing")) { add(word.slice(0, -3)); add(word.slice(0, -3) + "e"); if (/(.)\1ing$/.test(word)) add(word.slice(0, -4)); }
  if (word.endsWith("er") || word.endsWith("ly")) add(word.slice(0, -2));
  return forms;
}

async function enviMeaning(word: string): Promise<string | null> {
  const first = word[0] ?? "";
  const letter = first >= "a" && first <= "z" ? first : "_";
  const table = await shard<Record<string, string>>("envi", `e-${letter}.json`);
  return table?.[word] ?? null;
}

/** The Vietnamese meaning of an English word (or of its dictionary form). */
async function enviLookup(word: string): Promise<{ word: string; meaning: string } | null> {
  for (const form of baseForms(word.toLowerCase())) {
    let meaning = await enviMeaning(form);
    let found = form;
    if (meaning?.startsWith("→")) {
      // an inflected form (books, studied) points at its dictionary word
      const [base, rest] = meaning.slice(1).split("|");
      const baseMeaning = await enviMeaning(base);
      meaning = baseMeaning ?? rest ?? null;
      if (baseMeaning) found = base;
    }
    if (meaning) return { word: found, meaning };
  }
  return null;
}

/** English words whose meaning is a Vietnamese word or phrase, most common first. */
async function enviReverse(vietnamese: string): Promise<string[]> {
  const exactText = vietnamese.trim().toLowerCase();
  const folded = fold(exactText);
  if (!folded) return [];
  const letter = folded[0] >= "a" && folded[0] <= "z" ? folded[0] : "_";
  const table = await shard<Record<string, string[]>>("envi", `q-${letter}.json`);
  const result: string[] = [];
  for (const word of [...(table?.[exactText] ?? []), ...(table?.[folded] ?? [])]) if (!result.includes(word)) result.push(word);
  return result;
}

/** The first two meanings, cut at an explanation ("Cám ơn: biểu thị…") and kept short. */
const meaningParts = (meaning: string) => meaning.split("; ").slice(0, 2).map((part) => {
  const short = part.split(": ")[0].trim();
  return short.length > 80 ? `${short.slice(0, 77)}…` : short;
});

// ---------------------------------------------------------------- target-language shards
type Shard = { entries: Raw[]; keys: Map<string, Raw[]> };

const bucketFile = (char: string) => `h-${((char.codePointAt(0) ?? 0) % BUCKETS).toString(16).padStart(2, "0")}.json`;

function keysOf(lang: LangId, entry: Raw): string[] {
  if (lang === "zh") return [entry[0] as string, entry[1] as string].filter(Boolean);
  return [...(entry[0] as string).split("|"), ...(entry[1] as string).split("|")].filter(Boolean);
}

async function headShard(lang: LangId, char: string): Promise<Shard | null> {
  const id = lang as PackId;
  const file = bucketFile(char);
  const name = `${id}/${file}`;
  const known = builtShards.get(name);
  if (known) {
    builtShards.delete(name);
    builtShards.set(name, known);
    return known;
  }
  const entries = await record<Raw[]>(name);
  if (!entries) return null;
  const keys = new Map<string, Raw[]>();
  for (const entry of entries) for (const key of keysOf(lang, entry)) {
    const list = keys.get(key);
    if (!list) keys.set(key, [entry]);
    else if (list.length < 6) list.push(entry);
  }
  const built = { entries, keys };
  builtShards.set(name, built);
  if (builtShards.size > SHARD_CACHE_LIMIT) builtShards.delete(builtShards.keys().next().value as string);
  return built;
}

async function exact(lang: LangId, key: string): Promise<Raw[]> {
  const found = key ? await headShard(lang, key[0]) : null;
  return found?.keys.get(key) ?? [];
}

async function startingWith(lang: LangId, prefix: string, limit: number): Promise<Raw[]> {
  const found = prefix ? await headShard(lang, prefix[0]) : null;
  if (!found) return [];
  const result: Raw[] = [];
  for (const [key, list] of found.keys) {
    if (key.length > prefix.length && key.startsWith(prefix)) {
      for (const entry of list) if (!result.includes(entry)) result.push(entry);
    }
    if (result.length >= limit) break;
  }
  return result;
}

const plainPinyin = (text: string) => fold(text).replace(/[^a-z]/g, "");

/** Chinese typed as pinyin without tones. */
async function byPinyin(plain: string): Promise<Raw[]> {
  if (plain.length < 2) return [];
  const list = await shard<[string, string][]>("zh", `p-${plain[0]}.json`);
  if (!list) return [];
  const heads: string[] = [];
  for (const [key, head] of list) {
    if (key === plain && !heads.includes(head)) heads.push(head);
    if (heads.length >= 12) break;
  }
  const result: Raw[] = [];
  for (const head of heads) for (const entry of await exact("zh", head)) if (!result.includes(entry) && plainPinyin(entry[2] as string) === plain) result.push(entry);
  return result;
}

/** Entries whose meaning is an English term (used for Vietnamese → target searches). */
async function byEnglish(lang: LangId, term: string): Promise<Raw[]> {
  const letter = term[0] >= "a" && term[0] <= "z" ? term[0] : "_";
  const terms = await shard<Record<string, string[]>>(lang as PackId, `e-${letter}.json`);
  const heads = terms?.[term] ?? [];
  const result: Raw[] = [];
  for (const head of heads) for (const entry of (await exact(lang, head)).slice(0, 2)) if (!result.includes(entry)) result.push(entry);
  return result;
}

async function zhHit(entry: ZhEntry, vi: ViEntry[] | null, hanviet: Record<string, string> | null): Promise<DictHit> {
  return { head: entry[0], alt: entry[1] || undefined, reading: entry[2], hanviet: hanvietOf(entry[0], hanviet), english: entry[3], vietnamese: await vietnameseFor(entry[3], vi) };
}

async function jaHit(entry: JaEntry, vi: ViEntry[] | null, hanviet: Record<string, string> | null): Promise<DictHit> {
  const forms = entry[0].split("|").filter(Boolean);
  const readings = entry[1].split("|");
  return {
    head: forms[0] ?? readings[0], alt: forms.length ? readings[0] : undefined, reading: forms.length ? readings[0] : "",
    hanviet: hanvietOf(forms[0] ?? "", hanviet), english: entry[2], vietnamese: await vietnameseFor(entry[2], vi),
  };
}

// ---------------------------------------------------------------- lookups
/** Looks up text in the language being learned (Chinese / Japanese) and gives Vietnamese through English. */
async function fromTarget(lang: LangId, query: string): Promise<DictHit[]> {
  const [vi, hanviet] = await Promise.all([whole<ViEntry[]>("vi"), whole<Record<string, string>>("hanviet")]);
  const make = (entry: Raw) => lang === "zh" ? zhHit(entry as ZhEntry, vi, hanviet) : jaHit(entry as JaEntry, vi, hanviet);
  const found: Raw[] = [];
  const push = (entry: Raw) => { if (!found.includes(entry) && found.length < 14) found.push(entry); };

  // Japanese typed in romaji ("reizouko"): look the reading up as hiragana, then katakana.
  if (lang === "ja" && !hasCjk(query)) {
    const hiragana = romajiToHiragana(query);
    if (hiragana) {
      for (const form of [hiragana, hiraganaToKatakana(hiragana)]) (await exact(lang, form)).forEach(push);
      if (found.length < 8) for (const form of [hiragana, hiraganaToKatakana(hiragana)]) (await startingWith(lang, form, 12)).forEach(push);
      return Promise.all(found.map(make));
    }
  }
  (await exact(lang, query)).forEach(push);
  if (found.length === 0 && query.length > 1 && hasCjk(query)) {
    // A phrase or sentence: take the longest known word at each point.
    let at = 0;
    while (at < query.length && found.length < 14) {
      let matched = 0;
      for (let end = Math.min(query.length, at + 8); end > at; end--) {
        const entries = await exact(lang, query.slice(at, end));
        if (entries.length) { push(entries[0]); matched = end - at; break; }
      }
      at += matched || 1;
    }
  }
  if (found.length < 8 && hasCjk(query)) (await startingWith(lang, query, 12)).forEach(push);
  else if (found.length < 8 && lang === "zh") (await byPinyin(plainPinyin(query))).forEach(push);
  return Promise.all(found.map(make));
}

/** Looks up a Vietnamese word (with or without diacritics) and finds words with the same meaning. */
async function fromVietnamese(lang: LangId, query: string): Promise<DictHit[]> {
  const vi = await whole<ViEntry[]>("vi");
  const wanted = query.trim();
  const folded = fold(wanted);

  // English words with this Vietnamese meaning: the Wiktionary index first, the small word list as a fallback.
  const english: string[] = await enviReverse(wanted);
  if (vi) {
    const byFold = vietnameseByFold(vi);
    const matches = [...(byFold.get(folded) ?? [])];
    if (!matches.length && folded.length >= 2) {
      for (const [key, positions] of byFold) {
        if (key.startsWith(folded)) positions.forEach((position) => matches.length < 6 && matches.push(position));
        if (matches.length >= 6) break;
      }
    }
    matches.sort((a, b) => Number(vi[b][0].toLowerCase() === wanted.toLowerCase()) - Number(vi[a][0].toLowerCase() === wanted.toLowerCase()));
    for (const position of matches.slice(0, 5)) for (const term of englishTerms(vi[position][1], 3)) if (!english.includes(term)) english.push(term);
  }

  const hits: DictHit[] = [];
  if (lang === "en") {
    for (const word of english.slice(0, 8)) {
      const meaning = await enviMeaning(word);
      hits.push({ head: word, reading: "", hanviet: "", english: "", vietnamese: meaning ? meaningParts(meaning) : [wanted] });
    }
    return hits;
  }
  const hanviet = await whole<Record<string, string>>("hanviet");
  const seen = new Set<string>();
  for (const term of english.slice(0, 8)) {
    for (const entry of await byEnglish(lang, term)) {
      const hit = lang === "zh" ? await zhHit(entry as ZhEntry, vi, hanviet) : await jaHit(entry as JaEntry, vi, hanviet);
      const key = `${hit.head}|${hit.reading}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push(hit);
      if (hits.length >= 14) return hits;
    }
  }
  return hits;
}

/** English word → Vietnamese (English is the language being learned). */
async function fromEnglish(query: string): Promise<DictHit[]> {
  const vi = await whole<ViEntry[]>("vi");
  const words = query.toLowerCase().replace(/[^a-z' -]/g, " ").trim().split(/\s+/).filter(Boolean);
  const hits: DictHit[] = [];
  const seen = new Set<string>();
  // a phrase that is in the dictionary ("good morning") is shown alone; otherwise word by word
  const phrase = words.length > 1 ? await enviLookup(words.join(" ")) : null;
  if (phrase) return [{ head: phrase.word, reading: "", hanviet: "", english: "", vietnamese: meaningParts(phrase.meaning) }];
  if (words.length > 1 && vi) {
    const positions = vietnameseByEnglish(vi).get(words.join(" ")) ?? [];
    if (positions.length) return [{ head: words.join(" "), reading: "", hanviet: "", english: "", vietnamese: [...new Set(positions.map((position) => vi[position][0]))].slice(0, 4) }];
  }
  const terms = words;
  for (const term of terms) {
    const found = await enviLookup(term.replace(/^to /, ""));
    if (found && !seen.has(found.word)) {
      seen.add(found.word);
      hits.push({ head: found.word, reading: "", hanviet: "", english: "", vietnamese: meaningParts(found.meaning) });
      continue;
    }
    if (found || !vi) continue;
    const positions = vietnameseByEnglish(vi).get(term) ?? [];
    if (positions.length && !seen.has(term)) {
      seen.add(term);
      hits.push({ head: term, reading: "", hanviet: "", english: "", vietnamese: [...new Set(positions.map((position) => vi[position][0]))].slice(0, 6) });
    }
  }
  return hits;
}

function summaryFrom(hits: DictHit[], output: "target" | "vi"): string {
  if (output === "vi") return [...new Set(hits.flatMap((hit) => hit.vietnamese))].slice(0, 4).join("; ");
  return [...new Set(hits.map((hit) => hit.head))].slice(0, 3).join("; ");
}

/** Translates `query` typed in one box; `summary` is the text for the other box. */
export async function lookup(lang: LangId, side: "target" | "vi", query: string): Promise<Lookup> {
  const text = query.trim();
  if (!text) return { hits: [], summary: "" };
  const hits = side === "target"
    ? (lang === "en" ? await fromEnglish(text) : await fromTarget(lang, text))
    : await fromVietnamese(lang, text);
  return { hits, summary: summaryFrom(hits, side === "target" ? "vi" : "target") };
}
