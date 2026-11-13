// Kiểm nội dung trước khi dựng (hinh/kiem_noi_dung.js) — các bước kiểm chuyển từ tầng Office cũ sang hinh/dung.js (spec: một tầng hình ảnh, 11/2026).
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const sharp = require("sharp");
const KND = require("../hinh/kiem_noi_dung");
const { dung } = require("../hinh/dung");
process.env.SLIDE_CHUAN_NO_PREP = "1";

const thuMuc = () => fs.mkdtempSync(path.join(os.tmpdir(), "knd-"));
const ghiDeck = (dir, deck) => { const f = path.join(dir, "deck.json"); fs.writeFileSync(f, JSON.stringify(deck)); return f; };
const anh = async (dir, ten, w) => { fs.mkdirSync(path.join(dir, "images"), { recursive: true }); await sharp({ create: { width: w, height: Math.round(w * 0.6), channels: 3, background: "#777" } }).jpeg().toFile(path.join(dir, "images", ten)); return "images/" + ten; };
const bia = { type: "cover", title: "Bìa thử nghiệm của bài" };

test("lỗi cấu trúc dừng dựng (mã 2); kiểu cảnh / bộ hình không bị coi là kiểu lạ", async () => {
  const dir = thuMuc();
  await assert.rejects(dung({ deckPath: ghiDeck(dir, { slides: [bia, { type: "khong-co-that", title: "x" }] }), htmlOnly: true }), (e) => e.code === 2 && /khong-co-that/.test(e.message));
  await assert.rejects(dung({ deckPath: ghiDeck(dir, { slides: [bia, { type: "cards", title: "Thiếu items" }] }), htmlOnly: true }), (e) => e.code === 2 && /items/.test(e.message));
  const r = await KND.kiemNoiDung({ slides: [bia, { type: "bigq", q: "Hỏi?" }, { type: "bcbia", title: "x" }, { type: "qtban", title: "y" }] }, { extraTypes: ["bigq", "bcbia", "qtban"] });
  assert.deepEqual(r.errors, []);
});

test("giới hạn ký tự từng trường (engine/limits.js) — kể cả phần tử trong mảng", () => {
  const w = KND.kiemGioiHan([{ type: "cards", title: "x".repeat(200), items: [{ name: "n", desc: "d".repeat(400) }] }]);
  assert.ok(w.some((m) => /Slide 1 title: 200\//.test(m)), w.join("\n"));
  assert.ok(w.some((m) => /items\[0\]\.desc/.test(m)), w.join("\n"));
});

test("ảnh: không có → lỗi; nhỏ → cảnh báo; thiếu ghi công → cảnh báo; ghi công gom vào danh sách; 2 ảnh cùng bài nguồn → cảnh báo", async () => {
  const dir = thuMuc(), nho = await anh(dir, "nho.jpg", 800), to = await anh(dir, "to.jpg", 1700), to2 = await anh(dir, "to2.jpg", 1700);
  const loi = await KND.kiemNoiDung({ slides: [bia, { type: "photo", title: "Ảnh không có thật", photo: "images/khong.jpg" }] }, { deckDir: dir });
  assert.ok(loi.errors.some((m) => /không tìm thấy "images\/khong.jpg"/.test(m)));
  const r = await KND.kiemNoiDung({ slides: [bia,
    { type: "photo", title: "Ảnh nhỏ không ghi công", photo: nho },
    { type: "photo", title: "Ảnh có nguồn báo", photo: to, photoSource: "https://vnexpress.net/bai-a" },
    { type: "photo", title: "Ảnh khác cùng bài báo", photo: to2, photoSource: "https://vnexpress.net/bai-a" }] }, { deckDir: dir });
  const W = r.warnings.join("\n");
  assert.match(W, /nho.jpg" chỉ rộng 800px/);
  assert.match(W, /nho.jpg" thiếu thông tin ghi công/);
  assert.match(W, /2 ảnh lấy từ CÙNG một trang nguồn \(slide 3, 4/);
  assert.deepEqual(r.credits.map((c) => c.text), ["Nguồn ảnh: vnexpress.net", "Nguồn ảnh: vnexpress.net"]);
  assert.ok(r.info.some((m) => /imagePolicy "classroom"/.test(m)));
  const f = KND.ghiFileGhiCong(path.join(dir, "bai.pptx"), r.credits, ["FaHouse"]);
  assert.match(fs.readFileSync(f, "utf8"), /Slide 3: Nguồn ảnh: vnexpress.net — https:\/\/vnexpress.net\/bai-a[\s\S]*Font Awesome Free[\s\S]*FaHouse/);
});

test("ghi chú thiếu, thời lượng lệch, ước tính phút nói (~160 tiếng/phút + hoạt động trên lớp)", async () => {
  const noi = Array.from({ length: 320 }, () => "chữ").join(" ");   // 320 tiếng ≈ 2 phút
  const r = await KND.kiemNoiDung({ meta: { minutes: 10 }, slides: [bia, { type: "quizgo", q: "Hỏi?", options: ["a", "b"], answer: 0, notes: noi }, { type: "end", title: "Cảm ơn" }] }, { extraTypes: ["quizgo"] });
  const W = r.warnings.join("\n");
  assert.match(W, /Ghi chú thuyết trình thiếu ở slide 1, 3/);
  assert.match(W, /meta.minutes = 10 phút → nên có 9–15 slide/);
  assert.match(W, /~3 phút nhưng meta.minutes = 10/);
  assert.ok(r.info.some((m) => /nói 320 tiếng ≈ 2 phút.*hoạt động trên lớp 1 phút/.test(m)), r.info.join("\n"));
});

test("đối chiếu dàn ý: mục lá chưa có slide → cảnh báo; covers / meta.skip phủ mục cha phủ luôn mục con", async () => {
  const ol = [{ id: "1", title: "Phần một", words: 0 }, { id: "1.1", title: "Khái niệm", words: 300 }, { id: "1.2", title: "Đặc điểm", words: 300 }, { id: "2", title: "Thực trạng", words: 400 }];
  const r = await KND.kiemNoiDung({ meta: { outline: ol, skip: { "2": "ngoài phạm vi 20 phút" } }, slides: [bia, { type: "cards", title: "Khái niệm bảo hiểm", covers: ["1.1"], items: [{ name: "a" }] }] });
  assert.match(r.warnings.join("\n"), /mục 1.2 "Đặc điểm"/);
  assert.ok(!/mục 2 /.test(r.warnings.join("\n")));
  assert.ok(r.info.some((m) => /2\/3 mục/.test(m)), r.info.join("\n"));
});

test("--titles: in mạch tiêu đề, báo tiêu đề nhãn / câu hỏi / trùng; chương in thành dòng PHẦN", () => {
  const t = KND.machTieuDe({ slides: [bia, { type: "section", num: 1, title: "Thực trạng" }, { type: "cards", title: "Tổng quan" }, { type: "cards", title: "Vì sao quỹ hụt?" }, { type: "table", title: "Tổng quan" }, { type: "bcchuong", num: 2, part: "x", title: "Chương hai" }] });
  assert.match(t, /── PHẦN 1: THỰC TRẠNG ──/);
  assert.match(t, /Slide 3: "Tổng quan" giống nhãn/);
  assert.match(t, /Slide 4: tiêu đề là câu hỏi/);
  assert.match(t, /Slide 3 và 5: trùng tiêu đề/);
  assert.match(t, /── PHẦN 2: CHƯƠNG HAI ──/);
});

test("dung --strict dừng (mã 3) khi còn cảnh báo nội dung; --titles không dựng", async () => {
  const dir = thuMuc(), f = ghiDeck(dir, { meta: { minutes: 30 }, slides: [bia, { type: "cards", title: "Ba điểm chính của bài", items: [{ name: "a" }] }] });
  await assert.rejects(dung({ deckPath: f, htmlOnly: true, strict: true }), (e) => e.code === 3 && /cảnh báo nội dung/.test(e.message));
  const r = await dung({ deckPath: f, htmlOnly: true, titles: true });
  assert.equal(r.titles, true);
  assert.ok(!fs.existsSync(path.join(dir, "deck_lop")));
  const h = await dung({ deckPath: f, htmlOnly: true });   // không --strict: vẫn dựng nháp
  assert.ok(fs.existsSync(h.htmlPath));
});

test("deck dựng bằng bộ hình tự vẽ (bh*, bc*, qt*) không bị nhắc 'chưa có ảnh thật'", async () => {
  const sl = Array.from({ length: 12 }, (_, i) => ({ type: i ? "bhchuong" : "bhbia", title: `Slide bộ hình số ${i + 1}`, num: String(i + 1) }));
  const r = await KND.kiemNoiDung({ meta: { da: "so-bhxh" }, slides: sl }, { extraTypes: ["bhbia", "bhchuong"] });
  assert.ok(!r.hints.some((h) => /chưa có ảnh thật nào/.test(h)), r.hints.join("\n"));
});

test("bhchuong được tính là slide mở phần; mã môn dính chữ (BNK405) không bị đếm là con số lặp", async () => {
  const sl = [{ type: "bhbia", title: "Bìa bài BNK405", kicker: "BNK405 · Báo cáo" }, { type: "bhdo", lines: ["Câu hỏi lớn"], kicker: "BNK405" }];
  for (const p of [1, 2, 3]) { sl.push({ type: "bhchuong", num: String(p), title: p === 3 ? "Đạt được gì, vướng ở đâu?" : `Câu hỏi phần ${p} của bài`, sub: "Tài liệu BNK405" });
    sl.push({ type: "bhtrich", kicker: `Phần ${p} · Nội dung`, quote: "Trích dẫn" }, { type: "bhtrich", kicker: `Phần ${p} · Nội dung tiếp`, quote: "Trích dẫn khác" }); }
  const r = await KND.kiemNoiDung({ meta: { kind: "report" }, slides: sl }, { extraTypes: ["bhbia", "bhdo", "bhchuong", "bhtrich"] });
  const all = [...r.errors, ...r.warnings].join("\n");
  assert.ok(!/không có slide mở đầu/.test(all), all);
  assert.ok(!/Số "405"/.test(all), all);
  assert.ok(!/thiếu chủ ngữ/.test(all), all);
});
