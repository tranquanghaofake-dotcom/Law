// Bút dạ quang trên văn bản thật (18/11/2026): tìm cụm từ theo toạ độ chữ của pdftotext -bbox-layout, kể cả vắt dòng.
const test = require("node:test"), assert = require("node:assert");
const { docBbox, timCau, vungVaVet } = require("../scripts/danh_dau");

const w = (x0, y0, t) => `<word xMin="${x0}" yMin="${y0}" xMax="${x0 + 40}" yMax="${y0 + 12}">${t}</word>`;
const XHTML = `<page width="600" height="800"><flow><block xMin="0"><line xMin="0">${w(100, 100, "Điều")}${w(150, 100, "4.")}</line></block>
<block xMin="0"><line xMin="0">${w(100, 200, "Hợp")}${w(150, 200, "đồng")}${w(200, 200, "sẽ")}${w(250, 200, "tự")}${w(300, 200, "động")}</line><line xMin="0">${w(100, 220, "hủy")}${w(150, 220, "bỏ")}${w(200, 220, "trừ")}${w(250, 220, "khi")}</line></block></flow></page>`;

test("đọc trang → khối → dòng → chữ", () => {
  const t = docBbox(XHTML);
  assert.strictEqual(t.length, 1); assert.strictEqual(t[0].khoi.length, 2); assert.strictEqual(t[0].khoi[1].length, 2);
});

test("tìm cụm từ vắt qua hai dòng, bỏ dấu câu, không phân biệt hoa thường; không thấy → null", () => {
  const t = docBbox(XHTML), r = timCau(t, "Tự động hủy bỏ");
  assert.deepStrictEqual(r.dong, [0, 1]);
  assert.deepStrictEqual(r.hop[0], { x0: 250, y0: 200, x1: 340, y1: 212 });
  assert.strictEqual(timCau(t, "huỷ bỏ"), null);   // khác chính tả → phải chép đúng tài liệu
});

test("vùng cắt bao trọn khối, vệt dạ quang quy về tỉ lệ 0–1 của vùng cắt", () => {
  const t = docBbox(XHTML), v = vungVaVet(t, [timCau(t, "tự động hủy bỏ")]);
  assert.strictEqual(v.trang, 1);
  assert.ok(v.vung.x < 100 / 600 && v.vung.y < 200 / 800);
  assert.strictEqual(v.vet[0].length, 2);
  for (const h of v.vet[0]) assert.ok(h.x >= 0 && h.y >= 0 && h.x + h.w <= 1 && h.y + h.h <= 1);
});

test("cắt ± le dòng: lề dưới dừng giữa khoảng trống tới dòng kế, không dính dòng bị bỏ", () => {
  const t = docBbox(XHTML), v = vungVaVet(t, [timCau(t, "Hợp đồng")], 0);
  assert.ok(v.vung.y + v.vung.h <= (212 + 220) / 2 / 800 + 1e-9);
});

test("--them: lấy kèm khối liền sau (gạch đầu dòng)", () => {
  const t = docBbox(XHTML), q = timCau(t, "Điều 4"), v = vungVaVet(t, [q], null, 10, 2, 1);
  assert.ok(v.vung.y + v.vung.h > 220 / 800);
});
