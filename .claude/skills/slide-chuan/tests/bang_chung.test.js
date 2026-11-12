const test = require("node:test"), assert = require("node:assert");
const bc = require("../hinh/bang_chung");
const deck = { meta: {}, slides: [] };
test("bcthang: mỗi tội một thanh, có trục, hàng focus và dải chú thích", () => {
  const s = { type: "bcthang", title: "Thang", kicker: "k", focus: 1, note: "ghi chú", rows: [
    { label: "Bậc 1", bars: [{ name: "A", min: 2, max: 7 }, { name: "B", min: 2, max: 7 }] },
    { label: "Bậc 2", bars: [{ name: "A", min: 7, max: 15 }, { name: "B", min: 5, max: 12 }] },
    { label: "Bậc 3", bars: [{ name: "A", min: 12, max: 20, ct: true }, { name: "B", min: 12, max: 20 }] }] };
  const h = bc.render(s, deck, {}, { i: 0, n: 1 })[0].html;
  assert.equal((h.match(/class="bc-bar"/g) || []).length, 6);
  assert.ok(h.includes("bc-fo") && h.includes("hoặc chung thân") && h.includes("ghi chú") && h.includes(">20<"));
});
test("mọi kiểu bc* có hàm vẽ", () => {
  for (const t of bc.TYPES) assert.doesNotThrow(() => bc.render({ type: t, title: "x", items: [], rows: [], cols: [], pairs: [], options: [], chips: [], results: [], team: [] }, deck, {}, { i: 0, n: 1 }), t);
});
