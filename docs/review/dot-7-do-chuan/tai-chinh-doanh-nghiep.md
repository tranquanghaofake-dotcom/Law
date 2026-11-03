# Đợt 7 — độ chuẩn: tai-chinh-doanh-nghiep

## Tình huống Phân biệt mới (haiku-1)

Thêm tình huống (câu `pair`) cho các khái niệm còn dưới 4 tình huống; mỗi tình huống có trường `basis` đối chiếu với `packages/content/data/laws/`.

Số khái niệm: 18; số tình huống thêm: 36.

| Khái niệm | Tình huống mới | Bên | Căn cứ |
|---|---|---|---|
| tcdn-chao-ban-co-phan | Công ty cổ phần chào bán cổ phần cho cổ đông hiện hữu để tăng vốn điều lệ | Trái: Huy động vốn chủ sở hữu | Điểm a khoản 2 Điều 123 Luật Doanh nghiệp 2020 |
| tcdn-chao-ban-co-phan | Công ty phát hành trái phiếu để huy động vốn vay, phải hoàn trả gốc và lãi cho người sở hữu | Phải: Huy động vốn vay | Khoản 3 Điều 4 Luật Chứng khoán 2019 |
| tcdn-chi-phi-duoc-tru | Chi phí quảng cáo thực tế phục vụ hoạt động kinh doanh của doanh nghiệp, có chứng từ | Trái: Đáp ứng điều kiện chi phí được trừ | Điểm a khoản 1 Điều 9 Luật Thuế thu nhập doanh nghiệp 2025 |
| tcdn-chi-phi-duoc-tru | Khoản tài trợ cho giáo dục của doanh nghiệp | Trái: Đáp ứng điều kiện chi phí được trừ | Điểm b5 khoản 1 Điều 9 Luật Thuế thu nhập doanh nghiệp 2025 |
| tcdn-chia-loi-nhuan-tnhh | Công ty hoàn thành nghĩa vụ thuế và các nghĩa vụ tài chính khác, sau đó chia lợi nhuận cho thành viên | Trái: Được chia lợi nhuận | Điều 69 Luật Doanh nghiệp 2020 |
| tcdn-chia-loi-nhuan-tnhh | Công ty chia lợi nhuận cho thành viên khi chưa nộp thuế, dù công ty vẫn có tiền mặt | Phải: Không được chia | Điều 69 Luật Doanh nghiệp 2020 |
| tcdn-co-tuc | Công ty cổ phần trả cổ tức cho cổ phần phổ thông từ lợi nhuận ròng đã thực hiện, đã bù lỗ trước đó | Trái: Đủ điều kiện trả cổ tức | Khoản 2 Điều 135 Luật Doanh nghiệp 2020 |
| tcdn-co-tuc | Công ty cổ phần trả cổ tức cho cổ phần phổ thông dù chưa bù đắp khoản lỗ năm trước | Phải: Chưa đủ | Điểm b khoản 2 Điều 135 Luật Doanh nghiệp 2020 |
| tcdn-cong-bo-thong-tin-dnnn | Thông tin cơ bản về công ty và Điều lệ công ty, công bố định kỳ trên trang thông tin điện tử | Trái: Phải công bố định kỳ (Điều 109) | Điểm a khoản 1 Điều 109 Luật Doanh nghiệp 2020 |
| tcdn-cong-bo-thong-tin-dnnn | Báo cáo tài chính năm đã được kiểm toán độc lập và tóm tắt báo cáo đó | Trái: Phải công bố định kỳ (Điều 109) | Điểm c khoản 1 Điều 109 Luật Doanh nghiệp 2020 |
| tcdn-dinh-gia-tai-san-gop-von | Quyền sở hữu trí tuệ được góp vào công ty như tài sản góp vốn | Trái: Phải định giá | Khoản 1 Điều 34 và khoản 1 Điều 36 Luật Doanh nghiệp 2020 |
| tcdn-dinh-gia-tai-san-gop-von | Đồng Việt Nam tiền mặt góp vốn để thành lập công ty | Phải: Không phải định giá | Khoản 1 Điều 36 Luật Doanh nghiệp 2020 |
| tcdn-doanh-nghiep | Doanh nghiệp kê khai và nộp thuế giá trị gia tăng cho cơ quan thuế | Trái: Quan hệ giữa doanh nghiệp với Nhà nước | Khoản 10 Điều 4 Luật Doanh nghiệp 2020 (quan hệ với Nhà nước) |
| tcdn-doanh-nghiep | Cổ đông nhận cổ tức từ lợi nhuận sau thuế của công ty cổ phần | Phải: Quan hệ giữa doanh nghiệp với chủ sở hữu | Khoản 5 Điều 4 Luật Doanh nghiệp 2020 (quan hệ với chủ sở hữu) |
| tcdn-doanh-thu | Tiền cung ứng dịch vụ tư vấn thu của khách hàng, kể cả khoản phụ thu | Trái: Doanh thu | Khoản 1 Điều 8 Luật Thuế thu nhập doanh nghiệp 2025 |
| tcdn-doanh-thu | Tiền vay ngân hàng nhận để mua nguyên liệu sản xuất | Phải: Không phải doanh thu | Khoản 1 Điều 8 Luật Thuế thu nhập doanh nghiệp 2025 (không phải tiền bán hàng, gia công, dịch vụ) |
| tcdn-doi-tuong-cong-bo-thong-tin | Công ty chứng khoán được cấp phép kinh doanh môi giới chứng khoán | Trái: Là đối tượng công bố thông tin | Điểm d khoản 1 Điều 118 Luật Chứng khoán 2019 |
| tcdn-doi-tuong-cong-bo-thong-tin | Công ty TNHH hai thành viên không đại chúng, không phát hành trái phiếu ra công chúng | Phải: Không thuộc Điều 118 | Khoản 1 Điều 118 Luật Chứng khoán 2019 (không thuộc các điểm a–c) |
| tcdn-gop-von | Quyền sử dụng đất hợp pháp của thành viên được đem góp vốn vào công ty | Trái: Là tài sản góp vốn hợp lệ | Khoản 1 và khoản 2 Điều 34 Luật Doanh nghiệp 2020 |
| tcdn-gop-von | Uy tín và mối quan hệ kinh doanh của người sáng lập, không định giá được bằng tiền | Phải: Không phải tài sản góp vốn | Khoản 1 Điều 34 Luật Doanh nghiệp 2020 |
| tcdn-hop-nhat | Hai công ty chuyển toàn bộ tài sản để hình thành một công ty mới, cả hai chấm dứt tồn tại | Trái: Hợp nhất | Khoản 1 Điều 200 Luật Doanh nghiệp 2020 |
| tcdn-hop-nhat | Công ty mua toàn bộ vốn góp của công ty khác để kiểm soát, công ty bị mua vẫn tồn tại | Phải: Mua lại doanh nghiệp | Khoản 4 Điều 29 Luật Cạnh tranh 2018 |
| tcdn-mua-lai-doanh-nghiep | Doanh nghiệp mua phần lớn vốn góp của công ty khác để kiểm soát quyết định của công ty đó | Trái: Mua lại doanh nghiệp | Khoản 4 Điều 29 Luật Cạnh tranh 2018 |
| tcdn-mua-lai-doanh-nghiep | Doanh nghiệp mua cổ phiếu nhỏ của công ty niêm yết để đầu tư tài chính, không kiểm soát | Phải: Đầu tư tài chính thông thường | Khoản 4 Điều 29 Luật Cạnh tranh 2018 (không đủ kiểm soát, chi phối) |
| tcdn-quyen-ve-von | Doanh nghiệp tự quyết định hình thức huy động và phân bổ vốn | Trái: Quyền của doanh nghiệp | Khoản 3 Điều 7 Luật Doanh nghiệp 2020 |
| tcdn-quyen-ve-von | Giám đốc tự ý dùng vốn của cổ đông để chi tiêu cho mục đích cá nhân | Phải: Không phải quyền | Điều 7 Luật Doanh nghiệp 2020 (không liệt kê là quyền của doanh nghiệp) |
| tcdn-sap-nhap | Công ty X chuyển toàn bộ tài sản cho công ty Y, công ty X chấm dứt tồn tại | Trái: Sáp nhập | Khoản 1 Điều 201 Luật Doanh nghiệp 2020 |
| tcdn-sap-nhap | Hai công ty chuyển tài sản để thành lập công ty mới, cả hai không còn tồn tại | Phải: Hợp nhất | Khoản 1 Điều 200 Luật Doanh nghiệp 2020 |
| tcdn-tap-trung-kinh-te | Liên doanh giữa hai doanh nghiệp để thành lập một doanh nghiệp mới | Trái: Tập trung kinh tế | Điểm d khoản 1 và khoản 5 Điều 29 Luật Cạnh tranh 2018 |
| tcdn-tap-trung-kinh-te | Doanh nghiệp tăng vốn điều lệ bằng cách phát hành cổ phần cho cổ đông hiện hữu | Phải: Không phải tập trung kinh tế | Khoản 1 Điều 29 Luật Cạnh tranh 2018 (không thuộc các hình thức liệt kê) |
| tcdn-trai-phieu-rieng-le | Công ty cổ phần không đại chúng chào bán trái phiếu cho một số nhà đầu tư, không qua báo chí | Trái: Riêng lẻ | Khoản 2 Điều 128 Luật Doanh nghiệp 2020 |
| tcdn-trai-phieu-rieng-le | Công ty chào bán trái phiếu thông qua báo chí cho công chúng rộng rãi | Phải: Ra công chúng | Khoản 1 và khoản 2 Điều 128 Luật Doanh nghiệp 2020 |
| tcdn-trai-phieu | Chứng nhận của công ty cho người cho vay được nhận gốc và lãi theo kỳ hạn | Trái: Trái phiếu | Khoản 3 Điều 4 Luật Chứng khoán 2019 |
| tcdn-trai-phieu | Chứng nhận người sở hữu có quyền biểu quyết tại đại hội cổ đông | Phải: Cổ phiếu | Khoản 2 Điều 4 Luật Chứng khoán 2019 |
| tcdn-von-dieu-le | Tổng mệnh giá cổ phần đã bán hoặc được đăng ký mua của công ty cổ phần | Trái: Vốn chủ sở hữu | Khoản 34 Điều 4 Luật Doanh nghiệp 2020 |
| tcdn-von-dieu-le | Khoản vay từ ngân hàng để mua thiết bị, phải trả gốc và lãi theo hợp đồng | Phải: Vốn vay | Khoản 34 Điều 4 Luật Doanh nghiệp 2020 (vốn điều lệ không gồm vốn vay) |
