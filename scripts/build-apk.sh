#!/usr/bin/env bash
# Build Teacher AI debug APK (WebView → https://teacher.saigonref.com).
# Does not bump app version / package.json. Requires JDK 17+ and Android SDK.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$ROOT/android"
OUT_DIR="$ROOT/android/app/build/outputs/apk/debug"
APK_NAME="TeacherAI-debug.apk"

if [[ -z "${ANDROID_HOME:-}${ANDROID_SDK_ROOT:-}" ]]; then
  for candidate in "$HOME/android-sdk" "$HOME/Android/Sdk" /opt/android-sdk; do
    if [[ -d "$candidate" ]]; then
      export ANDROID_HOME="$candidate"
      break
    fi
  done
fi

if [[ -z "${ANDROID_HOME:-}${ANDROID_SDK_ROOT:-}" ]]; then
  echo "ANDROID_HOME chưa đặt. Cài Android SDK rồi export ANDROID_HOME=..." >&2
  exit 1
fi

export ANDROID_HOME="${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

cd "$ANDROID_DIR"
chmod +x ./gradlew
./gradlew assembleDebug --no-daemon

SRC="$OUT_DIR/app-debug.apk"
if [[ ! -f "$SRC" ]]; then
  echo "Không tìm thấy $SRC" >&2
  exit 1
fi

# Copy a stable name next to the Gradle output for easy handoff.
cp -f "$SRC" "$OUT_DIR/$APK_NAME"
echo "OK: $OUT_DIR/$APK_NAME"
ls -lh "$OUT_DIR/$APK_NAME"
