import os
import json

base_dir = os.path.dirname(os.path.abspath(__file__))
courses_dir = os.path.join(base_dir, "..", "public", "courses")
os.makedirs(courses_dir, exist_ok=True)

courses_data = {
    "everyday": {
        "title": "Tiếng Anh giao tiếp hằng ngày",
        "overview": "Giáo trình giao tiếp thực tế từ làm quen, chào hỏi, gọi món, mua sắm đến trò chuyện sâu hơn trong cuộc sống.",
        "lessons": [
            {
                "id": "everyday-a1-1",
                "level": "A1",
                "unit": "Bài 1 (A1)",
                "title": "Chào hỏi và tự giới thiệu bản thân",
                "objective": "Biết cách chào hỏi lịch sự và giới thiệu tên tuổi, nghề nghiệp cơ bản.",
                "reading": "Hello! My name is Nam. I am twenty-five years old and I live in Hanoi. I am an office worker. In my free time, I like drinking coffee with my friends and listening to music. Nice to meet you!",
                "vocabulary": [
                    {"term": "Nice to meet you", "definition": "Rất vui được gặp bạn"},
                    {"term": "Office worker", "definition": "Nhân viên văn phòng"},
                    {"term": "Free time", "definition": "Thời gian rảnh rỗi"}
                ],
                "questions": [
                    {
                        "prompt": "Where does Nam live?",
                        "options": ["In Danang", "In Hanoi", "In Ho Chi Minh City"],
                        "answer": 1,
                        "explanation": "Trong bài đọc, Nam nói rõ: 'I live in Hanoi'."
                    },
                    {
                        "prompt": "What does Nam like doing in his free time?",
                        "options": ["Playing football", "Drinking coffee and listening to music", "Reading books"],
                        "answer": 1,
                        "explanation": "Nam chia sẻ: 'I like drinking coffee with my friends and listening to music'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "everyday-a2-1",
                "level": "A2",
                "unit": "Bài 2 (A2)",
                "title": "Gọi món tại nhà hàng và quán cà phê",
                "objective": "Tự tin gọi đồ ăn, thức uống và yêu cầu hóa đơn bằng tiếng Anh.",
                "reading": "Waiter: Good evening! Are you ready to order?\nCustomer: Yes, please. Could I have a grilled chicken salad and a bottle of mineral water?\nWaiter: Would you like anything for dessert?\nCustomer: Not right now, thank you. Could we also have the bill when you are ready?",
                "vocabulary": [
                    {"term": "Ready to order", "definition": "Sẵn sàng gọi món"},
                    {"term": "Grilled chicken", "definition": "Gà nướng"},
                    {"term": "Could we have the bill?", "definition": "Cho chúng tôi xin hóa đơn tính tiền nhé?"}
                ],
                "questions": [
                    {
                        "prompt": "What main dish does the customer order?",
                        "options": ["Beef steak", "Grilled chicken salad", "Seafood pasta"],
                        "answer": 1,
                        "explanation": "Khách hàng nói: 'Could I have a grilled chicken salad'."
                    },
                    {
                        "prompt": "What phrase is used to ask for the bill?",
                        "options": ["Give me money", "Could we also have the bill?", "I want to go home"],
                        "answer": 1,
                        "explanation": "Cách diễn đạt lịch sự khi thanh toán là: 'Could we also have the bill?'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "everyday-b1-1",
                "level": "B1",
                "unit": "Bài 3 (B1)",
                "title": "Chia sẻ trải nghiệm và kế hoạch cuối tuần",
                "objective": "Sử dụng thì hiện tại hoàn thành và tương lai để trao đổi về sở thích và dự định cá nhân.",
                "reading": "Lan has lived in Da Nang for three years. She enjoys the beach and the fresh air. This weekend, she is going to visit Ba Na Hills with her family if the weather is sunny. She has never been on the cable car there before, so she is very excited.",
                "vocabulary": [
                    {"term": "Cable car", "definition": "Cáp treo"},
                    {"term": "Excited", "definition": "Hào hứng, phấn khích"},
                    {"term": "Have lived for", "definition": "Đã sống được (khoảng thời gian)"}
                ],
                "questions": [
                    {
                        "prompt": "How long has Lan lived in Da Nang?",
                        "options": ["For three months", "For three years", "Since last week"],
                        "answer": 1,
                        "explanation": "Bài đọc ghi: 'Lan has lived in Da Nang for three years'."
                    },
                    {
                        "prompt": "Has Lan ever taken the cable car before?",
                        "options": ["Yes, many times", "No, she has never been on it", "She doesn't know"],
                        "answer": 1,
                        "explanation": "'She has never been on the cable car there before'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "everyday-b2-1",
                "level": "B2",
                "unit": "Bài 4 (B2)",
                "title": "Bày tỏ quan điểm và giải quyết bất đồng",
                "objective": "Học cách thảo luận vấn đề xã hội hoặc gia đình một cách lịch sự, thuyết phục.",
                "reading": "When discussing different viewpoints, it is essential to listen actively before defending your position. Using phrases such as 'I understand your perspective, however...' helps maintain mutual respect and prevents unnecessary conflict.",
                "vocabulary": [
                    {"term": "Active listening", "definition": "Lắng nghe chủ động"},
                    {"term": "Perspective", "definition": "Góc nhìn, quan điểm"},
                    {"term": "Mutual respect", "definition": "Sự tôn trọng lẫn nhau"}
                ],
                "questions": [
                    {
                        "prompt": "What is recommended before defending your position?",
                        "options": ["Interrupt immediately", "Listen actively", "Change the subject"],
                        "answer": 1,
                        "explanation": "Tác giả khuyên: 'it is essential to listen actively before defending your position'."
                    },
                    {
                        "prompt": "Why should you use polite transition phrases?",
                        "options": ["To confuse the listener", "To maintain mutual respect and prevent conflict", "To speak faster"],
                        "answer": 1,
                        "explanation": "Cụm từ này giúp 'maintain mutual respect and prevents unnecessary conflict'."
                    }
                ],
                "audioIds": []
            }
        ]
    },
    "business": {
        "title": "Tiếng Anh công sở",
        "overview": "Giáo trình giao tiếp chuyên nghiệp: viết email, tham gia cuộc họp, đàm phán hợp đồng và báo cáo công việc.",
        "lessons": [
            {
                "id": "business-a1-1",
                "level": "A1",
                "unit": "Bài 1 (A1)",
                "title": "Gặp gỡ đồng nghiệp và khách hàng",
                "objective": "Chào hỏi chuyên nghiệp trong môi trường văn phòng và trao đổi danh thiếp.",
                "reading": "Good morning. I am David from the Marketing Department. Here is my business card. Let me know if you need any assistance regarding our new campaign.",
                "vocabulary": [
                    {"term": "Department", "definition": "Phòng ban"},
                    {"term": "Business card", "definition": "Danh thiếp"},
                    {"term": "Assistance", "definition": "Sự hỗ trợ"}
                ],
                "questions": [
                    {
                        "prompt": "Which department does David work in?",
                        "options": ["Human Resources", "Marketing", "Accounting"],
                        "answer": 1,
                        "explanation": "David nói: 'I am David from the Marketing Department'."
                    },
                    {
                        "prompt": "What does David give to the listener?",
                        "options": ["A report", "His business card", "A contract"],
                        "answer": 1,
                        "explanation": "David nói: 'Here is my business card'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "business-a2-1",
                "level": "A2",
                "unit": "Bài 2 (A2)",
                "title": "Viết email xác nhận cuộc họp",
                "objective": "Soạn email ngắn gọn xác nhận thời gian, địa điểm và nội dung cuộc họp.",
                "reading": "Dear Mr. Smith,\nThank you for your prompt response. I would like to confirm our meeting on Thursday at 2:00 PM in Conference Room B. Please find the attached agenda for your review.\nBest regards,\nHa Nguyen",
                "vocabulary": [
                    {"term": "Prompt response", "definition": "Phản hồi nhanh chóng"},
                    {"term": "Confirm", "definition": "Xác nhận"},
                    {"term": "Attached agenda", "definition": "Chương trình họp đính kèm"}
                ],
                "questions": [
                    {
                        "prompt": "When is the meeting scheduled?",
                        "options": ["Friday at 10 AM", "Thursday at 2:00 PM", "Monday at 2:00 PM"],
                        "answer": 1,
                        "explanation": "Email nêu rõ: 'on Thursday at 2:00 PM'."
                    },
                    {
                        "prompt": "Where will the meeting take place?",
                        "options": ["Room A", "Conference Room B", "Online only"],
                        "answer": 1,
                        "explanation": "Địa điểm là: 'in Conference Room B'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "business-b1-1",
                "level": "B1",
                "unit": "Bài 3 (B1)",
                "title": "Báo cáo tiến độ dự án và giải quyết trở ngại",
                "objective": "Trình bày các mốc dự án đã hoàn thành, sự cố phát sinh và hướng xử lý.",
                "reading": "During the weekly review, the project lead announced that the team has completed phase one ahead of schedule. However, supplier delays might affect phase two unless alternate vendors are secured by Friday.",
                "vocabulary": [
                    {"term": "Ahead of schedule", "definition": "Trước tiến độ dự kiến"},
                    {"term": "Supplier delay", "definition": "Chậm trễ từ nhà cung cấp"},
                    {"term": "Alternate vendors", "definition": "Các nhà cung ứng thay thế"}
                ],
                "questions": [
                    {
                        "prompt": "What is the status of phase one?",
                        "options": ["Delayed by two weeks", "Completed ahead of schedule", "Cancelled"],
                        "answer": 1,
                        "explanation": "Dự án: 'completed phase one ahead of schedule'."
                    },
                    {
                        "prompt": "What could affect phase two?",
                        "options": ["Supplier delays", "Lack of staff", "Budget cuts"],
                        "answer": 0,
                        "explanation": "Nguyên nhân rủi ro: 'supplier delays might affect phase two'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "business-b2-1",
                "level": "B2",
                "unit": "Bài 4 (B2)",
                "title": "Đàm phán hợp đồng và điều khoản thanh toán",
                "objective": "Thương lượng giá cả, điều khoản chiết khấu và quyền lợi đôi bên.",
                "reading": "We appreciate your proposed terms; nevertheless, our company requires a minimum 10% volume discount for orders exceeding ten thousand units, alongside net-60 payment terms to accommodate cash flow requirements.",
                "vocabulary": [
                    {"term": "Volume discount", "definition": "Chiết khấu theo số lượng lớn"},
                    {"term": "Payment terms", "definition": "Điều khoản thanh toán"},
                    {"term": "Cash flow", "definition": "Dòng tiền"}
                ],
                "questions": [
                    {
                        "prompt": "What discount rate is requested?",
                        "options": ["5%", "At least 10%", "20%"],
                        "answer": 1,
                        "explanation": "Bên mua yêu cầu: 'a minimum 10% volume discount'."
                    },
                    {
                        "prompt": "Why are net-60 payment terms needed?",
                        "options": ["To delay indefinitely", "To accommodate cash flow requirements", "To cancel the contract"],
                        "answer": 1,
                        "explanation": "Mục đích là: 'to accommodate cash flow requirements'."
                    }
                ],
                "audioIds": []
            }
        ]
    },
    "technology": {
        "title": "Tiếng Anh ngành công nghệ",
        "overview": "Thuật ngữ chuyên ngành IT, họp Scrum/Agile, thảo luận kiến trúc hệ thống, code review và xử lý lỗi.",
        "lessons": [
            {
                "id": "tech-a1-1",
                "level": "A1",
                "unit": "Bài 1 (A1)",
                "title": "Báo cáo sự cố phần cứng và phần mềm cơ bản",
                "objective": "Mô tả trạng thái thiết bị và phần mềm hoạt động hay gặp lỗi.",
                "reading": "The monitor is not turning on. I checked the power cable and the connection is tight. Could IT support look at this computer?",
                "vocabulary": [
                    {"term": "Monitor", "definition": "Màn hình máy tính"},
                    {"term": "Power cable", "definition": "Dây nguồn"},
                    {"term": "IT support", "definition": "Bộ phận hỗ trợ kỹ thuật"}
                ],
                "questions": [
                    {
                        "prompt": "What is the problem?",
                        "options": ["The keyboard is broken", "The monitor is not turning on", "The internet is slow"],
                        "answer": 1,
                        "explanation": "Đoạn văn nêu: 'The monitor is not turning on'."
                    },
                    {
                        "prompt": "What did the user already check?",
                        "options": ["The power cable", "The mouse", "The sound"],
                        "answer": 0,
                        "explanation": "Người dùng đã: 'checked the power cable'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "tech-a2-1",
                "level": "A2",
                "unit": "Bài 2 (A2)",
                "title": "Họp cập nhật tiến độ (Daily Stand-up)",
                "objective": "Báo cáo những việc đã làm hôm qua, kế hoạch hôm nay và các điểm tắc nghẽn (blockers).",
                "reading": "Yesterday, I fixed the user login bug on the mobile app. Today, I am going to write unit tests for the payment module. I currently have no blockers.",
                "vocabulary": [
                    {"term": "Bug", "definition": "Lỗi phần mềm"},
                    {"term": "Unit test", "definition": "Kiểm thử đơn vị"},
                    {"term": "Blocker", "definition": "Rào cản / trở ngại công việc"}
                ],
                "questions": [
                    {
                        "prompt": "What did the developer finish yesterday?",
                        "options": ["The login bug", "The database redesign", "The marketing slide"],
                        "answer": 0,
                        "explanation": "'Yesterday, I fixed the user login bug on the mobile app'."
                    },
                    {
                        "prompt": "Are there any blockers?",
                        "options": ["Yes, the server is down", "No blockers", "Waiting for client approval"],
                        "answer": 1,
                        "explanation": "Lập trình viên nói rõ: 'I currently have no blockers'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "tech-b1-1",
                "level": "B1",
                "unit": "Bài 3 (B1)",
                "title": "Thảo luận Code Review và Tối ưu hiệu năng",
                "objective": "Đưa ra nhận xét phản biện mang tính xây dựng trên pull request.",
                "reading": "Please review pull request #142. We noticed that fetching all user records in a single database query causes high memory consumption. Let's implement pagination and indexing on the created_at column.",
                "vocabulary": [
                    {"term": "Memory consumption", "definition": "Mức tiêu thụ bộ nhớ RAM"},
                    {"term": "Pagination", "definition": "Phân trang dữ liệu"},
                    {"term": "Indexing", "definition": "Đánh chỉ mục cơ sở dữ liệu"}
                ],
                "questions": [
                    {
                        "prompt": "What issue was identified in pull request #142?",
                        "options": ["High memory consumption", "Syntax error", "Missing password"],
                        "answer": 0,
                        "explanation": "Vấn đề là: 'causes high memory consumption'."
                    },
                    {
                        "prompt": "What solution is suggested?",
                        "options": ["Delete the database", "Implement pagination and indexing", "Restart the server"],
                        "answer": 1,
                        "explanation": "Giải pháp: 'Let's implement pagination and indexing'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "tech-b2-1",
                "level": "B2",
                "unit": "Bài 4 (B2)",
                "title": "Kiến trúc hệ thống và Khả năng chịu tải (Scalability)",
                "objective": "Phân tích kiến trúc vi dịch vụ (Microservices), cơ chế cân bằng tải và tính sẵn sàng cao.",
                "reading": "To guarantee high availability and fault tolerance, the engineering team decided to decouple the monolithic service into event-driven microservices utilizing Kafka message queues and containerized deployments with Kubernetes.",
                "vocabulary": [
                    {"term": "High availability", "definition": "Tính sẵn sàng cao của hệ thống"},
                    {"term": "Decouple", "definition": "Tách rời các thành phần liên kết"},
                    {"term": "Message queue", "definition": "Hàng đợi tin nhắn"}
                ],
                "questions": [
                    {
                        "prompt": "Why was the monolithic service decoupled?",
                        "options": ["To lower internet speed", "To guarantee high availability and fault tolerance", "To reduce code readability"],
                        "answer": 1,
                        "explanation": "Mục đích là: 'To guarantee high availability and fault tolerance'."
                    },
                    {
                        "prompt": "What technology is utilized for message queues?",
                        "options": ["Kafka", "FTP", "Bluetooth"],
                        "answer": 0,
                        "explanation": "Bài đọc ghi rõ: 'utilizing Kafka message queues'."
                    }
                ],
                "audioIds": []
            }
        ]
    },
    "travel": {
        "title": "Tiếng Anh du lịch",
        "overview": "Các tình huống thiết yếu khi đi du lịch nước ngoài: sân bay, khách sạn, nhà hàng, hỏi đường và mua sắm.",
        "lessons": [
            {
                "id": "travel-a1-1",
                "level": "A1",
                "unit": "Bài 1 (A1)",
                "title": "Làm thủ tục nhận phòng khách sạn",
                "objective": "Biết cách xuất trình hộ chiếu, xác nhận đặt phòng và hỏi về giờ bữa sáng.",
                "reading": "Receptionist: Welcome to Sunset Hotel! How can I help you?\nGuest: Hello, I have a reservation under the name of Nguyen. Here is my passport.\nReceptionist: Thank you. Your room is 402 on the fourth floor. Breakfast is served from 6:30 to 9:30 AM in the main dining hall.",
                "vocabulary": [
                    {"term": "Reservation", "definition": "Đặt chỗ / Đặt phòng trước"},
                    {"term": "Passport", "definition": "Hộ chiếu"},
                    {"term": "Served", "definition": "Được phục vụ"}
                ],
                "questions": [
                    {
                        "prompt": "What is the guest's room number?",
                        "options": ["Room 204", "Room 402", "Room 301"],
                        "answer": 1,
                        "explanation": "Lễ tân thông báo: 'Your room is 402'."
                    },
                    {
                        "prompt": "When is breakfast available?",
                        "options": ["7:00 to 11:00 AM", "6:30 to 9:30 AM", "All day"],
                        "answer": 1,
                        "explanation": "'Breakfast is served from 6:30 to 9:30 AM'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "travel-a2-1",
                "level": "A2",
                "unit": "Bài 2 (A2)",
                "title": "Hỏi đường và di chuyển bằng phương tiện công cộng",
                "objective": "Hỏi đường đến ga tàu, bến xe buýt và mua vé di chuyển.",
                "reading": "Tourist: Excuse me, could you tell me how to get to the central train station?\nLocal: Sure. Walk straight down this avenue for two blocks, then turn left at the traffic lights. The station entrance will be directly on your right.",
                "vocabulary": [
                    {"term": "Excuse me", "definition": "Xin lỗi cho tôi hỏi..."},
                    {"term": "Avenue", "definition": "Đại lộ / con đường lớn"},
                    {"term": "Traffic lights", "definition": "Đèn giao thông"}
                ],
                "questions": [
                    {
                        "prompt": "Where does the tourist want to go?",
                        "options": ["To the airport", "To the central train station", "To a museum"],
                        "answer": 1,
                        "explanation": "Khách hỏi: 'how to get to the central train station?'."
                    },
                    {
                        "prompt": "Where should the tourist turn left?",
                        "options": ["At the bridge", "At the traffic lights", "At the hospital"],
                        "answer": 1,
                        "explanation": "Chỉ dẫn: 'turn left at the traffic lights'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "travel-b1-1",
                "level": "B1",
                "unit": "Bài 3 (B1)",
                "title": "Xử lý sự cố hành lý và thủ tục hải quan tại sân bay",
                "objective": "Khai báo hành lý thất lạc hoặc chuyến bay bị hoãn hủy.",
                "reading": "Upon arrival at Heathrow, my checked baggage did not appear on carousel 4. I immediately reported to the Lost and Found counter, where the officer provided a property irregularity report and promised delivery within 24 hours.",
                "vocabulary": [
                    {"term": "Checked baggage", "definition": "Hành lý ký gửi"},
                    {"term": "Baggage carousel", "definition": "Băng chuyền hành lý"},
                    {"term": "Lost and Found", "definition": "Quầy tìm kiếm đồ thất lạc"}
                ],
                "questions": [
                    {
                        "prompt": "What happened to the passenger's baggage?",
                        "options": ["It was damaged", "It did not appear on the carousel", "It was stolen at the hotel"],
                        "answer": 1,
                        "explanation": "Hành khách cho biết: 'my checked baggage did not appear on carousel 4'."
                    },
                    {
                        "prompt": "When did the officer promise delivery?",
                        "options": ["Within 24 hours", "Next week", "In one month"],
                        "answer": 0,
                        "explanation": "Họ cam kết: 'promised delivery within 24 hours'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "travel-b2-1",
                "level": "B2",
                "unit": "Bài 4 (B2)",
                "title": "Du lịch bền vững và Trải nghiệm văn hóa bản địa",
                "objective": "Thảo luận về bảo tồn văn hóa, du lịch sinh thái và tôn trọng phong tục địa phương.",
                "reading": "Responsible travel extends beyond sightseeing; it involves respecting indigenous traditions, minimizing single-use plastic waste, and patronizing locally owned enterprises to ensure sustainable economic benefits for host communities.",
                "vocabulary": [
                    {"term": "Responsible travel", "definition": "Du lịch có trách nhiệm"},
                    {"term": "Indigenous traditions", "definition": "Truyền thống bản địa"},
                    {"term": "Sustainable", "definition": "Bền vững"}
                ],
                "questions": [
                    {
                        "prompt": "What is one core aspect of responsible travel?",
                        "options": ["Taking only photos", "Patronizing locally owned enterprises", "Avoiding conversations with locals"],
                        "answer": 1,
                        "explanation": "Bài đọc nhấn mạnh: 'patronizing locally owned enterprises'."
                    },
                    {
                        "prompt": "Why should travelers support local businesses?",
                        "options": ["To ensure sustainable economic benefits for host communities", "To get free souvenirs", "To shorten the trip"],
                        "answer": 0,
                        "explanation": "Mục đích: 'to ensure sustainable economic benefits for host communities'."
                    }
                ],
                "audioIds": []
            }
        ]
    },
    "healthcare": {
        "title": "Tiếng Anh chuyên ngành y khoa",
        "overview": "Tiếng Anh giao tiếp trong bệnh viện, thăm khám lâm sàng, hỏi triệu chứng, giải thích toa thuốc và chăm sóc bệnh nhân.",
        "lessons": [
            {
                "id": "health-a1-1",
                "level": "A1",
                "unit": "Bài 1 (A1)",
                "title": "Hỏi thăm triệu chứng cơ bản của bệnh nhân",
                "objective": "Học cách hỏi vị trí đau và các dấu hiệu sốt, ho, mệt mỏi.",
                "reading": "Doctor: Good morning. What brings you to the clinic today?\nPatient: Doctor, I have a sore throat and a mild headache since yesterday morning.\nDoctor: Let me check your temperature and listen to your breathing.",
                "vocabulary": [
                    {"term": "Sore throat", "definition": "Đau họng / viêm họng"},
                    {"term": "Headache", "definition": "Đau đầu"},
                    {"term": "Temperature", "definition": "Nhiệt độ cơ thể / thân nhiệt"}
                ],
                "questions": [
                    {
                        "prompt": "What symptoms does the patient describe?",
                        "options": ["Stomach ache", "Sore throat and mild headache", "Sprained ankle"],
                        "answer": 1,
                        "explanation": "Bệnh nhân nói: 'I have a sore throat and a mild headache'."
                    },
                    {
                        "prompt": "When did the symptoms begin?",
                        "options": ["Yesterday morning", "Last week", "One hour ago"],
                        "answer": 0,
                        "explanation": "Thời gian: 'since yesterday morning'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "health-a2-1",
                "level": "A2",
                "unit": "Bài 2 (A2)",
                "title": "Hướng dẫn sử dụng thuốc an toàn",
                "objective": "Giải thích liều lượng, thời điểm uống thuốc và cách bảo quản.",
                "reading": "Pharmacist: Take one tablet twice daily after meals with a full glass of water. Do not consume alcohol while taking this medication. Store the bottle in a cool, dry place away from direct sunlight.",
                "vocabulary": [
                    {"term": "Tablet", "definition": "Viên thuốc"},
                    {"term": "Twice daily", "definition": "Hai lần mỗi ngày"},
                    {"term": "Consume alcohol", "definition": "Uống bia rượu"}
                ],
                "questions": [
                    {
                        "prompt": "How often should the patient take the tablet?",
                        "options": ["Once a week", "Twice daily after meals", "Every hour"],
                        "answer": 1,
                        "explanation": "Dược sĩ dặn: 'Take one tablet twice daily after meals'."
                    },
                    {
                        "prompt": "What should the patient avoid?",
                        "options": ["Drinking water", "Consuming alcohol", "Sleeping"],
                        "answer": 1,
                        "explanation": "Lưu ý kiêng cữ: 'Do not consume alcohol while taking this medication'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "health-b1-1",
                "level": "B1",
                "unit": "Bài 3 (B1)",
                "title": "Khai thác tiền sử bệnh và dị ứng (Medical History)",
                "objective": "Thu thập thông tin tiền sử dị ứng thuốc, bệnh mãn tính và phẫu thuật.",
                "reading": "Before initiating intravenous antibiotic therapy, the nurse must verify whether the patient has any known drug allergies, particularly to penicillin or cephalosporins, and record their baseline blood pressure.",
                "vocabulary": [
                    {"term": "Drug allergies", "definition": "Dị ứng thuốc"},
                    {"term": "Antibiotic therapy", "definition": "Liệu trình kháng sinh"},
                    {"term": "Blood pressure", "definition": "Huyết áp"}
                ],
                "questions": [
                    {
                        "prompt": "What must the nurse check before giving antibiotics?",
                        "options": ["The patient's shoe size", "Any known drug allergies", "The room temperature"],
                        "answer": 1,
                        "explanation": "Quy trình: 'must verify whether the patient has any known drug allergies'."
                    },
                    {
                        "prompt": "Which specific antibiotic family is mentioned?",
                        "options": ["Penicillin", "Vitamins", "Aspirin"],
                        "answer": 0,
                        "explanation": "Đoạn văn nêu: 'particularly to penicillin or cephalosporins'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "health-b2-1",
                "level": "B2",
                "unit": "Bài 4 (B2)",
                "title": "Giải thích phác đồ điều trị và Sự đồng thuận (Informed Consent)",
                "objective": "Trình bày rủi ro, lợi ích của thủ thuật ngoại khoa và quyền của bệnh nhân.",
                "reading": "Informed consent requires a comprehensive discussion regarding the surgical procedure, potential risks such as infection or hemorrhage, therapeutic alternatives, and postoperative rehabilitation expectations so the patient can make an autonomous decision.",
                "vocabulary": [
                    {"term": "Informed consent", "definition": "Sự đồng thuận sau khi được giải thích rõ"},
                    {"term": "Potential risks", "definition": "Các nguy cơ tiềm ẩn"},
                    {"term": "Postoperative rehabilitation", "definition": "Phục hồi chức năng sau mổ"}
                ],
                "questions": [
                    {
                        "prompt": "What is the primary purpose of informed consent?",
                        "options": ["To rush the patient into surgery", "To allow the patient to make an autonomous informed decision", "To reduce nurse workload"],
                        "answer": 1,
                        "explanation": "Mục đích là: 'so the patient can make an autonomous decision'."
                    },
                    {
                        "prompt": "Which risks are specifically identified?",
                        "options": ["Infection or hemorrhage", "Hunger and thirst", "Poor weather"],
                        "answer": 0,
                        "explanation": "Các nguy cơ: 'potential risks such as infection or hemorrhage'."
                    }
                ],
                "audioIds": []
            }
        ]
    },
    "finance": {
        "title": "Tiếng Anh ngành tài chính",
        "overview": "Báo cáo tài chính, thuật ngữ ngân hàng, phân tích đầu tư, quản trị rủi ro và dự toán ngân sách.",
        "lessons": [
            {
                "id": "fin-a1-1",
                "level": "A1",
                "unit": "Bài 1 (A1)",
                "title": "Giao dịch ngân hàng cơ bản",
                "objective": "Mở tài khoản, nạp rút tiền và hỏi số dư tài khoản.",
                "reading": "Teller: Good afternoon. How can I assist you?\nCustomer: Hello, I would like to deposit two hundred dollars into my checking account, please.\nTeller: Certainly. Please sign the deposit slip here.",
                "vocabulary": [
                    {"term": "Deposit", "definition": "Gửi tiền vào tài khoản"},
                    {"term": "Checking account", "definition": "Tài khoản thanh toán / vãng lai"},
                    {"term": "Deposit slip", "definition": "Phiếu nộp tiền"}
                ],
                "questions": [
                    {
                        "prompt": "How much does the customer want to deposit?",
                        "options": ["One hundred dollars", "Two hundred dollars", "Five hundred dollars"],
                        "answer": 1,
                        "explanation": "Khách hàng nói: 'deposit two hundred dollars'."
                    },
                    {
                        "prompt": "Where should the customer sign?",
                        "options": ["On the deposit slip", "On the passport", "Nowhere"],
                        "answer": 0,
                        "explanation": "Giao dịch viên hướng dẫn: 'Please sign the deposit slip here'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "fin-a2-1",
                "level": "A2",
                "unit": "Bài 2 (A2)",
                "title": "Theo dõi chi phí và Lập ngân sách tháng",
                "objective": "Phân loại chi phí cố định, chi phí biến đổi và đối chiếu số liệu.",
                "reading": "Our monthly operating expenses rose by five percent in October. Rent and utilities remained stable, but travel costs and advertising expenditures increased substantially.",
                "vocabulary": [
                    {"term": "Operating expenses", "definition": "Chi phí hoạt động"},
                    {"term": "Utilities", "definition": "Tiền điện nước, tiện ích"},
                    {"term": "Expenditures", "definition": "Khoản chi tiêu"}
                ],
                "questions": [
                    {
                        "prompt": "By how much did operating expenses increase?",
                        "options": ["2%", "5%", "15%"],
                        "answer": 1,
                        "explanation": "Báo cáo nêu: 'rose by five percent in October'."
                    },
                    {
                        "prompt": "Which expenses remained stable?",
                        "options": ["Advertising and flights", "Rent and utilities", "Staff bonuses"],
                        "answer": 1,
                        "explanation": "'Rent and utilities remained stable'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "fin-b1-1",
                "level": "B1",
                "unit": "Bài 3 (B1)",
                "title": "Phân tích Báo cáo kết quả kinh doanh (P&L Analysis)",
                "objective": "Trình bày doanh thu thuần, giá vốn hàng bán và lợi nhuận gộp.",
                "reading": "Despite inflationary headwinds, net revenue reached twelve million dollars, yielding a gross profit margin of thirty-five percent. Cost reduction measures in supply chain logistics contributed significantly to bottom-line profitability.",
                "vocabulary": [
                    {"term": "Gross profit margin", "definition": "Biên lợi nhuận gộp"},
                    {"term": "Net revenue", "definition": "Doanh thu thuần"},
                    {"term": "Profitability", "definition": "Khả năng sinh lời"}
                ],
                "questions": [
                    {
                        "prompt": "What was the gross profit margin?",
                        "options": ["12%", "35%", "50%"],
                        "answer": 1,
                        "explanation": "Số liệu: 'yielding a gross profit margin of thirty-five percent'."
                    },
                    {
                        "prompt": "What contributed to bottom-line profitability?",
                        "options": ["Cost reduction in logistics", "Raising employee salaries", "Borrowing bank loans"],
                        "answer": 0,
                        "explanation": "'Cost reduction measures in supply chain logistics contributed significantly'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "fin-b2-1",
                "level": "B2",
                "unit": "Bài 4 (B2)",
                "title": "Chiến lược Quản trị rủi ro danh mục và Thị trường vốn",
                "objective": "Thảo luận về đa dạng hóa danh mục đầu tư, phái sinh tài chính và bảo hiểm rủi ro (hedging).",
                "reading": "In response to heightened currency volatility, institutional investors employ foreign exchange forward contracts and interest rate swaps to hedge against downside valuation risks across international emerging market portfolios.",
                "vocabulary": [
                    {"term": "Currency volatility", "definition": "Biến động tỷ giá hối đoái"},
                    {"term": "Hedge", "definition": "Phòng hộ / Bảo hiểm rủi ro"},
                    {"term": "Portfolio", "definition": "Danh mục đầu tư"}
                ],
                "questions": [
                    {
                        "prompt": "Why do investors employ forward contracts and swaps?",
                        "options": ["To hedge against downside valuation risks", "To speculate on lottery tickets", "To eliminate all taxes"],
                        "answer": 0,
                        "explanation": "Mục đích: 'to hedge against downside valuation risks'."
                    },
                    {
                        "prompt": "What market condition prompted this strategy?",
                        "options": ["Zero inflation", "Heightened currency volatility", "Low interest rates"],
                        "answer": 1,
                        "explanation": "Nguyên nhân: 'In response to heightened currency volatility'."
                    }
                ],
                "audioIds": []
            }
        ]
    },
    "refrigeration": {
        "title": "Tiếng Anh kỹ thuật lạnh",
        "overview": "Từ vựng chuyên ngành điện lạnh: nguyên lý chu trình lạnh, máy nén, môi chất, bảo trì hệ thống HVAC và an toàn lao động.",
        "lessons": [
            {
                "id": "ref-a1-1",
                "level": "A1",
                "unit": "Bài 1 (A1)",
                "title": "Các bộ phận chính của hệ thống làm lạnh",
                "objective": "Gọi tên 4 bộ phận cốt lõi: máy nén, dàn ngưng, van tiết lưu, dàn bay hơi.",
                "reading": "A basic refrigeration system consists of four main components: the compressor, the condenser, the expansion valve, and the evaporator. The compressor pumps refrigerant vapor through the closed circuit.",
                "vocabulary": [
                    {"term": "Compressor", "definition": "Máy nén"},
                    {"term": "Condenser", "definition": "Dàn ngưng tụ (dàn nóng)"},
                    {"term": "Evaporator", "definition": "Dàn bay hơi (dàn lạnh)"},
                    {"term": "Refrigerant", "definition": "Môi chất lạnh (gas lạnh)"}
                ],
                "questions": [
                    {
                        "prompt": "How many main components make up a basic refrigeration system?",
                        "options": ["Two", "Three", "Four"],
                        "answer": 2,
                        "explanation": "Đoạn văn nêu: 'consists of four main components'."
                    },
                    {
                        "prompt": "What does the compressor pump?",
                        "options": ["Water only", "Refrigerant vapor", "Air"],
                        "answer": 1,
                        "explanation": "'The compressor pumps refrigerant vapor through the closed circuit'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "ref-a2-1",
                "level": "A2",
                "unit": "Bài 2 (A2)",
                "title": "Kiểm tra áp suất và Phát hiện rò rỉ gas",
                "objective": "Sử dụng đồng hồ đo áp suất (manifold gauge) và xử lý xì gas lạnh.",
                "reading": "Connect the manifold gauge set to the service ports. If the suction pressure drops below normal operating thresholds, inspect the pipe joints with an electronic leak detector or soapy water solution to identify refrigerant leaks.",
                "vocabulary": [
                    {"term": "Manifold gauge", "definition": "Đồng hồ đo áp suất chuyên dụng"},
                    {"term": "Suction pressure", "definition": "Áp suất hút (phía áp thấp)"},
                    {"term": "Leak detector", "definition": "Thiết bị dò rò rỉ gas"}
                ],
                "questions": [
                    {
                        "prompt": "What tool is connected to the service ports?",
                        "options": ["A thermometer", "A manifold gauge set", "A screwdriver"],
                        "answer": 1,
                        "explanation": "Chỉ dẫn: 'Connect the manifold gauge set to the service ports'."
                    },
                    {
                        "prompt": "What indicates a possible refrigerant leak?",
                        "options": ["Suction pressure dropping below normal", "The pipe gets warm", "The display lights up"],
                        "answer": 0,
                        "explanation": "'If the suction pressure drops below normal operating thresholds'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "ref-b1-1",
                "level": "B1",
                "unit": "Bài 3 (B1)",
                "title": "Bảo dưỡng định kỳ và Xử lý sự cố đóng tuyết dàn lạnh",
                "objective": "Phân tích nguyên nhân dàn lạnh bị đóng băng, kiểm tra quạt và chu trình xả đá (defrost).",
                "reading": "Excessive frost buildup on the evaporator coils indicates restricted airflow, defective defrost heaters, or faulty fan motors. Technicians should verify that the defrost timer and bimetal thermostat cycle correctly before recharging refrigerant.",
                "vocabulary": [
                    {"term": "Frost buildup", "definition": "Tích tụ tuyết / bám đá"},
                    {"term": "Defrost heater", "definition": "Điện trở xả đá"},
                    {"term": "Airflow", "definition": "Lưu lượng luồng không khí"}
                ],
                "questions": [
                    {
                        "prompt": "What can cause excessive frost on the evaporator?",
                        "options": ["Restricted airflow or defective defrost heaters", "Too much room lighting", "Clean filters"],
                        "answer": 0,
                        "explanation": "'indicates restricted airflow, defective defrost heaters, or faulty fan motors'."
                    },
                    {
                        "prompt": "What component controls the defrost cycle schedule?",
                        "options": ["The defrost timer", "The water tap", "The expansion tube"],
                        "answer": 0,
                        "explanation": "Kỹ thuật viên cần: 'verify that the defrost timer... cycle correctly'."
                    }
                ],
                "audioIds": []
            },
            {
                "id": "ref-b2-1",
                "level": "B2",
                "unit": "Bài 4 (B2)",
                "title": "Quy định An toàn Môi chất Lạnh & Tiêu chuẩn Xanh (Eco-friendly Refrigerants)",
                "objective": "Hiểu về GWP (Global Warming Potential), ODP (Ozone Depletion Potential) và thu hồi môi chất an toàn.",
                "reading": "International environmental protocols mandate the phase-out of high-GWP hydrofluorocarbons (HFCs) in favor of natural refrigerants such as ammonia (R-717), carbon dioxide (R-744), and propane (R-290), demanding stringent recovery procedures and specialized flammability safety training.",
                "vocabulary": [
                    {"term": "Phase-out", "definition": "Lộ trình loại bỏ dần"},
                    {"term": "Global Warming Potential (GWP)", "definition": "Chỉ số làm nóng lên toàn cầu"},
                    {"term": "Recovery procedure", "definition": "Quy trình thu hồi gas thải"}
                ],
                "questions": [
                    {
                        "prompt": "Why are high-GWP refrigerants being phased out?",
                        "options": ["To lower machine weight", "To comply with international environmental protection protocols", "Because they are too cheap"],
                        "answer": 1,
                        "explanation": "Quy định: 'International environmental protocols mandate the phase-out'."
                    },
                    {
                        "prompt": "Which natural refrigerant is classified as R-744?",
                        "options": ["Ammonia", "Carbon dioxide (CO2)", "Propane"],
                        "answer": 1,
                        "explanation": "'carbon dioxide (R-744)'."
                    }
                ],
                "audioIds": []
            }
        ]
    }
}

for course_id, data in courses_data.items():
    package = {
        "id": course_id,
        "title": data["title"],
        "version": "1.0.0",
        "framework": "CEFR A1–B2",
        "overview": data["overview"],
        "contentLicense": "CC-BY-4.0 / Teacher AI Curated Curriculum",
        "references": [
            {
                "title": f"Teacher AI Official Curriculum - {data['title']}",
                "url": "https://github.com/vuhuynh2035-alt/lingua-english-coach",
                "license": "CC-BY-4.0"
            }
        ],
        "lessons": data["lessons"],
        "audio": []
    }
    file_path = os.path.join(courses_dir, f"{course_id}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(package, f, ensure_ascii=False, indent=2)
    print(f"Generated {file_path} ({len(data['lessons'])} lessons)")
