// Da theo môn (hinh/da.js) — chất liệu của môn phủ mọi type thường của tầng hình ảnh (spec: một tầng hình ảnh, 11/2026).
const test = require("node:test"), assert = require("node:assert"), path = require("path");
const DA = require("../hinh/da");
const { dungHtml } = require("../hinh/dung");
const { kiemDeck } = require("../hinh/kiem");
const { ART, NAMES: ART_NAMES } = require("../hinh/art");
const { PROPS } = require("../hinh/do_vat");
process.env.SLIDE_CHUAN_NO_PREP = "1";

const deck = (meta, slides) => ({ meta: { short: "Thử", ...meta }, slides: slides || [
  { type: "cover", title: "Bìa thử" }, { type: "section", num: 1, title: "Phần một" },
  { type: "cards", title: "Ba thẻ thử nghiệm", items: [{ name: "A", desc: "a" }, { name: "B", desc: "b" }, { name: "C", desc: "c" }] },
  { type: "statement", title: "Một phát hiện", stats: [{ label: "x", value: "1" }] }, { type: "end", title: "Cảm ơn" }] });

test("13 da đủ trường bắt buộc; đồ vật và hình lớn của da đều có thật", () => {
  assert.equal(DA.NAMES.length, 13);
  for (const [ten, c] of Object.entries(DA.DA)) {
    for (const k of ["mon", "fits", "ink", "acc", "page", "muted", "line", "bad", "good", "gold", "nen", "khung", "the", "nhan", "so", "tienDo", "vat", "chuyen", "art"]) assert.ok(c[k] != null, `${ten}.${k}`);
    for (const v of c.vat) assert.ok(PROPS[v], `${ten}: đồ vật "${v}" không có trong hinh/do_vat.js`);
    assert.ok(ART[c.art], `${ten}: hình "${c.art}" không có trong hinh/art.js`);
    assert.ok(DA.CHUYEN[c.chuyen], `${ten}: kiểu hiện "${c.chuyen}"`);
  }
});

test("chọn da: meta.da → bộ hình → meta.kit cũ → đề tài → meta.kind; none = nền chung; tên sai báo lỗi", () => {
  assert.equal(DA.chonDa(deck({ da: "ban-ve" })).ten, "ban-ve");
  assert.equal(DA.chonDa(deck({ da: "none" })).ten, null);
  assert.ok(DA.chonDa(deck({ da: "khong-co" })).loi);
  assert.equal(DA.chonDa({ meta: {}, slides: [{ type: "bcbia" }] }, { bcTypes: ["bcbia"] }).ten, "bc");
  assert.equal(DA.chonDa(deck({ kit: "glass" })).ten, "kinh");
  assert.equal(DA.chonDa(deck({ kit: "so-bhxh" })).ten, "so-bhxh");
  assert.equal(DA.chonDa(deck({ title: "Tình hình triển khai BHXH bắt buộc" })).ten, "so-bhxh");
  assert.equal(DA.chonDa(deck({ kind: "lecture" })).ten, "giay");
  assert.equal(DA.chonDa(deck({})).ten, "ho-so");
});

test("dungHtml phủ da lên slide type thường: lớp da-<tên>, khung, đồ vật, hình lớn ở chương / bìa / kết; màu của da thay bảng màu gốc", () => {
  const r = dungHtml(deck({ da: "so-bhxh" }), { deckDir: path.join(__dirname, "..") });
  assert.equal(r.da.ten, "so-bhxh");
  const secs = r.html.split("<section ").slice(1);
  assert.ok(secs.every((s) => /class="s da da-so-bhxh /.test(s)), "mọi slide type thường mang lớp da");
  assert.ok(secs.every((s) => s.includes('class="da-khung"')), "mọi slide có khung viền đôi của sổ");
  assert.ok(secs[2].includes("data-da-vat"), "slide nội dung sáng có đồ vật tiền cảnh");
  assert.ok(secs[1].includes('class="da-art"') && secs[0].includes('class="da-art"'), "chương và bìa không ảnh có hình lớn (sổ BHXH)");
  assert.ok(!/#e2402a/i.test(r.html.split("</style>")[1]), "màu son gốc đã đổi sang màu của da trong thân trang");
  assert.ok(r.html.includes(".s.da-so-bhxh"), "CSS của da có trong trang");
});

test("da bc / qt: slide thường thành tờ giấy trên nền của bộ (bảng bần, bản đồ chấm)", () => {
  for (const ten of ["bc", "qt"]) {
    const h = dungHtml(deck({ da: ten }), { deckDir: path.join(__dirname, "..") }).html;
    const sec = h.split("<section ").slice(1);
    assert.ok(sec.every((s) => { const c = (s.match(/class="([^"]*)"/) || [])[1].split(" "); return c.includes(ten) && c.includes(`da-${ten}`); }), `${ten}: mọi slide mang nền của bộ`);
    assert.ok(sec[2].includes('class="da-to"'), `${ten}: slide sáng có tờ giấy`);
  }
});

test("hiệu ứng vào của thẻ theo tính cách da (đóng dấu, lật lịch, trượt…)", () => {
  const h = dungHtml(deck({ da: "bang-cong" }), { deckDir: path.join(__dirname, "..") }).html;
  assert.ok(h.includes('"fx":"flip"'));
});

test("kiem: chỉ báo Nền chung khi da = none; deck có da không còn ⚠ Nền chung", () => {
  const sl = Array.from({ length: 7 }, () => ({ type: "cards", title: "Thẻ", items: [{ name: "a" }] }));
  assert.ok(kiemDeck({ meta: { da: "none" }, slides: sl }).some((m) => m.startsWith("⚠ Nền chung")));
  assert.ok(!kiemDeck({ meta: { da: "so-bhxh" }, slides: sl }).some((m) => m.startsWith("⚠ Nền chung")));
  assert.ok(!kiemDeck({ meta: { kind: "case" }, slides: sl }).some((m) => m.startsWith("⚠ Nền chung")), "mặc định theo loại bài cũng có da");
});

test("hình minh hoạ chuyển từ tầng Office đủ 21 hình, mỗi hình là SVG có viewBox", () => {
  assert.ok(ART_NAMES.length >= 21);
  for (const n of ART_NAMES) assert.match(ART[n]("2F6B3F", "9A3324", "FFFFFF"), /^<svg[^>]+viewBox="0 0 \d+ \d+"/, n);
});

test("khung và nền của mọi da là SVG hợp lệ (hoặc rỗng khi da không có)", () => {
  for (const [ten, c] of Object.entries(DA.DA)) {
    for (const toi of [false, true]) {
      const k = DA.khungSvg(c.khung, c, toi), n = DA.nenSvg(c.nen, c, toi);
      if (k) assert.match(k, /^<svg[\s\S]*<\/svg>$/, `${ten} khung`);
      if (n) assert.match(n, /^<svg[\s\S]*<\/svg>$/, `${ten} nền`);
    }
  }
});

test("đồ vật tiền cảnh chọn theo NỘI DUNG slide, không theo số thứ tự (nguyên tắc mỗi chi tiết một lý do)", () => {
  const sec = (title) => DA.phuSlide(`<section class="s light"><div class="cv"></div></section>`, "so-bhxh", { type: "cards", i: 7, chu: title });
  const vat = (html) => (html.match(/data-da-vat[^>]*>([\s\S]*?)<\/div>/) || [])[1] || "";
  const c = DA.DA["so-bhxh"], xu = DA.vatSvg("coins", c), dau = DA.vatSvg("stamp", c), so = DA.vatSvg("booklet", c);
  assert.equal(vat(sec("Quỹ thu vượt chi suốt 2015–2022")), xu, "slide về quỹ → xu");
  assert.equal(vat(sec("Điều 64: mốc lương hưu còn 15 năm")), dau, "slide về điều luật → con dấu");
  assert.equal(vat(sec("Một câu hỏi khác")), so, "không khớp từ khoá → vật chủ đạo của da");
});

test("vỏ thẻ của da không phá bố cục định vị: nút sơ đồ flow vẫn nằm một hàng ở mọi da", { skip: (() => { try { require.resolve("playwright"); return false; } catch { return "không có Playwright"; } })(), timeout: 180000 }, async () => {
  const { chromium } = require("playwright"), fs = require("fs"), os = require("os");
  const exe = process.env.PW_CHROMIUM || ["/opt/pw-browsers/chromium"].find((p) => fs.existsSync(p));
  const b = await chromium.launch(exe ? { executablePath: exe } : {}), page = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  try {
    for (const ten of Object.keys(DA.DA)) {
      const d = { meta: { da: ten }, slides: [{ type: "cover", title: "Thử" }, { type: "flow", title: "Bốn bên nối nhau", nodes: ["A", "B", "C", "D"].map((id) => ({ id, name: `Bên ${id}`, who: "ai đó" })), edges: [{ from: "A", to: "B", label: "x" }, { from: "B", to: "C", label: "y" }] }] };
      const r = dungHtml(d, { deckDir: path.join(__dirname, "..") }), f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "da-flow-")), "deck.html"); fs.writeFileSync(f, r.html);
      await page.goto("file://" + f);
      const q = await page.evaluate(() => [...document.querySelectorAll(".fl-n")].map((e) => ({ pos: getComputedStyle(e).position, top: Math.round(e.getBoundingClientRect().top) })));
      assert.equal(q.length, 4, ten);
      assert.ok(q.every((x) => x.pos === "absolute"), `${ten}: nút flow phải position:absolute (${q.map((x) => x.pos)})`);
      assert.ok(new Set(q.map((x) => x.top)).size === 1, `${ten}: bốn nút phải cùng một hàng (${q.map((x) => x.top)})`);
    }
  } finally { await b.close(); }
});

test("dấu ✓ / chữ nhấn / chú thích ảnh đọc được ở mọi da (checklist, pyramid, collage — lỗi quét --soat 11/2026)", { skip: (() => { try { require.resolve("playwright"); return false; } catch { return "không có Playwright"; } })(), timeout: 240000 }, async () => {
  const { chromium } = require("playwright"), fs = require("fs"), os = require("os");
  const exe = process.env.PW_CHROMIUM || ["/opt/pw-browsers/chromium"].find((p) => fs.existsSync(p));
  const b = await chromium.launch(exe ? { executablePath: exe } : {}), page = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  const anh = "examples/images/gat-lua.jpg";
  try {
    for (const ten of Object.keys(DA.DA)) {
      const d = { meta: { da: ten }, slides: [{ type: "cover", title: "Thử" },
        { type: "checklist", title: "Anh A đủ hai điều kiện", items: [{ head: "Đủ tuổi", text: "62 tuổi", ok: true, src: "Điều 169" }, { head: "Chưa rút", text: "Cần kiểm", ok: false }], verdict: { ok: "yes", text: "Đủ điều kiện thì [hưởng 45%] bình quân lương" } },
        { type: "pyramid", title: "Văn bản cấp dưới không được trái văn bản cấp trên", focus: 4, levels: [1, 2, 3, 4, 5].map((k) => ({ head: `Tầng ${k}`, text: k === 5 ? "Nơi hay [trái luật] nhất" : "Mô tả" })) },
        { type: "collage", title: "Ba tấm ảnh", photos: [1, 2, 3].map((k) => ({ photo: anh, caption: `Chú thích số ${k}` })), items: [{ head: "Ý", text: "chữ" }] }] };
      const r = dungHtml(d, { deckDir: path.join(__dirname, "..") }), f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "da-doc-")), "deck.html"); fs.writeFileSync(f, r.html);
      await page.goto("file://" + f); await page.evaluate(() => window.hinhSanSang);
      const q = await page.evaluate(() => {
        const rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number), L = (v) => { const g = v.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * g[0] + 0.7152 * g[1] + 0.0722 * g[2]; };
        const tp = (a, b) => { const [x, y] = [L(rgb(a)), L(rgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
        const ok = [...document.querySelectorAll(".cd .ok, .cd .no")].map((e) => ({ svg: !!e.querySelector("svg"), tp: tp(getComputedStyle(e).color, getComputedStyle(e).backgroundColor) }));
        const vdb = document.querySelector(".vdb em"), py = document.querySelector(".py .on em");
        const che = [...document.querySelectorAll(".clg figcaption")].map((c) => { const s = c.closest("section.s"); s.scrollIntoView(); const r = c.getBoundingClientRect(), w = c.firstChild ? (() => { const g = document.createRange(); g.selectNodeContents(c); return g.getBoundingClientRect(); })() : r;
          return [0.1, 0.5, 0.9].every((k) => { const el = document.elementFromPoint(w.left + w.width * k, w.top + w.height / 2); return el && c.closest("figure").contains(el); }); });
        return { ok, vdb: tp(getComputedStyle(vdb).color, getComputedStyle(vdb.closest(".vdb")).backgroundColor), py: tp(getComputedStyle(py).color, getComputedStyle(py.closest(".on")).backgroundColor), che };
      });
      assert.ok(q.ok.length === 2 && q.ok.every((x) => x.svg && x.tp >= 3), `${ten}: ô ✓ / ✕ phải là icon SVG, tương phản ≥ 3 : 1 (${JSON.stringify(q.ok)})`);
      assert.ok(q.vdb >= 3, `${ten}: chữ nhấn trong dải kết luận ${q.vdb.toFixed(2)} : 1`);
      assert.ok(q.py >= 4.5, `${ten}: chữ nhấn trên tầng nhấn của kim tự tháp ${q.py.toFixed(2)} : 1`);
      assert.deepEqual(q.che, [true, true, true], `${ten}: chú thích ảnh collage bị tấm sau che`);
    }
  } finally { await b.close(); }
});

test("trường tầng hình ảnh không đọc thì phải nói ra: mode lệch nền của type, transition / build / motion", () => {
  const d = deck({ da: "giay" }, [{ type: "cover", title: "Bìa" }, { type: "statement", title: "Bước ngoặt", mode: "a" }, { type: "cards", title: "Ba thẻ", mode: "d", items: [{ name: "A" }], build: true }]);
  const r = dungHtml(d, { deckDir: path.join(__dirname, "..") });
  assert.deepEqual(r.boMode, ['slide 3 (cards) mode "d"'], "statement nhận mode a; cards không đổi nền → phải báo");
  assert.ok(kiemDeck(d).some((m) => /"build" bị bỏ qua: slide 3/.test(m)));
});
