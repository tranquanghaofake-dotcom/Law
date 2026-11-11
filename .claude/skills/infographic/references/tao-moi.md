# Tạo style, khối mới khi thư viện không hợp đề tài

Mở file này khi bước kiểm độ hợp (mục A) cho thấy thư viện không có style hoặc khối hợp. `SKILL.md`, `Bước N` trong file này trỏ về các mục của SKILL.md.

## Quy trình nghiên cứu và tạo mới

Chạy chen giữa pha 1 và pha 4. Ghi mọi quyết định vào `ke-hoach.md` (mục "Tạo mới").

**A. Kiểm độ hợp (5 phút) — quyết định dùng lại hay tạo mới**
- Style hợp khi **≥ 2/3 vật trang trí** của nó có thật trong thế giới đề tài (vd. `ban-ve` hợp thuê trọ: mặt bằng, kích thước, khung tên đều thuộc nhà ở). Dưới 2/3 → tạo style mới. Chỉ "màu hợp" không đủ.
- Khối hợp khi **hình dạng dữ liệu** khớp bảng Bước 3. Dữ liệu có hình dạng chưa có (bản đồ, sơ đồ quan hệ nhiều bên, lịch tháng, ma trận rủi ro…) → tạo khối mới.

**B. Nghiên cứu thế giới hình ảnh (15–20 phút)**
1. Liệt kê 10 thứ người đọc **thấy tận mắt** khi gặp vấn đề này: giấy tờ, đồ vật, nơi chốn, màn hình app, biển hiệu. (Thuế → tờ khai, hóa đơn, app eTax; giao thông → biển báo, vạch kẻ, giấy phép lái xe.)
2. Tra ảnh thật của 3–4 thứ tiêu biểu (web search) và ghi đặc điểm thị giác: màu chủ, chất liệu giấy, kiểu chữ, khung viền, ký hiệu lặp lại.
3. Chọn **1 vật chủ đạo** (thành khung trang + hình chính) và **2 vật phụ** (trang trí, ghi chú). Vật chủ đạo phải **chở được dữ liệu**: lịch chở ngày, hóa đơn chở tiền, biển báo chở cấm/được, bản đồ chở nơi chốn.
4. Không mô phỏng giấy tờ thật đến mức giả được: không quốc huy, không con dấu cơ quan, không logo thương hiệu, không số hiệu biểu mẫu thật.

**C. Dựng style từ vật chủ đạo**
- 4–6 màu lấy từ vật thật → gán vào token theo nghĩa (`--info --good --bad --accent`); chạy `contrast.mjs` sớm.
- Font có tiếng Việt, hợp chất liệu: Be Vietnam Pro (trung tính), Barlow / Barlow Condensed (kỹ thuật), Lexend (dễ đọc, thân thiện), Roboto Slab (giấy tờ, văn bản), Nunito (trẻ em), Patrick Hand / Pangolin (viết tay). Kiểm dấu tiếng Việt bằng ảnh render, không tin tên font.
- Trang trí: tối đa 2 chi tiết đặc trưng của vật chủ đạo (vd. hóa đơn: mép răng cưa + đường chấm cắt).

**D. Tạo khối mới nếu cần**
- Phác ASCII trong `ke-hoach.md` trước khi code; khối mới phải đọc đúng khi in đen trắng thu nhỏ.
- Code theo mục "Thêm nhanh style, khối, chủ đề" dưới; thử bằng chính bài đang làm.

**E. Asset theo vật chủ đạo**
- Icon: lập danh sách theo từng khối rồi `assets.mjs icon …`.
- Nhân vật: chỉ khi đề tài có người; `assets.mjs avatar-sheet` rồi chọn đúng vai (tuổi, nghề).
- **1 minh họa SVG tự vẽ** của vật chủ đạo (`assets/illustrations/`, nét `currentColor`, ≤ 40 dòng) — làm cho trang có chất riêng mà không tốn ảnh có bản quyền.

**F. Kiểm "mới thật hay chỉ đổi màu"**
- Che chữ, chỉ nhìn hình: người lạ có đoán ra đề tài không?
- Đặt cạnh 3 bài cũ: nếu khác nhau chỉ ở màu → chưa đạt, quay lại B.
- Hình chính có phải là vật chủ đạo đang chở dữ liệu không, hay chỉ là trang trí?

**Lỗi đã gặp khi tạo style, khối mới — soát trước khi sang pha 4**
- Đề tài quá rộng ("thương mại quốc tế") → việc đầu tiên là **thu hẹp** về một câu hỏi có dữ liệu hình dạng rõ; ghi lý do thu hẹp vào brief.
- Font "lạ" phải render thử dấu tiếng Việt trước khi chọn; tên font không bảo đảm đủ dấu.
- Không nối lệnh render với `| head`; đọc toàn bộ đầu ra của `render.mjs`.
- Chữ nhạt trên nền màu đậm của style mới hay trượt tương phản → chạy `contrast.mjs` ngay lần render đầu.
- Bản sắc phải phủ **cả trang**, không chỉ tiêu đề: ghi chú, thẻ, khung cuối trang cũng lấy từ thế giới đề tài (giấy nhớ là của "vở học"; ở bến cảng thì là thẻ hàng, ô thường thì là container xếp chồng).
- Màu đã mang nghĩa (bán/mua, đúng/sai) **không dùng lại** cho thứ khác (lỗi đã gặp: tô "Hải Phòng" màu xanh như thể "của người mua").
- Chỉ tô đậm **ngoại lệ**; giá trị mặc định để xám (lỗi đã gặp: 22 ô XK/NK cùng màu đậm, chỉ 2 ô mang thông tin).
- Chữ tra cứu (mã, ký hiệu) dùng font thân đậm, không dùng font trang trí (stencil làm "EXW" thành "EXlll").
- Hình chính dạng ma trận cần lưới cột dóng với nhãn cột và một dấu điểm chuyển đủ dày (≥ 6 px).

**G. Thu hoạch**: style/khối/minh họa mới vào thư viện; thêm 1 dòng vào bảng "Ý tưởng hình ảnh" (Bước 5a) và dòng "Thư viện hiện có" của SKILL.md. Thư mục skill chỉ-đọc: giữ file mới trong thư mục bài (`styles/`, `assets/illustrations/`) và báo người dùng danh sách file cần thêm vào skill.

## Thêm nhanh style, khối, chủ đề

- **Style mới** (≈ 15 phút): tạo `styles/<ten>.css`. Dòng 1: `/* ten: mô tả — vật liệu, trang trí. Hợp: chủ đề… */`. Bên trong chỉ: `@import` font (có tiếng Việt), ghi đè token `:root` (`--paper --ink --muted --line --soft --info --good --bad --accent --font --font-display --radius --pad-left`), nền `.sheet`, trang trí (`::before/::after`), cách vẽ `.secno`, `.head`. Không đụng bố cục khối. `new.mjs --list` tự thấy.
- **Khối mới**: tạo `blocks/<ten>.html` (dòng 1: `<!-- ten: mô tả | khi nào dùng -->`, dùng `<div class="secno" data-margin>`), thêm CSS của khối vào `styles/_base.css` với tiền tố riêng, dùng token chứ không dùng mã màu. **Không** đặt tên lớp trùng biến thể có sẵn (`.ok/.no/.yes/.maybe/.hot` là biến thể, không phải khối).
- **Chủ đề mới**: thêm 1 dòng vào bảng "Ý tưởng hình ảnh" (Bước 5a) và, nếu có lỗi luật mới gặp, 1 dòng vào checklist pháp lý (Bước 2).
