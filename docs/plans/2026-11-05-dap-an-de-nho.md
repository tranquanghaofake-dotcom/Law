# Sổ việc — Hộp đáp án dễ nhớ, màn thắp chuỗi chậm & chi tiết, tiếng mộc + hiệu ứng đúng, giọng đọc tự động

Nhánh: `claude/confident-faraday-o7ibfn` · 05/11/2026. Tự làm tuần tự (CLAUDE.md cấm fan-out cho việc < 1 ngày). Không thêm thư viện.
Hào duyệt: (a) CÓ trường dữ liệu "sơ đồ/mẹo nhớ" do người soạn, gắn nhãn "Diễn giải để học, không phải nguyên văn" — làm sau A–D nếu còn ngân sách, thí điểm Hiến pháp; (b) lời miễn trừ thu vào dòng "ⓘ Nguồn".
Kiểm tra chung: `npm run ci` xanh trước push; đổi layout → `npm run shots` 390 + 1280 px.

| Task | Việc | File | Kiểm tra | Trạng thái |
|---|---|---|---|---|
| A | Hộp đáp án gọn: cây tách định nghĩa, chip dấu hiệu, nói gọn; nguồn + miễn trừ thu gọn | ui/Feedback.svelte, ui/WhyPanel.svelte, engine/why.ts, tests | vitest why + Feedback | xong — 3061490 |
| B | Màn thắp chuỗi chậm ~1,6× + tàn lửa, nhịp lửa, chú thích hiện dần | art/StreakIgnite.svelte, ui/ignite.ts, tests | vitest ignite | xong — 88da6ce |
| C | Tiếng mộc WebAudio khớp lúc chạm + hiệu ứng đúng | fx/sfx.ts (+ fx/stampSfx.ts), SessionView, tests | vitest sfx | xong — c1b4ec0 |
| D | Đọc đề/khái niệm khi hiện; đáp án đọc sau khi trả lời | ui/session/speech.ts, SessionView, tests | vitest speech | xong — 6f541d2 |
| E | Trường `memo` (sơ đồ/mẹo nhớ) tuỳ chọn + hiển thị + thí điểm Hiến pháp | packages/content schema/types, Feedback | npm run content + vitest | xong — 3061490 (gộp với A) |


Task A: bắt đầu — base a9727a6 · Task A+E: xong — 3061490
Task B: bắt đầu — base 3061490 · Task B: xong — 88da6ce
Task C: bắt đầu — base 88da6ce · Task C: xong — c1b4ec0
Task D: bắt đầu — base c1b4ec0 · Task D: xong — 6f541d2

Quyết định: sơ đồ tự động dùng `keywords` (đã kiểm) làm nhánh, không tự tách định nghĩa thành cây — vì tách tự động hay cắt sai vế điều luật — sai thì tốn: sơ đồ nghèo hơn cho khái niệm chưa có `memo`.
Quyết định: tiếng mộc tổng hợp bằng Web Audio thay vì thêm tệp — vì không phải lo giấy phép, không tăng tải — sai thì tốn: âm "điện tử" hơn tệp thu thật; đổi sang tệp CC0 sau chỉ sửa fx/stampSfx.ts.
Quyết định: đọc đề gồm cả các phương án A/B/C/D (theo thứ tự đã xáo) — vì nghe mà không có phương án thì không trả lời được — sai thì tốn: lời đọc dài với câu tình huống.
Kiểm tra: `npm run ci` xanh (155 + 694 test); `npm run e2e` 29/29; ảnh hộp đáp án 390/1280 và màn thắp chuỗi tự chụp, đã xem.
Ngoài phạm vi (ghi lại, không sửa): `npm run shots` báo 18 dòng tương phản < AA ở gáy sách/kệ (Dân sự 1, TTDS, nhóm môn…) — có từ trước, không thuộc đợt này. Mới 5/690 khái niệm có `memo`; các môn khác cần soạn dần.
Rút kinh nghiệm: (1) Svelte 5 — effect đọc `run.i` vẫn chạy lại mỗi lần gán lại cả `run`; muốn "chỉ khi chỉ số đổi" phải qua `$derived` (test tích hợp bắt được, test hàm thuần không). (2) Thẻ trắc nghiệm xáo phương án → mọi thứ đọc/hiện phương án ngoài thẻ phải lấy thứ tự từ thẻ. (3) Sửa JSON dữ liệu bằng script phải giữ đúng thụt lề gốc (indent=1, không xuống dòng cuối) — lần đầu đổi định dạng làm diff phình 700 dòng.
