"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { generateWithGemini, getAudioData, validateGeminiKey } from "@/lib/gemini";
import { grammarTopics } from "@/lib/grammar";
import { IllustrationIcon, IllustrationName } from "@/components/illustration-icon";
import {
  CoursePackage,
  StoredCourse,
  downloadCoursePackage,
  getDownloadedAudio,
  listDownloadedCourses,
  removeDownloadedCourse,
} from "@/lib/course-library";
import {
  PersonalMaterial,
  addPersonalMaterial,
  getPersonalMaterial,
  listPersonalMaterials,
  removePersonalMaterial,
} from "@/lib/personal-library";

type Section = "home" | "practice" | "profiles" | "progress" | "placement" | "grammar" | "courses" | "library";
const API_KEY_STORAGE = "lingua-gemini-api-key";

type Profile = {
  id: string;
  title: string;
  subtitle: string;
  icon: IllustrationName;
  color: string;
  scene: string;
  prompt: string;
  words: string[];
};
type Message = { role: "user" | "assistant"; content: string };
type PronunciationResult = {
  score: number;
  heard: string;
  feedback: string;
  soundsToPractice: string[];
};
type RecognitionResult = { transcript: string };
type RecognitionEvent = Event & { results: ArrayLike<ArrayLike<RecognitionResult>> };
type RecognitionErrorEvent = Event & { error: string };
type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;
type LearningProgress = {
  minutes: number;
  sessions: number;
  level: string;
  profile: string;
  streak: number;
  lastPracticeDate: string;
  dailyMinutes: Record<string, number>;
};

const profiles: Profile[] = [
  {
    id: "business",
    title: "Tiếng Anh công sở",
    subtitle: "Họp hành, email và đàm phán",
    icon: "business",
    color: "blue",
    scene: "Cuộc họp dự án",
    prompt: "Hello! I’ll be your colleague in a project meeting. Let’s practice in English. Start by completing: “Our team is working on...” What is your team working on this week?",
    words: ["Could you clarify that?", "Let's get started.", "I see your point."],
  },
  {
    id: "travel",
    title: "Tiếng Anh du lịch",
    subtitle: "Tự tin giao tiếp khi đi du lịch",
    icon: "travel",
    color: "orange",
    scene: "Làm thủ tục nhận phòng",
    prompt: "Welcome! I’m the receptionist at your hotel. Let’s practice checking in. Do you have a reservation?",
    words: ["I'd like to check in.", "Is breakfast included?", "Could I have a receipt?"],
  },
  {
    id: "technology",
    title: "Tiếng Anh ngành công nghệ",
    subtitle: "Làm việc nhóm, thuyết trình và phỏng vấn",
    icon: "technology",
    color: "purple",
    scene: "Phỏng vấn vị trí lập trình viên",
    prompt: "Hello! I’m interviewing you for a technology role. Tell me about a technical problem you solved. You can begin: “I solved a problem with...”",
    words: ["I narrowed down the cause.", "The issue was resolved.", "It scales well."],
  },
  {
    id: "healthcare",
    title: "Tiếng Anh chuyên ngành y khoa",
    subtitle: "Giao tiếp lâm sàng và chăm sóc bệnh nhân",
    icon: "healthcare",
    color: "green",
    scene: "Hỏi thăm bệnh nhân",
    prompt: "Hello. I’m a patient at the clinic. Please ask me in English: “What brings you in today?” Then ask one clear follow-up question about my symptoms.",
    words: ["Where does it hurt?", "How long have you felt this way?", "Take a deep breath."],
  },
  {
    id: "finance",
    title: "Tiếng Anh ngành tài chính",
    subtitle: "Báo cáo, khách hàng và ngân hàng",
    icon: "finance",
    color: "pink",
    scene: "Trình bày báo cáo tháng",
    prompt: "Let’s practice presenting a financial report in English. Begin with: “Revenue increased by...” What changed in your figures this month?",
    words: ["Revenue increased by…", "Compared with last month…", "The main driver was…"],
  },
  {
    id: "everyday",
    title: "Tiếng Anh giao tiếp hằng ngày",
    subtitle: "Trò chuyện tự nhiên và tự tin",
    icon: "everyday",
    color: "yellow",
    scene: "Làm quen với người mới",
    prompt: "Hi! It’s nice to meet you. What do you like to do in your free time? You can begin: “I like...”",
    words: ["That sounds interesting.", "How about you?", "I haven't tried that yet."],
  },
  {
    id: "refrigeration",
    title: "Tiếng Anh kỹ thuật lạnh",
    subtitle: "Thiết bị lạnh, bảo trì và an toàn",
    icon: "refrigeration",
    color: "blue",
    scene: "Bàn giao thiết bị lạnh",
    prompt: "Hello! I’m a customer reporting an issue with a refrigeration unit. Ask me about the equipment, the symptoms, and when the problem started. Use clear technical English.",
    words: ["The unit is not cooling properly.", "Please switch off the power.", "Could you describe the noise?"],
  },
];

const phraseMeanings: Record<string, string> = {
  "Could you clarify that?": "Bạn có thể giải thích rõ hơn không?",
  "Let's get started.": "Chúng ta bắt đầu nhé.",
  "I see your point.": "Tôi hiểu ý của bạn.",
  "I'd like to check in.": "Tôi muốn làm thủ tục nhận phòng.",
  "Is breakfast included?": "Giá phòng đã bao gồm bữa sáng chưa?",
  "Could I have a receipt?": "Cho tôi xin hóa đơn được không?",
  "I narrowed down the cause.": "Tôi đã khoanh vùng được nguyên nhân.",
  "The issue was resolved.": "Sự cố đã được khắc phục.",
  "It scales well.": "Hệ thống có thể mở rộng tốt.",
  "Where does it hurt?": "Bạn đau ở đâu?",
  "How long have you felt this way?": "Bạn cảm thấy như vậy bao lâu rồi?",
  "Take a deep breath.": "Hãy hít một hơi thật sâu.",
  "Revenue increased by…": "Doanh thu tăng ...",
  "Compared with last month…": "So với tháng trước...",
  "The main driver was…": "Nguyên nhân chính là...",
  "That sounds interesting.": "Nghe thú vị đấy.",
  "How about you?": "Còn bạn thì sao?",
  "I haven't tried that yet.": "Tôi vẫn chưa thử điều đó.",
  "The unit is not cooling properly.": "Thiết bị không làm lạnh đúng cách.",
  "Please switch off the power.": "Vui lòng ngắt nguồn điện.",
  "Could you describe the noise?": "Bạn có thể mô tả tiếng ồn không?",
};

const placementQuestions = [
  {
    question: "Choose the grammatically correct sentence.",
    options: ["She go to work every day.", "She goes to work every day.", "She going to work every day."],
    answer: 1,
    explanation: "With he, she, or it in the present simple, most verbs take -s or -es.",
  },
  {
    question: "Complete the sentence: “There ___ two appointments this afternoon.”",
    options: ["is", "are", "be"],
    answer: 1,
    explanation: "Use are with a plural noun in there is/are sentences.",
  },
  {
    question: "Choose the correct negative sentence.",
    options: ["We didn't received the email.", "We don't received the email.", "We didn't receive the email."],
    answer: 2,
    explanation: "Use did not + the base form of the verb in the past simple.",
  },
  {
    question: "Choose the best response: “Could you give me a hand?”",
    options: ["“Of course. What do you need?”", "“I have two hands.”", "“It is in my wallet.”"],
    answer: 0,
    explanation: "“Give me a hand” is an informal request for help.",
  },
  {
    question: "Complete the sentence: “I ___ this equipment before.”",
    options: ["have used", "used yesterday", "am using"],
    answer: 0,
    explanation: "Use the present perfect to describe experience without naming a finished time.",
  },
  {
    question: "Choose the sentence with the correct modal verb.",
    options: ["You must to wear safety glasses.", "You must wear safety glasses.", "You must wearing safety glasses."],
    answer: 1,
    explanation: "A modal verb such as must is followed by the base form without to.",
  },
  {
    question: "Complete the sentence: “If I ___ more time, I would review the report.”",
    options: ["have", "will have", "had"],
    answer: 2,
    explanation: "The second conditional uses if + past simple, followed by would + base verb.",
  },
  {
    question: "Complete the formal recommendation: “The device ___ inspected before use.”",
    options: ["should be", "should to be", "should being"],
    answer: 0,
    explanation: "Use modal + be + past participle to form a passive recommendation.",
  },
];

const initialMessage: Message = {
  role: "assistant",
  content: "Xin chào! Mình là Maya, gia sư tiếng Anh AI của bạn. 😊 Chọn một lĩnh vực để bắt đầu nhé. Bạn có thể hỏi mình bằng tiếng Việt bất cứ lúc nào; mình sẽ giúp bạn luyện nói tiếng Anh từng bước.",
};

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadProgress(): LearningProgress {
  try {
    const saved = localStorage.getItem("lingua-progress");
    if (saved) {
      const value: unknown = JSON.parse(saved);
      if (typeof value === "object" && value !== null) {
        const stored = value as Record<string, unknown>;
        const dailyMinutes: Record<string, number> = {};
        if (typeof stored.dailyMinutes === "object" && stored.dailyMinutes !== null) {
          for (const [date, minutes] of Object.entries(stored.dailyMinutes)) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(date) && typeof minutes === "number" && minutes >= 0) {
              dailyMinutes[date] = minutes;
            }
          }
        }
        return {
          minutes: typeof stored.minutes === "number" ? stored.minutes : 0,
          sessions: typeof stored.sessions === "number" ? stored.sessions : 0,
          level: typeof stored.level === "string" ? stored.level : "A2",
          profile: typeof stored.profile === "string" ? stored.profile : "business",
          streak: typeof stored.streak === "number" ? stored.streak : 0,
          lastPracticeDate: typeof stored.lastPracticeDate === "string" ? stored.lastPracticeDate : "",
          dailyMinutes,
        };
      }
    }
  } catch {
    return emptyProgress();
  }
  return emptyProgress();
}

function emptyProgress(): LearningProgress {
  return { minutes: 0, sessions: 0, level: "A2", profile: "business", streak: 0, lastPracticeDate: "", dailyMinutes: {} };
}

function loadMessages(profileId: string): Message[] | null {
  try {
    const saved = localStorage.getItem(`lingua-messages-${profileId}`);
    if (!saved) return null;
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length > 100 || parsed.some((message) =>
      typeof message !== "object" || message === null ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string" || message.content.length > 2000)) {
      return null;
    }
    return parsed as Message[];
  } catch {
    return null;
  }
}

function recordPractice(current: LearningProgress, minutes: number, newSession: boolean): LearningProgress {
  const today = todayKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const streak = current.lastPracticeDate === today
    ? current.streak
    : current.lastPracticeDate === todayKey(yesterdayDate) ? current.streak + 1 : 1;
  return {
    ...current,
    minutes: current.minutes + minutes,
    sessions: current.sessions + (newSession ? 1 : 0),
    streak,
    lastPracticeDate: today,
    dailyMinutes: { ...current.dailyMinutes, [today]: (current.dailyMinutes[today] ?? 0) + minutes },
  };
}

export default function Home() {
  const [section, setSection] = useState<Section>("home");
  const [progress, setProgress] = useState<LearningProgress>(emptyProgress);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKeyBusy, setApiKeyBusy] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [draft, setDraft] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState("");
  const [voiceChatRecording, setVoiceChatRecording] = useState(false);
  const [recording, setRecording] = useState(false);
  const [pronunciationBusy, setPronunciationBusy] = useState(false);
  const [pronunciation, setPronunciation] = useState<PronunciationResult | null>(null);
  const [voiceError, setVoiceError] = useState("");
  const [placementAnswers, setPlacementAnswers] = useState<number[]>([]);
  const [placementResult, setPlacementResult] = useState("");
  const [grammarTopicId, setGrammarTopicId] = useState(grammarTopics[0].id);
  const [grammarAnswers, setGrammarAnswers] = useState<number[]>([]);
  const [grammarSubmitted, setGrammarSubmitted] = useState(false);
  const [grammarScores, setGrammarScores] = useState<Record<string, number>>({});
  const [grammarError, setGrammarError] = useState("");
  const [offlineReady, setOfflineReady] = useState(false);
  const [offlineError, setOfflineError] = useState("");
  const [coursePacks, setCoursePacks] = useState<StoredCourse[]>([]);
  const [courseBusyId, setCourseBusyId] = useState("");
  const [courseDownloadProgress, setCourseDownloadProgress] = useState({ completed: 0, total: 0 });
  const [courseError, setCourseError] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [courseAnswers, setCourseAnswers] = useState<number[]>([]);
  const [courseQuizSubmitted, setCourseQuizSubmitted] = useState(false);
  const [courseProgress, setCourseProgress] = useState<Record<string, string[]>>({});
  const [offlineAudioUrl, setOfflineAudioUrl] = useState("");
  const [personalMaterials, setPersonalMaterials] = useState<PersonalMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<PersonalMaterial | null>(null);
  const [materialUrl, setMaterialUrl] = useState("");
  const [materialText, setMaterialText] = useState("");
  const [materialBusy, setMaterialBusy] = useState(false);
  const [materialError, setMaterialError] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const voiceChatRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChatStreamRef = useRef<MediaStream | null>(null);
  const voiceChatChunksRef = useRef<Blob[]>([]);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const materialInputRef = useRef<HTMLInputElement | null>(null);

  const profile = profiles.find((item) => item.id === progress.profile) ?? profiles[0];
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + index);
    const key = todayKey(date);
    return {
      key,
      label: date.toLocaleDateString("vi-VN", { weekday: "short" }),
      minutes: progress.dailyMinutes[key] ?? 0,
    };
  });
  const maxDailyMinutes = Math.max(1, ...weekDays.map((day) => day.minutes));
  const placementComplete =
    placementQuestions.every((_, index) =>
      Number.isInteger(placementAnswers[index]) && placementAnswers[index] >= 0);
  const practiceSessionCounted = useRef(false);

  useEffect(() => {
    const savedProgress = loadProgress();
    setProgress(savedProgress);
    const selectedProfile = profiles.find((item) => item.id === savedProgress.profile);
    if (selectedProfile) {
      setMessages(loadMessages(selectedProfile.id) ?? [{ role: "assistant", content: selectedProfile.prompt }]);
    }
    try {
      const savedApiKey = localStorage.getItem(API_KEY_STORAGE) ?? "";
      setApiKey(savedApiKey);
      setApiKeyDraft(savedApiKey);
    } catch {
      setApiKeyError("Trình duyệt không cho phép lưu API key trên thiết bị này.");
    }
    try {
      const savedScores: unknown = JSON.parse(localStorage.getItem("lingua-grammar-scores") ?? "{}");
      if (typeof savedScores === "object" && savedScores !== null && !Array.isArray(savedScores)) {
        const validScores = Object.fromEntries(
          Object.entries(savedScores).filter((entry): entry is [string, number] =>
            typeof entry[1] === "number" && Number.isInteger(entry[1]) && entry[1] >= 0 && entry[1] <= 100),
        );
        setGrammarScores(validScores);
      }
    } catch {
      setGrammarError("Không thể đọc kết quả ngữ pháp đã lưu trên thiết bị này.");
    }
    try {
      const savedCourseProgress: unknown = JSON.parse(localStorage.getItem("lingua-course-progress") ?? "{}");
      if (typeof savedCourseProgress === "object" && savedCourseProgress !== null && !Array.isArray(savedCourseProgress)) {
        const validProgress = Object.fromEntries(
          Object.entries(savedCourseProgress).filter((entry): entry is [string, string[]] =>
            Array.isArray(entry[1]) && entry[1].every((lessonId) => typeof lessonId === "string")),
        );
        setCourseProgress(validProgress);
      }
    } catch {
      setCourseError("Không thể đọc tiến độ giáo trình đã lưu trên thiết bị này.");
    }
    void listDownloadedCourses()
      .then(setCoursePacks)
      .catch((error: unknown) => {
        setCourseError(error instanceof Error ? error.message : "Không thể đọc các gói học offline trên thiết bị.");
      });
    void listPersonalMaterials()
      .then(setPersonalMaterials)
      .catch((error: unknown) => {
        setMaterialError(error instanceof Error ? error.message : "Không thể đọc thư viện cá nhân trên thiết bị.");
      });
    setProgressLoaded(true);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) {
      setOfflineError("Trình duyệt này không hỗ trợ mở ứng dụng offline.");
      return;
    }
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    void navigator.serviceWorker
      .register(`${basePath}/sw.js`, { scope: `${basePath}/` })
      .then(() => navigator.serviceWorker.ready)
      .then(() => setOfflineReady(true))
      .catch((error: unknown) => {
        setOfflineError(error instanceof Error ? error.message : "Không thể chuẩn bị ứng dụng để dùng offline.");
      });
  }, []);

  useEffect(() => {
    if (!progressLoaded) return;
    try {
      localStorage.setItem("lingua-progress", JSON.stringify(progress));
    } catch {
      setVoiceError("Không thể lưu tiến độ trên trình duyệt này.");
    }
  }, [progress, progressLoaded]);

  useEffect(() => {
    if (!progressLoaded) return;
    try {
      localStorage.setItem(`lingua-messages-${progress.profile}`, JSON.stringify(messages.slice(-100)));
    } catch {
      setChatError("Không thể lưu lịch sử trò chuyện trên thiết bị này.");
    }
  }, [messages, progress.profile, progressLoaded]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    voiceChatStreamRef.current?.getTracks().forEach((track) => track.stop());
    window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => () => {
    if (offlineAudioUrl) URL.revokeObjectURL(offlineAudioUrl);
  }, [offlineAudioUrl]);

  useEffect(() => () => {
    if (materialUrl) URL.revokeObjectURL(materialUrl);
  }, [materialUrl]);

  function selectProfile(id: string) {
    const nextProfile = profiles.find((item) => item.id === id);
    if (!nextProfile) return;
    setProgress((current) => ({ ...current, profile: id }));
    setMessages(loadMessages(id) ?? [{ role: "assistant", content: nextProfile.prompt }]);
    setPronunciation(null);
    practiceSessionCounted.current = false;
    setSection("practice");
  }

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || chatBusy) return;
    if (!apiKey) {
      setApiKeyDialogOpen(true);
      setChatError("Hãy thêm Gemini API key của bạn trong phần Cài đặt AI để bắt đầu trò chuyện.");
      return;
    }
    const conversation = [...messages, { role: "user" as const, content }];
    setMessages(conversation);
    setDraft("");
    setChatBusy(true);
    setChatError("");
    try {
      if (!apiKey) throw new Error("Hãy thêm Gemini API key của bạn trong phần Cài đặt AI để bắt đầu trò chuyện.");
      const transcript = conversation.map((message) =>
        `${message.role === "user" ? "Người học" : "Gia sư"}: ${message.content}`).join("\n");
      const reply = await generateWithGemini(apiKey, [{
        text: `You are Maya, an encouraging English teacher for a Vietnamese learner. The learner chose "${profile.title}" and is estimated at CEFR ${progress.level}. Keep all lesson material, practice prompts, example sentences, and quiz-like questions in English only; never put Vietnamese translations beside English lesson content. If the learner explicitly asks for help in Vietnamese, briefly explain the point in Vietnamese separately, then return to English practice. Use English at the learner's level, gently correct one useful mistake, and ask one clear follow-up question. Keep replies under 100 words. Never claim to have measured pronunciation from text. Conversation:\n${transcript}\nReply as the coach.`,
      }]);
      setMessages((current) => [...current, { role: "assistant", content: reply }]);
      setProgress((current) => recordPractice(current, 2, !practiceSessionCounted.current));
      practiceSessionCounted.current = true;
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.speak(new SpeechSynthesisUtterance(reply));
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Gia sư chưa thể trả lời. Bạn vui lòng thử lại nhé.");
    } finally {
      setChatBusy(false);
    }
  }

  function startVoiceInput() {
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      void startVoiceChatRecording();
      return;
    }
    setVoiceError("");
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join(" ");
      setDraft((current) => current ? `${current} ${transcript}` : transcript);
    };
    recognition.onerror = (event) => setVoiceError(`Micro bị lỗi (${event.error}). Hãy kiểm tra quyền truy cập micro rồi thử lại nhé.`);
    recognition.start();
  }

  async function startVoiceChatRecording() {
    setVoiceError("");
    if (chatBusy) return;
    if (!apiKey) {
      setApiKeyDialogOpen(true);
      setVoiceError("Hãy thêm Gemini API key của bạn trong phần Cài đặt AI để bắt đầu trò chuyện.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVoiceError("Để gửi câu trả lời bằng giọng nói, hãy mở ứng dụng bằng đường dẫn HTTPS và cho phép dùng micro. Bạn cũng có thể nhập câu trả lời.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceChatStreamRef.current = stream;
      const supportedTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
      const mimeType = supportedTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      voiceChatRecorderRef.current = recorder;
      voiceChatChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) voiceChatChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        voiceChatStreamRef.current = null;
        const blob = new Blob(voiceChatChunksRef.current, { type: recorder.mimeType || "audio/mp4" });
        if (!blob.size) {
          setVoiceError("Chưa ghi được âm thanh. Bạn vui lòng thử lại nhé.");
          return;
        }
        setChatBusy(true);
        setChatError("");
        try {
          const transcript = messages.slice(-12).map((message) =>
            `${message.role === "user" ? "Người học" : "Gia sư"}: ${message.content}`).join("\n");
          const audio = await getAudioData(blob);
          const response = await generateWithGemini(apiKey, [
            {
              text: `You are Maya, an encouraging English teacher for a Vietnamese learner. Their profile is "${profile.title}" and estimated CEFR level is "${progress.level}". Listen carefully. Transcribe English accurately; if the learner speaks Vietnamese, transcribe their request in Vietnamese. Keep all lesson material, practice prompts, examples, and quiz-like questions in English only, without Vietnamese translations beside them. If they explicitly request an explanation in Vietnamese, explain briefly and separately, then continue in English. Correct one useful mistake gently and invite one short answer in English. Keep your reply under 100 words. Conversation so far:\n${transcript}\nReturn ONLY valid JSON: {"transcript":"what the learner said","reply":"your level-appropriate coach response"}.`,
            },
            { inlineData: audio },
          ]);
          const data: unknown = JSON.parse(response.replace(/^```(?:json)?\s*|\s*```$/g, ""));
          if (typeof data !== "object" || data === null || !("transcript" in data) ||
              typeof data.transcript !== "string" || !("reply" in data) ||
              typeof data.reply !== "string" || !data.transcript.trim() || !data.reply.trim()) {
            throw new Error("Gia sư AI trả lời không đúng định dạng. Vui lòng thử lại.");
          }
          const learnerMessage = data.transcript;
          const coachMessage = data.reply;
          setMessages((current) => [
            ...current,
            { role: "user", content: learnerMessage },
            { role: "assistant", content: coachMessage },
          ]);
          setProgress((current) => recordPractice(current, 2, !practiceSessionCounted.current));
          practiceSessionCounted.current = true;
          window.speechSynthesis?.cancel();
          window.speechSynthesis?.speak(new SpeechSynthesisUtterance(coachMessage));
        } catch (error) {
          setChatError(error instanceof Error ? error.message : "Gia sư chưa thể xử lý bản ghi. Bạn vui lòng thử lại nhé.");
        } finally {
          setChatBusy(false);
        }
      };
      recorder.start();
      setVoiceChatRecording(true);
    } catch (error) {
      setVoiceError(error instanceof Error
        ? `Không thể dùng micro: ${error.message}`
        : "Không thể dùng micro. Hãy kiểm tra quyền truy cập micro của trình duyệt.");
    }
  }

  function stopVoiceChatRecording() {
    if (voiceChatRecorderRef.current?.state === "recording") {
      voiceChatRecorderRef.current.stop();
      setVoiceChatRecording(false);
    }
  }

  async function startPronunciationRecording() {
    setPronunciation(null);
    setVoiceError("");
    if (!apiKey) {
      setApiKeyDialogOpen(true);
      setVoiceError("Hãy thêm Gemini API key của bạn trong phần Cài đặt AI để nhận góp ý phát âm.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVoiceError("Trình duyệt này chưa hỗ trợ ghi âm. Hãy thử mở ứng dụng bằng Safari hoặc Chrome mới nhất qua đường dẫn HTTPS.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const supportedTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
      const mimeType = supportedTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/mp4" });
        if (!blob.size) {
          setVoiceError("Chưa ghi được âm thanh. Bạn vui lòng thử lại nhé.");
          return;
        }
        setPronunciationBusy(true);
        try {
          const audio = await getAudioData(blob);
          const response = await generateWithGemini(apiKey, [
            {
              text: `Listen to the learner's recording and evaluate how understandable their pronunciation is for the exact English phrase: "${profile.words[0]}". Be supportive and specific. Do not infer accent or identity. Treat this as an approximate AI coaching aid, not a certified pronunciation test. Return ONLY valid JSON with these fields: {"score": integer 0-100, "heard": short transcript of what you heard, "feedback": one or two concise sentences in Vietnamese, "soundsToPractice": array of at most 3 short English words or sounds}. If audio is unclear, say so in feedback and give a low-confidence score.`,
            },
            { inlineData: audio },
          ]);
          const data: unknown = JSON.parse(response.replace(/^```(?:json)?\s*|\s*```$/g, ""));
          if (typeof data !== "object" || data === null || !("score" in data) ||
              typeof data.score !== "number" || !("heard" in data) || typeof data.heard !== "string" ||
              !("feedback" in data) || typeof data.feedback !== "string" ||
              !("soundsToPractice" in data) || !Array.isArray(data.soundsToPractice) ||
              data.soundsToPractice.some((sound) => typeof sound !== "string")) {
            throw new Error("Phản hồi đánh giá phát âm không đúng định dạng. Vui lòng thử lại.");
          }
          setPronunciation({
            score: Math.max(0, Math.min(100, Math.round(data.score))),
            heard: data.heard,
            feedback: data.feedback,
            soundsToPractice: data.soundsToPractice.slice(0, 3),
          });
          setProgress((current) => recordPractice(current, 1, !practiceSessionCounted.current));
          practiceSessionCounted.current = true;
        } catch (error) {
          setVoiceError(error instanceof Error ? error.message : "Chưa thể đánh giá bản ghi. Bạn vui lòng thử lại nhé.");
        } finally {
          setPronunciationBusy(false);
        }
      };
      recorder.start();
      setRecording(true);
    } catch (error) {
      setVoiceError(error instanceof Error ? `Không thể dùng micro: ${error.message}` : "Không thể dùng micro. Hãy kiểm tra quyền truy cập micro của trình duyệt.");
    }
  }

  function stopPronunciationRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      setRecording(false);
    }
  }

  async function saveApiKey(event: FormEvent) {
    event.preventDefault();
    const candidate = apiKeyDraft.trim();
    if (!candidate) {
      setApiKeyError("Vui lòng nhập Gemini API key.");
      return;
    }
    setApiKeyBusy(true);
    setApiKeyError("");
    setApiKeySaved(false);
    try {
      await validateGeminiKey(candidate);
      localStorage.setItem(API_KEY_STORAGE, candidate);
      setApiKey(candidate);
      setApiKeyDraft(candidate);
      setApiKeySaved(true);
    } catch (error) {
      setApiKeyError(error instanceof Error ? error.message : "Không thể xác thực API key. Vui lòng thử lại.");
    } finally {
      setApiKeyBusy(false);
    }
  }

  function removeApiKey() {
    try {
      localStorage.removeItem(API_KEY_STORAGE);
      setApiKey("");
      setApiKeyDraft("");
      setApiKeySaved(false);
      setApiKeyError("");
    } catch {
      setApiKeyError("Không thể xóa API key khỏi bộ nhớ trình duyệt.");
    }
  }

  function completePlacement() {
    const score = placementAnswers.reduce(
      (total, answer, index) => total + (answer === placementQuestions[index].answer ? 1 : 0),
      0,
    );
    const level = score >= 7 ? "B2" : score >= 5 ? "B1" : score >= 3 ? "A2" : "A1";
    setProgress((current) => ({ ...current, level }));
    const corrections = placementQuestions
      .filter((question, index) => placementAnswers[index] !== question.answer)
      .map((question) => question.explanation);
    setPlacementResult(
      `Bạn trả lời đúng ${score}/${placementQuestions.length} câu. Trình độ bắt đầu của bạn là ${level}. Gia sư sẽ điều chỉnh bài luyện tập cho phù hợp.` +
      (corrections.length ? `\n\nCùng học thêm nhé:\n${corrections.map((item) => `• ${item}`).join("\n")}` : `\n\nTuyệt lắm, bạn đã trả lời đúng cả ${placementQuestions.length} câu!`),
    );
  }

  function selectGrammarTopic(topicId: string) {
    setGrammarTopicId(topicId);
    setGrammarAnswers([]);
    setGrammarSubmitted(false);
    setGrammarError("");
  }

  function completeGrammarQuiz() {
    const topic = grammarTopics.find((item) => item.id === grammarTopicId);
    if (!topic || grammarAnswers.length !== topic.questions.length) return;
    const score = topic.questions.reduce(
      (total, question, index) => total + (grammarAnswers[index] === question.answer ? 1 : 0),
      0,
    );
    const percentage = Math.round((score / topic.questions.length) * 100);
    const updatedScores = { ...grammarScores, [topic.id]: Math.max(grammarScores[topic.id] ?? 0, percentage) };
    setGrammarScores(updatedScores);
    setGrammarSubmitted(true);
    setGrammarError("");
    try {
      localStorage.setItem("lingua-grammar-scores", JSON.stringify(updatedScores));
    } catch {
      setGrammarError("Không thể lưu kết quả trên thiết bị này. Hãy kiểm tra dung lượng bộ nhớ trình duyệt.");
    }
  }

  async function downloadCourse(courseId: string) {
    setCourseBusyId(courseId);
    setCourseDownloadProgress({ completed: 0, total: 0 });
    setCourseError("");
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const course = await downloadCoursePackage(courseId, basePath, (completed, total) => {
        setCourseDownloadProgress({ completed, total });
      });
      const downloaded = await listDownloadedCourses();
      setCoursePacks(downloaded);
      setSelectedCourseId(course.id);
      setSelectedLessonId(course.lessons[0]?.id ?? "");
      setCourseAnswers([]);
      setCourseQuizSubmitted(false);
      setSection("courses");
    } catch (error) {
      setCourseError(error instanceof Error ? error.message : "Không thể tải giáo trình. Vui lòng thử lại.");
    } finally {
      setCourseBusyId("");
    }
  }

  async function removeCourse(courseId: string) {
    setCourseError("");
    try {
      await removeDownloadedCourse(courseId);
      setCoursePacks(await listDownloadedCourses());
      if (selectedCourseId === courseId) {
        setSelectedCourseId("");
        setSelectedLessonId("");
        setOfflineAudioUrl("");
      }
    } catch (error) {
      setCourseError(error instanceof Error ? error.message : "Không thể xóa gói học khỏi thiết bị.");
    }
  }

  async function importPersonalMaterial(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setMaterialBusy(true);
    setMaterialError("");
    try {
      const added = await addPersonalMaterial(file);
      setPersonalMaterials((current) => [added, ...current]);
    } catch (error) {
      setMaterialError(error instanceof Error ? error.message : "Không thể lưu tệp vào thư viện cá nhân.");
    } finally {
      setMaterialBusy(false);
    }
  }

  async function openPersonalMaterial(material: PersonalMaterial) {
    setMaterialError("");
    try {
      const stored = await getPersonalMaterial(material.id);
      if (!stored) throw new Error("Không tìm thấy tệp trên thiết bị. Có thể dữ liệu trình duyệt đã bị xóa.");
      setSelectedMaterial(material);
      setMaterialText(material.type === "text" ? await stored.file.text() : "");
      setMaterialUrl(material.type === "text" ? "" : URL.createObjectURL(stored.file));
    } catch (error) {
      setMaterialError(error instanceof Error ? error.message : "Không thể mở tài liệu đã lưu.");
    }
  }

  async function deletePersonalMaterial(id: string) {
    setMaterialError("");
    try {
      await removePersonalMaterial(id);
      setPersonalMaterials((current) => current.filter((item) => item.id !== id));
      if (selectedMaterial?.id === id) {
        setSelectedMaterial(null);
        setMaterialText("");
        setMaterialUrl("");
      }
    } catch (error) {
      setMaterialError(error instanceof Error ? error.message : "Không thể xóa tài liệu khỏi thiết bị.");
    }
  }

  function openDownloadedCourse(courseId: string) {
    const course = coursePacks.find((item) => item.id === courseId);
    if (!course) {
      setCourseError("Không tìm thấy gói học trên thiết bị này. Hãy tải lại gói học khi có mạng.");
      return;
    }
    setSelectedCourseId(course.id);
    setSelectedLessonId(course.lessons[0]?.id ?? "");
    setCourseAnswers([]);
    setCourseQuizSubmitted(false);
    setCourseError("");
    setOfflineAudioUrl("");
  }

  function openCourseLesson(lessonId: string) {
    setSelectedLessonId(lessonId);
    setCourseAnswers([]);
    setCourseQuizSubmitted(false);
    setCourseError("");
    setOfflineAudioUrl("");
  }

  async function playOfflineAudio(courseId: string, audioId: string) {
    setCourseError("");
    try {
      const blob = await getDownloadedAudio(courseId, audioId);
      if (!blob) throw new Error("Không tìm thấy audio offline. Hãy xóa và tải lại gói giáo trình này.");
      setOfflineAudioUrl(URL.createObjectURL(blob));
    } catch (error) {
      setCourseError(error instanceof Error ? error.message : "Không thể mở audio đã tải về.");
    }
  }

  function completeCourseQuiz(
    course: CoursePackage,
    lessonId: string,
    questions: CoursePackage["lessons"][number]["questions"],
  ) {
    if (!questions.length || courseAnswers.length !== questions.length ||
        courseAnswers.some((answer) => !Number.isInteger(answer) || answer < 0)) return;
    const score = questions.reduce(
      (total, question, index) => total + (courseAnswers[index] === question.answer ? 1 : 0),
      0,
    );
    const passed = score >= Math.ceil(questions.length * 0.7);
    setCourseQuizSubmitted(true);
    if (!passed) return;
    const updatedProgress = {
      ...courseProgress,
      [course.id]: courseProgress[course.id] ?? [],
    };
    if (!updatedProgress[course.id].includes(lessonId)) {
      updatedProgress[course.id] = [...updatedProgress[course.id], lessonId];
    }
    setCourseProgress(updatedProgress);
    setCourseError("");
    try {
      localStorage.setItem("lingua-course-progress", JSON.stringify(updatedProgress));
    } catch {
      setCourseError("Không thể lưu tiến độ giáo trình trên thiết bị này.");
    }
  }

  function renderPractice() {
    return (
      <div className="practice-layout">
        <section className="panel scene-panel">
          <span className="eyebrow">TÌNH HUỐNG HÔM NAY</span>
          <div className={`scene-art ${profile.color}`}><IllustrationIcon name={profile.icon} /><i>✦</i></div>
          <h2>{profile.scene}</h2>
          <p>Luyện giao tiếp với Maya qua những tình huống thực tế. Cứ mạnh dạn thử, mắc lỗi cũng không sao — mình sẽ cùng bạn tiến bộ.</p>
          <div className="phrase-box">
            <span className="eyebrow">THỬ NÓI CÂU NÀY</span>
            <strong>“{profile.words[0]}”</strong>
            <span className="phrase-translation">{phraseMeanings[profile.words[0]]}</span>
          </div>
          <button className="button button-outline full-button" onClick={startPronunciationRecording} disabled={recording || pronunciationBusy}>
            {pronunciationBusy ? "Đang nghe và đánh giá…" : <><IllustrationIcon name="microphone" /> Luyện phát âm</>}
          </button>
          {recording && <button className="button button-recording full-button" onClick={stopPronunciationRecording}><IllustrationIcon name="stop" /> Dừng ghi âm</button>}
          <p className="small-note">{recording ? "Đang ghi âm… hãy nói rõ câu gợi ý, rồi nhấn dừng để nhận góp ý." : "Ghi âm câu nói để gia sư AI nghe và góp ý."}</p>
          {pronunciation && (
            <div className="pronunciation-result">
              <span className="score-badge">{pronunciation.score}<small>/100</small></span>
              <div><strong>{pronunciation.feedback}</strong><p>AI nghe được: “{pronunciation.heard}”</p>
                {pronunciation.soundsToPractice.length > 0 && <p>Hãy luyện thêm: {pronunciation.soundsToPractice.join(" · ")}</p>}
              </div>
            </div>
          )}
          {voiceError && <p className="error-message">{voiceError}</p>}
          <div className="word-list">
            <span className="eyebrow">CÂU NÓI HỮU ÍCH</span>
            {profile.words.map((word) => <button key={word} onClick={() => setDraft(word)}><span className="phrase-word"><strong>{word}</strong><small>{phraseMeanings[word]}</small></span><span>↗</span></button>)}
          </div>
        </section>

        <section className="panel chat-panel">
          <header className="chat-header">
            <div className="coach-avatar">M<span>✦</span></div>
            <div><strong>Maya</strong><p>Gia sư tiếng Anh AI <span className="online-dot" /> Sẵn sàng luyện tập</p></div>
            <span className="level-chip">{progress.level}</span>
          </header>
          <div className="chat-context"><span>💬</span> {profile.title} <span>·</span> {profile.scene}</div>
          <div className="message-list">
            {messages.map((message, index) => (
              <div className={`message-row ${message.role}`} key={`${index}-${message.role}`}>
                {message.role === "assistant" && <div className="mini-avatar">M</div>}
                <div className="message-bubble">
                  <span className="speaker-label">{message.role === "assistant" ? "MAYA · GIA SƯ" : "BẠN"}</span>
                  <p>{message.content}</p>
                  {message.role === "assistant" && <button aria-label="Nghe câu trả lời" className="speak-button" onClick={() => window.speechSynthesis?.speak(new SpeechSynthesisUtterance(message.content))}><IllustrationIcon name="speaker" /> Nghe câu trả lời</button>}
                </div>
              </div>
            ))}
            {chatBusy && <div className="typing-indicator"><span /> <span /> <span /> Maya đang suy nghĩ…</div>}
          </div>
          {chatError && <p className="error-message chat-error">{chatError}</p>}
          <form className="composer" onSubmit={sendMessage}>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Nhập câu trả lời bằng tiếng Anh…" aria-label="Câu trả lời của bạn" />
            <button type="button" className={voiceChatRecording ? "mic-button recording" : "mic-button"} aria-label={voiceChatRecording ? "Dừng ghi âm" : "Trả lời bằng giọng nói"} onClick={voiceChatRecording ? stopVoiceChatRecording : startVoiceInput} disabled={chatBusy}><IllustrationIcon name={voiceChatRecording ? "stop" : "microphone"} /></button>
            <button type="submit" className="send-button" disabled={chatBusy || !draft.trim()}>Gửi <span>↑</span></button>
          </form>
          {voiceError && !recording && <p className="error-message voice-inline">{voiceError}</p>}
          <p className="chat-footnote">{voiceChatRecording ? "Đang ghi âm… nhấn nút dừng khi bạn nói xong." : "Cứ tự nhiên nhé — đây là nơi an toàn để bạn luyện tập."}</p>
        </section>
      </div>
    );
  }

  function renderPlacement() {
    return (
      <section className="panel placement-panel">
        <span className="eyebrow">BƯỚC ĐẦU TIÊN</span>
        <h2>Cùng tìm trình độ tiếng Anh của bạn</h2>
        <p>Trả lời 8 câu hỏi bằng tiếng Anh để ước lượng mức bắt đầu từ A1 đến B2. Đây là bài sàng lọc ngắn, không thay thế bài đánh giá CEFR chính thức; bạn có thể làm lại bất cứ lúc nào.</p>
        {placementQuestions.map((item, questionIndex) => (
          <fieldset className="question-card" key={item.question}>
            <legend>{questionIndex + 1}. {item.question}</legend>
            <div className="answer-options">
              {item.options.map((option, optionIndex) => (
                <button type="button" key={option} className={placementAnswers[questionIndex] === optionIndex ? "answer-option selected" : "answer-option"}
                  onClick={() => setPlacementAnswers((answers) => {
                    const updated = [...answers];
                    updated[questionIndex] = optionIndex;
                    return updated;
                  })}>
                  <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <button className="button button-primary" onClick={completePlacement} disabled={!placementComplete}>Xem trình độ của tôi <span>→</span></button>
        {placementResult && <div className="placement-result">🎉 {placementResult}</div>}
      </section>
    );
  }

  function renderGrammar() {
    const topic = grammarTopics.find((item) => item.id === grammarTopicId) ?? grammarTopics[0];
    const answeredAll = topic.questions.every((_, index) => Number.isInteger(grammarAnswers[index]));
    const score = topic.questions.reduce(
      (total, question, index) => total + (grammarAnswers[index] === question.answer ? 1 : 0),
      0,
    );
    return (
      <>
        <div className="page-intro">
          <span className="eyebrow">LUYỆN NGỮ PHÁP THEO CẤU TRÚC</span>
          <h2>Học từng cấu trúc, luyện đến khi vững.</h2>
          <p>Chọn trình độ và cấu trúc cần luyện. Câu hỏi, lựa chọn và giải thích trong bài tập đều bằng tiếng Anh; kết quả được lưu trên thiết bị.</p>
        </div>
        <div className="grammar-layout">
          <section className="panel grammar-topics">
            <span className="eyebrow">CHỌN CẤU TRÚC</span>
            {(["A1", "A2", "B1", "B2"] as const).map((level) => (
              <div className="grammar-level" key={level}>
                <strong>{level} · CEFR</strong>
                {grammarTopics.filter((item) => item.level === level).map((item) => (
                  <button key={item.id} className={item.id === topic.id ? "grammar-topic selected" : "grammar-topic"} onClick={() => selectGrammarTopic(item.id)}>
                    <span>{item.title}</span>
                    {grammarScores[item.id] !== undefined && <small>Điểm cao nhất: {grammarScores[item.id]}%</small>}
                  </button>
                ))}
              </div>
            ))}
          </section>
          <section className="panel grammar-quiz">
            <div className="grammar-quiz-heading"><span className="level-chip">{topic.level}</span><span className="eyebrow">GRAMMAR PRACTICE</span></div>
            <h3>{topic.title}</h3>
            <p className="grammar-structure"><strong>Structure:</strong> {topic.structure}</p>
            {topic.questions.map((question, questionIndex) => (
              <fieldset className="question-card" key={`${topic.id}-${questionIndex}`}>
                <legend>{questionIndex + 1}. {question.prompt}</legend>
                <div className="answer-options">
                  {question.options.map((option, optionIndex) => {
                    const selected = grammarAnswers[questionIndex] === optionIndex;
                    const correct = grammarSubmitted && question.answer === optionIndex;
                    const incorrect = grammarSubmitted && selected && !correct;
                    return (
                      <button type="button" key={option} className={`answer-option${selected ? " selected" : ""}${correct ? " correct" : ""}${incorrect ? " incorrect" : ""}`}
                        onClick={() => {
                          if (grammarSubmitted) return;
                          setGrammarAnswers((answers) => {
                            const updated = [...answers];
                            updated[questionIndex] = optionIndex;
                            return updated;
                          });
                        }}>
                        <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
                      </button>
                    );
                  })}
                </div>
                {grammarSubmitted && <p className="grammar-explanation">{question.explanation}</p>}
              </fieldset>
            ))}
            {grammarSubmitted
              ? <button className="button button-outline" onClick={() => { setGrammarAnswers([]); setGrammarSubmitted(false); }}>Làm lại bài tập <span>↻</span></button>
              : <button className="button button-primary" onClick={completeGrammarQuiz} disabled={!answeredAll}>Chấm bài <span>→</span></button>}
            {grammarSubmitted && <div className="placement-result" role="status">Score: {score}/{topic.questions.length}. {score === topic.questions.length ? "Excellent work!" : "Review the explanations and try again to improve your score."}</div>}
            {grammarError && <p className="error-message" role="alert">{grammarError}</p>}
          </section>
        </div>
      </>
    );
  }

  function renderHome() {
    return (
      <>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow">MỖI NGÀY MỘT CHÚT <span>✦</span> {progress.streak ? `CHUỖI ${progress.streak} NGÀY` : "BẮT ĐẦU HÔM NAY"}</span>
            <h2>Tiến bộ từng chút.<br /><em>Tự tin hơn mỗi ngày.</em></h2>
            <p>Học theo cách của bạn. Cùng bắt đầu từ hôm nay nhé!</p>
            <button className="button button-light" onClick={() => setSection("practice")}>Bắt đầu luyện nói <span>→</span></button>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-sun" /><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="art-card"><span className="art-sparkles"><IllustrationIcon name="sparkles" /></span><strong>Bạn đang<br />tiến bộ!</strong><small>Từng cuộc trò chuyện một</small></div>
            <div className="art-star star-one"><IllustrationIcon name="sparkles" /></div><div className="art-star star-two"><IllustrationIcon name="sparkles" /></div>
          </div>
        </section>

        <div className="section-heading">
          <div><span className="eyebrow">LỘ TRÌNH HỌC CỦA BẠN</span><h2>Chọn lĩnh vực muốn học</h2></div>
          <button className="text-button" onClick={() => setSection("profiles")}>Xem tất cả <span>→</span></button>
        </div>
        <div className="profile-grid">
          {profiles.slice(0, 4).map((item) => (
            <button className={`profile-card ${item.id === progress.profile ? "active-profile" : ""}`} key={item.id} onClick={() => selectProfile(item.id)}>
              <span className={`profile-icon ${item.color}`}><IllustrationIcon name={item.icon} /></span>
              <strong>{item.title}</strong><span>{item.subtitle}</span>
              {item.id === progress.profile && <i>ĐANG CHỌN</i>}
            </button>
          ))}
        </div>

        <div className="dashboard-lower">
          <section className="panel progress-panel">
            <div className="panel-title"><div><span className="eyebrow">TUẦN NÀY</span><h3>Tiến độ học tập</h3></div><span className="progress-decoration">↗</span></div>
            <div className="stats-grid">
              <div><span className="stat-icon lavender"><IllustrationIcon name="timer" /></span><strong>{progress.minutes}<small> phút</small></strong><span>Thời gian luyện tập</span></div>
              <div><span className="stat-icon peach"><IllustrationIcon name="sessions" /></span><strong>{progress.sessions}</strong><span>Buổi học</span></div>
              <div><span className="stat-icon mint"><IllustrationIcon name="level" /></span><strong>{progress.level}</strong><span>Trình độ ước tính</span></div>
            </div>
            <div className="week-bars" aria-label="Thời gian luyện tập trong tuần">{weekDays.map((day) => <div key={day.key} title={`${day.minutes} phút luyện tập`}><span style={{ height: `${day.minutes ? Math.max(12, day.minutes / maxDailyMinutes * 100) : 5}%` }} className={day.key === todayKey() ? "today-bar" : ""} /><small>{day.label}</small></div>)}</div>
          </section>
          <section className="panel next-panel">
            <span className="eyebrow">GỢI Ý TIẾP THEO</span>
            <div className="next-lesson"><span className={`lesson-icon ${profile.color}`}><IllustrationIcon name={profile.icon} /></span><div><strong>{profile.scene}</strong><span>5 phút · Luyện giao tiếp</span></div></div>
            <p>Luyện những câu giao tiếp thực tế theo lĩnh vực bạn đã chọn.</p>
            <button className="button button-primary full-button" onClick={() => setSection("practice")}>Tiếp tục học <span>→</span></button>
          </section>
        </div>
        <section className="placement-banner"><span className="placement-icon"><IllustrationIcon name="compass" /></span><div><strong>Bạn mới bắt đầu học?</strong><p>Làm bài kiểm tra ngắn để Maya điều chỉnh bài học theo trình độ của bạn.</p></div><button onClick={() => { setPlacementAnswers([]); setPlacementResult(""); setSection("placement"); }}>Kiểm tra trình độ <span>→</span></button></section>
      </>
    );
  }

  function renderProfiles() {
    return (
      <>
        <div className="page-intro"><span className="eyebrow">HỌC ĐIỀU BẠN CẦN</span><h2>Học tiếng Anh theo lĩnh vực của bạn.</h2><p>Chọn một lĩnh vực để luyện hội thoại thực tế, học cụm từ hữu ích và tự tin hơn với mục tiêu của mình.</p><button className="button button-outline" onClick={() => setSection("courses")}>Tải giáo trình và audio offline →</button></div>
        <div className="offline-status" role={offlineError ? "alert" : "status"}>
          <span>{offlineReady ? "✓" : offlineError ? "!" : "◌"}</span>
          <p>{offlineReady ? "Ứng dụng đã lưu phần khung để có thể mở lại khi offline. Hãy tải riêng gói giáo trình để lưu bài học và audio." : offlineError || "Đang chuẩn bị ứng dụng cho chế độ offline…"}</p>
        </div>
        <div className="all-profiles-grid">{profiles.map((item) => (
          <button key={item.id} className={`profile-card large-profile ${item.id === progress.profile ? "active-profile" : ""}`} onClick={() => selectProfile(item.id)}>
            <span className={`profile-icon ${item.color}`}><IllustrationIcon name={item.icon} /></span><strong>{item.title}</strong><span>{item.subtitle}</span>
            <div className="profile-preview"><span>Tình huống luyện tập</span><strong>{item.scene}</strong></div>
            <i>{item.id === progress.profile ? "ĐANG CHỌN" : "CHỌN LỘ TRÌNH NÀY →"}</i>
          </button>
        ))}</div>
      </>
    );
  }

  function renderCourses() {
    const course = coursePacks.find((item) => item.id === selectedCourseId);
    if (selectedCourseId && !course) {
      return (
        <section className="panel course-empty-state">
          <h2>Không tìm thấy gói học offline</h2>
          <p>{courseError || "Gói học này chưa được tải về thiết bị."}</p>
          <button className="button button-outline" onClick={() => { setSelectedCourseId(""); setCourseError(""); }}>Quay lại thư viện</button>
        </section>
      );
    }
    if (course) {
      const lesson = course.lessons.find((item) => item.id === selectedLessonId) ?? course.lessons[0];
      const completedLessons = courseProgress[course.id] ?? [];
      const answeredAll = lesson.questions.every((_, index) => Number.isInteger(courseAnswers[index]));
      const correctCount = lesson.questions.reduce(
        (total, question, index) => total + (courseAnswers[index] === question.answer ? 1 : 0),
        0,
      );
      const passed = correctCount >= Math.ceil(lesson.questions.length * 0.7);
      const linkedAudio = course.audio.filter((audio) => lesson.audioIds.includes(audio.id));
      return (
        <>
          <div className="page-intro">
            <button className="text-button" onClick={() => { setSelectedCourseId(""); setSelectedLessonId(""); setOfflineAudioUrl(""); }}>← Tất cả giáo trình</button>
            <span className="eyebrow">{course.framework} · PHIÊN BẢN {course.version}</span>
            <h2>{course.title}</h2>
            <p>{course.overview}</p>
            <p className="course-license">Giấy phép nội dung: {course.contentLicense}</p>
          </div>
          <div className="course-curriculum-layout">
            <section className="panel course-lesson-list">
              <span className="eyebrow">LỘ TRÌNH A1–B2</span>
              {(["A1", "A2", "B1", "B2"] as const).map((level) => {
                const levelLessons = course.lessons.filter((item) => item.level === level);
                if (!levelLessons.length) return null;
                return (
                  <div className="course-level" key={level}>
                    <strong>{level}</strong>
                    {levelLessons.map((item) => {
                      const complete = completedLessons.includes(item.id);
                      return (
                        <button key={item.id} className={item.id === lesson.id ? "course-lesson selected" : "course-lesson"} onClick={() => openCourseLesson(item.id)}>
                          <span>{complete ? "✓" : "○"}</span><span>{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              <p className="course-progress-note">{completedLessons.length}/{course.lessons.length} bài đạt yêu cầu</p>
              <div className="course-references">
                <strong>Nguồn và giấy phép</strong>
                {course.references.map((reference) => (
                  <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer">{reference.title} · {reference.license} ↗</a>
                ))}
              </div>
            </section>
            <section className="panel course-lesson">
              <span className="level-chip">{lesson.level}</span>
              <span className="eyebrow">{lesson.unit}</span>
              <h3>{lesson.title}</h3>
              <p className="course-objective"><strong>Learning objective:</strong> {lesson.objective}</p>
              <div className="course-reading">{lesson.reading}</div>
              <div className="course-vocabulary">
                <h4>Key vocabulary</h4>
                {lesson.vocabulary.map((item) => <p key={item.term}><strong>{item.term}</strong><span>{item.definition}</span></p>)}
              </div>
              {linkedAudio.length > 0 && (
                <div className="course-audio">
                  <h4>Listening practice</h4>
                  {linkedAudio.map((audio) => (
                    <div className="course-audio-item" key={audio.id}>
                      <button className="button button-outline" onClick={() => { void playOfflineAudio(course.id, audio.id); }}>▶ Nghe audio offline</button>
                      <span>{audio.title} · {Math.round(audio.durationSeconds / 60)} phút</span>
                      <small>{audio.attribution} · {audio.license}</small>
                    </div>
                  ))}
                  {offlineAudioUrl && <audio controls preload="metadata" src={offlineAudioUrl}>Trình duyệt không hỗ trợ phát audio.</audio>}
                </div>
              )}
              <div className="course-quiz">
                <span className="eyebrow">PRACTICE · ENGLISH ONLY</span>
                {lesson.questions.map((question, questionIndex) => (
                  <fieldset className="question-card" key={`${lesson.id}-${questionIndex}`}>
                    <legend>{questionIndex + 1}. {question.prompt}</legend>
                    <div className="answer-options">
                      {question.options.map((option, optionIndex) => {
                        const selected = courseAnswers[questionIndex] === optionIndex;
                        const correct = courseQuizSubmitted && question.answer === optionIndex;
                        const incorrect = courseQuizSubmitted && selected && !correct;
                        return (
                          <button type="button" key={option} className={`answer-option${selected ? " selected" : ""}${correct ? " correct" : ""}${incorrect ? " incorrect" : ""}`}
                            onClick={() => {
                              if (courseQuizSubmitted) return;
                              setCourseAnswers((answers) => {
                                const updated = [...answers];
                                updated[questionIndex] = optionIndex;
                                return updated;
                              });
                            }}>
                            <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
                          </button>
                        );
                      })}
                    </div>
                    {courseQuizSubmitted && <p className="grammar-explanation">{question.explanation}</p>}
                  </fieldset>
                ))}
                {courseQuizSubmitted
                  ? <div className="placement-result" role="status">
                      Score: {correctCount}/{lesson.questions.length}. {passed ? "Lesson completed." : "You need 70% to complete this lesson. Review the explanations and try again."}
                      {!passed && <button className="button button-outline" onClick={() => { setCourseAnswers([]); setCourseQuizSubmitted(false); }}>Làm lại bài <span>↻</span></button>}
                    </div>
                  : <button className="button button-primary" disabled={!answeredAll} onClick={() => completeCourseQuiz(course, lesson.id, lesson.questions)}>Chấm bài <span>→</span></button>}
              </div>
            </section>
          </div>
          {courseError && <p className="error-message" role="alert">{courseError}</p>}
        </>
      );
    }

    return (
      <>
        <div className="page-intro">
          <span className="eyebrow">GIÁO TRÌNH TẢI THEO LĨNH VỰC</span>
          <h2>Chọn gói học cần lưu trên thiết bị.</h2>
          <p>Mỗi gói được thiết kế theo CEFR A1–B2, gồm bài học, câu hỏi luyện tập và audio nghe. Nội dung gói tải về dùng offline; hội thoại AI và chấm phát âm cần Internet.</p>
          <button className="button button-outline" onClick={() => setSection("library")}>Mở thư viện tài liệu cá nhân →</button>
        </div>
        <div className="offline-status" role={offlineError ? "alert" : "status"}>
          <span>{offlineReady ? "✓" : offlineError ? "!" : "◌"}</span>
          <p>{offlineReady ? "Ứng dụng đã lưu phần khung để có thể mở lại khi offline." : offlineError || "Đang chuẩn bị ứng dụng cho chế độ offline…"}</p>
        </div>
        {courseError && <p className="error-message" role="alert">{courseError}</p>}
        <div className="course-catalog">
          {profiles.map((item) => {
            const downloaded = coursePacks.find((pack) => pack.id === item.id);
            const busy = courseBusyId === item.id;
            return (
              <section className="panel course-catalog-card" key={item.id}>
                <span className={`profile-icon ${item.color}`}><IllustrationIcon name={item.icon} /></span>
                <div className="course-catalog-copy">
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                  {downloaded && <small>{downloaded.lessons.length} bài học · {downloaded.audio.length} audio · phiên bản {downloaded.version}</small>}
                </div>
                {downloaded
                  ? <div className="course-catalog-actions">
                      <button className="button button-primary" onClick={() => openDownloadedCourse(item.id)}>Học offline <span>→</span></button>
                      <button className="remove-key-button" onClick={() => { void removeCourse(item.id); }}>Xóa gói tải về</button>
                    </div>
                  : <button className="button button-primary" disabled={Boolean(courseBusyId)} onClick={() => { void downloadCourse(item.id); }}>
                      {busy ? `Đang tải audio ${courseDownloadProgress.completed}/${courseDownloadProgress.total || "…"}` : "Tải gói học"}
                    </button>}
              </section>
            );
          })}
        </div>
        <p className="course-storage-note">Gói học và audio được lưu trong IndexedDB trên thiết bị này. Việc tải/xóa gói không ảnh hưởng tiến độ học hoặc API key.</p>
      </>
    );
  }

  function renderPersonalLibrary() {
    return (
      <>
        <div className="page-intro">
          <span className="eyebrow">THƯ VIỆN RIÊNG TRÊN THIẾT BỊ</span>
          <h2>Tài liệu học của bạn.</h2>
          <p>Thêm PDF, audio hoặc tệp văn bản mà bạn có quyền lưu trên thiết bị. Tệp chỉ lưu trong trình duyệt này, không đưa lên GitHub, không gửi tới máy chủ và không đồng bộ giữa các thiết bị.</p>
        </div>
        <section className="panel personal-library-panel">
          <input
            ref={materialInputRef}
            type="file"
            accept=".pdf,.mp3,.m4a,.wav,.ogg,.opus,.aac,.flac,.txt,.md,application/pdf,text/plain,audio/*"
            className="visually-hidden-input"
            aria-label="Chọn tài liệu cá nhân"
            onChange={(event) => { void importPersonalMaterial(event); }}
          />
          <button className="button button-primary" onClick={() => materialInputRef.current?.click()} disabled={materialBusy}>
            {materialBusy ? "Đang lưu vào thiết bị…" : "＋ Thêm tài liệu"}
          </button>
          <div className="personal-library-warning">
            <strong>Chỉ nhập tài liệu bạn được phép sử dụng.</strong>
            <span>Với sách Oxford, chỉ chọn tệp không bị DRM và việc lưu bản cá nhân đó được giấy phép cho phép. Không thể nhập hoặc phá bảo vệ sách trong Oxford Learner’s Bookshelf.</span>
          </div>
          {materialError && <p className="error-message" role="alert">{materialError}</p>}
          {personalMaterials.length === 0
            ? <div className="personal-library-empty"><span className="library-empty-icon"><IllustrationIcon name="books" /></span><strong>Thư viện chưa có tài liệu</strong><p>Thêm một PDF, bài nghe hoặc ghi chú để học trên thiết bị này.</p></div>
            : <div className="personal-material-list">
                {personalMaterials.map((material) => (
                  <article className={`personal-material-card${selectedMaterial?.id === material.id ? " selected" : ""}`} key={material.id}>
                    <span className="personal-material-icon"><IllustrationIcon name={material.type === "pdf" ? "pdf" : material.type === "audio" ? "audio" : "text"} /></span>
                    <div className="personal-material-info">
                      <strong title={material.name}>{material.name}</strong>
                      <span>{(material.size / (1024 * 1024)).toFixed(material.size < 1024 * 1024 ? 3 : 1)} MB · {new Date(material.addedAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <button className="button button-outline" onClick={() => { void openPersonalMaterial(material); }}>Mở</button>
                    <button className="personal-material-delete" aria-label={`Xóa ${material.name}`} onClick={() => { void deletePersonalMaterial(material.id); }}>Xóa</button>
                  </article>
                ))}
              </div>}
        </section>
        {selectedMaterial && (
          <section className="panel personal-material-viewer">
            <div className="personal-viewer-heading">
              <div><span className="eyebrow">ĐANG MỞ TÀI LIỆU CÁ NHÂN</span><h3>{selectedMaterial.name}</h3></div>
              <button className="button button-outline" onClick={() => { setSelectedMaterial(null); setMaterialText(""); setMaterialUrl(""); }}>Đóng</button>
            </div>
            {selectedMaterial.type === "pdf" && materialUrl && <iframe title={selectedMaterial.name} src={materialUrl} />}
            {selectedMaterial.type === "audio" && materialUrl && <audio className="personal-audio-player" controls src={materialUrl}>Trình duyệt này không hỗ trợ phát tệp audio.</audio>}
            {selectedMaterial.type === "text" && <pre className="personal-text-viewer">{materialText}</pre>}
          </section>
        )}
        <p className="course-storage-note">Thư viện cá nhân nằm trong bộ nhớ website của trình duyệt này. Xóa dữ liệu website hoặc đổi trình duyệt/thiết bị có thể làm mất bản lưu; hãy giữ bản gốc riêng.</p>
      </>
    );
  }

  function renderProgress() {
    return (
      <>
        <div className="page-intro"><span className="eyebrow">NHÌN LẠI HÀNH TRÌNH CỦA BẠN</span><h2>Tiến bộ, không cần hoàn hảo.</h2><p>Mỗi cuộc trò chuyện giúp bạn thêm tự tin một chút.</p></div>
        <div className="progress-overview">
          <section className="panel progress-panel"><span className="eyebrow">THỐNG KÊ HỌC TẬP</span><div className="stats-grid">
            <div><span className="stat-icon lavender"><IllustrationIcon name="timer" /></span><strong>{progress.minutes}<small> phút</small></strong><span>Thời gian luyện tập</span></div>
            <div><span className="stat-icon peach"><IllustrationIcon name="sessions" /></span><strong>{progress.sessions}</strong><span>Buổi học</span></div>
            <div><span className="stat-icon mint"><IllustrationIcon name="level" /></span><strong>{progress.level}</strong><span>Trình độ hiện tại</span></div>
          </div></section>
          <section className="panel streak-panel"><span className="streak-emoji"><IllustrationIcon name="streak" /></span><strong>{progress.streak} ngày liên tục</strong><p>Bạn đang tạo một thói quen tuyệt vời. Mỗi ngày luyện một chút sẽ tạo nên khác biệt.</p><button className="text-button" onClick={() => setSection("practice")}>Luyện tập hôm nay →</button></section>
        </div>
        <section className="panel milestone-panel"><span className="eyebrow">BƯỚC TIẾN TIẾP THEO</span><h3>Bạn đã sẵn sàng cho cuộc trò chuyện tiếp theo</h3><p>Hoàn thành một tình huống giao tiếp để duy trì thói quen và tăng sự tự tin.</p><button className="button button-primary" onClick={() => setSection("practice")}>Bắt đầu trò chuyện →</button></section>
      </>
    );
  }

  const nav: { id: Section; icon: IllustrationName; label: string }[] = [
    { id: "home", icon: "home", label: "Trang chủ" },
    { id: "practice", icon: "practice", label: "Luyện tập" },
    { id: "profiles", icon: "profiles", label: "Lộ trình" },
    { id: "courses", icon: "courses", label: "Giáo trình" },
    { id: "library", icon: "library", label: "Tài liệu" },
    { id: "grammar", icon: "grammar", label: "Ngữ pháp" },
    { id: "progress", icon: "progress", label: "Tiến độ" },
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setSection("home"); }}><span className="brand-mark">L<span>✦</span></span><span>lingua<span className="brand-period">.</span><small>GIA SƯ TIẾNG ANH AI CỦA BẠN</small></span></a>
        <div className="side-label">HỌC TẬP</div>
        <nav>{nav.map((item) => <button key={item.id} className={section === item.id ? "nav-item selected" : "nav-item"} onClick={() => setSection(item.id)}><span className="nav-icon"><IllustrationIcon name={item.icon} /></span>{item.label}{item.id === "practice" && <i className="nav-live" />}</button>)}</nav>
        <div className="sidebar-spacer" />
        <div className="streak-card"><span className="sidebar-streak-icon"><IllustrationIcon name="streak" /></span><div><strong>{progress.streak} ngày liên tục</strong><small>{progress.streak ? "Cố gắng duy trì nhé!" : "Bắt đầu với một bài học"}</small></div><span className="streak-arrow">↗</span></div>
        <button className="sidebar-profile" onClick={() => setSection("profiles")}><span className="user-avatar">B</span><span><strong>Lộ trình học của bạn</strong><small>{profile.title}</small></span><span className="more-dots">···</span></button>
      </aside>
      <section className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Học tiếng Anh</span><span>/</span><strong>{nav.find((item) => item.id === section)?.label ?? (section === "placement" ? "Kiểm tra trình độ" : "Luyện tập")}</strong></div>
          <div className="topbar-actions">
            <span className="level-chip desktop-level">TRÌNH ĐỘ {progress.level}</span>
            <button className={apiKey ? "ai-settings-button connected" : "ai-settings-button"} aria-label="Cài đặt API key Gemini" onClick={() => { setApiKeyDraft(apiKey); setApiKeyError(""); setApiKeySaved(false); setApiKeyDialogOpen(true); }}>
              <span className="ai-key-icon"><IllustrationIcon name="key" /></span><span>{apiKey ? "AI đã kết nối" : "Kết nối AI"}</span>
            </button>
            <button className="profile-switch" onClick={() => setShowProfileMenu((open) => !open)}><span className={`profile-icon tiny ${profile.color}`}><IllustrationIcon name={profile.icon} /></span><span>{profile.title}</span><span>⌄</span></button>
            {showProfileMenu && <div className="profile-menu">{profiles.map((item) => <button key={item.id} onClick={() => { selectProfile(item.id); setShowProfileMenu(false); }}><span className={`profile-menu-icon ${item.color}`}><IllustrationIcon name={item.icon} /></span>{item.title}</button>)}</div>}
          </div>
        </header>
        <div className="content-wrap">
          {progressLoaded && !apiKey && <section className="api-reminder"><span className="reminder-key-icon"><IllustrationIcon name="key" /></span><div><strong>Kết nối AI để bắt đầu học cùng Maya</strong><p>Thêm Gemini API key riêng. Key và tiến độ chỉ lưu trên thiết bị này.</p></div><button onClick={() => { setApiKeyDialogOpen(true); setApiKeyError(""); }}>Thiết lập AI</button></section>}
          {section === "home" && renderHome()}
          {section === "practice" && <><div className="section-heading practice-heading"><div><span className="eyebrow">NÓI, HỌC VÀ TIẾN BỘ</span><h2>Cùng nhau luyện tập nhé</h2></div><button className="text-button" onClick={() => setSection("profiles")}>Đổi lĩnh vực ↗</button></div>{renderPractice()}</>}
          {section === "placement" && renderPlacement()}
          {section === "profiles" && renderProfiles()}
          {section === "progress" && renderProgress()}
          {section === "grammar" && renderGrammar()}
          {section === "courses" && renderCourses()}
          {section === "library" && renderPersonalLibrary()}
        </div>
        <footer className="site-footer">Dành cho khoảnh khắc bạn nghĩ: “Mình làm được!” <span>✦</span></footer>
      </section>
      <nav className="mobile-nav">{nav.map((item) => <button key={item.id} className={section === item.id ? "mobile-nav-item selected" : "mobile-nav-item"} onClick={() => setSection(item.id)}><span className="nav-icon"><IllustrationIcon name={item.icon} /></span><small>{item.label}</small></button>)}</nav>
      {apiKeyDialogOpen && (
        <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setApiKeyDialogOpen(false); }}>
          <section className="api-key-dialog" role="dialog" aria-modal="true" aria-labelledby="api-key-title">
            <button className="dialog-close" aria-label="Đóng" onClick={() => setApiKeyDialogOpen(false)}>×</button>
            <span className="api-key-icon"><IllustrationIcon name="key" /></span>
            <span className="eyebrow">KẾT NỐI GIA SƯ AI</span>
            <h2 id="api-key-title">Dùng Gemini API key của bạn</h2>
            <p>Mỗi người học dùng API key riêng của mình. Ứng dụng gửi yêu cầu trực tiếp từ thiết bị của bạn tới Google Gemini, không qua máy chủ trung gian.</p>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Tạo Gemini API key trên Google AI Studio ↗</a>
            <form onSubmit={saveApiKey}>
              <label htmlFor="gemini-api-key">Gemini API key</label>
              <input id="gemini-api-key" type="password" autoComplete="off" value={apiKeyDraft} onChange={(event) => { setApiKeyDraft(event.target.value); setApiKeyError(""); setApiKeySaved(false); }} placeholder="Dán API key của bạn vào đây" />
              <small>Key chỉ được lưu trong bộ nhớ trình duyệt trên thiết bị này. Không dùng trên thiết bị công cộng hoặc thiết bị dùng chung.</small>
              {apiKeyError && <p className="error-message" role="alert">{apiKeyError}</p>}
              {apiKeySaved && <p className="api-key-success" role="status">Đã xác thực và lưu key trên thiết bị này. Bạn có thể bắt đầu học!</p>}
              <button className="button button-primary full-button" type="submit" disabled={apiKeyBusy}>{apiKeyBusy ? "Đang kiểm tra với Google…" : "Kiểm tra và lưu API key"}</button>
            </form>
            {apiKey && <button className="remove-key-button" onClick={removeApiKey}>Xóa API key khỏi thiết bị này</button>}
            <p className="api-key-warning">API key do Google cấp, có thể bị giới hạn hoặc tính phí theo chính sách tài khoản Google của bạn. Xóa dữ liệu trình duyệt sẽ xóa key và tiến độ đã lưu.</p>
          </section>
        </div>
      )}
    </main>
  );
}
