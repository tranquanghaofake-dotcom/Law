# Sổ việc — Logic tạo đề/ôn bài: thuần thục phải qua giãn cách, rating FSRS công bằng, ôn ưu tiên sắp quên

Nhánh: `claude/loving-feynman-0pz976` · 04/11/2026 · Hào duyệt mục D của bản review ("vào việc").
Kiểm tra chung: `npm run ci` xanh trước push; đổi màn kết thúc → `npm run shots` 390 + 1280 px.
Agent: agent chính tự làm tuần tự (CLAUDE.md: không fan-out cho việc < 1 ngày).

Quyết định: thuần thục đã đạt trước đây GIỮ NGUYÊN, luật mới chỉ áp từ nay — vì Hào không chọn và hạ bậc hàng loạt là thao tác khó đảo ngược, gây tụt chức — sai thì tốn 1 migration nhỏ (hạ bậc ≥4 có `upDay` rỗng).

| # | Task | File | Kiểm tra | Trạng thái |
|---|---|---|---|---|
| 1 | Bậc ≥ 4 chỉ lên khi khác ngày với lần lên bậc trước (`upDay`) → thuần thục (bậc 5) cần ≥ 3 ngày | engine/progress.ts, engine/runner.ts, store/{db,progress-repo}.ts, ui/SessionView.svelte, routes/{Lesson,Review}.svelte | tests/engine/progress, runner, store | chờ |
| 2 | `ratingFor`: mốc Hard theo độ dài đề; nhận biết không bao giờ Easy; dạng gõ/tự nhớ không bị Hard vì chậm; "Gần đúng" = Hard | engine/fsrs.ts, store/progress-repo.ts, ui/SessionView.svelte | tests/engine/fsrs | chờ |
| 3 | Ôn hôm nay ưu tiên khái niệm có retrievability thấp nhất | engine/fsrs.ts, engine/session.ts, routes/Review.svelte | tests/engine/session | chờ |
| 4 | Màn kết thúc: "n khái niệm nhớ chắc hơn" + giải thích luật giãn cách | ui/SessionEnd.svelte | check, shots | chờ |

Task 1: bắt đầu — base 7419b6b
