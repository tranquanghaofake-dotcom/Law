# Đợt 7 — độ chuẩn: dan-su-2

## Tình huống Phân biệt mới (haiku-1)

Thêm tình huống (câu `pair`) cho các khái niệm còn dưới 4 tình huống; mỗi tình huống có trường `basis` đối chiếu với `packages/content/data/laws/`.

Số khái niệm: 26; số tình huống thêm: 53.

| Khái niệm | Tình huống mới | Bên | Căn cứ |
|---|---|---|---|
| bao-lanh | Người thứ ba cam kết với ngân hàng sẽ trả nợ thay nếu người vay không trả | Trái: Bên bảo lãnh | Khoản 1 Điều 335 Bộ luật Dân sự 2015 |
| bao-lanh | Doanh nghiệp vay vốn có người thứ ba bảo lãnh, là bên có nghĩa vụ trả nợ chính | Phải: Bên được bảo lãnh | Khoản 1 Điều 335 Bộ luật Dân sự 2015 |
| bien-phap-bao-dam | Bên vay giao sổ tiết kiệm của mình cho ngân hàng giữ để bảo đảm khoản vay | Trái: Bảo đảm bằng tài sản | Khoản 1 Điều 292 Bộ luật Dân sự 2015 (cầm cố tài sản) |
| bien-phap-bao-dam | Người vay cam kết trả nợ dựa trên uy tín, không có tài sản bảo đảm nào | Phải: Bảo đảm bằng uy tín, cam kết của người khác | Khoản 8 Điều 292 Bộ luật Dân sự 2015 (tín chấp) |
| cam-co | Bên vay giao sổ tiết kiệm cho bên cho vay giữ để bảo đảm khoản vay | Trái: Cầm cố | Điều 309 Bộ luật Dân sự 2015 |
| cam-co | Bên vay thế chấp chiếc xe ô tô, xe vẫn do bên vay sử dụng | Phải: Thế chấp | Khoản 1 và khoản 2 Điều 317 Bộ luật Dân sự 2015 |
| can-cu-boi-thuong-thiet-hai | Người làm rơi biển quảng cáo đè trúng xe của người khác, làm xe hư hỏng | Trái: Phải bồi thường | Khoản 1 Điều 584 Bộ luật Dân sự 2015 |
| can-cu-boi-thuong-thiet-hai | Thiệt hại do lũ lụt bất khả kháng gây ra, không có lỗi của người bị coi là gây thiệt hại | Phải: Không phải bồi thường | Khoản 2 Điều 584 Bộ luật Dân sự 2015 |
| can-cu-phat-sinh-nghia-vu | Bên bán phải giao chiếc xe đã thỏa thuận theo hợp đồng mua bán | Trái: Nghĩa vụ theo hợp đồng | Khoản 1 Điều 275 Bộ luật Dân sự 2015 |
| can-cu-phat-sinh-nghia-vu | Người đơn phương hứa thưởng cho ai tìm được thú cưng bị lạc | Phải: Nghĩa vụ ngoài hợp đồng | Khoản 2 Điều 275 Bộ luật Dân sự 2015 (hành vi pháp lý đơn phương) |
| dat-coc | Bên đặt cọc từ chối giao kết hợp đồng khi không có lý do chính đáng, mất khoản cọc | Trái: Bên đặt cọc mất cọc | Khoản 2 Điều 328 Bộ luật Dân sự 2015 |
| dat-coc | Bên nhận đặt cọc từ chối giao kết hợp đồng, phải trả lại tài sản đặt cọc và thêm một khoản tương đương | Phải: Bên nhận cọc phải trả thêm | Khoản 2 Điều 328 Bộ luật Dân sự 2015 |
| dich-vu | Thợ sửa điều hòa tự chọn cách làm và được trả tiền khi hoàn thành kết quả công việc | Trái: Hợp đồng dịch vụ | Điều 513 Bộ luật Dân sự 2015 |
| dich-vu | Nhân viên bán hàng làm việc theo phân công, chịu sự quản lý và giám sát của công ty | Phải: Hợp đồng lao động | Khoản 1 Điều 13 Bộ luật Lao động 2019 |
| hop-dong-theo-mau | Điều khoản mẫu miễn trách nhiệm cho bên soạn thảo, khiến khách hàng chịu thêm trách nhiệm | Trái: Không có hiệu lực | Khoản 3 Điều 405 Bộ luật Dân sự 2015 |
| hop-dong-theo-mau | Điều khoản mẫu về giá dịch vụ đã công khai cho khách hàng biết trước khi ký | Phải: Có hiệu lực | Khoản 1 Điều 405 Bộ luật Dân sự 2015 |
| hop-dong | Hai bên thỏa thuận: một bên giao hàng, bên kia thanh toán tiền, mỗi bên đều có nghĩa vụ | Trái: Hợp đồng song vụ | Khoản 1 Điều 402 Bộ luật Dân sự 2015 |
| hop-dong | Hai bên thỏa thuận cho thuê nhà, bên cho thuê giao nhà và bên thuê trả tiền thuê định kỳ | Trái: Hợp đồng song vụ | Khoản 1 Điều 402 Bộ luật Dân sự 2015 |
| lai-suat | Hai bên thỏa thuận lãi suất vay trong mức không vượt giới hạn pháp luật cho phép | Trái: Có hiệu lực | Khoản 1 Điều 468 Bộ luật Dân sự 2015 |
| lai-suat | Phần lãi vượt quá giới hạn theo quy định của Bộ luật Dân sự trong hợp đồng vay tiền | Phải: Không có hiệu lực | Khoản 2 Điều 468 Bộ luật Dân sự 2015 |
| mua-ban-tai-san | Bên bán giao chiếc tủ lạnh và nhận tiền để chuyển quyền sở hữu cho bên mua | Trái: Mua bán | Đoạn 1 Điều 430 Bộ luật Dân sự 2015 |
| mua-ban-tai-san | Bên cho thuê giao máy phát điện để bên thuê dùng trong thời hạn, bên thuê trả tiền thuê | Phải: Thuê | Đoạn 1 Điều 472 Bộ luật Dân sự 2015 |
| nang-luc-chiu-trach-nhiem-boi-thuong | Em bé 6 tuổi làm đổ cây cảnh của hàng xóm, cha mẹ bồi thường toàn bộ thiệt hại | Trái: Cha mẹ bồi thường trước | Khoản 2 Điều 586 Bộ luật Dân sự 2015 |
| nang-luc-chiu-trach-nhiem-boi-thuong | Người 16 tuổi có tài sản riêng làm hư hỏng xe của người khác, bồi thường bằng tài sản riêng | Phải: Con bồi thường trước bằng tài sản riêng | Khoản 2 Điều 586 Bộ luật Dân sự 2015 |
| nghia-vu-hoan-tra | Người sử dụng nhà của người khác không có căn cứ pháp luật, phải trả lại nhà | Trái: Hoàn trả tài sản (khoản 1) | Khoản 1 Điều 579 Bộ luật Dân sự 2015 |
| nghia-vu-hoan-tra | Người không có căn cứ pháp luật được hưởng lợi từ tài sản làm người khác thiệt hại, phải hoàn lại khoản lợi | Phải: Hoàn trả khoản lợi (khoản 2) | Khoản 2 Điều 579 Bộ luật Dân sự 2015 |
| nghia-vu | Phòng khám điều trị cho bệnh nhân đúng như cam kết trong hợp đồng | Trái: Nghĩa vụ làm | Điều 274 Bộ luật Dân sự 2015 |
| nghia-vu | Bên thuê không được chuyển nhượng quyền thuê cho người khác | Phải: Nghĩa vụ không làm | Điều 274 Bộ luật Dân sự 2015 (nghĩa vụ không thực hiện công việc nhất định) |
| nguon-nguy-hiem-cao-do | Nhà máy công nghiệp đang hoạt động gây cháy nổ lan sang nhà dân | Trái: Nguồn nguy hiểm cao độ | Khoản 1 Điều 601 Bộ luật Dân sự 2015 |
| nguon-nguy-hiem-cao-do | Người đi bộ đẩy chiếc xe đạp thồ hàng va vào người khác | Phải: Không phải | Khoản 1 Điều 601 Bộ luật Dân sự 2015 (xe đạp không phải phương tiện cơ giới) |
| nguyen-tac-boi-thuong | Người vô ý làm hư đồ dùng của hàng xóm, thiệt hại vượt quá khả năng kinh tế của mình | Trái: Có thể được giảm mức bồi thường | Khoản 2 Điều 585 Bộ luật Dân sự 2015 |
| nguyen-tac-boi-thuong | Người cố ý gây thiệt hại tài sản dù thiệt hại lớn so với thu nhập của họ | Phải: Không được giảm theo khoản 2 | Khoản 2 Điều 585 Bộ luật Dân sự 2015 (không áp dụng khi cố ý) |
| phat-vi-pham | Hai bên thỏa thuận: bên chậm giao hàng phải nộp một khoản tiền phạt theo hợp đồng | Trái: Phạt vi phạm | Khoản 1 Điều 418 Bộ luật Dân sự 2015 |
| phat-vi-pham | Mức phạt do các bên thỏa thuận trong hợp đồng mua bán, trừ khi luật liên quan có quy định khác | Trái: Phạt vi phạm | Khoản 2 Điều 418 Bộ luật Dân sự 2015 |
| phat-vi-pham | Bên vi phạm phải nộp khoản tiền đã thỏa thuận trong hợp đồng dịch vụ khi không thực hiện đúng cam kết | Trái: Phạt vi phạm | Khoản 1 Điều 418 Bộ luật Dân sự 2015 |
| suc-vat-gay-thiet-hai | Con chó nhà ông A cắn người đi đường do cửa lồng bị hỏng, ông A không đóng cửa | Trái: Chủ sở hữu bồi thường | Khoản 1 Điều 603 Bộ luật Dân sự 2015 |
| suc-vat-gay-thiet-hai | Người lạ dùng gậy đánh con chó khiến nó cắn người khác, người lạ có lỗi hoàn toàn | Phải: Người thứ ba bồi thường | Khoản 2 Điều 603 Bộ luật Dân sự 2015 |
| tang-cho | Ông A tặng căn nhà cho con, con đồng ý nhận và việc tặng cho có hiệu lực khi ông còn sống | Trái: Tặng cho | Điều 457 Bộ luật Dân sự 2015 |
| tang-cho | Bà B lập văn bản để lại tài sản cho cháu, có hiệu lực sau khi bà mất | Phải: Di chúc | Điều 624 Bộ luật Dân sự 2015 (di chúc) |
| the-chap | Doanh nghiệp dùng quyền sử dụng đất làm bảo đảm khoản vay, vẫn tiếp tục sản xuất trên đất | Trái: Thế chấp | Khoản 1 Điều 317 Bộ luật Dân sự 2015 |
| the-chap | Người mua giao tiền cho chủ nhà để giữ chỗ, sau đó sẽ ký hợp đồng mua nhà | Phải: Đặt cọc | Điều 328 Bộ luật Dân sự 2015 |
| thiet-hai-tinh-mang | Tiền viện phí và thuốc men của nạn nhân bị tai nạn giao thông | Trái: Thiệt hại vật chất (khoản 1) | Khoản 1 Điều 591 Bộ luật Dân sự 2015 |
| thiet-hai-tinh-mang | Khoản tiền bù đắp tổn thất tinh thần cho cha mẹ của người đã chết vì tai nạn | Phải: Tổn thất tinh thần (khoản 2) | Khoản 2 Điều 591 Bộ luật Dân sự 2015 |
| thuc-hien-cong-viec-khong-uy-quyen | Người sơn lại hàng rào của nhà bị bão làm hỏng khi chủ nhà đi xa, vì lợi ích của chủ nhà | Trái: Thực hiện công việc không có ủy quyền | Điều 574 Bộ luật Dân sự 2015 |
| thuc-hien-cong-viec-khong-uy-quyen | Người tự ý sửa nhà người khác để kiếm tiền công, không vì lợi ích của chủ nhà | Phải: Không phải | Điều 574 Bộ luật Dân sự 2015 |
| thue-tai-san | Công ty thuê ô tô của đơn vị cho thuê để chạy dịch vụ, trả tiền thuê theo tháng | Trái: Thuê tài sản | Đoạn 1 Điều 472 Bộ luật Dân sự 2015 |
| thue-tai-san | Hàng xóm cho mượn chiếc thang để sửa mái nhà, không lấy tiền và sẽ trả lại đúng chiếc thang | Phải: Mượn tài sản | Điều 494 Bộ luật Dân sự 2015 |
| trach-nhiem-do-vi-pham-nghia-vu | Nhà thầu chậm bàn giao công trình không có lý do chính đáng | Trái: Vi phạm nghĩa vụ | Khoản 1 Điều 351 Bộ luật Dân sự 2015 |
| trach-nhiem-do-vi-pham-nghia-vu | Bên mua chậm thanh toán tiền hàng mà không có lý do chính đáng | Trái: Vi phạm nghĩa vụ | Khoản 1 Điều 351 Bộ luật Dân sự 2015 |
| uy-quyen | Người được ủy quyền ký hợp đồng bán nhà, nhân danh chủ nhà giao dịch với khách mua | Trái: Hợp đồng ủy quyền | Điều 562 Bộ luật Dân sự 2015 |
| uy-quyen | Thợ sửa xe nhận việc cho khách, thực hiện công việc theo tên của mình và chịu trách nhiệm | Phải: Hợp đồng dịch vụ | Điều 513 Bộ luật Dân sự 2015 |
| vay-tai-san | Người vay một lượng gạo của người khác, khi đến hạn trả lại cùng số lượng và chất lượng gạo đó | Trái: Vay tài sản | Điều 463 Bộ luật Dân sự 2015 |
| vay-tai-san | Người mượn chiếc máy khoan để dùng vài ngày rồi trả đúng chiếc máy đó | Phải: Mượn tài sản | Điều 494 Bộ luật Dân sự 2015 |
