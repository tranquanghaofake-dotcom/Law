# Trình bày dữ liệu — chọn kiểu theo loại thông tin

Nguồn: 54 mẫu tham chiếu (spec `docs/specs/2026-11-14-slide-chuan-v2-quy-trinh.md` mục 11). Mẫu bán slide đa dạng ở **cấu trúc**, không ở màu: một bộ có 11–14 kiểu bảng nhưng cùng bảng màu, cùng cỡ tiêu đề.

## 1. Bảng chọn: thông tin nào → kiểu nào
| Loại thông tin | Kiểu nên dùng (mã ở mục 2) | Tránh |
|---|---|---|
| So sánh 2–3 phương án / chế định trên 3–6 tiêu chí | T3 cột nhấn · T5 thẻ song song · hai cột đối xứng | bảng lưới đủ viền |
| Đặc điểm có / không giữa 3–4 loại | T4 tick/cross | chữ "có/không" trong ô |
| Tra cứu nhiều hàng (4–6 hàng) | T2 chỉ kẻ ngang · T1 đầu cột màu | > 6 hàng một slide → tách |
| Phân loại theo 2 trục (cố ý/vô ý × hậu quả…) | T6 ma trận 2×2 | danh sách |
| Mốc thời gian, thời hạn, tố tụng | T7 bảng–trục / Gantt · trục thời gian | bảng chữ |
| Con số then chốt (mức phạt, thời hạn, tỉ lệ) | T9 số lớn + nhãn (2–3 số) | số chìm trong câu |
| Tỉ lệ, phần chia (đồng bảo hiểm, tái bảo hiểm, chia di sản) | T13 thanh tỉ lệ đúng tỉ lệ thật, số trên thanh | biểu đồ tròn > 4 phần |
| Mức độ × phạm vi | T10 ma trận nhiệt | — |
| Điều kiện / yếu tố kể tên + 1 dòng mô tả | T11 hàng có ô số 01–04 · T12 cột có icon đầu | gạch đầu dòng trơn |
| Quy trình 4–5 bước | T12 cột icon · chuỗi bước có mũi tên | đoạn văn |
| Đề bài tập có số liệu | T2 hoặc T1, số canh phải, đơn vị ghi một lần | tô màu cả bảng |

## 2. Danh mục kiểu (đo ước lượng trên mẫu)
- **T1 Đầu cột màu theo cột**: hàng đầu cao ≈ 8–10 % bảng, mỗi cột một sắc nhạt của bảng màu bài; thân trắng, kẻ mảnh; chữ đầu cột ≈ 1,2× thân, đậm.
- **T2 Chỉ kẻ ngang**: kẻ 2 px dưới đầu cột, hàng ngăn bằng kẻ 1 px xám; không viền dọc; cột đầu đậm; 4–6 hàng.
- **T3 Cột nhấn**: cột nhãn tô xám nhạt, cột cần chú ý tô màu chủ (hoặc nổi cao hơn 10–15 %); 3 cột × 4–6 hàng.
- **T4 Tick/cross**: hàng xen kẽ trắng/nhạt; dấu là hình tròn đặc (có) / vòng mờ (không), tự vẽ; hàng cuối là kết luận tô đậm.
- **T5 Thẻ song song**: 2–3 thẻ rộng bằng nhau, cách ≈ 5 % chiều rộng; nhãn màu trên, nội dung 3–5 dòng; thẻ cần nhấn cao/đậm hơn 10–15 %; tối đa 4 thẻ.
- **T6 Ma trận 2×2**: 4 ô tint 15–25 % màu, dải tiêu đề ô ≈ 25 % chiều cao ô, nhãn trục ở cạnh ngoài.
- **T7 Bảng–trục / Gantt**: hàng = việc / giai đoạn, cột = thời gian, ô tô = khoảng; cột nhãn ≈ 30 %.
- **T8 Bảng dày + thanh mini trong ô**: chỉ để tra, 6–8 hàng, một hàng nhấn — hạn chế trên slide chiếu.
- **T9 Số lớn**: số ≈ 3–4× nhãn; 2–3 số mỗi slide; trong hộp nhấn trên N2 hoặc hộp sáng.
- **T10 Ma trận nhiệt**: lưới 4×4–5×5, một màu 3 sắc theo mức.
- **T11 Hàng có ô số**: ô số 01–05, thanh nhãn màu, ô mô tả nhạt; hàng cao đều.
- **T12 Cột có icon đầu**: 3–5 cột, đầu cột là thẻ màu có icon tự vẽ (cùng bộ), tiêu đề + ≤ 3 dòng.
- **T13 Thanh tỉ lệ**: chiều dài = số liệu thật, số ghi trên/trong thanh, vạch ngưỡng có tên (mức giữ lại, giới hạn).

## 3. Quy tắc chung
1. Chọn kiểu theo **loại thông tin** (mục 1), không theo hạn ngạch: các ngưỡng "≥ 6 kiểu", "một kiểu ≤ 40 %" chỉ là cảnh báo (18/11/2026). Ranh giới bảng phải tách nền ≥ 3 : 1 (`bo-cuc.md` mục 7) — không zebra nhạt, không thẻ cho từng hàng, không bo góc lớn, không bóng.
2. **Nhấn đúng 1 hàng hoặc 1 cột** mỗi bảng (nền màu 20–30 % + chữ đậm); không nhấn > 2 ô.
3. Không kẻ đủ lưới trừ bảng lịch / số liệu dày.
4. Cùng bảng màu, cùng cỡ chữ thân (≥ 26 px trên slide 1920) cho mọi kiểu; màu theo vai (bên, loại) giữ cố định cả deck.
5. Số canh phải, cùng số chữ số thập phân; đơn vị ghi một lần ở đầu cột hoặc chân bảng.
6. **Bộ thành phần** `hinh/bang.css` (nạp sẵn khi dựng): `.tb.tb-ke` T2 · `.tb.tb-dau` T1 · `.tb.tb-nhan[data-nhan=3]` T3 · `.tb.tb-co` T4 (ô `b.co` / `b.khong`) · `.tb-the > .the(.noi)` T5 · `.tb-mt > .o` T6 · `.tb-so` T9 · `.tb-hs > .hang` T11 · `.tb-ci > .cot` T12 · `.tb-thanh > i[style=flex:số]` T13; hàng `.tb-h` / `.tb-r(.on)`, số canh phải `.tb-so-phai`, tỉ lệ cột `data-cot="2-1-1"`. Màu: biến `--tb-chu, --tb-nhan, --tb-nhat, --tb-ke, --tb-c1..c4` trong `style.css` của bài.
7. HTML: gắn `data-bang="T2"` (mã kiểu) cho khối bảng — máy (`scripts/da_dang.js`) đếm kiểu và báo ◇ khi mọi bảng một kiểu hoặc một kiểu > 40 %.
