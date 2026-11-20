# Teacher AI — Android WebView (HP server)

Shell Android tối giản: mở `https://teacher.saigonref.com/` trong WebView in-app.

## Vì sao WebView thay vì TWA/Bubblewrap?

- TWA cần Digital Asset Links (`assetlinks.json`) trên máy chủ HP — phiên này không SSH/deploy lên HP.
- WebView giữ `localStorage` / IndexedDB trong profile của app (ổn định hơn Chrome site storage bị dọn khi lâu không dùng).
- Không phụ thuộc GitHub Pages / `basePath`.

## Build APK debug (không cần keystore)

```bash
# Cần Android SDK + JDK 17+
export ANDROID_HOME=~/android-sdk   # hoặc đường dẫn SDK của bạn
./scripts/build-apk.sh
```

APK ra tại: `android/app/build/outputs/apk/debug/app-debug.apk`

Hoặc trong thư mục `android/`:

```bash
./gradlew assembleDebug
```

## Cài trên điện thoại

1. Sao chép file `.apk` sang máy Android.
2. Cho phép «Cài từ nguồn không xác định» (Files / Chrome / file manager).
3. Mở APK → Cài đặt.
4. Mở **Teacher AI** → vào Cài đặt, dán lại API key nếu chưa có trên thiết bị này.

## Lưu ý

- **iOS không cài được APK** — cần IPA/TestFlight riêng (chưa có trong repo này).
- API key và dữ liệu học chỉ nằm trên thiết bị đó (WebView storage). **Không đồng bộ** Android ↔ iPhone ↔ Chrome trên máy tính.
- Bản debug ký bằng debug keystore của máy build; cài đè bản release sau này có thể yêu cầu gỡ bản debug trước.
- Build release ký bằng keystore riêng: tạo `android/keystore.properties` (đã gitignore) rồi `./gradlew assembleRelease` — có thể gắn vào Công cụ phát hành (`actions.apk`) sau.
