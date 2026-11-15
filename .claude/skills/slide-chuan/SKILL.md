---
name: slide-chuan
description: "Use when the user wants a slide deck (PowerPoint .pptx, editable text, embedded fonts) built from their material (pptx/docx/pdf/notes) or a topic — bài giảng, thuyết trình, tiểu luận, bình luận bản án, báo cáo, slide bảo vệ — or wants such a deck redesigned or fixed. Works like a full production team: research → script → art direction → custom-drawn assets + sourced photos → free-form slide design → independent review, with approval gates. Also matches unaccented requests (lam slide, bai thuyet trinh, lam ppt). Not for editing an arbitrary existing .pptx in place (use pptx), A4 infographic (infographic), or video (motion-video)."
---

# slide-chuan — một đội làm slide, không phải kho mẫu

**Skill này chỉ giữ QUY TRÌNH và CÔNG CỤ DỰNG.** Không có mẫu bố cục, không có bộ hình dùng chung, không có "da" theo môn. Mỗi bài được nghiên cứu, viết kịch bản, chọn phong cách, vẽ asset riêng và thiết kế từng slide **tự do** — mọi thứ của bài nằm trong **thư mục bài**, không lưu vào skill.

Đọc trước khi làm: `references/quy-trinh.md` (các bước, sản phẩm, điểm duyệt) · `references/he-nen.md` + `references/trinh-bay-du-lieu.md` (đa dạng trong hệ thống: nền, bảng biểu) · `references/vai-tro.md` (vai trò, bản ghi lựa chọn của cố vấn, cách gọi người duyệt độc lập) · `references/hop-dong-html.md` (cách viết slide HTML để dựng ra PPTX sửa được) · `references/soat.md` (điều kiểm từng slide, rubric).

## Quy trình (tóm tắt — chi tiết ở `references/quy-trinh.md`)
| # | Bước | Sản phẩm trong thư mục bài |
|---|---|---|
| 0–1 | Brief, khán giả, mục tiêu học tập (Bloom), một câu ý lớn | `brief.md` |
| 2 | Nghiên cứu + kiểm chứng (luật: skill `vn-legal-exam-analysis`, kho `packages/content/data/laws/`) | `noi-dung.md` (nội dung + bảng nguồn + lỗi của tài liệu gốc + điều chưa chắc) |
| 3 | Kịch bản theo **mạch của thể loại** (bài giảng: bám dàn ý gốc, không cốt truyện): mỗi slide một khẳng định + bằng chứng hình + nguồn + giây + lời nói | `kich-ban.md` |
| 4 | Tham chiếu 15–20 mẫu chuyên nghiệp đúng thể loại → hệ thống thiết kế của bài (lưới, thang chữ, **hệ nền** `he-nen.md`, **bộ trình bày dữ liệu** `trinh-bay-du-lieu.md`, 8–10 kiểu slide) → bản đồ nhịp (kiểu · nền · bảng/hình) → 2–3 hướng phong cách | `thiet-ke/` + bản ghi lựa chọn |
| 5 | Làm mẫu 3–4 slide thật; slide then chốt làm 3 phương án rồi chọn | `slides/` (bản đầu) |
| 6 | **Thẻ phong cách** (`thiet-ke/phong-cach.json`) → brief minh hoạ + **kiểm kê asset** (mỗi phần ≥ 1 hình chính riêng, một hình ≤ 3 slide) → vẽ asset + hoạ tiết nền (SVG tự vẽ) + tìm ảnh thật | `thiet-ke/asset.md`, `asset/`, `anh/`, `ghi-cong.md` |
| 7 | Thiết kế + dựng toàn bộ | `slides/*.html`, `style.css` → `<tên>.pptx` |
| 8 | Soát: máy → nhìn ảnh từng slide → **người duyệt độc lập** (agent `opus`) → sửa, tối đa 2 vòng | `nhat-ky.md` (điểm rubric, lỗi đã sửa) |
| 9 | Diễn tập: lời nói trong notes, đo giờ, slide có thể cắt | notes trong slide |
| 10 | Bàn giao + rút kinh nghiệm | PPTX, ảnh tổng, `ghi-cong.md`, `nhat-ky.md` |

**Điểm duyệt** (dừng, gửi bản ghi lựa chọn, chờ người dùng):
- Bài có tài liệu gốc (bài giảng cũ, giáo trình): **3 lần** — **A** sau bước 2 (brief + mục tiêu + nội dung) · **B** sau bước 3 (kịch bản) · **C** sau bước 5 (phong cách + mẫu).
- Bài mới hoàn toàn: **5 lần** — sau bước 1, 2, 3, 4, 5.
- Không tự duyệt thay người dùng; người dùng sửa gì thì sửa sản phẩm của bước đó rồi gửi lại.

## Dựng
```
node scripts/dung.js <thư_mục_bài> [--ten=<tên>] [--khong-soat] [--nhap]
```
Ghép `slides/*.html` → `hinh/build.js` (chữ `data-t` thành hộp chữ thật, `data-l` thành lớp ảnh rời, font Anton + Be Vietnam Pro nhúng, hiệu ứng / Morph gốc PowerPoint) → kiểm lỗi → `<tên>_lop/tong-N.jpg` (ảnh tổng 3×3). **Mọi `⚠` là lỗi, mã thoát 1** (`--nhap` để xem trước dù còn lỗi). Máy bắt: **phong cách asset** (◇ hình lệch thẻ: gradient, bóng mờ, quá nhiều màu — kèm bảng xem thử `asset.jpg`), **đa dạng** (◇ ít loại nền, một nền > 80 %, > 6 slide liền cùng nền, hình lặp > 3 slide, bảng một kiểu — in dải nền + thống kê), chữ không sửa được, chữ trong SVG, tràn hộp, ra ngoài vùng an toàn, chữ bị lớp ảnh đè, hai hộp chữ đè nhau, chữ < 12 pt, tương phản WCAG, dòng mồ côi, lệch 4–10 px, thiếu tiêu đề / chữ thay thế, PPTX lệch HTML. Máy **không** bắt được xấu / khó hiểu / sai nội dung → bước 8.

## Luật cứng
- **Nhìn slide là nắm toàn bộ ý** (Hào nhấn mạnh 15/11/2026): người xem không nghe giảng vẫn hiểu đủ ý của slide qua hình + nhãn + chữ trên slide. Không đẩy nội dung cốt lõi xuống ghi chú; muốn bớt chữ thì cho hình chở nội dung (nhãn đặt lên hình, sơ đồ có tên quan hệ), không phải cắt ý.
- **Đúng trước, đẹp sau.** Mọi con số, điều luật, định nghĩa trên slide phải có dòng nguồn trong `noi-dung.md`; luật ghi số hiệu văn bản, điều/khoản, tình trạng hiệu lực; không bịa. Lỗi của tài liệu gốc → báo người dùng ở điểm duyệt A, không tự sửa im lặng.
- **Hình tự vẽ hoặc ảnh thật có nguồn**; không kho hình dán / icon 3D làm hình chính, không ảnh AI. **Một thẻ phong cách cho cả deck** (đã duyệt ở C, máy kiểm); mỗi bảng và hình chính làm 2 phương án rồi chọn.
- **Không ẩn dụ khó hiểu**: hình phải cho thấy chính sự vật / quan hệ trong nội dung; che chữ vẫn đoán được ý.
- **Không thiết kế khi chưa có tham chiếu và hệ thống thiết kế của bài** (bước 4): đẹp là so được với mẫu chuyên nghiệp, không phải "sạch lỗi máy".
- **Kinh nghiệm của bài ghi vào `nhat-ky.md` của bài.** Chỉ sửa skill khi lỗi nằm ở công cụ (`hinh/`, `scripts/`) hoặc ở quy trình chung — không thêm mẫu / hình của một bài vào skill.
- Giao bài: `dung.js` sạch lỗi + đã nhìn mọi ảnh tổng + người duyệt độc lập chấm mọi hạng ≥ 4/5 (cả Thẩm mỹ). Nhắc người dùng: mở bằng PowerPoint 2019 / Microsoft 365, bấm **Enable Editing** để thấy font, báo lại nếu Morph / hiệu ứng chạy sai.

## Công cụ
`hinh/build.js` (HTML → PPTX) · `hinh/xml.js`, `hinh/may_quay.js` (Morph, máy quay) · `hinh/kiem_de.js` (chữ bị đè) · `hinh/tao_font.js` + `hinh/fonts/` · `scripts/dung.js` · `scripts/da_dang.js` (đo đa dạng) · `scripts/kiem_phong_cach.js` · `scripts/to_so_sanh.js` (slide cạnh mẫu tham chiếu) · `hinh/bang.css` (bộ thành phần bảng T1–T13) · `scripts/kiem_html.js` · `scripts/soat_chi_tiet.js` · `scripts/co_chu.js` · `scripts/find_images.py`, `img_quality.py`, `fetch_image.py`, `cutout.py` (ảnh) · `scripts/outline.py` (rút dàn ý tài liệu gốc) · `scripts/ban_ghi_chu.py` (bản in ghi chú) · `scripts/morph_cap.py`, `xem_morph.js` (soát Morph) · `scripts/dong_goi.py` (zip tải lên claude.ai, ≤ 200 file). Ví dụ tối thiểu: `examples/mau/`.

Cài: `npm install` trong thư mục skill. Cần Node 18+, Playwright + Chromium (`PW_CHROMIUM=<đường dẫn>`), LibreOffice + `pdftoppm` cho tờ soát. Kiểm skill: `npm test`.
