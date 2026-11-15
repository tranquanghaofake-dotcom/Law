# Hệ thống thiết kế — Chương 3 (phong cách A, đã duyệt) · theo tham-chieu/quy-tac.md

## Lưới và khoảng cách
- Khung 1920×1080; lề trái/phải 120 px (6,25 %), lề trên 96, lề dưới 72. Lưới 12 cột, rãnh 40 px → cột ≈ 103 px.
- Thang khoảng cách: 8 · 16 · 24 · 40 · 64 · 96 px. Khối cách khối ≥ 40; nhãn cách vật nó gọi ≤ 24.
- Khoảng trắng ≥ 50 % mỗi slide; slide định nghĩa / slide thở ≥ 60 % (quy tắc 3).

## Chữ (4 cỡ — quy tắc 2)
| Bậc | Cỡ | Dùng |
|---|---|---|
| Trưng bày | 120 / 800 | số chương, số lớn, câu thở |
| Tiêu đề | 60 / 800 | câu khẳng định ≤ 2 dòng; ý phụ đưa xuống câu dẫn |
| Thân | 32 / 400 | câu dẫn, nội dung thẻ, bảng |
| Nhãn | 26 / 600 | nhãn trên mũi tên, chú thích dưới hình, nguồn luật |
Tiêu đề ≥ 2 lần cỡ thân. Một khối chữ ≤ 3 dòng.

## Màu (quy tắc 4, 5) — mỗi BÊN một màu cố định cả deck
| Vai | Màu |
|---|---|
| Nền / mực | #F6F1E7 / #1D2B2A, chữ phụ #4A5856 |
| Bên mua, người được BH | xanh dương #2E6DA4 |
| Doanh nghiệp bảo hiểm (gốc, nhượng tái) | xanh lục #0F5C55 |
| DN nhận tái | nâu #8A5A2B |
| Tổn thất, rủi ro, điều sai | đỏ #B0302A (chỉ dùng cho điều tiêu cực) |
| Nhấn số liệu | vàng #E8A33D (một chỗ / slide) |
Không gradient, không ảnh làm nền chữ.

## Hình
- Ít, to, có tiêu điểm: tối đa 1 hình lớn hoặc 3 hình nhỏ / slide; không dán hình chỉ để trang trí.
- Cùng thước: người cao = 0,4 × toà nhà; nhà = 0,6 × toà nhà. Bên nào cũng mang màu của bên đó (viền / nền chip).
- Sơ đồ các bên ≤ 4 nút; nhãn đặt NGAY TRÊN mũi tên; luồng ngược chiều đi thành cặp song song (quy tắc 6, 7).
- Số liệu tỉ lệ (số thành, mức dôi, XL, stop loss) vẽ bằng thanh / cột đúng tỉ lệ, ghi số ngay trên thanh, vạch ngang gọi tên ngưỡng (quy tắc 8).

## 11 kiểu slide
| Mã | Kiểu | Bố cục |
|---|---|---|
| K1 | Mở chương | khối màu nền xanh lục 5 cột trái (số + tên phần, chữ trắng) · hình lớn 7 cột phải |
| K2 | Định nghĩa | câu định nghĩa lớn 7 cột trái (cỡ thân 36) · một hình lớn 5 cột phải · nguồn ở chân |
| K3 | Sơ đồ các bên | 2–4 nút ngang giữa slide; nút = hình + tên trong chip màu của bên; mũi tên cặp, nhãn trên mũi tên |
| K4 | So sánh hai | hai cột 6+6, cùng hàng tiêu chí, khác biệt tô màu nhấn |
| K5 | Bảng tra | bảng 12 cột, một hàng tô vàng, câu kết luận trên bảng |
| K6 | Thanh tỉ lệ | thanh / cột đúng tỉ lệ, số trên thanh, vạch ngưỡng có tên |
| K7 | Số lớn | 1–3 số cỡ trưng bày + nhãn nhỏ |
| K8 | Trích luật | thẻ trích nguyên văn (viền trái xanh lục) + số hiệu điều, khoản |
| K9 | Bài tập | đề 5 cột trái · bảng số 7 cột phải · câu hỏi đỏ cuối đề |
| K10 | Câu hỏi | câu hỏi cỡ tiêu đề · 4 phương án lưới 2×2 |
| K11 | Thở | một câu hoặc một con số, ≥ 60 % trống |

## Điều chỉnh theo mẫu bán slide (ref 18–33, 15/11/2026)
- **Tiêu đề ngắn ≤ 8 từ** (mẫu: 1–6 từ — ref 21, 29, 31). Ý khẳng định đầy đủ chuyển xuống câu dẫn (cỡ thân, ≤ 2 dòng). Ví dụ: "BHTM: chuyển rủi ro qua hợp đồng" thay "BHTM là chuyển giao rủi ro qua hợp đồng: bên mua trả phí, DNBH cam kết bồi thường".
- **Mở chương (K1)**: nền đảo màu (xanh lục đậm), số lớn "01" cỡ trưng bày màu vàng, tên phần, một dòng mô tả; ≥ 65 % trống; không hình (ref 19, 21, 29, 31).
- **Mục lục**: lưới 2×2, mỗi ô số "01–04" + tên phần + 1 dòng nội dung + số phút (ref 22, 28, 29).
- **Số thứ tự** dạng "01 · 02" cỡ nhãn, màu nhấn; **đường kẻ mảnh 2 px** ngăn khối thay cho thẻ nền trắng khi khối chỉ có chữ (ref 21, 23, 31). Thẻ trắng chỉ dùng khi cần tách nhóm trên nền có hình.
- **Bảng** ≤ 4 cột × 5 hàng, đầu cột nền đặc, một hàng tô; **thanh tỷ lệ** dày, phần tái bảo hiểm màu nhấn, phần còn lại xám nhạt, số ở đầu thanh (ref 26, 28, 33).
- Không: ảnh người stock, icon tô đặc nhiều màu, gradient / bóng sau chữ (ref 24, 32).

## Hệ nền (15/11/2026, theo references/he-nen.md của skill)
- **N1** kem #F6F1E7 + 4 hoạ tiết tự vẽ nhạt (`asset/tt-giay`, `tt-cham`, `tt-khoi`, `tt-luon`), mỗi hoạ tiết dùng 2 slide liền, góc đổi luân phiên trên-phải / dưới-phải — slide nội dung (27/47 = 57 %).
- **N2** xanh đậm #0F5C55: mở chương 01–04, kết, câu thở (2, 15, 29, 46), trích luật (12), số lớn p = f + d (27) — 11/47. Chữ trắng, nhấn vàng #E8A33D, nhãn nhỏ #F5CD8C.
- **N3** chia mảng: bìa (khối xanh trái), định nghĩa HĐBH (khối nhạt phải), dải tiêu đề #EBE2D0 cao 300 px cho slide trục / số liệu (6, 7, 22, 28, 34, 38, 39) — 9/47.

## Bộ trình bày dữ liệu (references/trinh-bay-du-lieu.md)
S10 T4 tick/cross (ô Có/Không tô màu) · S18 T5 hai thẻ song song · S26, S35 T2 chỉ kẻ ngang (S26 nhấn hàng “Dưới giá trị”) · S37 T1 đầu cột màu · S27 T9 số lớn · S34, S36, S38, S39 T13 thanh / cột đúng tỉ lệ · S3, S22 T11 hàng có ô số · S14 hai cột nối · S32 T12 ba bước có biểu tượng.
