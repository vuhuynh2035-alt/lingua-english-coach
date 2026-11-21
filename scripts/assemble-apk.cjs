/**
 * Builds and signs the release APK with Gradle, then copies it to APK/TeacherAI-vX.Y.Z.apk.
 * Run through `npm run apk` (build the web app, sync Capacitor, then this script).
 * Signing secrets: android/keystore.properties (storeFile relative to android/, storePassword, keyAlias,
 * keyPassword) or the TEACHERAI_KEYSTORE_FILE / _PASSWORD / TEACHERAI_KEY_ALIAS / _PASSWORD variables.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const { isAbsolute, join } = require("path");

const root = join(__dirname, "..");

/** 2.17.24 -> 2017024: major*1e6 + minor*1e3 + patch (patch capped at 999), so every release sorts above the last. */
function versionCodeFrom(version) {
  const parts = String(version || "0.0.0").split(".").map((n) => Number.parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts[0] * 1000000 + parts[1] * 1000 + Math.min(parts[2], 999);
}
const appVersion = require("../package.json").version;
const versionArgs = [`-PappVersionName=${appVersion}`, `-PappVersionCode=${versionCodeFrom(appVersion)}`];
const android = join(root, "android");
const isWin = process.platform === "win32";
const gradlew = join(android, isWin ? "gradlew.bat" : "gradlew");

// Java .properties: a backslash escapes, so Windows paths are written C:/... or C:\\...
function readKeystoreProperties() {
  const file = join(android, "keystore.properties");
  if (!fs.existsSync(file)) return {};
  const props = {};
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("!")) continue;
    const m = line.match(/^((?:\\.|[^=:\s\\])+)\s*[=:\s]\s*(.*)$/);
    if (!m) continue;
    const unescape = (s) =>
      s.replace(/\\(u[0-9a-fA-F]{4}|.)/g, (_, c) => (c.length === 5 ? String.fromCharCode(parseInt(c.slice(1), 16)) : { t: "\t", n: "\n", r: "\r", f: "\f" }[c] ?? c));
    props[unescape(m[1])] = unescape(m[2]);
  }
  return props;
}

function resolveSigning() {
  const props = readKeystoreProperties();
  const fields = [
    ["storeFile", "TEACHERAI_KEYSTORE_FILE"],
    ["storePassword", "TEACHERAI_KEYSTORE_PASSWORD"],
    ["keyAlias", "TEACHERAI_KEY_ALIAS"],
    ["keyPassword", "TEACHERAI_KEY_PASSWORD"],
  ];
  const values = {};
  const missing = [];
  for (const [key, envKey] of fields) {
    values[key] = props[key] || process.env[envKey] || "";
    if (!values[key]) missing.push(`${key} (or the variable ${envKey})`);
  }
  if (missing.length) {
    console.error(
      "[Sign] Release signing is not configured:\n  - " + missing.join("\n  - ") +
        "\nCreate android/keystore.properties (storeFile relative to android/, storePassword, keyAlias, keyPassword)" +
        "\nor set TEACHERAI_KEYSTORE_FILE / TEACHERAI_KEYSTORE_PASSWORD / TEACHERAI_KEY_ALIAS / TEACHERAI_KEY_PASSWORD.",
    );
    process.exit(1);
  }
  const storePath = isAbsolute(values.storeFile) ? values.storeFile : join(android, values.storeFile);
  if (!fs.existsSync(storePath)) {
    console.error(`[Sign] Keystore not found: ${storePath} (storeFile / TEACHERAI_KEYSTORE_FILE).`);
    process.exit(1);
  }
  return { storePath, keyAlias: values.keyAlias };
}

const signing = resolveSigning();
console.log(`[Sign] Signing the release APK with ${signing.storePath} (alias ${signing.keyAlias}).`);

function envWithJdk() {
  const env = { ...process.env };
  const javaBin = isWin ? "java.exe" : "java";
  const sep = isWin ? ";" : ":";
  const homeDir = process.env.USERPROFILE || process.env.HOME || "";
  // Gradle 8.14 does not run on Java 25 (Android Studio's newest JBR): prefer JBR/JDK 21.
  const jdkRoot = join(homeDir, ".jdks");
  const installed = fs.existsSync(jdkRoot) ? fs.readdirSync(jdkRoot).sort().reverse().map((d) => join(jdkRoot, d)) : [];
  const candidates = [
    ...installed.filter((p) => /-(21|17)\b|jbr-21|jdk-21|jdk-17/.test(p)),
    process.env.JAVA_HOME,
    isWin ? "C:\\Program Files\\Android\\Android Studio\\jbr" : "/Applications/Android Studio.app/Contents/jbr/Contents/Home",
    ...installed,
  ];
  const home = candidates.find((p) => p && fs.existsSync(join(p, "bin", javaBin)));
  if (home) {
    env.JAVA_HOME = home;
    // Windows: the variable is "Path"; setting "PATH" separately would hide System32.
    const pathKey = Object.keys(env).find((k) => k.toUpperCase() === "PATH") || "PATH";
    env[pathKey] = `${join(home, "bin")}${sep}${env[pathKey] || ""}`;
  }
  const sdkCandidates = isWin
    ? [join(homeDir, "AppData", "Local", "Android", "Sdk"), process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT]
    : [join(homeDir, "Library", "Android", "sdk"), process.env.ANDROID_HOME];
  const sdk = sdkCandidates.find((p) => p && fs.existsSync(p));
  if (sdk) {
    env.ANDROID_HOME = sdk;
    env.ANDROID_SDK_ROOT = sdk;
  }
  return env;
}

const env = envWithJdk();
// cmd cannot start gradlew.bat when the project path has spaces or accents: PowerShell handles them.
const result = isWin
  ? spawnSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", `& '.\\gradlew.bat' assembleRelease --no-daemon ${versionArgs.map((arg) => `'${arg}'`).join(" ")}; exit $LASTEXITCODE`], { cwd: android, stdio: "inherit", env })
  : spawnSync(gradlew, ["assembleRelease", "--no-daemon", ...versionArgs], { cwd: android, stdio: "inherit", env });

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

const code = result.status ?? 1;
if (code === 0) {
  const pkg = require("../package.json");
  const src = join(android, "app/build/outputs/apk/release/app-release.apk");
  if (!fs.existsSync(src)) {
    console.error("[Sign] Gradle did not produce a signed app-release.apk: check keystore.properties / TEACHERAI_KEYSTORE_* (password and alias).");
    process.exit(1);
  }
  const destName = `TeacherAI-v${pkg.version}.apk`;
  const rootApkDir = join(root, "APK");
  fs.mkdirSync(rootApkDir, { recursive: true });
  fs.copyFileSync(src, join(rootApkDir, destName));
  console.log(`\nAPK saved to: APK/${destName}`);
  console.log("[Sign] The APK is signed (v1 + v2), ready to install on an Android device.");
}
process.exit(code);
