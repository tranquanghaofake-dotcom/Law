// Test: luật cho bài BÁO CÁO SỐ LIỆU / THỰC TRẠNG — học từ nhận xét của giảng viên cho deck BNK405 (11/2026):
// (1)(3) nguyên nhân đặt tại từng năm tăng / giảm / chi vượt thu · (2) phạm vi · (4) nhận định có nguồn · (5) hạn chế dựa trên số liệu
// đã trình bày · (6) kiến nghị chỉ ra điều, khoản · (7) mỗi ý một ô chữ, căn đều.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const JSZip = require("jszip");
const { validate } = require("../engine/validate");
const { buildDeck, cover } = require("./helpers");

// mặc định bài report (luật chặn --strict); loại bài khác chỉ gợi ý ℹ
const W = (deck) => validate(Object.assign({}, deck, { meta: Object.assign({ kind: "report" }, deck.meta) })).warnings.join("\n");
const yrs = (vals, extra = {}) => vals.map((v, i) => Object.assign({ label: String(2015 + i), value: v }, extra[i] || {}));
const col = (items, more = {}) => Object.assign({ type: "chart", kind: "column", title: "Số người tham gia tăng trừ năm 2022", items, insight: { text: "Tăng 7 triệu người" } }, more);

test("(1) cột theo năm đổi chiều mà không có why → cảnh báo, nêu đúng năm", () => {
  const w = W({ meta: { kind: "report" }, slides: [cover, col(yrs([12.1, 12.7, 13.2, 15.8, 15.1, 16.8]))] });
  assert.match(w, /năm 2019, 2020 đổi chiều hoặc âm/);
});
test("(1) có why ở năm đổi chiều → hết cảnh báo", () => {
  const w = W({ meta: { kind: "report" }, slides: [cover, col(yrs([12.1, 12.7, 13.2, 15.8, 15.1, 16.8], { 4: { why: "COVID-19: 2,1 triệu lao động mất việc" }, 5: { why: "Phục hồi sản xuất" } }))] });
  assert.doesNotMatch(w, /đổi chiều hoặc âm/);
});
test("luật báo cáo: bài không phải report → chỉ gợi ý (hints), không chặn --strict", () => {
  const r = validate({ meta: { kind: "case" }, slides: [cover, col(yrs([12.1, 12.7, 13.2, 15.8, 15.1, 16.8]))] });
  assert.doesNotMatch(r.warnings.join("\n"), /đổi chiều/); assert.match(r.hints.join("\n"), /đổi chiều hoặc âm/);
});
test("(3) năm âm (chi vượt thu) phải có why", () => {
  const w = W({ slides: [cover, col(yrs([62.9, 60.8, 70.4, 79.5, -10.8, -19.5], { 1: { why: "a" }, 2: { why: "b" }, 3: { why: "c" } }))] });
  assert.match(w, /năm 2019, 2020 đổi chiều hoặc âm/);
});
test("(3) slide nguyên nhân chung cho cả giai đoạn dài → cảnh báo", () => {
  const w = W({ slides: [cover, { type: "cards", title: "Nguyên nhân chi vượt thu 2016–2025", items: [{ name: "Già hoá", desc: "Số người hưởng hưu tăng 5%/năm" }, { name: "Rút một lần", desc: "800.000 người năm 2023" }] }] });
  assert.match(w, /nguyên nhân chung cho cả 2016–2025/);
});
test("(1) why chỉ vẽ cho column, tối đa 4, ≤ 70 ký tự", () => {
  const its = yrs([1, 2, 3, 4, 5], { 0: { why: "x".repeat(80) }, 1: { why: "a" }, 2: { why: "b" }, 3: { why: "c" }, 4: { why: "d" } });
  const w = W({ slides: [cover, col(its)] });
  assert.match(w, /5 mục có "why" nhưng chỉ vẽ 4/); assert.match(w, /why dài 80 ký tự \(tối đa 45 khi có 4 thẻ\)/);
  assert.doesNotMatch(W({ slides: [cover, col(yrs([1, 2, 3, 4], { 1: { why: "x".repeat(70) } }))] }), /why dài/, "1–2 thẻ: tối đa 70");
  assert.match(W({ slides: [cover, col(its, { kind: "line" })] }), /chỉ vẽ cho kind "column"/);
});
test("(2) meta.scopeOut: slide nhắc nội dung ngoài phạm vi → cảnh báo; scopeOk: true thì cho qua", () => {
  const s = { type: "cards", title: "Quỹ chi trả 300 nghìn tỷ đồng", items: [{ name: "BHYT", desc: "94% dân số tham gia BHYT" }, { name: "Hưu trí", desc: "3 triệu người" }] };
  assert.match(W({ meta: { scopeOut: ["BHYT", "bảo hiểm y tế"] }, slides: [cover, s] }), /nhắc "BHYT" — ngoài phạm vi/);
  assert.doesNotMatch(W({ meta: { scopeOut: ["BHYT"] }, slides: [cover, Object.assign({ scopeOk: true }, s)] }), /ngoài phạm vi/);
  assert.ok(validate({ meta: { scopeOut: "BHYT" }, slides: [cover] }).errors.join().includes("meta.scopeOut"));
});
test("(4) 'đầy đủ, kịp thời' là nhận định — không có dẫn chứng thì cảnh báo", () => {
  const w = W({ slides: [cover, { type: "cards", title: "Quỹ chi trả các chế độ", items: [{ name: "Chi trả", desc: "Chi trả đầy đủ, kịp thời cho người hưởng" }, { name: "Quản lý", desc: "Quản lý quỹ theo quy định" }] }] });
  assert.match(w, /nhận định "đầy đủ"/);
});
test("(4) bài report: nhận định có số nhưng notes không ghi nguồn → cảnh báo", () => {
  const s = { type: "cards", title: "Chi trả kịp thời cho 3,4 triệu người hưởng", items: [{ name: "Hưu trí", desc: "3,4 triệu người" }, { name: "Một lần", desc: "800.000 người" }] };
  assert.match(W({ meta: { kind: "report" }, slides: [cover, s] }), /chưa có nguồn trong notes/);
  assert.doesNotMatch(W({ meta: { kind: "report" }, slides: [cover, Object.assign({ notes: "Nguồn: Báo cáo BHXH Việt Nam 2023" }, s)] }), /chưa có nguồn trong notes/);
});
test("(5) slide hạn chế phải có basis trỏ về slide số liệu đứng trước", () => {
  const data = col(yrs([1, 2, 3, 4]));
  const lim = (b) => Object.assign({ type: "cards", title: "Hạn chế: còn trốn đóng, chậm đóng", items: [{ name: "Trốn đóng", desc: "Nợ 15.000 tỷ đồng" }, { name: "Thủ tục", desc: "Hồ sơ hưởng một lần 5 ngày" }] }, b ? { basis: b } : {});
  assert.match(W({ slides: [cover, data, lim()] }), /slide hạn chế không có "basis"/);
  assert.doesNotMatch(W({ slides: [cover, data, lim([2])] }), /basis/);
  assert.match(W({ slides: [cover, lim([3]), data] }), /đứng SAU slide này/);
  assert.match(W({ slides: [cover, { type: "statement", title: "Hệ thống an sinh" }, lim([2])] }), /không có số liệu nào/);
  assert.ok(validate({ slides: [cover, lim("2")] }).errors.join().includes("basis"));
});
test("(6) kiến nghị không chỉ ra điều, khoản → cảnh báo (closing.rec và slide kiến nghị)", () => {
  const cl = { type: "closing", title: "Cần siết rút BHXH một lần", lessons: [{ head: "a", text: "b" }], rec: { items: ["Tăng cường tuyên truyền", "Sửa k1 Điều 60 Luật BHXH 2014"] } };
  const w = W({ slides: [cover, cl] });
  assert.match(w, /rec\.items\[0\] không chỉ ra điều, khoản/); assert.doesNotMatch(w, /rec\.items\[1\]/);
  const kn = { type: "cards", title: "Kiến nghị hoàn thiện pháp luật về thu", items: [{ name: "Chậm đóng", desc: "Điều 40 Luật BHXH 2024: tăng lãi chậm đóng" }, { name: "Tuyên truyền", desc: "Đẩy mạnh truyền thông" }] };
  const w2 = W({ slides: [cover, kn] });
  assert.match(w2, /items\[1\] là kiến nghị nhưng không chỉ ra điều, khoản/); assert.doesNotMatch(w2, /items\[0\] là kiến nghị/);
});

async function texts(pptx, n) {
  const z = await JSZip.loadAsync(fs.readFileSync(pptx)), x = await z.file(`ppt/slides/slide${n}.xml`).async("string");
  return [...x.matchAll(/<p:sp>([\s\S]*?)<\/p:sp>/g)].map(m => ({ paras: (m[1].match(/<a:p>/g) || []).length, text: [...m[1].matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(q => q[1]).join("").replace(/ /g, " "),
    y: +((m[1].match(/<a:off x="-?\d+" y="(-?\d+)"\/>/) || [])[1] || 0) / 914400, h: +((m[1].match(/<a:ext cx="\d+" cy="(\d+)"\/>/) || [])[1] || 0) / 914400 })).filter(t => t.text);
}
test("(7) closing: mỗi kiến nghị một ô chữ riêng, khoảng cách giữa các ô bằng nhau", async () => {
  const items = ["Sửa k1 Điều 60: chỉ rút một lần khi ra nước ngoài", "Bổ sung Điều 122: lãi chậm đóng gấp đôi"];
  const r = buildDeck({ slides: [cover, { type: "closing", title: "Cần siết rút một lần", answers: [{ q: "Vì sao chi vượt thu?", a: "Rút một lần tăng — 800.000 người năm 2023" }, { q: "Sửa gì?", a: "Điều 60 và Điều 122" }], rec: { items } }] });
  assert.strictEqual(r.code, 0, r.all);
  const ts = await texts(r.pptx, 2);
  const boxes = items.map(it => ts.filter(t => t.text.includes(it.slice(0, 20))));
  boxes.forEach((b, i) => { assert.strictEqual(b.length, 1, `kiến nghị ${i} phải nằm trong đúng 1 ô`); assert.strictEqual(b[0].paras, 1, `ô kiến nghị ${i} chỉ có 1 đoạn`); assert.ok(!b[0].text.includes(items[1 - i].slice(0, 15)), "không gộp 2 ý vào một ô"); });
  assert.ok(boxes[1][0].y > boxes[0][0].y + boxes[0][0].h - 0.01, "ô sau nằm dưới ô trước");
});
test("(1) chart column + why: thẻ lý do có năm + câu, số tròn khớp, qua được --strict", async () => {
  const its = yrs([12.1, 12.7, 13.2, 13.8, 15.2, 15.7, 15.8, 15.1, 16.8, 17.3], { 7: { why: "COVID-19: doanh nghiệp giải thể, lao động mất việc" }, 8: { why: "Sản xuất phục hồi, tuyển dụng tăng" } });
  const r = buildDeck({ slides: [Object.assign({ notes: "Mở đầu bài." }, cover), col(its, { unit: "triệu người", notes: "Nguồn: BHXH Việt Nam" })] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const ts = await texts(r.pptx, 2);
  const why = ts.find(t => /^2022\s+COVID-19/.test(t.text));
  assert.ok(why, "thẻ lý do 2022: năm + câu trong MỘT ô chữ");
  assert.ok(ts.some(t => /^2023\s+Sản xuất/.test(t.text)), "thẻ lý do 2023");
  const year = ts.filter(t => /^20\d\d$/.test(t.text));
  assert.ok(why.y > Math.max(...year.filter(t => t.y < why.y).map(t => t.y)), "thẻ lý do nằm dưới trục năm");
});
test("(1) chart column + why: ô insight bên phải vẫn đủ cao cho câu kết luận (không bị co theo đáy biểu đồ)", async () => {
  const its = yrs([62.9, 60.8, 70.4, 79.5, 70.2], { 2: { why: "Tăng lại 9,6 nghìn tỷ" }, 4: { why: "Giảm 9,3 nghìn tỷ" } });
  const text = "Chênh lệch thu – chi luôn dương: quỹ còn tích luỹ";
  const r = buildDeck({ slides: [Object.assign({ notes: "Mở đầu." }, cover), col(its, { insight: { value: "> 60", unit: "nghìn tỷ/năm", text }, notes: "Nguồn: bảng nhóm" })] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const ins = (await texts(r.pptx, 2)).find(t => t.text === text);
  assert.ok(ins && ins.h >= 0.5, `ô insight cao ${ins && ins.h.toFixed(2)} in`);
});
const many = (n, top, extra) => yrs(Array.from({ length: n }, (_, i) => (i === top ? 90 : 10 + i)), extra);
test("ngách: số tròn why ở cột cao nhất (đầu / cuối / 12 cột, có unit) không đè nhãn — qua --strict", () => {
  for (const [n, t, u] of [[4, 3, null], [4, 0, "nghìn tỷ đồng"], [12, 11, "triệu"]]) {
    const r = buildDeck({ slides: [Object.assign({ notes: "Mở." }, cover), col(many(n, t, { [t]: { why: "Đỉnh 90" } }), Object.assign({ notes: "Nguồn: thử" }, u ? { unit: u } : {}))] }, ["--strict"]);
    assert.strictEqual(r.code, 0, `${n} cột, đỉnh ở ${t}: ${r.all}`); }
});
test("ngách: --native vẫn vẽ why (biểu đồ có why vẽ bằng hình)", async () => {
  const r = buildDeck({ slides: [Object.assign({ notes: "Mở." }, cover), col(yrs([1, 2, 3, 2], { 3: { why: "Giảm vì COVID-19" } }), { notes: "Nguồn: thử" })] }, ["--native", "--strict"]);
  assert.strictEqual(r.code, 0, r.all); assert.ok((await texts(r.pptx, 2)).some(t => t.text.includes("Giảm vì COVID-19")));
});
test("ngách: why dài đúng giới hạn (4 thẻ × 45 ký tự) không tràn ở teal / kem / son", () => {
  const w = "Doanh nghiệp giải thể hàng loạt, lao động mất việc, thu nhập giảm mạnh"; // 4 thẻ → tối đa 45 ký tự
  for (const th of ["teal", "kem", "son"]) {
    const r = buildDeck({ slides: [Object.assign({ notes: "Mở." }, cover), col(yrs([1, 2, 3, 2, 3, 2], { 2: { why: w.slice(0, 45) }, 3: { why: w.slice(0, 45) }, 4: { why: w.slice(0, 45) }, 5: { why: w.slice(0, 45) } }), { notes: "Nguồn: thử" })] }, ["--strict", "--theme", th]);
    assert.strictEqual(r.code, 0, `${th}: ${r.all}`); }
});
test("ngách: closing rec — ý vượt 2 không vẽ tràn; 1 câu trả lời + rec vẫn qua --strict", async () => {
  const r = buildDeck({ slides: [Object.assign({ notes: "Mở." }, cover), { type: "closing", title: "Cần sửa hai điều luật về rút một lần", answers: [{ q: "Hỏi?", a: "Đáp theo Điều 70" }], rec: { items: ["Sửa k1 Điều 60", "Sửa Điều 122", "Ý ba", "Ý bốn"] }, notes: "Kết." }] });
  assert.strictEqual(r.code, 0, r.all);
  const ts = await texts(r.pptx, 2); assert.ok(!ts.some(t => t.text === "Ý ba"), "ý thứ 3 không được vẽ");
  const r2 = buildDeck({ slides: [Object.assign({ notes: "Mở." }, cover), { type: "closing", title: "Cần sửa hai điều luật về rút một lần", answers: [{ q: "Hỏi?", a: "Đáp" }], rec: { items: ["Sửa k1 Điều 60 Luật BHXH 2014"] }, notes: "Kết." }] }, ["--strict"]);
  assert.strictEqual(r2.code, 0, r2.all);
});
test("ngách: why ở cột âm — số tròn không đè nhãn năm nằm trên trục", () => {
  const r = buildDeck({ slides: [Object.assign({ notes: "Mở." }, cover), col(yrs([39.1, 69.6, 152.6, -10.8, -19.5], { 0: { why: "COVID-19" }, 3: { why: "Rút một lần" }, 4: { why: "Già hoá" } }), { notes: "Nguồn: thử" })] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
});
test("section giant / dark không ảnh: ý 'Trong phần này' thành thẻ ở NỬA PHẢI, mỗi ý một ô — không để nửa phải trống", async () => {
  const card = (k, t) => ({ type: "cards", kicker: `Phần ${k} · Mục`, title: t, items: [{ name: "Một", desc: "Ý một 1" }, { name: "Hai", desc: "Ý hai 2" }, { name: "Ba", desc: "Ý ba 3" }], notes: "Nguồn: thử" });
  const sec = (n, style) => ({ type: "section", num: String(n), title: `Chương số ${n}`, style, notes: "Mở chương." });
  const r = buildDeck({ slides: [Object.assign({ notes: "Mở." }, cover), sec(1, "giant"), card(1, "Số người tham gia tăng đều qua các năm"), card(1, "Quỹ thu vượt chi đến năm 2022"),
    sec(2, "dark"), card(2, "Chi vượt thu từ năm 2023 do rút một lần"), card(2, "Người hưởng hưu tăng nhanh hơn người đóng")] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  for (const n of [2, 5]) { const ts = await texts(r.pptx, n), want = n === 2 ? ["Số người tham gia", "Quỹ thu vượt chi"] : ["Chi vượt thu", "Người hưởng hưu"];
    for (const w of want) { const t = ts.filter(x => x.text.startsWith(w)); assert.strictEqual(t.length, 1, `slide ${n}: "${w}" phải nằm trong đúng 1 ô`); } }
  const z = await JSZip.loadAsync(fs.readFileSync(r.pptx)), x = await z.file("ppt/slides/slide5.xml").async("string");
  const offs = [...x.matchAll(/<p:sp>[\s\S]*?<a:off x="(\d+)"[\s\S]*?<a:t>(Chi vượt thu|Người hưởng hưu)/g)].map(m => +m[1] / 914400);
  assert.ok(offs.length === 2 && offs.every(v => v > 6.5), `thẻ nằm nửa phải (x = ${offs.map(v => v.toFixed(2))})`);
});
test("tiêu đề thiếu chủ ngữ / dạng nhãn → cảnh báo (report); có chủ ngữ thì qua", () => {
  const sl = (t) => ({ type: "cards", title: t, items: [{ name: "A", desc: "1 người" }, { name: "B", desc: "2 người" }], notes: "Nguồn: x" });
  assert.match(W({ slides: [cover, sl("Tăng đều, chỉ giảm năm 2020 vì COVID-19")] }), /thiếu chủ ngữ/);
  assert.match(W({ slides: [cover, sl("Thu luôn lớn hơn chi 60–80 nghìn tỷ")] }), /thiếu chủ ngữ/);
  assert.match(W({ slides: [cover, sl("Ba hạn chế")] }), /là nhãn/);
  assert.doesNotMatch(W({ slides: [cover, sl("Số người đóng BHXH bắt buộc chỉ giảm năm 2020")] }), /thiếu chủ ngữ|là nhãn/);
});
test("bố cục ảnh lặp > 2 lần → cảnh báo", () => {
  const sec = (n) => ({ type: "section", num: String(n), title: `Chương ${n} hỏi gì?`, photo: `images/${n}.jpg` });
  assert.match(W({ slides: [cover, sec(1), sec(2), sec(3)] }), /"section ảnh nửa phải" dùng 3 lần/);
  assert.doesNotMatch(W({ slides: [cover, sec(1), Object.assign(sec(2), { photoLayout: "backdrop" }), sec(3)] }), /dùng 3 lần/);
});
test("ngách: section ảnh trong khung + tiêu đề / phụ đề dài + 4 ý → không đè dải tiến độ chương", () => {
  const fs2 = require("fs"), P = require("path"), dir = require("./helpers").tmpdir(); fs2.mkdirSync(P.join(dir, "images"));
  return require("sharp")({ create: { width: 1920, height: 1280, channels: 3, background: "#7a8a99" } }).jpeg().toFile(P.join(dir, "images", "a.jpg")).then(() => {
    const card = (t) => ({ type: "cards", kicker: "Phần 2 · Mục", title: t, items: [{ name: "Một", desc: "Ý 1" }, { name: "Hai", desc: "Ý 2" }, { name: "Ba", desc: "Ý 3" }], notes: "x" });
    const r = buildDeck({ slides: [Object.assign({ notes: "Mở." }, cover), { type: "section", num: "1", part: "Mở đầu", title: "Chương một hỏi gì?", notes: "x" }, card("Một câu kết luận đủ dài cho chương một"),
      { type: "section", num: "2", part: "Đánh giá", frame: "arch", photo: "images/a.jpg", photoSource: "https://example.com", title: "Đạt được gì, còn hạn chế gì, sửa luật ở đâu?", sub: "Kết quả có số liệu, hạn chế có gốc, kiến nghị chỉ ra điều luật", notes: "x" },
      card("Kết quả lớn nhất: thêm 5,6 triệu người đóng BHXH bắt buộc"), card("Hạn chế: bao phủ hẹp, rút một lần, quỹ chi vượt thu"), card("Bao phủ đã rộng hơn; cần sửa luật để người lao động ở lại")] }, ["--strict"], dir);
    assert.strictEqual(r.code, 0, r.all);
  });
});
test("bố cục ảnh mới: headline / lens / collage / hero + ảnh dựng được --strict ở teal và son", () => {
  const fs2 = require("fs"), P = require("path"), dir = require("./helpers").tmpdir(); fs2.mkdirSync(P.join(dir, "images"));
  const mk = (f, col) => require("sharp")({ create: { width: 1920, height: 1280, channels: 3, background: col } }).jpeg().toFile(P.join(dir, "images", f));
  return Promise.all([mk("a.jpg", "#6d7f8f"), mk("b.jpg", "#8f7d6d"), mk("c.jpg", "#6d8f7a"), mk("d.jpg", "#7a6d8f"), mk("e.jpg", "#8f8f6d"), mk("f.jpg", "#5d6f7f")]).then(() => {
    let k = 0; const srcs = () => ({ photoSource: "https://example.com/bai-" + (++k) });
    const deck = { slides: [Object.assign({ notes: "Mở." }, cover),
      Object.assign({ type: "headline", kicker: "Rút một lần", lines: ["Hơn 800.000 người", "đã rút BHXH một lần", "[chỉ trong năm 2023]"], sub: "Mỗi người rút mất quyền hưởng lương hưu", photo: "images/a.jpg", notes: "x" }, srcs()),
      Object.assign({ type: "lens", title: "Người lao động chờ cả buổi để rút một lần", photo: "images/b.jpg", focus: { x: 0.4, y: 0.5, r: 0.12, label: "Hồ sơ chờ gọi số" }, items: [{ head: "Rút sau 12 tháng", text: "Điểm đ k1 Điều 70" }, { head: "Mất lương hưu", text: "Thời gian đóng bị xoá" }], notes: "x" }, srcs()),
      { type: "collage", title: "Lương hưu đến tay người hưởng qua bưu điện", photos: [Object.assign({ photo: "images/c.jpg", caption: "Chi trả" }, srcs()), Object.assign({ photo: "images/d.jpg", caption: "Ký nhận" }, srcs()), Object.assign({ photo: "images/e.jpg", caption: "Tư vấn" }, srcs())], items: [{ head: "3,4 triệu người hưởng", text: "Hằng tháng" }], notes: "x" },
      Object.assign({ type: "hero", num: "89%", unit: "người tham gia", title: "BHXH bắt buộc là trụ cột", photo: "images/f.jpg", notes: "x" }, srcs())] };
    for (const th of ["teal", "son"]) { const r = buildDeck(deck, ["--strict", "--theme", th], dir); assert.strictEqual(r.code, 0, `${th}: ${r.all}`); }
    assert.match(validate({ slides: [cover, { type: "collage", title: "Một ảnh thôi", photos: [{ photo: "images/a.jpg" }] }] }).errors.join(), /cần ít nhất 2/);
    assert.ok(validate({ slides: [cover, { type: "lens", title: "Lens", photo: "images/a.jpg", focus: { x: 1.2, y: 0.5 } }] }).errors.join().includes("focus.x"));
  });
});
test("mạch bài: nhãn lặp tiêu đề, số lặp > 2 slide, mục lục khác tên chương → cảnh báo", () => {
  const c3 = (t, k) => ({ type: "cards", kicker: k, title: t, items: [{ name: "A", desc: "17,7 triệu người" }, { name: "B", desc: "x" }], notes: "Nguồn: x" });
  assert.match(W({ slides: [cover, c3("Hạn chế: bao phủ hẹp, rút một lần", "Phần 4 · Hạn chế")] }), /lặp lại chữ của tiêu đề/);
  assert.doesNotMatch(W({ slides: [cover, c3("Bao phủ còn hẹp, rút một lần tăng", "Phần 4 · Còn vướng ở đâu?")] }), /lặp lại chữ/);
  assert.match(W({ slides: [cover, c3("Số người đóng tăng", "Phần 1 · A"), c3("Số người đóng tăng tiếp", "Phần 1 · B"), c3("Số người đóng tăng nữa", "Phần 1 · C")] }), /Số "17,7" xuất hiện ở 3 slide/);
  const sec = (n, t) => ({ type: "section", num: String(n), part: "P" + n, title: t });
  assert.match(W({ slides: [cover, { type: "agenda", title: "Bài đi qua hai câu hỏi", items: ["Khái niệm", "Thực trạng"] }, sec(1, "Ai phải đóng?"), sec(2, "Quỹ ra sao?")] }), /Mục lục mục 1/);
  assert.doesNotMatch(W({ slides: [cover, { type: "agenda", title: "Bài đi qua hai câu hỏi", items: ["Ai phải đóng?", "Quỹ ra sao?"] }, sec(1, "Ai phải đóng?"), sec(2, "Quỹ ra sao?")] }), /Mục lục mục/);
});
test("mở – kết: bìa poster + facts, closing answers + photo, end poster, hình vẽ passbook / idcard / pension — qua --strict", () => {
  const fs2 = require("fs"), P = require("path"), dir = require("./helpers").tmpdir(); fs2.mkdirSync(P.join(dir, "images"));
  const mk = (f, col) => require("sharp")({ create: { width: 2400, height: 1600, channels: 3, background: col } }).jpeg().toFile(P.join(dir, "images", f));
  return Promise.all([mk("a.jpg", "#6d7f8f"), mk("b.jpg", "#8f7d6d"), mk("c.jpg", "#6d8f7a")]).then(() => {
    const deck = { slides: [
      { type: "cover", layout: "poster", photo: "images/a.jpg", photoSource: "https://example.com/1", kicker: "Học phần · Báo cáo", title: "Triển khai BHXH bắt buộc ở Việt Nam, 2015–2025", subtitle: "Bốn câu hỏi", facts: ["10 năm · 2015–2025", "4 câu hỏi", "2 kiến nghị"], notes: "x" },
      { type: "agenda", title: "Bài trả lời hai câu hỏi", items: ["Ai phải đóng?", "Được hưởng gì?"], art: "passbook", notes: "x" },
      { type: "statement", kicker: "Thẻ", title: "Mã số BHXH đi theo người lao động suốt đời", art: "idcard", notes: "x" },
      { type: "closing", kicker: "Kết luận · Bước tiếp theo?", title: "Giữ người lao động ở lại hệ thống", photo: "images/b.jpg", photoSource: "https://example.com/2", answers: [{ q: "Ai phải đóng?", a: "Người có HĐLĐ từ 1 tháng" }, { q: "Được hưởng gì?", a: "Năm chế độ" }], art: "pension", notes: "x" },
      { type: "end", style: "poster", photo: "images/c.jpg", photoSource: "https://example.com/3", message: "Đóng hôm nay, có lương hưu ngày mai", title: "Cảm ơn thầy cô", sub: "Mời đặt câu hỏi", team: [{ name: "Nhóm 1" }], notes: "x" }] };
    for (const th of ["teal", "son"]) { const r = buildDeck(deck, ["--strict", "--theme", th], dir); assert.strictEqual(r.code, 0, `${th}: ${r.all}`); }
  });
});
test("thế giới theo môn: 4 world mới dựng --strict; đổi font tiêu đề, màu trang, có khung trang và vỏ thẻ", async () => {
  const deck = (kit) => ({ meta: { kit, short: "Thử world" }, slides: [Object.assign({ notes: "Mở." }, cover),
    { type: "cards", kicker: "Ai phải đóng?", title: "Ba nhóm người lao động phải tham gia", items: [{ name: "Người lao động", desc: "Hợp đồng từ 1 tháng" }, { name: "Người nước ngoài", desc: "Có giấy phép lao động" }, { name: "Chủ hộ", desc: "Từ 01/7/2025" }], notes: "x" },
    { type: "steps", kicker: "Làm thủ tục thế nào?", title: "Bốn bước nhận chế độ thai sản ở công ty", steps: [{ head: "Nộp giấy tờ" }, { head: "Công ty lập hồ sơ" }, { head: "Cơ quan BHXH duyệt" }], notes: "x" }] });
  const KM = require("../engine/kits");
  for (const kit of ["so-bhxh", "bang-cong", "cang-bien", "ban-ve"]) {
    assert.ok(KM.KITS[kit] && KM.KITS[kit].frame && KM.KITS[kit].card.skin && Array.isArray(KM.KITS[kit].fits), `${kit}: thiếu frame / skin / fits`);
    const r = buildDeck(deck(kit), ["--strict"]); assert.strictEqual(r.code, 0, `${kit}: ${r.all}`);
    const z = await JSZip.loadAsync(fs.readFileSync(r.pptx)), x = await z.file("ppt/slides/slide2.xml").async("string");
    assert.ok(x.includes('descr="Khung trang"'), `${kit}: thiếu khung trang`);
    if (KM.KITS[kit].font) assert.ok(x.includes(`typeface="${KM.KITS[kit].font.title}"`), `${kit}: chưa đổi font tiêu đề`);
  }
  assert.match(validate({ meta: { kind: "report", kit: "cang-bien", short: "Bảo hiểm xã hội bắt buộc" }, slides: [Object.assign({}, cover, { title: "Bảo hiểm xã hội bắt buộc" })] }).hints.join(), /không hợp đề tài/);
  assert.match(validate({ meta: { kind: "report", short: "Luật Bảo hiểm xã hội" }, slides: [Object.assign({}, cover, { title: "BHXH bắt buộc" })] }).hints.join(), /hợp world "so-bhxh"/);
});
test("khối hình chính: sheet / calendar / riskbar / plan dựng --strict; chặn dữ liệu sai", () => {
  const sl = {
    sheet: { type: "sheet", kicker: "Có năm nào giảm?", title: "Số người đóng chỉ giảm năm 2020", rows: [{ label: "2019", value: 15.2, display: "15,2" }, { label: "2020", value: 15.1, display: "15,1", tone: "bad", focus: true, note: "COVID-19" }, { label: "2021", value: 15.1, display: "15,1", note: "Đi ngang" }], notes: "x" },
    calendar: { type: "calendar", kicker: "Báo trước bao lâu?", title: "Nghỉ việc phải báo trước 30 ngày", month: "Tháng 7/2026", startDay: 3, days: 31, marks: [{ from: 1, to: 30, label: "Báo trước 30 ngày (Điều 35)" }], notes: "x" },
    riskbar: { type: "riskbar", kicker: "Ai chịu tới đâu?", title: "Rủi ro sang người mua ở chặng khác nhau", stages: ["Kho bán", "Lên tàu", "Cảng đến"], rows: [{ label: "FOB", sub: "Giao lên tàu", at: 2 }, { label: "CIF", sub: "Có cước", at: 2, pay: 3 }], legend: ["Bên bán", "Bên mua", "Bên bán trả cước"], notes: "x" },
    plan: { type: "plan", kicker: "Tách thửa được không?", title: "Phần lấn lộ giới không được cấp giấy", width: "6 m", height: "10 m", ratio: 0.8, zones: [{ label: "Lấn lộ giới", x: 0, y: 0, w: 1, h: 0.2, tone: "bad" }], items: [{ head: "Phần còn lại", text: "Xét tách thửa" }], notes: "x" } };
  for (const [k, kit] of [["sheet", "so-bhxh"], ["calendar", "bang-cong"], ["riskbar", "cang-bien"], ["plan", "ban-ve"]]) {
    const r = buildDeck({ meta: { kit, short: "Thử" }, slides: [Object.assign({ notes: "Mở." }, cover), sl[k]] }, ["--strict"]); assert.strictEqual(r.code, 0, `${k}: ${r.all}`); }
  assert.ok(validate({ slides: [cover, Object.assign({}, sl.calendar, { marks: [{ from: 20, to: 10, label: "x" }] })] }).errors.join().includes("marks[0]"));
  assert.ok(validate({ slides: [cover, Object.assign({}, sl.riskbar, { rows: [{ label: "A", at: 5 }, { label: "B", at: 1 }] })] }).errors.join().includes("rows[0].at"));
  assert.ok(validate({ slides: [cover, Object.assign({}, sl.plan, { zones: [{ label: "x", x: 0.5, y: 0, w: 0.7, h: 0.2 }] })] }).errors.join().includes("zones[0]"));
  assert.match(validate({ meta: { kit: "so-bhxh", short: "BHXH" }, slides: [Object.assign({}, cover, { title: "Bảo hiểm xã hội" })] }).hints.join(), /khối hình chính "sheet"/);
});
