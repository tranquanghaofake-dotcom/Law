// Kiểm số liệu (18/11/2026): số nặng trên slide phải có trong noi-dung.md.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { kiemSoLieu, laySo, chuChieu } = require("../scripts/kiem_so_lieu");

test("lấy số nặng: thập phân, nghìn, %, ngày, số hiệu văn bản; bỏ số nguyên trơn và dấu ±≈", () => {
  const s = laySo("Năm 2023 giảm −8,02 %; thiệt hại 12.811 tỷ; ≈ 7,5 %; 30 % phí; Luật 32/2024/QH15 hiệu lực 01/7/2024; 13 điều");
  for (const x of ["8,02%", "12.811", "7,5%", "30%", "32/2024/QH15", "01/7/2024"]) assert.ok(s.includes(x), x);
  assert.ok(!s.includes("2023") && !s.includes("13"));
});

test("chữ chiếu: không lấy data-notes, alt; giữ [12]", () => {
  const c = chuChieu('<section data-notes="giảm 99,9 %"><img data-alt="44,4 %"><div>tăng 15,1 % &#91;12&#93;</div></section>');
  assert.match(c, /15,1/); assert.doesNotMatch(c, /99,9|44,4/); assert.match(c, /\[12\]/);
});

test("báo slide có số không truy được; số có trong noi-dung.md thì qua", () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "ksl-")); fs.mkdirSync(path.join(d, "slides"));
  fs.writeFileSync(path.join(d, "noi-dung.md"), "| 2023 | 227.134 tỷ, −8,02 % |");
  fs.writeFileSync(path.join(d, "slides", "01.html"), '<section class="s"><div>−8,02 %</div></section>');
  fs.writeFileSync(path.join(d, "slides", "02.html"), '<section class="s"><div>+15 – 20 % mỗi năm</div></section>');
  const l = kiemSoLieu(d);
  assert.strictEqual(l.length, 1); assert.match(l[0], /slide 2 .*“20%”/);
});
