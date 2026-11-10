"""Nails course, extra C1 (6) and C2 (6) lessons. Each entry is the argument list of L() in new_courses.py:
(level, category, title, objective, reading, vocab, grammar, pron, tasks, questions)."""

C1_MORE = [
    ("C1", "Chuyên môn", "Tư vấn khách có bệnh nền an toàn",
     "Hỏi về sức khỏe, nêu biện pháp phòng ngừa và dặn khách theo dõi sau dịch vụ.",
     "Technician: Before we begin, I always ask clients about any health conditions. Do you have anything we should be aware of?\n"
     "Customer: I'm diabetic, and I'm on medication that affects my circulation.\n"
     "Technician: Thank you for telling me. In that case, we'll take extra precautions. Because wounds can heal slowly, I'll avoid cutting the cuticles and I won't use any metal implements that could break the skin.\n"
     "Customer: Is it still safe to have a pedicure?\n"
     "Technician: Generally, yes, provided it's done gently and the tools are sterile. I'd recommend that you check your feet regularly, and see your doctor straight away if you notice any redness, sores or swelling.\n"
     "Customer: I appreciate how careful you are.\n"
     "Technician: Your safety comes first. If at any point you feel discomfort, please tell me immediately.",
     [("precaution", "biện pháp phòng ngừa", "We take extra precautions with diabetic clients."),
      ("circulation", "tuần hoàn máu", "Poor circulation slows healing."),
      ("implement", "dụng cụ", "I won't use any sharp implements."),
      ("sterile", "vô trùng", "All our tools are sterile."),
      ("sore", "vết loét", "Report any sores to your doctor."),
      ("discomfort", "sự khó chịu", "Tell me if you feel any discomfort.")],
     ("Mệnh đề quan hệ nêu rủi ro: ... that could / which may + V",
      "Dùng mệnh đề quan hệ để mô tả loại dụng cụ hay sản phẩm có thể gây hại.",
      ["I won't use implements that could break the skin.", "Avoid products which may irritate sensitive skin.", "Any client who has diabetes needs extra care."]),
     ("Nhấn âm tiết: circuLAtion, preCAUtion",
      "Từ đuôi -tion nhấn âm ngay trước đuôi; nói chậm với thuật ngữ y khoa.",
      ["circulation", "precaution", "sterile", "implement"]),
     ["Hỏi khách về tình trạng sức khỏe trước khi làm dịch vụ.", "Giải thích các biện pháp phòng ngừa bạn sẽ áp dụng."],
     [("Why does the technician ask about health conditions?", ["To take the right precautions", "To fill in a form for fun", "To charge more"], 0, "'we'll take extra precautions'."),
      ("Why will she avoid cutting the cuticles?", ["Wounds can heal slowly", "They are too long", "The customer dislikes it"], 0, "'wounds can heal slowly'."),
      ("Is a pedicure safe for this customer?", ["Generally yes, if done gently with sterile tools", "No, never", "Only on Sundays"], 0, "'Generally, yes, provided it's done gently and the tools are sterile'."),
      ("When should the customer see a doctor?", ["If she notices redness, sores or swelling", "Every single day", "Never"], 0, "'see your doctor straight away if you notice any redness, sores or swelling'."),
      ("What does 'Your safety comes first' mean?", ["Safety is the top priority", "The customer goes first", "She pays first"], 0, "come first = được ưu tiên hàng đầu.")]),

    ("C1", "Chuyên môn", "Giải thích khoa học về cấu trúc móng",
     "Giải thích bằng ngôn ngữ dễ hiểu vì sao móng tách lớp và cách bảo vệ móng.",
     "Customer: Why do my nails keep peeling in layers? It's so frustrating.\n"
     "Technician: What you're describing is called lamellar splitting. Nails are made of keratin, a protein arranged in tightly packed layers. When the layers separate, they peel.\n"
     "Customer: What causes that?\n"
     "Technician: Usually repeated wetting and drying, harsh products, or trauma such as using your nails as tools. Nutrition can play a part too, although the evidence for supplements is mixed.\n"
     "Customer: So no miracle cure?\n"
     "Technician: Unfortunately not. The most reliable remedy is protection: moisturise, wear gloves, and keep the nails short while they recover. Growth is slow — a fingernail takes roughly six months to grow out completely — so patience is essential.",
     [("keratin", "chất sừng keratin", "Nails are made of keratin."),
      ("layer", "lớp", "The nail plate has several layers."),
      ("trauma", "chấn thương", "Trauma can damage the nail plate."),
      ("evidence", "bằng chứng", "The evidence for supplements is mixed."),
      ("remedy", "biện pháp khắc phục", "The best remedy is protection."),
      ("patience", "sự kiên nhẫn", "Recovery takes patience.")],
     ("Giải thích khoa học: be made of / consist of / be caused by + N",
      "Dùng để mô tả thành phần và nguyên nhân bằng ngôn ngữ chính xác nhưng dễ hiểu.",
      ["Nails are made of keratin.", "Splitting is usually caused by repeated wetting.", "The nail plate consists of tightly packed layers."]),
     ("Nhấn thuật ngữ: KERatin, lamELLar",
      "Với thuật ngữ khoa học, nói chậm và nhấn âm đầu để khách nhớ.",
      ["keratin", "lamellar", "evidence", "remedy"]),
     ["Giải thích cho khách vì sao móng bị tách lớp.", "Nói vì sao không có 'phương thuốc thần kỳ' và khuyên cách bảo vệ móng."],
     [("What are nails mainly made of?", ["Keratin", "Calcium only", "Plastic"], 0, "'Nails are made of keratin'."),
      ("What does lamellar splitting mean?", ["The layers of the nail peel apart", "The nail turns yellow", "The nail grows too fast"], 0, "'When the layers separate, they peel'."),
      ("Which is NOT mentioned as a cause?", ["Too much sunlight", "Repeated wetting and drying", "Harsh products"], 0, "Ánh nắng không được nhắc đến."),
      ("How reliable are supplements, according to the technician?", ["The evidence is mixed", "They always work", "They are dangerous"], 0, "'the evidence for supplements is mixed'."),
      ("How long does a fingernail take to grow out?", ["Roughly six months", "One week", "Two years"], 0, "'roughly six months'.")]),

    ("C1", "Quản lý", "Phỏng vấn ứng viên (vai chủ tiệm)",
     "Đặt câu hỏi phỏng vấn và đánh giá câu trả lời theo tình huống, hành động, kết quả.",
     "Owner: Thanks for coming in. I'd like to start with your background. What drew you to nail technology?\n"
     "Candidate: I've always been interested in the artistic side, but over time I've come to appreciate the client relationships even more.\n"
     "Owner: Tell me about a time you handled a difficult situation with a client.\n"
     "Candidate: A customer once insisted that her gel had been applied incorrectly. Rather than getting defensive, I asked her to show me where she was unhappy, apologised for the inconvenience, and redid the affected nails at no cost.\n"
     "Owner: And how do you keep up with new techniques?\n"
     "Candidate: I attend at least two workshops a year, and I follow a few reputable educators online.\n"
     "Owner: Finally, where do you see yourself in three years?\n"
     "Candidate: Ideally, leading a small team and mentoring newer technicians.",
     [("background", "quá trình, kinh nghiệm nền", "Tell me about your background."),
      ("defensive", "phòng thủ", "Don't get defensive when you're criticised."),
      ("inconvenience", "sự bất tiện", "I apologised for the inconvenience."),
      ("reputable", "uy tín", "She follows reputable educators."),
      ("mentor", "kèm cặp, dìu dắt", "I'd like to mentor new technicians."),
      ("ideally", "lý tưởng nhất", "Ideally, I'd lead a small team.")],
     ("Rather than + V-ing / I've come to + V: kể hành động và sự thay đổi",
      "Cấu trúc giúp kể chuyện trong phỏng vấn: hành động bạn chọn và điều bạn rút ra.",
      ["Rather than arguing, I asked her to show me.", "I've come to appreciate the client relationships.", "Over time, I've learned to listen first."]),
     ("Nhấn từ chỉ hành động: Rather than getting deFENsive, I LISTened.",
      "Nhấn động từ chính khi kể hành động để câu trả lời nghe tự tin.",
      ["background", "inconvenience", "reputable", "mentoring"]),
     ["Trả lời 'Hãy kể về một lần bạn xử lý khách khó tính' theo thứ tự: tình huống, hành động, kết quả.", "Nói về kế hoạch phát triển nghề trong ba năm."],
     [("What does the candidate enjoy more over time?", ["Client relationships", "Cleaning", "Paperwork"], 0, "'appreciate the client relationships even more'."),
      ("How did she handle the unhappy customer?", ["Asked her to show the problem, apologised and redid the nails", "Refused to help", "Called the police"], 0, "'asked her to show me... apologised... redid the affected nails'."),
      ("Did she charge for the redo?", ["No, it was at no cost", "Yes, half price", "Yes, full price"], 0, "'at no cost'."),
      ("How does she keep her skills up to date?", ["Workshops and reputable online educators", "She does not", "Only by watching TV"], 0, "'at least two workshops a year, and... reputable educators online'."),
      ("What does 'Rather than getting defensive' mean?", ["Instead of reacting defensively", "Because she was defensive", "Although she was defensive"], 0, "Rather than + V-ing = thay vì.")]),

    ("C1", "Quản lý", "Chỉ số hiệu suất và đánh giá thợ",
     "Đánh giá một thợ bằng số liệu, cân bằng khen và góp ý, đề xuất giải pháp.",
     "Manager: Let's go through your key performance indicators for the quarter. Your client retention is excellent at eighty-two percent, well above the team average.\n"
     "Technician: Thank you. I always try to rebook clients before they leave.\n"
     "Manager: It shows. On the other hand, your average service time is running about ten minutes over the target, which affects our capacity.\n"
     "Technician: I think that's because I'm taking extra care with detailed nail art.\n"
     "Manager: That's understandable, and the quality is outstanding. Perhaps we could price the more intricate designs separately, so the extra time is reflected in the fee.\n"
     "Technician: That would make sense. I'd also appreciate some training on speed techniques.\n"
     "Manager: I'll arrange that. Let's reconvene in six weeks to see how the numbers look.",
     [("indicator", "chỉ số", "Retention is a key indicator of loyalty."),
      ("retention", "tỷ lệ giữ chân khách", "Client retention is excellent."),
      ("capacity", "công suất", "Long services reduce our capacity."),
      ("intricate", "phức tạp, tinh xảo", "Intricate designs take longer."),
      ("reflect", "phản ánh", "The fee should reflect the extra time."),
      ("reconvene", "họp lại", "Let's reconvene in six weeks.")],
     ("Cân bằng khen và góp ý: On the other hand / That said / Perhaps we could...",
      "Ghi nhận điểm mạnh trước, rồi chuyển sang vấn đề và đưa ra gợi ý.",
      ["Your retention is excellent. On the other hand, services run over time.", "Perhaps we could price intricate designs separately.", "That's understandable, and the quality is outstanding."]),
     ("Nhấn số liệu: eighty-TWO percent, ten MINutes over",
      "Nhấn số và đơn vị khi nêu số liệu để người nghe nhớ.",
      ["indicator", "capacity", "intricate", "reconvene"]),
     ["Đánh giá một thợ: nêu điểm mạnh bằng số liệu, rồi một điểm cần cải thiện.", "Đề xuất giải pháp cho việc dịch vụ kéo dài quá thời gian."],
     [("What is the technician's client retention rate?", ["Eighty-two percent", "Sixty percent", "Ninety-five percent"], 0, "'excellent at eighty-two percent'."),
      ("What is the problem?", ["Services run about ten minutes over target", "She is often absent", "Her work is poor"], 0, "'ten minutes over the target'."),
      ("Why does it take longer?", ["Extra care with detailed nail art", "She is slow at checking in clients", "Her tools are old"], 0, "'extra care with detailed nail art'."),
      ("What does the manager propose?", ["Pricing intricate designs separately", "Cutting her pay", "Banning nail art"], 0, "'price the more intricate designs separately'."),
      ("When will they meet again?", ["In six weeks", "Tomorrow", "In two years"], 0, "'reconvene in six weeks'.")]),

    ("C1", "Kỹ năng", "Trả lời đánh giá tiêu cực công khai",
     "Soạn phản hồi lịch sự cho đánh giá xấu: ghi nhận, xin lỗi và chuyển trao đổi sang kênh riêng.",
     "Review: 'Overpriced and rushed. The technician barely spoke to me and one nail chipped the same day. Would not recommend.'\n"
     "Draft reply: 'Dear Ms Carter, thank you for your feedback, and I'm sorry that your visit fell short of expectations. Our aim is for every client to feel valued, so I'm disappointed to hear you felt rushed. Chipping within a day isn't the standard we stand by; I'd welcome the chance to repair it free of charge. If you'd be willing to contact us directly at the salon, I will personally ensure the matter is resolved.'\n"
     "Owner: Is that too formal?\n"
     "Consultant: It's courteous, but I'd soften it slightly. Avoid defending yourself in public; acknowledge, apologise, and move the conversation offline. Also, never reveal personal details about the client.",
     [("fall short", "không đạt kỳ vọng", "Don't let the service fall short of expectations."),
      ("expectation", "kỳ vọng", "We aim to exceed every expectation."),
      ("courteous", "lịch sự", "Her reply was courteous."),
      ("acknowledge", "ghi nhận, thừa nhận", "Always acknowledge the customer's concern."),
      ("offline", "trao đổi riêng, ngoài mạng", "Take the conversation offline."),
      ("resolve", "giải quyết", "We will resolve the matter quickly.")],
     ("Cụm trang trọng khi phản hồi: I'm sorry that... / I'd welcome the chance to... / If you'd be willing to...",
      "Dùng để xin lỗi, đề nghị khắc phục và mời liên hệ riêng một cách lịch sự.",
      ["I'm sorry that your visit fell short of expectations.", "I'd welcome the chance to repair it.", "If you'd be willing to contact us, we'll resolve it."]),
     ("Nhấn từ cảm xúc: I'm DISappointed to hear that.",
      "Giữ giọng nhẹ và nhấn từ cảm xúc để phản hồi nghe chân thành.",
      ["expectations", "courteous", "acknowledge", "resolved"]),
     ["Viết (nói) phản hồi cho một đánh giá một sao về việc làm vội.", "Giải thích vì sao nên chuyển cuộc trao đổi sang kênh riêng."],
     [("What complaints does the review contain?", ["Overpriced, rushed, and a chipped nail", "Dirty tools", "A rude receptionist"], 0, "'Overpriced and rushed... one nail chipped'."),
      ("What does the draft reply offer?", ["To repair the nail free of charge", "A refund of everything", "A new job"], 0, "'repair it free of charge'."),
      ("What does the consultant advise avoiding?", ["Defending yourself in public", "Apologising", "Replying"], 0, "'Avoid defending yourself in public'."),
      ("What does 'move the conversation offline' mean?", ["Continue the discussion privately", "Stop using the internet", "Delete the review"], 0, "offline = chuyển sang trao đổi riêng."),
      ("What must never be revealed?", ["Personal details about the client", "The salon's name", "The prices"], 0, "'never reveal personal details about the client'.")]),

    ("C1", "Quản lý", "Quy trình chuẩn và kiểm soát chất lượng",
     "Giới thiệu quy trình chuẩn (SOP), cách kiểm tra và xử lý khi có sai sót.",
     "Owner: From today, every service will follow a standard operating procedure. It might feel rigid at first, but consistency is what protects both our clients and our reputation.\n"
     "Technician: What does the checklist cover?\n"
     "Owner: Everything from greeting and consultation to sanitising your station between clients. Each step has a sign-off box, and the supervisor will spot-check ten percent of services every week.\n"
     "Technician: What happens if a step is missed?\n"
     "Owner: We treat it as a learning opportunity, not a punishment, unless it involves a safety breach. In that case, we escalate it immediately.\n"
     "Technician: That sounds fair. Will the checklist be available in other languages for newer staff?\n"
     "Owner: Good point. We'll translate it into Vietnamese and Spanish.",
     [("standard operating procedure", "quy trình vận hành chuẩn", "Every service follows a standard operating procedure."),
      ("rigid", "cứng nhắc", "The rules may feel rigid at first."),
      ("sanitise", "vệ sinh khử khuẩn", "Sanitise your station between clients."),
      ("spot-check", "kiểm tra ngẫu nhiên", "The supervisor will spot-check services."),
      ("breach", "vi phạm, sai phạm", "A safety breach is serious."),
      ("escalate", "báo cáo lên cấp cao hơn", "We escalate safety issues immediately.")],
     ("Quy định và ngoại lệ: will + V / unless / In that case",
      "Nêu quy tắc chung, ngoại lệ và hành động tương ứng.",
      ["Every step will be signed off.", "We treat it as a learning opportunity, unless it involves a safety breach.", "In that case, we escalate it immediately."]),
     ("Nhấn thuật ngữ: proCEDure, saniTISE, ESCalate",
      "Nói chậm với thuật ngữ quy trình để nhân viên mới nghe rõ.",
      ["procedure", "sanitise", "breach", "escalate"]),
     ["Giới thiệu một quy trình chuẩn mới cho nhân viên.", "Giải thích cách xử lý khi một bước bị bỏ sót."],
     [("What does the owner introduce?", ["A standard operating procedure for every service", "A new uniform", "A bonus"], 0, "'every service will follow a standard operating procedure'."),
      ("How often does the supervisor spot-check services?", ["Ten percent of services every week", "Every single service", "Once a year"], 0, "'spot-check ten percent of services every week'."),
      ("What happens if a step is missed?", ["It's treated as a learning opportunity", "The technician is fired", "Nothing at all"], 0, "'a learning opportunity, not a punishment'."),
      ("When is something escalated immediately?", ["When it involves a safety breach", "When a client is late", "When polish runs out"], 0, "'unless it involves a safety breach... we escalate it'."),
      ("What will be translated?", ["The checklist", "The prices", "The contracts"], 0, "'We'll translate it into Vietnamese and Spanish'.")]),
]

C2_MORE = [
    ("C2", "Quản lý", "Nhượng quyền và mở rộng chuỗi",
     "Thảo luận các biện pháp giữ chuẩn chất lượng và điều khoản chính của hợp đồng nhượng quyền.",
     "Advisor: Franchising can accelerate growth, but it also means relinquishing a degree of control. Have you considered how you'd maintain standards across independently owned locations?\n"
     "Owner: That's my main concern. I'd want a comprehensive operations manual, mandatory training for every franchisee, and the right to audit each location unannounced.\n"
     "Advisor: Those are sensible safeguards. You'll also need a franchise agreement that clearly defines royalties, territorial exclusivity and the grounds for termination.\n"
     "Owner: What royalty rate is typical?\n"
     "Advisor: Anywhere between five and eight percent of gross sales, depending on the support you provide. Should a franchisee underperform, you'd want step-in rights, allowing you to take over operations temporarily.\n"
     "Owner: I'll need to take legal advice before going any further.",
     [("franchisee", "bên nhận nhượng quyền", "Every franchisee must complete our training."),
      ("royalty", "phí bản quyền (% doanh thu)", "The royalty is six percent of sales."),
      ("exclusivity", "độc quyền khu vực", "Territorial exclusivity protects each franchisee."),
      ("termination", "chấm dứt hợp đồng", "The agreement lists the grounds for termination."),
      ("underperform", "hoạt động kém hiệu quả", "If a location underperforms, we may step in."),
      ("safeguard", "biện pháp bảo vệ", "A manual is a sensible safeguard.")],
     ("Đảo ngữ Should + S + V trong hợp đồng: Should a franchisee underperform, ...",
      "Cách nói trang trọng thay cho 'If a franchisee underperforms'; thường dùng trong hợp đồng.",
      ["Should a franchisee underperform, we may step in.", "Should you need advice, consult a solicitor.", "Should the agreement be terminated, the brand reverts to us."]),
     ("Nhấn thuật ngữ pháp lý: franchiSEE, ROYalty, exclusIVity",
      "Từ đuôi -ee nhấn ở âm cuối; nói chậm với thuật ngữ pháp lý.",
      ["franchisee", "royalty", "exclusivity", "termination"]),
     ["Giải thích ba biện pháp giữ chuẩn chất lượng cho các chi nhánh nhượng quyền.", "Tóm tắt các điều khoản chính của hợp đồng nhượng quyền."],
     [("What is the owner's main concern?", ["Maintaining standards across locations", "Finding a name", "Choosing colours"], 0, "'how you'd maintain standards across independently owned locations'."),
      ("What safeguards does the owner want?", ["An operations manual, mandatory training and unannounced audits", "Free supplies", "No rules"], 0, "'operations manual, mandatory training... audit each location unannounced'."),
      ("What royalty rate is typical?", ["Five to eight percent of gross sales", "Fifty percent", "Zero"], 0, "'between five and eight percent of gross sales'."),
      ("What are step-in rights?", ["The right to take over a location temporarily", "The right to sell products", "The right to rent a building"], 0, "'take over operations temporarily'."),
      ("What will the owner do before going further?", ["Take legal advice", "Sign immediately", "Cancel the plan"], 0, "'I'll need to take legal advice'.")]),

    ("C2", "Pháp lý", "Bảo hiểm trách nhiệm và yêu cầu bồi thường",
     "Hiểu phạm vi bảo hiểm, quy trình khi có khiếu nại bồi thường và nghĩa vụ khai báo.",
     "Broker: Your current policy covers public liability up to one million dollars, but it excludes treatments performed outside the salon premises.\n"
     "Owner: We're considering offering mobile services at weddings. Would that be covered?\n"
     "Broker: Not under the existing terms. You'd need to extend the policy, and the insurer would likely require evidence of your technicians' qualifications.\n"
     "Owner: And if a client made a claim, what's the process?\n"
     "Broker: You should notify us as soon as the incident occurs, preserving all relevant documentation: consent forms, product records, photographs. Failure to disclose pertinent information could invalidate the claim.\n"
     "Owner: What about the excess?\n"
     "Broker: That's the amount you'd pay yourself before the insurer contributes. A higher excess usually lowers your premium.",
     [("liability", "trách nhiệm pháp lý", "Public liability insurance is essential."),
      ("exclude", "loại trừ", "The policy excludes mobile services."),
      ("premises", "cơ sở, mặt bằng", "Treatments outside the premises are not covered."),
      ("claim", "yêu cầu bồi thường", "A client made a claim after the incident."),
      ("disclose", "tiết lộ, khai báo", "You must disclose all relevant facts."),
      ("excess", "mức khấu trừ (phần tự chịu)", "You pay the excess before the insurer contributes.")],
     ("Cảnh báo hậu quả: Failure to + V could/may + V / as soon as",
      "Nêu rõ hậu quả của việc không làm một điều gì đó, dùng nhiều trong văn bản pháp lý.",
      ["Failure to disclose information could invalidate the claim.", "Failure to keep records may affect your cover.", "Notify us as soon as an incident occurs."]),
     ("Nhấn thuật ngữ: liaBILity, PREmises",
      "Âm tiết nhấn quyết định nghĩa của thuật ngữ; nói chậm và rõ.",
      ["liability", "premises", "disclose", "excess"]),
     ["Giải thích phạm vi bảo hiểm của tiệm cho nhân viên mới.", "Mô tả các bước cần làm ngay khi có khách khiếu nại bồi thường."],
     [("What does the current policy exclude?", ["Treatments outside the salon premises", "Treatments inside the salon", "Staff training"], 0, "'excludes treatments performed outside the salon premises'."),
      ("What might the insurer require for mobile services?", ["Evidence of technicians' qualifications", "A new logo", "More staff"], 0, "'evidence of your technicians' qualifications'."),
      ("When should the owner notify the insurer?", ["As soon as the incident occurs", "After a month", "Never"], 0, "'as soon as the incident occurs'."),
      ("What could invalidate a claim?", ["Failing to disclose relevant information", "Paying early", "Having photographs"], 0, "'Failure to disclose pertinent information could invalidate the claim'."),
      ("What does a higher excess usually do?", ["Lowers the premium", "Raises the premium", "Cancels the policy"], 0, "'A higher excess usually lowers your premium'.")]),

    ("C2", "Kỹ năng", "Hợp tác thương hiệu và đàm phán tài trợ",
     "Thương lượng quyền kiểm soát nội dung, minh bạch quảng cáo và thù lao khi hợp tác với nhãn hàng.",
     "Brand rep: We'd be delighted to sponsor your salon's social channels in return for featuring our new polish collection in your content.\n"
     "Owner: I'm open to a partnership, but I'd want editorial control. Our audience trusts us because we only recommend what we genuinely use.\n"
     "Brand rep: Understood. We could draft guidelines rather than scripts, giving you creative freedom within certain boundaries.\n"
     "Owner: Then there's the question of disclosure. Any sponsored post must be clearly labelled, otherwise we risk undermining that trust and breaching advertising rules.\n"
     "Brand rep: Absolutely. In terms of compensation, we propose a flat fee plus a commission on sales generated through a discount code.\n"
     "Owner: That's a reasonable starting point. Let's put the main terms in a one-page memorandum before drawing up a formal contract.",
     [("sponsor", "tài trợ", "The brand will sponsor our channels."),
      ("editorial control", "quyền kiểm soát nội dung", "We insist on editorial control."),
      ("boundaries", "ranh giới, giới hạn", "You have creative freedom within clear boundaries."),
      ("sponsored", "được tài trợ (quảng cáo)", "Every sponsored post must be labelled."),
      ("compensation", "thù lao", "The compensation is a flat fee plus commission."),
      ("memorandum", "bản ghi nhớ", "We'll sign a short memorandum first.")],
     ("Điều kiện đối ứng: in return for / rather than / in terms of",
      "Nêu điều bạn đổi lấy điều gì và cách chia khoản mục khi đàm phán.",
      ["We'd sponsor you in return for featuring our collection.", "In terms of compensation, we propose a flat fee.", "We could draft guidelines rather than scripts."]),
     ("Nhấn thuật ngữ: SPONsor, edi-TOR-ial, compenSAtion",
      "Từ dài nhấn âm tiết ngay trước -tion/-ial; nói rõ để đối tác không hiểu nhầm.",
      ["sponsor", "editorial", "compensation", "memorandum"]),
     ["Thương lượng quyền kiểm soát nội dung khi nhận tài trợ.", "Nêu yêu cầu minh bạch về nội dung quảng cáo."],
     [("What does the brand want in return for sponsorship?", ["Featuring its polish collection in the content", "A free manicure", "The salon's address"], 0, "'featuring our new polish collection'."),
      ("Why does the owner want editorial control?", ["The audience trusts what they genuinely use", "It is cheaper", "Brands are rude"], 0, "'we only recommend what we genuinely use'."),
      ("What does the brand propose instead of scripts?", ["Guidelines", "Silence", "A contract"], 0, "'draft guidelines rather than scripts'."),
      ("What must be done with sponsored posts?", ["They must be clearly labelled", "They must be deleted", "They must be hidden"], 0, "'must be clearly labelled'."),
      ("How would the compensation work?", ["A flat fee plus commission on sales", "Only free products", "A monthly salary"], 0, "'a flat fee plus a commission on sales'.")]),

    ("C2", "Quản lý", "Thương lượng lương và giữ chân thợ giỏi",
     "Trình bày đóng góp, đề xuất mức tăng và thương lượng điều kiện đi kèm.",
     "Technician: Thank you for meeting me. I'd like to discuss my compensation. Over the past year I've taken on additional responsibilities, including training new staff, and my client numbers have grown by thirty percent.\n"
     "Owner: I'm aware of your contributions, and I value them. What did you have in mind?\n"
     "Technician: Given the market rate for someone with my experience, I was hoping for a fifteen percent increase.\n"
     "Owner: Fifteen is ambitious, given our current margins. However, I'd be prepared to offer eight percent now, with a performance review in six months that could lead to a further increase.\n"
     "Technician: I'd consider that if we could also include a mentoring allowance, since that's a considerable part of my role.\n"
     "Owner: That's reasonable. Let me put a proposal together by Friday.",
     [("contribution", "đóng góp", "I value your contribution to the team."),
      ("market rate", "mức giá thị trường", "Our pay is above the market rate."),
      ("ambitious", "tham vọng, hơi cao", "Fifteen percent is ambitious."),
      ("allowance", "phụ cấp", "We offer a mentoring allowance."),
      ("retain", "giữ chân", "We want to retain our best technicians."),
      ("proposal", "đề xuất", "I'll put a proposal together.")],
     ("Thương lượng: I was hoping for... / I'd be prepared to... / I'd consider that if...",
      "Nêu mong muốn, mức có thể chấp nhận và điều kiện đi kèm một cách lịch sự.",
      ["I was hoping for a fifteen percent increase.", "I'd be prepared to offer eight percent now.", "I'd consider that if we added a mentoring allowance."]),
     ("Nhấn từ khoá khi thương lượng: fifTEEN percent, a MENtoring allowance",
      "Đọc rõ số liệu và nhấn điều kiện quan trọng khi đàm phán.",
      ["contribution", "ambitious", "allowance", "retain"]),
     ["Trình bày ba đóng góp của bạn khi xin tăng lương.", "Phản hồi một đề nghị tăng lương thấp hơn mong muốn."],
     [("What has grown by thirty percent?", ["The technician's client numbers", "The salon's rent", "The number of staff"], 0, "'my client numbers have grown by thirty percent'."),
      ("How big an increase does she ask for?", ["Fifteen percent", "Eight percent", "Thirty percent"], 0, "'a fifteen percent increase'."),
      ("What does the owner offer?", ["Eight percent now and a review in six months", "Nothing", "Fifteen percent immediately"], 0, "'eight percent now, with a performance review in six months'."),
      ("What extra does the technician request?", ["A mentoring allowance", "A longer holiday", "A new chair"], 0, "'a mentoring allowance'."),
      ("When will the owner send a proposal?", ["By Friday", "Next year", "Today at noon"], 0, "'by Friday'.")]),

    ("C2", "Quản lý", "Hòa giải mâu thuẫn giữa hai nhân viên",
     "Lắng nghe hai bên, xác định nguyên nhân gốc và thống nhất quy tắc chung.",
     "Manager: I've asked to see you both because I understand there's been some tension over the shared client list.\n"
     "Technician A: She's been taking clients who were booked with me.\n"
     "Technician B: That's not true. They asked for me specifically, and the front desk simply put them in my column.\n"
     "Manager: I'd like to hear each of you out without interruption. Please go first. After that, you'll have the same opportunity.\n"
     "Technician A: My concern is that I've lost regulars, and it affects my income.\n"
     "Technician B: I understand why that's upsetting. I had no intention of poaching anyone.\n"
     "Manager: It sounds as though the root cause is a flaw in our booking process, not bad faith on either side. Let's agree a rule: clients stay with their preferred technician unless they request otherwise in writing.",
     [("tension", "căng thẳng", "There has been some tension in the team."),
      ("hear out", "nghe hết (không ngắt lời)", "I'll hear you out before we decide."),
      ("poach", "câu khách, giành khách", "She didn't mean to poach any clients."),
      ("root cause", "nguyên nhân gốc", "The root cause is our booking process."),
      ("flaw", "lỗ hổng, sai sót", "There is a flaw in the system."),
      ("bad faith", "thiếu thiện chí", "I see no bad faith on either side.")],
     ("Ngôn ngữ hoà giải: It sounds as though... / I understand why... / I'd like to hear...",
      "Công nhận cảm xúc, tóm tắt vấn đề và đề nghị lắng nghe lần lượt từng người.",
      ["It sounds as though the root cause is the booking process.", "I understand why that's upsetting.", "I'd like to hear each of you out."]),
     ("Giọng trung lập, chậm: I'd like to hear you OUT.",
      "Giọng đều và chậm giúp cả hai bên cảm thấy được đối xử công bằng.",
      ["tension", "poach", "flaw", "interruption"]),
     ["Mở đầu một buổi hòa giải giữa hai nhân viên và đặt quy tắc lắng nghe.", "Tóm tắt nguyên nhân gốc và đề xuất một quy tắc chung."],
     [("What is the source of the tension?", ["The shared client list", "Holiday dates", "Uniforms"], 0, "'tension over the shared client list'."),
      ("What does Technician A fear?", ["Losing regular clients and income", "Being fired", "Moving house"], 0, "'I've lost regulars, and it affects my income'."),
      ("What does Technician B say about her intention?", ["She had no intention of poaching clients", "She wanted the clients", "She did not care"], 0, "'I had no intention of poaching anyone'."),
      ("What does the manager identify as the root cause?", ["A flaw in the booking process", "Bad faith", "The weather"], 0, "'a flaw in our booking process, not bad faith'."),
      ("Which rule do they agree on?", ["Clients stay with their preferred technician unless they request otherwise in writing", "Clients are shared equally", "Clients choose at random"], 0, "'clients stay with their preferred technician unless they request otherwise in writing'.")]),

    ("C2", "Kỹ năng", "Phát biểu khai trương và truyền cảm hứng cho đội ngũ",
     "Viết và đọc một bài phát biểu ngắn: kể chuyện, nêu giá trị và kêu gọi hành động.",
     "Owner: Good evening, everyone, and thank you for joining us tonight. When I opened my first salon eight years ago, I had two chairs, a borrowed table and more doubt than certainty. Tonight, we're opening our fifth location, and that wouldn't have been possible without every person in this room.\n"
     "Owner: Success in this industry isn't measured only in revenue. It's measured in the trust a client places in your hands, week after week. That trust is earned through craftsmanship, honesty and genuine care.\n"
     "Owner: So let me say this plainly: what we build next will be defined not by how fast we grow, but by how well we look after one another and the people we serve. Please raise a glass to our team, to our clients, and to the future.",
     [("certainty", "sự chắc chắn", "I had more doubt than certainty."),
      ("craftsmanship", "tay nghề thủ công", "Our reputation rests on craftsmanship."),
      ("genuine", "chân thành, thật sự", "We offer genuine care to every client."),
      ("earn", "giành được (niềm tin)", "Trust has to be earned."),
      ("define", "định hình", "Our values define who we are."),
      ("raise a glass", "nâng ly", "Please raise a glass to the team.")],
     ("Tu từ trong diễn thuyết: not by X, but by Y / wouldn't have been possible without... / ba ý song song",
      "Dùng cấu trúc đối lập và ba ý song song để bài nói có nhịp điệu và dễ nhớ.",
      ["We will be defined not by how fast we grow, but by how well we care.", "That wouldn't have been possible without you.", "It's measured in trust, week after week."]),
     ("Ngắt nhịp ba ý: honesty, [pause] craftsmanship, [pause] and genuine care.",
      "Ngắt nghỉ ngắn giữa ba ý song song và hạ giọng ở ý cuối.",
      ["craftsmanship", "genuine", "certainty", "measured"]),
     ["Viết và đọc phần mở đầu một bài phát biểu khai trương trong 4 câu.", "Dùng cấu trúc 'not by..., but by...' để nêu giá trị của tiệm."],
     [("How many chairs did the first salon have?", ["Two", "Five", "Ten"], 0, "'I had two chairs'."),
      ("How many locations does the owner open tonight?", ["The fifth", "The second", "The tenth"], 0, "'we're opening our fifth location'."),
      ("How is success measured, according to the owner?", ["In the trust clients place in your hands", "Only in revenue", "In the number of chairs"], 0, "'measured in the trust a client places in your hands'."),
      ("How is trust earned?", ["Craftsmanship, honesty and genuine care", "Discounts", "Advertising"], 0, "'earned through craftsmanship, honesty and genuine care'."),
      ("What will define the business's future?", ["How well they look after one another and their clients", "How fast they grow", "How cheap they are"], 0, "'defined not by how fast we grow, but by how well we look after one another'.")]),
]
