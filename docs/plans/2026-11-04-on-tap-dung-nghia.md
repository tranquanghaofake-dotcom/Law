# Sổ việc — Logic tạo đề/ôn bài: thuần thục phải qua giãn cách, rating FSRS công bằng, ôn ưu tiên sắp quên

Nhánh: `claude/loving-feynman-0pz976` · 04/11/2026 · Hào duyệt mục D của bản review ("vào việc").
Kiểm tra chung: `npm run ci` xanh trước push; đổi màn kết thúc → `npm run shots` 390 + 1280 px.
Agent: agent chính tự làm tuần tự (CLAUDE.md: không fan-out cho việc < 1 ngày).

Quyết định: thuần thục đã đạt trước đây GIỮ NGUYÊN, luật mới chỉ áp từ nay — vì Hào không chọn và hạ bậc hàng loạt là thao tác khó đảo ngược, gây tụt chức — sai thì tốn 1 migration nhỏ (hạ bậc ≥4 có `upDay` rỗng).

| # | Task | File | Kiểm tra | Trạng thái |
|---|---|---|---|---|
| 1 | Bậc ≥ 4 chỉ lên khi khác ngày với lần lên bậc trước (`upDay`) → thuần thục (bậc 5) cần ≥ 3 ngày | engine/progress.ts, engine/runner.ts, store/{db,progress-repo}.ts, ui/SessionView.svelte, routes/{Lesson,Review}.svelte | tests/engine/progress, runner, store | xong |
| 2 | `ratingFor`: mốc Hard theo độ dài đề; nhận biết không bao giờ Easy; dạng gõ/tự nhớ không bị Hard vì chậm; "Gần đúng" = Hard | engine/fsrs.ts, store/progress-repo.ts, ui/SessionView.svelte | tests/engine/fsrs | xong |
| 3 | Ôn hôm nay ưu tiên khái niệm có retrievability thấp nhất | engine/fsrs.ts, engine/session.ts, routes/Review.svelte | tests/engine/session | xong |
| 4 | Màn kết thúc: "n khái niệm nhớ chắc hơn" + giải thích luật giãn cách | ui/SessionEnd.svelte | check, shots | xong |

Task 1: bắt đầu — base 7419b6b
Task 1: xong — ea05b0d
Task 2: bắt đầu — base ea05b0d
Task 2: xong — 9e948d5
Task 3: bắt đầu — base 9e948d5
Task 3: xong — acbfa29
Task 4: bắt đầu — base acbfa29
Task 4: xong — 96dab8d (ảnh docs/plans/2026-11-04-ket-thuc-nho-chac-{390,1280}.png)
Review cuối (dp-review, opus): ĐẠT, 3 điểm nhẹ → đã sửa: Luyện đề truyền độ dài đề cho rating; runner lấy ngày theo từng câu (khớp repo khi phiên vắt qua nửa đêm); cập nhật sổ việc.

Kiểm tra cuối: `npm run ci` xanh.
Ngoài phạm vi (ghi lại, không sửa): Quiz10 ghi `subject: set.group` (group có thể không phải mã môn; hiện 0/470 câu có `concept` nên chưa chạy); tự chấm "Gần đúng" vẫn +1 bậc (chỉ đổi rating thành Hard); chưa có test SessionView truyền `rating` vào repo.record.
Rút kinh nghiệm: không task nào phải làm lại. Reviewer bắt được lệch ngày runner/repo qua nửa đêm — lần sau khi thêm luật theo ngày, brief/test phải có ca "vắt qua 00:00". `npm run shots` không chụp được màn kết thúc phiên → dùng spec Playwright tạm (xoá sau khi chụp).
