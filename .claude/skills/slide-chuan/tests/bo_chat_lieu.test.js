// Test bộ chất liệu (meta.kit — engine/kits.js), dải kết luận (takeaway), kiểm nhịp: CÙNG một deck.json, đổi bộ → giao diện đổi, nội dung giữ nguyên.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, build, buildDeck, tmpdir, cover } = require("./helpers");
const KITS = require("../engine/kits");
const EX = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "bo_chat_lieu.json"), "utf8"));
function deckDir() { const dir = tmpdir(); fs.mkdirSync(path.join(dir, "images"));
  for (const f of fs.readdirSync(path.join(ROOT, "examples", "images"))) fs.copyFileSync(path.join(ROOT, "examples", "images", f), path.join(dir, "images", f));
  for (const f of ["logo.jpeg", "banan142_notes.md"]) if (fs.existsSync(path.join(ROOT, "examples", f))) fs.copyFileSync(path.join(ROOT, "examples", f), path.join(dir, f)); return dir; }
const withKit = (k) => Object.assign({}, EX, { meta: Object.assign({}, EX.meta, { kit: k }) });
const slideXml = async (pptx, n) => (await JSZip.loadAsync(fs.readFileSync(pptx))).file(`ppt/slides/slide${n}.xml`).async("string");
const text = (x) => [...x.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(m => m[1]).join(" ").replace(/ /g, " ");

test("bo_chat_lieu.json qua --strict: 3 bộ chất liệu × 3 theme", () => {
  const dir = deckDir();
  for (const k of KITS.NAMES) for (const th of ["teal", "kem", "son"]) { const r = buildDeck(withKit(k), ["--strict", "--theme", th], dir); assert.strictEqual(r.code, 0, `${k}/${th}:\n${r.all}`); }
});

test("cùng nội dung, khác bộ → chữ giữ nguyên nhưng hình khác: nhãn đầu slide đổi hình (tab hồ sơ / ruy băng / viên thuốc), màu trang đổi", async () => {
  const dir = deckDir(), shapes = {}, texts = {};
  for (const k of [...KITS.NAMES, "none"]) { const r = buildDeck(withKit(k), ["--strict"], dir); assert.strictEqual(r.code, 0, r.all);
    const x = await slideXml(r.pptx, 12); texts[k] = text(x).replace(/(TỜ )?(\d\d) ?\/ ?(\d\d)/, "$2/$3"); // số trang: world biên bản ghi "TỜ 12/20"
    const sp = x.match(/<p:sp>(?:(?!<\/p:sp>)[\s\S])*?name="S12\|evidence\|kicker"[\s\S]*?<\/p:sp>/); shapes[k] = sp ? (sp[0].match(/prst="(\w+)"/) || [])[1] : "line"; }
  for (const k of KITS.NAMES) assert.strictEqual(texts[k], texts.none, `${k}: chữ trên slide phải giữ nguyên`);
  assert.deepStrictEqual([shapes.file, shapes.paper, shapes.glass], ["round2SameRect", "homePlate", "roundRect"]);
});

test("takeaway: dải 'Ghi nhớ' ở đáy, nguồn tách thành dòng nhỏ; takeaway ở bố cục có chú thích riêng hoặc cùng note → lỗi", async () => {
  const r = buildDeck(withKit("file"), ["--strict"], deckDir()); assert.strictEqual(r.code, 0, r.all);
  const x = text(await slideXml(r.pptx, 4));
  assert.ok(x.includes("Ghi nhớ") && x.includes(EX.slides[3].takeaway), x);
  assert.ok(/Natural Earth/.test(x), "nguồn bản đồ vẫn hiện (dòng nhỏ dưới dải)");
  assert.strictEqual(buildDeck({ slides: [cover, { type: "evidence", title: "A", quote: "q", items: [{ head: "a" }], takeaway: "x" }] }).code, 2);
  assert.strictEqual(buildDeck({ slides: [cover, { type: "steps", title: "Quy trình", steps: [{ head: "a" }, { head: "b" }, { head: "c" }], note: "n", takeaway: "x" }] }).code, 2);
});

test("meta.kit: sai → lỗi; none → giữ giao diện cũ (không tab, không đồ vật); auto theo meta.kind", async () => {
  assert.strictEqual(buildDeck({ meta: { kit: "neon" }, slides: [cover] }).code, 2);
  const ag = { type: "agenda", kicker: "Nội dung", title: "Bài có [ba phần]", items: ["Một", "Hai", "Ba"] };
  const none = buildDeck({ meta: { kind: "case", kit: "none" }, slides: [cover, ag] }, ["--strict"]); assert.strictEqual(none.code, 0, none.all);
  const auto = buildDeck({ meta: { kind: "case" }, slides: [cover, ag] }, ["--strict"]); assert.strictEqual(auto.code, 0, auto.all);
  assert.ok(!(await slideXml(none.pptx, 2)).includes("round2SameRect"), "kit none: kicker kiểu cũ");
  assert.ok((await slideXml(auto.pptx, 2)).includes("round2SameRect"), "kind case → bộ hồ sơ (tab)");
});

test("nhịp: 3 slide cùng type liền nhau → gợi ý (không chặn --strict)", () => {
  const st = (t) => ({ type: "stats", title: t, items: [{ label: "a", value: "1" }, { label: "b", value: "2" }] });
  const r = buildDeck({ slides: [cover, st("Một con số"), st("Hai con số"), st("Ba con số")] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all); assert.ok(/Nhịp: slide 2–4 cùng là "stats"/.test(r.all), r.all);
});

test("đồ vật vẽ bằng code: mọi PROPS ra SVG hợp lệ, không nhúng ảnh ngoài", () => {
  const P = { acc: "1E6B62", accLight: "A5C4C0", gold: "C9A45C", ink: "0E3A3B", tape: "E4D2AE" };
  for (const [k, fn] of Object.entries(KITS.PROPS)) { const p = fn(P); assert.ok(/^<svg /.test(p.svg) && p.ratio > 0, k); assert.ok(!/<image|href=/.test(p.svg), `${k}: không được nhúng ảnh`); }
  for (const k of KITS.NAMES) for (const pr of [...KITS.KITS[k].props, KITS.KITS[k].mark.prop]) assert.ok(KITS.PROPS[pr], `${k}: thiếu đồ vật ${pr}`);
});
