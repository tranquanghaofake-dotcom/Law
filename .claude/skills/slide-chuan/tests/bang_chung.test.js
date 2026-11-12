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
test("chế độ A không Morph (không data-m), chế độ B có; đinh và con dấu là lớp riêng có hiệu ứng", () => {
  const mk = (bcm) => ({ meta: bcm ? { bc: bcm } : {}, slides: [] }), s = { type: "bctrich", title: "T", ch: 1, quote: "q", art: "174", stamp: "Khoản 1" };
  const a = bc.render(s, mk("A"), {}, { i: 3, n: 9 })[0], b = bc.render(s, mk("B"), {}, { i: 3, n: 9 })[0];
  assert.ok(!a.html.includes("data-m="), "A: không ghép Morph");
  assert.ok(b.html.includes('data-m="tieu"'), "B: có ghép Morph");
  for (const h of [a.html, b.html]) {
    assert.ok(/data-l="pin-[^"]+"[^>]*data-a="slam"/.test(h), "đinh là lớp riêng, đóng bằng slam");
    assert.ok(h.includes('data-l="bc-khoan"') && h.includes('data-a="stamp"'), "con dấu là lớp riêng, đóng bằng stamp");
  }
  assert.ok(a.dur < b.dur, "A chuyển cảnh gọn hơn B");
  assert.ok(/data-l="bc-tieu"[^>]*data-a="rise"/.test(a.html), "A: tờ tiêu đề vào nhẹ (rise)");
  assert.ok(!/data-l="bc-tieu"[^>]*data-a=/.test(b.html), "B: tờ tiêu đề là đích Morph nên không có hiệu ứng vào");
});
test("chế độ C (mặc định): không hiệu ứng vào nào, còn các cặp Morph có nghĩa, không ghép q1–q3", () => {
  const d = { meta: {}, slides: [] };
  const hs = [["bcbia", { cites: [{ n: "1", t: "t" }] }], ["bccauhoi", { items: [{ q: "q" }] }], ["bcso", { left: { items: ["a"] }, right: { items: ["b"] }, mid: {} }], ["bcchuong", { num: 1 }]]
    .map(([type, x], i) => bc.render({ type, title: "T", ch: 1, ...x }, d, {}, { i, n: 9 })[0].html);
  for (const h of hs) { assert.ok(!/data-a=/.test(h), "không data-a"); assert.ok(!/data-em=/.test(h), "không data-em"); assert.ok(!/data-m="q\d/.test(h), "không ghép q1–q3"); }
  assert.ok(hs[3].includes('data-m="tieu"') && hs[3].includes('data-m="chuong"'));
  assert.ok(hs[2].includes('data-m="ranh"'));
  assert.equal(bc.render({ type: "bcchuong", num: 1, title: "T" }, d, {}, { i: 0, n: 2 })[0].dur, 900);
});
test("bcsan: dàn nhân vật dùng chung tên Morph ở mọi slide, vị trí do từng slide khai báo", () => {
  const d = { meta: {}, slides: [] }, cast = (x) => ({ A: { x: 120, y: 330 }, B: { x: 1560, y: 330 }, tui: { x, y: 470, label: "300 triệu" }, yd: { x: 880, y: 285, label: "Ý định" } });
  const a = bc.render({ type: "bcsan", title: "T", ch: 1, cast: cast(830) }, d, {}, { i: 2, n: 6 })[0].html, b = bc.render({ type: "bcsan", title: "T", ch: 1, cast: cast(1060) }, d, {}, { i: 3, n: 6 })[0].html;
  for (const k of ["ca-A", "ca-B", "ca-tui", "ca-yd"]) assert.ok(a.includes(`data-m="${k}"`) && b.includes(`data-m="${k}"`), k);
  assert.ok(a.includes("left:830px") && b.includes("left:1060px"), "mỗi slide một vị trí túi tiền");
  assert.ok(!/data-a=/.test(a) && !/data-a=/.test(b), "chế độ gọn: không hiệu ứng vào");
});
