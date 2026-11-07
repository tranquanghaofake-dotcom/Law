# Quy trình xác minh CCPL — thao tác cụ thể của bước 6

File này biến câu nhắc "cần đối chiếu văn bản gốc" thành các thao tác làm được. Nó cũng là căn cứ để quyết định một câu trả lời có chạm Ngưỡng dừng hay không: chạm ngưỡng không phải là cảm giác chưa chắc, mà là kết quả cụ thể của việc chạy quy trình dưới đây rồi vẫn không chốt được.

## Nguyên tắc ngân sách — xác minh cái gì, và biết dừng ở đâu

Sai lầm đầu tiên khi có công cụ tra cứu là tra tất cả. Một câu trả lời thường chạm ba đến năm căn cứ; tra hết vừa tốn thời gian vừa làm loãng sự chú ý, và thứ đáng tra nhất thường bị tra qua loa vì đã mệt.

Thứ tự ưu tiên chỉ có một câu: **tra điều khoản mà nếu nó khác đi thì kết luận đảo chiều.** Đó thường là đúng một điều khoản trên mỗi câu hỏi — quy phạm gánh bước lập luận quyết định. Các căn cứ còn lại là căn cứ bổ trợ, sai số khoản ở đó làm mất điểm trình bày chứ không làm sai kết luận, nên chúng xuống hàng hai. Nếu chỉ đủ thời gian cho một lần tra, dùng nó cho điều khoản quyết định.

Trong từng lần tra, đi theo đúng ba tầng và **không nhảy cóc**: tình trạng hiệu lực của văn bản trước, rồi số Điều, rồi số khoản/điểm. Lý do thứ tự này quan trọng chứ không phải hình thức: tra kỹ số khoản của một văn bản đã bị thay thế là công sức bỏ đi hoàn toàn, và tệ hơn, nó tạo cảm giác đã kiểm chứng kỹ trong khi căn cứ đã sai từ gốc. Hết hiệu lực là lỗi chặn, số khoản sai chỉ là lỗi chi tiết.

## Thứ tự nguồn

Thứ tự và lý do chọn thứ tự này nằm trong `he-thong-van-ban-va-ap-dung.md`, mục "Nguồn tra cứu ưu tiên". Tóm lại: văn bản người dùng đính kèm → vbpl.vn (Cơ sở dữ liệu quốc gia, Bộ Tư pháp, bản đăng tải có giá trị sử dụng chính thức) → công báo và vanban.chinhphu.vn → nguồn tư nhân như thuvienphapluat.vn, luatvietnam.vn.

Một bậc trung gian: **tài liệu ôn thi đính kèm có nhật ký xác minh** (ngân hàng CCPL gắn nhãn A/B/C, ghi ngày và nguồn đối chiếu). Nó đứng sau văn bản gốc nhưng trước trí nhớ của mô hình — một căn cứ nhãn A trong tài liệu loại này dùng được đến điểm/khoản mà không cần tra lại, trừ khi căn cứ đó vừa quyết định kết luận vừa thuộc nhóm rủi ro cao (văn bản sau 2020, nghị định xử phạt, con số) thì vẫn chạy một lần tra nhanh. Quy tắc ánh xạ nhãn và xử lý xung đột nằm ở mục "Tài liệu ôn thi đính kèm" trong SKILL.md.

Với **tầng điều ước quốc tế và tập quán**, bộ nguồn thay đổi hẳn vì vbpl.vn không phủ: bảng tình trạng UNCITRAL (uncitral.un.org) cho tư cách thành viên và bảo lưu của từng quốc gia đối với CISG; docs.wto.org cho văn kiện WTO và báo cáo vụ kiện; trungtamwto.vn (VCCI) cho bản dịch và danh mục FTA của Việt Nam; ấn phẩm gốc của ICC cho Incoterms và UCP. Tư cách thành viên và bảo lưu xếp cùng nhóm "luôn phải tra" với con số — chi tiết tại `thuong-mai-quoc-te.md`.

Nguồn tư nhân tiện hơn và thường lên top kết quả tìm kiếm, nên cám dỗ là dừng luôn ở đó. Dùng chúng để định vị nhanh thì tốt, nhưng một CCPL chỉ được nâng lên mức A khi đã khớp với nguồn nhà nước — bản trên trang tư nhân có thể là bản hợp nhất, bản chưa cập nhật lần sửa gần nhất, hoặc bản đã bị biên tập lại câu chữ.

Nếu công cụ không truy cập được nguồn cần thiết, đó là dữ kiện thật của tình huống chứ không phải trở ngại phải đi vòng: giữ nguyên nhãn C, nói rõ với người dùng là chưa tra được và tra được ở đâu. Không thay thế bằng một nguồn kém tin cậy hơn rồi trình bày như đã xác minh.

## Mẫu truy vấn

Công cụ cụ thể để chạy các truy vấn dưới đây (Parallel, Firecrawl, mẫu URL vbpl.vn, nguồn bị chặn) nằm ở `cong-cu-tra-cuu.md`.

Truy vấn theo số hiệu cho kết quả sạch hơn hẳn truy vấn theo nội dung, vì số hiệu là định danh duy nhất còn nội dung thì trùng lặp giữa hàng trăm bài phân tích.

- Biết số hiệu, cần tình trạng hiệu lực: `"64/2025/QH15" site:vbpl.vn` — hoặc dán thẳng số hiệu vào ô tìm kiếm của vbpl.vn.
- Biết tên văn bản, chưa biết số hiệu: `"Luật Bảo vệ dữ liệu cá nhân" số hiệu năm 2025 vbpl.vn`, lấy số hiệu rồi quay lại truy vấn trên.
- Cần nội dung một điều cụ thể: `"Điều 319" "Luật Thương mại 2005" nguyên văn` — thêm chữ "nguyên văn" hoặc trích một cụm từ nhớ được của quy phạm vào truy vấn giúp lọc bớt các bài bình luận.
- Nghi văn bản đã bị thay thế: `"Nghị định 13/2023/NĐ-CP" hết hiệu lực văn bản thay thế` — đây là truy vấn đáng chạy cho mọi văn bản dưới luật ban hành trước 2023.
- Cần văn bản hướng dẫn: sau khi mở văn bản trên vbpl.vn, đọc phần văn bản liên quan thay vì tìm kiếm mới, vì phần lớn con số cụ thể nằm ở nghị định và thông tư chứ không nằm trong luật.

## Đọc gì trên trang kết quả

Giao diện các cổng tra cứu thay đổi theo thời gian, nên đừng bám vào tên nút hay vị trí trên trang; bám vào bốn thông tin cần lấy về:

Tình trạng hiệu lực — còn hay hết, và nếu hết thì văn bản nào thay thế. Ngày có hiệu lực — đối chiếu với thời điểm sự kiện pháp lý trong đề, vì đây mới là mốc quyết định văn bản nào áp dụng, không phải ngày hiện tại. Nguyên văn điều khoản — đọc đủ cả phần "trừ trường hợp" và các khoản sau, vì phần loại trừ thường nằm ở khoản cuối cùng và đó chính là chỗ đề cài bẫy. Danh mục văn bản liên quan — văn bản sửa đổi, bổ sung, và văn bản hướng dẫn.

Một chi tiết dễ bỏ sót: khi văn bản đã qua nhiều lần sửa, số Điều có thể giữ nguyên nhưng nội dung khoản đã khác. Đọc chú thích về lần sửa đổi gần nhất áp dụng cho đúng điều đang tra, đừng chỉ đọc thân điều.

## Bốn tình huống kết quả và cách xử lý

**Khớp hoàn toàn** — số điều, số khoản, nội dung và tình trạng hiệu lực đều đúng như trí nhớ. Nâng lên mức A, trích đến điểm/khoản, không cần đưa vào dòng nhắc đối chiếu ở cuối.

**Số Điều đúng, số khoản lệch** — đây là tình huống hay gặp nhất và cũng là lý do bước này tồn tại. Sửa theo văn bản gốc, không theo trí nhớ, kể cả khi trí nhớ rất chắc. Sau khi sửa thì nâng lên mức A. Nếu tra được nội dung nhưng không xác định được chắc chắn số khoản, lùi về trích đến cấp Điều ở mức B — trích đúng đến Điều luôn tốt hơn trích đến khoản mà sai.

**Văn bản đã hết hiệu lực hoặc bị thay thế** — dừng toàn bộ nhánh lập luận đang dựa trên văn bản đó, đừng chữa cháy bằng cách giữ lập luận rồi đổi tên văn bản. Kiểm tra hai điều trước khi làm lại: thời điểm sự kiện pháp lý trong đề rơi trước hay sau ngày văn bản cũ hết hiệu lực (nếu trước thì văn bản cũ vẫn là văn bản đúng, và đây là một điểm cộng nếu chỉ ra được), và văn bản mới có điều khoản chuyển tiếp nào cho quan hệ xác lập trước đó không. Chỉ sau hai bước này mới dựng lại lập luận theo văn bản mới.

**Không tìm được, hoặc các nguồn mâu thuẫn nhau** — không suy đoán để lấp chỗ trống. Nếu mâu thuẫn về tình trạng hiệu lực thì tin công báo và vbpl.vn, đồng thời nói rõ với người dùng là có mâu thuẫn thay vì im lặng chọn một bên. Nếu không tìm được và đây lại là điều khoản quyết định kết luận thì đã chạm Ngưỡng dừng — xử lý theo mục Ngưỡng dừng trong SKILL.md.

## Khi không có công cụ tra cứu

Không tra được không có nghĩa là quay về đoán. Ba việc vẫn làm được và chúng thay thế được phần lớn giá trị của việc tra cứu:

**Tự kiểm tra bằng phép trích nguyên văn.** Thử viết ra nguyên văn quy phạm. Nếu viết được trôi chảy và đủ cả phần loại trừ thì trí nhớ về điều khoản đó khá đáng tin, giữ mức B. Nếu chỉ nhớ được ý mà không dựng lại được câu chữ, hoặc phải viết "quy định rằng về cơ bản là...", thì đó là tín hiệu rõ ràng của mức C — ý thì nhớ, địa chỉ điều khoản thì không.

**Kiểm tra chéo bằng cấu trúc văn bản.** Một số điều phải nằm đúng chỗ trong bố cục của văn bản. Nếu định trích một quy định về chế tài mà số điều lại rơi vào phần quy định chung ở đầu bộ luật, khả năng cao là nhớ nhầm. Phép kiểm tra này không xác nhận được điều gì nhưng bác bỏ được khá nhiều sai sót.

**Chuyển việc tra cứu sang cho người học, kèm chỉ dẫn đủ để làm trong hai phút.** Nêu số hiệu văn bản, tên điều cần tìm, và thông tin cần lấy về. Cách này còn có lợi ích phụ đáng kể: thao tác tự tra là kỹ năng hành nghề thật, và người tự mở vbpl.vn vài lần sẽ nhớ điều luật chắc hơn hẳn người đọc một câu trả lời đã dọn sẵn.

## Danh mục luôn phải tra, không có ngoại lệ

Bốn nhóm dưới đây không được đưa vào câu trả lời ở mức A nếu chưa đối chiếu trong phiên, dù trí nhớ có chắc đến đâu:

Mọi con số cụ thể không có sẵn trong các file reference của kỹ năng này — mức phạt, ngưỡng định lượng để định tội, tỷ lệ, thời hạn thủ tục, mức vốn. Mọi văn bản ban hành hoặc sửa đổi từ năm 2023 trở lại đây, kể cả khi chỉ trích đến cấp Điều. Mọi nghị định xử phạt vi phạm hành chính, vì nhóm này bị sửa và thay thế với tần suất cao hơn hẳn phần còn lại của hệ thống. Và mọi văn bản dưới luật ban hành trước năm 2023 mà chưa kiểm tra tình trạng hiệu lực — nhóm này rủi ro không nằm ở số khoản mà ở chỗ văn bản có thể đã bị thay mà tài liệu ôn thi cũ vẫn dẫn.
