# Nguồn hình theo vai — đạt độ hoàn thiện của mẫu chuyên nghiệp mà không dùng AI

Vì sao (nghiên cứu 15/11/2026, spec mục 13): mẫu bán slide đẹp nhờ (1) **một hình chính lớn** (30–45 % slide, 2–4 phần tử), (2) **hình do hoạ sĩ vẽ** hoặc ảnh thật, (3) **chữ tương phản** (chữ có chân lớn + chữ không chân), (4) mảng màu lớn. SVG ghép khối bằng code chỉ đạt hình khối đơn giản — không dùng làm hình chính nữa.

## Nguồn minh hoạ chính: Storyset (Hào duyệt 18/11/2026)
Minh hoạ trong mẫu Slidesgo do hoạ sĩ Freepik vẽ (Storyset: kiểu Rafiki, Bro, Amico, Pana, Cuate). Tự vẽ bằng khối SVG không bao giờ đạt chất lượng đó — đây là nguyên nhân gốc của các bản "hổ lốn" (bài Nhóm 2).
- `python3 scripts/storyset.py tim <ra> <từ khoá> [--kieu=rafiki]` → bảng xem thử đánh số; `tai <slug/kiểu> <ra.svg> --mau=#hex --bo-nen` → tô lại màu nhấn (mỗi hình chỉ một màu nhấn) và xoá nền phòng mờ.
- **Một deck = một kiểu + một màu nhấn.** Giấy phép: miễn phí, **bắt buộc ghi công** "Illustrations by Storyset" + link (slide cuối, `ghi-cong.md`); giới hạn lượt tải mỗi ngày.
- **Không có hình đúng ý** → (1) hình gần nghĩa cùng kiểu (gian lận → cảnh báo, bảo mật); (2) tách một vật khỏi cảnh (SVG: giữ nhóm cần dùng); (3) để số liệu làm hình (biểu đồ, số lớn); (4) slide chữ lớn. **Không** tự vẽ, không trộn ảnh chụp hay thư viện khác.
- Thẻ phong cách khai `"mienBangMau": ["anh/storyset/"]` (màu trung tính / màu da gốc của hoạ sĩ không bị bắt lỗi).

## Quy tắc 0 — hình chính phải là vật thật của CHÍNH bài này (bài Nhóm 2, 18/11/2026)
Hào: "ảnh bìa và các vật thể chưa thật sự liên quan đến bài, còn chung chung". Bàn tay nâng nhà mô hình, toà cao tầng, bàn tay ký giấy, hợp đồng vẽ phẳng, người hoạt hình — đặt vào bài bảo hiểm nào cũng được, nên không chứng minh gì.
**Phép thử**: đổi tên bài sang một đề tài cùng ngành → hình còn dùng được nguyên? Còn → chung chung → thay.
Thứ tự chọn hình chính:
1. **Sự vật đúng chủ đề**: ảnh thật của chính thứ đang nói (phòng bệnh cho bảo hiểm sức khoẻ, quầy giao dịch cho bán qua ngân hàng, lũ lụt cho bão Yagi) — cùng một cách cắt khung, cùng màu nhấn.
1b. **Chính tài liệu của bài** khi cần trích nguyên văn: trang hợp đồng / bản án / văn bản luật / bảng gốc — chụp hoặc cắt đúng vùng bằng `node scripts/trang_goc.js <tài liệu> <ra.png> --trang=N --vung=x,y,w,h`, rồi **khoanh / gạch chân bằng HTML đè lên** đúng điều khoản đang nói. Ảnh trang chỉ có tác dụng khi người xem thấy được chỗ được khoanh và nhãn giải thích bên cạnh (Hào: "có nhưng phải có tác dụng") — trang nguyên cỡ nhỏ chữ không đọc được thì phải cắt vùng và phóng.
2. **Số liệu của bài vẽ thành biểu đồ / thước đúng tỉ lệ** (`trinh-bay-du-lieu.md`).
3. **Ảnh sự vật / sự kiện / nơi chốn cụ thể** đúng cái đang nói (quầy giao dịch ngân hàng khi nói bancassurance, bão Yagi khi nói bồi thường thiên tai) — có nguồn, giấy phép.
4. **Sơ đồ quan hệ** bằng nét, khi ý là quan hệ giữa các bên.
Không dùng: ảnh "tâm trạng" chung chung làm hình chính; **asset, ảnh, vật vẽ lấy từ bài khác** (mỗi bài vẽ / chọn hình của riêng nó); icon làm hình chính.

**Chọn một họ hình chính cho cả deck** (`bo-cuc.md` mục 1): ảnh tư liệu + nét, **hoặc** minh hoạ CC0 + nét — không trộn ảnh tư liệu với nhân vật hoạt hình trong cùng deck.

| Vai của hình | Nguồn | Công cụ | Ghi công |
|---|---|---|---|
| Lịch sử, bối cảnh, ví dụ thực tế (nhà cháy, tai nạn, toà án, văn bản cổ) | ảnh / tranh tư liệu **phạm vi công cộng** (Wikimedia Commons), ảnh CC0 / Unsplash / Pexels | `scripts/find_images.py`, `fetch_image.py` → `scripts/hai_mau.js` (tô hai màu theo bảng màu) | TASL trong `ghi-cong.md`, chú thích nhỏ trên slide nếu là tư liệu |
| Con người, các bên, tình huống | **Open Peeps** (Pablo Stanley, CC0): 23 dáng đứng, 11 dáng ngồi, 53 tóc, 33 nét mặt | `node scripts/nhan_vat.js <ra.svg> --dang= --toc= --mat= --da= --ao= --quan=` (`--ds` để xem danh sách) | không bắt buộc; nên ghi "Open Peeps — CC0" |
| Danh sách, bước, thuộc tính, mục lục | **Tabler Icons** (MIT), một độ dày nét cho cả deck | `node scripts/icon.js <bài> tên… --mau= --net=1.5` (`--tim=từ`) | "Tabler Icons, MIT" |
| Số liệu, tỉ lệ, quan hệ, quy trình | dựng bằng code (SVG / `hinh/bang.css`) — phải đúng tỉ lệ thật | — | — |
| Câu chốt, định nghĩa, trích luật | **chữ là hình**: chữ có chân `Lora` cỡ 56–80 px, số lớn 200–340 px | CSS `font-family: Lora` | — |

## Quy tắc
1. **Mỗi slide một tiêu điểm** (máy chỉ cảnh báo): hình chính hoặc số lớn chiếm 30–45 % diện tích — **không** đạt bằng cách thêm panel / thẻ nền; 2–4 phần tử thị giác; tỉ lệ phần tử lớn nhất / nhỏ nhất ≥ 8 lần. Không rải 8–12 vật nhỏ đều khắp slide.
   Giới hạn của máy đo (`◇ tiêu điểm`): một tấm nền / thẻ lớn cũng được tính là khối thị giác, kể cả khi vật bên trong nhỏ — tấm nền **gom** bố cục chứ **không thay** hình chính; phải nhìn ảnh để chắc hình chính đủ lớn.
2. **Nhìn slide là nắm toàn bộ ý**: nhãn đặt lên hình (tên bên, tên dòng tiền), ý cốt lõi viết thành cụm ngắn cạnh hình — hình chở nội dung, không thay nội dung.
3. **Đồng bộ**: nhân vật Open Peeps cùng màu viền (màu mực của bài), quần áo theo màu vai trò; ảnh cùng một cặp màu hai tông; icon cùng một độ dày, một màu.
4. **Không trộn** nhân vật Open Peeps với hình người kiểu khác trong cùng deck; icon Tabler không trộn bộ icon khác.
5. Ảnh: chỉ ảnh có giấy phép rõ; chữ không đặt lên phần ảnh rối (đặt cạnh hoặc trên mảng màu phẳng).
6. Tài nguyên tải về bộ nhớ đệm (`~/.cache/slide-chuan`, lần đầu cần mạng npm) — không chép vào skill.

## Ảnh chụp hiện đại (Unsplash) và minh hoạ unDraw — hướng "tư vấn pháp lý", Chương 3 (15/11/2026)
> Hạ cấp 18/11/2026: chỉ dùng khi ảnh **đúng sự vật** theo quy tắc 0 — không dùng ảnh tâm trạng cho bìa / mở phần / câu chốt.

Hai nguồn này nâng trần chất lượng rõ nhất ("wow"): ảnh chụp thật sắc nét cho bìa / mở phần / trích luật; minh hoạ do hoạ sĩ vẽ cho người và tình huống. Cả hai **không phải ảnh AI**, giấy phép cho dùng tự do, không bắt ghi công — vẫn ghi đủ trong `ghi-cong.md`. Phải được chủ bài duyệt (CLAUDE.md).
- **Unsplash**: `unsplash.com` có lớp chặn máy và API cần khoá. Cách làm: Firecrawl `firecrawl_scrape` trang `https://unsplash.com/s/photos/<từ-khoá>?license=free` (formats `links`) → chọn ảnh; scrape trang ảnh (formats `images`) → lấy `images.unsplash.com/photo-<số>-<mã>` từ `og:image` → `curl "https://images.unsplash.com/photo-…?fm=jpg&q=85&w=2400"`. Chỉ dùng ảnh trang ghi "Free Photo" (không Unsplash+).
- **Xử lý ảnh**: `node scripts/phu_mau.js <vào> <ra> --rong= --cao= --tieu=x,y [--tu=trai|phai|duoi|tren --dac= --den=] [--cheo=0.2]` — cắt theo điểm nhìn, phủ dải màu chủ để đặt chữ lên ảnh, hoặc cắt chéo mép trái (PNG trong suốt) cho bố cục tạp chí; dải màu nhấn chạy theo mép chéo.
- **unDraw**: tìm `curl "https://undraw.co/api/search?q=<từ>"` → dùng trường `media` (đường dẫn `cdn.undraw.co/illustration/…` hoặc `…/illustrations/…`; dựng lại đường dẫn từ `newSlug` có thể ra trang lỗi 27 KB). Lưu vào `asset/undraw/` của bài; tô lại theo bảng màu bằng bảng ánh xạ màu (màu nhấn #6c63ff → màu chủ, xám đậm → mực, xám nhạt → kẻ / màu nhạt, da → da) — xem `minh-hoa.js` của bài Chương 3 (`unDraw()`), lồng vào lớp hình bằng `<svg>` con, khai `data-loai="undraw"`.
- **Phân vai trong một deck**: ảnh chụp cho bìa, mở phần, trích luật, câu chốt (cảm xúc, bối cảnh); unDraw cho người và tình huống (bên mua, giao kết, câu hỏi); vật phẳng tự vẽ + khối tô đặc cho sơ đồ, số liệu. Cùng bảng màu → không hổ lốn.

