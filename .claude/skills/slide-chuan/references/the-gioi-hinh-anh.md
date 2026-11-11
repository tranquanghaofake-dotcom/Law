# Thế giới hình ảnh theo môn (bước 0 — 11/2026)

Vấn đề: chỉ đổi chữ thì mọi deck "xêm xêm nhau". Infographic khác hẳn nhau vì mỗi bài dựng từ **một vật chủ đạo của chính đề tài** (vở ô li, bản vẽ, container). Slide làm tương tự — nhưng chỉ dùng font Office (Calibri / Arial / Times New Roman), nên bản sắc dồn vào: **màu trang · nền · khung toàn slide · vỏ thẻ · nhãn · ô số · đồ vật · hình vẽ mặc định**. World khai báo ở `engine/kits.js`; deck chọn bằng `meta.kit`.

## Quy trình (ghi vào `prep.json` → `world`, build cảnh báo khi thiếu với bài `report`)
1. **10 thứ người học THẤY TẬN MẮT** khi gặp vấn đề của môn: giấy tờ, đồ vật, nơi chốn, màn hình app.
2. Tra ảnh thật 3–4 thứ tiêu biểu, ghi đặc điểm thị giác: màu chủ, chất liệu, khung viền, ký hiệu lặp lại.
3. Chọn **1 vật chủ đạo** (thành nền + khung + vỏ thẻ) và **2 vật phụ** (đồ vật trang trí, hình vẽ). Vật chủ đạo phải **chở được nội dung**: sổ BHXH chở thời gian đóng, bảng chấm công chở ngày công, container chở hàng / rủi ro, bản vẽ chở kích thước / thửa đất.
4. Chọn world có sẵn khi **≥ 2/3 vật trang trí** của nó có thật trong đề tài; không thì thêm world mới (một khối trong `KITS`: palette, page, font, bg, frame, card{strip, skin}, tag, num, mark, props, art, fits).
5. Kiểm: che chữ — người lạ đoán ra đề tài không? Đặt cạnh 2 deck cũ — khác hơn mức "đổi màu" không? Đo bằng `scripts/nhin_mo.py --worlds deck.json` (điểm ≥ 6 với mọi world khác).

## Tiêu chí "che chữ vẫn đoán được" (11/2026)
Mỗi slide nội dung phải mang dấu hiệu world ở **cả 3 cỡ** — chỉ đổi màu thì khi chiếu mờ / nhìn từ cuối lớp các world giống hệt nhau:

| Cỡ | Là gì | Trong engine |
|---|---|---|
| Lớn (macro) | Nền + khung toàn slide, nhìn thấy cả khi chiếu nhạt | `bg`, `frame` (độ đậm đã nâng 11/2026) |
| Vừa (meso) | Bố cục "là" vật: thẻ, ô bước, điểm mốc, thanh biểu đồ, khối hình chính, đồ vật | `card.skin`, **`form`** (worldTile / worldLink / worldMarker / worldBar), `hero`, `props` |
| Nhỏ (micro) | Chi tiết lặp ở mọi slide | **`icons`** (bộ icon riêng thay hình người chung), nhãn `tag`, **`progress`** (thanh tiến độ hình vật thật) |

`form` của 8 world: `so-bhxh` stamp (ô dấu + dấu tròn đỏ, kẻ đôi như sổ) · `bang-cong` day (tờ lịch có khoen, thước ngày) · `cang-bien` container (gờ tôn, thanh khoá cửa, ray + tà vẹt) · `ban-ve` dim (khung + đường kích thước, ô khung tên) · `hoa-don` ticket (cuống vé khía tròn, đường xé) · `sao-ke` card (thẻ có chip, vân bảo an, chồng xu) · `co-cau` node (nút sơ đồ, thanh dẫn) · `bien-ban` tab (tab hồ sơ, dây niêm phong, dấu xi).

`progress`: stamps (ô dấu sổ) · days (ô ngày, ô Chủ nhật đỏ) · train (đoàn container) · ruler (thước + con trỏ) · tape (giấy hoá đơn kéo dài, mép xé) · balance (cột số dư tăng dần) · nodes (nút sơ đồ sáng dần) · folio (số trang "TỜ 07/22" + dấu xi).

Phủ bố cục (11/2026, đợt 2): thẻ (2 biến thể chẵn / lẻ: gáy ngang ↔ gáy dọc có chỉ khâu + dấu tròn; dải 7 ô thứ trên ↔ dưới; mép răng cưa dưới ↔ trên + gạch đôi "tổng"; dải bảo an ↔ chip; băng niêm phong ↔ dấu xi…), `steps`, `timeline`, `stats`, `agenda`, `section`, `chart` (cột, thanh, đường, tròn, waterfall, step), `table`, `quote`, slide cảm ơn, slide ảnh. Còn trơn: `bignum` (cố ý tối giản), `compare`, `flow`, `matrix` (chỉ có vỏ thẻ).

`motion` (hiệu ứng theo tính cách vật): so-bhxh / bien-ban stamp · bang-cong flip · cang-bien / sao-ke slide · ban-ve wipe · hoa-don unroll · co-cau pop.

Đo trước / sau đợt này (cùng deck 8 slide, 8 world, slide 4–8): cặp world giống nhau nhất **3,6 → 7,0** điểm; số cặp < 6 điểm **8 → 0**.
Thêm world mới: khai báo đủ `form`, `icons` (6 icon Phosphor Duotone có thật — kiểm bằng `require("react-icons/pi")`), `progress`, `props` (≥ 3 vật) rồi chạy `nhin_mo.py --worlds`.
6. Không mô phỏng giấy tờ đến mức giả được: không quốc huy, không biểu trưng cơ quan, không số hiệu biểu mẫu.

## Bảng môn → world (đã nghiên cứu)
| Môn / đề tài | World | Vật chủ đạo → thể hiện | Vật phụ | Trạng thái |
|---|---|---|---|---|
| Luật An sinh xã hội, BHXH, BHYT, BHTN | `so-bhxh` | Sổ BHXH (bìa xanh lá nhạt, khung viền đôi, chữ có chân; tờ rời là bảng "quá trình đóng") → trang xanh nhạt, khung viền đôi quanh slide, tiêu đề Times, thẻ = tờ rời viền trong, nhãn = ô chữ nhật trống | phiếu lương, chồng xu | có |
| Luật Lao động (tiền lương, thời giờ làm việc, kỷ luật) | `bang-cong` | Bảng chấm công (lưới ô ngày, đầu cột navy, ô Chủ nhật đỏ) → dải 31 ô ngày ở mép trên, nền lưới ô, thẻ chấm công có lỗ bấm | thẻ nhân viên, phiếu lương | có |
| Thương mại quốc tế, vận tải, hải quan, logistics | `cang-bien` | Container (tôn gợn, màu gỉ sét / navy, băng cảnh báo vàng – đen) → nền tôn gợn, băng cảnh báo ở đáy, thẻ có dải cửa container | vận đơn, cột hàng | có |
| Đất đai, nhà ở, xây dựng, kinh doanh BĐS | `ban-ve` | Bản vẽ kỹ thuật (lưới, đường kích thước, khung viền) → lưới xanh, đường kích thước mép trên + trên mỗi thẻ | thước, bút chì | có |
| Dân sự, hợp đồng, tố tụng, bình luận bản án | `file` (+ `meta.style: dossier`) | Hồ sơ vụ việc (bìa kraft, tab, kẹp giấy) | bút máy, kính lúp | có |
| Bài giảng nhập môn, kỹ năng | `paper` | Vở / giấy kẻ dòng | bút chì, thước | có |
| Luật Thuế, kế toán, phí – lệ phí | `hoa-don` | Hoá đơn GTGT / biên lai (dòng hàng, cộng tiền hàng, thuế suất, tổng thanh toán; giấy cuộn xé) → trang trắng ngà, dòng chấm dẫn mờ, mép răng cưa trên–dưới slide, thẻ có vạch "cộng"; khối chính `receipt` | xu, kẹp giấy | có |
| Luật Ngân hàng, tín dụng, chứng khoán | `sao-ke` | Sao kê tài khoản (cột nợ / có / số dư, dòng xen màu) + hoa văn bảo an kiểu séc → nền vân sóng mờ, dải bảo an ở đáy, thẻ có đường xé cuống; khối chính `account` | xu, cột tăng trưởng | có |
| Luật Doanh nghiệp, cổ phần, M&A | `co-cau` | Sơ đồ cơ cấu sở hữu (nút, đường nối dày theo %) → nền lưới chấm, dấu góc khung, thẻ có đầu nối nút; khối chính `captable` | cột, ghim | có |
| Hình sự, tố tụng, xử phạt vi phạm hành chính | `bien-ban` | Biên bản (trường kẻ chấm, chữ ký các bên) + giấy niêm phong vắt mép → trang giấy ngà, dòng kẻ chấm, lề đỏ mảnh, băng niêm phong góc phải dưới, tiêu đề Times; khối chính `record` | kẹp giấy, bút | có |

Nguồn đặc điểm thị giác đợt 2 (xem 11/2026): mẫu hoá đơn điện tử GTGT trên trang hướng dẫn của nhà cung cấp hoá đơn (meinvoice.vn, tintucketoan.com: các dòng "cộng tiền hàng", "thuế suất", "tổng tiền thanh toán"), mẫu biên bản niêm phong tang vật trên thuvienphapluat.vn (trường thời gian / địa điểm / thành phần, chữ ký người lập – người vi phạm – người chứng kiến). Sao kê và sơ đồ sở hữu dựng theo bố cục quen thuộc của sao kê ngân hàng và hồ sơ doanh nghiệp, KHÔNG chép mẫu của ngân hàng / cơ quan nào. Mọi world đợt 2 chỉ là HÌNH MINH HOẠ — không ký hiệu mẫu số, không mã cơ quan thuế, không quốc hiệu, không con dấu cơ quan.

Nguồn đặc điểm thị giác: ảnh bìa sổ và tờ rời BHXH (thuvienphapluat.vn, fptshop.com.vn), mẫu bảng chấm công và phiếu lương (fast.com.vn, nhankiet.vn) — xem 11/2026; world `cang-bien` / `ban-ve` tham khảo cách làm của skill infographic nhưng dựng lại cho khổ 16:9 và font Office.
