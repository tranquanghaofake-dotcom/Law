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
