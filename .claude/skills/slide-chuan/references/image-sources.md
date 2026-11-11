# Nguồn ảnh cho slide

Nguyên tắc: **chỉ dùng ảnh có giấy phép rõ ràng**. Đẹp nhưng không rõ giấy phép thì không dùng.
Kiểm tra truy cập: 04/11/2026, từ môi trường cloud chạy skill (máy cá nhân thường mở được nhiều hơn).

## Nơi CHỈ để tham khảo bố cục — không lấy ảnh
| Nơi | Vì sao không lấy ảnh |
|---|---|
| Pinterest, Behance, Dribbble | Người dùng ghim/đăng lại ảnh của người khác; nền tảng không cấp giấy phép dùng ảnh |
| Google Images, báo điện tử, mạng xã hội | Ảnh có bản quyền của tác giả/toà soạn |
| Ảnh AI trong các bộ slide mẫu (NotebookLM, Gamma...) | Không rõ quyền; dễ sai chi tiết thực tế |

Học từ những nơi này: cách đặt chữ trên ảnh, tông màu, khoảng trắng, cách trang trí — không phải bản thân tấm ảnh.

## Kho ảnh chụp dùng được
| Nguồn | Giấy phép | Bắt buộc ghi nguồn? | Cần khoá API? | Tải được từ cloud? | Hợp với |
|---|---|---|---|---|---|
| **Pexels** | Pexels License | Không (skill vẫn ghi) | `PEXELS_API_KEY` (miễn phí) để script tự tìm | Có (ảnh tới 2400px) | Ảnh đời sống, đô thị Việt Nam, nhà ở, văn phòng, chìa khoá, hợp đồng |
| **Unsplash** | Unsplash License | Không (API yêu cầu ghi tên tác giả) | `UNSPLASH_ACCESS_KEY` (miễn phí) | Có | Ảnh nghệ thuật, tông màu đẹp, phong cảnh |
| **Pixabay** | Pixabay Content License | Không | `PIXABAY_API_KEY` (miễn phí) | Có — nhưng khoá thường chỉ lấy được ảnh ≤ 1280px | Ảnh nhỏ trong khung; không đủ nét để tràn viền |
| **Openverse** (gom Flickr, Wikimedia...) | CC0 / PD / CC BY / CC BY-SA (script tự lọc) | **Có** với CC BY, CC BY-SA | Không | Một phần (ảnh lưu trên Wikimedia bị chặn 429) | Tư liệu đa dạng |
| **Wikimedia Commons** | CC0 / PD / CC BY / CC BY-SA | **Có** với CC BY, CC BY-SA | Không | Ảnh **gốc** bị chặn 429 từ cloud; ảnh **thu nhỏ chuẩn 1920px** tải được (kiểm 04/11/2026) — `find_images.py` tự đổi link (kết quả qua Openverse); API tìm kiếm Commons vẫn hay bị 429 → dùng `--no-commons`, Openverse vẫn ra ảnh Wikimedia | Địa danh Việt Nam (Đông Hà, Quảng Trị...), trụ sở cơ quan, di tích |
| **Thư viện Quốc hội Hoa Kỳ (loc.gov)** | "No known restrictions on publication" (script tự lọc) | Nên ghi | Không | Có | Tư liệu lịch sử, kiến trúc toà án, văn bản cổ, ảnh Carol M. Highsmith (phạm vi công cộng) |
| **NASA Image and Video Library** (images.nasa.gov) | NASA Media Usage Guidelines: "thường không chịu bản quyền ở Hoa Kỳ", dùng cho giáo dục/thông tin; không được ngụ ý NASA bảo trợ; logo NASA và người nhận diện được có hạn chế | **Có** — phải ghi NASA là nguồn | Không | **Có** (kiểm 04/11/2026) — `find_images.py --nasa` | Ảnh vệ tinh, Trái Đất từ ISS: đồng bằng sông Cửu Long, lũ, cháy rừng, đô thị hoá — đề tài môi trường, đất đai, biến đổi khí hậu |
| **Rijksmuseum** (data.rijksmuseum.nl) | CC0 / Public Domain "wherever possible" — xem dòng bản quyền của từng ảnh | Không (nên ghi) | Không | **Có** (kiểm 04/11/2026) — `find_images.py --rijks` (ảnh IIIF thu về ≤ 2400px) | Tranh, bản in cổ: cán cân công lý, toà án, khế ước, văn bản cổ châu Âu |
| **Smithsonian Open Access** | CC0 — script chỉ lấy media có `usage.access = CC0` | Không (khuyến nghị ghi tên, nguồn, giấy phép) | Có — `SI_API_KEY` (miễn phí, api.data.gov; `DEMO_KEY` bị giới hạn ngay) | Ảnh ids.si.edu tải được (kiểm 04/11/2026); API cần khoá riêng — tự bật trong `find_images.py` khi có khoá | Hiện vật lịch sử, khoa học |
| Art Institute of Chicago, The Met (Open Access, CC0) | CC0 | Không | Không | **Không** (403/410 từ cloud) | Tranh, tượng: cán cân công lý, Nữ thần Công lý |

Nguồn ít ảnh Việt Nam đương đại: loc.gov, kho bảo tàng. Ưu tiên Pexels / Wikimedia cho chủ đề Việt Nam.

## Hình minh hoạ vẽ phẳng (chưa tích hợp vào script — tải thủ công khi cần)
| Nguồn | Giấy phép (đã đọc trang giấy phép, 11/2026) | Ghi chú |
|---|---|---|
| Open Peeps, Open Doodles, Humaaans (Pablo Stanley) | CC0 — dùng, sửa, thương mại, không cần ghi nguồn | Người vẽ tay; hợp bài nhẹ, không hợp bình luận bản án |
| unDraw | Giấy phép riêng: miễn phí, không cần ghi nguồn; **cấm** gom thành bộ để phân phối lại, **cấm** dùng huấn luyện AI | Tải từng hình khi cần; KHÔNG đóng gói vào skill |
| Storyset, Freepik | Miễn phí **kèm ghi nguồn** | Đọc kỹ điều kiện bản miễn phí |

## Công cụ xử lý ảnh
| Công cụ | Giấy phép (đã đọc LICENSE, 11/2026) | Dùng khi | Lưu ý |
|---|---|---|---|
| rembg — **đã tích hợp**: `scripts/cutout.py` | MIT (mã); mô hình mặc định `u2net` Apache-2.0 (xuebinqin/U-2-Net). **BRIA RMBG-2.0 cần thoả thuận trả phí nếu thương mại** — script chặn | Tách nền vật thật (chìa khoá, sổ đỏ, toà nhà) → trường `cutout` thay hình vẽ `art` | Từ chối ảnh ND / không rõ giấy phép; tự ghi "đã tách nền", BY-SA ghi cùng giấy phép |
| smartcrop.js | MIT | Cắt khung theo vùng nổi bật | Engine đã làm tương tự bằng `sharp` (`attention`) — không cần thêm |

## Icon
Xem `references/icons.md` — bảng giấy phép từng bộ. Tóm tắt: Phosphor (MIT), Lucide (ISC), Tabler (MIT) không bắt ghi nguồn; **Font Awesome Free là CC BY 4.0 — phải ghi nguồn** (build tự in danh sách icon FA đang dùng).

## Bản đồ và dữ liệu nền
| Nguồn | Giấy phép | Ghi chú |
|---|---|---|
| Natural Earth | Phạm vi công cộng | Engine đang dùng cho `map` (ranh giới tỉnh) |
| OpenStreetMap | ODbL — **bắt buộc ghi "© OpenStreetMap contributors"** | Bản đồ đường phố, vị trí cơ quan, toà án |
| GADM | Chỉ dùng phi thương mại, không phân phối lại khi chưa xin phép | Không đóng gói vào skill; tự tải khi làm bài trên lớp |
| World Bank Open Data | CC BY 4.0 | Số liệu so sánh quốc tế (lao động, an sinh) |
| Tổng cục/Cục Thống kê (gso.gov.vn), cổng cơ quan nhà nước | Số liệu công bố — trích dẫn có ghi nguồn | Ghi `source` ở slide `chart`/`table`; danh mục đầy đủ để ở `notes` |

## Không dùng
- Quốc huy, logo của cơ quan nhà nước, toà án, trường học khác — trừ logo của chính đơn vị người dùng (`meta.logo`). (Chưa xác minh điều khoản cụ thể về quốc huy — mặc định không dùng.)
- Logo thương hiệu (kể cả bộ Simple Icons CC0) — là nhãn hiệu của người khác, dễ hiểu nhầm là có liên kết/bảo trợ.
- Ảnh người có thể nhận diện mà không liên quan nội dung; ảnh do AI tạo.
Engine đã có hình vẽ riêng (`art`, `motif`) — chỉ dùng nguồn ngoài khi thật cần.

## Ảnh báo chí / cơ quan nhà nước Việt Nam
Ảnh trên báo, cổng thông tin cơ quan nhà nước có bản quyền. Luật Sở hữu trí tuệ (Luật số 50/2005/QH11, sửa đổi các năm 2009, 2019, 2022 — bản sửa đổi 2022 là Luật số 07/2022/QH15) có quy định các trường hợp sử dụng tác phẩm đã công bố không phải xin phép, không phải trả tiền (Điều 25), trong đó có sử dụng hợp lý để minh hoạ cho giảng dạy. **Chưa kiểm tra lại nguyên văn từng điểm, khoản sau lần sửa đổi 2022** — tra văn bản hợp nhất trước khi dựa vào. Phạm vi ngoại lệ hẹp: phải ghi tên tác giả, nguồn; không ảnh hưởng đến việc khai thác bình thường của tác phẩm. Slide nộp trên lớp khác với slide đăng công khai lên mạng — khi đăng công khai, chỉ dùng ảnh có giấy phép mở.

## Quy trình (tóm tắt — chi tiết ở SKILL.md bước 5)
1. `python3 scripts/find_images.py <thư_mục_deck> "từ khoá cụ thể" ...` (thêm khoá API nào có).
2. Mở `images/_candidates.jpg`, **xem bằng mắt**, loại ảnh sai chủ đề / có chữ, logo / người không liên quan.
3. Ghi `"photo"` + `"photoAlt"` vào deck; engine tự nhuộm màu, cắt khung, ghi nguồn; build in danh sách nguồn ảnh.
