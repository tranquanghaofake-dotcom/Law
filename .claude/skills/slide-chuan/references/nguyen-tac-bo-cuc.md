# Nguyên tắc bố cục sinh động — học CÁCH LÀM, không chép mẫu

Rút ra từ việc xem nhiều mẫu slide khác đề tài (luật, lịch sử, báo cáo kinh doanh, y tế, kỹ năng, thiên tai — kênh TikTok @flashslide.com, xem 11/2026, cùng các mẫu người dùng gửi). Mỗi mẫu một hình thức, nhưng CÙNG bảy nguyên tắc dưới đây. Skill chỉ giữ nguyên tắc và cơ chế; không giữ hình, font, bố cục cụ thể của mẫu nào.

Câu hỏi kiểm tra trước khi thêm bất kỳ thứ gì vào engine: **"Cái này có dùng được cho một đề tài mình chưa từng thấy không?"** Không → đó là chép hình thức, bỏ.

| # | Nguyên tắc | Vì sao hiệu quả | Cơ chế trong engine |
|---|---|---|---|
| 1 | **Một thế giới, nhiều bố cục** — chất liệu (màu trang, kiểu thẻ, kiểu nhãn, đồ vật) giữ nguyên cả deck; bố cục đổi tự do | Người xem nhận ra "đây vẫn là bài đó" dù slide đổi dáng → đổi dáng không gây rối | `meta.da` (`hinh/da.js`): khai báo một lần, phủ lên mọi type — nền, khung, vỏ thẻ, nhãn, ô số, đồ vật, hình lớn, kiểu hiện |
| 2 | **Ba tầng chiều sâu** — nền (vân, quầng màu) → nội dung → tiền cảnh (một vật nhỏ tràn khỏi mép slide) | Slide phẳng thường chỉ thiếu tầng thứ ba; một vật bị khung slide cắt cho cảm giác "thế giới lớn hơn màn hình" | `section` `photoLayout: "backdrop"`: ảnh làm mờ thành nền + lớp màu → chữ ở tầng trên, ảnh là "không khí"; `kitProp()`: một đồ vật mỗi slide nội dung, **chọn theo nội dung slide** (tiêu đề nói quỹ → xu, trích điều luật → con dấu; không khớp → vật chủ đạo của da — `hinh/da.js` `chonVat`), chỉ đặt ở vùng trống chạm mép phải, ~30% tràn ra ngoài; không đủ chỗ → không đặt |
| 3 | **Vắt mép** — phần tử quan trọng nằm trên ranh giới giữa hai vùng (số đè góc thẻ, nhãn đè mép thanh, ảnh tràn khỏi dải) | Mắt dừng ở chỗ hai vùng giao nhau; vừa nối hai vùng vừa tiết kiệm chỗ | ô số `agenda` vắt mép thẻ; đồ vật tiền cảnh của da (`vat`) tràn khỏi mép; nhãn "Ghi nhớ" (`takeaway`) vắt mép dải |
| 4 | **Vật hoá thông tin** — thẻ "là" một vật của thế giới (tờ giấy trong hồ sơ, mẩu giấy dán, tấm kính) | Thông tin có "chỗ ở" cụ thể dễ nhớ hơn hộp trơn | vỏ thẻ của da (`the`: tờ rời, thẻ chấm công, container, cuống vé…) — thông tin "ở" trong vật của môn |
| 5 | **Siêu dữ liệu có hình riêng** — ngày, điều luật, thời hạn, nguồn mang kiểu nhãn khác hẳn văn xuôi | Người xem tách "dữ kiện" khỏi "lời bình" mà không cần đọc — quan trọng với bài luật (căn cứ ≠ nhận định) | kiểu nhãn của da (`nhan`) cho `kicker`; chip căn cứ `src` |
| 6 | **Một điểm nhấn, kết luận ở chỗ cố định** | Người nghe biết nhìn đâu; câu chốt ở cùng một chỗ mọi slide → thành thói quen đọc | `hub`: một tâm, các ý toả ra (icon vắt mép phía tâm); `takeaway` → dải "Ghi nhớ" ở đáy (chỉ ở bố cục dùng hàng chú thích chung); `focus` của các bố cục (có sẵn) |
| 7 | **Nhịp** — dày/thưa, trái/phải, sáng/tối xen nhau; phần tử chung trượt qua slide | Ba slide liền nhau cùng dáng hoặc cùng dày chữ làm người nghe mất tập trung | `validate.js` gợi ý khi 3 slide liền nhau cùng type hoặc cùng > 520 ký tự; Morph giữa slide kề nhau có cùng vật (`hinh/tu_gan.js`, cảnh `hinh/canh.js`) |

## 8. Mỗi chi tiết một lý do (11/2026)
"Kể cả chi tiết nhỏ nhất đặt xuống cũng phải có logic và ý nghĩa" (người dùng, bộ BHXH). Cùng gốc với Robin Williams — *"Nothing should be placed on the page arbitrarily"* — và Tufte — khác biệt nhỏ nhất vẫn đủ thấy (mỗi khác biệt về màu, cỡ, dáng phải nói một điều). Một chi tiết chỉ được giữ khi nói được nó thuộc **một trong bốn loại nghĩa**:
1. **Chở dữ liệu** — đếm được, đo được (1 cuốn sổ = 1 triệu người, 1 ô = 1 năm đóng, chiều dài thanh = tỷ lệ).
2. **Điều hướng** — người xem đang ở đâu, đi tiếp đâu (dải đầu, thanh tiến độ có khe ngăn phần, số phần, nút bấm).
3. **Nhận diện** — đề tài / phần đang nói (vật của thế giới môn, ảnh của phần, hoa văn lấy đúng từ vật thật của môn — không "hoạ tiết chung").
4. **Phân loại** — một mã cố định cả deck (đỏ = tiêu cực thật, xám nét đứt = hết hiệu lực / khác phạm vi, mỗi phần một màu).

Luật đi kèm:
- **Mã màu không được nói dối**: đỏ chỉ cho điều tiêu cực (năm giảm, mất, nợ); một chấm chú thích mang màu của chiều thay đổi nó chú thích; không gán đỏ cho cả một phần chỉ để "đủ ba màu".
- **Không lặp một vật hai lần trên cùng slide**: vật vẽ đặt cạnh ảnh đã có vật thật đó, hai biểu tượng giống nhau, cùng một con số hai đơn vị.
- **Vị trí suy ra được**: mỗi thứ canh theo lưới lề hoặc theo vật nó thuộc về (dải đánh dấu mọc từ mép trang sổ, chú thích cùng hàng với năm nó giải thích); không có toạ độ "đặt cho đẹp".
- **Thẳng theo NÉT chữ, không theo hộp chữ**: chữ trưng bày ≥ 48 px tự **căn lề quang học** (`hinh/hinh.js`: dịch trái đúng khoảng trống trước nét của chữ đầu — Anton "N" 186 px trống 7 px) → nét tiêu đề thẳng với dòng chữ nhỏ; đừng bù tay bằng toạ độ (100, 96…), sẽ bị bù hai lần. Lề trong của nhãn = lề trong của thẻ (24 px) để chữ chung cột. `scripts/soat_chi_tiet.js` (tự chạy trong `--soat`) báo chỗ lệch 4–10 px.
- **Ngắt dòng tại nghĩa**: công thức xuống dòng tại dấu "=", nhãn điều luật một dòng ("Đ.40, 41"), không để trình duyệt tự ngắt giữa một cụm. Mọi slide có `text-wrap: pretty` (`hinh/hinh.css`): trình duyệt tự né dòng cuối một chữ, `build.js` chép đúng chỗ xuống dòng sang PPTX. Chữ trưng bày ≥ 40 px tự giữ liền ~90 từ ghép thường gặp trong bài luật ("hệ thống", "lao động", "bảo hiểm", "hợp đồng"… — danh sách `TU_GHEP` trong `hinh/hinh.js`); từ ghép ngoài danh sách thì đọc lại tiêu đề hai dòng, ngắt sai thì ghi `\n` (xuống dòng chủ ý) hoặc `\u00a0` (dấu cách không ngắt: `"hệ\u00a0thống"`) trong chuỗi, hoặc sửa câu.
- **Thứ tự xuất hiện theo logic**: thẻ căn cứ của luật mới chỉ hiện ở bước "luật mới"; số ô năm khớp con số trong tình huống.
- Cách soát: lập bảng `chi tiết → nghĩa → luật` cho bộ hình (mẫu: `references/canh.md` mục 10); chi tiết nào không điền được cột "nghĩa" thì bỏ hoặc đổi thành chi tiết mang nghĩa (bong bóng trang trí → vân bảo an đúng của bìa sổ BHXH).

Hai quy tắc phụ rút ra khi làm slide `quote`:
- **Chữ là hình**: khi câu chữ là nhân vật chính (trích dẫn, khẩu hiệu), phóng một ký tự của nó (dấu ngoặc kép) thành hình nền rất nhạt, BÁM vào khối chữ — không bám góc slide (sẽ đè nhãn).
- **Chỗ ảnh bị cắt phải trùng mép slide**: ảnh tách nền mà chủ thể chạm mép ảnh (cổ tay, thân người, chân tượng) → đặt mép đó sát mép slide (lật ngang nếu cần) để chủ thể "đi vào" từ ngoài khung; đặt lơ lửng giữa slide trông như bị cụt. Engine đọc kênh alpha 4 mép ảnh để biết (`cutEdges`).

## Không học (lỗi lặp lại ở nhiều mẫu)
- Chữ thân 9–11 pt khi chiếu — skill giữ sàn 15–16 pt cho thân, 13 pt cho chú thích.
- Đồ vật dày đặc (3–4 món một slide) — tối đa MỘT đồ vật tiền cảnh + MỘT vật đánh dấu thẻ chính.
- Ảnh do AI tạo (người, đồ vật 3D) — skill chỉ dùng ảnh thật có giấy phép và hình vẽ bằng code.
- Font viết tay / font trang trí không nhúng được vào .pptx — vỡ dấu tiếng Việt trên máy khác.
- **Trích dẫn sai người nói** (một mẫu ghi câu "Law is the expression of the general will" là của Aristotle — thực ra của Rousseau). Hình đẹp không bù được sai nội dung: trích dẫn luôn phải có `by` và nguồn kiểm được.

## Chọn da và thêm da mới
Bảng da và cách chọn: SKILL.md mục "Da theo môn". Thêm da cho môn chưa có (vd. "y tế", "môi trường"): `references/the-gioi-hinh-anh.md` mục "Thêm da mới" — hỏi trước "thế giới của đề tài có những VẬT gì người nghe nhận ra ngay?", vẽ 2–3 vật bằng SVG thuần trong `hinh/do_vat.js` (phẳng + bóng đổ, không ảnh, không chữ), rồi khai báo một khối trong `hinh/da.js`. Không sửa bố cục nào. Da đổi **hình**, không đổi **chữ**.
