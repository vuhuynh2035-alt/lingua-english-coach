#!/bin/bash
# Script tự động cập nhật và khởi chạy Teacher AI trên Docker (Proxmox Server)

echo "=== DANG DONG BO VA CAP NHAT TEACHER AI TREN DOCKER ==="
git pull origin main
docker compose down
docker compose up -d --build
echo "=== TRIEN KHAI THANH CONG! ==="
echo "Truy cap noi bo: http://$(hostname -I | awk '{print $1}'):8083"
echo "Truy cap domain : https://teacher.saigonref.com"
