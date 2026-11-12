# Lỗi và ngách cải tiến tìm ra khi dựng bài hình sự (12/11/2026)

Nguồn: dựng bộ 15 slide "Mấy tuổi thì chịu trách nhiệm hình sự?" (Điều 9, 12 BLHS 2015) bằng tầng hình ảnh, rồi bị người dùng chê "che chữ đi không đoán được slide nói về gì". Mỗi dòng dưới đây có bằng chứng đo được; **Đã sửa** = có code + test (`tests/loi_da_biet.test.js`), **Cảnh báo** = engine nay báo thay vì im lặng, **Còn** = chưa sửa, **Đề xuất** = chưa làm.

## A. Lỗi kỹ thuật

| # | Lỗi | Bằng chứng | Trạng thái | Chỗ sửa / cách tránh |
|---|---|---|---|---|
| L1 | `pyramid` đúng 4 tầng bị tràn khi tiêu đề 2 dòng | Cảnh báo `tràn 20 → 36 → 15 px`; bản gọn `.py.c5` chỉ bật từ 5 tầng. Điều 9 có đúng 4 loại nên gặp ngay | **Đã sửa** | `stage/templates.js`: bản gọn bật từ 4 tầng. Tầng đỉnh chỉ rộng 40 %: dòng chữ trên đỉnh ≤ ~45 ký tự dù `layouts.md` ghi 80 |
| L2 | Engine báo `trường lạ "id"` cho mọi slide của deck dùng chung hai tầng | 15 cảnh báo giả trên 15 slide | **Đã sửa** | `engine/validate.js`: `id`, `toc`, `trans`, `dur` vào `COMMON` |
| L3 | Engine báo `kiểu "lawquote" không tồn tại` — người dùng tưởng gõ sai, thật ra type chỉ có ở tầng hình ảnh | Lỗi exit 2 khi dựng bằng `engine/build.js` | **Đã sửa** | Thông báo nay nói rõ "chỉ có ở tầng hình ảnh" và gợi ý type gần nghĩa (`lawquote → quote`…) |
| L4 | Tầng hình ảnh **bỏ qua im lặng** `art` (chỉ `panelrows`, `lawquote` đọc) và `meta.kit` | `art: justice` ở `statement`, `art: book` ở `agenda` không vẽ gì; `grep` `stage/templates.js` chỉ một chỗ đọc `art` | **Cảnh báo** | `hinh/kiem.js` in `ℹ trường "art" bị bỏ qua…` và `ℹ meta.kit … không được tầng hình ảnh đọc` |
| L5 | `lawquote`: cụm nhấn `[ ]` bị xuống dòng thì nét bút vàng chỉ phủ dòng đầu, lệch | Cụm "một trong các điều" nằm ở hai dòng | **Cảnh báo** | `hinh/dung.js` (`kiemTran`) báo sau khi dựng. Cách tránh: cụm ngắn, đặt cuối câu |
| L6 | `scripts/check_overflow.py` báo `Font dự phòng … Inter` và thoát 1 với mọi PPTX tầng hình ảnh | LibreOffice không đọc font nhúng (Anton, Be Vietnam) | **Đã sửa** | Phát hiện `ppt/fonts/`, in lý do, thoát 0; ép chạy: `SLIDE_CHUAN_FORCE_OVERFLOW=1`. Kiểm tràn của tầng này là `hinh/dung.js --soat` |
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
