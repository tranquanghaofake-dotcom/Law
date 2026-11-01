# Luyện Luật — Thẻ chuyên cần, Tủ sách theo chương, Thăng chức theo bộ máy nhà nước (đợt nâng cấp 3)

Phiên bản 0.1 · 02/11/2026 · Trạng thái: **chờ Hào duyệt** — chưa code.
Thay thế: ngọn lửa chuỗi (`StreakFlame`), "Bậc khoa cử" (`game/rank.ts`), "Phẩm hàm theo môn" (`gradeFor`), kệ sách theo môn (spec ngôn ngữ hình khối §3d).
Giữ nguyên: engine 6 bậc, FSRS, lịch ôn, nội dung, bảng màu "Văn Miếu".

## 0. Quyết định đã chốt (Hào, 02/11/2026)

| # | Câu hỏi | Chọn |
|---|---|---|
| 1 | Lưu ý "Thông tin pháp luật chung…" | Chỉ ở trang Hồ sơ (**đã làm**, commit `bd9c7e3`) |
| 2 | Nhận diện thẻ chuỗi | **Thẻ riêng của web**, cảm hứng thẻ luật sư; không logo VBF, không Quốc huy, không chữ "Thẻ luật sư" |
| 3 | Chu kỳ thẻ | **30 ngày** |
| 4 | Chủ đề thăng chức | **Bộ máy nhà nước đầy đủ** (kèm giới hạn ở §3.5) |
| 5 | Trao sách | **Mỗi chương 1 sách; cấp 1/2/3 theo bậc** |

## 1. Thẻ chuyên cần (thay ngọn lửa chuỗi)

### 1.1 Hình
Thẻ ngang tỉ lệ thẻ căn cước (85,6 × 54), nền son, viền kép mảnh, hoa văn mây chìm. Dòng trên: **"LUYỆN LUẬT"**; dòng dưới (chữ vàng serif): **"THẺ CHUYÊN CẦN"**. Giữa: huy hiệu riêng — cán cân trên cuốn sách mở, trong vành trống đồng (khác hẳn logo VBF: không nền xanh, không ngôi sao, không bông lúa).

Quanh huy hiệu là **27 ký tự** (ký hoạ nét mảnh, mờ ảo khi chưa sáng), chia **9 ngành × 3 hình**:

| Ngành | 3 ký hoạ |
|---|---|
| Hiến pháp | § · nghị trường · hòm phiếu |
| Hành chính | con dấu · trụ sở · hồ sơ một cửa |
| Dân sự | ngôi nhà · hợp đồng · chìa khoá |
| Hình sự | cán cân · biên bản · song sắt |
| Tố tụng | toà án · ghế xét xử · tập hồ sơ vụ án |
| Lao động | nhà máy · mũ bảo hộ · phong bì lương |
| Thương mại – doanh nghiệp | bắt tay · con dấu doanh nghiệp · biểu đồ nến |
| Đất đai – môi trường | ruộng bậc thang · mầm cây · cột mốc |
| Hôn nhân – gia đình | hai nhẫn · mái nhà · cây gia đình |

### 1.2 Tiến trình (hàm thuần `game/card.ts`, có test)
Gọi `n` = số ngày chuỗi hiện tại, `d = (n − 1) mod 30 + 1` (ngày trong chu kỳ), `k = ⌊(n − 1) / 30⌋` (số chu kỳ đã xong).

- Ngày 1–27: sáng ký tự thứ `d`.
- Ngày 28: sáng huy hiệu cán cân.
- Ngày 29: sáng viền thẻ.
- Ngày 30: **bừng sáng** (hiệu ứng toả sáng toàn thẻ) → hết chu kỳ.
- Màu lửa theo chu kỳ: `k = 0` đỏ → 1 xanh lam → 2 tím → 3 trắng → 4 đen ánh kim → ≥ 5 **vô cực** (dải màu chuyển động, giữ mãi).
- Chu kỳ mới tô lại từng ký tự bằng màu mới; ký tự **chưa tới lượt vẫn giữ màu của chu kỳ trước**. Vì vậy thẻ luôn sáng đủ từ chu kỳ 2 trở đi, chỉ khác màu.

### 1.3 Khi đứt chuỗi (**cần Hào duyệt**)
Đề xuất: theo cơ chế hiện tại (bùa giữ chuỗi vẫn dùng). Khi đứt, thẻ về ngày 0 (tắt hết). Màu cao nhất từng đạt được hiện thành **"kỷ lục"** nhỏ ở góc thẻ, không mất.

### 1.4 Vị trí
- **Hồ sơ:** thẻ lớn, chú thích "ngày 12/30 · chu kỳ Xanh lam".
- **Sidebar, thanh trên cùng điện thoại, rail Hôm nay:** thẻ thu nhỏ + số ngày (thay icon lửa).
- **Kết thúc phiên học:** tia sáng chạy vào ký tự vừa sáng.

## 2. Tủ sách theo chương (thay "Phẩm hàm theo môn")

### 2.1 Trao sách
Mỗi **chương** là một cuốn. Cấp sách xét **bậc thấp nhất** trong các khái niệm của chương:

| Cấp | Điều kiện | Ngoại hình |
|---|---|---|
| — | chưa đủ | khung nét đứt "chưa có" |
| 1 | mọi khái niệm ≥ bậc 3 | bìa mềm giấy kem, chữ mực |
| 2 | mọi khái niệm ≥ bậc 5 | bìa cứng màu theo môn, đai vàng, ruy băng "LUẬT" |
| 3 | mọi khái niệm = bậc 6 | bìa da mạ vàng, mặt trống đồng nổi, dấu son, dải lụa đánh dấu |

Hệ này cũng **giải câu hỏi "thuần thục" đang treo**: bậc 5 = sách cấp 2, bậc 6 = sách cấp 3. Đề xuất đổi tên hiển thị của bậc 6 thành **"Tinh thông"**.

**Sách giữ cấp đã đạt.** Một khái niệm bị tụt bậc khi ôn thì sách không xuống cấp, chỉ hiện dấu "cần ôn". Lưu cấp cao nhất trong store.

### 2.2 Loại sách (lĩnh vực)
Mỗi chương gắn một **lĩnh vực** để làm điều kiện thăng chức (bảng trong `lib/game/fields.ts`, chưa đưa vào schema nội dung):

| Lĩnh vực | Chương hiện có |
|---|---|
| `hien-phap` nền tảng | HP c1, c2, c3 |
| `quyen-cong-dan` | HP c4, c5 |
| `bau-cu` | HP c6 |
| `lap-phap` | HP c7 |
| `nguyen-thu` | HP c8 |
| `hanh-phap` | HP c9 |
| `tu-phap` | HP c10 |
| `dia-phuong` | HP c11 |
| `kinh-te-tai-chinh` | HP nâng cao; Chứng khoán c1–c10 |
| `lich-su` | Lịch sử NN&PL c5–c8 |

Môn sau này (Dân sự, Hình sự, Hành chính, Tố tụng…) thêm lĩnh vực mới.

### 2.3 Tủ sách
- **Hồ sơ:** tủ nhiều tầng, mỗi tầng một môn. Gáy sách theo cấp; di chuột thì hiện tên chương và cấp. Giữ các hiệu ứng nhấc sách và viền sáng đã có.
- **Sidebar:** kệ nhỏ hiện 6 cuốn gần nhất kèm tổng số "24 sách".

## 3. Thăng chức theo bộ máy nhà nước (thay "Bậc khoa cử")

### 3.1 Căn cứ
Hiến pháp 2013, đã sửa đổi, bổ sung bởi NQ 203/2025/QH15 (hiệu lực 16/6/2025):
- Chính quyền địa phương hai cấp (Điều 110 sửa đổi).
- Chính phủ gồm Thủ tướng, Phó Thủ tướng, Bộ trưởng, Thủ trưởng cơ quan ngang bộ (Điều 95).
- Tòa án nhân dân và Viện kiểm sát nhân dân gồm cấp tối cao và các cấp khác do luật định (Điều 102, 107).

**Cần đối chiếu trước khi code:** tên các cấp toà án và viện kiểm sát dưới cấp tối cao theo luật tổ chức ngành sau sửa đổi 2025 (ví dụ "Tòa án nhân dân khu vực"). Phiên này chưa có nguyên văn, nên chưa ghi.

### 3.2 Bốn nhánh và thang chức danh (bản nháp, Hào duyệt)
Ai cũng bắt đầu là **Công dân**.

| Nhánh | Thang (thấp → cao) |
|---|---|
| Chính quyền địa phương → Hành pháp | Công chức cấp xã → Phó Chủ tịch UBND cấp xã → Chủ tịch UBND cấp xã → Chuyên viên sở → Giám đốc sở → Chủ tịch UBND cấp tỉnh → Vụ trưởng → Thứ trưởng → Bộ trưởng → Phó Thủ tướng → Thủ tướng Chính phủ |
| Lập pháp | Đại biểu HĐND cấp xã → Đại biểu HĐND cấp tỉnh → Đại biểu Quốc hội → Ủy viên Ủy ban Thường vụ Quốc hội → Phó Chủ tịch Quốc hội → Chủ tịch Quốc hội |
| Xét xử | Thư ký Tòa án → Thẩm phán (cấp dưới, tên theo luật) → Thẩm phán TAND cấp tỉnh → Chánh án TAND cấp tỉnh → Thẩm phán TAND tối cao → Chánh án TAND tối cao |
| Kiểm sát | Kiểm tra viên → Kiểm sát viên (cấp dưới) → Viện trưởng VKSND cấp tỉnh → Kiểm sát viên VKSND tối cao → Viện trưởng VKSND tối cao |
| Đỉnh chung | **Chủ tịch nước**: đã đạt ít nhất cấp "trung ương" ở hai nhánh và có đủ sách `nguyen-thu`, `hien-phap` cấp 3 |

Không đưa chức danh của tổ chức Đảng (không thuộc bộ máy nhà nước theo Hiến pháp).

### 3.3 Điều kiện lên chức
Mỗi chức danh cần **N sách thuộc các lĩnh vực liên quan, ở cấp tối thiểu**. Số sách và cấp tăng dần theo thang. Ví dụ:
- Công chức cấp xã: 1 sách `dia-phuong` cấp 1 + 1 sách `hien-phap` cấp 1.
- Chủ tịch UBND cấp tỉnh: `dia-phuong` cấp 2, `hanh-phap` cấp 2, thêm 3 sách bất kỳ cấp 2.
- Bộ trưởng: `hanh-phap` cấp 3, `kinh-te-tai-chinh` cấp 2 ×3, `hien-phap` cấp 2.

Chức danh cần lĩnh vực **chưa có môn** hiện khoá kèm nhãn "Chờ môn Hình sự…". Người học **tự chọn nhánh** để theo; được thăng ở nhiều nhánh song song và hiển thị chức danh cao nhất đang chọn.

Hàm thuần `game/career.ts` (đầu vào: danh sách sách và cấp; đầu ra: chức danh đã đạt và điều kiện còn thiếu), có test phủ mọi bậc.

### 3.4 Chân dung
Tranh bán thân cách điệu, khung 4:5:
- Người: nét phẳng như các tranh khác, **không mô phỏng người thật**.
- Trang phục mở khoá theo nhánh và cấp: sơ mi, vest, cà vạt cho hành pháp và lập pháp; trang phục xét xử và kiểm sát vẽ giản lược, **không** sao chép phù hiệu, cấp hiệu thật.
- Phụ kiện: cặp tài liệu, bút, sổ, kính, huy hiệu ngành cách điệu.
- Bối cảnh: trụ sở xã → sở → bộ → Nhà Quốc hội → toà án (dùng lại các cảnh đã vẽ).
- Hiệu ứng nền tăng theo cấp: ánh nắng, mặt trống đồng xoay, khung viền vàng, hạt sáng.
- Người học tự chọn trang phục, phụ kiện, nền trong số đã mở khoá. Lưu trong `settings`.

### 3.5 Giới hạn
- Không vẽ chân dung lãnh đạo thật, Quốc huy, Quốc kỳ, cấp hiệu và phù hiệu thật.
- Tên chức danh dùng đúng tên gọi pháp lý, không chế giễu, không gắn hình ảnh tiêu cực.
- Màn thăng chức và Hồ sơ ghi rõ: **"Chức danh mô phỏng trong trò chơi học tập, không phải chức vụ thật."**

## 4. Dữ liệu
- Store mới (IndexedDB): `books` (chapterId → cấp cao nhất, ngày đạt), `career` (nhánh đang chọn, chức danh đã đạt), `card` (kỷ lục màu). Migration từ dữ liệu cũ: tính sách từ `progress` hiện có. XP vẫn giữ, chỉ hiển thị phụ.
- Bỏ: `game/rank.ts` (khoa cử), `gradeFor` (phẩm hàm). Thay hoặc xoá test tương ứng.

## 5. Chia phiên (mỗi phiên ≤ 2 giờ, 1 PR)
| Phiên | Việc | Xong khi |
|---|---|---|
| A | Spec này + đối chiếu tên cấp toà án/viện kiểm sát | Hào duyệt |
| B | Thẻ chuyên cần: `card.ts` + test, 27 ký hoạ, thẻ lớn/nhỏ, hiệu ứng | thẻ đúng mọi ngày 0–200 trong test; ảnh 390/1280 |
| C | Sách theo chương: `books` store + test, gáy 3 cấp, tủ nhiều tầng | sách đúng cấp, không tụt cấp |
| D | Thăng chức: `career.ts` + bảng điều kiện + test, màn chọn nhánh | mọi chức danh có điều kiện, test xanh |
| E | Chân dung + tủ đồ + màn thăng chức | ảnh 390/1280, a11y |
