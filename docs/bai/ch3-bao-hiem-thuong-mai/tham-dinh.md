# Thẩm định học thuật — lượt thử quy trình (15/11/2026)

Chạy agent thẩm định (opus, brief ở `.claude/skills/slide-chuan/references/vai-tro.md`) trên chữ deck **bản cũ `7bf1b18`** để kiểm chứng vai mới: bắt đủ 4/4 lỗi đã biết (slide 24 "15 ngày tối đa", slide 24 cách đếm ngày, slide 21 "thỏa / thoả", slide 17 "xe cơ giới") — 4 lỗi này **đã sửa** ở bản hiện tại.

**Các điểm còn lại chưa sửa và phần lớn còn áp dụng cho bản hiện tại** — việc tiếp theo: chạy thẩm định lần 2 trên `bao-hiem-thuong-mai_lop/chu.md` của bản hiện tại rồi sửa. Đã đối chiếu với noi-dung.md: slide 8, 45 thiếu "hoặc trả tiền bảo hiểm" (G4); ghi chú slide 44 dẫn khoản 16 Điều 4 Luật 2022 cho câu chữ luật cũ. Điểm còn lại là nhận định của agent, cần đối chiếu trước khi sửa.

Ghi chú: agent viết "máy so ký tự đã bỏ sót" ở slide 21 — bản cũ chưa có máy kiểm trích; máy `trich_nguyen_van.js` mới bắt đúng lỗi này ("thỏa" → nguồn ghi "thoả").

---

| Slide | Câu | Nguồn | Kết luận | Đề xuất |
|---|---|---|---|---|
| 24 | "15 ngày tối đa" | Đ31 | **sai**: 15 ngày là thời hạn mặc định khi không có thoả thuận, không phải mức trần | "15 ngày — nếu hợp đồng không thoả thuận khác" |
| 24 | "Ngày 1: đủ hồ sơ · Ngày 15: hạn trả" | BLDS Đ147 k2, Đ148 k1, k5 | **sai**: hình chỉ còn 14 ngày | "Ngày nhận đủ hồ sơ hợp lệ không được tính; hạn là hết ngày thứ 15 tính từ hôm sau; nếu trùng ngày nghỉ thì lùi sang ngày làm việc kế tiếp" (nhận 02/3 → hạn 17/3) |
| 21 | [trích] "sự thỏa thuận" | Đ4 k16: "sự thoả thuận" | **sai trích**: lời nói ghi "giữ nguyên" nhưng slide không giữ; máy so ký tự bỏ sót | sửa "thoả"; lời nói nêu các chủ thể bị lược ở chỗ "…" |
| 44 | Lời nói: "Khoản 16 Điều 4 Luật 2022" | nd L2 | **sai căn cứ**: câu dẫn là câu chữ luật cũ | "Câu theo luật cũ; theo Đ4 k16 vẫn ra C" |
| 31 | Lời nói: "Bài 11, 12: 'X' là DNBH" | đề Bài 11–12 không có X | **không nguồn** | bỏ |
| 28 | "Ngoài hạn: không"; "ngoài cửa sổ này thì không bồi thường" | G16 chỉ định nghĩa thời hạn | **vượt nguồn**, dễ suy rộng | "Sự kiện bảo hiểm phải xảy ra trong thời hạn; còn tuỳ điều khoản, loại trừ" (người soạn thêm) |
| 38 | "trên 85 %: trở lại nhượng" | G26 không nêu trần | **vượt nguồn** (thêm cả cơ chế, không chỉ con số) | ghi nguồn hoặc bỏ dải này |
| 26 | "Trên giá trị: tối đa bằng giá trị; hoàn phí vượt" | Đ47 k1–2 | thiếu ý: chỉ áp dụng khi vô ý | "Vô ý: không vượt giá thị trường, hoàn phí phần vượt; cố ý: bị cấm" |
| 26 | "Bảo hiểm trùng: chia theo tỷ lệ STBH" | Đ49 k2 | thiếu ý | thêm "tổng không vượt thiệt hại thực tế" |
| 26 | "đúng giá trị — Điều 16 khoản 3" | Đ16 k3 | chưa chắc: luật không có điều riêng; k3 là trần chung, có ngoại lệ "thỏa thuận khác" | "Đúng giá trị (giáo trình); trần chung Đ16 k3" |
| 8, 45 | "cam kết bồi thường"; "khi rủi ro xảy ra" | G4; Đ4 k2 | thiếu ý: nhân thọ là trả tiền, không bồi thường | "bồi thường / trả tiền bảo hiểm khi xảy ra sự kiện bảo hiểm" |
| 17 | "Xe cơ giới" (bắt buộc) | Đ8 k2 | thiếu ý; dễ lẫn với "vật chất xe" | "TNDS chủ xe cơ giới" |
| 17 | "chỉ gồm các loại luật liệt kê"; "Bảo vệ lợi ích công cộng" | Đ8 k1–2 | dễ nhầm (còn mục "luật khác"); rơi ý | "do Luật KDBH hoặc luật khác quy định"; thêm "môi trường, an toàn xã hội" |
| 17 | Lời nói: "theo định nghĩa luật cũ" | nd 1.3 mức C | chưa chắc | "có thể theo Luật 2000, chưa đối chiếu" |
| 12 | "Cố ý khai sai → được huỷ hợp đồng" | Đ22 k2–3; BLDS Đ423 | thiếu ý, sai thuật ngữ | "Cố ý vi phạm nghĩa vụ cung cấp thông tin → bên kia có quyền huỷ bỏ hợp đồng" |
| 6 | "hợp đồng đầu tiên"; "13.000 nhà"; "bảo hiểm tàu"; "sinh ra nó" | Wikipedia, lloyds.com | thiếu ý / vượt nguồn | "sớm nhất được biết"; "hơn 13.000"; "1688: lần đầu được nhắc, nơi mua bán bảo hiểm hàng hải"; bỏ "sinh ra nó" |
| 22 | "Một hợp đồng gồm cả bộ bảy tài liệu" | G11 | vượt nguồn | "Bảy loại tài liệu liên quan" |
| 25 | "STBH là mức trả tối đa" | G13; Đ47 | dễ nhầm: khi trên giá trị thì trần là giá thị trường | "STBH: giới hạn trách nhiệm theo hợp đồng"; giá thị trường "tại thời điểm giao kết" |
| 43 | "người tham gia bảo hiểm" | Đ16 k1 | dễ nhầm: không phải thuật ngữ luật | lời nói: "= bên mua bảo hiểm" |
| 40–41 | Đáp án câu 1, câu 2 | nd 1.7 | chưa chắc | GV chốt |
| 10 | "chắc chắn thì không" | Đ16 k5 | dễ suy rộng: nhân thọ trọn đời chi trả cho sự kiện chắc chắn xảy ra (ý của người thẩm định) | thêm câu lời nói; GV xác nhận |

Lỗi nhỏ, thiếu ý: slide 18 ghi "Độc lập", nguồn là "tương đối độc lập"; slide 19 thiếu "tuổi thọ, khả năng lao động"; slide 37 thiếu "trong giới hạn". Slide 34 lời nói gọi là "nguyên đề" nhưng bỏ chữ "trách nhiệm". Slide 39 "Chọn một trong hai" không có nguồn. Slide 1 "Nghiệp vụ bảo hiểm": chưa chắc tên môn.

**Đã soát**: 46 slide (577 mục chữ, 46 lời nói), khoảng 230 câu chuyên môn. Số liệu Bài 11–12 và các phép tính 120 triệu, 18.000, 70/10 đều đúng.
**Lỗi**: sai 4 · không nguồn 2 · vượt nguồn 4 · thiếu ý 10 · chưa chắc 5 · dễ hiểu nhầm 4.
**Hỏi chuyên gia**: (1) Luật KDBH có cách tính riêng cho 15 ngày ở Đ31 không, hay áp dụng BLDS Đ147–148 (Đ145 k1)? (2) Đ48 có ngoại lệ "thỏa thuận khác" không? Cố ý giao kết trên giá trị thì hậu quả là gì? (3) Đáp án câu 1, câu 2. (4) Phần Luật 139/2025 sửa Đ8 k2 c vẫn ở mức B; dòng 10 của noi-dung.md mâu thuẫn với dòng 5. Tôi không gọi skill vn-legal-exam-analysis vì chỉ được đọc 3 file.
