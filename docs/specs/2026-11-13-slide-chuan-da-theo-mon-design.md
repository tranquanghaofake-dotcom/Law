# Skill slide-chuan — một tầng hình ảnh, "da theo môn" (P3 mở rộng)

Trạng thái: **ĐÃ DUYỆT 13/11/2026.** Người duyệt: Trần Quang Hào — nguyên văn: "làm PA A nhưng hãy lấy tất cả tinh hoa của bản office rút về bản hình ảnh rồi xóa bản office khỏi skill", sau đó "làm và vượt giới hạn phiên".
Gốc: `.claude/skills/slide-chuan/references/loi-da-biet-2026-11.md` mục E (N1, N4; lộ trình P3) và phiên dựng bài BHXH bắt buộc (BNK405, 13/11/2026): bản hình ảnh rơi về nền chung lần thứ tư; bản lưới Office "sổ BHXH" nhận ra đề tài nhưng người dùng thấy "chả có ý nghĩa gì".

## 1. Vấn đề

1. **Hai tầng, mỗi tầng thiếu một nửa.** Bản lưới Office (`engine/build.js`, 4.287 dòng) có world theo môn (8 world), biểu đồ có nguyên nhân tại từng năm, hình vẽ minh hoạ, khung ảnh, kiểm nội dung đầy đủ. Bản hình ảnh (`hinh/dung.js` + `stage/templates.js`, ~250 dòng mẫu) có cảnh, Morph, font nhúng — nhưng không có world, và mọi tính năng mới chỉ làm cho một tầng. Skill đẩy việc chọn tầng sang người dùng.
2. **Tầng hình ảnh chỉ mang dấu hiệu môn khi deck dùng kiểu slide riêng của từng môn** (`bc*` hình sự — 18 kiểu; `qt*` quốc tế — 3 kiểu). Môn mới rơi về nền chung (L10 lặp 4 lần ở 4 môn); ngay trong môn đã có bộ, slide dùng type thường vẫn là nền chung.

## 2. Quyết định

- **Một tầng duy nhất: tầng hình ảnh.** Xoá tầng lưới Office khỏi skill (renderer, script, test, tài liệu). Lệnh dựng duy nhất: `node hinh/dung.js`.
- **Da theo môn**: tách chất liệu của môn (nền, khung slide, giấy thẻ, vật giữ tiêu đề, con dấu, đồ vật, thanh tiến độ, kiểu hiện ý) khỏi bố cục (65 type). Một môn = một da khai báo trong `hinh/da.js`. Da phủ lên mọi type thường nên `"meta": { "da": "so-bhxh" }` đổi chất liệu cả deck mà không đổi type.
- **Không còn nền chung**: deck không ghi `meta.da` thì nhận da mặc định theo `meta.kind` (`case` → `ho-so`, `lecture` → `giay`, `report` → `kinh`); `"da": "none"` mới là nền chung (phải có `chapNhanNenChung` trong prep).

## 3. Chuyển tinh hoa của tầng Office sang tầng hình ảnh

| Nhóm | Tầng Office có | Sang tầng hình ảnh |
|---|---|---|
| Nhận diện môn | 8 world (`so-bhxh`, `bang-cong`, `cang-bien`, `ban-ve`, `hoa-don`, `sao-ke`, `co-cau`, `bien-ban`) + 3 bộ chất liệu (`file`, `paper`, `glass`) | 11 da cùng tên (`file` → `ho-so`, `paper` → `giay`, `glass` → `kinh`); thêm da `bc`, `qt` từ hai bộ hình sẵn có |
| Đồ vật | 18 đồ vật SVG (`PROPS`), mỗi world 2–3 vật, vật vắt mép thẻ chính | Dùng lại nguyên hàm SVG; vật giữ tiêu đề + một đồ vật tiền cảnh ở mép slide trống |
| Hình minh hoạ | 23 hình `art` (sổ BHXH, cán cân, giấy chứng nhận…) | Chuyển sang `hinh/art.js`; `statement`, `agenda`, `panelrows`, `closing`, `end`, bìa đọc `art`; da có hình mặc định |
| Hoạ tiết nền | `meta.motif` 9 kiểu (địa chính Voronoi, đồng mức…) | Dùng lại `engine/motifs.js` (SVG) làm lớp nền khi deck ghi `meta.motif` |
| Biểu đồ | `why` tại năm, `bands`, `value2`/`series`, `annotate` viết tay, `hatch`, `waterfall`, `gantt`, `progress`, `donut`, `slope` | Vẽ đủ trong SVG của `T.chart` |
| Ảnh | Bìa `poster` + `facts`, `end` poster, `closing` + ảnh, `section` + ảnh (nửa phải / nền mờ), `hero` + ảnh, `agenda` + ảnh, khung `arch`/`circle`/`ogee` | Thêm vào mẫu HTML (CSS `clip-path` cho khung) |
| Kiểm nội dung | `validate.js` (giới hạn chữ, số tiếng, 7 luật bài báo cáo, mạch bài, ký hiệu…), dàn ý, thời lượng, gói chuẩn bị, ghi công ảnh, chính sách ảnh, `--titles`, mù màu | Chạy trong `dung.js` (`hinh/kiem_noi_dung.js`); lỗi cấu trúc dừng dựng; `--strict` dừng khi còn cảnh báo |
| Không chuyển | Biểu đồ PowerPoint gốc sửa số bằng Edit Data (`--native`); 6 theme Office; bản dự phòng font Office; phong cách `meta.style` vẽ bằng ảnh PNG | Ghi trong SKILL.md: sửa số → sửa `deck.json` rồi dựng lại; `meta.style` thay bằng da (`dossier` ≈ `ho-so`, `cadastral` ≈ `ban-ve`) |

## 4. Thiết kế da

- `hinh/da.js` xuất `DA` (tên → khai báo) và `ap(deck)` → `{ ten, css, them(section) }`.
- Khai báo một da: `palette` (giấy, mực, nhấn, viền, nền tối), `nen` (SVG nền trang sáng), `khung` (SVG khung toàn slide), `the` (kiểu thẻ: dải màu mép, viền, bóng), `vat` (vật giữ tiêu đề), `props` (đồ vật tiền cảnh), `tienDo` (thanh tiến độ hình vật thật), `chuyen` (kiểu hiện ý: `stamp` / `flip` / `slide` / `wipe` / `drop` / `pop`), `icons`, `art`, `fits` (từ khoá đề tài).
- `dung.js`: thêm lớp `da-<tên>` lên mọi `<section>`, nạp CSS của da (đè biến màu, nền `.s.light/.dark/.red`, `.card`, `.k`, `.prog`), chèn khung + đồ vật làm phần nền (không `data-l` → nằm trong ảnh nền slide), đổi hiệu ứng vào theo `chuyen`.
- Bộ hình riêng (`bc*`, `qt*`) và 11 cảnh giữ nguyên; slide type thường trong deck `bc`/`qt` nhận nền, giấy của bộ đó.
- `hinh/kiem.js`: slide có da tính là "mang dấu hiệu môn"; `prep.py`: `boHinh` nhận tên da.

## 5. Tiêu chí xong

1. Skill chỉ còn một lệnh dựng; không còn `engine/build.js`, `scripts/render.py`, `preview.py`, `check_overflow.py` và test của tầng Office; `SKILL.md` không còn tầng Office.
2. Bài BHXH (BNK405) dựng lại chỉ bằng `meta.da = "so-bhxh"`: `--soat` 0 tràn, 0 đè, lệch PPTX ≤ 1,5 %; ảnh nhìn mờ thấy dấu hiệu BHXH ở mọi slide nội dung; không còn `⚠ Nền chung`.
3. Biểu đồ của bài BHXH có nguyên nhân tại năm, dải COVID-19, gạch chéo số chưa chắc — như bản Office.
4. Mọi tính năng ở bảng mục 3 có test; `npm test` của skill xanh.
5. Ba deck mẫu (BHXH, hình sự, quốc tế) dựng `--soat` sạch.

## 6. Rủi ro

- 65 type có cấu trúc thẻ khác nhau → CSS da phải đè theo lớp chung (`.card`, `table`, `.stat`, `.cd`…), kiểm bằng `--soat` trên deck kiểm thử lớn (`examples/kiemthu_con_lai.json`).
- Nền tối của da `bc`/`qt` làm biểu đồ khó đọc → da khai báo nền sáng cho vùng dữ liệu.
- Xoá tầng Office làm mất test cũ → chuyển test còn giá trị (giới hạn chữ, luật báo cáo, dàn ý) sang chạy với `dung.js --html`.
