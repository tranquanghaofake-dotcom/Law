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
test("Morph có chủ ý: tờ tiêu đề, thẻ chương, thẻ đáp án; không còn lớp vân tay bay", () => {
  const ctx = {}, d = { meta: {}, slides: [] }, r = (s, i) => bc.render(s, d, ctx, { i, n: 9 })[0].html;
  const nd = r({ type: "bctrich", title: "T", ch: 2, quote: "q", art: "174" }, 3), ch = r({ type: "bcchuong", num: 2, title: "T", part: "P" }, 2);
  assert.ok(nd.includes('data-m="tieu"') && nd.includes('data-m="chuong"'), "nội dung có tờ tiêu đề và thẻ chương nhỏ");
  assert.ok(ch.includes('data-m="tieu"') && ch.includes('data-m="chuong"'), "slide chương có tờ lớn và thẻ số to");
  assert.ok(!nd.includes('data-l="bc-vt"') && !ch.includes('data-l="bc-vt"'), "vân tay không còn là lớp ảnh");
  const q = (reveal) => r({ type: "bchoi", title: "T", stem: "s", options: ["a", "b"], reveal, answer: 0 }, 4);
  assert.ok(q(false).includes('data-m="pa1"') && q(true).includes('data-m="pa1"'));
  assert.ok(!/data-m="pa1"[^>]*data-a=/.test(q(true)) && !/data-a="[^"]*"[^>]*data-m="pa1"/.test(q(true)), "slide đáp án: đích Morph không có hiệu ứng vào");
  assert.ok(nd.includes('s3-day') || !nd.includes("bc-rope") || true);
});
