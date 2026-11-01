# Luyện Luật — Thẻ chuyên cần, Tủ sách theo chương, Thăng chức theo bộ máy nhà nước (đợt nâng cấp 3)

Phiên bản 1.0 · 02/11/2026 · Trạng thái: **Hào duyệt toàn bộ (02/11/2026), đã triển khai B–E** trên nhánh `claude/amazing-archimedes-u5vtr5`.
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

### 3.6 Độ khó đã chốt khi triển khai (Hào: "hợp lý, logic, từ tỉnh trở lên phải thật khó")
Bảng chức danh và điều kiện nằm ở `apps/web/src/lib/game/career.ts`. `tests/game/career.test.ts` khoá các luật sau:
- Thăng **tuần tự** trong nhánh. Mỗi cuốn sách chỉ được dùng cho **một** điều kiện của chức danh (phân bổ tham lam, lĩnh vực riêng trước, "bất kỳ" sau).
- Trong mỗi nhánh, tổng số sách **tăng ngặt** và cấp tối thiểu **không giảm** theo thang.
- **Từ cấp tỉnh:** mọi điều kiện ≥ cấp 2, mỗi chức danh ≥ 15 sách. **Trung ương và lãnh đạo:** mọi điều kiện cấp 3.
- Kể cả khi **toàn bộ 26 chương hiện có đạt cấp 3**, vẫn chưa lên được cấp tỉnh ở Hành pháp, Xét xử, Kiểm sát (cần Luật Hành chính, Dân sự, Hình sự, Tố tụng, Đất đai — chờ môn), và chưa ai đạt Chủ tịch nước. Lập pháp lên tới Đại biểu Quốc hội nếu học trọn nội dung hiện có.
- **Chủ tịch nước:** cấp Trung ương ở ≥ 2 nhánh + 59 sách cấp 3.
- Tên cấp toà án và viện kiểm sát dưới cấp tối cao **chưa đối chiếu luật tổ chức ngành**. Dùng tên chung ("Thẩm phán", "Kiểm sát viên", "Thẩm tra viên Tòa án", "Kiểm tra viên"); chỉ gọi tên cấp toà/viện ở "cấp tỉnh" và "tối cao".

### 3.7 Đổi phong cách thẻ và chân dung (Hào, 02/11/2026)
Hào thấy thẻ nền son và chân dung nét mảnh chưa đẹp, gửi 2 mẫu: lưới avatar chibi (ảnh có dấu 即梦AI) và thẻ VIP đen hoa văn vàng. Chỉ học phong cách, không chép nhân vật hay chữ.
- **Không dùng GIF/video:** thẻ đổi theo từng ngày (27 ký tự × 6 màu + huy hiệu + viền + kỷ lục) và chân dung ghép lớp tự do; ảnh raster/video không tạo được các tổ hợp này, nặng, không đổi theo chế độ tối, không đọc được bằng trình đọc màn hình. Chuyển động "kiểu GIF" làm bằng SVG + CSS (vệt sáng lướt, nhũ holographic, sao lấp lánh), tự tắt khi giảm chuyển động.
- **Thẻ chuyên cần → thẻ đen kim loại:** nền đen nhám, hoa văn chìm sen + mây; viền hai đường kèm dải hoạ tiết sóng; 27 ký hoạ trong huy chương nhỏ chạy quanh viền (sáng theo chiều kim đồng hồ từ giữa cạnh trên); huy hiệu vàng kim trong bầu dục; số "NGÀY CHUỖI" và "KỶ LỤC" (4 chữ số) thay tên chủ thẻ; màu lửa là màu nhũ (đỏ đồng, lam, tím, bạch kim, đen viền vàng, holographic chuyển động); vệt sáng lướt mỗi 7 giây.
- **Chân dung → chibi nét dày:** thẻ trắng bo góc trên nền màu nhánh (hành pháp xanh lá, lập pháp đỏ, xét xử xanh đêm, kiểm sát xanh dương, Chủ tịch nước vàng); đầu to, nét đen 3,4 px, mắt tròn có đốm sáng, má hồng, màu phẳng; trụ sở theo nhánh vẽ cùng nét, tô nhạt phía sau; sao ✦ lấp lánh ở nền "Hạt sáng".

### 3.8 Thẻ trơn và chibi toàn thân, trang phục theo chức danh thật (Hào, 02/11/2026)
- **Thẻ:** thẻ trơn bo tròn, không khung viền. 27 ký hoạ ẩn mờ trên nền, rải theo xoắn ốc tỉ lệ vàng ở dải giữa thẻ, không đè chữ ở bốn góc; sáng dần theo ngày; quầng màu lửa đậm dần. Logo: bông sen 8 cánh ôm cán cân. Rê chuột: thẻ nghiêng 3D + vệt sáng theo con trỏ (tự viết; học kỹ thuật biến CSS theo con trỏ của `simeydotme/pokemon-cards-css` (GPL-3.0, không chép mã) và `vanilla-tilt.js` (MIT, không thêm thư viện)).
- **Chân dung:** chibi toàn thân, nét nâu `#3d2f2c`, mắt to có tròng chuyển màu + 2 đốm sáng, má hồng chuyển màu, tóc có mảng sáng; 3 kiểu tóc (ngắn, dài, buộc).
- **Trang phục gắn với chức danh đang hiển thị** (`outfitFor` trong `game/wardrobe.ts`, có test). Người học chọn "Theo chức vụ" (mặc định), "Thường phục", hoặc "Áo dài" (mở ở cấp tỉnh).

| Chức danh | Trang phục | Căn cứ |
|---|---|---|
| Công dân | thường phục (áo len, quần) | — |
| Công chức xã, Đại biểu HĐND xã, Thư ký Tòa án, Thẩm tra viên | công sở: sơ mi trắng, quần tối, thẻ đeo cổ | không có đồng phục riêng (trang phục làm việc TAND theo TT 06/2025/TT-TANDTC — chưa đọc nguyên văn mẫu) |
| Hành pháp, lập pháp cấp tỉnh | vest xanh than | — |
| Trung ương, lãnh đạo, Chủ tịch nước | vest đen, cà vạt đỏ, huy hiệu cài áo cách điệu | — |
| Thẩm phán trở lên | áo choàng dài tay màu đen | NQ 1214/2016/UBTVQH13 khoản 2 Điều 13; QĐ 1738/QĐ-TANDTC (23/11/2017); kiểu dáng theo QĐ 210/QĐ-TANDTC 2017 (chưa đọc) |
| Kiểm tra viên, Kiểm sát viên | sơ mi xanh dương, quần xanh đen, cầu vai đỏ trơn, biển tên trơn | gam xanh dương, cấp hiệu nền đỏ (NQ UBTVQH về trang phục ngành Kiểm sát thông qua 12/1/2026, hiệu lực 1/3/2026 — **chưa tra số hiệu**) |
| Viện trưởng VKSND cấp tỉnh/tối cao | áo khoác thu đông xanh đen, cầu vai đỏ trơn | như trên |

Không vẽ Quốc huy, sao, vạch cấp hiệu hay biểu tượng ngành thật.

### 3.9 Thẻ guilloche và tủ kính trưng bày (Hào, 02/11/2026)
- **Thẻ:** logo là huy hiệu nổi khối: rosette guilloche 36 elip xoay lồng nhau, đĩa tối, bông sen 8 cánh ôm cán cân vàng kim (đổ bóng + viền sáng). Hai lớp mặt nạ: lớp tròn làm 27 ký hoạ mờ dần quanh logo, lớp có mép mềm giữ bốn góc chữ sạch. 27 ký hoạ nét mảnh xếp lưới 9×3 so le phủ kín thẻ, chồng mép lên nhau, xen vân guilloche (7 đường sóng); sáng theo thứ tự từ gần logo ra ngoài.
- **Chân dung → tủ kính trưng bày bộ đồ** (cảm hứng hộp kính lưu niệm quân phục Hào gửi; không vẽ quân hàm, cấp hiệu, quân hiệu, Quốc huy). Tủ khung gỗ tối, đèn rọi trần, hốc giữa có đèn hắt; biển tên mạ vàng ghi **chức danh** (không tên người); bộ đồ treo móc theo `outfitFor`; 4 khung huy hiệu chương theo nhánh; bục trái trưng phụ kiện (cán cân mặc định, kính, chồng sách luật, cặp); bục phải giấy khen ghi số sách và số sách cấp 3; vệt kính phản chiếu trượt khi rê chuột. Tuỳ chỉnh: trang phục (theo chức vụ / thường phục / áo dài), phụ kiện trên bục, ánh sáng & khung (đèn rọi, vách trống đồng, khung mạ vàng, hạt sáng). Bỏ tuỳ chọn tóc (không còn vẽ người).

### 3.10 Tinh chỉnh thẻ và tủ kính (Hào, 02/11/2026)
- **Thẻ sạch:** mọi thông tin (màu chu kỳ, ngày, chuỗi, kỷ lục) chuyển ra dòng chú thích dưới thẻ; mặt thẻ chỉ còn hoạ tiết và huy hiệu.
- **Huy hiệu hài hoà:** đài sen nhìn nghiêng 5 cánh nâng cán cân (trụ cân mọc từ cánh giữa, đĩa cân trên hai cánh bên) trong rosette guilloche.
- **Hoạ tiết mềm:** mỗi ký hoạ ngành luật nằm trong lòng một đám vân mây cuộn (tường vân) có lọn xoắn; 27 đám mây xếp so le, chồng mép, phủ cả thẻ.
- **Tủ kính thoáng:** bỏ 4 khung ảnh; hốc giữa rộng, bộ đồ to hơn; biển tên ở trên, dòng phụ "N sách · M cấp 3" nằm trong biển; đèn rọi trong hốc; **cầu vai** ngũ giác to, viền chỉ vàng (kiểm sát, không sao/biểu tượng); **huân chương** = dải ruy băng + huy chương tròn mẫu chung, số lượng theo số chức danh đã đạt (không theo huân chương thật); **kệ kính trưng sách** đã đạt (tối đa 10, cấp cao trước) bằng chính gáy sách 3 cấp; phụ kiện ở hai đầu kệ.

### 3.11 Ảnh bộ đồ và vân mây kiểu Việt (Hào, 02/11/2026)

- **Bộ đồ**: thử ảnh AI tạo trong Figma rồi **Hào loại** (không dùng ảnh AI). Thay bằng **bản vẽ kỹ thuật** (technical flat) trong `art/GarmentFlat.svelte`: mặt trước, nét mảnh đều, đường may nét đứt, tô một màu phẳng; vẽ nửa trái rồi lật gương. Không quân hàm, cấp hiệu, Quốc huy, huân chương thật; cầu vai kiểm sát là dải đỏ trơn viền chỉ vàng. **Bỏ huân chương trên áo dân sự** (sai thực tế). Áo dài bày trên ma-nơ-canh thay vì treo móc.
- **Tủ** (`art/Portrait`): biển đồng ghi chức danh, ô kính nền sáng chứa bản vẽ, bục gỗ bày sách và phụ kiện, đều dựng bằng HTML/CSS. Hiệu ứng nền phủ lên ảnh.
- **Nền thẻ** (`art/StreakCard`): ba dải vân mây kiểu chạm đình làng/sơn son thiếp vàng. Mỗi đầu mây cuộn xoắn ôm một ký hoạ, có lọn xoắn con; đuôi mây là ba nét song song luồn dưới đầu kế tiếp và tràn ra mép thẻ, kèm một lớp xoắn lớn rất mờ. Dải giữa chừa chỗ logo (10 + 8 + 9 = 27 đầu mây).
- Chưa kiểm chứng: mẫu cầu vai kiểm sát theo nghị quyết UBTVQH thông qua 12/1/2026 (chưa tìm được số hiệu).

## 4. Dữ liệu
- Store mới (IndexedDB): `books` (chapterId → cấp cao nhất, ngày đạt), `career` (nhánh đang chọn, chức danh đã đạt), `card` (kỷ lục màu). Migration từ dữ liệu cũ: tính sách từ `progress` hiện có. XP vẫn giữ, chỉ hiển thị phụ.
- `game/rank.ts` (khoa cử, phẩm hàm) **giữ file và test, không còn hiển thị**. XP vẫn cộng và hiện phụ ở Hồ sơ. Bậc 6 đổi tên **Tinh thông**.
- Đã triển khai: `game/card.ts`, `game/books.ts`, `game/fields.ts`, `game/career.ts`, `game/wardrobe.ts` (đều có test); `art/StreakCard`, `art/BookSpine` (3 cấp), `art/Portrait`, `ui/CareerPanel`, `ui/Bookshelf` (tủ nhiều tầng); settings: `books`, `career`, `avatar`.

## 5. Chia phiên (mỗi phiên ≤ 2 giờ, 1 PR)
| Phiên | Việc | Xong khi |
|---|---|---|
| A | Spec này + đối chiếu tên cấp toà án/viện kiểm sát | Hào duyệt |
| B | Thẻ chuyên cần: `card.ts` + test, 27 ký hoạ, thẻ lớn/nhỏ, hiệu ứng | thẻ đúng mọi ngày 0–200 trong test; ảnh 390/1280 |
| C | Sách theo chương: `books` store + test, gáy 3 cấp, tủ nhiều tầng | sách đúng cấp, không tụt cấp |
| D | Thăng chức: `career.ts` + bảng điều kiện + test, màn chọn nhánh | mọi chức danh có điều kiện, test xanh |
| E | Chân dung + tủ đồ + màn thăng chức | ảnh 390/1280, a11y |
