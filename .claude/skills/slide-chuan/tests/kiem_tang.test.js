const test = require("node:test"), assert = require("node:assert");
const { kiemTang } = require("../hinh/kiem_tang");
const { kiemDeck } = require("../hinh/kiem");
const nhieuChu = Array.from({ length: 10 }, (_, i) => ({ type: "table", title: `t${i}` }));
process.env.SLIDE_CHUAN_NO_PREP = "1";
test("kiem_tang báo chart gantt, meta.style, photo sai type, deck ít cảnh", () => {
  const d = { meta: { style: "portico" }, slides: [{ type: "chart", kind: "gantt" }, { type: "closing", photo: "a.jpg" }, ...nhieuChu] };
  const r = kiemTang(d).join("\n");
  for (const m of ["meta.style", 'chart "gantt"', "`photo` không hiển thị", "chỉ có 0 cảnh"]) assert.ok(r.includes(m), m);
});
test("deck nhiều cảnh và hình dán không bị cảnh báo", () => {
  const canh = ["book", "bigq", "picks", "lawquote", "tiles", "cases"].map((type) => ({ type }));
  const d = { meta: {}, slides: [...canh, { type: "chart", kind: "bar" }, { type: "end", emoji: "waving-hand" }, ...nhieuChu.slice(0, 2)] };
  assert.deepEqual(kiemTang(d), []);
});
test("kiem.js: deck toàn kiểu bc* tự vẽ không bị báo 0 hình", () => {
  const d = { meta: {}, slides: ["bcbia", "bccauhoi", "bcchuong", "bctrich", "bcso", "bcbang"].map((type) => ({ type })) };
  assert.ok(!kiemDeck(d).join("\n").includes("không có ảnh, icon hay sticker"));
});
test("kiem.js: deck 6 slide toàn type thường vẫn bị báo 0 hình", () => {
  const d = { meta: {}, slides: Array.from({ length: 6 }, () => ({ type: "table" })) };
  assert.ok(kiemDeck(d).join("\n").includes("không có ảnh, icon hay sticker"));
});
