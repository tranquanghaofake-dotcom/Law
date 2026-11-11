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

test("anh_va_chuong.json --strict ở 3 theme (bìa band, section có/không ảnh, photostats, mosaic, photostrip, cards ảnh, end)", () => {
  for (const t of ["teal", "kem", "son"]) {
    const r = build([EX, path.join(tmpdir(), `av_${t}.pptx`), "--theme", t, "--strict"]);
    assert.strictEqual(r.code, 0, `${t}:\n${r.all}`);
  }
});

test("section: bản đồ chương liệt kê mọi chương; có '/ 03'; chương có ảnh → hàng số tròn", async () => {
  const out = path.join(tmpdir(), "av.pptx"); assert.strictEqual(build([EX, out]).code, 0);
  const s6 = text(await xml(out, 6));
  for (const t of ["Hiện trạng: đô thị lấn ruộng", "Pháp luật về chuyển mục đích", "Kiến nghị", "/ 03"]) assert.ok(s6.includes(t), `slide 6 thiếu "${t}": ${s6}`);
  const s3 = await xml(out, 3);
  assert.ok(/descr="Cánh đồng lúa/.test(s3), "section có ảnh");
});

test("end: tiêu đề cảm ơn không bị bắt lỗi 'nhãn/câu hỏi'; tên nhóm và liên hệ có trên slide; không có thanh trên cùng", async () => {
  const out = path.join(tmpdir(), "end.pptx");
  const r = buildDeck({ slides: [cover, { type: "end", title: "Câu hỏi?", sub: "Mời thảo luận", team: [{ name: "Nguyễn Văn A", role: "Chương 1" }], contact: "a@example.edu.vn" }] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const x = text(await xml(r.pptx, 2));
  assert.ok(x.includes("Nguyễn Văn A") && x.includes("a@example.edu.vn"), x);
  assert.ok(!/\d\d \/ \d\d/.test(x), "slide end không có số trang / thanh tiến độ");
});

test("bìa: layout typo / art / band qua --strict; không còn dấu '•' khi thiếu initials; date ghép vào dòng phụ", async () => {
  const base = { kicker: "Tiểu luận", title: "Đô thị hoá nhanh — đất nông nghiệp [thu hẹp]", subtitle: "Phụ đề", author: "Nhóm 3", authorSub: "Lớp K47", date: "11/2026" };
  for (const layout of ["typo", "art"]) {
    const r = buildDeck({ slides: [Object.assign({ type: "cover", layout }, base)] }, ["--strict"]);
    assert.strictEqual(r.code, 0, `${layout}:\n${r.all}`);
    const x = text(await xml(r.pptx, 1));
    assert.ok(!x.includes("•") && x.includes("Lớp K47 · 11/2026"), `${layout}: ${x}`);
  }
  const dir = tmpdir(); fs.mkdirSync(path.join(dir, "images"));
  for (const f of ["tphcm-dem.jpg", "images.json"]) fs.copyFileSync(path.join(ROOT, "examples", "images", f), path.join(dir, "images", f));
  const band = buildDeck({ slides: [Object.assign({ type: "cover", layout: "band", photo: "images/tphcm-dem.jpg", photoAlt: "TP.HCM" }, base)] }, ["--strict"], dir);
  assert.strictEqual(band.code, 0, band.all);
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

test("chống mồ côi: chữ cuối đứng sau [nhấn mạnh] được nối bằng khoảng trắng không ngắt", async () => {
  const r = buildDeck({ slides: [cover, { type: "quote", quote: "Mỗi năm mất [hàng nghìn ha] lúa", by: "Ví dụ" }] });
  assert.strictEqual(r.code, 0, r.all);
  assert.ok((await xml(r.pptx, 2)).includes(" lúa"), "thiếu NBSP trước chữ cuối");
});

test("analyzePhoto: ảnh nửa trái rối, nửa phải trơn → phía yên tĩnh là 'right'; màu nổi bật đủ 4.5:1 trên nền trắng", async () => {
  const sharp = require("sharp"), dir = tmpdir(); fs.mkdirSync(path.join(dir, "images"));
  const W_ = 960, H_ = 540, buf = Buffer.alloc(W_ * H_ * 3);
  for (let y = 0; y < H_; y++) for (let x = 0; x < W_; x++) { const i = 3 * (y * W_ + x);
    if (x < W_ / 2) { const v = ((x >> 3) + (y >> 3)) % 2 ? 230 : 30; buf[i] = v; buf[i + 1] = v; buf[i + 2] = v; } // bàn cờ = rất nhiều chi tiết
    else { buf[i] = 40; buf[i + 1] = 140; buf[i + 2] = 70; } } // xanh lá trơn
  await sharp(buf, { raw: { width: W_, height: H_, channels: 3 } }).jpeg().toFile(path.join(dir, "images", "t.jpg"));
  const b = require(path.join(ROOT, "engine", "build.js")); b._setDeckDir(dir);
  const r = await b.analyzePhoto("images/t.jpg", 13.333, 7.5);
  assert.strictEqual(r.quiet, "right");
  assert.ok(r.contrastBusy > 1.5, String(r.contrastBusy));
  assert.ok(r.accent && r.accentDark, JSON.stringify(r));
});

test("một ảnh dùng ở ≥ 2 slide → cảnh báo, chặn --strict", () => {
  const dir = tmpdir(); fs.mkdirSync(path.join(dir, "images"));
  for (const f of ["tphcm-dem.jpg", "images.json"]) fs.copyFileSync(path.join(ROOT, "examples", "images", f), path.join(dir, "images", f));
  const ph = { type: "photo", title: "Lời kết ngắn gọn", photo: "images/tphcm-dem.jpg", photoAlt: "x" };
  const r = buildDeck({ slides: [cover, ph, Object.assign({}, ph, { title: "Lời kết thứ hai" })] }, ["--strict"], dir);
  assert.strictEqual(r.code, 1, r.all); assert.ok(/dùng ở 2 slide \(2, 3\)/.test(r.all), r.all);
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
