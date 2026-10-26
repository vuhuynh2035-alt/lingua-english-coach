# Lingua — Học tiếng Anh cùng AI

Web app học tiếng Anh dành cho người Việt. Chọn lộ trình theo lĩnh vực, luyện hội thoại và phát âm với AI, làm bài kiểm tra trình độ. Giao diện dùng được trên máy tính, Android và iPhone.

## Cách sử dụng

1. Mở đường dẫn GitHub Pages trên trình duyệt.
2. Mở **Cài đặt**, chọn Google Gemini hoặc OpenAI / ChatGPT.
3. Tạo API key riêng tại [Google AI Studio](https://aistudio.google.com/app/apikey) hoặc [OpenAI](https://platform.openai.com/api-keys), dán vào ứng dụng và chọn **Kiểm tra và lưu key**.
4. Có thể lưu nhiều key, đổi key đang dùng, tải danh sách mô hình để chọn, và chọn giọng đọc.
5. Chọn lĩnh vực, rồi trò chuyện bằng cách nhập câu hoặc dùng micro.

Mỗi người học dùng API key và hạn mức của riêng mình. Yêu cầu được gửi trực tiếp từ trình duyệt tới nhà cung cấp đã chọn; API key không được gửi tới máy chủ của ứng dụng hoặc lưu trong mã nguồn GitHub. Nếu một key bị từ chối hoặc hết hạn mức, app thử lần lượt các key còn lại đã lưu cho nhà cung cấp đó.

API key, lựa chọn nhà cung cấp/mô hình/giọng đọc, hồ sơ, tiến độ và lịch sử trò chuyện được lưu trong bộ nhớ trình duyệt trên thiết bị hiện tại. Dữ liệu không được đồng bộ giữa các thiết bị. Nếu xóa dữ liệu trang web/trình duyệt, key và tiến độ trên thiết bị đó cũng bị xóa. Không lưu key trên thiết bị công cộng hoặc thiết bị dùng chung.

Trong **Cài đặt**, bạn có thể điều chỉnh cỡ chữ từ 100% đến 150%. Lựa chọn này được lưu trên từng thiết bị và áp dụng cho toàn bộ giao diện.

Phiên bản ứng dụng được quản lý trong `package.json`; khi phát hành bản điều chỉnh, hãy tăng phiên bản theo SemVer. Các lệnh `npm run dev` và `npm run build` tự tạo `public/version.json` từ giá trị đó. Ứng dụng hiển thị phiên bản đang chạy ở chân trang và trong **Cài đặt**, đồng thời kiểm tra phiên bản đã triển khai để báo khi có bản mới.

Các tình huống và câu mẫu được phân phối cùng ứng dụng; tiến độ và nội dung trò chuyện cá nhân được lưu cục bộ. Khi dùng trò chuyện bằng giọng nói, bản ghi được gửi thẳng tới Google Gemini hoặc dịch vụ phiên âm OpenAI tùy nhà cung cấp đang chọn. Góp ý/chấm phát âm trực tiếp từ âm thanh hiện hỗ trợ Google Gemini; nếu chọn OpenAI, ứng dụng hiện rõ yêu cầu đổi nhà cung cấp. Cần có kết nối Internet và quyền truy cập micro qua HTTPS.

Trong **Cài đặt**, người học có thể tải danh mục tối đa 10 giọng nam và 10 giọng nữ từ Google, được lọc theo các vùng Mỹ, Úc, Anh, Ấn Độ, Trung Quốc và Đức; số giọng thực tế tùy danh mục mà Google cung cấp cho API key. Đây chỉ là danh sách metadata nhỏ, không tải trước giọng hay audio. OpenAI cung cấp danh sách voice riêng và có thể nhận chỉ dẫn accent vùng, nhưng không công bố metadata giới tính/vùng cho từng voice. Audio chỉ được tạo khi người học nghe thử hoặc phát câu, rồi được lưu trên thiết bị để nghe ngoại tuyến (tối đa 100 đoạn gần đây, phân biệt theo nhà cung cấp/mô hình/giọng). Ứng dụng không tải mô hình giọng nói về máy. Việc tạo AI/audio có thể sử dụng hạn mức hoặc phát sinh phí theo tài khoản của nhà cung cấp.

## Thư viện tài liệu cá nhân

Trong mục **Tài liệu**, bạn có thể thêm tệp PDF, audio thông dụng hoặc văn bản TXT/MD (tối đa 50 MB mỗi tệp). Tệp được lưu trong IndexedDB của trình duyệt trên thiết bị hiện tại; không được tải lên GitHub hoặc gửi tới máy chủ ứng dụng. Xóa dữ liệu website/trình duyệt có thể xóa cả bản lưu này, vì vậy hãy giữ tệp gốc riêng.

Chỉ thêm tài liệu mà bạn có quyền lưu và sử dụng theo giấy phép áp dụng. Sách điện tử có DRM hoặc nội dung chỉ được cấp quyền đọc trong nền tảng của nhà xuất bản (ví dụ Oxford Learner’s Bookshelf) không thể nhập bằng cách vượt DRM; app này không trích xuất hay phân phối lại nội dung Oxford. Tính năng này là thư viện đọc cá nhân, không chuyển sách thành gói giáo trình có thể phát hành công khai.

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
   git add .
   git status
   git commit -m "Update published website"
   git push
   ```
5. Gửi đường dẫn `https://<tên-tài-khoản>.github.io/<tên-repository>/` cho người học. Mỗi người tự thêm API key nhà cung cấp mà họ chọn trên thiết bị của mình.

Mỗi lần cập nhật mã nguồn, chạy lại `npm run publish:pages` rồi commit và đẩy thay đổi. GitHub Pages sẽ tự cập nhật trang từ thư mục `docs`.
