from build import L

TITLE = "Tiếng Anh du lịch"
OVERVIEW = "12 bài từ A1 đến B2 cho chuyến đi: sân bay, khách sạn, ăn uống, di chuyển, xử lý sự cố và trải nghiệm văn hóa."

LESSONS = [
    L("A1", "Giao tiếp", "Làm thủ tục tại sân bay",
      "Check-in, xuất trình hộ chiếu, gửi hành lý và hỏi cửa ra máy bay.",
      """Agent: Good morning. Where are you flying to today?
Passenger: To Singapore.
Agent: Can I see your passport, please?
Passenger: Here you are.
Agent: Do you have any bags to check in?
Passenger: Yes, one suitcase.
Agent: Window or aisle seat?
Passenger: Window, please.
Agent: Here's your boarding pass. Your gate is B12. Boarding starts at 9:40.""",
      [("passport", "hộ chiếu", "Can I see your passport, please?"),
       ("check in", "làm thủ tục, ký gửi", "I have one bag to check in."),
       ("suitcase", "va li", "My suitcase is blue."),
       ("aisle seat", "ghế cạnh lối đi", "I'd like an aisle seat."),
       ("boarding pass", "thẻ lên máy bay", "Here's your boarding pass."),
       ("gate", "cửa ra máy bay", "Your gate is B12.")],
      ("Câu hỏi Wh- cơ bản",
       "What (gì), Where (ở đâu), When (khi nào), What time (mấy giờ), Which (cái nào). Cấu trúc: Wh- + trợ động từ + chủ ngữ + V: Where are you flying to?",
       ["Where is gate B12?", "What time does boarding start?", "Which seat do you want?"]),
      ("aisle đọc /aɪl/ (chữ s câm)", "aisle đọc giống 'I'll' — chữ s không phát âm. Gate /geɪt/ nhớ bật âm /t/ cuối.", ["aisle", "gate", "passport", "suitcase"]),
      [("Where is the passenger flying to?", ["Bangkok", "Singapore", "Tokyo"], 1, "'To Singapore.'"),
       ("How many bags does the passenger check in?", ["None", "One", "Two"], 1, "'one suitcase'."),
       ("What seat does the passenger choose?", ["Aisle", "Window", "Middle"], 1, "'Window, please.'"),
       ("What time does boarding start?", ["9:14", "9:40", "10:40"], 1, "'Boarding starts at 9:40.'"),
       ("Choose the correct question.", ["Where gate B12 is?", "Where is gate B12?", "Where does gate B12?"], 1, "Wh- + is + chủ ngữ.")],
      ["Đóng vai làm thủ tục check-in: trả lời nhân viên (thầy/cô).", "Hỏi đường đến cửa B12 và giờ lên máy bay."]),

    L("A1", "Từ vựng", "Nhận phòng khách sạn",
      "Nhận phòng, hỏi giờ ăn sáng, Wi-Fi và các tiện ích.",
      """Receptionist: Good evening. Welcome to the Sunrise Hotel.
Guest: Hi. I have a reservation. My name is Pham.
Receptionist: Yes, a double room for three nights. Here is your key card. Your room is 305, on the third floor.
Guest: What time is breakfast?
Receptionist: From 6:30 to 10 in the restaurant.
Guest: Is there Wi-Fi?
Receptionist: Yes, it's free. The password is on your key card.""",
      [("reservation", "đặt phòng trước", "I have a reservation."),
       ("double room", "phòng giường đôi", "We'd like a double room."),
       ("key card", "thẻ từ mở phòng", "Here is your key card."),
       ("breakfast", "bữa sáng", "Breakfast is from 6:30."),
       ("free", "miễn phí", "The Wi-Fi is free."),
       ("password", "mật khẩu", "What's the Wi-Fi password?")],
      ("Is there…? / Are there…?",
       "Hỏi có hay không: Is there a pool? (số ít) / Are there any towels? (số nhiều). Trả lời: Yes, there is. / No, there aren't.",
       ["Is there a gym in the hotel?", "Are there any restaurants nearby?", "Yes, there is. It's on the first floor."]),
      ("Số phòng và số thứ tự", "305 đọc 'three-oh-five'. third /θɜːd/ — đặt lưỡi giữa hai răng cho âm /θ/, không đọc thành 'tớt'.", ["third", "three", "breakfast", "reservation"]),
      [("How many nights is the guest staying?", ["Two", "Three", "Four"], 1, "'for three nights'."),
       ("Which floor is room 305 on?", ["First", "Third", "Fifth"], 1, "'on the third floor'."),
       ("Where is breakfast served?", ["In the room", "In the restaurant", "In the lobby"], 1, "'in the restaurant'."),
       ("Where is the Wi-Fi password?", ["On the key card", "At reception", "On the TV"], 0, "'The password is on your key card.'"),
       ("Choose the correct question.", ["Is there any towels?", "Are there any towels?", "There are any towels?"], 1, "towels số nhiều → Are there any…?")],
      ["Nhận phòng với thầy/cô: nói tên, số đêm và hỏi 2 tiện ích.", "Hỏi về giờ trả phòng (check-out)."]),

    L("A1", "Giao tiếp", "Mua vé và đi phương tiện công cộng",
      "Mua vé tàu/xe buýt, hỏi giờ, sân ga và giá vé.",
      """Passenger: Hello. A ticket to Brighton, please.
Clerk: Single or return?
Passenger: Return, please. How much is it?
Clerk: Twenty-four pounds.
Passenger: What time is the next train?
Clerk: At 11:15, from platform 4.
Passenger: How long does it take?
Clerk: About an hour.""",
      [("ticket", "vé", "A ticket to Brighton, please."),
       ("single", "vé một chiều", "A single ticket, please."),
       ("return", "vé khứ hồi", "I'd like a return ticket."),
       ("next train", "chuyến tàu tiếp theo", "When is the next train?"),
       ("platform", "sân ga", "The train leaves from platform 4."),
       ("How long does it take?", "Mất bao lâu?", "How long does it take to the airport?")],
      ("How much / How long / What time",
       "How much…? hỏi giá; How long does it take? hỏi thời gian di chuyển; What time…? hỏi giờ cụ thể.",
       ["How much is a single ticket?", "How long does it take by bus?", "What time does the bus leave?"]),
      ("Âm /ɜː/ trong return, journey", "return /rɪˈtɜːn/ — nhấn âm sau, nguyên âm 'ơ' dài. Twenty-four nhấn 'twen' và 'four'.", ["return", "platform", "ticket", "twenty-four"]),
      [("What kind of ticket does the passenger buy?", ["Single", "Return", "Weekly"], 1, "'Return, please.'"),
       ("How much is the ticket?", ["£14", "£24", "£42"], 1, "'Twenty-four pounds.'"),
       ("Which platform does the train leave from?", ["2", "4", "11"], 1, "'from platform 4'."),
       ("How long is the journey?", ["About an hour", "Fifteen minutes", "Two hours"], 0, "'About an hour.'"),
       ("Which question asks about the price?", ["How long is it?", "How much is it?", "What time is it?"], 1, "How much = bao nhiêu tiền.")],
      ["Mua một vé khứ hồi và hỏi giờ tàu, sân ga.", "Hỏi thầy/cô cách đi từ sân bay về trung tâm thành phố."]),

    L("A2", "Giao tiếp", "Gọi món và yêu cầu đặc biệt ở nhà hàng",
      "Đặt bàn, gọi món, nói về dị ứng/khẩu vị và thanh toán.",
      """Waiter: Are you ready to order?
Customer: Yes. I'd like the grilled fish, please. Does it come with rice?
Waiter: It comes with potatoes, but you can have rice instead.
Customer: Rice, please. Also, I'm allergic to peanuts. Is there any in the sauce?
Waiter: No, there isn't, but I'll tell the chef.
Customer: Thank you. Could we have some water too?""",
      [("ready to order", "sẵn sàng gọi món", "Are you ready to order?"),
       ("come with", "ăn kèm với", "The steak comes with salad."),
       ("instead", "thay vào đó", "Can I have rice instead?"),
       ("allergic to", "dị ứng với", "I'm allergic to peanuts."),
       ("chef", "đầu bếp", "I'll tell the chef."),
       ("sauce", "nước sốt", "The sauce is a bit spicy.")],
      ("some / any với danh từ không đếm được",
       "some dùng trong câu khẳng định và lời mời/xin (Could we have some water?). any dùng trong câu hỏi và phủ định (Is there any sugar? There isn't any).",
       ["Could I have some bread?", "Is there any milk in it?", "There aren't any vegetarian options."]),
      ("Âm /ʃ/ trong chef, fish", "chef /ʃef/ — từ gốc Pháp, chữ ch đọc /ʃ/ như 'sh'. fish /fɪʃ/ nhớ giữ âm cuối /ʃ/.", ["chef", "fish", "sauce", "allergic"]),
      [("What does the customer order?", ["Grilled chicken", "Grilled fish", "Fish soup"], 1, "'I'd like the grilled fish'."),
       ("What does the fish usually come with?", ["Rice", "Potatoes", "Salad"], 1, "'It comes with potatoes'."),
       ("What is the customer allergic to?", ["Fish", "Peanuts", "Milk"], 1, "'I'm allergic to peanuts.'"),
       ("Choose the correct request.", ["Could we have any water?", "Could we have some water?", "Could we have a water some?"], 1, "Lời xin dùng some."),
       ("Choose the correct question.", ["Is there some peanuts in it?", "Are there any peanuts in it?", "There are any peanuts?"], 1, "Câu hỏi dùng any.")],
      ["Gọi món ăn và đổi một món kèm, nói về một món bạn không ăn được.", "Thầy/cô là phục vụ — hỏi về món đặc biệt của nhà hàng."]),

    L("A2", "Kỹ năng", "Tham quan và hỏi thông tin du lịch",
      "Hỏi giờ mở cửa, giá vé tham quan, tour và gợi ý địa điểm.",
      """Tourist: Excuse me, what time does the museum open?
Guide: It opens at nine and closes at five, but it's closed on Mondays.
Tourist: How much is the entrance fee?
Guide: Ten euros for adults and five for students.
Tourist: Are there any guided tours in English?
Guide: Yes, there's one at eleven. It lasts about ninety minutes.
Tourist: Great. What else would you recommend?
Guide: You should visit the old market. It's the most famous place in town.""",
      [("entrance fee", "phí vào cửa", "The entrance fee is ten euros."),
       ("closed", "đóng cửa", "The museum is closed on Mondays."),
       ("guided tour", "tour có hướng dẫn viên", "Is there a guided tour?"),
       ("last", "kéo dài", "The tour lasts ninety minutes."),
       ("recommend", "giới thiệu, gợi ý", "What would you recommend?"),
       ("famous", "nổi tiếng", "It's the most famous place in town.")],
      ("So sánh nhất: the -est / the most",
       "Tính từ ngắn: the + -est (the oldest, the biggest). Tính từ dài: the most + adj (the most famous). Bất quy tắc: good → the best, bad → the worst.",
       ["It's the oldest building in the city.", "This is the most beautiful beach.", "That was the best tour."]),
      ("Trọng âm: MUseum? Không — muSEum", "museum /mjuːˈziːəm/ nhấn âm thứ hai. recommend /ˌrekəˈmend/ nhấn âm cuối.", ["museum", "recommend", "entrance", "famous"]),
      [("When is the museum closed?", ["Sundays", "Mondays", "Fridays"], 1, "'it's closed on Mondays'."),
       ("How much is the ticket for a student?", ["€5", "€10", "€15"], 0, "'five for students'."),
       ("How long is the guided tour?", ["60 minutes", "90 minutes", "2 hours"], 1, "'about ninety minutes'."),
       ("Choose the correct superlative.", ["the most old", "the oldest", "the older"], 1, "old → the oldest."),
       ("What does the guide recommend?", ["The old market", "A new mall", "The beach"], 0, "'You should visit the old market.'")],
      ["Hỏi thầy/cô thông tin về một điểm tham quan: giờ, giá, tour.", "Giới thiệu nơi nổi tiếng nhất ở quê bạn với so sánh nhất."]),

    L("A2", "Ngữ pháp", "Phàn nàn nhẹ nhàng ở khách sạn",
      "Báo sự cố phòng ở (điều hòa, nước nóng, tiếng ồn) và yêu cầu hỗ trợ.",
      """Guest: Hello, this is room 512. I'm afraid there's a problem. The air conditioner isn't working, and the room is very hot.
Reception: I'm sorry to hear that. I'll send someone to check it right away.
Guest: Thank you. Also, there was no hot water this morning.
Reception: I apologise. If it isn't fixed in thirty minutes, we'll move you to another room.
Guest: That would be great. Thanks for your help.""",
      [("I'm afraid", "e rằng (mở đầu lời phàn nàn lịch sự)", "I'm afraid the TV doesn't work."),
       ("air conditioner", "máy lạnh", "The air conditioner isn't working."),
       ("right away", "ngay lập tức", "I'll send someone right away."),
       ("hot water", "nước nóng", "There's no hot water."),
       ("apologise", "xin lỗi (trang trọng)", "We apologise for the problem."),
       ("move", "chuyển", "We'll move you to another room.")],
      ("will cho lời hứa và quyết định tức thì",
       "Dùng will + V khi quyết định ngay lúc nói hoặc hứa hẹn: I'll send someone. Phủ định: won't.",
       ["I'll call the technician now.", "We'll bring you some towels.", "Don't worry, it won't take long."]),
      ("Rút gọn I'll /aɪl/, isn't /ˈɪznt/", "I'll đọc liền /aɪl/. isn't có âm /nt/ cuối rất nhẹ — đừng bỏ, vì nó mang nghĩa phủ định.", ["I'll", "isn't", "apologise", "conditioner"]),
      [("What is the first problem?", ["No Wi-Fi", "The air conditioner isn't working", "The door is broken"], 1, "'The air conditioner isn't working'."),
       ("What else was wrong?", ["No hot water", "Noisy neighbours", "Dirty towels"], 0, "'there was no hot water this morning'."),
       ("What will the hotel do if it isn't fixed?", ["Give a refund", "Move the guest to another room", "Nothing"], 1, "'we'll move you to another room'."),
       ("Choose the instant decision.", ["I'm going to send someone, I decided yesterday.", "I'll send someone right away.", "I sent someone right away tomorrow."], 1, "Quyết định tức thì: will."),
       ("Which opening is the most polite complaint?", ["Your room is terrible.", "I'm afraid there's a problem.", "Fix it!"], 1, "'I'm afraid…' mở đầu lịch sự.")],
      ["Gọi lễ tân báo 2 sự cố trong phòng và yêu cầu giải pháp.", "Thầy/cô đưa giải pháp chưa ổn — bạn đề nghị cách khác."]),

    L("B1", "Kỹ năng", "Xử lý sự cố khi đi du lịch",
      "Báo mất đồ, chuyến bay bị hủy, và mô tả đồ vật bị thất lạc.",
      """Passenger: Excuse me, my suitcase didn't arrive. I was on flight VN301 from Hanoi.
Staff: I'm sorry. Could you describe it?
Passenger: It's a medium-sized black suitcase with a red ribbon on the handle. It has my name tag on it.
Staff: Thank you. It may have been sent to another airport. We'll deliver it to your hotel as soon as it's found.
Passenger: Will I be compensated if I need to buy clothes?
Staff: Yes, keep your receipts and we'll reimburse reasonable expenses.""",
      [("describe", "mô tả", "Could you describe your bag?"),
       ("ribbon", "dải ruy băng", "It has a red ribbon on the handle."),
       ("name tag", "thẻ tên", "There's a name tag on it."),
       ("deliver", "giao đến", "We'll deliver it to your hotel."),
       ("compensate", "bồi thường", "Will I be compensated?"),
       ("reimburse", "hoàn trả chi phí", "We'll reimburse your expenses.")],
      ("Câu bị động thì tương lai và may have been",
       "Bị động tương lai: will be + V3 (It will be delivered). Phỏng đoán quá khứ: may/might have been + V3 (It may have been sent to another airport).",
       ["Your bag will be delivered tonight.", "The flight may have been delayed by the storm.", "You will be compensated for the delay."]),
      ("Mô tả đồ vật: thứ tự tính từ", "Kích cỡ → màu → chất liệu: a medium-sized black leather suitcase. Nhấn các tính từ quan trọng khi mô tả.", ["describe", "compensate", "reimburse", "suitcase"]),
      [("What is the problem?", ["The flight was cancelled.", "The suitcase didn't arrive.", "The passport was lost."], 1, "'my suitcase didn't arrive'."),
       ("Which description is correct?", ["Small red suitcase", "Medium-sized black suitcase with a red ribbon", "Large blue bag"], 1, "'medium-sized black suitcase with a red ribbon'."),
       ("Where will the suitcase be delivered?", ["To the airport", "To the hotel", "To Hanoi"], 1, "'deliver it to your hotel'."),
       ("Choose the correct passive.", ["It will deliver tonight.", "It will be delivered tonight.", "It will delivered tonight."], 1, "will be + V3."),
       ("What should the passenger keep?", ["Receipts", "Boarding pass only", "Photos"], 0, "'keep your receipts'.")],
      ["Báo mất hành lý: mô tả va li chi tiết và hỏi về bồi thường.", "Thầy/cô hỏi thêm thông tin — trả lời rõ ràng."]),

    L("B1", "Từ vựng", "Thuê xe và lái xe ở nước ngoài",
      "Thuê xe, hỏi về bảo hiểm, nhiên liệu và luật giao thông.",
      """Agent: Have you booked a car with us?
Customer: Yes, a compact car for five days.
Agent: Would you like full insurance? It covers any damage to the car.
Customer: How much extra is it?
Agent: Fifteen dollars a day. The car has a full tank, and you have to return it full.
Customer: Do I need an international driving permit?
Agent: Yes, you do. And remember, we drive on the left here.""",
      [("book", "đặt trước", "I've booked a car for five days."),
       ("insurance", "bảo hiểm", "Full insurance covers all damage."),
       ("cover", "chi trả, bao gồm", "It covers any damage."),
       ("full tank", "đầy bình xăng", "The car has a full tank."),
       ("driving permit", "giấy phép lái xe", "You need an international driving permit."),
       ("drive on the left", "lái bên trái", "In the UK, people drive on the left.")],
      ("have to / must / don't have to",
       "have to và must: bắt buộc (You have to return it full). don't have to: không bắt buộc (You don't have to pay now). mustn't: cấm (You mustn't smoke in the car).",
       ["You have to show your licence.", "You don't have to pay a deposit.", "You mustn't park here."]),
      ("must /mʌst/ vs mustn't /ˈmʌsnt/", "mustn't — chữ t đầu câm: /ˈmʌsnt/. Nói rõ để tránh nhầm nghĩa 'phải' với 'cấm'.", ["mustn't", "insurance", "permit", "tank"]),
      [("How long does the customer need the car?", ["Three days", "Five days", "A week"], 1, "'for five days'."),
       ("How much is full insurance?", ["$5 a day", "$15 a day", "$50 a day"], 1, "'Fifteen dollars a day.'"),
       ("How must the car be returned?", ["Clean", "With a full tank", "Before noon"], 1, "'you have to return it full'."),
       ("“You don't have to pay now” means…", ["You mustn't pay now.", "Paying now is not necessary.", "You must pay now."], 1, "don't have to = không bắt buộc."),
       ("Which side do they drive on?", ["Left", "Right", "Both"], 0, "'we drive on the left here'.")],
      ["Thuê một chiếc xe: hỏi giá, bảo hiểm và các quy định.", "Giải thích cho thầy/cô 3 quy định giao thông ở Việt Nam với have to / mustn't."]),

    L("B1", "Giao tiếp", "Trò chuyện với người địa phương",
      "Bắt chuyện, hỏi về văn hóa, ẩm thực địa phương và chia sẻ về đất nước mình.",
      """Local: Is this your first time in Japan?
Traveller: Yes, it is! I've been here for three days. Everything is so clean and organised.
Local: Have you tried any local food yet?
Traveller: I've tried ramen, but I haven't tried okonomiyaki. What is it exactly?
Local: It's a kind of savoury pancake. You should try it in Osaka.
Traveller: I will. By the way, in Vietnam we have something similar called bánh xèo.""",
      [("first time", "lần đầu", "Is this your first time here?"),
       ("organised", "ngăn nắp, có tổ chức", "The city is very organised."),
       ("local food", "món ăn địa phương", "I love trying local food."),
       ("a kind of", "một loại", "It's a kind of pancake."),
       ("savoury", "mặn (không ngọt)", "I prefer savoury snacks."),
       ("by the way", "nhân tiện", "By the way, where are you from?")],
      ("Hiện tại hoàn thành với for / since",
       "for + khoảng thời gian (for three days), since + mốc thời gian (since Monday). Dùng cho việc bắt đầu trong quá khứ và còn tiếp diễn.",
       ["I've been here for three days.", "She has lived in Osaka since 2020.", "How long have you been in Japan?"]),
      ("Giới thiệu từ tiếng Việt cho người nước ngoài", "Khi nói tên món Việt, nói chậm và giải thích ngay: 'bánh xèo — it's a crispy pancake'. Nhấn 'kind of' nhẹ.", ["organised", "savoury", "similar", "exactly"]),
      [("How long has the traveller been in Japan?", ["Three days", "Three weeks", "One day"], 0, "'I've been here for three days.'"),
       ("What has the traveller already tried?", ["Okonomiyaki", "Ramen", "Sushi"], 1, "'I've tried ramen'."),
       ("What is okonomiyaki?", ["A soup", "A savoury pancake", "A dessert"], 1, "'a kind of savoury pancake'."),
       ("Choose the correct sentence.", ["I've been here since three days.", "I've been here for three days.", "I'm here for three days ago."], 1, "for + khoảng thời gian."),
       ("“By the way” is used to…", ["end a conversation", "introduce a new related topic", "disagree"], 1, "By the way = nhân tiện, chuyển ý.")],
      ["Bắt chuyện với thầy/cô như người địa phương, hỏi về món ăn và lễ hội.", "Giới thiệu một món ăn Việt Nam và so sánh với món nước ngoài."]),

    L("B2", "Kỹ năng", "Lên kế hoạch chuyến đi dài ngày",
      "Thảo luận lịch trình, ngân sách và lựa chọn bằng câu điều kiện và động từ khuyết thiếu.",
      """We're planning a two-week trip around Vietnam. If we fly into Hanoi, we could spend three days in the capital before heading to Ha Long Bay. Alternatively, we might start in the south and work our way north. The main issue is the budget: domestic flights are quick but pricier, whereas sleeper trains are cheaper and more scenic. Whichever route we choose, we'll need to book accommodation in Hoi An well in advance, as it gets crowded during festivals.""",
      [("head to", "đi tới, hướng về", "Then we'll head to Ha Long Bay."),
       ("alternatively", "hoặc là (phương án khác)", "Alternatively, we could take the train."),
       ("work our way north", "đi dần lên phía bắc", "We'll start in Saigon and work our way north."),
       ("pricier", "đắt hơn", "Flights are pricier than trains."),
       ("scenic", "có phong cảnh đẹp", "The train ride is very scenic."),
       ("well in advance", "rất sớm, từ trước", "Book your hotel well in advance.")],
      ("Động từ khuyết thiếu chỉ khả năng: could / might / may",
       "could/might/may + V diễn tả khả năng, lựa chọn chưa chắc chắn. Kết hợp với 'whereas' để so sánh đối lập và 'whichever' (bất cứ … nào).",
       ["We might take the night train.", "Flights are faster, whereas buses are cheaper.", "Whichever hotel you choose, book early."]),
      ("Nói câu dài với nhịp đều", "Chia cụm: 'If we fly into Hanoi, / we could spend three days / in the capital / before heading to Ha Long Bay.'", ["alternatively", "accommodation", "scenic", "advance"]),
      [("How long is the planned trip?", ["One week", "Two weeks", "One month"], 1, "'a two-week trip'."),
       ("What is the main issue?", ["Weather", "Budget", "Visas"], 1, "'The main issue is the budget'."),
       ("How are sleeper trains described?", ["Faster and pricier", "Cheaper and more scenic", "Uncomfortable"], 1, "'cheaper and more scenic'."),
       ("Why book Hoi An early?", ["It's closed in winter.", "It gets crowded during festivals.", "Prices drop later."], 1, "'as it gets crowded during festivals'."),
       ("Which word shows contrast?", ["whereas", "whichever", "alternatively"], 0, "whereas = trong khi đó (đối lập).")],
      ["Lên lịch trình 1 tuần cho người nước ngoài đến Việt Nam, giải thích lựa chọn.", "Thầy/cô có ngân sách thấp — điều chỉnh kế hoạch."]),

    L("B2", "Giao tiếp", "Khiếu nại dịch vụ và đòi bồi thường",
      "Khiếu nại chuyến bay trễ/tour kém chất lượng, lập luận và thương lượng bồi thường.",
      """Customer: I booked a tour that promised a private boat and a seafood lunch. Instead, we were put on a crowded boat with forty people, and lunch was a sandwich. Had I known this, I wouldn't have booked with you.
Manager: I'm very sorry. The private boat was unavailable due to a mechanical fault.
Customer: I understand that things go wrong, but nobody informed us. I'd expect at least a partial refund.
Manager: That's fair. We can refund fifty percent, or offer you a free tour of your choice.""",
      [("promise", "hứa hẹn, cam kết", "The website promised a private boat."),
       ("crowded", "đông đúc", "The boat was very crowded."),
       ("unavailable", "không có sẵn", "The room was unavailable."),
       ("mechanical fault", "lỗi kỹ thuật (máy móc)", "There was a mechanical fault."),
       ("inform", "thông báo", "Nobody informed us about the change."),
       ("partial refund", "hoàn tiền một phần", "I expect a partial refund.")],
      ("Đảo ngữ điều kiện: Had I known…",
       "Thay cho If I had known…, văn phong trang trọng dùng đảo ngữ: Had I known, I wouldn't have booked. Tương tự: Were I you… (= If I were you), Should you need… (= If you need).",
       ["Had I known, I would have chosen another company.", "Should you need help, please call us.", "Were it not for the delay, we'd be there now."]),
      ("Giữ giọng chắc chắn nhưng lịch sự", "Nhấn sự thật: 'NObody inFORMED us'. Lên giọng nhẹ khi đưa yêu cầu để tránh gay gắt.", ["unavailable", "mechanical", "informed", "partial"]),
      [("What did the tour promise?", ["A crowded boat", "A private boat and a seafood lunch", "A free hotel"], 1, "'promised a private boat and a seafood lunch'."),
       ("Why was the private boat unavailable?", ["Bad weather", "A mechanical fault", "Overbooking"], 1, "'due to a mechanical fault'."),
       ("What is the customer's main complaint besides the service?", ["Nobody informed them", "The guide was rude", "It was too expensive"], 0, "'nobody informed us'."),
       ("“Had I known this” means…", ["If I had known this", "I have known this", "Because I knew this"], 0, "Đảo ngữ của điều kiện loại 3."),
       ("What does the manager offer?", ["Nothing", "50% refund or a free tour", "A full refund only"], 1, "'refund fifty percent, or offer you a free tour'.")],
      ["Khiếu nại một dịch vụ du lịch kém: mô tả, lập luận, đề nghị bồi thường.", "Thầy/cô từ chối lần đầu — thương lượng tiếp."]),

    L("B2", "Từ vựng", "Du lịch bền vững và văn hóa",
      "Thảo luận tác động của du lịch, du lịch có trách nhiệm và tôn trọng văn hóa.",
      """Mass tourism can bring economic benefits to local communities, but it also puts pressure on fragile environments and can lead to overcrowding. Responsible travellers try to minimise their footprint: they choose locally owned accommodation, respect cultural customs, and avoid single-use plastics. Some destinations have introduced visitor caps, which, despite being unpopular with tour operators, have helped protect heritage sites.""",
      [("mass tourism", "du lịch đại trà", "Mass tourism damages some beaches."),
       ("fragile", "mong manh, dễ tổn thương", "Coral reefs are fragile."),
       ("overcrowding", "tình trạng quá tải", "Overcrowding is a problem in summer."),
       ("footprint", "dấu chân (tác động môi trường)", "Try to reduce your carbon footprint."),
       ("customs", "phong tục", "Respect local customs."),
       ("heritage site", "di sản", "Hoi An is a heritage site.")],
      ("Mệnh đề quan hệ không xác định và despite",
       "Mệnh đề quan hệ không xác định bổ sung thông tin, có dấu phẩy và không dùng 'that': Visitor caps, which are unpopular, help protect sites. despite + danh từ/V-ing (despite being unpopular).",
       ["Hoi An, which is a heritage site, gets crowded.", "Despite the rain, we enjoyed the tour.", "The guide, who was very friendly, spoke three languages."]),
      ("Trọng âm từ dài", "reSPONsible, enviRONment, HERitage, OVERcrowding. Từ dài nói sai trọng âm rất khó hiểu.", ["responsible", "environment", "heritage", "overcrowding"]),
      [("What is one negative effect of mass tourism?", ["More jobs", "Overcrowding", "Better roads"], 1, "'can lead to overcrowding'."),
       ("Which is a habit of responsible travellers?", ["Using single-use plastics", "Choosing locally owned accommodation", "Ignoring customs"], 1, "'choose locally owned accommodation'."),
       ("What have some destinations introduced?", ["Visitor caps", "Free entry", "More hotels"], 0, "'introduced visitor caps'."),
       ("Choose the correct sentence.", ["Despite it rained, we went.", "Despite the rain, we went.", "Despite of the rain, we went."], 1, "despite + danh từ, không có 'of'."),
       ("Choose the correct non-defining clause.", ["Hoi An, that is beautiful, is busy.", "Hoi An, which is beautiful, is busy.", "Hoi An which is beautiful, is busy."], 1, "Không dùng 'that'; có hai dấu phẩy.")],
      ["Nêu quan điểm: có nên giới hạn số khách đến một điểm du lịch nổi tiếng?", "Đề xuất 3 cách để du lịch có trách nhiệm hơn ở Việt Nam."]),
]
