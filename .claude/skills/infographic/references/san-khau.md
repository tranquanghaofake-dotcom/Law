# Áp phích `san-khau` — công thức dựng

Style mặc định của tầng áp phích: nền đêm có quầng son, chữ Anton trắng và vàng, vật thật cỡ lớn, dữ liệu thành ô đếm được, thẻ ngà viền mực, dấu mộc. Cùng ngôn ngữ hình ảnh với slide "tầng hình ảnh" của skill slide-chuan. Mở file này trước khi dựng bất kỳ áp phích nào.

## Mục lục
1. Khi nào dùng
2. Công thức năm dải cảnh và ngân sách
3. Ráp bài
4. Bốn bảng màu
5. Khối `sk-*`: chọn theo dữ liệu
6. Luật của ngôn ngữ này
7. Biến chỉnh nhanh
8. Lỗi đã gặp
9. Bài mẫu

## 1. Khi nào dùng

- **Dùng**: áp phích phổ biến pháp luật, bài đăng mạng, tờ dán bảng tin — mọi bài cần người lạ dừng lại đọc. Người dùng không nói gì thì chọn style này.
- **Không dùng**: tờ tra cứu phải giữ hơn 170 chữ (chuyển sang tầng tờ hướng dẫn); người dùng yêu cầu nền sáng, giọng trung tính (dùng `thuy-si`, `tuyen-duong`, xem `references/do-hoa.md` mục 5).

## 2. Công thức năm dải cảnh và ngân sách

Trang là năm dải xếp dọc, sát nhau, nền tràn mép giấy; mỗi dải một việc.

| Dải | Nền | Cao | Chở gì |
|---|---|---|---|
| Mở — `sk-mo` | đêm, quầng son, tia | 350–425 px | nhãn căn cứ, tiêu đề ba dòng, **vật chủ đạo** (hai hình dán 286 + 132 px, hoặc một con số 300 px) |
| Số liệu — `sk-o-ngay`, `sk-xu`, `sk-nam`, `sk-duong`, `sk-hang` | đêm | 330–470 px | **hình chính**: dữ liệu thành vật đếm được |
| Giấy — `sk-the`, `sk-long`, `sk-o-so`, `sk-to-lich` | ngà, vạch vàng phía trên | 270–380 px | ví dụ, các trường hợp, bảng nhỏ |
| Son — `sk-do`, `sk-bac` | son | 175–275 px | hệ quả, điều dễ sót, một dấu mộc |
| Kết — `sk-ket` | đêm | 85–155 px | một câu mang về, tối đa ba việc, dòng ký tên |

- Dải giấy và dải son đổi chỗ được; mỗi loại dùng một lần. Chữ cuối cùng phải kết thúc trước mốc 1476 px (lề đáy 52 px).
- **Ngân sách chữ**: cả trang ≤ 170 chữ, không kể dòng căn cứ. Tiêu đề ≤ 9 chữ chia ba dòng. Mỗi dải một tiêu đề Anton ≤ 9 chữ và tối đa một dòng phụ `kc`. Mỗi thẻ ≤ 14 chữ (thẻ chữ cái ≤ 8).
- **Cỡ chữ**: tiêu đề 68–84 px; tiêu đề dải 44 px; số áp phích 50–128 px; chữ trên thẻ 15–16 px đậm 800; căn cứ 13,5 px.

## 3. Ráp bài

```bash
node scripts/new.mjs <slug> --style san-khau --mau lam --blocks sk-mo,sk-xu,sk-long,sk-do,sk-ket --out <thư mục làm việc>
```
Điền `index.html` → `node scripts/icons.mjs` → `node scripts/render.mjs` → `node scripts/contrast.mjs` (như Bước 6 của SKILL.md). Khung vừa ráp đã có hình dán và số mẫu; các chữ "Nhãn", "Tiêu đề bài", "căn cứ"… bị `render.mjs` bắt cho tới khi thay hết.

Tiêu đề viết thành ba nhịp: dòng 1 trắng (bối cảnh), dòng 2 vàng (điều người đọc quan tâm), dòng 3 trong hộp son nghiêng (câu hỏi hoặc lời chốt). Ví dụ: "Nghỉ việc / phải báo trước / bao lâu?".

## 4. Bốn bảng màu

Thêm class vào `.sheet` (hoặc `--mau` khi ráp); không có class là `son`.

| Class | Màu | Hợp |
|---|---|---|
| (không) `son` | mực đêm + son + vàng | lao động, hình sự, pháp lý chung |
| `luc` | xanh rừng + cam đất + vàng | đất đai, môi trường, nghỉ ngơi, an sinh |
| `lam` | chàm + đỏ + vàng tươi | thương mại, tài chính, công nghệ |
| `nau` | nâu gỗ + son trầm + vàng mật | dân sự, gia đình, thừa kế, lịch sử |

Một trang một bảng màu. Màu trong CSS luôn viết bằng biến (`var(--red)`, `rgba(var(--red-rgb), .6)`), không viết mã màu cứng.

## 5. Khối `sk-*`: chọn theo dữ liệu

| Dữ liệu | Khối | Bài mẫu |
|---|---|---|
| 2–3 thời hạn, số lượng cần so | `sk-o-ngay` — chồng ô, mỗi ô một đơn vị | `examples/nghi-viec-san-khau/` |
| "cứ 100 thì x" | `sk-xu` — 100 hình dán, phần được tính sáng lên | `examples/phat-vi-pham-san-khau/` |
| các phần của một tổng đếm được (365 ngày) | `sk-nam` — bức tường ô nhiều màu + hàng chỉ số | `examples/ngay-nghi-san-khau/` |
| thủ tục có trạm và thời hạn | `sk-duong` — đường đi + dãy ô thời hạn | `examples/thanh-lap-cong-ty-san-khau/` |
| thứ tự ưu tiên giữa các nhóm người | `sk-hang` — hàng thẻ lùi dần | `examples/thua-ke-san-khau/` |
| các trường hợp theo điểm a, b, c | `sk-the` — thẻ chữ cái + số lớn | `examples/nghi-viec-san-khau/` |
| "x% của phần nào" | `sk-long` — thanh lồng đúng tỉ lệ + ba chỉ số | `examples/phat-vi-pham-san-khau/` |
| chia phần, so loại hình | `sk-o-so` — thẻ số, có nhãn màu | `examples/thua-ke-san-khau/`, `examples/thanh-lap-cong-ty-san-khau/` |
| các ngày, các mốc trong năm | `sk-to-lich` — tờ lịch xé | `examples/ngay-nghi-san-khau/` |
| hệ quả, chế tài, điều dễ sót | `sk-do` — thẻ ngà trên nền son + dấu mộc | cả năm bài |
| mức tăng theo bậc | `sk-bac` — bậc thang ô | `examples/ngay-nghi-san-khau/` |

Dữ liệu cần biểu đồ diện tích, dòng chảy, cây: sinh bằng `scripts/bieu-do.mjs` (`references/do-hoa.md` mục 4) rồi đặt vào dải giấy.

## 6. Luật của ngôn ngữ này

1. **Vật chủ đạo ≥ 250 px**, nghiêng 5–10°, viền trắng, bóng cứng; kèm tối đa một vật phụ. Vật phải thuộc thế giới đề tài (lịch cho thời hạn, nhà cho thừa kế, toà nhà cho doanh nghiệp).
2. **Mỗi ô là một đơn vị thật**: 45 ngày là 45 ô, 365 ngày là 365 ô. Không làm tròn, không vẽ "khoảng chừng". Hai đơn vị khác nhau ("ngày" và "ngày làm việc") ghi ngay dưới con số.
3. **Chữ trắng trên nền son chỉ ở cỡ lớn** (≥ 24 px, hoặc ≥ 18,66 px đậm). Mọi nội dung nhỏ nằm trên thẻ ngà.
4. **Vàng có bốn chỗ dùng**: dòng hai của tiêu đề, cụm nhấn trong tiêu đề dải, số áp phích, vạch kẻ. Trên nền ngà cụm nhấn tự đổi sang son đậm.
5. **Mỗi thẻ một hình dán đúng nghĩa**; một hình không mang hai nghĩa trong cùng trang.
6. **Một dấu mộc mỗi trang**, ≤ 5 chữ, đặt ở dải son, nói kết luận ("Trái pháp luật", "Tuỳ loại hợp đồng").
7. **Căn cứ ba tầng**: nhãn đầu trang ghi điều chính; mỗi thẻ ghi khoản, điều của riêng nó; dòng ký tên ghi số hiệu văn bản.
8. Vật xoay gắn `data-tilt`; mọi chữ Anton (tiêu đề dải, con số) gắn `data-big`; số chủ đạo gắn thêm `data-margin`.

## 7. Biến chỉnh nhanh

| Biến | Đặt ở | Tác dụng |
|---|---|---|
| `--h1`, `--cao` | `.mo` | cỡ tiêu đề; chiều cao cảnh mở |
| `--so` | `.so-to` | cỡ con số chủ đạo |
| `--cols`, `--o`, `--g` | `.dem.o-ngay`, `.nam` | số cột, chiều cao một ô, khe |
| `--n` | `.luoi`, `.hq`, `.o-so`, `.ke`, `.duong`, `.to-lich`, `.bac`, `.viec` | số cột |
| `--co` | `.ke`, `.o-so` | cỡ số Anton |
| `--e` | `.duong` | cỡ hình dán của trạm |
| `--lui` | `.hang-tk .hang` | độ lùi của hàng |
| `--chia` | `.moc`, `.hai-nua` | tỉ lệ hai cột |

Trang thừa hoặc thiếu vài chục px: chỉnh `--cao` của cảnh mở trước, rồi `--o` của ô, cuối cùng mới cắt chữ.

## 8. Lỗi đã gặp

- **Trùng tên lớp với `_base.css`**: ô ngày từng mang lớp `lich`, dính nền trắng của khối `.lich` (tờ lịch xé) có sẵn; ô lẻ cuối chồng hiện thành mảng trắng. Lớp đúng là `o-ngay`. Khối mới đặt tên riêng và tìm tên đó trong `_base.css` trước khi dùng.
- **Số Anton khổng lồ bị cắt đỉnh**: hộp chữ Anton cao khoảng 1,5 lần cỡ chữ. Đặt `top` ≥ 60 px và gắn `data-big data-margin`.
- **Dòng ký tên thành hai dòng**: chữ dài hơn bề rộng trang một chút là bị cân thành hai dòng đều nhau, mất 20 px. Giữ ≤ 125 ký tự.
- **Chồng ô lệch đáy**: nhãn dưới chồng xuống hai dòng ở cột này, một dòng ở cột kia. Nhãn bậc thang một dòng ("5 năm", không "đủ 5 năm làm việc").
- **Chữ cái trắng 23 px trên ô son không đạt tương phản**: từ 24 px mới tính là chữ lớn.
- **Hình dán đè chữ trong thẻ chữ cái**: giữ `padding-top: 47px` của thẻ và `top: -24px` của hình.
- **Viện dẫn gãy giữa "Điều" và số**: trong dòng căn cứ nhỏ, nối bằng dấu cách không ngắt.
- **Vẽ nhầm mốc thời hạn**: "30 ngày" ở khoản 3 Điều 32 Luật Doanh nghiệp là thời hạn nội dung được đăng công khai, không phải hạn phải đi công bố. Chỉ vẽ dãy ô cho thời hạn người đọc phải canh.

## 9. Bài mẫu

| Bài | Bảng màu | Hình chính |
|---|---|---|
| `examples/nghi-viec-san-khau/` | son | ba chồng ô ngày 45 : 30 : 3 |
| `examples/phat-vi-pham-san-khau/` | lam | số 8% + 100 đồng xu sáng 8 |
| `examples/thua-ke-san-khau/` | nau | ba hàng thừa kế lùi dần |
| `examples/thanh-lap-cong-ty-san-khau/` | son | bốn trạm + dãy 3 ô và 90 ô |
| `examples/ngay-nghi-san-khau/` | luc | bức tường 365 ô bốn màu |

Bài mẫu trong gói không kèm file hình dán lẻ: chạy `node scripts/icons.mjs examples/<bài>/index.html` để bung hình từ kho trước khi mở hoặc xuất lại.
