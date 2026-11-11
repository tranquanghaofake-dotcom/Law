// Test chuyển động theo nhịp (meta.motion / slide.motion / --motion): hiệu ứng xuất hiện TỰ CHẠY khi vào slide,
// các ý lộ dần cách nhau 80–150 ms như video giải thích; tiêu đề + ảnh nền có mặt ngay khung đầu (không "cảnh vào trống").
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const JSZip = require("jszip");
const { buildDeck } = require("./helpers");
const cover = { type: "cover", title: "Tiêu đề thử", notes: "x" };
const xmlOf = async (pptx, n) => (await JSZip.loadAsync(fs.readFileSync(pptx))).file(`ppt/slides/slide${n}.xml`).async("string");
const delays = (x) => [...x.matchAll(/presetClass="entr"[^>]*>\s*<p:stCondLst><p:cond delay="(\d+)"/g)].map(m => +m[1]);
const sheet = { type: "sheet", kicker: "Có năm nào giảm?", title: "Số người đóng chỉ giảm năm 2020", rows: Array.from({ length: 12 }, (_, i) => ({ label: String(2014 + i), value: 10 + i, display: String(10 + i), focus: i === 6, note: i === 6 ? "COVID-19" : undefined })), notes: "x" };
const risk = { type: "riskbar", kicker: "Ai chịu tới đâu?", title: "Rủi ro sang người mua ở chặng khác nhau", stages: ["Kho bán", "Lên tàu", "Cảng đến"], rows: [{ label: "FOB", sub: "Giao lên tàu", at: 2 }, { label: "CIF", sub: "Có cước", at: 2, pay: 3 }], legend: ["Bên bán", "Bên mua", "Bên bán trả cước"], notes: "x" };
const hero = { type: "hero", num: "89", unit: "%", title: "Người tham gia vẫn là lao động doanh nghiệp", sub: "Khu vực ngoài nhà nước chiếm phần lớn", notes: "x" };
const cards = { type: "cards", title: "Ba hạn chế còn tồn tại khi triển khai", items: [{ name: "Rút một lần", desc: "Số người rút tăng nhanh" }, { name: "Nợ đóng", desc: "Kéo dài nhiều năm" }, { name: "Bao phủ", desc: "Còn thấp so với mục tiêu" }], notes: "x" };

test("motion: tự chạy khi vào slide (onBegin, không cần bấm), ý sau trễ hơn ý trước, tiêu đề đứng yên", async () => {
  const r = buildDeck({ meta: { motion: true }, slides: [cover, risk] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const x = await xmlOf(r.pptx, 2);
  assert.ok(x.includes("<p:timing>"), "phải có p:timing");
  assert.ok(x.includes('evt="onBegin"'), "phải tự chạy khi vào slide");
  assert.ok(!x.includes('nodeType="clickEffect"'), "motion không bắt người nói bấm");
  assert.ok(x.includes('filter="wipe(left)"'), "thanh container phải trượt từ trái (một hướng đọc)");
  const ds = delays(x); assert.ok(ds.length >= 4, String(ds)); assert.ok(Math.max(...ds) > Math.min(...ds), "phải lộ dần, không hiện cùng lúc");
  for (const m of x.matchAll(/spTgt spid="(\d+)"/g)) assert.ok(x.includes(`<p:cNvPr id="${m[1]}"`), `spid ${m[1]} không trỏ tới shape nào`);
  const title = x.match(/<p:cNvPr id="(\d+)" name="S2\|riskbar\|title/); assert.ok(title, "không thấy ô tiêu đề");
  assert.ok(!x.includes(`spid="${title[1]}"`), "tiêu đề phải có mặt ngay khung đầu");
  assert.ok(x.indexOf("<p:transition") < x.indexOf("<p:timing>"));
});

test("motion: mặc định TẮT; slide.motion:false tắt riêng; build:true thắng motion (bấm từng ý)", async () => {
  const off = buildDeck({ slides: [cover, risk] }, ["--strict"]);
  assert.ok(!(await xmlOf(off.pptx, 2)).includes("<p:timing>"));
  const one = buildDeck({ meta: { motion: true }, slides: [cover, Object.assign({ motion: false }, risk)] }, ["--strict"]);
  assert.ok(!(await xmlOf(one.pptx, 2)).includes("<p:timing>"));
  const cli = buildDeck({ slides: [cover, risk] }, ["--strict", "--motion"]);
  assert.ok((await xmlOf(cli.pptx, 2)).includes('evt="onBegin"'), "--motion bật cả deck");
  const b = buildDeck({ meta: { motion: true }, slides: [cover, Object.assign({ build: true }, cards)] }, ["--strict"]);
  const xb = await xmlOf(b.pptx, 2); assert.ok(xb.includes('nodeType="clickEffect"') && !xb.includes('evt="onBegin"'), "build:true → bấm từng ý");
});

test("motion: cards lộ dần kiểu nổi lên; tổng thời gian ≤ 2 s kể cả 12 dòng; dòng focus có khoảng lặng trước", async () => {
  const c = buildDeck({ meta: { motion: true }, slides: [cover, cards] }, ["--strict"]);
  assert.strictEqual(c.code, 0, c.all);
  const xc = await xmlOf(c.pptx, 2); assert.ok(/presetID="42"/.test(xc), "cards: nổi lên (Float In, presetID 42)");
  const s = buildDeck({ meta: { motion: true }, slides: [cover, sheet] }, ["--strict"]);
  assert.strictEqual(s.code, 0, s.all);
  const xs = await xmlOf(s.pptx, 2), ds = delays(xs);
  assert.ok(Math.max(...ds) <= 2000, "tổng ≤ 2 s: " + Math.max(...ds));
  const uniq = [...new Set(ds)].sort((a, b) => a - b), gaps = uniq.slice(1).map((v, i) => v - uniq[i]);
  assert.ok(Math.max(...gaps) >= 2 * Math.min(...gaps), "phải có một khoảng lặng dài hơn trước dòng chốt: " + gaps);
});

test("motion: hero — con số 'đáp xuống' (thu từ to về đúng cỡ); chỉ 1 cú nện mỗi slide", async () => {
  const r = buildDeck({ meta: { motion: true }, slides: [cover, hero] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const x = await xmlOf(r.pptx, 2);
  assert.ok(x.includes("<p:attrName>ppt_w</p:attrName>"), "con số phải có hiệu ứng phóng");
  assert.strictEqual((x.match(/<p:attrName>ppt_w<\/p:attrName>/g) || []).length, 1, "chỉ một cú nện");
});

test("motion: kiểm hợp lệ — meta.motion / slide.motion phải là true/false", () => {
  const r = buildDeck({ meta: { motion: "yes" }, slides: [cover] }, ["--strict"]);
  assert.notStrictEqual(r.code, 0); assert.ok(/motion/.test(r.all), r.all);
  const s = buildDeck({ slides: [cover, Object.assign({ motion: 1 }, risk)] }, ["--strict"]);
  assert.notStrictEqual(s.code, 0);
});
