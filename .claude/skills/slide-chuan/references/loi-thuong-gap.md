# Danh mục lỗi thường gặp và thứ tự sửa

Học từ `references/principles/failure-modes.md` của Akxan/ppt-agent-skill (8 failure mode + "thứ tự sửa") và QA nhiều lớp của siril9/presentation-skill (MIT). Mỗi lỗi có **tên** để agent gọi đúng, **dấu hiệu** trong thông báo của build, và **cách sửa đúng** (sửa nội dung, không sửa engine, không hạ cỡ chữ).

## Thứ tự sửa (sửa từ trên xuống — lỗi trên thường kéo theo lỗi dưới)

1. **Lỗi cấu trúc** (exit 2) → sửa trường được nêu. Chưa hết thì đừng sửa gì khác.
2. **Sai type** (L1, L2) → đổi type trước: đổi type làm thay đổi toàn bộ chữ cần viết.
3. **Thừa chữ** (L3, L4) → cắt, tách slide hoặc chuyển xuống `notes`.
4. **Tràn / đè / sát khối** (L5) → rút đúng ô được nêu.
5. **Thiếu bằng chứng / nguồn** (L6, L7, L13–L17 với bài báo cáo số liệu).
6. **Nhịp deck** (L8, L9) → đổi type xen kẽ, bớt khối đậm.
7. **Dư khoảng trống** (L10) → gộp slide hoặc đổi type gọn hơn — sửa CUỐI vì cắt chữ ở bước 3 có thể tạo ra nó.
8. Render, soát bằng mắt (`scripts/render.py`, `scripts/check_overflow.py`), lặp lại từ bước 4 nếu cần.

## Danh mục

| Mã | Tên | Dấu hiệu trong build / khi soát | Sửa đúng | Sửa SAI (đừng làm) |
|---|---|---|---|---|
| L1 | **Hình trang trí** (decorative substitution) | Dùng `venn`/`matrix`/`pyramid`/`chart` chỉ cho "có hình"; build: "thiếu điểm chung", "< 3 tầng"; một hình lặp ≥ 3 slide | Hỏi "người nghe làm gì với hình này?" → tra `python3 scripts/chon_layout.py "<mô tả>"` | Giữ hình, thêm chữ cho đủ ô |
| L2 | **Ép kiểu nội dung** | Công thức viết thành `steps`; số tiền dài nhét vào `bignum`; đề bài để trong `notes`; ≥ 2 mũi tên đổ về một nút trong `flow` | `formula`; `calc`; `exercise` → `calc`; `funnel` | Viết tắt số tiền cho vừa 3 ký tự |
| L3 | **Tường chữ** (wall of text) | "N tiếng trên slide (tối đa 110)"; "cần N dòng" ở nhiều ô cùng slide | Giữ 1 ý/slide; ý phụ → `notes`; hai ý → hai slide | Hạ cỡ chữ, thu lề |
| L4 | **Chữ đệm** | Cảnh báo cụm đệm ("có thể thấy", "nhìn chung"…) | Xoá cụm; câu vẫn đủ nghĩa thì xoá luôn câu | — |
| L5 | **Tràn / đè** | "Chữ không vừa khung", "chữ … đè lên …", "hai khối chỉ cách nhau 0.0x in" | Rút đúng trường được nêu ≈ số ký tự gợi ý | Sửa toạ độ trong engine giữa lúc làm deck |
| L6 | **Nhận định không bằng chứng** | Cảnh báo từ đánh giá ("không hợp lý", "thiếu") không có dẫn chứng | Thêm điều luật / số liệu / trích dẫn ngay trên slide | Bỏ nhận định cho yên |
| L7 | **Luật cũ / chưa đối chiếu** | `changelog` không ghi tên hai văn bản ở đầu cột; số liệu dùng mức lương cơ sở cũ; điều luật viết theo trí nhớ | Mở văn bản gốc đối chiếu từng điều; ghi tên văn bản trong nội dung (không ghi dòng nguồn — nguồn ở bản Word) | Ghi "theo quy định hiện hành" chung chung |
| L8 | **Lặp bố cục** | "N slide … liền nhau (tối đa 3)"; cùng một kiểu thẻ 3 cột suốt deck | Xen type khác nhóm (xem `group` trong `layouts_index.json`) | Đổi màu cho "trông khác" |
| L9 | **Loãng điểm nhấn** | "N slide mang khối nền đậm — tối đa M"; > 2 `[ ]` ngoài tiêu đề | Giữ nền đậm cho kết luận / điều đang áp dụng | — |
| L10 | **Thiếu đầy** (underfill) | "phần thân chỉ dùng …, trống ≈ N in"; "thẻ cao … phần dưới trống" | Gộp với slide kề bên, hoặc đổi type gọn hơn (2 câu hỏi → `statement`) | Thêm chữ đệm cho đầy |
| L11 | **Tiêu đề là nhãn** | "tiêu đề là câu hỏi"; tiêu đề lặp ("Mức hưởng" × n); `build.js deck.json --titles` báo "giống nhãn" / "trùng tiêu đề" | Viết câu kết luận; câu hỏi → `kicker` | — |
| L12 | **Ảnh lạc đề** | Ảnh sai quốc gia / đối tượng khi soát `_candidates.jpg`; ảnh dùng ở ≥ 2 slide | Chấm ảnh 0–3 theo brief; < 2 điểm → hình vẽ engine | Lấy ảnh "tạm được" |
| L13 | **Nguyên nhân rời khỏi năm** (nhận xét giảng viên BNK405) | "năm … đổi chiều hoặc âm nhưng không có why"; "một slide nguyên nhân chung cho cả 2016–2025" | `items[].why` ở đúng năm tăng / giảm / chi vượt thu (≤ 70 ký tự, có số hoặc sự kiện); giai đoạn dài → 2 biểu đồ | Một slide "Nguyên nhân" liệt kê chung cho cả giai đoạn |
| L14 | **Lệch phạm vi** | "nhắc "BHYT" — ngoài phạm vi (meta.scopeOut)" | Bỏ nội dung ngoài phạm vi; slide cố ý nêu tổng (bảng đầu tiên) ghi `scopeOk: true` | Giữ vì "cho đủ" |
| L15 | **Hạn chế không có gốc** | "slide hạn chế không có basis"; "basis … không có số liệu nào" | Mỗi hạn chế phải có số liệu ở phần thực trạng trước đó → `basis: [số slide]`; chưa có số thì thêm slide số liệu hoặc bỏ hạn chế | Viết hạn chế chung chung ("thủ tục còn rườm rà") không số |
| L16 | **Kiến nghị không chỉ điều khoản** | "rec.items[i] không chỉ ra điều, khoản" | Nêu đúng điều, khoản đang chưa hợp lý + hướng sửa ("k1 Điều 60 Luật BHXH 2014: …") | "Tăng cường tuyên truyền", "hoàn thiện pháp luật" |
| L17 | **Ý con lạc ý lớn** (build không bắt được — soát bằng mắt) | Đọc `head` / `name` rồi từng ý con: ý con chứng minh được ý lớn không? (vd. "hỗ trợ lao động mất việc" không thuộc "mở rộng diện bao phủ") | Chuyển ý con sang thẻ đúng, hoặc bỏ | — |
