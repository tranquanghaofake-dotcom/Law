# Luyện Luật — Ngôn ngữ hình khối "Văn Miếu" (đợt nâng cấp 2)

Phiên bản 1.0 · 01/11/2026 · Trạng thái: **đợt 1 đã triển khai** (nhánh `claude/amazing-archimedes-u5vtr5`).
Kế thừa spec layout (`2026-11-01-layout-redesign-design.md`); không đổi cấu trúc màn hình, engine, nội dung, **bảng màu**.

## 0. Mục tiêu

Hào muốn web có nét riêng thay vì giao diện phẳng mặc định. Tham khảo một infographic dạng tranh phẳng (vector) về múa rối nước. **Chỉ học cách dựng**, không lấy màu, bố cục hay hoạ tiết của tác phẩm đó (có quyền tác giả):

1. **Khối phẳng + nét mảnh**: mỗi công trình ghép từ hình chữ nhật, cung tròn, đường cong bậc hai; tô một màu, viền một nét đều.
2. **Đối xứng trục giữa**: công trình đứng trên bệ, có vầng tròn (mặt trời) phía sau làm tiêu điểm.
3. **Khung kép**: viền trong song song viền ngoài, góc có "thước thợ" — dùng cho thẻ và nút.
4. **Hoa văn nền**: mây cuộn lặp lại rất mờ; **sóng nước** (bán nguyệt đồng tâm) làm dải ngăn mục.
5. **Tranh theo chủ đề**: mỗi môn có một công trình/đồ vật gắn với môn đó.

## 1. Quy tắc kỹ thuật

- SVG viết tay, inline trong component Svelte ở `apps/web/src/lib/art/`; không thư viện, không file ảnh.
- Màu chỉ qua class: tô `f-sun | f-card | f-ink | f-void | f-seal | f-acc | f-line`, nét `s-line (+ s-thin | s-bold | s-paper)` → tự đổi theo chế độ tối. `--void` là "khoảng tối" (vòm cửa, kính) giữ tối ở cả hai chế độ.
- Hoa văn lặp (mây, sóng) là **mask CSS** với SVG data-URI — học từ cách làm của Hero Patterns (MIT) nhưng dùng `mask` thay `background-image` để màu theo token.
- Tranh là trang trí: `aria-hidden="true"`, `focusable="false"`; mọi thông tin vẫn có chữ.
- Hình kiến trúc là **cách điệu, không phải bản vẽ chính xác**. Không dùng Quốc huy, Quốc kỳ làm hoạ tiết.

## 2. Bảng tranh theo môn (`lib/art/registry.ts`)

| Môn | Tranh | Ghi chú |
|---|---|---|
| (chung: Hôm nay khi ôn / đã học hết) | `khue-van-cac` — gác hai tầng mái, cửa sổ tròn toả tia | biểu tượng hiếu học |
| `hien-phap` | `quoc-hoi` — toà nghị viện: bậc, hàng cột, khối trụ tròn, cuốn sách mở | cơ quan lập hiến |
| môn chưa có tranh | `tam-quan` — cổng ba lối | mặc định |

Môn mới: vẽ một component trong `lib/art/`, thêm vào `SUBJECT_ART` và `SubjectArt.svelte`, thêm vào test `tests/ui/art.test.ts`.

## 3. Đợt 1 (đã làm)

Nền mây; icon điều hướng nét vẽ (thay emoji); sidebar/tab bar viền kép; nút viền kép góc vuông vức; tiêu đề mục có hình thoi + đường kép; `.frame` cho thẻ chính Hôm nay và thẻ môn; tranh ở Hôm nay, Môn học, trang môn; dải sóng dưới thẻ chính và đầu lưới bậc.

## 4. Đợt sau (chưa làm, mỗi đợt một phiên)

1. Phiên học & thẻ bài tập: thanh tiến độ dạng "đường đi qua các cổng", màn kết thúc có tranh.
2. Luyện đề: tranh theo nhóm đề (cán cân, ấn triện, cuộn giấy).
3. Hồ sơ: bậc (Thí sinh → Tú tài → …) thành bảng vàng/bia tiến sĩ cách điệu.
4. Mỗi môn mới kèm một tranh riêng (ví dụ Dân sự: nhà và sổ đỏ cách điệu; Hình sự: cán cân + búa toà).
