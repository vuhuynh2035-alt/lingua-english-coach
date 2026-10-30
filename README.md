# Teacher AI — Học ngoại ngữ cùng AI

Một web app duy nhất để người Việt học **tiếng Anh, tiếng Nhật và tiếng Trung** cùng gia sư AI. Chọn ngôn ngữ ngay ở màn hình đầu tiên (có thể đổi bất cứ lúc nào ở trang chào).

## Cách dùng

1. Mở app, chọn ngôn ngữ muốn học.
2. Vào **Cài đặt**, chọn Google Gemini hoặc OpenAI / ChatGPT, dán API key riêng (một lần cho cả ba ngôn ngữ).
3. Chọn bài học, học theo giáo trình offline hoặc trò chuyện với gia sư AI (giọng nói hoặc văn bản).

Mỗi người dùng API key và hạn mức của riêng mình; yêu cầu gửi thẳng từ trình duyệt tới nhà cung cấp, key chỉ lưu trên thiết bị.

## Dùng chung và tách riêng

| Dùng chung cho cả ba ngôn ngữ | Tách riêng theo từng ngôn ngữ |
|---|---|
| API key, nhà cung cấp và mô hình AI | Tiến độ học, chuỗi ngày, thời gian luyện |
| Giao diện, cỡ chữ | Điểm bài kiểm tra và bài ngữ pháp |
| Ghi âm chất lượng cao / khử ồn | Tiến độ giáo trình và bài đã đạt |
| Giọng tiếng Việt, nhân vật gia sư, nguồn giọng AI | Lịch sử trò chuyện, tài liệu cá nhân |
| | Giáo trình tải về, vùng miền giọng đọc |

Dữ liệu của tiếng Anh dùng các tên khóa cũ (`lingua-…`), nên người đã dùng bản chỉ có tiếng Anh vẫn giữ nguyên key, cài đặt và tiến độ. Tiếng Nhật dùng tiền tố `lingua-ja-`, tiếng Trung `lingua-zh-`.

## Nội dung

Mỗi ngôn ngữ có **88 bài trong 7 khóa** (880 câu hỏi): giao tiếp hằng ngày (16), du lịch, công sở, công nghệ, y khoa, tài chính và kỹ thuật điện lạnh công nghiệp (mỗi khóa 12), cùng bài ngữ pháp và bài kiểm tra trình độ. Tiếng Anh có thêm 3 khóa (36 bài): nails, spa & chăm sóc da, may mặc — tạo bằng `scripts/curriculum/en/new_courses.py`.

- Tiếng Anh: CEFR A1–B2, gia sư Ms. Maya / Mr. David / linh vật Nova.
- Tiếng Nhật: JLPT N5–N2, romaji, gia sư Sakura-sensei / Kenji-sensei / linh vật Alex (cú).
- Tiếng Trung: HSK 1–5, pinyin có dấu thanh, gia sư Lin Laoshi / Wei Laoshi / linh vật Panda (gấu trúc).

Mỗi bài có hội thoại (có cách đọc và bản dịch với tiếng Nhật/Trung), từ vựng, ngữ pháp, mẹo phát âm cho người Việt, nhiệm vụ luyện nói và bài kiểm tra 10 câu (đạt 8/10 để sang bài kế tiếp).

## Từ điển offline

Mục "Từ điển" (trong bước chọn cách học) tra hai chiều giữa ngôn ngữ đang học và tiếng Việt, có loa ở mỗi khung. Dữ liệu tải một lần về máy: CC-CEDICT (Trung), JMdict (Nhật, 30 nghìn từ thông dụng), Wiktionary tiếng Việt (112 nghìn từ Anh có nghĩa tiếng Việt, và chỉ mục tra ngược Việt → Anh) và Unicode Unihan (âm đọc tiếng Việt của chữ Hán), đều theo giấy phép CC BY-SA. Dữ liệu Trung và Nhật được chia thành nhiều mảnh nhỏ theo chữ đầu để chỉ nạp mảnh cần tra. Gõ romaji (Nhật) hoặc pinyin không dấu (Trung) cũng tra được. Từ hiếm: dùng "Tìm mở rộng online" (AI hoặc Google Dịch). Tạo lại dữ liệu: `python scripts/dict/build_dict.py <thư mục nguồn>`.

## Cấu trúc mã

- `src/app/page.tsx`: màn chọn ngôn ngữ; nạp cấu hình ngôn ngữ rồi mới nạp app học (`learning-app.tsx`), nên mỗi ngôn ngữ chỉ tải phần của mình.
- `src/lib/language.ts`: kiểu cấu hình và `LANG` (ngôn ngữ đang học). Cấu hình từng ngôn ngữ nằm ở `src/lib/languages/{en,ja,zh}.ts`, ngữ pháp ở `grammar-*.ts`.
- `src/lib/storage-keys.ts`: `sharedKey()` cho cài đặt dùng chung, `langKey()` cho dữ liệu riêng từng ngôn ngữ.
- `public/courses/<en|ja|zh>/<khóa>.json`: giáo trình. Tiếng Nhật và Trung được tạo từ `scripts/curriculum/<ja|zh>/*.py` bằng `python scripts/curriculum/<ja|zh>/build.py`. Khi đổi nội dung, tăng phiên bản của ngôn ngữ đó trong `CURRICULUM_VERSIONS` (`src/lib/course-library.ts`) để máy tải lại.

## Phát triển

```
npm install
npm run dev
npm run build        # xuất bản tĩnh vào out/
```

Phát hành lên GitHub Pages: `scripts/publish-pages.ps1 -BasePath /ten-kho` (sao chép `out/` vào `docs/`).


## Third-party voice

The built-in Vietnamese voice (`public/tts/vi`) is the Piper `vi_VN-vais1000-medium` model by rhasspy, trained on the VAIS-1000 corpus (CC BY 4.0, https://ieee-dataport.org/documents/vais-1000-vietnamese-speech-synthesis-corpus). It runs with onnxruntime-web (MIT) and the piper-phonemize WebAssembly build from `@diffusionstudio/piper-wasm` (MIT), which bundles espeak-ng (GPL-3.0, https://github.com/espeak-ng/espeak-ng). The app's source is public in this repository.
