# Bài tập có số liệu — dạng dẫn đúng điều luật mà vẫn sai kết quả

Dạng này khác mọi dạng khác ở một điểm quyết định: **bước rà bẫy thông thường không cứu được nó.** Ở các dạng khác, dẫn đúng điều luật thì gần như chắc chắn ra đúng kết luận. Ở dạng định lượng, một bài có thể dẫn đủ cả Điều 58 lẫn Điều 59, trích đúng nguyên văn, gọi tên đúng chế định — và vẫn ra kết luận ngược, chỉ vì lấy sai mẫu số. Người chấm không có cách nào cho điểm một kết luận đảo chiều, nên toàn bộ phần dẫn luật đúng ở trên gần như mất trắng.

Vì vậy khi đề có số liệu mà kết luận phụ thuộc vào số liệu đó, mở file này ở bước 4 và chạy quy trình bên dưới trước khi tính bất cứ phép nào.

Cảnh báo về nhãn: mọi con số ngưỡng trong file này mặc định **mức B** — nhớ từ văn bản ổn định, chưa đối chiếu trong phiên. Chỉ lên mức A sau khi đối chiếu văn bản gốc theo `quy-trinh-xac-minh.md`. Riêng ngưỡng nằm trong nghị định, thông tư hoặc trong văn bản sửa sau 2023 thì mặc định **mức C** và phải tra trước khi đưa vào bài.

## Bẫy mẫu số — lỗi đắt nhất của cả dạng bài

Cơ chế: trong cùng một tình huống, luật dùng nhiều mẫu số khác nhau cho nhiều phép tính khác nhau, và đề được dựng đúng quanh chỗ đó. Người làm bài tính phép thứ nhất đúng, rồi mang y nguyên mẫu số ấy sang phép thứ hai.

Ví dụ neo, công ty trách nhiệm hữu hạn hai thành viên trở lên theo Luật Doanh nghiệp năm 2020:

**Điều kiện tiến hành cuộc họp Hội đồng thành viên** tính trên **vốn điều lệ** — khoản 1 Điều 58 đòi số thành viên dự họp sở hữu từ 65% vốn điều lệ trở lên, và Điều lệ công ty có thể quy định tỷ lệ cụ thể khác.

**Tỷ lệ thông qua nghị quyết tại cuộc họp** tính trên **tổng số vốn góp của các thành viên dự họp** — khoản 3 Điều 59. Mẫu số đã đổi, và đổi theo hướng nhỏ đi.

**Tỷ lệ thông qua nghị quyết theo hình thức lấy ý kiến bằng văn bản** lại tính trên **tổng số vốn góp của tất cả thành viên** — mẫu số thứ ba, quay về gần với mẫu số thứ nhất. Đây là chỗ đề khai thác khi tình huống không có cuộc họp mà chỉ có văn bản lấy ý kiến.

Ba mẫu số trong một chế định, và chúng nằm ở ba khoản khác nhau của hai điều liền kề. Minh họa hậu quả bằng số: cuộc họp có 2.300/3.000 vốn dự họp, số phiếu tán thành đại diện 1.800. Lấy mẫu số dự họp thì 1.800/2.300 = 78,26%, vượt ngưỡng 75% nên nghị quyết được thông qua. Lấy nhầm mẫu số vốn điều lệ thì 1.800/3.000 = 60%, dưới 75% và kết luận đảo chiều thành không được thông qua.

Cấu trúc mẫu số tương tự lặp lại ở công ty cổ phần với một biến thể riêng: mẫu số không phải tổng số cổ phần mà là **tổng số phiếu biểu quyết**, vì cổ phần ưu đãi cổ tức và cổ phần ưu đãi hoàn lại không mang quyền biểu quyết. Một đề cho tổng số cổ phần rồi cài vào đó một tỷ lệ cổ phần ưu đãi là đề đang kiểm tra đúng điểm này. Số điều của các loại cổ phần ưu đãi nằm trong nhóm Điều 114 và các điều kế tiếp của Luật Doanh nghiệp năm 2020 — trích đến cấp Điều thì được, xuống cấp khoản phải đối chiếu.

**Một cảnh báo hiệu lực riêng cho ví dụ neo này.** Luật Doanh nghiệp năm 2020 đã được sửa đổi, bổ sung bởi Luật số 03/2022/QH15 và Luật số 76/2025/QH15 (hiệu lực 01/7/2025). Theo các nguồn tổng hợp về Luật số 76/2025, Điều 57 về triệu tập họp Hội đồng thành viên nằm trong danh mục điều bị sửa (bổ sung quy định về trình tự, thủ tục mời họp trong trường hợp đặc biệt), còn Điều 58 và Điều 59 không xuất hiện trong danh mục đó. Đã đối chiếu bản PDF Luật số 76/2025/QH15 trên datafiles.chinhphu.vn ngày 04/11/2026: Điều 1 của luật này bổ sung khoản 9 Điều 57 và **không** sửa Điều 58, Điều 59, Điều 177, Điều 180, Điều 187, Điều 188. Hệ quả thực hành: các con số 65% và 75% dùng được ở mức B, nhưng nếu đề chạm phần **triệu tập** họp thì bắt buộc mở Luật số 76/2025/QH15 trước khi trả lời.

## Quy trình bốn bước

Chạy đủ bốn bước theo thứ tự. Bước 2 là bước mà bỏ qua sẽ hỏng cả bài, và nó cũng là bước duy nhất không tốn thời gian tra cứu.

**Bước 1 — tách mỗi câu hỏi thành một phép tính riêng, không dùng chung kết quả trung gian.** Một tình huống hỏi ba câu thì có ba phép tính độc lập, kể cả khi chúng dùng chung dữ liệu đầu vào. Việc tái sử dụng kết quả của phép trước chính là đường dẫn vào bẫy mẫu số.

**Bước 2 — với từng phép tính, viết ra mẫu số là gì và điều khoản nào ấn định mẫu số đó.** Viết thành chữ, không giữ trong đầu: "mẫu số là tổng vốn góp của thành viên dự họp, theo khoản 3 Điều 59". Nếu không chỉ ra được điều khoản ấn định mẫu số, nghĩa là đang giả định mẫu số chứ không phải tra ra — dừng lại tra trước khi tính.

**Bước 3 — tra ngưỡng, và tra hai thứ đi kèm ngưỡng.** Thứ nhất, dạng so sánh: "từ 65% trở lên" bao gồm đúng 65%, còn "trên 50%" thì không bao gồm đúng 50%. Một điểm rơi đúng vào ngưỡng là dấu hiệu gần như chắc chắn rằng đề đang kiểm tra chi tiết này. Thứ hai, Điều lệ hoặc thỏa thuận có được quy định khác không: nhiều ngưỡng trong Luật Doanh nghiệp là ngưỡng mặc định mà Điều lệ được nâng lên, nên đề ghi "Điều lệ không quy định khác" là đang chủ động đóng nhánh đó lại — và ngược lại, đề không nói gì về Điều lệ là đang mở một nhánh phải điều kiện hóa. Lưu ý thêm: một số cụm "trừ trường hợp Điều lệ công ty có quy định khác" đã bị Luật số 76/2025/QH15 bỏ đi ở một vài điều, nên đừng mặc định cụm đó vẫn còn.

**Bước 4 — so sánh và kết luận, không làm tròn theo hướng có lợi.** Giữ hai chữ số thập phân là đủ. Tuyệt đối không làm tròn một con số sát ngưỡng lên cho vừa ngưỡng — nếu kết quả rơi rất sát, đó là dấu hiệu đề cố ý dựng như vậy, và câu trả lời phải nói rõ nó nằm bên nào của ngưỡng.

## Danh mục ngưỡng phải tra

Đây không phải bảng tra cứu để chép vào bài mà là danh sách các loại ngưỡng cần nhận diện. Với mỗi loại, ghi kèm chỗ ngưỡng thường nằm — vì đó mới là thông tin quyết định phải mở văn bản nào.

**Ngưỡng quản trị doanh nghiệp** — điều kiện tiến hành họp và tỷ lệ thông qua nghị quyết của Hội đồng thành viên và Đại hội đồng cổ đông; tỷ lệ sở hữu để có quyền đề cử, yêu cầu triệu tập họp, yêu cầu hủy nghị quyết. Nằm trong Luật Doanh nghiệp năm 2020 đã sửa đổi. Nhóm này có đặc điểm là ngưỡng lần triệu tập thứ hai và thứ ba thấp hơn lần đầu, nên một đề nêu "cuộc họp lần hai" là đang kiểm tra đúng chỗ đó.

**Ngưỡng chế tài hợp đồng** — mức trần phạt vi phạm 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm theo Điều 301 Luật Thương mại năm 2005, kèm ngoại lệ tại Điều 266; và việc Bộ luật Dân sự năm 2015 không đặt trần cho phạt vi phạm. Ranh giới và cách chọn giữa hai chế độ nằm ở mục đầu tiên của `cap-khai-niem-de-lan.md`.

**Ngưỡng thời hạn và thời hiệu** — bảng đối chiếu trong `he-thong-van-ban-va-ap-dung.md`. Điểm cần tra thêm mỗi lần: đơn vị đếm là ngày hay ngày làm việc, và mốc bắt đầu tính là ngày nào. Hai chi tiết này quyết định kết quả nhiều hơn cả bản thân con số.

**Ngưỡng định lượng để định tội và để xử phạt hành chính** — nhóm rủi ro cao nhất, vì phần lớn nằm ở nghị định, bị sửa với tần suất cao, và sai thì đổi cả tội danh chứ không chỉ đổi mức. Mặc định mức C, không đưa vào bài nếu chưa tra được.

**Ngưỡng điều kiện chủ thể và điều kiện kinh doanh theo lĩnh vực** — vốn điều lệ tối thiểu, tỷ lệ sở hữu, quy mô giao dịch, tỷ lệ thanh toán theo tiến độ. Nhóm này nằm rải ở luật chuyên ngành và nghị định hướng dẫn, và có một đặc điểm chung đáng nhớ: các điều kiện thường nối nhau bằng liên từ **"và"** chứ không phải "hoặc", tức phải thỏa đồng thời. Đọc lướt thành "hoặc" là một trong những lỗi đọc câu chữ đắt nhất của cả dạng bài — kỹ thuật đọc liên từ nằm trong `giai-thich-phap-luat.md`.

## Cách trình bày phép tính

Bốn quy tắc, tất cả đều nhằm một việc: để người chấm thấy ngay mình lấy mẫu số nào, vì đó chính là chỗ được chấm.

**Kết luận đặt trước phép tính ở mỗi khối.** "Cuộc họp thứ nhất không hợp lệ" rồi mới đến con số. Người chấm đọc kết luận trước, phép tính chỉ để kiểm chứng.

**Viết dạng phân số đầy đủ, có cả tử và mẫu, kèm kết quả phần trăm.** "1.000 + 500 + 800 = 2.300/3.000 = 76,67%" cho thấy ngay mẫu số là 3.000. Viết thẳng "76,67%" thì người chấm không biết mình lấy mẫu số nào và không thể cho điểm phần đó.

**Nêu mẫu số bằng chữ ngay cạnh phép tính, kèm điều khoản ấn định nó.** Đây là câu đắt nhất trong cả khối. Với dạng bài này, câu "theo khoản 3 Điều 59, tỷ lệ tán thành tính trên tổng số vốn góp của các thành viên dự họp, không phải trên vốn điều lệ" có giá trị điểm cao hơn cả phép tính, vì nó chứng minh mình biết mẫu số đổi chứ không phải tính đúng do may.

**So với ngưỡng bằng đúng cách diễn đạt của văn bản.** "Vượt mức từ 65% trở lên" chứ không phải "trên 65%" — sao chép đúng dạng so sánh của quy phạm là cách rẻ nhất để chứng minh mình đã đọc nguyên văn.

Cuối cùng, nếu bài có một chỗ mà lấy nhầm mẫu số sẽ đảo chiều kết luận, nói thẳng ra chỗ đó trong một câu. Đây vừa là phần gọi tên bẫy theo yêu cầu chung của kỹ năng, vừa là thứ người chấm nhìn vào để phân biệt bài hiểu cơ chế với bài tính đúng ngẫu nhiên.

## Ví dụ 3 — bài tập tình huống có số liệu (neo dạng định lượng)

*Đề thi thật môn Pháp luật về chủ thể kinh doanh, Đại học Luật TP. Hồ Chí Minh; phần trả lời do kỹ năng soạn, không phải barem của giảng viên. Ví dụ neo độ dài, thứ tự nhịp và giọng văn — khi quy tắc mâu thuẫn với ví dụ, ví dụ thắng.*

**Đề bài rút gọn:** Công ty TNHH Mỹ Kim có vốn điều lệ 3 tỷ đồng: Bình 1 tỷ, Minh 800 triệu, Thủy 700 triệu, Lan 500 triệu. Điều lệ không quy định khác Luật Doanh nghiệp. Minh triệu tập họp Hội đồng thành viên thông qua báo cáo tài chính, chỉ có Minh và Lan dự. Hai mươi ngày sau, Minh triệu tập họp thông qua nghị quyết sáp nhập công ty; lần này có Bình, Lan và Minh dự, khi biểu quyết chỉ Lan không chấp thuận. Hỏi hai cuộc họp có hợp lệ không và nghị quyết sáp nhập có được thông qua không.

**Cách xử lý đúng:** Cuộc họp thứ nhất không hợp lệ, cuộc họp thứ hai hợp lệ, và nghị quyết sáp nhập được thông qua.

Cuộc họp thứ nhất có Minh và Lan, tức 800 + 500 = 1.300/3.000 = 43,33% vốn điều lệ, dưới ngưỡng 65% tại khoản 1 Điều 58 Luật Doanh nghiệp năm 2020, nên không đủ điều kiện tiến hành.

Cuộc họp thứ hai có Bình, Lan và Minh, tức 1.000 + 500 + 800 = 2.300/3.000 = 76,67% vốn điều lệ, vượt 65% nên hợp lệ. Không cần viện dẫn cơ chế triệu tập lần hai tại khoản 2 Điều 58. Nội dung họp đã khác (sáp nhập thay vì báo cáo tài chính), và lần triệu tập sau 20 ngày đã quá thời hạn 15 ngày gửi thông báo mời họp lần thứ hai. Đây là một cuộc họp mới, đủ điều kiện ngay ở lần thứ nhất.

Về tỷ lệ thông qua, **mẫu số đổi**: theo khoản 3 Điều 59, tỷ lệ tán thành tính trên tổng số vốn góp của các thành viên **dự họp**, không phải trên vốn điều lệ. Tán thành là Bình và Minh: 1.000 + 800 = 1.800/2.300 = 78,26%. Sáp nhập thuộc nhóm tổ chức lại công ty tại điểm b khoản 3 Điều 59, cần từ 75% trở lên, nên nghị quyết được thông qua.

Đây chính là chỗ mất điểm của cả dạng bài. Nếu lấy vốn điều lệ làm mẫu số thì ra 1.800/3.000 = 60%, dưới 75%, và kết luận đảo chiều thành "không được thông qua" — dù bài đã dẫn đủ cả Điều 58 lẫn Điều 59.

*Phép tính viết ra dạng phân số, kết luận đặt trước phép tính ở mỗi khối. Quy trình đầy đủ ở các mục trên. Không có dòng nhắc đối chiếu vì ví dụ giả định Điều 58 và Điều 59 đã được đối chiếu văn bản gốc trong phiên (mức A); chưa đối chiếu thì bắt buộc có dòng đó, vì mọi ngưỡng phần trăm mặc định là thứ phải tra.*
