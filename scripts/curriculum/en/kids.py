"""English course for children (about 5-11 years old): 16 short lessons, CEFR A1-A2.

Run: python scripts/curriculum/en/kids.py     (writes public/courses/en/kids.json)
Every lesson is a short talk between two or three speakers, so each turn is one tappable line with its Vietnamese
translation (the tap-a-sentence helper). Parents or teachers can read the Vietnamese notes aloud with the child.
"""
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from apply_dialogue import CURRICULUM_VERSION, lines_of  # noqa: E402

ROOT = Path(__file__).resolve().parents[3]
REFERENCES = [
    {"title": "Council of Europe – Common European Framework of Reference for Languages (CEFR)", "url": "https://www.coe.int/en/web/common-european-framework-reference-languages", "license": "Khung trình độ tham chiếu (chỉ dùng làm chuẩn phân cấp, không sao chép nội dung)"},
    {"title": "Cambridge English Young Learners (Starters / Movers) – danh mục chủ đề", "url": "https://www.cambridgeenglish.org/exams-and-tests/young-learners-english/", "license": "Tham khảo chủ đề và mức độ cho trẻ em (không sao chép nội dung)"},
]


def K(level, category, title, objective, turns, vocab, grammar, pron, tasks, questions):
    return dict(level=level, category=category, title=title, objective=objective, turns=turns,
                vocab=vocab, grammar=grammar, pron=pron, tasks=tasks, questions=questions)


KIDS = [
    K("A1", "Giao tiếp", "Xin chào và tạm biệt", "Chào hỏi, nói tên mình và tạm biệt bằng tiếng Anh.",
      [("Teacher", "Hello, class!", "Xin chào cả lớp!"),
       ("Mia", "Hello, teacher! My name is Mia.", "Em chào cô! Tên em là Mia."),
       ("Teacher", "Nice to meet you, Mia.", "Cô rất vui được gặp em, Mia."),
       ("Tom", "Hi, Mia! I am Tom.", "Chào Mia! Tớ là Tom."),
       ("Mia", "Hi, Tom! How are you?", "Chào Tom! Bạn khỏe không?"),
       ("Tom", "I am fine, thank you.", "Tớ khỏe, cảm ơn bạn."),
       ("Mia", "Goodbye, Tom! See you tomorrow.", "Tạm biệt Tom! Mai gặp lại nhé.")],
      [("hello", "xin chào", "Hello, Mia!"), ("goodbye", "tạm biệt", "Goodbye, teacher!"),
       ("name", "tên", "My name is Tom."), ("fine", "khỏe, ổn", "I am fine, thank you."),
       ("thank you", "cảm ơn", "Thank you, Mum."), ("friend", "bạn bè", "Tom is my friend.")],
      ("My name is… / I am…", "Để nói tên mình: My name is Mia hoặc I am Mia. Hỏi tên bạn: What is your name?",
       ["My name is Mia.", "I am Tom.", "What is your name?"]),
      ("Âm /θ/ trong thank", "Đặt đầu lưỡi giữa hai hàm răng rồi thổi hơi nhẹ. Thank you không đọc là “sanh kiu”.",
       ["thank", "this", "hello", "goodbye"]),
      ["Nhìn vào gương, chào và nói tên của con bằng tiếng Anh.", "Đóng vai hai bạn gặp nhau: chào, hỏi thăm và tạm biệt."],
      [("What is the girl's name?", ["Mia", "Tom", "Lily"], 0, "Cô bé nói: “My name is Mia.”"),
       ("Who says “I am fine, thank you”?", ["Tom", "Mia", "The teacher"], 0, "Tom trả lời câu hỏi How are you?"),
       ("When will Mia see Tom again?", ["Tomorrow", "Yesterday", "Tonight"], 0, "“See you tomorrow” nghĩa là mai gặp lại."),
       ("Which word means “tạm biệt”?", ["Hello", "Goodbye", "Fine"], 1, "Goodbye = tạm biệt."),
       ("Complete: My name ___ Mia.", ["is", "are", "am"], 0, "My name đi với is.")]),

    K("A1", "Từ vựng", "Màu sắc", "Gọi tên các màu cơ bản và hỏi màu yêu thích.",
      [("Teacher", "Look at the rainbow! What colour is it?", "Nhìn cầu vồng kìa! Nó có màu gì?"),
       ("Mia", "It is red, orange and yellow.", "Nó màu đỏ, cam và vàng."),
       ("Tom", "It is green, blue and purple, too.", "Nó cũng có màu xanh lá, xanh dương và tím nữa."),
       ("Teacher", "Very good! What is your favourite colour, Mia?", "Giỏi lắm! Màu em thích nhất là màu gì, Mia?"),
       ("Mia", "My favourite colour is pink. I like my pink bag.", "Màu em thích nhất là màu hồng. Em thích cái cặp màu hồng."),
       ("Tom", "I like blue. My shoes are blue.", "Tớ thích màu xanh dương. Giày của tớ màu xanh dương."),
       ("Teacher", "Let us paint the sun yellow!", "Chúng ta cùng tô mặt trời màu vàng nhé!")],
      [("red", "màu đỏ", "The apple is red."), ("yellow", "màu vàng", "The sun is yellow."),
       ("blue", "màu xanh dương", "The sky is blue."), ("green", "màu xanh lá", "The grass is green."),
       ("pink", "màu hồng", "I have a pink bag."), ("favourite", "yêu thích nhất", "Blue is my favourite colour.")],
      ("What colour is it? – It is …", "Hỏi màu: What colour is it? Trả lời: It is red. Màu sắc đặt trước danh từ: a red apple.",
       ["What colour is it?", "It is green.", "I have a blue pen."]),
      ("Âm /r/ trong red và /l/ trong yellow", "Đọc red: cuộn nhẹ lưỡi, không chạm vòm. Đọc yellow: đầu lưỡi chạm lợi trên ở âm /l/.",
       ["red", "yellow", "green", "purple"]),
      ["Chỉ vào 5 đồ vật quanh nhà và nói màu của chúng.", "Hỏi bạn: What is your favourite colour?"],
      [("What colour is the sun in the lesson?", ["Yellow", "Blue", "Green"], 0, "Cô giáo nói: “Let us paint the sun yellow!”"),
       ("What is Mia's favourite colour?", ["Pink", "Blue", "Red"], 0, "“My favourite colour is pink.”"),
       ("What colour are Tom's shoes?", ["Blue", "Pink", "Purple"], 0, "“My shoes are blue.”"),
       ("Choose the question for a colour.", ["What colour is it?", "How old is it?", "Where is it?"], 0, "What colour…? dùng để hỏi màu."),
       ("Complete: The grass ___ green.", ["is", "are", "am"], 0, "The grass là số ít nên dùng is.")]),

    K("A1", "Từ vựng", "Số đếm từ 1 đến 10", "Đếm từ 1 đến 10 và hỏi có bao nhiêu đồ vật.",
      [("Teacher", "Let us count! One, two, three.", "Chúng ta cùng đếm nào! Một, hai, ba."),
       ("Mia", "Four, five, six, seven.", "Bốn, năm, sáu, bảy."),
       ("Tom", "Eight, nine, ten! I can count to ten.", "Tám, chín, mười! Tớ đếm được đến mười."),
       ("Teacher", "How many apples are there?", "Có bao nhiêu quả táo?"),
       ("Mia", "There are five apples.", "Có năm quả táo."),
       ("Teacher", "And how many bananas?", "Còn chuối thì có bao nhiêu quả?"),
       ("Tom", "There are three bananas. Three and five is eight!", "Có ba quả chuối. Ba cộng năm là tám!")],
      [("one", "một", "I have one pen."), ("three", "ba", "There are three birds."),
       ("five", "năm", "I am five years old."), ("seven", "bảy", "There are seven days in a week."),
       ("ten", "mười", "I have ten fingers."), ("count", "đếm", "Let us count the apples.")],
      ("How many … are there? – There are …", "Hỏi số lượng: How many apples are there? Trả lời: There are five apples. Có một: There is one apple.",
       ["How many apples are there?", "There are five apples.", "There is one banana."]),
      ("Âm cuối /s/ và /z/ ở số nhiều", "Nói rõ âm cuối: apples, bananas. Đừng bỏ âm s ở cuối.",
       ["three", "seven", "apples", "bananas"]),
      ["Đếm các ngón tay của con từ 1 đến 10 bằng tiếng Anh.", "Đếm số bút, số cốc hoặc số đồ chơi quanh con."],
      [("How many apples are there?", ["Five", "Three", "Ten"], 0, "“There are five apples.”"),
       ("How many bananas are there?", ["Three", "Five", "Eight"], 0, "“There are three bananas.”"),
       ("What is three and five?", ["Eight", "Seven", "Ten"], 0, "Tom nói: “Three and five is eight.”"),
       ("Which number comes after nine?", ["Ten", "Eight", "Seven"], 0, "Sau nine là ten."),
       ("Complete: There ___ one banana.", ["is", "are", "am"], 0, "Số ít (one) dùng there is.")]),

    K("A1", "Từ vựng", "Thú cưng và con vật", "Gọi tên các con vật quen thuộc và nói con vật mình thích.",
      [("Mia", "Look! I have a pet. It is a dog.", "Nhìn này! Tớ có một thú cưng. Đó là một chú chó."),
       ("Tom", "Its name is Bobby. It is big and brown.", "Tên nó là Bobby. Nó to và có màu nâu."),
       ("Mia", "Do you have a pet, Tom?", "Bạn có thú cưng không, Tom?"),
       ("Tom", "Yes, I do. I have a white cat.", "Có chứ. Tớ có một con mèo trắng."),
       ("Mia", "Is your cat small?", "Con mèo của bạn nhỏ không?"),
       ("Tom", "Yes, it is. It likes fish and milk.", "Ừ, nhỏ lắm. Nó thích cá và sữa."),
       ("Mia", "I like animals. I like birds and rabbits, too.", "Tớ thích động vật. Tớ cũng thích chim và thỏ.")],
      [("dog", "con chó", "The dog is big."), ("cat", "con mèo", "My cat is white."),
       ("bird", "con chim", "The bird can sing."), ("rabbit", "con thỏ", "The rabbit likes carrots."),
       ("fish", "con cá", "I have a fish."), ("pet", "thú cưng", "A dog is a good pet.")],
      ("I have a … / Do you have a …?", "Nói mình có gì: I have a cat. Hỏi bạn: Do you have a pet? Trả lời: Yes, I do. / No, I don't.",
       ["I have a dog.", "Do you have a pet?", "Yes, I do."]),
      ("Âm /æ/ trong cat", "Mở miệng rộng như nói “e” kéo dài ra phía hai bên: cat, rabbit. Không đọc là “ket”.",
       ["cat", "rabbit", "bag", "black"]),
      ["Kể tên 5 con vật mà con biết bằng tiếng Anh.", "Hỏi bạn: Do you have a pet?"],
      [("What pet does Mia have?", ["A dog", "A cat", "A bird"], 0, "“I have a pet. It is a dog.”"),
       ("What colour is Tom's cat?", ["White", "Brown", "Black"], 0, "“I have a white cat.”"),
       ("What does Tom's cat like?", ["Fish and milk", "Carrots", "Bones"], 0, "“It likes fish and milk.”"),
       ("Which animal is NOT mentioned?", ["A horse", "A rabbit", "A bird"], 0, "Bài nói đến dog, cat, birds và rabbits."),
       ("Answer: Do you have a pet?", ["Yes, I do.", "Yes, it is.", "Yes, I am."], 0, "Do you have…? trả lời Yes, I do.")]),

    K("A1", "Giao tiếp", "Gia đình của tôi", "Giới thiệu các thành viên trong gia đình.",
      [("Teacher", "Tell me about your family, Tom.", "Hãy kể cho cô nghe về gia đình em, Tom."),
       ("Tom", "This is my mum. She is a nurse.", "Đây là mẹ em. Mẹ em là y tá."),
       ("Tom", "This is my dad. He is a driver.", "Đây là bố em. Bố em là tài xế."),
       ("Teacher", "Do you have a brother or a sister?", "Em có anh em trai hay chị em gái không?"),
       ("Tom", "I have a sister. Her name is Lan.", "Em có một chị gái. Tên chị là Lan."),
       ("Tom", "I love my grandma and grandpa, too.", "Em cũng yêu bà và ông của em."),
       ("Teacher", "What a lovely family!", "Thật là một gia đình đáng yêu!")],
      [("mum", "mẹ", "My mum is kind."), ("dad", "bố", "My dad is tall."),
       ("sister", "chị/em gái", "My sister is ten."), ("brother", "anh/em trai", "I have one brother."),
       ("grandma", "bà", "My grandma tells stories."), ("family", "gia đình", "I love my family.")],
      ("He / She và his / her", "He (anh ấy) và She (cô ấy) thay cho người. His/her là “của anh ấy/của cô ấy”: his name, her name.",
       ["She is a nurse.", "He is a driver.", "Her name is Lan."]),
      ("Âm /ð/ trong mother, brother", "Đặt lưỡi giữa hai hàm răng và rung dây thanh: mother, brother, this.",
       ["mother", "brother", "father", "this"]),
      ["Chỉ vào ảnh gia đình và nói: This is my … .", "Nói nghề của bố hoặc mẹ bằng tiếng Anh."],
      [("What is Tom's mum?", ["A nurse", "A driver", "A teacher"], 0, "“She is a nurse.”"),
       ("What is Tom's dad?", ["A driver", "A nurse", "A doctor"], 0, "“He is a driver.”"),
       ("What is Tom's sister's name?", ["Lan", "Mia", "Anna"], 0, "“Her name is Lan.”"),
       ("Choose the word for a boy or a man.", ["He", "She", "Her"], 0, "He dùng cho nam."),
       ("Complete: ___ name is Lan. (chị ấy)", ["Her", "His", "He"], 0, "Her = của cô ấy.")]),

    K("A1", "Từ vựng", "Các bộ phận cơ thể", "Gọi tên các bộ phận cơ thể và làm theo lời chỉ dẫn.",
      [("Teacher", "Let us sing and move! Touch your head.", "Cùng hát và vận động nào! Chạm vào đầu của em."),
       ("Mia", "Touch your nose and your mouth.", "Chạm vào mũi và miệng của em."),
       ("Tom", "Touch your eyes and your ears.", "Chạm vào mắt và tai của em."),
       ("Teacher", "Now, clap your hands!", "Bây giờ, hãy vỗ tay nào!"),
       ("Mia", "Stamp your feet! One, two, three!", "Dậm chân nào! Một, hai, ba!"),
       ("Tom", "I have two arms and two legs.", "Tớ có hai cánh tay và hai cái chân."),
       ("Teacher", "Well done, everyone! Sit down, please.", "Giỏi lắm cả lớp! Mời các em ngồi xuống.")],
      [("head", "đầu", "Touch your head."), ("eye", "mắt", "I have two eyes."),
       ("nose", "mũi", "My nose is small."), ("hand", "bàn tay", "Clap your hands."),
       ("foot", "bàn chân", "Stamp your foot."), ("ear", "tai", "I hear with my ears.")],
      ("Câu mệnh lệnh: Touch / Clap / Stand up", "Dùng động từ đứng đầu câu để bảo ai làm gì: Touch your nose. Thêm please cho lịch sự.",
       ["Touch your head.", "Clap your hands.", "Sit down, please."]),
      ("Số nhiều bất quy tắc: foot → feet", "Một chân là foot, hai chân là feet. Đọc feet dài /iː/.",
       ["foot", "feet", "eyes", "ears"]),
      ["Chơi trò “Simon says”: con làm theo bố mẹ nói bằng tiếng Anh.", "Chỉ vào các bộ phận trên mặt và nói tên bằng tiếng Anh."],
      [("What do you do with your hands?", ["Clap", "Stamp", "Sit"], 0, "Cô nói: “Clap your hands!”"),
       ("What do you do with your feet?", ["Stamp", "Clap", "Count"], 0, "“Stamp your feet!”"),
       ("How many arms does Tom have?", ["Two", "One", "Four"], 0, "“I have two arms and two legs.”"),
       ("Which word is the plural of “foot”?", ["Feet", "Foots", "Footes"], 0, "Foot → feet."),
       ("Which sentence is polite?", ["Sit down, please.", "Sit down you.", "You sit down now."], 0, "Please làm câu nhẹ nhàng, lịch sự.")]),

    K("A1", "Từ vựng", "Đồ ăn và trái cây", "Nói về món mình thích và không thích.",
      [("Mum", "It is lunch time! What would you like?", "Đến giờ ăn trưa rồi! Con muốn ăn gì?"),
       ("Mia", "I like rice and chicken, Mum.", "Con thích cơm và thịt gà, mẹ ơi."),
       ("Tom", "I do not like fish. I like eggs.", "Con không thích cá. Con thích trứng."),
       ("Mum", "Do you like fruit?", "Các con có thích trái cây không?"),
       ("Mia", "Yes, I do! I like apples and bananas.", "Có ạ! Con thích táo và chuối."),
       ("Tom", "I like oranges, but I do not like milk.", "Con thích cam, nhưng con không thích sữa."),
       ("Mum", "Here you are. Enjoy your meal!", "Của các con đây. Ăn ngon miệng nhé!")],
      [("rice", "cơm, gạo", "I eat rice every day."), ("egg", "trứng", "I like eggs."),
       ("apple", "quả táo", "An apple is red."), ("banana", "quả chuối", "A banana is yellow."),
       ("milk", "sữa", "I drink milk."), ("orange", "quả cam", "I like orange juice.")],
      ("I like / I do not like", "Thích: I like apples. Không thích: I do not like fish (I don't like fish). Hỏi: Do you like fruit?",
       ["I like eggs.", "I do not like fish.", "Do you like fruit?"]),
      ("Âm /dʒ/ trong orange, juice", "Môi hơi chu, lưỡi chạm vòm miệng rồi bật hơi: orange, juice, jam.",
       ["orange", "juice", "apple", "banana"]),
      ["Nói 3 món con thích và 2 món con không thích.", "Hỏi bố mẹ: Do you like bananas?"],
      [("What does Tom like?", ["Eggs", "Fish", "Milk"], 0, "“I do not like fish. I like eggs.”"),
       ("What fruit does Mia like?", ["Apples and bananas", "Only oranges", "Mangoes"], 0, "“I like apples and bananas.”"),
       ("Which drink does Tom NOT like?", ["Milk", "Water", "Juice"], 0, "“I do not like milk.”"),
       ("Say you do not like something.", ["I do not like fish.", "I like fish.", "Do you like fish?"], 0, "Phủ định dùng do not."),
       ("Complete: ___ you like fruit?", ["Do", "Is", "Are"], 0, "Câu hỏi với like dùng Do.")]),

    K("A1", "Từ vựng", "Đồ dùng học tập", "Gọi tên đồ vật trong lớp và hỏi đó là gì.",
      [("Teacher", "Open your bags. What is this?", "Hãy mở cặp ra. Đây là cái gì?"),
       ("Mia", "It is a book.", "Đó là một quyển sách."),
       ("Teacher", "And what is that?", "Còn kia là cái gì?"),
       ("Tom", "That is a pencil case. I have a ruler in it.", "Kia là hộp bút. Trong đó tớ có một cây thước."),
       ("Mia", "I have a pen, a rubber and a notebook.", "Tớ có một cây bút, một cục tẩy và một quyển vở."),
       ("Teacher", "Take out your crayons. We will draw a picture.", "Hãy lấy bút màu ra. Chúng ta sẽ vẽ một bức tranh."),
       ("Tom", "I can draw a house and a tree!", "Tớ vẽ được một ngôi nhà và một cái cây!")],
      [("book", "quyển sách", "Open your book."), ("pencil", "bút chì", "I write with a pencil."),
       ("ruler", "cây thước", "Use a ruler to draw a line."), ("rubber", "cục tẩy", "I need a rubber."),
       ("bag", "cái cặp", "My bag is heavy."), ("crayon", "bút sáp màu", "I draw with crayons.")],
      ("This is / That is", "This is: đồ vật ở gần. That is: đồ vật ở xa. Hỏi: What is this? What is that?",
       ["What is this?", "This is a book.", "That is a pencil case."]),
      ("Âm /k/ trong crayon, book", "Âm /k/ bật hơi từ cuống họng, không rung: crayon, book, pencil case.",
       ["crayon", "book", "pencil", "case"]),
      ["Cầm từng đồ dùng học tập lên và nói: This is a …", "Chỉ vào đồ vật ở xa và nói: That is a …"],
      [("What is in Tom's pencil case?", ["A ruler", "A book", "A crayon"], 0, "“I have a ruler in it.”"),
       ("What will they do with crayons?", ["Draw a picture", "Read a book", "Count"], 0, "“We will draw a picture.”"),
       ("What can Tom draw?", ["A house and a tree", "A cat", "A car"], 0, "“I can draw a house and a tree!”"),
       ("For something far away, we say…", ["That is", "This is", "It am"], 0, "That is dùng cho đồ vật ở xa."),
       ("Which one is used to rub out a mistake?", ["Rubber", "Ruler", "Notebook"], 0, "Rubber = cục tẩy.")]),

    K("A1", "Từ vựng", "Thời tiết", "Nói về thời tiết hôm nay và quần áo phù hợp.",
      [("Mum", "Look outside. What is the weather like?", "Con nhìn ra ngoài xem. Thời tiết thế nào?"),
       ("Mia", "It is sunny and hot today.", "Hôm nay trời nắng và nóng."),
       ("Tom", "Yesterday it was rainy and cold.", "Hôm qua trời mưa và lạnh."),
       ("Mum", "Take your hat. The sun is very bright.", "Đội mũ vào nhé. Mặt trời rất chói."),
       ("Mia", "Can we play in the park?", "Chúng con chơi ở công viên được không ạ?"),
       ("Mum", "Yes, but it may be windy later.", "Được, nhưng lát nữa có thể có gió."),
       ("Tom", "Hooray! I love sunny days!", "Hoan hô! Tớ yêu những ngày nắng!")],
      [("sunny", "có nắng", "It is sunny today."), ("rainy", "có mưa", "It is a rainy day."),
       ("cloudy", "nhiều mây", "The sky is cloudy."), ("windy", "có gió", "It is windy outside."),
       ("hot", "nóng", "Summer is hot."), ("cold", "lạnh", "Winter is cold.")],
      ("What is the weather like? – It is …", "Hỏi thời tiết: What is the weather like? Trả lời: It is sunny. Hôm qua dùng was: It was rainy.",
       ["What is the weather like?", "It is sunny.", "It was rainy yesterday."]),
      ("Âm /w/ trong weather, windy", "Tròn môi như thổi nến rồi mở ra: weather, windy, was.",
       ["weather", "windy", "was", "warm"]),
      ["Mở cửa sổ và nói thời tiết hôm nay bằng tiếng Anh.", "Chọn quần áo hợp với trời mưa và trời nắng."],
      [("What is the weather like today?", ["Sunny and hot", "Rainy and cold", "Snowy"], 0, "“It is sunny and hot today.”"),
       ("What was the weather yesterday?", ["Rainy and cold", "Sunny", "Windy"], 0, "“Yesterday it was rainy and cold.”"),
       ("Why does Mum say take your hat?", ["The sun is bright", "It is snowing", "It is night"], 0, "“The sun is very bright.”"),
       ("Where do the children want to play?", ["In the park", "At school", "In the kitchen"], 0, "“Can we play in the park?”"),
       ("Complete: Yesterday it ___ cold.", ["was", "is", "are"], 0, "Chuyện hôm qua dùng was.")]),

    K("A1", "Từ vựng", "Quần áo của tôi", "Gọi tên quần áo và nói mình mặc gì.",
      [("Mum", "Get dressed, Mia. It is time for school.", "Con mặc quần áo đi, Mia. Đến giờ đi học rồi."),
       ("Mia", "I am wearing my white shirt and my blue skirt.", "Con đang mặc áo sơ mi trắng và váy xanh."),
       ("Mum", "Where are your socks and shoes?", "Tất và giày của con đâu?"),
       ("Mia", "My socks are under the bed. My shoes are here.", "Tất của con ở dưới giường. Giày của con ở đây."),
       ("Tom", "I am wearing trousers and a T-shirt.", "Tớ đang mặc quần dài và áo thun."),
       ("Mum", "It is cold. Put on your jacket and your hat.", "Trời lạnh. Mặc áo khoác và đội mũ vào."),
       ("Tom", "Now I am ready for school!", "Giờ tớ sẵn sàng đi học rồi!")],
      [("shirt", "áo sơ mi", "My shirt is white."), ("skirt", "chân váy", "She has a blue skirt."),
       ("trousers", "quần dài", "These trousers are new."), ("shoes", "đôi giày", "Put on your shoes."),
       ("socks", "đôi tất", "I wear warm socks."), ("jacket", "áo khoác", "Put on your jacket.")],
      ("I am wearing …", "Nói đang mặc gì: I am wearing a red shirt. Đồ có hai ống/hai chiếc (trousers, shoes, socks) dùng số nhiều.",
       ["I am wearing a shirt.", "My shoes are here.", "Put on your jacket."]),
      ("Âm /ʃ/ trong shirt, shoes", "Chu môi, thổi hơi nhẹ như nói “suỵt”: shirt, shoes, she.",
       ["shirt", "shoes", "she", "jacket"]),
      ["Nói ba món con đang mặc bằng tiếng Anh.", "Chọn quần áo cho một ngày lạnh và một ngày nóng."],
      [("What is Mia wearing?", ["A white shirt and a blue skirt", "Trousers", "A jacket"], 0, "“I am wearing my white shirt and my blue skirt.”"),
       ("Where are Mia's socks?", ["Under the bed", "In the bag", "On the table"], 0, "“My socks are under the bed.”"),
       ("What does Tom wear?", ["Trousers and a T-shirt", "A skirt", "A dress"], 0, "“I am wearing trousers and a T-shirt.”"),
       ("Why does Mum say put on your jacket?", ["It is cold", "It is hot", "It is night"], 0, "“It is cold.”"),
       ("Complete: My shoes ___ here.", ["are", "is", "am"], 0, "Shoes là số nhiều nên dùng are.")]),

    K("A2", "Giao tiếp", "Một ngày của tôi", "Kể về các việc mình làm trong ngày bằng thì hiện tại đơn.",
      [("Teacher", "What do you do in the morning, Mia?", "Buổi sáng em làm gì, Mia?"),
       ("Mia", "I get up at six o'clock. I brush my teeth and have breakfast.", "Em dậy lúc sáu giờ. Em đánh răng và ăn sáng."),
       ("Teacher", "How do you go to school?", "Em đến trường bằng cách nào?"),
       ("Mia", "I go to school by bike with my brother.", "Em đi học bằng xe đạp với anh trai."),
       ("Tom", "I have lunch at school. In the afternoon I play football.", "Tớ ăn trưa ở trường. Buổi chiều tớ chơi bóng đá."),
       ("Mia", "In the evening I do my homework and watch TV.", "Buổi tối em làm bài tập và xem ti vi."),
       ("Teacher", "And I go to bed at nine. Good night!", "Còn cô đi ngủ lúc chín giờ. Chúc ngủ ngon!")],
      [("get up", "thức dậy", "I get up at six."), ("breakfast", "bữa sáng", "I have breakfast at home."),
       ("homework", "bài tập về nhà", "I do my homework after school."), ("go to bed", "đi ngủ", "I go to bed at nine."),
       ("brush my teeth", "đánh răng", "I brush my teeth twice a day."), ("by bike", "bằng xe đạp", "I go to school by bike.")],
      ("Hiện tại đơn: I get up / He gets up", "Dùng để nói thói quen hằng ngày. Với he/she/it thêm s: He gets up at six. She plays football.",
       ["I get up at six.", "He goes to school by bike.", "She plays football."]),
      ("Giờ giấc: o'clock", "Nói giờ tròn: six o'clock, seven o'clock. Âm /ə/ trong o'clock đọc nhẹ.",
       ["o'clock", "breakfast", "homework", "evening"]),
      ["Kể 4 việc con làm từ sáng đến tối, bắt đầu bằng I.", "Hỏi bạn: What time do you get up?"],
      [("What time does Mia get up?", ["At six o'clock", "At nine o'clock", "At noon"], 0, "“I get up at six o'clock.”"),
       ("How does Mia go to school?", ["By bike", "By bus", "On foot"], 0, "“I go to school by bike.”"),
       ("What does Tom do in the afternoon?", ["Plays football", "Does homework", "Watches TV"], 0, "“In the afternoon I play football.”"),
       ("When does Mia do her homework?", ["In the evening", "In the morning", "At lunch"], 0, "“In the evening I do my homework.”"),
       ("Complete: He ___ to school by bike.", ["goes", "go", "going"], 0, "He + động từ thêm es: goes.")]),

    K("A2", "Giao tiếp", "Ở sở thú: can và can't", "Nói con vật làm được và không làm được gì.",
      [("Teacher", "Welcome to the zoo! Look at the monkey.", "Chào mừng đến sở thú! Nhìn chú khỉ kìa."),
       ("Mia", "It can climb trees. It can jump, too.", "Nó trèo cây được. Nó cũng nhảy được nữa."),
       ("Tom", "Can an elephant jump?", "Con voi có nhảy được không?"),
       ("Teacher", "No, it can't. But it can swim and it can carry heavy things.", "Không, nó không nhảy được. Nhưng nó biết bơi và mang được vật nặng."),
       ("Mia", "Can a bird swim?", "Con chim có biết bơi không?"),
       ("Tom", "Some birds can, but this bird can only fly.", "Một số loài chim biết, nhưng con chim này chỉ bay được."),
       ("Teacher", "Very good! Let us see the lions now.", "Giỏi lắm! Bây giờ chúng ta đi xem sư tử nhé.")],
      [("monkey", "con khỉ", "The monkey eats a banana."), ("elephant", "con voi", "An elephant is very big."),
       ("lion", "sư tử", "The lion can run fast."), ("climb", "trèo", "Monkeys can climb trees."),
       ("jump", "nhảy", "Frogs can jump."), ("swim", "bơi", "Fish can swim.")],
      ("can / can't", "Can nói khả năng: It can swim. Can't (cannot) là không thể: It can't jump. Hỏi: Can an elephant jump? – No, it can't.",
       ["A monkey can climb.", "An elephant can't jump.", "Can a bird fly?"]),
      ("Phân biệt can /kæn/ và can't /kɑːnt/", "Can đọc ngắn, nhẹ. Can't đọc dài và rõ hơn, nhấn vào âm “a” (kiểu Anh).",
       ["can", "can't", "climb", "swim"]),
      ["Nói 3 điều con làm được và 2 điều con chưa làm được bằng can / can't.", "Hỏi bạn: Can you swim?"],
      [("What can the monkey do?", ["Climb trees", "Swim", "Drive"], 0, "“It can climb trees.”"),
       ("Can an elephant jump?", ["No, it can't.", "Yes, it can.", "Yes, it is."], 0, "Cô giáo: “No, it can't.”"),
       ("What can an elephant do?", ["Swim", "Fly", "Climb trees"], 0, "“It can swim and it can carry heavy things.”"),
       ("What can the bird in the lesson do?", ["Fly", "Swim", "Run"], 0, "“This bird can only fly.”"),
       ("Complete: A fish ___ swim.", ["can", "is", "do"], 0, "Can + động từ nguyên mẫu.")]),

    K("A2", "Giao tiếp", "Ở đâu? in, on, under", "Dùng in, on, under, next to để nói vị trí đồ vật.",
      [("Mum", "Tom, where is your school bag?", "Tom, cặp sách của con đâu?"),
       ("Tom", "It is on the chair, Mum.", "Nó ở trên ghế, mẹ ạ."),
       ("Mum", "And where are your shoes?", "Còn giày của con đâu?"),
       ("Tom", "They are under the table.", "Chúng ở dưới bàn ạ."),
       ("Mia", "Your ball is in the box next to the door.", "Quả bóng của bạn ở trong cái hộp cạnh cửa."),
       ("Tom", "Thank you, Mia! And my cat?", "Cảm ơn Mia! Còn con mèo của tớ đâu?"),
       ("Mia", "It is behind the sofa. It is sleeping.", "Nó ở sau ghế sô-pha. Nó đang ngủ.")],
      [("in", "ở trong", "The ball is in the box."), ("on", "ở trên (có tiếp xúc)", "The bag is on the chair."),
       ("under", "ở dưới", "The shoes are under the table."), ("next to", "bên cạnh", "The box is next to the door."),
       ("behind", "ở phía sau", "The cat is behind the sofa."), ("between", "ở giữa", "The cat is between the chairs.")],
      ("Giới từ chỉ vị trí", "Where is …? / Where are …? hỏi vị trí. Trả lời bằng giới từ: It is in / on / under …. Số nhiều dùng They are.",
       ["Where is my bag?", "It is on the chair.", "They are under the table."]),
      ("Âm /ʌ/ trong under, sun", "Miệng mở nhỏ, âm ngắn và nhẹ như “ơ”: under, sun, bus, up.",
       ["under", "sofa", "behind", "between"]),
      ["Đặt một món đồ chơi ở 3 chỗ khác nhau và nói vị trí bằng tiếng Anh.", "Hỏi bố mẹ: Where is my …?"],
      [("Where is Tom's school bag?", ["On the chair", "Under the table", "In the box"], 0, "“It is on the chair.”"),
       ("Where are Tom's shoes?", ["Under the table", "On the sofa", "Behind the door"], 0, "“They are under the table.”"),
       ("Where is the ball?", ["In the box", "On the bed", "Under the chair"], 0, "“Your ball is in the box.”"),
       ("Where is the cat?", ["Behind the sofa", "In the garden", "On the table"], 0, "“It is behind the sofa.”"),
       ("Complete: Where ___ my shoes?", ["are", "is", "am"], 0, "Shoes số nhiều nên hỏi Where are.")]),

    K("A2", "Giao tiếp", "Ngôi nhà của tôi", "Tả các phòng và đồ vật trong nhà bằng There is / There are.",
      [("Mia", "Welcome to my house! Come in.", "Chào mừng đến nhà tớ! Mời vào."),
       ("Tom", "Wow, it is big! How many rooms are there?", "Ồ, nhà to quá! Có bao nhiêu phòng vậy?"),
       ("Mia", "There are five rooms. There is a living room, a kitchen and three bedrooms.", "Có năm phòng. Có một phòng khách, một nhà bếp và ba phòng ngủ."),
       ("Tom", "What is in your bedroom?", "Trong phòng ngủ của bạn có gì?"),
       ("Mia", "There is a bed, a desk and a lamp. There are many books, too.", "Có một cái giường, một cái bàn học và một cái đèn. Cũng có nhiều sách nữa."),
       ("Tom", "Is there a garden?", "Có vườn không?"),
       ("Mia", "Yes, there is. Let us play there!", "Có chứ. Chúng ta ra đó chơi đi!")],
      [("living room", "phòng khách", "We watch TV in the living room."), ("kitchen", "nhà bếp", "Mum cooks in the kitchen."),
       ("bedroom", "phòng ngủ", "My bedroom is small."), ("bathroom", "phòng tắm", "The bathroom is next to my room."),
       ("garden", "khu vườn", "There are flowers in the garden."), ("lamp", "cái đèn", "There is a lamp on the desk.")],
      ("There is / There are", "There is + danh từ số ít: There is a bed. There are + số nhiều: There are three bedrooms. Hỏi: Is there a garden? – Yes, there is.",
       ["There is a lamp.", "There are three bedrooms.", "Is there a garden?"]),
      ("Nhấn âm trong từ hai âm tiết", "Nhấn vào âm đầu: KITchen, BEDroom, GARden, LAMP. Đọc âm đầu to và rõ hơn.",
       ["kitchen", "bedroom", "garden", "bathroom"]),
      ["Tả phòng ngủ của con: There is … / There are …", "Hỏi bạn: Is there a garden at your house?"],
      [("How many rooms are there?", ["Five", "Three", "Ten"], 0, "“There are five rooms.”"),
       ("How many bedrooms are there?", ["Three", "One", "Five"], 0, "“three bedrooms.”"),
       ("What is on Mia's desk or in her room?", ["A lamp", "A cat", "A car"], 0, "“a bed, a desk and a lamp.”"),
       ("Is there a garden?", ["Yes, there is.", "No, there isn't.", "Yes, it is."], 0, "Mia trả lời “Yes, there is.”"),
       ("Complete: There ___ many books.", ["are", "is", "am"], 0, "Books số nhiều nên dùng there are.")]),

    K("A2", "Giao tiếp", "Sở thích và thể thao", "Nói về môn thể thao và hoạt động mình thích.",
      [("Teacher", "What do you like doing in your free time?", "Rảnh rỗi em thích làm gì?"),
       ("Mia", "I like dancing and drawing. I do not like swimming.", "Em thích nhảy múa và vẽ. Em không thích bơi."),
       ("Tom", "I love playing football with my friends.", "Tớ rất thích chơi bóng đá với bạn bè."),
       ("Teacher", "Do you play any sport on Sunday?", "Chủ nhật em có chơi môn thể thao nào không?"),
       ("Tom", "Yes, I play badminton with my dad.", "Có ạ, em chơi cầu lông với bố."),
       ("Mia", "On Sundays I read stories and ride my bike.", "Chủ nhật em đọc truyện và đạp xe."),
       ("Teacher", "Those are great hobbies!", "Đó đều là những sở thích tuyệt vời!")],
      [("dance", "nhảy múa", "I like to dance."), ("draw", "vẽ", "She draws a flower."),
       ("football", "bóng đá", "He plays football."), ("badminton", "cầu lông", "We play badminton on Sunday."),
       ("ride a bike", "đạp xe", "I ride a bike in the park."), ("hobby", "sở thích", "Drawing is my hobby.")],
      ("like + V-ing", "Sau like/love dùng động từ thêm -ing: I like dancing. He loves playing football. Phủ định: I do not like swimming.",
       ["I like dancing.", "He loves playing football.", "I do not like swimming."]),
      ("Đuôi -ing", "Đọc đuôi -ing là /ɪŋ/, không đọc “in”: dancing, drawing, swimming.",
       ["dancing", "drawing", "swimming", "reading"]),
      ["Nói 3 sở thích của con bằng I like + V-ing.", "Hỏi bạn: What do you like doing?"],
      [("What does Mia like doing?", ["Dancing and drawing", "Swimming", "Football"], 0, "“I like dancing and drawing.”"),
       ("Who plays football?", ["Tom", "Mia", "The teacher"], 0, "Tom: “I love playing football.”"),
       ("What does Tom play with his dad?", ["Badminton", "Football", "Chess"], 0, "“I play badminton with my dad.”"),
       ("What does Mia do on Sundays?", ["Reads stories and rides her bike", "Swims", "Plays badminton"], 0, "“I read stories and ride my bike.”"),
       ("Complete: I like ___ football.", ["playing", "play", "plays"], 0, "Sau like dùng V-ing.")]),

    K("A2", "Giao tiếp", "Tiệc sinh nhật", "Chúc mừng sinh nhật, hỏi tuổi và mời đồ ăn.",
      [("Mia", "Happy birthday, Tom!", "Chúc mừng sinh nhật, Tom!"),
       ("Tom", "Thank you, Mia! I am nine years old today.", "Cảm ơn Mia! Hôm nay tớ chín tuổi."),
       ("Mia", "This present is for you. I hope you like it.", "Món quà này dành cho bạn. Tớ hy vọng bạn thích nó."),
       ("Tom", "Wow, a new football! It is great.", "Ồ, một quả bóng đá mới! Tuyệt quá."),
       ("Mum", "Would you like some cake and juice?", "Các con muốn ăn bánh và uống nước ép không?"),
       ("Mia", "Yes, please. The cake looks delicious.", "Vâng ạ. Chiếc bánh trông rất ngon."),
       ("Tom", "Let us sing and blow out the candles. Make a wish!", "Chúng ta hát rồi thổi nến nào. Hãy ước một điều đi!")],
      [("birthday", "sinh nhật", "My birthday is in May."), ("present", "món quà", "I have a present for you."),
       ("cake", "bánh ngọt", "The cake is delicious."), ("candle", "ngọn nến", "Blow out the candles."),
       ("party", "bữa tiệc", "We have a party today."), ("delicious", "ngon", "The cake is delicious.")],
      ("How old are you? / Would you like …?", "Hỏi tuổi: How old are you? – I am nine. Mời lịch sự: Would you like some cake? – Yes, please. / No, thank you.",
       ["How old are you?", "I am nine years old.", "Would you like some cake?"]),
      ("Hát Happy Birthday", "Hát chậm và rõ: Happy birthday to you! Nối âm: “birthday to” đọc liền nhau.",
       ["birthday", "happy", "candle", "present"]),
      ["Hỏi bố mẹ How old are you? và trả lời tuổi của con.", "Đóng vai tiệc sinh nhật: tặng quà, mời bánh, hát chúc mừng."],
      [("How old is Tom today?", ["Nine", "Ten", "Seven"], 0, "“I am nine years old today.”"),
       ("What present does Tom get?", ["A football", "A book", "A bag"], 0, "“a new football”."),
       ("What does Mum offer?", ["Cake and juice", "Rice", "Fish"], 0, "“Would you like some cake and juice?”"),
       ("How do you accept politely?", ["Yes, please.", "Give me.", "Yes, I am."], 0, "Yes, please = vâng, xin cảm ơn."),
       ("Complete: Happy ___ , Tom!", ["birthday", "morning", "present"], 0, "Happy birthday = chúc mừng sinh nhật.")]),
]

LEVEL_ORDER = {"A1": 0, "A2": 1}


def vocab_questions(lesson_id, vocab):
    rnd = random.Random(lesson_id)
    out = []
    for index, (term, meaning, example) in enumerate(vocab[:5]):
        others = [v for v in vocab if v[0] != term]
        if index % 2 == 0 and term.lower() in example.lower():
            start = example.lower().index(term.lower())
            sentence = example[:start] + "_____" + example[start + len(term):]
            options = [term] + [v[0] for v in rnd.sample(others, 2)]
            rnd.shuffle(options)
            out.append({"prompt": f"Complete the sentence: {sentence}", "options": options, "answer": options.index(term),
                        "explanation": f"“{term}” nghĩa là “{meaning}”. Câu đầy đủ: {example}"})
        else:
            options = [meaning] + [v[1] for v in rnd.sample(others, 2)]
            rnd.shuffle(options)
            out.append({"prompt": f"What does “{term}” mean?", "options": options, "answer": options.index(meaning),
                        "explanation": f"“{term}” = {meaning}. Ví dụ: {example}"})
    return out


def build():
    lessons = sorted(KIDS, key=lambda lesson: LEVEL_ORDER[lesson["level"]])
    counters = {}
    out = []
    for lesson in lessons:
        level = lesson["level"]
        counters[level] = counters.get(level, 0) + 1
        lesson_id = f"kids-{level.lower()}-{counters[level]}"
        assert len(lesson["questions"]) == 5 and all(0 <= a < len(o) for _, o, a, _ in lesson["questions"]), lesson_id
        assert len(lesson["vocab"]) == 6, lesson_id
        reading = "\n".join(f"{who}: {en}" for who, en, _ in lesson["turns"])
        # the answer is moved to a random place, so its position never gives it away
        rnd = random.Random(lesson_id + ":hand")
        hand = []
        for prompt, options, answer, explanation in lesson["questions"]:
            order = list(range(len(options)))
            rnd.shuffle(order)
            hand.append({"prompt": prompt, "options": [options[i] for i in order], "answer": order.index(answer), "explanation": explanation})
        units = lines_of(reading)
        assert len(units) == len(lesson["turns"]), lesson_id
        dialogue = [{"speaker": who, "text": en, "translation": vi} for who, en, vi in lesson["turns"]]
        g_title, g_expl, g_examples = lesson["grammar"]
        p_focus, p_tip, p_words = lesson["pron"]
        out.append({
            "id": lesson_id, "level": level, "unit": f"{level} · Bài {counters[level]}", "category": lesson["category"],
            "title": lesson["title"], "objective": lesson["objective"], "reading": reading, "dialogue": dialogue,
            "vocabulary": [{"term": t, "definition": d, "example": e} for t, d, e in lesson["vocab"]],
            "grammar": {"title": g_title, "explanation": g_expl, "examples": g_examples},
            "pronunciation": {"focus": p_focus, "tip": p_tip, "words": p_words},
            "speakingTasks": lesson["tasks"],
            "questions": hand + vocab_questions(lesson_id, lesson["vocab"]),
            "audioIds": [],
        })
    pack = {"id": "kids", "title": "Tiếng Anh cho trẻ em", "version": CURRICULUM_VERSION, "framework": "CEFR A1–A2 (trẻ em 5–11 tuổi)",
            "overview": "16 bài ngắn từ A1 đến A2 cho bé 5–11 tuổi: chào hỏi, màu sắc, số đếm, con vật, gia đình, cơ thể, đồ ăn, đồ dùng học tập, thời tiết, quần áo, một ngày của bé, sở thú (can), vị trí (in/on/under), ngôi nhà, sở thích và sinh nhật. Mỗi bài là một đoạn hội thoại ngắn có dịch tiếng Việt để bố mẹ đọc cùng bé.",
            "contentLicense": "Nội dung biên soạn riêng cho Teacher AI theo khung CEFR", "references": REFERENCES, "lessons": out, "audio": []}
    path = ROOT / "public" / "courses" / "en" / "kids.json"
    path.write_text(json.dumps(pack, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("kids", len(out), "lessons", sum(len(l["questions"]) for l in out), "questions")


build()
