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

## Câu hỏi viết lại (sonnet B)

### Câu hỏi kiểu tập hợp (bỏ nhiễu "Chỉ…") (3)

| Mã | Câu hỏi | Trước | Sau | Căn cứ | Ghi chú |
|---|---|---|---|---|---|
| `canh-tranh/pham-vi-dieu-chinh-luat-canh-tranh#1` | Đơn vị sự nghiệp công lập có thuộc đối tượng áp dụng của Luật Cạnh tranh không? | **Có**<br>Không<br>Chỉ khi có vốn nước ngoài<br>Chỉ khi đã niêm yết | **Có, theo khoản 1 Điều 2 Luật Cạnh tranh**<br>Không, vì không phải là doanh nghiệp<br>Có, nếu có vốn nước ngoài<br>Có, nếu đã niêm yết | Khoản 1 Điều 2 Luật Cạnh tranh 2018 (đối chiếu laws/luat-canh-tranh-2018.txt: đơn vị sự nghiệp công lập thuộc đối tượng áp dụng) | Đáp án vẫn là 'Có'; viết đầy đủ. |
| `canh-tranh/thoa-thuan-han-che-canh-tranh#0` | Thỏa thuận hạn chế cạnh tranh có thể tồn tại dưới hình thức nào? | **Dưới mọi hình thức**<br>Chỉ bằng văn bản có chữ ký<br>Chỉ khi có công chứng<br>Chỉ khi đăng ký với cơ quan nhà nước | **Dưới mọi hình thức**<br>Văn bản có chữ ký của các bên<br>Văn bản có công chứng<br>Văn bản đã đăng ký với cơ quan nhà nước | Khoản 4 Điều 3 Luật Cạnh tranh 2018 ('dưới mọi hình thức') | Nhiễu viết lại: sai rõ, không cần từ tuyệt đối |
| `sets/canh-tranh-de-1#0` | Một tập đoàn nước ngoài, không có hiện diện tại Việt Nam, thực hiện hành vi gây tác động hạn chế cạnh tranh đến thị trường Việt Nam. Luật Cạnh tranh Việt Nam có áp dụng không? | Không, vì doanh nghiệp không có hiện diện tại Việt Nam nên ngoài phạm vi<br>**Có, vì Luật điều chỉnh hành vi gây tác động đến thị trường Việt Nam**<br>Chỉ khi có điều ước quốc tế hoặc thỏa thuận riêng giữa hai Chính phủ<br>Chỉ khi doanh nghiệp có chi nhánh hoặc văn phòng đại diện tại Việt Nam | Không, vì doanh nghiệp không có hiện diện tại Việt Nam nên ngoài phạm vi<br>**Có, vì Luật điều chỉnh hành vi gây tác động đến thị trường Việt Nam**<br>Không, trừ khi có điều ước quốc tế hoặc thỏa thuận riêng giữa hai Chính phủ<br>Không, trừ khi doanh nghiệp có chi nhánh hoặc văn phòng đại diện tại Việt Nam | Điều 1, khoản 3 Điều 2 Luật Cạnh tranh 2018 | Nhiễu viết lại: sai rõ, không cần từ tuyệt đối |

### Câu lộ tên khái niệm trong phương án (2)

| Mã | Câu hỏi | Trước | Sau | Căn cứ | Ghi chú |
|---|---|---|---|---|---|
| `canh-tranh/lam-dung-vi-tri-thong-linh#0` | Doanh nghiệp có vị trí thống lĩnh bán hàng dưới giá thành toàn bộ dẫn đến loại bỏ đối thủ cạnh tranh thì sao? | **Là hành vi lạm dụng vị trí thống lĩnh bị cấm**<br>Là khuyến mại hợp pháp, được phép thực hiện tự do<br>Là cạnh tranh lành mạnh, được phép kinh doanh<br>Chỉ bị cấm khi gây thiệt hại thực tế cho khách | **Là hành vi lạm dụng vị trí thống lĩnh bị cấm**<br>Là khuyến mại hợp pháp, được phép thực hiện tự do<br>Là cạnh tranh lành mạnh, được phép kinh doanh<br>Lạm dụng vị trí thống lĩnh, chỉ bị cấm khi có thiệt hại | Điểm a khoản 1 Điều 27 Luật Cạnh tranh 2018 (hành vi 'gây ra hoặc có khả năng gây ra thiệt hại') | Nhiễu cũng chứa cụm 'lạm dụng vị trí thống lĩnh' (sai: luật cấm cả khi chỉ có khả năng gây thiệt hại). |
| `canh-tranh/lam-dung-vi-tri-thong-linh#1` | Ấn định giá bán lại tối thiểu gây thiệt hại cho khách hàng do doanh nghiệp có vị trí thống lĩnh thực hiện thuộc hành vi nào? | **Lạm dụng vị trí thống lĩnh thị trường**<br>Cạnh tranh không lành mạnh trên thị trường<br>Tập trung kinh tế bằng mua cổ phần<br>Không vi phạm vì chỉ ấn định giá bán lại | **Lạm dụng vị trí thống lĩnh thị trường**<br>Cạnh tranh không lành mạnh trên thị trường<br>Tập trung kinh tế bằng mua cổ phần<br>Không lạm dụng vị trí thống lĩnh thị trường | Điểm b khoản 1 Điều 27 Luật Cạnh tranh 2018 | Nhiễu cũng chứa tên khái niệm (sai kết luận). |

### Câu Đúng/Sai đáp án Đúng thêm mới (9)

| Mã | Nhận định (Đúng) | Căn cứ | Ghi chú |
|---|---|---|---|
| `canh-tranh/hanh-vi-han-che-canh-tranh#7` | Tác động hạn chế cạnh tranh là tác động loại trừ, làm giảm, sai lệch hoặc cản trở cạnh tranh trên thị trường. | Khoản 3 Điều 3 Luật Cạnh tranh 2018 | nguyên văn khớp laws/*.txt |
| `canh-tranh/thi-phan#7` | Thị phần kết hợp là tổng thị phần trên thị trường liên quan của các doanh nghiệp tham gia vào hành vi hạn chế cạnh tranh hoặc tập trung kinh tế. | Khoản 2 Điều 10 Luật Cạnh tranh 2018 | nguyên văn khớp laws/*.txt |
| `canh-tranh/thi-truong-lien-quan#7` | Thị trường liên quan được xác định trên cơ sở thị trường sản phẩm liên quan và thị trường địa lý liên quan. | Khoản 1 Điều 9 Luật Cạnh tranh 2018 | nguyên văn khớp laws/*.txt |
| `canh-tranh/thoa-thuan-han-che-canh-tranh#7` | Thỏa thuận hạn chế cạnh tranh là hành vi thỏa thuận giữa các bên dưới mọi hình thức gây tác động hoặc có khả năng gây tác động hạn chế cạnh tranh. | Khoản 4 Điều 3 Luật Cạnh tranh 2018 | nguyên văn khớp laws/*.txt |
| `canh-tranh/canh-tranh-khong-lanh-manh#7` | Hành vi cạnh tranh không lành mạnh là hành vi của doanh nghiệp trái với nguyên tắc thiện chí, trung thực, tập quán thương mại và các chuẩn mực khác trong kinh doanh, gây thiệt hại hoặc có thể gây thiệt hại đến quyền và lợi ích hợp pháp của doanh nghiệp khác. | Khoản 6 Điều 3 Luật Cạnh tranh 2018 | Nguyên văn, đối chiếu laws/luat-canh-tranh-2018.txt |
| `canh-tranh/vi-tri-thong-linh-thi-truong#7` | Nhóm doanh nghiệp có vị trí thống lĩnh thị trường không bao gồm doanh nghiệp có thị phần ít hơn 10% trên thị trường liên quan. | Khoản 3 Điều 24 Luật Cạnh tranh 2018 | Trích gần nguyên văn, đối chiếu laws/luat-canh-tranh-2018.txt |
| `canh-tranh/tap-trung-kinh-te#7` | Tập trung kinh tế bao gồm sáp nhập doanh nghiệp, hợp nhất doanh nghiệp, mua lại doanh nghiệp, liên doanh giữa các doanh nghiệp và các hình thức tập trung kinh tế khác theo quy định của pháp luật. | Khoản 1 Điều 29 Luật Cạnh tranh 2018 | Nguyên văn các điểm a–đ, đối chiếu laws/luat-canh-tranh-2018.txt |
| `canh-tranh/hanh-vi-cam-co-quan-nha-nuoc#7` | Cơ quan nhà nước bị nghiêm cấm lợi dụng chức vụ, quyền hạn để can thiệp trái pháp luật vào hoạt động cạnh tranh. | Điểm d khoản 1 Điều 8 Luật Cạnh tranh 2018 | Trích gần nguyên văn (Điều 8 là điều về hành vi bị nghiêm cấm), đối chiếu laws/luat-canh-tranh-2018.txt |
| `canh-tranh/hanh-vi-canh-tranh-khong-lanh-manh-bi-cam#7` | Gây rối hoạt động kinh doanh của doanh nghiệp khác bằng cách trực tiếp hoặc gián tiếp cản trở, làm gián đoạn hoạt động kinh doanh hợp pháp của doanh nghiệp đó là hành vi cạnh tranh không lành mạnh bị cấm. | Khoản 4 Điều 45 Luật Cạnh tranh 2018 | Nguyên văn khoản 4 kèm kết luận theo tiêu đề Điều 45, đối chiếu laws/luat-canh-tranh-2018.txt |
