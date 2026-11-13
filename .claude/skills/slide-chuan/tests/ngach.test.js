// Test: các "ngách" tìm được khi soát deck "Giao dịch dân sự vô hiệu" (11/2026) — mỗi test giữ một lỗi không quay lại.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, build, buildDeck, cover } = require("./helpers");

const EMU = 914400;
// đọc mọi hình trong một slide: { kind, name, text, x, y, w, h } (inch)
async function shapes(pptx, n) {
  const z = await JSZip.loadAsync(fs.readFileSync(pptx)), x = await z.file(`ppt/slides/slide${n}.xml`).async("string"), out = [];
  for (const m of x.matchAll(/<p:(pic|sp)>([\s\S]*?)<\/p:\1>/g)) {
    const b = m[2], off = b.match(/<a:off x="(-?\d+)" y="(-?\d+)"\/>/), ext = b.match(/<a:ext cx="(\d+)" cy="(\d+)"\/>/);
    if (!off || !ext) continue;
    const descr = (b.match(/descr="([^"]*)"/) || [])[1] || "", text = [...b.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(q => q[1]).join("").replace(/\u00a0/g, " ");
    out.push({ kind: m[1], descr, text, x: off[1] / EMU, y: off[2] / EMU, w: ext[1] / EMU, h: ext[2] / EMU });
  }
  return out;
}
const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const sec = (num, title, extra = {}) => Object.assign({ type: "section", num, title }, extra);
const card = (t, k) => ({ type: "cards", kicker: k, title: t, items: [{ icon: "PiProhibitDuotone", name: "Không phát sinh", who: "Khoản 1", desc: "Không làm phát sinh quyền, nghĩa vụ từ thời điểm xác lập" }, { icon: "PiArrowCounterClockwiseDuotone", name: "Hoàn trả", who: "Khoản 2", desc: "Hoàn trả những gì đã nhận" }, { icon: "PiPlantDuotone", name: "Hoa lợi", who: "Khoản 3", desc: "Bên ngay tình giữ hoa lợi" }, { icon: "PiScalesDuotone", name: "Bồi thường", who: "Khoản 4", desc: "Bên có lỗi bồi thường" }] });

test("ngách 1b: chữ đè chữ được kiểm ở MỌI slide (cả section / nền tối), số cực lớn đo theo nét chữ", () => {
  const ok = build([path.join(ROOT, "examples", "do_hoa_code.json"), path.join(require("os").tmpdir(), "ngach_hero.pptx")]);
  assert.ok(!/hero\): chữ "14" đè/.test(ok.all), "số 300pt của hero không bị báo nhầm:\n" + ok.all);
});

test("ngách 4: ok 'na' hợp lệ ở bignum / checklist và vẽ dấu gạch (không phải X đỏ)", async () => {
  const ck = { type: "checklist", title: "Đủ ba điều kiện thì hợp đồng được công nhận", items: [
    { ok: "yes", head: "Lập bằng văn bản" }, { ok: "na", head: "Đăng ký biến động", text: "Không áp dụng cho câu hỏi này" }, { ok: "yes", head: "Đã làm ≥ 2/3 nghĩa vụ" }],
    verdict: { ok: "yes", text: "Toà công nhận hợp đồng" } };
  const r = buildDeck({ slides: [cover, ck] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const bad = buildDeck({ slides: [cover, Object.assign({}, ck, { items: [{ ok: "khac", head: "x" }, { ok: "yes", head: "y" }] })] });
  assert.strictEqual(bad.code, 2, "giá trị ok lạ phải bị chặn");
});

test("ngách 6: --titles không báo 'không có tiêu đề' cho quote (câu trích là luận điểm)", () => {
  const dir = buildDeck({ slides: [cover, { type: "quote", kicker: "Lừa dối", quote: "Lừa dối là hành vi cố ý của một bên…", by: "Điều 127 BLDS 2015" }] }).dir;
  const r = build([path.join(dir, "deck.json"), "--titles"]);
  assert.ok(!r.all.includes("không có tiêu đề"), r.all);
  assert.ok(r.all.includes("“Lừa dối là hành vi"), "in đầu câu trích thay tiêu đề:\n" + r.all);
});

test("ngách 7: quiz — phương án đúng chứa sẵn cụm từ của lời giải / dài hơn hẳn → cảnh báo; phương án trung tính → không", () => {
  const q = (opts, why) => ({ type: "quiz", kicker: "Đáp án", title: "Tặng cho để trốn nợ: 8 năm sau còn kiện được?", reveal: true, answer: 2, options: opts, why });
  const leak = buildDeck({ slides: [cover, q(["Không — quá 2 năm từ ngày xác lập", "Không — quá 2 năm từ ngày biết", "Được — giả tạo không hạn chế thời hiệu", "Được — nếu bên kia đồng ý"], "Trốn nghĩa vụ là giả tạo (k2 Đ124); k3 Đ132 không hạn chế thời hiệu.")] });
  assert.ok(/phương án đúng chứa sẵn "(giả tạo|không hạn|hạn chế|chế thời)/.test(leak.all), leak.all);
  const ok = buildDeck({ slides: [cover, q(["Không — quá 2 năm từ ngày xác lập", "Không — quá 2 năm từ ngày biết", "Được — thời hiệu không bị hạn chế", "Được — nếu bên kia đồng ý"], "Trốn nghĩa vụ là giả tạo (k2 Đ124); k3 Đ132: thời hiệu không bị hạn chế.")] });
  assert.ok(!ok.all.includes("phương án đúng chứa sẵn"), ok.all);
  const long = buildDeck({ slides: [cover, q(["Không", "Không rõ", "Được vì giao dịch giả tạo nhằm trốn tránh nghĩa vụ với người thứ ba thì thời hiệu không bị hạn chế theo luật", "Tuỳ"], "Khoản 3 Điều 132.")] });
  assert.ok(long.all.includes("chọn câu dài nhất"), long.all);
});

test("ngách 8: đề bài tập có năm mà lời giải không nhắc thời hiệu / luật áp dụng → gợi ý", () => {
  const ex = { type: "exercise", title: "Bài 1: hợp đồng mua nhà viết tay", prompt: "Năm 2023, ông An bán nhà cho bà Bình bằng hợp đồng viết tay, không công chứng. Năm 2025 ông An kiện.", ask: "Toà xử lý thế nào?" };
  const sol = (t) => ({ type: "checklist", title: "Trả 75% giá thì hợp đồng được công nhận", items: [{ ok: "yes", head: "Lập bằng văn bản" }, { ok: "yes", head: t }], verdict: { ok: "yes", text: "Toà công nhận" } });
  const miss = buildDeck({ slides: [cover, ex, sol("Đã làm ≥ 2/3 nghĩa vụ")] });
  assert.ok(miss.all.includes("không nhắc thời hiệu"), miss.all);
  const has = buildDeck({ slides: [cover, ex, sol("Còn thời hiệu: kiện trong 2 năm từ ngày xác lập")] });
  assert.ok(!has.all.includes("không nhắc thời hiệu"), has.all);
});

test("ngách 10: thời lượng — 20 slide cho 13 phút là thừa (giới hạn làm tròn vào trong: 12–19)", () => {
  const slides = [cover]; for (let i = 0; i < 19; i++) slides.push({ type: "statement", title: `Ý chính số ${i + 1} của bài giảng này`, sub: "x" });
  const r = buildDeck({ meta: { minutes: 13 }, slides });
  assert.ok(r.all.includes("nên có 12–19 slide"), r.all);
});

test("ngách ảnh: chạy lại --brief cho một brief không xoá ứng viên của brief khác (gộp candidates.json)", () => {
  const dir = require("./helpers").tmpdir(), py = `
import sys, json, os
sys.path.insert(0, ${JSON.stringify(path.join(ROOT, "scripts"))})
import find_images as F
F.SOURCES["fake"] = lambda q, n: [{"url": "https://x/" + q.replace(" ", "_") + str(i), "w": 2000, "title": q, "license": "CC0"} for i in range(2)]
F.sheet_mode = lambda d: None
d = ${JSON.stringify(dir)}
for bid in ("a", "b"):
    json.dump({"briefs": [{"id": bid, "want": bid, "queries": ["q " + bid], "sources": ["fake"]}]}, open(os.path.join(d, bid + ".json"), "w"))
    F.brief_mode(d, os.path.join(d, bid + ".json"))
print(sorted(json.load(open(os.path.join(d, "images", "candidates.json"))).keys()))`;
  const r = require("child_process").spawnSync("python3", ["-I", "-c", py], { encoding: "utf8" });
  assert.ok(r.stdout.includes("['a', 'b']"), r.stdout + r.stderr);
});

test("ngách 12: prep.json và meta.minutes lệch thời lượng → cảnh báo Bước 0", () => {
  const dir = require("./helpers").tmpdir();
  fs.writeFileSync(path.join(dir, "prep.json"), JSON.stringify({ kind: "lecture", topic: "x", audience: "y", minutes: 15, sources: [{ title: "BLDS 2015", legal: true, status: "hiện hành" }], plan: [{ slide: 1, type: "cover", title: "x" }, { slide: 2, type: "statement", title: "y" }], approved: true }));
  const r = buildDeck({ meta: { minutes: 13 }, slides: [cover, { type: "statement", title: "Ý chính của bài giảng này", sub: "x" }] }, [], dir, { prep: true });
  assert.ok(r.all.includes("thời lượng lệch — prep.json 15 phút, meta.minutes 13 phút"), r.all);
});
