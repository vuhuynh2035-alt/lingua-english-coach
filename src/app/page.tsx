"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { generateWithGemini, getAudioData, validateGeminiKey } from "@/lib/gemini";

type Section = "home" | "practice" | "profiles" | "progress" | "placement";
const API_KEY_STORAGE = "lingua-gemini-api-key";

type Profile = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
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
    icon: "💼",
    color: "blue",
    scene: "Cuộc họp dự án",
    prompt: "Chào bạn! Mình sẽ đóng vai đồng nghiệp trong một cuộc họp dự án. Bạn có thể trả lời bằng tiếng Anh; nếu cần, cứ xen tiếng Việt nhé. Hãy thử nói: “Our team is working on...” (Nhóm mình đang làm...). Tuần này nhóm bạn đang làm gì?",
    words: ["Could you clarify that?", "Let's get started.", "I see your point."],
  },
  {
    id: "travel",
    title: "Tiếng Anh du lịch",
    subtitle: "Tự tin giao tiếp khi đi du lịch",
    icon: "✈️",
    color: "orange",
    scene: "Làm thủ tục nhận phòng",
    prompt: "Xin chào! Mình là nhân viên lễ tân khách sạn. Mình sẽ hướng dẫn bạn bằng tiếng Việt nếu cần. Câu hỏi tiếng Anh đầu tiên là: “Do you have a reservation?” (Bạn đã đặt phòng trước chưa?) Bạn thử trả lời bằng tiếng Anh nhé!",
    words: ["I'd like to check in.", "Is breakfast included?", "Could I have a receipt?"],
  },
  {
    id: "technology",
    title: "Tiếng Anh ngành công nghệ",
    subtitle: "Làm việc nhóm, thuyết trình và phỏng vấn",
    icon: "💻",
    color: "purple",
    scene: "Phỏng vấn vị trí lập trình viên",
    prompt: "Chào bạn! Mình sẽ đóng vai nhà tuyển dụng cho vị trí công nghệ. Bạn có thể trả lời bằng tiếng Anh; mình sẽ giải thích từ khó bằng tiếng Việt. Hãy kể về một vấn đề kỹ thuật bạn từng giải quyết nhé. Có thể bắt đầu: “I solved a problem with...” (Tôi đã giải quyết vấn đề về...).",
    words: ["I narrowed down the cause.", "The issue was resolved.", "It scales well."],
  },
  {
    id: "healthcare",
    title: "Tiếng Anh ngành y tế",
    subtitle: "Giao tiếp thân thiện với bệnh nhân",
    icon: "🩺",
    color: "green",
    scene: "Hỏi thăm bệnh nhân",
    prompt: "Xin chào! Mình sẽ đóng vai nhân viên y tế tiếp đón bệnh nhân. Hãy thử hỏi bằng tiếng Anh: “What brings you in today?” (Hôm nay bạn đến khám vì vấn đề gì?) Nếu chưa biết nói thế nào, cứ hỏi mình bằng tiếng Việt nhé.",
    words: ["Where does it hurt?", "How long have you felt this way?", "Take a deep breath."],
  },
  {
    id: "finance",
    title: "Tiếng Anh ngành tài chính",
    subtitle: "Báo cáo, khách hàng và ngân hàng",
    icon: "📈",
    color: "pink",
    scene: "Trình bày báo cáo tháng",
    prompt: "Chào bạn! Hãy cùng luyện trình bày báo cáo tài chính bằng tiếng Anh. Bạn có thể bắt đầu bằng: “Revenue increased by...” (Doanh thu tăng...). Tháng này có thay đổi số liệu nào bạn muốn trình bày không? Mình sẽ giải thích bằng tiếng Việt nếu bạn cần.",
    words: ["Revenue increased by…", "Compared with last month…", "The main driver was…"],
  },
  {
    id: "everyday",
    title: "Tiếng Anh giao tiếp hằng ngày",
    subtitle: "Trò chuyện tự nhiên và tự tin",
    icon: "☕",
    color: "yellow",
    scene: "Làm quen với người mới",
    prompt: "Xin chào! Rất vui được làm quen với bạn. Mình sẽ trò chuyện bằng tiếng Anh đơn giản và giải thích bằng tiếng Việt khi cần. Bạn thích làm gì lúc rảnh? Có thể bắt đầu: “I like...” (Tôi thích...).",
    words: ["That sounds interesting.", "How about you?", "I haven't tried that yet."],
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
};

const placementQuestions = [
  {
    question: "Chọn câu tiếng Anh đúng:",
    options: ["She go to work every day. (Cô ấy đi làm mỗi ngày.)", "She goes to work every day. (Cô ấy đi làm mỗi ngày.)", "She going to work every day. (Cô ấy đi làm mỗi ngày.)"],
    answer: 1,
    explanation: "Câu đúng là “She goes to work every day.” Với he, she, it, động từ ở thì hiện tại đơn thường thêm -s hoặc -es.",
  },
  {
    question: "Câu “Could you give me a hand?” có nghĩa là gì?",
    options: ["Bạn có thể giúp tôi không?", "Bạn có thể vỗ tay không?", "Bạn có thể cho tôi mượn tiền không?"],
    answer: 0,
    explanation: "“Give me a hand” là cách nói thân mật, có nghĩa là “giúp tôi một tay”.",
  },
  {
    question: "Điền từ còn thiếu: “If I ___ more time, I would travel.” (Nếu tôi có thêm thời gian, tôi sẽ đi du lịch.)",
    options: ["have", "will have", "had"],
    answer: 2,
    explanation: "Đáp án là “had”. Câu giả định này dùng “If + quá khứ đơn”, sau đó là “would + động từ nguyên mẫu”.",
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const voiceChatRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChatStreamRef = useRef<MediaStream | null>(null);
  const voiceChatChunksRef = useRef<Blob[]>([]);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

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
    setProgressLoaded(true);
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
        text: `You are Maya, an encouraging, lively English teacher for a Vietnamese beginner. The learner chose the profile "${profile.title}" and estimated level "${progress.level}". Always make instructions and explanations understandable to a Vietnamese speaker who may know no English: explain unfamiliar phrases in simple Vietnamese, give Vietnamese meanings for important new English, and accept questions in Vietnamese. Keep the learner practicing natural English at their level, increasing difficulty gently. Keep replies under 100 words. Ask one clear follow-up question. Gently correct one useful mistake in Vietnamese, then continue. Never claim to have measured pronunciation from text. Conversation:\n${transcript}\nReply as the coach.`,
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
              text: `You are Maya, an encouraging, lively English teacher for a Vietnamese beginner. Their profile is "${profile.title}" and estimated level is "${progress.level}". Listen to the attached audio carefully. The learner may speak English or ask for help in Vietnamese. Transcribe their English words accurately; when they speak Vietnamese, provide a short Vietnamese transcription or translation of their request. Respond as a friendly tutor, primarily using simple English with Vietnamese translations for important phrases. Accept Vietnamese questions, explain vocabulary and grammar in Vietnamese, correct one useful mistake gently, and invite one short answer in English. Keep your reply under 100 words. Conversation so far:\n${transcript}\nReturn ONLY valid JSON: {"transcript":"what the learner said or its Vietnamese meaning","reply":"your bilingual, level-appropriate coach response"}.`,
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
    const level = score === 3 ? "B1" : score === 2 ? "A2" : "A1";
    setProgress((current) => ({ ...current, level }));
    const corrections = placementQuestions
      .filter((question, index) => placementAnswers[index] !== question.answer)
      .map((question) => question.explanation);
    setPlacementResult(
      `Bạn trả lời đúng ${score}/${placementQuestions.length} câu. Trình độ bắt đầu của bạn là ${level}. Gia sư sẽ điều chỉnh bài luyện tập cho phù hợp.` +
      (corrections.length ? `\n\nCùng học thêm nhé:\n${corrections.map((item) => `• ${item}`).join("\n")}` : "\n\nTuyệt lắm, bạn đã trả lời đúng cả 3 câu!"),
    );
  }

  function renderPractice() {
    return (
      <div className="practice-layout">
        <section className="panel scene-panel">
          <span className="eyebrow">TÌNH HUỐNG HÔM NAY</span>
          <div className={`scene-art ${profile.color}`}><span>{profile.icon}</span><i>✦</i></div>
          <h2>{profile.scene}</h2>
          <p>Luyện giao tiếp với Maya qua những tình huống thực tế. Cứ mạnh dạn thử, mắc lỗi cũng không sao — mình sẽ cùng bạn tiến bộ.</p>
          <div className="phrase-box">
            <span className="eyebrow">THỬ NÓI CÂU NÀY</span>
            <strong>“{profile.words[0]}”</strong>
            <span className="phrase-translation">{phraseMeanings[profile.words[0]]}</span>
          </div>
          <button className="button button-outline full-button" onClick={startPronunciationRecording} disabled={recording || pronunciationBusy}>
            {pronunciationBusy ? "Đang nghe và đánh giá…" : "🎙 Luyện phát âm"}
          </button>
          {recording && <button className="button button-recording full-button" onClick={stopPronunciationRecording}>⏹ Dừng ghi âm</button>}
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
                  {message.role === "assistant" && <button aria-label="Nghe câu trả lời" className="speak-button" onClick={() => window.speechSynthesis?.speak(new SpeechSynthesisUtterance(message.content))}>🔊 Nghe câu trả lời</button>}
                </div>
              </div>
            ))}
            {chatBusy && <div className="typing-indicator"><span /> <span /> <span /> Maya đang suy nghĩ…</div>}
          </div>
          {chatError && <p className="error-message chat-error">{chatError}</p>}
          <form className="composer" onSubmit={sendMessage}>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Nhập câu trả lời bằng tiếng Anh…" aria-label="Câu trả lời của bạn" />
            <button type="button" className={voiceChatRecording ? "mic-button recording" : "mic-button"} aria-label={voiceChatRecording ? "Dừng ghi âm" : "Trả lời bằng giọng nói"} onClick={voiceChatRecording ? stopVoiceChatRecording : startVoiceInput} disabled={chatBusy}>{voiceChatRecording ? "⏹" : "🎤"}</button>
            <button type="submit" className="send-button" disabled={chatBusy || !draft.trim()}>Gửi <span>↑</span></button>
          </form>
          {voiceError && !recording && <p className="error-message voice-inline">{voiceError}</p>}
          <p className="chat-footnote">{voiceChatRecording ? "Đang ghi âm… nhấn ⏹ khi bạn nói xong." : "Cứ tự nhiên nhé — đây là nơi an toàn để bạn luyện tập ✨"}</p>
        </section>
      </div>
    );
  }

  function renderPlacement() {
    return (
      <section className="panel placement-panel">
        <span className="eyebrow">BƯỚC ĐẦU TIÊN</span>
        <h2>Cùng tìm trình độ tiếng Anh của bạn</h2>
        <p>Trả lời 3 câu hỏi ngắn để Maya chọn từ vựng và tốc độ phù hợp. Đây chỉ là ước lượng ban đầu, bạn có thể làm lại bất cứ lúc nào.</p>
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
            <div className="art-card"><span>✨</span><strong>Bạn đang<br />tiến bộ!</strong><small>Từng cuộc trò chuyện một</small></div>
            <div className="art-star star-one">✦</div><div className="art-star star-two">✧</div>
          </div>
        </section>

        <div className="section-heading">
          <div><span className="eyebrow">LỘ TRÌNH HỌC CỦA BẠN</span><h2>Chọn lĩnh vực muốn học</h2></div>
          <button className="text-button" onClick={() => setSection("profiles")}>Xem tất cả <span>→</span></button>
        </div>
        <div className="profile-grid">
          {profiles.slice(0, 4).map((item) => (
            <button className={`profile-card ${item.id === progress.profile ? "active-profile" : ""}`} key={item.id} onClick={() => selectProfile(item.id)}>
              <span className={`profile-icon ${item.color}`}>{item.icon}</span>
              <strong>{item.title}</strong><span>{item.subtitle}</span>
              {item.id === progress.profile && <i>ĐANG CHỌN</i>}
            </button>
          ))}
        </div>

        <div className="dashboard-lower">
          <section className="panel progress-panel">
            <div className="panel-title"><div><span className="eyebrow">TUẦN NÀY</span><h3>Tiến độ học tập</h3></div><span className="progress-decoration">↗</span></div>
            <div className="stats-grid">
              <div><span className="stat-icon lavender">◷</span><strong>{progress.minutes}<small> phút</small></strong><span>Thời gian luyện tập</span></div>
              <div><span className="stat-icon peach">✦</span><strong>{progress.sessions}</strong><span>Buổi học</span></div>
              <div><span className="stat-icon mint">↗</span><strong>{progress.level}</strong><span>Trình độ ước tính</span></div>
            </div>
            <div className="week-bars" aria-label="Thời gian luyện tập trong tuần">{weekDays.map((day) => <div key={day.key} title={`${day.minutes} phút luyện tập`}><span style={{ height: `${day.minutes ? Math.max(12, day.minutes / maxDailyMinutes * 100) : 5}%` }} className={day.key === todayKey() ? "today-bar" : ""} /><small>{day.label}</small></div>)}</div>
          </section>
          <section className="panel next-panel">
            <span className="eyebrow">GỢI Ý TIẾP THEO</span>
            <div className="next-lesson"><span className={`lesson-icon ${profile.color}`}>{profile.icon}</span><div><strong>{profile.scene}</strong><span>5 phút · Luyện giao tiếp</span></div></div>
            <p>Luyện những câu giao tiếp thực tế theo lĩnh vực bạn đã chọn.</p>
            <button className="button button-primary full-button" onClick={() => setSection("practice")}>Tiếp tục học <span>→</span></button>
          </section>
        </div>
        <section className="placement-banner"><span>🧭</span><div><strong>Bạn mới bắt đầu học?</strong><p>Làm bài kiểm tra ngắn để Maya điều chỉnh bài học theo trình độ của bạn.</p></div><button onClick={() => { setPlacementAnswers([]); setPlacementResult(""); setSection("placement"); }}>Kiểm tra trình độ <span>→</span></button></section>
      </>
    );
  }

  function renderProfiles() {
    return (
      <>
        <div className="page-intro"><span className="eyebrow">HỌC ĐIỀU BẠN CẦN</span><h2>Học tiếng Anh theo lĩnh vực của bạn.</h2><p>Chọn một lĩnh vực để luyện hội thoại thực tế, học cụm từ hữu ích và tự tin hơn với mục tiêu của mình.</p></div>
        <div className="all-profiles-grid">{profiles.map((item) => (
          <button key={item.id} className={`profile-card large-profile ${item.id === progress.profile ? "active-profile" : ""}`} onClick={() => selectProfile(item.id)}>
            <span className={`profile-icon ${item.color}`}>{item.icon}</span><strong>{item.title}</strong><span>{item.subtitle}</span>
            <div className="profile-preview"><span>Tình huống luyện tập</span><strong>{item.scene}</strong></div>
            <i>{item.id === progress.profile ? "ĐANG CHỌN" : "CHỌN LỘ TRÌNH NÀY →"}</i>
          </button>
        ))}</div>
      </>
    );
  }

  function renderProgress() {
    return (
      <>
        <div className="page-intro"><span className="eyebrow">NHÌN LẠI HÀNH TRÌNH CỦA BẠN</span><h2>Tiến bộ, không cần hoàn hảo.</h2><p>Mỗi cuộc trò chuyện giúp bạn thêm tự tin một chút.</p></div>
        <div className="progress-overview">
          <section className="panel progress-panel"><span className="eyebrow">THỐNG KÊ HỌC TẬP</span><div className="stats-grid">
            <div><span className="stat-icon lavender">◷</span><strong>{progress.minutes}<small> phút</small></strong><span>Thời gian luyện tập</span></div>
            <div><span className="stat-icon peach">✦</span><strong>{progress.sessions}</strong><span>Buổi học</span></div>
            <div><span className="stat-icon mint">↗</span><strong>{progress.level}</strong><span>Trình độ hiện tại</span></div>
          </div></section>
          <section className="panel streak-panel"><span className="streak-emoji">🔥</span><strong>{progress.streak} ngày liên tục</strong><p>Bạn đang tạo một thói quen tuyệt vời. Mỗi ngày luyện một chút sẽ tạo nên khác biệt.</p><button className="text-button" onClick={() => setSection("practice")}>Luyện tập hôm nay →</button></section>
        </div>
        <section className="panel milestone-panel"><span className="eyebrow">BƯỚC TIẾN TIẾP THEO</span><h3>Bạn đã sẵn sàng cho cuộc trò chuyện tiếp theo</h3><p>Hoàn thành một tình huống giao tiếp để duy trì thói quen và tăng sự tự tin.</p><button className="button button-primary" onClick={() => setSection("practice")}>Bắt đầu trò chuyện →</button></section>
      </>
    );
  }

  const nav: { id: Section; icon: string; label: string }[] = [
    { id: "home", icon: "⌂", label: "Trang chủ" },
    { id: "practice", icon: "◉", label: "Luyện tập" },
    { id: "profiles", icon: "✧", label: "Lộ trình" },
    { id: "progress", icon: "↗", label: "Tiến độ" },
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setSection("home"); }}><span className="brand-mark">L<span>✦</span></span><span>lingua<span className="brand-period">.</span><small>GIA SƯ TIẾNG ANH AI CỦA BẠN</small></span></a>
        <div className="side-label">HỌC TẬP</div>
        <nav>{nav.map((item) => <button key={item.id} className={section === item.id ? "nav-item selected" : "nav-item"} onClick={() => setSection(item.id)}><span>{item.icon}</span>{item.label}{item.id === "practice" && <i className="nav-live" />}</button>)}</nav>
        <div className="sidebar-spacer" />
        <div className="streak-card"><span>🔥</span><div><strong>{progress.streak} ngày liên tục</strong><small>{progress.streak ? "Cố gắng duy trì nhé!" : "Bắt đầu với một bài học"}</small></div><span className="streak-arrow">↗</span></div>
        <button className="sidebar-profile" onClick={() => setSection("profiles")}><span className="user-avatar">B</span><span><strong>Lộ trình học của bạn</strong><small>{profile.title}</small></span><span className="more-dots">···</span></button>
      </aside>
      <section className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Học tiếng Anh</span><span>/</span><strong>{nav.find((item) => item.id === section)?.label ?? (section === "placement" ? "Kiểm tra trình độ" : "Luyện tập")}</strong></div>
          <div className="topbar-actions">
            <span className="level-chip desktop-level">TRÌNH ĐỘ {progress.level}</span>
            <button className={apiKey ? "ai-settings-button connected" : "ai-settings-button"} aria-label="Cài đặt API key Gemini" onClick={() => { setApiKeyDraft(apiKey); setApiKeyError(""); setApiKeySaved(false); setApiKeyDialogOpen(true); }}>
              <span>🔑</span><span>{apiKey ? "AI đã kết nối" : "Kết nối AI"}</span>
            </button>
            <button className="profile-switch" onClick={() => setShowProfileMenu((open) => !open)}><span className={`profile-icon tiny ${profile.color}`}>{profile.icon}</span><span>{profile.title}</span><span>⌄</span></button>
            {showProfileMenu && <div className="profile-menu">{profiles.map((item) => <button key={item.id} onClick={() => { selectProfile(item.id); setShowProfileMenu(false); }}><span>{item.icon}</span>{item.title}</button>)}</div>}
          </div>
        </header>
        <div className="content-wrap">
          {progressLoaded && !apiKey && <section className="api-reminder"><span>🔑</span><div><strong>Kết nối AI để bắt đầu học cùng Maya</strong><p>Thêm Gemini API key riêng. Key và tiến độ chỉ lưu trên thiết bị này.</p></div><button onClick={() => { setApiKeyDialogOpen(true); setApiKeyError(""); }}>Thiết lập AI</button></section>}
          {section === "home" && renderHome()}
          {section === "practice" && <><div className="section-heading practice-heading"><div><span className="eyebrow">NÓI, HỌC VÀ TIẾN BỘ</span><h2>Cùng nhau luyện tập nhé</h2></div><button className="text-button" onClick={() => setSection("profiles")}>Đổi lĩnh vực ↗</button></div>{renderPractice()}</>}
          {section === "placement" && renderPlacement()}
          {section === "profiles" && renderProfiles()}
          {section === "progress" && renderProgress()}
        </div>
        <footer className="site-footer">Dành cho khoảnh khắc bạn nghĩ: “Mình làm được!” <span>✦</span></footer>
      </section>
      <nav className="mobile-nav">{nav.map((item) => <button key={item.id} className={section === item.id ? "mobile-nav-item selected" : "mobile-nav-item"} onClick={() => setSection(item.id)}><span>{item.icon}</span><small>{item.label}</small></button>)}</nav>
      {apiKeyDialogOpen && (
        <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setApiKeyDialogOpen(false); }}>
          <section className="api-key-dialog" role="dialog" aria-modal="true" aria-labelledby="api-key-title">
            <button className="dialog-close" aria-label="Đóng" onClick={() => setApiKeyDialogOpen(false)}>×</button>
            <span className="api-key-icon">🔑</span>
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
