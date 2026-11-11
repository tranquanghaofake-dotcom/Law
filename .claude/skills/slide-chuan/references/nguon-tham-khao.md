# Nguồn tham khảo của skill

## Dự án mã nguồn mở đã tham khảo (hướng "đẹp hơn", không phải "nhanh hơn")
- dom-to-pptx (MIT): bố cục editorial bất đối xứng (ảnh ~60% + thẻ chữ đè mép) → `split`; lưới bento kích thước khác nhau → `gallery`.
- anthropics/skills pptx và bản phái sinh: dấu góc, viền kép, nền chia mảng; "agent thường viết gấp 2–3 lần số chữ cần thiết".
- oh-my-agent oma-slide: bộ nguyên tắc chống "AI slop". Kortix/Suna: màu nhấn chỉ 10–15% diện tích, không icon trang trí.
- Presenton (Apache 2.0): mỗi bố cục có trường mô tả ảnh cần tìm → ảnh luôn gắn với nội dung slide.
- mapshaper (MPL 2.0): `-dissolve` gộp vùng bằng cách xoá đường ranh chung → cách dựng lớp 34 tỉnh (`scripts/build_vn_map34.py` làm tương tự bằng shapely `unary_union`); đơn giản hoá theo topology dùng chung đường ranh để không hở khe giữa các tỉnh (hướng cải thiện dữ liệu bản đồ sau này).
- Observable Plot (ISC): waffle mark — tỉ lệ thành lưới ô đếm được → `share` (`grid`), biến thể "thửa đất" (`parcels`) cho chủ đề đất đai.
- Quy ước slope chart (dumbbell / connected dot): hai trục mốc, trục từ 0, nhãn giá trị ở hai đầu, chênh lệch ghi cạnh giá trị sau → `chart` `slope`.
- Microsoft SmartArt (phân loại List · Process · Cycle · Hierarchy · Relationship · Matrix · Pyramid · Picture) → mỗi type mới ứng với một nhóm: `steps` (Process), `pyramid` (Pyramid), `matrix` (Matrix), `venn` (Relationship), `tree` (Hierarchy — cây quyết định), `frame`/`beforeafter` (Picture). Vẽ bằng shape gốc (`custGeom`, chevron, oval) nên mở PowerPoint sửa được.
- FT Visual Vocabulary (MIT, ft-interactive/visual-vocabulary): chọn hình theo QUAN HỆ dữ liệu (độ lệch, xếp hạng, phân bố, theo thời gian, bộ phận–tổng thể, độ lớn, không gian, dòng chảy) — cùng logic với bảng chọn type ở bước 3.
- Assertion–evidence (Michael Alley, Penn State): tiêu đề là câu khẳng định + thân là bằng chứng HÌNH ẢNH; nghiên cứu cho thấy người xem hiểu và nhớ tốt hơn danh sách gạch đầu dòng → lý do mỗi type đều bắt tiêu đề là câu kết luận.
- Kênh TikTok @flashslide.com (xem 9 clip, 11/2026: kỹ năng giao tiếp, môn luật, lịch sử 30/4, báo cáo kinh doanh, thống kê y tế, sơ đồ tư duy, lũ lụt, bất động sản, văn học): chỉ rút NGUYÊN TẮC dùng chung (một thế giới chất liệu, ba tầng chiều sâu, vắt mép, vật hoá thông tin, nhãn siêu dữ liệu, câu chốt cố định, nhịp) → `meta.kit`, `takeaway`, kiểm nhịp. Không lấy hình, font, bố cục; nhiều đồ vật / người trong các mẫu là ảnh AI — skill vẽ lại đồ vật bằng code. Chi tiết: `references/nguyen-tac-bo-cuc.md`.
- Bài hướng dẫn "Vẻ đẹp phương Đông" (TikTok, kênh Powerpoint – Minh Phạm, xem 11/2026): học 5 THAO TÁC dựng slide (nền giấy có vân → chồng lớp tạo chiều sâu → ghép khung từ dấu ngoặc lớn + chữ nhật bo góc → Gộp hình › Kết hợp → nhân bản phóng lớn làm viền, Tô bằng ảnh) → bộ dựng hình `engine/shapes.js` + `frame`. Không chép bố cục, hình, font của tác giả; không học font viết tay (không nhúng được vào .pptx, dễ vỡ dấu tiếng Việt).
- polygon-clipping (MIT, github.com/mfogel/polygon-clipping): phép hợp / hiệu / giao đa giác — thay cho "Gộp hình dạng" của PowerPoint mà pptxgenjs không có.
- Slidev, reveal.js, Motion Canvas, Remotion: hợp slide HTML/video có chuyển động; không ra PPTX sửa được.
- **Chuyển động trong PPTX (11/2026)** — reveal.js `data-auto-animate` và Slidev `magic-move` đều ghép phần tử cùng khoá giữa hai slide rồi nội suy vị trí / cỡ: chính là Morph của PowerPoint ghép theo tên "!!…" → engine đã có (`--transition morph`, `meta.thread`). Phần mới lấy từ kỹ thuật edit video giải thích (skill `motion-video`, nguồn HyperFrames motion-doctrine, Apache-2.0): lộ dần theo nhịp, một hướng, vào giảm tốc, khoảng lặng trước cú chốt, một cú "nện" con số → `meta.motion`. Không đưa vào: rung / lơ lửng / flash (bị chính tài liệu đó cấm), hiệu ứng thoát, đường chuyển động tuỳ ý.
- **Bố cục ảnh từ video giải thích / motion (11/2026)** — Slidev chỉ có `image-left` / `image-right` / `image` (sli.dev/builtin/layouts); kỹ thuật lấy từ phân loại kiểu video giải thích của Yum Yum Videos ("14 Explainer Video Styles") và Ferdio ("A complete breakdown of explainer video types"): *kinetic typography* (chữ là nhân vật chính, mỗi dòng một nhịp) → `headline` (dải chữ kiểu phụ đề TikTok trên ảnh tràn viền); *crop / zoom to subject* (Canva explainer: "crop… to zoom in to the subject") → `lens` (kính lúp phóng to MỘT chi tiết); *digital collage / mixed media* (ảnh thật cắt dán + đồ hoạ) → `collage` (ảnh in nghiêng, băng dính); thẻ số liệu trên footage của motion graphics → `hero` + `photo` (số trên ảnh duotone tối).


## Video thay vì PPTX?
Remotion (React) dựng **video MP4**, không tạo file PowerPoint: dùng khi cần nộp/đăng bản video thuyết trình (có skill `remotion:*`). Thuyết trình trực tiếp, cần bấm chuyển slide hoặc sửa trong PowerPoint → vẫn dùng skill này (.pptx). Lưu ý giấy phép Remotion: miễn phí cho cá nhân và công ty ≤ 3 người; doanh nghiệp lớn hơn phải mua giấy phép công ty.


## Tầng hình ảnh (`hinh/`) — nguồn đã dùng
- huashu-design (MIT) — ý tưởng "đọc toạ độ sau khi trình duyệt dàn xong": đo từng dòng chữ thành hộp chữ, phần trang trí thành ảnh (`hinh/build.js`).
- dom-to-pptx (MIT) — cách đưa font vào file .pptx (`p:embeddedFontLst` + `.fntdata`).
- ttf2eot của fontello (MIT) — cấu trúc đầu file EOT; `hinh/xml.js` tự viết lại và cho kết quả trùng từng byte.
- Fluent Emoji (Microsoft, MIT) — 90 hình dán gộp trong `hinh/emoji.json` (giấy phép: `hinh/emoji/GIAY-PHEP.txt`).
- Anton, Be Vietnam Pro (SIL OFL 1.1) — font nhúng; hai họ `Be Vietnam Dam` / `Be Vietnam Nang` là bản đổi tên họ, ghi chú ở `hinh/fonts/GHI-CHU.txt`.
- Bài mẫu "Châu Nam Cực" (video người dùng gửi) — gợi ý dàn dựng: mở sách, kính lúp soi mục lục, số đếm, khối lớn dần theo số liệu, trắc nghiệm bấm được, trang mục lục ảnh. Chỉ lấy ý dàn dựng, không lấy hình hay nội dung.
