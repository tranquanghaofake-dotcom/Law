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

## Câu hỏi viết lại (sonnet B)

### Câu hỏi kiểu tập hợp (bỏ nhiễu "Chỉ…") (7)

| Mã | Câu hỏi | Trước | Sau | Căn cứ | Ghi chú |
|---|---|---|---|---|---|
| `dan-su/giao-dich-dan-su#0` | Giao dịch dân sự gồm những dạng nào theo Điều 116?<br>→ Phương án nào mô tả đầy đủ các dạng giao dịch dân sự theo Điều 116? | **Hợp đồng hoặc hành vi pháp lý đơn phương**<br>Chỉ hợp đồng dân sự, không có hành vi khác<br>Chỉ hợp đồng có công chứng đã được đăng ký<br>Quyết định hành chính hoặc hợp đồng dân sự | **Hợp đồng hoặc hành vi pháp lý đơn phương**<br>Hợp đồng dân sự, không có hành vi khác<br>Hợp đồng có công chứng đã được đăng ký<br>Quyết định hành chính hoặc hợp đồng dân sự | Điều 116 Bộ luật Dân sự 2015 | Nhiễu viết lại: sai rõ, không cần từ tuyệt đối |
| `dan-su/giao-dich-vo-hieu-gia-tao#0` | Khi giao dịch giả tạo nhằm che giấu một giao dịch khác thì giao dịch bị che giấu có hiệu lực không? | **Vẫn có hiệu lực, trừ khi bản thân nó cũng vô hiệu theo luật**<br>Luôn vô hiệu, không cần xét đến nội dung và mục đích<br>Luôn có hiệu lực, không phụ thuộc vào giao dịch giả tạo<br>Do Ủy ban nhân dân quyết định theo từng vụ việc riêng | **Vẫn có hiệu lực, trừ khi bản thân nó cũng vô hiệu theo luật**<br>Vô hiệu theo giao dịch giả tạo, không xét nội dung và mục đích<br>Có hiệu lực ngay cả khi nội dung trái điều cấm của luật<br>Do Ủy ban nhân dân quyết định theo từng vụ việc riêng | Khoản 1 Điều 124 Bộ luật Dân sự 2015 | Nhiễu viết lại: sai rõ, không cần từ tuyệt đối |
| `dan-su/tai-san#0` | Theo Điều 105, tài sản gồm những loại nào?<br>→ Phương án nào liệt kê đầy đủ các loại tài sản theo Điều 105? | **Vật, tiền, giấy tờ có giá và quyền tài sản**<br>Chỉ vật và tiền mặt, không có giấy tờ<br>Vật, tiền, sức lao động và các quyền nhân thân<br>Chỉ bất động sản và động sản đã đăng ký | **Vật, tiền, giấy tờ có giá và quyền tài sản**<br>Vật, tiền, giấy tờ có giá và quyền nhân thân<br>Vật, tiền, sức lao động và các quyền nhân thân<br>Bất động sản và động sản đã được đăng ký | Khoản 1 Điều 105 Bộ luật Dân sự 2015 | Hỏi 'đầy đủ'; nhiễu thay 'quyền tài sản' bằng 'quyền nhân thân' hoặc đổi sang phân loại khác. |
| `sets/dan-su-de-2#6` | Ông A chết không để lại di chúc, còn vợ, mẹ đẻ và một người em ruột. Ai được hưởng di sản? | Vợ, mẹ và em ruột chia đều<br>**Vợ và mẹ đẻ chia đều**<br>Chỉ vợ<br>Chỉ em ruột | Vợ, mẹ và em ruột chia đều<br>**Vợ và mẹ đẻ chia đều**<br>Vợ hưởng toàn bộ di sản<br>Em ruột hưởng cả di sản | Điều 651 Bộ luật Dân sự 2015 | Nhiễu viết lại: sai rõ, không cần từ tuyệt đối |
| `sets/dat-coc#5` | Có thể dùng một chiếc điện thoại để đặt cọc không? | **Có, vì đó là vật có giá trị**<br>Không, chỉ được đặt cọc bằng tiền<br>Chỉ được khi có công chứng hợp đồng<br>Chỉ được đặt cọc bằng vàng hoặc đá quý | **Có, vì đó là vật có giá trị**<br>Không, vì đặt cọc phải bằng tiền mặt<br>Có, nếu hợp đồng có công chứng<br>Không, vì phải là vàng hoặc đá quý | Khoản 1 Điều 328 Bộ luật Dân sự 2015 | Nhiễu viết lại: sai rõ, không cần từ tuyệt đối |
| `sets/dat-coc#6` | Hợp đồng đặt cọc ghi: nếu bên nhận cọc đổi ý thì phải trả gấp 3 lần tiền cọc. Thỏa thuận này có được áp dụng không? | Không, luật chỉ cho phạt đúng bằng giá trị cọc<br>Chỉ có hiệu lực nếu công chứng<br>**Có, vì luật cho phép các bên thỏa thuận khác**<br>Chỉ áp dụng khi mua bán nhà đất | Không, luật chỉ cho phạt đúng bằng giá trị cọc<br>Không, vì mức phạt cọc bị giới hạn tối đa 8% giá trị<br>**Có, vì luật cho phép các bên thỏa thuận khác**<br>Không, thỏa thuận này trái điều cấm của luật | Khoản 2 Điều 328 Bộ luật Dân sự 2015 | Nhiễu viết lại: sai rõ, không cần từ tuyệt đối |
| `sets/dat-coc#7` | Bạn đặt cọc thuê trọ chỉ qua tin nhắn Zalo, không có giấy tay. Theo BLDS 2015, việc đặt cọc này thế nào? | Vô hiệu, vì đặt cọc bắt buộc phải lập văn bản có công chứng<br>**Không vô hiệu chỉ vì hình thức; tin nhắn là chứng cứ quan trọng**<br>Chỉ hợp lệ nếu có người làm chứng và có chữ ký đầy đủ của các bên<br>Chỉ hợp lệ nếu được công chứng tại văn phòng công chứng | Vô hiệu, vì đặt cọc bắt buộc phải lập văn bản có công chứng<br>**Không vô hiệu chỉ vì hình thức; tin nhắn là chứng cứ quan trọng**<br>Hợp lệ nếu có người làm chứng và có chữ ký đầy đủ của các bên<br>Hợp lệ nếu được công chứng tại văn phòng công chứng | Điều 328, khoản 1 Điều 119 Bộ luật Dân sự 2015 | Nhiễu viết lại: sai rõ, không cần từ tuyệt đối |

### Câu Đúng/Sai đáp án Đúng thêm mới (11)

| Mã | Nhận định (Đúng) | Căn cứ | Ghi chú |
|---|---|---|---|
| `dan-su/bao-ve-quyen-so-huu#7` | Không ai có thể bị hạn chế, bị tước đoạt trái luật quyền sở hữu, quyền khác đối với tài sản. | Khoản 1 Điều 163 Bộ luật Dân sự 2015 | nguyên văn khớp laws/*.txt |
| `dan-su/bat-dong-san-dong-san#7` | Động sản là những tài sản không phải là bất động sản. | Khoản 2 Điều 107 Bộ luật Dân sự 2015 | nguyên văn khớp laws/*.txt |
| `dan-su/chiem-huu#7` | Chiếm hữu là việc chủ thể nắm giữ, chi phối tài sản một cách trực tiếp hoặc gián tiếp như chủ thể có quyền đối với tài sản. | Khoản 1 Điều 179 Bộ luật Dân sự 2015 | nguyên văn khớp laws/*.txt |
| `dan-su/dieu-kien-hieu-luc-giao-dich#7` | Hình thức của giao dịch dân sự là điều kiện có hiệu lực của giao dịch dân sự trong trường hợp luật có quy định. | Khoản 2 Điều 117 Bộ luật Dân sự 2015 | nguyên văn khớp laws/*.txt |
| `dan-su/giao-dich-dan-su#7` | Giao dịch dân sự là hợp đồng hoặc hành vi pháp lý đơn phương làm phát sinh, thay đổi hoặc chấm dứt quyền, nghĩa vụ dân sự. | Điều 116 Bộ luật Dân sự 2015 | nguyên văn khớp laws/*.txt |
| `dan-su/nang-luc-phap-luat-dan-su#7` | Năng lực pháp luật dân sự của cá nhân là khả năng của cá nhân có quyền dân sự và nghĩa vụ dân sự. | Khoản 1 Điều 16 Bộ luật Dân sự 2015 | nguyên văn khớp laws/*.txt |
| `dan-su/nguoi-chua-thanh-nien#7` | Giao dịch dân sự của người chưa đủ sáu tuổi do người đại diện theo pháp luật của người đó xác lập, thực hiện. | Khoản 2 Điều 21 Bộ luật Dân sự 2015 | nguyên văn khớp laws/*.txt |
| `dan-su/nguyen-tac-co-ban-luat-dan-su#7` | Cá nhân, pháp nhân phải xác lập, thực hiện, chấm dứt quyền, nghĩa vụ dân sự của mình một cách thiện chí, trung thực. | Khoản 3 Điều 3 Bộ luật Dân sự 2015 | nguyên văn khớp laws/*.txt |
| `dan-su/quyen-khac-doi-voi-tai-san#7` | Quyền khác đối với tài sản là quyền của chủ thể trực tiếp nắm giữ, chi phối tài sản thuộc quyền sở hữu của chủ thể khác. | Khoản 1 Điều 159 Bộ luật Dân sự 2015 | nguyên văn khớp laws/*.txt |
| `dan-su/quyen-so-huu#7` | Quyền sở hữu bao gồm quyền chiếm hữu, quyền sử dụng và quyền định đoạt tài sản của chủ sở hữu theo quy định của luật. | Điều 158 Bộ luật Dân sự 2015 | nguyên văn khớp laws/*.txt |
| `dan-su/thoi-hieu-thua-ke#7` | Thời hiệu yêu cầu người thừa kế thực hiện nghĩa vụ về tài sản của người chết để lại là 03 năm, kể từ thời điểm mở thừa kế. | Khoản 3 Điều 623 Bộ luật Dân sự 2015 | nguyên văn khớp laws/*.txt |
