"""Placement tests: 20 questions per language, 5 per level (A1, A2, B1, B2 = N5–N2 / HSK 1–5).

Run: python scripts/curriculum/placement.py
Replaces the `placement: [...]` block of src/lib/languages/{en,ja,zh}.ts. Answer positions are shuffled
with a fixed seed, so they are spread over A–D but stay the same on every run.
"""
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

EN = [
    ("A1", "Chọn từ đúng: “She ___ a teacher.”", ["is", "am", "are", "be"], "Chủ ngữ she/he/it đi với is."),
    ("A1", "Chọn từ đúng: “___ you like coffee?”", ["Do", "Does", "Are", "Is"], "Câu hỏi với you ở hiện tại đơn dùng Do."),
    ("A1", "Chọn từ đúng: “There ___ two books on the table.”", ["are", "is", "be", "am"], "Danh từ số nhiều (two books) → There are."),
    ("A1", "Từ nào trái nghĩa với “cheap”?", ["expensive", "small", "new", "easy"], "cheap (rẻ) ↔ expensive (đắt)."),
    ("A1", "Chọn giới từ đúng: “I usually get up ___ 7 o'clock.”", ["at", "in", "on", "by"], "Giờ cụ thể dùng at."),
    ("A2", "Chọn từ đúng: “I ___ to Da Nang last summer.”", ["went", "go", "gone", "going"], "last summer → quá khứ đơn: went."),
    ("A2", "Chọn từ đúng: “This hotel is ___ than the other one.”", ["cheaper", "more cheap", "cheapest", "the cheaper"], "Tính từ ngắn so sánh hơn: cheap → cheaper than."),
    ("A2", "Chọn cụm đúng: “We ___ visit our grandparents tomorrow.”", ["are going to", "going to", "will to", "goes to"], "Kế hoạch tương lai: be going to + V."),
    ("A2", "Chọn từ đúng: “Have you ever ___ sushi?”", ["eaten", "eat", "ate", "eating"], "Hiện tại hoàn thành: have + V3 (eaten)."),
    ("A2", "Đọc: “Tom missed the bus, so he took a taxi to work.” — Vì sao Tom đi taxi?", ["He missed the bus.", "He likes taxis.", "The bus was early.", "He was late for school."], "“missed the bus, so he took a taxi”."),
    ("B1", "Chọn từ đúng: “If it rains tomorrow, we ___ at home.”", ["will stay", "stay", "would stay", "stayed"], "Điều kiện loại 1: If + hiện tại đơn, will + V."),
    ("B1", "Chọn từ đúng: “The report ___ by the manager yesterday.”", ["was written", "wrote", "has written", "is writing"], "Bị động quá khứ: was + V3."),
    ("B1", "Chọn từ đúng: “I've been working here ___ 2019.”", ["since", "for", "from", "ago"], "Mốc thời gian → since."),
    ("B1", "Chọn câu tường thuật đúng: “Where do you live?” → She asked me ___.", ["where I lived", "where did I live", "where do I live", "where I live?"], "Câu hỏi gián tiếp: không đảo ngữ, lùi thì."),
    ("B1", "Chọn từ đúng: “I'm not used to ___ up so early.”", ["getting", "get", "got", "gets"], "be used to + V-ing (quen với việc...)."),
    ("B2", "Chọn từ đúng: “If I ___ about the traffic, I would have left earlier.”", ["had known", "knew", "have known", "would know"], "Điều kiện loại 3: If + had + V3, would have + V3."),
    ("B2", "Chọn từ đúng: “Hardly ___ the meeting started when the fire alarm went off.”", ["had", "has", "did", "was"], "Đảo ngữ: Hardly had + S + V3 ... when ..."),
    ("B2", "Chọn từ đúng: “The project was a success ___ the tight budget.”", ["despite", "although", "because", "even"], "despite + danh từ; although + mệnh đề."),
    ("B2", "Từ nào gần nghĩa nhất với “postpone” trong “We need to postpone the launch.”?", ["delay", "cancel", "announce", "speed up"], "postpone = hoãn lại = delay."),
    ("B2", "Chọn từ đúng: “By the time we arrive, the film ___.”", ["will have started", "will start", "has started", "starts"], "By the time + hiện tại → tương lai hoàn thành: will have + V3."),
]

JA = [
    ("A1", "Điền trợ từ: 「わたし___がくせいです。」(Tôi là sinh viên.)", ["は", "を", "に", "で"], "は là trợ từ chủ đề: 私は〜です."),
    ("A1", "「これは何ですか。」—「___はペンです。」", ["それ", "あれ", "どれ", "なに"], "Hỏi về vật gần người hỏi (これ) → trả lời bằng それ."),
    ("A1", "Cách đọc đúng của 「三時」(3 giờ)?", ["さんじ", "みじ", "さんとき", "みっつじ"], "三時 = さんじ."),
    ("A1", "Điền trợ từ: 「毎日バス___学校へ行きます。」", ["で", "を", "が", "に"], "で chỉ phương tiện: バスで."),
    ("A1", "Điền vào chỗ trống: 「昨日、映画を___。」(Hôm qua tôi đã xem phim.)", ["見ました", "見ます", "見ません", "見る"], "Quá khứ lịch sự: 〜ました."),
    ("A2", "Điền vào chỗ trống: 「雨が降っている___、傘を持っていきます。」", ["から", "けど", "のに", "まで"], "から chỉ lý do: vì trời mưa nên mang ô."),
    ("A2", "Điền vào chỗ trống: 「日本語を話す___ができます。」", ["こと", "もの", "ところ", "ため"], "V辞書形 + ことができます = có thể làm."),
    ("A2", "Điền vào chỗ trống: 「ここで写真を撮って___いいですか。」", ["も", "は", "が", "を"], "〜てもいいですか = làm ~ có được không?"),
    ("A2", "Điền vào chỗ trống: 「先生に日本語を___もらいました。」", ["教えて", "教えた", "教える", "教え"], "Vてもらう = được ai đó làm cho."),
    ("A2", "“Cửa sổ đang mở (tự trạng thái).” →「窓が___います。」", ["開いて", "開けて", "開く", "開け"], "Tự động từ 開く + ている chỉ trạng thái."),
    ("B1", "Điền vào chỗ trống: 「毎日練習した___、上手になりました。」", ["おかげで", "せいで", "くせに", "ために"], "おかげで: nhờ ~ (kết quả tốt)."),
    ("B1", "Điền vào chỗ trống: 「彼は忙しい___、パーティーに来てくれた。」", ["のに", "ので", "から", "ために"], "のに: mặc dù ~ (trái với mong đợi)."),
    ("B1", "“Tôi bị mẹ bắt ăn rau.” →「母に野菜を___。」", ["食べさせられた", "食べさせた", "食べられた", "食べた"], "Thể sai khiến bị động: 食べさせられる."),
    ("B1", "“Trông như sắp mưa.” →「雨が降り___だ。」", ["そう", "よう", "らしい", "みたい"], "V(bỏ ます) + そうだ: trông như sắp ~."),
    ("B1", "Nghĩa của 「予約」?", ["đặt trước", "hủy bỏ", "xác nhận", "thanh toán"], "予約 (よやく) = đặt trước."),
    ("B2", "Kính ngữ của 来る: 「部長は明日の会議に___。」", ["いらっしゃいます", "参ります", "伺います", "おります"], "いらっしゃる là tôn kính ngữ; 参る, 伺う, おる là khiêm nhường ngữ."),
    ("B2", "Khiêm nhường: “Tôi sẽ gửi tài liệu.” →「資料を___。」", ["お送りします", "お送りになります", "送られます", "送ってくださいます"], "お + V(ます bỏ) + します: khiêm nhường ngữ."),
    ("B2", "Điền vào chỗ trống: 「この問題は専門家___解決できない。」", ["でなければ", "だけに", "からには", "ばかりか"], "〜でなければ〜ない: nếu không phải ~ thì không ~."),
    ("B2", "Từ gần nghĩa nhất với 「検討する」?", ["よく考える", "すぐ断る", "忘れる", "決める"], "検討する = xem xét kỹ."),
    ("B2", "Điền vào chỗ trống: 「努力した___、合格できなかった。」", ["にもかかわらず", "おかげで", "ために", "からこそ"], "にもかかわらず: mặc dù ~ nhưng."),
]

ZH = [
    ("A1", "Điền vào chỗ trống: 我___学生。(Tôi là sinh viên.)", ["是", "有", "在", "很"], "是 = là."),
    ("A1", "Điền vào chỗ trống: 你叫什么___?(Bạn tên là gì?)", ["名字", "东西", "地方", "时候"], "名字 = tên."),
    ("A1", "Câu nào nghĩa là “Bạn khỏe không?”", ["你好吗?", "你是谁?", "你去哪儿?", "你几岁?"], "你好吗 = bạn khỏe không."),
    ("A1", "Điền vào chỗ trống: 我___北京工作。(Tôi làm việc ở Bắc Kinh.)", ["在", "是", "有", "去"], "在 + nơi chốn + động từ."),
    ("A1", "Điền vào chỗ trống: 这个苹果___钱?(Quả táo này bao nhiêu tiền?)", ["多少", "几", "什么", "哪"], "多少钱 = bao nhiêu tiền."),
    ("A2", "Điền vào chỗ trống: 我昨天去商店___一件衣服。", ["买了", "买过", "买着", "在买"], "了 sau động từ chỉ hành động đã hoàn thành."),
    ("A2", "Điền vào chỗ trống: 他___我高。(Anh ấy cao hơn tôi.)", ["比", "跟", "和", "对"], "A 比 B + tính từ: so sánh hơn."),
    ("A2", "Điền vào chỗ trống: 我会说汉语，___说得不太好。", ["但是", "因为", "所以", "如果"], "但是 = nhưng."),
    ("A2", "Điền vào chỗ trống: 你去过中国___?", ["吗", "呢", "吧", "啊"], "Câu hỏi có/không dùng 吗."),
    ("A2", "Điền vào chỗ trống: 我们一起去吃饭___!(Mình cùng đi ăn nhé!)", ["吧", "吗", "呢", "了"], "吧 dùng để rủ rê, đề nghị."),
    ("B1", "Điền vào chỗ trống: 门开___，请进。(Cửa đang mở, mời vào.)", ["着", "了", "过", "的"], "V + 着 chỉ trạng thái kéo dài."),
    ("B1", "Điền vào chỗ trống: 我把作业___了。", ["做完", "做", "在做", "做着"], "Câu chữ 把 cần bổ ngữ kết quả: 把作业做完了."),
    ("B1", "Chọn cặp từ nối đúng: ___下雨，比赛___取消了。", ["因为…所以", "虽然…但是", "如果…就", "不但…而且"], "因为…所以 = vì… nên…."),
    ("B1", "Điền vào chỗ trống: 他汉语说___很流利。", ["得", "的", "地", "了"], "Bổ ngữ trạng thái: V + 得 + 很 + tính từ."),
    ("B1", "Nghĩa của 「经验」?", ["kinh nghiệm", "kinh tế", "kiểm tra", "kế hoạch"], "经验 (jīngyàn) = kinh nghiệm."),
    ("B2", "Chọn cặp từ nối đúng: ___你同意，我们___开始。", ["只要…就", "虽然…但是", "因为…所以", "不管…都"], "只要…就 = chỉ cần… thì…."),
    ("B2", "Chọn câu đúng.", ["他的成绩有了很大的提高。", "他的成绩很大的有提高。", "他的成绩有大的很提高。", "他的成绩提高很大的有。"], "有了很大的提高 = đã có tiến bộ lớn."),
    ("B2", "Nghĩa của 「推迟」?", ["hoãn lại", "hủy bỏ", "thúc đẩy", "công bố"], "推迟 (tuīchí) = hoãn lại."),
    ("B2", "Điền vào chỗ trống: 这件事___他来说并不难。", ["对", "给", "向", "跟"], "对…来说 = đối với… mà nói."),
    ("B2", "Điền vào chỗ trống: 他一进门，___发现钱包不见了。", ["就", "才", "也", "还"], "一…就… = vừa… liền…."),
]


def block(lang, items):
    rnd = random.Random(f"placement-{lang}")
    lines = ["placement: ["]
    for level, question, options, explanation in items:
        order = list(range(len(options)))
        rnd.shuffle(order)
        shuffled = [options[i] for i in order]
        lines += ["    {",
                  f"      level: {json.dumps(level)},",
                  f"      question: {json.dumps(question, ensure_ascii=False)},",
                  f"      options: {json.dumps(shuffled, ensure_ascii=False)},",
                  f"      answer: {order.index(0)},",
                  f"      explanation: {json.dumps(explanation, ensure_ascii=False)},",
                  "    },"]
    lines.append("  ]")
    return "\n".join(lines)


for lang, items in (("en", EN), ("ja", JA), ("zh", ZH)):
    assert len(items) == 20 and all(sum(1 for i in items if i[0] == lv) == 5 for lv in ("A1", "A2", "B1", "B2")), lang
    path = ROOT / "src" / "lib" / "languages" / f"{lang}.ts"
    text = path.read_text(encoding="utf-8")
    start = text.index("placement: [")
    depth, end = 0, start + len("placement: ")
    while True:
        ch = text[end]
        depth += ch == "["
        depth -= ch == "]"
        end += 1
        if depth == 0:
            break
    path.write_text(text[:start] + block(lang, items) + text[end:], encoding="utf-8", newline="\n")
    print(lang, "20 questions")
