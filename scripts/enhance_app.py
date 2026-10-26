import os

page_path = os.path.join(os.path.dirname(__file__), "..", "src", "app", "page.tsx")

with open(page_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
old_import_grammar = 'import { grammarTopics } from "@/lib/grammar";'
new_import_grammar = 'import { GrammarQuestion, GrammarTopic, grammarTopics } from "@/lib/grammar";'
assert old_import_grammar in content, "old_import_grammar not found"
content = content.replace(old_import_grammar, new_import_grammar)

old_import_course = 'import {\n  CoursePackage,\n  StoredCourse,'
new_import_course = 'import {\n  CourseLesson,\n  CoursePackage,\n  StoredCourse,'
if old_import_course not in content:
    # try CRLF
    old_import_course = 'import {\r\n  CoursePackage,\r\n  StoredCourse,'
    new_import_course = 'import {\r\n  CourseLesson,\r\n  CoursePackage,\r\n  StoredCourse,'
assert old_import_course in content, "old_import_course not found"
content = content.replace(old_import_course, new_import_course)

# 2. Add state for flexible pronunciation phrase
old_state = '  const [pronunciation, setPronunciation] = useState<PronunciationResult | null>(null);'
new_state = '''  const [pronunciation, setPronunciation] = useState<PronunciationResult | null>(null);
  const [targetPronunciationPhrase, setTargetPronunciationPhrase] = useState<string>("");
  const [customPhraseInput, setCustomPhraseInput] = useState<string>("");'''
assert old_state in content, "old_state not found"
content = content.replace(old_state, new_state)

# 3. Add playNativeSpeech helper function and update playSpeech
old_play_speech = '''  async function playSpeech(text: string) {
    const phrase = text.trim();
    if (!phrase || speechBusy) return;
    if (phrase.length > 4000) {
      setSpeechError("Đoạn nghe quá dài. Hãy chọn một đoạn ngắn hơn (tối đa 4.000 ký tự).");
      return;
    }

    speechAudioRef.current?.pause();
    speechAudioRef.current = null;
    if (speechObjectUrlRef.current) {
      URL.revokeObjectURL(speechObjectUrlRef.current);
      speechObjectUrlRef.current = null;
    }
    setSpeechBusy(true);
    setSpeechError("");
    setSpeechNotice("");
    let blob: Blob | null = null;
    let storageWarning = "";
    const speechCacheKey = `${aiProvider}:${activeModel}:${activeSpeechVoice}:${activeSpeechAccent}:${speechDeliveryStyle}`;
    try {
      try {
        blob = await getCachedSpeech(speechCacheKey, phrase);
      } catch (error) {
        storageWarning = error instanceof Error
          ? `Không đọc được bộ nhớ âm thanh trên thiết bị: ${error.message}`
          : "Không đọc được bộ nhớ âm thanh trên thiết bị.";
      }
      if (!blob) {
        if (!apiKey) {
          throw new Error(`Chưa có bản nghe lưu trên máy. Thêm API key ${aiProvider === "google" ? "Google AI" : "OpenAI"} trong Cài đặt để tạo giọng đọc.`);
        }
        blob = await withAvailableApiKey((key) =>
          generateProviderSpeech(aiProvider, key, activeModel, activeSpeechVoice, phrase, activeSpeechAccent, speechDeliveryStyle));
        try {
          await saveCachedSpeech(speechCacheKey, phrase, blob);
        } catch (error) {
          storageWarning = error instanceof Error
            ? `Đã tạo được âm thanh nhưng không lưu offline: ${error.message}`
            : "Đã tạo được âm thanh nhưng không lưu offline.";
        }
      }

      const objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(objectUrl);
      speechAudioRef.current = audio;
      speechObjectUrlRef.current = objectUrl;
      audio.onended = () => {
        if (speechAudioRef.current === audio) {
          speechAudioRef.current = null;
          speechObjectUrlRef.current = null;
          URL.revokeObjectURL(objectUrl);
        }
      };
      void audio.play().catch((error: unknown) => {
        if (speechAudioRef.current === audio) {
          speechAudioRef.current = null;
          speechObjectUrlRef.current = null;
          URL.revokeObjectURL(objectUrl);
        }
        setSpeechNotice("");
        setSpeechError(error instanceof Error
          ? `Trình duyệt không phát được âm thanh: ${error.message}`
          : "Trình duyệt không phát được âm thanh. Hãy thử nhấn nghe lại.");
      });
      setSpeechError(storageWarning);
      setSpeechNotice(storageWarning ? "" : "Âm thanh đã được lưu trên thiết bị để nghe lại khi ngoại tuyến.");
    } catch (error) {
      setSpeechError(error instanceof Error ? error.message : "Không thể phát giọng đọc. Vui lòng thử lại.");
    } finally {
      setSpeechBusy(false);
    }
  }'''

new_play_speech = '''  function playNativeSpeech(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.92;
      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Daniel") || v.name.includes("US") || v.name.includes("UK"))) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (englishVoice) utterance.voice = englishVoice;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  async function playSpeech(text: string) {
    const phrase = text.trim();
    if (!phrase || speechBusy) return;
    if (phrase.length > 4000) {
      setSpeechError("Đoạn nghe quá dài. Hãy chọn một đoạn ngắn hơn (tối đa 4.000 ký tự).");
      return;
    }

    speechAudioRef.current?.pause();
    speechAudioRef.current = null;
    if (speechObjectUrlRef.current) {
      URL.revokeObjectURL(speechObjectUrlRef.current);
      speechObjectUrlRef.current = null;
    }
    setSpeechBusy(true);
    setSpeechError("");
    setSpeechNotice("");
    let blob: Blob | null = null;
    let storageWarning = "";
    const speechCacheKey = `${aiProvider}:${activeModel}:${activeSpeechVoice}:${activeSpeechAccent}:${speechDeliveryStyle}`;
    try {
      try {
        blob = await getCachedSpeech(speechCacheKey, phrase);
      } catch (error) {
        storageWarning = error instanceof Error
          ? `Không đọc được bộ nhớ âm thanh trên thiết bị: ${error.message}`
          : "Không đọc được bộ nhớ âm thanh trên thiết bị.";
      }
      if (!blob) {
        if (!apiKey) {
          await playNativeSpeech(phrase);
          setSpeechNotice("Đang phát bằng giọng đọc có sẵn trên thiết bị (hoạt động ngoại tuyến).");
          return;
        }
        try {
          blob = await withAvailableApiKey((key) =>
            generateProviderSpeech(aiProvider, key, activeModel, activeSpeechVoice, phrase, activeSpeechAccent, speechDeliveryStyle));
          try {
            await saveCachedSpeech(speechCacheKey, phrase, blob);
          } catch (error) {
            storageWarning = error instanceof Error
              ? `Đã tạo được âm thanh nhưng không lưu offline: ${error.message}`
              : "Đã tạo được âm thanh nhưng không lưu offline.";
          }
        } catch {
          await playNativeSpeech(phrase);
          setSpeechNotice("Dịch vụ giọng đọc trực tuyến bận, đã chuyển sang giọng đọc thiết bị.");
          return;
        }
      }

      const objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(objectUrl);
      speechAudioRef.current = audio;
      speechObjectUrlRef.current = objectUrl;
      audio.onended = () => {
        if (speechAudioRef.current === audio) {
          speechAudioRef.current = null;
          speechObjectUrlRef.current = null;
          URL.revokeObjectURL(objectUrl);
        }
      };
      void audio.play().catch(async () => {
        if (speechAudioRef.current === audio) {
          speechAudioRef.current = null;
          speechObjectUrlRef.current = null;
          URL.revokeObjectURL(objectUrl);
        }
        await playNativeSpeech(phrase);
        setSpeechNotice("Đang phát bằng giọng đọc có sẵn trên thiết bị.");
      });
      setSpeechError(storageWarning);
      setSpeechNotice(storageWarning ? "" : "Âm thanh đã được lưu trên thiết bị để nghe lại khi ngoại tuyến.");
    } catch (error) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        await playNativeSpeech(phrase);
        setSpeechNotice("Đang phát bằng giọng đọc có sẵn trên thiết bị.");
      } else {
        setSpeechError(error instanceof Error ? error.message : "Không thể phát giọng đọc. Vui lòng thử lại.");
      }
    } finally {
      setSpeechBusy(false);
    }
  }'''

# Normalize newlines for replacement matching
content_normalized = content.replace("\r\n", "\n")
old_play_speech_norm = old_play_speech.replace("\r\n", "\n")
assert old_play_speech_norm in content_normalized, "old_play_speech not found in content"
content_normalized = content_normalized.replace(old_play_speech_norm, new_play_speech)

# 4. Enhance system prompt in sendMessage
old_system_prompt = '''      const systemPrompt = `You are Maya, a warm, patient, interactive English tutor for a Vietnamese learner. The learner selected "${profile.title}" and is estimated at CEFR ${progress.level}. Teach at their level, adapt based on their answers, explain mistakes kindly, and ask one focused follow-up question at a time. Keep lesson material, exercises, examples, and quiz questions in English only; do not place Vietnamese translations beside them. If they ask in Vietnamese or explicitly request an explanation in Vietnamese, explain briefly in Vietnamese, then continue English practice. Never claim to measure pronunciation from text. Keep each answer under 120 words unless they ask for a detailed explanation.`;'''

new_system_prompt = '''      const systemPrompt = `You are Maya, a warm, patient, and motivating English tutor for a Vietnamese learner.
Learner profile: "${profile.title}", CEFR level: ${progress.level}.

Your teaching principles:
1. ADAPTIVE LEVEL: Teach and converse at CEFR ${progress.level}. Use clear, natural sentences.
2. SANDWICH FEEDBACK: When the learner speaks or writes in English:
   - First, warmly acknowledge their message or praise their effort.
   - If they made a grammar error, spelling mistake, or awkward literal translation from Vietnamese ("Vietlish"), gently point it out, provide the natural English alternative, and briefly explain why in Vietnamese.
   - Keep the practice going by asking ONE focused, engaging follow-up question.
3. IN-LESSON & GRAMMAR ASSISTANCE:
   - When the learner asks about a lesson, quiz question, vocabulary word, or grammar rule, explain the concept clearly and concisely in Vietnamese with practical examples, then prompt them to try using it in an English sentence.
4. LANGUAGE BALANCE:
   - For explanations and feedback, use Vietnamese when helpful. For roleplay dialogues and practice, keep conversations in English.
   - Keep responses under 130 words unless detailed explanation is asked. Never claim to measure pronunciation from text alone.`;'''

assert old_system_prompt in content_normalized, "old_system_prompt not found"
content_normalized = content_normalized.replace(old_system_prompt, new_system_prompt)

# 5. Enhance startPronunciationRecording
old_pronounce_prompt = '''          const response = await withAvailableApiKey((key) => generateGeminiMultimodalResponse(key, [
            {
              text: `Listen to the learner's recording and evaluate how understandable their pronunciation is for the exact English phrase: "${profile.words[0]}". Be supportive and specific. Do not infer accent or identity. Treat this as an approximate AI coaching aid, not a certified pronunciation test. Return ONLY valid JSON with these fields: {"score": integer 0-100, "heard": short transcript of what you heard, "feedback": one or two concise sentences in Vietnamese, "soundsToPractice": array of at most 3 short English words or sounds}. If audio is unclear, say so in feedback and give a low-confidence score.`,
            },
            { inlineData: audio },
          ], activeModel));'''

new_pronounce_prompt = '''          const targetPhrase = (targetPronunciationPhrase.trim() || profile.words[0]).trim();
          const response = await withAvailableApiKey((key) => generateGeminiMultimodalResponse(key, [
            {
              text: `Listen to the learner's audio and evaluate how understandable and accurate their pronunciation is for the English phrase: "${targetPhrase}".
Pay special attention to common pronunciation challenges for Vietnamese speakers of English (e.g., missing ending consonant sounds like /s/, /z/, /t/, /d/, /k/, /ʃ/, /tʃ/, /θ/, incorrect word stress, and consonant clusters).
Be supportive, warm, and specific. Treat this as an encouraging AI coaching aid.
Return ONLY valid JSON with these fields: {"score": integer 0-100, "heard": short transcript of what you heard, "feedback": one or two concise sentences in Vietnamese giving constructive feedback, "soundsToPractice": array of at most 3 short English words or sounds}. If audio is unclear, say so in feedback and give a low-confidence score.`,
            },
            { inlineData: audio },
          ], activeModel));'''

assert old_pronounce_prompt in content_normalized, "old_pronounce_prompt not found"
content_normalized = content_normalized.replace(old_pronounce_prompt, new_pronounce_prompt)

# 6. Add In-Lesson & Grammar Q&A functions
qa_helpers = '''  function askTutorAboutQuestion(
    lessonTitle: string,
    prompt: string,
    options: string[],
    selectedOptionIndex: number,
    correctOptionIndex: number,
    explanation: string,
  ) {
    const userChoice = Number.isInteger(selectedOptionIndex) && options[selectedOptionIndex]
      ? options[selectedOptionIndex]
      : "Chưa chọn đáp án";
    const correctChoice = options[correctOptionIndex] ?? "";
    const questionText = `Chào cô Maya! Em đang học bài "${lessonTitle}" và có câu hỏi trắc nghiệm này chưa hiểu rõ:
- Câu hỏi: "${prompt}"
- Em chọn: "${userChoice}"
- Đáp án đúng là: "${correctChoice}"
- Giải thích: "${explanation}"

Cô Maya giải thích thêm giúp em tại sao lại chọn "${correctChoice}" và cách dùng trong thực tế với ạ?`;

    navigateToSection("practice");
    void sendMessage(undefined, questionText);
  }

  function askTutorAboutLesson(lesson: CourseLesson) {
    const vocabList = lesson.vocabulary.map((v) => `${v.term}: ${v.definition}`).slice(0, 3).join(", ");
    const questionText = `Chào cô Maya! Em vừa học xong bài "${lesson.title}" (${lesson.unit}) thuộc trình độ ${lesson.level}.
Mục tiêu bài học: ${lesson.objective}
Từ vựng chính: ${vocabList}

Cô có thể tóm tắt 2 điểm quan trọng nhất của bài này và đặt cho em 1 câu hỏi luyện tập nhỏ để em đối thoại cùng cô được không ạ?`;

    navigateToSection("practice");
    void sendMessage(undefined, questionText);
  }

  function askTutorAboutGrammar(topic: GrammarTopic, question?: GrammarQuestion, selectedIndex?: number) {
    let questionText = "";
    if (question && Number.isInteger(selectedIndex)) {
      const userChoice = question.options[selectedIndex!] ?? "Chưa chọn";
      const correctChoice = question.options[question.answer] ?? "";
      questionText = `Chào cô Maya! Em đang làm bài tập chủ đề ngữ pháp "${topic.title}" (${topic.level}) và thắc mắc câu này:
- Câu hỏi: "${question.prompt}"
- Em đã chọn: "${userChoice}"
- Đáp án đúng: "${correctChoice}"
- Giải thích: "${question.explanation}"

Cô giải thích thêm giúp em tại sao lại chọn đáp án này và lỗi người Việt hay mắc phải với ạ?`;
    } else {
      questionText = `Chào cô Maya! Em đang xem cấu trúc ngữ pháp "${topic.title}" (${topic.structure}).
Cô giải thích ngắn gọn cách dùng cấu trúc này và cho em một tình huống thực tế để em thử đặt câu luyện tập với ạ!`;
    }

    navigateToSection("practice");
    void sendMessage(undefined, questionText);
  }
'''

# Place qa_helpers right before `function renderPractice()`
old_render_practice_start = '  function renderPractice() {'
assert old_render_practice_start in content_normalized, "old_render_practice_start not found"
content_normalized = content_normalized.replace(old_render_practice_start, qa_helpers + "\n" + old_render_practice_start)

# 7. Update renderPractice UI:
# - Active phrase display and custom phrase input in scene-panel
# - Button on assistant messages to practice speaking that sentence
old_phrase_box = '''          <div className="phrase-box">
            <span className="eyebrow">THỬ NÓI CÂU NÀY</span>
            <strong>“{profile.words[0]}”</strong>
            <span className="phrase-translation">{phraseMeanings[profile.words[0]]}</span>
            <button className="speak-button" onClick={() => void playSpeech(profile.words[0])} disabled={speechBusy}>
              <IllustrationIcon name="speaker" /> Nghe mẫu phát âm
            </button>
          </div>'''

new_phrase_box = '''          <div className="phrase-box">
            <span className="eyebrow">CÂU ĐANG LUYỆN NÓI</span>
            <strong>“{targetPronunciationPhrase || profile.words[0]}”</strong>
            <span className="phrase-translation">{phraseMeanings[targetPronunciationPhrase || profile.words[0]] || "Tự do luyện phát âm cùng AI"}</span>
            <button className="speak-button" onClick={() => void playSpeech(targetPronunciationPhrase || profile.words[0])} disabled={speechBusy}>
              <IllustrationIcon name="speaker" /> Nghe mẫu phát âm
            </button>
            <div className="pronunciation-custom-input">
              <input
                type="text"
                placeholder="Nhập câu tiếng Anh khác để luyện phát âm..."
                value={customPhraseInput}
                onChange={(e) => setCustomPhraseInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customPhraseInput.trim()) {
                    e.preventDefault();
                    setTargetPronunciationPhrase(customPhraseInput.trim());
                  }
                }}
              />
              <button
                type="button"
                className="button button-outline"
                style={{ padding: "4px 8px", fontSize: "0.5625rem" }}
                onClick={() => {
                  if (customPhraseInput.trim()) {
                    setTargetPronunciationPhrase(customPhraseInput.trim());
                  }
                }}
              >
                Đặt câu này
              </button>
            </div>
          </div>'''

assert old_phrase_box in content_normalized, "old_phrase_box not found"
content_normalized = content_normalized.replace(old_phrase_box, new_phrase_box)

old_word_button = '{profile.words.map((word) => <button key={word} onClick={() => setDraft(word)}><span className="phrase-word"><strong>{word}</strong><small>{phraseMeanings[word]}</small></span><span>↗</span></button>)}'
new_word_button = '{profile.words.map((word) => <button key={word} className={(targetPronunciationPhrase || profile.words[0]) === word ? "phrase-chip-active" : ""} onClick={() => { setDraft(word); setTargetPronunciationPhrase(word); }}><span className="phrase-word"><strong>{word}</strong><small>{phraseMeanings[word]}</small></span><span>↗</span></button>)}'
assert old_word_button in content_normalized, "old_word_button not found"
content_normalized = content_normalized.replace(old_word_button, new_word_button)

# Add "🎙️ Luyện phát âm câu này" in message row for assistant
old_message_bubble = '''                  {message.role === "assistant" && <button aria-label="Nghe câu trả lời" className="speak-button" onClick={() => void playSpeech(message.content)} disabled={speechBusy}><IllustrationIcon name="speaker" /> Nghe câu trả lời</button>}'''
new_message_bubble = '''                  {message.role === "assistant" && (
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <button aria-label="Nghe câu trả lời" className="speak-button" onClick={() => void playSpeech(message.content)} disabled={speechBusy}>
                        <IllustrationIcon name="speaker" /> Nghe câu trả lời
                      </button>
                      <button
                        type="button"
                        className="practice-phrase-btn"
                        title="Đặt câu này làm mẫu luyện phát âm"
                        onClick={() => {
                          setTargetPronunciationPhrase(message.content);
                          void playSpeech(message.content);
                        }}
                      >
                        🎙️ Luyện phát âm câu này
                      </button>
                    </div>
                  )}'''
assert old_message_bubble in content_normalized, "old_message_bubble not found"
content_normalized = content_normalized.replace(old_message_bubble, new_message_bubble)

# 8. Update renderLessons UI:
# - Reading audio & In-lesson Q&A banner
# - Vocabulary speak & pronunciation buttons
# - Question inline "Hỏi cô Maya về câu này"
old_lesson_reading = '''              <div className="course-reading">{lesson.reading}</div>
              <div className="course-vocabulary">
                <h4>Key vocabulary</h4>
                {lesson.vocabulary.map((item) => <p key={item.term}><strong>{item.term}</strong><span>{item.definition}</span></p>)}
              </div>'''

new_lesson_reading = '''              <div className="course-reading">{lesson.reading}</div>
              <div className="lesson-tutor-banner">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => void playSpeech(lesson.reading)}
                  disabled={speechBusy}
                >
                  <IllustrationIcon name="speaker" /> Nghe bài đọc (Audio)
                </button>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => askTutorAboutLesson(lesson)}
                >
                  💬 Hỏi cô Maya về bài học này ↗
                </button>
              </div>
              <div className="course-vocabulary">
                <h4>Key vocabulary</h4>
                {lesson.vocabulary.map((item) => (
                  <p key={item.term} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                    <span>
                      <strong style={{ marginRight: "8px" }}>{item.term}</strong>
                      <span>{item.definition}</span>
                    </span>
                    <span className="vocab-action-btns">
                      <button
                        type="button"
                        className="vocab-mini-btn"
                        title="Nghe phát âm từ này"
                        onClick={() => void playSpeech(item.term)}
                        disabled={speechBusy}
                      >
                        🔊 Nghe
                      </button>
                      <button
                        type="button"
                        className="vocab-mini-btn"
                        title="Luyện nói từ này cùng AI"
                        onClick={() => {
                          setTargetPronunciationPhrase(item.term);
                          navigateToSection("practice");
                        }}
                      >
                        🎙️ Luyện nói
                      </button>
                    </span>
                  </p>
                ))}
              </div>'''

assert old_lesson_reading in content_normalized, "old_lesson_reading not found"
content_normalized = content_normalized.replace(old_lesson_reading, new_lesson_reading)

# Question card ask tutor button in course lessons
old_question_explanation = '{courseQuizSubmitted && <p className="grammar-explanation">{question.explanation}</p>}'
new_question_explanation = '''{courseQuizSubmitted && <p className="grammar-explanation">{question.explanation}</p>}
                    <div style={{ marginTop: "6px" }}>
                      <button
                        type="button"
                        className="ask-tutor-inline-btn"
                        onClick={() => askTutorAboutQuestion(
                          lesson.title,
                          question.prompt,
                          question.options,
                          courseAnswers[questionIndex],
                          question.answer,
                          question.explanation,
                        )}
                      >
                        💡 Hỏi cô Maya về câu này ↗
                      </button>
                    </div>'''

assert old_question_explanation in content_normalized, "old_question_explanation not found"
content_normalized = content_normalized.replace(old_question_explanation, new_question_explanation)

# 9. Update renderGrammar UI:
# - Structure guide ask tutor button
old_grammar_examples = '''            <div className="grammar-example-list">
              <strong>Examples</strong>
              {topic.examples.map((example) => <p key={example}><span>“{example}”</span><button className="speak-button" aria-label={`Nghe câu: ${example}`} onClick={() => void playSpeech(example)} disabled={speechBusy}><IllustrationIcon name="speaker" /> Nghe</button></p>)}
            </div>
          </section>'''

new_grammar_examples = '''            <div className="grammar-example-list">
              <strong>Examples</strong>
              {topic.examples.map((example) => <p key={example}><span>“{example}”</span><button className="speak-button" aria-label={`Nghe câu: ${example}`} onClick={() => void playSpeech(example)} disabled={speechBusy}><IllustrationIcon name="speaker" /> Nghe</button></p>)}
            </div>
            <div style={{ marginTop: "14px" }}>
              <button
                type="button"
                className="button button-outline"
                onClick={() => askTutorAboutGrammar(topic)}
              >
                💬 Hỏi cô Maya về cấu trúc này ↗
              </button>
            </div>
          </section>'''

assert old_grammar_examples in content_normalized, "old_grammar_examples not found"
content_normalized = content_normalized.replace(old_grammar_examples, new_grammar_examples)

# Grammar quiz question ask tutor button
old_grammar_explanation = '{grammarSubmitted && <p className="grammar-explanation">{question.explanation}</p>}'
new_grammar_explanation = '''{grammarSubmitted && <p className="grammar-explanation">{question.explanation}</p>}
                <div style={{ marginTop: "6px" }}>
                  <button
                    type="button"
                    className="ask-tutor-inline-btn"
                    onClick={() => askTutorAboutGrammar(topic, question, grammarAnswers[questionIndex])}
                  >
                    💡 Hỏi cô Maya về câu ngữ pháp này ↗
                  </button>
                </div>'''

assert old_grammar_explanation in content_normalized, "old_grammar_explanation not found"
content_normalized = content_normalized.replace(old_grammar_explanation, new_grammar_explanation)

with open(page_path, "w", encoding="utf-8") as f:
    f.write(content_normalized)

print("Successfully enhanced page.tsx!")
