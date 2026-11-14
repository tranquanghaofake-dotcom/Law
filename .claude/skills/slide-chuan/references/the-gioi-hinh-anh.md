# Thế giới hình ảnh và da theo môn (bước 0 — 11/2026)

Vấn đề: chỉ đổi chữ thì mọi deck "xêm xêm nhau"; che chữ đi không đoán được đề tài (lỗi L10, bị chê ở 4 bài). Infographic khác hẳn nhau vì mỗi bài dựng từ **một vật chủ đạo của chính đề tài** (sổ, bản vẽ, container). Slide làm tương tự bằng **da theo môn** (`hinh/da.js`, chọn bằng `meta.da`): bản sắc dồn vào **màu · nền · khung toàn slide · vỏ thẻ · nhãn · ô số · thanh tiến độ · đồ vật tiền cảnh · hình lớn ở bìa / chương / kết · cách khối hiện ra**. Font giữ nguyên (Anton + Be Vietnam, nhúng sẵn).

## Quy trình (ghi vào `prep.json` → `world` và `da`)
1. **10 thứ người học THẤY TẬN MẮT** khi gặp vấn đề của môn: giấy tờ, đồ vật, nơi chốn, màn hình app.
2. Tra ảnh thật 3–4 thứ tiêu biểu, ghi đặc điểm thị giác: màu chủ, chất liệu, khung viền, ký hiệu lặp lại.
3. Chọn **1 vật chủ đạo** (thành nền + khung + vỏ thẻ) và **2 vật phụ** (đồ vật, hình lớn). Vật chủ đạo phải **chở được nội dung**: sổ BHXH chở thời gian đóng, bảng chấm công chở ngày công, container chở hàng / rủi ro, bản vẽ chở kích thước.
4. Chọn da có sẵn khi **≥ 2/3 vật** của nó có thật trong đề tài; không thì thêm da mới (mục dưới) hoặc — nếu người dùng chọn — dùng da chung `ho-so` / `giay` / `kinh`.
5. Kiểm: che chữ — người lạ đoán ra đề tài không? Đặt cạnh 2 deck cũ — khác hơn mức "đổi màu" không? Đo bằng `python3 scripts/nhin_mo.py --da deck.json` (điểm ≥ 6 với mọi da khác) và nhìn ảnh nhìn mờ mà `--soat` tạo.
6. Không mô phỏng giấy tờ đến mức giả được: không quốc huy, không biểu trưng cơ quan, không số hiệu biểu mẫu, không con dấu cơ quan.

## Tiêu chí "che chữ vẫn đoán được"
Mỗi slide nội dung mang dấu hiệu da ở **cả 3 cỡ** — chỉ đổi màu thì khi chiếu mờ / nhìn từ cuối lớp các deck giống hệt nhau:

| Cỡ | Là gì | Trường của da (`hinh/da.js`) |
|---|---|---|
| Lớn | Nền + khung toàn slide, thấy cả khi chiếu nhạt | `nen` (tôn gợn, lưới bản vẽ, ô lịch, dòng chấm, vân bảo an…), `khung` (viền đôi, băng cảnh báo, đường kích thước, mép răng cưa…) |
| Vừa | Bố cục "là" vật: vỏ thẻ, ô số, đồ vật tiền cảnh, hình lớn | `the` (tờ rời, thẻ chấm công, container, cuống vé…), `so`, `vat` (đồ vật `hinh/do_vat.js`, đặt vào chỗ trống), `art` (hình lớn `hinh/art.js` ở bìa / chương / kết / statement) |
| Nhỏ | Chi tiết lặp ở mọi slide | `nhan` (kiểu nhãn kicker), `tienDo` (thanh tiến độ), `chuyen` (khối hiện ra: đóng dấu, lật lịch, trượt, vẽ nét, rơi, bật, nổi) |

## Thêm da mới
Một khối trong `DA` của `hinh/da.js`: `mon`, `fits` (từ khoá đề tài, chữ thường), màu (`ink`, `acc`, `page`, `muted`, `line`, `bad`, `good`, `gold`), `nen`, `khung`, `the`, `nhan`, `so`, `tienDo`, `vat` (≥ 2 tên có trong `hinh/do_vat.js`), `chuyen`, `art` (tên có trong `hinh/art.js`). Kiểu nền / khung / vỏ thẻ mới: thêm một nhánh vào `nenSvg` / `khungSvg` / `theCss`. Chạy `node --test tests/da.test.js`, dựng một deck mẫu với `--soat`, rồi `nhin_mo.py --da` để chắc da mới khác các da cũ.

## Bảng môn → da (đã nghiên cứu)
| Môn / đề tài | Da | Vật chủ đạo → thể hiện | Vật phụ |
|---|---|---|---|
| Luật An sinh xã hội, BHXH, BHYT, BHTN | `so-bhxh` | Sổ BHXH (bìa xanh lá nhạt, khung viền đôi; tờ rời là bảng "quá trình đóng") → trang xanh nhạt, khung viền đôi, thẻ = tờ rời; khối chính `sheet` | sổ, xu, con dấu |
| Luật Lao động (tiền lương, thời giờ làm việc, kỷ luật) | `bang-cong` | Bảng chấm công (lưới ô ngày, ô Chủ nhật đỏ) → nền ô lịch, thẻ chấm công; khối chính `calendar` | thẻ nhân viên, máy tính |
| Thương mại quốc tế, vận tải, hải quan, logistics | `cang-bien` | Container (tôn gợn, gỉ sét / navy, băng cảnh báo vàng – đen) → nền tôn gợn, băng cảnh báo, thẻ container; khối chính `riskbar` | thùng hàng, cột hàng |
| Đất đai, nhà ở, xây dựng, kinh doanh BĐS | `ban-ve` | Bản vẽ kỹ thuật (lưới, đường kích thước) → lưới xanh, đường kích thước quanh slide và thẻ; khối chính `plan` | thước, bút chì |
| Luật Thuế, kế toán, phí – lệ phí | `hoa-don` | Hoá đơn GTGT / biên lai (dòng chấm dẫn, "cộng tiền hàng", "tổng thanh toán") → mép răng cưa, thẻ cuống vé; khối chính `receipt` | máy tính, xu, kẹp |
| Luật Ngân hàng, tín dụng, chứng khoán | `sao-ke` | Sao kê tài khoản + hoa văn bảo an → nền vân sóng, thẻ có cuống; khối chính `account` | thẻ ngân hàng, xu |
| Luật Doanh nghiệp, cổ phần, M&A | `co-cau` | Sơ đồ cơ cấu sở hữu (nút, đường nối) → nền lưới chấm, thẻ nút; khối chính `captable` | cột, ghim |
| Tố tụng, xử phạt vi phạm hành chính | `bien-ban` | Biên bản (trường kẻ chấm, chữ ký) + giấy niêm phong → dòng kẻ chấm, lề đỏ, tab hồ sơ; khối chính `record` | con dấu, kẹp, bút |
| Hình sự | `bc` + kiểu `bc*` | Bảng bằng chứng (bảng bần, giấy ghim, dây đỏ, thẻ tang vật) — `references/canh.md` mục 8 | — |
| Công pháp quốc tế | `qt` + kiểu `qt*` | Bàn hội nghị (bản đồ chấm, văn kiện dấu xi, bảng tên phái đoàn) — mục 9 | — |
| Dân sự, hợp đồng, bình luận bản án (chung) | `ho-so` | Hồ sơ vụ việc (bìa kraft, tab, kẹp giấy) | bút, kính lúp |
| Bài giảng nhập môn, kỹ năng (chung) | `giay` | Giấy kẻ dòng | bút chì, thước |
| Báo cáo, số liệu (chung) | `kinh` | Tấm kính, thẻ trong | quả cầu, cột |

Nguồn đặc điểm thị giác (xem 11/2026): ảnh bìa sổ và tờ rời BHXH (thuvienphapluat.vn, fptshop.com.vn), mẫu bảng chấm công và phiếu lương (fast.com.vn, nhankiet.vn), mẫu hoá đơn điện tử GTGT trên trang hướng dẫn của nhà cung cấp hoá đơn (meinvoice.vn, tintucketoan.com), mẫu biên bản niêm phong tang vật (thuvienphapluat.vn). Sao kê và sơ đồ sở hữu dựng theo bố cục quen thuộc, KHÔNG chép mẫu của ngân hàng / cơ quan nào. Mọi da chỉ là HÌNH MINH HOẠ.
