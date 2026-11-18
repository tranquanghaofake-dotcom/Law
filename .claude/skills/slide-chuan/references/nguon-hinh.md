# Nguồn hình theo vai — đạt độ hoàn thiện của mẫu chuyên nghiệp mà không dùng AI

Vì sao (nghiên cứu 15/11/2026, spec mục 13): mẫu bán slide đẹp nhờ (1) **một hình chính lớn** (30–45 % slide, 2–4 phần tử), (2) **hình do hoạ sĩ vẽ** hoặc ảnh thật, (3) **chữ tương phản** (chữ có chân lớn + chữ không chân), (4) mảng màu lớn. SVG ghép khối bằng code chỉ đạt hình khối đơn giản — không dùng làm hình chính nữa.

## Nguồn minh hoạ chính: Storyset (Hào duyệt 18/11/2026)
Minh hoạ trong mẫu Slidesgo do hoạ sĩ Freepik vẽ (Storyset: kiểu Rafiki, Bro, Amico, Pana, Cuate). Tự vẽ bằng khối SVG không bao giờ đạt chất lượng đó — đây là nguyên nhân gốc của các bản "hổ lốn" (bài Nhóm 2).
- `python3 scripts/storyset.py tim <ra> <từ khoá> [--kieu=rafiki]` → bảng xem thử đánh số; `tai <slug/kiểu> <ra.svg> --mau=#hex --bo-nen` → tô lại màu nhấn (mỗi hình chỉ một màu nhấn) và xoá nền phòng mờ.
- **Một deck = một kiểu + một màu nhấn.** Giấy phép: miễn phí, **bắt buộc ghi công** "Illustrations by Storyset" + link (slide cuối, `ghi-cong.md`); giới hạn lượt tải mỗi ngày.
- **Không có hình đúng ý** → (1) hình gần nghĩa cùng kiểu (gian lận → cảnh báo, bảo mật); (2) tách một vật khỏi cảnh (SVG: giữ nhóm cần dùng); (3) để số liệu làm hình (biểu đồ, số lớn); (4) slide chữ lớn. **Không** tự vẽ, không trộn ảnh chụp hay thư viện khác.
- Thẻ phong cách khai `"mienBangMau": ["anh/storyset/"]` (màu trung tính / màu da gốc của hoạ sĩ không bị bắt lỗi).

## Bộ công cụ hình (5 lượt nghiên cứu, bài Nhóm 2, 18/11/2026) — dùng chung, phối theo một ngôn ngữ
| Công cụ | Dùng khi | Quy tắc phối |
|---|---|---|
| `scripts/ghep_canh.js` — tách nhân vật / đồ vật khỏi SVG Storyset (nhóm có tên), ghép cảnh riêng | Cảnh có sẵn không đúng ý (gia đình bố–mẹ–con, quầy ngân hàng ép mua bảo hiểm) · cần nhân vật đứng riêng làm "nút" sơ đồ | Chỉ ghép mảnh **cùng một kiểu** (cùng Rafiki, cùng màu nhấn đã tô). Biển hiệu, chữ tiếng Anh trong cảnh → che bằng mảnh tự vẽ (`{"svg": …}`) |
| `scripts/danh_dau.js` — cắt đúng đoạn văn bản thật chứa cụm từ + toạ độ vệt dạ quang (pdftotext -bbox) | Trích hợp đồng, luật, bản án: **thay chữ chép lại** bằng ảnh nguyên văn đặt trên tờ giấy | Vệt dạ quang màu nhấn nóng (cam) mờ 0,38, quét (wipe) theo nhịp nói; ≤ 4 cụm / đoạn. Chép đúng chính tả tài liệu ("hủy" ≠ "huỷ") |
| `scripts/icon_duo.js` — icon hai tông Phosphor (MIT) | Mọi icon trong vòng tròn, nút sơ đồ, dòng gạch | Nét chính màu mực, mảng phụ = màu nhấn hợp nền tròn (nền xanh nhạt → xanh, nền cam nhạt → cam, nền cam → trắng). Không trộn với icon nét mảnh trong một deck |
| `scripts/blob.js` — mảng nền hữu cơ (cách của thư viện blobs, MIT) | Sau mọi minh hoạ / cảnh ghép đặt trên nền trắng của slide nội dung | Một màu nhạt duy nhất cho cả deck; không dùng ở bìa / mở phần đã có dải nền |
| `scripts/ve_tay.js` — nét khoanh / gạch chân vẽ tay (cách Rough.js, MIT) | Chỗ mắt cần dừng: con số hoặc khoảng trống là ý chính slide | **Tối đa một nét / slide**, cùng màu với vệt dạ quang (một "ngôn ngữ bút dạ"), vào sau cùng, nằm dưới chữ, không cắt chữ phụ |
| `scripts/hinh_dem.js` — biểu đồ hình đếm (isotype) | Tỉ lệ khó hình dung ("giảm 43,8 %") → "cứ 10 … còn 5,6" | Một hàng / slide, icon có mảng màu lớn (người, nhà, xe), luôn kèm câu "cứ 10 … thì …" |

**Đã thử và loại:** bản đồ (GeoJSON + d3-geo) cho slide bão Yagi — không trả lời câu hỏi của slide (bồi thường nhanh đến đâu), nguồn dữ liệu giấy phép chưa rõ; **bản đồ Việt Nam toàn quốc bắt buộc thể hiện Hoàng Sa, Trường Sa** — chỉ dùng bản đồ khi "ở đâu" là ý chính và có nguồn giấy phép rõ. Biểu đồ gốc PowerPoint — chỉ tiện sửa số, dấu thập phân đổi theo máy (133.7 / 133,7), không làm slide đẹp hơn (Hào chọn bỏ).

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

**Chọn một họ hình chính cho cả deck** (`bo-cuc.md` mục 1); mặc định là bộ công cụ ở mục trên. Họ khác dùng khi deck chọn phong cách đó, không trộn hai họ người / hai bộ icon trong một deck:

| Vai của hình | Mặc định | Họ thay thế |
|---|---|---|
| Người, các bên, tình huống | Storyset + `ghep_canh.js` | Open Peeps CC0 (`scripts/nhan_vat.js`) |
| Văn bản, điều khoản, trích luật | ảnh nguyên văn + dạ quang (`danh_dau.js`); chữ có chân `Lora` cho câu chốt | `trang_goc.js` cắt trang |
| Danh sách, bước, nút sơ đồ | icon hai tông Phosphor (`icon_duo.js`) | Tabler nét (`scripts/icon.js`) |
| Số liệu, tỉ lệ, quy trình | dựng bằng code, đúng tỉ lệ thật; tỉ lệ khó hình dung → hình đếm | — |
| Bối cảnh, ví dụ thực tế | ảnh / tư liệu có giấy phép (`find_images.py` → `hai_mau.js`), ghi TASL | — |

## Quy tắc
1. **Mỗi slide một tiêu điểm** (máy chỉ cảnh báo): hình chính hoặc số lớn chiếm 30–45 % — không đạt bằng panel / thẻ nền; tấm nền gom bố cục chứ không thay hình chính.
2. **Nhìn slide là nắm toàn bộ ý**: nhãn đặt lên hình, ý cốt lõi viết thành cụm ngắn cạnh hình.
3. **Đồng bộ trong một họ**: cùng kiểu vẽ, cùng màu nhấn, icon cùng bộ.
4. Ảnh: chỉ ảnh có giấy phép rõ; chữ không đặt lên phần ảnh rối (đặt cạnh hoặc trên mảng màu phẳng).
5. Tài nguyên tải về bộ nhớ đệm (`~/.cache/slide-chuan`, lần đầu cần mạng npm) — không chép vào skill.

## Ảnh chụp hiện đại (Unsplash) và minh hoạ unDraw — hướng "tư vấn pháp lý", Chương 3 (15/11/2026)
> Hạ cấp 18/11/2026: chỉ dùng khi ảnh **đúng sự vật** theo quy tắc 0 — không dùng ảnh tâm trạng cho bìa / mở phần / câu chốt.

Hai nguồn này nâng trần chất lượng rõ nhất ("wow"): ảnh chụp thật sắc nét cho bìa / mở phần / trích luật; minh hoạ do hoạ sĩ vẽ cho người và tình huống. Cả hai **không phải ảnh AI**, giấy phép cho dùng tự do, không bắt ghi công — vẫn ghi đủ trong `ghi-cong.md`. Phải được chủ bài duyệt (CLAUDE.md).
- **Unsplash**: `unsplash.com` có lớp chặn máy và API cần khoá. Cách làm: Firecrawl `firecrawl_scrape` trang `https://unsplash.com/s/photos/<từ-khoá>?license=free` (formats `links`) → chọn ảnh; scrape trang ảnh (formats `images`) → lấy `images.unsplash.com/photo-<số>-<mã>` từ `og:image` → `curl "https://images.unsplash.com/photo-…?fm=jpg&q=85&w=2400"`. Chỉ dùng ảnh trang ghi "Free Photo" (không Unsplash+).
- **Xử lý ảnh**: `node scripts/phu_mau.js <vào> <ra> --rong= --cao= --tieu=x,y [--tu=trai|phai|duoi|tren --dac= --den=] [--cheo=0.2]` — cắt theo điểm nhìn, phủ dải màu chủ để đặt chữ lên ảnh, hoặc cắt chéo mép trái (PNG trong suốt) cho bố cục tạp chí; dải màu nhấn chạy theo mép chéo.
- **unDraw**: tìm `curl "https://undraw.co/api/search?q=<từ>"` → dùng trường `media` (đường dẫn `cdn.undraw.co/illustration/…` hoặc `…/illustrations/…`; dựng lại đường dẫn từ `newSlug` có thể ra trang lỗi 27 KB). Lưu vào `asset/undraw/` của bài; tô lại theo bảng màu bằng bảng ánh xạ màu (màu nhấn #6c63ff → màu chủ, xám đậm → mực, xám nhạt → kẻ / màu nhạt, da → da) — xem `minh-hoa.js` của bài Chương 3 (`unDraw()`), lồng vào lớp hình bằng `<svg>` con, khai `data-loai="undraw"`.
- **Phân vai trong một deck**: ảnh chụp cho bìa, mở phần, trích luật, câu chốt (cảm xúc, bối cảnh); unDraw cho người và tình huống (bên mua, giao kết, câu hỏi); vật phẳng tự vẽ + khối tô đặc cho sơ đồ, số liệu. Cùng bảng màu → không hổ lốn.

