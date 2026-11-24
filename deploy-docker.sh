#!/bin/bash
# Script tự động cập nhật và khởi chạy Teacher AI trên Docker (Proxmox Server).
# Dựng bản mới TRƯỚC khi đụng tới container đang chạy: trang chỉ ngừng vài giây lúc thay container
# (trước đây "docker compose down" rồi mới dựng nên trang mất 3-4 phút). Dựng lỗi thì dừng, bản cũ vẫn chạy.
set -e

echo "=== DANG DONG BO VA CAP NHAT TEACHER AI TREN DOCKER ==="
git pull origin main
echo "--- Dang dung ban moi (ban cu van chay) ---"
docker compose build
echo "--- Thay container ---"
docker compose up -d --remove-orphans
docker image prune -f >/dev/null 2>&1 || true
echo "=== TRIEN KHAI THANH CONG! ==="
echo "Truy cap noi bo: http://$(hostname -I | awk '{print $1}'):8083"
echo "Truy cap domain : https://teacher.saigonref.com"
