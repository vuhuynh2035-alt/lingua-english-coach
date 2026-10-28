"""Builds public/courses/<id>.json from the authored lesson modules in this folder.

Each lesson is authored with 5+ hand-written questions; vocabulary questions are added
until the quiz has exactly 10, so every lesson is passed with 8/10.

Run: python scripts/curriculum/build.py
"""
import importlib
import json
import os
import random
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "public", "courses")
COURSES = ["everyday", "business", "travel", "technology", "healthcare", "finance", "refrigeration"]
QUIZ_SIZE = 10
LEVELS = ["A1", "A2", "B1", "B2"]

REFERENCES = [
    {
        "title": "Council of Europe – Common European Framework of Reference for Languages (CEFR)",
        "url": "https://www.coe.int/en/web/common-european-framework-reference-languages",
        "license": "Khung trình độ tham chiếu (chỉ dùng làm chuẩn phân cấp, không sao chép nội dung)",
    },
    {
        "title": "British Council / EAQUALS – Core Inventory for General English",
        "url": "https://www.teachingenglish.org.uk/article/british-council-eaquals-core-inventory-general-english",
        "license": "Tham khảo danh mục chức năng, ngữ pháp, chủ đề theo level (không sao chép nội dung)",
    },
]


def L(level, category, title, objective, reading, vocab, grammar, pron, qs, speak):
    return {
        "level": level, "category": category, "title": title, "objective": objective,
        "reading": reading.strip(), "vocab": vocab, "grammar": grammar, "pron": pron,
        "qs": qs, "speak": speak,
    }


def blank(example, term):
    pattern = re.compile(re.escape(term), re.IGNORECASE)
    if not pattern.search(example):
        return None
    return pattern.sub("_____", example, count=1)


def vocab_questions(lesson, rng, needed):
    """Gap-fill and meaning questions from the lesson vocabulary, alternating kinds."""
    vocab = lesson["vocab"]
    gaps, meanings = [], []
    for index, (term, meaning, example) in enumerate(vocab):
        # Distractors of similar length, so the answer can't be spotted by its shape.
        others = sorted(
            (v for i, v in enumerate(vocab) if i != index),
            key=lambda v: (abs(len(v[0].split()) - len(term.split())), rng.random()),
        )[:2]
        sentence = blank(example, term)
        if sentence:
            options = [term] + [o[0] for o in others]
            gaps.append(("Complete the sentence: " + sentence, options, term,
                         f"“{term}” nghĩa là “{meaning}”. Câu đầy đủ: {example}"))
        options = [meaning] + [o[1] for o in others]
        meanings.append((f"What does “{term}” mean?", options, meaning,
                         f"“{term}” = {meaning}. Ví dụ: {example}"))
    rng.shuffle(gaps)
    rng.shuffle(meanings)
    picked = []
    while len(picked) < needed and (gaps or meanings):
        for pool in (gaps, meanings):
            if pool and len(picked) < needed:
                picked.append(pool.pop())
    out = []
    for prompt, options, correct, explanation in picked:
        options = options[:]
        rng.shuffle(options)
        out.append({"prompt": prompt, "options": options, "answer": options.index(correct), "explanation": explanation})
    return out


def build_course(course_id):
    module = importlib.import_module(course_id)
    rng = random.Random(course_id)
    lessons = []
    counters = {level: 0 for level in LEVELS}
    for raw in module.LESSONS:
        level = raw["level"]
        counters[level] += 1
        lesson_id = f"{course_id}-{level.lower()}-{counters[level]}"
        questions = [
            {"prompt": p, "options": o, "answer": a, "explanation": e} for (p, o, a, e) in raw["qs"]
        ]
        for q in questions:
            if not 0 <= q["answer"] < len(q["options"]):
                raise ValueError(f"{lesson_id}: bad answer index in “{q['prompt']}”")
            # Authors tend to put the right answer in the same slot; shuffle it away.
            correct = q["options"][q["answer"]]
            rng.shuffle(q["options"])
            q["answer"] = q["options"].index(correct)
        questions += vocab_questions(raw, rng, QUIZ_SIZE - len(questions))
        if len(questions) != QUIZ_SIZE:
            raise ValueError(f"{lesson_id}: has {len(questions)} questions, needs {QUIZ_SIZE}")
        g_title, g_expl, g_examples = raw["grammar"]
        p_focus, p_tip, p_words = raw["pron"]
        lessons.append({
            "id": lesson_id,
            "level": level,
            "unit": f"{level} · Bài {counters[level]}",
            "category": raw["category"],
            "title": raw["title"],
            "objective": raw["objective"],
            "reading": raw["reading"],
            "vocabulary": [{"term": t, "definition": d, "example": x} for (t, d, x) in raw["vocab"]],
            "grammar": {"title": g_title, "explanation": g_expl, "examples": g_examples},
            "pronunciation": {"focus": p_focus, "tip": p_tip, "words": p_words},
            "speakingTasks": raw["speak"],
            "questions": questions,
            "audioIds": [],
        })
    lessons.sort(key=lambda item: LEVELS.index(item["level"]))
    return {
        "id": course_id,
        "title": module.TITLE,
        "version": "2.0.0",
        "framework": "CEFR A1–B2",
        "overview": module.OVERVIEW,
        "contentLicense": "Nội dung biên soạn riêng cho Teacher AI theo khung CEFR",
        "references": REFERENCES,
        "lessons": lessons,
        "audio": [],
    }


def main():
    sys.path.insert(0, HERE)
    os.makedirs(OUT, exist_ok=True)
    wanted = sys.argv[1:] or COURSES
    for course_id in wanted:
        course = build_course(course_id)
        with open(os.path.join(OUT, f"{course_id}.json"), "w", encoding="utf-8") as handle:
            json.dump(course, handle, ensure_ascii=False, indent=1)
        print(f"{course_id}: {len(course['lessons'])} lessons, {sum(len(l['questions']) for l in course['lessons'])} questions")


if __name__ == "__main__":
    main()
