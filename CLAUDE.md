# Teacher AI — ghi chú cho mọi phiên làm việc

Ứng dụng PWA học ngoại ngữ cho người Việt (tiếng Anh / Nhật / Trung). Next.js 15 static export, React 19, TypeScript. Người dùng nói tiếng Việt: trả lời bằng tiếng Việt, ngắn gọn.

## Thư mục và kho
- **Thư mục dự án duy nhất: `C:\Teacher AI`.** `C:\English Coach` và `C:\English Coach.worktrees` là bản cũ, không sửa.
- Kho GitHub duy nhất: `vuhuynh2035-alt/lingua-english-coach`, nhánh `main`. **Không tạo kho mới.**
- Chạy ở **hai nơi, dữ liệu học riêng từng nơi** (lưu trong trình duyệt theo địa chỉ web; chuyển qua lại bằng Cài đặt → "Sao lưu & chuyển dữ liệu", `src/lib/backup.ts`):
  - GitHub Pages: https://vuhuynh2035-alt.github.io/lingua-english-coach/ (phục vụ `docs/` của nhánh `main`; kho phải để **public**, nếu chuyển private thì Pages bị gỡ và phải bật lại bằng API). `version.json` cho biết bản đang chạy.
  - Máy chủ HP (Docker + nginx, cổng 8083): https://teacher.saigonref.com — cập nhật bằng `./deploy-docker.sh` trên máy chủ (git pull + build, không cần basePath).

## Trước khi làm bất cứ việc gì
1. `git log --oneline -5` và `git status` trong `C:\Teacher AI` — có thể phiên khác đã làm thêm.
2. So `package.json` với `https://vuhuynh2035-alt.github.io/lingua-english-coach/version.json`. Nếu trang chạy cao hơn thư mục, dừng lại và báo người dùng.
3. Chỉ một phiên được sửa/đưa lên cùng lúc.

## Mỗi thay đổi
- Tăng phiên bản ở 3 chỗ: `package.json` (dòng 3), `package-lock.json` (dòng 3 và 9), `public/version.json`.
- `npx tsc --noEmit` và `npx eslint src` phải sạch; `git commit` trong `C:\Teacher AI`.
- Kiểm tra giao diện bằng trình duyệt không đầu (chụp ảnh ở 420px, 880px, 1280px) trước khi đưa lên.

## Đưa lên GitHub Pages
1. Commit xong, chạy trong **PowerShell** (Git Bash làm hỏng `/lingua-...`), dừng máy chủ thử ở cổng 4830 trước: `powershell -File scripts\publish-pages.ps1 -BasePath "/lingua-english-coach"` → ghi vào `docs/`.
2. `git add -A docs`, commit, `git push origin HEAD:main`. `docs/` nằm trong kho và được theo dõi.
3. Chờ ~60–90 giây, kiểm tra `version.json` trên trang chạy thật.
4. Máy chủ HP: người dùng tự chạy `./deploy-docker.sh` (phiên này không vào được máy chủ).

## Kiến trúc cần nhớ
- `src/app/page.tsx`: trang chọn ngôn ngữ; `src/app/learning-app.tsx`: toàn bộ ứng dụng; ngôn ngữ nạp lúc chạy từ `src/lib/languages/{en,ja,zh}.ts`.
- Tiến độ/lịch sử tách theo ngôn ngữ (`langKey`), cài đặt chung dùng `sharedKey`.
- Giọng đọc: giọng AI (Gemini / Google Cloud TTS / OpenAI, chọn tay hoặc Tự động theo `src/lib/usage.ts`) → giọng tải về trong app (Piper; tệp tải từ Hugging Face + jsDelivr, chỉ `public/tts/vi/worker.js` nằm trong app) → giọng của máy.
- Chi phí AI: `src/lib/usage.ts` đếm lượt/ký tự/tiền theo key, trần USD, đơn giá, mô hình được phép.
- `npm run build` tự chạy `scripts/optimize-css.mjs` (PurgeCSS + csso) sau khi build; kiểm tra giao diện bằng so ảnh trước/sau nếu đổi danh sách safelist.
- Từ điển offline chia mảnh trong IndexedDB (`src/lib/dictionary.ts`, `public/dict`).
