# Đợt 7 — độ chuẩn: dau-tu

## Tình huống Phân biệt mới (haiku-1)

Thêm tình huống (câu `pair`) cho các khái niệm còn dưới 4 tình huống; mỗi tình huống có trường `basis` đối chiếu với `packages/content/data/laws/`.

Số khái niệm: 19; số tình huống thêm: 38.

| Khái niệm | Tình huống mới | Bên | Căn cứ |
|---|---|---|---|
| ldt-bao-dam-khi-thay-doi-phap-luat | Văn bản mới quy định ưu đãi đầu tư cao hơn, nhà đầu tư được hưởng cho thời gian ưu đãi còn lại | Trái: Hưởng theo văn bản mới | Khoản 1 Điều 12 Luật Đầu tư 2025 |
| ldt-bao-dam-khi-thay-doi-phap-luat | Văn bản mới quy định ưu đãi thấp hơn, nhà đầu tư vẫn áp dụng ưu đãi cũ đến hết thời gian ưu đãi | Phải: Hưởng theo quy định trước đó | Khoản 2 Điều 12 Luật Đầu tư 2025 |
| ldt-bao-dam-quyen-so-huu-tai-san | Tịch thu nhà máy hợp pháp của nhà đầu tư bằng quyết định hành chính | Trái: Bị cấm theo Điều 9 | Khoản 1 Điều 9 Luật Đầu tư 2025 |
| ldt-bao-dam-quyen-so-huu-tai-san | Nhà nước trưng mua đất của nhà đầu tư để phục vụ quốc phòng và thanh toán cho nhà đầu tư | Phải: Được phép kèm bồi thường | Khoản 2 Điều 9 Luật Đầu tư 2025 |
| ldt-chap-thuan-chu-truong-dau-tu | Cơ quan nhà nước đồng ý về quy mô và tiến độ dự án trước khi nhà đầu tư triển khai | Trái: Chấp thuận chủ trương đầu tư | Khoản 1 Điều 3 Luật Đầu tư 2025 |
| ldt-chap-thuan-chu-truong-dau-tu | Cơ quan đăng ký đầu tư cấp văn bản ghi nhận dự án sau khi nhà đầu tư đăng ký | Phải: Giấy chứng nhận đăng ký đầu tư | Khoản 11 Điều 3 Luật Đầu tư 2025 |
| ldt-chuyen-nhuong-du-an | Nhà đầu tư chuyển nhượng một phần dự án cho nhà đầu tư trong nước, đủ điều kiện pháp luật | Trái: Được chuyển nhượng | Khoản 1 Điều 34 Luật Đầu tư 2025 |
| ldt-chuyen-nhuong-du-an | Nhà đầu tư nước ngoài nhận chuyển nhượng dự án nhưng không đáp ứng điều kiện của khoản 2 Điều 21 | Phải: Không được chuyển nhượng | Điểm b khoản 1 Điều 34 Luật Đầu tư 2025 |
| ldt-dau-tu-kinh-doanh | Cá nhân bỏ vốn mua máy móc để mở xưởng sản xuất bánh kẹo nhằm bán hàng thu lợi | Trái: Đầu tư kinh doanh theo Luật Đầu tư | Khoản 8 Điều 3 Luật Đầu tư 2025 |
| ldt-dau-tu-kinh-doanh | Cá nhân cho bạn vay tiền để phục vụ tiêu dùng gia đình, không nhằm hoạt động sản xuất kinh doanh | Phải: Không thuộc Luật Đầu tư | Khoản 8 Điều 3 Luật Đầu tư 2025 |
| ldt-dieu-kien-dau-tu-kinh-doanh | Trụ sở và phương tiện theo quy định của pháp luật để kinh doanh ngành nghề có điều kiện | Trái: Là điều kiện đầu tư kinh doanh | Khoản 9 Điều 3 Luật Đầu tư 2025 |
| ldt-dieu-kien-dau-tu-kinh-doanh | Doanh nghiệp tự đặt quy định nội bộ về màu sắc đồng phục của nhân viên | Phải: Không phải điều kiện đầu tư kinh doanh | Khoản 9 Điều 3 Luật Đầu tư 2025 (điều kiện do pháp luật quy định) |
| ldt-du-an-dau-tu | Kế hoạch bỏ vốn dài hạn để kinh doanh tại một địa bàn trong khoảng thời gian xác định | Trái: Dấu hiệu của dự án đầu tư | Khoản 4 Điều 3 Luật Đầu tư 2025 |
| ldt-du-an-dau-tu | Mua bán hàng theo từng hợp đồng ngắn hạn, không có kế hoạch bỏ vốn trung hạn hoặc dài hạn | Phải: Không phải dấu hiệu | Khoản 4 Điều 3 Luật Đầu tư 2025 |
| ldt-giay-chung-nhan-dang-ky-dau-tu | Nhà đầu tư nước ngoài thực hiện dự án đầu tư mới tại Việt Nam | Trái: Phải cấp Giấy chứng nhận đăng ký đầu tư | Điểm a khoản 1 Điều 26 Luật Đầu tư 2025 |
| ldt-giay-chung-nhan-dang-ky-dau-tu | Doanh nghiệp trong nước mua 15% cổ phần của một công ty cổ phần khác, không thực hiện dự án mới | Phải: Không phải cấp | Khoản 1 Điều 26 Luật Đầu tư 2025 (không thuộc các trường hợp liệt kê) |
| ldt-hinh-thuc-dau-tu | Doanh nghiệp góp vốn, mua cổ phần của một công ty đang hoạt động | Trái: Hình thức đầu tư theo Điều 18 | Khoản 2 Điều 18 Luật Đầu tư 2025 |
| ldt-hinh-thuc-dau-tu | Cá nhân mua nhà ở để làm nơi ở cho gia đình | Phải: Không phải hình thức đầu tư | Điều 18 Luật Đầu tư 2025 (không liệt kê hình thức này) |
| ldt-hoat-dong-dau-tu-ra-nuoc-ngoai | Doanh nghiệp Việt ký hợp đồng hợp tác kinh doanh với đối tác ở Campuchia và chia sản phẩm | Trái: Hình thức đầu tư ra nước ngoài | Điểm b khoản 1 Điều 39 Luật Đầu tư 2025 |
| ldt-hoat-dong-dau-tu-ra-nuoc-ngoai | Doanh nghiệp Việt nhập khẩu hàng từ Thái Lan để bán trong nước, không chuyển vốn ra nước ngoài | Phải: Không phải | Khoản 13 Điều 3 Luật Đầu tư 2025 |
| ldt-hop-dong-bcc | Hai nhà đầu tư trong nước thỏa thuận phân chia lợi nhuận từ một dự án chung theo hợp đồng | Trái: Hợp đồng BCC | Khoản 14 Điều 3 và Điều 22 Luật Đầu tư 2025 |
| ldt-hop-dong-bcc | Nhà đầu tư góp vốn lập công ty cổ phần mới để cùng kinh doanh | Phải: Thành lập tổ chức kinh tế | Khoản 1 Điều 18 Luật Đầu tư 2025 |
| ldt-khu-cong-nghiep | Nhà máy chế biến thủy sản xuất khẩu nằm trong khu vực có ranh giới xác định, chuyên sản xuất công nghiệp | Trái: Phù hợp chức năng khu công nghiệp | Khoản 16 Điều 3 Luật Đầu tư 2025 |
| ldt-khu-cong-nghiep | Khu đô thị có nhà ở, trường học và công viên cho dân cư | Phải: Không phù hợp | Khoản 16 Điều 3 Luật Đầu tư 2025 (không chuyên sản xuất công nghiệp) |
| ldt-khu-kinh-te | Vùng có nhiều khu chức năng như cảng, dịch vụ tài chính và nhà ở, thành lập để thu hút đầu tư | Trái: Khu kinh tế | Khoản 17 Điều 3 Luật Đầu tư 2025 |
| ldt-khu-kinh-te | Khu vực có ranh giới xác định, chuyên sản xuất hàng xuất khẩu và dịch vụ phục vụ xuất khẩu | Phải: Khu công nghiệp | Khoản 15 Điều 3 Luật Đầu tư 2025 |
| ldt-nha-dau-tu-nuoc-ngoai | Tổ chức thành lập theo pháp luật Singapore thực hiện hoạt động đầu tư kinh doanh tại Việt Nam | Trái: Nhà đầu tư nước ngoài | Khoản 19 Điều 3 Luật Đầu tư 2025 |
| ldt-nha-dau-tu-nuoc-ngoai | Cá nhân mang quốc tịch Việt Nam đầu tư mở quán cà phê tại Đà Nẵng | Phải: Không phải nhà đầu tư nước ngoài | Khoản 20 Điều 3 Luật Đầu tư 2025 |
| ldt-nha-dau-tu | Công ty cổ phần Việt Nam không có cổ đông là nhà đầu tư nước ngoài | Trái: Nhà đầu tư trong nước | Khoản 20 Điều 3 Luật Đầu tư 2025 |
| ldt-nha-dau-tu | Cá nhân mang quốc tịch nước ngoài thực hiện đầu tư kinh doanh tại Việt Nam | Phải: Nhà đầu tư nước ngoài | Khoản 19 Điều 3 Luật Đầu tư 2025 |
| ldt-to-chuc-kinh-te-co-von-dtnn | Công ty hợp danh có đa số thành viên hợp danh là cá nhân nước ngoài | Trái: Đầu tư tiếp theo thủ tục nhà đầu tư nước ngoài | Điểm a khoản 1 Điều 20 Luật Đầu tư 2025 |
| ldt-to-chuc-kinh-te-co-von-dtnn | Công ty cổ phần có nhà đầu tư nước ngoài sở hữu 30% vốn điều lệ | Phải: Theo thủ tục nhà đầu tư trong nước | Điểm a khoản 1 Điều 20 Luật Đầu tư 2025 (dưới 50% vốn điều lệ) |
| ldt-to-chuc-kinh-te | Công ty cổ phần được thành lập theo Luật Doanh nghiệp tại Việt Nam | Trái: Tổ chức kinh tế theo Luật Đầu tư | Khoản 21 Điều 3 Luật Đầu tư 2025 |
| ldt-to-chuc-kinh-te | Công ty được thành lập theo pháp luật Lào và hoạt động trên lãnh thổ Việt Nam | Phải: Không phải tổ chức kinh tế | Khoản 21 Điều 3 Luật Đầu tư 2025 (thành lập theo pháp luật Việt Nam) |
| ldt-uu-dai-dau-tu | Được miễn, giảm tiền thuê đất cho dự án đầu tư thuộc ngành nghề ưu đãi | Trái: Ưu đãi đầu tư | Điểm c khoản 2 Điều 14 Luật Đầu tư 2025 |
| ldt-uu-dai-dau-tu | Được đào tạo nhân lực do Nhà nước tổ chức theo chương trình của dự án | Phải: Hỗ trợ đầu tư | Điểm b khoản 3 Điều 14 Luật Đầu tư 2025 |
| ldt-von-dau-tu | Tiền mặt và máy móc do nhà đầu tư góp để thực hiện dự án | Trái: Có thể là vốn đầu tư | Khoản 23 Điều 3 Luật Đầu tư 2025 |
| ldt-von-dau-tu | Công sức và kinh nghiệm quản lý của người điều hành, không được định giá thành tiền | Phải: Không phải vốn đầu tư | Khoản 23 Điều 3 Luật Đầu tư 2025 (không phải tiền hoặc tài sản) |
