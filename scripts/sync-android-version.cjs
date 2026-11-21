/** Writes the app version (package.json) into android/app/build.gradle: versionName "X.Y.Z" and a versionCode that always grows. */
const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

const root = join(__dirname, "..");
const gradlePath = join(root, "android", "app", "build.gradle");

function versionCodeFrom(version) {
  const parts = String(version || "0.0.0").split(".").map((n) => Number.parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  // 2.17.24 -> 2017024: major*1e6 + minor*1e3 + patch (patch capped at 999), so every release sorts above the last.
  return parts[0] * 1000000 + parts[1] * 1000 + Math.min(parts[2], 999);
}

function syncAndroidVersion(version) {
  const versionName = String(version || "0.0.0");
  const versionCode = versionCodeFrom(versionName);
  const gradle = readFileSync(gradlePath, "utf8")
    .replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
    .replace(/versionName\s+"[^"]+"/, `versionName "${versionName}"`);
  writeFileSync(gradlePath, gradle);
  return { versionName, versionCode };
}

if (require.main === module) {
  const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const result = syncAndroidVersion(version);
  console.log(`Android: versionName ${result.versionName}, versionCode ${result.versionCode}`);
}

module.exports = { syncAndroidVersion, versionCodeFrom };
