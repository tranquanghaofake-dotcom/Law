# Nguyên tắc bố cục sinh động — học CÁCH LÀM, không chép mẫu

Rút ra từ việc xem nhiều mẫu slide khác đề tài (luật, lịch sử, báo cáo kinh doanh, y tế, kỹ năng, thiên tai — kênh TikTok @flashslide.com, xem 11/2026, cùng các mẫu người dùng gửi). Mỗi mẫu một hình thức, nhưng CÙNG bảy nguyên tắc dưới đây. Skill chỉ giữ nguyên tắc và cơ chế; không giữ hình, font, bố cục cụ thể của mẫu nào.

Câu hỏi kiểm tra trước khi thêm bất kỳ thứ gì vào engine: **"Cái này có dùng được cho một đề tài mình chưa từng thấy không?"** Không → đó là chép hình thức, bỏ.

| # | Nguyên tắc | Vì sao hiệu quả | Cơ chế trong engine |
|---|---|---|---|
| 1 | **Một thế giới, nhiều bố cục** — chất liệu (màu trang, kiểu thẻ, kiểu nhãn, đồ vật) giữ nguyên cả deck; bố cục đổi tự do | Người xem nhận ra "đây vẫn là bài đó" dù slide đổi dáng → đổi dáng không gây rối | `meta.kit` (engine/kits.js): khai báo một lần, áp qua các hàm chung `box()` (thẻ), `kicker()` (nhãn đầu slide), `chip()` (nhãn ngày / thời hạn), `num()` (ô số), `decor()` (trang) → mọi bố cục tự đổi |
| 2 | **Ba tầng chiều sâu** — nền (vân, quầng màu) → nội dung → tiền cảnh (một vật nhỏ tràn khỏi mép slide) | Slide phẳng thường chỉ thiếu tầng thứ ba; một vật bị khung slide cắt cho cảm giác "thế giới lớn hơn màn hình" | `section` `photoLayout: "backdrop"`: ảnh làm mờ thành nền + lớp màu → chữ ở tầng trên, ảnh là "không khí"; `kitProp()`: một đồ vật mỗi slide nội dung, chỉ đặt ở vùng trống chạm mép phải, ~30% tràn ra ngoài; không đủ chỗ → không đặt |
| 3 | **Vắt mép** — phần tử quan trọng nằm trên ranh giới giữa hai vùng (số đè góc thẻ, nhãn đè mép thanh, ảnh tràn khỏi dải) | Mắt dừng ở chỗ hai vùng giao nhau; vừa nối hai vùng vừa tiết kiệm chỗ | ô số `agenda` vắt mép trái thẻ; vật đánh dấu thẻ chính (`kitMark`) vắt mép trên; nhãn "Ghi nhớ" vắt mép trái dải kết luận; icon `cards` vắt mép trên (có sẵn) |
| 4 | **Vật hoá thông tin** — thẻ "là" một vật của thế giới (tờ giấy trong hồ sơ, mẩu giấy dán, tấm kính) | Thông tin có "chỗ ở" cụ thể dễ nhớ hơn hộp trơn | thẻ chính của slide (thẻ sáng lớn nhất) được thêm tờ lệch phía sau / kẹp giấy / băng dính / viên kính — CHỈ một thẻ mỗi slide; `pin`: câu / số chính trên tờ giấy ghim, tự tìm chỗ trống, không đủ chỗ thì báo |
| 5 | **Siêu dữ liệu có hình riêng** — ngày, điều luật, thời hạn, nguồn mang kiểu nhãn khác hẳn văn xuôi | Người xem tách "dữ kiện" khỏi "lời bình" mà không cần đọc — quan trọng với bài luật (căn cứ ≠ nhận định) | `kit.tag`: tab hồ sơ / ruy băng / viên thuốc cho `kicker` và `chip` |
| 6 | **Một điểm nhấn, kết luận ở chỗ cố định** | Người nghe biết nhìn đâu; câu chốt ở cùng một chỗ mọi slide → thành thói quen đọc | `hub`: một tâm, các ý toả ra (icon vắt mép phía tâm); `takeaway` → dải "Ghi nhớ" ở đáy (chỉ ở bố cục dùng hàng chú thích chung); `focus` của các bố cục (có sẵn) |
| 7 | **Nhịp** — dày/thưa, trái/phải, sáng/tối xen nhau; phần tử chung trượt qua slide | Ba slide liền nhau cùng dáng hoặc cùng dày chữ làm người nghe mất tập trung | `validate.js` gợi ý khi 3 slide liền nhau cùng type hoặc cùng > 520 ký tự; `--transition morph` (có sẵn); `meta.thread`: Morph trong cùng chương, fade ở ranh giới chương — chuyển động nói cho người nghe biết "vẫn ý đó" hay "sang ý mới" |

Hai quy tắc phụ rút ra khi làm slide `quote`:
- **Chữ là hình**: khi câu chữ là nhân vật chính (trích dẫn, khẩu hiệu), phóng một ký tự của nó (dấu ngoặc kép) thành hình nền rất nhạt, BÁM vào khối chữ — không bám góc slide (sẽ đè nhãn).
- **Chỗ ảnh bị cắt phải trùng mép slide**: ảnh tách nền mà chủ thể chạm mép ảnh (cổ tay, thân người, chân tượng) → đặt mép đó sát mép slide (lật ngang nếu cần) để chủ thể "đi vào" từ ngoài khung; đặt lơ lửng giữa slide trông như bị cụt. Engine đọc kênh alpha 4 mép ảnh để biết (`cutEdges`).

## Không học (lỗi lặp lại ở nhiều mẫu)
- Chữ thân 9–11 pt khi chiếu — skill giữ sàn 15–16 pt cho thân, 13 pt cho chú thích.
- Đồ vật dày đặc (3–4 món một slide) — tối đa MỘT đồ vật tiền cảnh + MỘT vật đánh dấu thẻ chính.
- Ảnh do AI tạo (người, đồ vật 3D) — skill chỉ dùng ảnh thật có giấy phép và hình vẽ bằng code.
- Font viết tay / font trang trí không nhúng được vào .pptx — vỡ dấu tiếng Việt trên máy khác.
- **Trích dẫn sai người nói** (một mẫu ghi câu "Law is the expression of the general will" là của Aristotle — thực ra của Rousseau). Hình đẹp không bù được sai nội dung: trích dẫn luôn phải có `by` và nguồn kiểm được.

## Chọn bộ chất liệu
| Bộ | Thế giới | Hợp với | Trang | Nhãn | Ô số | Đồ vật |
|---|---|---|---|---|---|---|
| `file` | hồ sơ giấy tờ | bình luận bản án, vụ việc, pháp chế (`kind: case`) | giấy bìa hồ sơ ngả vàng | tab hồ sơ | vuông (như dấu) | kẹp giấy, bút máy, kính lúp |
| `paper` | sổ tay, giấy kẻ dòng | bài giảng, tiểu luận (`kind: lecture`) | trắng, kẻ dòng mờ + lề | ruy băng | tròn | bút chì, thước, đinh ghim |
| `glass` | kính trong, quầng màu | báo cáo, số liệu (`kind: report`) | sắc nhạt của màu nhấn | viên thuốc | tròn | viên kính, vòng kính |
| `none` | giao diện gốc | khi cần slide tối giản tuyệt đối | | | | |

Mặc định `auto`: chọn theo `meta.kind`. Bộ chất liệu đổi **hình**, không đổi **chữ** (test `tests/bo_chat_lieu.test.js` kiểm điều này).

## Thêm một bộ mới (vd. "y tế", "xây dựng")
1. Hỏi: thế giới của đề tài có những VẬT gì người nghe nhận ra ngay? (y tế: phiếu khám, băng dính y tế; xây dựng: bản vẽ, thước dây).
2. Vẽ 2–3 vật đó bằng SVG thuần trong `PROPS` (phẳng + bóng đổ, không ảnh, không chữ).
3. Khai báo một khối trong `KITS`: `card`, `mark`, `tag`, `num`, `page`, `bg`, `props`. Không sửa bố cục nào.
4. Thêm tên vào enum `meta.kit` ở `engine/validate.js`; chạy `tests/bo_chat_lieu.test.js` (thêm bộ mới vào vòng lặp nếu cần).
