// Test type hub (một tâm + 4–6 yếu tố) và pin (câu chính trên giấy ghim — tự tìm chỗ, không đủ thì báo).
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, buildDeck, tmpdir, cover } = require("./helpers");
function imgDir() { const dir = tmpdir(); fs.mkdirSync(path.join(dir, "images"));
  for (const f of fs.readdirSync(path.join(ROOT, "examples", "images"))) fs.copyFileSync(path.join(ROOT, "examples", "images", f), path.join(dir, "images", f)); return dir; }
const DA = require("../hinh/da");
const EX = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "hub_pin.json"), "utf8"));
const withDa = (k) => Object.assign({}, EX, { meta: Object.assign({}, EX.meta, { da: k }) });
const xmlOf = async (pptx, n) => (await JSZip.loadAsync(fs.readFileSync(pptx))).file(`ppt/slides/slide${n}.xml`).async("string");
const text = (x) => [...x.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(m => m[1]).join(" ").replace(/ /g, " ");

test("hub_pin.json qua --strict ở 3 da chung", () => {
  const DIR = imgDir();
  for (const k of ["ho-so", "giay", "kinh"]) { const r = buildDeck(withDa(k), ["--strict"], DIR); assert.strictEqual(r.code, 0, `${k}:\n${r.all}`); }
});

// pin từng bị bỏ qua âm thầm sau khi bỏ tầng Office (validate.js vẫn kiểm nhưng không vẽ) — quét --soat 11/2026
test("pin: tờ giấy ghim hiện trên slide, không đè thẻ / chữ; hết chỗ thì ẩn và kiemTran báo", { skip: (() => { try { require.resolve("playwright"); return false; } catch { return "không có Playwright"; } })(), timeout: 120000 }, async () => {
  const { chromium } = require("playwright"), os = require("os"); process.env.SLIDE_CHUAN_NO_PREP = "1";
  const { dungHtml, kiemTran } = require("../hinh/dung");
  const exe = process.env.PW_CHROMIUM || ["/opt/pw-browsers/chromium"].find((p) => fs.existsSync(p));
  const b = await chromium.launch(exe ? { executablePath: exe } : {}), page = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  const mo = async (d) => { const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "ghim-")), "deck.html"); fs.writeFileSync(f, dungHtml(d, { deckDir: ROOT }).html); await page.goto("file://" + f); await page.evaluate(() => window.hinhSanSang); };
  try {
    for (const k of ["ho-so", "giay", "kinh"]) {
      await mo(withDa(k));
      const q = await page.evaluate(() => { const g = document.querySelector(".ghim-giay"); const r = g.getBoundingClientRect(), S = g.closest("section.s"), B = S.getBoundingClientRect();
        const dam = [...S.querySelectorAll(".card, .h, .k")].filter((e) => { const c = e.getBoundingClientRect(); return c.left < r.right && c.right > r.left && c.top < r.bottom && c.bottom > r.top; }).map((e) => e.className);
        return { an: getComputedStyle(g).display === "none", chu: g.textContent, trong: r.left >= B.left && r.right <= B.right && r.bottom <= B.bottom, dam }; });
      assert.ok(!q.an && /Giả tạo thì vô hiệu/.test(q.chu) && /Điều 124/.test(q.chu), `${k}: tờ giấy ghim phải hiện đủ câu và nguồn (${JSON.stringify(q)})`);
      assert.ok(q.trong && q.dam.length === 0, `${k}: tờ giấy ghim nằm trong slide, không đè thẻ / tiêu đề (${JSON.stringify(q)})`);
    }
    const day = { meta: { da: "giay" }, slides: [cover, { type: "table", title: "Bảng dày kín slide", head: ["A", "B"], rows: Array.from({ length: 7 }, (_, i) => [`Dòng ${i + 1}`, "nội dung khá dài để chiếm chỗ"]), pin: "Câu chính của slide này nằm trên tờ giấy ghim" }] };
    await mo(day); const loi = await kiemTran(page);
    assert.ok(loi.some((m) => /giấy ghim \(pin\) không có chỗ/.test(m)), `slide kín chỗ phải được báo:\n${loi.join("\n")}`);
  } finally { await b.close(); }
});
