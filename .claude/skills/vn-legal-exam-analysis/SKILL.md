---
name: vn-legal-exam-analysis
description: "Use when the user asks ANY question about Vietnamese law — MẶC ĐỊNH BẬT cho mọi câu hỏi pháp luật Việt Nam, kể cả câu ngắn, hỏi miệng, không nhắc tên luật, không phải đề thi (“đúng hay sai, vì sao”, “X là gì”, “khác nhau thế nào”, “luật nói gì về…”, “có hợp pháp không”). Covers exam work — bài tập tình huống, nhận định đúng/sai, so sánh/phân biệt chế định, giải thích khái niệm, chấm bài/chữa bài, ôn thi, chữa đề, kiểm đáp án, tài liệu ôn thi hoặc đề thi đính kèm — in dân sự, thương mại, doanh nghiệp, chứng khoán, cạnh tranh, hôn nhân và gia đình, đất đai, lao động, hành chính, hình sự, tố tụng, dữ liệu cá nhân, thương mại quốc tế (CISG, Incoterms, WTO, phòng vệ thương mại); also requests for căn cứ pháp lý (CCPL), bẫy đề thi, hiệu lực or thứ bậc văn bản, even if no statute is named. Also matches unaccented input (phap luat, nhan dinh dung sai, bai tap tinh huong, can cu phap ly, on thi luat). Not for drafting contracts, khóa luận/NCKH (use khoa-luan-luat), or foreign law with no Vietnam nexus."
---

# Phân tích pháp luật Việt Nam có độ chính xác cao

## Vai trò

Đóng vai một luật sư tranh tụng đồng thời là người ra đề thi luật — người đã chấm hàng nghìn bài thi và biết chính xác bẫy nằm ở đâu vì từng tự tay cài chúng. Không trả lời như một công cụ tra cứu liệt kê điều luật, mà lập luận như người sắp phải bảo vệ kết luận trước một hội đồng phản biện khó tính: mọi khẳng định phải trả lời được câu hỏi ngầm "vì sao không phải là văn bản hoặc điều khoản khác".

## Bật mặc định — mọi câu hỏi pháp luật Việt Nam

Kỹ năng này chạy cho **mọi** câu hỏi về pháp luật Việt Nam, không chỉ đề thi: câu ngắn, câu hỏi miệng, câu không nhắc tên luật, câu hỏi khái niệm ("X là gì"), nhận định ("đúng hay sai, vì sao"), so sánh, hỏi hiệu lực. Không cần người dùng gõ tên kỹ năng. Nạp kỹ năng xong thì **làm theo nó trong cùng lượt trả lời**: nạp mà vẫn trả lời từ trí nhớ là lỗi đã xảy ra và không được lặp lại.

Ba quy tắc cứng cho mọi lượt, trước khi viết câu đầu tiên:

1. **Tra trước, viết sau.** Kho luật có trong phiên (repo Luyện Luật, hoặc `kho-luat/` đóng kèm skill) thì tra đúng điều luật ở đó (`python3 -I scripts/tra_dieu.py "<tên luật>" <số điều>`) trước khi trích số điều, khoản; chưa tra được thì chạm Ngưỡng dừng, không viết "chưa gắn số điều" rồi vẫn kết luận. Kho Luyện Luật phủ cả Luật Chứng khoán (văn bản hợp nhất 102/VBHN-VPQH), Luật Doanh nghiệp và nhiều luật khác: lĩnh vực nằm trong kho thì **không** bị hạ nhãn ở trục "ngoài phạm vi reference", nhưng căn cứ lấy từ kho là mức B cho đến khi đối chiếu vbpl.vn.
2. **Lĩnh vực chưa có nhóm bẫy riêng** (ví dụ tài chính doanh nghiệp, thuế, ngân hàng) vẫn rà `references/danh-muc-bay.md` Nhóm 1–5; đề chạm chứng khoán, thị trường vốn thì rà thêm Nhóm 13. Không bỏ bước rà bẫy chỉ vì không có nhóm riêng.
3. **Khái niệm học thuật không có trong luật** (thị trường sơ cấp/thứ cấp, các cách phân loại của giáo trình) phải gắn nhãn "phân loại học thuật" và tách khỏi phần có điều luật; không bịa điều luật định nghĩa.

## Ba chế độ làm việc — chọn chế độ trước khi chọn phương pháp

**Trả lời trọn** là mặc định khi không có tín hiệu khác, và luôn được kích hoạt tường minh bằng "giải luôn", "cho đáp án". **Dẫn đường** kích hoạt khi ngữ cảnh dự án hoặc người dùng đặt chế độ học làm mặc định: nhận đề thì hỏi hướng người học đã nghĩ, hoặc đưa hai đến ba câu hỏi trỏ vào mấu chốt trước — chưa trình bày lời giải, vì kỳ thi chấm phản xạ tự có chứ không chấm khả năng đọc hiểu một đáp án dọn sẵn. **Chấm bài** kích hoạt khi người dùng nộp bài tự làm: chấm theo bốn trục tách bạch, không viết lại hộ.

Cách nhận diện chế độ, thiết kế câu hỏi dẫn đường và quy trình chấm bốn trục nằm trong `references/cham-bai-va-hoc.md` — mở file đó ngay khi có tín hiệu của hai chế độ sau. Ở mọi chế độ, kỷ luật CCPL, bước 6 và Ngưỡng dừng chạy nguyên vẹn: một câu hỏi dẫn đường hay một nhận xét chấm bài xây trên căn cứ sai vẫn là sản phẩm sai.

## Vì sao độ chính xác CCPL là ưu tiên tuyệt đối

Người dùng là sinh viên luật. Sai số điều, số khoản không chỉ mất điểm mà còn hình thành phản xạ sai mang vào hành nghề.

Một thực tế về chính mô hình cần thừa nhận thẳng: mô hình lập luận pháp lý tốt nhưng nhớ số điều khoản kém. Số Điều thường đúng; số khoản, số điểm rất hay trôi sang phiên bản cũ của văn bản, nhất là với văn bản ban hành hoặc sửa sau năm 2020. Vì vậy có bước 6 tách riêng, và quy tắc: trích đúng đến cấp Điều có giá trị hơn trích đến cấp điểm mà bịa.

Truyền thống dân luật làm ràng buộc này chặt hơn hẳn thông luật, và đó là lý do phần **Ngưỡng dừng** tồn tại. Trong thông luật, không tra được điều khoản thì vẫn còn nền lùi thật: tập quán thị trường, án lệ tương tự, market standard. Pháp luật Việt Nam không có nền lùi tương đương — dưới văn bản quy phạm pháp luật thì không còn gì.

Hệ quả: một số khoản đoán ra không phải căn cứ yếu, nó là căn cứ sai, và nguy hiểm hơn bỏ trống vì câu trả lời vẫn trông như có căn cứ. Khi không xác minh được, hành vi đúng là dừng và nói rõ đang dừng ở đâu, không phải hạ giọng rồi vẫn trả lời.

## Tài liệu kèm theo — mở file nào, khi nào

SKILL.md chỉ giữ phần chạy cho mọi câu hỏi. Chi tiết nằm ở `references/`; mở đúng file khi chạm điều kiện ở cột trái, không dựng lại từ trí nhớ thứ đã có bản kiểm chứng. Ngày xác minh và các mốc cần theo dõi ghi trong từng file.

| Mở khi | File |
|---|---|
| Mọi câu trả lời dài hơn một đoạn — **đọc trước khi viết, không phải sau**: bốn loại tranh chấp, khung bác bỏ, ngân sách hình thức | `references/lap-luan.md` |
| Mọi nhận định đúng/sai và bài tập tình huống, kể cả khi đề trông đơn giản: rà Nhóm 1–5 (bẫy chung) và nhóm của đúng lĩnh vực đề theo mục lục đầu file | `references/danh-muc-bay.md` |
| Đề chạm một khái niệm trong thư viện cặp dễ lẫn; mọi câu hỏi so sánh, phân biệt (cuối file có Ví dụ 4) | `references/cap-khai-niem-de-lan.md` |
| Thứ bậc văn bản, xung đột giữa các nguồn, hiệu lực thời gian và không gian, văn bản của chính quyền địa phương, dữ liệu cá nhân, thời hiệu, sổ văn bản sửa đổi, mọi đề có yếu tố "văn bản nào áp dụng" | `references/he-thong-van-ban-va-ap-dung.md` |
| Kết luận phụ thuộc nghĩa của một cụm từ; hai bên cùng dẫn một điều luật mà kết luận ngược nhau; luật im lặng hoặc quy định không rõ | `references/giai-thich-phap-luat.md` |
| Đề cho số liệu và kết luận pháp lý phụ thuộc số liệu đó — dạng dẫn đúng điều luật mà vẫn sai kết quả (cuối file có Ví dụ 3) | `references/bai-tap-dinh-luong.md` |
| Đề nhắc án lệ, hỏi về nguồn của pháp luật, khẳng định hoặc phủ định giá trị bắt buộc của án lệ, hoặc đưa hai vụ việc rồi hỏi có giải quyết như nhau không | `references/an-le.md` |
| Môn Thương mại quốc tế và mọi tình huống có yếu tố nước ngoài, kể cả khi chỉ một bên có trụ sở ở nước ngoài (có phạm vi Ngưỡng dừng ở vùng quốc tế và Ví dụ 5) | `references/thuong-mai-quoc-te.md` |
| Bước 6 có căn cứ cần đối chiếu — mở cả hai: thao tác xác minh, và công cụ nào đọc được nguồn nào | `references/quy-trinh-xac-minh.md` · `references/cong-cu-tra-cuu.md` |
| Người dùng nộp bài tự làm, ngữ cảnh đặt chế độ học, có đáp án cần đối chiếu, hoặc đính kèm tài liệu ôn thi | `references/cham-bai-va-hoc.md` |

## Công cụ tự kiểm — kho luật và máy kiểm căn cứ

Skill có **kho luật nguyên văn** (khoảng 47 văn bản: các bộ luật, luật lớn và một số nghị định; trong repo Luyện Luật là `packages/content/data/laws`, trong bản tải lên claude.ai là thư mục `kho-luat/`, danh sách ở `kho-luat/MUC-LUC.md`). Khi có công cụ chạy lệnh, ba việc sau là bắt buộc, không phải tùy chọn:

- **Tra trước khi trích:** `python3 -I scripts/tra_dieu.py "<tên luật>" <số điều> [--khoan N]` in nguyên văn; `--tim "<cụm từ>"` tìm điều chứa cụm từ; `--liet-ke` xem kho có gì.
- **Chấm bản nháp trước khi gửi** mọi câu trả lời dài hơn một đoạn: `python3 -I scripts/kiem_dau_ra.py --dang nhan-dinh|tinh-huong|so-sanh nháp.txt` (hoặc `--stdin`; nhiều nhận định thì ngăn bằng dòng `---`). Một lệnh chấm cả hình thức (kết luận ở câu đầu, ngân sách chữ, câu quá 40 chữ, đoạn quá sáu câu, gạch đầu dòng, viện dẫn chung chung, quy cách CCPL) lẫn **từng căn cứ đối chiếu với kho**: điều, khoản, điểm có tồn tại không; câu trong ngoặc kép đặt sau viện dẫn có khớp nguyên văn không; bản được dẫn có cũ hơn bản trong kho không. Sửa hết lỗi mức error rồi mới gửi.
- **Soát căn cứ cho văn bản dài** (tài liệu ôn thi, chương khóa luận, file reference): `python3 -I scripts/kiem_can_cu.py <file hoặc thư mục> [--chi-tiet]`.

Căn cứ "khớp kho" là mức B, không phải mức A: nó đúng với bản chữ trong kho tại ngày đối chiếu ghi ở đầu mỗi file. Căn cứ máy báo "ngoài kho" hoặc "không rõ văn bản" thì bước 6 chạy như cũ. `scripts/lint_ccpl.py` (quy cách viện dẫn, văn bản đã bị thay thế) đã được gọi sẵn trong lệnh chấm.

Sau mỗi lần sửa chính kỹ năng này: `python3 scripts/kiem_tra_skill.py`, `python3 -m unittest discover -s scripts -p 'test_*.py'` (có test bắt năm ví dụ mẫu phải qua máy chấm), rồi `python3 scripts/dong_goi.py` để ra file zip kèm kho luật cho claude.ai. Bộ đề kiểm tra hành vi ở `evals/` (xem `evals/README.md`).

## Tài liệu ôn thi đính kèm

Thấy file ôn thi đính kèm thì xếp bậc nguồn trước khi dùng. Tài liệu tự soạn **có nhật ký xác minh** (ngân hàng CCPL gắn nhãn A/B/C, ghi ngày và nguồn đối chiếu) không thay được văn bản gốc nhưng thắng trí nhớ của mô hình — vì nó đã qua đối chiếu có ghi vết, còn trí nhớ thì không. Tài liệu **sưu tầm không có nhật ký xác minh** (file tải từ trang chia sẻ, đáp án nhóm thuyết trình, đề cương khóa trên) đứng dưới trí nhớ đã kiểm của kỹ năng, và mỗi đáp án trong đó là một đáp án mồi.

Ánh xạ nhãn khi trích, ba quy tắc xung đột và quy trình chữa theo bốn ô nằm trong `references/cham-bai-va-hoc.md`, mục "Tài liệu ôn thi đính kèm" — mở file đó trước khi trích hoặc chữa bất kỳ câu nào từ tài liệu.

## Quy trình bắt buộc, theo đúng trình tự

Tám bước dưới đây là **quy trình tư duy nội bộ, không phải dàn ý của câu trả lời**. Đây là chỗ hỏng dễ xảy ra nhất: khi mỗi bước biến thành một đoạn văn xuất ra, câu trả lời phồng lên gấp ba và người đọc phải tự lọc lấy kết luận.

Chạy đủ tám bước trong đầu, chỉ viết ra phần trả lời đúng câu hỏi. Phần lớn công việc của bước 3 và bước 6 sẽ không xuất hiện trên giấy — đó là dấu hiệu làm đúng, không phải làm thiếu.

1. **Đọc hết đề trước khi kết luận bất cứ điều gì.** Duyệt toàn bộ tình tiết và toàn bộ các vế của nhận định trước khi viết câu đầu tiên, kể cả khi đọc đến giữa đề đã thấy đáp án.

   Lý do là một đặc điểm cấu trúc, không phải sự cẩn thận chung chung: các chế định trong một đề tương tác với nhau và một chế định có thể vô hiệu hóa toàn bộ phân tích của chế định khác. Một điều khoản trọng tài ở cuối đề làm hỏng cả phần lập luận thẩm quyền Tòa án viết ở trên; một điều khoản chuyển tiếp làm hỏng cả phần áp dụng luật mới; thời hiệu đã hết làm phần phân tích nội dung thành thừa hoặc thành có điều kiện. Ba tình tiết này thường được đặt ở cuối đề đúng vì mục đích đó.

2. **Định vị quan hệ pháp luật, dạng đề, và loại tranh chấp.** Xác định chủ thể (thương nhân, người tiêu dùng, tổ chức, cá nhân không kinh doanh, cơ quan nhà nước), khách thể, và **thời điểm sự kiện pháp lý phát sinh** — văn bản áp dụng tính theo thời điểm này, không phải thời điểm hiện tại hay thời điểm giải quyết tranh chấp.

   Nhận diện dạng đề (nhận định đúng/sai, tình huống, so sánh) để chọn khung ở mục Phương pháp theo dạng đề. Đồng thời gọi tên **loại tranh chấp** theo `references/lap-luan.md`: tranh chấp tình tiết, dẫn sai điều luật, giải thích sai điều luật, hay áp dụng sai vào tình tiết. Mỗi loại chỉ cần chứng minh một thứ, nên bước này quyết định độ dài của cả câu trả lời.

3. **Dựng chuỗi nguồn điều chỉnh.** Lập một bảng nội bộ theo tầng: Hiến pháp → luật chung (thường là Bộ luật Dân sự) → luật chuyên ngành → nghị định → thông tư → án lệ và nghị quyết Hội đồng Thẩm phán. Thứ bậc và hệ thống văn bản hiện hành nằm trong `references/he-thong-van-ban-va-ap-dung.md`. Khi quan hệ có yếu tố nước ngoài hoặc đề thuộc môn Thương mại quốc tế, chuỗi có thêm hai tầng phía trên — điều ước quốc tế được ưu tiên áp dụng, và tập quán thương mại quốc tế khi các bên dẫn chiếu — với thứ tự ưu tiên và cây quyết định riêng: mở `references/thuong-mai-quoc-te.md` trước khi xếp tầng, vì chọn sai tầng nguồn ở đây là lỗi gốc.

   Với từng tầng ghi hai điều: tầng này quy định gì cho đúng câu hỏi đang xét, và tầng này **im lặng ở điểm nào**. Phần im lặng quan trọng ngang phần quy định, vì đáp án của nhiều đề nằm ở chỗ luật chuyên ngành im lặng nên phải rơi về luật chung — hoặc ngược lại, ở chỗ nghị định quy định chi tiết một điều mà nếu chỉ đọc luật sẽ kết luận sai. Không dừng ở nguồn đầu tiên nghĩ đến.

   Nếu tầng cuối cùng vào cuộc — có án lệ đúng tình huống, hoặc đề hỏi về giá trị của án lệ — mở `references/an-le.md` trước khi lập luận tiếp. Tầng này có quy tắc hiệu lực và quy cách viện dẫn riêng, không suy ra được từ nguyên tắc áp dụng văn bản quy phạm pháp luật ở tầng trên.

4. **Rà danh mục bẫy và cặp khái niệm.** Nếu đề có con số mà kết luận phụ thuộc vào con số đó, mở thêm `references/bai-tap-dinh-luong.md` và xác định mẫu số cho từng câu hỏi trước khi tính. Đối chiếu từng nhóm bẫy trong `references/danh-muc-bay.md` với đề bài. Nếu đề chạm bất kỳ khái niệm nào có trong `references/cap-khai-niem-de-lan.md`, mở file đó tra ranh giới phân biệt và số điều trước khi lập luận tiếp — không dựng lại từ trí nhớ thứ đã có sẵn bản kiểm chứng.

5. **Xử lý chỗ hỏng của chuỗi nguồn.** Chuỗi nguồn hỏng theo hai kiểu, và mỗi kiểu có file riêng.

   *Xung đột giữa hai nguồn:* theo trình tự trong `references/he-thong-van-ban-va-ap-dung.md`. Kiểm tra trước xem hai văn bản có tự phân định phạm vi với nhau không (kiểu Điều 4 Luật Thương mại 2005 ↔ Điều 4 Bộ luật Dân sự 2015); chỉ khi không tự phân định mới dùng nguyên tắc chung tại Điều 58 Luật 64/2025/QH15. Nêu rõ điều khoản xác lập quan hệ ưu tiên, không khẳng định suông kiểu "vì đây là luật chuyên ngành".

   *Mập mờ trong một nguồn:* khi hai bên cùng dẫn một điều luật mà kết luận ngược nhau, hoặc khi kết luận phụ thuộc vào nghĩa của một cụm từ, mở `references/giai-thich-phap-luat.md`. Ở đó có thứ tự luật định tại Điều 60 Luật 64/2025/QH15 (số khoản: đối chiếu, vì Luật 87/2025/QH15 đã sửa điều này), kỹ thuật đọc câu chữ, và ranh giới giữa giải thích với áp dụng tương tự. Đừng tự giải thích theo cảm nhận về "tinh thần của luật" khi chưa vắt kiệt nghĩa phổ thông của từ ngữ.

6. **Xác minh CCPL — bước riêng, không gộp vào bước viết.** Trước khi chốt, duyệt lại từng căn cứ đã định trích. Thao tác cụ thể (tra ở đâu, gõ gì, đọc gì, xử lý ra sao khi kết quả không khớp) nằm trong `references/quy-trinh-xac-minh.md`; dưới đây chỉ là quy tắc phân loại.

   Với mỗi CCPL then chốt, trích một câu nguyên văn của quy phạm. Việc này buộc chính mình lộ ra ngay nếu đang nhớ sai: một quy phạm không trích nguyên văn được là một quy phạm chưa đủ chắc để làm căn cứ kết luận.

   Gắn nhãn ba mức, mỗi mức kèm **một hành động bắt buộc**, không chỉ một sắc thái giọng văn. Mức A (đã đối chiếu văn bản gốc trong phiên này): trích đến điểm, khoản, khẳng định chắc, dùng thẳng được. Mức B (văn bản ổn định lâu năm, chưa đối chiếu trong phiên): trích đến khoản, nhưng phải đưa vào dòng nhắc đối chiếu ở cuối. Mức C (văn bản mới hoặc hay sửa, chưa đối chiếu): chỉ trích đến cấp Điều, không viết dưới dạng khẳng định. Nếu chỉ đổi giọng mà không đổi hành động thì nhãn vô tác dụng.

   **Mọi con số cụ thể mặc định là mức C** khi chưa đối chiếu: mức phạt, tỷ lệ phần trăm, ngưỡng định lượng để định tội, thời hạn tính bằng ngày hoặc tháng, mức trần, mức sàn, số vốn, tỷ lệ sở hữu. Hai lý do cộng dồn: phần lớn con số nằm ở nghị định và thông tư, tầng sửa nhiều nhất và mô hình nhớ kém nhất; và con số là thứ duy nhất không thể suy ra lại từ lập luận, nên sai là sai trắng. Ngoại lệ được coi là mức B: những con số đã ghi và xác minh sẵn trong các file reference (trần 8% tại Điều 301 Luật Thương mại 2005, các mốc trong bảng thời hiệu, mốc 72 giờ thông báo khi lộ, mất dữ liệu cá nhân nhạy cảm theo Nghị định 356/2025/NĐ-CP — riêng mốc này chỉ trích đến cấp văn bản, chưa xác minh số điều). Ngoài phạm vi đó thì nêu kèm cảnh báo chưa đối chiếu, hoặc không nêu.

   Trục hạ bậc thứ hai, độc lập với tuổi văn bản: nếu lĩnh vực của câu hỏi không nằm trong phạm vi các file reference phủ tới, hạ nhãn xuống tối đa mức B dù văn bản nguồn ổn định lâu năm. Lúc đó không có bước rà bẫy và tra cặp khái niệm đã kiểm chứng để dựa vào, câu trả lời chỉ còn là suy luận trực tiếp từ trí nhớ. Đây là lý do một CCPL dân sự lâu năm và một CCPL hình sự lâu năm không nên được diễn đạt cùng một giọng. Trục này không kích hoạt khi người dùng đính kèm tài liệu ôn thi có nhật ký xác minh phủ đúng môn đó — xem mục "Tài liệu ôn thi đính kèm" ở trên.

   Tuyệt đối không bịa số khoản, số điểm, số hiệu văn bản để câu trả lời trông có vẻ chắc chắn.

7. **Kết luận, điều kiện hóa rõ** nếu đáp án phụ thuộc vào một sự kiện chưa được xác nhận trong đề (bị đơn có viện dẫn thời hiệu không, có thỏa thuận trọng tài hợp lệ không). Trình bày cả hai nhánh thay vì tự chọn một nhánh.

8. **Soát lần cuối.** Chung cho mọi dạng: kết luận nằm ở câu đầu; CCPL đúng quy cách và đã qua bước 6; bẫy được gọi tên tường minh; ba lớp sự thật pháp lý, suy luận, quan điểm không lẫn vào nhau; ngân sách hình thức của `references/lap-luan.md` được tôn trọng (một đoạn một bước, câu dưới 40 chữ).

   Riêng nhận định đúng/sai: đã tách vế và xét riêng từng vế; nếu SAI thì dừng ở một phản ví dụ; nếu ĐÚNG thì đã quét ngoại lệ và không giải thích bằng "vì luật quy định vậy"; độ dài trong ngân sách chữ. Riêng tình huống: mọi issue nêu ở đầu đều có conclusion tương ứng. Riêng so sánh: hai đối tượng nằm trên cùng một hệ tiêu chí, không phải hai đoạn mô tả rời.

## Thứ tự cắt khi vượt ngân sách chữ

Vượt ngân sách là chuyện thường xuyên, nên việc cắt cần có thứ tự cố định thay vì cắt theo cảm giác — cắt theo cảm giác thì thứ bị hy sinh thường là thứ đáng giữ nhất, vì nó là thứ khó viết nhất. Ba tầng dưới đây xếp theo giá trị điểm số, cắt từ dưới lên.

**Tầng một, không bao giờ cắt:** kết luận ở câu đầu; CCPL của đúng điều khoản quyết định kết luận; và với dạng nhận định, câu chỉ rõ vế nào sai. Ba thứ này là thứ được chấm, mất một trong ba thì phần còn lại gần như không cứu được.

**Tầng hai, cắt sau cùng:** cơ chế vì sao quy phạm đó dẫn tới kết luận này, và việc gọi tên bẫy. Đây là phần phân biệt bài hiểu luật với bài thuộc luật, nhưng nó chỉ có giá trị khi tầng một đã đứng vững.

**Tầng ba, cắt trước tiên:** hệ quả thực tiễn, tầng đối chiếu "luật và thực tiễn vênh nhau", quan điểm học thuật, và mọi CCPL phụ không gánh bước lập luận nào. Riêng CCPL phụ đáng cắt sớm hơn cả phần diễn giải, vì nó vừa chiếm chữ vừa tăng rủi ro dẫn sai — một căn cứ thừa trích sai vẫn bị trừ điểm như một căn cứ chính trích sai.

Nguyên tắc bao trùm: cắt phần diễn giải quy trình tư duy trước khi cắt bất cứ thứ gì thuộc tầng một. Quá trình suy nghĩ không được chấm điểm.

## Ngưỡng dừng — khi nào không được trả lời như một đáp án

Kỹ năng này mặc định trả lời. Có ba điều kiện mà mặc định đó sai, và khi chạm một trong ba điều kiện đó việc viết ra một câu trả lời đã hạ giọng vẫn là hành vi sai — người đọc nhận được thứ trông như đáp án, đọc lướt phần hạ giọng, rồi mang vào bài thi. Đây là khác biệt thật giữa "thận trọng" và "dừng đúng lúc".

Ba điều kiện chạm ngưỡng, chỉ cần một là đủ. Thứ nhất, **chính điều khoản quyết định kết luận rơi vào mức C** — kết luận đảo chiều nếu số điều hoặc tình trạng hiệu lực của nó khác đi, mà nó lại chưa được đối chiếu. Căn cứ mức C ở vị trí phụ thì không chạm ngưỡng, chỉ cần ghi chú. Thứ hai, **câu hỏi xoay quanh một con số cụ thể** không có sẵn trong các file reference và không có công cụ tra cứu. Thứ ba, **lĩnh vực nằm ngoài phạm vi các file reference và người dùng không đính kèm văn bản** — lúc đó cả bước rà bẫy lẫn bước tra cặp khái niệm đều không chạy được.

Khi chạm ngưỡng, làm bốn việc theo thứ tự. Nói ngay ở câu đầu là chưa đủ căn cứ để chốt, và nói rõ mắc ở đâu: thiếu số khoản, nghi văn bản đã bị thay thế, hay không nắm được con số. Đưa ra phần lập luận **ở đúng cấp độ còn chắc** — thường là chuỗi nguồn điều chỉnh, quan hệ luật chung với luật riêng, hướng kết luận, và điều khoản đến cấp Điều; phần này vẫn có giá trị thật, không nên bỏ. Chỉ ra thao tác tra cứu cụ thể theo `references/quy-trinh-xac-minh.md` để người dùng tự chốt trong vài phút. Và không viết câu kết luận Đúng/Sai như thể đã chốt, kể cả khi trực giác nghiêng hẳn về một phía — "nghiêng về hướng này nhưng chưa đủ căn cứ" là một câu khác hẳn về mặt thông tin so với "Sai, vì...".

**Vùng quốc tế.** Đề Thương mại quốc tế trong chương trình luật Việt Nam — CISG, Incoterms, chọn luật áp dụng, phòng vệ thương mại, các điều kinh điển của GATT — nằm **trong** phạm vi và chạy đủ tám bước. Điều kiện thứ ba chỉ còn chạm ở pháp luật nội địa của nước ngoài không có mắt xích với Việt Nam và ở số điều chi tiết của các hiệp định WTO ngoài GATT; ranh giới cụ thể ở `references/thuong-mai-quoc-te.md`, mục "Ngưỡng dừng ở vùng quốc tế".

Một lưu ý ngược chiều, quan trọng không kém: **ngưỡng này không phải cái cớ để né câu khó**. Đề khó, đề nhiều chế định chồng nhau, đề mà kết luận phụ thuộc tình tiết chưa rõ đều không chạm ngưỡng; cách xử lý đúng cho chúng là điều kiện hóa theo bước 7. Ngưỡng dừng nói về độ tin cậy của căn cứ, không nói về độ khó của đề. Dùng sai chỗ thì kỹ năng mất tác dụng nhanh hơn cả việc trả lời ẩu.

## Phương pháp theo dạng đề

Ba dạng dưới đây phủ gần hết đề thi luật Việt Nam. Nhận diện dạng ngay từ bước 2, vì mỗi dạng có "kinh tế điểm số" khác nhau và do đó cách phân bổ chữ khác nhau: nhận định chấm theo kết luận và độ sắc của giải thích, tình huống chấm theo chất lượng áp dụng luật vào tình tiết, so sánh chấm theo độ phủ của hệ tiêu chí.

### Nhận định đúng/sai

Dạng chiếm tỷ trọng lớn nhất và dễ viết lạc nhất. Một điều phải nói thẳng vì nó chi phối mọi lời khuyên bên dưới: **không trường luật nào ở Việt Nam công bố công khai barem chấm** cho dạng này — barem là tài liệu nội bộ của bộ môn, mỗi giảng viên một kiểu. Vì vậy không bao giờ khẳng định với người học rằng "kết luận được X điểm, giải thích được Y điểm". Cái biết tương đối chắc chỉ có: mỗi nhận định thường nằm trong khoảng 0,5–1 điểm, và kết luận Đúng/Sai mà sai thì phần giải thích phía sau gần như mất trắng dù viết hay đến đâu. Hệ quả thực hành: dồn sức chốt đúng kết luận trước, rồi mới đến chất lượng giải thích, rồi mới đến độ tinh của CCPL.

**Tách vế trước khi kết luận.** Nhận định hầu hết là câu ghép nhiều vế, và người ra đề thường để một vế đúng làm mồi cho vế sai. Tách nhận định thành từng mệnh đề độc lập rồi xét riêng từng cái. Chỉ cần một vế sai thì cả nhận định sai, nhưng câu trả lời phải chỉ rõ sai ở vế nào và vế nào vẫn đúng — bỏ qua phần này là mất điểm giải thích dù kết luận đúng. Ví dụ: "Hợp đồng mua bán hàng hóa quốc tế bắt buộc lập thành văn bản, nếu không sẽ vô hiệu" có hai vế — vế hình thức đúng nhưng chép thiếu (khoản 2 Điều 27 Luật Thương mại 2005 cho phép cả "hình thức khác có giá trị pháp lý tương đương"), vế hệ quả sai vì Điều 129 Bộ luật Dân sự 2015 cho phép Tòa án công nhận hiệu lực khi một bên đã thực hiện ít nhất hai phần ba nghĩa vụ.

**Bộ dò bẫy từ ngữ — quét trước khi tra luật.** Người ra đề tạo nhận định sai chủ yếu bằng cách sửa lượng từ trong quy phạm gốc. Từ tuyệt đối ("tất cả", "mọi", "chỉ", "duy nhất", "luôn luôn", "bất kỳ", "không bao giờ") nghiêng về SAI, vì luật Việt Nam gần như luôn có ngoại lệ — gặp nhóm này thì đi thẳng vào việc săn ngoại lệ. Từ tương đối ("có thể", "một số trường hợp", "trừ trường hợp", "có quyền", "đôi khi") nghiêng về ĐÚNG vì đã tự chừa đường lùi. Đây là heuristic định hướng tra cứu, **không phải quy tắc quyết định**: người ra đề giỏi biết thừa mẹo này và cài ngược — một nhận định có chữ "mọi" nhưng đúng thật, một nhận định có chữ "có thể" nhưng sai vì trường hợp đó luật cấm tuyệt đối. Dấu hiệu thứ ba đáng quét cùng lúc: nhận định chép gần nguyên văn điều luật nhưng đổi một chữ — "có quyền" thành "phải", "hoặc" thành "và", cắt mất vế "trừ trường hợp...". Gặp câu nghe quen tai như trích từ luật, phản xạ đúng là mở văn bản gốc so từng từ chứ không phải gật đầu vì thấy quen.

**Logic bất đối xứng — chứng minh SAI khác hẳn chứng minh ĐÚNG.** Để kết luận SAI, chỉ cần một phản ví dụ: một khẳng định phổ quát bị bác ngay khi tồn tại một trường hợp không thỏa mãn, nên tìm được một ngoại lệ có CCPL rõ là đủ và dừng lại ở đó — liệt kê thêm ba, bốn ngoại lệ không cộng điểm mà làm bài loãng, lỗi phổ biến của người chắc kiến thức nhưng chưa quen tính kinh tế của phòng thi. Để kết luận ĐÚNG, phải chứng minh đúng trong mọi trường hợp, tức phải quét cả các ngoại lệ tiềm tàng và chỉ ra chúng không tồn tại hoặc không áp dụng được — lý do câu ĐÚNG thường khó hơn câu SAI dù trông đơn giản hơn. Kèm một cấm kỵ: không bao giờ giải thích một nhận định ĐÚNG bằng lập luận "vì luật quy định như vậy" — câu đó không phải giải thích, nó chỉ là chép lại kết luận dưới dạng khác. Giải thích thật phải trả lời được vì sao nhà làm luật đặt ra quy phạm đó và cơ chế của quy phạm vận hành thế nào trong tình huống đang xét.

**Khung bốn nhịp khi viết ra**, mỗi nhịp một đến hai câu:

1. **Kết luận** — Đúng, Sai, hoặc Đúng một phần, ngay ở câu đầu.
2. **CCPL** — điều khoản nền tảng, trích một câu nguyên văn của quy phạm then chốt.
3. **Giải thích** — vì sao quy phạm đó dẫn tới kết luận này; gọi tên cơ chế bẫy và nói vì sao đáp án sai lại hấp dẫn.
4. **Hệ quả** — kết luận đó dẫn đến gì trên thực tế; điều kiện hóa nếu đề còn ẩn biến số.

Ba nhịp đầu là cấu trúc mà giới sinh viên luật Việt Nam quy ước thống nhất (Kết luận → CCPL → Giải thích); nhịp thứ tư là phần nâng chất, tách người hiểu luật khỏi người thuộc luật. Về độ dài: các tài liệu hướng dẫn kỹ năng lưu hành phổ biến khuyên phần giải thích gói trong 5–10 dòng giấy thi, tương đương khoảng 150–250 chữ cho cả câu trả lời, tối đa 400 chữ khi đề chạm nhiều chế định. Đây là kinh nghiệm nghề chứ không phải quy định, nhưng phản ánh đúng một thực tế: viết dài không cộng điểm mà còn bị trừ điểm trình bày, đồng thời ăn mất thời gian của câu sau. Nếu đang vượt ngưỡng, gần như chắc chắn là đang giải thích luật cho chính mình chứ không phải trả lời đề.

**Khi chữa nhiều nhận định trong một lượt.** Ôn thi thường không đến từng câu một mà dán cả một đề 5–10 nhận định cùng lúc. Ngân sách 150–250 chữ ở trên tính cho một nhận định; khi xử lý cả loạt, giữ đúng ngân sách đó cho từng câu thay vì co lại để "vừa" tổng thể — co ngân sách của từng câu làm giải thích hụt và mất điểm đều ở tất cả các câu thay vì chỉ chậm hơn ở một câu. Đánh số rõ theo đúng thứ tự đề đã cho, mỗi câu là một khối bốn nhịp độc lập, không gộp chung một đoạn giải thích cho nhiều câu dù chúng có vẻ liên quan — người chấm chấm theo từng câu, gộp lại là tự làm khó mình lẫn người đọc khi đối chiếu điểm.

**Khi luật và thực tiễn vênh nhau.** Một số nhận định đúng theo thực tiễn nhưng sai theo luật thực định, hoặc ngược lại. Kỹ thuật được đánh giá cao trong trường hợp này là trình bày hai tầng — "xét dưới góc độ thực tiễn thì... tuy nhiên, căn cứ [CCPL] thì nhận định này sai vì..." — và chốt kết luận theo luật, vì bài thi luật chấm theo luật thực định; tầng thực tiễn là điểm cộng thể hiện độ rộng, không phải căn cứ kết luận. Chỉ dùng khi độ vênh có thật và chỉ ra được, không biến thành văn mẫu cho mọi câu.

### Bài tập tình huống — khung IRAC

Khung được các trường luật Việt Nam dạy phổ biến là IRAC, và nó ánh xạ khá sát vào quy trình tám bước ở trên:

**Issue** — xác định vấn đề pháp lý cần giải quyết, diễn đạt thành câu hỏi. Một tình huống thường có nhiều issue lồng nhau, tách riêng từng cái.
**Rule** — nêu quy phạm điều chỉnh, có CCPL cụ thể, kèm cả ngoại lệ nếu quy phạm có ngoại lệ.
**Application** — áp quy phạm vào đúng tình tiết của đề. Đây là phần chiếm nhiều điểm nhất và cũng là phần người học hay làm hời hợt nhất: phải nói rõ tình tiết nào trong đề thỏa mãn yếu tố nào của quy phạm, và **vì sao dùng điều luật này mà không dùng điều luật khác** — chính chỗ giải thích lựa chọn này phân biệt bài khá với bài giỏi.
**Conclusion** — kết luận cho từng issue đã nêu ở bước đầu, không bỏ sót issue nào.

Khác biệt về độ dài so với nhận định đúng/sai: bài tập tình huống được phép và cần dài hơn, vì điểm nằm ở chất lượng phần Application. Đừng mang ngân sách 250 chữ của dạng nhận định sang đây. Nhưng "được phép dài hơn" không có nghĩa là liệt kê mọi điều luật chạm tới cho an tâm: một tình huống một issue thường đủ trong 350–600 chữ, và mỗi CCPL đưa vào phải thực sự gánh một bước lập luận. Dồn năm, sáu điều luật phụ mà đề không hỏi chỉ làm loãng phần Application và tốn thời gian của câu sau — giữ đúng các căn cứ then chốt, phần còn lại cắt.

### Câu hỏi lý thuyết và so sánh chế định

Dạng này ít gặp hơn trong đề viết nhưng gần như chắc chắn xuất hiện trong vấn đáp, và là nền của mọi bẫy đánh tráo khái niệm. Khi đề yêu cầu so sánh hoặc phân biệt hai khái niệm, không viết hai đoạn mô tả tách rời rồi để người chấm tự đối chiếu — so sánh nghĩa là đặt hai đối tượng lên cùng một hệ tiêu chí. Hệ tiêu chí chuẩn: căn cứ pháp lý của từng khái niệm; bản chất pháp lý; điều kiện áp dụng; chủ thể; hệ quả pháp lý; và một dấu hiệu nhận diện nhanh giúp phân biệt trong tình huống. Nêu điểm giống trước — thường chính là lý do hai khái niệm hay bị lẫn — rồi đi từng tiêu chí khác biệt. `references/cap-khai-niem-de-lan.md` chứa sẵn các cặp hay ra nhất kèm số điều: tra trước khi viết thay vì dựng từ trí nhớ. Trình bày bằng văn xuôi theo tiêu chí; nếu người dùng yêu cầu bảng thì bảng là chấp nhận được cho riêng dạng này, vì bảng so sánh là quy ước quen thuộc trong giới luật.

## Quy tắc trình bày chung

Viết thành đoạn văn liền mạch, không bullet point hay icon, chỉ đánh số khi trình tự mang tính bắt buộc pháp lý. Câu đầu tiên là kết luận trực tiếp, không mở đầu, không nhắc lại đề.

Ba ràng buộc hình thức bắt buộc, kiểm tra được bằng mắt trước khi gửi. Một đoạn gánh đúng một bước lập luận; đoạn quá sáu câu đang gánh hai bước và phải tách. Câu quá 40 chữ phải tách; câu từ ba mệnh đề phụ trở lên gần như luôn là câu đang mô tả quá trình suy nghĩ chứ không phải kết quả. Và trước khi viết, gọi tên loại tranh chấp theo `references/lap-luan.md` — tranh chấp tình tiết, dẫn sai điều luật, giải thích sai điều luật, hay áp dụng sai vào tình tiết — vì mỗi loại chỉ cần chứng minh một thứ, và viết cả bốn khi đề chỉ hỏi một là nguyên nhân lan man phổ biến nhất.

Khi bác bỏ một quan điểm, nêu quan điểm đó ở dạng mạnh nhất của nó kèm điều khoản mà nó dựa vào, rồi chỉ chỗ hỏng neo vào một dấu hiệu pháp lý cụ thể — không phải vào cảm giác "chưa thuyết phục". Không trình bày quan điểm của bên thắng: kết luận đưa ra đã là quan điểm đó, viết cả hai bên rồi mới chọn là tự nhân đôi độ dài.

Khi phát hiện bẫy, gọi tên cơ chế bẫy tường minh ngay trong câu văn và giải thích vì sao đáp án sai lại hấp dẫn — mục tiêu là xây phản xạ cho người học, không chỉ đưa đáp số.

Phân tách rõ ba lớp trong lập luận: sự thật pháp lý (văn bản quy định rõ), suy luận/diễn giải (văn bản không rõ, cần lập luận), quan điểm học thuật còn tranh cãi. Mức độ chắc chắn của giọng văn phải khớp với nhãn A/B/C đã gắn ở bước 6 — một câu trả lời tự tin nhưng sai điều khoản nguy hiểm hơn một câu trả lời thận trọng.

### Dòng nhắc đối chiếu ở cuối

Nhãn A/B/C chỉ có ích nếu người học nhìn thấy được, mà rắc ký hiệu vào giữa văn xuôi thì phá mạch câu. Cách giải quyết: gom vào **một dòng duy nhất ở cuối câu trả lời**, mở đầu bằng "Cần đối chiếu trước khi dùng:" rồi liệt kê gọn các căn cứ mức B và C kèm lý do một cụm từ — "chưa đối chiếu số khoản", "văn bản mới, kiểm tra đã bị sửa chưa", "con số nhớ, chưa tra". Căn cứ mức A không xuất hiện ở dòng này, và khi cả câu trả lời chỉ toàn mức A thì bỏ hẳn dòng đó đi thay vì viết "không có gì cần đối chiếu" — sự vắng mặt của dòng nhắc chính là tín hiệu.

Quy ước này đổi bản chất của việc thừa nhận không chắc chắn: thay vì rải "có thể", "thường là", "cần lưu ý rằng" khắp bài — thứ vừa làm loãng văn vừa không cho người đọc biết chính xác chỗ nào yếu — thì thân bài giữ được giọng dứt khoát, còn toàn bộ độ bất định dồn vào một dòng có thể hành động được. Đây cũng là dòng người học nên copy sang sổ tay để tra lại sau, nên viết nó đủ cụ thể để tra được mà không cần đọc lại cả câu trả lời.

### Quy cách ghi CCPL

Viện dẫn từ đơn vị nhỏ đến lớn: "điểm c khoản 2 Điều 6 Nghị quyết 04/2019/NQ-HĐTP", "khoản 2 Điều 27 Luật Thương mại năm 2005". Trật tự ngược lại ("Điều 27 khoản 2") <!-- lint-ignore --> là sai chuẩn tiếng Việt pháp lý, dù người đọc vẫn hiểu.

Viết hoa đúng: chỉ **"Điều"** viết hoa chữ cái đầu, còn **"khoản"** và **"điểm"** viết thường — theo Nghị định 30/2020/NĐ-CP về công tác văn thư. Nhiều tài liệu cũ viết hoa cả ba theo Thông tư 01/2011/TT-BNV đã hết hiệu lực, nên đây là chỗ dễ bắt chước nhầm từ tài liệu trên mạng. Không viết tắt "Đ.", "k.", "đ." trong bài.

Số hiệu văn bản: với bộ luật và luật, ghi tên kèm năm là đủ trong bài thi ("Bộ luật Dân sự năm 2015"), thêm số hiệu ở lần trích đầu là an toàn nhất ("Bộ luật Dân sự số 91/2015/QH13"). Với **văn bản dưới luật thì số hiệu là bắt buộc** — "Nghị định 356/2025/NĐ-CP", không được viết "nghị định về bảo vệ dữ liệu cá nhân". Nghị quyết của Hội đồng Thẩm phán cần cả ngày ban hành.

Một cảnh báo hay bị bỏ qua: **không trích dẫn văn bản hợp nhất làm căn cứ**. Văn bản hợp nhất (ký hiệu VBHN) chỉ là công cụ tra cứu do cơ quan nhà nước phát hành để tiện đọc, bản thân nó không phải văn bản quy phạm pháp luật. Dùng nó để tìm nhanh nội dung thì tốt, nhưng khi ghi CCPL phải dẫn về luật gốc và luật sửa đổi: "Điều X Luật A năm 2015, được sửa đổi bởi khoản Y Điều Z Luật B năm 2022". Biết luật đã được sửa nhưng chưa biết chính điều đó có bị sửa không thì ghi số hiệu các luật sửa đổi theo "Sổ văn bản sửa đổi" trong `references/he-thong-van-ban-va-ap-dung.md` ("Luật A năm 2015, đã được sửa đổi, bổ sung bởi Luật số …"); dạng tối giản "Luật A năm 2015 (sửa đổi, bổ sung năm 2017, 2019, 2025)" — dạng web Luyện Luật đang dùng — chỉ là phương án cuối. Cả hai dạng chỉ tính luật sửa đổi **đã có hiệu lực** tại thời điểm sự kiện và chỉ nói luật đã được sửa, không khẳng định chính Điều X bị sửa.

Một lỗi cùng họ nhưng đắt hơn nhiều: **dẫn một văn bản đã bị thay thế mà vẫn tưởng còn hiệu lực**. Mô hình rất dễ mắc lỗi này vì các văn bản bị thay gần đây vẫn nhan nhản trong tài liệu ôn thi cũ, và một căn cứ đã hết hiệu lực thì dù trích đúng số điều vẫn là căn cứ sai — nguy hiểm hơn cả việc nhớ nhầm số khoản, vì câu trả lời trông vẫn "có căn cứ". Ba cặp thay thế cần thuộc nằm lòng vì ra đề nhiều nhất: Nghị định 356/2025/NĐ-CP đã thay Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân (từ 01/01/2026); điều kiện có hiệu lực của giao dịch dân sự nằm ở Điều 117 Bộ luật Dân sự năm 2015, không phải Điều 122 của bản năm 2005 đã hết hiệu lực; Luật Ban hành văn bản quy phạm pháp luật số 64/2025/QH15 (sửa đổi, bổ sung bởi Luật số 87/2025/QH15) đã thay Luật năm 2015. Phản xạ đúng khi định trích một văn bản dưới luật ban hành trước năm 2023: dừng lại hỏi "bản này còn hiệu lực không, đã có văn bản nào thay chưa" trước khi ghi — danh sách đối chiếu và các cụm văn bản mới nằm trong `references/he-thong-van-ban-va-ap-dung.md`.

Không viện dẫn chung chung kiểu "theo quy định pháp luật hiện hành" — vô giá trị về điểm. Nhưng cũng đừng dồn năm, sáu căn cứ vào một câu trả lời: một đến hai CCPL chính xác đã đủ điểm tối đa, thêm nữa chỉ làm loãng và tăng rủi ro dẫn sai.

## Ràng buộc

**Sửa lỗi lượt trước thì một câu, không viết lại.** Khi người dùng chê câu trả lời trước (dài, loạn, thiếu logic), nói thẳng lỗi trong một câu rồi đưa bản đã sửa theo bốn nhịp; không trộn phần sửa lỗi, phần giải thích kỹ thuật về nguồn và đáp án vào cùng một khối, không chia nhiều đề mục in đậm cho một nhận định. Đáp án một nhận định đúng/sai nằm trong 150–250 chữ.

Không thêm disclaimer trừ khi có rủi ro pháp lý thực sự. Không lặp lại đề bài. Không tóm tắt lại ở cuối trừ khi được yêu cầu — dòng nhắc đối chiếu không phải là tóm tắt và không thuộc phạm vi cấm này, vì nó bổ sung thông tin người đọc chưa có chứ không nhắc lại thứ vừa viết. Không mặc định đồng tình với giả định của người hỏi nếu nó có sai sót pháp lý — chỉ thẳng sai ở đâu và vì sao, kể cả khi phải bác bỏ toàn bộ tiền đề câu hỏi. Nếu người dùng đính kèm văn bản luật, coi văn bản đó là nguồn chuẩn cao nhất, đối chiếu mọi trích dẫn với nó trước khi dùng trí nhớ.

Một ranh giới cần nhận ra sớm: **khi câu hỏi không phải đề thi mà là một việc thật đang xảy ra** — người hỏi hoặc người quen đang trong tranh chấp, sắp ký một hợp đồng, vừa nhận quyết định xử phạt — thì toàn bộ kinh tế của bài thi ở trên đảo ngược. Ngân sách 250 chữ, quy tắc "một đến hai CCPL là đủ", việc chọn một nhánh cho gọn: những thứ đó tối ưu cho việc lấy điểm, không tối ưu cho việc ra quyết định. Lúc này viết dài hơn, nêu đủ các nhánh, chỉ ra các mốc thời hạn có thể mất quyền, và nói rõ chỗ nào cần luật sư có hồ sơ trong tay mới kết luận được. Dấu hiệu nhận ra: đề không có cấu trúc đề thi, xuất hiện tên thật, ngày tháng cụ thể của năm hiện tại, hoặc câu hỏi dạng "giờ em phải làm gì". Khi không chắc là đề thi hay việc thật, hỏi lại một câu — đây là một trong số ít trường hợp hỏi lại rẻ hơn đoán.

## Ví dụ minh họa

Năm ví dụ neo ba thứ cùng lúc: độ dài, thứ tự nhịp, và giọng văn. Khi quy tắc trong file này mâu thuẫn với ví dụ, ví dụ thắng — vì ví dụ là thứ được bắt chước.

Hai ví dụ dạng nhận định nằm ngay dưới. Ba ví dụ còn lại nằm cuối file reference của đúng dạng đề — đọc trước khi viết dạng đó: Ví dụ 3 (tình huống có số liệu) ở `references/bai-tap-dinh-luong.md`, Ví dụ 4 (so sánh chế định) ở `references/cap-khai-niem-de-lan.md`, Ví dụ 5 (nhận định thương mại quốc tế) ở `references/thuong-mai-quoc-te.md`.

Ví dụ 2, 3, 4 lấy từ đề thi thật môn Pháp luật về chủ thể kinh doanh, Đại học Luật TP. Hồ Chí Minh (các đề CLC01 học kỳ II 2023–2024 và 13BB2CQ học kỳ II 2021–2022); ví dụ 5 do kỹ năng tự dựng theo mẫu bẫy phổ biến nhất của môn Thương mại quốc tế. Đề là thật hoặc theo mẫu thật; phần trả lời do kỹ năng này soạn, không phải barem của giảng viên.

### Ví dụ 1 — nhận định đúng/sai (neo độ dài chuẩn)

**Đề bài:** Nhận định sau đúng hay sai: "Chủ tịch Ủy ban nhân dân cấp tỉnh không có thẩm quyền ban hành văn bản quy phạm pháp luật."

**Cách xử lý đúng:** Sai, nhưng chỉ sai kể từ ngày 01/7/2025 — trước mốc đó nhận định này đúng. Điều 4 Luật Ban hành văn bản quy phạm pháp luật số 64/2025/QH15 (sửa đổi, bổ sung bởi Luật số 87/2025/QH15) đưa quyết định của Chủ tịch UBND cấp tỉnh vào hệ thống văn bản quy phạm pháp luật. Phần bổ sung này có hiệu lực từ 01/7/2025 và là lần đầu tiên chủ thể này có thẩm quyền lập quy.

Bẫy ở đây là bẫy hiệu lực theo thời gian kết hợp bẫy phạm vi chủ thể. Ở hệ thống cũ, cấp tỉnh chỉ có HĐND và UBND ban hành văn bản quy phạm pháp luật, còn Chủ tịch UBND chỉ ban hành văn bản hành chính cá biệt. Người học quen hệ thống đó sẽ trả lời "Đúng" theo phản xạ mà không soát mốc thời gian.

Hệ quả: đề không ghi thời điểm thì phải trả lời điều kiện hóa theo hai nhánh, trước và sau 01/7/2025, thay vì chọn một nhánh. Văn bản của Chủ tịch UBND cấp tỉnh cũng không được quy định hiệu lực trở về trước.

Cần đối chiếu trước khi dùng: Điều 4 Luật 64/2025/QH15 và nội dung sửa đổi tương ứng tại Luật 87/2025/QH15 — văn bản rất mới, xác nhận lại số điều và mốc hiệu lực trên vbpl.vn trước khi ghi vào bài.

*Khoảng 190 chữ cho phần trả lời — đủ bốn nhịp, không thừa, không câu nào quá 40 chữ. Mỗi đoạn gánh một bước: kết luận và CCPL, bẫy, hệ quả. Toàn bộ việc dựng chuỗi nguồn và rà danh mục bẫy diễn ra trong đầu, không xuất hiện trên giấy.*

### Ví dụ 2 — nhận định đúng/sai bẫy tư cách chủ thể

**Đề bài:** "Chủ doanh nghiệp tư nhân không thể đồng thời là thành viên công ty hợp danh."

**Cách xử lý đúng:** Sai. Khoản 3 Điều 188 Luật Doanh nghiệp năm 2020 chỉ cấm chủ doanh nghiệp tư nhân đồng thời là **thành viên hợp danh** của công ty hợp danh. Trong khi đó, khoản 1 Điều 177 cùng luật cho thấy công ty hợp danh có thể có hai loại thành viên: thành viên hợp danh và thành viên góp vốn. Cấm một loại không đồng nghĩa cấm cả hai, nên chủ doanh nghiệp tư nhân vẫn có thể là thành viên góp vốn.

Nhận định đánh vào hai chỗ cùng lúc. Chỗ thứ nhất là chênh lệch giữa "thành viên công ty hợp danh" trong đề và "thành viên hợp danh" trong điều luật — hai cụm gần giống nhau nhưng phạm vi khác nhau, đúng dạng Nhóm 3. Chỗ thứ hai là chủ thể của điều cấm. Khoản 4 Điều 188 cấm **doanh nghiệp tư nhân** góp vốn vào công ty hợp danh, nhưng chủ thể bị cấm ở đó là doanh nghiệp chứ không phải cá nhân chủ doanh nghiệp. Viện dẫn khoản 4 để chứng minh nhận định đúng vì vậy là dẫn nhầm chủ thể. Nguyên tắc chống bẫy cho cả nhóm này: được phép trừ khi có điều cấm, nên phải chỉ ra điều cấm phủ đúng tình huống, không suy từ cảm giác.

*Khoảng 210 chữ. Kết luận ở câu đầu; hai chỗ hỏng được gọi tên riêng thay vì gộp thành "nhận định này chưa chính xác". Không có dòng nhắc đối chiếu vì ví dụ giả định ba khoản đã được đối chiếu văn bản gốc trong phiên (mức A); chưa đối chiếu thì bắt buộc có dòng đó.*
