# Môn Tố tụng hành chính — khung và việc còn lại

Nhánh `content/to-tung-hanh-chinh`. Hào đã duyệt phạm vi trong phiên 07/11/2026.

## Đã có
- Nguyên văn luật: `packages/content/data/laws/lttth-vbhn-2026.txt`, gồm Luật 93/2015/QH13 theo VBHN 13/VBHN-VPQH ngày 06/02/2026, đã gộp Luật 85/2025/QH15. Đã ghi dòng nguồn trong `SOURCES.md`.
- Tài liệu trong Drive là các bộ nhận định ôn thi (nguồn Studocu: Đại học Luật TP.HCM, Học viện Tòa án), **không có đề cương môn**. Nhiều bài viết theo luật trước sửa đổi, còn dùng "Tòa án nhân dân cấp huyện". Từ 01/7/2025 cấp này đã thay bằng **Tòa án nhân dân khu vực** (Điều 31), nên chỉ dùng các bài đó làm gợi ý dạng câu hỏi, không dùng làm căn cứ.

## Khung chương (theo cấu trúc luật)
| Chương | Khái niệm (căn cứ) |
|---|---|
| c1 Khái quát, nguyên tắc | quyết định hành chính (k1 Đ3) · quyết định hành chính bị kiện (k2 Đ3) · hành vi hành chính (k3 Đ3) · quyết định kỷ luật buộc thôi việc (k5 Đ3) · quyền quyết định và tự định đoạt (Đ8) · bảo đảm tranh tụng (Đ18) |
| c2 Đối tượng khởi kiện, thẩm quyền | khiếu kiện thuộc thẩm quyền Tòa án (Đ30) · thẩm quyền Tòa án nhân dân khu vực (Đ31) · thẩm quyền Tòa án cấp tỉnh (Đ32) · vừa khiếu nại vừa khởi kiện (Đ33) |
| c3 Người tham gia tố tụng | đương sự (k7 Đ3) · người khởi kiện (k8 Đ3) · người bị kiện (k9 Đ3) · người có quyền lợi, nghĩa vụ liên quan (k10 Đ3) |
| c4 Chứng cứ, biện pháp khẩn cấp | nghĩa vụ chứng minh (Đ9) · tạm đình chỉ thi hành quyết định hành chính (Đ69) |
| c5 Khởi kiện, thụ lý, đối thoại | quyền khởi kiện (Đ115) · thời hiệu khởi kiện (Đ116) · trả lại đơn khởi kiện (Đ123) · đình chỉ giải quyết vụ án (Đ143) |
| c6 Xét xử sơ thẩm, phúc thẩm | xét xử khi đương sự vắng mặt (Đ158) · tính chất phúc thẩm (Đ203) · thời hạn kháng cáo (Đ206) |
| c7 Giám đốc thẩm, tái thẩm, thi hành án | tính chất giám đốc thẩm (Đ254) · căn cứ tái thẩm (Đ281) · thi hành bản án (Đ311) |

Tổng 25 khái niệm. Mỗi khái niệm làm theo đúng khuôn môn Hôn nhân và gia đình: `definition` nguyên văn và có test đối chiếu từng câu, `memo`, các item mcq/case/cloze/recall/truefalse, `why` cho mọi câu trắc nghiệm, `parts` cho câu Đúng/Sai nếu nhánh `feat/nhan-dinh-3-phan` đã được merge.

## Việc còn lại (phiên sau)
1. Viết 25 khái niệm (theo cách sinh của `gen_hngd.py`), thêm `subjects/to-tung-hanh-chinh.json` và test riêng của môn.
2. Đăng ký vào kệ (`shelves.ts`: kệ Công pháp, cùng chỗ với Hành chính), `fields.ts`, `art/registry.ts`, `covers.ts`, `tools/citations/laws.ts`; sửa các test đang đếm số môn.
3. `npm run ci`, chụp ảnh 390 px.
