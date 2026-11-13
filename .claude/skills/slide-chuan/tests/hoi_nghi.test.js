// Bộ hình "bàn hội nghị quốc tế" (hinh/hoi_nghi.js) — Công pháp quốc tế, tầng hình ảnh.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), path = require("path");
const qt = require("../hinh/hoi_nghi");
const deck = { meta: { short: "Công pháp quốc tế" }, slides: [] };
const r = (s, i = 1, n = 9) => qt.render(s, deck, {}, { i, n })[0];

test("mọi kiểu qt* có hàm vẽ và không có hiệu ứng vào (chế độ gọn)", () => {
  for (const t of qt.TYPES) {
    const h = r({ type: t, title: "Tiêu đề", kicker: "k", num: 1, part: "P", items: [{ name: "A", who: "w", desc: "d" }] }).html;
    assert.ok(h.includes('class="s dark qt"'), `${t}: nền bàn hội nghị`);
    assert.ok(!/data-a=/.test(h), `${t}: không data-a`);
  }
});

test("Morph có nghĩa: tờ văn kiện 'tieu' ở bìa, mở chương, bàn họp; dấu xi chương mang tên 'chuong'", () => {
  const bia = r({ type: "qtbia", title: "T" }, 0).html, ch = r({ type: "qtchuong", num: 2, title: "T", part: "P" }, 1).html, ban = r({ type: "qtban", title: "T", items: [{ name: "A" }] }, 2).html;
  for (const h of [bia, ch, ban]) assert.ok(h.includes('data-m="tieu"'));
  assert.ok(ch.includes('data-m="chuong"') && ch.includes(">II<"), "dấu xi chương mang số La Mã");
});

test("qtban: một bảng tên mỗi mục, bảng focus nổi, nhãn 'who' không xuống dòng, cờ để bàn khác màu nhau", () => {
  const items = [{ name: "Quốc gia", who: "Chủ thể cơ bản", desc: "d" }, { name: "Tổ chức quốc tế", who: "Chủ thể phái sinh" }, { name: "Dân tộc tự quyết", who: "Đấu tranh giành độc lập" }, { name: "Chủ thể đặc biệt", who: "Toà thánh" }];
  const h = r({ type: "qtban", title: "T", items, focus: 0 }).html;
  assert.equal((h.match(/class="qt-np[ "]/g) || []).length, 4);
  assert.equal((h.match(/class="qt-np on"/g) || []).length, 1);
  assert.ok(/font-size:18px;letter-spacing:\.07em;white-space:nowrap/.test(h), "nhãn who một dòng");
  const mau = [...h.matchAll(/class="qt-co" data-l="s\d+-co\d"[\s\S]*?<path d="M[^"]+" fill="(#[0-9a-f]+)"/g)].map((m) => m[1]);
  assert.equal(mau.length, 4, "bắt được màu 4 lá cờ");
  assert.equal(new Set(mau).size, mau.length, "mỗi ghế một màu cờ");
});

test("cờ trừu tượng: không có hình tròn giữa nền trơn (dễ trùng cờ thật, đã gặp: giống cờ Nhật Bản)", () => {
  const h = r({ type: "qtbia", title: "T" }, 0).html, co = h.slice(h.indexOf('class="qt-co"'), h.indexOf("</svg>", h.indexOf('class="qt-co"')));
  assert.ok(co.length > 100 && !/<circle cx="[\d.]+" cy="[\d.]+" r="[\d.]+" fill="#(?!e6c877)/.test(co), "chỉ được có núm đầu cột tròn (#e6c877)");
});

test("bản đồ thế giới dạng chấm có Hoàng Sa, Trường Sa và ghi nguồn Natural Earth", () => {
  const m = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "hinh", "the_gioi_cham.json"), "utf8"));
  for (const p of ["M1556 359h0", "M1570 388h0"]) assert.ok(m.d.includes(p), `thiếu chấm ${p}`);
  assert.match(m.nguon, /Natural Earth/);
  assert.ok(qt.css.includes("data:image/svg+xml;base64,"), "nền dùng bản đồ chấm");
});
