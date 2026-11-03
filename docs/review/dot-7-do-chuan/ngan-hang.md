# Đợt 7 — độ chuẩn: ngan-hang

## Tình huống Phân biệt mới (haiku-1)

Thêm tình huống (câu `pair`) cho các khái niệm còn dưới 4 tình huống; mỗi tình huống có trường `basis` đối chiếu với `packages/content/data/laws/`.

Số khái niệm: 21; số tình huống thêm: 42.

| Khái niệm | Tình huống mới | Bên | Căn cứ |
|---|---|---|---|
| bao-hiem-tien-gui | Chi nhánh ngân hàng nước ngoài tại Việt Nam nhận tiền gửi của cá nhân | Trái: Phải tham gia bảo hiểm tiền gửi | Khoản 3 Điều 4 và Điều 6 Luật Bảo hiểm tiền gửi 2025 |
| bao-hiem-tien-gui | Công ty tài chính không nhận tiền gửi của cá nhân, chỉ cho vay bằng nguồn vốn của mình | Phải: Không phải tham gia | Khoản 3 Điều 4 và Điều 6 Luật Bảo hiểm tiền gửi 2025 |
| bao-lanh-ngan-hang | Bên mua hàng được ngân hàng cam kết thanh toán thay nếu bên bán không giao hàng | Trái: Bên nhận bảo lãnh | Khoản 2 Điều 4 Luật Các tổ chức tín dụng 2024 |
| bao-lanh-ngan-hang | Doanh nghiệp được ngân hàng bảo lãnh nghĩa vụ hợp đồng với đối tác và phải hoàn trả ngân hàng khi được trả thay | Phải: Khách hàng (bên được bảo lãnh) | Khoản 2 và khoản 4 Điều 4 Luật Các tổ chức tín dụng 2024 |
| bao-thanh-toan | Ngân hàng ứng trước tiền thanh toán thay cho bên mua theo hợp đồng mua bán hàng hóa | Trái: Bao thanh toán | Khoản 1 Điều 4 Luật Các tổ chức tín dụng 2024 |
| bao-thanh-toan | Ngân hàng mua trái phiếu của doanh nghiệp trước khi đến hạn, có bảo lưu quyền truy đòi | Phải: Chiết khấu | Khoản 6 Điều 4 Luật Các tổ chức tín dụng 2024 |
| cap-tin-dung | Ngân hàng phát hành thư tín dụng cho doanh nghiệp để nhập khẩu hàng hóa | Trái: Cấp tín dụng | Khoản 4 Điều 4 Luật Các tổ chức tín dụng 2024 |
| cap-tin-dung | Ngân hàng nhận tiền gửi không kỳ hạn của doanh nghiệp để giữ thanh khoản | Phải: Huy động vốn | Khoản 27 Điều 4 Luật Các tổ chức tín dụng 2024 |
| chiet-khau | Ngân hàng mua kỳ phiếu của doanh nghiệp trước khi đến hạn, có quyền truy đòi người bán | Trái: Chiết khấu | Khoản 6 Điều 4 Luật Các tổ chức tín dụng 2024 |
| chiet-khau | Ngân hàng ứng trước tiền cho doanh nghiệp bán hàng, thanh toán thay cho bên mua theo hợp đồng mua bán | Phải: Bao thanh toán | Khoản 1 Điều 4 Luật Các tổ chức tín dụng 2024 |
| chinh-sach-tien-te-quoc-gia | Quốc hội quyết định chỉ số giá tiêu dùng và giám sát việc thực hiện chính sách tiền tệ | Trái: Quốc hội | Khoản 2 Điều 3 Luật Ngân hàng Nhà nước 2010 |
| chinh-sach-tien-te-quoc-gia | Thống đốc quyết định dùng công cụ dự trữ bắt buộc để điều tiết tiền tệ | Phải: Thủ tướng Chính phủ, Thống đốc Ngân hàng Nhà nước | Khoản 4 Điều 3 và Điều 10 Luật Ngân hàng Nhà nước 2010 |
| cho-vay | Ngân hàng cho doanh nghiệp vay trong một thời gian nhất định, trả đủ gốc và lãi theo thỏa thuận | Trái: Cho vay | Khoản 7 Điều 4 Luật Các tổ chức tín dụng 2024 |
| cho-vay | Ngân hàng mua tài sản cho doanh nghiệp thuê, doanh nghiệp trả tiền thuê định kỳ | Phải: Bao thanh toán | Khoản 4 Điều 4 Luật Các tổ chức tín dụng 2024 (cho thuê tài chính là nghiệp vụ khác cho vay) |
| cong-cu-chinh-sach-tien-te | Ngân hàng Nhà nước quy định lãi suất tái cấp vốn cho tổ chức tín dụng | Trái: Công cụ chính sách tiền tệ | Điều 10 Luật Ngân hàng Nhà nước 2010 (tái cấp vốn, lãi suất) |
| cong-cu-chinh-sach-tien-te | Nhà nước tăng chi ngân sách cho công trình hạ tầng giao thông | Phải: Công cụ chính sách tài khóa (thuế, chi ngân sách) | Điều 10 Luật Ngân hàng Nhà nước 2010 (không liệt kê chi ngân sách) |
| dich-vu-thanh-toan-qua-tai-khoan | Ngân hàng thực hiện nhờ thu theo đề nghị của khách hàng qua tài khoản thanh toán | Trái: Thanh toán qua tài khoản | Khoản 14 Điều 4 Luật Các tổ chức tín dụng 2024 |
| dich-vu-thanh-toan-qua-tai-khoan | Đơn vị trung gian không mở tài khoản cho khách, chỉ truyền dẫn dữ liệu lệnh thanh toán | Phải: Dịch vụ trung gian thanh toán | Khoản 10 Điều 6 Luật Ngân hàng Nhà nước 2010 |
| dich-vu-trung-gian-thanh-toan | Công ty kết nối và xử lý dữ liệu giao dịch thanh toán giữa ngân hàng và người bán | Trái: Dịch vụ trung gian thanh toán | Khoản 10 Điều 6 Luật Ngân hàng Nhà nước 2010 |
| dich-vu-trung-gian-thanh-toan | Ngân hàng nhận lệnh chi từ tài khoản thanh toán của khách để trả tiền cho nhà cung cấp | Phải: Dịch vụ thanh toán qua tài khoản | Khoản 14 Điều 4 Luật Các tổ chức tín dụng 2024 |
| giay-to-co-gia | Kỳ phiếu ngân hàng ghi nhận nghĩa vụ trả nợ kèm lãi suất theo kỳ hạn | Trái: Giấy tờ có giá (xác nhận nghĩa vụ trả nợ) | Khoản 8 Điều 6 Luật Ngân hàng Nhà nước 2010 |
| giay-to-co-gia | Giấy chứng nhận quyền sở hữu nhà ở, không ghi nhận nghĩa vụ trả nợ | Phải: Không phải (xác nhận quyền sở hữu) | Khoản 8 Điều 6 Luật Ngân hàng Nhà nước 2010 (không xác nhận nghĩa vụ trả nợ) |
| hoat-dong-ngan-hang | Doanh nghiệp thường xuyên nhận tiền gửi của khách hàng và trả lãi theo kỳ hạn | Trái: Hoạt động ngân hàng | Khoản 17 Điều 4 Luật Các tổ chức tín dụng 2024 |
| hoat-dong-ngan-hang | Doanh nghiệp mua hàng của nhà cung cấp rồi bán lại cho khách, không cấp tín dụng và không nhận tiền gửi | Phải: Không phải hoạt động ngân hàng | Khoản 17 Điều 4 Luật Các tổ chức tín dụng 2024 |
| hoat-dong-ngoai-hoi | Doanh nghiệp Việt vay tiền từ ngân hàng nước ngoài và trả nợ gốc theo hợp đồng vay | Trái: Giao dịch vốn | Điểm c khoản 4 Điều 4 Pháp lệnh Ngoại hối 2005 |
| hoat-dong-ngoai-hoi | Người cư trú trả phí tư vấn cho công ty nước ngoài, không nhằm mục đích chuyển vốn | Phải: Giao dịch vãng lai | Khoản 5 Điều 4 Pháp lệnh Ngoại hối 2005 |
| kiem-soat-dac-biet | Ngân hàng Nhà nước yêu cầu tổ chức tín dụng hạn chế một số hoạt động để khắc phục rủi ro | Trái: Can thiệp sớm | Khoản 3 Điều 4 Luật Các tổ chức tín dụng 2024 |
| kiem-soat-dac-biet | Ngân hàng Nhà nước quyết định đưa một tổ chức tín dụng vào sự kiểm soát trực tiếp của mình | Phải: Kiểm soát đặc biệt | Khoản 19 Điều 4 Luật Các tổ chức tín dụng 2024 |
| ngan-hang-nha-nuoc | Ban hành văn bản quy phạm pháp luật về tiền tệ và ngân hàng | Trái: Chức năng quản lý nhà nước | Khoản 4 Điều 4 Luật Ngân hàng Nhà nước 2010 |
| ngan-hang-nha-nuoc | Cho tổ chức tín dụng vay tái cấp vốn để ổn định thanh khoản | Phải: Chức năng ngân hàng trung ương | Điều 11 Luật Ngân hàng Nhà nước 2010 |
| ngan-hang | Ngân hàng thực hiện hoạt động ngân hàng và hoạt động kinh doanh khác nhằm mục tiêu lợi nhuận | Trái: Ngân hàng thương mại | Khoản 23 Điều 4 Luật Các tổ chức tín dụng 2024 |
| ngan-hang | Ngân hàng do các quỹ tín dụng nhân dân và pháp nhân khác góp vốn thành lập | Phải: Ngân hàng hợp tác xã | Khoản 22 Điều 4 Luật Các tổ chức tín dụng 2024 |
| ngoai-hoi | Ngoại tệ tiền mặt bằng đô la Mỹ mang theo khi xuất cảnh | Trái: Là ngoại hối | Điểm a khoản 1 Điều 4 Pháp lệnh Ngoại hối 2005 |
| ngoai-hoi | Đồng Việt Nam dùng để thanh toán giữa hai cá nhân trong nước, không chuyển ra khỏi lãnh thổ | Phải: Không phải ngoại hối | Điểm đ khoản 1 Điều 4 Pháp lệnh Ngoại hối 2005 |
| nhan-tien-gui | Ngân hàng nhận tiền không kỳ hạn của khách và phát hành chứng chỉ tiền gửi | Trái: Nhận tiền gửi | Khoản 27 Điều 4 Luật Các tổ chức tín dụng 2024 |
| nhan-tien-gui | Công ty cho thuê máy móc thu tiền thuê theo tháng, không nhận tiền gửi của khách | Phải: Không phải nhận tiền gửi | Khoản 27 Điều 4 Luật Các tổ chức tín dụng 2024 (không thuộc nhận tiền gửi) |
| tien-gui-duoc-bao-hiem | Tiền gửi tiết kiệm có kỳ hạn bằng đồng Việt Nam của cá nhân tại ngân hàng thương mại | Trái: Được bảo hiểm | Điều 17 Luật Bảo hiểm tiền gửi 2025 |
| tien-gui-duoc-bao-hiem | Tiền gửi của cá nhân sở hữu trên 5% vốn điều lệ của chính ngân hàng nhận tiền gửi | Phải: Không được bảo hiểm | Khoản 1 Điều 18 Luật Bảo hiểm tiền gửi 2025 |
| to-chuc-tin-dung-phi-ngan-hang | Ngân hàng thương mại nhận tiền gửi tiết kiệm của cá nhân | Trái: Ngân hàng thương mại được làm | Khoản 41 Điều 4 Luật Các tổ chức tín dụng 2024 (ngoại lệ đối với ngân hàng) |
| to-chuc-tin-dung-phi-ngan-hang | Công ty tài chính cung ứng dịch vụ thanh toán qua tài khoản cho khách hàng | Phải: Tổ chức tín dụng phi ngân hàng không được làm | Khoản 41 Điều 4 Luật Các tổ chức tín dụng 2024 |
| to-chuc-tin-dung | Ngân hàng thương mại cổ phần được thành lập và hoạt động theo Luật Các tổ chức tín dụng | Trái: Tổ chức tín dụng | Khoản 38 Điều 4 Luật Các tổ chức tín dụng 2024 |
| to-chuc-tin-dung | Công ty cổ phần sản xuất bánh kẹo đăng ký kinh doanh theo Luật Doanh nghiệp | Phải: Không phải tổ chức tín dụng | Khoản 38 Điều 4 Luật Các tổ chức tín dụng 2024 |
