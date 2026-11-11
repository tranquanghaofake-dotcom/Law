// Test meta.style: dossier | cadastral | portico — bìa, mở chương, slide cuối theo chất liệu của bản án.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, buildDeck, cover } = require("./helpers");
const THEMES = require("../engine/themes");
const EX = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "phong_cach.json"), "utf8"));
const xmlOf = async (pptx, n) => (await (await JSZip.loadAsync(fs.readFileSync(pptx))).file(`ppt/slides/slide${n}.xml`).async("string")).replace(/\u00a0/g, " "); // engine nối 2 chữ cuối bằng dấu cách không ngắt (chống mồ côi)
const withStyle = (st) => Object.assign({}, EX, { meta: Object.assign({}, EX.meta, { style: st }) });

for (const st of ["dossier", "cadastral", "portico"]) test(`meta.style ${st}: qua --strict ở cả 6 theme (không chữ tràn, đủ tương phản)`, () => {
  for (const th of Object.keys(THEMES)) { const r = buildDeck(withStyle(st), ["--strict", "--theme", th]); assert.strictEqual(r.code, 0, `${st}/${th}:\n${r.all}`); }
});

test("chữ là ô chữ thật; mở chương ghi tên mọi chương (tab / tờ / trụ); slide cuối lấy 'Điều cần nhớ' từ closing", async () => {
  for (const st of ["dossier", "cadastral", "portico"]) {
    const r = buildDeck(withStyle(st), ["--strict"]); assert.strictEqual(r.code, 0, r.all);
    const iSec = EX.slides.findIndex(s => s.type === "section") + 1, iEnd = EX.slides.length, sec = await xmlOf(r.pptx, iSec), end = await xmlOf(r.pptx, iEnd);
    assert.ok(sec.includes("Người mua có ngay tình?") && sec.includes("Quyền của ngân hàng"), `${st}: thiếu tên chương`);
    if (st !== "portico") assert.ok(end.includes("Điều cần nhớ"), `${st}: thiếu Điều cần nhớ`);
    assert.ok(end.includes("Luật chỉ bảo vệ người") || end.includes("LUẬT CHỈ BẢO VỆ NGƯỜI"), `${st}: thông điệp không lấy từ closing`);
  }
});

test("meta.style sai → lỗi; bìa chọn layout typo / ảnh → không áp phong cách", async () => {
  assert.strictEqual(buildDeck({ meta: { style: "neon" }, slides: [cover] }).code, 2);
  const r = buildDeck({ meta: { style: "dossier", short: "Bản án 1/2020/DS-PT" }, slides: [Object.assign({ layout: "typo" }, cover)] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  assert.ok(!(await xmlOf(r.pptx, 1)).includes("Bìa hồ sơ vụ án"), "layout typo phải giữ kiểu typo");
});
