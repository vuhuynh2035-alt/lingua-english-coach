"""Builds the offline dictionaries in public/dict/ from open data.

Sources (download them first and pass the folder as the first argument):
  cedict_ts.u8          CC-CEDICT (CC BY-SA 4.0)               https://www.mdbg.net/chinese/dictionary?page=cc-cedict
  JMdict_e.gz           JMdict, EDRDG (CC BY-SA 4.0)            https://www.edrdg.org/jmdict/j_jmdict.html
  vi.jsonl              Vietnamese entries of Wiktionary        https://kaikki.org/dictionary/Vietnamese/ (CC BY-SA 4.0)
  unihan/Unihan_Readings.txt   Unicode Unihan (Sino-Vietnamese)  https://www.unicode.org/charts/unihan.html

Output (compact JSON arrays, loaded into IndexedDB by the app):
  zh.json       [simplified, traditional or "", pinyin with tone marks, "gloss; gloss"]
  ja.json       common words only: [kanji forms "a|b" or "", readings "x|y", "gloss; gloss", 1]
  ja-full.json  every JMdict entry, same layout (optional extra download)
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
    dump("zh.json", entries)


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
    # The basic pack holds the common words (JMdict priority marks); the full pack is an optional extra download.
    dump("ja.json", [e for e in entries if e[3]])
    dump("ja-full.json", entries)


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
