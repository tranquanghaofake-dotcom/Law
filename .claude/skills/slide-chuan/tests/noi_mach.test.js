// Test meta.thread (Morph nối mạch trong chương + mục lục → chương) và section photoLayout "backdrop" (nền ảnh mờ + lớp màu).
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, buildDeck, tmpdir } = require("./helpers");
function imgDir() { const dir = tmpdir(); fs.mkdirSync(path.join(dir, "images"));
  for (const f of fs.readdirSync(path.join(ROOT, "examples", "images"))) fs.copyFileSync(path.join(ROOT, "examples", "images", f), path.join(dir, "images", f)); return dir; }
const st = (k, t) => ({ type: "stats", kicker: k, title: t, items: [{ label: "a", value: "1" }, { label: "b", value: "2" }] });
const deck = (thread) => ({ meta: { thread, short: "Thử nối mạch" }, slides: [
  { type: "cover", title: "Bìa" },
  { type: "agenda", title: "Bài có [hai chương]", items: ["Chương một", "Chương hai"] },
  { type: "section", num: "1", title: "Chương một", photo: "images/ruong-xanh.jpg", photoAlt: "Ruộng lúa", photoLayout: "backdrop" },
  st("", "Ý thứ nhất của chương một"), st("", "Ý thứ hai của chương một"),
  { type: "section", num: "2", title: "Chương hai" },
  st("", "Ý thứ nhất của chương hai") ] });
async function info(pptx) { const z = await JSZip.loadAsync(fs.readFileSync(pptx)), out = [];
  for (let n = 1; z.file(`ppt/slides/slide${n}.xml`); n++) { const x = await z.file(`ppt/slides/slide${n}.xml`).async("string");
    out.push({ tr: x.includes("p159:morph") ? "morph" : x.includes("<p:fade") ? "fade" : "-", parts: [...new Set([...x.matchAll(/name="(!!part-\d+)"/g)].map(m => m[1]))].sort(), bar: x.includes('name="!!thread-fill"') }); }
  return out; }

test("thread: Morph trong chương + mục lục → chương; sang chương mới = fade; tắt thread = không đổi tên", async () => {
  const dir = imgDir(), r = buildDeck(deck(true), ["--strict"], dir); assert.strictEqual(r.code, 0, r.all);
  const s = await info(r.pptx);
  assert.deepStrictEqual(s.map(x => x.tr), ["fade", "fade", "morph", "fade", "morph", "fade", "fade"]);
  assert.deepStrictEqual(s[1].parts, ["!!part-1", "!!part-2"], "ô số mục lục mang tên Morph");
  assert.deepStrictEqual(s[2].parts, ["!!part-1"], "số chương 1 cùng tên với ô số 01 của mục lục");
  assert.ok(s[3].bar && s[4].bar, "thanh tiến độ mang tên Morph");
  const off = await info(buildDeck(deck(false), ["--strict"], dir).pptx);
  assert.ok(off.every(x => !x.parts.length && !x.bar), "không bật thread → không đổi tên");
  assert.strictEqual(buildDeck({ meta: { thread: "yes" }, slides: [{ type: "cover", title: "B" }] }).code, 2);
});

test("backdrop: ảnh phủ kín slide (đã làm mờ), số + tên chương trên nền tối, qua --strict ở 3 theme", async () => {
  const dir = imgDir();
  for (const th of ["teal", "kem", "son"]) { const r = buildDeck(deck(true), ["--strict", "--theme", th], dir); assert.strictEqual(r.code, 0, `${th}:\n${r.all}`); }
  const r = buildDeck(deck(false), ["--strict"], dir), x = await (await JSZip.loadAsync(fs.readFileSync(r.pptx))).file("ppt/slides/slide3.xml").async("string");
  const pic = x.match(/<p:pic>(?:(?!<\/p:pic>)[\s\S])*?descr="Ruộng lúa"[\s\S]*?<\/p:pic>/); assert.ok(pic, "có ảnh nền");
  assert.ok(/<a:off x="0" y="0"\/>\s*<a:ext cx="1219\d{4}" cy="6858000"/.test(pic[0]), "ảnh phủ kín slide");
  assert.strictEqual(buildDeck({ slides: [{ type: "cover", title: "B" }, { type: "section", num: "1", title: "A", photoLayout: "full" }] }).code, 2, "photoLayout sai → lỗi");
});
