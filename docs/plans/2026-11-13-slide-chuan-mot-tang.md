# Kế hoạch — slide-chuan một tầng hình ảnh + da theo môn

Spec: `docs/specs/2026-11-13-slide-chuan-da-theo-mon-design.md` (đã duyệt 13/11/2026). Nhánh: `claude/nice-allen-k55pdh`. Thư mục: `.claude/skills/slide-chuan`.
Người dùng cho phép vượt giới hạn 2 giờ/phiên; vẫn commit checkpoint ≤ 45 phút và push sau mỗi đợt.

| Đợt | Việc | Xong khi | Kiểm |
|---|---|---|---|
| 0 | Đưa skill 1.3.0 từ nhánh `claude/lucid-goldberg-yzikct`; spec + kế hoạch | commit | — |
| 1 | `hinh/da.js`: 11 da từ world/bộ chất liệu của tầng Office + da `bc`, `qt`; gắn vào `dung.js`; da mặc định theo `meta.kind`; `kiem.js`, `prep.py` nhận da | Bài BHXH `meta.da = "so-bhxh"` dựng sạch, nhìn mờ nhận ra BHXH | `tests/da.test.js`, `dung.js --soat` |
| 2 | Biểu đồ đủ tính năng (why, bands, value2, annotate, hatch, waterfall, gantt, progress, donut, slope); `hinh/art.js` (23 hình); bố cục ảnh (cover poster + facts, end poster, closing/section/hero/agenda có ảnh, khung ảnh); `meta.motif` | `examples/do_hoa_code.json`, `bo_cuc_them.json` dựng sạch | `tests/bieu_do.test.js`, `--soat` |
| 3 | `hinh/kiem_noi_dung.js`: validate + giới hạn chữ + dàn ý + thời lượng + prep + chính sách ảnh + ghi công + `--titles` trong `dung.js` | Các cảnh báo cũ của tầng Office in ra khi dựng bằng `dung.js` | test chuyển từ tầng Office |
| 4 | Xoá tầng Office: `engine/build.js`, `measure.js`, `themes.js`, `styles.js`, script Office, test Office; viết lại SKILL.md + references | `grep` không còn `engine/build.js`; `npm test` xanh | `npm test` |
| 5 | Dựng lại BHXH, hình sự, quốc tế; push; báo cáo | 3 deck `--soat` sạch | `morph_cap.py`, nhìn mờ |

## Tiến độ (13/11/2026)
- Đợt 0–2: xong (commit 4c7dbb3 → 8d15fe2).
- Đợt 3: xong — `hinh/kiem_noi_dung.js`, `--titles`, `--strict` dừng mã 3 khi còn ⚠, `_ghi-cong.md`.
- Đợt 4: xong — xoá `engine/build.js`, `measure.js`, `themes.js`, `styles.js`, `shapes.js`, `kits.js`, `scripts/render.py`, `preview.py`, `check_overflow.py`; test Office soi PPTX bị xoá (test chỉ kiểm thông báo nội dung chuyển sang chạy qua `hinh/dung.js`); SKILL.md và references viết lại cho một tầng; `npm test` 206/206.
- Đợt 5: đang làm.
