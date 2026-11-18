// Chống vẻ "AI" + khối chìm + viết tắt chưa định nghĩa (bài Nhóm 2, 18/11/2026 — Hào: "bảng, textbox, đồ thị còn AI, xấu,
// bị ẩn đi với môi trường"; "nội dung khó hiểu").
const test = require("node:test"), assert = require("node:assert");
const { danhGiaChongAI, vietTatChuaDinhNghia } = require("../scripts/chong_ai");

const THE = { bangMau: ["#FFFFFF"] };
const k = (o = {}) => ({ ten: "the", dt: 0.05, tpNen: 1.05, tpVien: 0, vien: 0, bo: 0, bong: false, ...o });
const sl = (n, o = {}) => ({ slide: n, khoi: [], chipInHoa: 0, chu: [], ...o });

test("khối chìm: nền khối gần như trùng nền dưới, không viền rõ → bắt; tách bằng viền ≥ 3 : 1 hoặc nền ≥ 3 : 1 → không bắt", () => {
  const r = danhGiaChongAI([sl(1, { khoi: [k(), k({ ten: "vien", vien: 2, tpVien: 4.5 }), k({ ten: "dam", tpNen: 9 })] })], THE);
  const all = r.loi.join("\n");
  assert.match(all, /khối chìm.*slide 1.*the/); assert.doesNotMatch(all, /vien|dam/);
});

test("khối nhỏ (< 1,5 % slide) và hình trang trí không xét", () => {
  assert.deepStrictEqual(danhGiaChongAI([sl(1, { khoi: [k({ dt: 0.01 }), k({ trangTri: true })] })], THE).loi, []);
});

test("vẻ AI: bo góc lớn, bóng đổ, nhiều nhãn in hoa giãn chữ trên một slide → bắt; thẻ cho phép bo góc riêng", () => {
  const r = danhGiaChongAI([sl(2, { khoi: [k({ tpNen: 9, bo: 20, bong: true })], chipInHoa: 3 })], THE);
  const all = r.loi.join("\n");
  assert.match(all, /bo góc 20 px/); assert.match(all, /bóng đổ/); assert.match(all, /3 nhãn in hoa/);
  assert.deepStrictEqual(danhGiaChongAI([sl(2, { khoi: [k({ tpNen: 9, bo: 10 })] })], { ...THE, boGocToiDa: 12 }).loi, []);
});

test("viết tắt chưa định nghĩa: bắt NĐBH; bỏ qua khi đã giải thích trong deck, có trong thẻ vietTat, hoặc là số hiệu văn bản", () => {
  assert.deepStrictEqual(vietTatChuaDinhNghia(["Người thụ hưởng nhận tiền khi NĐBH tử vong"], {}), ["NĐBH"]);
  assert.deepStrictEqual(vietTatChuaDinhNghia(["Người được bảo hiểm (NĐBH)", "khi NĐBH tử vong"], {}), []);
  assert.deepStrictEqual(vietTatChuaDinhNghia(["Nộp qua OTP"], { OTP: "mã xác thực một lần" }), []);
  assert.deepStrictEqual(vietTatChuaDinhNghia(["Nghị định 46/2023/NĐ-CP, Thông tư 67/2023/TT-BTC, Luật 08/2022/QH15"], {}), []);
  assert.deepStrictEqual(vietTatChuaDinhNghia(["Chương II", "Điều IV"], {}), []);
});

test("không có thẻ phong cách → không kiểm; thẻ tắt chongAI → chỉ còn khối chìm và viết tắt", () => {
  assert.deepStrictEqual(danhGiaChongAI([sl(1, { khoi: [k()] })], null).loi, []);
  const r = danhGiaChongAI([sl(1, { khoi: [k({ tpNen: 9, bo: 30 })], chipInHoa: 5 })], { ...THE, chongAI: false });
  assert.deepStrictEqual(r.loi, []);
});
