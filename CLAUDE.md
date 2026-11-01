# CLAUDE.md — Luyện Luật

Web học khái niệm luật cho sinh viên (Svelte 5 + Vite + TypeScript, dữ liệu JSON, tiến độ IndexedDB, FSRS). Chủ dự án: Trần Quang Hào, sinh viên Luật Kinh tế. Live: https://tranquanghaofake-dotcom.github.io/Law/

## Đọc gì trước khi làm
1. `docs/WORKFLOW.md` — quy trình và **ngân sách thời gian** (bắt buộc).
2. Spec liên quan trong `docs/specs/` (thiết kế đã duyệt), plan trong `docs/plans/` nếu có.
3. Không khảo sát lại toàn repo nếu việc đã có spec; bản đồ ở dưới là đủ.

## Bản đồ
- `apps/web/src/lib/{content,engine,store,game,fx,ui}` + `routes/` — xem `apps/web/README.md`.
- `packages/content/data/{subjects,concepts,sets,laws}` — nội dung; `src/{schema,types,build}.ts` — kiểm tra & sinh `dist/`.
- `apps/web/src/lib/content/{types,schema}.ts` chỉ re-export từ `@luyen-luat/content` — **import trong app giữ `$lib/content/...`**.
- CI/deploy/e2e trong `.github/workflows/`; template PR/issue trong `.github/`.

## Lệnh (chạy ở gốc)
`npm install` · `npm run dev` · `npm run content` · `npm run check` · `npm test` · `npm run build` · `npm run ci` (chuỗi CI) · `npm run e2e` · `npm run shots`.
Chromium trong container cloud: `PW_CHROMIUM=/opt/pw-browsers/chromium`. Build như Pages: `BASE_PATH=/Law/`.

## Luật làm việc
- **Ngôn ngữ**: mọi văn bản, commit, comment, UI bằng tiếng Việt **có dấu**; giữ thuật ngữ tiếng Anh khi cần.
- **Phạm vi**: 1 phiên = 1 issue/1 nhánh (`feat/ fix/ content/ docs/ chore/`). Việc mới ngoài phạm vi → ghi lại, không làm.
- **Thời gian**: checkpoint commit ≤ 45 phút; **quá 2 giờ phải dừng và báo cáo**. Không chạy e2e local trừ khi sửa luồng UI. Không fan-out nhiều agent cho việc < 1 ngày.
- **Chất lượng**: TDD cho engine/store/content; `npm run ci` xanh trước khi push; đổi layout thì chụp `npm run shots` 390 px + 1280 px.
- **Git**: không push thẳng `main`; mở PR theo template; không tạo nhánh/PR ngoài việc đang làm; không xoá file của người dùng; không tạo bản sao v2/final — sửa tại chỗ.
- **Nội dung luật**: `definition` nguyên văn, `source` + link vbpl.vn, `checked` ngày đối chiếu; ghi `data/SOURCES.md`. Đây là thông tin pháp luật chung, không phải tư vấn.
- **Không làm**: đổi stack, thêm thư viện UI, thêm ESLint/Prettier, thêm framework test khác, đổi bảng màu "Văn Miếu" nếu spec không yêu cầu.

## Phong cách trả lời cho Hào
Thẳng, ngắn, nói rõ khi giả định của Hào sai; nêu phân biệt quan trọng về thực hành kể cả khi không được hỏi; không đồng ý mặc định.
