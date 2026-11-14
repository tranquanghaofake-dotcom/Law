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

test("agenda ít câu tự giãn — không bị gợi ý dư khoảng trống", () => {
  const r = buildDeck({ slides: [cover, { type: "agenda", title: "Hai câu hỏi", items: ["Câu một?", "Câu hai?"] }] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all); assert.ok(!/Slide 2 \(agenda\).*trống/.test(r.all), r.all);
});

test("ví dụ banan142 qua --strict (không chữ đè, không khối sát nhau)", () => {
  const dir = tmpdir();
  for (const t of ["mặc định"]) {
    const r = build([path.join(ROOT, "examples", "banan142.json"), path.join(dir, t + ".pptx"), "--theme", t, "--strict"]);
    assert.strictEqual(r.code, 0, t + "\n" + r.all);
  }
});
