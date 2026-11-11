# Ví dụ: explainer 16:9 "Đặt cọc — ai bỏ cuộc thì mất"

Chạy thử skill trên một chủ đề khác video giới thiệu ban đầu: khổ ngang, 111 BPM, 3 cụm × 8 ô = 51,9 s.

- `FACTS.md`: mọi chữ/số trên hình kèm nguồn (pha 1).
- `jobs.json`: quay UI thật của web Luyện Luật bằng `scripts/quay_web.mjs` (pha 5). Cần server phục vụ bản build ở cổng 8765, với `Law/` là symlink tới `apps/web/dist`.
- `storyboard.json`: 7 cảnh (TitleSlam → KnowledgeCard → TitleSlam nền màu nhấn → DeviceDemo ×2 → StatCount + vòng bìa sách → EndCard).

Những gì lần chạy thử bắt được và đã sửa vào template/skill:
- **Thẻ kiến thức quá dày:** 116 chữ trong 13 giây. `kiem_tra_storyboard.py` cảnh báo; đã tách thành 2 cảnh.
- **Khổ ngang chữ nhỏ, nhiều khoảng trống chết:** cỡ chữ ngang tăng lên tiêu đề 10 %, chữ chốt 16 % chiều cao.
- **Vòng bìa 3D bị cắt mép dưới:** khổ ngang chuyển vòng sang phải.
- **Máy điện thoại tràn khung ngang:** khổ ngang đặt máy cao 84 % bên phải, chữ bên trái.
- **Chữ tối trên nền tối:** màu lấy từ bảng chung thay vì bảng của cảnh; thêm `useCol()`.
