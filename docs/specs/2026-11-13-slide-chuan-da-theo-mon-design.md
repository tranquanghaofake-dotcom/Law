# Skill slide-chuan — "Da theo môn" cho tầng hình ảnh (P3)

Trạng thái: **ĐỀ XUẤT — chờ duyệt.** Chưa có dòng code nào cho phần này.
Gốc: `.claude/skills/slide-chuan/references/loi-da-biet-2026-11.md` mục E (N1, N4; lộ trình P3).

## 1. Vấn đề

Tầng hình ảnh chỉ mang dấu hiệu môn học khi deck dùng **kiểu slide riêng của từng môn** (`bc*` hình sự — 18 kiểu, 302 dòng; `qt*` Công pháp quốc tế — 3 kiểu, 161 dòng). Mỗi môn mới phải viết lại từng bố cục (so sánh, trích luật, cây điều kiện…) từ đầu, nên:

- môn thứ ba, thứ tư… lại rơi về nền, khung chung → lỗi L10 lặp (đã 3 lần, 3 môn);
- ngay trong môn đã có bộ, slide nào dùng type thường (65 type) thì nền và khung vẫn là chung → deck nửa nọ nửa kia (đo được: deck Công pháp quốc tế mới 3/21 slide có bộ hình).

## 2. Ý tưởng

Tách **chất liệu của môn** (nền, giấy, vật giữ tiêu đề, con dấu, thẻ, vật trang trí) khỏi **bố cục** (65 type sẵn có). Một môn = một **"da"**: file cấu hình nhỏ + 1–2 hàm vẽ vật riêng. Da phủ lên mọi type thường, nên chỉ cần ghi `"meta": { "da": "qt" }` là cả 21 slide đổi chất liệu, không phải đổi type.

| Lớp | Da quyết định | Ví dụ `qt` (đã có vật) | Ví dụ `bc` (đã có vật) |
|---|---|---|---|
| Nền mọi slide | ảnh nền SVG/CSS | bản đồ thế giới bằng chấm + lưới kinh–vĩ tuyến | bảng bần + vân tay mờ |
| Tiêu đề slide nội dung | tờ giấy + vật giữ | dải văn kiện + dấu xi, dải lụa | tờ giấy + đinh ghim |
| Thẻ (`.card`, ô bảng, ô bước) | màu giấy, viền, bóng | giấy ngà viền nhũ | giấy kem, bóng sâu |
| Con dấu / nhãn nhấn | kiểu dấu | dấu xi đỏ | dấu mực đỏ viền kép |
| Bìa / chương / kết | thay bằng kiểu riêng của da | `qtbia`, `qtchuong` | `bcbia`, `bcchuong`, `bccamon` |
| Vật riêng (tuỳ chọn) | hàm vẽ thêm | bàn họp, cờ trừu tượng (`qtban`) | dây đỏ, thẻ tang vật |

## 3. Thiết kế

- `hinh/da/<tên>.js` xuất `{ ten, mon, css, vatGiu(x, y), dau(text), thay: { cover: "qtbia", section: "qtchuong", end: … }, kieuRieng: {...} }`. `bang_chung.js`, `hoi_nghi.js` chuyển dần thành hai da đầu tiên (giữ nguyên các kiểu riêng như `bcthang`, `bcsan`, `qtban`).
- `hinh/dung.js`: `meta.da` → mọi `<section>` thêm lớp `da-<tên>`; nạp `css` của da (đè nền `.s`, biến `.h` thành tờ tiêu đề, `.card` thành giấy của môn); chèn vật giữ cạnh tiêu đề sau khi font nạp (`hinhKhiSanSang`, như `hinhDatHinhDan`); đổi `cover / section / end` sang kiểu của da.
- `hinh/tu_gan.js` không đổi: nó chụp lớp từ trang đã dàn xong nên tự nhận chất liệu mới. Tờ tiêu đề mang tên Morph `tieu` ở mọi slide.
- `prep.py`: `boHinh` nhận tên da; `kiem.js` tính slide có da là "mang dấu hiệu môn".
- Kiểm tra sẵn có giữ nguyên: tương phản WCAG từng ô chữ, `--soat` tràn / đè, `⚠ Nền chung`.

## 4. Tiêu chí xong

1. Deck Công pháp quốc tế 21 slide, **chỉ thêm `meta.da = "qt"`, không đổi type**: `--soat` 0 tràn, 0 đè, lệch PPTX ≤ 1,5 %; ảnh nhìn mờ thấy dấu hiệu quốc tế ở **mọi** slide; `kiem.js` không còn `⚠ Nền chung`; Morph `tieu` giữa mọi cặp slide nội dung kề nhau (`morph_cap.py`).
2. Như trên với `meta.da = "bc"` trên ví dụ hình sự hiện có.
3. **Chứng minh mở rộng được**: làm da thứ ba cho một môn mới (đề xuất: Luật Đất đai — bản đồ địa chính, thửa, mốc giới) trong ≤ 1,5 giờ, chỉ bằng 1 file da.
4. Toàn bộ test hiện có (291) vẫn xanh; thêm test cho từng da (nền có trong CSS, tiêu đề có vật giữ và tên `tieu`, kiểu thay thế đúng).

## 5. Ước lượng và rủi ro

- Khoảng 6–10 giờ, chia 2–3 phiên (mỗi phiên ≤ 2 giờ, dừng và báo cáo).
- Rủi ro: (a) 65 type có nhiều cấu trúc thẻ khác nhau — có thể phải xử lý riêng `chart`, `table`, `map`; (b) nền tối của `qt` làm biểu đồ / bảng khó đọc → da phải khai bảng màu sáng cho vùng dữ liệu; (c) kiểm tương phản có thể chặn nhiều slide ở lần đầu.

## 6. Cần anh quyết

1. Có làm P3 không, và làm ở phiên riêng (khuyên) hay nối tiếp.
2. Môn cho da thứ ba (mặc định đề xuất: Đất đai).
3. Khi một môn đã có da, có **bắt buộc** dùng da (prep chặn nếu thiếu `meta.da`) hay chỉ khuyến nghị.
