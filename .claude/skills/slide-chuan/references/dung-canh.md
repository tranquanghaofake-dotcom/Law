# Dựng slide như dựng cảnh (quy ước bắt buộc — 11/2026)

Nguồn gốc: deck BNK405 Chương 3 (Bảo hiểm thương mại) bị chê 8 lượt liền. Ba lỗi gốc, đừng lặp lại:
1. Lấy hình từ kho có sẵn (Fluent 3D) → "quá xấu". **Luôn tự vẽ** (SVG, `hinh/ve_bh.js`, `hinh/canh_phim.js`).
2. Vẽ vật rời rồi **xếp thành hàng**, mỗi vật một màu, đặt góc slide như hình dán → "cứng nhắc".
3. Vẽ được một cảnh đẹp rồi **cắt khung, dán vào ô ảnh** của bố cục (split, poster) → "máy móc, vất ảnh vào slide".

Điều người dùng muốn: **phương pháp dựng cảnh áp lên chính slide**. Slide là một khung hình: chữ, sơ đồ, số liệu là các LỚP nằm trong cảnh, gắn với vật / nhân vật của cảnh — không phải "khung chữ" đặt cạnh "khung ảnh".

## 6 nguyên tắc dựng cảnh (học từ minh hoạ kiểu Kurzgesagt, minh hoạ doanh nghiệp, Duarte)
| # | Nguyên tắc | Ở mức HÌNH | Ở mức SLIDE (bắt buộc) |
|---|---|---|---|
| 1 | Một nguồn sáng nhuộm mọi màu (color script) | mọi màu vật đi qua `den()` / `toi()` | mỗi PHẦN một khung giờ / một ánh sáng; nền, thẻ, chữ nhấn của slide cũng nhuốm ánh đó (không thẻ trắng tinh trên trời hoàng hôn) |
| 2 | 3–4 tầng độ sáng | hậu cảnh nhạt · trung cảnh chi tiết · tiền cảnh tối | nền slide = hậu cảnh (tương phản thấp) · nội dung = trung cảnh · khối tối đóng khung góc dưới = tiền cảnh; chữ không bao giờ nằm ở tầng tiền cảnh |
| 3 | Tỉ lệ thật, một vật trội | người tí hon, toà nhà là tiêu điểm | mỗi slide MỘT tiêu điểm lớn (câu kết luận / vật chính / con số); các ý phụ nhỏ hẳn — không lưới thẻ đều nhau khi ý không ngang hàng |
| 4 | Góc máy + đường dẫn mắt | con phố chéo dẫn về toà nhà | bố cục đi theo đường dẫn: mũi tên, con đường, dòng người dẫn từ tiêu đề → ý → kết luận; đặt kết luận ở điểm tụ |
| 5 | Chồng lấn, mật độ chi tiết nhỏ | vật che nhau, đèn, chim, ánh nước | nội dung CHẠM vào cảnh: nhãn chữ đặt cạnh đúng vật nó nói tới, thẻ đè lên mép vật, vật thò ra khỏi thẻ |
| 6 | Câu chuyện | giông tới, khiên che | mạch slide = mạch cảnh: cùng thế giới, cùng nhân vật, đổi góc máy (Morph, `cam`) — tình huống → biến cố → giải quyết |

## Quy trình (thay cho "vẽ hình rồi chọn ô ảnh")
1. **Bảng phân cảnh (shot list)** trong `prep.json → plan`: mỗi slide ghi thêm `shot` = góc máy (toàn · trung · cận), tiêu điểm, ánh sáng.
2. **Color script** cho cả deck: mỗi phần một ánh sáng (`phong.gio`: sang · trua · chieu · giong · hoang-hon · dem).
3. **Bản đồ lớp từng slide** trước khi viết JSON:
   `nền (phong)` → `hậu cảnh` → `trung cảnh: diễn viên (dien) + nội dung` → `tiền cảnh (tienCanh)`; ghi tiêu điểm và đường dẫn mắt.
4. **Gắn nội dung vào cảnh**: nhãn của diễn viên (`dien[].nhan` — hộp chữ thật, sửa được), đường nối giữa diễn viên (`noi` — mũi tên có nhãn), số liệu đặt trên vật mang nó.
5. **Kiểm bằng mắt** theo danh sách dưới; không đạt thì sửa bản đồ lớp, không thêm vật.

## Danh sách kiểm (mỗi slide có cảnh — trả lời "có" hết mới giao)
- [ ] Che chữ đi vẫn thấy một CẢNH, không thấy "khung ảnh + khung chữ".
- [ ] Chỉ ra được tiêu điểm trong 1 giây, và đường dẫn mắt tới nó.
- [ ] Mọi nhãn chữ nằm cạnh đúng vật nó gọi tên; không có chú thích "trôi" xa vật.
- [ ] Có ít nhất 3 tầng độ sáng; chữ nằm trên tầng nền / trung cảnh sáng, đủ tương phản (soat_chi_tiet.js).
- [ ] Màu thẻ / chữ nhấn cùng ánh sáng với cảnh của phần.
- [ ] Không vật nào đứng một mình kiểu hình dán; không hàng vật đều nhau.
- [ ] Slide kề nhau cùng thế giới: diễn viên cùng tên Morph, đổi góc máy có lý do.

## Cấm (đã bị chê)
- Dán cảnh vào `photo` của `split` / `cover poster` / `end poster` rồi coi là xong.
- Vật đặt góc slide không gắn nội dung (`da-vat` chỉ là phương án cuối cho slide thuần dữ liệu).
- Kho hình dán / 3D có sẵn làm hình chính.
- Diễn viên cùng cỡ với toà nhà; xếp vật thành hàng ngang; mỗi vật một bảng màu riêng.

## Công cụ trong skill
- `hinh/ve_bh.js`: vật tự vẽ (`ve:<tên>`), phông nền theo giờ `phong(P, gio)`.
- `hinh/canh_phim.js`: cảnh dựng chuẩn (`bia(P, gio)`), `cat()` — chỉ để làm ảnh nền tham chiếu, KHÔNG để dán vào ô ảnh.
- `hinh/dung.js` → `dungPhim`: trường `phong`, `dien` (`ve`, `x`, `y`, `w`, `m` tên Morph, `nhan` nhãn chữ thật gắn vật, `lat`), `noi` (mũi tên nối diễn viên có nhãn), `tienCanh` (khối tối đóng khung), `cam` (máy quay).

## Biểu đồ cách điệu (`bieuDo`, `hinh/bieu_do_ve.js`) — 11/2026
Số liệu và quan hệ định lượng mang **hình của chính vật trong câu chuyện**, vẽ **đúng tỉ lệ**; nhãn số là chữ thật. Không phải "biểu đồ cột + tranh minh hoạ đặt cạnh".
| Nội dung | Kiểu | Vì sao hợp |
|---|---|---|
| Chia theo tỷ lệ % (tái BH số thành 35 / 65) | `o-ty-le`: tán ô = biểu đồ tròn, góc ∝ % | ô che rủi ro được chia cho các bên |
| Đơn vị lặp, bội số (mức dôi: 1 lần + 15 lần + 20 lần) | `thap-tang`: mỗi tầng = một đơn vị, nhóm tầng cùng màu | "lần" (line) đếm được bằng mắt |
| So hai đại lượng cùng thang (STBH với GTBH, 4 trường hợp) | `nha-khien`: nhà cao = GTBH, khiên cao = STBH, nhiều khiên chồng = BH trùng | so chiều cao trên một thang chung |
Luật: (1) tỉ lệ hình = tỉ lệ số liệu, một thang chung cho cả biểu đồ; (2) mỗi vật chở đúng một đại lượng, nói rõ trong phụ đề ("nhà cao = GTBH"); (3) không thêm vật trang trí cạnh biểu đồ; (4) số liệu phải có trong tài liệu gốc — không tự suy ra đáp số bài tập.
Thêm kiểu mới: một hàm trong `KIEU` trả `{ svg, nhan }`, cùng phong cách `ve_bh.js`, kèm test.
