# Đồ hoạ vật thật, hình dán, biểu đồ và các ngôn ngữ áp phích

Mở file này ở pha 2–4 khi bài cần một hình chính mạnh hơn "ô chữ + icon", hoặc khi chọn ngôn ngữ thiết kế cho tầng áp phích.

## Mục lục
1. Chọn đồ hoạ theo hình dạng dữ liệu
2. Hình dán màu (`data-emo`)
3. Năm khối vật thật: `dem`, `chong`, `vong`, `tuyen`, `nhan-vat`
4. Biểu đồ và sơ đồ sinh từ dữ liệu (`scripts/bieu-do.mjs`)
5. Các ngôn ngữ áp phích và bài mẫu
6. Lỗi đã gặp

## 1. Chọn đồ hoạ theo hình dạng dữ liệu

| Dữ liệu có dạng… | Đồ hoạ | Làm bằng | Bài mẫu |
|---|---|---|---|
| Một con số là cả thông điệp (mức trần, tỉ lệ) | số khổng lồ + lưới 100 ô | style `thuy-si`, khối `dem` | `examples/phat-vi-pham-thuy-si/` |
| 2–4 số cùng đơn vị cần so bằng mắt (ngày, tờ, đồng) | chồng vật cao đúng tỉ lệ | khối `chong` | `examples/nghi-viec-giay-cat/` |
| "Cứ N thì có x" | hình đếm bằng hình dán hoặc ô | khối `dem` | bảng loại hình ở `examples/thanh-lap-cong-ty-tuyen/` |
| Một tỉ lệ, một phân số | vòng tỉ lệ có số giữa | khối `vong` | dải 2/3 ở `examples/thua-ke-so-tay/` |
| Các phần của một tổng (một năm, một khoản tiền) | bản đồ ô, diện tích đúng tỉ lệ | ECharts `treemap` | `examples/ngay-nghi-bieu-do/` |
| Dòng chảy từ nguồn sang đích (tiền, hồ sơ, hàng) | sankey | ECharts `sankey` | — |
| Tăng dần theo bậc (thâm niên, mức phạt) | bậc thang | AntV `sequence-ascending-steps` | `examples/ngay-nghi-bieu-do/` |
| Thứ bậc trên dưới | kim tự tháp | AntV `sequence-pyramid-simple` | — |
| Cơ cấu tổ chức, phân nhánh | cây | AntV `hierarchy-tree-*` | — |
| Thủ tục có thời hạn và ngã rẽ | bản đồ tuyến | style `tuyen-duong`, khối `tuyen` | `examples/thanh-lap-cong-ty-tuyen/` |
| Ai thuộc nhóm nào (hàng thừa kế, các bên) | dãy người có chú thích | khối `nhan-vat` | `examples/thua-ke-so-tay/` |

Ba luật không đổi: (1) hình có tỉ lệ thì tỉ lệ phải đúng và ghi rõ đơn vị; (2) số liệu giả định để minh hoạ phải ghi chữ "giả định" ngay cạnh; (3) hình không chở dữ liệu thì bỏ.

## 2. Hình dán màu (`data-emo`)

Kho `assets/emoji.json` có 199 hình Fluent Emoji (Microsoft, giấy phép MIT — `assets/emoji/GIAY-PHEP.txt`): người, nghề, giấy tờ, tiền, lịch, nhà, phương tiện, dấu hiệu.

```html
<span class="emo" data-emo="spiral-calendar" style="--s:80px"></span>   <!-- --s = cạnh hình; thêm class dan = viền trắng như hình dán -->
```
- Chạy `node scripts/icons.mjs <index.html>` để chèn: hình được chép vào `assets/emoji/` cạnh file HTML, bài tự đứng.
- Xem tên có sẵn: `node scripts/assets.mjs emoji --list`. Tải thêm: `node scripts/assets.mjs emoji <tên…> --to <thư mục bài>`; tra tên ở icon-sets.iconify.design/fluent-emoji (dạng `man-office-worker`, `money-bag`).
- Mỗi hình dán phải thay được một cụm chữ ("người lao động", "hợp đồng"). Một trang không trộn hình dán màu với icon nét Lucide cho cùng một vai.
- Hình người: tả vai (nghề, tuổi), không gán một màu da hay giới cho "người vi phạm".

## 3. Năm khối vật thật

Khung HTML của từng khối nằm ở `blocks/<tên>.html` (dòng đầu ghi khi nào dùng); CSS ở phần "ĐỒ HOẠ VẬT THẬT" cuối `styles/_base.css`.

| Khối | Biến chỉnh | Giới hạn |
|---|---|---|
| `dem` — hình đếm | `data-dem` = tổng, `data-on` = số tô đậm, `data-emo` = hình dán (bỏ thì là ô: class `o` tròn, `vuong` vuông); `--cols`, `--g`, `--c` | ≤ 120 đơn vị |
| `chong` — chồng vật | mỗi `.xep`: `--n` = số tờ, `--t` = bề dày một tờ (cùng `--t` cho mọi cột) | cột cao nhất `n × t` ≤ 300 px; 2–4 cột |
| `vong` — vòng tỉ lệ | `--p` = phần trăm, `--s` = đường kính, `--c` = màu | ≤ 3 vòng một trang |
| `tuyen` — tuyến dọc | `.tram` (thêm `lon` = trạm chính), `.doan > .han` (thời hạn), `.re > .nhanh` (ngã rẽ) | ≤ 7 trạm, ≤ 3 nhánh |
| `nhan-vat` — dãy người | `--w` = bề rộng một người | ≤ 9 hình một dãy |

Con số cỡ lớn trong các khối gắn `data-big`; vật xoay nghiêng gắn `data-tilt` (như mọi khối khác).

## 4. Biểu đồ và sơ đồ sinh từ dữ liệu (`scripts/bieu-do.mjs`)

Dùng khi hình không vẽ tay nổi bằng CSS: diện tích đúng tỉ lệ, dòng chảy, cây, bậc. Script lưu SVG vào `assets/illustrations/<tên>.svg` của bài; chèn như mọi minh hoạ:

```html
<div class="illus" data-illus="365-ngay"></div>      <!-- rồi chạy icons.mjs -->
```

**Cài một lần** (hai thư viện nặng hơn 100 MB nên không đi kèm skill): `npm install --prefix <thư mục bài> echarts @antv/infographic`. Thiếu gói thì script in đúng lệnh cài. Không cài được (không có mạng, không có Node) → dùng năm khối ở mục 3.

**Apache ECharts** (Apache-2.0) — biểu đồ số liệu: `treemap`, `sankey`, `sunburst`, `radar`, `funnel`, `pictorialBar`, `heatmap`…

```bash
node scripts/bieu-do.mjs echarts du-lieu/365-ngay.json --ten 365-ngay --to <thư mục bài> --rong 968 --cao 266
```
- File `.json` là option của ECharts (tra ở echarts.apache.org/en/option.html); cần hàm `formatter` thì viết `.mjs` có `export default`.
- Màu viết bằng tên biến của style: `"$ink"`, `"$paper"`, `"$accent"`, `"$bad"`, và mọi biến riêng trong `:root` của style (`"$do"`, `"$lam"`). Đổi style là hình đổi màu theo.
- `--rong`, `--cao` = đúng kích thước khung trên trang (px), để chữ trong hình giữ nguyên cỡ đã khai.
- Không dùng `title`, `legend` của ECharts: viết tiêu đề và chú giải bằng HTML để script kiểm được chữ.
- Có Playwright thì chữ được đo bằng chính phông của style; không có thì script ước lượng bề rộng chữ (`--ssr`).

**AntV Infographic** (MIT) — 276 mẫu sơ đồ: `sequence-*` (83: bậc thang, đường đi, vòng), `hierarchy-*` (112: cây), `list-*` (29), `compare-*` (20), `relation-*` (18), `chart-*` (11), `quadrant-*` (3).

```bash
node scripts/bieu-do.mjs antv --list stairs          # tìm tên mẫu
node scripts/bieu-do.mjs antv du-lieu/tham-nien.txt --ten tham-nien --to <thư mục bài> --rong 792
```
File mô tả (thụt lề 2 dấu cách):
```
infographic sequence-ascending-steps
data
  sequences
    - label 12 ngày
      desc Làm đủ 12 tháng
    - label 13 ngày
      desc Đủ 5 năm
theme
  palette $ink $ink $do
```
- Khoá dữ liệu theo họ mẫu (đã thử từng họ): `sequence-*` → `sequences`; `list-*` → `lists`; `compare-*` → `compares` (mỗi bên có `children`); `hierarchy-*` → `root` (lồng `children`); `chart-*` → `values` (mỗi mục `label` + `value`, cột vẽ từ 0); `relation-dagre-flow-*` → `nodes` + `relations` (mỗi quan hệ `from`, `to`, `label`, gọi nút theo nhãn). `relation-circle-*`, `relation-network-*` không vẽ nhãn quan hệ.
- Bỏ khối `theme` thì script lấy bảng màu của style. Phông được đổi sang phông của style; lời gọi phông từ máy chủ của AntV bị gỡ.
- Script tự cắt khoảng trống quanh hình (`--giu-vien` để giữ khung gốc) và in cỡ chữ nhỏ nhất sau khi co giãn theo `--rong`.
- Bỏ `title`, `desc` của `data`: tiêu đề nằm ở `<h2>` của trang.

**Sau khi sinh hình, đọc ba dòng script in ra**: kích thước khi đặt vào khung, cỡ chữ nhỏ nhất (phải ≥ 12,5 px), và cảnh báo "dòng chữ KHÔNG có trong hình". `render.mjs` kiểm lại cỡ chữ thật của mọi hình trong `.illus`.

## 5. Các ngôn ngữ áp phích và bài mẫu

| Style | Dáng | Hợp đề tài | Bài mẫu | Không hợp |
|---|---|---|---|---|
| **`san-khau`** (mặc định) | sân khấu đêm: nền mực đêm quầng son, chữ Anton trắng và vàng, hình dán cỡ lớn, ô đếm được, thẻ ngà viền mực, dấu mộc; ≤ 170 chữ; bốn bảng màu | mọi đề tài cần người lạ dừng lại đọc — công thức ở `references/san-khau.md` | năm thư mục `examples/*-san-khau/` | bảng tra nhiều chữ |
| `co-dong` | tranh cổ động: viền mực 4 px, bóng cứng, tia nắng | lao động, phong trào, kêu gọi | `examples/thu-viec-co-dong/` | nội dung cần giọng trung tính |
| `giay-cat` | giấy cắt dán: mảng màu tươi, mép vỏ sò, hình dán | quyền lợi người lao động, sinh viên, tiêu dùng | `examples/nghi-viec-giay-cat/` | hình sự, tố tụng |
| `thuy-si` | lưới Thuỵ Sĩ: một màu đỏ, số khổng lồ, đường kẻ | thương mại, doanh nghiệp, thuế, số liệu | `examples/phat-vi-pham-thuy-si/`, `examples/ngay-nghi-bieu-do/` | chuyện gia đình, trẻ em |
| `so-tay` | sổ tay cắt dán: giấy kraft, băng keo, chữ viết tay | dân sự, hôn nhân gia đình, thừa kế | `examples/thua-ke-so-tay/` | bảng tra nhiều số |
| `tuyen-duong` | bản đồ tàu điện: tuyến màu, trạm, biển đen | thủ tục có thời hạn, tố tụng, hành chính | `examples/thanh-lap-cong-ty-tuyen/` | nội dung không có trình tự |

**Sáu luật chi tiết của `co-dong`** (bài mẫu `examples/thu-viec-co-dong/`):

1. **Mở bằng khối `hero` tràn lề**, chiếm 25–30% trang: tiêu đề ≥ 80 px, một nhãn nghiêng, hai trường "Dành cho", "Căn cứ".
2. **Vật chủ đạo chở con số quan trọng nhất của nhóm người đọc** (tờ lịch xé chở "6 ngày làm việc"), số ≥ 200 px, và **phá khung**: lấn 40–60 px sang khối bên dưới. Vật chỉ để trang trí thì bỏ.
3. **Hai mảng màu tràn lề**: hero ở đầu, dải hành động `dai` ở đáy; giữa là giấy. Không thêm mảng thứ ba.
4. **Số cỡ áp phích cho mọi dữ liệu**: số trong thanh ≥ 34 px, tỉ lệ then chốt dùng khối `so-lon` (≥ 84 px). Nhóm của người đọc là cả một dải màu nhấn, không chỉ một dòng in đậm.
5. **Một ngôn ngữ nét**: viền mực 4 px, bóng cứng lệch, không bo góc, không bóng mờ; chỗ nào cũng theo.
6. Vật xoay nghiêng gắn `data-tilt`, chữ số cỡ áp phích gắn `data-big`: script hiểu hộp chữ của chúng phình ra và không báo nhầm.

Mỗi style có bộ class riêng cho đầu trang và hình chính (đọc phần chú thích trong file CSS và chép khung từ bài mẫu); các khối chung của `_base.css` vẫn dùng được. `thuy-si` đã dựng hai bài khác nhau: style là ngôn ngữ, không phải khuôn một bài.

## 6. Lỗi đã gặp

- **Mẫu AntV lặng lẽ bỏ mục**: `list-pyramid-*` xếp tam giác, chỉ nhận 3, 6, 10 mục; đưa 4 mục thì mục thứ tư biến mất không báo. Script nay cảnh báo; thứ bậc thật dùng `sequence-pyramid-simple`.
- **Mẫu AntV tự đánh số bước** (`*-stairs-*`, `*-indexed-*`): số 1–5 trong hình không phải dữ liệu, dễ bị đọc nhầm thành số ngày. Chọn mẫu không đánh số khi nhãn đã là con số.
- **Nhãn ECharts mất hẳn**: xuất SVG trước khi nhãn hiện xong (chữ có `fill-opacity="0"`). Script đã chờ; nếu tự viết lại thì nhớ chờ.
- **Nhãn tiếng Việt bị cắt "…"**: bộ đo chữ không có canvas coi chữ có dấu rộng gấp đôi. Script đo bằng trình duyệt, hoặc ước lượng theo chữ cái gốc.
- **Ô treemap quá nhỏ cho nhãn dài**: ô 12/365 chỉ rộng chừng 94 px. Nhãn trong ô ≤ 2 từ, phần giải thích viết bằng HTML bên ngoài.
- **Hai đơn vị trong một hình đếm**: "ngày" và "ngày làm việc" đặt chung một chồng phải ghi đơn vị trên từng vật.
- **Chữ vàng trên nền san hô, chữ trắng trên lục nhạt** không đạt tương phản: nhấn bằng ô nền vàng chữ mực; `contrast.mjs` bắt.
- **Kho văn bản thiếu văn bản mới**: khoản 1 Điều 112 Bộ luật Lao động ghi 11 ngày lễ, tết; ngày 24/11 nằm ở Nghị quyết 28/2026/QH16. Con số tổng hợp từ nhiều văn bản phải tra tin mới trước khi chốt, và ghi rõ trong `nguon.md` phần nào chưa đọc nguyên văn.
