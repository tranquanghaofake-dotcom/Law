// NỀN TRẮNG LÀ MẶC ĐỊNH (l); nền tối (d) chỉ dùng cho thẻ nhấn bên trong slide hoặc khi deck ghi mode "d".
// gold = màu viền vàng của hoạ tiết phong cảnh.
// MÀU CHỮ PHẢI ĐẠT TƯƠNG PHẢN ≥ 4.5:1 trên mọi nền nó nằm lên (build kiểm tự động — máy chiếu làm nhạt màu hơn màn hình).
// 6 bộ giao diện cố định (teal, kem, son + toa, xanh, muc — đợt 11/2026). Mỗi theme có bảng màu cho trang tối (d), trang sáng (l) và trang nền màu nhấn (a — dùng cho slide chuyển phần / khoảnh khắc then chốt, tối đa ~3 slide/deck).
// Thêm theme mới: sao chép một khối, đổi màu/font, giữ nguyên tên khoá.
//
// VỀ FONT (đừng đổi tuỳ tiện): chỉ dùng font có sẵn trong Office VÀ có bản thay thế cùng độ rộng, đủ dấu tiếng Việt, trên Linux:
//   Calibri -> Carlito | Arial -> Liberation Sans | Times New Roman -> Liberation Serif.
// Trước đây dùng Cambria: LibreOffice thay bằng Caladea, mà Caladea thiếu 44/58 ký tự Việt (ơ ư ạ ả ấ ầ ... ự),
// nên bị vá từng glyph bằng DejaVu Serif -> ảnh soát sai chữ và sai độ rộng (kiểm tràn không tin được).
// Kiểm: `pdffonts <file>.pdf` không được có DejaVu. Font đo chữ lúc dựng: engine/measure.js.
module.exports = {
  // Học từ mẫu "Modern Law Firm" (Pinterest): teal đậm + bạc hà, chữ thường xen từ khoá nghiêng có chân.
  teal: {
    name: "Teal luật sư",
    titleFont: "Calibri", titleBold: false, bodyFont: "Calibri",
    accentFont: "Times New Roman", accentItalic: true, accentBold: false,
    numFont: "Times New Roman", numItalic: true, radius: 0.14, caps: false, gold: "C9A45C",
    d: { bg: "0E3A3B", deep: "0A2C2D", card: "134849", line: "3F7472", acc: "BFE6D9", text: "F3F8F6", muted: "A9C9C1", bad: "F2A7A0", good: "BFE6D9", onAcc: "0E3A3B" },
    l: { bg: "FFFFFF", deep: "EAF4F0", card: "FFFFFF", line: "CFE3DC", acc: "1E6B62", text: "0E3A3B", muted: "4F6F6A", bad: "A94338", good: "1E6B62", onAcc: "FFFFFF" },
    a: { bg: "BFE6D9", deep: "A8DACA", card: "D8F0E8", line: "8CC4B3", acc: "0E3A3B", text: "0E3A3B", muted: "2F5F58", bad: "A63D33", good: "0E3A3B", onAcc: "BFE6D9" },
  },
  // Học từ mẫu "Rule of Law" / tạp chí pháp lý: nền kem, navy, vàng đồng, tiêu đề chữ có chân.
  kem: {
    name: "Kem tạp chí",
    titleFont: "Times New Roman", titleBold: false, bodyFont: "Calibri",
    accentFont: "Times New Roman", accentItalic: true, accentBold: false,
    numFont: "Times New Roman", numItalic: false, radius: 0.04, caps: false, gold: "B8934A",
    d: { bg: "1B2A41", deep: "14203A", card: "24354F", line: "3E5370", acc: "D4B483", text: "F7F2EA", muted: "B9C2D0", bad: "E8A091", good: "D4B483", onAcc: "1B2A41" },
    l: { bg: "FFFDF8", deep: "F4ECDD", card: "FFFFFF", line: "E3D7C2", acc: "806431", text: "1B2A41", muted: "6B6457", bad: "A4442F", good: "2F6B4F", onAcc: "FFFFFF" },
    a: { bg: "D4B483", deep: "C9A770", card: "E3CCA4", line: "B8975F", acc: "1B2A41", text: "1B2A41", muted: "4A4235", bad: "8C3424", good: "1B2A41", onAcc: "D4B483" },
  },
  // Học từ mẫu tối giản kiểu Thuỵ Sĩ: trắng/đen, một màu cam son, chữ đậm lớn.
  son: {
    name: "Tối giản cam son",
    titleFont: "Arial", titleBold: true, bodyFont: "Arial",
    accentFont: "Arial", accentItalic: false, accentBold: true,
    numFont: "Arial", numItalic: false, radius: 0, caps: false, gold: "FF5A36",
    d: { bg: "141414", deep: "000000", card: "222222", line: "3A3A3A", acc: "FF5A36", text: "FFFFFF", muted: "A6A6A6", bad: "FF5A36", good: "FFFFFF", onAcc: "141414" },
    l: { bg: "FFFFFF", deep: "F0F0F0", card: "F4F4F4", line: "D9D9D9", acc: "C5371B", text: "141414", muted: "5C5C5C", bad: "BC3419", good: "141414", onAcc: "FFFFFF" },
    a: { bg: "FF5A36", deep: "F04A26", card: "FF7655", line: "FF9C86", acc: "141414", text: "141414", muted: "3D1A10", bad: "FFFFFF", good: "141414", onAcc: "FF5A36" },
  },
  // Học từ văn bản hành chính – toà án Việt Nam (quốc huy đỏ – vàng) và bìa sách luật bìa cứng: đỏ sẫm + vàng đồng, tiêu đề có chân.
  // Hợp: bình luận bản án, phiên toà giả định, văn bản nhà nước. Không hợp: chủ đề nhẹ, startup.
  toa: {
    name: "Toà án đỏ – vàng",
    titleFont: "Times New Roman", titleBold: true, bodyFont: "Calibri",
    accentFont: "Times New Roman", accentItalic: true, accentBold: true,
    numFont: "Times New Roman", numItalic: false, radius: 0.02, caps: false, gold: "C8A04A",
    d: { bg: "3B0D0D", deep: "2C0909", card: "4A1515", line: "6E2E2E", acc: "E7C27A", text: "FBF4EA", muted: "D7BFA8", bad: "F3A28F", good: "E7C27A", onAcc: "3B0D0D" },
    l: { bg: "FFFFFF", deep: "F7EFE6", card: "FFFFFF", line: "E6D3C0", acc: "7A1A1A", text: "2A1A14", muted: "6A5548", bad: "B23A1E", good: "2F5D3A", onAcc: "FFFFFF" },
    a: { bg: "E7C27A", deep: "DDB466", card: "EFD39E", line: "C9A35A", acc: "3B0D0D", text: "3B0D0D", muted: "5A3A1E", bad: "7A1A1A", good: "3B0D0D", onAcc: "E7C27A" },
  },
  // Học từ báo cáo doanh nghiệp / ngân hàng (bento, KPI): xanh dương tươi, chữ không chân đậm, bo góc vừa.
  // Hợp: báo cáo số liệu, tài chính – bảo hiểm, pháp chế doanh nghiệp. Không hợp: bản án, chủ đề trang trọng cổ điển.
  xanh: {
    name: "Xanh doanh nghiệp",
    titleFont: "Calibri", titleBold: true, bodyFont: "Calibri",
    accentFont: "Calibri", accentItalic: false, accentBold: true,
    numFont: "Calibri", numItalic: false, radius: 0.12, caps: false, gold: "F2B43C",
    d: { bg: "0F1E3A", deep: "0A1530", card: "16284A", line: "2E4470", acc: "8DB4FF", text: "F4F7FD", muted: "B4C2DB", bad: "FDA29B", good: "8DB4FF", onAcc: "0F1E3A" },
    l: { bg: "FFFFFF", deep: "EEF3FB", card: "FFFFFF", line: "D3DFF1", acc: "1D4ED8", text: "0F1E3A", muted: "4A5A74", bad: "B42318", good: "1A7F37", onAcc: "FFFFFF" },
    a: { bg: "8DB4FF", deep: "7AA5F7", card: "A9C6FF", line: "6A97EA", acc: "0F1E3A", text: "0F1E3A", muted: "23375E", bad: "8A1C12", good: "0F1E3A", onAcc: "8DB4FF" },
  },
  // Học từ trang tạp chí khoa học / giáo trình in: giấy trắng, chữ có chân toàn bài, một màu mực xanh.
  // Hợp: khoá luận, NCKH, bài giảng lý thuyết. Không hợp: thuyết trình bán hàng, cuộc thi khởi nghiệp.
  muc: {
    name: "Giấy và mực học thuật",
    titleFont: "Times New Roman", titleBold: false, bodyFont: "Times New Roman",
    accentFont: "Times New Roman", accentItalic: true, accentBold: false,
    numFont: "Times New Roman", numItalic: true, radius: 0.02, caps: false, gold: "8C7A55",
    d: { bg: "1F2430", deep: "171B24", card: "2A303D", line: "434B5C", acc: "C9D6EA", text: "F5F3EE", muted: "B9BCC4", bad: "F0A3A3", good: "C9D6EA", onAcc: "1F2430" },
    l: { bg: "FFFFFF", deep: "F3F1EC", card: "FFFFFF", line: "DCD8CF", acc: "2B4C7E", text: "1C1C1C", muted: "595650", bad: "9B2C2C", good: "2B4C7E", onAcc: "FFFFFF" },
    a: { bg: "C9D6EA", deep: "B7C7E0", card: "DCE5F2", line: "A3B6D4", acc: "1F2430", text: "1F2430", muted: "3B4558", bad: "7D2020", good: "1F2430", onAcc: "C9D6EA" },
  },
};
