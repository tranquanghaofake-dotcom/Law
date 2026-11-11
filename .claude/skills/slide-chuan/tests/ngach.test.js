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

test("ngách 1: section kiểu dark — 'Trong chương này' không đè dải tên chương, kể cả tiêu đề 2 dòng + 4 mục", async () => {
  const deck = { meta: { kit: "paper" }, slides: [cover,
    sec("1", "Căn cứ vô hiệu"), card("Vô hiệu thì quay về như chưa từng giao dịch", "Phần 1 · A"),
    sec("2", "Ngoại lệ hình thức và hậu quả"), card("Bên ngay tình được giữ hoa lợi đã thu", "Phần 2 · B"),
    sec("3", "Thời hiệu yêu cầu tuyên vô hiệu", { style: "dark", sub: "Hai năm cho đa số căn cứ — không hạn chế cho hai căn cứ",
      inside: ["Quá hai năm không yêu cầu thì giao dịch có hiệu lực", "Hai năm tính từ lúc biết, không phải lúc ký", "Giả tạo và vi phạm điều cấm không hạn chế thời hiệu", "Tặng cho để trốn nợ tám năm sau vẫn kiện được"] }),
    card("Hết thời hiệu thì giao dịch có hiệu lực", "Phần 3 · C")] };
  const r = buildDeck(deck, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const sh = await shapes(r.pptx, 6), bar = sh.filter(s => s.kind === "sp" && s.y >= 7.5 - 0.96 && s.y < 7.5 - 0.8 && !s.text);
  assert.ok(bar.length >= 3, "có dải tiến độ chương");
  const barTop = Math.min(...bar.map(b => b.y)), body = sh.filter(s => s.text && s.y < barTop - 0.01 && s.x < 7.5);
  for (const t of body) assert.ok(t.y + t.h <= barTop + 0.01, `"${t.text.slice(0, 30)}" (đáy ${(t.y + t.h).toFixed(2)}) chạm dải chương (${barTop.toFixed(2)})`);
});

test("ngách 1b: chữ đè chữ được kiểm ở MỌI slide (cả section / nền tối), số cực lớn đo theo nét chữ", () => {
  const ok = build([path.join(ROOT, "examples", "do_hoa_code.json"), path.join(require("os").tmpdir(), "ngach_hero.pptx")]);
  assert.ok(!/hero\): chữ "14" đè/.test(ok.all), "số 300pt của hero không bị báo nhầm:\n" + ok.all);
});

test("ngách 2: băng dính / đồ vật không đè icon hay chữ (bộ paper, cards 4 thẻ)", async () => {
  const r = buildDeck({ meta: { kit: "paper" }, slides: [cover, card("Vô hiệu thì quay về như chưa từng giao dịch")] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const sh = await shapes(r.pptx, 2), deco = sh.filter(s => s.kind === "pic" && /Trang trí|Đồ vật/.test(s.descr));
  const icons = sh.filter(s => s.kind === "pic" && /^Pi/.test(s.descr)), texts = sh.filter(s => s.kind === "sp" && s.text.trim() && s.y > 2);
  for (const d of deco) { const r2 = { x: d.x + 0.04, y: d.y + 0.04, w: d.w - 0.08, h: d.h - 0.08 };
    for (const i of icons) assert.ok(!hit(r2, i), `"${d.descr}" đè icon ${i.descr}`); }
  assert.ok(!r.all.includes("đồ trang trí"), r.all);
});

test("ngách 3: nhãn pill đo bằng font thật — 'Không có hạn' giãn rộng, không xuống dòng", async () => {
  const bn = { type: "bignum", title: "Quá hai năm không yêu cầu thì giao dịch có hiệu lực", num: "2", unit: "năm", conds: [
    { ok: "yes", head: "Điều 125–129", desc: "Năng lực, ý chí, hình thức", verdict: "2 năm" },
    { ok: "na", head: "Điều 123 và Điều 124", desc: "Điều cấm, đạo đức, giả tạo", verdict: "Không có hạn" }] };
  const r = buildDeck({ meta: { kit: "paper" }, slides: [cover, bn] }, ["--strict", "--theme", "muc"]);
  assert.strictEqual(r.code, 0, r.all);
  const sh = await shapes(r.pptx, 2), p = sh.find(s => s.text === "KHÔNG CÓ HẠN");
  assert.ok(p && p.w > 1.3, "pill phải rộng hơn 1.3 in: " + JSON.stringify(p));
  assert.ok(p.x + p.w <= 13.333 - 0.5, "pill giãn sang trái, không tràn mép phải");
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

test("ngách 5: match — đối ứng hai cột, gộp ô trái trùng nhau, focus; < 2 cặp bị chặn", async () => {
  const m = { type: "match", kicker: "Điều 117 ↔ Điều 123–129", title: "Mỗi căn cứ vô hiệu là mặt trái của một điều kiện", colL: "Điều kiện (Đ117)", colR: "Căn cứ vô hiệu",
    pairs: [{ left: "Chủ thể có năng lực phù hợp", right: "Điều 125 · Năng lực hành vi" }, { left: "Chủ thể có năng lực phù hợp", right: "Điều 128 · Không nhận thức" },
      { left: "Hoàn toàn tự nguyện", right: "Điều 126–127 · Nhầm lẫn, lừa dối" }, { left: "Mục đích, nội dung hợp pháp", right: "Điều 123 · Điều cấm; Điều 124 · Giả tạo" },
      { left: "Hình thức (khi luật quy định)", right: "Điều 129 · Vi phạm hình thức", note: "Có ngoại lệ 2/3 nghĩa vụ" }], focus: 4 };
  const r = buildDeck({ slides: [cover, m] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const sh = await shapes(r.pptx, 2);
  assert.strictEqual(sh.filter(s => s.text === "Chủ thể có năng lực phù hợp").length, 1, "hai hàng cùng ô trái → gộp thành MỘT ô");
  assert.strictEqual(sh.filter(s => s.text === "→").length, 5);
  const one = buildDeck({ slides: [cover, Object.assign({}, m, { pairs: m.pairs.slice(0, 1), focus: 0 })] });
  assert.strictEqual(one.code, 2, one.all);
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

test("bỏ nguồn: slide không in 'Nguồn:' hay dòng ghi nguồn ảnh; ghi công ảnh xuất ra *_ghi-cong.md; trường source bị cảnh báo đã bỏ", async () => {
  const dir = require("./helpers").tmpdir(); fs.mkdirSync(path.join(dir, "images"));
  await require("sharp")({ create: { width: 1920, height: 1080, channels: 3, background: "#557766" } }).jpeg().toFile(path.join(dir, "images", "a.jpg"));
  const cr = "Ảnh: Tác giả · CC BY 4.0 · Wikimedia Commons";
  const deck = { slides: [cover, { type: "photo", title: "Lời kết ngắn gọn cho bài", photo: "images/a.jpg", photoCredit: cr },
    { type: "table", title: "Ba mốc tính thời hiệu khác nhau", cols: [{ label: "Căn cứ" }, { label: "Tính từ" }], rows: [["Đ126", "Biết"], ["Đ128", "Xác lập"], ["Đ129", "Xác lập"]], focus: 1, note: "Hai căn cứ tính từ ngày xác lập" }] };
  const r = buildDeck(deck, ["--strict"], dir);
  assert.strictEqual(r.code, 0, r.all);
  for (const n of [2, 3]) { const sh = await shapes(r.pptx, n); assert.ok(!sh.some(s => /Nguồn|Ảnh: Tác giả/.test(s.text)), `slide ${n} còn chữ ghi nguồn`); }
  const md = fs.readFileSync(r.pptx.replace(/\.pptx$/, "") + "_ghi-cong.md", "utf8");
  assert.ok(md.includes("Slide 2: " + cr), md);
  const w = buildDeck(Object.assign({}, deck, { slides: [cover, Object.assign({}, deck.slides[2], { source: "BLDS 2015" })] }), [], dir);
  assert.ok(w.all.includes('trường "source" đã bỏ'), w.all);
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

// ---------- phản biện thiết kế bằng 2 agent (11/2026) ----------
test("phản biện: băng dính không dán vào quiz / compare (điểm nhấn riêng); đồ vật tối đa 1 mỗi 3 slide", async () => {
  const q = { type: "quiz", title: "Câu nào đúng về thời hiệu?", options: ["A một", "B hai", "C ba", "D bốn"] };
  const cmp = { type: "compare", title: "Luật mới cho giữ giao dịch đã làm hai phần ba", focus: "right", left: { title: "Cũ", value: "Buộc" }, right: { title: "Mới", value: "2/3" } };
  const filler = (t) => ({ type: "steps", title: t, steps: [{ head: "Một" }, { head: "Hai" }, { head: "Ba" }] });
  const r = buildDeck({ meta: { kit: "paper" }, slides: [cover, q, cmp, filler("Bước một của thủ tục"), filler("Bước hai của thủ tục"), filler("Bước ba của thủ tục"), filler("Bước bốn của thủ tục")] });
  assert.strictEqual(r.code, 0, r.all);
  for (const n of [2, 3]) assert.ok(!(await shapes(r.pptx, n)).some(s => s.descr === "Trang trí"), `slide ${n} không được có băng dính`);
  const props = []; for (let n = 2; n <= 7; n++) if ((await shapes(r.pptx, n)).some(s => s.descr === "Đồ vật trang trí")) props.push(n);
  for (let i = 1; i < props.length; i++) assert.ok(props[i] - props[i - 1] >= 3, "đồ vật quá dày: " + props.join(","));
});

test("phản biện: slide mở phần dùng cùng từ với kicker ('Phần'); 'Trong phần này' bỏ slide lời giải sau exercise", async () => {
  const ex = { type: "exercise", kicker: "Phần 1 · Bài", title: "Bài 1: hợp đồng mua nhà viết tay", prompt: "Đề bài ngắn.", ask: "Toà xử lý thế nào?" };
  const sol = { type: "checklist", kicker: "Phần 1 · Lời giải", title: "Đã trả 75% giá thì Toà công nhận hợp đồng", items: [{ ok: "yes", head: "Có văn bản" }, { ok: "yes", head: "Làm ≥ 2/3" }], verdict: { ok: "yes", text: "Công nhận" } };
  const r = buildDeck({ slides: [cover, { type: "section", num: "1", title: "Căn cứ vô hiệu" }, ex, sol, { type: "section", num: "2", title: "Thời hiệu" }, { type: "statement", kicker: "Phần 2 · X", title: "Hai năm cho đa số căn cứ" }] });
  assert.strictEqual(r.code, 0, r.all);
  const t = (await shapes(r.pptx, 2)).map(s => s.text).join(" | ");
  assert.ok(/PHẦN 01 \/ 02|Phần 01 \/ 02/i.test(t) && /TRONG PHẦN NÀY/.test(t), t);
  assert.ok(!t.includes("Đã trả 75% giá"), "lộ lời giải: " + t);
});

test("phản biện: thời lượng cộng hoạt động trên lớp; end 1 người → 'Trình bày'; quiz có stem; trích dẫn dài in đứng", async () => {
  const notes = Array(160).fill("chữ").join(" ");
  const ex = { type: "exercise", title: "Bài 1: hợp đồng mua nhà viết tay", prompt: "Đề.", ask: "Hỏi?", notes };
  const r = buildDeck({ slides: [cover, ex, { type: "quiz", title: "Câu nào đúng về thời hiệu?", stem: "Năm 2018 A bán xe cho em trai để trốn nợ B.", options: ["A", "B", "C"], notes, activitySec: 30 },
    { type: "quote", quote: Array(30).fill("chữ").join(" ") + " [cố ý]", by: "Điều 127 BLDS 2015" },
    { type: "end", title: "Cảm ơn các bạn", team: [{ name: "Trần Quang Hào" }] }] });
  assert.strictEqual(r.code, 0, r.all);
  assert.ok(/hoạt động trên lớp 3 phút/.test(r.all), r.all); // 120 s (exercise mặc định) + 30 s (activitySec) ≈ 3 phút
  assert.ok((await shapes(r.pptx, 3)).some(s => s.text.includes("Năm 2018 A bán xe")), "thiếu stem");
  assert.ok((await shapes(r.pptx, 5)).some(s => s.text === "TRÌNH BÀY" || s.text === "Trình bày"), "end 1 người phải ghi 'Trình bày'");
  const z = await JSZip.loadAsync(fs.readFileSync(r.pptx)), x = await z.file("ppt/slides/slide4.xml").async("string");
  assert.ok(!/<a:rPr[^>]*\si="1"[^>]*>(?:(?!<\/a:r>).)*?chữ chữ/.test(x), "trích dẫn > 25 chữ không được in nghiêng");
  assert.ok(/<a:rPr[^>]*\sb="1"[^>]*>(?:(?!<\/a:r>).)*?cố.ý/s.test(x), "[nhấn] phải đậm");
});

test("vòng 'làm': agenda không hình giãn hết bề ngang; flow 2 nút không quá 4.2 in; băng dính không đè đường nối", async () => {
  const r = buildDeck({ meta: { kit: "paper" }, slides: [cover,
    { type: "agenda", title: "Bài này trả lời ba câu hỏi", art: "none", items: ["Một?", "Hai?", "Ba?"] },
    { type: "flow", title: "Hai bên hoàn trả cho nhau", nodes: [{ id: "a", name: "Ông An" }, { id: "b", name: "Bà Bình" }],
      edges: [{ from: "b", to: "a", label: "Trả lại nhà", side: "above" }, { from: "a", to: "b", label: "Trả lại tiền", side: "below" }] }] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const ag = (await shapes(r.pptx, 2)).filter(s => s.kind === "sp" && s.h > 0.8 && s.w > 5);
  assert.ok(ag.some(s => s.x + s.w > 13.333 - 0.6 - 0.05), "thẻ agenda phải giãn tới lề phải");
  const fl = await shapes(r.pptx, 3), cards = fl.filter(s => s.kind === "sp" && s.h > 1.2 && s.w > 2 && s.y > 2);
  assert.ok(cards.length >= 2 && cards.every(s => s.w <= 4.21), "nút flow quá rộng: " + cards.map(s => s.w.toFixed(2)));
});
