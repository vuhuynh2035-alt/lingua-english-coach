# Lingua — Học tiếng Anh cùng AI

Web app học tiếng Anh dành cho người Việt. Chọn lộ trình theo lĩnh vực, luyện hội thoại và phát âm với AI, làm bài kiểm tra trình độ. Giao diện dùng được trên máy tính, Android và iPhone.

## Cách sử dụng

1. Mở đường dẫn GitHub Pages trên trình duyệt.
2. Nhấn **Kết nối AI** và tạo Gemini API key riêng tại [Google AI Studio](https://aistudio.google.com/app/apikey).
3. Dán key và chọn **Kiểm tra và lưu API key**.
4. Chọn lĩnh vực, rồi trò chuyện bằng cách nhập câu hoặc dùng micro.

Mỗi người học dùng API key và hạn mức Gemini của riêng mình. Yêu cầu AI được gửi trực tiếp từ trình duyệt tới Google Gemini; API key không được gửi tới máy chủ của ứng dụng hoặc lưu trong mã nguồn GitHub.

API key, hồ sơ, tiến độ và lịch sử trò chuyện được lưu trong bộ nhớ trình duyệt trên thiết bị hiện tại. Dữ liệu không được đồng bộ giữa các thiết bị. Nếu xóa dữ liệu trang web/trình duyệt, key và tiến độ trên thiết bị đó cũng bị xóa. Không lưu key trên thiết bị công cộng hoặc thiết bị dùng chung.

Các tình huống và câu mẫu được phân phối cùng ứng dụng; tiến độ và nội dung trò chuyện cá nhân được lưu cục bộ. Khi dùng trò chuyện bằng giọng nói hoặc luyện phát âm, bản ghi được gửi thẳng đến Gemini để xử lý. Cần có kết nối Internet và quyền truy cập micro qua HTTPS.

## Chạy trên máy để phát triển

1. Cài Node.js phiên bản 20 trở lên.
2. Tại thư mục `english-coach`, chạy `npm install`.
3. Chạy `npm run dev` rồi mở http://localhost:3000.

Key do từng người nhập trong ứng dụng; không đặt key trong biến môi trường, commit hoặc gửi key cho người khác.

## Phát hành miễn phí trên GitHub Pages

1. Đưa mã nguồn lên một GitHub repository công khai.
2. Trong **Settings → Pages**, chọn **Deploy from a branch**, nhánh `main` và thư mục `/docs`.
3. Tại máy có mã nguồn, chạy `npm install` một lần rồi `npm run publish:pages`. Lệnh này build ứng dụng với đường dẫn GitHub Pages và chép bản web vào `docs`.
4. Commit và đẩy bản build lên GitHub:

   ```powershell
   git add docs
   git commit -m "Update published website"
   git push
   ```
5. Gửi đường dẫn `https://<tên-tài-khoản>.github.io/<tên-repository>/` cho người học. Mỗi người tự thêm Gemini API key trên thiết bị của mình.

Mỗi lần cập nhật mã nguồn, chạy lại `npm run publish:pages` rồi commit và đẩy thay đổi. GitHub Pages sẽ tự cập nhật trang từ thư mục `docs`.
