# Video giới thiệu Luyện Luật (TikTok 9:16)

Dựng bằng [Remotion](https://www.remotion.dev) theo skill `motion-video` (`.claude/skills/motion-video`, nhánh `feat/skill-motion-video`). Thư mục độc lập, **không** nằm trong npm workspaces nên không ảnh hưởng `apps/web` hay CI.

- **Bản 4:** 1080×1920, **60 fps**, 28 ô nhịp = 60,5 giây, mạch A: một câu hỏi đặt cọc đi xuyên suốt. Xem `STORYLINES.md`, `SPEC.md`, `FACTS.md`, `REVIEW.md`.
- **Nhịp:** theo **"Aura Farming" — Mustafa Saboori (bản gốc)**, 111 BPM, cụm 8 ô, bass tắt 1,5 phách cuối cụm. Đo bằng `do_nhip.py` của skill trên bản nghe thử chính thức; bản nghe thử không lưu trong repo.
- **Nội dung:** `src/storyboard.json` sinh từ `scripts/storyboard.mjs`. Số liệu và nội dung khái niệm Đặt cọc đọc thật từ `packages/content/data` qua `scripts/stats.mjs`.
- **Hiệu ứng:** `src/core`, `src/scenes`, `src/Main.tsx` (template của skill). Mắt cắt đầu cụm dùng dấu § son của thương hiệu, không dùng light leak/glow.

## Asset lấy từ chính web
`npm run capture` (cần build web trước: ở gốc `BASE_PATH=/Law/ npm run build`) sinh `public/cap/` (không commit):
- `harness/` là một trang Vite riêng mount thẳng component Svelte của `apps/web` (không sửa web): thẻ chuyên cần, màn thắp chuỗi, tủ trưng bày chức danh + màn nhận chức, bìa sách 23 môn, tranh kiến trúc.
- Bản quay câu 3 bộ đề Đặt cọc (`quiz-6tr`) quay bằng `quay_web.mjs` của skill, có bước `pre` trả lời 2 câu đầu.
- Quay theo **thời gian ảo** để đủ 60 khung/giây đều đặn (ý tưởng từ [tungs/timesnap](https://github.com/tungs/timesnap), BSD-3-Clause — tự viết lại).

## Lệnh (chạy trong `tools/video`)
```bash
npm install
npm run capture       # quay/chụp asset từ web → public/cap/
npm run storyboard    # đếm số liệu + sinh src/storyboard.json
npm run studio        # xem trước
npm run render        # bản ĐĂNG: không nhạc, chỉ hiệu ứng âm thanh → out/gioi-thieu-dang-tiktok.mp4
npm run render:nhap   # bản NHÁP: trộn nhạc dò nhịp 111 BPM (tự tổng hợp, không phải bài thật) → out/gioi-thieu-nhac-nhap.mp4
```

## Đăng TikTok
1. Tải `out/gioi-thieu-dang-tiktok.mp4` lên, chọn **Âm thanh → "Aura Farming" (Mustafa Saboori)** trong thư viện TikTok (đã có giấy phép dùng trên TikTok).
2. Kéo đoạn nhạc sao cho video bắt đầu **đúng phách đầu một cụm**: chỗ bass vừa trở lại sau khoảng lặng ngắn (~0,8 giây). Kiểm tra: mắt cắt § ở **0:17,3 · 0:34,6 · 0:51,9** phải trùng chỗ bass trở lại; số chuỗi đổi 74 → 75 ở 0:43,2; nhận chức ở 0:54,1.
3. Âm lượng: âm thanh gốc (hiệu ứng) ~30–40 %, nhạc 100 %.

Không nhúng file nhạc thương mại vào repo hay vào video: tác phẩm có chủ quyền (phát hành qua All Ways Global).

## Giấy phép tài nguyên
- **Nhạc nháp**: tự tổng hợp bằng code (`scripts/phonk.py`, chỉ numpy), không dùng sample của ai.
- **Âm thanh hiệu ứng**: Kenney *Interface Sounds* (CC0) — `public/sfx/LICENSE.txt`.
- **Tranh, thẻ, bìa, icon**: chính asset tự vẽ của web (xem `apps/web/README.md`).
- **Font**: Be Vietnam Pro, Noto Serif Display (SIL OFL) qua `@remotion/google-fonts`.
- **Remotion**: miễn phí cho cá nhân và nhóm ≤ 3 người (https://www.remotion.pro/license).
