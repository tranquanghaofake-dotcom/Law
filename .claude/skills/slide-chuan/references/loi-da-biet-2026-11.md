# Lỗi và ngách cải tiến tìm ra khi dựng bài hình sự (12/11/2026)

> **Cập nhật 13/11/2026 — một tầng hình ảnh + da theo môn.** Tầng lưới Office (`engine/build.js`) đã bỏ khỏi skill. Các dòng nhắc tới nó (L3, L6, L10, L11, N2) là lịch sử: L10 nay xử lý bằng da theo môn (`hinh/da.js` — mọi slide mang chất liệu của môn); L6 hết đối tượng vì công cụ kiểm tràn cũ của tầng Office đã bỏ (kiểm tràn bằng `dung.js --soat`).


Nguồn: dựng bộ 15 slide "Mấy tuổi thì chịu trách nhiệm hình sự?" (Điều 9, 12 BLHS 2015) bằng tầng hình ảnh, rồi bị người dùng chê "che chữ đi không đoán được slide nói về gì". Mỗi dòng dưới đây có bằng chứng đo được; **Đã sửa** = có code + test (`tests/loi_da_biet.test.js`), **Cảnh báo** = engine nay báo thay vì im lặng, **Còn** = chưa sửa, **Đề xuất** = chưa làm.

## A. Lỗi kỹ thuật

| # | Lỗi | Bằng chứng | Trạng thái | Chỗ sửa / cách tránh |
|---|---|---|---|---|
| L1 | `pyramid` đúng 4 tầng bị tràn khi tiêu đề 2 dòng | Cảnh báo `tràn 20 → 36 → 15 px`; bản gọn `.py.c5` chỉ bật từ 5 tầng. Điều 9 có đúng 4 loại nên gặp ngay | **Đã sửa** | `stage/templates.js`: bản gọn bật từ 4 tầng. Tầng đỉnh chỉ rộng 40 %: dòng chữ trên đỉnh ≤ ~45 ký tự dù `layouts.md` ghi 80 |
| L2 | Engine báo `trường lạ "id"` cho mọi slide của deck dùng chung hai tầng | 15 cảnh báo giả trên 15 slide | **Đã sửa** | `engine/validate.js`: `id`, `toc`, `trans`, `dur` vào `COMMON` |
| L3 | Engine báo `kiểu "lawquote" không tồn tại` — người dùng tưởng gõ sai, thật ra type chỉ có ở tầng hình ảnh | Lỗi exit 2 khi dựng bằng `engine/build.js` | **Đã sửa** | Thông báo nay nói rõ "chỉ có ở tầng hình ảnh" và gợi ý type gần nghĩa (`lawquote → quote`…) |
| L4 | Tầng hình ảnh **bỏ qua im lặng** `art` (chỉ `panelrows`, `lawquote` đọc) và `meta.kit` | `art: justice` ở `statement`, `art: book` ở `agenda` không vẽ gì; `grep` `stage/templates.js` chỉ một chỗ đọc `art` | **Cảnh báo** | `hinh/kiem.js` in `ℹ trường "art" bị bỏ qua…` và `ℹ meta.kit … không được tầng hình ảnh đọc` |
| L5 | `lawquote`: cụm nhấn `[ ]` bị xuống dòng thì nét bút vàng chỉ phủ dòng đầu, lệch | Cụm "một trong các điều" nằm ở hai dòng | **Cảnh báo** | `hinh/dung.js` (`kiemTran`) báo sau khi dựng. Cách tránh: cụm ngắn, đặt cuối câu |
| L6 | công cụ kiểm tràn của tầng Office cũ (`check_overflow.py`, đã bỏ) báo `Font dự phòng … Inter` và thoát 1 với mọi PPTX tầng hình ảnh | LibreOffice không đọc font nhúng (Anton, Be Vietnam) | **Đã sửa** | Phát hiện `ppt/fonts/`, in lý do, thoát 0; ép chạy: `SLIDE_CHUAN_FORCE_OVERFLOW=1`. Kiểm tràn của tầng này là `hinh/dung.js --soat` |
| L7 | `hinh/dung.js` không nhắc Bước 0 (`prep.json`) | Dựng 15 slide không một dòng nhắc | **Cảnh báo** | `ℹ Bước 0: chưa có / chưa được duyệt prep.json`; tắt bằng `SLIDE_CHUAN_NO_PREP=1` |
| L8 | Deck 15 slide **không có ảnh / icon / sticker nào** vẫn "xanh" | `deck.json`: 0 `photo`, 0 `emoji`, 0 `icon`; ảnh "nhìn mờ" chỉ còn ô, thanh, số lớn | **Cảnh báo** | `⚠` khi 0 hình (deck ≥ 6 slide), `ℹ` khi < 1/3 slide có hình; kiểm bằng `scripts/nhin_mo.py` |
| L9 | `quiz` đáp án (`reveal` + `whyNot`) dễ tràn: tiêu đề 2 dòng + `stem` 2 dòng + ô đáp án có dòng `whyNot` | Tràn 22 px → hết sau khi rút `whyNot` còn ≤ ~30 ký tự một dòng | **Còn** | Tầng hình ảnh chỉ báo sau khi dựng; engine báo `> 110 tiếng` nhưng không chạy ở tầng này. Viết `whyNot` ngắn, `stem` ≤ 2 dòng |
| L10 | World (`meta.kit`: `bien-ban`, `so-bhxh`…) **chỉ chạy ở `engine/build.js`**. Tầng hình ảnh không có đồ vật xuyên suốt → không đạt "che chữ vẫn đoán được" | `scripts/nhin_mo.py`: tầng hình ảnh chỉ còn hình chữ nhật; tầng lưới Office có hồ sơ, sách, bút, dấu | **Một phần (hình sự)** | Đã có bộ `bc*` cho hình sự (`hinh/bang_chung.js`). Môn khác còn nguyên đề xuất: chuyển world sang tầng hình ảnh dưới dạng vật có tên Morph (cán cân nghiêng theo slide, dấu mộc, tab hồ sơ, còng, búa). Việc nhiều giờ. Trước mắt: ảnh / icon / sticker đúng chủ đề ở ≥ 1/3 slide |
| L11 | Mô tả "tầng lưới Office mất Morph" là **sai**; hai tầng khác độ phủ | Cùng deck 15 slide: tầng hình ảnh 14/15 slide Morph; tầng lưới Office (`thread: true`) 6/15 — chỉ giữa slide cùng chương | **Đã sửa tài liệu** | `SKILL.md` mục "Giới hạn đã biết" |
| L12 | `timeline` 3 mốc dư ≈ 2,2 in trống theo chiều dọc | Gợi ý bố cục của engine | **Còn** | Gộp với slide kề hoặc thêm `note`; không nhồi chữ |

## B. Ngách cải tiến (đề xuất, chưa làm)

1. **Nối kho luật**: số điều, số năm phải gõ tay rồi mới đối chiếu bằng `kiem_can_cu.py`. Thêm trường `cite: { law, dieu, khoan }` để build tự lấy nguyên văn / so khớp và in "khớp kho" hay "lệch".
2. **Chế độ nháp nhanh** (`--nhap`) cho "slide mẫu" 1–3 slide: bỏ Bước 0 nhưng gắn nhãn "NHÁP" trên slide cuối.
3. **`kiemTran` chạy cả lint nội dung** (`> 110 tiếng`, cụm đệm) của engine, để tầng hình ảnh không chỉ biết tràn sau khi dựng.
4. **Phép thử "nhìn mờ" tự động** trong `dung.js --soat` (hiện phải chạy `nhin_mo.py` riêng — chính vì thế lỗi L8 lọt qua).
5. **Kiểm Morph / font nhúng bằng PowerPoint thật**: môi trường dựng không có PowerPoint nên chỉ kiểm cấu trúc XML. Xem `references/microsoft-365.md` để biết connector làm được và chưa làm được gì.

## C. Bài học về quy trình (lỗi của người làm, không phải của engine)

- Bỏ bước ảnh / icon rồi vẫn báo "xong". Skill mặc định 4–8 ảnh mỗi deck; không tìm được thì phải nói thẳng là deck **chưa đạt** tiêu chí "che chữ", không chỉ ghi vào `unsure`.
- Chạy `nhin_mo.py` **trước** khi giao, không đợi người dùng chê.
- Đưa lựa chọn "đẹp hoặc Morph" mà chưa đo: số liệu ở L11 cho thấy đó là hai tầng cùng có Morph, khác độ phủ.
- Cảnh báo của công cụ nói "tràn" thì sửa nội dung; thử cùng một hướng 2 lần mà không hết thì dừng và báo — đừng thử lần thứ ba.

## D. Phiên thứ hai (12/11/2026, dựng bài "tội phạm kinh tế và chức vụ"): bổ sung, đối chiếu với mục A

Hai phiên độc lập, cùng đề tài hình sự, **cùng ba kết luận** (L4 `art` / `meta.kit` bị bỏ qua, L8 deck toàn chữ vẫn "xanh", L10 không có dấu hiệu môn học ở tầng hình ảnh) — nên đây là lỗi hệ thống của skill, không phải lỗi dùng sai. Phiên này tìm thêm:

| # | Lỗi / ngách | Bằng chứng | Trạng thái |
|---|---|---|---|
| M1 | `chart` kind `gantt` / `waterfall` / `progress` / `donut` / `slope` **không có nhánh vẽ** ở tầng hình ảnh: `T.chart` chỉ có `span`, `column`/`line`/`step`, còn lại thành thanh ngang đọc `value`. `gantt` (`from`/`to`) ra vạch mảnh đè nhãn | Slide bản dựng đầu | **Cảnh báo** (`hinh/kiem_tang.js`) + `gantt` đọc `to` |
| M2 | `meta.style`, `meta.art`, `meta.motif`, `meta.frame`, `layout: poster`, `photo` ngoài cover / type ảnh: bỏ qua im lặng | Đọc `stage/templates.js` | **Cảnh báo** |
| M3 | Cổng `prep.py` **cứng**: không nhận `quizgo`; bắt tiêu đề "không là câu hỏi" kể cả cho quiz / bigq; `status` phải khớp từng chữ. Người làm tuân thủ cổng mà vẫn ra deck sơ sài | Ba lần `check` đầu | **Đã sửa** |
| M4 | Chất lượng nhìn thấy phụ thuộc gần như hoàn toàn vào việc dùng cảnh. Bản chỉ dùng type thường bị chê "sơ sài"; bản có `book`, `bigq`, `picks`, `cases`, `chain`, `tiles`, `quizgo`, `recap`, `toc` mới ngang mẫu | So bản dựng 1–3 và 7 | **Cảnh báo** (< 4 cảnh) + bảng "nội dung → cảnh" trong `SKILL.md` |
| M5 | Hình dán và nền có sẵn vẫn bị chê "rập khuôn, không liên quan hình sự" dù đã nhiều | Phản hồi người dùng | **Đã làm:** `hinh/bang_chung.js` (16 kiểu `bc*`) |
| M6 | Mâu thuẫn quy tắc nguồn: SKILL.md nói slide không ghi nguồn, nhưng `lawquote`, `tiles`, `cases`, `chain` có `source` và tầng hình ảnh **vẽ** nó | Slide lawquote / tiles | **Đã sửa tài liệu** |
| M7 | Số slide khai báo ≠ số slide PowerPoint (`book` 5–9, `quizgo` 3) | Mẫu 11 → 20 | **Còn** (cần bảng type → số slide) |
| M8 | `quizgo` không có `whyNot` | `canh.md` | **Còn** |
| M9 | Thiếu type "thang khung hình phạt" (ngưỡng tiền → mức án theo khoản) | `table` + `bar` thay thế, mất khoảng min–max | **Đã sửa:** `bcthang` (`hinh/bang_chung.js`) — thanh min–max theo từng bậc, nhiều tội trên cùng bậc, `ct` cho "hoặc chung thân". Còn: bản không phụ thuộc môn |
| M10 | SKILL.md 74 KB, nạp trọn mỗi lần | `wc -c` | **Một phần**: thêm mục "Nguyên tắc trước quy trình" ở đầu; chưa tách |

| M11 | Morph "xấu, chỉ có vân tay bay qua bay về": Morph không được thiết kế; PowerPoint tự ghép các hình trùng ảnh (vân tay) ở hai slide kề, còn dây đỏ cùng tên bị kéo giãn | Người dùng chê; XML: không có tên `!!` nào cho các cặp có nghĩa | **Đã sửa** cho bộ `bc*` (vân tay vào nền, dây đỏ tên riêng, cặp `tieu` / `chuong` / `pa*`) + `scripts/morph_cap.py` kiểm cặp Morph. Còn: bộ cảnh khác (`book`…) và tầng lưới Office chưa rà theo cách này |

### Điều rút ra khi gộp hai phiên
1. **Đo trước, khẳng định sau.** Một phiên ghi "tầng lưới Office mất Morph" và phiên kia đo lại thấy sai (L11). Một lần tôi tưởng skill thiếu dò Chromium, thật ra đã có và tôi đặt sai biến. Mọi nhận định về năng lực của skill phải kèm lệnh đo.
2. **Khi hai nguồn báo cùng một lỗi độc lập thì sửa ngay, đừng bàn thêm.**
3. **Cảnh báo không thay được khả năng.** Cả hai phiên đều chỉ dừng ở "báo lỗi"; người dùng chỉ hài lòng khi có hình thật (M5). Ưu tiên thứ tự: có khả năng → có cảnh báo → có tài liệu.
4. **Cổng quy trình phải đo kết quả nhìn thấy** (hình, nhìn mờ, chữ không đè), không chỉ đo tuân thủ (đủ mục trong `prep.json`).
5. **Giữ kế hoạch đã duyệt không phải là mục tiêu.** Khi kế hoạch xung đột với mục tiêu "đẹp và hiểu được", sửa kế hoạch và nói lý do.

## E. Phiên thứ ba (12–13/11/2026, dựng bài "Tổng quan Công pháp quốc tế", 15 phút, tầng hình ảnh)


**Kết luận một dòng:** lỗi L10 ("che chữ không đoán được đề tài") lặp lại lần thứ ba ở môn thứ ba. Nguyên nhân không nằm ở deck: bộ hình theo môn đang là code viết tay cho từng môn, và quy trình không có cổng nào dừng lại khi môn chưa có bộ hình.

### E1. Ngách (lỗi của skill, có bằng chứng)

| # | Ngách | Bằng chứng phiên này | Trạng thái | Đề xuất |
|---|---|---|---|---|
| N1 | Tầng hình ảnh không có dấu hiệu môn học ngoài hình sự (L10, M5) | Bản 1 (21 slide) qua `--soat` không cảnh báo, nhưng `nhin_mo.py` chỉ còn khối đỏ, khối xanh. Người dùng chê "phông nền không liên quan gì đến luật quốc tế" | **Một phần**: bộ hình `qt*` "bàn hội nghị quốc tế" (`hinh/hoi_nghi.js`, test `tests/hoi_nghi.test.js`) có 3 kiểu: `qtbia`, `qtchuong`, `qtban`. Còn thiếu khoảng 8 kiểu cho so sánh, trích luật, kim tự tháp, cây điều kiện, chuỗi, bảy nguyên tắc, trắc nghiệm, chốt | Xem E3-P3: làm "da theo môn" thay vì viết type mới cho từng môn |
| N2 | Cổng Bước 0 không chặn khi môn chưa có bộ hình | `prep.py check` báo "đủ mục" dù `world.kit` ghi "không dùng" và `assets.missing` ghi rõ "chưa có bộ hình". `dung.js` chỉ in `ℹ` | **Đã sửa** (P1): `prep.json` → `tang` / `boHinh` / `chapNhanNenChung`; `check` chặn, `summary` nói ở dòng đầu; `kiem.js` `⚠ Nền chung`; `dung.js --strict` dừng (mã 3). Test `tests/cong_bo_hinh.test.js` | `prep.py check` thất bại khi tầng hình ảnh, môn khác hình sự / quốc tế và không có bộ hình, trừ khi `prep.json` có `"chapNhanNenChung": true` do người dùng tự duyệt. `prep.py summary` in câu cảnh báo này lên **dòng đầu** bản tóm tắt |
| N3 | `nhin_mo.py` chỉ xuất ảnh, không chấm điểm, nên người làm xem rồi bỏ qua | Đã chạy, đã thấy ảnh toàn khối màu, vẫn giao | **Đã sửa, đổi cách** (P4): `--soat` tự chạy `nhin_mo.py`; `kiem.js` đo cấu trúc — `⚠ Nền chung một phần` khi < 1/2 slide mang dấu hiệu môn (bộ hình / ảnh thật, hình dán không tính). Không chấm điểm ảnh: điểm ảnh không phân biệt hình theo môn với hình trang trí — đúng chỗ đã để lỗi lọt | Chấm tự động: tỉ lệ slide mà ảnh làm mờ chỉ gồm màu của bảng màu engine (biểu đồ màu, ≥ 90 % điểm ảnh rơi vào 6 màu nền / thẻ) → `⚠`; `--strict` dừng khi > 50 % slide như vậy. Cho chạy luôn trong `dung.js --soat` (đề xuất B4 cũ) |
| N4 | Bộ hình theo môn là code cứng, mỗi môn viết lại từ đầu | `bang_chung.js` 302 dòng, 18 type; `hoi_nghi.js` 161 dòng mới được 3 type. Muốn áp cho cả deck phải viết lại từng bố cục (`cards` → `qtban`…) | **Còn** | E3-P3 |
| N5 | `--soat` không kiểm **lớp ảnh đè chữ** | 5 lỗi chỉ thấy bằng mắt, máy không báo: hình dán chương đè dấu hỏi và phụ đề; tên người ký xuống dòng đè nhãn; nhãn "Đấu tranh giành độc lập" 2 dòng đè tên; chữ "Phần 1" đè dải lụa; lá cờ xanh đêm chìm vào nền | **Đã sửa** (P2) — `hinh/kiem_de.js`: chữ bị lớp ảnh đè (theo thứ tự vẽ, bỏ vùng trong suốt), hai hộp chữ đè nhau (so lõi dòng). Đo báo nhầm trên 3 deck mẫu: 30 dòng → 2, cả 2 là lỗi thật (N16). Chưa làm: tương phản lớp nhỏ với nền | Trong `kiemTran`: đo khung của mọi `data-l` (trừ nền) và mọi `data-t`, báo `⚠` khi hộp chữ của slide A giao với lớp ảnh không chứa nó; báo `⚠` khi hai hộp chữ trong cùng một khối giao nhau. Đo tương phản lớp ảnh nhỏ với nền ngay sau nó |
| N6 | Cảnh báo tràn chỉ nêu khối cha (`.body`), không nêu khối con gây tràn | Slide `chain` tràn 41 px. Tôi rút ô "tình huống" trước, vẫn tràn 41 px. Thủ phạm thật là thẻ hệ quả 3 dòng ở cột phải. Mất một lần dựng | **Đã sửa** (P2): `— khối gây tràn: <thẻ.lớp> "<chữ đầu>"` | `kiemTran` in thêm phần tử con cao nhất / vượt đáy nhiều nhất (selector + chữ đầu) |
| N7 | Hình dán ở `section` đặt chỗ cố định (`l:1050, t:560`) | Đè dấu hỏi ở tiêu đề 2 dòng (chương 1, 3), đè phụ đề (chương 2). Phải ghi tay `emojiPos` cho từng slide | **Còn** | Đặt trong `hinhKhiSanSang`: đo khung tiêu đề và phụ đề, đặt hình vào vùng trống lớn nhất bên phải |
| N8 | Morph ở deck dùng type thường gần như không có | `morph_cap.py`: 23 slide, ngoài thanh đầu chỉ có **1** cặp có chủ ý (2→3, hình địa cầu `bigq` → `picks`). Hình dán của `section` mang tên `deco-*`, nên `picks` → `section` cùng hình không ghép được. Bộ `qt*` có tờ tiêu đề `tieu` nên mẫu 3 slide có Morph 1→2, 2→3 | **Còn** (type thường) | Đặt tên hình dán trang trí là `hd-<tên>` như cảnh; ghi số cặp Morph vào dòng tổng kết của `dung.js` |
| N9 | Tầng hình ảnh bỏ ảnh ở `section`, `end` (M2), nên deck chỉ được 3 ảnh thật | Kế hoạch có 4–8 ảnh, chỉ dựng được bìa, `split`, `headline` | **Còn** | Cho `section` / `end` nhận `photo` ở tầng hình ảnh, hoặc ghi rõ ở Bước 0: "tầng này tối đa N ảnh" |
| N10 | `find_images.py` treo lâu, không in tiến độ | Wikimedia 429 và Openverse 504; chạy hơn 12 phút. Lệnh kiểu `… \| tail` giữ hết đầu ra tới cuối, nhìn như treo | **Còn** | `print(..., flush=True)` theo từng brief; giới hạn thời gian mỗi nguồn (ví dụ 90 s); thử lại ít hơn với 429 (lỗi giới hạn tần suất, không phải lỗi mạng) |
| N11 | Kho hình dán thiếu hình cho đề tài quốc tế | Không có địa cầu, bồ câu, gươm, khiên, bản đồ. Đã tải 6 hình: `api.iconify.design/fluent-emoji/<tên>.svg` dùng được từ cloud; `raw.githubusercontent.com` dùng được, GitHub API bị chặn | **Đã sửa**: 6 hình trong `hinh/emoji.json` (96 hình) | Thêm vào `emoji.json`: `globe-showing-asia-australia`, `globe-with-meridians`, `dove`, `world-map`, `crossed-swords`, `shield` |
| N12 | Bản đồ thế giới dạng chấm (Natural Earth 1:110m) **không có Hoàng Sa, Trường Sa** | Dữ liệu 110m bỏ đảo nhỏ | **Đã sửa** trong `the_gioi_cham.json` (dựng lại: `scripts/build_the_gioi_cham.py`), có test | Ghi thành quy tắc: mọi bản đồ có Việt Nam, kể cả bản đồ thế giới trang trí, phải có Hoàng Sa, Trường Sa (mở rộng quy tắc của `map`) |
| N13 | Cờ trừu tượng dễ trùng cờ thật | Kiểu "chấm tròn trên nền một màu" ra lá cờ nền trắng, chấm đỏ, giống cờ Nhật Bản | **Đã sửa** (bỏ kiểu chấm tròn; test; quy tắc ở `canh.md` mục 9) | Quy tắc: không dùng hình tròn giữa nền trơn, không dùng sọc ngang hoặc dọc 2–3 màu (dễ trùng cờ quốc gia), không dùng biểu tượng LHQ (bị hạn chế sử dụng theo Nghị quyết 92(I) Đại hội đồng LHQ). Chỉ dùng chéo góc, tam giác cán, ô góc cán, màu ngoài bộ đỏ–trắng–xanh thuần |
| N14 | Kho luật của dự án chưa có văn bản mà deck cần | Luật Điều ước quốc tế 108/2016/QH13 **đã sửa bởi Luật 137/2025/QH15 (hiệu lực 01/01/2026)**: suýt trích theo bản cũ. `vbpl.vn`, `thuvienphapluat.vn` trả 403 từ cloud; văn bản hợp nhất trên `datafiles.chinhphu.vn` (10/VBHN-VPQH) đọc được | **Một phần**: SKILL.md ghi cách tra văn bản sửa đổi / hợp nhất khi vbpl.vn chặn. Kho luật dự án vẫn chưa có Luật Điều ước quốc tế | Thêm vào `references`: khi vbpl.vn chặn, đọc văn bản hợp nhất ở datafiles.chinhphu.vn. Bước 0 bắt buộc tra "văn bản sửa đổi sau năm ban hành" cho mọi luật trích |
| N16 | Kiểu `collage` để ảnh thứ ba che chú thích hai ảnh dưới | `examples/giay_to.json` slide 5: "Lúa đang xanh" bị che một nửa, "Ngày gặt" bị che hết. Các kiểm tra cũ để lọt; `kiem_de.js` (P2) bắt được | **Còn** | Đặt chú thích trên phần ảnh lộ ra, hoặc cho ảnh sau lệch xa hơn; thêm test dựng `giay_to.json` không có dòng "đè" |
| N15 | `quizgo` vẫn không có `whyNot` (M8) | Lý do từng phương án sai phải viết vào `notes` | **Còn** | Như M8 |

### E2. Kinh nghiệm (lỗi của người làm, không phải của engine)

1. **Đọc thấy lỗi hệ thống còn "Còn / Đề xuất" thì phải nói thẳng ở tin nhắn xin duyệt.** Phiên này đọc L10, ghi vào `prep.json` → `assets.missing`, nhưng tin nhắn xin duyệt chỉ nói "deck có 3 ảnh". Mẫu câu bắt buộc: *"Deck sẽ mắc lỗi X (đã bị chê ở bài Y). Chọn: (a) chấp nhận; (b) làm bộ hình trước, thêm khoảng N giờ."*
2. **Cách chữa đã bị chê thì không dùng lại làm cách chữa chính.** `canh.md` mục 8 ghi hình dán Fluent bị chê "rập khuôn", phiên này vẫn dùng hình dán làm cách bù chính.
3. **Bằng chứng nhìn thấy phải là cổng, không phải ảnh tham khảo.** Đã chạy `nhin_mo.py`, đã thấy kết quả xấu, vẫn giao. Quy tắc: ảnh làm mờ không đoán được đề tài thì không giao.
4. **Làm mẫu 3 slide trước khi áp cả deck.** Khoảng 40 phút, 4 vòng sửa, bắt được 6 lỗi (cờ giống cờ Nhật Bản, chữ xuống dòng đè nhãn, khoảng trống trên văn kiện, chữ đè dải lụa, lưng ghế trông như bia mộ, cờ chìm nền) trước khi chúng nhân lên 21 slide.
5. **Soát ở độ phân giải đầy đủ, từng slide.** Ảnh ghép thu nhỏ không cho thấy chữ đè nhau và màu chìm nền. Cả 6 lỗi ở mục 4 đều không được `--soat` báo (xem N5).
6. **Ẩn dụ phải nói về nội dung, không chỉ trang trí.** "Bàn hội nghị" chạy được vì nó *là* lập luận của bài: chủ thể là ai được ngồi vào bàn; luật do các bên tự ký (khối "các bên ký tên" ở bìa); thi hành dựa vào cam kết (dấu xi). Khi chọn ẩn dụ cho môn mới, hỏi trước: *vật này chứng minh điều gì của bài?*
7. **Bộ hình có yếu tố nhạy cảm cần danh mục cấm riêng:** quốc huy, biểu tượng LHQ, cờ thật, chữ ký thật, bản đồ thiếu Hoàng Sa, Trường Sa.
8. **Trả lời ngắn, mơ hồ (ví dụ "lam") thì ghi rõ cách hiểu trong báo cáo** và lưu nguyên văn vào `approvedBy`, như phiên này đã làm.

### E3. Lộ trình sửa skill (xếp theo lợi ích / công sức)

| Ưu tiên | Việc | Chặn được | Công sức |
|---|---|---|---|
| **P1** | Cổng "môn chưa có bộ hình" ở `prep.py check` / `summary` và `dung.js --strict` (N2), kèm câu hỏi bắt buộc ở tin xin duyệt (E2-1) | Lặp lỗi L10 ở môn mới mà người dùng không biết trước | ~30 phút |
| **P2** | Kiểm va chạm lớp ảnh ↔ hộp chữ, chữ ↔ chữ, tương phản lớp nhỏ trong `--soat` (N5); cảnh báo tràn chỉ đúng khối con (N6) | 5/6 lỗi chỉ thấy bằng mắt ở phiên này | ~1–1,5 giờ |
| **P3** | **"Da theo môn"**: tách bộ hình thành cấu hình gồm nền (mẫu SVG), giấy (màu, viền), vật giữ tiêu đề (đinh / dấu xi / kẹp), con dấu, vật trang trí phụ (cờ, micro, dây). Lớp da áp lên **65 type thường** (nền `.s`, tiêu đề thành tờ giấy, `.card` thành vật của môn) thay vì viết type mới cho từng bố cục. Làm từ 2 bộ đang có: `bc` (hình sự) và `qt` (quốc tế). Môn mới = 1 file cấu hình + 1–2 hàm vẽ vật riêng | N1, N4; môn mới không còn bắt đầu từ số 0 | Nhiều giờ: cần spec trong `docs/specs`, duyệt rồi mới làm |
| **P4** | Chấm điểm tự động cho `nhin_mo.py` và chạy trong `--soat` (N3) | Giao deck "nền chung" mà không ai biết | ~1 giờ |
| P5 | Hình dán chương tự tìm chỗ trống (N7); tên Morph `hd-*` cho hình trang trí (N8) | Đè chữ; Morph rời rạc | ~1 giờ |
| P6 | `find_images.py` in tiến độ, giới hạn thời gian mỗi nguồn (N10) | Treo 10+ phút | ~30 phút |
| P7 | Thêm 6 hình dán (N11); quy tắc cờ trừu tượng (N13), bản đồ có Hoàng Sa, Trường Sa (N12); nguồn văn bản hợp nhất chinhphu.vn (N14); `quizgo` có `whyNot` (N15) | Lỗi nhỏ lặp lại | ~1 giờ tổng |

**Trạng thái lộ trình (13/11/2026, nhánh `claude/lucid-goldberg-yzikct` của repo Law):** P1 xong · P2 xong · P4 xong (đổi cách: đo cấu trúc thay cho chấm điểm ảnh) · P5 xong · P6 xong · P7 xong phần tài liệu, hình dán, quy tắc cờ / bản đồ (còn `quizgo` có `whyNot`) · **P3 mới có spec**: `docs/specs/2026-11-13-slide-chuan-da-theo-mon-design.md`, chờ duyệt · N16 (collage che chú thích) còn.

### E4. Số liệu đo phiên này

- Bản 1: 21 slide khai báo → 23 slide PowerPoint, 8 cảnh, 3 ảnh thật; `--soat` cuối 0 cảnh báo; nhìn mờ: không đoán được đề tài; Morph có chủ ý ngoài thanh đầu: 1 cặp.
- Mẫu bộ `qt*`: 3 slide, `--soat` 0 cảnh báo, lệch PPTX so với HTML 0,00 %; nhìn mờ: thấy văn kiện + dấu xi, hàng cờ, bàn họp và bảng tên; Morph 2/2 cặp (`tieu`).
- Môi trường: Chromium `/opt/pw-browsers/chromium-1243`; LibreOffice có sẵn; không có PowerPoint, nên font nhúng, Morph và hiệu ứng mới chỉ kiểm được cấu trúc.

## F. Phiên thứ tư (13/11/2026, bộ BHXH "mỗi chi tiết một lý do" + 6 giờ cải thiện tự động)

### F1. Lỗi của skill (có bằng chứng, đã sửa)
| # | Lỗi | Bằng chứng | Sửa |
|---|---|---|---|
| F1.1 | Sơ đồ `flow` tràn 485 px ở da có vỏ thẻ: `:where(.da-…) .card { position: relative }` cùng độ ưu tiên với `.fl-n { position: absolute }`, nạp sau → nút rơi về luồng thường, xếp bậc thang | Bản án 142, slide 3: chú thích đè thẻ, nút thứ tư ra ngoài slide; có từ trước phiên | `.card.fl-n` (stage.css); test dựng flow với cả 13 da |
| F1.2 | Tiêu đề Anton cỡ lớn thụt 5–7 px so với dòng chữ nhỏ cùng lề (khoảng trống trước nét của chữ đầu) | `soat_chi_tiet.js`: 87 chỗ lệch ở deck BHXH | căn lề quang học trong `hinh.js` (đo nét chữ đầu trên canvas), gọi lại sau `hinhTuGan` cho slide từ bộ mẫu |
| F1.3 | Đồ vật tiền cảnh của da chọn theo số thứ tự slide (`i % n`) — slide nói về quỹ mang con dấu | đọc mã `da.js` | chọn theo nội dung (kicker + tiêu đề) |
| F1.4 | Cùng một con số hai cách ghi trên một slide không ai báo | deck mẫu: "3 triệu đồng" cạnh "3.000.000 đ"; "10 triệu" cạnh "10.000.000" | `validate.js` cảnh báo; sửa hai deck mẫu |
| F1.5 | Chữ nhấn màu trên ảnh (photo / headline) 1,8–2,3 : 1 | `soat_chi_tiet.js` | lớp phủ `.pho .tint` đậm ở đầu ảnh |

### F2. Kinh nghiệm (lỗi của người làm)
- **Chèn chú thích `//` vào giữa một dòng mã dài** làm nuốt phần còn lại của dòng (hai lần trong phiên): chú thích giữa dòng dùng `/* */`.
- **Vòng `while ((n = w.nextNode()) && !ch)`** gọi `nextNode()` thêm một lần sau khi đã tìm thấy → đo font của nút chữ kế tiếp: đặt điều kiện dừng trước (`while (!ch && (n = …))`).
- **Ảnh chụp deck.html để soát bằng mắt** còn trạng thái đầu của hiệu ứng vào (khối bị dịch, phóng) → dễ tưởng vỡ bố cục: soát trên ảnh dựng thật (`--soat`, `<tên>_lop/h-*.jpg`).
- **Công cụ đo cũng phải được kiểm**: `soat_chi_tiet.js` từng báo nhầm vì ẩn chữ bằng `visibility` (mất cả nền của viên nhãn), vì tính bóng chữ / viền chữ là nét, vì đo hộp chữ con lồng trong hộp chữ cha. Mỗi lần báo lạ: chụp hai trạng thái, in điểm ảnh, rồi mới sửa — không sửa template theo một phép đo chưa kiểm.

### F3. Đợt quét `--soat` toàn bộ deck mẫu (13/11/2026, tối) — lỗi của skill, đã sửa
| # | Lỗi | Bằng chứng | Sửa |
|---|---|---|---|
| F3.1 | **Trường "nhận mà không vẽ"**: validate.js kiểm hợp lệ rồi tầng hình ảnh bỏ âm thầm — `takeaway` ở 28/32 type, `pin`, `section.part / inside`, `end.teamTitle`, `chart.unit` (9/10 kind), `calc.given`, `changelog.colTopic`, `funnel.inLabel / outLabel`, `quote.role`, `mode` ngoài statement… (~50 trường) | điền mã riêng vào từng trường chuỗi của SCHEMA, dựng, tìm mã trên slide | vẽ đủ (takeaway = dải "Ghi nhớ" ở chân slide; pin = tờ giấy ghim tự tìm chỗ); `mode` / `transition` / `build` / `motion` không vẽ được thì báo ℹ; `tests/truong_hien.test.js` chặn tái phạm, ngoại lệ phải ghi lý do |
| F3.2 | Dấu ✓ ✕ là ký tự chữ — Anton / Be Vietnam Pro không có, bộ chọn `.cd span` còn tô xám cả ô (1,07 : 1) | soát chi tiết ◐ | icon SVG; bộ chọn chỉ trúng dòng mô tả |
| F3.3 | Đường ngưỡng nét đứt (captable) cắt qua nhãn ngưỡng và số % trong thanh | mắt + ✂ mới | ngưỡng xếp tăng dần, đường bắt đầu ở hàng nhãn của nó; số né đường |
| F3.4 | Ảnh in chồng (collage): tấm sau che chú thích tấm trước | ⚠ "chữ bị lớp ảnh đè" | xếp bậc thang, chú thích tấm bị đè ≤ 200 px |
| F3.5 | Pyramid 5 tầng + tiêu đề 2 dòng tràn 10 px; chữ nhấn vàng trên tầng đỏ 3,27 : 1 | ⚠ tràn, ◐ | thu khoảng cách; vàng pha sáng tới ≥ 4,5 theo từng da |
| F3.6 | Chip dữ kiện trên ảnh bìa / kết nền trong suốt — gặp vùng ảnh sáng còn 2,7 : 1 | ◐ | nền tối mờ |
| F3.7 | Tiêu đề ngắt giữa từ ghép ("rời hệ / thống") | đọc chỗ xuống dòng của chữ ≥ 40 px | `hinh.js` giữ liền ~90 từ ghép thường gặp bằng dấu cách không ngắt; `\n` trong chuỗi = xuống dòng chủ ý |

| F3.8 | **Hai thuộc tính `style` trên một thẻ** (style="left…" rồi `${inn()}` cũng ghi style) ở 22 chỗ → trình duyệt bỏ cái sau, mất `--i` → tầng kim tự tháp, nút flow, thẻ checklist, ảnh collage… hiện cùng lúc trong PPTX | điểm đánh số của `photo` dồn một chỗ; dò mẫu bằng regex | `render()` gộp mọi style của một thẻ; test trên 9 deck mẫu |
| F3.9 | `focus` bị bỏ ở cards / steps / hub / matrix / cheatsheet / photostrip; `duel` luôn tô phải, luôn đánh số | bộ theo dõi trường đọc (Proxy) | nhấn bằng đúng mã đã có (vàng = đang bàn, nền mực, viền trong); duel nhận focus, paired |
| F3.10 | `quote` / `statement` / `section` / `end` + `cutout` không vẽ ảnh; có cutout thì da còn tắt hình lớn → slide trống | bộ theo dõi + mắt | vẽ; đo alpha 4 mép (sharp) để dán mép cắt vào mép slide |
| F3.11 | Ảnh nào trong PPTX cũng có chữ thay thế "Hình minh hoạ" — `photoAlt` / `alt` không tới bộ dựng | đọc `build.js` (chỉ lấy `data-alt`) | `tu_gan.js` lấy từ `aria-label` / `alt` của ảnh trong khối |
| F3.12 | `cards.items[].photo`, `isotype.icon`, `photo.callouts / photoMark / side / photoStyle`, `split.photoMark / items[].icon`, `statement.stats[].tone`, `chart span hatch` bị bỏ | bộ theo dõi trường đọc | vẽ đủ |

### F4. Kinh nghiệm (lỗi của người làm, phiên này)
- **Thêm một quy tắc CSS "tốt" có thể đè quy tắc tốt hơn**: `section.s { text-wrap: pretty }` (hinh.css) có độ ưu tiên cao hơn `.s { text-wrap: balance }` (stage.css) → đè mất balance; Chromium `pretty` lại không sửa đoạn 2 dòng → tiêu đề mồ côi trở lại ("…850 / triệu"). Trước khi thêm thuộc tính toàn cục: `grep` thuộc tính đó trong mọi file CSS; thử cả trường hợp 2 dòng.
- **Script chụp kiểm tra cũng phải giống bản dựng**: ép `display: block` lên slide (để ẩn slide khác) làm mất `flex` → dải Ghi nhớ "trôi" lên giữa slide trong ảnh chụp, dễ sửa nhầm. Ẩn slide khác bằng `:not(.xem) { display: none }`, không đụng slide đang xem.
- **`Range.getClientRects()` trên cả phần tử trả cả hộp của phần tử con** (ô icon, ô chú giải gạch chéo) — đo nét chữ phải lấy hộp của từng nút chữ.
- **Hộp dòng chữ trưng bày chồng nhau** (line-height < cỡ chữ): quét nét đầu của dòng 1 trúng chữ "T" của dòng 2 → báo lệch 3–4 px giả (gốc của "tiêu đề x 106" tồn từ phiên trước).
- **Vẽ thêm trường bị bỏ thì phải dựng lại mọi deck mẫu**: hiện `share.items`, dải Ghi nhớ cao hơn chú thích → hai slide mẫu tràn 9 px và 82 px; chỉ đợt quét lại mới thấy.

