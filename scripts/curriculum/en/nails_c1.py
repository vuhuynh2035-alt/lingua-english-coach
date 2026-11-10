"""Nails course, level C1 (9 lessons). Each entry is the argument list of L() in new_courses.py:
(level, category, title, objective, reading, vocab, grammar, pron, tasks, questions)."""

C1 = [
    ("C1", "Chuyên môn", "Tư vấn tình trạng móng phức tạp",
     "Mô tả dấu hiệu bất thường của móng, giải thích giới hạn chuyên môn và khuyên khách đi khám.",
     "Technician: Before we start, may I ask about your nails? There's some noticeable ridging here, and the free edge seems to be lifting away from the nail bed.\n"
     "Customer: It started a few months ago. I assumed it was just from the gel removal.\n"
     "Technician: That could be a factor, particularly if the product was soaked off for too long. However, it might also point to an underlying issue, such as a vitamin deficiency or an infection. I'm not in a position to diagnose anything, so I'd strongly suggest seeing a doctor.\n"
     "Customer: So you won't do my nails today?\n"
     "Technician: I'm happy to give you a gentle manicure and a strengthening treatment, but I'd steer clear of any enhancements until the nails have recovered. Were the condition to worsen, I'd have to decline altogether.\n"
     "Customer: I see. That's a bit disappointing, but I'd rather be safe.",
     [("ridging", "gờ dọc trên bề mặt móng", "There is some ridging along the nail plate."),
      ("free edge", "mép tự do của móng", "The free edge is starting to lift."),
      ("underlying", "tiềm ẩn, nằm bên dưới", "It may be an underlying health issue."),
      ("enhancement", "móng nối/đắp (bột, gel)", "I'd avoid any enhancement for now."),
      ("steer clear of", "tránh xa", "I'd steer clear of acrylics for now."),
      ("decline", "từ chối (dịch vụ)", "I may have to decline the service.")],
     ("Đảo ngữ điều kiện: Were + S + to... / Should + S... / Had + S + V3",
      "Cách nói trang trọng thay cho 'if', dùng khi cảnh báo hoặc đặt điều kiện một cách lịch sự.",
      ["Were the condition to worsen, I'd have to decline.", "Should you notice any swelling, please call us.", "Had I known about the allergy, I would have used a different product."]),
     ("Hạ giọng cuối câu khi từ chối lịch sự: I'd have to deCLINE.",
      "Nói chậm, hạ giọng ở cuối câu để nghe chắc chắn nhưng không gay gắt.",
      ["underlying", "enhancement", "ridging", "decline"]),
     ["Giải thích vì sao bạn khuyên khách đi khám trước khi làm móng nối.", "Dùng 'Were... to...' hoặc 'Should you...' để cảnh báo lịch sự."],
     [("Why does the technician recommend seeing a doctor?", ["The nails could reflect an underlying health problem", "The customer's polish is old", "The salon is fully booked"], 0, "'it might also point to an underlying issue'."),
      ("What will the technician offer today?", ["A full set of acrylics", "A gentle manicure and a strengthening treatment", "Nothing at all"], 1, "'a gentle manicure and a strengthening treatment'."),
      ("What does 'I'm not in a position to diagnose' imply?", ["She is too busy", "She is not qualified or permitted to diagnose", "She does not know the customer"], 1, "not in a position to = không có tư cách/thẩm quyền làm việc đó."),
      ("Which sentence uses conditional inversion correctly?", ["Were the condition to worsen, I'd decline.", "If were the condition worsen, I'd decline.", "The condition were worsen, I'd decline."], 0, "Were + S + to + V, ... thay cho If + S + were to + V."),
      ("How does the customer feel at the end?", ["Angry and about to leave", "Disappointed but accepting", "Delighted"], 1, "'a bit disappointing, but I'd rather be safe'.")]),

    ("C1", "Giao tiếp", "Trao đổi ý tưởng thiết kế móng theo yêu cầu",
     "Làm rõ mong muốn thẩm mỹ của khách, đề xuất thiết kế và đặt điều kiện về độ bền.",
     "Customer: I'm after something understated for my sister's wedding — nothing too flashy, but not plain either.\n"
     "Technician: Understated can mean a lot of things. Are you thinking of a sheer nude base with a subtle shimmer, or something more graphic, like negative space with a fine gold line?\n"
     "Customer: The negative space sounds elegant. Would it hold up over a long weekend of celebrations?\n"
     "Technician: Absolutely, provided we seal the edges properly. I'd also suggest a slightly shorter, rounded shape; it'll look more refined and it's less likely to snag on your dress.\n"
     "Customer: Could you mock up a design first? I don't want any surprises.\n"
     "Technician: Of course. I'll sketch it on a practice tip, and we can tweak it until you're completely happy.",
     [("understated", "tinh tế, giản dị mà sang", "She wanted an understated design for the wedding."),
      ("sheer", "mỏng, trong suốt", "A sheer nude base looks very natural."),
      ("negative space", "khoảng trống để lộ nền móng", "Negative space designs look modern and elegant."),
      ("refined", "tinh tế, thanh lịch", "A rounded shape looks more refined."),
      ("snag", "vướng, mắc vào", "Long nails can snag on delicate fabric."),
      ("tweak", "chỉnh sửa nhỏ", "We can tweak the design until you're happy.")],
     ("provided (that) / as long as + mệnh đề: với điều kiện",
      "Đặt điều kiện rõ ràng khi hứa hẹn một kết quả; trang trọng hơn 'if' một chút.",
      ["It will last a week, provided you wear gloves when cleaning.", "We can do it today as long as you book before noon.", "I'll start the design provided that you approve the sketch."]),
     ("Nhấn từ miêu tả thẩm mỹ: UNderstated, SHEER, reFINED",
      "Từ miêu tả thẩm mỹ nên nhấn và kéo dài nhẹ để truyền cảm hứng cho khách.",
      ["understated", "sheer", "refined", "tweak"]),
     ["Hỏi khách 3 câu để làm rõ 'đơn giản nhưng sang' nghĩa là gì với họ.", "Đề xuất một thiết kế kèm điều kiện giữ bền bằng 'provided that'."],
     [("What kind of design does the customer want?", ["Bright and flashy", "Understated but not plain", "Completely plain"], 1, "'understated... nothing too flashy, but not plain either'."),
      ("Why does the technician suggest a shorter, rounded shape?", ["It looks refined and is less likely to snag", "It is cheaper", "The customer asked for it"], 0, "'more refined and... less likely to snag'."),
      ("What condition does the technician set for durability?", ["Sealing the edges properly", "Using a darker colour", "Booking twice"], 0, "'provided we seal the edges properly'."),
      ("What will the technician do before the real design?", ["Sketch it on a practice tip", "Post it online", "Charge a deposit"], 0, "'I'll sketch it on a practice tip'."),
      ("Which sentence means 'on the condition that'?", ["It lasts a week provided you wear gloves.", "It lasts a week whereas you wear gloves.", "It lasts a week in case you wear gloves."], 0, "provided = với điều kiện.")]),

    ("C1", "Chuyên môn", "Hiểu thành phần sản phẩm và dị ứng",
     "Giải thích nguyên nhân dị ứng gel, vai trò của việc sấy đúng cách và thử dị ứng.",
     "Customer: After my last gel manicure, the skin around my nails turned red and itchy. Should I be worried?\n"
     "Technician: It could be an allergic reaction, most likely to methacrylates such as HEMA, which are found in many gel products. Once someone becomes sensitised, the reaction tends to get worse with each exposure.\n"
     "Customer: So I can never have gel again?\n"
     "Technician: Not necessarily. There are hypoallergenic, HEMA-free systems, although they aren't entirely risk-free. The key is proper curing — under-cured gel is far more likely to trigger a reaction — and keeping the product off the skin during application.\n"
     "Customer: Is it safe to try today?\n"
     "Technician: I'd recommend a patch test on one nail first, and we'll wait forty-eight hours before doing the rest. It's slower, but it's the responsible way to go about it.",
     [("allergic reaction", "phản ứng dị ứng", "She had an allergic reaction to the gel."),
      ("sensitised", "bị mẫn cảm", "Once you are sensitised, the reaction gets worse."),
      ("hypoallergenic", "ít gây dị ứng", "We offer hypoallergenic gel polish."),
      ("curing", "sấy/đóng rắn gel bằng đèn", "Proper curing reduces the risk of irritation."),
      ("patch test", "thử dị ứng trên một vùng nhỏ", "We always do a patch test first."),
      ("exposure", "sự tiếp xúc", "Repeated exposure makes the allergy worse.")],
     ("Câu chẻ (cleft sentence): The key is... / What matters is... / It's... that...",
      "Tách câu thành hai phần để nhấn mạnh thông tin quan trọng nhất.",
      ["The key is proper curing.", "What matters most is that you tell us about any allergies.", "It's the under-cured gel that causes most reactions."]),
     ("Nhấn từ khoá: The KEY is proper CURing.",
      "Nhấn vào phần sau 'is' để người nghe nhớ thông tin chính của lời khuyên.",
      ["allergic", "hypoallergenic", "sensitised", "exposure"]),
     ["Giải thích vì sao nên thử dị ứng trên một móng trước khi làm cả bộ.", "Dùng 'The key is...' để nhấn mạnh một lời khuyên an toàn."],
     [("What is the likely cause of the customer's reaction?", ["Methacrylates such as HEMA", "Cold weather", "Too much water"], 0, "'most likely to methacrylates such as HEMA'."),
      ("According to the technician, what increases the risk of a reaction?", ["Under-cured gel and skin contact", "Using a top coat", "Short nails"], 0, "'under-cured gel is far more likely to trigger a reaction'."),
      ("What does she recommend today?", ["A patch test on one nail", "Never using gel again", "A thicker layer of gel"], 0, "'a patch test on one nail first'."),
      ("Which sentence is a cleft sentence?", ["What matters is proper curing.", "Proper curing matters.", "Curing is proper matters."], 0, "What + mệnh đề + is + thông tin nhấn mạnh."),
      ("What does 'sensitised' suggest?", ["The body has become reactive to a substance", "The nails have become stronger", "The skin has become drier"], 0, "sensitised = cơ thể đã trở nên mẫn cảm với một chất.")]),

    ("C1", "Kỹ năng", "Xử lý sự cố phản ứng và lập báo cáo",
     "Giữ bình tĩnh khi khách có phản ứng, hỏi triệu chứng nghiêm trọng và lập báo cáo sự cố.",
     "Customer: My fingers are burning and swelling. I think something's wrong.\n"
     "Technician: Please stay calm. I'm going to remove the product straight away and rinse your hands with cool water. Are you having any difficulty breathing, or any swelling of the lips?\n"
     "Customer: No, just my fingers.\n"
     "Technician: Good. Even so, I'd advise you to see a doctor if it doesn't settle within an hour. I'll write up an incident report with the product names and batch numbers, so your doctor has all the details.\n"
     "Customer: Will I be charged?\n"
     "Technician: Certainly not. Our priority is your wellbeing. Here's my manager's number, and we'll follow up with you tomorrow.",
     [("incident report", "báo cáo sự cố", "I'll fill in an incident report straight away."),
      ("batch number", "số lô sản phẩm", "Please note the batch number on the bottle."),
      ("swelling", "sưng", "Any swelling should be checked by a doctor."),
      ("rinse", "rửa bằng nước", "Rinse the area with cool water."),
      ("settle", "dịu đi, ổn định", "If it doesn't settle within an hour, call a doctor."),
      ("follow up", "theo dõi, liên hệ lại", "We'll follow up with you tomorrow.")],
     ("Even so / Nevertheless / That said: thừa nhận nhưng vẫn khuyến nghị",
      "Thừa nhận một điều (ví dụ phản ứng nhẹ) nhưng vẫn đưa ra khuyến nghị an toàn.",
      ["Even so, I'd advise you to see a doctor.", "It's probably mild; that said, we should monitor it.", "The reaction is minor. Nevertheless, we will file a report."]),
     ("Giọng bình tĩnh, chậm: Please stay CALM.",
      "Khi xử lý sự cố, nói chậm, câu ngắn, ngữ điệu hạ để trấn an người nghe.",
      ["swelling", "incident", "breathing", "wellbeing"]),
     ["Trấn an khách bị phản ứng và hỏi các triệu chứng nghiêm trọng.", "Giải thích bạn sẽ ghi báo cáo sự cố và theo dõi sau đó."],
     [("What does the technician do first?", ["Removes the product and rinses with cool water", "Takes a photo", "Asks the customer to pay"], 0, "'remove the product straight away and rinse your hands'."),
      ("Why does the technician ask about breathing and the lips?", ["To check for a serious reaction", "To start a conversation", "To sell lip balm"], 0, "Khó thở/sưng môi là dấu hiệu phản ứng nghiêm trọng."),
      ("What will go in the incident report?", ["Product names and batch numbers", "The customer's age only", "The salon's prices"], 0, "'the product names and batch numbers'."),
      ("Will the customer be charged?", ["No, her wellbeing comes first", "Yes, full price", "Half price"], 0, "'Certainly not. Our priority is your wellbeing.'"),
      ("Which phrase shows a concession?", ["Even so, I'd advise you to see a doctor.", "So, you see a doctor.", "Because, see a doctor."], 0, "Even so = tuy vậy, dù thế.")]),

    ("C1", "Quản lý", "Chính sách đặt cọc và hủy lịch",
     "Giải thích chính sách hủy lịch, nêu giới hạn và đề xuất giải pháp thay thế một cách lịch sự.",
     "Customer: I'm so sorry — I'm going to have to cancel my appointment for this afternoon. Something's come up at work.\n"
     "Receptionist: I understand. Unfortunately, as our policy states, appointments cancelled with less than twenty-four hours' notice forfeit the deposit.\n"
     "Customer: Surely there's some flexibility? It's my first time cancelling.\n"
     "Receptionist: Given that it's your first time, I can transfer the deposit to a new booking within the next fourteen days. That's the most I'm able to do, I'm afraid.\n"
     "Customer: That's fair. I appreciate it.\n"
     "Receptionist: Not at all. Should you need to reschedule again, please let us know at least a day in advance, so we can offer the slot to someone on the waiting list.",
     [("deposit", "tiền đặt cọc", "A twenty-dollar deposit secures your booking."),
      ("forfeit", "mất (tiền cọc, quyền lợi)", "Late cancellations forfeit the deposit."),
      ("notice", "sự báo trước", "We need twenty-four hours' notice."),
      ("flexibility", "sự linh hoạt", "Is there any flexibility on the policy?"),
      ("waiting list", "danh sách chờ", "She's on the waiting list for Saturday."),
      ("reschedule", "dời lịch", "Can I reschedule for next week?")],
     ("Given that / Considering that / Seeing as: vì xét rằng",
      "Nêu lý do làm cơ sở cho một quyết định; nghe lịch sự và có sức thuyết phục.",
      ["Given that it's your first time, I can make an exception.", "Considering that the slot is in high demand, we need notice.", "Seeing as you've been a loyal customer, we'll waive the fee."]),
     ("Giọng ấm khi nêu giới hạn: That's the most I'm able to do, I'm aFRAID.",
      "Thêm 'I'm afraid' và hạ giọng cuối câu để lời từ chối bớt cứng.",
      ["forfeit", "deposit", "flexibility", "reschedule"]),
     ["Giải thích chính sách hủy lịch cho khách bằng 'Given that...'.", "Đề xuất một giải pháp thay thế thay vì giữ nguyên mức phạt."],
     [("Why would the customer normally lose the deposit?", ["She cancelled with less than 24 hours' notice", "She was late", "She changed her design"], 0, "'less than twenty-four hours' notice forfeit the deposit'."),
      ("What does the receptionist offer?", ["To transfer the deposit to a new booking within fourteen days", "A full refund", "A free manicure"], 0, "'transfer the deposit to a new booking'."),
      ("Why does she ask for a day's notice in future?", ["To offer the slot to someone on the waiting list", "To raise prices", "To close early"], 0, "'so we can offer the slot to someone on the waiting list'."),
      ("What does 'That's the most I'm able to do, I'm afraid' express?", ["A polite limit on what can be offered", "An apology for being late", "A threat"], 0, "Giới hạn lịch sự của những gì có thể làm."),
      ("Which sentence gives a reason?", ["Given that it's your first time, I can make an exception.", "Although it's your first time, because exception.", "It's your first time given so exception."], 0, "Given that = vì xét rằng.")]),

    ("C1", "Quản lý", "Hướng dẫn và góp ý cho nhân viên mới",
     "Khen đúng chỗ, góp ý cụ thể và đưa lời khuyên mềm mỏng cho thợ mới.",
     "Trainer: Let's go through your last set together. First, what do you think went well?\n"
     "Trainee: I think my shaping was quite even, and the customer seemed relaxed.\n"
     "Trainer: I agree, your shaping is coming along nicely. One thing I'd work on is your cuticle prep. You were a little heavy-handed near the sidewall, which is how lifting starts.\n"
     "Trainee: I didn't realise. I was worried about leaving any skin behind.\n"
     "Trainer: That's a common concern. If I were you, I'd use a lighter touch and let the product do more of the work. It's all about control rather than pressure.\n"
     "Trainee: Would you mind watching me again tomorrow?\n"
     "Trainer: Not at all. By the end of the month, I'm confident you'll be doing it with your eyes closed.",
     [("shaping", "tạo form móng", "Her shaping is very even."),
      ("heavy-handed", "mạnh tay, thiếu nhẹ nhàng", "Don't be heavy-handed near the skin."),
      ("sidewall", "rãnh móng hai bên", "Avoid the sidewall when filing."),
      ("lifting", "bong tróc (gel, bột)", "Lifting often starts at the edges."),
      ("prep", "bước chuẩn bị móng", "Good prep makes the product last longer."),
      ("confident", "tự tin, chắc chắn", "I'm confident you'll improve quickly.")],
     ("Lời khuyên mềm: If I were you, I'd... / It might be worth... / One thing I'd work on is...",
      "Đưa góp ý như một gợi ý thay vì mệnh lệnh, giúp người nghe dễ tiếp nhận.",
      ["If I were you, I'd use a lighter touch.", "It might be worth practising on a tip first.", "One thing I'd work on is your timing."]),
     ("Khen trước, góp ý sau: Your shaping is coming along NICEly.",
      "Giọng đi lên khi khen, đều và nhẹ khi góp ý để người nghe không bị phòng thủ.",
      ["heavy-handed", "sidewall", "confident", "lifting"]),
     ["Góp ý cho một nhân viên mới: một điểm tốt và một điểm cần cải thiện.", "Dùng 'If I were you, I'd...' để đưa lời khuyên."],
     [("What does the trainer praise?", ["The trainee's shaping", "The trainee's nail art", "The trainee's speed"], 0, "'your shaping is coming along nicely'."),
      ("What problem does the trainer point out?", ["Being heavy-handed near the sidewall", "Using too much polish", "Arriving late"], 0, "'a little heavy-handed near the sidewall'."),
      ("Why did the trainee press hard?", ["She was worried about leaving skin behind", "She was angry", "She had no tools"], 0, "'worried about leaving any skin behind'."),
      ("What does 'It's all about control rather than pressure' mean?", ["Precision matters more than force", "Use more force", "Control the customer"], 0, "Chính xác quan trọng hơn dùng lực."),
      ("Which is a soft piece of advice?", ["If I were you, I'd use a lighter touch.", "Use a lighter touch now.", "You are wrong."], 0, "If I were you, I'd... = lời khuyên mềm.")]),

    ("C1", "Kỹ năng", "Xây dựng thương hiệu và mạng xã hội",
     "Trao đổi cách biến người theo dõi thành khách đặt lịch và giữ giọng điệu thương hiệu nhất quán.",
     "Owner: Our feed looks pretty, but we're not converting followers into bookings. Where are we going wrong?\n"
     "Consultant: Your photos are strong, but there's no clear call to action. Each post should tell people what to do next — book, message, or visit.\n"
     "Owner: We don't want to come across as pushy.\n"
     "Consultant: There's a fine line between pushy and helpful. Short stories about your clients' experiences, shared with their consent, build trust far more effectively than discounts. Consistency matters too; posting three times a week beats a burst of ten posts followed by silence.\n"
     "Owner: And what about the brand's tone of voice?\n"
     "Consultant: Decide on two or three adjectives — warm, expert, playful, say — and let those guide every caption. Customers should recognise you even without seeing the logo.",
     [("convert", "chuyển đổi (người theo dõi thành khách)", "We want to convert followers into customers."),
      ("call to action", "lời kêu gọi hành động", "Every post needs a clear call to action."),
      ("come across as", "tạo ấn tượng là", "We don't want to come across as pushy."),
      ("consent", "sự đồng ý", "Ask for the client's consent before posting."),
      ("consistency", "sự nhất quán", "Consistency builds trust over time."),
      ("tone of voice", "giọng điệu thương hiệu", "Our tone of voice is warm and expert.")],
     ("So sánh nhấn mạnh: far / much / considerably + more... than",
      "Dùng trạng từ tăng mức trước dạng so sánh để nhấn mạnh sự khác biệt lớn.",
      ["Stories build trust far more effectively than discounts.", "Posting regularly is considerably cheaper than advertising.", "There's a fine line between pushy and helpful."]),
     ("Nhấn từ đối lập: PUSHy hay HELPful",
      "Nhấn mạnh hai từ đối lập để người nghe thấy ngay sự khác biệt.",
      ["consistency", "consent", "convert", "pushy"]),
     ["Đề xuất ba cách để biến người theo dõi thành khách đặt lịch.", "Mô tả giọng điệu thương hiệu của tiệm bằng ba tính từ."],
     [("What is the owner's problem?", ["Followers are not turning into bookings", "The photos are poor", "The prices are too high"], 0, "'not converting followers into bookings'."),
      ("What does each post need, according to the consultant?", ["A clear call to action", "A discount", "A long caption"], 0, "'no clear call to action'."),
      ("Why does the consultant suggest sharing clients' experiences?", ["They build trust more effectively than discounts", "They are cheaper to film", "They make the feed longer"], 0, "'build trust far more effectively than discounts'."),
      ("What does the consultant say works better?", ["Posting three times a week consistently", "Posting ten times then stopping", "Never posting"], 0, "'three times a week beats a burst of ten posts'."),
      ("'A fine line between pushy and helpful' means...", ["The difference is subtle and easy to cross", "They are exactly the same", "There is a thin wall"], 0, "a fine line = ranh giới mong manh.")]),

    ("C1", "Quản lý", "Đàm phán với nhà cung cấp",
     "Thương lượng giá, chiết khấu và thời gian giao hàng, yêu cầu cam kết bằng văn bản.",
     "Owner: We're ordering in much larger volumes now, so I'd like to revisit our pricing.\n"
     "Supplier: I appreciate your business. What sort of volumes are we talking about?\n"
     "Owner: Roughly double what we ordered last quarter, on a regular basis. In return, I'd expect a discount of around fifteen percent and free delivery.\n"
     "Supplier: Fifteen is a stretch. I could offer ten percent, with free delivery above a certain order value.\n"
     "Owner: What about the lead time? Last month, a delay left us short of gel polish for a week.\n"
     "Supplier: That's unacceptable, and I apologise. I can commit to a maximum five-day lead time in writing, with a rebate if we miss it.\n"
     "Owner: In that case, we have a deal, provided it's confirmed in the contract.",
     [("volume", "số lượng lớn", "We order in large volumes."),
      ("discount", "giảm giá", "I'd expect a discount for bulk orders."),
      ("lead time", "thời gian giao hàng", "Our lead time is five days."),
      ("rebate", "khoản hoàn tiền", "You'll receive a rebate if we miss the deadline."),
      ("stretch", "hơi quá sức, khó chấp nhận", "Fifteen percent is a bit of a stretch."),
      ("commit", "cam kết", "I can commit to a five-day lead time.")],
     ("Đề nghị và nhượng bộ khi đàm phán: In return, I'd expect... / I could offer... / provided...",
      "Nêu điều bạn mong muốn, điều bạn có thể đưa ra và điều kiện đi kèm.",
      ["In return, I'd expect a ten percent discount.", "I could offer free delivery above a certain value.", "We have a deal, provided it's in the contract."]),
     ("Phân biệt số: fifTEEN và FIFty",
      "-teen nhấn ở cuối, -ty nhấn ở đầu; nói rõ để tránh nhầm giá.",
      ["fifteen", "fifty", "volume", "commit"]),
     ["Thương lượng một khoản giảm giá khi đặt số lượng lớn.", "Yêu cầu nhà cung cấp cam kết thời gian giao hàng bằng văn bản."],
     [("Why does the owner want to revisit the pricing?", ["Orders are now much larger", "The supplier raised prices", "The salon is closing"], 0, "'ordering in much larger volumes'."),
      ("How does the supplier respond to fifteen percent?", ["Says it's a stretch and offers ten", "Accepts at once", "Ends the call"], 0, "'Fifteen is a stretch. I could offer ten percent'."),
      ("What happened last month?", ["A delay left them short of gel polish", "The shop flooded", "The owner forgot to pay"], 0, "'a delay left us short of gel polish for a week'."),
      ("What does the supplier commit to?", ["A maximum five-day lead time, with a rebate if missed", "A free salon", "Lower quality"], 0, "'a maximum five-day lead time in writing, with a rebate'."),
      ("When does the owner accept the deal?", ["Provided it is confirmed in the contract", "Only if the supplier apologises twice", "Never"], 0, "'provided it's confirmed in the contract'.")]),

    ("C1", "Pháp lý", "Giấy phép, quy định và kiểm tra",
     "Làm việc với thanh tra: trình giấy tờ, giải thích thiếu sót và cam kết khắc phục.",
     "Inspector: Good morning. I'm here for the routine inspection. May I see your licences and the cleaning logs?\n"
     "Owner: Of course. All technicians' licences are displayed at their stations, and our sterilisation records are in this binder.\n"
     "Inspector: Thank you. I notice that the foot spa basins were last disinfected two days ago. Regulations stipulate that they must be cleaned and logged after every client.\n"
     "Owner: You're right; that entry was missed. Our new technician wasn't aware of the requirement. I'll make sure everyone is briefed today.\n"
     "Inspector: I'll record it as a minor violation. You have fourteen days to demonstrate compliance, otherwise a fine may be imposed.\n"
     "Owner: Understood. We'll send you the updated logs well before the deadline.",
     [("inspection", "cuộc kiểm tra", "The routine inspection takes about an hour."),
      ("licence", "giấy phép hành nghề", "All technicians must display their licence."),
      ("stipulate", "quy định rõ", "The regulations stipulate daily cleaning."),
      ("compliance", "sự tuân thủ", "We must demonstrate compliance within fourteen days."),
      ("violation", "vi phạm", "It was recorded as a minor violation."),
      ("disinfect", "khử trùng", "We disinfect the basins after every client.")],
     ("Bị động trang trọng: must be cleaned and logged / is required to / may be imposed",
      "Dùng trong quy định và văn bản pháp lý, nhấn vào hành động chứ không phải người làm.",
      ["Basins must be cleaned after every client.", "A fine may be imposed if records are missing.", "Staff are required to wear gloves."]),
     ("Nhấn âm tiết trước đuôi -tion: inSPECtion, vioLAtion",
      "Từ đuôi -tion nhấn vào âm tiết ngay trước đuôi; nói chậm với từ pháp lý.",
      ["inspection", "compliance", "violation", "stipulate"]),
     ["Giải thích với thanh tra bạn đã khắc phục một thiếu sót như thế nào.", "Hướng dẫn nhân viên mới quy định khử trùng bằng câu bị động."],
     [("Why has the inspector come?", ["For a routine inspection", "Because of a customer complaint", "For a job interview"], 0, "'I'm here for the routine inspection'."),
      ("What was missing from the records?", ["Cleaning entries for the foot spa basins after every client", "The owner's licence", "The gloves"], 0, "'that entry was missed'."),
      ("How is the problem classified?", ["As a minor violation", "As a criminal offence", "As a compliment"], 0, "'I'll record it as a minor violation'."),
      ("What deadline does the owner receive?", ["Fourteen days", "Two days", "One year"], 0, "'You have fourteen days to demonstrate compliance'."),
      ("Which sentence is passive and formal?", ["Basins must be cleaned after every client.", "Clean basins you must.", "Someone cleaning basins every client."], 0, "must be + V3 = bị động trang trọng.")]),
]
