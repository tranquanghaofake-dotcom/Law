# Phương pháp học — vào bài nhanh, nhớ lâu (nghiên cứu và đề xuất)

Phiên bản 1.0 · 03/11/2026 · Trạng thái: **nghiên cứu, chờ Hào chọn** (chưa có dòng code nào) · Soạn: Claude (sonnet A, đợt 7) theo yêu cầu của Trần Quang Hào.
Phạm vi: không luyện nói (Hào đã loại); không đổi stack, không thêm thư viện, không thêm key `settings`; không viết khẳng định pháp lý mới nếu không có căn cứ đối chiếu được.
Ký hiệu độ tin cậy nguồn: **✔** = DOI/URL mở được và tác giả–năm–tạp chí khớp (tra Crossref/PubMed/trang nhà xuất bản ngày 03/11/2026); **Ⓐ** = ✔ và con số trong bảng lấy từ tóm tắt đã đọc; **?** = chưa kiểm (ghi rõ). Danh mục đầy đủ: `$DOT7/research/sources.md` (không nằm trong repo).

---

## 0. Trả lời thẳng câu hỏi của Hào

**"Các cách học hiện có đã đủ chưa?"** — Chưa. Phần *lõi* đúng và mạnh: hỏi để nhớ lại (retrieval), lịch giãn cách FSRS, xen dạng câu, vòng sửa sai. Đó là hai kỹ thuật duy nhất được Dunlosky và cộng sự xếp "hữu ích cao" (practice testing, distributed practice; Dunlosky 2013, doi:10.1177/1529100612453266 Ⓐ). Cái *thiếu* nằm ở **chất lượng của từng lượt hỏi–đáp**, không ở số lượng hiệu ứng:

1. **Phản hồi nghèo.** Trong 2 799 câu `mcq/case/truefalse/pair` của 690 khái niệm, **1 741 câu (62 %) có `explain` chỉ là trích dẫn** ("Khoản 2 Điều 107."), trung vị 23 ký tự. Người sai chỉ biết "đúng là A", không biết **vì sao** B hấp dẫn nhưng sai. Phản hồi sửa lỗi là chỗ trắc nghiệm biến từ "đoán" thành "học" (Butler & Roediger 2008 ✔).
2. **Vận dụng mỏng.** Câu `case` gốc chỉ có **67/1 447 câu trắc nghiệm, ở 3/23 môn** (hiến pháp 19, lịch sử 13, chứng khoán 35). Phần còn lại của "bậc 4" là Đúng/Sai (662 câu, chỉ 82 đáp án Đúng) và câu sinh tự động. 470 câu tình huống thật nằm ở Luyện đề.
3. **Không đo "mình có biết mình biết không".** Không có độ tự tin, không có đoán trước, không có "vì sao?". FSRS coi một câu trắc nghiệm đoán trúng (xác suất 25 %) ngang một câu nhớ lại gõ chữ.
4. **Vào bài bằng tường chữ.** Lần học đầu = thẻ giới thiệu dày (định nghĩa nguyên văn + giải nghĩa + ví dụ + ghi chú + nguồn) rồi mới được hỏi. Pretesting và "ví dụ trước, định nghĩa sau" đều có bằng chứng tốt hơn đọc trước (mục 2).
5. **Hình ảnh chỉ để trang trí.** Tranh/huy hiệu/cây chức vụ đẹp nhưng không mang nội dung pháp lý (không bảng so sánh, sơ đồ, mốc thời gian). Đó là chỗ trống của dual coding, và trang trí thừa thậm chí làm hại (Rey 2012 ✔).

**Hai giả định cần sửa.** (a) *"Thêm hiệu ứng/âm thanh/thưởng thì học hấp dẫn hơn"* — gamification có hiệu ứng nhỏ–vừa (g ≈ 0,25–0,5) và giảm khi can thiệp dài; thưởng ngoại sinh có thể **giảm** hứng thú tự thân (d −0,28 đến −0,40; mục 2). Dự án đã đủ lớp thưởng; việc đáng làm bây giờ là làm *câu hỏi* tốt hơn. (b) *"Nghe giúp nhớ"* — tôi **không tìm được bằng chứng** riêng cho đọc to lại nội dung đang hiện trên màn hình (có thể rơi vào nguyên tắc dư thừa của Mayer, chưa kiểm); giữ TTS như tiện ích truy cập, không đầu tư thêm.

**Năm việc nên làm trước** (chi tiết mục 6): ① độ tự tin + sửa lỗi "chắc mà sai" · ② phản hồi giải thích vì sao từ dữ liệu có sẵn · ③ đoán trước + thẻ giới thiệu ba lớp · ④ bảng so sánh cho cặp dễ nhầm · ⑤ xen kẽ *có chủ đích* các khái niệm dễ nhầm khi ôn. Cả năm **không cần nội dung luật mới**.

---

## 1. Hiện trạng (đọc code `apps/web/src/lib/{engine,ui,fx,game}` và `packages/content/data` sau khi gộp đợt 6)

**Đường đi.** 6 bậc, `nextLevel`: đúng +1, sai −1 (`engine/progress.ts`). Phiên học chia 3 lượt theo bậc thấp nhất của đợt: lượt 1 = giới thiệu + bậc 1 (khối 2–3 khái niệm); lượt 2 = bậc 2, 3; lượt 3 = bậc 4, 5. Bậc 6 (đã thuộc) chỉ hỏi dạng nhớ chủ động 3–5. Ôn: tối đa 20 bước, mỗi khái niệm một bước ở bậc hiện tại; cuối phiên có **câu chốt**, **câu vàng ×2** (~1/8) và **vòng sửa sai** không ghi tiến độ (`session.ts`, `runner.ts`).
**FSRS.** `ts-fsrs`, một thẻ cho mỗi *khái niệm* (không theo từng câu), tham số mặc định, retention 0,9 chỉnh được. Rating: sai = Again; đúng chậm > 12 s = Hard; đúng nhanh < 4 s và bậc ≥ 3 = Easy; còn lại Good (`engine/fsrs.ts`). Mọi dạng câu (kể cả trắc nghiệm 4 phương án và Đúng/Sai 50 %) cập nhật cùng một thẻ. Ngưỡng 12 s/4 s cố định, không tính độ dài đề (câu `case` dài đọc đã mất > 12 s).
**Thưởng.** 10 XP/câu, combo ×1,5 từ 5 và ×2 từ 10, câu vàng ×2, sửa sai +5, +20 hết phiên, +50 hết đợt lần đầu; thanh sức nhớ, tranh lộ dần, confetti, âm, rung, chuỗi ngày, bậc khoa cử. Thưởng gắn với *đúng liên tiếp* và *sửa được*, không thưởng tốc độ.
**Tự đọc phản hồi.** Khi `settings.tts` bật và có giọng vi-VN: sau khi chọn, đọc "Chính xác/Chưa đúng. Đáp án: … Giải thích …" (`ui/session/speech.ts`); Space đọc lại.
**Dạng câu hiện có.** `intro`, `mcq` (nhận biết; sinh: định nghĩa→thuật ngữ, thuật ngữ→định nghĩa), `sort` (Phân biệt, gộp ≥ 4 tình huống; đủ dữ liệu cho 102/690 khái niệm), `match` 4×4, `cloze` (chọn từ khi bậc < 3, **gõ** khi ≥ 3; 1 380 câu), `case` (67), `truefalse` (gốc 662 + sinh từ định nghĩa), `example→concept` (sinh từ `example`, mọi khái niệm có), `recall` (690; gõ 1–3 câu, tô từ khoá trúng, tự chấm Đúng/Gần đúng/Sai).
**Dữ liệu mỗi khái niệm:** `definition` nguyên văn, `plain`, `example`, `source`, `confusables`, `keywords` (trung bình 4), `note` (241 khái niệm), 7 item (2 mcq, 2 cloze, 1 pair, 1 truefalse, 1 recall).

### Bảng phủ sáu kênh

| Kênh | Đang có | Mạnh/yếu | Chỗ trống |
|---|---|---|---|
| **Đọc** | Thẻ giới thiệu: định nghĩa nguyên văn + giải nghĩa + ví dụ + nguồn; phản hồi sau câu | Mạnh về độ chuẩn; yếu về nhịp (một khối chữ) và về giải thích (62 % chỉ là trích dẫn) | Giải thích *vì sao*, giải thích *vì sao phương án kia sai*, đọc có hướng (tô điều kiện) |
| **Viết (gõ)** | `cloze` gõ 1–3 chữ (bậc ≥ 3); `recall` 1–3 câu, từ khoá + tự chấm | Tốt cho nhớ lại thuật ngữ; `recall` chỉ 1/khái niệm, chấm tự báo | Viết lập luận có cấu trúc (Vấn đề–Căn cứ–Kết luận); phản hồi theo từng ý |
| **Nghe** | TTS chỉ sau khi chọn đáp án | Đúng quyết định đợt 6 (không lộ đáp án) | Không đề xuất mở rộng (không có bằng chứng; mục 7) |
| **Nhìn (hình)** | Tranh lộ dần, huy hiệu, cây chức vụ | Đẹp, có nhịp thưởng | **Không có hình mang nội dung**: bảng so sánh, sơ đồ điều kiện, trục thời gian |
| **Vận dụng tình huống** | `case` 67; `example→concept`; `sort`; 470 câu Luyện đề (47 bộ) | Luyện đề tốt; gốc mỏng, 20/23 môn không có `case` | Tình huống nằm trong vòng ôn FSRS; "đổi một tình tiết"; tình huống nhiều bước |
| **Giải thích lập luận** | `recall` L5 | Một câu mở/khái niệm | "Vì sao?"; so sánh hai lập luận; tìm lỗi trong lập luận |

Ghi chú nhỏ: `Quiz10.svelte` có nhánh gọi `repo.record` khi câu có trường `concept`; hiện **0/470** câu có trường này nên chưa ghi gì. Nếu sau này gắn `concept`, Luyện đề sẽ vào lịch ôn — trái quyết định 01/11 "Luyện đề không ghi lịch ôn" trong spec gốc; cần Hào xác nhận ý định (không sửa ở đây).

---

## 2. Phương pháp có bằng chứng

Cột "Hợp dự án" đánh giá mức hợp với engine/nội dung hiện có (●●● = hợp ngay, không cần nội dung luật mới). "Cỡ hiệu ứng" chỉ ghi số tôi **đã đọc** trong tóm tắt; không có số thì ghi "chưa kiểm số".

| Phương pháp | Cơ chế · cỡ hiệu ứng · điều kiện hiệu quả | Nguồn (✔ = đã kiểm) | Hợp dự án |
|---|---|---|---|
| **Retrieval practice / testing effect** | Gắng nhớ lại củng cố hơn đọc lại. Dunlosky: hữu ích **cao**. Donoghue & Hattie 2021 (tổng hợp 10 kỹ thuật): d = 0,74. **Chuyển giao** sang dạng câu khác: d = 0,40, mạnh nhất sang câu vận dụng/suy luận, yếu với bài giải mẫu; chuyển giao tăng khi hỏi gắn *giải thích mở rộng* và khi lần thử đầu đúng. Nhớ lại (recall) lợi hơn nhận ra (recognition) | Roediger & Karpicke 2006, Psych Sci 17(3), doi:10.1111/j.1467-9280.2006.01693.x ✔ · Rowland 2014, Psych Bull 140(6), doi:10.1037/a0037559 Ⓐ (chưa kiểm số g) · Adesope 2017, Rev Educ Res 87(3), doi:10.3102/0034654316689306 Ⓐ (chưa kiểm số) · Pan & Rickard 2018, Psych Bull 144(7), doi:10.1037/bul0000151 Ⓐ · Donoghue & Hattie 2021, Front Educ 6:581216, doi:10.3389/feduc.2021.581216 Ⓐ · Karpicke & Roediger 2008, Science 319, doi:10.1126/science.1152408 ✔ | ●●● đã là lõi |
| **Trắc nghiệm vs gõ** | Gõ không luôn hơn chọn: nếu lần nhớ đầu hay thất bại thì lợi thế của gõ biến mất; kiểu **lai** (nhớ trước, rồi chọn) giữ lợi ích khi nhớ thành công. Phương án nhiễu lộ thông tin sai ("negative suggestion"), **phản hồi** giảm tác hại này | Smith & Karpicke 2014, Memory 22(7), doi:10.1080/09658211.2013.831454 Ⓐ · Roediger & Marsh 2005, JEP:LMC 31(5), doi:10.1037/0278-7393.31.5.1155 ✔ · Butler & Roediger 2008, Mem Cogn 36(3), doi:10.3758/MC.36.3.604 ✔ · Kang, McDermott & Roediger 2007, Eur J Cogn Psychol 19, doi:10.1080/09541440601056620 ✔ | ●●● |
| **Spacing** | Khoảng cách tối ưu giữa hai lần học tăng theo thời gian muốn nhớ (tổng hợp 839 phép đo / 317 thí nghiệm, Cepeda 2006) | Cepeda et al. 2006, Psych Bull 132(3), doi:10.1037/0033-2909.132.3.354 Ⓐ · Cepeda et al. 2008, Psych Sci 19(11), doi:10.1111/j.1467-9280.2008.02209.x ✔ (quy tắc "10–20 % thời gian giữ" chưa kiểm số) | ●●● FSRS đã làm |
| **Successive relearning** | Hỏi lại tới khi đúng trong *mỗi* buổi, lặp qua nhiều buổi cách nhau; cải thiện điểm thi trong lớp học | Rawson & Dunlosky 2011, JEP:General 140(3), doi:10.1037/a0023956 ✔ · Rawson, Dunlosky & Sciartelli 2013, Educ Psychol Rev 25, doi:10.1007/s10648-013-9240-4 ✔ (chưa kiểm số) | ●●● vòng sửa sai là bản rút gọn |
| **Interleaving** | Xen các ví dụ *giống nhau* giúp phân biệt: g = 0,42 chung; tranh/hình 0,67; toán 0,34; **văn bản mô tả: tác động chung không có ý nghĩa thống kê**. Lợi hơn khi các loại *giống nhau giữa các nhóm* và *khác nhau trong nhóm* | Brunmair & Richter 2019, Psych Bull 145(11), doi:10.1037/bul0000209 Ⓐ · Firth, Stott & Rowe 2021, Rev Educ 9(2), doi:10.1002/rev3.3266 Ⓐ · Kornell & Bjork 2008, Psych Sci 19(6), doi:10.1111/j.1467-9280.2008.02127.x ✔ · Rohrer & Taylor 2007, Instr Sci 35, doi:10.1007/s11251-007-9015-8 ✔ | ●●● nhưng **xen cặp dễ nhầm, không xen ngẫu nhiên** (đề xuất ⑤) |
| **Desirable difficulties** | Khó vừa phải làm chậm học nhưng nhớ lâu; người học *cảm thấy* học dở hơn trong khi học tốt hơn. Cảm giác "mượt" là chỉ báo sai | Bjork, Dunlosky & Kornell 2013, Annu Rev Psychol 64, doi:10.1146/annurev-psych-113011-143823 ✔ · Deslauriers et al. 2019, PNAS 116(39), doi:10.1073/pnas.1821936116 ✔ · Bjork & Bjork 2011 (chương sách) **?** | ●●● cơ sở để giữ vòng sửa sai, không "làm dễ" |
| **Pretesting / errorful generation** | Thử trả lời *trước khi* được dạy, dù sai, cải thiện học nội dung đó sau. Cần: có phản hồi/dạy ngay sau; câu thử khớp nội dung sẽ học. Phát hiện lặp lại ở bài học video | Richland, Kornell & Kao 2009, JEP:Applied 15(3), doi:10.1037/a0016496 ✔ · Kornell, Hays & Bjork 2009, JEP:LMC 35(4), doi:10.1037/a0015729 ✔ · Carpenter & Toftness 2017, JARMC 6(1), doi:10.1016/j.jarmac.2016.07.014 ✔ · Pan & Carpenter 2023 (tổng quan), Educ Psychol Rev 35, doi:10.1007/s10648-023-09814-5 ✔ · Yang, Potts & Shanks 2018, npj Sci Learn 3:8, doi:10.1038/s41539-018-0024-y ✔ (chưa kiểm số) | ●●● đề xuất ③ |
| **Hypercorrection (độ tự tin)** | Lỗi *tin chắc* được sửa **tốt hơn** lỗi tin yếu, nếu được phản hồi. Đo độ tự tin còn cho calibration (học viên đánh giá đúng mình) | Butterfield & Metcalfe 2001, JEP:LMC 27(6), doi:10.1037/0278-7393.27.6.1491 ✔ · Metcalfe 2017, Annu Rev Psychol 68, doi:10.1146/annurev-psych-010416-044022 ✔ | ●●● đề xuất ① |
| **Elaborative interrogation ("vì sao?")** | Tự hỏi "vì sao điều này đúng?" nối kiến thức mới với cũ. Dunlosky: **vừa**; hiệu quả tốt hơn khi lời giải thích *chính xác* và người học có kiến thức nền. d = 0,56 (Donoghue & Hattie) | Dunlosky 2013 Ⓐ · Donoghue & Hattie 2021 Ⓐ · Pressley et al. 1987 **?** | ●● cần dạng câu mới (đề xuất ②, ⑩) |
| **Self-explanation** | Giải thích từng bước khi học ví dụ giúp hiểu sâu (Chi 1989, 1994). Dunlosky: vừa; d = 0,54. **Cẩn thận:** trong phân tích bài giải mẫu toán, thêm gợi ý tự giải thích lại cho hiệu ứng *thấp hơn* | Chi et al. 1989, Cogn Sci 13(2), doi:10.1207/s15516709cog1302_1 ✔ · Chi et al. 1994, Cogn Sci 18(3), doi:10.1207/s15516709cog1803_3 ✔ · Bisra et al. 2018, Educ Psychol Rev 30, doi:10.1007/s10648-018-9434-x ✔ (chưa kiểm số) · Barbieri et al. 2023, Educ Psychol Rev 35:11, doi:10.1007/s10648-023-09745-1 Ⓐ | ●● |
| **Worked & faded examples** | Người mới học tốt hơn khi xem bài giải mẫu rồi *dần bỏ bước* (fading) thay vì tự giải ngay. Bài giải mẫu *đúng* hiệu quả hơn bài mẫu *sai* hoặc trộn: g = 0,48 (toán). Hiệu ứng yếu dần khi người học đã thành thạo (expertise reversal; Kalyuga 2003 **?**) | Sweller 1988, Cogn Sci 12(2), doi:10.1207/s15516709cog1202_4 ✔ · Renkl & Atkinson 2003, Educ Psychol 38(1), doi:10.1207/S15326985EP3801_3 ✔ · Barbieri 2023 Ⓐ · Kirschner, Sweller & Clark 2006, Educ Psychol 41(2), doi:10.1207/s15326985ep4102_1 ✔ | ●● cần nội dung (đề xuất ⑩) |
| **Contrasting cases / so sánh** | So sánh hai trường hợp, tìm điểm giống rồi nêu nguyên tắc: d = 0,50 (57 thí nghiệm). Tốt nhất khi **tìm điểm giống**, **nguyên tắc đưa sau so sánh**, nội dung dạng tri giác, kiểm tra ngay | Alfieri, Nokes-Malach & Schunn 2013, Educ Psychol 48(2), doi:10.1080/00461520.2013.775712 Ⓐ · Gentner, Loewenstein & Thompson 2003, J Educ Psychol 95(2), doi:10.1037/0022-0663.95.2.393 ✔ · Schwartz & Bransford 1998, Cogn Instr 16(4), doi:10.1207/s1532690xci1604_4 ✔ | ●●● đề xuất ④ |
| **Productive failure** | Thử giải *trước* rồi mới dạy: g = 0,36 (53 nghiên cứu), 0,37–0,58 khi làm đúng thiết kế; ngược chiều với học sinh nhỏ (lớp 2–5) và kỹ năng chung | Sinha & Kapur 2021, Rev Educ Res 91(5), doi:10.3102/00346543211019105 Ⓐ | ●● liên quan ③ |
| **Cognitive load / chunking** | Bộ nhớ làm việc nhỏ (~4 mục); chia nhỏ thành cụm có nghĩa, bỏ chi tiết dư | Cowan 2001, Behav Brain Sci 24(1), doi:10.1017/S0140525X01003922 ✔ · Gobet et al. 2001, Trends Cogn Sci 5(6), doi:10.1016/S1364-6613(00)01662-4 ✔ · Wozniak, "20 rules" (SuperMemo) ✔ | ●●● đợt 4–5 khái niệm đúng hướng |
| **Advance organizer / pre-training** | Giới thiệu thuật ngữ và khung trước khi học nội dung chính; gói tóm lược trước giúp học đa phương tiện. *Nhưng* lập sơ đồ khái niệm như *hoạt động học chính* kém hơn nhớ lại (Karpicke & Blunt) | Luiten, Ames & Ackerson 1980, Am Educ Res J 17(2), doi:10.3102/00028312017002211 ✔ · Mayer, Mathias & Wetzell 2002, JEP:Applied 8(3), doi:10.1037/1076-898X.8.3.147 ✔ · Karpicke & Blunt 2011, Science 331, doi:10.1126/science.1199327 ✔ · Nesbit & Adesope 2006, Rev Educ Res 76(3), doi:10.3102/00346543076003413 Ⓐ | ●●● đề xuất ⑬ |
| **Dual coding / multimedia** | Từ + hình có nghĩa tốt hơn chỉ chữ; **nhưng** chi tiết hấp dẫn không liên quan ("seductive details") làm giảm học. Hiệu ứng đòi hỏi hình *mang nội dung* | Harp & Mayer 1998, J Educ Psychol 90(3), doi:10.1037/0022-0663.90.3.414 ✔ · Rey 2012, Educ Res Rev 7(3), doi:10.1016/j.edurev.2012.05.003 ✔ (chưa kiểm số d) · Mayer, *Multimedia Learning* (sách) **?** · Paivio 1971 **?** | ●● hình có nghĩa: bảng/sơ đồ |
| **Concrete examples / concreteness fading** | Bắt đầu bằng ví dụ cụ thể, rồi dần trừu tượng hoá, giúp chuyển giao | Fyfe et al. 2014, Educ Psychol Rev 26(1), doi:10.1007/s10648-014-9249-3 ✔ | ●●● ví dụ trước định nghĩa |
| **Generation effect** | Tự tạo ra đáp án (kể cả điền chỗ trống) nhớ hơn chỉ đọc: d = 0,40 (86 nghiên cứu); lớn nhất với nhớ gợi ý (cued recall 0,55), nhỏ hơn với nhớ tự do (0,32) | Slamecka & Graf 1978, JEP:HLM 4(6), doi:10.1037/0278-7393.4.6.592 ✔ · Bertsch et al. 2007, Mem Cogn 35(2), doi:10.3758/BF03193441 Ⓐ · Schindler & Richter 2023, Educ Psychol Rev 35, doi:10.1007/s10648-023-09758-w ✔ | ●●● cloze gõ đã đúng |
| **Mnemonics** | Mẹo nhớ (từ khoá, vần, chữ cái đầu) hợp với danh sách *vô nghĩa/tuỳ tiện*. Dunlosky: keyword mnemonic **thấp**; Donoghue & Hattie: 0,50. Không thay thế hiểu | Bellezza 1981, Rev Educ Res 51(2), doi:10.3102/00346543051002247 ✔ · Dunlosky 2013 Ⓐ · Donoghue & Hattie 2021 Ⓐ | ●● cho yếu tố cấu thành (đề xuất ⑨) |
| **Thiết kế câu hỏi ôn** | Câu hỏi nhỏ, rõ, một ý, nhất quán; **tránh câu "liệt kê tập hợp"** (khó nhớ, nhiễu); giảm nhiễu giữa các thẻ giống nhau là nguồn quên lớn nhất | Wozniak, "Twenty rules of formulating knowledge" (SuperMemo, 1999) ✔ · Matuschak, "How to write good prompts" (andymatuschak.org/prompts) ✔ | ●●● khớp 112 câu kiểu tập hợp còn mở từ đợt 6 |
| **Thời điểm phản hồi** | Phản hồi cần để sửa lỗi; tức thì hay trễ chưa có kết luận gọn (tuỳ nhiệm vụ). Phản hồi hữu ích khi cho biết *vì sao* và *làm gì tiếp* | Kulik & Kulik 1988, Rev Educ Res 58(1), doi:10.3102/00346543058001079 ✔ · Hattie & Timperley 2007, Rev Educ Res 77(1), doi:10.3102/003465430298487 ✔ | ●●● tức thì + giải thích |
| **ICAP** | Hoạt động tăng dần: thụ động < chủ động < kiến tạo < tương tác | Chi & Wylie 2014, Educ Psychol 49(4), doi:10.1080/00461520.2014.965823 ✔ | ●●● khung để chấm dạng câu mới |
| **Gamification** | Meta-analysis: nhận thức g = 0,49; động lực 0,36; hành vi 0,25 (Sailer & Homner); 0,504 chung, **ngắn hạn lớn hơn** (Bai 2020); 0,464, tuỳ yếu tố (Huang 2020). Yếu tố "cốt truyện game" và phối hợp–cạnh tranh là biến điều tiết. Thưởng ngoại sinh có thể giảm hứng thú tự thân: d −0,28/−0,36/−0,40; phản hồi tích cực +0,33 | Sailer & Homner 2020, Educ Psychol Rev 32, doi:10.1007/s10648-019-09498-w Ⓐ · Bai, Hew & Huang 2020, Educ Res Rev 30:100322, doi:10.1016/j.edurev.2020.100322 Ⓐ · Huang et al. 2020, ETR&D 68(4), doi:10.1007/s11423-020-09807-z Ⓐ · Deci, Koestner & Ryan 1999, Psych Bull 125(6), doi:10.1037/0033-2909.125.6.627 Ⓐ · Mekler et al. 2017, Comput Hum Behav 71, doi:10.1016/j.chb.2015.08.048 ✔ (kết quả chưa kiểm) · Nunes & Drèze 2006 (endowed progress), J Consum Res 32(4), doi:10.1086/500480 ✔ | ●● đã có đủ; ưu tiên thưởng "nhớ được" |
| **Mô hình Duolingo** | Half-life regression: 13 triệu lượt học, mã MIT. A/B (blog Duolingo 2016): thanh sức nhớ theo HLR tăng quay lại hằng ngày 9,5 % (luyện), 1,7 % (bài), 12 % (tổng). Streak Wager +14 % giữ chân ngày 7, Weekend Amulet +4 % (blog 2017); tách streak khỏi mục tiêu ngày +3,3 % ngày 14 (blog 2020). **Đây là chỉ số giữ chân, không phải điểm học.** | Settles & Meeder 2016, ACL P16-1174, doi:10.18653/v1/P16-1174 ✔ · blog.duolingo.com/how-we-learn-how-you-learn ✔ · …/how-streaks-keep-duolingo-learners-committed-to-their-language-goals ✔ · …/improving-the-streak ✔ · …/learning-how-to-help-you-learn-introducing-birdbrain ✔ | ●● đã có streak/bùa; HLR không cần (có FSRS) |
| **FSRS** | Ye, Su & Cao (KDD 2022); Su et al. (TKDE 2023). Benchmark công khai: ~10 nghìn người dùng Anki, ~727 triệu lượt. Bản FSRS-7 mới xử lý ôn *trong cùng ngày* (liên quan vòng sửa sai) | Ye, Su & Cao 2022, doi:10.1145/3534678.3539081 ✔ · Su et al. 2023, IEEE TKDE 35(10), doi:10.1109/TKDE.2023.3251721 ✔ · github.com/open-spaced-repetition/srs-benchmark ✔ | ●●● đang dùng |

**Ghi chú về chất lượng bằng chứng (nói thẳng).** (1) Phần lớn nghiên cứu là phòng thí nghiệm/lớp đại học Mỹ, vật liệu là từ, đoạn văn, toán, khoa học — **chưa có thử nghiệm đối chứng cho học khái niệm luật Việt Nam**; mọi cỡ hiệu ứng ở đây là mức tham khảo, không phải lời hứa. (2) Hiệu ứng interleaving *biến mất* với văn bản mô tả; vì vậy chỉ nên xen khi các khái niệm thật sự dễ nhầm. (3) Con số "Duolingo +14 %/+4 %" trong spec gốc (§2.5) lấy từ blog Duolingo 2017 (đã kiểm), **không phải** từ Class Central 2025 như spec gốc ghi; phần "badge không tác dụng / hearts gây phản ứng tiêu cực" chưa kiểm được ở nguồn gốc → đừng dựa vào đó để quyết định.

---

## 3. Sư phạm đặc thù ngành luật

Bằng chứng thực nghiệm cho riêng giảng dạy luật **mỏng và phần lớn là mô tả/tương quan**. Không tìm được thử nghiệm đối chứng ngẫu nhiên cho IRAC/CREAC, phương pháp Socrates hay phương pháp tình huống ở mức hiệu ứng đo được (**?**). Điều có thật:

- *Carnegie* (Sullivan, Colby, Wegner, Bond & Shulman, **Educating Lawyers**, Jossey-Bass 2007 ✔ bản tóm tắt tại archive.carnegiefoundation.org): mô tả trường luật Mỹ dựa nhiều vào đánh giá tổng kết cuối kỳ có hệ quả lớn và kêu gọi dùng đánh giá để cải thiện việc học, dạy cả suy luận pháp lý lẫn kỹ năng thực hành (đọc từ bản tóm tắt).
- *Sargent & Curcio 2012*, J Legal Educ 61(3):379 ✔ (jle.aals.org/home/vol61/iss3/4): bài tập formative + phản hồi giữa kỳ cải thiện điểm thi cuối ở khoảng hai phần ba lớp Evidence; **một phần ba (LSAT/GPA thấp hơn) không thấy lợi ích** → phản hồi cần cấu trúc hơn cho người yếu.
- *Schulze 2019*, J Legal Educ 68:230 ✔ (ecollections.law.fiu.edu): mô tả chương trình tự kiểm tra, giãn cách tại một trường, tỉ lệ đỗ luật sư cao; **không phải thử nghiệm đối chứng**.
- *Teninbaum 2017*, "Spaced Repetition: A Method for Learning More Law in Less Time", J High Tech L 17:273 ✔ (dc.suffolk.edu); số liệu tỉ lệ đỗ cao hơn 19,2 % ở bài báo National Jurist là của người bán nền tảng, **chưa qua bình duyệt**.
- *Colbran, Jones & Milburn 2018*, ASCILITE ✔ (open-publishing.org APUB 1923, bài ASCILITE 2018): 47 sinh viên luật năm nhất, 443 flashcard; SM2 hơn Leitner ở bài thi cuối (trung bình 38,1 so với 28,0); thử nghiệm nhỏ. Bài này còn tóm tắt Colbran và cộng sự 2017 (The Law Teacher 51(1):69, doi:10.1080/03069400.2015.1082239 ✔ DOI mở được, chưa đọc nội dung): thẻ do sinh viên tự làm; theo bài 2018, sinh viên thấy tạo thẻ tốn công và thích bài tập dạng vấn đề hơn.
- *Sparrow 2011*, "Using Individual and Group Multiple-Choice Quizzes to Deepen Students' Learning" ✔ (scholars.unh.edu/law_facpub/…; tên tạp chí chưa kiểm).

| Kỹ thuật pháp lý | Cơ sở học thuật | Hợp web tự học? | Ghi chú cho dự án |
|---|---|---|---|
| **Case method** (đọc án lệ/tình huống, rút quy tắc) | Truyền thống; Carnegie; so sánh trường hợp d = 0,50 (Alfieri) | Một phần: chỉ khi cho *tình huống ngắn có đáp án chuẩn*. Đọc bản án dài cần giáo viên | Hợp dạng Phân biệt/so sánh cặp tình huống; Luyện đề đã là case method rút gọn |
| **IRAC/CREAC** (Vấn đề–Quy tắc–Áp dụng–Kết luận) | Thực hành giảng dạy; không có thử nghiệm đo được (?) | Có, dưới dạng *khung điền/sắp xếp*; **chấm lập luận tự do cần giáo viên** | Worked → faded example (đề xuất ⑩) |
| **Issue spotting** | Dạng đề thi luật phổ biến (Abrams 2019, J Legal Educ 68(2), "The Deconstructed Issue-Spotting Exam" ✔ chỉ đọc mục lục, chưa đọc nội dung) | Một phần: dạng *chọn chế định áp dụng* làm được; dạng *tự liệt kê hết vấn đề* là câu tập hợp, khó chấm | `example→concept` là bản nhỏ |
| **Socratic questioning** | Hỏi dồn từng bước | Chỉ dạng cố định, ít nhánh | Cây hỏi "vì sao → vậy nếu…" nhỏ (đề xuất ②, ⑪) |
| **Đổi một tình tiết** (hypothetical variations) | Truyền thống dạy luật; cơ chế gần với so sánh trường hợp và phân biệt | Có, nếu mỗi biến thể có *đáp án chuẩn đã duyệt* | Cần Hào/giáo viên viết; đề xuất ⑪ |
| **Bảng so sánh chế định** | Contrasting cases d = 0,50; interleaving g = 0,42 | **Có, hợp nhất** | Dựng từ `confusables`, `pair`, `keywords` (đề xuất ④) |
| **Sơ đồ khái niệm** | Concept map meta-analysis (Nesbit & Adesope); nhưng kém nhớ lại khi làm hoạt động chính | Có như *tổ chức trước*, không như bài học chính | Đề xuất ⑬ |
| **Đọc–giải thích điều luật** | Thực hành cốt lõi; bằng chứng riêng (?) | Có: tô điều kiện, điền cloze, so khoản | Đề xuất ⑮ |
| **Tìm lỗi trong lập luận** | Error-finding trong ví dụ mẫu: Große & Renkl 2007, Learn Instr 17(6), doi:10.1016/j.learninstruc.2007.09.008 ✔ — có lợi khi đã có nền; người mới có thể rối | Có, cho người đã qua bậc 3 | Đề xuất ⑫ |
| **Mô phỏng phiên toà, nhập vai** | Truyền thống | **Không** (cần người) | Ngoài phạm vi web |

---

## 4. Khảo sát web/app học luật (chỉ ghi điều thấy trên trang; truy cập 03/11/2026)

| Trang | Điều thấy (có link) | Có điểm đáng học |
|---|---|---|
| **hocluat.vn** | Tự mô tả "ấn phẩm về pháp luật với thư viện hơn 80.000 tài liệu"; mục *Kinh nghiệm học luật*, *Đề cương ôn tập*, *Đề thi luật*, giáo trình; có danh sách "102 câu hỏi trắc nghiệm luật lao động (có đáp án)". Không thấy tài khoản, tiến độ, flashcard, lặp lại | Kho đề cương/đề; chủ đề "kinh nghiệm học" |
| **luatvietnam.vn** | CSDL văn bản (tab *Tổng quan, VB liên quan, Hiệu lực, Lược đồ*), lọc *Sắp có hiệu lực/Hết hiệu lực*, bản tin, "AI Luật" (hỏi đáp), thuật ngữ pháp lý, máy tính thuế. Không thấy quiz/khoá học | **Lược đồ quan hệ văn bản** và nhãn hiệu lực — giúp người học thấy văn bản còn hiệu lực không |
| **thuvienphapluat.vn** | 436.998 văn bản; tài khoản Free/Basic… có *Lược đồ*, bản dịch Anh–Việt. Nhánh **aigiaoduc.thuvienphapluat.vn** (GDCD phổ thông) có menu *Giải bài tập, Luyện thi, Quiz vui, Góc ôn bài, Hỏi đáp AI, Luật cho em* (chỉ đọc được menu) | Gộp tra cứu + ôn tập trong một nơi |
| **luatminhkhue.vn** | Văn phòng luật sư: tư vấn, bài viết theo lĩnh vực, hotline, video. Không phải sản phẩm học | — |
| **dethitracnghiem.vn** | Nhiều môn phổ thông + đại học; ~21–23 mục luật; trang chỉ lộ tiêu đề/link, mô tả "đề thi với đầy đủ đáp án". Không xác nhận được định dạng câu | Phủ rộng môn |
| **Quimbee** (quimbee.com) | 47.500+ case brief, 1.295 video bài giảng, 7.000+ câu trắc nghiệm, 210+ tình huống issue-spotter, outline; "flashcards utilize the latest science" (trang không nói phương pháp, **không nhắc spaced repetition**); từ $23/tháng | Case brief ngắn trước khi đọc; video ngắn kèm 3 câu đố (SideBar) |
| **Studicata** (studicata.com) | 101.554 case brief, 15.000 câu trắc nghiệm, giả lập thi, theo dõi "độ chính xác và thời gian theo môn"; chấm luận (gói VIP+ $99/tháng). Không nhắc flashcard/SR | Phân tích độ chính xác–thời gian theo môn; chấm luận có người |
| **CALI Lessons** (cali.org) | "free, interactive CALI Lessons covering 40+ legal subjects", 1.400+ bài, dùng bằng mã của trường luật; cho sinh viên "reinforce concepts, test knowledge, find areas to improve" | Bài tương tác ngắn, theo chủ đề, của giảng viên |
| **AnkiWeb "law"** (ankiweb.net/shared/decks?search=law) | Hàng chục bộ do người dùng đăng, tên như "Evidence (Bar Exam)", "Federal Rules of Evidence", "Constitutional Law - Pitt"; trong phần đọc được không thấy bộ nào cho luật Việt Nam | Cloze trên quy tắc; người học tự tạo thẻ |
| **Blog nhà bán** (Case Cub, Briefly, Barbri — thương mại) | Nói luật "chưa có bộ thẻ chuẩn", thẻ tải về có thể sai ở khu vực pháp lý khác; Barbri: thẻ hợp để ôn, "kém hiệu quả cho lần tiếp xúc đầu tiên" | Cảnh báo: nội dung tải về phụ thuộc luật địa phương (điều này **đúng với Việt Nam** sau 01/07/2025) |

**Vì sao khô khan** — *điều thấy*: trang Việt chủ yếu là kho văn bản/bài/đề (hocluat, luatvietnam, thuvienphapluat, luatminhkhue), không có tài khoản–tiến độ–lặp lại trên trang chính; quiz là danh sách tĩnh. *Suy ra* (không phải điều quan sát trực tiếp): đọc thụ động (Chi & Wylie: mức thấp nhất của ICAP), không phản hồi theo lỗi, không giãn cách, nhớ bằng nhận ra đáp án. Bên quốc tế mạnh hơn ở **tình huống + video + phản hồi**, nhưng thẻ SR thì đa số do người học tự làm; Quimbee/Studicata không nêu SR. Điểm mình đã vượt: SR theo khái niệm, nguồn nguyên văn, Phân biệt. Điểm mình chưa theo kịp: **tình huống nhiều (Quimbee 210+ issue-spotter, CALI 1.400 bài)**, **phân tích lỗi theo môn** (Studicata), **chấm lập luận có hướng dẫn**.

---

## 5. Mã nguồn mở đáng học (không đề xuất thêm thư viện)

Số sao GitHub **chưa kiểm** (API bị chặn trong phiên); độ uy tín dựa trên tổ chức, giấy phép, lịch sử commit đọc được trên trang repo.

| Repo | Thấy trên trang | Ý tưởng mượn |
|---|---|---|
| **ankitects/anki** (github.com/ankitects/anki) | 12.612 commit; giấy phép trong `LICENSE` | *Leech* (thẻ sai lặp): theo hướng dẫn của một trang bên thứ ba (Briefly) Anki gắn nhãn leech sau tám lần sai, ý là viết lại thẻ chứ không chỉ ôn thêm (chưa kiểm ở tài liệu chính thức của Anki) |
| **open-spaced-repetition/fsrs4anki, srs-benchmark** (`ts-fsrs` đang dùng, chưa mở lại trang) | fsrs4anki: MIT; benchmark 9.999 người, ~350 triệu lượt dùng để đánh giá | Lấy log của chính mình để *tối ưu tham số* sau khi có đủ lượt; so sánh theo log-loss thay vì cảm tính; bước 2 trong spec gốc §2.3 |
| **kantord/LibreLingo** (AGPL-3.0; README ghi tác giả đã ngừng bảo trì; web app Svelte + PouchDB) | Tính năng: bài tập tương tác, spaced repetition, lưu tiến độ, đồng bộ | Khoá học viết bằng tệp văn bản cho người đóng góp; **không dùng mã (AGPL)** |
| **oppia/oppia** (Apache-2.0) | "explorations" mô phỏng "cuộc trò chuyện một–một với gia sư … học bằng làm kèm phản hồi" | **Phản hồi theo từng đáp án sai** và nhánh hỏi tiếp (tương ứng đề xuất ②, ⑪) |
| **h5p/h5p-php-library** (GPL-3.0) | Nền tảng nội dung tương tác nhúng | Danh mục dạng tương tác (kéo thả, điền, tô từ) — dùng làm bảng đối chiếu cho ⑮ |
| **andymatuschak/orbit**, Quantum Country (AGPL-3.0; một số gói Apache-2.0) | "mnemonic medium": câu hỏi ôn *nhúng ngay trong bài đọc* | **Hỏi ngay sau mỗi đoạn ngắn rồi hẹn ôn** → chính là thẻ giới thiệu ba lớp có câu hỏi ngay (đề xuất ③); hướng dẫn viết prompt tập trung, chính xác, nhất quán |
| **duolingo/halflife-regression** (MIT) | 13 triệu lượt học, ba chỉ số MAE/AUC/Spearman | Cách đánh giá mô hình nhớ bằng dữ liệu thật |

---

## 6. Đề xuất xếp hạng

Công sức: **S** ≤ nửa ngày · **M** 1–2 ngày · **L** > 2 ngày hoặc cần Hào viết nội dung. Chỉ số: dùng log `ReviewRow` (có `rating`, `level`, `elapsedMs`, `at`) và, khi cần, thêm cột tuỳ chọn.
★ = nên làm trước. Thứ tự = ưu tiên sau khi cân hiệu quả/công sức/rủi ro.

**★ ① Độ tự tin 3 mức trước khi xem đáp án + "chắc mà sai" được sửa kỹ + rating theo tự tin.**
- *Người học thấy:* ở trắc nghiệm/Đúng-Sai/điền khuyết: ba nút nhỏ "Chắc / Tạm / Đoán" (có phím tắt, có thể bỏ qua). Sai mà "Chắc" → phản hồi nổi bật "Bạn rất chắc nhưng sai" kèm so sánh; hồ sơ có đường "độ chuẩn tự đánh giá".
- *Cơ chế:* hypercorrection (Butterfield & Metcalfe 2001; Metcalfe 2017) + calibration (Bjork 2013). Đúng mà "Đoán" ghi Hard (không phải Good); trọng số theo dạng (đoán trúng 25 %/50 % không nâng thẻ như gõ đúng).
- *Hợp engine:* `answer.ts`, `ratingFor` thêm tham số; `ReviewRow` thêm `conf?`. *Nội dung luật mới:* **không**. **Công sức: M.**
- *Rủi ro:* thêm một thao tác/câu → chậm phiên; giảm bằng mặc định chỉ hỏi ở 1/3 số câu hoặc từ bậc 2. Dữ liệu cũ vẫn đọc được (`conf` tuỳ chọn). *Chỉ số:* Brier score hoặc chênh lệch (độ chắc − tỉ lệ đúng); tỉ lệ lỗi "Chắc" được sửa ở lượt ôn sau; tỉ lệ đúng ở lần ôn ≥ 7 ngày.

**★ ② Phản hồi nói *vì sao*, dựng từ dữ liệu đã kiểm (không viết khẳng định mới).**
- *Người học thấy:* sau câu sai: "Đáp án đúng: X. Vì định nghĩa là «… cụm trúng được in đậm …» (nguồn)." Với phương án nhiễu sinh từ khái niệm khác: "Bạn chọn Y — đó là định nghĩa/dấu hiệu của «Z» (dễ nhầm với X)." Sau câu đúng: một dòng "Dấu hiệu quyết định: …" từ `keywords`.
- *Cơ chế:* phản hồi giải thích > chỉ đúng/sai (Hattie & Timperley 2007); sửa nhiễu từ phương án sai (Roediger & Marsh 2005; Butler & Roediger 2008); elaborative interrogation chính xác (Dunlosky 2013).
- *Hợp engine:* 62 % `explain` là trích dẫn nên thay bằng khối "vì sao" ghép từ `definition` (đã che), `plain`, `keywords`, `confusables` — các trường sẵn có; UI ở `Feedback.svelte`. *Nội dung luật mới:* **không** (chỉ cắt/ghép trường đã kiểm; `explain` gốc vẫn hiện). **Công sức: M.**
- *Rủi ro:* cắt định nghĩa sai chỗ làm méo nghĩa → chỉ in đậm/lược dấu "(…)" như `shownText`, kiểm bằng test; phản hồi dài → gập lại. *Chỉ số:* tỉ lệ đúng ở lần gặp lại cùng khái niệm sau câu sai; tỉ lệ người mở "Xem thêm"; số lần sai lặp (`wrongStreak ≥ 3`) giảm.

**★ ③ Đoán trước + thẻ giới thiệu ba lớp (ví dụ → dấu hiệu → nguyên văn).**
- *Người học thấy:* khái niệm mới không mở bằng tường chữ nữa. (a) *Đoán trước* (tuỳ chọn "Bỏ qua"): 1–2 câu mỗi đợt, "ví dụ → khái niệm nào trong đợt này?" (dạng sinh tự động đã có), sai không sao, không ghi tiến độ. (b) Thẻ giới thiệu: dòng **ví dụ** + 3–4 chip **dấu hiệu** (`keywords`), bấm "Xem nguyên văn điều luật" mới mở định nghĩa + nguồn. (c) Sau mỗi khối 2–3 khái niệm là câu hỏi ngay (đã có).
- *Cơ chế:* pretesting (Richland 2009; Kornell 2009; Pan & Carpenter 2023); ví dụ cụ thể trước (Fyfe 2014); chia nhỏ (Cowan 2001; Wozniak); mnemonic medium (Orbit). **Vào bài nhanh hơn** vì người học đã có điểm neo trước khi đọc nguyên văn.
- *Hợp engine:* `Step` thêm `meta.kind = 'pretest'` (giống `retry`: không ghi tiến độ, không đổi bậc); `CardIntro.svelte` đổi bố cục. *Nội dung luật mới:* **không** (`example`, `keywords`, `definition` đã kiểm, 690/690 có `example`). **Công sức: M.**
- *Rủi ro:* đoán sai nhiều gây nản (dùng "Bỏ qua", giới hạn 2/đợt); chip `keywords` có thể không nằm nguyên văn trong định nghĩa (vd. "liệt kê", "loại trừ") → chỉ hiện làm chú thích, không phải trích dẫn. *Chỉ số:* thời gian tới câu trả lời đầu tiên của đợt; tỉ lệ đúng ở bậc 1 của khái niệm ngay sau; tỉ lệ đúng ở lần ôn 7 ngày (so trong cùng người: khái niệm có/không đoán trước, chia theo hàm băm id).

**★ ④ Bảng so sánh cho cặp dễ nhầm (contrasting cases) — sau câu Phân biệt, trong "Khó nhớ", và tab "So sánh A–B".**
- *Người học thấy:* hai cột A | B: định nghĩa (đã che tên đối phương), dấu hiệu `keywords` của mỗi bên, ví dụ, điểm khác. Chế độ tự điền: kéo dấu hiệu vào cột đúng. Hiện ngay sau khi trả lời `sort` (cả đúng lẫn sai) và khi một khái niệm bị đánh "khó nhớ".
- *Cơ chế:* so sánh trường hợp d = 0,50, tốt nhất khi nêu *điểm giống trước* rồi *nguyên tắc sau* (Alfieri 2013); phân tích tương tự (Gentner 2003); phân biệt đòi hỏi xen kẽ gần nhau (Kornell & Bjork 2008).
- *Hợp engine:* `confusables` (690/690), `pair` (690 khái niệm, mỗi khái niệm một) và `genSort` đã gom cặp; thêm `ui/ComparePanel` dùng lại `CardSort`. *Nội dung luật mới:* **không**. **Công sức: M.**
- *Rủi ro:* cặp hai khái niệm có định nghĩa chồng nhau (đã có hàm `definitionsOverlap`, dùng lại); hình bảng dày chữ trên điện thoại → xếp dọc. *Chỉ số:* tỉ lệ đúng câu `sort` lần kế; giảm lỗi lặp trong cặp; số lần mở bảng/phiên.

**★ ⑤ Xen kẽ có chủ đích: ôn cặp dễ nhầm liền nhau, thay vì trộn ngẫu nhiên mọi môn.**
- *Người học thấy:* trong "Ôn hôm nay", hai khái niệm dễ nhầm (A, B) xuất hiện cách nhau 1–3 câu; không còn các câu rời rạc cùng môn tuỳ ý.
- *Cơ chế:* lợi interleaving phụ thuộc *giống giữa các nhóm* (Brunmair & Richter 2019: hiệu ứng nhỏ/không có ở văn bản mô tả; lớn khi nhóm giống nhau); phân biệt luật là đúng ca này.
- *Hợp engine:* `arrange.ts` (`interleave`) thêm điểm ưu tiên theo `confusables` ở `buildReviewSession`. *Nội dung mới:* **không**. **Công sức: S.**
- *Rủi ro:* phát lộ đáp án nếu câu A giải thích B → không xếp liền nếu câu trước vừa hiện tên khái niệm sau. *Chỉ số:* tỉ lệ đúng ở `sort`/`pair`; lỗi nhầm cặp (chọn đúng khái niệm dễ nhầm) theo thời gian.

**⑥ "Nghĩ trước, rồi mới hiện phương án" (kiểu lai) cho trắc nghiệm bậc 1–2.**
- *Thấy:* câu hỏi hiện trước, phương án hiện sau khi bấm "Đã nghĩ" hoặc sau 3 giây; có thể tắt (lưu `localStorage`).
- *Cơ chế:* lai nhớ-trước-rồi-chọn giữ lợi ích khi nhớ thành công (Smith & Karpicke 2014); giảm mẹo "đáp án dài nhất" mà đợt 6 phải sửa nội dung.
- *Hợp engine:* `CardMcq.svelte`. *Nội dung mới:* không. **S.** *Rủi ro:* chậm, gây khó chịu; áp từ bậc 2, tắt được. *Chỉ số:* tỉ lệ đúng; thời gian trả lời; khoảng cách đúng giữa người bật/tắt (trong cùng người, luân phiên theo ngày).

**⑦ Rating FSRS công bằng hơn: ngưỡng thời gian theo độ dài đề; trọng số theo dạng câu; ôn theo ngày thi.**
- *Thấy:* ít thẻ bị "Hard" oan vì đề dài; có ô "Ngày thi môn X" (bản địa, `localStorage`) → các tuần trước thi tăng tần suất ôn.
- *Cơ chế:* gap tối ưu tăng theo thời gian cần nhớ (Cepeda 2006, 2008); FSRS cho `request_retention` theo hạn.
- *Hợp engine:* `ratingFor` (ngưỡng = 4 s + ~0,05 s × số chữ), `settings.retention` tạm tăng. *Nội dung mới:* không. **M.** *Rủi ro:* sửa mô hình lịch → phải có test và kiểm tra lại dữ liệu đã lưu; **không đổi FSRS** (đợt 6 ghi rõ không đổi `ts-fsrs`), chỉ đổi đầu vào rating. *Chỉ số:* tỉ lệ Hard/Easy hợp lý; tỉ lệ đúng ở lượt ôn đến hạn.

**⑧ Thẻ "khó nhớ" (leech) đổi cách học, không chỉ ôn nhiều hơn.**
- *Thấy:* sau 3 lần sai liền (`wrongStreak ≥ 3`): hiện bảng so sánh (④), chia nhỏ định nghĩa thành 2–3 ý (cloze từng ý), cho xem mẹo nhớ nếu có (⑨), thay vì lặp lại cùng câu.
- *Cơ chế:* nhiễu giữa thẻ giống nhau là nguồn quên lớn nhất, sửa nguyên nhân (Wozniak); Anki đánh dấu leech cho viết lại.
- *Hợp engine:* tập "Khó nhớ" đã có (`repo.difficult()`). *Nội dung mới:* không. **M.** *Rủi ro:* quá nhiều biến thể làm rối → chỉ 1 can thiệp/lần. *Chỉ số:* số khái niệm có `wrongStreak ≥ 3` sau 14 ngày.

**⑨ Mẹo nhớ (hook) tuỳ chọn cho yếu tố cấu thành/điều kiện.**
- *Thấy:* nhãn "Mẹo nhớ" ở thẻ khó: vần, từ khoá hình, câu viết tắt chữ cái đầu của các điều kiện.
- *Cơ chế:* mnemonic hợp danh sách tuỳ tiện (Bellezza 1981), nhưng Dunlosky xếp thấp → chỉ dùng cho thẻ leech, không phổ biến đại trà.
- *Hợp engine:* thêm trường tuỳ chọn `hook` vào schema (opus giữ `schema.ts`). *Nội dung mới:* **có** (mẹo do Hào duyệt; không phải khẳng định pháp lý nhưng không được làm sai điều kiện). **L.** *Rủi ro:* mẹo làm lệch nghĩa. *Chỉ số:* tỉ lệ đúng của khái niệm có hook so với khái niệm cùng loại không có (luân phiên).

**⑩ Tình huống ba bước (Vấn đề – Căn cứ – Kết luận): bài mẫu rồi mờ dần.**
- *Thấy:* lần đầu xem tình huống đã giải mẫu 3 bước; lần sau bỏ bước Căn cứ (chọn điều/khoản đúng, nguyên văn); lần sau nữa bỏ cả Vấn đề.
- *Cơ chế:* worked → faded examples (Renkl & Atkinson 2003); IRAC như khung.
- *Hợp engine:* thẻ mới trong `ui/cards`, dùng 470 câu Luyện đề có `basis` + `url`. *Nội dung mới:* **có** (cần viết bước "Vấn đề" và phương án "Căn cứ" cho từng câu; mọi điều trích phải dò về `data/laws/*.txt`). **L.** *Rủi ro:* viết sai căn cứ; đợt 7 đang dò trích dẫn nên **làm sau** khi công cụ dò xong. *Chỉ số:* tỉ lệ đúng ở bước đã mờ; điểm tự chấm `recall`.

**⑪ "Đổi một tình tiết" (hypothetical variations) cho vài tình huống chọn lọc.**
- *Thấy:* sau một tình huống, "Nếu A không còn 18 tuổi thì kết luận có đổi không?" với đáp án đã duyệt.
- *Cơ chế:* so sánh trường hợp + Socratic; kiểm tra hiểu điều kiện chứ không thuộc kết quả.
- *Hợp engine:* thêm `variant?: { change; answer; explain }` vào `case`. *Nội dung mới:* **có** — nội dung pháp lý, Hào phải viết/duyệt. **L.** *Rủi ro:* biến thể mơ hồ; bắt đầu 20 câu. *Chỉ số:* tỉ lệ đúng; thời gian trả lời; so sánh với câu gốc cùng khái niệm.

**⑫ Tìm lỗi trong lập luận.**
- *Thấy:* một lập luận 2–3 câu, trong đó **một** câu sai; chạm vào câu sai.
- *Cơ chế:* error-finding (Große & Renkl 2007) — hợp người đã vững; bài mẫu đúng vẫn hơn bài sai cho người mới (Barbieri 2023), nên chỉ từ bậc ≥ 4.
- *Hợp engine:* tận dụng 580 câu Đúng/Sai có đáp án *Sai* + `explain`, nhưng các câu này **không ghi cụm sai** → cần Hào đánh dấu cụm sai cho ~100 câu đầu. **M–L.** *Rủi ro:* chọn nhầm cụm. *Chỉ số:* tỉ lệ đúng; chuyển giao sang Đúng/Sai khác.

**⑬ Bản đồ đợt (advance organizer) 10 giây trước khi học.**
- *Thấy:* 4–5 khái niệm của đợt thành sơ đồ nhỏ nối bằng quan hệ dễ nhầm; chỉ xem, không làm thành bài.
- *Cơ chế:* advance organizer (Luiten 1980; Mayer 2002); không biến thành hoạt động chính (Karpicke & Blunt 2011).
- *Hợp engine:* `LessonPanel` đã có bảng đợt; thêm nối từ `confusables`. *Nội dung mới:* không. **S–M.** *Rủi ro:* trang trí thừa (Rey 2012) → chỉ giữ nếu giúp thao tác tiếp theo. *Chỉ số:* thời gian tới câu đầu; tỉ lệ đúng bậc 1.

**⑭ Vào bài ≤ 10 giây, phiên ngắn lựa chọn (5/10/20 bước) và "hôm nay nhớ được gì".**
- *Thấy:* nút duy nhất "Ôn ngay" vào câu hỏi đầu (không qua màn mô tả); màn kết thúc ưu tiên "n khái niệm đã nhớ chắc hơn" (lên bậc/sửa được) thay vì tổng XP.
- *Cơ chế:* Duolingo: hạ rào cản thói quen quan trọng hơn lượng học (blog 2020; chỉ số giữ chân, không phải điểm học); endowed progress (Nunes & Drèze 2006). Thưởng gắn với nhớ, không với bấm nhanh (Deci 1999).
- *Hợp engine:* `Home`, `SessionEnd`, `REVIEW_MAX_STEPS`. *Nội dung mới:* không. **S.** *Chỉ số:* thời gian tới câu đầu; tỉ lệ bỏ phiên; ngày học/tuần.

**⑮ Đọc–giải thích điều luật: tô các điều kiện trong nguyên văn.**
- *Thấy:* nguyên văn định nghĩa; chạm các cụm là "điều kiện/dấu hiệu", rồi so với đáp án; sai thì hiện cụm còn thiếu.
- *Cơ chế:* hoạt động kiến tạo (ICAP) trên văn bản gốc; khác tô sáng thụ động (Dunlosky: thấp).
- *Hợp engine:* thẻ mới, dùng `definition` + `keywords`; nhiều `keywords` **không nằm nguyên văn** trong định nghĩa nên cần chuẩn hoá hoặc đánh dấu `span` bằng tay. *Nội dung mới:* **có** (đánh dấu cụm). **M–L.** *Rủi ro:* cụm tô sai nghĩa pháp lý. *Chỉ số:* tỉ lệ đúng cloze của cùng khái niệm.

**Thứ tự làm đề xuất:** ① → ② → ⑤ (rẻ) → ③ → ④; sau đó ⑥, ⑭, ⑦; nội dung (⑨–⑫, ⑮) chỉ khi Hào viết/duyệt xong và công cụ dò trích dẫn của opus ổn định.

**Cách đo khi chỉ có một người dùng.** App local-first: so sánh *trong cùng người*, ngẫu nhiên theo khái niệm (hàm băm `conceptId` chia hai nhánh có/không có tính năng) rồi so tỉ lệ đúng ở lần ôn đầu tiên ≥ 7 ngày sau, từ `ReviewRow`. Cần ≥ vài trăm lượt/nhánh mới đáng tin; với một người dùng chỉ là chỉ báo, không phải kết luận. Thêm `conf?` và `variant?` là trường tuỳ chọn; dữ liệu cũ vẫn nhập lại được (`parseExport`).

---

## 7. Không nên làm

1. **Thêm lớp thưởng/âm/hiệu ứng nữa** (tranh, huy hiệu, chuỗi dài hơn): gamification chỉ g ≈ 0,25–0,5 và giảm khi dùng dài; thưởng ngoại sinh có thể giảm hứng thú tự thân (Deci 1999); chi tiết trang trí không liên quan làm giảm học (Harp & Mayer 1998; Rey 2012). Đã đủ.
2. **Bảng xếp hạng hoặc "mất mạng/tim" cho người sai**: spec gốc đã bỏ hearts vì lý do phản ứng tiêu cực (nguồn Class Central, **chưa kiểm**). Nếu cần xếp hạng, chỉ theo *khái niệm nhớ được*, không theo tốc độ.
3. **Mở rộng TTS thành đọc câu hỏi trước khi chọn, hay "học bằng tai"**: không có bằng chứng; Hào đã loại luyện nói; đọc nguyên văn đang hiện có thể dư thừa. Giữ như tiện ích.
4. **Dạng "học theo phong cách" (nhìn/nghe/làm)**: không có bằng chứng ứng xử khác nhau (Pashler, McDaniel, Rohrer & Bjork 2008, Psychol Sci Public Interest 9(3), doi:10.1111/j.1539-6053.2009.01038.x ✔).
5. **Câu "liệt kê tập hợp"** ("gồm những gì?") làm bài chính: khó nhớ, sinh nhiễu "Chỉ…" (112 câu mở từ đợt 6). Tách thành từng ý (Wozniak; Matuschak).
6. **Tô sáng/tóm tắt/đọc lại như hoạt động chính**: Dunlosky xếp thấp.
7. **Xen kẽ ngẫu nhiên khái niệm không liên quan** hoặc xen mọi thứ trong thẻ giới thiệu: hiệu ứng interleaving ~0 với văn bản mô tả (Brunmair 2019).
8. **Để AI/mẫu tự sinh *khẳng định pháp lý mới*** (tình huống, đáp án Đúng, mẹo) không qua dò điều luật và duyệt: trái `CLAUDE.md` và quy tắc đợt 7.
9. **Nhồi "tự giải thích" cho người mới trước khi có bài mẫu**: Barbieri 2023 và Kirschner 2006 cho thấy hướng dẫn tối thiểu kém cho người mới.
10. **Học thuộc số điều như mục tiêu**: giữ số điều ở `source` để *tra*, không biến thành thẻ nhớ trừ khi đề thi hỏi trực tiếp.

---

## 8. Kết quả kiểm chứng nguồn và phần còn mở

- **Đã kiểm (100 nguồn):** 67 bài/sách có DOI (Crossref trả đúng tác giả–năm–tạp chí, ngày 03/11/2026), trong đó 18 bài có số liệu lấy từ tóm tắt đã đọc (Ⓐ); 33 nguồn URL: 6 tài liệu luật (Carnegie, Sargent & Curcio, Schulze 2019, Teninbaum, Colbran–Jones–Milburn 2018, Sparrow 2011), 3 tài liệu thiết kế thẻ (Wozniak, Matuschak, Quantum Country), 4 bài blog Duolingo, 3 blog nhà bán, 9 trang web học luật, 8 trang GitHub (kể cả `duolingo/halflife-regression`).
- **Chưa kiểm:** 6 nguồn: Mayer *Multimedia Learning* (sách, chưa mở trang nhà xuất bản); Paivio 1971; Bjork & Bjork 2011 (chương sách); Pressley et al. 1987; Kalyuga et al. 2003; Class Central 10/2025 (nguồn gián tiếp của spec gốc). Ngoài ra chưa kiểm: số g/d của Rowland 2014, Adesope 2017, Bisra 2018, Rey 2012, Yang 2018, Rawson 2013; quy tắc "10–20 %" của Cepeda 2008; kết quả cụ thể của Mekler 2017 và Agarwal 2019; DOI của Schulze 2020 (JARMC; trang FIU xác nhận bài tồn tại, DOI bị chặn 403); tên tạp chí của Sparrow 2011; nội dung bài Abrams 2019 (chỉ thấy mục lục); hiệu quả đo được của IRAC/Socrates/case method; số sao GitHub; mọi số liệu từ blog nhà bán (Case Cub, Briefly, Barbri).
- **Việc phải hỏi Hào:** (1) Luyện đề có nên ghi lịch ôn không (code có sẵn nhánh ghi khi câu có `concept`, hiện chưa dùng)? (2) Chọn đề xuất nào (khuyến nghị ①–⑤ trước)? (3) Có sẵn sàng viết/duyệt nội dung cho ⑩–⑫ (nội dung luật mới, chờ công cụ dò trích dẫn)? (4) Có chấp nhận thêm trường tuỳ chọn `conf?` vào `ReviewRow`?
- **Giới hạn của nghiên cứu này:** không chạy app thật; hiện trạng đọc từ mã và dữ liệu; không có số đo trải nghiệm người học Việt Nam.
