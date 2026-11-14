// Bộ hình BHXH — "mỗi chi tiết một lý do" (references/canh.md mục 10): các luật về nghĩa của chi tiết nhỏ.
const test = require("node:test");
const assert = require("node:assert");
const bh = require("../hinh/so_bhxh");

const ctx = { img: (p) => (p ? `data:image/png;base64,${Buffer.from(p).toString("base64")}` : ""), emoji: () => "", hasEmoji: () => false };
const slide = (s, deck = { meta: { hinh: { nenAnh: false } }, slides: [s] }) => bh.render(s, deck, ctx, { i: deck.slides.indexOf(s), n: deck.slides.length }).map((x) => x.html);
const hop = (html, ten) => { const m = html.match(new RegExp(`data-l="${ten}"[^>]*style="left:(-?\\d+)px;top:(-?\\d+)px;width:(\\d+)px;height:(\\d+)px`)); return m && { x: +m[1], y: +m[2], w: +m[3], h: +m[4] }; };

test("viên nhãn bỏ tiền tố 'Phần N ·' — dải đầu đã ghi phần", () => {
  const s = { type: "bhtrich", kicker: "Phần 1 · Khái niệm", title: "BHXH bắt buộc", quote: "x", by: "Khoản 3 Điều 3" };
  const h = slide(s)[0];
  assert.match(h, />Khái niệm</);
  assert.doesNotMatch(h, /Phần 1 · Khái niệm/);
});

test("chấm chú thích biểu đồ: năm tăng không mang màu đỏ, năm giảm mang màu đỏ", () => {
  const s = { type: "bhcot2", title: "Số người", unit: "triệu người", grow: false, items: [{ label: "2021", value: 15.8 }, { label: "2022", value: 15.05, why: "COVID" }, { label: "2023", value: 16.8, why: "Phục hồi" }] };
  const h = slide(s)[0];
  const cham = (j) => (h.match(new RegExp(`data-l="bh-wc${j}"[\\s\\S]*?<circle[^>]*fill="#([0-9a-f]{6})"`)) || [])[1];
  assert.strictEqual(cham(0), "d63b2f", "2022 giảm → đỏ");
  assert.notStrictEqual(cham(1), "d63b2f", "2023 tăng → không đỏ");
});

test("ba câu hỏi: dải của Phần 3 không đỏ; mọi dải nằm trong chiều cao bìa sổ", () => {
  const s = { type: "bhba", title: "Ba câu hỏi", items: [{ q: "Ai phải đóng?" }, { q: "Bao nhiêu người đóng?" }, { q: "Cần sửa gì?" }] };
  const h = slide(s)[0], so = hop(h, "bh-baso");
  assert.ok(so, "có sổ");
  const the3 = h.match(/data-l="bh-ba2"[\s\S]*?<\/svg>/)[0], dai3 = h.match(/data-l="bh-tab2"[\s\S]*?<\/svg>/)[0];
  assert.ok(!/d63b2f|ff6b5e|c9301f/.test(the3 + dai3), "phần 3 không dùng đỏ");
  const tren = so.y + so.h * (40 / 640), duoi = so.y + so.h * (560 / 640);
  for (const k of [0, 1, 2]) { const d = hop(h, `bh-tab${k}`); assert.ok(d.y >= tren - 2 && d.y + d.h <= duoi + 2, `dải ${k} (${d.y}–${d.y + d.h}) trong bìa (${Math.round(tren)}–${Math.round(duoi)})`); }
});

test("hạn chế: ba dải cùng đỏ, không còn biển cảnh báo trùng trên sổ", () => {
  const s = { type: "bhhanche", title: "Ba hạn chế", items: [{ name: "Rút một lần", desc: "a" }, { name: "Nợ, trốn đóng", desc: "b" }, { name: "Ngoài hệ thống", desc: "c" }] };
  const h = slide(s)[0];
  assert.doesNotMatch(h, /bh-hccb/);
  const mau = [0, 1, 2].map((k) => (h.match(new RegExp(`data-l="bh-tab${k}"[\\s\\S]*?stop-color="#([0-9a-f]{6})"`)) || [])[1]);
  assert.ok(mau.every((m) => m === mau[0]), `ba dải cùng màu: ${mau}`);
});

test("ảnh đã có vật thật thì không đặt vật vẽ ở tiền cảnh", () => {
  const s = { type: "bhdo", kicker: "Câu hỏi của bài", lines: ["Mười năm"], box: "đi bao xa?", photo: "images/so.jpg" };
  assert.doesNotMatch(slide(s)[0], /bh-p-so/);
});

test("mốc hưu: bước 1 (luật cũ) chưa có thẻ trích Điều 64 Luật 2024, bước 2 mới có", () => {
  const s = { type: "bhrutngan", title: "Mốc lương hưu", cols: [{ n: 20, label: "Luật 2014" }, { n: 15, label: "Luật 2024" }], ref: { head: "Điều 64", text: "từ đủ 15 năm" } };
  const [b1, b2] = slide(s);
  assert.doesNotMatch(b1, /bh-ref"/);
  assert.match(b2, /bh-ref"/);
});

test("thanh tiến độ: khe rộng giữa hai phần", () => {
  const deck = { meta: { hinh: { nenAnh: false } }, slides: [{ type: "bhtrich", title: "a", quote: "q" }, { type: "bhchuong", num: 1, part: "Luật", title: "b" }, { type: "bhtrich", title: "c", quote: "q" }] };
  const h = slide(deck.slides[2], deck)[0], xs = [...h.match(/data-l="bh-tiendo"[\s\S]*?<\/svg>/)[0].matchAll(/<rect x="([\d.]+)"[^>]*width="([\d.]+)"/g)].map((m) => [+m[1], +m[2]]);
  assert.strictEqual(xs.length, 3);
  const khe = (k) => xs[k + 1][0] - (xs[k][0] + xs[k][1]);
  assert.ok(khe(0) > khe(1) || khe(0) > 5, `khe giữa Mở đầu và Phần 1 rộng (${khe(0).toFixed(1)})`);
});
