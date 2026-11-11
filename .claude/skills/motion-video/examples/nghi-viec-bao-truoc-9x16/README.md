# Ví dụ: clip 9:16 "Nghỉ việc phải báo trước bao lâu?" — bộ cảnh áp phích

Video chỉ có chữ và số, không quay giao diện: 1080×1920, 60 fps, 100 BPM, 5 cụm × 4 ô = 48 s, 7 cảnh
(`PosterHook` → `PosterLaw` → `PosterSteps` → `PosterVersus` → `PosterVerdict` → `PosterNumber` → `PosterEnd`).

- `FACTS.md`: mọi chữ, số trên hình kèm điều khoản và mức tin cậy (pha 1).
- `storyboard.json`: chép vào `src/storyboard.json` của một dự án tạo bằng `scripts/tao_du_an.sh` là dựng được; không cần asset.

Mạch kể: câu hỏi đời thường → nguyên văn điều luật (bút dạ quét cụm "phải báo trước", dấu "Khoản 1" đóng xuống) → ba mức 45 / 30 / 3 ngày
→ **ngoại lệ đứng cạnh quy tắc** (khoản 2: không cần báo) → hậu quả khi nghỉ trái luật (màu nhấn tràn khung đúng một lần) → con số cần nhớ → câu nhớ + căn cứ.

Lần chạy thử bắt được và đã sửa vào template / skill:
- **Chữ nhiều hơn thời gian đọc:** bản đầu 32 s, `kiem_tra_storyboard.py` cảnh báo 6/7 cảnh (có cảnh 52 chữ trong 4 s). Đã rút chữ, bỏ dòng phụ, giãn thành 48 s → XANH.
- **Chữ áp phích xuống dòng rồi bị cắt:** cỡ chữ ước lượng theo số ký tự vừa sát mép nên tràn vài pixel. Đã thay bằng bề ngang thật từng ký tự Anton (đo từ file font) + chừa 2 %.
- **Mảng trượt vào bị tính là tràn khung:** chữ của mảng phải nằm chờ ngoài khung 0,5 s. Đã ẩn hẳn mảng cho tới mốc vào.
- **Con số ở dải cuối chạm đáy vùng an toàn:** hạ cỡ số trong dải xuống 60 % chiều cao dải.
- **Từ chốt chạm câu hỏi phía trên** (chữ nghiêng 3°): tăng khoảng cách, giảm nghiêng còn 2°.

Chưa làm: chưa ai nghe tiếng động trên bản dựng; chưa thử trên điện thoại thật; chưa dựng bản 16:9 của ví dụ này.
