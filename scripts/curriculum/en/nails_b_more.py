"""Nails course, extra B1 (4) and B2 (4) lessons. Each entry is the argument list of L() in new_courses.py:
(level, category, title, objective, reading, vocab, grammar, pron, tasks, questions)."""

B_MORE = [
    ("B1", "Giao tiếp", "Giải thích quy trình pedicure từng bước",
     "Giải thích trình tự dịch vụ pedicure để khách yên tâm và biết trước điều sắp diễn ra.",
     "Technician: Welcome! Please pop your feet into the water. I'll explain what we're going to do, so there are no surprises.\n"
     "Customer: Great. I haven't had a pedicure in ages.\n"
     "Technician: First, we soak your feet for about five minutes to soften the skin. Then I'll trim and shape your toenails, and gently push back the cuticles.\n"
     "Customer: Will you remove the hard skin on my heels?\n"
     "Technician: Yes, I'll use a foot file for that. After that, we'll exfoliate with a scrub, and finish with a short massage using lotion.\n"
     "Customer: That sounds lovely. How long does it take?\n"
     "Technician: About forty-five minutes. If the water is too hot, just tell me.",
     [("soak", "ngâm", "We soak your feet for five minutes."),
      ("soften", "làm mềm", "Warm water helps soften the skin."),
      ("hard skin", "da chai", "I'll remove the hard skin on your heels."),
      ("exfoliate", "tẩy tế bào chết", "We exfoliate with a sugar scrub."),
      ("scrub", "kem/muối tẩy tế bào chết", "This scrub smells like lemon."),
      ("massage", "mát-xa", "We finish with a short massage.")],
     ("Nêu trình tự: First, / Then, / After that, / Finally, + will",
      "Dùng từ chỉ thứ tự và 'will' để giải thích kế hoạch từng bước cho khách.",
      ["First, we soak your feet.", "After that, I'll file the heels.", "Finally, we'll apply lotion."]),
     ("Nhấn từ chỉ thứ tự: FIRST, THEN, AFter that",
      "Nhấn từ chỉ thứ tự giúp khách theo dõi quy trình dễ hơn.",
      ["soak", "exfoliate", "massage", "heels"]),
     ["Giải thích một quy trình pedicure 5 bước cho khách mới.", "Hỏi khách nước có quá nóng hay lực có quá mạnh không."],
     [("How long do they soak the feet?", ["About five minutes", "Forty-five minutes", "Ten seconds"], 0, "'for about five minutes'."),
      ("What does the technician use on the heels?", ["A foot file", "A brush", "Scissors"], 0, "'I'll use a foot file for that'."),
      ("What comes after the scrub?", ["A short massage with lotion", "Polish removal", "A haircut"], 0, "'finish with a short massage using lotion'."),
      ("How long does the whole pedicure take?", ["About forty-five minutes", "Ten minutes", "Two hours"], 0, "'About forty-five minutes'."),
      ("Which phrase shows order?", ["After that", "Because", "Although"], 0, "After that = sau đó.")]),

    ("B1", "Giao tiếp", "Đặt lịch cho nhóm và tiệc cô dâu",
     "Nhận đặt lịch cho nhóm đông: số người, thời gian, tiền đặt cọc và thanh toán chung.",
     "Customer: Hi, I'm getting married in June, and I'd like to book manicures for me and five bridesmaids.\n"
     "Receptionist: Congratulations! How many people in total, and what date are you thinking of?\n"
     "Customer: Six of us, on the fourteenth. The ceremony is at four, so we'd need to finish by one o'clock.\n"
     "Receptionist: In that case, I'd suggest starting at nine. We can seat three people at a time, so two groups would take about three hours.\n"
     "Customer: Could we have champagne while we wait?\n"
     "Receptionist: Of course, as long as everyone is over eighteen. We also ask for a fifty-dollar deposit per person to secure the booking.\n"
     "Customer: That's fine. Can I pay for everyone together?\n"
     "Receptionist: Certainly. I'll send you a confirmation by email.",
     [("bridesmaid", "phù dâu", "She has five bridesmaids."),
      ("ceremony", "lễ cưới, buổi lễ", "The ceremony starts at four."),
      ("in total", "tổng cộng", "How many people are coming in total?"),
      ("group", "nhóm", "We can take two groups of three."),
      ("secure", "đảm bảo, giữ chỗ", "A deposit will secure your booking."),
      ("confirmation", "xác nhận", "I'll send a confirmation by email.")],
     ("Đề xuất và điều kiện: I'd suggest + V-ing / as long as / In that case",
      "Đưa đề xuất lịch sự và nêu điều kiện kèm theo.",
      ["I'd suggest starting at nine.", "You can bring drinks as long as everyone is over eighteen.", "In that case, we'll need two groups."]),
     ("Đọc rõ số và ngày: Six of US, on the fourTEENTH.",
      "Khi xác nhận lịch, nhấn rõ số lượng và ngày để tránh nhầm lẫn.",
      ["bridesmaids", "ceremony", "deposit", "confirmation"]),
     ["Nhận đặt lịch cho nhóm 6 người và hỏi ngày giờ.", "Giải thích tiền đặt cọc và cách thanh toán chung."],
     [("Who is the booking for?", ["The bride and five bridesmaids", "Two friends", "A group of ten"], 0, "'me and five bridesmaids'."),
      ("Why must they finish by one o'clock?", ["They need time before the four o'clock ceremony", "The salon closes", "The bride is tired"], 0, "'The ceremony is at four, so we'd need to finish by one'."),
      ("What does the receptionist suggest?", ["Starting at nine", "Starting at noon", "Booking next week"], 0, "'I'd suggest starting at nine'."),
      ("How much is the deposit?", ["$50 per person", "$50 in total", "There is no deposit"], 0, "'a fifty-dollar deposit per person'."),
      ("What is the condition for champagne?", ["Everyone is over eighteen", "Everyone pays extra", "Only the bride drinks"], 0, "'as long as everyone is over eighteen'.")]),

    ("B1", "Giao tiếp", "Giá, tiền boa và thanh toán",
     "Báo giá, giải thích tiền boa, phụ phí và các hình thức thanh toán.",
     "Customer: Excuse me, how much is a gel manicure with nail art on two fingers?\n"
     "Receptionist: A gel manicure is thirty-five dollars, and the nail art is five dollars per nail, so forty-five altogether.\n"
     "Customer: Does that include a tip?\n"
     "Receptionist: No, tips are separate and entirely up to you. Most customers leave about fifteen to twenty percent.\n"
     "Customer: Do you take cards?\n"
     "Receptionist: Yes, we accept all major cards and contactless payments. There's a small surcharge if you pay by credit card.\n"
     "Customer: I'll pay in cash, then. Can I get a receipt?\n"
     "Receptionist: Of course. Here you are.",
     [("altogether", "tổng cộng", "That's forty-five dollars altogether."),
      ("tip", "tiền boa", "Tips are optional."),
      ("cash", "tiền mặt", "I'll pay by cash."),
      ("contactless", "thanh toán không chạm", "We accept contactless payments."),
      ("surcharge", "phụ phí", "There's a small surcharge for cards."),
      ("receipt", "biên lai", "Can I have a receipt, please?")],
     ("Hỏi và nói về giá: How much is...? / Does that include...? / There's a... for...",
      "Mẫu câu cơ bản để báo giá và giải thích khoản phí kèm theo.",
      ["How much is a gel manicure?", "Does that include a tip?", "There's a small surcharge for cards."]),
     ("Phân biệt số: THIRty và thirTEEN",
      "-ty nhấn ở đầu, -teen nhấn ở cuối; đọc rõ khi báo giá để khách không hiểu nhầm.",
      ["thirty", "fifteen", "receipt", "surcharge"]),
     ["Báo giá một dịch vụ kèm phần nail art cho khách.", "Giải thích các hình thức thanh toán và phụ phí."],
     [("How much is the manicure with nail art altogether?", ["$45", "$35", "$40"], 0, "'forty-five altogether'."),
      ("Is the tip included in the price?", ["No, it's separate", "Yes", "Only at weekends"], 0, "'tips are separate and entirely up to you'."),
      ("What percentage do most customers tip?", ["Fifteen to twenty percent", "Fifty percent", "Two percent"], 0, "'about fifteen to twenty percent'."),
      ("What extra charge applies to credit cards?", ["A small surcharge", "A large fee", "None"], 0, "'a small surcharge if you pay by credit card'."),
      ("How does the customer decide to pay?", ["In cash", "By credit card", "By phone"], 0, "'I'll pay in cash'.")]),

    ("B1", "Giao tiếp", "Khách đến trễ và nhầm lịch",
     "Xử lý khách đến muộn: giải thích hạn chế và đề xuất giải pháp phù hợp.",
     "Receptionist: Hi, Mia. We had you down for two o'clock, but it's already two forty.\n"
     "Customer: I'm so sorry. The traffic was terrible, and I couldn't find parking.\n"
     "Receptionist: No worries. Unfortunately, we have another client at three thirty, so we can't do the full set of acrylics. What we can do is a simple gel manicure in forty minutes.\n"
     "Customer: Oh no. Could we move the acrylics to another day?\n"
     "Receptionist: Certainly. Would Thursday at five work for you?\n"
     "Customer: Thursday is perfect. Then I'll have the gel manicure now.\n"
     "Receptionist: Great. Next time, please call us if you're running late, so we can adjust the schedule.",
     [("had you down for", "đã ghi tên bạn vào lúc", "We had you down for two o'clock."),
      ("traffic", "giao thông, kẹt xe", "The traffic was terrible this morning."),
      ("parking", "chỗ đậu xe", "I couldn't find parking."),
      ("adjust", "điều chỉnh", "We can adjust the schedule."),
      ("running late", "đang bị trễ", "Please call us if you're running late."),
      ("work for you", "phù hợp với bạn", "Does Thursday work for you?")],
     ("Đề xuất giải pháp: What we can do is... / Would... work for you? / Next time, please...",
      "Nêu giới hạn trước, rồi đưa ra phương án khả thi và yêu cầu cho lần sau.",
      ["What we can do is a shorter manicure.", "Would Thursday at five work for you?", "Next time, please call us if you're late."]),
     ("Giọng xin lỗi: I'm so SORry.",
      "Giọng nhẹ và hạ xuống ở cuối câu khi xin lỗi hoặc thông báo hạn chế.",
      ["traffic", "parking", "unfortunately", "schedule"]),
     ["Giải thích với khách đến trễ rằng bạn không đủ thời gian làm hết dịch vụ.", "Đề xuất dời lịch sang ngày khác."],
     [("What time was the appointment?", ["Two o'clock", "Two forty", "Three thirty"], 0, "'We had you down for two o'clock'."),
      ("Why can't they do the full set of acrylics?", ["Another client is booked at three thirty", "The salon is closed", "The customer has no money"], 0, "'we have another client at three thirty'."),
      ("What alternative is offered today?", ["A gel manicure in forty minutes", "A pedicure", "A massage"], 0, "'a simple gel manicure in forty minutes'."),
      ("When is the acrylic set rescheduled?", ["Thursday at five", "Friday at noon", "Next month"], 0, "'Thursday at five'."),
      ("What does the receptionist ask for next time?", ["A call if she's running late", "An early arrival", "A deposit"], 0, "'please call us if you're running late'.")]),

    ("B2", "Quản lý", "Điều phối ca làm và xin đổi ca",
     "Xin đổi ca, tìm người làm thay và thống nhất bằng văn bản với quản lý.",
     "Manager: Thanks for coming in, Lan. You mentioned you'd like to swap your Saturday shift?\n"
     "Technician: Yes, I have a family event on the twentieth, and I'd rather not miss it. Would it be possible to cover Sunday instead?\n"
     "Manager: In principle, yes, but Sunday is already fully staffed. Could you find someone to take your Saturday? If a colleague agrees, I'm happy to approve the swap.\n"
     "Technician: Mai said she might be available, but she'd want to take my Tuesday in return.\n"
     "Manager: That seems fair. Let me check the rota. I'll need it confirmed in writing by Thursday, so the schedule doesn't change at the last minute.\n"
     "Technician: Understood. I'll make sure it's sorted by then.",
     [("swap", "đổi (ca làm)", "Can I swap shifts with Mai?"),
      ("cover", "làm thay", "Mai can cover my Saturday."),
      ("rota", "lịch phân ca", "I'll check the rota."),
      ("staffed", "đủ nhân sự", "Sunday is already fully staffed."),
      ("approve", "chấp thuận", "I'm happy to approve the swap."),
      ("in principle", "về nguyên tắc", "In principle, that's fine.")],
     ("Xin phép và đáp lại: Would it be possible to...? / I'd rather not... / in return",
      "Xin phép lịch sự, nêu mong muốn và điều kiện trao đổi.",
      ["Would it be possible to cover Sunday instead?", "I'd rather not miss the family event.", "She'd want my Tuesday in return."]),
     ("Nhấn âm tiết: ROta, apPROVE, COLleague",
      "Từ ngắn như 'rota' nhấn âm đầu; 'approve' nhấn âm sau.",
      ["rota", "approve", "principle", "colleague"]),
     ["Xin đổi ca với quản lý và giải thích lý do.", "Thống nhất việc đổi ca với đồng nghiệp bằng văn bản."],
     [("Why does Lan want to swap her shift?", ["She has a family event", "She is ill", "She dislikes Saturdays"], 0, "'I have a family event on the twentieth'."),
      ("Why can't she simply work on Sunday?", ["Sunday is fully staffed", "The salon is closed on Sundays", "She refuses"], 0, "'Sunday is already fully staffed'."),
      ("What must happen before the manager approves?", ["A colleague agrees to take the Saturday", "Lan pays a fee", "The owner calls"], 0, "'If a colleague agrees, I'm happy to approve'."),
      ("What does Mai want in return?", ["Lan's Tuesday shift", "Some money", "A day off"], 0, "'she'd want to take my Tuesday in return'."),
      ("What is the deadline?", ["Thursday, in writing", "Friday, verbally", "Next month"], 0, "'confirmed in writing by Thursday'.")]),

    ("B2", "Quản lý", "Xu hướng theo mùa và đặt hàng",
     "Thảo luận màu sơn đang được ưa chuộng và quyết định số lượng đặt hàng trước mùa cao điểm.",
     "Owner: Autumn is just around the corner. What colours are customers asking about?\n"
     "Technician: Mostly deep burgundy, olive green and a lot of chocolate browns. Quite a few people also want the glazed chrome look.\n"
     "Owner: Then we'd better stock up before demand peaks. How many bottles of each would you suggest?\n"
     "Technician: I'd say twelve of the burgundy, since it sells fastest, and six each of the others. We should also order extra top coat, because the chrome effect uses a lot.\n"
     "Owner: Fine. If we order today, the supplier can deliver by the fifteenth. I'd rather not run out in the middle of the season.\n"
     "Technician: Agreed. I'll draw up the list this afternoon.",
     [("around the corner", "sắp đến", "Winter is just around the corner."),
      ("demand", "nhu cầu", "Demand rises in December."),
      ("peak", "đạt đỉnh", "Sales peak before the holidays."),
      ("stock up", "tích trữ, nhập thêm", "We need to stock up on top coat."),
      ("run out", "hết hàng", "We don't want to run out of red."),
      ("draw up", "soạn (danh sách, kế hoạch)", "I'll draw up the order list.")],
     ("had better / would rather: We'd better stock up. / I'd rather not run out.",
      "'had better' khuyên nên làm ngay; 'would rather' nói điều bạn thích hơn.",
      ["We'd better order today.", "I'd rather not run out in the middle of the season.", "You'd better check the stock first."]),
     ("Nhấn tên màu: deep BURgundy, OLive green",
      "Tên màu thường nhấn âm đầu; đọc rõ để tránh nhầm khi đặt hàng.",
      ["burgundy", "chrome", "demand", "season"]),
     ["Đề xuất số lượng sơn cần đặt cho mùa thu.", "Giải thích vì sao cần nhập thêm lớp phủ bóng."],
     [("Which colour sells fastest?", ["Burgundy", "Olive green", "Chocolate brown"], 0, "'burgundy, since it sells fastest'."),
      ("How many burgundy bottles does she suggest?", ["Twelve", "Six", "Twenty"], 0, "'twelve of the burgundy'."),
      ("Why order extra top coat?", ["The chrome effect uses a lot", "It is cheaper", "It is a new brand"], 0, "'the chrome effect uses a lot'."),
      ("When can the supplier deliver?", ["By the fifteenth", "Tomorrow", "Next year"], 0, "'deliver by the fifteenth'."),
      ("What does 'We'd better stock up' mean?", ["It is wise to buy more now", "We must sell everything", "We should close"], 0, "had better = nên làm (vì nếu không sẽ có vấn đề).")]),

    ("B2", "Kỹ năng", "Hướng dẫn khách chăm sóc móng tại nhà",
     "Đưa lời khuyên cụ thể giúp móng gel bền hơn và xử lý khi bị bong.",
     "Technician: Before you go, let me give you a few tips so your gel lasts as long as possible.\n"
     "Customer: Thanks. I tend to break nails at the corners.\n"
     "Technician: That's common. Try not to use your nails as tools — opening cans, peeling stickers, that kind of thing. Wear gloves when you wash dishes, because hot water and detergent weaken the gel.\n"
     "Customer: What about the dry skin around my nails?\n"
     "Technician: Apply cuticle oil every evening and moisturise your hands regularly. If you notice any lifting, don't pick at it; come back and we'll fix it for free within a week.\n"
     "Customer: That's really helpful. I'll make sure to follow all of that.",
     [("peel", "bóc, lột", "Don't peel your gel off."),
      ("detergent", "chất tẩy rửa", "Detergent can dry out your skin."),
      ("weaken", "làm yếu", "Hot water can weaken the gel."),
      ("pick at", "cạy, móc", "Don't pick at lifting gel."),
      ("gloves", "găng tay", "Wear gloves when you wash dishes."),
      ("regularly", "thường xuyên", "Moisturise your hands regularly.")],
     ("Lời khuyên: Try not to + V / Make sure to + V / Avoid + V-ing",
      "Dùng để dặn dò khách một cách nhẹ nhàng mà vẫn rõ ràng.",
      ["Try not to use your nails as tools.", "Make sure to apply cuticle oil every evening.", "Avoid picking at the gel."]),
     ("Nhấn từ khoá trong lời dặn: Wear GLOVES, apply cuticle OIL.",
      "Nhấn vào danh từ chính để khách nhớ điều cần làm.",
      ["detergent", "weaken", "regularly", "moisturise"]),
     ["Dặn khách ba điều cần làm để móng gel bền hơn.", "Giải thích phải làm gì khi móng gel bắt đầu bong."],
     [("Where does the customer tend to break her nails?", ["At the corners", "Only at the tips", "At the base"], 0, "'I tend to break nails at the corners'."),
      ("Why should she wear gloves to wash dishes?", ["Hot water and detergent weaken the gel", "Gloves look nice", "The water is cold"], 0, "'hot water and detergent weaken the gel'."),
      ("What should she do every evening?", ["Apply cuticle oil", "Remove the polish", "Soak her hands"], 0, "'Apply cuticle oil every evening'."),
      ("What should she do if the gel lifts?", ["Come back for a free fix within a week", "Pick at it", "Ignore it"], 0, "'come back and we'll fix it for free within a week'."),
      ("Which sentence gives advice?", ["Try not to use your nails as tools.", "Use your nails as tools.", "Tools use your nails."], 0, "Try not to + V = lời khuyên nhẹ nhàng.")]),

    ("B2", "Quản lý", "Báo cáo doanh thu và đặt mục tiêu",
     "Đọc số liệu tháng, giải thích nguyên nhân và đặt mục tiêu cho tháng sau.",
     "Owner: Let's review last month's figures. Revenue was up eight percent compared with the previous month, but our profit margin slipped slightly.\n"
     "Manager: That's mainly because of supply costs. We used more gel polish than expected.\n"
     "Owner: What about repeat customers?\n"
     "Manager: Encouragingly, sixty percent of clients rebooked before leaving. That's up from forty-five percent in the spring.\n"
     "Owner: Excellent. For next month, let's aim to increase that to seventy percent and reduce waste by ten percent.\n"
     "Manager: Both targets seem achievable, as long as the team stays motivated. I'll share the numbers at Monday's meeting.",
     [("revenue", "doanh thu", "Revenue was up eight percent."),
      ("profit margin", "biên lợi nhuận", "Our profit margin is about forty percent."),
      ("slip", "giảm nhẹ", "Our margin slipped slightly in August."),
      ("rebook", "đặt lại lịch", "Most clients rebook before leaving."),
      ("target", "mục tiêu", "We set a target of seventy percent."),
      ("achievable", "khả thi, đạt được", "Both goals are achievable.")],
     ("So sánh số liệu: up/down X percent compared with... / from X to Y / increase... to...",
      "Diễn tả sự thay đổi của số liệu so với kỳ trước và mục tiêu sắp tới.",
      ["Revenue was up eight percent compared with last month.", "Rebooking rose from forty-five to sixty percent.", "Let's aim to increase it to seventy percent."]),
     ("Nhấn số liệu: up EIGHT PERcent",
      "Nhấn số và đơn vị khi trình bày báo cáo để người nghe nắm được ngay.",
      ["revenue", "achievable", "percent", "margin"]),
     ["Trình bày ba con số chính của tháng vừa qua.", "Đặt hai mục tiêu cho tháng sau và giải thích cách đạt được."],
     [("How did revenue change?", ["Up eight percent", "Down eight percent", "It did not change"], 0, "'Revenue was up eight percent'."),
      ("Why did the profit margin slip?", ["Supply costs were higher than expected", "There were fewer customers", "The rent went up"], 0, "'mainly because of supply costs'."),
      ("What share of clients rebooked?", ["Sixty percent", "Forty-five percent", "Seventy percent"], 0, "'sixty percent of clients rebooked'."),
      ("What is next month's rebooking target?", ["Seventy percent", "Eighty percent", "Sixty percent"], 0, "'increase that to seventy percent'."),
      ("When will the numbers be shared?", ["At Monday's meeting", "On Friday", "Never"], 0, "'I'll share the numbers at Monday's meeting'.")]),
]
