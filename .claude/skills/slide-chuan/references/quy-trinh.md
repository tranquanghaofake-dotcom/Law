# Quy trình — từng bước, sản phẩm, điểm duyệt

Nguồn: spec `docs/specs/2026-11-14-slide-chuan-v2-quy-trinh.md` (Duarte, Alley, Mayer, Bloom, PPTAgent, AutoPresent, skill `pptx` của Anthropic).
Mọi sản phẩm nằm trong **thư mục bài** (vd. `scratchpad/<bài>/`), không trong skill.

## 0–1. Brief + mục tiêu → `brief.md`
Một trang, đủ các mục:
- **Đề tài, nơi dùng** (chiếu trên lớp / đăng công khai — quyết định giấy phép ảnh), **thời lượng** (chưa biết thì HỎI), máy chiếu / phòng.
- **Khán giả**: đã biết gì, chưa biết gì, hay nhầm gì.
- **3–5 mục tiêu học tập** theo Bloom, động từ đo được ("phân biệt", "tính được", "xác định") — mỗi mục tiêu về sau phải có ≥ 1 slide và ≥ 1 câu kiểm tra.
- **Một câu ý lớn** (điều người nghe phải mang về).
- **Ràng buộc**: giữ nguyên nội dung gốc hay được bổ sung; có bài tập / trắc nghiệm không; có lời giải không.

## 2. Nghiên cứu, kiểm chứng → `noi-dung.md`
- Rút dàn ý tài liệu gốc: `python3 scripts/outline.py <tài liệu> <bài>/outline.json`; không im lặng bỏ mục — mục bỏ ghi lý do.
- Tra thêm nguồn ngoài khi tài liệu gốc thiếu / cũ; luật Việt Nam: gọi skill `vn-legal-exam-analysis`, tra `packages/content/data/laws/`; luật đã sửa đổi → bản hợp nhất mới nhất.
- Cấu trúc file:
  1. **Nội dung** theo dàn ý, đủ để người khác dựng slide mà không mở tài liệu gốc.
  2. **Bảng nguồn**: nhận định / con số → nguồn (trang, điều, link) → tình trạng hiệu lực → ngày đối chiếu.
  3. **Lỗi / điểm cũ trong tài liệu gốc** (luật hết hiệu lực, số sai, diễn đạt dễ hiểu nhầm) + đề xuất.
  4. **Điều chưa chắc** — sẽ ghi rõ trên slide hoặc hỏi người dùng.
- Bài tập: giữ số liệu đề; lời giải chỉ khi người dùng muốn; con số tự tính phải cộng lại được từ dữ kiện.

**Điểm duyệt A** (bài có tài liệu gốc: gộp brief + mục tiêu + nội dung; bài mới: duyệt brief riêng trước). Gửi bản ghi lựa chọn (`vai-tro.md`) nếu có quyết định thật (vd. sửa lỗi tài liệu gốc hay giữ nguyên).

## 3. Kịch bản → `kich-ban.md`
Bảng, mỗi slide một dòng:
`# | người nghe đang thắc mắc gì | khẳng định (= tiêu đề: kết luận cụ thể, có đối tượng thật, không chơi chữ) | bằng chứng hình (sơ đồ / bảng / ảnh / hình vẽ — mô tả cụ thể) | nguồn (dòng trong noi-dung.md) | giây | lời nói (2–4 câu)`
- **Mạch theo thể loại** — chọn đúng một, ghi ở đầu `kich-ban.md`:
  | Thể loại | Mạch | Không làm |
  |---|---|---|
  | Bài giảng (có tài liệu gốc) | **bám dàn ý và thứ tự mục của bài giảng gốc**; mỗi khái niệm: định nghĩa → hình chứng minh → ví dụ ngắn của riêng khái niệm đó; bài tập, câu hỏi giữ đúng chỗ của gốc | không dựng cốt truyện / nhân vật xuyên suốt; không đảo thứ tự mục để "kể chuyện" |
  | Bình luận bản án, vụ việc | tình tiết → vấn đề pháp lý → phân tích từng vấn đề → kết luận, kiến nghị; nhân vật là các bên thật của vụ | không thêm tình tiết ngoài hồ sơ |
  | Báo cáo, số liệu | kết luận trước → số liệu làm bằng chứng → nguyên nhân → kiến nghị | không trình bày cùng số liệu hai lần |
  | Bảo vệ, thuyết phục | vấn đề → giải pháp / luận điểm → bằng chứng → đề nghị | không nhồi lý thuyết nền |
- Đọc liền cột khẳng định phải thành một mạch lập luận của đúng thể loại đã chọn.
- Mỗi slide MỘT ý; hai ý → hai slide. Chữ trên slide viết đủ nghĩa ngay ở kịch bản (không viết tắt, không cụm cụt) — không đợi lúc dựng mới cắt cho vừa.
- Cột bằng chứng hình phải chỉ ra **vật thật của bài** (trang / điều khoản nào của tài liệu gốc, bảng số nào) theo `nguon-hinh.md` quy tắc 0. Mỗi mục tiêu có slide + câu kiểm tra. Tổng giây ≈ thời lượng (chừa 10 %).
- Bằng chứng hình chọn theo **câu hỏi của người nghe**, không theo hình thức tài liệu: quan hệ các bên → sơ đồ; so sánh → hai cột / thước chung; số liệu → bảng hoặc biểu đồ đúng tỉ lệ; thời gian → trục; quy trình → bước. Hình phải cho thấy chính sự vật, không ẩn dụ.

**Điểm duyệt B.**

## 4. Tham chiếu + hệ thống thiết kế + bản đồ nhịp → `thiet-ke/`
**4a. Tham chiếu** (`thiet-ke/tham-chieu/`) — **người dùng chọn bằng mắt** (18/11/2026): `python3 scripts/tham_chieu.py bang <từ khoá>…` dựng bảng 16–20 bìa đánh số → gửi người dùng chọn 2–3 số → `python3 scripts/tham_chieu.py trong <slug>…` tải slide bên trong của mẫu chọn → rút quy tắc (`bo-cuc.md` mục 7). Sau đó: thu 15–20 mẫu thiết kế **chuyên nghiệp đúng thể loại** (deck bài giảng / báo cáo / infographic cùng lĩnh vực, của studio, tổ chức, báo uy tín — ghi nguồn từng mẫu), ghép một **bảng tham chiếu** bằng ảnh, rồi rút **quy tắc đo được**: lưới, thang cỡ chữ, số màu, tỉ lệ chữ / hình / khoảng trống, cách đặt nhãn lên hình, cách dùng ảnh. Mẫu chỉ để học quy tắc — không sao chép bố cục hay hình.
**4b. Hệ thống thiết kế của bài** (`thiet-ke/he-thong.md`): lưới (vd. 12 cột, lề, rãnh), thang cỡ chữ (3–5 bậc), thang khoảng cách, bảng màu, quy tắc tỉ lệ cho hình (người / nhà / toà nhà cùng một thước), **hệ nền** (≥ 3 loại theo `he-nen.md`: N1 sáng + bộ 2–4 hoạ tiết tự vẽ đổi vị trí, N2 đậm cho mở chương / số lớn / trích luật, N3 chia mảng hoặc N4 ảnh), **bộ trình bày dữ liệu** (với mỗi bảng / số liệu trong kịch bản, chọn kiểu theo `trinh-bay-du-lieu.md`; ≥ 6 kiểu cho deck 40–50 slide, một kiểu ≤ 40 %), và **8–10 kiểu slide** hợp thể loại (vd. bài giảng: mở chương, định nghĩa, sơ đồ quan hệ, so sánh, bảng tra, trích luật, số liệu / thanh tỉ lệ, đề bài tập, câu hỏi, câu chốt chữ lớn). Mỗi slide về sau phải thuộc một kiểu.
**4c. Bản đồ nhịp** (`thiet-ke/nhip.md`): ba dải song song theo kịch bản — **kiểu slide**, **loại nền** (N1–N6 + vị trí hoạ tiết), **kiểu bảng / hình chính**. Không quá 3 slide liền cùng kiểu; cứ 4–5 slide có một slide "thở"; không quá 6 slide liền cùng nền cùng vị trí hoạ tiết; mỗi phần có ≥ 1 hình chính riêng. Soát ba dải trên giấy trước khi dựng.
**4d. Hướng phong cách**: 2–3 hướng, mỗi hướng: bảng màu (≤ 1 màu chủ + 1 màu nhấn + trung tính; tương phản ≥ 4,5 : 1), chữ (Anton / Be Vietnam Pro, các độ đậm — font nhúng sẵn), kiểu minh hoạ (nét, khối, bóng, mức chi tiết), lưới (lề ≥ 80 px, cột), cách dùng ảnh thật, **1 slide mẫu dựng thật** (bìa hoặc slide khái niệm).
- Hướng phải hợp đề tài và khán giả (bài luật: nghiêm, rõ; không trang trí vô nghĩa).
- Hướng được chọn ghi thành **thẻ phong cách asset** `thiet-ke/phong-cach.json` (máy kiểm mọi SVG theo thẻ, `scripts/kiem_phong_cach.js`) + mô tả trong `he-thong.md`: kiểu (phẳng 2–3 tông / bán tả thực / nét), góc nhìn (thẳng / ¾), nguồn sáng, có gradient không, bóng (không / bóng phẳng một màu), độ dày nét, bo góc, mức chi tiết, bảng màu cho hình. **Một deck một thẻ**: hình nào lệch thẻ (vd. người bán 3D đứng cạnh biểu tượng phẳng) là lỗi Thẩm mỹ, kể cả khi từng hình đẹp.
- Bản ghi lựa chọn: A / B / C kèm ảnh, khuyến nghị.

## 5. Bộ bố cục mẫu + cổng thẩm mỹ
Viết 8–12 hàm bố cục trong `deck.js` theo `bo-cuc.md`, dựng 6–8 slide mẫu phủ các bố cục chính (hàm hình dùng chung: `scripts/bo_hinh.js`), phản biện B (hình) chấm **Thẩm mỹ ≥ 4 và Nhất quán ≥ 4** → mới sang bước 6–7. Không đạt thì sửa bố cục mẫu.

### (cũ) Làm mẫu 3–4 slide
Bìa · một slide khái niệm · một sơ đồ / so sánh · một slide số liệu hoặc bài tập — dựng ra PPTX bằng `scripts/dung.js`, sạch lỗi máy, glance test 3 giây.
- **Slide then chốt làm 3 phương án** (bìa, khái niệm trung tâm, sơ đồ chính), đặt cạnh nhau với bảng tham chiếu, chọn phương án tốt nhất theo `soat.md` mục 2 (hạng Thẩm mỹ) — không làm một phương án rồi sửa dần.
- **Mỗi bảng và mỗi hình chính làm 2 phương án** (bước 7 cũng vậy): hai kiểu trình bày khác nhau trong `trinh-bay-du-lieu.md` (vd. T3 cột nhấn vs T5 thẻ), hai cách vẽ hình (cảnh vs vật thể); dựng cả hai, đặt cạnh mẫu tham chiếu cùng loại bằng `scripts/to_so_sanh.js`, giữ cái hơn, ghi lý do một dòng trong `nhat-ky.md`.

**Điểm duyệt C** (bài có tài liệu gốc: gộp 4 + 5 — gửi bảng tham chiếu, hệ thống thiết kế, bản đồ nhịp, mẫu; bài mới: duyệt 4 và 5 riêng).

## 6. Asset + ảnh
- **Brief minh hoạ từng slide** (cột trong `kich-ban.md` hoặc `thiet-ke/brief-hinh.md`): hình chứng minh ý nào, cảnh gì, ai / vật gì, tỉ lệ theo hệ thống, tiêu điểm ở đâu, nhãn nào đặt lên vật nào. Không có brief → không vẽ. **Ít hình, to, có tiêu điểm**; không dán cùng một vật lặp lại khắp deck như hình trang trí; vật xuất hiện lại chỉ khi nó đóng cùng vai trò.- **Kiểm kê asset** (`thiet-ke/asset.md`, bảng: hình · vai (sự vật nó chỉ) · slide dùng · trạng thái vẽ): mỗi phần có ≥ 1 **hình chính** vẽ riêng cho đúng ý của phần (không lấy hình của phần khác đổi nhãn); **một hình ≤ 3 slide**, trừ motif có vai cố định cả deck (khai `data-lap`); đa dạng loại hình: vật thể, cảnh / quan hệ, biểu tượng cùng bộ, hoạ tiết nền, ảnh thật — không chỉ một bộ nhân vật + toà nhà dán khắp nơi. Tham khảo mẫu: 4–6 hình chính cho 8–12 slide nội dung (≈ 1 hình / phần), icon cùng nét cùng cỡ.
- **Hình tự vẽ** (SVG trong `asset/`): đúng **thẻ phong cách** (`thiet-ke/phong-cach.json`) — cùng bảng màu, cùng nét, cùng hướng sáng. Vẽ **cả bộ trước** (người, toà nhà, vật thể, biểu tượng, hoạ tiết nền), mỗi lần dựng `dung.js` tự ra **bảng xem thử** `<tên>_lop/asset.jpg` (mọi hình trên một tờ): nhìn tờ này trước khi nhìn slide — lệch phong cách, lệch thước, hình sơ sài lộ ra ngay khi đứng cạnh nhau. Không chữ trong SVG — chữ là HTML `data-t` đặt lên hình.
- **Nguồn hình theo vai** — đọc `nguon-hinh.md`; chọn nguồn theo câu hỏi "hình này chở ý gì", không theo thói quen.
- **Ảnh thật** (`anh/`): tìm theo brief (`scripts/find_images.py --brief`), mở ảnh ứng viên chấm bằng mắt (đúng chủ đề, nét, bố cục), ghi TASL (tên – tác giả – nguồn – giấy phép) vào `ghi-cong.md`. Chiếu trên lớp: được dùng ảnh báo có ghi nguồn; công khai: chỉ CC0 / PD / CC BY / CC BY-SA. Không ảnh AI.

## 7. Đổ nội dung vào bố cục mẫu
- Mỗi slide là một thể hiện của một bố cục mẫu đã qua cổng thẩm mỹ (`bo-cuc.md`); `<section data-mau="…">`. Không thiết kế tự do từng slide — quy ước kỹ thuật ở `hop-dong-html.md`. Bảng / số liệu dùng **bộ thành phần** `hinh/bang.css` (`.tb` + biến thể T1–T13, màu đặt bằng biến `--tb-*` trong `style.css` của bài) để có độ hoàn thiện cao sẵn; chỉ tự viết CSS bảng khi không kiểu nào hợp.
- `node scripts/dung.js <bài>` sau mỗi 5–8 slide; sửa hết `⚠` trước khi làm tiếp (lỗi nhỏ dồn lại khó sửa). Đọc dòng **Đa dạng** và **dải nền** máy in ra, so với `nhip.md`; lỗi ◇ (nền, asset lặp, kiểu bảng) cũng là lỗi.
- Lời nói từ kịch bản vào `data-notes` của `<section>`.

## 8. Soát (tối đa 2 vòng sửa)
1. Máy: `dung.js` sạch.
2. Nhìn: mở mọi `tong-N.jpg` và slide nghi ngờ (`h-NN.jpg`); đi qua `soat.md` mục 1.
3. **Đọc lạnh** (`vai-tro.md`, lượt 1): người duyệt chỉ xem ảnh, tóm ý từng slide; lệch ý → sửa slide. Cảnh báo ⚑ của máy xét ở bước này.
4. **Phản biện kép** (`vai-tro.md`, lượt 2): hai agent `opus` song song — A nội dung (đối chiếu tài liệu gốc), B hình (thẩm mỹ, trình bày dữ liệu, PPTX). Kiểm từng góp ý với nguồn rồi mới sửa.
5. Sửa → dựng lại → nhìn lại. Ghi điểm, lỗi, cách sửa vào `nhat-ky.md`.
Lỗi cần đánh đổi (cắt nội dung, đổi phong cách) → bản ghi lựa chọn gửi người dùng, không tự quyết.

## 9. Diễn tập
Đọc lời nói từng slide (~160 tiếng/phút), cộng giây hoạt động (bài tập 120 s, câu hỏi 60 s), so với thời lượng; đánh dấu slide có thể cắt. In ghi chú khi cần: `python3 scripts/ban_ghi_chu.py <tên>.pptx`.

## 10. Bàn giao + rút kinh nghiệm
Gửi PPTX + ảnh tổng + `ghi-cong.md`; báo: đã xong (bằng chứng), còn gì, người dùng cần làm gì. Ghi 3–5 bài học vào `nhat-ky.md` của bài. Chỉ sửa skill nếu bài học là lỗi công cụ hoặc lỗi quy trình chung.
