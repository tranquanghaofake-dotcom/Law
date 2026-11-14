// Test bộ chất liệu (meta.kit — engine/kits.js), dải kết luận (takeaway), kiểm nhịp: CÙNG một deck.json, đổi bộ → giao diện đổi, nội dung giữ nguyên.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, build, buildDeck, tmpdir, cover } = require("./helpers");
const DA = require("../hinh/da");
const { PROPS } = require("../hinh/do_vat");
const EX = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "bo_chat_lieu.json"), "utf8"));
function deckDir() { const dir = tmpdir(); fs.mkdirSync(path.join(dir, "images"));
  for (const f of fs.readdirSync(path.join(ROOT, "examples", "images"))) fs.copyFileSync(path.join(ROOT, "examples", "images", f), path.join(dir, "images", f));
  for (const f of ["logo.jpeg", "banan142_notes.md"]) if (fs.existsSync(path.join(ROOT, "examples", f))) fs.copyFileSync(path.join(ROOT, "examples", f), path.join(dir, f)); return dir; }
const withDa = (k) => Object.assign({}, EX, { meta: Object.assign({}, EX.meta, { da: k }) });
const slideXml = async (pptx, n) => (await JSZip.loadAsync(fs.readFileSync(pptx))).file(`ppt/slides/slide${n}.xml`).async("string");
const text = (x) => [...x.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(m => m[1]).join(" ").replace(/ /g, " ");

test("bo_chat_lieu.json qua --strict ở 3 da chung (ho-so, giay, kinh)", () => {
  const dir = deckDir();
  for (const k of ["ho-so", "giay", "kinh"]) { const r = buildDeck(withDa(k), ["--strict"], dir); assert.strictEqual(r.code, 0, `${k}:\n${r.all}`); }
});

test("nhịp: 3 slide cùng type liền nhau → gợi ý (không chặn --strict)", () => {
  const st = (t) => ({ type: "stats", title: t, items: [{ label: "a", value: "1" }, { label: "b", value: "2" }] });
  const r = buildDeck({ slides: [cover, st("Một con số"), st("Hai con số"), st("Ba con số")] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all); assert.ok(/Nhịp: slide 2–4 cùng là "stats"/.test(r.all), r.all);
});

test("đồ vật vẽ bằng code: mọi PROPS ra SVG hợp lệ, không nhúng ảnh ngoài", () => {
  const P = { acc: "1E6B62", accLight: "A5C4C0", gold: "C9A45C", ink: "0E3A3B", tape: "E4D2AE" };
  for (const [k, fn] of Object.entries(PROPS)) { const p = fn(P); assert.ok(/^<svg /.test(p.svg) && p.ratio > 0, k); assert.ok(!/<image|href=/.test(p.svg), `${k}: không được nhúng ảnh`); }
  const { coF3d } = require("../hinh/f3d");   // "3d:<vật>" = vật 3D PNG trong hinh/f3d (không phải vẽ bằng code)
  for (const k of DA.NAMES) for (const pr of DA.DA[k].vat) assert.ok(pr.startsWith("3d:") ? coF3d(pr.slice(3)) : PROPS[pr], `da ${k}: thiếu đồ vật ${pr}`);
});
