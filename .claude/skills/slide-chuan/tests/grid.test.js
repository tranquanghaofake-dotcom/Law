// Test LƯỚI: kicker, tiêu đề, dòng chú thích phải nằm cùng một chỗ trên mọi slide nội dung
// (người xem không phải tìm lại tiêu đề khi chuyển slide). Đọc toạ độ thật trong file .pptx.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { build, tmpdir, ROOT } = require("./helpers");

const EMU = 914400, near = (a, b) => Math.abs(a - b) < 0.02;
async function shapes(pptx) {
  const z = await JSZip.loadAsync(fs.readFileSync(pptx)), out = [];
  for (const f of Object.keys(z.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    const x = await z.file(f).async("string");
    for (const m of x.matchAll(/<p:cNvPr id="\d+" name="([^"]+)"[\s\S]*?<a:off x="(-?\d+)" y="(-?\d+)"/g)) out.push({ name: m[1], x: m[2] / EMU, y: m[3] / EMU });
  }
  return out;
}
const pptx = path.join(tmpdir(), "grid.pptx");
const FREE = new Set(["cover", "section", "scene", "statement", "photo"]); // bố cục riêng có chủ đích (photo: chữ đặt trên ảnh tràn viền)

test("deck mẫu: tiêu đề mọi slide nội dung ở cùng toạ độ (x 0.6, y 1.25)", async () => {
  const r = build([path.join(ROOT, "examples", "banan142.json"), pptx]); assert.strictEqual(r.code, 0, r.all);
  const ts = (await shapes(pptx)).filter(s => /\|title$/.test(s.name) && !FREE.has(s.name.split("|")[1]));
  assert.ok(ts.length >= 12, "phải thấy tiêu đề của ≥12 slide, thấy " + ts.length);
  for (const t of ts) assert.ok(near(t.x, 0.6) && near(t.y, 1.25), `${t.name} ở (${t.x.toFixed(2)}, ${t.y.toFixed(2)})`);
});
test("deck mẫu: kicker ở hàng y 0.85", async () => {
  const ks = (await shapes(pptx)).filter(s => /\|kicker$/.test(s.name) && !FREE.has(s.name.split("|")[1]));
  assert.ok(ks.length >= 8);
  for (const k of ks) assert.ok(near(k.y, 0.85), `${k.name} ở y ${k.y.toFixed(2)}`);
});
test("deck mẫu: dòng chú thích / footer ở hàng y 6.62", async () => {
  const fs_ = (await shapes(pptx)).filter(s => /\|(note|footer|chú thích)$/.test(s.name) && /\|(flow|ledger|chart|table|fork|scorecard)\|/.test(s.name));
  assert.ok(fs_.length >= 3, "thấy " + fs_.length); // bỏ dòng "Nguồn:" (11/2026) → còn 4 dòng chú thích trong banan142
  for (const f of fs_) assert.ok(near(f.y, 6.62), `${f.name} ở y ${f.y.toFixed(2)}`);
});
test("deck mẫu: mọi ô chữ nằm trong lề an toàn (trái/phải 0.6, trên 0.25, dưới 7.1)", async () => {
  const z = await JSZip.loadAsync(fs.readFileSync(pptx)), bad = [];
  for (const f of Object.keys(z.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    const x = await z.file(f).async("string");
    for (const m of x.matchAll(/<p:cNvPr id="\d+" name="(S\d+\|[^"]+)"[\s\S]*?<a:off x="(-?\d+)" y="(-?\d+)"\/><a:ext cx="(\d+)" cy="(\d+)"/g)) {
      const [, name, X, Y, CX, CY] = m, l = X / EMU, t = Y / EMU, r = l + CX / EMU, b = t + CY / EMU;
      if (l < 0.58 || r > 13.333 - 0.58 || t < 0.25 || b > 7.12) bad.push(`${name}: (${l.toFixed(2)}, ${t.toFixed(2)}) → (${r.toFixed(2)}, ${b.toFixed(2)})`);
    }
  }
  assert.deepStrictEqual(bad, []);
});
