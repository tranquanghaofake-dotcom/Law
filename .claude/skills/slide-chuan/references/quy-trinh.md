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
`# | người nghe đang thắc mắc gì | khẳng định (= tiêu đề, câu đầy đủ) | bằng chứng hình (sơ đồ / bảng / ảnh / hình vẽ — mô tả cụ thể) | nguồn (dòng trong noi-dung.md) | giây | lời nói (2–4 câu)`
- Đọc liền cột khẳng định phải thành một mạch lập luận (Duarte: hiện trạng → điều có thể khác; hoặc vấn đề → khái niệm → ví dụ → áp dụng → kiểm tra).
- Mỗi slide MỘT ý; hai ý → hai slide. Mỗi mục tiêu có slide + câu kiểm tra. Tổng giây ≈ thời lượng (chừa 10 %).
- Bằng chứng hình chọn theo **câu hỏi của người nghe**, không theo hình thức tài liệu: quan hệ các bên → sơ đồ; so sánh → hai cột / thước chung; số liệu → bảng hoặc biểu đồ đúng tỉ lệ; thời gian → trục; quy trình → bước. Hình phải cho thấy chính sự vật, không ẩn dụ.

**Điểm duyệt B.**

## 4. Chỉ đạo hình ảnh → `phong-cach/`
- 2–3 hướng, mỗi hướng: bảng màu (≤ 1 màu chủ + 1 màu nhấn + trung tính; tương phản ≥ 4,5 : 1), chữ (Anton / Be Vietnam Pro, các độ đậm — font nhúng sẵn), kiểu minh hoạ (nét, khối, bóng, mức chi tiết), lưới (lề ≥ 80 px, cột), cách dùng ảnh thật, **1 slide mẫu dựng thật** (bìa hoặc slide khái niệm).
- Hướng phải hợp đề tài và khán giả (bài luật: nghiêm, rõ; không trang trí vô nghĩa).
- Bản ghi lựa chọn: A / B / C kèm ảnh, khuyến nghị.

## 5. Làm mẫu 3–4 slide
Bìa · một slide khái niệm · một sơ đồ / so sánh · một slide số liệu hoặc bài tập — dựng ra PPTX bằng `scripts/dung.js`, sạch lỗi máy, glance test 3 giây.

**Điểm duyệt C** (bài có tài liệu gốc: gộp 4 + 5; bài mới: duyệt 4 và 5 riêng).

## 6. Asset + ảnh
- **Hình tự vẽ** (SVG trong `asset/`): cùng bảng màu, cùng nét, cùng hướng sáng của phong cách đã duyệt. Vẽ xong dựng **bảng xem thử** (mọi asset trên một trang) và nhìn bằng mắt trước khi đặt vào slide. Không chữ trong SVG — chữ là HTML `data-t` đặt lên hình.
- **Ảnh thật** (`anh/`): tìm theo brief (`scripts/find_images.py --brief`), mở ảnh ứng viên chấm bằng mắt (đúng chủ đề, nét, bố cục), ghi TASL (tên – tác giả – nguồn – giấy phép) vào `ghi-cong.md`. Chiếu trên lớp: được dùng ảnh báo có ghi nguồn; công khai: chỉ CC0 / PD / CC BY / CC BY-SA. Không ảnh AI.

## 7. Thiết kế + dựng toàn bộ
- Mỗi slide một file `slides/NN-ten.html`, thiết kế **tự do** theo kịch bản và phong cách — quy ước kỹ thuật ở `hop-dong-html.md`.
- `node scripts/dung.js <bài>` sau mỗi 5–8 slide; sửa hết `⚠` trước khi làm tiếp (lỗi nhỏ dồn lại khó sửa).
- Lời nói từ kịch bản vào `data-notes` của `<section>`.

## 8. Soát (tối đa 2 vòng sửa)
1. Máy: `dung.js` sạch.
2. Nhìn: mở mọi `tong-N.jpg` và slide nghi ngờ (`h-NN.jpg`); đi qua `soat.md` mục 1.
3. **Người duyệt độc lập**: gọi agent mới, `model: "opus"`, theo mẫu ở `vai-tro.md`; nhận bảng điểm rubric + danh sách lỗi.
4. Sửa → dựng lại → nhìn lại. Ghi điểm, lỗi, cách sửa vào `nhat-ky.md`.
Lỗi cần đánh đổi (cắt nội dung, đổi phong cách) → bản ghi lựa chọn gửi người dùng, không tự quyết.

## 9. Diễn tập
Đọc lời nói từng slide (~160 tiếng/phút), cộng giây hoạt động (bài tập 120 s, câu hỏi 60 s), so với thời lượng; đánh dấu slide có thể cắt. In ghi chú khi cần: `python3 scripts/ban_ghi_chu.py <tên>.pptx`.

## 10. Bàn giao + rút kinh nghiệm
Gửi PPTX + ảnh tổng + `ghi-cong.md`; báo: đã xong (bằng chứng), còn gì, người dùng cần làm gì. Ghi 3–5 bài học vào `nhat-ky.md` của bài. Chỉ sửa skill nếu bài học là lỗi công cụ hoặc lỗi quy trình chung.
