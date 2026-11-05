# Video giới thiệu Luyện Luật (TikTok 9:16)

Dựng bằng [Remotion](https://www.remotion.dev) (React → MP4). Thư mục độc lập, **không** nằm trong npm workspaces nên không ảnh hưởng `apps/web` hay CI.

- 1080×1920 (Full HD dọc), **60 fps**, 37 ô nhịp ≈ 80 giây.
- Nhịp theo bài **"Aura Farming" — Mustafa Saboori: 111 BPM, A♯ thứ** (số liệu Tunebat). Mọi điểm cắt cảnh tính bằng `b(n)` = phách thứ n (`src/theme.ts`); đổi bài thì sửa `BPM` và `SCENE_BARS`.
- 13 cảnh: hook → logo (drop) → thư viện 23 bìa sách → Hiểu nhanh (thẻ Đặt cọc, dữ liệu thật) → 6 bậc → trả lời thật trên web (dấu ĐÚNG) → FSRS → tìm không dấu & tiện ích → **màn thắp chuỗi thật** → 4 màu chu kỳ thẻ → tủ sách theo chương → sự nghiệp 4 nhánh → kêu gọi.

## Asset lấy từ chính web
`npm run capture` (cần build web trước: ở gốc `BASE_PATH=/Law/ npm run build`) sinh `public/cap/` (không commit):
- `harness/` là một trang Vite riêng mount thẳng component Svelte của `apps/web` (không sửa web): thẻ chuyên cần, màn thắp chuỗi, tủ trưng bày chức danh + màn nhận chức, bìa sách 23 môn, tranh kiến trúc.
- Bản build web cho luồng thật: trả lời đúng bộ đề Đặt cọc, tìm "dat coc", Hồ sơ đã nạp sẵn tiến độ giả (212/212 sách, 29/29 chức) để chụp tủ sách và sơ đồ chức vụ.
- Quay theo **thời gian ảo** để đủ 60 khung/giây đều đặn (ý tưởng từ [tungs/timesnap](https://github.com/tungs/timesnap), MIT — tự viết lại): Playwright clock dừng hẳn và chỉ tiến từng khung; Web Animations/CSS animation bị dừng rồi đặt `currentTime`; SMIL dùng `setCurrentTime`.

## Lệnh (chạy trong `tools/video`)
```bash
npm install
npm run capture       # quay/chụp asset từ web → public/cap/
npm run studio        # xem trước
npm run render        # bản ĐĂNG: không nhạc, chỉ hiệu ứng âm thanh → out/gioi-thieu-dang-tiktok.mp4
npm run render:nhap   # bản NHÁP: kèm nhạc mẫu 111 BPM để duyệt nhịp → out/gioi-thieu-nhac-nhap.mp4
```

## Đăng TikTok
1. Tải `out/gioi-thieu-dang-tiktok.mp4` lên, chọn **Âm thanh → "Aura Farming" (Mustafa Saboori)** trong thư viện TikTok (đã có giấy phép dùng trên TikTok).
2. Kéo đoạn nhạc sao cho **phách mạnh đầu tiên của bài rơi đúng 0:00**; cú "drop" của video ở 0:04,3 (ô nhịp 2), cảnh thắp chuỗi ở 0:45,4.
3. Âm lượng: âm thanh gốc (hiệu ứng) ~30–40 %, nhạc 100 %.

Không nhúng file nhạc thương mại vào repo hay vào video: tác phẩm có chủ quyền (phát hành qua All Ways Global).

## Giấy phép tài nguyên
- **Nhạc nháp**: tự tổng hợp bằng code (`scripts/phonk.py`, chỉ numpy), không dùng sample của ai.
- **Âm thanh hiệu ứng**: Kenney *Interface Sounds* (CC0) — `public/sfx/LICENSE.txt`.
- **Tranh, thẻ, bìa, icon**: chính asset tự vẽ của web (xem `apps/web/README.md`).
- **Font**: Be Vietnam Pro, Noto Serif Display (SIL OFL) qua `@remotion/google-fonts`.
- **Remotion**: miễn phí cho cá nhân và nhóm ≤ 3 người (https://www.remotion.pro/license).
