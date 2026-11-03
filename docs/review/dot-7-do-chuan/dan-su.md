# Đợt 7 — độ chuẩn: dan-su

## Tình huống Phân biệt mới (haiku-1)

Thêm tình huống (câu `pair`) cho các khái niệm còn dưới 4 tình huống; mỗi tình huống có trường `basis` đối chiếu với `packages/content/data/laws/`.

Số khái niệm: 24; số tình huống thêm: 39.

| Khái niệm | Tình huống mới | Bên | Căn cứ |
|---|---|---|---|
| bao-ve-quyen-so-huu | Chủ nhà đặt biển cấm và rào chắn hợp pháp để ngăn người lạ vào đất của mình | Trái: Tự bảo vệ | Khoản 1 Điều 164 Bộ luật Dân sự 2015 |
| bao-ve-quyen-so-huu | Chủ đất làm đơn yêu cầu Tòa án buộc người chiếm giữ trái phép trả lại đất | Phải: Yêu cầu cơ quan có thẩm quyền bảo vệ | Khoản 2 Điều 164 Bộ luật Dân sự 2015 |
| bat-dong-san-dong-san | Căn hộ chung cư đã được cấp giấy chứng nhận quyền sở hữu | Trái: Bất động sản | Điểm b khoản 1 Điều 107 Bộ luật Dân sự 2015 |
| bat-dong-san-dong-san | Máy móc đặt rời, không gắn liền với đất đai hay nhà ở | Phải: Động sản | Khoản 2 Điều 107 Bộ luật Dân sự 2015 |
| chiem-huu | Người mua xe từ người bán có giấy tờ hợp lệ, không biết xe là tài sản bị lấy trộm | Trái: Chiếm hữu ngay tình | Khoản 1 Điều 180 Bộ luật Dân sự 2015 |
| chiem-huu | Người nhặt được điện thoại, biết rõ chủ là ai nhưng cố tình giữ lại | Phải: Chiếm hữu không ngay tình | Khoản 2 Điều 180 Bộ luật Dân sự 2015 |
| dai-dien | Người giám hộ thay mặt người được giám hộ là người mất năng lực hành vi dân sự | Trái: Đại diện theo pháp luật | Khoản 1 Điều 134 Bộ luật Dân sự 2015 |
| dai-dien | Người được chủ doanh nghiệp ủy quyền ký hợp đồng, nhân danh chủ doanh nghiệp | Phải: Đại diện theo ủy quyền | Khoản 1 Điều 134 Bộ luật Dân sự 2015 (đại diện theo ủy quyền) |
| di-chuc | Di chúc bằng văn bản không có chữ ký hoặc điểm chỉ của người lập | Phải: Điều kiện về nội dung, hình thức | Khoản 1 Điều 630 Bộ luật Dân sự 2015 |
| dieu-kien-hieu-luc-giao-dich | Người xác lập giao dịch có năng lực hành vi dân sự phù hợp với giao dịch đó | Trái: Điều kiện luôn bắt buộc | Điểm a khoản 1 Điều 117 Bộ luật Dân sự 2015 |
| dieu-kien-hieu-luc-giao-dich | Giao dịch chuyển nhượng bất động sản phải lập thành văn bản theo quy định của luật | Phải: Điều kiện chỉ bắt buộc khi luật quy định | Khoản 2 Điều 117 Bộ luật Dân sự 2015 |
| giao-dich-dan-su | Hai doanh nghiệp ký hợp đồng cho thuê kho bãi và thỏa thuận giá thuê | Trái: Hợp đồng | Điều 116 Bộ luật Dân sự 2015 |
| giao-dich-dan-su | Người sở hữu công bố từ bỏ quyền sở hữu ngôi nhà bỏ hoang của mình | Phải: Hành vi pháp lý đơn phương | Điều 116 Bộ luật Dân sự 2015 (hành vi pháp lý đơn phương) |
| giao-dich-vo-hieu-gia-tao | Thỏa thuận thuê người đe dọa tính mạng để buộc con nợ trả tiền | Trái: Vô hiệu do vi phạm điều cấm | Điều 123 Bộ luật Dân sự 2015 |
| giao-dich-vo-hieu-gia-tao | Giao dịch mua bán chất ma túy giữa hai người | Trái: Vô hiệu do vi phạm điều cấm | Điều 123 Bộ luật Dân sự 2015 |
| nang-luc-hanh-vi-dan-su | Người nghiện chất kích thích làm phá tán tài sản của gia đình, có yêu cầu của người liên quan | Phải: Hạn chế năng lực hành vi (Điều 24) | Khoản 1 Điều 24 Bộ luật Dân sự 2015 |
| nang-luc-phap-luat-dan-su | Người 5 tuổi không tự mình xác lập giao dịch mua bán tài sản có giá trị | Phải: Năng lực hành vi dân sự | Khoản 2 Điều 21 Bộ luật Dân sự 2015 |
| nguoi-chua-thanh-nien | Người 15 tuổi mua vé xe buýt phục vụ việc đi học hằng ngày | Phải: Tự mình xác lập được | Khoản 3 Điều 21 Bộ luật Dân sự 2015 |
| nguoi-thua-ke-khong-phu-thuoc-di-chuc | Cháu ruột đã thành niên, có khả năng lao động của người lập di chúc | Phải: Không thuộc diện Điều 644 | Khoản 1 Điều 644 Bộ luật Dân sự 2015 |
| nguyen-tac-co-ban-luat-dan-su | Mọi cá nhân được đối xử bình đẳng khi tham gia giao dịch, không phân biệt giới tính | Trái: Bình đẳng (khoản 1) | Khoản 1 Điều 3 Bộ luật Dân sự 2015 |
| nguyen-tac-co-ban-luat-dan-su | Các bên tự quyết định nội dung hợp đồng cho thuê nhà, miễn là không trái luật | Phải: Tự do thỏa thuận (khoản 2) | Khoản 2 Điều 3 Bộ luật Dân sự 2015 |
| pham-vi-dieu-chinh-luat-dan-su | Việc cấp giấy phép lái xe của cơ quan công an | Phải: Không phải quan hệ dân sự | Điều 1 Bộ luật Dân sự 2015 (quan hệ hành chính không thuộc phạm vi dân sự) |
| phap-nhan | Hộ kinh doanh cá thể đăng ký tại cơ quan thuế | Phải: Không có tư cách pháp nhân | Khoản 1 Điều 74 Bộ luật Dân sự 2015 |
| quyen-khac-doi-voi-tai-san | Quyền đặt đường ống dẫn nước qua đất của hàng xóm theo thỏa thuận | Trái: Quyền đối với bất động sản liền kề | Điểm a khoản 2 Điều 159 Bộ luật Dân sự 2015 |
| quyen-khac-doi-voi-tai-san | Người được xây nhà trên mặt đất thuộc quyền sử dụng của người khác, trong thời hạn đã thỏa thuận | Phải: Quyền bề mặt | Điểm c khoản 2 Điều 159 Bộ luật Dân sự 2015 |
| quyen-so-huu | Chủ nhà tự ở và sử dụng căn nhà của mình | Trái: Quyền sử dụng | Điều 158 Bộ luật Dân sự 2015 |
| quyen-thua-ke | Ngày người để lại di sản qua đời | Trái: Thời điểm mở thừa kế | Khoản 1 Điều 611 Bộ luật Dân sự 2015 |
| quyen-thua-ke | Ngày Tòa án tuyên bố người mất tích là đã chết | Trái: Thời điểm mở thừa kế | Khoản 1 Điều 611 Bộ luật Dân sự 2015 |
| tai-san | Chiếc tủ lạnh đang nằm trong nhà của bạn | Trái: Tài sản hiện có | Điều 105 Bộ luật Dân sự 2015 |
| tai-san | Mùa vụ lúa chưa gieo trồng, bên mua đặt trước việc mua toàn bộ sản lượng | Phải: Tài sản hình thành trong tương lai | Khoản 2 Điều 108 Bộ luật Dân sự 2015 |
| thoi-hieu-thua-ke | Yêu cầu chia di sản là chiếc xe ô tô của người đã chết | Trái: Thời hiệu 10 năm | Khoản 1 Điều 623 Bộ luật Dân sự 2015 |
| thoi-hieu-thua-ke | Yêu cầu chia thửa đất của người đã chết | Phải: Thời hiệu 30 năm | Khoản 1 Điều 623 Bộ luật Dân sự 2015 |
| thoi-hieu | Hết thời hạn luật định, chủ thể được hưởng quyền dân sự khi đã đáp ứng đủ điều kiện | Trái: Thời hiệu hưởng quyền dân sự | Khoản 1 Điều 149 Bộ luật Dân sự 2015 |
| thoi-hieu | Người có nghĩa vụ dân sự được miễn thực hiện nghĩa vụ khi hết thời hạn do luật quy định | Phải: Thời hiệu miễn trừ nghĩa vụ dân sự | Khoản 2 Điều 149 Bộ luật Dân sự 2015 |
| thua-ke-the-vi | Cháu nội được hưởng phần di sản của cha đã chết trước ông nội | Trái: Có thừa kế thế vị | Điều 652 Bộ luật Dân sự 2015 |
| thua-ke-the-vi | Cháu của người để lại di sản khi cha của cháu vẫn còn sống | Phải: Không có thừa kế thế vị | Điều 652 Bộ luật Dân sự 2015 |
| thua-ke-theo-phap-luat | Vợ của người đã chết, hưởng theo hàng thừa kế thứ nhất | Trái: Hàng thừa kế thứ nhất | Điểm a khoản 1 Điều 651 Bộ luật Dân sự 2015 |
| xac-lap-quyen-so-huu-theo-thoi-hieu | Người chiếm hữu ngay tình, công khai chiếc xe máy trong 10 năm, không ai tranh chấp | Trái: Động sản | Điều 236 Bộ luật Dân sự 2015 |
| xac-lap-quyen-so-huu-theo-thoi-hieu | Người chiếm hữu ngay tình, công khai và liên tục một thửa đất trong 30 năm | Phải: Bất động sản | Điều 236 Bộ luật Dân sự 2015 |

⚠ haiku-1 (ghi chú, chưa sửa): khái niệm `tai-san` — căn cứ tình huống "tài sản hình thành trong tương lai" là Điều 108 BLDS 2015, còn nguồn ghi Điều 105; khái niệm `chiem-huu` — định nghĩa chiếm hữu ngay tình/không ngay tình ở Điều 180, nguồn ghi khoản 1, 2 Điều 179. Để opus/công cụ dò xem.
