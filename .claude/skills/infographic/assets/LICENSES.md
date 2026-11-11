# Giấy phép asset

Icon và hình dán nằm trong hai kho gộp `icons.json`, `emoji.json` (tên → SVG) để gói skill không quá 200 file; file lẻ tải thêm bằng `assets.mjs` nằm ở `icons/`, `emoji/` và được `scripts/dong_goi.py` gộp vào kho khi đóng gói.

| Thư mục | Nguồn | Giấy phép | Ghi công trên infographic |
|---|---|---|---|
| `icons/` | Lucide `lucide-static@0.460.0` (unpkg.com/lucide-static@0.460.0/icons/<tên>.svg) | ISC — xem `icons/LICENSE.lucide` | "icon Lucide (ISC)" |
| `emoji/` | Fluent Emoji của Microsoft, bộ `fluent-emoji` trên Iconify (api.iconify.design/fluent-emoji/<tên>.svg) | MIT — xem `emoji/GIAY-PHEP.txt` | "hình dán Fluent Emoji (MIT)" |
| `avatars/` | DiceBear 9.x, style **Notionists** của Zoish (api.dicebear.com/9.x/notionists/svg?seed=<tên>) | CC0 1.0 (ghi trong `<metadata>` của từng file) | không bắt buộc; nên ghi "Notionists (CC0)" |

Thêm icon: `curl -sSf -o assets/icons/<tên>.svg https://unpkg.com/lucide-static@0.460.0/icons/<tên>.svg` (tra tên ở lucide.dev/icons).
Thêm nhân vật: đổi `seed` để ra gương mặt khác; tải về máy, không nhúng link API vào HTML (ảnh phải hiển thị khi offline).
Không dùng ảnh tìm trên mạng không rõ giấy phép, logo cơ quan nhà nước, quốc huy, con dấu thật.
Thêm hình dán: `node scripts/assets.mjs emoji <tên…>` (tra tên ở icon-sets.iconify.design/fluent-emoji).
Hình trong `illustrations/` sinh bằng `scripts/bieu-do.mjs` là sản phẩm của bài (dữ liệu của bài, vẽ bằng Apache ECharts — Apache-2.0, hoặc AntV Infographic — MIT); hai thư viện này không nằm trong skill, cài ở thư mục bài khi cần.
