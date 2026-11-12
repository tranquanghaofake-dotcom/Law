const test = require("node:test"), assert = require("node:assert");
const { kiemTang } = require("../hinh/kiem_tang");
const nhieuChu = Array.from({ length: 10 }, (_, i) => ({ type: "table", title: `t${i}` }));
test("báo chart gantt, art, meta.style, photo sai type và deck ít hình", () => {
  const d = { meta: { style: "portico", kit: "bien-ban" }, slides: [{ type: "chart", kind: "gantt" }, { type: "statement", art: "justice" }, { type: "closing", photo: "a.jpg" }, ...nhieuChu] };
  const r = kiemTang(d).join("\n");
  for (const m of ["meta.style", "meta.kit", 'chart "gantt"', "`art`", "`photo` không hiển thị", "Chỉ 1/13", "chỉ có 0 cảnh"]) assert.ok(r.includes(m), m);
});
test("deck nhiều cảnh và hình dán không bị cảnh báo", () => {
  const canh = ["book", "bigq", "picks", "lawquote", "tiles", "cases"].map((type) => ({ type }));
  const d = { meta: {}, slides: [...canh, { type: "chart", kind: "bar" }, { type: "end", emoji: "waving-hand" }, ...nhieuChu.slice(0, 2)] };
  assert.deepEqual(kiemTang(d), []);
});
test("lawquote dùng art làm số điều lớn nên không bị báo", () => {
  const d = { meta: {}, slides: [{ type: "lawquote", art: "174" }] };
  assert.ok(!kiemTang(d).join("\n").includes("`art`"));
});
