// Test type hub (một tâm + 4–6 yếu tố) và pin (câu chính trên giấy ghim — tự tìm chỗ, không đủ thì báo).
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, buildDeck, tmpdir, cover } = require("./helpers");
function imgDir() { const dir = tmpdir(); fs.mkdirSync(path.join(dir, "images"));
  for (const f of fs.readdirSync(path.join(ROOT, "examples", "images"))) fs.copyFileSync(path.join(ROOT, "examples", "images", f), path.join(dir, "images", f)); return dir; }
const KITS = require("../engine/kits");
const EX = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "hub_pin.json"), "utf8"));
const withKit = (k) => Object.assign({}, EX, { meta: Object.assign({}, EX.meta, { kit: k }) });
const xmlOf = async (pptx, n) => (await JSZip.loadAsync(fs.readFileSync(pptx))).file(`ppt/slides/slide${n}.xml`).async("string");
const text = (x) => [...x.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(m => m[1]).join(" ").replace(/ /g, " ");

test("hub_pin.json qua --strict: 4 bộ chất liệu × 3 theme", () => {
  const DIR = imgDir();
  for (const k of [...KITS.NAMES, "none"]) for (const th of ["teal", "kem", "son"]) { const r = buildDeck(withKit(k), ["--strict", "--theme", th], DIR); assert.strictEqual(r.code, 0, `${k}/${th}:\n${r.all}`); }
});

test("hub: tâm + đủ mọi yếu tố trên slide; < 4 hoặc > 6 yếu tố → lỗi / cắt", async () => {
  const r = buildDeck(EX, ["--strict"], imgDir()); assert.strictEqual(r.code, 0, r.all);
  const x = text(await xmlOf(r.pptx, 2));
  for (const it of EX.slides[1].items) assert.ok(x.includes(it.head), `thiếu "${it.head}"`);
  assert.ok(x.includes("Giao dịch có hiệu lực"));
  const hub = (n) => ({ type: "hub", title: "Một khái niệm", center: { label: "Tâm" }, items: Array.from({ length: n }, (_, i) => ({ head: "Yếu tố " + (i + 1) })) });
  assert.strictEqual(buildDeck({ slides: [cover, hub(3)] }).code, 2, "3 yếu tố → lỗi (dùng cards)");
  const r6 = buildDeck({ slides: [cover, hub(6)] }, ["--strict"]); assert.strictEqual(r6.code, 0, r6.all);
});

test("pin: câu + người nói nằm trên slide; trích dẫn có 'by'; không đủ chỗ → báo, không ghi đè", async () => {
  const r = buildDeck(EX, ["--strict"], imgDir()); assert.strictEqual(r.code, 0, r.all);
  const x = text(await xmlOf(r.pptx, 3));
  assert.ok(x.includes(EX.slides[2].pin.text) && x.includes(EX.slides[2].pin.by), x);
  const full = { type: "cards", title: "Tiêu đề dài gần hết bề ngang slide để không còn chỗ ở dải tiêu đề", items: [1, 2, 3, 4].map(i => ({ icon: "FaUser", name: "Bên " + i, desc: "Mô tả khá dài cho thẻ này để thẻ cao và chiếm phần lớn chiều dọc slide" })), pin: "Một câu khá dài để không thể nằm vừa bất kỳ khoảng trống nào còn lại trên slide này" };
  const bad = buildDeck({ slides: [cover, full] }, ["--strict"]); assert.strictEqual(bad.code, 1, bad.all); assert.ok(/pin: không còn vùng trống/.test(bad.all));
  assert.strictEqual(buildDeck({ slides: [cover, Object.assign({}, EX.slides[2], { pin: { by: "x" } })] }).code, 2, "pin thiếu text → lỗi");
  assert.strictEqual(buildDeck({ slides: [Object.assign({ pin: "x" }, cover)] }).code, 2, "pin ở bìa → lỗi");
  const q = buildDeck({ slides: [cover, Object.assign({}, EX.slides[2], { pin: "“Luật là biểu hiện của ý chí chung”" })] }, ["--strict"]);
  assert.strictEqual(q.code, 1, "câu trích thiếu by → cảnh báo (chặn --strict)"); assert.ok(/thiếu "by"/.test(q.all), q.all);
});

test("quote: cutout bị cắt ở mép trái → lật ngang, mép cắt sát mép phải slide; quote thiếu by → cảnh báo", async () => {
  const r = buildDeck(EX, ["--strict"], imgDir());
  assert.strictEqual(r.code, 0, r.all);
  const x = await xmlOf(r.pptx, 4), pic = x.match(/<p:pic>(?:(?!<\/p:pic>)[\s\S])*?descr="Chùm chìa khoá nhà"[\s\S]*?<\/p:pic>/);
  assert.ok(pic, "có ảnh cắt nền");
  const off = pic[0].match(/<a:off x="(\d+)" y="(\d+)"\/>\s*<a:ext cx="(\d+)" cy="(\d+)"/).slice(1).map(Number), EMU = 914400;
  assert.ok(Math.abs((off[0] + off[2]) / EMU - 13.333) < 0.1, `mép phải ảnh phải trùng mép phải slide (đang ${((off[0] + off[2]) / EMU).toFixed(2)} in)`);
  assert.ok(text(x).includes("TAND cấp cao tại Đà Nẵng"));
  const q = buildDeck({ slides: [cover, { type: "quote", quote: "Một câu trích không rõ ai nói" }] }, ["--strict"]);
  assert.strictEqual(q.code, 1); assert.ok(/\(quote\): thiếu "by"/.test(q.all), q.all);
});
