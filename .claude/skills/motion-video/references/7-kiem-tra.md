# Pha 7 · Kiểm, sửa, giao

Phỏng theo `review.md` của HeyGen HyperFrames (Apache-2.0): soát như một đạo diễn khó tính, không phải tác giả tự hào.

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
- **Cảnh yếu nhất**, và sẽ đổi gì nếu có thêm thời gian.
- **Cảnh báo giữ lại có chủ đích**, kèm lý do.
- **File giao:**
  - bản đăng;
  - bản nháp (đường B);
  - hướng dẫn canh nhạc với các mốc giây cú nện;
  - dung lượng (TikTok điện thoại ≤ ~287 MB; quá thì tăng `--crf` lên 20–23).
- **Câu hỏi còn treo** cho người dùng, ví dụ câu khẳng định chưa xác nhận.

Không tuyên bố "khớp nhạc" khi chưa ghép với bài thật. Nói "khớp theo BPM/cấu trúc đo từ bản nghe thử".
