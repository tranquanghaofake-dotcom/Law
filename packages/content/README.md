# @luyen-luat/content — kho nội dung luật

Dữ liệu học của Luyện Luật, tách khỏi app để cập nhật luật không đụng code. Mọi file trong `data/` được kiểm tra bằng schema zod; file lỗi **không lên web**.

```
data/subjects/<môn>.json          chương → đợt (4–5 khái niệm/đợt)
data/concepts/<môn>/<id>.json     một khái niệm: định nghĩa nguyên văn, giải thích, ví dụ, nguồn, items theo bậc
data/sets/<id>.json               bộ luyện đề 10 câu (định dạng kế thừa v1)
data/laws/<văn-bản>.txt           toàn văn để test đối chiếu nguyên văn (không ship lên web)
data/SOURCES.md                   nguồn đã dùng
src/schema.ts · src/types.ts      zod + kiểu TS (app import qua @luyen-luat/content)
src/build.ts                      kiểm tra + sinh dist/ (subjects, concepts, sets, index.json)
tests/                            schema, build, nguyên văn Hiến pháp
```

## Lệnh (ở gốc repo)
```bash
npm run content          # kiểm tra và sinh packages/content/dist (< 1 s)
```
```bash
npm test -w @luyen-luat/content
```

## Thêm nội dung
1. **Khái niệm**: tạo `data/concepts/<môn>/<id>.json` theo mẫu `data/concepts/hien-phap/hien-phap.json`. Bắt buộc: `definition` nguyên văn điều luật (hoặc sử liệu), `source` (`kind`, `cite`, `url` vbpl.vn), `checked` (ngày đối chiếu), ít nhất 1 item bậc 1 (`mcq`), bậc 3 (`cloze`) và bậc 4 (`case`/`truefalse`); nên có `pair` (bậc 2) và `recall` (bậc 5). `id` trùng tên file, `subject` trùng tên thư mục.
2. **Đợt/chương**: thêm vào `data/subjects/<môn>.json`; mỗi đợt 4–5 khái niệm; `confusables` phải là id có thật trong cùng môn.
3. **Bộ 10 câu**: `data/sets/<id>.json` (`q, options×4, answer, explain, basis, url`), thêm `concept` nếu muốn cộng vào bộ nhớ.
4. **Môn mới**: thêm toàn văn vào `data/laws/` và một test đối chiếu như `tests/hien-phap.test.ts`.
5. `npm run content` → sửa hết lỗi → ghi nguồn vào `data/SOURCES.md` → PR nhánh `content/<môn>`.

Thẻ `pair`: `left`/`right` là **nhãn hiển thị** (tên khái niệm), không phải id.

Văn bản pháp luật không thuộc phạm vi bảo hộ quyền tác giả (Điều 15 Luật SHTT); giáo trình/đề thi chỉ tham khảo cấu trúc, không sao chép.
