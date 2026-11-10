"""Nails course, level C2 (9 lessons). Each entry is the argument list of L() in new_courses.py:
(level, category, title, objective, reading, vocab, grammar, pron, tasks, questions)."""

C2 = [
    ("C2", "Chuyên môn", "Thuyết phục khách về sức khỏe móng và xu hướng",
     "Dùng ngôn ngữ rào đón và thuyết phục để khuyên khách mà không từ chối thẳng.",
     "Customer: I want them as long as possible — and could you file them really thin so they look delicate?\n"
     "Technician: I can certainly see the appeal, and I'd love to give you the look you're after. That said, I'd be doing you a disservice if I didn't flag a couple of concerns. Extreme length puts disproportionate leverage on the nail bed, and over-thinning the natural nail beneath can leave it weak for months.\n"
     "Customer: Other salons do it all the time.\n"
     "Technician: Quite possibly, and plenty of clients are perfectly happy. My point is that tolerance varies; what's harmless for one person can be damaging for another. If you'd be open to it, I could do a slightly shorter length this time and we'll see how your nails respond.\n"
     "Customer: So you're not refusing?\n"
     "Technician: Not at all. It's your decision — I simply want it to be an informed one.",
     [("disservice", "việc làm gây hại, không có lợi", "It would be a disservice not to mention the risks."),
      ("leverage", "đòn bẩy, lực tác động", "Long nails put extra leverage on the nail bed."),
      ("disproportionate", "không cân xứng, quá mức", "Extreme length has a disproportionate effect."),
      ("tolerance", "ngưỡng chịu đựng", "Everyone's tolerance is different."),
      ("informed", "có đủ thông tin", "I want you to make an informed decision."),
      ("appeal", "sức hấp dẫn", "I can see the appeal of a longer shape.")],
     ("Rào đón (hedging): I'd be doing you a disservice if I didn't... / may well / tend to",
      "Làm mềm lời khuyên và cảnh báo để khách không cảm thấy bị phản đối.",
      ["I'd be doing you a disservice if I didn't mention the risks.", "That may well be true, but tolerance varies.", "Thin natural nails tend to break more easily."]),
     ("Ngắt nghỉ sau 'That said': That said, [pause] I'd be doing you a disSERvice...",
      "Ngắt nghỉ ngắn sau 'That said' để khách chú ý vào phần cảnh báo quan trọng.",
      ["disservice", "disproportionate", "leverage", "tolerance"]),
     ["Thuyết phục khách chọn độ dài an toàn hơn mà không từ chối thẳng.", "Dùng ba cụm rào đón (may well, tend to, quite possibly) trong một lời giải thích."],
     [("What does the customer ask for?", ["Very long, thin nails", "Short natural nails", "No polish"], 0, "'as long as possible... file them really thin'."),
      ("Why does the technician say she'd be 'doing a disservice'?", ["Staying silent about the risks would not serve the client", "She wants to charge more", "She dislikes long nails"], 0, "disservice = làm điều có hại cho ai đó (ở đây là im lặng về rủi ro)."),
      ("What does the technician propose?", ["A slightly shorter length this time", "Refusing the job", "Doubling the price"], 0, "'a slightly shorter length this time'."),
      ("'Tolerance varies' means...", ["People differ in how much stress their nails can take", "Everyone has the same limit", "The salon is tolerant"], 0, "Ngưỡng chịu đựng của mỗi người khác nhau."),
      ("What is the technician's final position?", ["It's the client's decision, as long as it's informed", "She refuses", "She insists on her view"], 0, "'It's your decision — I simply want it to be an informed one'.")]),

    ("C2", "Giao tiếp", "Giải quyết khiếu nại chính thức bằng ngôn ngữ ngoại giao",
     "Xoa dịu khách đang giận, đưa ra giải pháp thay thế và giữ mối quan hệ.",
     "Customer: This is unacceptable. I paid for a full set and two nails have already lifted. I want a full refund, and I'll be leaving a review.\n"
     "Manager: I'm genuinely sorry to hear that, and I can understand why you're upset. May I take a look at the nails before we discuss what we can do?\n"
     "Customer: Look all you like. It won't change anything.\n"
     "Manager: I can see the lifting on the index and ring fingers. I'd like to make this right. Might I suggest we redo the full set at no charge, using a different base product? Alternatively, if you'd prefer to part ways, I'm prepared to offer a full refund.\n"
     "Customer: Hmm. I was ready for an argument. I'll take the redo, but only if I can have it done today.\n"
     "Manager: Absolutely. Thank you for giving us the opportunity to put it right, and for your candour — it helps us improve.",
     [("make this right", "khắc phục cho thoả đáng", "We want to make this right."),
      ("part ways", "chia tay, không tiếp tục hợp tác", "If you'd prefer to part ways, we'll refund you."),
      ("candour", "sự thẳng thắn", "Thank you for your candour."),
      ("redo", "làm lại", "We can redo the full set today."),
      ("genuinely", "thực lòng", "I'm genuinely sorry to hear that."),
      ("upset", "buồn bực, khó chịu", "I can understand why you're upset.")],
     ("Ngôn ngữ ngoại giao: Might I suggest...? / I'd like to... / Alternatively, if you'd prefer...",
      "Đề xuất giải pháp dưới dạng câu hỏi hoặc gợi ý để khách có cảm giác được lựa chọn.",
      ["Might I suggest we redo the full set?", "I'd like to make this right.", "Alternatively, if you'd prefer, I can offer a refund."]),
     ("Giọng thấp, chậm: I'm genuinely SORry.",
      "Khi khách giận, hạ âm lượng và tốc độ nói, tránh nâng giọng để không làm căng thêm.",
      ["genuinely", "candour", "alternatively", "unacceptable"]),
     ["Xoa dịu khách đang tức giận và đưa ra hai lựa chọn khắc phục.", "Dùng 'Might I suggest...' để đề xuất giải pháp."],
     [("What does the customer demand at first?", ["A refund, and she warns of a review", "A discount code", "A new technician"], 0, "'I want a full refund, and I'll be leaving a review'."),
      ("What does the manager ask to do first?", ["Look at the nails", "Offer a refund", "End the call"], 0, "'May I take a look at the nails'."),
      ("Besides redoing the set, what does the manager offer?", ["A full refund", "A gift card", "A free pedicure"], 0, "'I'm prepared to offer a full refund'."),
      ("What does the customer decide?", ["To accept the redo today", "To leave angrily", "To post a bad review"], 0, "'I'll take the redo, but only if I can have it done today'."),
      ("Which sentence is the most diplomatic?", ["Might I suggest we redo the set?", "You should accept the redo.", "We won't refund you."], 0, "Might I suggest... = cách đề xuất ngoại giao nhất.")]),

    ("C2", "Quản lý", "Thuyết trình kế hoạch kinh doanh cho nhà đầu tư",
     "Trình bày số liệu, dự báo và rủi ro khi xin vay vốn mở chi nhánh.",
     "Owner: Thank you for meeting me. In short, I'm seeking a loan of eighty thousand dollars to open a second location in the downtown district.\n"
     "Investor: Walk me through the numbers. How confident are you in the projected returns?\n"
     "Owner: Our existing salon operates at a gross margin of sixty-two percent, and occupancy is near capacity at weekends. Based on conservative estimates, the new location should break even within fourteen months and turn a profit thereafter.\n"
     "Investor: What are the main risks?\n"
     "Owner: Chiefly staff retention and a rise in rent. We've mitigated the first by introducing a profit-share scheme, and the lease we've negotiated caps annual increases at three percent.\n"
     "Investor: That's reassuring. Send me your cash-flow forecast, and I'll revert by Friday.",
     [("gross margin", "biên lợi nhuận gộp", "Our gross margin is sixty-two percent."),
      ("break even", "hoà vốn", "We expect to break even within fourteen months."),
      ("retention", "việc giữ chân (nhân viên)", "Staff retention is our main risk."),
      ("mitigate", "giảm thiểu (rủi ro)", "We can mitigate the risk with a profit-share scheme."),
      ("cash-flow forecast", "dự báo dòng tiền", "I'll send you the cash-flow forecast."),
      ("occupancy", "tỷ lệ lấp đầy lịch", "Occupancy is near capacity at weekends.")],
     ("Dự đoán và số liệu: should + V / is projected to + V / Based on + N",
      "Trình bày dự báo một cách thận trọng và có căn cứ.",
      ["The new location should break even within fourteen months.", "Revenue is projected to grow by twenty percent.", "Based on conservative estimates, we will turn a profit."]),
     ("Đọc số rõ ràng: sixty-TWO percent, eighty THOUsand",
      "Ngắt nghỉ sau mỗi số lớn để người nghe kịp ghi nhớ.",
      ["margin", "retention", "mitigate", "projected"]),
     ["Trình bày ngắn gọn (4 câu) kế hoạch mở chi nhánh thứ hai.", "Nêu hai rủi ro và cách giảm thiểu."],
     [("How much does the owner want to borrow?", ["$80,000", "$8,000", "$800,000"], 0, "'a loan of eighty thousand dollars'."),
      ("When should the new location break even?", ["Within fourteen months", "Within two years", "Immediately"], 0, "'break even within fourteen months'."),
      ("What are the main risks?", ["Staff retention and rising rent", "Weather and traffic", "The competitors' names"], 0, "'Chiefly staff retention and a rise in rent'."),
      ("How has the rent risk been mitigated?", ["A lease capping annual increases at three percent", "By closing the shop", "By raising prices"], 0, "'caps annual increases at three percent'."),
      ("What will the investor do next?", ["Revert by Friday after reading the forecast", "Reject the plan", "Sign immediately"], 0, "'I'll revert by Friday'.")]),

    ("C2", "Pháp lý", "Hợp đồng, thuê ghế và làm nhân viên",
     "So sánh mô hình thuê ghế và làm nhân viên, nêu rủi ro và đề nghị thử việc bằng văn bản.",
     "Technician: I'd like to understand the difference between renting a station and being employed here.\n"
     "Owner: In essence, if you rent a station, you operate as an independent contractor. You set your own prices and hours, you keep your clients' fees, and you pay a weekly rent. As an employee, you'd work set shifts, receive a wage plus commission, and I'd be responsible for your insurance and taxes.\n"
     "Technician: What are the downsides to renting?\n"
     "Owner: You bear the financial risk. If you're quiet one week, the rent is still due, and you're liable for your own supplies and insurance. Conversely, you have more autonomy and the potential for higher earnings.\n"
     "Technician: Could I trial it for a month?\n"
     "Owner: I'd be amenable to that, but I'd want it in writing, with a notice period of thirty days either way.",
     [("independent contractor", "người làm việc độc lập", "As an independent contractor, you set your own prices."),
      ("commission", "hoa hồng", "Employees receive a wage plus commission."),
      ("liable", "chịu trách nhiệm", "You are liable for your own insurance."),
      ("autonomy", "quyền tự chủ", "Renting gives you more autonomy."),
      ("notice period", "thời gian báo trước", "There is a thirty-day notice period."),
      ("amenable", "sẵn lòng chấp nhận", "I'd be amenable to a trial month.")],
     ("Đối chiếu: Conversely / Whereas / While / In contrast",
      "Đặt hai mô hình hoặc hai phương án cạnh nhau để so sánh rõ ràng.",
      ["Employees receive a wage; conversely, renters keep all the fees.", "Whereas employees work set shifts, renters choose their hours.", "While renting offers autonomy, it carries financial risk."]),
     ("Từ pháp lý: LIable, auTONomy, comMIssion",
      "Nói chậm và nhấn âm tiết chính với thuật ngữ hợp đồng để tránh hiểu nhầm.",
      ["liable", "autonomy", "commission", "amenable"]),
     ["So sánh hai mô hình làm việc (thuê ghế và nhân viên) bằng 'whereas'.", "Đề nghị thử việc một tháng, có thời gian báo trước bằng văn bản."],
     [("What does a station renter do?", ["Sets prices and keeps clients' fees", "Receives a fixed wage", "Has no clients"], 0, "'You set your own prices... you keep your clients' fees'."),
      ("Who is responsible for an employee's insurance and taxes?", ["The owner", "The customer", "The supplier"], 0, "'I'd be responsible for your insurance and taxes'."),
      ("What is a downside of renting?", ["The renter bears the financial risk", "There is no freedom", "There are no clients"], 0, "'You bear the financial risk'."),
      ("What does the owner want for the trial month?", ["A written agreement with a thirty-day notice period", "A verbal promise", "No conditions"], 0, "'in writing, with a notice period of thirty days'."),
      ("Which word signals contrast?", ["Conversely", "Furthermore", "Therefore"], 0, "Conversely = ngược lại.")]),

    ("C2", "Quản lý", "Họp nhóm và đánh giá hiệu suất",
     "Mở đầu cuộc trò chuyện khó bằng lời khen, nêu vấn đề và cùng thống nhất giải pháp.",
     "Manager: Thanks for making time. I wanted to talk about the past couple of months. Your client feedback has been outstanding, but I've noticed a pattern of late arrivals, which has a knock-on effect on the whole schedule.\n"
     "Technician: I'm aware, and I'm sorry. I've been struggling with childcare arrangements since September.\n"
     "Manager: I appreciate you telling me. Had I known, we might have adjusted your shifts sooner. What would help?\n"
     "Technician: If I could start thirty minutes later on weekdays, I'd make up the time in the evening.\n"
     "Manager: That seems workable. Let's agree on it for a trial period of six weeks and review it together. What I'd ask in return is that you let me know by text as early as possible if anything changes.\n"
     "Technician: That's more than fair. Thank you for being so understanding.",
     [("pattern", "kiểu lặp lại, xu hướng", "I've noticed a pattern of late arrivals."),
      ("knock-on effect", "hiệu ứng dây chuyền", "Lateness has a knock-on effect on the schedule."),
      ("outstanding", "xuất sắc", "Your client feedback has been outstanding."),
      ("workable", "khả thi", "That seems like a workable solution."),
      ("make up the time", "bù lại thời gian", "I'll make up the time in the evening."),
      ("review", "xem xét lại", "We'll review the arrangement in six weeks.")],
     ("Đảo ngữ điều kiện quá khứ: Had I known, ... / Had you told me earlier, ... / Should you need...",
      "Nói về điều đã không xảy ra do thiếu thông tin, vẫn giữ giọng lịch sự và không đổ lỗi.",
      ["Had I known, we might have adjusted your shifts sooner.", "Had she arrived earlier, the client wouldn't have waited.", "Should you need more time, just let me know."]),
     ("Mở đầu nhẹ nhàng: I've noticed a PATtern of late arrivals.",
      "Bắt đầu bằng điều tích cực để người nghe bớt phòng thủ, rồi mới nêu vấn đề.",
      ["pattern", "outstanding", "workable", "arrangement"]),
     ["Mở đầu một cuộc trò chuyện khó với nhân viên: khen trước, nêu vấn đề sau.", "Đề xuất giải pháp thử nghiệm sáu tuần và cách theo dõi."],
     [("What does the manager praise?", ["The technician's client feedback", "Her punctuality", "Her prices"], 0, "'Your client feedback has been outstanding'."),
      ("What problem does the manager raise?", ["A pattern of late arrivals", "Rude behaviour", "Missing licences"], 0, "'a pattern of late arrivals'."),
      ("Why has the technician been late?", ["Childcare arrangements", "A broken car", "A second job"], 0, "'struggling with childcare arrangements'."),
      ("What do they agree on?", ["A six-week trial of a later start", "Dismissal", "A pay cut"], 0, "'a trial period of six weeks'."),
      ("'Had I known, we might have adjusted your shifts' means...", ["The manager did not know, so shifts were not changed", "The manager knew and refused", "The shifts were changed already"], 0, "Had I known = If I had known (nhưng thực tế không biết).")]),

    ("C2", "Kỹ năng", "Truyền thông khủng hoảng sau sự cố vệ sinh",
     "Phát biểu thận trọng khi có cáo buộc: không vội nhận trách nhiệm nhưng cam kết minh bạch.",
     "Reporter: A customer claims she contracted an infection after a pedicure at your salon. What's your response?\n"
     "Owner: First and foremost, our thoughts are with the customer, and we wish her a swift recovery. We take any allegation of this kind extremely seriously. We have suspended the use of the foot spa in question pending an independent hygiene audit.\n"
     "Reporter: Are you admitting liability?\n"
     "Owner: It would be premature to draw conclusions before the facts have been established. What I can say is that all of our equipment is sterilised after each client and that we are cooperating fully with the health authorities.\n"
     "Reporter: What will you do to restore public confidence?\n"
     "Owner: We'll publish the audit's findings in full, whatever they may be, and we'll implement any recommendations without delay. Transparency is non-negotiable for us.",
     [("allegation", "cáo buộc", "We take every allegation seriously."),
      ("pending", "trong khi chờ", "The foot spa is closed pending an audit."),
      ("liability", "trách nhiệm pháp lý", "Are you admitting liability?"),
      ("premature", "quá sớm, vội vàng", "It would be premature to draw conclusions."),
      ("transparency", "sự minh bạch", "Transparency is non-negotiable for us."),
      ("restore confidence", "khôi phục niềm tin", "We will restore confidence by being open.")],
     ("whatever / however + may: dù thế nào đi nữa",
      "Cam kết một hành động bất kể kết quả; dùng nhiều trong phát biểu chính thức.",
      ["We'll publish the findings, whatever they may be.", "However serious the issue is, we will respond openly.", "It would be premature to draw conclusions."]),
     ("Giọng điềm tĩnh, dứt khoát: We take this extremely SERiously.",
      "Dùng câu ngắn, nhấn từ khoá và tránh nói nhanh khi trả lời truyền thông.",
      ["allegation", "liability", "premature", "transparency"]),
     ["Soạn lời phát biểu ngắn khi có cáo buộc về vệ sinh, không thừa nhận vội trách nhiệm.", "Nêu ba hành động cụ thể để khôi phục niềm tin."],
     [("What is the allegation?", ["A customer got an infection after a pedicure", "A stolen bag", "A late appointment"], 0, "'contracted an infection after a pedicure'."),
      ("What has the owner done about the foot spa?", ["Suspended its use pending an audit", "Kept using it", "Sold it"], 0, "'suspended the use of the foot spa... pending an independent hygiene audit'."),
      ("Why does the owner avoid admitting liability?", ["It is premature before the facts are established", "He is guilty", "He is angry"], 0, "'It would be premature to draw conclusions'."),
      ("What will be published?", ["The audit's findings in full", "Customer names", "The salon's profits"], 0, "'publish the audit's findings in full'."),
      ("'Whatever they may be' means...", ["No matter what they turn out to be", "Only the good ones", "They may not exist"], 0, "Bất kể kết quả là gì.")]),

    ("C2", "Chuyên môn", "Xu hướng bền vững và sản phẩm thân thiện môi trường",
     "Thảo luận có phản biện về sản phẩm xanh: chứng nhận, hiệu quả và việc chuyển đổi dần.",
     "Rep: More clients are asking about sustainability, and the industry is shifting towards plant-based formulas and refillable packaging.\n"
     "Owner: I'm sympathetic to the idea, but I'm wary of greenwashing. Some brands label their products 'eco-friendly' without any evidence.\n"
     "Rep: A fair point. I'd urge you to look for third-party certification rather than relying on marketing claims. Our range, for instance, is certified cruelty-free and the bottles are made from recycled glass.\n"
     "Owner: And performance? Clients won't compromise on wear time.\n"
     "Rep: That's where the real innovation lies. Not only do these formulas match conventional ones for durability, but they also dry faster under LED lamps.\n"
     "Owner: If the numbers stack up, I'd be willing to switch gradually, starting with our top three colours.",
     [("sustainability", "tính bền vững", "More clients ask about sustainability."),
      ("plant-based", "gốc thực vật", "We stock plant-based formulas."),
      ("greenwashing", "tẩy xanh (quảng cáo môi trường sai sự thật)", "I'm wary of greenwashing."),
      ("cruelty-free", "không thử nghiệm trên động vật", "The whole range is certified cruelty-free."),
      ("wary", "dè dặt, cảnh giác", "I'm wary of big claims."),
      ("certification", "chứng nhận", "Look for third-party certification.")],
     ("Đảo ngữ với Not only... but also: Not only do these formulas..., but they also...",
      "Đưa 'Not only' lên đầu câu, đảo trợ động từ lên trước chủ ngữ để nhấn mạnh.",
      ["Not only do these formulas last longer, but they are also kinder to the planet.", "Rarely do clients ask about ingredients.", "Seldom have we seen such strong results."]),
     ("Nhấn đảo ngữ: NOT only DO these forMULas...",
      "Nhấn mạnh 'Not only' và dừng nhẹ trước 'but also' để làm nổi bật ý thứ hai.",
      ["sustainability", "greenwashing", "certification", "formula"]),
     ["Giải thích với khách vì sao bạn chọn sản phẩm có chứng nhận độc lập.", "Dùng 'Not only... but also...' để so sánh sản phẩm thân thiện môi trường với sản phẩm thường."],
     [("What trend does the rep describe?", ["A shift to plant-based and refillable products", "A drop in demand", "A ban on gel"], 0, "'shifting towards plant-based formulas and refillable packaging'."),
      ("What is the owner worried about?", ["Greenwashing", "Delivery times", "Staff pay"], 0, "'I'm wary of greenwashing'."),
      ("What does the rep advise looking for?", ["Third-party certification", "Bright packaging", "Celebrity endorsements"], 0, "'look for third-party certification'."),
      ("How do the new formulas perform?", ["They match conventional ones and dry faster", "They last half as long", "They are dull"], 0, "'match conventional ones for durability... dry faster'."),
      ("Which sentence uses inversion correctly?", ["Not only do these formulas last longer, but they are also kinder.", "Not only these formulas do last longer.", "Not only these formulas last longer but also."], 0, "Not only + trợ động từ + S + V.")]),

    ("C2", "Kỹ năng", "Dẫn dắt workshop và thuyết trình tại hội chợ",
     "Mở đầu, dẫn dắt và tương tác với người nghe trong buổi hướng dẫn kỹ thuật.",
     "Presenter: Good afternoon, everyone. Over the next forty minutes, I'll take you through a technique that has transformed the way I approach structured gel manicures: the apex-first method.\n"
     "Presenter: Before I begin, a quick show of hands: who here has struggled with lifting at the cuticle? Quite a few of you. That's precisely what we're going to tackle.\n"
     "Presenter: The principle is straightforward. By building strength where the nail bears the most stress, we can reduce thickness elsewhere, which results in a lighter, more natural-looking finish. I'll demonstrate on this model, and then you'll replicate it at your own tables.\n"
     "Presenter: Please don't hesitate to interrupt with questions; this is meant to be a conversation, not a lecture.",
     [("transform", "thay đổi hoàn toàn", "This technique transformed my work."),
      ("apex", "điểm chịu lực (đỉnh vòm) của móng", "Build the apex where the nail bears the most stress."),
      ("straightforward", "đơn giản, dễ hiểu", "The principle is straightforward."),
      ("demonstrate", "trình diễn", "I'll demonstrate on a model."),
      ("replicate", "làm lại theo, tái hiện", "You'll replicate the technique at your tables."),
      ("tackle", "giải quyết", "That's precisely the problem we'll tackle.")],
     ("Dẫn dắt người nghe (signposting): Over the next... / Let me turn to... / To sum up...",
      "Báo trước cấu trúc bài nói để người nghe theo dõi dễ dàng.",
      ["Over the next forty minutes, I'll take you through the method.", "Let me turn now to the common mistakes.", "To sum up, build strength where the stress is."]),
     ("Ngắt nghỉ và nhấn: Quite a few of you. [pause] That's precisely what we'll TACkle.",
      "Ngắt nghỉ sau ý chính, hạ giọng ở cuối câu để thể hiện sự tự tin.",
      ["apex", "straightforward", "demonstrate", "replicate"]),
     ["Mở đầu một buổi hướng dẫn kỹ thuật dài 3 phút bằng cụm dẫn dắt.", "Mời người nghe đặt câu hỏi và tóm tắt ý chính."],
     [("What technique is being presented?", ["The apex-first method", "A cutting technique", "A pedicure massage"], 0, "'the apex-first method'."),
      ("Why does the presenter ask for a show of hands?", ["To find who struggles with lifting at the cuticle", "To start a vote on price", "To choose a model"], 0, "'who here has struggled with lifting at the cuticle?'"),
      ("What does the principle achieve?", ["Strength where stress is highest and a lighter finish", "A thicker finish", "A cheaper product"], 0, "'reduce thickness elsewhere... a lighter, more natural-looking finish'."),
      ("What will the audience do after the demonstration?", ["Replicate it at their tables", "Leave", "Buy products"], 0, "'you'll replicate it at your own tables'."),
      ("Which phrase is signposting?", ["Over the next forty minutes, I'll take you through...", "I like nails.", "Maybe yes, maybe no."], 0, "Signposting = báo trước nội dung sắp trình bày.")]),

    ("C2", "Pháp lý", "Đàm phán hợp đồng thuê mặt bằng khi mở rộng",
     "Thương lượng điều khoản thuê, quyền chấm dứt sớm và thời gian miễn tiền thuê.",
     "Owner: Before we proceed, there are a few clauses in the draft lease I'd like to discuss. Firstly, the break option: as it stands, I'd be locked in for ten years with no exit.\n"
     "Landlord: That's standard in this building. The investment in fitting out the unit is considerable on both sides.\n"
     "Owner: I understand, but given the uncertainty in the sector, I'd need a break option at year five, subject to six months' notice.\n"
     "Landlord: I might entertain that if the rent review remained upward-only.\n"
     "Owner: I'd resist that. If we were to accept an upward-only review, we'd want a cap tied to inflation. Furthermore, I'd expect a rent-free period of three months to cover the fit-out.\n"
     "Landlord: Let me take this to my solicitor. I'll come back to you with a counter-proposal by Monday.",
     [("clause", "điều khoản", "Please check each clause carefully."),
      ("break option", "quyền chấm dứt hợp đồng sớm", "I'd want a break option at year five."),
      ("fit-out", "hoàn thiện nội thất mặt bằng", "The fit-out costs a lot."),
      ("solicitor", "luật sư tư vấn", "My solicitor will review the lease."),
      ("counter-proposal", "đề xuất đối ứng", "I'll send a counter-proposal on Monday."),
      ("rent review", "điều chỉnh tiền thuê định kỳ", "The rent review happens every three years.")],
     ("Điều kiện lịch sự trong đàm phán: If we were to..., we'd want... / subject to... / as it stands",
      "Nêu điều kiện giả định và ràng buộc một cách trang trọng, tránh tạo đối đầu.",
      ["If we were to accept that, we'd want a cap.", "The option is subject to six months' notice.", "As it stands, I'd be locked in for ten years."]),
     ("Thuật ngữ pháp lý: break CLAUSE, soLIcitor",
      "Với thuật ngữ pháp lý, nói chậm và nhấn âm tiết chính để tránh hiểu lầm.",
      ["clause", "solicitor", "subject", "counter-proposal"]),
     ["Đề nghị sửa một điều khoản trong hợp đồng thuê bằng 'If we were to...'.", "Yêu cầu thời gian miễn tiền thuê để hoàn thiện mặt bằng."],
     [("What worries the owner about the draft lease?", ["Being locked in for ten years with no exit", "The colour of the walls", "The location"], 0, "'locked in for ten years with no exit'."),
      ("What break option does the owner request?", ["At year five, with six months' notice", "At year one", "None at all"], 0, "'a break option at year five, subject to six months' notice'."),
      ("What does the landlord want in return?", ["An upward-only rent review", "Free rent for a year", "A shorter lease"], 0, "'if the rent review remained upward-only'."),
      ("What does the owner want to cover the fit-out?", ["A three-month rent-free period", "A loan from the landlord", "A cheaper brand"], 0, "'a rent-free period of three months'."),
      ("'As it stands' means...", ["In its current form", "In the future", "At the stand"], 0, "as it stands = ở hiện trạng, theo bản hiện tại.")]),
]
