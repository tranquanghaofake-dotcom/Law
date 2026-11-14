---
name: slide-chuan
description: "Use when the user wants a slide deck built from their material (docx, pdf, pptx cũ, ghi chú) or from a topic — file PowerPoint (.pptx) sửa được chữ, có minh hoạ, chất liệu theo môn học, hiệu ứng và Morph, font nhúng sẵn — làm slide, bài thuyết trình, PPT cho tiểu luận, bình luận bản án, báo cáo số liệu, bài giảng, slide bảo vệ khóa luận/NCKH — or wants a deck made with this skill fixed (tràn chữ, bố cục rối, thiếu ảnh, mạch bài khó theo dõi, nhìn nhạt, kém bắt mắt, nhìn rập khuôn). Also matches unaccented requests (lam slide, bai thuyet trinh, lam ppt, slide bao ve). Not for editing or reading an arbitrary existing .pptx file (use the pptx skill), infographic A4 (use infographic), or video (use motion-video)."
---

# slide-chuan

Nguyên tắc: **AI chỉ viết nội dung (`deck.json`); bố cục, chất liệu của môn, màu, font, hiệu ứng do skill lo.** Không vẽ tay từng slide, không tạo ảnh AI — chỉ dùng hình vẽ bằng code có sẵn (hình lớn của da, `meta.motif`, biểu đồ, bản đồ, khối giấy tờ), icon (`react-icons`), hình dán Fluent Emoji, cảnh dựng sẵn và ảnh thật có giấy phép (bước 5).

Câu hỏi gốc của mỗi slide: **người nghe nhìn 10 giây thì hiểu được điều gì?** Slide không phải bản tóm tắt tài liệu — tài liệu đầy đủ để ở `notes`.

## Nguyên tắc trước quy trình (đọc đầu tiên)
- **Mục tiêu là deck người xem thấy đẹp và hiểu được; quy trình chỉ là công cụ.** Khi một quy tắc, danh sách type hay kế hoạch đã duyệt xung đột với mục tiêu, giữ mục tiêu, sửa kế hoạch và nói lý do trong báo cáo — không giữ nguyên kế hoạch rồi giao deck sơ sài.
- **Che chữ vẫn phải đoán được đề tài.** Mỗi deck mang **da của môn** (mục dưới) + 4–8 cảnh + ảnh thật / hình dán đúng chủ đề. Nền, khung chung (`"da": "none"`) chỉ khi người dùng tự chọn — lỗi này đã bị chê ở 4 bài (`references/loi-da-biet-2026-11.md` L10).
- **Mỗi chi tiết một lý do.** Chi tiết nào (màu, chấm, dải, vật, hoạ tiết) cũng phải chở dữ liệu, điều hướng, nhận diện đề tài hoặc phân loại theo một mã cố định cả deck; không nói được nghĩa thì bỏ. Đỏ chỉ cho điều tiêu cực thật; không vẽ vật cạnh ảnh đã có vật đó (`references/nguyen-tac-bo-cuc.md` mục 8).
- **Đừng tin một tính năng chỉ vì tài liệu nhắc tên nó.** `dung.js` in `⚠` / `ℹ` cho trường bị bỏ qua, type gõ sai, ảnh thiếu — đọc và xử lý trước khi giao.

## Đầu ra: một file PowerPoint
```
node hinh/dung.js <deck.json> [out.pptx] [--soat] [--strict] [--chuyen=morph|fade] [--mau=son|luc|lam|nau] [--khong-nhung-font] [--html]
node hinh/dung.js <deck.json> --titles
```
→ `<tên>.pptx` + `<tên>_ghi-cong.md` (ghi công ảnh / icon để dán vào bản Word) + thư mục `<tên>_lop/` (trang trung gian, ảnh từng slide, tờ soát). Bản in cho người trình bày tập: `<tên>_ghi-chu.pdf` (`--soat` tự dựng; chạy riêng: `python3 scripts/ban_ghi_chu.py <tên>.pptx`) (mỗi slide một trang A4: ảnh slide, tiêu đề, ghi chú, số giây nói; slide nhánh sai của trắc nghiệm không cộng vào tổng thời lượng).

- **Chữ** là hộp chữ thật, gõ lại được; Anton + Be Vietnam Pro **nhúng trong file**. **Hình** (thẻ, hình dán, biểu đồ, giấy tờ, chất liệu da) là **lớp ảnh rời** — dời, xoay, xoá, đổi hiệu ứng được; không sửa nét bên trong. Đổi số liệu biểu đồ: sửa `deck.json` rồi dựng lại.
- **Khả năng tiếp cận**: ảnh mang chữ thay thế từ `photoAlt` / `alt` / `cutoutAlt` (ghi đủ — không ghi thì trình đọc màn hình chỉ đọc "Khung của: …"); lớp thuần trang trí (nền thẻ, viên nhãn, thanh tiến độ…) gắn cờ *decorative* của Office 2019+ để trình đọc màn hình bỏ qua. Hộp chữ tiêu đề thành placeholder tiêu đề; slide mà tiêu đề hiện ra là một mảnh hoặc trùng nhau (slide phản hồi "Chưa đúng" của `quizgo` / `bhhoi`, câu hỏi tách hai khối của `bhdo`) có thêm tiêu đề đầy đủ đặt ngoài khung slide (`data-tieu-de-an`) — cách Microsoft hướng dẫn; đừng xoá hộp nằm phía trên slide. Số hiệu pháp lý, số + đơn vị, từ ghép nối bằng dấu cách không ngắt — hộp Find của PowerPoint có thể coi dấu cách này khác dấu cách thường: tìm theo một từ ("Điều") thay vì cả cụm.
- **Chuyển động** (tính năng gốc PowerPoint): từng khối vào lần lượt theo tính cách da (đóng dấu, lật lịch, trượt…), Morph giữa các slide, số đếm, liên kết bấm được. `meta.hinh = { "chuyen": "morph", "nhip": 110 }` (nhịp = ms giữa hai khối); slide riêng: `trans`, `dur`.
  **Máy quay** (`data-cam` trên slide, `hinh/may_quay.js`): khi Morph vào slide, cả cảnh trôi cùng một hướng (`pan:1,0`) hoặc phóng vào hình chính (`zoom:k,x,y`) như Flashslide — vật không có cặp được nhân một bản đặt ngoài khung slide kia (cùng tên `!!…`); `data-sau` trên vật = thị sai (vật gần trôi nhanh hơn, `0` = đứng ngoài máy quay, giữ hiệu ứng vào). Trong PowerPoint, các vật nằm ngoài khung slide là bản ghép Morph — đừng xoá. Bộ `bh*` dùng sẵn; `xem_morph.js` mô phỏng được.
- **Kiểm trước khi dựng** (`hinh/kiem_noi_dung.js`): lỗi cấu trúc / type lạ / ảnh không có → dừng, mã 2; cảnh báo nội dung (giới hạn chữ, ảnh nhỏ, thiếu ghi công, ghi chú thiếu, thời lượng lệch, dàn ý chưa phủ, Bước 0, **căn cứ pháp lý sai**) → `--strict` dừng, mã 3. Căn cứ: mọi "điểm / khoản / Điều N" trên slide và trong ghi chú được đối chiếu với kho luật (`packages/content/data/laws`, bộ đối chiếu của skill `vn-legal-exam-analysis`); "Điều 66" trần hiểu là điều của luật chính — nguồn pháp luật đầu tiên còn hiệu lực trong `prep.json`, hoặc `meta.law`. Dẫn đích danh điều / khoản / điểm không có → cảnh báo; suy theo ngữ cảnh, bản cũ hơn kho, nguyên văn lệch → gợi ý; "khớp kho" vẫn chưa phải đối chiếu vbpl.vn. Deck dẫn "Điều N" mà không chỗ nào ghi số hiệu văn bản → cảnh báo; thiếu tình trạng hiệu lực hoặc câu "không phải tư vấn" → gợi ý. `--titles` chỉ in mạch tiêu đề, không dựng. Khi dựng, mỗi slide được theo dõi trường nào thật sự được đọc: `ℹ Trường có trong deck.json nhưng không mẫu nào đọc` = gõ sai tên hoặc type đó không vẽ trường này — sửa tên, đổi type, hoặc xoá trường (đừng để dữ liệu "chết" trong deck). Khoá `meta` không bước nào đọc → `ℹ meta không bước nào đọc` ở cuối bản dựng.
- **Kiểm sau khi dựng** (`--soat`): tràn, chữ bị lớp ảnh đè, hai hộp chữ đè nhau (mã thoát 1) · PPTX lệch HTML · font thiếu ký tự · tờ soát `<tên>_lop/soat-*.jpg` (trái: thiết kế · phải: PPTX dựng lại qua LibreOffice) · ảnh "nhìn mờ" (xoá chữ + làm mờ) · **soát chi tiết** (`scripts/soat_chi_tiet.js`: chữ lệch nhau 4–10 px — gần thẳng mà không thẳng; chữ dưới 4,5 : 1 / chữ lớn dưới 3 : 1 trên nền thật, kể cả nền ảnh; dòng mồ côi một chữ; ✂ nét vẽ dọc cắt qua chữ; viên nhãn có nền thì so mép viên). Bảng thông báo đầy đủ: `references/canh.md` mục 6.
- **Bản giao người dùng phải qua `--strict` và `--soat` sạch**, rồi mở từng tờ soát và ảnh nhìn mờ bằng mắt.
- **Nói với người dùng khi giao** (môi trường dựng không có PowerPoint, ba điều này chỉ kiểm được cấu trúc): (1) mở bằng PowerPoint 2019 / Microsoft 365 — bản cũ, LibreOffice, Google Slides không chạy Morph và không đọc font nhúng; (2) file tải về phải bấm **Enable Editing** rồi mới xem phông; (3) lần đầu, nhờ họ báo lại phông, Morph, hiệu ứng có chạy đúng không. Làm việc với OneDrive / Microsoft 365: `references/microsoft-365.md`. (4) nếu cần nộp bản đạt chuẩn khả năng tiếp cận: PowerPoint → Review → Check Accessibility — mỗi slide đã có tiêu đề, ảnh có chữ thay thế, nền trang trí đã đánh dấu decorative; báo lại nếu bộ kiểm còn mục nào.
- Cần Playwright có Chromium (`PW_CHROMIUM=<FILE chạy được, ví dụ /opt/pw-browsers/chromium>`; không đặt thì tự dò). `--soat` cần thêm LibreOffice + `pdftoppm`.

## Da theo môn — chất liệu phủ mọi slide (`meta.da`)
Một da đổi CẢ deck: màu, nền, khung slide, vỏ thẻ, kiểu nhãn, ô số, thanh tiến độ, đồ vật tiền cảnh, hình lớn ở bìa / chương / kết, cách khối hiện ra. Da không đổi chữ. Mã: `hinh/da.js`; đồ vật `hinh/do_vat.js`; hình lớn `hinh/art.js`.

| `da` | Môn / đề tài | Vật thấy được | Khối hiện ra |
|---|---|---|---|
| `so-bhxh` | An sinh xã hội, BHXH, BHYT, BHTN, lương hưu | sổ, xu, con dấu; hình sổ BHXH | đóng dấu |
| `bang-cong` | Lao động, tiền lương, thời giờ làm việc | xu, sổ, máy tính; thẻ nhân viên | lật lịch |
| `cang-bien` | Thương mại quốc tế, vận tải, hải quan, logistics | container, thanh, xu; bến cảng | trượt vào |
| `ban-ve` | Đất đai, nhà ở, xây dựng, bất động sản | thước, bút chì; lưới bản vẽ | vẽ nét |
| `hoa-don` | Thuế, kế toán, phí – lệ phí | máy tính, xu, kẹp; hoá đơn | giấy rơi xuống |
| `sao-ke` | Ngân hàng, tín dụng, chứng khoán, thanh toán | thẻ ngân hàng, xu; sổ tiết kiệm | trượt vào |
| `co-cau` | Doanh nghiệp, cổ phần, M&A, quản trị công ty | thanh, ghim, thẻ; sơ đồ sở hữu | bật ra |
| `bien-ban` | Tố tụng, xử phạt vi phạm hành chính | con dấu, kẹp, bút; hồ sơ niêm phong | đóng dấu |
| `bc` | Hình sự (đi cùng kiểu `bc*`, `references/canh.md` mục 8) | bảng bần, giấy ghim, dây đỏ, thẻ tang vật | rơi xuống |
| `qt` | Công pháp quốc tế (kiểu `qt*`, mục 9) | bản đồ chấm, văn kiện dấu xi, bảng tên phái đoàn | nổi lên |
| `ho-so` | Chung — bình luận bản án, dân sự, hợp đồng | kẹp, bút, kính lúp; cán cân | rơi xuống |
| `giay` | Chung — bài giảng, tiểu luận, kỹ năng | bút chì, thước, ghim; sách | nổi lên |
| `kinh` | Chung — báo cáo, số liệu, công nghệ | quả cầu, thanh, xu; tài liệu | nổi lên |

- **Chọn da**: `meta.da` → deck dùng kiểu `bc*` / `qt*` → `meta.kit` cũ (`file`/`paper`/`glass` đọc thành `ho-so`/`giay`/`kinh`) → từ khoá đề tài khớp da của môn → `meta.kind` (`case` → `ho-so`, `lecture` → `giay`, `report` → `kinh`). `dung.js` in da đã chọn và lý do; tự chọn thì nhắc ghi `meta.da` để cố định.
- **Môn chưa có da riêng** (da chung `ho-so` / `giay` / `kinh`): báo người dùng ở Bước 0 — *"Môn này chưa có da riêng: deck dùng da chung `giay`. Chọn: (a) thêm da mới cho môn, khoảng N giờ; (b) dùng da chung."* Thêm da = một khối trong `hinh/da.js` (màu, nền, khung, vỏ thẻ, nhãn, ô số, đồ vật, hình lớn, kiểu hiện) theo `references/the-gioi-hinh-anh.md`.
- `"da": "none"` = nền, khung chung → `⚠ Nền chung`, `--strict` dừng — trừ khi `prep.json` ghi `chapNhanNenChung: true` (chỉ khi người dùng tự chọn).
- **Bảng màu** (`--mau=` hoặc `meta.hinh.mau`: `son` · `luc` · `lam` · `nau`) chỉ dùng khi `"da": "none"`; có da thì màu của da thắng.
- **Hoạ tiết nền** `meta.motif` (một tên hoặc 2 tên): `cadastral` bản đồ địa chính (+ `meta.motifLabel`), `certificate` hoa văn giấy chứng nhận, `landscape`, `contour` đường đồng mức, `dots`, `lines`, `grid`, `waves`, `blobs`, `none` — đặt dưới lớp da ở slide không có ảnh. Chỉ dùng khi hoạ tiết nói được điều gì về đề tài.
- **Kiểm da bằng mắt**: `python3 scripts/nhin_mo.py <file.pptx>` (xoá chữ + làm mờ — đoán ra đề tài không?) hoặc `python3 scripts/nhin_mo.py --da deck.json` (cùng deck ở nhiều da, kèm điểm khác nhau; < 6 = khó phân biệt).

## Quy trình (theo đúng thứ tự)

0. **Gói chuẩn bị — BẮT BUỘC với mọi deck, xong và được người dùng duyệt rồi mới viết `deck.json`.** Mục đích: chốt mọi thứ trước, không sửa giữa chừng.
   - `python3 scripts/prep.py init <thư_mục_deck> --kind lecture|case|report --minutes N --topic "..."` → `prep.json` (đã ghi sẵn `da` gợi ý theo đề tài). Loại bài quyết định khung:
     | `kind` | Khung | Da mặc định |
     |---|---|---|
     | `lecture` (bài giảng) | cover → statement (ý cốt lõi) → agenda (câu hỏi chương) → section mỗi phần → khái niệm + ví dụ → (môn có tính toán: **`formula` công thức → `exercise` đề → `calc` lời giải**) → **`quiz` / `quizgo` kiểm tra** → closing (trả lời agenda + chuẩn bị bài sau) → end | `giay` |
     | `case` (bình luận bản án, vụ việc) | cover → statement (nghịch lý) → agenda (câu hỏi pháp lý) → … → cards bài học → closing (answers + verdict + rec) → end | `ho-so` |
     | `report` (báo cáo, số liệu) | cover → statement (phát hiện chính) → … chart/table số liệu thật … → closing (lessons + rec) → end | `kinh` |
   - **Thế giới hình ảnh (BẮT BUỘC với `report` / `lecture`)** — `prep.json` → `world`: ≥ 8 vật người học thấy tận mắt → 1 vật chủ đạo + 2 vật phụ (`references/the-gioi-hinh-anh.md`). Dùng để chọn `da`, khối hình chính (`sheet`, `receipt`…), ảnh, hình dán.
   - **`da`** — da theo môn (mục trên); môn chưa có da riêng thì nói thẳng trong tin nhắn xin duyệt (hai lựa chọn a / b). `prep.py check` chặn da trống, sai tên, hoặc `none` khi người dùng chưa đồng ý.
   - Điền đủ: `topic`, `audience`, `minutes` (chưa biết thì HỎI) · `sources` — tài liệu gốc, giáo trình, **văn bản luật ghi `"legal": true` + `status`** (hiện hành / hết hiệu lực / dự thảo / học thuật / chưa kiểm) · `unsure` — điều chưa kiểm chứng được (sẽ ghi rõ trên slide) · `assets.photos` — ảnh đã tìm theo brief (bước 5) **và đã chấm điểm bằng mắt** · `assets.missing` — CHỈ hình skill CHƯA có (ghi lại để bổ sung sau; deck này dùng cách khác — **không sửa skill giữa lúc làm deck**) · `plan` — mỗi slide một dòng `{slide, question, title (= câu kết luận), type, covers}` (chính là storyboard bước 2).
   - `python3 scripts/prep.py check <thư_mục_deck>` → hết mục thiếu. `python3 scripts/prep.py summary <thư_mục_deck>` → gửi bản tóm tắt (`prep.md`) cho người dùng.
   - **Chỉ khi người dùng nói duyệt**: `python3 scripts/prep.py approve <thư_mục_deck> --by "Tên"`. Không tự duyệt thay người dùng. Người dùng sửa gì → sửa `prep.json` rồi gửi lại.
   - `dung.js` đọc `prep.json` (cạnh deck.json, hoặc `meta.prep`): thiếu / chưa duyệt / số slide lệch kế hoạch > 25% / da, thời lượng lệch → cảnh báo, `--strict` dừng; slide đổi type so với kế hoạch → gợi ý (nêu lý do khi báo người dùng). Dựng nháp không `--strict` vẫn được để xem trước.
   - Nguồn là bài giảng cũ (.pptx): `scripts/outline.py` đọc thẳng file .pptx (tiêu đề slide = đề mục; bỏ số trang, chữ mẫu).

1. **Đọc tài liệu** → rút mạch kể: vấn đề → các bên/diễn biến → 2–4 câu hỏi → trả lời từng câu → đánh giá → kết luận.
   - **Hỏi thời lượng thuyết trình** (chưa biết thì giả định 15 phút và nói rõ). Số slide ≈ phút × 0,9–1,5 (40–65 giây/slide): 10 phút ≈ 9–15 slide, 15 phút ≈ 14–22, 20 phút ≈ 18–30. Ghi `meta.minutes`; ghi chú thuyết trình phải đủ thời lượng đó (~160 tiếng/phút; hoạt động trên lớp cộng riêng: `activitySec`, mặc định `exercise` 120 s, câu hỏi 60 s) — cảnh báo khi lệch > 25%.
   - **Rút dàn ý để không bỏ sót**: `python3 scripts/outline.py <tài_liệu.docx|pdf|md|pptx> <thư_mục_deck>/outline.json`. Ghi `"meta": {"outline": "outline.json"}`; mỗi slide ghi `"covers": ["1.2", "3.3.2"]`; mục cố ý bỏ ghi lý do ở `"meta": {"skip": {"1.1": "khái niệm đã quen thuộc"}}`. `dung.js` in "Đối chiếu dàn ý: x/y mục" và cảnh báo từng mục chưa có slide — **không được im lặng bỏ một phần của bài**. Mục chiếm > 12% tài liệu mà chỉ 1 slide → gợi ý tách.
2. **Viết storyboard trước khi viết JSON**. Mỗi slide một dòng: `# | người nghe đang thắc mắc gì | câu trả lời (= tiêu đề) | bằng chứng nhìn thấy được (= type)`.
   - Mỗi slide **một ý**. Hai ý → hai slide. Đọc liền các tiêu đề phải thành một câu chuyện có lập luận; không được thì sửa storyboard.
   - Viết xong `deck.json`, chạy `node hinh/dung.js deck.json --titles` → mạch kicker + tiêu đề, kèm cảnh báo tiêu đề dạng nhãn / câu hỏi / trùng. Đọc mạch này trước khi soát hình.
3. **Chọn type theo câu hỏi người nghe**, không theo hình thức của tài liệu.
   **Cảnh** — 11 type dựng sẵn vật thật, hình dán, Morph, số đếm, liên kết; mỗi deck 4–8 cảnh: điều luật cụ thể → `book` (mở sách, kính lúp soi tới điều) rồi `bigq` (câu hỏi lớn) và `lawquote` (trích nguyên văn có nét bút; cụm `[ ]` nằm trọn một dòng) · chọn câu hỏi để nhảy → `picks` · so mức / ngưỡng / thời hạn → `tiles` (cột ô + số đếm), `strip` (dải N ngày) · tình huống → `cases`, `chain` (tình huống → kết luận → hệ quả) · kiểm tra → `quizgo` (bấm đáp án; `whyNot` = vì sao từng phương án sai, mỗi phương án một slide phản hồi) · chốt ý → `recap` · hỏi đáp → `toc` (mục lục ảnh). Hình sự: 16 kiểu `bc*`; Công pháp quốc tế: 3 kiểu `qt*`. Cú pháp, giới hạn, thứ tự để Morph có nghĩa: **đọc `references/canh.md` trước khi viết cảnh**.
   **65 type thường** (da phủ lên tất cả):
   | Người nghe cần thấy | type |
   |---|---|
   | Ai liên quan đến ai, cái gì chuyển từ đâu sang đâu | `flow` |
   | Nhiều nguồn đổ vào MỘT quỹ / đích rồi chia ra nhiều hướng (quỹ BHXH, ngân sách) | `funnel` — `flow` với ≥ 2 mũi tên cùng đổ về một nút sẽ rối |
   | Công thức tính (trợ cấp, thuế, tiền phạt, lãi) | `formula` (+ `example` = một dòng thay số) — KHÔNG ép công thức thành `steps` |
   | Đề bài tập để người học tự làm trên lớp | `exercise` → slide sau `calc` (lời giải) |
   | Lời giải có số trung gian, đáp số là số tiền dài (1.125.000 đ) | `calc` — `bignum` chỉ nhận số ≤ 3 ký tự |
   | Mỗi điều kiện / dấu hiệu ứng với một hệ quả / căn cứ cụ thể | `match` (đối ứng hai cột) — `hub` chỉ cho thấy các yếu tố quanh một tâm |
   | Luật cũ → luật mới theo nhiều quy định | `changelog` (Mới / Đổi / Bỏ / Giữ; tên hai văn bản ở `colOld` / `colNew`) — một thay đổi thì `compare` |
   | Một người / một hồ sơ đi qua nhiều sự kiện, mỗi sự kiện một chế độ | `journey` |
   | Bảng ôn tập: 3–5 đối tượng × 2–3 câu hỏi cố định | `cheatsheet` — tra số liệu nhiều cột thì `table` |
   | Kiểm 2–6 điều kiện cần rồi ra một kết luận | `checklist` (+ `verdict`) — hệ quả rẽ nhánh thì `tree` |
   | Một chủ đề nhiều mặt, có một ý / con số chính nổi bật | `bento` — các mặt ngang hàng thì `cards` |
   | Ai được, ai mất bao nhiêu | `ledger` |
   | 3–4 bên, mỗi bên hai tầng chữ có quan hệ (hậu quả → bài học) | `cards` + `labels: ["Hậu quả", "Lẽ ra nên"]` |
   | Chuyện gì xảy ra lúc nào | `scene` (+ `timelines`) |
   | Hai phía / hai cấp xử / hai luật khác nhau ở đâu | `duel`, `compare` |
   | Một vấn đề có hai cách hiểu | `fork` |
   | Một con số quyết định + điều kiện | `bignum` (+ `days` vẽ lịch từng ngày cho khoảng ngày ngắn) |
   | Kết luận dựa trên chứng cứ, trích dẫn | `evidence` |
   | Tổng kết đúng/thiếu | `scorecard` |
   | 2–4 con số ngang hàng, mỗi số một nhãn | `stats` |
   | So độ lớn / tỉ trọng / xu hướng theo năm / giai đoạn (có số liệu thật) | `chart` + `insight` — kind: `column` (theo năm, ≤ 12 mốc; `why` tại năm, `value2` + `series`, `bands`, số âm tự đỏ) · `bar` · `line` · `step` (giữ nguyên rồi nhảy nấc, tới 20 mốc; `base`) · `waterfall` (cộng trừ ra số cuối; cột `total`) · `gantt` (thời hạn tính bằng ngày từ mốc chung) · `progress` (tỉ lệ hoàn thành + `target`) · `donut` (≤ 4 lát) · `slope` (trước → sau) · `span` (ngày dd/mm/yyyy). Mọi kind nhận `annotate: {item, text}` (khoanh + mũi tên viết tay) và `items[].hatch` (gạch chéo = chưa chắc / ước tính; ghi nghĩa ở `note`) |
   | Một ngưỡng / tỉ lệ % (75% đồng thuận, 2/3 biểu quyết) | `share` |
   | Một số tiền / số người nên ĐẾM được, nhất là phần MẤT | `isotype` (phần mất là khung rỗng nét đứt) |
   | Ai ở đâu, trên thửa nào (hiện trạng vụ việc nhà đất) | `iso` |
   | MỘT con số là bước ngoặt của cả bài | `hero` (+ `photo` = số trên ảnh tối) — tối đa 1–2 slide/deck |
   | Một điều luật bị sửa câu chữ — chữ nào bỏ, chữ nào thêm | `redline` |
   | Thời hạn dài tính bằng tháng / năm: đã trôi bao nhiêu, còn bao nhiêu | `deadline` (ghi rõ `from` / `to`) — < 45 ngày thì `bignum` + `days` |
   | Tra cứu giá trị chính xác theo nhiều thuộc tính (≥ 3 hàng × ≥ 2 cột) | `table` (+ `focus`/`note`) |
   | Khoảnh khắc cảm xúc / lời kết, có ảnh thật đúng chủ đề | `photo` |
   | Ở đâu / đi qua những nơi nào; quy định khác nhau theo tỉnh | `map` + `places` / `groups` |
   | Đối tượng thật + 2–3 ý / 2–3 con số về nó | `split` / `photostats` |
   | 2–3 ảnh hiện trạng; 4–5 ảnh bối cảnh; 3–5 giai đoạn có ảnh | `gallery` / `mosaic` / `photostrip` |
   | Kiểm tra hiểu bài (A–D, slide hỏi rồi slide đáp án) | `quiz` (`reveal`, `answer`, `why`, `whyNot` — bẫy "luật cũ") hoặc cảnh `quizgo` |
   | Mốc thời gian không có ngày chính xác | `timeline` |
   | Một đối tượng nhìn từ 2–3 góc độ pháp lý | `panelrows` (+ `cutout`) |
   | Cái nào trên cái nào (thứ bậc văn bản, cấp toà) | `pyramid` |
   | Làm gì trước, gì sau, mỗi bước bao lâu | `steps` (+ `when`) |
   | Kết quả phụ thuộc HAI tiêu chí cùng lúc | `matrix` 2×2 |
   | Hai chế định giống nhau ở đâu, khác nhau ở đâu | `venn` — không có điểm chung → `compare` |
   | "Nếu … thì …" | `tree` (+ `focus`) |
   | Một câu nguyên văn là cả luận điểm | `quote` (+ `cutout`, `by`) |
   | Ảnh là chứng cứ, chỉ từng chi tiết | `frame` (điểm đánh số) / `lens` (kính lúp một chi tiết) |
   | Cùng một đối tượng ở hai thời điểm | `beforeafter` |
   | 2–3 ảnh về nhiều mặt của MỘT sự việc | `collage` |
   | Một câu khẳng định ở bước ngoặt, có ảnh bối cảnh mạnh | `headline` — tối đa 1–2/deck |
   | Chuỗi theo năm cần lý do / căn cứ ở TỪNG dòng | `sheet` — khối hình chính của da `so-bhxh` |
   | Thời hạn tính bằng ngày trong một tháng | `calendar` — da `bang-cong` |
   | Bên nào chịu đến chặng nào (Incoterms) | `riskbar` — da `cang-bien` |
   | Thửa đất / căn nhà có kích thước, vùng vi phạm | `plan` — da `ban-ve` |
   | Một khoản tiền cộng từ nhiều dòng (giá + thuế = tổng) | `receipt` — da `hoa-don` |
   | Dòng tiền ra / vào theo ngày và số dư | `account` — da `sao-ke` |
   | Ai nắm bao nhiêu % và vượt ngưỡng biểu quyết nào | `captable` — da `co-cau` |
   | Một văn bản tố tụng / xử phạt và chỗ nó thiếu sót | `record` — da `bien-ban` |
   | Mở đầu, mục lục, chuyển chương, kết luận, cảm ơn | `cover`, `statement`, `agenda`, `section`, `closing`, `end` |
   Xem đủ 65 type và trường ở `references/layouts.md`; tên icon ở `references/icons.md`. **Không chắc chọn type nào** → `python3 scripts/chon_layout.py "<mô tả nội dung>"`. **Không chọn hình theo "cho đẹp"**: `venn` không có điểm chung, `matrix` mà một trục không quyết định gì, `pyramid` mà các tầng ngang hàng → dùng type khác (`dung.js` chặn các ca rõ ràng).
4. **Viết `deck.json`** theo các quy tắc:
   - Tiêu đề là **câu kết luận**, không phải nhãn hay câu hỏi ("Người mua thiệt nhất", không phải "Hậu quả" hay "Ai thiệt?"). Câu hỏi để ở `kicker`. Tiêu đề ≤ 54 ký tự giữ cỡ chữ lớn nhất; `[cụm nhấn]` đúng **một** cụm mỗi tiêu đề.
   - **Tiêu đề phải đọc riêng vẫn hiểu** — đủ **chủ ngữ + vị ngữ + phạm vi**: "Số người đóng BHXH bắt buộc chỉ giảm năm 2020", KHÔNG "Tăng đều, chỉ giảm năm 2020" (cái gì?). Không nén bằng ký hiệu ("16 → 20 năm") khi chưa nói đó là gì.
   - **Mạch bài phải theo dõi được** (bài `report` chặn `--strict`): mục lục dùng ĐÚNG câu chữ tiêu đề từng chương; `closing.answers` trả lời đúng các câu đó, theo thứ tự; `kicker` cho ngữ cảnh, không nhắc lại tiêu đề; một con số chỉ xuất hiện ở ≤ 2 slide; **trên một slide, một con số chỉ một cách ghi** (không "800.000" ở tiêu đề cạnh "0,8 triệu" ở số lớn — `dung.js` cảnh báo). Thẻ ghi "Số liệu: slide N" (bộ `bh*`: bấm được, nhảy tới slide đó) — `validate.js` gợi ý khi con số trong thẻ không có trên slide N, cảnh báo khi "slide N" vượt số slide.
   - **Khung bài: bìa → (mục lục) → mỗi chương một `section` có `num` → … → `closing` → `end`.** Nhịp tối – sáng – đỏ: mở phần bằng `section`, bước ngoặt bằng `headline` / `photo` / `hero` (1–2 lần mỗi deck); `statement` + `"mode": "a"` (nền màu nhấn) cho 1–3 slide bước ngoặt — ở tầng hình ảnh mỗi type tự chọn nền, `mode` trên type khác bị bỏ qua (`dung.js` báo ℹ). Không lặp cùng `type` quá 3 slide liền.
   - **Mở – kết bằng ảnh** (có ảnh đúng chủ đề): bìa `layout: "poster"` (ảnh tràn viền, tiêu đề lớn, `facts` = 1–3 thẻ dữ kiện) → `hero` + `photo` → … → `closing` + `photo` → `end` + `photo` (cùng ngôn ngữ với bìa, `message` = câu chốt). Mục lục / chương có ảnh: `agenda` + `photo`, `section` + `photo` (`photoLayout: "backdrop"` = nền ảnh mờ). Khung ảnh `frame` / `meta.frame`: `rect` · `arch` (trang trọng, toà án) · `circle` (chân dung, vật thể) · `ogee` (CHỈ văn hoá, di sản phương Đông). Không ảnh thì bìa / chương / kết mang hình lớn của da; đổi bằng `art` ở từng slide.
   - **Hình dán**: `cover`, `statement`, `section`, `end` nhận `emoji` / `emoji2` (tên trong `hinh/emoji.json`; chỉnh chỗ bằng `emojiPos: {s,l,t,r}`). Hình dán chung **không** thay được da (đã bị chê "rập khuôn").
   - **Slide mở đầu (ngay sau bìa)**: nêu nghịch lý bằng đúng chi tiết làm nên câu hỏi pháp lý; không đặt câu hỏi pháp lý ở đây (để dành cho `agenda`).
   - **Slide kết luận** (`closing`): `answers` — trả lời TỪNG câu hỏi của `agenda`, đúng thứ tự, kèm căn cứ then chốt; `verdict` — nhận định của người viết; `rec` — kiến nghị gắn với lỗ hổng đã chứng minh. Bài học cho từng bên → một slide `cards` đứng trước. Slide cuối là `end`, không nhét lời cảm ơn vào `closing`.
   - **Câu chốt (`takeaway`, ≤ 110 ký tự)** → dải "Ghi nhớ" (vạch màu nhấn + nhãn) ở chân slide, cùng một chỗ ở mọi slide có nó. **Đơn vị** (`unit`) mẫu nào không tự in thì engine ghi "Đơn vị: …" dưới tiêu đề. Trường nào validate.js nhận đều phải hiện — `tests/truong_hien.test.js` chặn trường "nhận mà không vẽ".
   - **Giấy ghim (`pin`: chuỗi hoặc `{ "text", "by" }`, ≤ 90 ký tự)** → MỘT câu chính / con số trên tờ giấy kem có đinh ghim, slide nội dung type thường; nội dung slide dồn lên, tờ giấy tự tìm chỗ trống (ưu tiên bên phải). Không còn chỗ → ẩn và `⚠ … không có chỗ trống`: rút nội dung hoặc chuyển câu vào `takeaway`. Câu trích phải có `by`.
   - `[từ khoá]` làm nổi 1–3 từ — chính là chữ người nghe phải nhớ. **Cắt chữ đệm** ("có thể thấy", "nhìn chung", "bên cạnh đó"…). Mỗi ô một mệnh đề ngắn. Lý do chi tiết, số liệu phụ → `notes`. **≤ 80 tiếng mỗi slide** (cảnh báo khi > 110).
   - **Ba tầng chữ**: *khẳng định* (tiêu đề, `head`, `value`) · *dẫn chứng* (`text`, `desc`, `items` — số liệu, điều luật, ví dụ cụ thể) · *chú thích* (`note`, `src`, `quoteBy`). Câu không thuộc tầng nào thì xoá.
   - **Bài báo cáo số liệu / thực trạng (`kind: report`) — 7 luật học từ nhận xét giảng viên (BNK405, 11/2026)**:
     1. **Số liệu**: mỗi con số trên slide có một dòng ở `prep.json` → `data` (nguồn + ngày đối chiếu). Hai bảng trong tài liệu gốc cho số khác nhau, đơn vị lệch → ghi `unsure`, hỏi người dùng; không tự chọn một số.
     2. **Phạm vi**: `prep.json` → `scope.in` / `scope.out` → chép vào `meta.scopeOut`. Slide đầu được nêu tổng thì ghi `"scopeOk": true`.
     3. **Nguyên nhân đặt tại năm**: `chart` `column` theo năm → mỗi năm đổi chiều hoặc âm có `items[].why` (≤ 70 ký tự, có số / sự kiện / văn bản). KHÔNG làm một slide "nguyên nhân" chung cho cả giai đoạn.
     4. **Ý con khớp ý lớn**: mỗi `desc` / ý con phải chứng minh đúng `name` / `head` của thẻ (soát bằng mắt). Nhận định tốt ("đầy đủ", "kịp thời") cũng cần số trên slide + nguồn trong `notes`.
     5. **Hạn chế có gốc**: slide hạn chế ghi `"basis": [số slide thực trạng chứa số liệu]`.
     6. **Kiến nghị chỉ ra điều, khoản**: mỗi kiến nghị nêu quy định cụ thể (số hiệu văn bản + điều, khoản) và hướng sửa; mở văn bản gốc kiểm trước khi viết.
     7. **Mỗi ý một ô chữ**: đừng nhồi nhiều ý vào một chuỗi bằng "; ".
     Có nhận xét của giảng viên → `prep.json` → `feedback: [{ "note": "…", "fix": "…" }]`; `prep.py check` báo ý chưa xử lý.
   - **Mọi nhận định phải có dẫn chứng trên cùng slide** ("không hợp lý", "thiếu" → điều luật bị trái, con số, đoạn trích, hoặc ví dụ). `dung.js` cảnh báo slide có từ đánh giá mà không thấy dẫn chứng.
   - **Ký hiệu có nghĩa cố định**: → hệ quả · `·` ngăn hai thông tin cùng cấp · — đối lập / giải thích · ≈ số xấp xỉ tự tính · “ ” trích nguyên văn · ? điều chưa giải quyết. Đúng / sai / nghi vấn dùng trường `ok`, `verdict`, `tone` — không gõ ✓ ✗, không ký tự trang trí (★ ● ►), không ↔ ⇒ ➜.
   - **Bảng và biểu đồ phải có việc riêng.** `chart` + `insight` để thấy to–nhỏ, trước–sau trong 3 giây (1 giá trị → `bignum`); `table` + `focus` để tra đúng con số (< 3 hàng → `bignum` / `compare`). KHÔNG trình bày cùng một dữ liệu hai lần. Biểu đồ chỉ dùng số liệu có trong tài liệu.
   - **Pháp lý**: giữ nguyên số hiệu văn bản, điều khoản, tình trạng hiệu lực từ nguồn; không bịa. Con số tự tính phải cộng được từ dữ kiện có trong tài liệu. Ghi rõ phần nào là "quan điểm người viết".
5. **Ảnh thật — mặc định CÓ, 4–8 ảnh/deck, mỗi ảnh một cách dùng khác nhau** (chỉ bỏ ảnh khi tìm không ra ảnh đúng chủ đề). Phân bổ gợi ý: bìa poster · mỗi chương 1 ảnh (`section` có `photo`, hoặc `photostats` / `split` / `frame`) · 1 slide nhiều ảnh (`mosaic` / `gallery` / `photostrip` / `collage`) · `end` có ảnh — tự tìm, không bắt người dùng đi tìm. Chi tiết (brief, chấm 0–3, 5 tiêu chí thẩm mỹ, nguồn, `cutout`, `imagePolicy`): **`references/anh-that.md` — ĐỌC trước khi tìm ảnh.** Năm điều không được bỏ:
   - Tìm theo BRIEF (`briefs.json`: `want` / `queries` / `must` / `place` / `avoid`) bằng `scripts/find_images.py --brief`, không tìm theo một từ khoá rời.
   - **Mở `images/_candidates.jpg` và chấm bằng mắt**: chỉ lấy ảnh ≥ 2 điểm và đạt thẩm mỹ; không đạt → dùng hình của da / cảnh, KHÔNG lấy ảnh "tạm được".
   - Mặc định `meta.imagePolicy` là `"classroom"` (chỉ chiếu trên lớp): được dùng ảnh báo / trang web, BẮT BUỘC `photoSource`. Đăng công khai / nộp cuộc thi → `"open"` (chỉ CC0, PD, CC BY, CC BY-SA, Pexels). Không ảnh AI, ảnh thương hiệu, người nhận diện được mà không liên quan.
   - Mỗi slide một ảnh riêng; mỗi bài nguồn tối đa 1 ảnh (`dung.js` cảnh báo); ảnh minh hoạ không phải hiện vật vụ việc → ghi rõ ở `photoAlt`. Ảnh phải thể hiện đúng hành vi / sự kiện của slide.
   - Ghi `"photo": "images/<file>.jpg"` + `"photoAlt"`. Slide KHÔNG in dòng ghi nguồn; `dung.js` xuất `<tên>_ghi-cong.md` để dán vào bản Word — ảnh CC BY / BY-SA vẫn bắt buộc ghi công, chỉ là ghi ở bản Word. Ảnh nhỏ hơn cỡ cần (1600 px; tràn viền 2000 px) → cảnh báo.
6. **Dựng nháp và soát mạch**: `node hinh/dung.js deck.json --titles` → `node hinh/dung.js deck.json out.pptx --soat`. Gặp nhiều cảnh báo cùng lúc → sửa theo **thứ tự** ở `references/loi-thuong-gap.md` (cấu trúc → sai type → thừa chữ → tràn → nhịp). `⚠ … tràn` → **rút chữ ở đúng khối được nêu hoặc tách slide**, không thu cỡ chữ; `⚠ … bị lớp ảnh đè` → dời hình hoặc rút chữ; `ℹ … dùng mẫu chung` → type gõ sai.
7. **Dựng bản giao**: `node hinh/dung.js deck.json out.pptx --strict --soat` — phải không còn `⚠`.
8. **Soát bằng mắt**: mở từng tờ `<tên>_lop/soat-*.jpg` và ảnh nhìn mờ. Danh sách:
   - Mỗi slide: che phần thân, chỉ đọc tiêu đề — đã hiểu ý chưa? Che chữ — còn đoán được đề tài không?
   - Không có ô trống, thẻ trống, dòng mồ côi một chữ; mũi tên không xuyên qua chữ.
   - Bài báo cáo: mỗi ý con khớp ý lớn; mỗi hạn chế trỏ được về số liệu đã trình bày; mỗi kiến nghị có điều, khoản.
   - Màu đỏ (`bad`) chỉ dùng cho điều tiêu cực thật.
   - Chỉ vào từng chi tiết nhỏ (chấm, dải, vật, hoạ tiết, màu nhấn) và nói được nó mang nghĩa gì; không nói được → bỏ (`references/nguyen-tac-bo-cuc.md` mục 8).
   - Morph có chủ ý: `python3 scripts/morph_cap.py out.pptx` liệt kê cặp Morph giữa hai slide kề nhau; `node scripts/xem_morph.js <tên>_lop/deck.html xem.mp4` quay video xấp xỉ để xem nhịp (không thay được PowerPoint thật).
9. Gửi file .pptx (+ tờ soát, `_ghi-cong.md`), kèm ba lời nhắc ở mục "Đầu ra". Nhắc người dùng kiểm lại số liệu pháp lý nếu có con số tự tính.

## Bài học từ deck bài giảng có tính toán (BNK405 Chương 2, 11/2026)
- **Môn nghiệp vụ = công thức + bài tính + đề.** Dùng `formula`, `calc`, `exercise`; bài tập của tài liệu gốc phải HIỆN trên slide (cặp `exercise` → `calc`).
- **Bài giảng cũ thường dùng luật đã hết hiệu lực.** Kiểm từng con số (lương cơ sở, mức tham chiếu, số năm đóng…) theo văn bản hiện hành; gom các thay đổi vào MỘT slide `changelog`; câu hỏi nên có phương án bẫy "đúng theo luật cũ".
- **Bài tập có năm cũ:** giữ số liệu của đúng năm đề bài, ghi rõ ở `note`.
- **Năm mảnh rời → một câu chuyện:** mở phần bằng `journey`, kết phần bằng `cheatsheet`.
- **Nén tài liệu dài:** liệt kê phần bị bỏ trong `meta.skip` kèm lý do; thủ tục có thời hạn là nội dung hay thi — giữ bằng `steps`.

## Bài tập tình huống luật (lời giải `checklist` / `calc` sau `exercise`)
Lời giải phải đi đủ thứ tự này — `dung.js` gợi ý khi đề có năm / ngày mà lời giải không nhắc bước 1–2:
1. **Luật áp dụng theo thời điểm**: sự kiện xảy ra khi nào → văn bản nào đang có hiệu lực lúc đó.
2. **Thời hiệu / thời hạn**: còn trong thời hiệu không, tính từ mốc nào. Đề thiếu ngày → ghi rõ "cần thêm dữ kiện".
3. **Căn cứ**: điều khoản nào, đủ từng điều kiện chưa (`checklist`).
4. **Hệ quả**: Toà xử lý thế nào; điểm còn tranh luận ghi "quan điểm" ở `note`.
- Câu hỏi trắc nghiệm: phương án đúng không chứa sẵn thuật ngữ của lời giải, không dài hơn hẳn phương án khác (cảnh báo cả hai); tình huống phải KHÁC ví dụ đã giảng.
- Trạng thái trung tính: `ok: "na"` = "không áp dụng" — xám, dấu gạch. Đỏ (`no`, `tone: "bad"`) chỉ cho điều tiêu cực thật.
- **Slide không ghi nguồn** (không dòng "Nguồn: …", không trường `source` ở type thường): danh mục nguồn nằm trong bản Word. **Ngoại lệ:** cảnh `lawquote`, `tiles`, `cases`, `chain` có `source` vẽ thành dòng chú thích — dùng cho căn cứ pháp lý của chính slide (số hiệu văn bản, điều khoản, tình trạng hiệu lực).
- **Luật đã bị sửa sau năm ban hành**: luôn tra văn bản sửa đổi / hợp nhất mới nhất. Từ máy cloud, vbpl.vn và thuvienphapluat.vn có thể trả 403 → đọc văn bản hợp nhất trên `datafiles.chinhphu.vn`.
- **Đối chiếu nguyên văn trước khi dựng**: mọi điều luật trên slide phải mở văn bản gốc kiểm lại; ghi kết quả vào `prep.json` → `sources[].checked`.

## Bài học từ phản biện thiết kế (11/2026)
- Câu trắc nghiệm có tình huống: dữ kiện ở `stem`, tiêu đề chỉ là câu hỏi ngắn.
- Lời giải bài tập chỉ dùng kiến thức ĐÃ dạy tới slide đó; khái niệm dạy sau → `note` "xét ở Phần N".
- Một từ điều hướng cho cả bài: kicker "Phần N · …" thì slide mở phần cũng ghi "Phần" (`partWord`).
- Tiêu đề kết luận không được khái quát quá điều luật: ghi phạm vi ("Điều 125–129: …") và điều kiện.
- Morph "xấu, chỉ có vân tay bay qua bay về" = Morph không được thiết kế: cùng một vật ở hai slide kề nhau phải mang nghĩa (`references/canh.md`).

## Font (lưu ý khi mở bằng PowerPoint)
File nhúng bốn họ font: `Anton` (tiêu đề), `Be Vietnam Pro` (chữ thường), `Be Vietnam Dam` (đậm vừa), `Be Vietnam Nang` (rất đậm). Hai họ sau là Be Vietnam Pro SemiBold / ExtraBold đã đổi tên họ để PowerPoint coi mỗi độ đậm là một họ độc lập (`hinh/tao_font.js`, giấy phép SIL OFL trong `hinh/fonts/`). Trong PowerPoint không dùng nút **B** cho các họ này — đổi độ đậm bằng cách đổi tên font. Font nhúng nguyên bản nên gõ thêm chữ có dấu nào cũng hiển thị. `--khong-nhung-font` chỉ dùng khi thử nhanh.

## Mã và nguồn mở
- `hinh/dung.js` (dựng) · `hinh/kiem_noi_dung.js` + `engine/validate.js` + `engine/limits.js` (kiểm nội dung) · `hinh/kiem.js`, `hinh/kiem_tang.js`, `hinh/kiem_de.js` (kiểm hình) · `stage/templates.js` + `stage/stage.css` (65 type) · `stage/bieu_do.js` (10 kind biểu đồ) · `hinh/canh.js`, `hinh/bang_chung.js`, `hinh/hoi_nghi.js` (cảnh, bộ `bc*`, `qt*`) · `hinh/da.js` (da) · `engine/motifs.js`, `engine/codeart.js` (hoạ tiết, nét tay, so chữ) · `hinh/build.js` (HTML → PPTX).
- Nguồn mở đang dùng: pptxgenjs (MIT), react-icons (MIT; **Phosphor MIT, Lucide ISC, Tabler MIT — không bắt ghi nguồn; Font Awesome Free CC BY 4.0 — PHẢI ghi nguồn**, `dung.js` tự ghi vào `_ghi-cong.md`), jsdiff (BSD-3-Clause — `redline`), perfect-freehand (MIT — nét viết tay của `annotate`), sharp (Apache-2.0), fontkit (MIT), Playwright (Apache-2.0), Fluent Emoji (MIT). Nguồn ảnh / icon và giấy phép: `references/image-sources.md`; công cụ SVG: `references/svg-va-cong-cu.md`; dự án đã tham khảo: `references/nguon-tham-khao.md`. Nguyên tắc bố cục khi thêm cơ chế mới: `references/nguyen-tac-bo-cuc.md`.

## Cài đặt (một lần)
```
cd <skill> && npm install
```
`<skill>` là thư mục chứa file này; mọi lệnh `node hinh/…`, `python3 scripts/…` tính từ đó. Thư mục skill chỉ-đọc (claude.ai, skill đồng bộ từ tài khoản) → `cp -r <skill> <thư mục làm việc>/slide-chuan`, rồi `npm install` và chạy từ bản sao. `deck.json`, `prep.json`, ảnh và file .pptx luôn nằm ở thư mục deck của người dùng.
Cần Node 18+, Playwright + Chromium (`npm install playwright && npx playwright install chromium`, hoặc `PW_CHROMIUM=<đường dẫn>`). Soát cần LibreOffice + poppler (`pdftoppm`) + Python Pillow, python-pptx; thiếu thì vẫn dựng được PPTX. Kiểm skill: `npm test`.

## Các script (thư mục `scripts/`)
| Script | Việc | Khi nào |
|---|---|---|
| `prep.py` | Gói chuẩn bị: `init` / `check` / `summary` (gửi người dùng) / `approve` (chỉ khi người dùng duyệt) | Bước 0 (bắt buộc) |
| `outline.py` | Rút dàn ý + số chữ từng mục của tài liệu (.docx, .pptx, .pdf, .md) | Bước 0–1 |
| `chon_layout.py` | Gợi ý type / kind biểu đồ từ mô tả nội dung | Bước 3 |
| `find_images.py` | Tìm ảnh giấy phép mở theo brief, chấm chất lượng kỹ thuật | Bước 5 |
| `img_quality.py` | Chấm chất lượng kỹ thuật ảnh 0–3 | Bước 5 |
| `fetch_image.py` | Tải một ảnh từ URL (chế độ `classroom`), lưu thông tin ghi công | Bước 5 |
| `cutout.py` | Tách nền ảnh thật → trường `cutout` | Bước 5 |
| `nhin_mo.py` | Xoá chữ + làm mờ để kiểm "che chữ vẫn đoán được đề tài"; `--da deck.json` dựng cùng deck ở nhiều da và chấm độ khác nhau | Bước 8 (`--soat` tự chạy) |
| `soat_chi_tiet.js` | Chụp mỗi slide đủ chữ / ẩn chữ → nét chữ thật: báo chữ gần thẳng hàng (lệch 4–10 px), chữ thiếu tương phản trên nền thật (WCAG), dòng mồ côi một chữ, nét vẽ dọc cắt qua chữ (✂); nhãn số liệu đặt theo dữ liệu đánh `data-dl` để bỏ qua | Bước 8 (`--soat` tự chạy) |
| `morph_cap.py` | Liệt kê cặp Morph có chủ ý giữa hai slide kề nhau | Bước 8 |
| `xem_morph.js` | Quay video / GIF xấp xỉ Morph từ `deck.html` (cùng tên trượt, khác hình hoà dần) khi không có PowerPoint | Bước 8 |
| `build_vn_map.py`, `build_vn_map34.py` | Công cụ phát triển: dựng dữ liệu bản đồ 63 / 34 tỉnh (đã có sẵn trong `engine/assets`) | Không cần khi làm slide |

## Ví dụ
- `examples/nghi-viec-hinh/deck.json` — 11 slide khai báo → 20 slide PowerPoint, đủ 11 cảnh (mở sách soi tới Điều 35 Bộ luật Lao động 2019, cột ô lịch, trắc nghiệm bấm, mục lục ảnh), da `bang-cong`: `node hinh/dung.js examples/nghi-viec-hinh/deck.json /tmp/nghi-viec.pptx --soat`.
- `examples/hoi-nghi-qt/deck.json` — bộ `qt*` (Công pháp quốc tế), da `qt`.
- `examples/so-bhxh/deck.json` — bộ `bh*` (BHXH, 28 slide → 33 slide PowerPoint). Có `photo` thì đặt ảnh thật kiểu Flashslide (tràn viền phủ xanh, ảnh tràn mép, khung ảnh), tiêu đề Anton in hoa, viên nhãn, máy quay Morph; ví dụ không kèm ảnh (ảnh báo của bài chỉ được chiếu trên lớp) nên chạy nhánh vật BHXH vẽ bằng code. Da `so-bhxh`; xem `references/canh.md` mục 10 — **bài học: chất Flashslide đến từ ảnh thật, không vẽ code thay được**; mục 10 có bảng "chi tiết → nghĩa → luật" (mẫu để soát nghĩa cho bộ hình khác: chồng sổ = số người, sổ xoè = nhóm, đỏ = tiêu cực, mỗi phần một màu).
- `examples/giay_to.json` — 12 khối giấy tờ và ảnh dẫn chuyện (`match`, `headline`, `lens`, `collage`, `sheet`, `calendar`, `riskbar`, `plan`, `receipt`, `account`, `captable`, `record`).
- `examples/banan142.json` — bình luận Bản án 142/2019/DS-PT, 20 slide, da `ho-so`, `map`, `flow`, `ledger`, `chart` `span`, lịch 14 ngày, `closing` trả lời 3 câu hỏi, 3 `scene`, ghi chú ở `banan142_notes.md`.
- `examples/bai_tinh.json` (bài giảng có tính toán: `formula`, `exercise` → `calc`, `funnel`, `changelog`, `journey`, `cheatsheet`, `chart` `step`, `quiz` `whyNot` — BHXH theo Luật 41/2024/QH15), `examples/bo_cuc_them.json` (`checklist`, `bento`, `chart` `line` / `waterfall` / `gantt` / `progress`), `examples/do_hoa_code.json` (`iso`, `isotype`, `redline`, `chart` có `annotate` + `hatch`, `hero`, `deadline`), `examples/anh_va_chuong.json` (ảnh ở chương, `photostats`, `mosaic`, `photostrip`), `examples/khung_anh.json` (`meta.frame`), `examples/hub_pin.json` (`hub`), `examples/bocuc_moi.json`, `examples/kiemthu_con_lai.json` (số liệu GIẢ ĐỊNH — chỉ để kiểm bố cục). Mọi ví dụ được test qua `--strict`.
