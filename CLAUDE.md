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
- **Thời gian**: checkpoint commit ≤ 45 phút; **quá 2 giờ phải dừng và báo cáo**. Không chạy e2e local trừ khi sửa luồng UI.
- **Chất lượng**: TDD cho engine/store/content; `npm run ci` xanh trước khi push; đổi layout thì chụp `npm run shots` 390 px + 1280 px.
- **Git**: không push thẳng `main`; mở PR theo template; không tạo nhánh/PR ngoài việc đang làm; không xoá file của người dùng; không tạo bản sao v2/final — sửa tại chỗ.
- **Câu hỏi pháp luật**: mọi câu hỏi về pháp luật Việt Nam (kể cả câu ngắn, không phải đề thi) → gọi skill `vn-legal-exam-analysis` trước khi trả lời và làm theo nó trong cùng lượt; tra điều luật trong `packages/content/data/laws/` trước khi trích số điều.
- **Nội dung luật**: `definition` nguyên văn, `source` + link vbpl.vn, `checked` ngày đối chiếu; ghi `data/SOURCES.md`. Đây là thông tin pháp luật chung, không phải tư vấn.
- **Gửi skill dạng zip (tải lên claude.ai)**: claude.ai từ chối zip > 200 file. Chỉ đóng bằng `python3 .claude/skills/<tên>/scripts/dong_goi.py` (có ở slide-chuan, infographic, vn-legal-exam-analysis), không `git archive` / `zip -r` tay. Skill chưa có script: zip từ `git ls-files`, đếm ≤ 200 trước khi gửi; > 200 thì viết `dong_goi.py` (gộp tài nguyên lẻ vào kho JSON) rồi mới gửi.
- **Hình minh hoạ (slide, infographic, video)**: luôn **tự vẽ** bằng công cụ thích hợp (SVG viết tay theo một phong cách thống nhất, dựng hình bằng code); **không** dùng kho hình dán / icon 3D có sẵn (Fluent Emoji…) làm hình chính — Hào đánh giá "quá xấu" (11/2026). Tự vẽ xong thì **dựng slide như dựng cảnh** (chữ, sơ đồ là lớp gắn vào vật của cảnh), không cắt ảnh dán vào ô ảnh — quy ước `.claude/skills/slide-chuan/references/dung-canh.md`.
- **Không làm**: đổi stack, thêm thư viện UI, thêm ESLint/Prettier, thêm framework test khác, đổi bảng màu "Văn Miếu" nếu spec không yêu cầu.

## Agent, model, cache (tiết kiệm token)
- **Mặc định tự làm.** Subagent mới không thấy hội thoại và không đọc được cache của phiên chính (cache tách theo model và theo prefix); lợi ích duy nhất là giữ output dài (quét nhiều file, log test, tài liệu web) ngoài context chính. Đọc 1–3 file đã biết đường dẫn → tự đọc. Không fan-out nhiều agent cho việc < 1 ngày.
- **Gọi Agent thì luôn ghi `model`** — bỏ trống thì general-purpose chạy `sonnet` (mặc định đặt trong `.claude/settings.json`), Plan chạy model phiên chính: `haiku` tìm/đọc/tóm tắt file, việc cơ học (Explore trên gói subscription mặc định chạy Opus → gọi kèm `model: "haiku"`); `sonnet` viết code theo brief rõ; `opus` review/soát lỗi độc lập. `fable` và fork (luôn chạy bằng model phiên chính) chỉ dùng khi Hào yêu cầu.
- **Việc lớn, nhiều task độc lập** → đề xuất Hào gõ `/dieuphoi` (đội sẵn: dp-cohoc haiku · dp-tho sonnet · dp-review opus), không tự dựng đội.
- **Không đề xuất đổi model giữa phiên** (mỗi model một cache: đổi là đọc lại toàn bộ hội thoại không cache). Model phiên không hợp việc → nói 1 dòng để Hào chọn cho phiên sau.

## Phong cách trả lời cho Hào
Thẳng, ngắn, nói rõ khi giả định của Hào sai; nêu phân biệt quan trọng về thực hành kể cả khi không được hỏi; không đồng ý mặc định.
Báo cáo cuối lượt ≤ 5 dòng: **Đã xong** (kèm bằng chứng: lệnh nào xanh, commit nào) / **Còn** (việc triển khai tiếp theo) / **Việc Hào cần làm** (nếu có). Không dán diff, log, nội dung file dài ra màn hình — ghi đường dẫn. Giữa chừng: 1 câu khi bắt đầu bước lớn, đổi hướng hoặc gặp vướng.
