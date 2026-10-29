import type { Accent, LangConfig, LevelId, PlacementQuestion, Profile, TutorText } from "@/lib/language";
import { grammarTopics } from "./grammar-zh";

const zh: LangConfig = {
  id: "zh",
  viName: "tiếng Trung",
  flag: "🇨🇳",
  scriptMode: "cjk",
  minDialogueChars: 0,
  minBoldWords: 1,
  storagePrefix: "lingua-zh-",
  defaults: { level: "A1", profile: "everyday" },
  mascot: { kind: "panda", badge: "🐼 Linh vật" },
  /** English name of the language, used when talking to the AI. */
  nameEn: "Chinese (Mandarin)",
  nameNative: "中文",
  appTitle: "Teacher AI — Học tiếng Trung cùng AI",
  appDescription: "Luyện giao tiếp tiếng Trung (Quan Thoại) cùng gia sư AI, dành cho người Việt.",
  shortName: "Teacher AI",
  speechLang: "zh-CN",
  /** Device voices of this language start with this. */
  langPrefix: "zh",
  levelSystem: "HSK",
  levelLabels: { A1: "HSK 1-2", A2: "HSK 3", B1: "HSK 4", B2: "HSK 5" } as Record<LevelId, string>,
  /** Plain-text name of the reading aid shown next to the script. */
  phoneticName: "pinyin",
  /** Characters of the language being learned (hanzi and full-width punctuation). */
  targetScript: /[㐀-鿿]/,
  /** A run of target-language text: hanzi plus the punctuation that joins them. */
  targetRun: /[㐀-鿿][㐀-鿿　-〿＀-￯\s、。！？!?,.]*/g,
  /** Sentence end marks that need no space after them. */
  sentenceEnd: "。！？",
  recognitionHint: "Nói bằng tiếng Trung",
  welcome: {
    headline: "Xin chào! Cùng nói tiếng Trung tự tin hơn nhé.",
    greeting: "你好!",
  },
  pronunciationFocus:
    "four tones and the neutral tone, tone sandhi (不 / 一 and two third tones in a row), aspirated vs unaspirated (b/p, d/t, g/k, j/q, zh/ch, z/c), retroflex zh/ch/sh/r vs z/c/s, j/q/x, ü vs u, -n vs -ng finals, er-hua",
  promptNotes: `Teaching language: Mandarin Chinese (中文, Simplified characters 简体字). Level system: HSK (HSK 1-2 = A1, HSK 3 = A2, HSK 4 = B1, HSK 5 = B2).
- Write every Chinese sentence the learner should say inside double quotes "…", and IMMEDIATELY after it give its pinyin WITH TONE MARKS in square brackets, e.g. "你好" [nǐ hǎo]. At HSK 1-3 always add pinyin; at HSK 4-5 only for new or difficult words. Never write pinyin anywhere else. Text in square brackets is never read aloud.
- Use Simplified characters only, and vocabulary of the matching HSK level (HSK 1-2: about 300 common words such as 我, 你, 吃, 喝, 学校).
- Always point out the tone of a new word and warn about tone changes (不 + 4th tone → bú, 一 before 4th tone → yí, 3rd + 3rd → 2nd + 3rd).
- Typical mistakes of Vietnamese learners to watch for: tones (especially 2nd vs 3rd), zh/ch/sh vs z/c/s, the aspirated/unaspirated pairs (b/p, d/t, g/k), j/q/x, ü; word order (time and place before the verb), measure words (个, 本, 杯), 了 / 过 / 着, 的 / 得 / 地, and Sino-Vietnamese false friends.`,
  pedagogy: {
    A1: `- Explain mostly in Vietnamese (about 80%). Chinese only in very short model sentences (2–6 characters), each followed by its pinyin with tone marks in [brackets] and the Vietnamese meaning.
- One new item per turn. Tasks: repeat after me, choose A or B, complete one word. Accept one-word answers, then model the full sentence.
- Drill tones explicitly (mā má mǎ mà). Correct only the most important mistake each turn; be very encouraging.`,
    A2: `- Mix Vietnamese explanations (about 50%) with simple Chinese (HSK 3 grammar: 了, 过, 在, 正在, 把, 比, 可以/能/会, 一边……一边……). Add pinyin in [brackets] to every Chinese sentence.
- Give a hint like (Gợi ý: "比") for each task. Tasks: full-sentence answers, simple role-plays with 2–3 exchanges.
- Correct up to two mistakes per turn, mainly tones, word order and measure words.`,
    B1: `- Teach mostly in Chinese (about 70%); give pinyin in [brackets] only for new or difficult words. Use Vietnamese only for tricky grammar or meaning.
- Role-plays with longer exchanges; ask follow-up "why / how" questions. Introduce 把 / 被 sentences, complements of result and direction, 虽然……但是……, 如果……就……, 越来越.
- Correct every error that affects meaning, plus unnatural word choice; offer a more natural phrase.`,
    B2: `- Teach in Chinese; use Vietnamese only if the learner asks. Cover 成语 and set phrases, formal and written style, 连……都……, 既然……就……, 不但……而且……, business register.
- Discussions, negotiations and problem-solving situations; challenge the learner's opinions. Give pinyin in [brackets] only for rare words.
- Correct accuracy, register and naturalness, including better word choices.`,
  } as Record<LevelId, string>,
  accents: [
    { id: "beijing", group: "Trung Quốc", flag: "🇨🇳", name: "Phổ thông – Bắc Kinh", locales: ["zh-cn", "zh"], prompt: "a standard Mainland Mandarin (Putonghua) accent", sample: "你好。今天我们一起练习中文吧。" },
    { id: "taiwan", group: "Đài Loan", flag: "🇹🇼", name: "Quốc ngữ – Đài Loan", locales: ["zh-tw"], prompt: "a Taiwan Mandarin accent with a soft, gentle rhythm", sample: "你好。今天我們一起練習中文吧。" },
  ] as Accent[],
  profiles: [
    {
      id: "everyday",
      title: "Tiếng Trung giao tiếp hằng ngày",
      subtitle: "Chào hỏi, mua sắm, ăn uống, nhờ vả",
      icon: "everyday",
      color: "yellow",
      scene: "Làm quen với người mới",
      prompt: "Xin chào! Hôm nay chúng ta luyện giao tiếp tiếng Trung hằng ngày. Cô sẽ dạy em từng bước nhé.",
      words: ["你好。", "请多关照。", "谢谢你。"],
    },
    {
      id: "travel",
      title: "Tiếng Trung du lịch",
      subtitle: "Khách sạn, nhà hàng, tàu điện, hỏi đường",
      icon: "travel",
      color: "orange",
      scene: "Làm thủ tục nhận phòng khách sạn",
      prompt: "Xin chào! Hôm nay chúng ta luyện tiếng Trung khi đi du lịch Trung Quốc. Cô sẽ dạy em từng bước nhé.",
      words: ["我订了房间。", "洗手间在哪儿?", "多少钱?"],
    },
    {
      id: "business",
      title: "Tiếng Trung công sở",
      subtitle: "Họp hành, email, điện thoại, báo cáo",
      icon: "business",
      color: "blue",
      scene: "Trao đổi với đồng nghiệp trong công ty",
      prompt: "Xin chào! Hôm nay chúng ta luyện tiếng Trung công sở. Cô sẽ dạy em từng bước nhé.",
      words: ["我先走了。", "好的,明白了。", "我来确认一下。"],
    },
    {
      id: "technology",
      title: "Tiếng Trung ngành công nghệ",
      subtitle: "Kỹ sư IT, họp, báo lỗi, phỏng vấn",
      icon: "technology",
      color: "purple",
      scene: "Họp buổi sáng với nhóm phát triển",
      prompt: "Xin chào! Hôm nay chúng ta luyện tiếng Trung ngành công nghệ. Thầy/cô sẽ dạy em từng bước nhé.",
      words: ["这个问题已经解决了。", "测试已经完成了。", "我再确认一下需求。"],
    },
    {
      id: "healthcare",
      title: "Tiếng Trung chuyên ngành y khoa",
      subtitle: "Điều dưỡng, bác sĩ, giao tiếp với bệnh nhân",
      icon: "healthcare",
      color: "green",
      scene: "Hỏi thăm triệu chứng bệnh nhân",
      prompt: "Xin chào! Hôm nay chúng ta luyện tiếng Trung chuyên ngành y khoa. Thầy/cô sẽ dạy em từng bước nhé.",
      words: ["您哪儿不舒服?", "您吃药了吗?", "请稍等一下。"],
    },
    {
      id: "finance",
      title: "Tiếng Trung ngành tài chính",
      subtitle: "Ngân hàng, kế toán, báo cáo, đầu tư",
      icon: "finance",
      color: "pink",
      scene: "Trình bày báo cáo tài chính tháng",
      prompt: "Xin chào! Hôm nay chúng ta luyện tiếng Trung ngành tài chính. Thầy/cô sẽ dạy em từng bước nhé.",
      words: ["销售额增长了。", "比去年增长了百分之五。", "请您确认一下。"],
    },
    {
      id: "refrigeration",
      title: "Tiếng Trung kỹ thuật điện lạnh công nghiệp",
      subtitle: "Kho lạnh, máy nén, NH3/CO2, an toàn, bảo trì",
      icon: "refrigeration",
      color: "blue",
      scene: "Nhận yêu cầu sửa kho lạnh",
      prompt: "Xin chào! Hôm nay chúng ta luyện tiếng Trung kỹ thuật điện lạnh công nghiệp. Thầy/cô sẽ dạy em từng bước nhé.",
      words: ["冷库不制冷了。", "请先切断电源。", "我检查一下压力。"],
    },
  ] as Profile[],
  phraseMeanings: {
    "你好。": "Xin chào.",
    "请多关照。": "Mong được giúp đỡ / xin chiếu cố.",
    "谢谢你。": "Cảm ơn bạn.",
    "我订了房间。": "Tôi đã đặt phòng trước.",
    "洗手间在哪儿?": "Nhà vệ sinh ở đâu ạ?",
    "多少钱?": "Bao nhiêu tiền ạ?",
    "我先走了。": "Tôi xin phép về trước ạ.",
    "好的,明白了。": "Vâng, tôi hiểu rồi ạ.",
    "我来确认一下。": "Để tôi xác nhận lại một chút ạ.",
    "这个问题已经解决了。": "Vấn đề này đã được giải quyết.",
    "测试已经完成了。": "Kiểm thử đã hoàn tất.",
    "我再确认一下需求。": "Để tôi xác nhận lại yêu cầu.",
    "您哪儿不舒服?": "Bác thấy khó chịu ở đâu?",
    "您吃药了吗?": "Bác đã uống thuốc chưa?",
    "请稍等一下。": "Xin chờ một chút.",
    "销售额增长了。": "Doanh thu đã tăng.",
    "比去年增长了百分之五。": "Tăng 5% so với năm ngoái.",
    "请您确认一下。": "Xin quý vị xác nhận giúp.",
    "冷库不制冷了。": "Kho lạnh không làm lạnh nữa.",
    "请先切断电源。": "Xin ngắt nguồn điện trước.",
    "我检查一下压力。": "Tôi kiểm tra áp suất một chút.",
  } as Record<string, string>,
  suggestions: {
    everyday: ["你好,我是越南人。", "请再说一遍,慢一点。", "Cô giải thích lại bằng tiếng Việt giúp em với.", "这个多少钱?"],
    travel: ["我要办理入住。", "地铁站在哪儿?", "Cô hướng dẫn em cách phát âm câu vừa rồi nhé.", "有英文菜单吗?"],
    business: ["我先走了。", "会议几点开始?", "Thầy chỉ ra lỗi ngữ pháp giúp em nhé.", "请把资料发给我。"],
    technology: ["昨天我做完了登录页面。", "我来说明一下重现步骤。", "Cô giải thích lại bằng tiếng Việt giúp em với.", "请帮我审查一下代码。"],
    healthcare: ["您从什么时候开始发烧?", "请深呼吸。", "Cô hướng dẫn em cách phát âm câu vừa rồi nhé.", "请不要担心。"],
    finance: ["我想开一个账户。", "利率是多少?", "Thầy chỉ ra lỗi ngữ pháp giúp em nhé.", "销售额比去年增长了。"],
    refrigeration: ["冷库里现在几度?", "可能是膨胀阀堵了。", "Thầy giải thích thuật ngữ này bằng tiếng Việt nhé.", "氨泄漏时要马上撤离。"],
  } as Record<string, string[]>,
  placement: [
    {
      question: "Chọn câu đúng: “Tôi là sinh viên.”",
      options: ["我是学生。", "我是很学生。", "我学生是。"],
      answer: 0,
      explanation: "是 nối hai danh từ: 我是学生 (Tôi là học sinh/sinh viên). Không dùng 很 trước danh từ.",
    },
    {
      question: "Điền vào chỗ trống: 「我昨天吃___晚饭。」(Hôm qua tôi đã ăn tối.)",
      options: ["了", "着", "吗"],
      answer: 0,
      explanation: "了 đặt sau động từ để diễn tả hành động đã hoàn thành.",
    },
    {
      question: "Điền vào chỗ trống: 「我每天坐地铁___学校。」(Mỗi ngày tôi đi tàu điện đến trường.)",
      options: ["去", "在", "给"],
      answer: 0,
      explanation: "去 + nơi chốn = đi đến đâu. 坐地铁去学校 (đi tàu điện đến trường).",
    },
    {
      question: "Chọn câu có nghĩa: “Xin cho tôi xem cái này.”",
      options: ["请给我看看这个。", "请看给我这个。", "给请我这个看。"],
      answer: 0,
      explanation: "Cấu trúc 请 + 给我 + động từ: lời nhờ vả lịch sự.",
    },
    {
      question: "Điền vào chỗ trống: 「他比我___高。」(Anh ấy cao hơn tôi.)",
      options: ["很", "更", "最"],
      answer: 1,
      explanation: "Trong câu so sánh với 比 ta dùng 更 hoặc 还 (không dùng 很): 他比我更高.",
    },
    {
      question: "Điền vào chỗ trống: 「我去___中国。」(Tôi đã từng đến Trung Quốc.)",
      options: ["过", "了", "着"],
      answer: 0,
      explanation: "Động từ + 过 diễn tả kinh nghiệm đã từng làm: 我去过中国.",
    },
    {
      question: "Điền vào chỗ trống: 「请你___这本书放在桌子上。」",
      options: ["把", "被", "让"],
      answer: 0,
      explanation: "Câu chữ 把: 把 + tân ngữ + động từ + thành phần bổ sung (放在桌子上).",
    },
    {
      question: "Điền vào chỗ trống: 「___你不说,我___知道。」(Nếu bạn không nói thì tôi không biết.)",
      options: ["如果……就", "虽然……但是", "不但……而且"],
      answer: 0,
      explanation: "如果……就…… diễn tả giả thiết: nếu… thì….",
    },
  ] as PlacementQuestion[],
  tutors: {
    maya: {
      name: "Lin Laoshi",
      title: "Cô giáo Trung Quốc",
      tagline: "Dịu dàng, phát âm chuẩn, kiên nhẫn hướng dẫn",
      description: "Cô giáo nhiệt tình, sửa tỉ mỉ từng thanh điệu, phát âm và ngữ pháp theo trình độ của bạn.",
      greeting: "Hôm nay cô sẽ đồng hành cùng em luyện nói tiếng Trung thật tự tin nhé.",
    },
    david: {
      name: "Wei Laoshi",
      title: "Thầy giáo Trung Quốc",
      tagline: "Điềm đạm, rõ ràng, giỏi tình huống công sở",
      description: "Thầy giáo phong cách chuyên nghiệp, phản xạ nhanh và chuyên sâu giao tiếp công việc.",
      greeting: "Hôm nay thầy sẽ cùng em luyện nói tiếng Trung thật tự nhiên nhé.",
    },
    alex: {
      name: "Panda",
      title: "Linh vật học tập",
      tagline: "Đáng yêu, hồn nhiên, học tập không áp lực",
      description: "Chú gấu trúc tròn xinh quàng khăn đỏ, vui tính, học tập không áp lực.",
      greeting: "Cùng nhau học tiếng Trung thật vui nào!",
    },
  } as Record<"maya" | "david" | "alex", TutorText>,
  grammarTopics,
};

export default zh;
