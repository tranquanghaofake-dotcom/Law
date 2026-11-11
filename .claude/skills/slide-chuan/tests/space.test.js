// Test lớp 3 (không gian) + hoạ tiết nền + SVG thật.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const sharp = require("sharp");
const { ROOT, buildDeck, build, tmpdir, cover } = require("./helpers");
const { MOTIFS, largestFree } = require("../engine/motifs");

const SW = 12192000, SH = 6858000; // kích thước slide 13.333 x 7.5 in theo EMU
async function slides(pptx) {
  const z = await JSZip.loadAsync(fs.readFileSync(pptx));
  const files = Object.keys(z.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f)).sort((a, b) => +a.match(/\d+/)[0] - +b.match(/\d+/)[0]);
  return { z, xml: await Promise.all(files.map(f => z.file(f).async("string"))) };
}

test("largestFree: tìm đúng ô trống lớn nhất, null khi kín chỗ", () => {
  const area = { x0: 0, y0: 0, x1: 10, y1: 5 };
  const r = largestFree([{ x: 0, y: 0, w: 6, h: 5 }], area, 0);
  assert.ok(Math.abs(r.x - 6) < 0.11 && Math.abs(r.w - 4) < 0.11 && Math.abs(r.h - 5) < 0.11, JSON.stringify(r));
  assert.strictEqual(largestFree([{ x: 0, y: 0, w: 10, h: 5 }], area, 0), null);
});

test("mọi hoạ tiết là SVG hợp lệ, không dùng mask/filter (PowerPoint vẽ sai)", async () => {
  for (const [k, fn] of Object.entries(MOTIFS)) {
    const svg = fn("1E6B62", "C9A45C", "FFFFFF", 480, 300, { r: true });
    assert.ok(!/<mask|<filter/.test(svg), k);
    const png = await sharp(Buffer.from(svg)).png().toBuffer(); // sharp/librsvg đọc được = cú pháp đúng
    assert.ok(png.length > 500, k);
  }
});

test("hoạ tiết nền nằm trọn trong slide, không đè nội dung, ở lớp dưới cùng", async () => {
  const deck = { meta: { motif: "cadastral" }, slides: [cover,
    { type: "agenda", title: "Ba câu hỏi", items: ["Câu một?", "Câu hai?", "Câu ba?"] },
    { type: "flow", title: "Hai bên", nodes: [{ id: "a", name: "A" }, { id: "b", name: "B" }], edges: [{ from: "a", to: "b", label: "bán" }] }] };
  const r = buildDeck(deck, ["--strict"]); assert.strictEqual(r.code, 0, r.all);
  const { xml } = await slides(r.pptx); let seen = 0;
  for (const x of xml) {
    const m = x.match(/<p:pic>(?:(?!<\/p:pic>).)*?descr="Hoạ tiết[^"]*"(?:(?!<\/p:pic>).)*?<a:off x="(-?\d+)" y="(-?\d+)"\/>\s*<a:ext cx="(\d+)" cy="(\d+)"/s);
    if (!m) continue; seen++;
    const [X, Y, CX, CY] = m.slice(1).map(Number);
    assert.ok(X >= 0 && Y >= 0 && X + CX <= SW + 2 && Y + CY <= SH + 2, `hoạ tiết lòi ra ngoài slide: ${m.slice(1)}`);
    const first = x.indexOf("<p:pic>"), sp = x.indexOf("<p:sp>"); // hoạ tiết phải là hình đầu tiên trong cây hình
    assert.ok(sp < 0 || first < sp, "hoạ tiết phải nằm dưới mọi hình khác");
  }
  assert.ok(seen >= 1, "phải có ít nhất 1 slide đủ chỗ đặt hoạ tiết");
});

test("hình vẽ bằng code nhúng SVG thật + PNG dự phòng đọc được; --raster thì chỉ PNG", async () => {
  const deck = { slides: [cover, { type: "cards", title: "Bốn bên", items: [{ icon: "FaUser", name: "A", desc: "x" }, { icon: "FaHouse", name: "B", desc: "y" }] }] };
  const r = buildDeck(deck, ["--strict"]); assert.strictEqual(r.code, 0, r.all);
  const { z } = await slides(r.pptx);
  const svgs = Object.keys(z.files).filter(f => /media\/.*\.svg$/.test(f));
  assert.ok(svgs.length > 0, "phải có SVG");
  for (const f of svgs) {
    const [, sl, k] = f.match(/image-(\d+)-(\d+)\.svg$/), png = z.file(`ppt/media/image-${sl}-${+k - 1}.png`);
    assert.ok(png, "thiếu PNG dự phòng cho " + f);
    const md = await sharp(await png.async("nodebuffer")).metadata();
    assert.ok(md.width >= 64, `PNG dự phòng của ${f} hỏng (${md.width}px)`);
  }
  const r2 = buildDeck(deck, ["--strict", "--raster"]); assert.strictEqual(r2.code, 0, r2.all);
  const { z: z2 } = await slides(r2.pptx);
  assert.strictEqual(Object.keys(z2.files).filter(f => /\.svg$/.test(f)).length, 0);
});

test("agenda ít câu tự giãn — không bị gợi ý dư khoảng trống", () => {
  const r = buildDeck({ slides: [cover, { type: "agenda", title: "Hai câu hỏi", items: ["Câu một?", "Câu hai?"] }] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all); assert.ok(!/Slide 2 \(agenda\).*trống/.test(r.all), r.all);
});

test("ví dụ banan142 qua --strict ở cả 3 theme (không chữ đè, không khối sát nhau)", () => {
  const dir = tmpdir();
  for (const t of ["teal", "kem", "son"]) {
    const r = build([path.join(ROOT, "examples", "banan142.json"), path.join(dir, t + ".pptx"), "--theme", t, "--strict"]);
    assert.strictEqual(r.code, 0, t + "\n" + r.all);
  }
});
