"""Adds `dialogue` (line by line, with a Vietnamese translation) to the English course packs.

The tap-a-sentence helper in the lesson screen reads it. The lines come from each lesson's `reading`:
 - a conversation (two or more speakers, like the app's parseDialogue): one line per speaker turn;
 - any other text: one line per sentence.
The Vietnamese lines live in vi/vi_<course>.py as VI = {lesson_id: [one translation per line]}.

Run on its own:   python scripts/curriculum/en/apply_dialogue.py          (all packs, rewrites the JSON)
                  python scripts/curriculum/en/apply_dialogue.py --list nails   (print the lines to translate)
new_courses.py calls add_dialogue() too, so regenerating nails/facial/garment keeps the dialogue.
"""
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CURRICULUM_VERSION = "2.3.0"  # must equal CURRICULUM_VERSIONS.en in src/lib/course-library.ts
VI_DIR = Path(__file__).resolve().parent / "vi"
SPEAKER = re.compile(r"^([^\s:：][^:：\d]{0,24}?)\s*[:：]\s*(.+)$")
# a sentence ends at . ! ? followed by a space and a capital letter or quote
LABEL = re.compile(r"^[^:：]{1,30}[:：]\s*")
TITLE = re.compile(r"\b(Mr|Mrs|Ms|Dr)\.$")
SENTENCE = re.compile(r"(?<=[.!?])\s+(?=[A-Z\"'“])")


def lines_of(reading):
    """[(speaker, text)] for a lesson reading, the same split the app does for conversations."""
    turns, speakers = [], set()
    for raw in re.split(r"\n+", reading):
        line = raw.strip()
        if not line:
            continue
        match = SPEAKER.match(line)
        if match:
            speakers.add(match.group(1).strip())
            turns.append((match.group(1).strip(), match.group(2).strip()))
        elif turns:
            turns.append(("", line))
    if len(speakers) >= 2:
        return turns
    sentences = []
    for raw in re.split(r"\n+", reading):
        for part in (piece.strip() for piece in SENTENCE.split(raw.strip())):
            if not part:
                continue
            if sentences and TITLE.search(sentences[-1]):
                sentences[-1] += " " + part  # "Ms. Lee": a title does not end a sentence
            else:
                sentences.append(part)
    return [("", sentence) for sentence in sentences]


def load_vi():
    table = {}
    for path in sorted(VI_DIR.glob("vi_*.py")):
        spec = importlib.util.spec_from_file_location(path.stem, path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        for lesson_id, items in module.VI.items():
            assert lesson_id not in table, f"duplicate translations for {lesson_id}"
            table[lesson_id] = items
    return table


def add_dialogue(pack, table=None, strict=True):
    """Sets lesson['dialogue'] on every lesson of the pack; returns the ids that have no translation yet."""
    table = load_vi() if table is None else table
    missing = []
    for lesson in pack["lessons"]:
        units = lines_of(lesson["reading"])
        translations = table.get(lesson["id"])
        if translations is None:
            missing.append(lesson["id"])
            continue
        assert len(translations) == len(units), f"{lesson['id']}: {len(units)} lines but {len(translations)} translations"
        dialogue = []
        for (speaker, text), vi in zip(units, translations):
            if speaker:
                # the screen shows the speaker's name next to the line, so the translation drops its own label
                vi = LABEL.sub("", vi, count=1)
            entry = {"text": text, "translation": vi}
            if speaker:
                entry = {"speaker": speaker, **entry}
            dialogue.append(entry)
        # keep the key order stable: dialogue sits right after `reading`
        rebuilt = {}
        for key, value in lesson.items():
            if key == "dialogue":
                continue
            rebuilt[key] = value
            if key == "reading":
                rebuilt["dialogue"] = dialogue
        lesson.clear()
        lesson.update(rebuilt)
    if strict and missing:
        raise SystemExit(f"no translation yet for: {', '.join(missing)}")
    return missing


def main():
    if len(sys.argv) >= 3 and sys.argv[1] == "--list":
        pack = json.loads((ROOT / "public" / "courses" / "en" / f"{sys.argv[2]}.json").read_text(encoding="utf-8"))
        for lesson in pack["lessons"]:
            if len(sys.argv) >= 4 and lesson["id"] not in sys.argv[3].split(","):
                continue
            print(f"## {lesson['id']} | {lesson['title']}")
            for index, (speaker, text) in enumerate(lines_of(lesson["reading"]), 1):
                print(f"{index}. {speaker + ': ' if speaker else ''}{text}")
        return
    table = load_vi()
    for path in sorted((ROOT / "public" / "courses" / "en").glob("*.json")):
        pack = json.loads(path.read_text(encoding="utf-8"))
        missing = add_dialogue(pack, table, strict=False)
        pack["version"] = CURRICULUM_VERSION
        path.write_text(json.dumps(pack, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(path.stem, len(pack["lessons"]), "lessons,", "missing:" if missing else "complete", ", ".join(missing))


if __name__ == "__main__":
    main()
