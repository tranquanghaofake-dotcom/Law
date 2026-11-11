// Test đợt 3: build (hiện từng ý khi bấm), redline (so chữ điều luật), deadline (lịch thời hạn), kiểm mù màu, sửa lỗi A1–A4.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const JSZip = require("jszip");
const { buildDeck, cover } = require("./helpers");
const CA = require("../engine/codeart");
const { minDE } = require("../engine/cvd");
const xmlOf = async (pptx, n) => (await JSZip.loadAsync(fs.readFileSync(pptx))).file(`ppt/slides/slide${n}.xml`).async("string");
const chk = { type: "checklist", title: "Người mua chưa đủ điều kiện để được coi là ngay tình", items: [{ ok: "yes", head: "Có công chứng" }, { ok: "yes", head: "Có GCN đứng tên" }, { ok: "no", head: "Không xem nhà" }], verdict: { ok: "no", text: "Khó chứng minh ngay tình" } };

test("build: mỗi điều kiện + kết luận là một lần bấm; không build thì không có p:timing; build ở type khác → cảnh báo", async () => {
  const r = buildDeck({ slides: [cover, Object.assign({ build: true }, chk)] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const x = await xmlOf(r.pptx, 2);
  assert.strictEqual((x.match(/nodeType="clickEffect"/g) || []).length, 4);
  assert.ok(x.indexOf("<p:transition") < x.indexOf("<p:timing>"), "timing phải đứng sau transition");
  for (const m of x.matchAll(/spTgt spid="(\d+)"/g)) assert.ok(x.includes(`<p:cNvPr id="${m[1]}"`), `spid ${m[1]} không trỏ tới shape nào`);
  const off = buildDeck({ slides: [cover, chk] }, ["--strict"]);
  assert.ok(!(await xmlOf(off.pptx, 2)).includes("<p:timing>"));
  const all = buildDeck({ slides: [cover, chk] }, ["--strict", "--build"]);
  assert.ok((await xmlOf(all.pptx, 2)).includes("<p:timing>"), "--build phải bật cho cả deck");
  assert.ok(/chỉ có tác dụng ở steps/.test(buildDeck({ slides: [cover, { type: "stats", title: "Ba con số chính của vụ án", items: [{ label: "a", value: "1" }, { label: "b", value: "2" }], build: true }] }).all));
});

test("redline: gộp thay đổi vụn; gạch ngang + tô nền trong XML; thiếu nguyên văn → lỗi; thiếu nguồn → cảnh báo", async () => {
  const p = CA.wordDiff("Trừ trường hợp quy định tại Điều 139, giao dịch vô hiệu", "Giao dịch vô hiệu");
  assert.ok(p.filter(q => q.t === "del").length === 1 && p.filter(q => q.t === "ins").length === 1, JSON.stringify(p));
  const r = buildDeck({ slides: [cover, { type: "redline", title: "Luật mới bỏ phần ngoại lệ ở đầu điều", old: { label: "Luật cũ", text: "Trừ trường hợp quy định tại Điều 139, giao dịch vô hiệu không làm phát sinh quyền" }, new: { label: "Luật mới", text: "Giao dịch vô hiệu không làm phát sinh quyền" } }] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const x = await xmlOf(r.pptx, 2);
  assert.ok(x.includes('strike="sngStrike"') && x.includes("<a:highlight>"));
  assert.strictEqual(buildDeck({ slides: [cover, { type: "redline", title: "Thiếu nguyên văn bản mới", old: { text: "a" }, new: {} }] }).code, 2);
  assert.ok(!/thiếu "source"/.test(buildDeck({ slides: [cover, { type: "redline", title: "So hai bản không ghi nguồn", old: { label: "A", text: "một hai" }, new: { label: "B", text: "một ba" } }] }).all));
});

test("deadline: vẽ được; ngày sai / to trước from → lỗi; quá ngắn → gợi ý bignum", () => {
  const ok = buildDeck({ slides: [cover, { type: "deadline", title: "Còn ba năm để kháng nghị giám đốc thẩm", from: "21/08/2019", to: "21/08/2022", today: "21/08/2020", display: "3 năm" }] }, ["--strict"]);
  assert.strictEqual(ok.code, 0, ok.all);
  assert.strictEqual(buildDeck({ slides: [cover, { type: "deadline", title: "Ngày sai định dạng", from: "2019-08-21", to: "21/08/2022" }] }).code, 2);
  assert.strictEqual(buildDeck({ slides: [cover, { type: "deadline", title: "Hết hạn trước khi bắt đầu", from: "21/08/2022", to: "21/08/2019" }] }).code, 2);
  assert.ok(/< 45 ngày/.test(buildDeck({ slides: [cover, { type: "deadline", title: "Thời hạn quá ngắn cho lịch tháng", from: "01/01/2020", to: "15/01/2020" }] }).all));
});

test("mù màu: kem nền sáng có cặp màu gần trùng → gợi ý; annotate vào mục bad thì không báo; xanh không báo", () => {
  const T = require("../engine/themes");
  assert.ok(minDE(T.kem.l.acc, T.kem.l.bad) < 15); assert.ok(minDE(T.xanh.l.good, T.xanh.l.bad) >= 15);
  const ch = { type: "chart", kind: "bar", title: "Người mua thiệt nhiều nhất trong ba bên", items: [{ label: "A", value: 150 }, { label: "B", value: 500 }, { label: "C", value: 350, tone: "bad" }], insight: { value: "350", text: "Người mua mất" } };
  assert.ok(/Mù màu đỏ–lục/.test(buildDeck({ slides: [cover, ch] }, ["--theme", "kem"]).all));
  assert.ok(!/Mù màu đỏ–lục/.test(buildDeck({ slides: [cover, Object.assign({}, ch, { annotate: { item: 2, text: "Mất nhiều nhất" } })] }, ["--theme", "kem"]).all));
  assert.ok(!/Mù màu đỏ–lục/.test(buildDeck({ slides: [cover, ch] }, ["--theme", "xanh"]).all));
});

test("A1: isotype ở theme toa/son — khung rỗng không dùng màu đỏ trùng màu nhấn", async () => {
  const d = { slides: [cover, { type: "isotype", title: "Trả 85 tờ, chỉ lấy lại 50 tờ", unit: { value: 10, label: "triệu" }, rows: [{ label: "Lấy lại", value: 850, lost: 350 }] }] };
  for (const th of ["toa", "son"]) { const r = buildDeck(d, ["--strict", "--theme", th]); assert.strictEqual(r.code, 0, r.all); }
});
