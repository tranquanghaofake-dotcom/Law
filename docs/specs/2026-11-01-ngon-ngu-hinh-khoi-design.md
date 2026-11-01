# Luyện Luật — Ngôn ngữ hình khối "Văn Miếu" (đợt nâng cấp 2)

Phiên bản 1.1 · 01/11/2026 · Trạng thái: **đợt 1 + 1b đã triển khai** (nhánh `claude/amazing-archimedes-u5vtr5`).
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
- Màu chỉ qua class: tô `f-sun | f-card | f-ink | f-void | f-seal | f-acc | f-line | f-hill | f-hill2 | f-water | f-leaf | f-lotus | f-gold | f-cover`, nét `s-line (+ s-thin | s-bold | s-paper)` → tự đổi theo chế độ tối. `--void` là "khoảng tối" (vòm cửa, kính) giữ tối ở cả hai chế độ.
- Hoa văn lặp (mây, sóng) là **mask CSS** với SVG data-URI — học từ cách làm của Hero Patterns (MIT) nhưng dùng `mask` thay `background-image` để màu theo token.
- Tranh là trang trí: `aria-hidden="true"`, `focusable="false"`; mọi thông tin vẫn có chữ.
- Hình kiến trúc là **cách điệu, không phải bản vẽ chính xác**. Không dùng Quốc huy, Quốc kỳ làm hoạ tiết.

## 2. Bảng tranh (`lib/art/registry.ts`)

### 2.1 Cảnh lớn (viewBox 320×200) — công trình, núi non Việt Nam, đồ vật pháp luật

| Tên | Cảnh (cách điệu) | Dùng ở |
|---|---|---|
| `khue-van-cac` | gác hai tầng mái, cửa sổ tròn toả tia | Hôm nay — ôn tập |
| `quoc-hoi` | toà nghị viện: bậc, hàng cột, khối trụ tròn, sách mở | môn `hien-phap` |
| `tam-quan` | cổng ba lối | môn chưa có tranh |
| `chua-mot-cot` | điện trên một cột giữa hồ sen, bậc lên | trang Môn học |
| `ha-long` | núi đá vôi trên vịnh, thuyền buồm | Hôm nay — đã học hết |
| `ngo-mon` | cổng thành, lầu năm mái vàng | Hồ sơ |
| `toa-an` | toà nhà tân cổ điển, cán cân trên trán tường | Luyện đề |
| `sach-luat` | sách luật bìa cứng: khung kép, mặt trống đồng, chữ LUẬT; chồng sách, sách mở, cán cân | Danh mục khái niệm |

Nền chung (`Clouds.svelte`): vầng mặt trời có **vành răng cưa và vòng chấm của mặt trống đồng Đông Sơn**, mây cuộn, núi xa tuỳ chọn.

### 2.2 Tranh nhỏ cho bộ đề (viewBox 160×100) — vẽ **đối tượng luật điều chỉnh**

| Tên | Hình | Bộ đề / nhóm |
|---|---|---|
| `quan-he` | hai chủ thể + văn bản có dấu | `pldc-quan-he-phap-luat`, nhóm `pldc`, mặc định |
| `vi-pham` | đèn giao thông + biên bản có dấu | `pldc-vi-pham-phap-luat` |
| `dat-coc` | dãy nhà trọ, chìa khoá, phong bì | `dat-coc`, nhóm `dan-su` |
| `chuyen-khoan` | điện thoại → ngân hàng | `chuyen-khoan-nham`, nhóm `hinh-su` |
| `nghi-viec` | nhà máy, đồng hồ, phong bì lương | `nghi-viec-giu-luong`, nhóm `lao-dong` |

Chọn theo id bộ đề → theo nhóm → `quan-he`.

### 2.3 Gợi ý cho môn sau (chưa vẽ)

Hành chính: trụ sở UBND + con dấu + hồ sơ một cửa · Dân sự: đình làng, cây đa, nhà có sổ (giấy chứng nhận) · Đất đai: ruộng bậc thang · Hình sự: `toa-an` · Thương mại/Doanh nghiệp: cảng, thuyền, con dấu doanh nghiệp · Lao động: nhà máy.

### 2.4 Giới hạn nội dung hình

- Không dùng Quốc huy, Quốc kỳ, chân dung lãnh tụ hay người thật làm hoạ tiết.
- Không vẽ hình châm biếm cơ quan ban hành, ví dụ cán cân một bên tiền. Tiền lệ: năm 2014, Cục Xuất bản, In và Phát hành xử phạt NXB Lao động – Xã hội vì bìa "Bộ luật Hình sự…" vẽ cán cân + tiền + đồng hồ và bìa "Bộ luật Dân sự…" in hình diễn viên, với lý do xúc phạm uy tín cơ quan ban hành. Căn cứ khi đó là Nghị định 159/2013/NĐ-CP, nay đã hết hiệu lực. Văn bản thay thế cần đối chiếu lại; chưa kiểm chứng trong phiên này.
- Không dùng búa gỗ (gavel): đó là hình ảnh toà án phương Tây; theo hiểu biết hiện có, phiên toà ở Việt Nam không dùng búa. Biểu tượng xét xử dùng cán cân.
- Bìa sách chỉ lấy bố cục chung của sách luật in trong nước. Không ghi tên hay logo nhà xuất bản thật.

## 3. Đợt 1 (đã làm)

Nền mây; icon điều hướng nét vẽ (thay emoji); sidebar/tab bar viền kép; nút viền kép góc vuông vức; tiêu đề mục có hình thoi + đường kép; `.frame` cho thẻ chính Hôm nay và thẻ môn; tranh ở Hôm nay, Môn học, trang môn; dải sóng dưới thẻ chính và đầu lưới bậc.

## 3b. Đợt 1b (đã làm)

Thêm 5 cảnh (`chua-mot-cot`, `ha-long`, `ngo-mon`, `toa-an`, `sach-luat`) và 5 tranh nhỏ cho bộ đề; nền có vòng trống đồng; tranh đầu trang ở Môn học, Luyện đề, Danh mục khái niệm, Hồ sơ; thẻ bộ đề và thẻ kiểm tra nhanh có tranh nhỏ.

## 4. Đợt sau (chưa làm, mỗi đợt một phiên)

1. Phiên học & thẻ bài tập: thanh tiến độ dạng "đường đi qua các cổng", màn kết thúc có tranh.
2. Hồ sơ: bậc (Thí sinh → Tú tài → …) thành bảng vàng/bia tiến sĩ cách điệu.
3. Mỗi môn mới kèm một tranh riêng (ví dụ Dân sự: nhà và sổ đỏ cách điệu; Hình sự: cán cân + toà nhà xét xử).
