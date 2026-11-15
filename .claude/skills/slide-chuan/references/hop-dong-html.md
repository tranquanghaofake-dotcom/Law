# Viết slide HTML để `hinh/build.js` dựng thành PPTX sửa được

Thiết kế **tự do** — bất kỳ HTML / CSS / SVG nào Chromium vẽ được. Chỉ cần theo các quy ước dưới để PowerPoint giữ được chữ sửa được, lớp ảnh rời và hiệu ứng. Ví dụ tối thiểu: `examples/mau/`.

## Khung
```html
<!-- slides/03-khai-niem.html -->
<section class="s" data-trans="fade" data-notes="Lời nói của slide (từ kich-ban.md).">
  <h1 class="tieude" data-t data-tieu-de>BHTM là chuyển giao rủi ro qua hợp đồng</h1>
  <p class="phu" data-t>Chỉ rủi ro đã thoả thuận mới được bồi thường.</p>
  <img data-l="so-do" data-alt="Sơ đồ: bên mua trả phí cho DNBH, DNBH bồi thường khi rủi ro xảy ra" src="asset/so-do.svg" style="position:absolute;left:960px;top:300px;width:820px">
</section>
```
- Mỗi slide là `<section class="s">` 1920 × 1080 px (khung, font nền, `overflow:hidden` do `hinh/hinh.css` đặt). Một file có thể chứa nhiều `<section>`; thứ tự slide = thứ tự tên file trong `slides/`.
- CSS chung của bài: `style.css` ở thư mục bài. Đường dẫn ảnh / asset tính từ thư mục bài.
- 1 px = 0,5 pt PowerPoint. Chữ thân ≥ 28 px (14 pt), nhãn ≥ 24 px (12 pt). Lề an toàn: 40 px ngang, 24 px dọc (nên ≥ 80 px).

## Ba loại phần tử
| Gắn | Thành gì trong PowerPoint | Dùng cho |
|---|---|---|
| `data-t` | **hộp chữ thật** — đúng font, cỡ, màu, chỗ xuống dòng; gõ lại được | MỌI chữ người dùng có thể muốn sửa: tiêu đề, nhãn, số liệu, chú thích |
| `data-l="tên"` | **lớp ảnh rời** (PNG/JPEG 2×) — kéo, xoá, đổi hiệu ứng được | hình vẽ, ảnh, sơ đồ, thẻ nền cần hiện riêng |
| (không gắn) | gộp vào **ảnh nền** của slide | nền, mảng màu, hoạ tiết tĩnh |
- `data-tieu-de` trên hộp chữ tiêu đề → placeholder tiêu đề (trình đọc màn hình, mục lục, Check Accessibility). Bắt buộc mỗi slide.
- `data-alt="…"` trên mỗi `data-l`: mô tả nội dung; hình trang trí ghi `data-alt="Hình trang trí"` (PowerPoint đánh dấu decorative).
- Bảng / số liệu: dùng bộ thành phần `hinh/bang.css` (nạp sẵn; danh sách lớp ở `trinh-bay-du-lieu.md` mục 3). Ô chữ vẫn gắn `data-t`; ảnh trong `.tb-ci` cứ để `data-l`.
- Khai báo cho máy đo đa dạng (`scripts/da_dang.js`): `<section data-nen="N1|N2|N3|N4|N5|N6">` loại nền (`he-nen.md`) · `data-bang="T1…T13"` trên khối bảng (`trinh-bay-du-lieu.md`) · `data-khong-hinh` trên `<section>` cố ý chỉ có chữ (mục lục, câu hỏi) — miễn phép đo tiêu điểm · `data-lap` trên `data-l` cố ý lặp cùng vai (motif chủ đề, nhân vật xuyên suốt). Hoạ tiết nền là `data-l` có `data-alt="Hình trang trí"` — máy tính vị trí góc của nó vào nền, không tính vào asset lặp.
- Chữ là một phần của hình vẽ cố ý (chữ trên bìa sách, biển hiệu trong ảnh): bọc trong `data-prop`.
- **Không viết chữ trong SVG** (`<text>`): PowerPoint không sửa được, font dễ sai. Vẽ hình bằng SVG, đặt chữ HTML `data-t` lên trên (định vị tuyệt đối theo toạ độ của hình).

## Font
Nhúng sẵn: `'Anton'` (tiêu đề in hoa, trưng bày) và `'Be Vietnam Pro'` với `font-weight` 400–500 / 600–700 / 800–900 (PowerPoint thấy thành ba họ: Be Vietnam Pro, Be Vietnam Dam, Be Vietnam Nang). Font khác → PowerPoint thay bằng font máy người xem; muốn thêm font phải sửa `hinh/build.js` (FACES) + `hinh/hinh.css` + `hinh/tao_font.js`.

## CSS an toàn với bản PPTX
- Vị trí: `position:absolute` + `left/top/width` px là chắc nhất; flex / grid dùng được (build đo vị trí đã tính).
- Xoay: chỉ dùng thuộc tính `rotate:` (không `transform: rotate`). Lớp `data-l` xoay → chụp thẳng rồi xoay thật trong PowerPoint.
- Chữ: không dùng `text-shadow`, gradient chữ, `letter-spacing` âm lớn, chữ dọc — PowerPoint không dựng lại; hiệu ứng thị giác của chữ thì đặt hình nền sau chữ.
- Bóng đổ của lớp ảnh: `data-pad="24"` để khung chụp không cắt bóng.
- Kiểm tra: tờ `<tên>_lop/soat-*.jpg` (trái HTML · phải PPTX qua LibreOffice) — lệch thì đổi CSS.

## Chuyển động (tính năng gốc PowerPoint)
- Vào: `data-a="fade|rise|wipe|wipe-r|up|down|pop|slam|stamp|slide|slide-r|drop|fall|flip|grow|appear"` + `data-at="ms"` (tự chạy, tính từ lúc vào slide) hoặc `data-click="n"` (lần bấm thứ n); `data-dur`, `data-out`, `data-em="pulse|teeter"`, `data-mv="dx,dy,at,dur"`.
- Chuyển slide: trên `<section>`: `data-trans="fade|morph|push|none"`, `data-dur`, `data-auto="ms"`.
- Morph: phần tử cùng `data-m="tên"` ở hai slide kề nhau bay sang nhau; **đích Morph không gắn `data-a`** (build cảnh báo). Morph phải mang nghĩa (cùng một vật đổi vai), không bay cho vui.
- Máy quay: `data-cam="pan:dx,dy" | "zoom:k,x,y"` trên `<section>` + `data-sau` (thị sai) trên vật.
- Liên kết: `data-go="id"` → nhảy tới `<section data-id="id">`.
- Cửa sổ soi (kính lúp): `data-w`, `data-of`, `data-z`, `data-fx`, `data-fy` — xem chú thích đầu `hinh/build.js`.
- Xem thử hiệu ứng xuất hiện + chuyển cảnh (fade / push) khi không có PowerPoint: `node scripts/xem_hieu_ung.js <tên>_lop/deck.html xem.mp4 [--rong=1280]` — hiệu ứng bắt đầu sau khi chuyển cảnh xong. Nhịp gợi ý: tiêu đề rise 0–100 ms → phụ đề fade 350 → hình chính 500–800 → từng ý cách nhau 200–300 ms; thẻ nền muốn hiện có hiệu ứng thì gắn `data-l` + `data-alt` cho chính thẻ.
- Xem thử Morph khi không có PowerPoint: `node scripts/xem_morph.js <tên>_lop/deck.html xem.mp4`; liệt kê cặp Morph: `python3 scripts/morph_cap.py <tên>.pptx`.
