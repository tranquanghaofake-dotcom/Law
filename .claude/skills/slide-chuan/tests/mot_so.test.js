// Một con số hai cách ghi trên cùng slide ("800.000" ở tiêu đề, "0,8 triệu" ở số lớn) — người nghe phải đổi đơn vị trong đầu.
const test = require("node:test");
const assert = require("node:assert");
const { validate } = require("../engine/validate");
const cover = { type: "cover", title: "Tiêu đề thử" };
const canhBao = (sl) => validate({ meta: {}, slides: [cover, sl] }).warnings.filter((w) => /hai cách ghi/.test(w));

test("báo: '800.000' và '0,8 triệu' trên cùng slide", () => {
  const w = canhBao({ type: "bignum", title: "Năm 2023, hơn 800.000 người rút BHXH một lần", num: "0,8", unit: "triệu người" });
  assert.strictEqual(w.length, 1, w.join("\n")); assert.match(w[0], /800\.000/); assert.match(w[0], /0,8 triệu/);
});

test("không báo: cùng cách ghi, số khác nhau, năm, số điều luật", () => {
  assert.deepStrictEqual(canhBao({ type: "bignum", title: "Năm 2023, hơn 800.000 người rút BHXH một lần", num: "800.000", unit: "người" }), []);
  assert.deepStrictEqual(canhBao({ type: "bignum", title: "Từ 2015 đến 2025 tăng 6,8 triệu người", num: "18,91", unit: "triệu người" }), []);
  assert.deepStrictEqual(canhBao({ type: "statement", title: "Điều 2000 không có; năm 2000 là năm, 2.000 người là số" }), []);
});

test("\"slide N\" trong chữ phải trỏ tới slide có thật (thêm / bớt slide làm lệch số)", () => {
  const w = (d) => validate({ meta: {}, slides: d }).warnings.filter((x) => /nhắc "slide/.test(x));
  assert.strictEqual(w([cover, { type: "cards", title: "Ba hạn chế", items: [{ name: "A", desc: "Số liệu: slide 9" }] }]).length, 1);
  assert.strictEqual(w([cover, { type: "cards", title: "Ba hạn chế", items: [{ name: "A", desc: "Số liệu: slide 1–2" }] }]).length, 0);
});

test("căn cứ số liệu: con số dẫn \"Số liệu: slide N\" phải có trên slide N (gợi ý, không chặn)", () => {
  const goiY = (so) => validate({ meta: {}, slides: [cover, { type: "stats", title: "Nợ đóng tăng", items: [{ label: "Nợ", value: "3,4%" }] },
    { type: "cards", title: "Ba hạn chế", items: [{ name: "Nợ đóng", desc: `${so} số phải thu (2025) · Số liệu: slide 2` }] }] }).hints.filter((x) => /Số liệu: slide/.test(x));
  assert.strictEqual(goiY("3,4%").length, 0); const h = goiY("9,9%"); assert.strictEqual(h.length, 1); assert.match(h[0], /9,9%/);
});

test("gợi ý: tỉ lệ có 2 chữ số thập phân (1,57) mà chỗ khác ghi gọn thành '1,5×' / '1,5 lần' không có 'hơn / khoảng'", () => {
  const goiY = (slides) => (validate({ meta: {}, slides: [cover, ...slides] }).hints || []).filter((h) => /làm tròn/.test(h));
  const so = { type: "stats", title: "Người đóng tăng 1,57 lần sau mười năm", items: [{ value: "1,57", label: "lần" }] };
  const h = goiY([so, { type: "statement", title: "Số người đóng tăng 1,5 lần sau mười năm" }, { type: "stats", title: "Ghi nhớ ba con số chính", items: [{ value: "1,5×", label: "người đóng" }] }]);
  assert.equal(h.length, 2, h.join("\n")); assert.match(h[0], /^Slide 3: "1,5 lần".*1,57/); assert.match(h[1], /^Slide 4: "1,5×"/);
  assert.deepEqual(goiY([so, { type: "statement", title: "Số người đóng tăng hơn 1,5 lần sau mười năm" }]), [], "có 'hơn' → đã nói là làm tròn");
  assert.deepEqual(goiY([so, { type: "statement", title: "Lương hưu tăng 1,6 lần sau hai mươi năm" }]), [], "1,6 là làm tròn lên đúng — không báo");
});

test("làm tròn: chạy cả trên chữ đã dựng — số do mẫu tự tính (bhtang 12,07 → 18,91 = 1,57) mà thẻ Ghi nhớ ghi '1,5×'", () => {
  process.env.SLIDE_CHUAN_NO_PREP = "1";
  const path = require("path"), { dungHtml } = require("../hinh/dung"), R = path.join(__dirname, "..");
  const goc = require("../examples/so-bhxh/deck.json"), tang = goc.slides.find((s) => s.type === "bhtang"), nho = goc.slides.find((s) => s.type === "bhghinho");
  const sai = { ...nho, chips: nho.chips.map((c, k) => (k === 0 ? { ...c, n: "1,5×" } : c)) };
  const d = { meta: { da: "so-bhxh" }, slides: [{ type: "bhbia", title: "B" }, tang, sai, { type: "bhket", title: "K" }] };
  const q = console.log; console.log = () => {}; let r; try { r = dungHtml(d, { deckDir: path.join(R, "examples", "so-bhxh") }); } finally { console.log = q; }
  assert.ok((r.lamTron || []).some((h) => /^Slide 3: "1,5×" là làm tròn xuống của 1,57/.test(h)), JSON.stringify(r.lamTron));
  const dung = { ...d, slides: [d.slides[0], tang, nho, d.slides[3]] };
  console.log = () => {}; try { r = dungHtml(dung, { deckDir: path.join(R, "examples", "so-bhxh") }); } finally { console.log = q; }
  assert.deepEqual(r.lamTron, [], "bản đã sửa (1,57×) không báo");
});
