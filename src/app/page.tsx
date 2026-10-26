"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import packageJson from "../../package.json";
import { getAudioData } from "@/lib/gemini";
import {
  AiModel,
  AiProvider,
  DEFAULT_MODELS,
  OPENAI_SPEECH_VOICES,
  fetchAiModels,
  fetchGoogleSpeechVoices,
  generateAiText,
  generateGeminiMultimodalResponse,
  generateProviderSpeech,
  isAiProvider,
  transcribeWithOpenAi,
} from "@/lib/ai-providers";
import { grammarTopics } from "@/lib/grammar";
import {
  GoogleSpeechVoice,
  SPEECH_DELIVERY_STYLES,
  SpeechDeliveryStyle,
  SpeechVoiceId,
  clearSpeechCache,
  getCachedSpeech,
  isSpeechVoiceId,
  saveCachedSpeech,
} from "@/lib/speech";
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

type Section = "home" | "lessons" | "practice" | "profiles" | "progress" | "placement" | "grammar" | "library" | "settings";
type CourseLevel = "A1" | "A2" | "B1" | "B2";
const COURSE_LEVELS: CourseLevel[] = ["A1", "A2", "B1", "B2"];
function isCourseLevel(value: string): value is CourseLevel {
  return COURSE_LEVELS.includes(value as CourseLevel);
}
type HelpContent = { title: string; description: string; steps: string[] };
type ApiKeyEntry = { id: string; label: string; value: string };
type ProviderRecord<T> = Record<AiProvider, T>;
type AppTheme = "mint" | "blue" | "burgundy";
type VersionCheckStatus = "checking" | "latest" | "update-available" | "error";
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
const PAGE_HELP: Record<Section, HelpContent> = {
  home: {
    title: "Trang chủ",
    description: "Bắt đầu học, chọn lĩnh vực và xem nhanh tiến độ của bạn.",
    steps: [
      "Nhấn “Bắt đầu luyện nói” để vào cuộc trò chuyện với gia sư AI.",
      "Chọn lĩnh vực ở các thẻ bên dưới để đổi tình huống và cụm từ luyện tập.",
      "Dùng “Kiểm tra trình độ” để app gợi ý mức học ban đầu.",
      "Chọn “Cài Teacher AI lên màn hình chính” để xem cách thêm ứng dụng vào thiết bị.",
    ],
  },
  practice: {
    title: "Gia sư AI online",
    description: "Đây là khu vực hội thoại thực hành tiếng Anh theo lĩnh vực đang chọn. Gia sư AI sẽ trao đổi theo tình huống và trình độ của bạn.",
    steps: [
      "Đọc tình huống và câu mẫu ở khung bên trái; bấm “Nghe mẫu phát âm” để nghe.",
      "Nhập câu trả lời tiếng Anh ở ô trò chuyện hoặc nhấn micro để trả lời bằng giọng nói.",
      "Dùng các nút yêu cầu nhanh để bắt đầu bài học, hỏi giải thích, xin thêm bài tập hoặc ôn phát âm.",
      "Nhấn “Luyện phát âm”, đọc câu gợi ý rồi dừng ghi âm để nhận góp ý từ AI. Cần cấp quyền micro và kết nối AI.",
      "Đổi lĩnh vực từ mục “Lĩnh vực” nếu muốn luyện tình huống khác.",
    ],
  },
  profiles: {
    title: "Lĩnh vực muốn học",
    description: "Chọn lĩnh vực trước, sau đó chọn học theo giáo trình offline hoặc luyện giao tiếp với gia sư AI.",
    steps: [
      "Chọn một thẻ lĩnh vực để đặt làm chủ đề học hiện tại.",
      "Sau khi chọn, vào Bài học để học giáo trình offline hoặc Gia sư AI để luyện hội thoại online.",
      "Mỗi lĩnh vực có tình huống, câu nói hữu ích và ngữ cảnh riêng cho gia sư AI.",
      "Chọn thẻ “Tiếng Anh ngữ pháp” để mở bài học cấu trúc và bài tập.",
      "Mở Cài đặt để tải giáo trình và audio dùng offline.",
    ],
  },
  lessons: {
    title: "Bài học theo giáo trình",
    description: "Học theo lộ trình offline riêng, từng bài và từng cấp độ. Bài học cần được tải về trước trong Cài đặt.",
    steps: [
      "Chọn một lĩnh vực để xem hai cách học riêng: giáo trình offline và gia sư AI online.",
      "Nếu thẻ giáo trình đang mờ, mở Cài đặt → Giáo trình offline để tải gói bài học.",
      "Hoàn thành từng bài với ít nhất 70% để đánh dấu hoàn tất; làm bài kiểm tra cuối level đạt ít nhất 90% để mở level kế tiếp.",
      "Chọn Gia sư AI khi muốn luyện hội thoại online theo lĩnh vực và trình độ.",
    ],
  },
  progress: {
    title: "Tiến độ học tập",
    description: "Xem thời lượng, số buổi, trình độ ước tính và chuỗi ngày học được lưu trên thiết bị này.",
    steps: [
      "Các thống kê được cập nhật khi bạn hoàn thành hoạt động học trong ứng dụng.",
      "Nhấn “Luyện tập hôm nay” hoặc “Bắt đầu trò chuyện” để tiếp tục học.",
      "Tiến độ được lưu cục bộ trong trình duyệt, không tự đồng bộ sang thiết bị khác.",
    ],
  },
  placement: {
    title: "Kiểm tra trình độ",
    description: "Bài sàng lọc ngắn giúp ước lượng mức bắt đầu từ A1 đến B2 để điều chỉnh việc học.",
    steps: [
      "Chọn một đáp án cho từng câu hỏi.",
      "Khi đã trả lời đủ câu, nhấn “Xem trình độ của tôi”.",
      "Kết quả chỉ mang tính tham khảo, không thay thế bài đánh giá CEFR chính thức; bạn có thể làm lại.",
    ],
  },
  grammar: {
    title: "Ngữ pháp",
    description: "Chọn cấu trúc theo trình độ CEFR để học cách dùng, xem ví dụ và làm bài trắc nghiệm.",
    steps: ["Chọn cấp độ A1, A2, B1 hoặc B2.", "Mở một cấu trúc để xem hướng dẫn, ví dụ và bài tập.", "Điểm cao nhất của từng chủ đề được lưu trên thiết bị."],
  },
  library: {
    title: "Tài liệu cá nhân",
    description: "Quản lý tài liệu học do bạn thêm vào bộ nhớ trình duyệt trên thiết bị này.",
    steps: [
      "Chọn thêm tài liệu và nhập tệp PDF, audio, TXT hoặc MD được hỗ trợ.",
      "Chọn một tài liệu trong danh sách để mở hoặc phát.",
      "Xóa dữ liệu website/trình duyệt có thể xóa các tệp đã lưu; hãy giữ bản gốc riêng.",
    ],
  },
  settings: {
    title: "Cài đặt chung",
    description: "Điều chỉnh ứng dụng, nhà cung cấp AI, giọng đọc và các lựa chọn lưu trên thiết bị.",
    steps: [
      "Chọn giao diện và cỡ chữ phù hợp.",
      "Nhấn vào từng nhóm cài đặt để mở danh sách chi tiết.",
      "Tải, mở hoặc xóa giáo trình offline trong nhóm “Giáo trình offline”.",
      "Thêm API key Google AI hoặc OpenAI để dùng hội thoại, giọng đọc và các tính năng AI; key được lưu trong trình duyệt này.",
      "Chọn mô hình và giọng đọc. Audio được tạo khi bạn nghe thử/phát câu, rồi lưu trên thiết bị để nghe lại.",
      "Xem phiên bản ứng dụng và kiểm tra bản cập nhật ở cuối trang.",
      "Có thể cài Teacher AI lên màn hình chính theo hướng dẫn ở đầu trang.",
    ],
  },
};
const APP_VERSION = packageJson.version;
const API_KEY_STORAGE = "lingua-gemini-api-key";
const AI_SETTINGS_STORAGE = "lingua-ai-settings";
const FONT_SCALE_STORAGE = "lingua-font-scale";
const APP_THEME_STORAGE = "lingua-app-theme";
const SPEECH_VOICE_STORAGE = "lingua-speech-voice";
const GOOGLE_SPEECH_VOICES_STORAGE = "lingua-google-speech-voices-v2";
const SPEECH_DELIVERY_STYLE_STORAGE = "lingua-speech-delivery-style";
const SPEECH_SAMPLE = "The nurse is speaking to a patient. Please check the pressure carefully.";
const GOOGLE_ACCENT_LABELS: Record<string, string> = {
  American: "Mỹ",
  Australian: "Úc",
  British: "Anh",
  Indian: "Ấn Độ",
  Chinese: "Trung Quốc",
  German: "Đức",
};
function getGoogleAccentLabel(accent: string): string {
  const normalized = accent.toLowerCase();
  if (normalized.includes("american") || normalized.includes("united states") || normalized.includes("usa")) return "Mỹ";
  if (normalized.includes("australian") || normalized.includes("australia")) return "Úc";
  if (normalized.includes("british") || normalized.includes("united kingdom") || normalized.includes("uk")) return "Anh";
  if (normalized.includes("indian") || normalized.includes("india")) return "Ấn Độ";
  if (normalized.includes("chinese") || normalized.includes("china")) return "Trung Quốc";
  if (normalized.includes("german") || normalized.includes("germany")) return "Đức";
  return GOOGLE_ACCENT_LABELS[accent] ?? accent;
}
const OPENAI_ACCENTS = [
  "American",
  "Australian",
  "British",
  "Indian",
  "Chinese",
  "German",
] as const;
const QUICK_TEACHER_REQUESTS = [
  { label: "Bắt đầu bài học", prompt: "Teach me a short lesson for my English level. Start with a simple explanation and one example, then ask me one practice question." },
  { label: "Giải thích dễ hiểu hơn", prompt: "I do not fully understand the last point. Please explain it more simply, give me a different example, and check whether I understand." },
  { label: "Luyện thêm bài tập", prompt: "Give me three extra practice questions about the topic we are studying. Ask one question at a time and wait for my answer." },
  { label: "Ôn phát âm", prompt: "Help me practice pronunciation. Give me one short English sentence, mark the word stress, and ask me to repeat it." },
];

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
    scene: "Trao đổi trong cuộc họp",
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
  const [fontScale, setFontScale] = useState(125);
  const [fontScaleLoaded, setFontScaleLoaded] = useState(false);
  const [fontScaleError, setFontScaleError] = useState("");
  const [appTheme, setAppTheme] = useState<AppTheme>("mint");
  const [appThemeLoaded, setAppThemeLoaded] = useState(false);
  const [appThemeError, setAppThemeError] = useState("");
  const [versionCheckStatus, setVersionCheckStatus] = useState<VersionCheckStatus>("checking");
  const [latestVersion, setLatestVersion] = useState("");
  const [versionCheckError, setVersionCheckError] = useState("");
  const [versionCheckAttempt, setVersionCheckAttempt] = useState(0);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [appInstalled, setAppInstalled] = useState(false);
  const [installError, setInstallError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [progress, setProgress] = useState<LearningProgress>(emptyProgress);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [aiSettingsLoaded, setAiSettingsLoaded] = useState(false);
  const [aiProvider, setAiProvider] = useState<AiProvider>("google");
  const [apiKeys, setApiKeys] = useState<ProviderRecord<ApiKeyEntry[]>>({ google: [], openai: [] });
  const [activeKeyIds, setActiveKeyIds] = useState<ProviderRecord<string>>({ google: "", openai: "" });
  const [selectedModels, setSelectedModels] = useState<ProviderRecord<string>>({ ...DEFAULT_MODELS });
  const [modelCatalog, setModelCatalog] = useState<ProviderRecord<AiModel[]>>({ google: [], openai: [] });
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [apiKeyLabelDraft, setApiKeyLabelDraft] = useState("");
  const [apiKeyBusy, setApiKeyBusy] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [modelsBusy, setModelsBusy] = useState(false);
  const [modelsError, setModelsError] = useState("");
  const [googleSpeechVoices, setGoogleSpeechVoices] = useState<GoogleSpeechVoice[]>([]);
  const [speechVoicesBusy, setSpeechVoicesBusy] = useState(false);
  const [speechVoicesError, setSpeechVoicesError] = useState("");
  const [speechVoice, setSpeechVoice] = useState<SpeechVoiceId>("Kore");
  const [speechDeliveryStyle, setSpeechDeliveryStyle] = useState<SpeechDeliveryStyle>("balanced");
  const [openAiSpeechVoice, setOpenAiSpeechVoice] = useState<string>("coral");
  const [openAiSpeechAccent, setOpenAiSpeechAccent] = useState<string>("American");
  const [speechBusy, setSpeechBusy] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [speechNotice, setSpeechNotice] = useState("");
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
  const [grammarTopicId, setGrammarTopicId] = useState<string | null>(null);
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
  const [courseLessonScores, setCourseLessonScores] = useState<Record<string, Record<string, number>>>({});
  const [courseLevelResults, setCourseLevelResults] = useState<Record<string, Partial<Record<CourseLevel, number>>>>({});
  const [courseExamLevel, setCourseExamLevel] = useState<CourseLevel | null>(null);
  const [courseExamAnswers, setCourseExamAnswers] = useState<number[]>([]);
  const [courseExamSubmitted, setCourseExamSubmitted] = useState(false);
  const [offlineAudioUrl, setOfflineAudioUrl] = useState("");
  const [personalMaterials, setPersonalMaterials] = useState<PersonalMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<PersonalMaterial | null>(null);
  const [materialUrl, setMaterialUrl] = useState("");
  const [materialText, setMaterialText] = useState("");
  const [materialBusy, setMaterialBusy] = useState(false);
  const [materialError, setMaterialError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const voiceChatRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChatStreamRef = useRef<MediaStream | null>(null);
  const voiceChatChunksRef = useRef<Blob[]>([]);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const speechAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechObjectUrlRef = useRef<string | null>(null);
  const materialInputRef = useRef<HTMLInputElement | null>(null);
  const sectionHistoryRef = useRef<Section[]>([]);

  const apiKey = apiKeys[aiProvider].find((entry) => entry.id === activeKeyIds[aiProvider])?.value ?? "";
  const activeModel = selectedModels[aiProvider] || DEFAULT_MODELS[aiProvider];
  const activeSpeechVoice = aiProvider === "google" ? speechVoice : openAiSpeechVoice;
  const activeSpeechAccent = aiProvider === "google"
    ? googleSpeechVoices.find((voice) => voice.id === speechVoice)?.accent ?? ""
    : openAiSpeechAccent;
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

  function navigateToSection(nextSection: Section) {
    if (nextSection === section) return;
    sectionHistoryRef.current.push(section);
    setSection(nextSection);
  }

  function returnToGrammarTopics() {
    setGrammarTopicId(null);
    setGrammarAnswers([]);
    setGrammarSubmitted(false);
    setGrammarError("");
  }

  function goBack() {
    if (section === "grammar" && grammarTopicId) {
      returnToGrammarTopics();
      return;
    }
    const previousSection = sectionHistoryRef.current.pop();
    if (previousSection) {
      setSection(previousSection);
      return;
    }
    if (section !== "home") setSection("home");
  }

  useEffect(() => {
    try {
      const savedScale = Number(localStorage.getItem(FONT_SCALE_STORAGE));
      if (Number.isFinite(savedScale) && savedScale >= 100 && savedScale <= 150) {
        setFontScale(savedScale);
      }
    } catch {
      setFontScaleError("Không thể đọc cỡ chữ đã lưu trên thiết bị này.");
    }
    setFontScaleLoaded(true);
    const savedProgress = loadProgress();
    setProgress(savedProgress);
    const selectedProfile = profiles.find((item) => item.id === savedProgress.profile);
    if (selectedProfile) {
      setMessages(loadMessages(selectedProfile.id) ?? [{ role: "assistant", content: selectedProfile.prompt }]);
    }
    try {
      const savedSettings = localStorage.getItem(AI_SETTINGS_STORAGE);
      const legacyApiKey = localStorage.getItem(API_KEY_STORAGE)?.trim() ?? "";
      if (savedSettings) {
        const parsed: unknown = JSON.parse(savedSettings);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          throw new Error("Cài đặt AI đã lưu không đúng định dạng.");
        }
        const stored = parsed as Record<string, unknown>;
        if (typeof stored.provider === "string" && isAiProvider(stored.provider)) setAiProvider(stored.provider);
        if (typeof stored.keys === "object" && stored.keys !== null && !Array.isArray(stored.keys)) {
          const storedKeys = stored.keys as Record<string, unknown>;
          const validKeys = (value: unknown): ApiKeyEntry[] => Array.isArray(value)
            ? value.flatMap((entry): ApiKeyEntry[] =>
                typeof entry === "object" && entry !== null &&
                "id" in entry && typeof entry.id === "string" &&
                "label" in entry && typeof entry.label === "string" &&
                "value" in entry && typeof entry.value === "string" && entry.value.trim()
                  ? [{ id: entry.id, label: entry.label, value: entry.value.trim() }]
                  : [])
            : [];
          const keys = { google: validKeys(storedKeys.google), openai: validKeys(storedKeys.openai) };
          setApiKeys(keys);
          const storedIds = typeof stored.activeKeyIds === "object" && stored.activeKeyIds !== null
            ? stored.activeKeyIds as Record<string, unknown>
            : {};
          setActiveKeyIds({
            google: typeof storedIds.google === "string" && keys.google.some((entry) => entry.id === storedIds.google)
              ? storedIds.google : keys.google[0]?.id ?? "",
            openai: typeof storedIds.openai === "string" && keys.openai.some((entry) => entry.id === storedIds.openai)
              ? storedIds.openai : keys.openai[0]?.id ?? "",
          });
        }
        if (typeof stored.selectedModels === "object" && stored.selectedModels !== null) {
          const models = stored.selectedModels as Record<string, unknown>;
          setSelectedModels({
            google: typeof models.google === "string" ? models.google : DEFAULT_MODELS.google,
            openai: typeof models.openai === "string" ? models.openai : DEFAULT_MODELS.openai,
          });
        }
      } else if (legacyApiKey) {
        const legacyEntry = { id: "legacy-google-key", label: "Gemini (cũ)", value: legacyApiKey };
        setApiKeys({ google: [legacyEntry], openai: [] });
        setActiveKeyIds({ google: legacyEntry.id, openai: "" });
      }
    } catch (error) {
      setApiKeyError(error instanceof Error
        ? error.message
        : "Không thể đọc cài đặt AI đã lưu trên thiết bị.");
    }
    setAiSettingsLoaded(true);
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
    try {
      const savedLessonScores: unknown = JSON.parse(localStorage.getItem("lingua-course-lesson-scores") ?? "{}");
      if (typeof savedLessonScores === "object" && savedLessonScores !== null && !Array.isArray(savedLessonScores)) {
        const validScores = Object.fromEntries(
          Object.entries(savedLessonScores).flatMap(([courseId, scores]) => {
            if (typeof scores !== "object" || scores === null || Array.isArray(scores)) return [];
            const lessonScores = Object.fromEntries(
              Object.entries(scores).filter((entry): entry is [string, number] =>
                typeof entry[1] === "number" && Number.isInteger(entry[1]) && entry[1] >= 0 && entry[1] <= 100),
            );
            return [[courseId, lessonScores]];
          }),
        );
        setCourseLessonScores(validScores);
      }
    } catch {
      setCourseError("Không thể đọc điểm bài học đã lưu trên thiết bị này.");
    }
    try {
      const savedLevelResults: unknown = JSON.parse(localStorage.getItem("lingua-course-level-results") ?? "{}");
      if (typeof savedLevelResults === "object" && savedLevelResults !== null && !Array.isArray(savedLevelResults)) {
        const validResults = Object.fromEntries(
          Object.entries(savedLevelResults).flatMap(([courseId, results]) => {
            if (typeof results !== "object" || results === null || Array.isArray(results)) return [];
            const validLevels = Object.fromEntries(
              Object.entries(results).filter(([level, score]) =>
                isCourseLevel(level) &&
                typeof score === "number" && Number.isInteger(score) && score >= 0 && score <= 100),
            ) as Partial<Record<CourseLevel, number>>;
            return [[courseId, validLevels]];
          }),
        );
        setCourseLevelResults(validResults);
      }
    } catch {
      setCourseError("Không thể đọc kết quả kiểm tra level đã lưu trên thiết bị này.");
    }
    void listDownloadedCourses()
      .then(setCoursePacks)
      .catch((error: unknown) => {
        setCourseError(error instanceof Error ? error.message : "Không thể đọc các giáo trình offline trên thiết bị.");
      });
    void listPersonalMaterials()
      .then(setPersonalMaterials)
      .catch((error: unknown) => {
        setMaterialError(error instanceof Error ? error.message : "Không thể đọc thư viện cá nhân trên thiết bị.");
      });
    setProgressLoaded(true);
  }, []);

  useEffect(() => {
    if (!fontScaleLoaded) return;
    document.documentElement.style.setProperty("--font-scale", String(fontScale / 100));
    try {
      localStorage.setItem(FONT_SCALE_STORAGE, String(fontScale));
    } catch {
      setFontScaleError("Không thể lưu cỡ chữ trên thiết bị này.");
    }
  }, [fontScale, fontScaleLoaded]);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(APP_THEME_STORAGE);
      if (savedTheme === "mint" || savedTheme === "burgundy" || savedTheme === "blue") {
        setAppTheme(savedTheme);
      }
    } catch {
      setAppThemeError("Không thể đọc giao diện đã lưu trên thiết bị này.");
    }
    setAppThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!appThemeLoaded) return;
    document.documentElement.dataset.theme = appTheme;
    try {
      localStorage.setItem(APP_THEME_STORAGE, appTheme);
    } catch {
      setAppThemeError("Không thể lưu giao diện trên thiết bị này.");
    }
  }, [appTheme, appThemeLoaded]);

  useEffect(() => {
    let cancelled = false;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

    async function checkLatestVersion() {
      setVersionCheckStatus("checking");
      setVersionCheckError("");
      try {
        const response = await fetch(`${basePath}/version.json?check=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Không thể kiểm tra phiên bản mới nhất (HTTP ${response.status}).`);
        }
        const versionInfo: unknown = await response.json();
        if (
          typeof versionInfo !== "object" ||
          versionInfo === null ||
          !("version" in versionInfo) ||
          typeof versionInfo.version !== "string" ||
          !/^\d+\.\d+\.\d+$/.test(versionInfo.version)
        ) {
          throw new Error("Thông tin phiên bản trên máy chủ không hợp lệ.");
        }
        if (cancelled) return;

        const remoteVersion = versionInfo.version;
        setLatestVersion(remoteVersion);
        const current = APP_VERSION.split(".").map(Number);
        const remote = remoteVersion.split(".").map(Number);
        const isNewer = remote.some((part, index) => part > current[index] && remote.slice(0, index).every((value, priorIndex) => value === current[priorIndex]));
        setVersionCheckStatus(isNewer ? "update-available" : "latest");
      } catch (error) {
        if (cancelled) return;
        setVersionCheckError(error instanceof Error ? error.message : "Không thể kiểm tra phiên bản mới nhất.");
        setVersionCheckStatus("error");
      }
    }

    void checkLatestVersion();
    return () => { cancelled = true; };
  }, [versionCheckAttempt]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onAppInstalled = () => {
      setAppInstalled(true);
      setInstallPrompt(null);
      setInstallError("");
    };
    setAppInstalled(window.matchMedia("(display-mode: standalone)").matches);
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!showHelp) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowHelp(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showHelp]);

  useEffect(() => {
    try {
      const storedVoices: unknown = JSON.parse(localStorage.getItem(GOOGLE_SPEECH_VOICES_STORAGE) ?? "[]");
      if (Array.isArray(storedVoices)) {
        setGoogleSpeechVoices(storedVoices.filter((voice): voice is GoogleSpeechVoice =>
          typeof voice === "object" && voice !== null &&
          "id" in voice && typeof voice.id === "string" && isSpeechVoiceId(voice.id) &&
          "label" in voice && typeof voice.label === "string" &&
          "gender" in voice && (voice.gender === "male" || voice.gender === "female") &&
          "accent" in voice && typeof voice.accent === "string" &&
          "description" in voice && typeof voice.description === "string").slice(0, 20));
      }
      const savedVoice = localStorage.getItem(`${SPEECH_VOICE_STORAGE}-${aiProvider}`);
      if (aiProvider === "google") {
        const legacyVoice = localStorage.getItem(SPEECH_VOICE_STORAGE);
        const googleVoice = savedVoice ?? legacyVoice;
        if (googleVoice && isSpeechVoiceId(googleVoice)) setSpeechVoice(googleVoice);
      } else if (savedVoice && OPENAI_SPEECH_VOICES.some((voice) => voice.id === savedVoice)) {
        setOpenAiSpeechVoice(savedVoice);
      }
      const savedAccent = localStorage.getItem("lingua-speech-accent-openai");
      if (savedAccent && OPENAI_ACCENTS.includes(savedAccent as (typeof OPENAI_ACCENTS)[number])) {
        setOpenAiSpeechAccent(savedAccent);
      }
      const savedDeliveryStyle = localStorage.getItem(SPEECH_DELIVERY_STYLE_STORAGE);
      if (SPEECH_DELIVERY_STYLES.some((style) => style.id === savedDeliveryStyle)) {
        setSpeechDeliveryStyle(savedDeliveryStyle as SpeechDeliveryStyle);
      }
    } catch {
      setSpeechError("Không thể đọc lựa chọn giọng đọc đã lưu trên thiết bị.");
    }
  }, [aiProvider]);

  useEffect(() => {
    if (googleSpeechVoices.length === 0) return;
    try {
      localStorage.setItem(GOOGLE_SPEECH_VOICES_STORAGE, JSON.stringify(googleSpeechVoices));
    } catch {
      setSpeechVoicesError("Không thể lưu danh sách giọng đọc trên thiết bị này.");
    }
  }, [googleSpeechVoices]);

  useEffect(() => {
    if (!aiSettingsLoaded) return;
    try {
      localStorage.setItem(AI_SETTINGS_STORAGE, JSON.stringify({
        provider: aiProvider,
        keys: apiKeys,
        activeKeyIds,
        selectedModels,
      }));
      localStorage.removeItem(API_KEY_STORAGE);
    } catch {
      setApiKeyError("Không thể lưu cài đặt AI trên trình duyệt này.");
    }
  }, [aiProvider, apiKeys, activeKeyIds, selectedModels, aiSettingsLoaded]);

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
    speechAudioRef.current?.pause();
    if (speechObjectUrlRef.current) URL.revokeObjectURL(speechObjectUrlRef.current);
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
    setSelectedCourseId("");
    setSelectedLessonId("");
    setCourseExamLevel(null);
    setCourseExamAnswers([]);
    setCourseExamSubmitted(false);
    navigateToSection("lessons");
  }

  async function withAvailableApiKey<T>(operation: (key: string) => Promise<T>): Promise<T> {
    const keys = apiKeys[aiProvider];
    if (!keys.length) {
      throw new Error(`Chưa có API key ${aiProvider === "google" ? "Google AI" : "OpenAI"}. Hãy thêm key trong mục Cài đặt.`);
    }
    const activeIndex = keys.findIndex((entry) => entry.id === activeKeyIds[aiProvider]);
    const orderedKeys = activeIndex < 0
      ? keys
      : [...keys.slice(activeIndex), ...keys.slice(0, activeIndex)];
    let lastError: unknown;
    for (const [index, entry] of orderedKeys.entries()) {
      try {
        const result = await operation(entry.value);
        if (activeKeyIds[aiProvider] !== entry.id) {
          setActiveKeyIds((current) => ({ ...current, [aiProvider]: entry.id }));
        }
        return result;
      } catch (error) {
        lastError = error;
        const canRotate = error instanceof Error &&
          (/HTTP (401|403|429)\b/.test(error.message) ||
            (/HTTP 400\b/.test(error.message) && /api[\s_-]?key|API_KEY_INVALID/i.test(error.message)));
        if (!canRotate || index === orderedKeys.length - 1) throw error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Không thể hoàn tất yêu cầu với các API key đã lưu.");
  }

  async function sendMessage(event?: FormEvent, requestedPrompt?: string) {
    event?.preventDefault();
    const content = (requestedPrompt ?? draft).trim();
    if (!content || chatBusy) return;
    if (!apiKey) {
      setChatError(`Hãy thêm API key ${aiProvider === "google" ? "Google AI" : "OpenAI"} trong mục Cài đặt để bắt đầu trò chuyện.`);
      return;
    }
    const conversation = [...messages, { role: "user" as const, content }];
    setMessages(conversation);
    setDraft("");
    setChatBusy(true);
    setChatError("");
    try {
      const systemPrompt = `You are Maya, a warm, patient, interactive English tutor for a Vietnamese learner. The learner selected "${profile.title}" and is estimated at CEFR ${progress.level}. Teach at their level, adapt based on their answers, explain mistakes kindly, and ask one focused follow-up question at a time. Keep lesson material, exercises, examples, and quiz questions in English only; do not place Vietnamese translations beside them. If they ask in Vietnamese or explicitly request an explanation in Vietnamese, explain briefly in Vietnamese, then continue English practice. Never claim to measure pronunciation from text. Keep each answer under 120 words unless they ask for a detailed explanation.`;
      const reply = await withAvailableApiKey((key) =>
        generateAiText(aiProvider, key, activeModel, systemPrompt, conversation.slice(-12)));
      setMessages((current) => [...current, { role: "assistant", content: reply }]);
      setProgress((current) => recordPractice(current, 2, !practiceSessionCounted.current));
      practiceSessionCounted.current = true;
      void playSpeech(reply);
    } catch (error) {
      const timedOut = error instanceof Error &&
        (error.name === "TimeoutError" || /signal timed out|timed out|timeout/i.test(error.message));
      setChatError(timedOut
        ? "AI chưa phản hồi trong 30 giây. Hãy kiểm tra kết nối Internet, mô hình và API key trong Cài đặt rồi thử lại."
        : error instanceof Error ? error.message : "Gia sư chưa thể trả lời. Bạn vui lòng thử lại nhé.");
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
      setVoiceError(`Hãy thêm API key ${aiProvider === "google" ? "Google AI" : "OpenAI"} trong mục Cài đặt để bắt đầu trò chuyện.`);
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
          let learnerMessage = "";
          let coachMessage = "";
          if (aiProvider === "google") {
            const audio = await getAudioData(blob);
            const response = await withAvailableApiKey((key) => generateGeminiMultimodalResponse(key, [
              {
                text: `You are Maya, a warm English tutor for a Vietnamese learner. Their profile is "${profile.title}" and CEFR level is "${progress.level}". Transcribe what they said in the language they used, then reply as their teacher. Keep teaching material and practice in English; answer questions in Vietnamese when asked. Keep the reply under 100 words. Conversation so far:\n${transcript}\nReturn ONLY valid JSON: {"transcript":"what the learner said","reply":"your level-appropriate coach response"}.`,
              },
              { inlineData: audio },
            ], activeModel));
            const data: unknown = JSON.parse(response.replace(/^```(?:json)?\s*|\s*```$/g, ""));
            if (typeof data !== "object" || data === null || !("transcript" in data) ||
                typeof data.transcript !== "string" || !("reply" in data) ||
                typeof data.reply !== "string" || !data.transcript.trim() || !data.reply.trim()) {
              throw new Error("Gia sư AI trả lời không đúng định dạng. Vui lòng thử lại.");
            }
            learnerMessage = data.transcript.trim();
            coachMessage = data.reply.trim();
          } else {
            learnerMessage = await withAvailableApiKey((key) => transcribeWithOpenAi(key, blob));
            coachMessage = await withAvailableApiKey((key) => generateAiText(
              aiProvider,
              key,
              activeModel,
              `You are Maya, a warm English tutor for a Vietnamese learner studying "${profile.title}" at CEFR ${progress.level}. Respond to the learner's transcribed voice message in context. Adapt to their level, answer questions, and ask one focused follow-up question. Keep lessons and practice in English, but explain in Vietnamese when they ask. Keep your answer under 100 words.`,
              [...messages.slice(-12), { role: "user", content: learnerMessage }],
            ));
          }
          setMessages((current) => [
            ...current,
            { role: "user", content: learnerMessage },
            { role: "assistant", content: coachMessage },
          ]);
          setProgress((current) => recordPractice(current, 2, !practiceSessionCounted.current));
          practiceSessionCounted.current = true;
          void playSpeech(coachMessage);
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
    if (aiProvider !== "google") {
      setVoiceError("Phản hồi phát âm trực tiếp từ âm thanh hiện cần chọn Google AI trong Cài đặt. OpenAI vẫn dùng được cho hội thoại và nhập giọng nói.");
      return;
    }
    if (!apiKey) {
      setVoiceError("Hãy thêm Google AI API key trong mục Cài đặt để nhận góp ý phát âm.");
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
          const response = await withAvailableApiKey((key) => generateGeminiMultimodalResponse(key, [
            {
              text: `Listen to the learner's recording and evaluate how understandable their pronunciation is for the exact English phrase: "${profile.words[0]}". Be supportive and specific. Do not infer accent or identity. Treat this as an approximate AI coaching aid, not a certified pronunciation test. Return ONLY valid JSON with these fields: {"score": integer 0-100, "heard": short transcript of what you heard, "feedback": one or two concise sentences in Vietnamese, "soundsToPractice": array of at most 3 short English words or sounds}. If audio is unclear, say so in feedback and give a low-confidence score.`,
            },
            { inlineData: audio },
          ], activeModel));
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
      setApiKeyError(`Vui lòng nhập API key ${aiProvider === "google" ? "Google AI" : "OpenAI"}.`);
      return;
    }
    setApiKeyBusy(true);
    setApiKeyError("");
    setApiKeySaved(false);
    try {
      const models = await fetchAiModels(aiProvider, candidate);
      const entry = {
        id: crypto.randomUUID(),
        label: apiKeyLabelDraft.trim() || `${aiProvider === "google" ? "Google" : "OpenAI"} key ${apiKeys[aiProvider].length + 1}`,
        value: candidate,
      };
      setApiKeys((current) => ({ ...current, [aiProvider]: [...current[aiProvider], entry] }));
      setActiveKeyIds((current) => ({ ...current, [aiProvider]: entry.id }));
      setModelCatalog((current) => ({ ...current, [aiProvider]: models }));
      if (!models.some((model) => model.id === selectedModels[aiProvider])) {
        setSelectedModels((current) => ({ ...current, [aiProvider]: models[0]?.id ?? DEFAULT_MODELS[aiProvider] }));
      }
      setApiKeyDraft("");
      setApiKeyLabelDraft("");
      setApiKeySaved(true);
    } catch (error) {
      setApiKeyError(error instanceof Error ? error.message : "Không thể xác thực API key. Vui lòng thử lại.");
    } finally {
      setApiKeyBusy(false);
    }
  }

  async function loadModels() {
    if (!apiKey) {
      setModelsError(`Hãy lưu ít nhất một API key ${aiProvider === "google" ? "Google AI" : "OpenAI"} trước.`);
      return;
    }
    setModelsBusy(true);
    setModelsError("");
    try {
      const models = await withAvailableApiKey((key) => fetchAiModels(aiProvider, key));
      setModelCatalog((current) => ({ ...current, [aiProvider]: models }));
      if (!models.some((model) => model.id === selectedModels[aiProvider])) {
        setSelectedModels((current) => ({ ...current, [aiProvider]: models[0]?.id ?? DEFAULT_MODELS[aiProvider] }));
      }
    } catch (error) {
      setModelsError(error instanceof Error ? error.message : "Không thể tải danh sách mô hình.");
    } finally {
      setModelsBusy(false);
    }
  }

  async function loadSpeechVoices() {
    if (aiProvider !== "google") {
      setSpeechVoicesError("Danh sách giọng có thông tin giới tính và vùng phát âm hiện được cung cấp bởi Google Gemini.");
      return;
    }
    if (!apiKey) {
      setSpeechVoicesError("Hãy lưu API key Google AI trước khi tải danh sách giọng.");
      return;
    }
    setSpeechVoicesBusy(true);
    setSpeechVoicesError("");
    try {
      const catalog = await withAvailableApiKey((key) => fetchGoogleSpeechVoices(key));
      const voices = catalog.voices;
      setGoogleSpeechVoices(voices);
      setSpeechVoicesError(catalog.failedRegions.length
        ? `Không tải được danh mục cho các vùng: ${catalog.failedRegions.map(getGoogleAccentLabel).join(", ")}.`
        : "");
      if (!voices.some((voice) => voice.id === speechVoice)) {
        setSpeechVoice(voices[0]?.id ?? "Kore");
      }
    } catch (error) {
      setSpeechVoicesError(error instanceof Error ? error.message : "Không thể tải danh sách giọng đọc.");
    } finally {
      setSpeechVoicesBusy(false);
    }
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
  }

  function selectSpeechVoice(voice: string) {
    if (aiProvider === "google") {
      if (!isSpeechVoiceId(voice)) return;
      setSpeechVoice(voice);
    } else {
      if (!OPENAI_SPEECH_VOICES.some((item) => item.id === voice)) return;
      setOpenAiSpeechVoice(voice);
    }
    setSpeechError("");
    setSpeechNotice("");
    try {
      localStorage.setItem(`${SPEECH_VOICE_STORAGE}-${aiProvider}`, voice);
      if (aiProvider === "google" && isSpeechVoiceId(voice)) localStorage.setItem(SPEECH_VOICE_STORAGE, voice);
    } catch {
      setSpeechError("Không thể lưu lựa chọn giọng đọc trên thiết bị này.");
    }
  }

  function selectOpenAiSpeechAccent(accent: string) {
    if (!OPENAI_ACCENTS.includes(accent as (typeof OPENAI_ACCENTS)[number])) return;
    setOpenAiSpeechAccent(accent);
    setSpeechError("");
    setSpeechNotice("");
    try {
      localStorage.setItem("lingua-speech-accent-openai", accent);
    } catch {
      setSpeechError("Không thể lưu lựa chọn giọng vùng trên thiết bị này.");
    }
  }

  function selectSpeechDeliveryStyle(style: string) {
    if (!SPEECH_DELIVERY_STYLES.some((item) => item.id === style)) return;
    setSpeechDeliveryStyle(style as SpeechDeliveryStyle);
    setSpeechError("");
    setSpeechNotice("");
    try {
      localStorage.setItem(SPEECH_DELIVERY_STYLE_STORAGE, style);
    } catch {
      setSpeechError("Không thể lưu sắc thái giọng đọc trên thiết bị này.");
    }
  }

  async function removeSavedSpeech() {
    setSpeechError("");
    setSpeechNotice("");
    try {
      await clearSpeechCache();
      setSpeechNotice("Đã xóa các đoạn nghe đã lưu trên thiết bị.");
    } catch (error) {
      setSpeechError(error instanceof Error ? error.message : "Không thể xóa các đoạn nghe đã lưu.");
    }
  }

  function removeApiKey(id: string) {
    try {
      const remaining = apiKeys[aiProvider].filter((entry) => entry.id !== id);
      setApiKeys((current) => ({ ...current, [aiProvider]: remaining }));
      if (activeKeyIds[aiProvider] === id) {
        setActiveKeyIds((current) => ({ ...current, [aiProvider]: remaining[0]?.id ?? "" }));
      }
      setApiKeySaved(false);
      setApiKeyError("");
    } catch (error) {
      setApiKeyError(error instanceof Error ? error.message : "Không thể xóa API key khỏi bộ nhớ trình duyệt.");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      setSelectedLessonId(
        course.lessons.find((item) => item.level === progress.level)?.id ??
        course.lessons[0]?.id ??
        "",
      );
      const nextProfile = profiles.find((item) => item.id === courseId);
      if (nextProfile) {
        setProgress((current) => ({ ...current, profile: courseId }));
        setMessages(loadMessages(courseId) ?? [{ role: "assistant", content: nextProfile.prompt }]);
      }
      setCourseAnswers([]);
      setCourseQuizSubmitted(false);
      setCourseExamLevel(null);
      setCourseExamAnswers([]);
      setCourseExamSubmitted(false);
      navigateToSection("lessons");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setCourseError(/HTTP 404/.test(message)
        ? "Gói giáo trình cho lĩnh vực này chưa được phát hành. Vui lòng thử lại sau khi có nội dung tải về."
        : message || "Không thể tải giáo trình. Vui lòng thử lại.");
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
        setCourseExamLevel(null);
      }
    } catch (error) {
      setCourseError(error instanceof Error ? error.message : "Không thể xóa giáo trình khỏi thiết bị.");
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
      setCourseError("Không tìm thấy giáo trình trên thiết bị này. Hãy tải lại khi có mạng.");
      return;
    }
    setSelectedCourseId(course.id);
    setSelectedLessonId(
      course.lessons.find((item) => item.level === progress.level)?.id ??
      course.lessons[0]?.id ??
      "",
    );
    const nextProfile = profiles.find((item) => item.id === courseId);
    if (nextProfile) {
      setProgress((current) => ({ ...current, profile: courseId }));
      setMessages(loadMessages(courseId) ?? [{ role: "assistant", content: nextProfile.prompt }]);
    }
    setCourseAnswers([]);
    setCourseQuizSubmitted(false);
    setCourseExamLevel(null);
    setCourseExamAnswers([]);
    setCourseExamSubmitted(false);
    setCourseError("");
    setOfflineAudioUrl("");
    navigateToSection("lessons");
  }

  function openCourseLesson(lessonId: string) {
    setSelectedLessonId(lessonId);
    setCourseAnswers([]);
    setCourseQuizSubmitted(false);
    setCourseExamLevel(null);
    setCourseExamAnswers([]);
    setCourseExamSubmitted(false);
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
    const percentage = Math.round((score / questions.length) * 100);
    setCourseQuizSubmitted(true);
    const updatedScores = {
      ...courseLessonScores,
      [course.id]: {
        ...courseLessonScores[course.id],
        [lessonId]: Math.max(courseLessonScores[course.id]?.[lessonId] ?? 0, percentage),
      },
    };
    const updatedProgress = {
      ...courseProgress,
      [course.id]: courseProgress[course.id] ?? [],
    };
    if (passed && !updatedProgress[course.id].includes(lessonId)) {
      updatedProgress[course.id] = [...updatedProgress[course.id], lessonId];
    }
    setCourseLessonScores(updatedScores);
    if (passed) {
      setCourseProgress(updatedProgress);
    }
    try {
      localStorage.setItem("lingua-course-lesson-scores", JSON.stringify(updatedScores));
      if (passed) localStorage.setItem("lingua-course-progress", JSON.stringify(updatedProgress));
      setCourseError("");
    } catch {
      setCourseError("Không thể lưu điểm hoặc tiến độ bài học trên thiết bị này.");
    }
  }

  function renderSettings() {
    const keyEntries = apiKeys[aiProvider];
    const maleVoices = googleSpeechVoices.filter((voice) => voice.gender === "male");
    const femaleVoices = googleSpeechVoices.filter((voice) => voice.gender === "female");
    return (
      <>
        <div className="page-intro">
          <span className="eyebrow">CÀI ĐẶT CHUNG</span>
          <h2>Cài đặt ứng dụng.</h2>
          <p>Chọn một nhóm để mở các tùy chọn chi tiết.</p>
        </div>
        <details name="settings-groups" className="settings-group">
          <summary className="settings-group-summary">
            <span className="settings-icon"><IllustrationIcon name="courses" /></span>
            <span><strong>Giáo trình offline</strong><small>Tải hoặc quản lý bài học trên thiết bị</small></span>
            <span className="settings-group-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="settings-group-content">
            {renderCourses(true)}
          </div>
        </details>
        <details name="settings-groups" className="settings-group">
          <summary className="settings-group-summary">
            <span className="settings-icon font-size-icon">Aa</span>
            <span><strong>Giao diện & hiển thị</strong><small>Cỡ chữ và màu sắc ứng dụng</small></span>
            <span className="settings-group-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="settings-group-content">
        <section className="panel settings-panel font-size-settings">
          <div className="settings-section-heading">
            <span className="settings-icon font-size-icon" aria-hidden="true">Aa</span>
            <div><h3>Cỡ chữ</h3><p>Tăng chữ để nội dung dễ đọc hơn trên thiết bị này.</p></div>
          </div>
          <div className="font-scale-control">
            <label className="settings-label" htmlFor="font-scale">Kích thước hiển thị</label>
            <output className="font-scale-value" htmlFor="font-scale">{fontScale}%</output>
            <input
              id="font-scale"
              className="font-scale-slider"
              type="range"
              min="100"
              max="150"
              step="5"
              value={fontScale}
              aria-valuetext={`${fontScale}%`}
              onChange={(event) => setFontScale(Number(event.target.value))}
            />
            <div className="font-scale-endpoints"><span>100% · Mặc định</span><span>150% · Lớn nhất</span></div>
          </div>
          <p className="font-scale-preview">Bản xem trước: Chữ lớn hơn giúp bạn học tiếng Anh thoải mái hơn.</p>
          <button type="button" className="button button-outline" onClick={() => setFontScale(125)} disabled={fontScale === 125}>
            Đặt lại cỡ chữ gợi ý (125%)
          </button>
          {fontScaleError && <p className="error-message">{fontScaleError}</p>}
        </section>
        <section className="panel settings-panel app-theme-settings">
          <div className="settings-section-heading">
            <span className="settings-icon theme-icon" aria-hidden="true">◐</span>
            <div><h3>Giao diện màu sắc</h3><p>Nền trắng, chọn màu khung và điểm nhấn theo sở thích.</p></div>
          </div>
          <div className="theme-options" role="group" aria-label="Chọn giao diện màu sắc">
            <button
              type="button"
              className={`theme-option mint-theme${appTheme === "mint" ? " selected" : ""}`}
              aria-pressed={appTheme === "mint"}
              onClick={() => setAppTheme("mint")}
            >
              <span className="theme-swatch" aria-hidden="true"><span /></span>
              <span className="theme-option-copy"><strong>Nền trắng / Khung xanh mint</strong><small>Giao diện xanh mint ban đầu</small></span>
              <span className="theme-option-check" aria-hidden="true">{appTheme === "mint" ? "✓" : ""}</span>
            </button>
            <button
              type="button"
              className={`theme-option burgundy-theme${appTheme === "burgundy" ? " selected" : ""}`}
              aria-pressed={appTheme === "burgundy"}
              onClick={() => setAppTheme("burgundy")}
            >
              <span className="theme-swatch" aria-hidden="true"><span /></span>
              <span className="theme-option-copy"><strong>Nền trắng / Khung đỏ bordeaux</strong><small>Tông đỏ rượu vang thanh lịch</small></span>
              <span className="theme-option-check" aria-hidden="true">{appTheme === "burgundy" ? "✓" : ""}</span>
            </button>
            <button
              type="button"
              className={`theme-option blue-theme${appTheme === "blue" ? " selected" : ""}`}
              aria-pressed={appTheme === "blue"}
              onClick={() => setAppTheme("blue")}
            >
              <span className="theme-swatch" aria-hidden="true"><span /></span>
              <span className="theme-option-copy"><strong>Nền trắng / Khung xanh dương</strong><small>Tông xanh tươi sáng, dễ nhìn</small></span>
              <span className="theme-option-check" aria-hidden="true">{appTheme === "blue" ? "✓" : ""}</span>
            </button>
          </div>
          {appThemeError && <p className="error-message" role="alert">{appThemeError}</p>}
        </section>
          </div>
        </details>
        <details name="settings-groups" className="settings-group">
          <summary className="settings-group-summary">
            <span className="settings-icon"><IllustrationIcon name="key" /></span>
            <span><strong>Nhà cung cấp & mô hình AI</strong><small>{aiProvider === "google" ? "Google Gemini" : "OpenAI"} · {activeModel}</small></span>
            <span className="settings-group-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="settings-group-content">
        <section className="panel settings-panel">
          <div className="settings-section-heading">
            <span className="settings-icon"><IllustrationIcon name="key" /></span>
            <div><h3>Nhà cung cấp AI</h3><p>API key được gửi trực tiếp từ trình duyệt tới nhà cung cấp đã chọn.</p></div>
          </div>
          <label className="settings-label" htmlFor="ai-provider">Nhà cung cấp</label>
          <select id="ai-provider" className="settings-select" value={aiProvider} onChange={(event) => {
            if (isAiProvider(event.target.value)) {
              setAiProvider(event.target.value);
              setApiKeyDraft("");
              setApiKeyLabelDraft("");
              setApiKeyError("");
              setApiKeySaved(false);
              setModelsError("");
            }
          }}>
            <option value="google">Google Gemini</option>
            <option value="openai">OpenAI / ChatGPT</option>
          </select>
          <div className="settings-key-list">
            <label className="settings-label" htmlFor="active-ai-key">API key đang dùng</label>
            <div className="settings-key-select-row">
              <select id="active-ai-key" className="settings-select" value={activeKeyIds[aiProvider]} onChange={(event) =>
                setActiveKeyIds((current) => ({ ...current, [aiProvider]: event.target.value }))}>
                <option value="">Chưa có key</option>
                {keyEntries.map((entry) => <option key={entry.id} value={entry.id}>{entry.label} · ••••{entry.value.slice(-4)}</option>)}
              </select>
              {activeKeyIds[aiProvider] && <button type="button" className="remove-key-button" onClick={() => removeApiKey(activeKeyIds[aiProvider])}>Xóa key đang chọn</button>}
            </div>
            {keyEntries.length > 1 && <small className="settings-hint">Khi API trả lỗi xác thực hoặc hết hạn mức, app sẽ tự thử các key còn lại đã lưu.</small>}
          </div>
          <form className="settings-key-form" onSubmit={(event) => { void saveApiKey(event); }}>
            <label className="settings-label" htmlFor="api-key-label">Thêm API key mới</label>
            <input id="api-key-label" className="settings-input" value={apiKeyLabelDraft} onChange={(event) => setApiKeyLabelDraft(event.target.value)} placeholder="Tên gợi nhớ, ví dụ: Key cá nhân" />
            <label className="settings-label" htmlFor="ai-api-key">API key (được che khi nhập)</label>
            <input id="ai-api-key" className="settings-input" type="password" autoComplete="off" value={apiKeyDraft} onChange={(event) => {
              setApiKeyDraft(event.target.value);
              setApiKeyError("");
              setApiKeySaved(false);
            }} placeholder={aiProvider === "google" ? "Dán Google AI API key" : "Dán OpenAI API key"} />
            <a href={aiProvider === "google" ? "https://aistudio.google.com/app/apikey" : "https://platform.openai.com/api-keys"} target="_blank" rel="noreferrer">
              Tạo API key {aiProvider === "google" ? "Google AI Studio" : "trên OpenAI"} ↗
            </a>
            <small className="settings-hint">Key chỉ lưu trên thiết bị này, không đặt trong mã nguồn. Không dùng trên thiết bị công cộng; nhà cung cấp có thể tính phí theo tài khoản của bạn.</small>
            {apiKeyError && <p className="error-message" role="alert">{apiKeyError}</p>}
            {apiKeySaved && <p className="api-key-success" role="status">Đã xác thực và lưu API key; danh sách mô hình đã được tải.</p>}
            <button className="button button-primary" type="submit" disabled={apiKeyBusy || !apiKeyDraft.trim()}>
              {apiKeyBusy ? "Đang xác thực key…" : "＋ Kiểm tra và lưu key"}
            </button>
          </form>
        </section>

        <section className="panel settings-panel">
          <div className="settings-section-heading">
            <span className="settings-icon"><IllustrationIcon name="sparkles" /></span>
            <div><h3>Mô hình AI</h3><p>Chọn mô hình trong danh sách được API key của bạn hỗ trợ.</p></div>
          </div>
          <button type="button" className="button button-outline" onClick={() => { void loadModels(); }} disabled={modelsBusy || !apiKey}>
            {modelsBusy ? "Đang tải mô hình…" : "↻ Tải danh sách mô hình"}
          </button>
          {modelsError && <p className="error-message" role="alert">{modelsError}</p>}
          <label className="settings-label" htmlFor="ai-model">Mô hình hội thoại</label>
          <select id="ai-model" className="settings-select" value={activeModel} onChange={(event) =>
            setSelectedModels((current) => ({ ...current, [aiProvider]: event.target.value }))}>
            {!modelCatalog[aiProvider].some((model) => model.id === activeModel) && <option value={activeModel}>{activeModel} · mặc định</option>}
            {modelCatalog[aiProvider].map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
          </select>
        </section>
          </div>
        </details>
        <details name="settings-groups" className="settings-group">
          <summary className="settings-group-summary">
            <span className="settings-icon"><IllustrationIcon name="speaker" /></span>
            <span><strong>Giọng đọc & phát âm</strong><small>Voice, accent và sắc thái đọc</small></span>
            <span className="settings-group-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="settings-group-content">
        <section className="panel settings-panel">
          <div className="settings-section-heading">
            <span className="settings-icon"><IllustrationIcon name="speaker" /></span>
            <div><h3>Giọng đọc và phát âm</h3><p>Chọn giọng rõ ràng để luyện nghe các kiểu phát âm tiếng Anh theo vùng.</p></div>
          </div>
          {aiProvider === "google" && (
            <button type="button" className="button button-outline" onClick={() => { void loadSpeechVoices(); }} disabled={speechVoicesBusy || !apiKey}>
              {speechVoicesBusy ? "Đang tải giọng theo từng vùng…" : "↻ Tải 1 giọng nam + 1 giọng nữ cho mỗi vùng"}
            </button>
          )}
          {speechVoicesError && <p className="error-message" role="alert">{speechVoicesError}</p>}
          <label className="settings-label" htmlFor="speech-voice">Giọng đọc {aiProvider === "google" ? "Google" : "OpenAI"}</label>
          <div className="settings-voice-row">
            <select id="speech-voice" className="settings-select" value={activeSpeechVoice} onChange={(event) => selectSpeechVoice(event.target.value)}>
              {aiProvider === "google" ? (
                <>
                  {googleSpeechVoices.length === 0 && <option value={speechVoice}>{speechVoice} · tải danh sách giọng để chọn theo vùng</option>}
                  <optgroup label={`Nam · ${maleVoices.length}/6 vùng`}>
                    {maleVoices.map((voice) => <option key={voice.id} value={voice.id}>{getGoogleAccentLabel(voice.accent)} · {voice.label}</option>)}
                  </optgroup>
                  <optgroup label={`Nữ · ${femaleVoices.length}/6 vùng`}>
                    {femaleVoices.map((voice) => <option key={voice.id} value={voice.id}>{getGoogleAccentLabel(voice.accent)} · {voice.label}</option>)}
                  </optgroup>
                </>
              ) : OPENAI_SPEECH_VOICES.map((voice) => <option key={voice.id} value={voice.id}>{voice.label}</option>)}
            </select>
            <button className="button button-outline" onClick={() => void playSpeech(SPEECH_SAMPLE)} disabled={speechBusy || !apiKey}>
              {speechBusy ? "Đang tạo…" : "▶ Nghe thử"}
            </button>
          </div>
          <label className="settings-label" htmlFor="speech-delivery-style">Sắc thái giọng tiếng Anh chuẩn</label>
          <select id="speech-delivery-style" className="settings-select" value={speechDeliveryStyle} onChange={(event) => selectSpeechDeliveryStyle(event.target.value)}>
            {SPEECH_DELIVERY_STYLES.map((style) => <option key={style.id} value={style.id}>{style.label}</option>)}
          </select>
          <p className="settings-hint">Chọn cách đọc rõ, tự nhiên hoặc êm nhẹ. Đây là hướng dẫn cho AI tạo giọng, không phải bản ghi âm giọng riêng; chất giọng thực tế còn tùy voice và nhà cung cấp.</p>
          {aiProvider === "openai" && (
            <>
              <label className="settings-label" htmlFor="speech-accent">Kiểu phát âm vùng (hướng dẫn cho AI)</label>
              <select id="speech-accent" className="settings-select" value={openAiSpeechAccent} onChange={(event) => selectOpenAiSpeechAccent(event.target.value)}>
                {OPENAI_ACCENTS.map((accent) => <option key={accent} value={accent}>{accent} English</option>)}
              </select>
              <p className="settings-hint">Danh sách OpenAI không công bố giới tính hay vùng gốc cho từng voice; vùng phát âm ở đây được gửi như hướng dẫn tạo giọng, không phải bảo đảm tuyệt đối.</p>
            </>
          )}
          {aiProvider === "google" && googleSpeechVoices.length > 0 && (
            <p className="settings-hint">
              Đã tải {maleVoices.length} giọng nam và {femaleVoices.length} giọng nữ, tối đa một giọng mỗi vùng để tránh danh sách bị tập trung vào một nước.
              {maleVoices.length < 6 || femaleVoices.length < 6 ? " Một số vùng chưa có giọng phù hợp trong danh mục API key này." : ""}
              Danh sách chỉ gồm thông tin giọng nhẹ; audio chỉ tạo và lưu khi bạn nhấn nghe.
            </p>
          )}
          {!apiKey && <p className="settings-hint">Thêm API key để tạo audio. Các câu đã nghe được lưu trên thiết bị để phát lại offline (tối đa 100 đoạn).</p>}
          {aiProvider === "openai" && <p className="settings-hint">Chấm phát âm trực tiếp hiện dùng Google Gemini; OpenAI hỗ trợ hội thoại, nhận dạng giọng nói và đọc văn bản.</p>}
          <button className="remove-key-button settings-cache-clear" onClick={() => { void removeSavedSpeech(); }}>Xóa audio đã lưu trên thiết bị</button>
        </section>
          </div>
        </details>
        <details name="settings-groups" className="settings-group">
          <summary className="settings-group-summary">
            <span className="settings-icon"><IllustrationIcon name="settings" /></span>
            <span><strong>Cài đặt ứng dụng</strong><small>Hướng dẫn cài ứng dụng lên màn hình chính</small></span>
            <span className="settings-group-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="settings-group-content">
        {renderInstallAppPanel()}
          </div>
        </details>
      </>
    );
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
            <button className="speak-button" onClick={() => void playSpeech(profile.words[0])} disabled={speechBusy}>
              <IllustrationIcon name="speaker" /> Nghe mẫu phát âm
            </button>
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
            <div className="coach-avatar"><IllustrationIcon name="teacher" /></div>
            <div><strong>Cô Maya</strong><p>Gia sư AI · {aiProvider === "google" ? "Google AI" : "OpenAI"} <span className="online-dot" /> Sẵn sàng dạy bạn</p></div>
            <span className="level-chip">{progress.level}</span>
          </header>
          <div className="chat-context"><span>💬</span> {profile.title} <span>·</span> {profile.scene}</div>
          <div className="teacher-quick-actions" aria-label="Yêu cầu nhanh với gia sư">
            {QUICK_TEACHER_REQUESTS.map((request) => (
              <button type="button" key={request.label} onClick={() => { void sendMessage(undefined, request.prompt); }} disabled={chatBusy}>
                {request.label}
              </button>
            ))}
          </div>
          <div className="message-list">
            {messages.map((message, index) => (
              <div className={`message-row ${message.role}`} key={`${index}-${message.role}`}>
                {message.role === "assistant" && <div className="mini-avatar">M</div>}
                <div className="message-bubble">
                  <span className="speaker-label">{message.role === "assistant" ? "MAYA · GIA SƯ" : "BẠN"}</span>
                  <p>{message.content}</p>
                  {message.role === "assistant" && <button aria-label="Nghe câu trả lời" className="speak-button" onClick={() => void playSpeech(message.content)} disabled={speechBusy}><IllustrationIcon name="speaker" /> Nghe câu trả lời</button>}
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

  async function installApp() {
    if (!installPrompt) return;
    setInstallError("");
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setAppInstalled(true);
        setInstallPrompt(null);
      }
    } catch (error) {
      setInstallError(error instanceof Error ? error.message : "Không thể mở hộp thoại cài đặt ứng dụng.");
    }
  }

  function renderInstallAppPanel() {
    if (appInstalled) return null;
    return (
      <section className="install-app-panel" aria-label="Cài Teacher AI lên màn hình chính">
        <div>
          <strong>Cài Teacher AI lên màn hình chính</strong>
          <p>Thêm biểu tượng ứng dụng để mở nhanh như app trên điện thoại.</p>
          {!installPrompt && <small>Android/Chrome: mở menu trình duyệt và chọn “Cài đặt ứng dụng” hoặc “Thêm vào màn hình chính”. iPhone/iPad: mở bằng Safari, nhấn Chia sẻ rồi chọn “Thêm vào MH chính”.</small>}
          {installError && <p className="error-message" role="alert">{installError}</p>}
        </div>
        {installPrompt && <button type="button" className="button button-primary" onClick={() => { void installApp(); }}>Cài ứng dụng</button>}
      </section>
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
    const topic = grammarTopics.find((item) => item.id === grammarTopicId);
    if (!topic) {
      return (
        <>
          <div className="page-intro">
            <span className="eyebrow">LUYỆN NGỮ PHÁP THEO CẤU TRÚC</span>
            <h2>Chọn cấu trúc bạn muốn học.</h2>
            <p>Mở một bài để xem cách dùng, ví dụ và bài tập trắc nghiệm. Nội dung bài học và bài tập được trình bày bằng tiếng Anh.</p>
          </div>
          <div className="grammar-topic-catalog">
            {(["A1", "A2", "B1", "B2"] as const).map((level) => (
              <section className="panel grammar-level-panel" key={level}>
                <div className="grammar-level-heading"><span className="level-chip">{level}</span><span className="eyebrow">CEFR</span></div>
                {grammarTopics.filter((item) => item.level === level).map((item) => (
                  <button key={item.id} className="grammar-topic-card" onClick={() => selectGrammarTopic(item.id)}>
                    <span className="grammar-topic-art"><IllustrationIcon name="grammar" /></span>
                    <span className="grammar-topic-copy">
                      <strong>{item.title}</strong>
                      <span>{item.structure}</span>
                      {grammarScores[item.id] !== undefined && <small>Điểm cao nhất: {grammarScores[item.id]}%</small>}
                    </span>
                    <span className="grammar-topic-arrow" aria-hidden="true">→</span>
                  </button>
                ))}
              </section>
            ))}
          </div>
        </>
      );
    }

    const answeredAll = topic.questions.every((_, index) => Number.isInteger(grammarAnswers[index]));
    const score = topic.questions.reduce(
      (total, question, index) => total + (grammarAnswers[index] === question.answer ? 1 : 0),
      0,
    );
    return (
      <>
        <div className="grammar-detail-page">
          <button className="grammar-list-back" onClick={returnToGrammarTopics}>← Tất cả cấu trúc ngữ pháp</button>
          <div className="page-intro grammar-detail-intro">
            <span className="eyebrow">BÀI HỌC NGỮ PHÁP · CEFR {topic.level}</span>
            <h2>{topic.title}</h2>
            <p>Học cấu trúc, xem ví dụ, sau đó hoàn thành bài tập để kiểm tra mức độ nắm vững.</p>
          </div>
          <section className="panel grammar-lesson-guide">
            <span className="eyebrow">STRUCTURE GUIDE</span>
            <h3>{topic.title}</h3>
            <p className="grammar-structure"><strong>Structure:</strong> {topic.structure}</p>
            <p className="grammar-overview">{topic.overview}</p>
            <div className="grammar-example-list">
              <strong>Examples</strong>
              {topic.examples.map((example) => <p key={example}><span>“{example}”</span><button className="speak-button" aria-label={`Nghe câu: ${example}`} onClick={() => void playSpeech(example)} disabled={speechBusy}><IllustrationIcon name="speaker" /> Nghe</button></p>)}
            </div>
          </section>
          <section className="panel grammar-quiz grammar-detail-quiz">
            <div className="grammar-quiz-heading"><span className="level-chip">{topic.level}</span><span className="eyebrow">GRAMMAR PRACTICE</span></div>
            <h3>Practice the structure</h3>
            <p className="grammar-structure">Choose the best answer for each question.</p>
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
            <button className="button button-light" onClick={() => navigateToSection("practice")}>Gia sư AI online <span>→</span></button>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-sun" /><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="art-card"><span className="art-sparkles"><IllustrationIcon name="sparkles" /></span><strong>Bạn đang<br />tiến bộ!</strong><small>Từng cuộc trò chuyện một</small></div>
            <div className="art-star star-one"><IllustrationIcon name="sparkles" /></div><div className="art-star star-two"><IllustrationIcon name="sparkles" /></div>
          </div>
        </section>

        {renderInstallAppPanel()}

        <div className="section-heading">
          <div><span className="eyebrow">LỘ TRÌNH HỌC CỦA BẠN</span><h2>Chọn lĩnh vực muốn học</h2></div>
          <button className="text-button" onClick={() => navigateToSection("profiles")}>Xem tất cả <span>→</span></button>
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

        <div className="section-heading">
          <div><span className="eyebrow">HAI CÁCH HỌC RIÊNG BIỆT</span><h2>Tiếp tục với {profile.title}</h2></div>
        </div>
        <div className="learning-path-grid">
          <button type="button" className="panel learning-path-card home-learning-choice" onClick={() => navigateToSection("lessons")}>
            <span className="learning-path-icon"><IllustrationIcon name="courses" /></span>
            <span className="eyebrow">HỌC BÀI BẢN · OFFLINE</span>
            <h3>Bài học theo giáo trình</h3>
            <p>Học từng bài theo level, làm bài kiểm tra và theo dõi tiến độ học tập.</p>
            <span className="button button-outline">Mở lộ trình bài học <span>→</span></span>
          </button>
          <button type="button" className="panel learning-path-card home-learning-choice" onClick={() => navigateToSection("practice")}>
            <span className="learning-path-icon"><IllustrationIcon name="practice" /></span>
            <span className="eyebrow">LUYỆN GIAO TIẾP · ONLINE</span>
            <h3>Gia sư AI</h3>
            <p>Trò chuyện với Maya theo chủ đề và trình độ hiện tại; nhận giải thích và góp ý.</p>
            <span className="button button-primary">Bắt đầu trò chuyện <span>→</span></span>
          </button>
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
            <div className="next-lesson"><span className={`lesson-icon ${profile.color}`}><IllustrationIcon name={profile.icon} /></span><div><strong>Gia sư AI: {profile.title}</strong><span>5 phút · Tình huống thực tế</span></div></div>
            <p>Thực hành giao tiếp theo lĩnh vực bạn đã chọn. Gia sư AI sẽ trò chuyện và góp ý cho bạn.</p>
            <button className="button button-primary full-button" onClick={() => navigateToSection("practice")}>Tiếp tục với gia sư AI <span>→</span></button>
          </section>
        </div>
        <section className="placement-banner"><span className="placement-icon"><IllustrationIcon name="compass" /></span><div><strong>Bạn mới bắt đầu học?</strong><p>Làm bài kiểm tra ngắn để Maya điều chỉnh bài học theo trình độ của bạn.</p></div><button onClick={() => { setPlacementAnswers([]); setPlacementResult(""); navigateToSection("placement"); }}>Kiểm tra trình độ <span>→</span></button></section>
      </>
    );
  }

  function renderProfiles() {
    return (
      <>
        <div className="page-intro"><span className="eyebrow">HỌC ĐIỀU BẠN CẦN</span><h2>Chọn lĩnh vực học tập.</h2><p>Chọn lĩnh vực trước. Ở bước tiếp theo, bạn có thể học theo giáo trình offline hoặc mở gia sư AI để luyện giao tiếp online.</p></div>
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
        ))}
          <button type="button" className="profile-card large-profile grammar-profile-card" onClick={() => navigateToSection("grammar")}>
            <span className="profile-icon"><IllustrationIcon name="grammar" /></span>
            <strong>Tiếng Anh ngữ pháp</strong>
            <span>Học cấu trúc câu và làm bài tập theo trình độ</span>
            <div className="profile-preview"><span>Lĩnh vực học</span><strong>Ngữ pháp tiếng Anh</strong></div>
            <i>KHÁM PHÁ BÀI HỌC →</i>
          </button>
        </div>
      </>
    );
  }

  function completeCourseExam(
    course: CoursePackage,
    level: CourseLevel,
    questions: CoursePackage["lessons"][number]["questions"],
  ) {
    if (!questions.length || courseExamAnswers.length !== questions.length ||
        courseExamAnswers.some((answer) => !Number.isInteger(answer) || answer < 0)) return;
    const score = questions.reduce(
      (total, question, index) => total + (courseExamAnswers[index] === question.answer ? 1 : 0),
      0,
    );
    const percentage = Math.round((score / questions.length) * 100);
    setCourseExamSubmitted(true);
    const updatedResults = {
      ...courseLevelResults,
      [course.id]: {
        ...courseLevelResults[course.id],
        [level]: Math.max(courseLevelResults[course.id]?.[level] ?? 0, percentage),
      },
    };
    setCourseLevelResults(updatedResults);
    const levelIndex = COURSE_LEVELS.indexOf(level);
    const currentLevelIndex = COURSE_LEVELS.findIndex((currentLevel) => currentLevel === progress.level);
    if (
      percentage >= 90 &&
      levelIndex < COURSE_LEVELS.length - 1 &&
      levelIndex >= currentLevelIndex
    ) {
      setProgress((current) => ({ ...current, level: COURSE_LEVELS[levelIndex + 1] }));
    }
    setCourseError("");
    try {
      localStorage.setItem("lingua-course-level-results", JSON.stringify(updatedResults));
    } catch {
      setCourseError("Không thể lưu kết quả kiểm tra level trên thiết bị này.");
    }
  }

  function renderLessons() {
    const course = coursePacks.find((item) => item.id === progress.profile);
    const selectedCourse = coursePacks.find((item) => item.id === selectedCourseId);
    if (course && selectedCourse?.id === course.id) return renderCourses();
    return (
      <>
        <div className="page-intro">
          <span className="eyebrow">LỘ TRÌNH HỌC CỦA BẠN · CEFR {progress.level}</span>
          <h2>{profile.title}</h2>
          <p>Chọn cách học phù hợp: theo bài bản offline hoặc luyện giao tiếp cùng gia sư AI online.</p>
        </div>
        <div className="learning-path-grid">
          <section className={`panel learning-path-card${course ? "" : " unavailable"}`}>
            <span className="learning-path-icon"><IllustrationIcon name="courses" /></span>
            <span className="eyebrow">HỌC THEO LỘ TRÌNH</span>
            <h3>Bài học offline</h3>
            {course ? (
              <>
                <p>{course.overview}</p>
                <p className="learning-path-note">{course.lessons.length} bài · CEFR {course.framework} · Có thể học không cần mạng.</p>
                <button type="button" className="button button-primary" onClick={() => openDownloadedCourse(course.id)}>Tiếp tục giáo trình <span>→</span></button>
              </>
            ) : (
              <>
                <p>Giáo trình cho lĩnh vực này chưa có trên thiết bị. Tải gói trong Cài đặt để mở các bài học, bài kiểm tra và lộ trình lên level.</p>
                <button type="button" className="button button-outline" onClick={() => navigateToSection("settings")}>Vào Cài đặt để tải giáo trình</button>
              </>
            )}
          </section>
          <section className="panel learning-path-card">
            <span className="learning-path-icon"><IllustrationIcon name="practice" /></span>
            <span className="eyebrow">LUYỆN TẬP TRỰC TIẾP</span>
            <h3>Gia sư AI online</h3>
            <p>Trò chuyện theo chủ đề <strong>{profile.title}</strong> ở trình độ {progress.level}. AI có thể giải thích câu sai, trả lời thắc mắc và luyện phát âm cùng bạn.</p>
            {!apiKey && <p className="learning-path-note">Cần kết nối API key trong Cài đặt để bắt đầu.</p>}
            <button type="button" className="button button-primary" onClick={() => navigateToSection("practice")}>Bắt đầu với gia sư AI <span>→</span></button>
          </section>
        </div>
        {!course && (
          <p className="course-storage-note" role="status">
            Chưa có gói giáo trình tải về cho lĩnh vực này. Các file nội dung cần thiết chưa được phát hành cùng ứng dụng; danh sách tải sẽ báo rõ khi gói chưa sẵn sàng.
          </p>
        )}
      </>
    );
  }

  function renderCourses(catalogOnly = false) {
    const course = catalogOnly ? undefined : coursePacks.find((item) => item.id === selectedCourseId);
    if (selectedCourseId && !course && !catalogOnly) {
      return (
        <section className="panel course-empty-state">
          <h2>Không tìm thấy giáo trình offline</h2>
          <p>{courseError || "Giáo trình này chưa được tải về thiết bị."}</p>
          <button className="button button-outline" onClick={() => { setSelectedCourseId(""); setCourseError(""); }}>Quay lại danh sách giáo trình</button>
        </section>
      );
    }
    if (course) {
      const lesson = course.lessons.find((item) => item.id === selectedLessonId) ?? course.lessons[0];
      const completedLessons = courseProgress[course.id] ?? [];
      const lessonScores = courseLessonScores[course.id] ?? {};
      const levelResults = courseLevelResults[course.id] ?? {};
      const startingLevelIndex = COURSE_LEVELS.findIndex((level) => level === progress.level);
      const firstLevelToAdvance = startingLevelIndex < 0 ? 0 : startingLevelIndex;
      let highestUnlockedLevelIndex = firstLevelToAdvance;
      while (
        highestUnlockedLevelIndex < COURSE_LEVELS.length - 1 &&
        (levelResults[COURSE_LEVELS[highestUnlockedLevelIndex]] ?? 0) >= 90
      ) {
        highestUnlockedLevelIndex += 1;
      }
      const answeredAll = lesson.questions.every((_, index) => Number.isInteger(courseAnswers[index]));
      const correctCount = lesson.questions.reduce(
        (total, question, index) => total + (courseAnswers[index] === question.answer ? 1 : 0),
        0,
      );
      const passed = correctCount >= Math.ceil(lesson.questions.length * 0.7);
      const examLessons = courseExamLevel
        ? course.lessons.filter((item) => item.level === courseExamLevel)
        : [];
      const examQuestions = examLessons.flatMap((item) => item.questions);
      const examAnsweredAll = examQuestions.length > 0 &&
        examQuestions.every((_, index) => Number.isInteger(courseExamAnswers[index]));
      const examCorrectCount = examQuestions.reduce(
        (total, question, index) => total + (courseExamAnswers[index] === question.answer ? 1 : 0),
        0,
      );
      const examPercentage = examQuestions.length
        ? Math.round((examCorrectCount / examQuestions.length) * 100)
        : 0;
      const linkedAudio = course.audio.filter((audio) => lesson.audioIds.includes(audio.id));
      return (
        <>
          <div className="page-intro">
            <button className="text-button" onClick={() => { setSelectedCourseId(""); setSelectedLessonId(""); setOfflineAudioUrl(""); setCourseExamLevel(null); }}>← Lộ trình học</button>
            <span className="eyebrow">{course.framework} · PHIÊN BẢN {course.version}</span>
            <h2>{course.title}</h2>
            <p>{course.overview}</p>
            <p className="course-license">Giấy phép nội dung: {course.contentLicense}</p>
            <button type="button" className="button button-outline" onClick={() => navigateToSection("practice")}>Chuyển sang Gia sư AI online</button>
          </div>
          <div className="course-curriculum-layout">
            <section className="panel course-lesson-list">
              <span className="eyebrow">LỘ TRÌNH A1–B2</span>
              {COURSE_LEVELS.map((level) => {
                const levelLessons = course.lessons.filter((item) => item.level === level);
                if (!levelLessons.length) return null;
                const levelIndex = COURSE_LEVELS.indexOf(level);
                const levelUnlocked = levelIndex <= highestUnlockedLevelIndex;
                const levelComplete = levelLessons.every((item) => completedLessons.includes(item.id));
                return (
                  <div className="course-level" key={level}>
                    <strong>{level} {levelResults[level] !== undefined && `· Bài kiểm tra: ${levelResults[level]}%`}</strong>
                    {levelLessons.map((item, lessonIndex) => {
                      const complete = completedLessons.includes(item.id);
                      const lessonUnlocked = levelUnlocked &&
                        (lessonIndex === 0 || completedLessons.includes(levelLessons[lessonIndex - 1].id));
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`course-lesson${item.id === lesson.id ? " selected" : ""}`}
                          disabled={!lessonUnlocked}
                          onClick={() => openCourseLesson(item.id)}
                        >
                          <span>{complete ? "✓" : "○"}</span>
                          <span>
                            {item.title}
                            {lessonScores[item.id] !== undefined && <small>Điểm cao nhất: {lessonScores[item.id]}%</small>}
                          </span>
                        </button>
                      );
                    })}
                    {levelUnlocked && (
                      <button
                        type="button"
                        className="button button-outline course-level-exam"
                        disabled={!levelComplete}
                        onClick={() => {
                          setCourseExamLevel(level);
                          setCourseExamAnswers([]);
                          setCourseExamSubmitted(false);
                          setCourseAnswers([]);
                          setCourseQuizSubmitted(false);
                        }}
                      >
                        {levelResults[level] !== undefined ? `Làm lại kiểm tra ${level}` : `Kiểm tra cuối ${level}`}
                      </button>
                    )}
                  </div>
                );
              })}
              <p className="course-progress-note">{completedLessons.length}/{course.lessons.length} bài đạt yêu cầu</p>
              <p className="course-progress-note">Đạt 70% mỗi bài để hoàn tất; đạt 90% bài kiểm tra cuối level để mở level tiếp theo.</p>
              <div className="course-references">
                <strong>Nguồn và giấy phép</strong>
                {course.references.map((reference) => (
                  <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer">{reference.title} · {reference.license} ↗</a>
                ))}
              </div>
            </section>
            <section className="panel course-lesson">
              {courseExamLevel ? (
                <div className="course-final-exam">
                  <span className="level-chip">{courseExamLevel}</span>
                  <span className="eyebrow">KIỂM TRA CUỐI LEVEL</span>
                  <h3>Đạt ít nhất 90% để mở level kế tiếp</h3>
                  <p className="course-objective">Bài kiểm tra tổng hợp câu hỏi của các bài thuộc level {courseExamLevel}.</p>
                  {examQuestions.map((question, questionIndex) => (
                    <fieldset className="question-card" key={`${courseExamLevel}-exam-${questionIndex}`}>
                      <legend>{questionIndex + 1}. {question.prompt}</legend>
                      <div className="answer-options">
                        {question.options.map((option, optionIndex) => {
                          const selected = courseExamAnswers[questionIndex] === optionIndex;
                          const correct = courseExamSubmitted && question.answer === optionIndex;
                          const incorrect = courseExamSubmitted && selected && !correct;
                          return (
                            <button
                              type="button"
                              key={option}
                              className={`answer-option${selected ? " selected" : ""}${correct ? " correct" : ""}${incorrect ? " incorrect" : ""}`}
                              onClick={() => {
                                if (courseExamSubmitted) return;
                                setCourseExamAnswers((answers) => {
                                  const updated = [...answers];
                                  updated[questionIndex] = optionIndex;
                                  return updated;
                                });
                              }}
                            >
                              <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
                            </button>
                          );
                        })}
                      </div>
                      {courseExamSubmitted && <p className="grammar-explanation">{question.explanation}</p>}
                    </fieldset>
                  ))}
                  {courseExamSubmitted ? (
                    <div className="placement-result" role="status">
                      Kết quả: {examCorrectCount}/{examQuestions.length} ({examPercentage}%).
                      {examPercentage >= 90
                        ? " Đã đạt yêu cầu; level tiếp theo đã được mở."
                        : " Cần đạt ít nhất 90%. Hãy ôn lại bài rồi thử lại."}
                      <button
                        type="button"
                        className="button button-outline"
                        onClick={() => { setCourseExamAnswers([]); setCourseExamSubmitted(false); }}
                      >
                        Làm lại kiểm tra
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="button button-primary"
                      disabled={!examAnsweredAll}
                      onClick={() => completeCourseExam(course, courseExamLevel, examQuestions)}
                    >
                      Nộp bài kiểm tra
                    </button>
                  )}
                </div>
              ) : (
                <>
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
                      Kết quả: {correctCount}/{lesson.questions.length} ({Math.round((correctCount / lesson.questions.length) * 100)}%). {passed ? "Đã hoàn thành bài học." : "Cần đạt ít nhất 70% để hoàn thành bài. Hãy xem lại giải thích rồi thử lại."}
                      {!passed && <button className="button button-outline" onClick={() => { setCourseAnswers([]); setCourseQuizSubmitted(false); }}>Làm lại bài <span>↻</span></button>}
                    </div>
                  : <button className="button button-primary" disabled={!answeredAll} onClick={() => completeCourseQuiz(course, lesson.id, lesson.questions)}>Chấm bài <span>→</span></button>}
              </div>
                </>
              )}
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
          <h2>Chọn giáo trình muốn tải về thiết bị.</h2>
          <p>Mỗi giáo trình gồm bài học, câu hỏi và audio nghe. Tải xuống cần kết nối Internet; nội dung đã tải có thể học offline.</p>
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
                      {busy ? `Đang tải audio ${courseDownloadProgress.completed}/${courseDownloadProgress.total || "…"}` : "Tải giáo trình"}
                    </button>}
              </section>
            );
          })}
          <button type="button" className="panel course-catalog-card personal-library-entry" onClick={() => navigateToSection("library")}>
            <span className="profile-icon"><IllustrationIcon name="library" /></span>
            <span className="course-catalog-copy">
              <strong>Tài liệu cá nhân</strong>
              <span>Mở hoặc thêm PDF, audio và ghi chú lưu trên thiết bị này.</span>
            </span>
            <span className="button button-outline">Mở tài liệu <span>→</span></span>
          </button>
        </div>
        <p className="course-storage-note">Giáo trình và audio được lưu trong IndexedDB trên thiết bị này. Việc tải/xóa giáo trình không ảnh hưởng tiến độ học hoặc API key.</p>
      </>
    );
  }

  function renderPersonalLibrary() {
    return (
      <>
        <div className="page-intro">
          <span className="eyebrow">THƯ VIỆN RIÊNG TRÊN THIẾT BỊ</span>
          <h2>Tài liệu cá nhân.</h2>
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
          <section className="panel streak-panel"><span className="streak-emoji"><IllustrationIcon name="streak" /></span><strong>{progress.streak} ngày liên tục</strong><p>Bạn đang tạo một thói quen tuyệt vời. Mỗi ngày luyện một chút sẽ tạo nên khác biệt.</p><button className="text-button" onClick={() => navigateToSection("practice")}>Luyện tập hôm nay →</button></section>
        </div>
        <section className="panel milestone-panel"><span className="eyebrow">BƯỚC TIẾN TIẾP THEO</span><h3>Bạn đã sẵn sàng cho cuộc trò chuyện tiếp theo</h3><p>Hoàn thành một tình huống giao tiếp để duy trì thói quen và tăng sự tự tin.</p><button className="button button-primary" onClick={() => navigateToSection("practice")}>Bắt đầu trò chuyện →</button></section>
      </>
    );
  }

  const nav: { id: Section; icon: IllustrationName; label: string }[] = [
    { id: "home", icon: "home", label: "Trang chủ" },
    { id: "lessons", icon: "courses", label: "Bài học" },
    { id: "practice", icon: "practice", label: "Gia sư AI" },
    { id: "profiles", icon: "profiles", label: "Lĩnh vực" },
    { id: "progress", icon: "progress", label: "Tiến độ" },
    { id: "settings", icon: "settings", label: "Cài đặt" },
  ];
  const sectionLabels: Record<Section, string> = {
    home: "Trang chủ",
    lessons: "Bài học offline",
    practice: "Gia sư AI online",
    profiles: "Lĩnh vực",
    progress: "Tiến độ",
    placement: "Kiểm tra trình độ",
    grammar: "Ngữ pháp",
    library: "Tài liệu cá nhân",
    settings: "Cài đặt",
  };
  const helpContent: HelpContent = section === "grammar" && grammarTopicId
    ? {
      title: "Bài học ngữ pháp",
      description: "Bài học này giải thích cấu trúc đã chọn, đưa ví dụ rồi giúp bạn kiểm tra mức độ hiểu.",
      steps: ["Đọc phần giải thích và ví dụ; bấm “Nghe” để luyện nghe câu mẫu.", "Chọn đáp án cho các câu hỏi rồi nhấn “Chấm bài”.", "Đọc phần giải thích sau khi chấm và chọn “Làm lại bài tập” để luyện thêm."],
    }
      : PAGE_HELP[section];
  const canGoBack = sectionHistoryRef.current.length > 0 || (section === "grammar" && grammarTopicId !== null);

  return (
    <main className="app-shell">
      {canGoBack && <button className="floating-back-button" type="button" onClick={goBack} aria-label="Quay lại trang trước" title="Quay lại trang trước">
        <IllustrationIcon name="back" />
        <span>Quay lại</span>
      </button>}
      {showHelp && (
        <div className="help-dialog-backdrop" onClick={() => setShowHelp(false)}>
          <section
            className="help-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="page-help-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="help-dialog-close" aria-label="Đóng hướng dẫn" onClick={() => setShowHelp(false)}>×</button>
            <span className="eyebrow">HƯỚNG DẪN SỬ DỤNG</span>
            <h2 id="page-help-title">{helpContent.title}</h2>
            <p>{helpContent.description}</p>
            <ol>{helpContent.steps.map((step) => <li key={step}>{step}</li>)}</ol>
            <button type="button" className="button button-primary" onClick={() => setShowHelp(false)}>Đã hiểu</button>
          </section>
        </div>
      )}
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); navigateToSection("home"); }}><span className="brand-mark">T<span>✦</span></span><span>Teacher AI<small>GIA SƯ TIẾNG ANH AI CỦA BẠN</small></span></a>
        <div className="side-label">HỌC TẬP</div>
        <nav>{nav.map((item) => <button key={item.id} className={section === item.id ? "nav-item selected" : "nav-item"} onClick={() => navigateToSection(item.id)}><span className="nav-icon"><IllustrationIcon name={item.icon} /></span>{item.label}{item.id === "practice" && <i className="nav-live" />}</button>)}</nav>
        <div className="sidebar-spacer" />
        <div className="streak-card"><span className="sidebar-streak-icon"><IllustrationIcon name="streak" /></span><div><strong>{progress.streak} ngày liên tục</strong><small>{progress.streak ? "Cố gắng duy trì nhé!" : "Bắt đầu với một bài học"}</small></div><span className="streak-arrow">↗</span></div>
        <button className="sidebar-profile" onClick={() => navigateToSection("profiles")}><span className="user-avatar">B</span><span><strong>Lộ trình học của bạn</strong><small>{profile.title}</small></span><span className="more-dots">···</span></button>
      </aside>
      <section className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Học tiếng Anh</span><span>/</span><strong>{sectionLabels[section]}</strong></div>
          <div className="topbar-actions">
            <span className="level-chip desktop-level">TRÌNH ĐỘ {progress.level}</span>
            <span className="topbar-version" aria-label={`Phiên bản ${APP_VERSION}`}>v{APP_VERSION}</span>
            <button type="button" className="help-button" aria-label={`Hướng dẫn: ${sectionLabels[section]}`} title="Hướng dẫn trang này" onClick={() => setShowHelp(true)}>?</button>
            <button className={apiKey ? "ai-settings-button connected" : "ai-settings-button"} aria-label="Mở cài đặt chung" onClick={() => navigateToSection("settings")}>
              <span className="ai-key-icon"><IllustrationIcon name="settings" /></span><span>{apiKey ? "Cài đặt" : "Thiết lập AI"}</span>
            </button>
          </div>
        </header>
        <div className="content-wrap">
          {versionCheckStatus === "update-available" && (
            <aside className="update-available-banner" role="alert">
              <span>Đã có phiên bản mới v{latestVersion}. Tải lại ứng dụng để cập nhật.</span>
              <button type="button" className="button button-primary" onClick={() => window.location.reload()}>Cập nhật ngay</button>
            </aside>
          )}
          {versionCheckStatus === "error" && (
            <aside className="update-available-banner" role="alert">
              <span>{versionCheckError}</span>
              <button type="button" className="button button-outline" onClick={() => setVersionCheckAttempt((attempt) => attempt + 1)}>Kiểm tra lại</button>
            </aside>
          )}
          {progressLoaded && !apiKey && section !== "settings" && <section className="api-reminder"><span className="reminder-key-icon"><IllustrationIcon name="key" /></span><div><strong>Kết nối AI để bắt đầu học cùng Maya</strong><p>Thêm API key Google AI hoặc OpenAI trong Cài đặt. Key chỉ lưu trên thiết bị này.</p></div><button onClick={() => navigateToSection("settings")}>Thiết lập AI</button></section>}
          {speechBusy && <p className="speech-status" role="status">Đang tạo giọng đọc AI…</p>}
          {speechError && <p className="error-message speech-status" role="alert">{speechError}</p>}
          {speechNotice && <p className="speech-notice" role="status">{speechNotice}</p>}
          {section === "home" && renderHome()}
          {section === "lessons" && renderLessons()}
          {section === "practice" && <><div className="section-heading practice-heading"><div><span className="eyebrow">GIA SƯ AI · HỌC ONLINE</span><h2>Trò chuyện cùng Cô Maya</h2></div><button className="text-button" onClick={() => navigateToSection("profiles")}>Đổi lĩnh vực ↗</button></div>{renderPractice()}</>}
          {section === "placement" && renderPlacement()}
          {section === "profiles" && renderProfiles()}
          {section === "progress" && renderProgress()}
          {section === "grammar" && renderGrammar()}
          {section === "library" && renderPersonalLibrary()}
          {section === "settings" && renderSettings()}
        </div>
        <footer className="site-footer">Dành cho khoảnh khắc bạn nghĩ: “Mình làm được!” <span>✦</span> <span className="site-version">v{APP_VERSION}</span></footer>
      </section>
      <nav className="mobile-nav">{nav.map((item) => <button key={item.id} className={section === item.id ? "mobile-nav-item selected" : "mobile-nav-item"} onClick={() => navigateToSection(item.id)}><span className="nav-icon"><IllustrationIcon name={item.icon} /></span><small>{item.label}</small></button>)}</nav>
    </main>
  );
}
