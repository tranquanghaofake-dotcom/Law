# Pha 7 · Kiểm, sửa, giao

Phỏng theo `review.md` của HeyGen HyperFrames (Apache-2.0): soát như một đạo diễn khó tính, không phải tác giả tự hào. Danh sách lỗi cứng có mã, "dấu vân tay" và vòng so cặp học ý tưởng từ SeeCut (xem `NOTICE.md`).

## Mục lục

- 0. Máy kiểm trước
- 1. Đo, rồi nhìn
- 2. Câu hỏi soát
- 2b. Lỗi cứng — chấm từng mã, có bằng chứng
- 2c. Phiên bản và so cặp (tối đa v3)
- 3. Ghi lỗi và sửa
- 4. Giao — `REVIEW.md` + câu trả lời ngắn

## 0. Máy kiểm trước

- `kiem_tra_storyboard.py`: XANH.
- `kiem_tra_bo_cuc.mjs`: XANH, cảnh báo đã xử lý hoặc ghi lý do (`6-dung-remotion.md`).

Máy bắt lỗi hình học (đè, tràn, trống, nhỏ, ngoài vùng an toàn); mắt bắt lỗi nghĩa. Đừng dùng mắt để làm việc của máy.

## 1. Đo, rồi nhìn

```bash
npx remotion render Main out/video.mp4 --codec=h264 --crf=16
python3 <skill>/scripts/kiem_tra_video.py . out/video.mp4
```

- **Số đo:** khổ, fps, thời lượng so với storyboard, LUFS nếu có âm thanh.
- **3 tờ xem nhanh** trong `out/review/`:
  - `canh.png`: mỗi cảnh, ngay sau khi vào và ở giữa;
  - `cat.png`: −0,2 s / 0 / +0,2 s quanh mỗi điểm cắt;
  - `phone.png`: giữa cảnh, thu về 360 px.
- **Âm thanh:** chỉ đo được. Ghi rõ "đã đo, chưa nghe".

Số đo và mắt nhìn khác nhau thì tin số đo. Một dòng chữ 0,6 s trông vẫn ổn trên tờ xem nhanh.

## 2. Câu hỏi soát

Bước 1: mô tả mỗi khung bằng một câu như người lạ xem, gọi tên mọi vật. Vật nào phải giải thích mới hiểu là P0.

Bước 2: đọc các khung theo thứ tự, xem có thành câu chuyện người lạ theo được không. So từng khung với dòng tương ứng trong `SPEC.md`.

Bước 3: lướt các tờ một lượt cho mỗi câu hỏi:

| Câu hỏi | Bắt được |
|---|---|
| Nó đọc ra đúng là nó chưa? | hình đọc ra vật khác; UI trông như mockup |
| Vật chính tách khỏi nền chưa? | hai tiêu điểm; chữ tối trên nền tối; loá trắng ở cú nện |
| Khung và tiếp xúc | chữ sát mép hoặc dưới UI của nền tảng (dọc: trên 168 px, dưới 1330 px, cột nút phải); viền nền ở ảnh; va chạm ở điểm cắt |
| Thời gian với người xem lần đầu | dòng hiện ngắn hơn thời gian đọc; nhảy hình ở điểm cắt; mọi thứ chuyển cùng một nhịp |
| Dấu hiệu máy tạo | danh sách CẤM trong `3-phong-cach.md` |
| Che chữ đi | chỉ nhìn hình, câu chuyện còn không? |
| Cỡ điện thoại | mọi chữ cần đọc còn đọc được ở 360 px? |
| Nhịp | cú nện có trùng đầu cụm, sự kiện trong bản quay có trúng phách? (xem `cat.png` + mốc giây) |
| Sự thật | mọi chữ/số trên hình có dòng tương ứng trong `FACTS.md` |

### Phản biện độc lập (khi người dùng cho dùng subagent)
Giao cho **một** subagent chỉ `SPEC.md`, `STORYLINES.md` và các tờ ảnh, **không** đưa nhận xét của mình (tránh dẫn dắt). Yêu cầu trả lỗi dạng `khung · chỗ · lỗi → sửa`, xếp P0/P1/P2, cộng 3 đề xuất "ngách". Mình ghi nhận xét tự soát **trước** khi đọc kết quả, rồi gộp. Nhận xét nào không làm được (vd. phóng bản quay quá độ phân giải) thì nói lý do và làm cách thay thế. Sau khi sửa, tự soát lại: sửa một chỗ hay làm vỡ chỗ khác (phóng máy che tiêu đề, nhãn mới đè chữ cũ).

## 2b. Lỗi cứng — chấm từng mã, có bằng chứng

Mỗi mã trả lời ĐẠT/TRƯỢT, kèm **giây + phần tử** làm bằng chứng. Chỉ chấm lỗi cứng, không chấm gu.

| Mã | Lỗi cứng | TRƯỢT khi |
|---|---|---|
| C1 | Bằng chứng giả | khung giữ chỗ trừu tượng, cửa sổ Mac ba chấm giả, giao diện tự vẽ, ảnh "na ná" đóng vai ảnh chụp thật |
| C2 | Sai sự thật | chữ/số/điều luật trên hình không có dòng tương ứng trong `FACTS.md`; luật hết hiệu lực trình bày như hiện hành |
| C3 | Bố cục | đè chữ, che thông tin chính, phần tử cảnh trước chưa ra đã có cảnh sau, phần tử trôi vô nghĩa |
| C4 | Nhảy hình vô cớ | cùng một vật đổi vị trí hay hình dạng giữa hai cảnh mà nội dung không đòi |
| C5 | Không kịp đọc / không hiểu | chữ hiện ngắn hơn thời gian đọc (0,5 s + 0,3 s/từ); hình phải giải thích mới hiểu |
| C6 | Chữ nhạy cảm | đọc được "Tải về / quét mã / liên hệ / số điện thoại / cam kết sai" trong ảnh chụp |
| C7 | Khoảng chết | ≥ 2 s gần như không có thông tin (một dòng chữ nhỏ trên nền trống) |
| C8 | Lệch lời (chế độ voice) | chữ hiện trước từ khoá > 0,2 s hoặc sau > 0,5 s |

Kèm hai mục bắt buộc:
- **evidence_gaps**: chỗ lời nhắc sản phẩm/văn bản/dữ liệu thật mà hình không có ảnh chụp thật (giây + lời + nên dùng ảnh gì).
- **Dấu vân tay**: chép nguyên văn 3 dòng chữ thấy trên hình, kèm giây và tổng thời lượng video. Đối chiếu với chữ thật trong storyboard và `FACTS.md`. Sai thì người chấm chưa thật sự xem: **bỏ cả bản chấm**, chấm lại.

Ai chấm:
- **Có mô hình xem được video** (Gemini qua CLI, hoặc model khác người dùng có): đưa file video kèm bảng mã trên, yêu cầu trả JSON theo đúng bảng. Thêm câu "trả lời trực tiếp từ việc xem, không chạy tác vụ OCR/phiên âm nền", vì thiếu câu này mô hình hay tự chạy tác vụ nền rồi hết giờ, trả về rỗng. Mỗi TRƯỢT phải mở đúng khung được chỉ để xác nhận trước khi sửa: người chấm máy cũng nhìn sai.
- **Không có**: tự chấm trên 3 tờ xem nhanh và `out/review/bo_cuc.json`, theo đúng bảng mã. Vẫn ghi dấu vân tay, để chứng minh đã đọc từng khung.

## 2c. Phiên bản và so cặp (tối đa v3)

- Giữ `storyboard.vN.json` và `out/video_vN.mp4` của từng bản để quay lại được.
- Từ v2: so **v(N) với v(N−1)** trên cùng tiêu chí (C1–C8 + câu chuyện + nhịp). Chấm **hai lượt đổi chỗ A/B**. Hai lượt không cùng kết luận thì coi là hoà, và hoà thì giữ bản cũ.
- **Bản cũ thắng thì giữ bản cũ**, ghi vào `REVIEW.md`. Trong thực chiến, bản đầu đơn giản, nhất quán từng thắng hai bản "vá lỗi" sau.
- Sửa khoảng chết hay chỗ thưa bằng **thêm nội dung cùng phong cách**, không đổi phong cách nhãn hay hệ chữ giữa chừng.
- Mỗi phiên bản phải có một thay đổi **thấy rõ**. Dừng khi máy kiểm XANH, C1–C8 ĐẠT, và một trong ba điều: bản mới không thắng, đã tới v3, hoặc chỉ còn chỉnh không thấy bằng mắt.
- Người dùng xem bằng mắt là phán quyết cuối.

## 3. Ghi lỗi và sửa

Mỗi lỗi một dòng: `t=4,2 s · ở đâu · lỗi → sửa chính xác · giữ nguyên gì`.

Xếp hạng:
- **P0:** sai sự thật, không đọc được, vỡ khổ/fps, dấu hiệu máy tạo ở cảnh chính.
- **P1:** đoạn chết > 3 s, cú chốt yếu, điểm cắt nhảy.
- **P2:** đánh bóng.

Sửa mọi P0 và các P1 đáng sửa, theo thứ tự chữ → thời gian → chi tiết. Sau đó chỉ render lại khung đã đổi (`remotion still`). Không chấm điểm trên thang 10, vì chấm điểm không tìm ra lỗi để sửa. Video rối thì bỏ một phần ba chuyển động, giữ những chuyển động dẫn mắt.

## 4. Giao — `REVIEW.md` + câu trả lời ngắn

- **Quyết định sáng tạo** đã chọn, các mạch kể không dựng.
- **Đã đo / chỉ nhìn / chưa ai kiểm.** Âm thanh: đã đo, chưa nghe. Dữ liệu demo: ở cảnh nào.
- **Các phiên bản và kết quả so cặp**, kể cả khi bản cũ thắng; kết quả C1–C8; bằng chứng đã dùng / còn thiếu (evidence_gaps); chỗ nào là minh hoạ tự thêm, không có trong lời.
- **Cảnh yếu nhất**, và sẽ đổi gì nếu có thêm thời gian.
- **Cảnh báo giữ lại có chủ đích**, kèm lý do.
- **File giao:**
  - bản đăng;
  - bản nháp (đường B);
  - hướng dẫn canh nhạc với các mốc giây cú nện;
  - dung lượng (TikTok điện thoại ≤ ~287 MB; quá thì tăng `--crf` lên 20–23).
- **Câu hỏi còn treo** cho người dùng, ví dụ câu khẳng định chưa xác nhận.

Không tuyên bố "khớp nhạc" khi chưa ghép với bài thật. Nói "khớp theo BPM/cấu trúc đo từ bản nghe thử".
