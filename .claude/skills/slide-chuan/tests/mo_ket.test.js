// Test: mở đầu (bìa art/typo/band), chuyển chương (bản đồ chương), kết thúc (end), bố cục ảnh (mosaic, photostats, photostrip, cards có ảnh).
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, build, buildDeck, tmpdir, cover } = require("./helpers");

const EX = path.join(ROOT, "examples", "anh_va_chuong.json");
const xml = async (pptx, n) => (await JSZip.loadAsync(fs.readFileSync(pptx))).file(`ppt/slides/slide${n}.xml`).async("string");
const text = (x) => [...x.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(m => m[1]).join(" ").replace(/\u00A0/g, " "); // NBSP chống mồ côi → khoảng trắng thường

test("anh_va_chuong.json --strict (bìa band, section có/không ảnh, photostats, mosaic, photostrip, cards ảnh, end)", () => {
  for (const t of ["mặc định"]) {
    const r = build([EX, path.join(tmpdir(), `av_${t}.pptx`), "--theme", t, "--strict"]);
    assert.strictEqual(r.code, 0, `${t}:\n${r.all}`);
  }
});

test("bố cục ảnh: mosaic < 4 ảnh, photostrip < 3 mốc, photostats < 2 số → lỗi cấu trúc kèm gợi ý type khác", () => {
  const r = buildDeck({ slides: [cover,
    { type: "mosaic", title: "Ba ảnh", photos: [{ photo: "a.jpg" }, { photo: "b.jpg" }, { photo: "c.jpg" }] },
    { type: "photostrip", title: "Hai mốc", items: [{ photo: "a.jpg", head: "A" }, { photo: "b.jpg", head: "B" }] },
    { type: "photostats", title: "Một số", photo: "a.jpg", stats: [{ value: "1", label: "x" }] }] });
  assert.strictEqual(r.code, 2, r.all);
  for (const k of ["gallery", "beforeafter", "bignum"]) assert.ok(r.all.includes(k), `thiếu gợi ý ${k}\n${r.all}`);
});

test("deck ≥ 10 slide không có ảnh nào → gợi ý tìm ảnh (không chặn --strict)", () => {
  const sl = [cover, ...Array.from({ length: 9 }, (_, i) => ({ type: "agenda", title: `Mục lục số ${i + 1} của bài`, items: ["Một", "Hai"], art: "none" }))];
  const r = buildDeck({ slides: sl });
  assert.ok(/chưa có ảnh thật nào/.test(r.all), r.all);
});

test("mục lục đếm cả chương chỉ có slide section (không có kicker 'Phần N')", () => {
  const r = buildDeck({ slides: [cover, { type: "agenda", title: "Bài có ba chương rõ ràng", items: ["A", "B", "C"], art: "none" },
    { type: "section", num: "1", title: "Chương một" }, { type: "section", num: "2", title: "Chương hai" }, { type: "section", num: "3", title: "Chương ba" }] });
  assert.ok(!/Mục lục \(agenda\) có 3 mục nhưng/.test(r.all), r.all);
});

test("find_images.score: đúng đối tượng + địa danh điểm cao; dính từ cần tránh / sai nơi bị trừ", () => {
  const { spawnSync } = require("child_process");
  const code = `import sys, json; sys.path.insert(0, ${JSON.stringify(path.join(ROOT, "scripts"))})
import find_images as f
b = {"must": ["rice", "paddy"], "place": ["Mekong", "Can Tho"], "avoid": ["market"]}
print(json.dumps([f.score({"title": "Rice paddy near Can Tho", "text": "", "w": 1920, "h": 1080}, b),
                  f.score({"title": "Floating market Can Tho", "text": "rice", "w": 1920, "h": 1080}, b),
                  f.score({"title": "River deltas in Tibet", "text": "", "w": 0, "h": 0}, b)]))`;
  const r = spawnSync("python3", ["-c", code], { encoding: "utf8" }); assert.strictEqual(r.status, 0, r.stderr);
  const [good, avoid, wrong] = JSON.parse(r.stdout);
  assert.ok(good > avoid && good > wrong && wrong < 1, r.stdout);
});
