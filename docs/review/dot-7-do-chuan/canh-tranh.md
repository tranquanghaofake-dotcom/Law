# Đợt 7 — độ chuẩn: canh-tranh

## Tình huống Phân biệt mới (haiku-1)

Thêm tình huống (câu `pair`) cho các khái niệm còn dưới 4 tình huống; mỗi tình huống có trường `basis` đối chiếu với `packages/content/data/laws/`.

Số khái niệm: 16; số tình huống thêm: 33.

| Khái niệm | Tình huống mới | Bên | Căn cứ |
|---|---|---|---|
| canh-tranh-khong-lanh-manh | Đánh cắp bí mật kinh doanh của đối thủ bằng cách phá vỡ biện pháp bảo mật | Trái: Cạnh tranh không lành mạnh | Điểm a khoản 1 Điều 45 Luật Cạnh tranh 2018 |
| canh-tranh-khong-lanh-manh | Hai doanh nghiệp cùng thỏa thuận ấn định giá bán sản phẩm cho khách hàng | Phải: Hạn chế cạnh tranh | Khoản 1 Điều 11 Luật Cạnh tranh 2018 |
| hanh-vi-cam-co-quan-nha-nuoc | Sở yêu cầu doanh nghiệp ngừng bán hàng cho các tỉnh khác trên địa bàn | Trái: Bị nghiêm cấm (Điều 8) | Điểm a khoản 1 Điều 8 Luật Cạnh tranh 2018 |
| hanh-vi-cam-co-quan-nha-nuoc | Cơ quan nhà nước dành ưu đãi riêng cho một doanh nghiệp và gây bất lợi cho doanh nghiệp còn lại | Trái: Bị nghiêm cấm (Điều 8) | Điểm b khoản 1 Điều 8 Luật Cạnh tranh 2018 |
| hanh-vi-cam-co-quan-nha-nuoc | Cơ quan nhà nước phổ biến pháp luật cạnh tranh để doanh nghiệp tự nguyện tuân thủ | Phải: Không bị cấm | Khoản 1 Điều 8 Luật Cạnh tranh 2018 (các điểm a–d không liệt kê hành vi này) |
| hanh-vi-canh-tranh-khong-lanh-manh-bi-cam | Nhân viên cũ mang danh sách khách hàng và công thức sản xuất của công ty cũ sang đối thủ để dùng | Phải: Xâm phạm thông tin bí mật kinh doanh | Điểm b khoản 1 Điều 45 Luật Cạnh tranh 2018 |
| hanh-vi-canh-tranh-khong-lanh-manh-bi-cam | Cử người đến trước cửa hàng đối thủ gây rối để khách không vào mua hàng | Trái: Gây rối hoạt động kinh doanh | Khoản 4 Điều 45 Luật Cạnh tranh 2018 |
| hanh-vi-han-che-canh-tranh | Hai doanh nghiệp cùng thỏa thuận phân chia khu vực tiêu thụ sản phẩm | Trái: Hành vi hạn chế cạnh tranh | Khoản 2 Điều 11 Luật Cạnh tranh 2018 |
| hanh-vi-han-che-canh-tranh | Đưa thông tin không trung thực về doanh nghiệp khác làm giảm uy tín của họ | Phải: Hành vi cạnh tranh không lành mạnh | Khoản 3 Điều 45 Luật Cạnh tranh 2018 |
| lam-dung-vi-tri-thong-linh | Doanh nghiệp thống lĩnh bán dưới giá thành toàn bộ để loại đối thủ khỏi thị trường | Trái: Lạm dụng vị trí thống lĩnh | Điểm a khoản 1 Điều 27 Luật Cạnh tranh 2018 |
| lam-dung-vi-tri-thong-linh | Doanh nghiệp thống lĩnh bỏ vốn mở rộng nhà máy để tăng nguồn cung cho thị trường | Phải: Hành vi kinh doanh bình thường | Điều 27 Luật Cạnh tranh 2018 (các điểm a–g khoản 1 không liệt kê hành vi này) |
| mien-tru-thoa-thuan | Các nhà sản xuất hợp tác để nâng cao chất lượng và tiến bộ kỹ thuật của sản phẩm | Trái: Có thể được miễn trừ | Điểm a khoản 1 Điều 14 Luật Cạnh tranh 2018 |
| mien-tru-thoa-thuan | Các doanh nghiệp cùng thỏa thuận để một bên thắng thầu trong gói thầu cung cấp thiết bị | Phải: Không thể được miễn trừ | Khoản 4 Điều 11 và khoản 1 Điều 14 Luật Cạnh tranh 2018 |
| pham-vi-dieu-chinh-luat-canh-tranh | Các doanh nghiệp cùng thỏa thuận phân chia thị trường tiêu thụ giữa các bên | Trái: Chống hạn chế cạnh tranh | Khoản 2 Điều 11 và Điều 1 Luật Cạnh tranh 2018 |
| pham-vi-dieu-chinh-luat-canh-tranh | Lôi kéo khách hàng bằng thông tin gian dối về điều kiện giao dịch của doanh nghiệp | Phải: Chống cạnh tranh không lành mạnh | Điểm a khoản 5 Điều 45 và Điều 1 Luật Cạnh tranh 2018 |
| tap-trung-kinh-te | Công ty X chuyển toàn bộ tài sản và nghĩa vụ sang công ty Y rồi không còn hoạt động nữa | Trái: Sáp nhập | Khoản 2 Điều 29 Luật Cạnh tranh 2018 |
| tap-trung-kinh-te | Hai doanh nghiệp cùng góp một phần tài sản để thành lập một công ty mới chung | Phải: Liên doanh | Khoản 5 Điều 29 Luật Cạnh tranh 2018 |
| thi-phan | Tính tỷ lệ % số đơn vị hàng hóa mua vào của doanh nghiệp so với tổng mua vào của thị trường | Trái: Phương pháp xác định thị phần (khoản 1) | Điểm d khoản 1 Điều 10 Luật Cạnh tranh 2018 |
| thi-phan | Cộng thị phần của hai doanh nghiệp đang thỏa thuận hạn chế cạnh tranh với nhau | Phải: Thị phần kết hợp (khoản 2) | Khoản 2 Điều 10 Luật Cạnh tranh 2018 |
| thi-truong-lien-quan | Khách hàng dùng sữa đậu nành thay cho sữa bò vì cùng mục đích và giá gần nhau | Trái: Thị trường sản phẩm | Khoản 1 Điều 9 Luật Cạnh tranh 2018 |
| thi-truong-lien-quan | Cửa hàng ở hai khu vực cách xa nhau, điều kiện cạnh tranh khác biệt đáng kể | Phải: Thị trường địa lý | Khoản 1 Điều 9 Luật Cạnh tranh 2018 |
| thoa-thuan-han-che-canh-tranh-bi-cam | Các doanh nghiệp cùng thỏa thuận hạn chế số lượng sản phẩm đưa ra thị trường | Trái: Cấm tuyệt đối | Khoản 3 Điều 11 và khoản 1 Điều 12 Luật Cạnh tranh 2018 |
| thoa-thuan-han-che-canh-tranh-bi-cam | Thỏa thuận hạn chế đầu tư và phát triển công nghệ giữa các doanh nghiệp cùng thị trường | Phải: Chỉ cấm khi tác động đáng kể | Khoản 7 Điều 11 và khoản 3 Điều 12 Luật Cạnh tranh 2018 |
| thoa-thuan-han-che-canh-tranh | Các cửa hàng xăng cùng khu vực thống nhất mức giá bán lẻ xăng | Trái: Thỏa thuận ngang | Khoản 1 Điều 11 và khoản 1 Điều 12 Luật Cạnh tranh 2018 |
| thoa-thuan-han-che-canh-tranh | Nhà cung cấp quy định nhà phân phối ở công đoạn sau chỉ được bán trong khu vực đã định | Phải: Thỏa thuận dọc | Khoản 4 Điều 12 Luật Cạnh tranh 2018 |
| thong-bao-tap-trung-kinh-te | Tổng doanh thu trên thị trường Việt Nam của doanh nghiệp tham gia tập trung kinh tế | Trái: Tiêu chí ngưỡng thông báo | Điểm b khoản 2 Điều 33 Luật Cạnh tranh 2018 |
| thong-bao-tap-trung-kinh-te | Số năm doanh nghiệp tham gia đã hoạt động trong ngành | Phải: Không phải tiêu chí ngưỡng | Khoản 2 Điều 33 Luật Cạnh tranh 2018 (không liệt kê tiêu chí này) |
| uy-ban-canh-tranh-quoc-gia | Kiểm soát tập trung kinh tế và tiến hành tố tụng cạnh tranh | Trái: Ủy ban Cạnh tranh Quốc gia | Điểm b khoản 2 Điều 46 Luật Cạnh tranh 2018 |
| uy-ban-canh-tranh-quoc-gia | Điều tra viên thu thập chứng cứ và lấy lời khai trong vụ việc cạnh tranh | Phải: Cơ quan điều tra vụ việc cạnh tranh | Khoản 2 Điều 50 Luật Cạnh tranh 2018 |
| vi-tri-thong-linh-thi-truong | Hai doanh nghiệp cùng hành động hạn chế cạnh tranh, tổng thị phần 50% trên thị trường | Trái: Vị trí thống lĩnh | Điểm a khoản 2 Điều 24 Luật Cạnh tranh 2018 |
| vi-tri-thong-linh-thi-truong | Doanh nghiệp duy nhất khai thác nước sạch trong một đô thị, không đối thủ nào hoạt động | Phải: Vị trí độc quyền | Điều 25 Luật Cạnh tranh 2018 |
| xu-ly-vi-pham-canh-tranh | Doanh nghiệp thỏa thuận ấn định giá bán với đối thủ trên thị trường liên quan | Trái: Tối đa 10% doanh thu | Khoản 1 Điều 111 Luật Cạnh tranh 2018 |
| xu-ly-vi-pham-canh-tranh | Doanh nghiệp đăng quảng cáo so sánh sản phẩm của mình nhưng không chứng minh được nội dung | Phải: Tối đa 2 tỷ đồng | Khoản 3 Điều 111 và điểm b khoản 5 Điều 45 Luật Cạnh tranh 2018 |

## Giai đoạn 2 — cờ dò trích dẫn (haiku-1)

Cờ của môn (`audit/flags/canh-tranh.jsonl`): 2. Không có sửa nội dung.

**Báo nhầm / ngoài kho**
- `thong-bao-tap-trung-kinh-te#-1` — ngoài kho (Nghị định 35/2020/NĐ-CP, Điều 36): kho không có toàn văn, chưa kiểm được; giữ nguyên.

**⚠ opus**
- `hanh-vi-cam-co-quan-nha-nuoc#-1` (ví dụ khái niệm) — "Ủy ban nhân dân huyện ra văn bản đề nghị…": cấp huyện đã kết thúc hoạt động từ 01/7/2025 (chính quyền địa phương 2 cấp); ví dụ đang dùng như hiện hành. Cần viết lại ví dụ (thuật ngữ cũ — opus).

## Opus — chế định đổi từ 2025 (xem luat-doi-2025.md)

| id | câu/tình huống | trước → sau | căn cứ | ghi chú |
|---|---|---|---|---|
| hanh-vi-cam-co-quan-nha-nuoc (example) | Ví dụ cơ quan nhà nước ép trường học mua đồng phục | "Ủy ban nhân dân huyện ra văn bản…" → "Ủy ban nhân dân xã ra văn bản…" | khoản 1 Điều 1, khoản 3 Điều 51 Luật Tổ chức CQĐP 72/2025/QH15 (cấp huyện kết thúc 01/7/2025); điểm a khoản 1 Điều 8 Luật Cạnh tranh áp dụng mọi cơ quan nhà nước | Ý ví dụ không đổi |
