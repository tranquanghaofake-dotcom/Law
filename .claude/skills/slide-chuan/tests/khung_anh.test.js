// Test bộ dựng hình (engine/shapes.js): hình cơ bản → gộp → hình tự do của PowerPoint có "Tô bằng ảnh" thật; meta.frame, meta.paper.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, build, buildDeck, tmpdir, cover } = require("./helpers");
const SH = require("../engine/shapes");
const EX = path.join(ROOT, "examples", "khung_anh.json");
const area = (sh) => sh.reduce((t, poly) => t + poly.reduce((a, ring, k) => { let s = 0; for (let i = 0; i < ring.length - 1; i++) s += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]; return a + (k ? -1 : 1) * Math.abs(s / 2); }, 0), 0);

test("gộp hình: hai chữ nhật chồng nhau → một hình, diện tích = tổng − phần chung; trừ đi tạo lỗ", () => {
  const u = SH.union(SH.rect(0, 0, 2, 1), SH.rect(1, 0, 2, 1));
  assert.strictEqual(u.length, 1); assert.ok(Math.abs(area(u) - 3) < 1e-9, area(u));
  const d = SH.subtract(SH.rect(0, 0, 4, 4), SH.rect(1, 1, 2, 2));
  assert.strictEqual(d[0].length, 2, "vòng ngoài + một lỗ"); assert.ok(Math.abs(area(d) - 12) < 1e-9);
});

test("công thức khung: mỗi khung là MỘT hình liền, nằm trong hộp; ogee ghép từ 4 dấu ngoặc + chữ nhật bo góc", () => {
  for (const k of SH.FRAME_NAMES) { const sh = SH.frame(k, 1, 1, 4, 5), b = SH.bbox(sh);
    assert.strictEqual(sh.length, 1, `${k}: phải là một mảnh liền sau khi gộp`);
    assert.ok(b.x >= 1 - 1e-6 && b.y >= 1 - 1e-6 && b.x + b.w <= 5 + 1e-6 && b.y + b.h <= 6 + 1e-6, `${k} tràn hộp`); }
  const og = SH.frame("ogee", 0, 0, 4, 4), b = SH.bbox(og);
  assert.ok(Math.abs(b.w - 4) < 0.02 && Math.abs(b.h - 4) < 0.02, "mũi nhọn của 4 dấu ngoặc chạm đủ 4 cạnh hộp");
  assert.ok(area(og) < 16 * 0.85, "có khuyết ở 4 góc (không phải hình vuông)");
  const g = SH.bbox(SH.grow(og, 0.2)); assert.ok(Math.abs(g.w - 4.4) < 1e-6, "viền = bản sao phóng thêm đều mỗi phía");
});

test("khung_anh.json qua --strict ở 3 theme", () => {
  for (const t of ["teal", "kem", "son"]) { const r = build([EX, path.join(tmpdir(), `ka_${t}.pptx`), "--theme", t, "--strict"]); assert.strictEqual(r.code, 0, `${t}:\n${r.all}`); }
});

test("ảnh trong khung là hình custGeom có blipFill thật (đổi ảnh được trong PowerPoint), ảnh nhúng đủ, mô tả ảnh giữ nguyên", async () => {
  const out = path.join(tmpdir(), "ka.pptx"); assert.strictEqual(build([EX, out]).code, 0);
  const z = await JSZip.loadAsync(fs.readFileSync(out)), deck = JSON.parse(fs.readFileSync(EX, "utf8"));
  const framed = deck.slides.map((s, i) => [s, i + 1]).filter(([s]) => s.photo && ["cover", "section", "end"].includes(s.type));
  assert.ok(framed.length >= 3);
  for (const [s, n] of framed) {
    const x = await z.file(`ppt/slides/slide${n}.xml`).async("string"), rels = await z.file(`ppt/slides/_rels/slide${n}.xml.rels`).async("string");
    const sp = x.match(/<p:sp>(?:(?!<\/p:sp>)[\s\S])*?name="Ảnh trong khung"[\s\S]*?<\/p:sp>/); assert.ok(sp, `slide ${n}: thiếu hình "Ảnh trong khung"`);
    assert.ok(sp[0].includes("<a:custGeom>") && /<a:blipFill rotWithShape="1"><a:blip r:embed="(rIdPf\d+)"/.test(sp[0]), `slide ${n}: không phải custGeom tô ảnh`);
    assert.ok(sp[0].includes(`descr="${s.photoAlt}"`), `slide ${n}: mất mô tả ảnh`);
    const rid = sp[0].match(/r:embed="(rIdPf\d+)"/)[1], tgt = rels.match(new RegExp(`Id="${rid}"[^>]*Target="\\.\\./media/([^"]+)"`));
    assert.ok(tgt && z.file(`ppt/media/${tgt[1]}`), `slide ${n}: ảnh ${rid} không có trong gói`);
  }
  assert.ok(/Extension="jpeg"/i.test(await z.file("[Content_Types].xml").async("string")), "khai báo kiểu jpeg");
});

test("không ghi frame → ảnh chữ nhật như cũ; meta.frame / meta.paper / frame sai → lỗi", async () => {
  const r = buildDeck({ slides: [cover] }, ["--strict"]); assert.strictEqual(r.code, 0, r.all);
  assert.ok(!(await (await JSZip.loadAsync(fs.readFileSync(r.pptx))).file("ppt/slides/slide1.xml").async("string")).includes("Ảnh trong khung"));
  assert.strictEqual(buildDeck({ meta: { frame: "star" }, slides: [cover] }).code, 2);
  assert.strictEqual(buildDeck({ meta: { paper: "yes" }, slides: [cover] }).code, 2);
  assert.strictEqual(buildDeck({ slides: [cover, { type: "section", num: "1", title: "A", frame: "star" }] }).code, 2);
  assert.strictEqual(buildDeck({ slides: [cover, { type: "photostats", title: "A", photo: "x.jpg", frame: "arch", stats: [{ value: "1", label: "a" }, { value: "2", label: "b" }] }] }).code, 2, "photostats không nhận frame");
});

function imgDir() { const dir = tmpdir(); fs.mkdirSync(path.join(dir, "images"));
  for (const f of fs.readdirSync(path.join(ROOT, "examples", "images"))) fs.copyFileSync(path.join(ROOT, "examples", "images", f), path.join(dir, "images", f)); return dir; }
test("bìa: có ảnh + meta.frame → khung; ghi layout band thì giữ band; mục lục có photo + frame → khung, không photo → kiểu cũ", async () => {
  const ph = { photo: "images/gat-lua.jpg", photoAlt: "Người gặt lúa" }, ag = { type: "agenda", kicker: "Nội dung", title: "Bài đi qua [hai phần]", items: ["Phần một", "Phần hai"] };
  const run = async (deck) => { const r = buildDeck(deck, ["--strict"], imgDir()); assert.strictEqual(r.code, 0, r.all); const z = await JSZip.loadAsync(fs.readFileSync(r.pptx));
    return (n) => z.file(`ppt/slides/slide${n}.xml`).async("string"); };
  for (const th of ["teal", "son"]) { const r = buildDeck({ meta: { frame: "arch" }, slides: [Object.assign({ type: "cover", title: "Đất lúa [thu hẹp] ra sao?", subtitle: "Phụ đề", author: "Nhóm 3", date: "11/2026" }, ph)] }, ["--strict", "--theme", th], imgDir()); assert.strictEqual(r.code, 0, `${th}: ${r.all}`); }
  let x = await run({ meta: { frame: "arch" }, slides: [Object.assign({ type: "cover", title: "Bìa" }, ph), Object.assign({}, ag, { photo: "images/rom-ra.jpg", photoAlt: "Rơm" })] });
  assert.ok((await x(1)).includes('name="Ảnh trong khung"'), "bìa có ảnh + meta.frame → khung");
  assert.ok((await x(2)).includes('name="Ảnh trong khung"'), "agenda có ảnh + meta.frame → khung");
  x = await run({ meta: { frame: "arch" }, slides: [Object.assign({ type: "cover", layout: "band", title: "Bìa" }, ph), ag] });
  assert.ok(!(await x(1)).includes("Ảnh trong khung"), "layout band ghi tay → giữ band");
  assert.ok(!(await x(2)).includes("Ảnh trong khung"), "agenda không ảnh → kiểu cũ");
});
