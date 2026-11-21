/**
 * Updates the Teacher AI web app on the HP server (Docker + nginx, https://teacher.saigonref.com).
 *
 *   node scripts/deploy-hp.mjs           pull the latest main on the server, rebuild the container, check the live version
 *   node scripts/deploy-hp.mjs --check   only look: SSH works, which commit the server is on, which version is live
 *
 * The server pulls from GitHub, so the release commit must be pushed first (the release tool does it).
 * Environment: TEACHER_SSH_HOST (default root@10.201.1.8: the Docker container), TEACHER_SERVER_PATH
 * (default /root/lingua-english-coach), TEACHER_LIVE_URL.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const host = process.env.TEACHER_SSH_HOST || "root@10.201.1.8";
const dir = process.env.TEACHER_SERVER_PATH || "/root/lingua-english-coach";
const liveUrl = process.env.TEACHER_LIVE_URL || "https://teacher.saigonref.com/version.json";
const checkOnly = process.argv.includes("--check");
const wanted = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;

function ssh(command) {
  const res = spawnSync("ssh", ["-n", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10", host, command], { stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" });
  return { code: res.status ?? 1, out: (res.stdout || "").trim() };
}

async function liveVersion() {
  try {
    const response = await fetch(`${liveUrl}?check=${Date.now()}`, { cache: "no-store" });
    const body = await response.json();
    return String(body.version || "").replace(/^v/, "");
  } catch {
    return "";
  }
}

/** Returns the exit code; the process ends by itself (calling process.exit right after fetch crashes Node on Windows). */
async function main() {
  const probe = ssh(`cd '${dir}' && git rev-parse --short HEAD`);
  if (probe.code !== 0) {
    console.error(`✗ Không vào được ${host} hoặc không thấy ${dir}. Kiểm tra SSH (ssh ${host}) và đường dẫn TEACHER_SERVER_PATH.`);
    return 1;
  }
  console.log(`Máy chủ ${host}: ${dir} đang ở commit ${probe.out}; bản đang chạy thật: ${(await liveVersion()) || "không đọc được"}; bản cần: ${wanted}.`);
  if (checkOnly) return 0;

  console.log("Cập nhật mã và dựng lại container (khoảng 3 phút)...");
  const deploy = ssh(`cd '${dir}' && git pull --ff-only origin main && git log --oneline -1 && bash deploy-docker.sh 2>&1 | tail -4`);
  if (deploy.code !== 0) {
    console.error("✗ Deploy máy chủ HP thất bại (xem các dòng trên). Mã trên GitHub phải được đẩy trước khi deploy.");
    return 1;
  }
  console.log(deploy.out);

  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const live = await liveVersion();
    if (live === wanted) {
      console.log(`✓ ${liveUrl} đang chạy bản ${live}.`);
      return 0;
    }
    console.log(`Chờ máy chủ lên bản ${wanted} (đang là ${live || "chưa đọc được"}) — lần ${attempt}/12`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  console.error(`✗ Sau khi deploy, ${liveUrl} vẫn chưa báo bản ${wanted}.`);
  return 1;
}

process.exitCode = await main();
