"""Builds the offline dictionaries in public/dict/ from open data.

Sources (download them first and pass the folder as the first argument):
  cedict_ts.u8          CC-CEDICT (CC BY-SA 4.0)               https://www.mdbg.net/chinese/dictionary?page=cc-cedict
  JMdict_e.gz           JMdict, EDRDG (CC BY-SA 4.0)            https://www.edrdg.org/jmdict/j_jmdict.html
  vi.jsonl              Vietnamese entries of Wiktionary        https://kaikki.org/dictionary/Vietnamese/ (CC BY-SA 4.0)
  unihan/Unihan_Readings.txt   Unicode Unihan (Sino-Vietnamese)  https://www.unicode.org/charts/unihan.html

Output (compact JSON arrays, loaded into IndexedDB by the app):
  zh.json       [simplified, traditional or "", pinyin with tone marks, "gloss; gloss"]
  ja/           common JMdict words, sharded: [kanji forms "a|b" or "", readings "x|y", "gloss; gloss", 1]
  vi.json       [vietnamese word, "english gloss; gloss"]   (bridge: Vietnamese <-> English)
  hanviet.json  {char: "reading/reading"}

Usage: python scripts/dict/build_dict.py <source folder>
"""
import gzip
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "dict")
os.makedirs(OUT, exist_ok=True)


def dump(name, data):
    path = os.path.join(OUT, name)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(data, handle, ensure_ascii=False, separators=(",", ":"))
    print(f"{name}: {len(data)} entries, {os.path.getsize(path) / 1e6:.1f} MB")


# ---------------------------------------------------------------- shards
# The big packs are cut into small files so the app only loads what a search needs:
#   h-XX.json  entries whose headword / reading starts with a character in bucket XX
#   p-a.json   (Chinese) plain pinyin -> simplified headwords, per first letter
#   e-a.json   English meaning word -> headwords, per first letter (for Vietnamese -> target searches)
#   index.json list of the files, read by the downloader
BUCKETS = 128


def bucket(char):
    return ord(char) % BUCKETS


def english_terms(gloss, limit=6):
    """Same normalisation as englishTerms() in src/lib/dictionary.ts."""
    terms = []
    for part in re.split(r"[;,]", gloss):
        term = re.sub(r"\([^)]*\)", "", part)
        term = re.sub(r"^\s*(to|a|an|the)\s+", "", term, flags=re.I).strip().lower()
        if term and len(term) <= 40 and term not in terms:
            terms.append(term)
        if len(terms) >= limit:
            break
    return terms


def write_shards(folder, entries, keys_of, head_of, gloss_of, priority_of=None, pinyin_of=None):
    base = os.path.join(OUT, folder)
    os.makedirs(base, exist_ok=True)
    for old in os.listdir(base):
        os.remove(os.path.join(base, old))
    files = []

    def write(name, data):
        path = os.path.join(base, name)
        with open(path, "w", encoding="utf-8", newline="\n") as handle:
            json.dump(data, handle, ensure_ascii=False, separators=(",", ":"))
        files.append(name)

    heads = {}
    for entry in entries:
        for b in {bucket(k[0]) for k in keys_of(entry) if k}:
            heads.setdefault(b, []).append(entry)
    for b, items in heads.items():
        write("h-%02x.json" % b, items)

    english = {}
    order = sorted(range(len(entries)), key=lambda i: -(priority_of(entries[i]) if priority_of else 0))
    for i in order:
        entry = entries[i]
        for term in english_terms(gloss_of(entry), 2):
            if len(term) < 2 or len(term) > 24:
                continue
            bucket_letter = term[0] if "a" <= term[0] <= "z" else "_"
            heads_for_term = english.setdefault(bucket_letter, {}).setdefault(term, [])
            if len(heads_for_term) < 4 and head_of(entry) not in heads_for_term:
                heads_for_term.append(head_of(entry))
    for letter, terms in english.items():
        write("e-%s.json" % ("_" if letter == "_" else letter), terms)

    if pinyin_of:
        plain = {}
        for entry in entries:
            key = pinyin_of(entry)
            if key:
                plain.setdefault(key[0], []).append([key, head_of(entry)])
        for letter, items in plain.items():
            write("p-%s.json" % letter, items)

    write("index.json", {"version": 1, "files": sorted(files)})
    total = sum(os.path.getsize(os.path.join(base, name)) for name in files)
    print(f"{folder}/: {len(files)} files, {total / 1e6:.1f} MB")


def plain_pinyin_key(text):
    import unicodedata
    folded = unicodedata.normalize("NFD", text.lower())
    return re.sub(r"[^a-z]", "", "".join(c for c in folded if not unicodedata.combining(c)))


# ---------------------------------------------------------------- Chinese
TONES = {"a": "āáǎàa", "e": "ēéěèe", "i": "īíǐìi", "o": "ōóǒòo", "u": "ūúǔùu", "ü": "ǖǘǚǜü"}


def pinyin_syllable(match):
    syllable, tone = match.group(1).replace("u:", "ü").replace("v", "ü"), int(match.group(2))
    if tone == 5:
        return syllable
    lower = syllable.lower()
    target = None
    if "a" in lower:
        target = lower.index("a")
    elif "e" in lower:
        target = lower.index("e")
    elif "ou" in lower:
        target = lower.index("o")
    else:
        for index in range(len(lower) - 1, -1, -1):
            if lower[index] in TONES:
                target = index
                break
    if target is None:
        return syllable
    mark = TONES[lower[target]][tone - 1]
    if syllable[target].isupper():
        mark = mark.upper()
    return syllable[:target] + mark + syllable[target + 1:]


def pinyin(numeric):
    return re.sub(r"([A-Za-zü:]+?)([1-5])(?![0-9])", pinyin_syllable, numeric)


def build_zh():
    entries = []
    line_re = re.compile(r"^(\S+) (\S+) \[([^\]]*)\] /(.*)/\s*$")
    with open(os.path.join(SRC, "cedict_ts.u8"), encoding="utf-8") as handle:
        for line in handle:
            if line.startswith("#"):
                continue
            match = line_re.match(line)
            if not match:
                continue
            traditional, simplified, reading, glosses = match.groups()
            parts = [g.strip() for g in glosses.split("/") if g.strip() and not g.startswith("CL:")]
            if not parts:
                continue
            entries.append([simplified, traditional if traditional != simplified else "", pinyin(reading), "; ".join(parts[:4])[:160]])
    if os.path.exists(os.path.join(OUT, "zh.json")):
        os.remove(os.path.join(OUT, "zh.json"))
    write_shards("zh", entries, lambda e: [e[0], e[1]], lambda e: e[0], lambda e: e[3],
                 pinyin_of=lambda e: plain_pinyin_key(e[2]))


# ---------------------------------------------------------------- Japanese
def build_ja():
    raw = gzip.open(os.path.join(SRC, "JMdict_e.gz"), "rt", encoding="utf-8").read()
    raw = re.sub(r"<!DOCTYPE.*?\]>", "", raw, flags=re.S)
    raw = re.sub(r"&(?!(?:amp|lt|gt|quot|apos);)[A-Za-z0-9-]+;", "", raw)
    root = ET.fromstring(raw.encode("utf-8"))
    entries = []
    for entry in root.iter("entry"):
        kanji = [k.findtext("keb") for k in entry.findall("k_ele")]
        readings = [r.findtext("reb") for r in entry.findall("r_ele")]
        common = int(any(e.findall("ke_pri") or e.findall("re_pri") for e in list(entry.findall("k_ele")) + list(entry.findall("r_ele"))))
        senses = []
        for sense in entry.findall("sense")[:3]:
            glosses = [g.text for g in sense.findall("gloss") if g.text][:3]
            if glosses:
                senses.append(", ".join(glosses))
        if not senses or not readings:
            continue
        entries.append(["|".join(kanji[:3]), "|".join(readings[:3]), "; ".join(senses)[:170], common])
    # Only the common words (JMdict priority marks): enough for JLPT N5-N2 and light to load.
    common = [e for e in entries if e[3]]
    import shutil
    for old in ("ja.json", "ja-full.json"):
        if os.path.exists(os.path.join(OUT, old)):
            os.remove(os.path.join(OUT, old))
    shutil.rmtree(os.path.join(OUT, "ja-full"), ignore_errors=True)
    write_shards("ja", common,
                 lambda e: [form for form in e[0].split("|") if form] + [reading for reading in e[1].split("|") if reading],
                 lambda e: (e[0].split("|")[0] or e[1].split("|")[0]), lambda e: e[2])


# ---------------------------------------------------------------- Vietnamese <-> English bridge
SKIP_POS = {"character", "romanization", "name", "punct", "symbol"}
SKIP_GLOSS = re.compile(r"form of|variant of|alternative|abbreviation of|obsolete spelling|misspelling|surname|\bnôm\b", re.I)


def build_vi():
    entries = []
    seen = set()
    with open(os.path.join(SRC, "vi.jsonl"), encoding="utf-8") as handle:
        for line in handle:
            data = json.loads(line)
            if data.get("pos") in SKIP_POS:
                continue
            word = data.get("word", "")
            if not word or len(word) > 40 or re.search(r"[　-鿿]", word):
                continue
            glosses = []
            for sense in data.get("senses", [])[:4]:
                for gloss in sense.get("glosses", [])[:1]:
                    if gloss and not SKIP_GLOSS.search(gloss) and len(gloss) <= 90:
                        glosses.append(gloss.strip())
            if not glosses:
                continue
            key = (word, tuple(glosses))
            if key in seen:
                continue
            seen.add(key)
            entries.append([word, "; ".join(glosses)[:170]])
    dump("vi.json", entries)


# ---------------------------------------------------------------- Sino-Vietnamese readings
def build_hanviet():
    result = {}
    with open(os.path.join(SRC, "unihan", "Unihan_Readings.txt"), encoding="utf-8") as handle:
        for line in handle:
            if "\tkVietnamese\t" not in line:
                continue
            code, _field, value = line.rstrip("\n").split("\t")
            result[chr(int(code[2:], 16))] = "/".join(value.split())
    dump("hanviet.json", result)


if __name__ == "__main__":
    build_zh()
    build_ja()
    build_vi()
    build_hanviet()
