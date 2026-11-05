# Sổ việc — Hộp đáp án dễ nhớ, màn thắp chuỗi chậm & chi tiết, tiếng mộc + hiệu ứng đúng, giọng đọc tự động

Nhánh: `claude/confident-faraday-o7ibfn` · 05/11/2026. Tự làm tuần tự (CLAUDE.md cấm fan-out cho việc < 1 ngày). Không thêm thư viện.
Hào duyệt: (a) CÓ trường dữ liệu "sơ đồ/mẹo nhớ" do người soạn, gắn nhãn "Diễn giải để học, không phải nguyên văn" — làm sau A–D nếu còn ngân sách, thí điểm Hiến pháp; (b) lời miễn trừ thu vào dòng "ⓘ Nguồn".
Kiểm tra chung: `npm run ci` xanh trước push; đổi layout → `npm run shots` 390 + 1280 px.

| Task | Việc | File | Kiểm tra | Trạng thái |
|---|---|---|---|---|
| A | Hộp đáp án gọn: cây tách định nghĩa, chip dấu hiệu, nói gọn; nguồn + miễn trừ thu gọn | ui/Feedback.svelte, ui/WhyPanel.svelte, engine/why.ts, tests | vitest why + Feedback | chưa |
| B | Màn thắp chuỗi chậm ~1,6× + tàn lửa, nhịp lửa, chú thích hiện dần | art/StreakIgnite.svelte, ui/ignite.ts, tests | vitest ignite | chưa |
| C | Tiếng mộc WebAudio khớp lúc chạm + hiệu ứng đúng | fx/sfx.ts (+ fx/stampSfx.ts), SessionView, tests | vitest sfx | chưa |
| D | Đọc đề/khái niệm khi hiện; đáp án đọc sau khi trả lời | ui/session/speech.ts, SessionView, tests | vitest speech | chưa |
| E | Trường `memo` (sơ đồ/mẹo nhớ) tuỳ chọn + hiển thị + thí điểm Hiến pháp | packages/content schema/types, Feedback | npm run content + vitest | chưa |

