#!/usr/bin/env bash
# Tạo dự án video mới từ khung mẫu: bash scripts/tao_du_an.sh <thư-mục-đích>
# Chép template/ (không chép node_modules), cài phụ thuộc. Chromium: dùng $PW_CHROMIUM hoặc /opt/pw-browsers/chromium nếu có,
# không thì Remotion tự tải chrome-headless-shell khi render lần đầu.
set -euo pipefail
DICH="${1:?Cần thư mục đích, vd: bash scripts/tao_du_an.sh ~/video-moi}"
GOC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -e "$DICH" ] && [ -n "$(ls -A "$DICH" 2>/dev/null)" ]; then echo "Thư mục $DICH đã có nội dung — chọn thư mục trống." >&2; exit 1; fi
mkdir -p "$DICH"
cp -R "$GOC/template/." "$DICH/"
mkdir -p "$DICH/public/cap" "$DICH/public/music" "$DICH/out"
cd "$DICH"
npm install --no-audit --no-fund >/dev/null
echo "Đã tạo $DICH. Tiếp theo: sửa src/storyboard.json, đặt asset vào public/, rồi: node \"$GOC/scripts/kiem_tra_bo_cuc.mjs\" . && node \"$GOC/scripts/khung_tinh.mjs\" . (khung tĩnh + tờ soát out/khung/to-soat.jpg)"
