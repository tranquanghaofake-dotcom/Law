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

test("motion: kiểm hợp lệ — meta.motion / slide.motion phải là true/false", () => {
  const r = buildDeck({ meta: { motion: "yes" }, slides: [cover] }, ["--strict"]);
  assert.notStrictEqual(r.code, 0); assert.ok(/motion/.test(r.all), r.all);
  const s = buildDeck({ slides: [cover, Object.assign({ motion: 1 }, risk)] }, ["--strict"]);
  assert.notStrictEqual(s.code, 0);
});
