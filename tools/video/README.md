# Video giới thiệu Luyện Luật (TikTok 9:16)

Dựng bằng [Remotion](https://www.remotion.dev) (React → MP4). Thư mục độc lập, **không** nằm trong npm workspaces nên không ảnh hưởng `apps/web` hay CI.

- 1080×1920, 30 fps, 32 giây (960 khung). Mọi điểm cắt rơi đúng phách nhạc 150 BPM (1 phách = 12 khung).
- 8 cảnh: hook → logo (drop) → 23 môn/690 khái niệm → 6 bậc ghi nhớ → lịch ôn FSRS → luyện đề → thăng chức → kêu gọi + miễn trừ.
- Số liệu đọc thật từ `packages/content/data` (`scripts/stats.mjs` → `src/stats.json`).
- Ảnh màn hình là web thật (`scripts/shoot.cjs`).

## Lệnh (chạy trong `tools/video`)
```bash
npm install
npm run studio     # xem trước, sửa trực tiếp
npm run render     # → out/gioi-thieu.mp4 (tự chạy stats + music trước)
npm run shots      # chụp lại màn hình web (cần build web trước: BASE_PATH=/Law/ npm run build ở gốc)
```

## Giấy phép tài nguyên
- **Nhạc nền**: tự tổng hợp bằng code (`scripts/phonk.py`, chỉ numpy) theo phong cách phonk — không dùng sample hay bản nhạc của ai, nên không vướng bản quyền.
- **Âm thanh hiệu ứng**: Kenney *Interface Sounds* (CC0) — `public/sfx/LICENSE.txt`.
- **Font**: Be Vietnam Pro, Noto Serif Display (SIL OFL) qua `@remotion/google-fonts`.
- **Remotion**: miễn phí cho cá nhân và nhóm ≤ 3 người (https://www.remotion.pro/license).
