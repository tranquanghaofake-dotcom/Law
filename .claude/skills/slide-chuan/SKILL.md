---
name: slide-chuan
description: "Use when the user wants a slide deck built from their material (docx, pdf, pptx cũ, ghi chú) or from a topic — file PowerPoint (.pptx) sửa được chữ: bản thuyết trình có minh hoạ, hiệu ứng và Morph (font nhúng sẵn), hoặc bản theo lưới và font Office — làm slide, bài thuyết trình, PPT cho tiểu luận, bình luận bản án, báo cáo số liệu, bài giảng, slide bảo vệ khóa luận/NCKH — or wants a deck made with this skill fixed (tràn chữ, bố cục rối, thiếu ảnh, mạch bài khó theo dõi, nhìn nhạt, kém bắt mắt). Also matches unaccented requests (lam slide, bai thuyet trinh, lam ppt, slide bao ve). Not for editing or reading an arbitrary existing .pptx file (use the pptx skill), infographic A4 (use infographic), or video (use motion-video)."
---

# slide-chuan

Nguyên tắc: **AI chỉ viết nội dung (deck.json); bố cục, màu, font, cỡ chữ, hoạ tiết do engine lo.** Không vẽ tay từng slide, không tạo ảnh AI — chỉ dùng hình vẽ bằng code có sẵn (`art`, `meta.motif`), icon Phosphor Duotone / Font Awesome (`react-icons`), sơ đồ / biểu đồ / bản đồ do engine vẽ (`flow`, `ledger`, `scene`, `chart`, `map`, lịch ngày của `bignum`), và ảnh thật có giấy phép (bước 5). Nền trắng là mặc định.

Câu hỏi gốc của mỗi slide: **người nghe nhìn 10 giây thì hiểu được điều gì?** Slide không phải bản tóm tắt tài liệu — tài liệu đầy đủ để ở `notes`.

## Nguyên tắc trước quy trình (đọc đầu tiên)
- **Mục tiêu là deck người xem thấy đẹp và hiểu được; quy trình chỉ là công cụ.** Khi một quy tắc, danh sách type hay kế hoạch đã duyệt xung đột với mục tiêu, giữ mục tiêu, sửa kế hoạch và nói lý do trong báo cáo — không giữ nguyên kế hoạch rồi giao deck sơ sài.
- **Đừng tin một tính năng chỉ vì SKILL.md nhắc tên nó.** Tầng hình ảnh (mặc định) KHÔNG vẽ: `chart` kind `gantt` / `waterfall` / `progress` / `donut` / `slope` (ra thanh ngang), `art`, `meta.style`, `meta.kit` (world), `layout: poster`, `photo` ngoài `cover` và các type ảnh. `dung.js` in `⚠` / `ℹ` cho từng mục — xử lý trước khi giao.
- **Hình ở tầng hình ảnh = cảnh + hình dán + ảnh thật.** Bài giảng 15 phút nên có 4–8 cảnh, chọn theo nội dung: điều luật cụ thể → `book` (rồi `bigq`) và `lawquote` · so mức / ngưỡng / thời hạn → `tiles`, `strip` · tình huống → `cases`, `chain` · kiểm tra → `quizgo` (không có `whyNot`: đưa lý do từng phương án vào `notes`) · chốt ý → `recap` · hỏi đáp → `toc`. Bìa, `statement`, `section`, `end` nhận hình dán qua `emoji` / `emoji2` (tên trong `hinh/emoji.json`; chỉnh chỗ bằng `emojiPos: {s,l,t,r}`).

## Đầu ra là file PowerPoint — chọn cách dựng trước khi làm

Cùng một `deck.json` (đủ 65 type), hai cách dựng, **đều ra file `.pptx` mở và sửa được trong PowerPoint**. Skill không còn xuất bản HTML hay PDF. **Hỏi người dùng nếu chưa rõ; không rõ thì dựng tầng hình ảnh và nói cách đổi.**

| | **Tầng hình ảnh** — `node hinh/dung.js` (mặc định) | **Tầng lưới Office** — `node engine/build.js` |
|---|---|---|
| Dùng khi | Slide để **thuyết trình**: cần đẹp, có minh hoạ, hiệu ứng, Morph | Phải **theo mẫu của trường**, nhóm sẽ sửa nhiều trong PowerPoint, hoặc chiếu bằng máy lạ không chắc đọc được font nhúng |
| Chữ | Hộp chữ thật, gõ lại được; Anton + Be Vietnam Pro **nhúng trong file** | Font có sẵn của Office |
| Hình | Thẻ, hình dán, biểu đồ, giấy tờ là **ảnh rời** — dời, xoay, xoá, đổi hiệu ứng được; không sửa nét bên trong | Hình vẽ gốc PowerPoint, sửa được từng nét; 6 theme × world hình ảnh |
| Chuyển động | Từng khối vào lần lượt, Morph giữa các slide, số đếm, liên kết bấm được — đều là tính năng gốc PowerPoint | Hiệu ứng theo lần bấm |
| Đổi số liệu biểu đồ | Sửa `deck.json` rồi dựng lại (chữ trong biểu đồ là ảnh) | Sửa thẳng trong PowerPoint |

Lệnh: `node hinh/dung.js <deck.json> [out.pptx] [--mau=son|luc|lam|nau] [--chuyen=morph|fade] [--soat]` → `<tên>.pptx` + thư mục `<tên>_lop/` (trang trung gian, ảnh từng slide, tờ soát).

- **Bảng màu** (`--mau=` hoặc `meta.hinh.mau`): `son` mực đêm + son (mặc định; pháp lý, bản án) · `luc` xanh rừng + cam đất (đất đai, môi trường, nông nghiệp) · `lam` chàm + vàng (thương mại, tài chính, công nghệ) · `nau` nâu gỗ + son trầm (lịch sử, hành chính, bài mang tính tư liệu). Chọn theo môn, không chọn theo thói quen.
- **Cảnh** — 11 type chỉ tầng này có, dựng sẵn vật thật, hình dán, Morph, số đếm, liên kết: `book` (mở sách, kính lúp soi tới điều luật), `bigq` (câu hỏi lớn), `picks` (thẻ câu hỏi bấm để nhảy), `lawquote` (trích nguyên văn có nét bút), `tiles` (cột xếp bằng ô + số đếm), `strip` (dải N ngày), `cases` (thẻ trường hợp), `chain` (tình huống → kết luận → hệ quả), `quizgo` (trắc nghiệm bấm đáp án), `recap` (chốt + ghi nhớ), `toc` (mục lục ảnh). Cú pháp, giới hạn độ dài và cách xếp thứ tự để Morph có nghĩa: **đọc `references/canh.md` trước khi viết cảnh**. Mỗi deck 4–8 cảnh là đủ; phần còn lại dùng 65 type quen thuộc.
- **Tự kiểm bắt buộc**: dựng với `--soat` rồi xử lý từng dòng in ra — `⚠ … tràn` → **rút chữ hoặc tách slide trong `deck.json`**, không thu cỡ chữ; `⚠ slide N: bản PPTX lệch bản HTML` → mở tờ soát tìm khối lệch; `⚠ font … không có ký tự` → đổi ký tự; `ℹ … dùng mẫu chung` → type gõ sai. Sau đó **mở từng tờ `<tên>_lop/soat-*.jpg`** (trái: bản thiết kế · phải: file PPTX dựng lại qua LibreOffice) xem bằng mắt trước khi gửi. Bảng đầy đủ: `references/canh.md` mục 6. Mọi quy tắc nội dung ở Quy trình bên dưới (Bước 0 gói chuẩn bị, nguồn luật, ảnh có giấy phép, ghi chú thuyết trình) áp dụng y nguyên cho cả hai tầng.
- **Nói với người dùng khi giao file tầng hình ảnh** (bộ dựng không mở được PowerPoint nên ba điều này chỉ kiểm được cấu trúc): (1) mở bằng PowerPoint 2019 / Microsoft 365 — bản cũ, LibreOffice, Google Slides không chạy Morph và không đọc font nhúng; (2) file tải về phải bấm **Enable Editing** rồi mới xem phông; (3) lần đầu, nhờ họ báo lại phông, Morph, hiệu ứng có chạy đúng không. Phông vẫn sai trên máy họ → dựng lại bằng tầng lưới Office.
- **Viết cho tầng hình ảnh**: tiêu đề ≤ 54 ký tự giữ cỡ chữ lớn nhất (dài hơn tự hạ một nấc); đánh dấu `[cụm nhấn]` đúng **một** cụm mỗi tiêu đề; slide số liệu để một con số làm chủ (`hero`, `bignum`, `tiles`, `chart` có `insight`); mở phần bằng `section`, bước ngoặt bằng `headline` / `photo` (tối đa 1–2 lần mỗi deck) để deck có nhịp tối – sáng – đỏ; đừng dùng ký hiệu lạ (↔ ⇒ ➜) trong chữ — viết bằng lời.
- Cần Playwright có Chromium (`PW_CHROMIUM=<FILE chạy được, ví dụ /opt/pw-browsers/chromium>`; không đặt thì tự dò, đặt sai thì cảnh báo rồi tự dò). Không có thì không dựng được tầng này: dùng tầng lưới Office.
- Muốn có **cả hai**: dựng tầng hình ảnh để thuyết trình, dựng thêm `engine/build.js` cho bản nộp theo mẫu — cùng một `deck.json` (các type cảnh chỉ có ở tầng hình ảnh; engine sẽ báo type lạ).

## Giới hạn đã biết của hai tầng (đo 11/2026 — đọc trước khi chọn tầng)

Chi tiết, bằng chứng và trạng thái sửa từng lỗi: `references/loi-da-biet-2026-11.md`.

| | Tầng hình ảnh (`hinh/dung.js`) | Tầng lưới Office (`engine/build.js`) |
|---|---|---|
| Morph (cùng deck 15 slide) | **14/15** slide — kể cả giữa các chương | **6/15** với `meta.thread: true` — chỉ giữa slide cùng chương hoặc cùng bố cục; còn lại fade. Có `--motion` / `--build` |
| World (`meta.kit`: đồ vật, khung, nhãn theo môn) | **Không chạy** (bỏ qua, nay có `ℹ`) | Chạy |
| `art` trên slide | Chỉ `panelrows`, `lawquote` đọc; type khác bị bỏ qua (nay có `ℹ`) | Chạy |
| Kiểm tràn | `dung.js --soat` (Chromium + đúng font). `check_overflow.py` **không dùng được** (tự bỏ qua, thoát 0) | `check_overflow.py` |
| `morph_cap.py` | Liệt kê cặp Morph có chủ ý giữa hai slide kề nhau của PPTX tầng hình ảnh (kiểm Morph khi không có PowerPoint) | Bước 8 (tầng hình ảnh) |
| Type chỉ có ở tầng này | 11 "cảnh" (`book`, `lawquote`, `quizgo`…) và bộ hình riêng theo môn: 16 kiểu `bc*` (hình sự, `references/canh.md` mục 8), 3 kiểu `qt*` (Công pháp quốc tế, mục 9) | — (báo rõ, kèm type gần nghĩa) |
| `chart` kind | Vẽ riêng: `bar` `column` `line` `step` `span`. `gantt` / `waterfall` / `progress` / `donut` / `slope` rơi về thanh ngang (`gantt` đọc `to`), có `⚠` | Vẽ đủ |

- **Tầng hình ảnh không tự mang dấu hiệu của môn học — trừ hai môn đã có bộ hình riêng** vẽ bằng SVG/CSS: hình sự (`hinh/bang_chung.js`, kiểu `bc*`: bảng bần, giấy ghim, dây đỏ, thẻ tang vật, con dấu — mục 8 của `references/canh.md`) và Công pháp quốc tế (`hinh/hoi_nghi.js`, kiểu `qt*`: bản đồ thế giới bằng chấm, văn kiện có dấu xi, bàn họp và bảng tên phái đoàn — mới 3 kiểu, mục 9). Môn khác: chưa có, phải tự vẽ theo mẫu đó. Muốn "che chữ vẫn đoán được đề tài" phải tự đặt ảnh / `emoji` / `icon` / `cutout` đúng chủ đề ở ≥ 1/3 slide, rồi chạy `python3 scripts/nhin_mo.py <file.pptx>` và nhìn từng ô trước khi giao. `dung.js` nay báo `⚠` khi deck ≥ 6 slide mà 0 hình. Cần world đầy đủ (đồ vật xuyên suốt) thì dựng tầng lưới Office với `meta.kit`.
- Cụm nhấn `[ ]` của `lawquote` phải nằm trọn một dòng (ngắn, cuối câu); `quiz` đáp án: `whyNot` ≤ ~30 ký tự, `stem` ≤ 2 dòng.
- Môi trường dựng không có PowerPoint: Morph, hiệu ứng, font nhúng chỉ kiểm được cấu trúc. Làm việc với OneDrive / Microsoft 365: `references/microsoft-365.md`.

## Quy trình (theo đúng thứ tự)

0. **Gói chuẩn bị — BẮT BUỘC với mọi deck, xong và được người dùng duyệt rồi mới viết `deck.json`.** Mục đích: chốt mọi thứ trước, không sửa giữa chừng.
   - `python3 scripts/prep.py init <thư_mục_deck> --kind lecture|case|report --minutes N --topic "..."` → `prep.json`. Loại bài quyết định khung:
     | `kind` | Khung | Hình mặc định |
     |---|---|---|
     | `lecture` (bài giảng) | cover → statement (ý cốt lõi) → agenda (câu hỏi chương) → section mỗi phần → khái niệm + ví dụ → (môn có tính toán: **`formula` công thức → `exercise` đề → `calc` lời giải**) → **`quiz` hỏi → `quiz` đáp án** → closing (trả lời agenda + chuẩn bị bài sau) → end | `book` |
     | `case` (bình luận bản án, vụ việc) | cover → statement (nghịch lý) → agenda (câu hỏi pháp lý) → … → cards bài học → closing (answers + verdict + rec) → end | `justice`, `scales` |
     | `report` (báo cáo, số liệu) | cover → statement (phát hiện chính) → … chart/table số liệu thật … → closing (lessons + rec) → end | `document` |
   - **Thế giới hình ảnh theo môn (BẮT BUỘC với `report` / `lecture`)** — `prep.json` → `world`: ≥ 8 vật người học thấy tận mắt → 1 vật chủ đạo + 2 vật phụ → chọn world (`meta.kit`): `so-bhxh` (An sinh, BHXH), `bang-cong` (Lao động), `cang-bien` (TMQT, logistics), `ban-ve` (Đất đai, nhà ở), `hoa-don` (Thuế, kế toán), `sao-ke` (Ngân hàng, tín dụng), `co-cau` (Doanh nghiệp, cổ phần), `bien-ban` (Hình sự, tố tụng, xử phạt), `file` (hồ sơ, bản án), `paper` (bài giảng), `glass` (báo cáo chung). World đổi CẢ deck (màu trang, font tiêu đề, nền, khung slide, vỏ thẻ, nhãn, ô số, đồ vật, hình mặc định), không chỉ đổi chữ. Chưa có world hợp → thêm world mới theo `references/the-gioi-hinh-anh.md`.
     **(World chỉ chạy ở tầng lưới Office; ở tầng hình ảnh thay bằng ảnh / icon / sticker — xem mục "Giới hạn đã biết".)** **Tiêu chí "che chữ vẫn đoán được"**: mỗi slide nội dung mang dấu hiệu world ở ĐỦ 3 cỡ — **lớn** (nền, khung toàn slide) · **vừa** (dáng thẻ, ô bước / ô số, điểm mốc, thanh biểu đồ, khối hình chính, đồ vật) · **nhỏ** (icon riêng của world, nhãn, thanh tiến độ hình vật thật). Engine tự áp `form` của world lên `steps` (ô bước thay mũi tên), `timeline` (đường nối + điểm mốc), `stats`, `agenda`, `chart` cột / thanh / đường / tròn (vành) / waterfall / step, `table` (kẻ dòng, đầu bảng), `quote` (đường nối tới người nói), `section` (ô số + dải chương), thẻ (2 biến thể xoay theo slide chẵn / lẻ), slide cảm ơn (vật của world) và slide ảnh tràn viền (khung world màu sáng vẽ trên ảnh). Build báo slide thiếu cỡ (thiếu 1 cỡ: gợi ý; thiếu ≥ 2: cảnh báo); `--sig` in bảng dấu hiệu từng slide. Kiểm bằng mắt: `python3 scripts/nhin_mo.py out.pptx` (xoá chữ + làm mờ) hoặc `--worlds deck.json` (cùng deck ở mọi world, kèm điểm khác nhau; < 6 = khó phân biệt).
   - Điền đủ: `topic`, `audience`, `minutes` (chưa biết thì HỎI) · `sources` — tài liệu gốc, giáo trình, **văn bản luật ghi `"legal": true` + `status`** (hiện hành / hết hiệu lực / dự thảo / học thuật / chưa kiểm) · `unsure` — điều chưa kiểm chứng được (sẽ ghi rõ trên slide) · `assets.photos` — ảnh đã tìm theo brief (bước 5) **và đã chấm điểm bằng mắt** · `assets.art` — hình vẽ engine sẽ dùng · `assets.missing` — CHỈ hình vẽ engine CHƯA có (ghi lại để bổ sung engine sau; deck này dùng cách khác — **không sửa engine giữa lúc làm deck**); tìm không ra ảnh thật đạt điểm thì ghi ở `unsure`, không ghi ở đây · `plan` — mỗi slide một dòng `{slide, question, title (= câu kết luận), type, covers}` (chính là storyboard bước 2).
   - **Bộ hình theo môn (tầng hình ảnh) — hỏi TRƯỚC khi xin duyệt**: `prep.json` → `tang` (`hinh` | `luoi`), `boHinh` (`bc` hình sự · `qt` Công pháp quốc tế), `chapNhanNenChung`. Môn chưa có bộ hình thì `prep.py check` chặn; tin nhắn xin duyệt phải nói thẳng: *"Môn này chưa có bộ hình: deck sẽ chỉ có nền, khung chung (lỗi đã bị chê ở 3 bài). Chọn: (a) làm bộ hình mới trước, thêm khoảng N giờ; (b) chấp nhận nền chung; (c) dựng tầng lưới Office với world."* Chỉ ghi `chapNhanNenChung: true` khi người dùng chọn (b). Hình dán chung **không** thay được bộ hình (đã bị chê "rập khuôn"). `dung.js` báo `⚠ Nền chung`, `--strict` dừng.
   - `python3 scripts/prep.py check <thư_mục_deck>` → hết mục thiếu. `python3 scripts/prep.py summary <thư_mục_deck>` → gửi bản tóm tắt (`prep.md`) cho người dùng.
   - **Chỉ khi người dùng nói duyệt**: `python3 scripts/prep.py approve <thư_mục_deck> --by "Tên"`. Không tự duyệt thay người dùng. Người dùng sửa gì → sửa `prep.json` rồi gửi lại.
   - Build đọc `prep.json` (cạnh deck.json, hoặc `meta.prep`): thiếu / chưa duyệt / số slide lệch kế hoạch > 25% → cảnh báo, `--strict` dừng; slide đổi type so với kế hoạch → gợi ý (nêu lý do khi báo người dùng). Dựng nháp không `--strict` vẫn được để xem trước.
   - Nguồn là bài giảng cũ (.pptx): `scripts/outline.py` đọc thẳng file .pptx (tiêu đề slide = đề mục; slide không đánh số thành mục con của đề mục số gần nhất; bỏ số trang, chữ mẫu).

1. **Đọc tài liệu** → rút mạch kể: vấn đề → các bên/diễn biến → 2–4 câu hỏi → trả lời từng câu → đánh giá → kết luận.
   - **Hỏi thời lượng thuyết trình** (chưa biết thì giả định 15 phút và nói rõ). Số slide ≈ phút × 0,9–1,5 (40–65 giây/slide): 10 phút ≈ 9–15 slide, 15 phút ≈ 14–22, 20 phút ≈ 18–30. Ghi `meta.minutes`; ghi chú thuyết trình phải đủ thời lượng đó (~160 tiếng/phút) — engine cảnh báo khi lệch > 25%.
   - **Rút dàn ý để không bỏ sót**: `python3 scripts/outline.py <tài_liệu.docx|pdf|md> <thư_mục_deck>/outline.json` → in từng đề mục kèm số chữ (% tài liệu). Ghi `"meta": {"outline": "outline.json"}`; mỗi slide ghi `"covers": ["1.2", "3.3.2"]` = mục nó trình bày; mục cố ý bỏ ghi lý do ở `"meta": {"skip": {"1.1": "khái niệm đã quen thuộc"}}`. Build in "Đối chiếu dàn ý: x/y mục" và cảnh báo từng mục chưa có slide — **không được im lặng bỏ một phần của bài**. Mục chiếm > 12% tài liệu mà chỉ 1 slide → gợi ý tách.
2. **Viết storyboard trước khi viết JSON** (trong đầu hoặc nháp, không cần gửi người dùng). Mỗi slide một dòng:
   `# | người nghe đang thắc mắc gì | câu trả lời (= tiêu đề) | bằng chứng nhìn thấy được (= type)`.
   - Mỗi slide **một ý**. Hai ý → hai slide.
   - Đọc liền các tiêu đề từ đầu đến cuối phải thành một câu chuyện có lập luận. Không được thì sửa storyboard, chưa viết JSON.
   - Viết xong `deck.json`, chạy `node engine/build.js deck.json --titles` → in kicker + tiêu đề từng slide thành một mạch (không dựng file), kèm cảnh báo tiêu đề dạng nhãn / câu hỏi / trùng. Đọc mạch này trước khi soát hình.
3. **Chọn type theo câu hỏi người nghe**, không theo hình thức của tài liệu:
   | Người nghe cần thấy | type |
   |---|---|
   | Ai liên quan đến ai, cái gì chuyển từ đâu sang đâu | `flow` |
   | Nhiều nguồn đổ vào MỘT quỹ / đích rồi chia ra nhiều hướng (quỹ BHXH, ngân sách, nguồn vốn) | `funnel` (dải dày theo tỉ trọng) — `flow` với ≥ 2 mũi tên cùng đổ về một nút sẽ rối, đường cắt nhau |
   | Công thức tính (trợ cấp, thuế, tiền phạt, lãi) — biến nào nhân/chia với biến nào | `formula` (+ `example` = một dòng thay số) — KHÔNG ép công thức thành `steps` |
   | Đề bài tập để người học tự làm trên lớp | `exercise` (đề + dữ kiện + yêu cầu) → slide sau `calc` (lời giải) |
   | Lời giải có số trung gian, đáp số là số tiền dài (1.125.000 đ) | `calc` — `bignum` chỉ nhận số ≤ 3 ký tự |
   | Mỗi điều kiện / dấu hiệu ứng với một hệ quả / căn cứ cụ thể (điều kiện có hiệu lực ↔ căn cứ vô hiệu, dấu hiệu ↔ tội danh) | `match` (đối ứng hai cột, ô trái trùng nhau tự gộp) — `hub` chỉ cho thấy các yếu tố quanh một tâm, mất quan hệ từng cặp |
   | Luật cũ → luật mới theo nhiều quy định (bài giảng cập nhật luật) | `changelog` (nhãn Mới / Đổi / Bỏ / Giữ; ghi tên hai văn bản ở `colOld` / `colNew`) — một thay đổi thì `compare` |
   | Một người / một hồ sơ đi qua nhiều sự kiện, mỗi sự kiện gắn một chế độ / chế định | `journey` — nối các phần rời thành một câu chuyện (5 chế độ BHXH = 5 lúc trong đời người lao động) |
   | Bảng ôn tập: 3–5 đối tượng × 2–3 câu hỏi cố định (ai / khi nào / bao nhiêu) | `cheatsheet` (đầu cột có icon) — tra số liệu chính xác nhiều cột thì `table` |
   | Kiểm 2–6 điều kiện cần (đủ / thiếu / chưa rõ) rồi ra một kết luận | `checklist` (+ `verdict`) — hệ quả rẽ nhánh theo điều kiện thì `tree` |
   | Một chủ đề nhiều mặt, có một ý / con số chính nổi bật | `bento` (thẻ chính lớn + 2–4 thẻ phụ khác cỡ) — các mặt ngang hàng thì `cards` |
   | Cộng / trừ từng khoản ra một số cuối (lương thực nhận, thuế, bồi thường) | `chart` `waterfall` (cột `total: true` đầu/cuối) |
   | Xu hướng liên tục theo năm (≤ 12 mốc) | `chart` `line` — giữ nguyên rồi nhảy nấc thì `step`; so độ lớn từng năm thì `column` |
   | Thời hạn tính bằng số ngày / tháng từ một mốc chung (tố tụng, thủ tục) | `chart` `gantt` (`from`/`to` là số) — có ngày dd/mm/yyyy thì `span` |
   | 2–6 tỉ lệ hoàn thành / bao phủ, có thể có mục tiêu | `chart` `progress` (+ `target`) — một tỷ lệ thì `share` |
   | Ai được, ai mất bao nhiêu | `ledger` |
| 3–4 bên, mỗi bên hai tầng chữ có quan hệ (hậu quả → bài học, quyền → nghĩa vụ) | `cards` + `labels: ["Hậu quả", "Lẽ ra nên"]` — không có nhãn thì người xem không biết dòng nghiêng và dòng dưới liên quan thế nào |
   | Chuyện gì xảy ra lúc nào | `scene` (+ `timelines`) |
   | Hai phía / hai cấp xử / hai luật khác nhau ở đâu | `duel`, `compare` — `duel` mặc định là hai danh sách độc lập (chấm tròn); chỉ đặt `paired: true` khi ý thứ i hai bên thật sự đối ứng nhau (cùng yêu cầu, sơ thẩm xử thế này → phúc thẩm sửa thế kia), vì đánh số cùng hàng khiến người xem đọc thành cặp |
   | Một vấn đề có hai cách hiểu | `fork` |
   | Một con số quyết định + điều kiện | `bignum` |
   | Kết luận dựa trên chứng cứ, trích dẫn | `evidence` |
   | Tổng kết đúng/thiếu | `scorecard` |
   | So độ lớn / tỉ trọng / giai đoạn theo thời gian / trước → sau / xu hướng theo năm (có số liệu thật) | `chart` (`bar` / `donut` / `span` / `slope` / `column` / `step` / `line` / `waterfall` / `gantt` / `progress`) + `insight` |
   | Một ngưỡng / tỉ lệ % (75% đồng thuận, 2/3 biểu quyết...) | `share` (100 thửa đất hoặc 100 ô — người xem "đếm" được tỉ lệ) |
   | Một số tiền / số người / số hộ mà người xem nên ĐẾM được, nhất là phần MẤT ("trả 85 tờ, lấy lại 50") | `isotype` (mỗi hình = 1 đơn vị; phần mất là khung rỗng nét đứt — không tô đỏ đặc, vì tô đặc đọc thành "có nhưng xấu") |
   | Ai ở đâu, trên thửa nào (nhà trên thửa, ngân hàng cạnh bên, toà án) — hiện trạng vụ việc nhà đất | `iso` (cảnh isometric dựng bằng toạ độ; `focus` = vật đang bàn) — chuyển tiền / tài sản giữa các bên thì `flow` |
   | MỘT con số là bước ngoặt của cả bài ("14 ngày", "850 triệu") | `hero` (số khổng lồ, nền tối có hạt) — tối đa 1–2 slide/deck; số cần điều kiện đi kèm thì `bignum` |
   | Một điều luật bị sửa câu chữ (BLDS 2005 → 2015, luật sửa đổi) — chữ nào bỏ, chữ nào thêm | `redline` (nguyên văn cả hai bản; tên từng bản ở `old.label` / `new.label`) — nhiều quy định thì `changelog` |
   | Thời hạn dài tính bằng tháng / năm (thời hiệu, kháng nghị): đã trôi bao nhiêu, còn bao nhiêu | `deadline` (ghi rõ `from` / `to` — engine không tự tính hạn) — < 45 ngày thì `bignum` + `days` |
   | Tra cứu giá trị chính xác theo nhiều thuộc tính (≥ 3 hàng × ≥ 2 cột: so sánh văn bản, mức phạt theo hành vi…) | `table` (+ `focus`/`note`) |
   | Khoảnh khắc cảm xúc / lời kết, có ảnh thật đúng chủ đề | `photo` |
   | Một khoảng ngày ngắn mang ý nghĩa ("chỉ 14 ngày") | `bignum` + `days` (vẽ lịch từng ngày) |
   | Ở đâu / đi qua những nơi nào (tỉnh, toà các cấp) | `map` + `places` |
   | Quy định khác nhau theo tỉnh / nhóm tỉnh (bảng giá đất, sáp nhập...) | `map` + `groups` (tô màu nhóm, số tỉnh tự đếm) |
   | Đối tượng thật + 2–3 ý về nó (ngôi nhà, công trình, khu tái định cư) | `split` (ảnh thật) |
   | 2–3 ảnh hiện trạng / chứng cứ hình ảnh | `gallery` |
   | Kiểm tra hiểu bài trên lớp (trắc nghiệm A–D) | `quiz` — slide hỏi rồi slide đáp án (`reveal: true`, `answer`, `why`; `whyNot` = vì sao từng phương án sai, nhất là bẫy "luật cũ") cùng câu hỏi |
   | Giá trị giữ nguyên rồi nhảy nấc theo năm (lộ trình tuổi hưu, lương cơ sở qua các lần điều chỉnh), tới 20 mốc | `chart` `step` (+ `base` khi trục không bắt đầu từ 0 — ghi rõ ở `note`) |
   | Mốc thời gian không có ngày chính xác (cổ đại, thế kỷ, giai đoạn) | `timeline` (`when` chữ tự do) — có ngày dd/mm/yyyy thì dùng `scene`/`chart span` |
   | Một đối tượng (giấy tờ, tài sản, chủ thể) nhìn từ 2–3 góc độ pháp lý | `panelrows` (+ `cutout` = ảnh vật thật đã tách nền) |
   | Cái nào trên cái nào (thứ bậc văn bản, cấp toà, thứ tự ưu tiên áp dụng) | `pyramid` |
   | Làm gì trước, gì sau, mỗi bước bao lâu (thủ tục, tố tụng, thời hạn) | `steps` (+ `when` = thời hạn) |
   | Kết quả phụ thuộc HAI tiêu chí cùng lúc (lỗi × thiệt hại, rủi ro × khả năng) | `matrix` 2×2 |
   | Hai chế định giống nhau ở đâu, khác nhau ở đâu | `venn` (có điểm chung) — không có điểm chung → `compare` |
   | "Nếu … thì …": hệ quả khác nhau theo điều kiện | `tree` (+ `focus` = nhánh của vụ việc) |
   | Một câu nguyên văn là cả luận điểm | `quote` |
   | Ảnh là chứng cứ, cần chỉ từng chi tiết mà vẫn giữ nền trắng | `frame` (ảnh trong khung + điểm đánh số) |
   | Cùng một đối tượng ở hai thời điểm | `beforeafter` |
   | Đối tượng thật + 2–3 con số về nó (diện tích, số hộ, số tiền) | `photostats` |
   | Giới thiệu địa bàn / bối cảnh bằng nhiều ảnh (4–5) | `mosaic` |
   | Một đối tượng thay đổi qua 3–5 giai đoạn, có ảnh từng giai đoạn | `photostrip` |
   | Chuỗi theo năm cần nêu lý do / căn cứ ở TỪNG dòng (bài báo cáo BHXH, thuế…) | `sheet` (tờ rời kẻ bảng: thanh giá trị + cột ghi chú) — khối hình chính của world `so-bhxh` |
   | Thời hạn tính bằng ngày trong một tháng (báo trước, thử việc, giải quyết hồ sơ) | `calendar` (lịch chấm công, khoảng ngày tô màu) — world `bang-cong` |
   | Bên nào chịu đến chặng nào (Incoterms, chuyển rủi ro / chi phí / quyền sở hữu) | `riskbar` (thanh container, vạch chuyển) — world `cang-bien` |
   | Thửa đất / căn nhà có kích thước, vùng vi phạm, khoảng lùi | `plan` (mặt bằng + đường kích thước) — world `ban-ve` |
   | Một khoản tiền được cộng từ nhiều dòng (giá chưa thuế + thuế = tổng; phí, lệ phí, tiền phạt cộng dồn) | `receipt` (hoá đơn: dòng hàng → cộng → thuế → tổng) — world `hoa-don` |
   | Dòng tiền ra / vào theo ngày và số dư (khoản vay, phí, lãi, trả nợ trước hạn) | `account` (sao kê: nợ / có / số dư) — world `sao-ke` |
   | Ai nắm bao nhiêu % và vượt ngưỡng biểu quyết nào (cổ đông, thành viên góp vốn, M&A) | `captable` (sơ đồ sở hữu + thanh 0–100 % có vạch ngưỡng) — world `co-cau` |
   | Một văn bản tố tụng / xử phạt và chỗ nó thiếu sót (trường bỏ trống, người từ chối ký, vắng mặt) | `record` (biên bản: trường kẻ chấm + hàng chữ ký) — world `bien-ban` |
   | Một câu khẳng định ở bước ngoặt, có ảnh bối cảnh mạnh ("Hơn 800.000 người đã rút") | `headline` (ảnh tràn viền + dải chữ lớn) — tối đa 1–2/deck |
   | Ảnh có MỘT chi tiết là bằng chứng (con dấu, dòng chữ, hàng người, màn hình VssID) | `lens` (kính lúp phóng to chi tiết) — nhiều chi tiết đánh số thì `frame` |
   | 2–3 ảnh về nhiều mặt của MỘT sự việc (nơi làm thủ tục, người hưởng, giấy tờ) | `collage` (ảnh in xếp chồng, băng dính) — 4–5 ảnh thì `mosaic` |
   | Một con số bước ngoặt có ảnh bối cảnh | `hero` + `photo` (số trên ảnh duotone tối) |
   Xem đủ 65 type và trường ở `references/layouts.md`; tên icon dùng được ở `references/icons.md`. **Không chắc chọn type nào** → `python3 scripts/chon_layout.py "<mô tả nội dung>"` (tra `references/layouts_index.json`: mỗi type một luật "chọn khi / bỏ qua khi → thay bằng", học từ PPT Master). **Không chọn hình theo "cho đẹp"**: `venn` mà không có điểm chung, `matrix` mà một trục không quyết định gì, `pyramid` mà các tầng ngang hàng → dùng type khác (engine chặn các ca rõ ràng: thiếu ô, thiếu điểm chung, < 3 tầng/bước).
4. **Viết `deck.json`** theo các quy tắc:
   - Tiêu đề là **câu kết luận**, không phải nhãn hay câu hỏi ("Người mua thiệt nhất", không phải "Hậu quả" hay "Ai thiệt?"). Câu hỏi để ở `kicker`.
   - **Mạch bài phải theo dõi được** (bài `report` chặn `--strict`): mục lục dùng ĐÚNG câu chữ tiêu đề từng chương — chương nên là câu hỏi người nghe có ("Ai phải đóng BHXH bắt buộc?"), `closing.answers` trả lời đúng các câu đó, theo thứ tự; `kicker` cho ngữ cảnh, không nhắc lại tiêu đề; một con số chỉ xuất hiện ở ≤ 2 slide (slide chứng minh + kết luận) — slide sau phải thêm thông tin MỚI.
   - **Tiêu đề phải đọc riêng vẫn hiểu** — đủ **chủ ngữ + vị ngữ + phạm vi** (thời gian, đối tượng): "Số người đóng BHXH bắt buộc chỉ giảm năm 2020", KHÔNG "Tăng đều, chỉ giảm năm 2020" (cái gì?); "Quỹ hưu trí thu vượt chi 60–80 nghìn tỷ mỗi năm (2015–2019)", KHÔNG "Thu luôn lớn hơn chi…" (quỹ nào?). Không nén bằng ký hiệu ("16 → 20 năm") khi chưa nói đó là gì. Thử: che hết thân slide, đưa tiêu đề cho người chưa nghe bài — họ có nói lại được không? Build cảnh báo tiêu đề mở đầu bằng động/tính từ (thiếu chủ ngữ) và tiêu đề ≤ 3 tiếng (nhãn).
   - **Khung bài: bìa → (mục lục) → mỗi chương một `section` → … → `closing` → `end`**:
     - **Bộ chất liệu cả deck (`meta.kit`)** — một "thế giới" cho mọi slide: màu trang, kiểu thẻ, nhãn đầu slide, nhãn ngày / thời hạn, ô số, MỘT đồ vật vẽ bằng code ở mép slide, MỘT vật đánh dấu thẻ chính. `file` (hồ sơ — bài luật, bản án) · `paper` (giấy kẻ dòng — bài giảng, tiểu luận) · `glass` (kính — báo cáo, số liệu) · `none` (giao diện gốc). Mặc định tự chọn theo `meta.kind`. Bộ chất liệu chỉ đổi HÌNH, không đổi chữ. Nguyên tắc đằng sau + cách thêm bộ mới: **`references/nguyen-tac-bo-cuc.md`** — đọc trước khi muốn "làm slide sinh động hơn": thêm cơ chế dùng được cho đề tài chưa gặp, không chép mẫu.
     - **Câu chốt (`takeaway`, ≤ 110 ký tự)** ở các slide dùng hàng chú thích chung → dải "Ghi nhớ" cùng một chỗ ở mọi slide. Không dùng cùng `note` (hàng đáy chỉ chứa một câu); bố cục có chỗ chú thích riêng (`evidence`, `chart`, `stats`...) → engine báo lỗi kèm danh sách bố cục nhận `takeaway`.
     - **Giấy ghim (`pin`)** — câu / số chính của slide trên tờ giấy nghiêng (vật giữ tờ theo bộ chất liệu); trích dẫn ghi `by` (người nói, điều luật). Engine tự tìm chỗ trống, không đủ thì báo — dùng cho slide thưa. **`hub`** — một khái niệm ở giữa + 4–6 yếu tố (điều kiện có hiệu lực, yếu tố cấu thành).
     - **`quote`** có `cutout` (ảnh thật đã tách nền: người, tượng, vật) → ảnh đứng bên phải, tự lật để chỗ bị cắt trùng mép slide; `photoStyle: "bw"` cho ảnh tư liệu. Câu trích luôn có `by` (thiếu → cảnh báo).
     - **Nối mạch (`meta.thread: true`)** — Morph giữa các slide cùng chương (thanh tiến độ dài dần) và từ mục lục sang slide mở chương (ô số bay thành số chương); ranh giới chương vẫn fade. **Mở chương nền ảnh mờ**: `section` + `photo` + `photoLayout: "backdrop"`.
     - **Nhịp**: build gợi ý khi 3 slide liền nhau cùng type hoặc cùng dày chữ — xen một slide khác dáng / thưa chữ.
     - **Phong cách cả bộ mở – chương – kết (`meta.style`)**, chọn theo loại bài, áp cho bìa / `section` / `end` không có ảnh: `dossier` — hồ sơ vụ án (bìa giấy kraft trên mặt bàn, tab hồ sơ = chương, dấu mực đỏ, dây buộc): mọi bài bình luận bản án, vụ việc · `cadastral` — bản đồ địa chính (lưới toạ độ, thửa gạch đỏ = `meta.motifLabel`, sơ đồ chắp tờ = các chương, lộ trình chương ở slide cuối): CHỈ vụ việc đất đai, nhà ở, quy hoạch · `portico` — mặt tiền toà án (số cột = số chương, cột đang trình bày tô màu nhấn, trán tường khắc thông điệp): bài trang trọng, hội thảo, bảo vệ, phiên toà giả định. Nền là ảnh PNG (chất liệu, bóng đổ); mọi chữ là ô chữ thật. Bìa ghi `layout` khác `art` hoặc slide có ảnh → giữ kiểu riêng; `"style": "classic"` ở slide để tắt. Con dấu chỉ ghi chữ chung chung — KHÔNG vẽ quốc huy, không mô phỏng dấu cơ quan nhà nước.
     - **Mở – kết gây ấn tượng (11/2026)**: bìa `layout: "poster"` (ảnh tràn viền, tiêu đề lớn chữ trắng, `facts` = 1–3 thẻ dữ kiện: giai đoạn, số câu hỏi, số kiến nghị) → slide mở đầu `hero` + `photo` (một con số gây chú ý trên ảnh duotone) → … → kết luận `closing` `answers` + `photo` (ảnh tràn mép phải) → `end` `style: "poster"` (cùng ngôn ngữ với bìa, `message` = câu chốt). Ảnh mở – kết theo tiêu chí riêng ở `references/anh-that.md`.
     - Bìa (`cover`) chọn `layout` theo chất liệu có: không có ảnh nhưng muốn bìa có chiều sâu → `paper` (các lớp giấy cắt, dáng sóng sinh từ tên đề tài — mỗi đề tài một hình riêng); có ảnh đẹp đúng chủ đề → `band` (ảnh làm bối cảnh, chữ nền trắng) hoặc `full`/`split`; không có ảnh → `art` (hình vẽ theo motif) hoặc `typo` (chữ lớn tối giản — hợp bài trang trọng). Ghi `date` (tháng/năm hoặc ngày thuyết trình).
     - Bài ≥ 2 chương: slide `section` (không ảnh) tự XOAY 3 kiểu theo số chương (`giant` số khổng lồ viền rỗng · `block` khối màu nhấn liệt kê tên các chương · `dark` nền tối có hạt) và tự ghi ô **"Trong chương này"** = 2–4 tiêu đề slide của chương — tiêu đề slide phải là câu kết luận thì ô này mới có nghĩa. Bìa `typo` tự có chữ nền khổng lồ (số hiệu bản án). Slide `end` mặc định kiểu `bookend`: dải giấy cắt lớp khớp bìa `paper` + "Điều cần nhớ" (tự lấy tiêu đề `closing`) + nhóm có vòng chữ cái đầu. Hình mặc định của `agenda` / `closing` / `end` tự xoay trong họ hình hợp loại bài (không lặp cán cân 3 lần). Ngoài ra: mỗi chương mở bằng `section` có `num` → engine tự vẽ **bản đồ chương** (người nghe biết đang ở chương mấy / tổng). Chương có ảnh tiêu biểu → thêm `photo` cho `section`.
     - Slide cuối là `end` (cảm ơn / hỏi đáp + nhóm thực hiện + liên hệ), KHÔNG nhét lời cảm ơn vào `closing` (`thanks` chỉ dùng khi không có `end`).
   - **Slide mở đầu (ngay sau bìa)**: nêu nghịch lý bằng đúng chi tiết làm nên câu hỏi pháp lý (vd. "nhà chưa giao" — không chỉ "đã trả tiền, vẫn thua"); không lặp một từ ở tiêu đề, số liệu và con dấu; không đặt câu hỏi pháp lý ở đây (để dành cho `agenda`).
   - **Slide kết luận** (`closing`) có 3 việc, theo thứ tự: `answers` — trả lời TỪNG câu hỏi của `agenda`, đúng thứ tự, mỗi câu một dòng kèm căn cứ then chốt; `verdict` — nhận định của người viết về bản án (đúng/sai ở đâu); `rec` — kiến nghị gắn với lỗ hổng đã chứng minh ở các slide trước. Bài học cho từng bên → một slide `cards` đứng trước. Engine cảnh báo khi số câu trả lời ≠ số câu hỏi.
   - `[từ khoá]` làm nổi 1–3 từ — chính là chữ người nghe phải nhớ.
   - **Cắt chữ đệm**: "có thể thấy", "nhìn chung", "bên cạnh đó", "ngoài ra", "một cách", "vô cùng"… Bỏ đi câu vẫn đủ nghĩa thì bỏ.
   - Mỗi ô một mệnh đề ngắn. Viết tắt có chủ đích sau lần đầu (GCN, BLDS, BLTTDS). Lý do chi tiết, số liệu phụ → `notes`.
   - **Ba tầng chữ** — mỗi câu phải biết mình thuộc tầng nào; câu không thuộc tầng nào thì xoá:
     1. *Khẳng định* (tiêu đề, `head`, `value`) — to, đậm: điều người nghe phải nhớ.
     2. *Dẫn chứng* (`text`, `desc`, `items`) — cỡ thân: số liệu, điều luật, trích bản án, **ví dụ cụ thể**.
     3. *Chú thích* (`note`, `src` = căn cứ pháp lý của một ý, `quoteBy`) — nhỏ, mờ, ở hàng chú thích cuối slide. Câu phụ "để cho đủ" thì hạ xuống tầng 3 hoặc bỏ.
   - **Bài báo cáo số liệu / thực trạng (`kind: report`) — 7 luật học từ nhận xét giảng viên (BNK405, 11/2026)**:
     1. **Số liệu**: mỗi con số trên slide có một dòng ở `prep.json` → `data` (nguồn + ngày đối chiếu). Hai bảng trong tài liệu gốc cho số khác nhau (vd. 2025: 17,281 hay 18,91 triệu), đơn vị lệch (nghìn tỷ ↔ tỷ) → ghi `unsure`, hỏi người dùng; không tự chọn một số.
     2. **Phạm vi**: `prep.json` → `scope.in` (vd. "chỉ BHXH bắt buộc") và `scope.out` → chép vào `meta.scopeOut` (vd. `["BHYT", "bảo hiểm y tế", "tự nguyện"]`). Slide đầu được nêu tổng thì ghi `"scopeOk": true`; các slide sau chỉ số liệu trong phạm vi.
     3. **Nguyên nhân đặt tại năm**: biểu đồ `column` theo năm → mỗi năm đổi chiều (tăng → giảm, giảm → tăng) hoặc âm (chi vượt thu) có `items[].why` (≤ 70 ký tự, có số / sự kiện / văn bản). KHÔNG làm một slide "nguyên nhân" chung cho cả giai đoạn. Thu – chi: vẽ cột **chênh lệch** từng năm (năm âm tự đỏ) + `why` ở năm âm.
     4. **Ý con khớp ý lớn**: mỗi `desc` / ý con phải chứng minh đúng `name` / `head` của thẻ đó (soát bằng mắt — build không bắt được). Nhận định tốt ("đầy đủ", "kịp thời", "ổn định") cũng là nhận định: cần số trên slide + nguồn trong `notes` (`Nguồn: báo cáo … BHXH Việt Nam …`).
     5. **Hạn chế có gốc**: slide hạn chế ghi `"basis": [số slide thực trạng chứa số liệu]` — hạn chế phải đã hiện ở phần thực trạng (trốn đóng → số nợ đóng; rút một lần → số người rút).
     6. **Kiến nghị chỉ ra điều, khoản**: mỗi kiến nghị nêu quy định cụ thể đang chưa hợp lý (số hiệu văn bản + điều, khoản) và hướng sửa; mở văn bản gốc kiểm trước khi viết.
     7. **Mỗi ý một ô chữ**: engine vẽ mỗi ý (`rec.items`, `bento` `items`) thành ô chữ riêng, căn đều — đừng nhồi nhiều ý vào một chuỗi bằng "; " hay xuống dòng.
     Có nhận xét của giảng viên cho bản trước → ghi vào `prep.json` → `feedback: [{ "note": "…", "fix": "đã xử lý thế nào" }]`; `prep.py check` báo ý chưa xử lý.
   - **Mọi nhận định phải có dẫn chứng trên cùng slide.** Viết "không hợp lý", "thiếu", "gây tác động xấu" thì ngay bên cạnh phải có *vì sao*: điều luật bị trái, con số, đoạn trích, hoặc ví dụ chứng minh. Engine cảnh báo slide có từ đánh giá mà không thấy dẫn chứng nào.
   - **Ký hiệu có nghĩa cố định trong cả deck** (engine cảnh báo ký tự trang trí như emoji, ★ ● ► ✓):
     | Ký hiệu | Chỉ dùng để |
     |---|---|
     | → | hệ quả, dẫn đến ("chưa giao nhà → còn đang thực hiện") |
     | · | ngăn cách hai thông tin cùng cấp (số hiệu · ngày) |
     | — | đối lập hoặc giải thích ("trả đủ tiền — vẫn vô hiệu") |
     | ≈ | số xấp xỉ, tự tính |
     | “ ” | trích nguyên văn bản án / văn bản |
     | ? | điều chưa được giải quyết |
     Đúng/sai/nghi vấn dùng trường `ok`, `verdict`, `tone` để engine vẽ icon — không gõ ✓ ✗.
   - **Dấu vẽ tay** (Rough.js): engine tự khoanh con số then chốt của `bignum`, dòng `focus` của `ledger`, hàng `focus` của `table`. Mỗi slide tối đa một dấu — chỉ đặt `focus` ở đúng chỗ người nói sẽ chỉ vào.
   - **Bảng và biểu đồ phải có việc riêng — không dùng cho "có hình".** Trước khi dùng, trả lời: *người nghe làm gì với nó?*
     | Người nghe cần | Dùng | Không dùng khi |
     |---|---|---|
     | Thấy to–nhỏ, trước–sau, dài–ngắn trong 3 giây | `chart` + `insight` (kết luận) | chỉ 1 giá trị (→ `bignum`); donut > 4 lát (→ bar) |
     | Thấy xu hướng theo năm (tăng, giảm, đảo chiều) | `chart` `column` — ĐỦ các năm (≤ 12), không chọn lọc vài năm; 2 chuỗi → `value2` + `series`; giai đoạn đặc biệt → `bands` (COVID-19, luật mới); số âm tự đi xuống, màu đỏ | dùng `bar` ngang cho năm (engine cảnh báo) |
     | Tra đúng con số theo hàng × cột | `table` + `focus` (hàng then chốt) hoặc `note` (kết luận) | < 3 hàng hoặc < 2 cột (→ `bignum`/`compare`/`cards`) |
     | Thấy ai được/mất bao nhiêu | `ledger` | — |
     - KHÔNG trình bày cùng một dữ liệu hai lần (bảng rồi biểu đồ liền nhau) — chọn một; số liệu gốc chi tiết để trong `notes`. Engine cảnh báo khi ≥ 40% giá trị trùng.
     - Mốc ngày đã vẽ trên dòng thời gian thì hình sau phải thêm điều mới (vd. thêm mốc luật mới có hiệu lực); engine gợi ý khi một mốc được vẽ lại ≥ 3 lần.
     - Biểu đồ phải vẽ đúng thứ làm nên lập luận: câu hỏi "luật nào áp dụng" → vẽ **ngày xác lập giao dịch** so với ngày luật có hiệu lực, không chỉ quãng tố tụng.
   - **≤ 80 tiếng mỗi slide** (engine cảnh báo khi > 110). Một tiếng là một âm tiết tiếng Việt; ~100 tiếng ≈ 50 từ tiếng Anh.
   - **Hoạ tiết phải đúng chủ đề** (`meta.motif`) — hỏi: "hình này nói gì về nội dung?" Không trả lời được thì `none`.
     | motif | Vẽ gì | Chỉ dùng khi chủ đề là |
     |---|---|---|
     | `cadastral` | bản đồ địa chính, thửa tranh chấp tô nổi, ghim (+ `meta.motifLabel`: "Thửa 622 · tờ bản đồ 23") | đất đai, nhà ở, bất động sản, thế chấp QSDĐ |
     | `certificate` | hoa văn guilloche kiểu giấy chứng nhận/tiền giấy | hợp đồng, giấy tờ có giá, chứng từ, ngân hàng |
     | `landscape` | núi nhiều lớp, sương, mây, sóng | môi trường, du lịch, địa lý, văn hoá |
     | `contour` | đường đồng mức (bản đồ địa hình) | quy hoạch, đất đai vùng rộng, môi trường, khoáng sản, địa giới |
     | `dots` | lưới chấm nhạt (giấy kẻ chấm) | báo cáo, phân tích số liệu — chủ đề trung tính nhưng muốn có chất liệu nền |
     | `lines` | giấy kẻ dòng có lề, nét "chữ viết" mờ | hồ sơ vụ việc, biên bản, nghiên cứu tài liệu, bình luận bản án |
     | `grid` | giấy kẻ ô ly + mặt bằng đơn giản | xây dựng, quy hoạch, cấp phép, số liệu kỹ thuật |
     | `waves` | dải sóng mảnh song song | kinh doanh, tài chính, công nghệ, thương mại điện tử — hợp theme `son` |
     | `blobs` | mảng màu loang hữu cơ, rất nhạt | thuyết trình nhẹ, kỹ năng, chủ đề con người — không hợp bản án nghiêm túc |
     Có thể phối **2 hoạ tiết**: `"motif": ["cadastral", "lines"]` — tên đầu cho bìa/chuyển phần/kết, trang nội dung xen kẽ hai tên (vd. đất đai + hồ sơ). Không quá 2.
     | `none` (mặc định) | nền trắng trơn | mọi chủ đề khác |
     Trang nội dung: engine đặt hoạ tiết vào **vùng trống lớn nhất chạm mép phải, sau khi xếp nội dung**; mỗi slide một biến thể (hình lật, hạt giống khác) (mép mờ dần, chạm mép slide thì tràn ra mép, luôn ở lớp dưới cùng); slide kín chỗ thì không vẽ — đó là đúng, không phải lỗi.
     `art` trong slide cũng vậy: `justice` (cán cân + búa + sách) cho phân tích bản án; `house`/`land` cho nhà đất; `document` cho giấy tờ. BHXH / bảo hiểm: `passbook` (sổ BHXH mở), `idcard` (thẻ BHXH / mã số), `pension` (đồng hồ + chồng xu = lương hưu). Bài giảng, tài chính – bảo hiểm: `book` (sách mở — giáo trình, khái niệm), `umbrella` (ô che — bảo hiểm, phòng ngừa), `shield` (khiên có dấu tích — được bảo vệ, phạm vi bảo hiểm), `fund` (nhiều khoản nhỏ đổ vào quỹ chung), `quiz` (khung hỏi đáp). `meta.art` đặt hình mặc định cho cả deck (mặc định theo `meta.kind`). Engine tự giữ đúng tỉ lệ hình trong ô và **cảnh báo khi một hình lặp ở ≥ 3 slide nội dung** (chặn `--strict`) — hình lặp là trang trí, không nói gì về slide. Không dùng núi cho vụ án hợp đồng, không dùng búa toà cho bài môi trường.
   - Biểu đồ chỉ dùng số liệu có trong tài liệu (ngày tháng, số tiền, tỉ lệ). Không có số thật → không dùng `chart`.
   - Nhịp nền: engine mặc định nền trắng; thẻ nhấn tối nằm bên trong slide. Đặt `"mode": "a"` (nền màu nhấn) cho 1–3 slide bước ngoặt; `"mode": "d"` nếu người dùng muốn slide tối.
   - Không lặp cùng `type` quá 3 slide liền (trừ `scene`).
   - Pháp lý: giữ nguyên số hiệu văn bản, điều khoản, tình trạng hiệu lực từ nguồn; không bịa. Con số tự tính (ví dụ trong `ledger`) phải cộng được từ dữ kiện có trong tài liệu. Ghi rõ phần nào là "quan điểm người viết".
5. **Ảnh thật — mặc định CÓ, 4–8 ảnh/deck, mỗi ảnh một cách dùng khác nhau** (ảnh thật giúp người nghe hình dung đối tượng và nhớ lâu hơn chữ; chỉ bỏ ảnh khi tìm không ra ảnh đúng chủ đề — khi đó build in gợi ý cho deck ≥ 10 slide). Phân bổ gợi ý: bìa (`band`/`full`/`split`) · mỗi chương 1 ảnh (`section` có `photo`, hoặc `photostats` / `split` / `frame`) · 1 slide nhiều ảnh (`mosaic` / `gallery` / `photostrip` / `cards` có ảnh) · `end` có ảnh — tự tìm, không bắt người dùng đi tìm:
   **Khung ảnh (`frame`, `meta.frame`)** — ảnh ở bìa / `agenda` / `section` / `end` được TÔ vào hình PowerPoint thật (mở – mục lục – chương – kết thành một bộ cùng ngữ pháp) (khung đứng trọn bên phải, chữ trên nền bên trái — không thẻ đè khung) (`rect` · `arch` · `circle` · `ogee`), có viền nhạt bằng bản sao phóng lớn; người dùng mở PowerPoint vẫn đổi ảnh, kéo giãn được. Chọn theo chủ đề: `arch` hợp bài trang trọng, giảng đường, toà án; `circle` cho chân dung, vật thể; `ogee` CHỈ khi chủ đề là văn hoá, lịch sử, di sản phương Đông; không có lý do thì để ảnh chữ nhật. Khung mới = công thức ghép hình cơ bản trong `engine/shapes.js` (`brace`, `roundRect`, `ellipse`, `arch` → `union` / `subtract`), KHÔNG vẽ tay đường cong. `meta.paper: true` thêm vân giấy rất nhạt cho nền sáng.
   Chi tiết đầy đủ (viết brief, chấm ảnh 0–3, 5 tiêu chí thẩm mỹ, nguồn ảnh, `cutout`, `imagePolicy`, cách dùng ảnh theo `photoStyle`): **`references/anh-that.md` — ĐỌC trước khi tìm ảnh.** Năm điều không được bỏ:
   - Tìm theo BRIEF (`briefs.json`: `want` / `queries` / `must` / `place` / `avoid`) bằng `scripts/find_images.py --brief`, không tìm theo một từ khoá rời.
   - **Mở `images/_candidates.jpg` và chấm bằng mắt**: chỉ lấy ảnh ≥ 2 điểm (đúng đối tượng + đúng bối cảnh) và đạt thẩm mỹ; không đạt → dùng hình vẽ của engine, KHÔNG lấy ảnh "tạm được".
   - Mặc định `meta.imagePolicy` là `"classroom"` (chỉ chiếu trên lớp): được dùng ảnh báo / trang web, BẮT BUỘC `photoSource`; ưu tiên ảnh giấy phép mở trước. Slide sẽ đăng công khai / nộp cuộc thi → đặt `"open"` (chỉ CC0, PD, CC BY, CC BY-SA, Pexels). Luôn: không ảnh AI, ảnh thương hiệu, người nhận diện được mà không liên quan.
   - Mỗi slide một ảnh riêng; ảnh minh hoạ không phải hiện vật vụ việc → ghi rõ ở `photoAlt`.
   - **Ảnh phải thể hiện đúng hành vi / sự kiện của slide** (rút một lần → hàng người chờ rút; lương hưu → chi trả lương hưu); slide nội dung chỉ nhận ảnh 3 điểm. Mỗi kiểu bố cục ảnh tối đa 2 lần/deck (build cảnh báo); 2–4 slide NỘI DUNG có ảnh (`split` / `photostats` / `frame`), không chỉ bìa và mở chương. Chi tiết: `references/anh-that.md` mục "Tiêu chí chọn ảnh".
   - Ghi `"photo": "images/<file>.jpg"` + `"photoAlt"`; engine tự cắt khung, đặt chữ phía yên tĩnh. Slide KHÔNG in dòng ghi nguồn ảnh; build xuất `<tên>_ghi-cong.md` (tác giả · giấy phép · trang gốc từng ảnh, icon Font Awesome) để dán vào bản Word — ảnh CC BY / BY-SA vẫn bắt buộc ghi công, chỉ là ghi ở bản Word.
6. **Xem trước 3 giao diện** rồi hỏi người dùng chọn (nếu họ chưa chọn):
   `python3 scripts/preview.py deck.json` → gửi ảnh `*_preview.jpg` (thêm `--themes=toa,xanh,muc` để xem 3 theme mới).
7. **Dựng**: `node engine/build.js deck.json out.pptx --theme <teal|kem|son|toa|xanh|muc> [--strict] [--transition fade|push|morph|none] [--build] [--motion] [--raster]`
   - Mặc định icon, hình minh hoạ, hoạ tiết, bản đồ được nhúng **SVG thật** (nét khi phóng to; PowerPoint 365: chuột phải → Convert to Shape để sửa) kèm PNG dự phòng cho Office cũ. `--raster` = chỉ PNG (khi người nhận báo hình lỗi).
   - Lỗi cấu trúc (type lạ, thiếu trường, icon sai, `edges.from` không khớp `nodes.id`) → exit 2. Sửa đúng trường được nêu.
   - Cảnh báo (vượt ký tự, "cần N dòng", tiêu đề là câu hỏi, quá nhiều tiếng, cụm đệm) → **sửa nội dung, không sửa engine, không xin hạ cỡ chữ**. Nội dung không vừa thì cắt chữ, tách slide hoặc đổi type.
   - "Chữ đè nhau / khối sát nhau" (chặn `--strict`): rút gọn đúng ô được nêu hoặc bỏ bớt một ý.
   - "ℹ Gợi ý bố cục — dư khoảng trống" (không chặn): slide quá ít nội dung so với type → gộp với slide kề bên hoặc đổi type gọn hơn (vd. 2 câu hỏi → `statement`, 1 điều kiện → `bignum` không `conds`). KHÔNG thêm chữ đệm cho đầy.
   - Bản giao người dùng phải qua được `--strict`.
   - `--native` (hoặc `"meta": {"native": true}`): biểu đồ `bar`/`column`/`line`/`donut` và `table` thành đối tượng PowerPoint gốc — người nhận chuột phải → **Edit Data** để sửa số (học từ PPT Master, siril9). Dùng khi người nhận sẽ cập nhật số liệu (giảng viên, phòng ban). Mặc định vẫn vẽ bằng hình (đúng thiết kế, kiểm tràn được). `step`, `waterfall`, `gantt`, `progress`, `span`, `slope` luôn vẽ bằng hình.
   - Gặp nhiều cảnh báo cùng lúc → sửa theo **thứ tự** ở `references/loi-thuong-gap.md` (cấu trúc → sai type → thừa chữ → tràn → nhịp → khoảng trống).
   - `--transition morph`: Morph giữa hai slide liền nhau CÙNG bố cục (chuỗi `scene` — chấm mốc trượt dọc dòng thời gian; `quiz` hỏi → đáp án; `chart` cùng kind; `isotype`, `iso`, `timeline`, `journey`), còn lại `fade`. Chỉ PowerPoint 2019 / 365 chạy Morph (2016 chỉ phát được); LibreOffice, Google Slides, PowerPoint cũ tự dùng `fade` — nói rõ với người dùng. Slide riêng: `"transition": "morph" | "fade" | "push" | "none"`.
   - `--build` (hoặc `"build": true` ở từng slide `steps` / `cards` / `checklist` / `timeline`): mỗi ý hiện ra khi bấm — người nghe chỉ thấy ý đang được nói (nguyên tắc phân đoạn của Mayer). Chế độ soạn thảo và bản in vẫn hiện đủ. LibreOffice đọc được hiệu ứng này; PowerPoint mọi bản đều chạy.
   - `--motion` (hoặc `meta.motion: true`; tắt riêng một slide bằng `"motion": false`): các ý **tự lộ dần khi vào slide**, không phải bấm — nhịp của video giải thích (skill `motion-video`, mục kỹ thuật edit). Có ở `headline`, `hero`, `stats`, `cards`, `steps`, `checklist`, `timeline`, bìa / cảm ơn `poster` và mọi khối hình chính (`sheet`, `calendar`, `riskbar`, `plan`, `receipt`, `account`, `captable`, `record`). Luật đã cài sẵn: tiêu đề, kicker, ảnh nền **có mặt ngay khung đầu**; các ý cách nhau ~110 ms; cùng một hướng (thanh trượt từ trái theo chiều đọc, thẻ nổi lên); vào giảm tốc; **khoảng lặng ~0,35 s trước dòng chốt** (dòng focus, tổng tiền, con dấu "từ chối ký"); tối đa MỘT cú "đáp xuống" (con số phóng từ to về đúng cỡ) mỗi slide; cả slide xong trong ≤ 1,8 s. `build: true` thắng `motion` (người nói muốn bấm từng ý). Dùng cho thuyết trình có người nói; bản nộp / in không bị ảnh hưởng. **Có world thì ý hiện theo tính cách của world** (`motion` trong world): sổ BHXH / biên bản **đóng dấu** (to → đúng cỡ, xoay về thẳng), bảng chấm công **lật lịch**, bến cảng / sao kê **trượt vào** từ trái, hoá đơn **giấy chạy ra** từ trên xuống, bản vẽ **vẽ nét**, cơ cấu **nút bật ra**. Dòng chốt (con số hero, tổng hoá đơn, số dư cuối kỳ, công ty) có thêm **nhịp nhấn** (phóng 108 % rồi về) sau khi hiện. `meta.thread` + world: thanh tiến độ hình vật thật mang tên Morph → giữa hai slide trong chương nó "chạy tiếp" (thêm ô dấu, thêm container). LibreOffice đọc đúng (wipe, ascend, turn-and-grow, fly-in, fade-in-and-zoom, grow-and-shrink, after-previous); PowerPoint chưa được kiểm trực tiếp trong môi trường dựng.
   - Build in "ℹ Mù màu đỏ–lục" khi theme đang chọn có cặp màu tốt/xấu gần trùng với người thiếu sắc giác (giả lập Machado et al. 2009) và slide biểu đồ phân biệt mục `bad` CHỈ bằng màu → thêm dấu "−" / chữ vào `display`, dùng `annotate`, hoặc đổi theme (`xanh`, `muc` rõ nhất; `kem` nền sáng kém nhất).
   - Mặc định có hiệu ứng chuyển slide `fade`. `push` hợp với chuỗi `scene`. PowerPoint hiển thị được; ảnh soát bằng LibreOffice không thể hiện hiệu ứng.
8. **Soát**: `python3 scripts/render.py out.pptx` → mở `sheet.jpg` VÀ vài ảnh slide đơn ở độ phân giải đầy đủ. Sau đó chạy `python3 scripts/check_overflow.py out.pptx`, phải ra exit 0. Soát bằng mắt theo danh sách:
   - Mỗi slide: che phần thân, chỉ đọc tiêu đề — đã hiểu ý chưa?
   - Không có ô trống, thẻ trống, dòng mồ côi một chữ.
   - Mũi tên/đường nối không chập nhau, không xuyên qua chữ.
   - Bài báo cáo: mỗi ý con khớp ý lớn của thẻ (L17); mỗi hạn chế trỏ được về số liệu đã trình bày; mỗi kiến nghị có điều, khoản.
   - Màu đỏ (`bad`) chỉ dùng cho điều tiêu cực thật, không dùng để trang trí.
9. Gửi file .pptx (+ ảnh sheet). Nhắc người dùng kiểm lại số liệu pháp lý nếu có con số tự tính.

## Quy tắc thiết kế mà engine đã cài sẵn (đừng chống lại)
- **Lưới cố định** (có test đo toạ độ): kicker y 0.85 · tiêu đề y 1.25 (cả khi không có kicker) · thân từ y 2.3 · hàng chú thích y 6.62 · lề trái/phải 0.6. Người xem không phải tìm lại tiêu đề khi chuyển slide; mắt đọc theo chữ Z: tiêu đề → nội dung trái → phải → chú thích.
- **Trang trí lồng vào thành phần, không rắc lên nền** (học từ mẫu Pinterest): nhãn tab vắt qua mép thẻ (`duel`), huy hiệu icon nửa trong nửa ngoài thẻ (`cards`), mảng tròn chìm ở góc thẻ tối, thẻ kết luận có lớp chồng phía sau (`chart` insight, trích dẫn `evidence`). Mỗi trang trí có việc: chỉ nhóm, chỉ thứ tự đọc, hoặc chỉ điểm chính.
- Thang cỡ chữ: tiêu đề 34–44pt, thân 15–18pt, chú thích ≥ 13pt, nhãn chữ hoa 12pt. Không có chữ < 12pt ngoài thanh chrome.
- **Bố cục co giãn theo nội dung** (lớp kiểm 3 đo toạ độ thật): `flow`, `agenda`, `bignum`, `stats`, `scorecard`, ô `insight` tự giãn và căn giữa dọc; ít mục → hàng cao, chữ to hơn. Khối có nền cách nhau 0 hoặc ≥ 0.15 in (không "suýt chạm"). Chi tiết: `references/svg-va-cong-cu.md` mục 5.
- Không gạch chân tiêu đề, không dải màu trang trí dọc mép slide. Nhóm thông tin bằng nền thẻ hoặc khoảng trắng.
- Một motif xuyên suốt: icon trong hình tròn + chữ nghiêng màu nhấn; hoạ tiết nền theo `meta.motif` (rất mờ ở trang nội dung, lớn ở bìa/chuyển phần/kết).
- Thẻ trắng có bóng đổ mềm; nền tối (nếu dùng) có quầng sáng.
- **Điều hướng** — kicker dạng "Phần 1 · …" / "Câu 02 · …": thanh trên cùng hiện "PHẦN 1 · TÊN PHẦN" (tên lấy từ slide mở đầu phần: `section` có `num`, hoặc `photo` có kicker "Phần N · Tên"); kicker trên tiêu đề tự bỏ tiền tố "Phần 1 ·" để khỏi lặp. Tên đề tài (`meta.short`) chỉ hiện ở các slide chưa vào phần nào. Lint: mỗi "Phần/Chương" phải có slide mở đầu; `agenda` phải có đúng số mục bằng số phần.
- **Nhấn có chọn lọc** — tối đa 2 chỗ `[ ]` ngoài tiêu đề mỗi slide; khối nền đậm (statement, bignum, compare, duel, mode `d`) tối đa ~1 trên 6 slide và phải đặt vào điều ĐANG áp dụng / kết luận (`focus` của `compare`, `duel`); một slide nội dung nền màu nhấn lẻ loi (`mode: "a"`) bị cảnh báo. Ô `insight` của biểu đồ là thẻ sáng có vạch màu, không phải khối đậm.
- Motif giấy tờ (`cadastral`, `certificate`) có dấu góc chữ L ở bìa / chuyển phần / kết như trang văn bản.
- Chống dòng mồ côi: engine tự nối 2 chữ cuối mỗi đoạn bằng khoảng trắng không ngắt — dòng cuối không còn một chữ lẻ loi.
- Nhãn, chip căn cứ, tab, nhãn mũi tên được đo bề rộng bằng font thật rồi co vừa chữ (không ước lượng theo số ký tự) — đổi theme/font không làm chip tràn hai dòng.
- `cards` cao vừa nội dung và đặt giữa vùng thân; `flow`: mũi tên vượt qua nút khác thì nhãn nằm sát nút nguồn; **hai mũi tên cắt nhau → cảnh báo (chặn `--strict`)**, sửa bằng `edges[].side: "above" | "below"` (đưa một mũi tên xuống dưới các nút), đổi thứ tự nodes hoặc bớt mũi tên. Nút có 2 mũi tên đổ về (hội tụ) nên đặt ngay sau hai nút nguồn: `A, B, Đích, …`.
- Bìa tự đo chiều cao tiêu đề rồi xếp phụ đề, tác giả ngay bên dưới (không còn khoảng trống cố định).
- Hình minh hoạ phải đúng vật được nói tới: `gcn` cho giấy chứng nhận, `house`/`land` cho nhà đất, `justice` cho phán quyết — không dùng hình "văn bản chung chung" khi đang nói về một loại giấy cụ thể.
- **Nhìn rõ khi trình chiếu**: build đo tỉ lệ tương phản WCAG của TỪNG ô chữ với màu nền thật bên dưới (tính cả độ trong suốt, cả ảnh). Chữ thường cần ≥ 4.5:1, chữ lớn (≥ 18pt hoặc ≥ 14pt đậm) ≥ 3:1 — máy chiếu luôn làm nhạt màu hơn màn hình. Không đạt → `--strict` dừng. Bảng màu 3 theme đã được chỉnh để đạt.
- Ảnh thật: ảnh tràn viền có lớp chuyển màu phía chữ; thanh trên cùng vẽ sau ảnh; không có dòng ghi nguồn trên slide (ghi công ở bản Word).
- Mọi hình có alt text (đọc được bằng trình đọc màn hình, qua kiểm tra Accessibility của PowerPoint).
- Build in ra thời lượng nói ước tính từ ghi chú (~160 tiếng/phút) và cảnh báo slide thiếu ghi chú.
- **Đồ hoạ bằng code (đợt 11/2026, không ảnh, không AI)** — chi tiết + nguồn ở `references/svg-va-cong-cu.md` mục 7:
  - `chart` + `annotate: {"item": 2, "text": "Luật đổi giữa lúc xử"}` → vòng khoanh + mũi tên cong + câu chữ nghiêng VIẾT TAY chỉ vào đúng một cột/thanh (bar, column, span). Engine tự chọn chỗ đặt câu không đè cột, nhãn, vạch mốc. Mỗi slide một chú thích.
  - `chart` `items[].hatch: true` → GẠCH CHÉO gốc PowerPoint (sửa được ở Format Shape). Nghĩa cố định trong cả deck: chưa chắc / tranh chấp / hết hiệu lực / ước tính — ghi nghĩa ở `note`.
  - Khối nền tối (statement, duel, compare, bignum…) tự tô gradient chéo GỐC PowerPoint từ nền tối sang màu thẻ tối.
  - Hoạ tiết `cadastral` ở trang nội dung: thửa đất hình Voronoi (nhiều cạnh như bản đồ địa chính thật).
  - Hai thứ là ẢNH PNG (vì cần bóng mờ / hạt nhiễu mà PowerPoint vẽ sai từ SVG): bìa `paper`, nền slide `hero`. Chữ trên đó vẫn là ô chữ thật.
- Nguồn mở đang dùng: polygon-clipping (MIT — phép gộp hình của bộ dựng hình `engine/shapes.js`: khung ảnh `frame`), jsdiff (BSD-3-Clause — so chữ của `redline`), perfect-freehand (MIT — nét bút viết tay của `annotate`), pptxgenjs (MIT), react-icons (MIT; icon bên trong theo giấy phép từng bộ: **Phosphor MIT, Lucide ISC, Tabler MIT — không bắt ghi nguồn; Font Awesome Free CC BY 4.0 — PHẢI ghi nguồn**, build tự in danh sách icon FA đang dùng), Rough.js (MIT), sharp (Apache-2.0), fontkit (MIT), svgo (MIT — nén SVG). Nguồn ảnh/asset/icon và giấy phép: `references/image-sources.md`; công cụ SVG khác: `references/svg-va-cong-cu.md`. Hoạ tiết nền vẽ bằng code ở `engine/motifs.js` (đường đồng mức theo thuật toán marching squares như d3-contour).
- Muốn thêm loại hình vẽ bằng code, tranh minh hoạ, hoặc so với Slidev/Marp: `references/svg-va-cong-cu.md` (có giấy phép từng công cụ).
- Ảnh chụp: engine KHÔNG tạo ảnh (không dùng ảnh AI) — ảnh thật lấy qua `scripts/find_images.py` / `fetch_image.py` (bước 5). Từ cloud, ảnh Wikimedia/Openverse được tải bản thu nhỏ chuẩn 1920px (bản gốc bị chặn 429) — đủ nét cho slide.
- Thanh tiến độ ở góc phải trên cho người nghe biết bài đã đi đến đâu.
- Hình vector chỉ là hình học; mọi chữ nằm trong ô chữ để đo được tràn.

## Dự án mã nguồn mở đã tham khảo, video thay PPTX
Xem `references/nguon-tham-khao.md` (dom-to-pptx, Presenton, FT Visual Vocabulary, assertion–evidence… và khi nào dùng Remotion dựng video thay vì .pptx).

## Bài học từ deck bài giảng có tính toán (BNK405 Chương 2, 11/2026)
- **Môn nghiệp vụ = công thức + bài tính + đề.** Đừng ép công thức thành `steps`, đáp số tiền thành `bignum`, đề bài vào `notes`: dùng `formula`, `calc`, `exercise`. Bài tập của tài liệu gốc phải HIỆN trên slide (cặp `exercise` → `calc`), không chỉ nằm trong ghi chú.
- **Bài giảng cũ thường dùng luật đã hết hiệu lực.** Trước khi làm lại deck pháp lý/nghiệp vụ: kiểm từng con số (lương cơ sở, mức tham chiếu, số năm đóng…) theo văn bản hiện hành; gom các thay đổi vào MỘT slide `changelog`; câu `quiz` nên có phương án bẫy "đúng theo luật cũ" kèm `whyNot`.
- **Bài tập có năm cũ:** giữ số liệu của đúng năm đề bài (lương cơ sở tại thời điểm sự kiện), ghi rõ ở `note`; không âm thầm thay bằng mức hiện hành.
- **Năm mảnh rời → một câu chuyện:** mở phần bằng `journey` (một nhân vật đi qua các chế độ), kết phần bằng `cheatsheet`.
- **Nén tài liệu dài:** liệt kê phần bị bỏ trong `meta.skip` kèm lý do; thủ tục có thời hạn (nộp hồ sơ, giải quyết) là nội dung hay thi — giữ bằng `steps`.

## Bài tập tình huống luật (lời giải `checklist` / `calc` sau `exercise`)
Lời giải trên màn hình phải đi đủ thứ tự này — engine gợi ý khi đề có năm / ngày mà lời giải không nhắc bước 1–2:
1. **Luật áp dụng theo thời điểm**: giao dịch / sự kiện xảy ra khi nào → văn bản nào đang có hiệu lực lúc đó (BLDS 2005 hay 2015…).
2. **Thời hiệu / thời hạn**: yêu cầu còn trong thời hiệu không, tính từ mốc nào (vd. 2 năm từ ngày xác lập với vi phạm hình thức — k1 Điều 132 BLDS 2015). Đề thiếu ngày → ghi rõ "cần thêm dữ kiện", không lặng lẽ bỏ qua.
3. **Căn cứ**: điều khoản nào, đủ từng điều kiện chưa (`checklist`).
4. **Hệ quả**: Toà xử lý thế nào; điểm còn tranh luận ghi "quan điểm" ở `note`.
- `quiz`: phương án đúng không được chứa sẵn thuật ngữ của lời giải, không dài hơn hẳn phương án khác (engine cảnh báo cả hai).
- Trạng thái trung tính: `ok: "na"` (bignum `conds`, `checklist`) = "không áp dụng / khác loại" — xám, dấu gạch. Đỏ (`no`, `tone: "bad"`) chỉ cho điều tiêu cực thật; nhánh `tree` chỉ là một hệ quả khác thì bỏ `tone` (mũi tên trung tính), đừng gắn `good` cho nhánh có chữ "vô hiệu".
- **Slide không ghi nguồn** (không dòng "Nguồn: …", không trường `source`, không slide tài liệu): danh mục nguồn nằm trong bản Word đi kèm. **Ngoại lệ:** cảnh `lawquote`, `tiles`, `cases`, `chain` có trường `source` và tầng hình ảnh vẽ nó thành dòng chú thích cuối slide — dùng cho căn cứ pháp lý của chính slide đó (số hiệu văn bản, điều khoản, tình trạng hiệu lực). Căn cứ pháp lý là NỘI DUNG lập luận, không phải ghi nguồn — vẫn viết "k2 Điều 129" trong câu / `src` khi nó là lý do của kết luận. Ghi `source` → engine cảnh báo đã bỏ.
- **Đối chiếu nguyên văn trước khi dựng**: mọi điều luật trên slide phải mở văn bản gốc kiểm lại (ví dụ thật: mốc thời hiệu Điều 128 tính từ ngày xác lập giao dịch — điểm d k1 Điều 132 BLDS 2015 — không phải "từ khi biết"). Ghi kết quả đối chiếu vào `prep.json` → `sources[].checked`.

## Bài học từ phản biện thiết kế (2 agent, 11/2026)
- Câu trắc nghiệm có tình huống: dữ kiện ở `stem` (ngay dưới tiêu đề), tiêu đề chỉ là câu hỏi ngắn; tình huống quiz phải KHÁC ví dụ đã giảng (kiểm khả năng chuyển giao, không kiểm trí nhớ).
- Lời giải bài tập chỉ dùng kiến thức ĐÃ dạy tới slide đó; khái niệm dạy sau (thời hiệu) → `note` "xét ở Phần N" rồi quay lại.
- Thời lượng: engine cộng thời gian hoạt động trên lớp (`activitySec`; mặc định `exercise` 120 s, `quiz` hỏi 60 s) vào ước tính — đừng viết ghi chú đủ cả thời lượng.
- Một từ điều hướng cho cả bài: kicker "Phần N · …" thì slide mở phần cũng ghi "Phần" (tự nhận; ép bằng `meta.partWord`).
- Ảnh mở phần lấy màu nhấn từ ảnh → các slide mở phần lệch màu nhau; deck có ảnh ở một số phần thì đặt `meta.photoAccent: false`.
- Tiêu đề kết luận không được khái quát quá điều luật: ghi phạm vi ("Điều 125–129: …") và điều kiện ("nếu tự nó hợp pháp", "có văn bản").

## Font (lưu ý khi mở bằng PowerPoint)
**Tầng hình ảnh** nhúng bốn họ font vào file: `Anton` (tiêu đề), `Be Vietnam Pro` (chữ thường), `Be Vietnam Dam` (đậm vừa), `Be Vietnam Nang` (rất đậm). Hai họ sau là Be Vietnam Pro SemiBold / ExtraBold đã đổi tên họ để PowerPoint coi mỗi độ đậm là một họ độc lập (`hinh/tao_font.js`, giấy phép SIL OFL trong `hinh/fonts/`). Trong PowerPoint không dùng nút **B** cho các họ này — đổi độ đậm bằng cách đổi tên font. Font nhúng nguyên bản (không nén, không cắt bớt chữ) nên gõ thêm chữ có dấu nào cũng hiển thị.

**Tầng lưới Office** chỉ dùng font có sẵn trong Office: Calibri, Arial, Times New Roman. Máy Linux/LibreOffice thay bằng Carlito/Liberation cùng độ rộng, đủ dấu Việt, nên ảnh soát sát với PowerPoint. Không dùng Cambria (bản thay thế thiếu dấu Việt). Google Slides/Keynote có thể thay font khác nên bố cục lệch nhẹ.

## Giao diện
| theme | Cảm giác | Hợp với |
|---|---|---|
| `teal` | Teal đậm + bạc hà, chữ nghiêng có chân | Luật, tư vấn, học thuật hiện đại |
| `kem`  | Navy + kem + vàng đồng, tiêu đề có chân | Trang trọng, bảo vệ, hội thảo |
| `son`  | Đen/trắng + cam son, chữ đậm | Thuyết trình nhanh, cuộc thi, startup |
| `toa`  | Đỏ sẫm + vàng đồng, tiêu đề có chân đậm | Bình luận bản án, phiên toà giả định, văn bản nhà nước |
| `xanh` | Xanh dương tươi, chữ không chân đậm, bo góc | Báo cáo số liệu, tài chính – bảo hiểm, pháp chế doanh nghiệp |
| `muc`  | Giấy trắng, chữ có chân toàn bài, mực xanh | Khoá luận, NCKH, bài giảng lý thuyết |

Mỗi theme có 3 nền: `l` trắng (mặc định), `d` tối, `a` màu nhấn; thêm màu `gold` cho viền hoạ tiết. Thêm theme: sao chép một khối trong `engine/themes.js` (giữ cặp font ở comment đầu file). Kiểm engine: `npm test`.

## Cài đặt (một lần)
```
cd <skill> && npm install
```
`<skill>` là thư mục chứa file này; mọi lệnh `node engine/…`, `python3 scripts/…` ở trên tính từ đó. Thư mục skill chỉ-đọc (claude.ai, skill đồng bộ từ tài khoản) → `cp -r <skill> <thư mục làm việc>/slide-chuan`, rồi `npm install` và chạy từ bản sao. `deck.json`, `prep.json`, ảnh và file .pptx luôn nằm ở thư mục deck của người dùng, không nằm trong skill.
Cần Node 18+. Tầng hình ảnh cần thêm Playwright và Chromium: `npm install playwright && npx playwright install chromium` (máy đã có Chromium thì đặt `PW_CHROMIUM=<đường dẫn>`). Xem trước/soát cần LibreOffice + poppler (`pdftoppm`, `pdffonts`) + Python Pillow, python-pptx, pdfplumber; thiếu thì vẫn dựng được PPTX.

## Các script (thư mục `scripts/`)
| Script | Việc | Khi nào |
|---|---|---|
| `prep.py` | Gói chuẩn bị: `init` / `check` / `summary` (gửi người dùng) / `approve` (chỉ khi người dùng duyệt) | Bước 0 (bắt buộc) |
| `outline.py` | Rút dàn ý + số chữ từng mục của tài liệu (.docx, .pptx, .pdf, .md) | Bước 0–1 |
| `find_images.py` | Tìm ảnh giấy phép mở (Pexels/Unsplash/Pixabay nếu có khoá; Openverse, loc.gov, Wikimedia, `commons-qi`/`commons-fp` ảnh đã thẩm định; `--nasa`, `--rijks`; Smithsonian khi có `SI_API_KEY`); chấm chất lượng kỹ thuật, `--take` từ chối ảnh KT < 2 | Bước 5 |
| `img_quality.py` | Chấm chất lượng kỹ thuật ảnh 0–3 (nét ở cỡ chiếu thật, sáng, cháy, tương phản, cỡ) — dùng cho ảnh tự lấy (`fetch_image.py`, ảnh người dùng gửi) | Bước 5 |
| `fetch_image.py` | Tải một ảnh từ URL (chế độ `classroom`), lưu thông tin ghi công | Bước 5 |
| `cutout.py` | Tách nền ảnh thật → trường `cutout` | Bước 5 |
| `preview.py` | Xem trước 3 giao diện | Bước 6 |
| `render.py` | PPTX → ảnh từng slide + ảnh tổng | Bước 8 |
| `nhin_mo.py` | Xoá chữ + làm mờ để kiểm "che chữ vẫn đoán được đề tài"; `--worlds deck.json` dựng cùng deck ở mọi world, xếp hàng và chấm độ khác nhau | Bước 8 (bài có world) |
| `check_overflow.py` | Kiểm chữ tràn/đè trên bản render | Bước 8 |
| `build_vn_map.py`, `build_vn_map34.py` | Công cụ phát triển: dựng dữ liệu bản đồ 63 / 34 tỉnh (đã có sẵn trong `engine/assets`) | Không cần khi làm slide |

## Ví dụ
`examples/nghi-viec-hinh/deck.json` (deck mẫu của tầng hình ảnh, 11 slide khai báo → 20 slide PowerPoint: đủ 11 cảnh — mở sách soi tới Điều 35 Bộ luật Lao động 2019, cột ô lịch có số đếm bay thành dải 30 ngày, trắc nghiệm bấm đáp án, mục lục ảnh; dựng thử: `node hinh/dung.js examples/nghi-viec-hinh/deck.json /tmp/nghi-viec.pptx --soat`).
`examples/giay_to.json` (12 khối giấy tờ và ảnh dẫn chuyện: `match`, `headline`, `lens`, `collage`, `sheet`, `calendar`, `riskbar`, `plan`, `receipt`, `account`, `captable`, `record` — dựng thử tầng hình ảnh: `node hinh/dung.js examples/giay_to.json /tmp/giay_to.pptx --soat`).
`examples/banan142.json` (bình luận Bản án 142/2019/DS-PT, 20 slide, bìa `split` ảnh thật + `map` địa bàn vụ án + trích dẫn dạng trang bản án + slide `photo` lời kết (ảnh Pexels, ghi công ở file `_ghi-cong.md`), motif `["cadastral", "lines"]`, có `flow`, `ledger`, `chart` span (ngày giao dịch so với mốc luật mới), lịch 14 ngày, `cards` bài học cho các bên, `closing` trả lời 3 câu hỏi + nhận định + kiến nghị, 3 `scene` nối dòng thời gian, ghi chú thuyết trình ở `banan142_notes.md`).
`examples/anh_va_chuong.json` (bìa `band`, chuyển chương có/không ảnh, `photostats`, `mosaic`, `photostrip`, `cards` có ảnh, `end` — ảnh Openverse/Wikimedia CC BY/BY-SA), `examples/bocuc_moi.json` (8 bố cục bổ sung + `cutout`), `examples/bo_cuc_them.json` (`checklist`, `bento`, `chart` `line`/`waterfall`/`gantt`/`progress`, chế độ `--native`; test ở cả 6 theme), `examples/bai_tinh.json` (7 bố cục cho bài giảng có tính toán: `formula`, `exercise` → `calc`, `funnel`, `changelog`, `journey`, `cheatsheet` + `chart` `step` + `quiz` `whyNot` — nội dung BHXH theo Luật 41/2024/QH15) và `examples/hub_pin.json` (`hub` — Điều 117 BLDS 2015, `pin` — khoản 1 Điều 124 BLDS 2015), `examples/bo_chat_lieu.json` (bản án 142 + `meta.kit` + `takeaway` — đổi `meta.kit` file / paper / glass để thấy cùng nội dung ra ba deck khác nhau), `examples/khung_anh.json` (`meta.frame` `arch` + `frame` `circle` ở một chương + `meta.paper`; ảnh tô vào hình thật), `examples/phong_cach.json` (`meta.style` — đổi giá trị dossier / cadastral / portico để xem 3 phong cách; test ở cả 6 theme), `examples/do_hoa_code.json` (đồ hoạ bằng code, số liệu bản án 142: bìa `paper`, `iso`, `isotype`, `redline` (k2 Đ138 BLDS 2005 → k2 Đ133 BLDS 2015), `chart` có `annotate` + `hatch`, `checklist` có `build`, `hero`, `deadline`, cặp `scene` / `quiz` cho `--transition morph`; test ở cả 6 theme) và `examples/kiemthu_con_lai.json` (các type còn lại, số liệu GIẢ ĐỊNH — chỉ để kiểm bố cục) — cả sáu deck được test qua `--strict` ở 3 theme gốc.
