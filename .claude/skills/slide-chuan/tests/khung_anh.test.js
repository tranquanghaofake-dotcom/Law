// Test bộ dựng hình (engine/shapes.js): hình cơ bản → gộp → hình tự do của PowerPoint có "Tô bằng ảnh" thật; meta.frame, meta.paper.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, build, buildDeck, tmpdir, cover } = require("./helpers");
const EX = path.join(ROOT, "examples", "khung_anh.json");
const area = (sh) => sh.reduce((t, poly) => t + poly.reduce((a, ring, k) => { let s = 0; for (let i = 0; i < ring.length - 1; i++) s += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]; return a + (k ? -1 : 1) * Math.abs(s / 2); }, 0), 0);

test("khung_anh.json qua --strict", () => {
  for (const t of ["mặc định"]) { const r = build([EX, path.join(tmpdir(), `ka_${t}.pptx`), "--theme", t, "--strict"]); assert.strictEqual(r.code, 0, `${t}:\n${r.all}`); }
});
