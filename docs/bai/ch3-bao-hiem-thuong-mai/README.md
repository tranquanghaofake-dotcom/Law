# Chương 3 — Bảo hiểm thương mại (BNK405)

Thư mục bài của deck bài giảng dựng bằng skill `slide-chuan` (spec `docs/specs/2026-11-14-slide-chuan-v2-quy-trinh.md`). Đây là thông tin pháp luật chung phục vụ học tập, không phải tư vấn.

## Dựng lại
```
cd docs/bai/ch3-bao-hiem-thuong-mai
node deck.js
PW_CHROMIUM=/opt/pw-browsers/chromium node ../../../.claude/skills/slide-chuan/scripts/dung.js . --ten=bao-hiem-thuong-mai
```
Ra `bao-hiem-thuong-mai.pptx` và `bao-hiem-thuong-mai_lop/` (ảnh từng slide, ảnh tổng, bảng xem thử asset — không commit).

## Nội dung thư mục
- `brief.md`, `noi-dung.md` (nội dung + bảng nguồn luật, đã đối chiếu bản chính thức 14–15/11/2026), `kich-ban.md`, `nhat-ky.md` (điểm duyệt, lỗi đã sửa, bài học), `ghi-cong.md` (nguồn mọi hình).
- `deck.js` — dựng 47 slide; `notes-cu.json` — ghi chú người nói.
- `asset/` — hình của bài: `ve_phang.js` (nhà, toà nhà, hợp đồng, xe — dựng bằng code), `nv-*.svg` (nhân vật Open Peeps CC0, tạo bằng `scripts/nhan_vat.js` của skill), `icon-*.svg` (Tabler, MIT), hoạ tiết nền.
- `anh/fire-goc.jpg` (tranh Đại hoả hoạn London 1666, phạm vi công cộng) → `anh/fire-duotone.jpg` (tô hai màu bằng `scripts/hai_mau.js`).
- `thiet-ke/` — hệ thống thiết kế, bản đồ nhịp, kiểm kê asset, thẻ phong cách, quy tắc rút từ 54 mẫu tham chiếu. **Ảnh mẫu tham chiếu không lưu ở đây** (có bản quyền, chỉ để học quy tắc); `nguon.md` ghi URL, `lay.py` / `ghep.py` / `tim.sh` tải lại được.

## Không lưu
- Văn bản slide gốc của giảng viên (`goc.txt`): có thông tin cá nhân của giảng viên và là tài liệu của người khác.

## Việc còn lại (người duyệt độc lập 15/11/2026: Thẩm mỹ 3/5)
1. Slide mở phần, chuyển ý, kết (5, 16, 20, 29–30, 46–47): ảnh tư liệu hai màu tràn nửa slide hoặc cảnh Open Peeps chiếm ~40 %.
2. Thêm 4–6 ảnh có giấy phép (cháy, tai nạn xe, tàu biển, quán cà phê Lloyd's, hợp đồng); bớt hình dùng lại.
3. Phóng phần bên trong thẻ: hình chính ≥ 60 % thẻ, chữ thân lớn hơn.
4. Chờ giảng viên: đáp án câu hỏi 2; đối chiếu chữ "xây dựng" (Luật 139/2025/QH15 sửa Điều 8 khoản 2 điểm c) trên bản chính thức.
