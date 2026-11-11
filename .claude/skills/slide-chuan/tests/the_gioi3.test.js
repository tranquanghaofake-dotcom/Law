// Test "che chữ vẫn đoán được chủ đề": dấu hiệu world ở 3 cỡ (macro / meso / micro) + dáng world trên các bố cục chung.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const JSZip = require("jszip");
const { buildDeck } = require("./helpers");
const { KITS } = require("../engine/kits");
const WORLDS = Object.keys(KITS).filter(k => KITS[k].fits);
const xmlOf = async (pptx, n) => (await JSZip.loadAsync(fs.readFileSync(pptx))).file(`ppt/slides/slide${n}.xml`).async("string");
const deck = (kit) => ({ meta: { kit, short: "Thử world" }, slides: [
  { type: "cover", title: "Cùng một nội dung ở tám world", notes: "x" },
  { type: "agenda", kicker: "Bài có mấy câu hỏi?", title: "Bài gồm bốn câu hỏi chính", items: ["Quy định hiện hành ra sao?", "Thực tế áp dụng thế nào?", "Vướng mắc nằm ở đâu?", "Nên sửa điều gì?"], notes: "x" },
  { type: "cards", kicker: "Cần nhớ gì?", title: "Ba điểm cần nhớ trong chủ đề này", items: [{ name: "Điểm một", desc: "Mô tả ngắn cho điểm thứ nhất" }, { name: "Điểm hai", desc: "Mô tả ngắn cho điểm thứ hai" }, { name: "Điểm ba", desc: "Mô tả ngắn cho điểm thứ ba" }], notes: "x" },
  { type: "steps", kicker: "Làm theo thứ tự nào?", title: "Thủ tục gồm bốn bước nối tiếp", steps: [{ head: "Nộp hồ sơ", text: "Tại cơ quan có thẩm quyền" }, { head: "Thẩm định", text: "Trong thời hạn luật định" }, { head: "Quyết định", text: "Chấp thuận hoặc từ chối" }, { head: "Thi hành", text: "Các bên thực hiện" }], notes: "x" },
  { type: "timeline", kicker: "Đổi khi nào?", title: "Ba mốc thay đổi của quy định", items: [{ when: "2014", head: "Luật cũ" }, { when: "2019", head: "Sửa đổi" }, { when: "2024", head: "Luật mới" }], notes: "x" },
  { type: "stats", kicker: "Quy mô ra sao?", title: "Ba con số cho thấy quy mô vấn đề", items: [{ label: "Số vụ", value: "120", desc: "mỗi năm" }, { label: "Tỉ lệ", value: "38%", desc: "bị huỷ" }, { label: "Thời gian", value: "9 th", desc: "giải quyết" }], notes: "x" },
  { type: "end", title: "Cảm ơn", notes: "x" }] });

test("mọi world: dựng --strict; slide nội dung đủ dấu hiệu 3 cỡ (--sig); không còn chevron / chấm tròn trơn; kết bằng vật của world", async () => {
  for (const k of WORLDS) {
    const r = buildDeck(deck(k), ["--strict", "--sig"]); assert.strictEqual(r.code, 0, `${k}: ${r.all}`);
    assert.ok(!/gần như không mang dấu hiệu world|che chữ đi khó nhận ra/.test(r.all), `${k}: ${r.all}`);
    for (const n of [3, 4, 5, 6]) { const line = (r.all.match(new RegExp(`Slide ${n} \\(\\w+\\): (macro.*)`)) || [])[1] || "";
      for (const lv of ["macro", "meso", "micro"]) assert.ok(new RegExp(`${lv}\\[[^\\]]+\\]`).test(line), `${k} slide ${n} thiếu ${lv}: ${line}`); }
    const steps = await xmlOf(r.pptx, 4); assert.ok(!/prst="chevron"/.test(steps), `${k}: steps còn chevron`);
    const end = await xmlOf(r.pptx, 7); assert.ok(!/lớp giấy cắt/.test(end), `${k}: slide cảm ơn còn nền giấy cắt chung`);
    const s3 = await xmlOf(r.pptx, 3); assert.ok(s3.includes(`descr="${KITS[k].icons[0]}"`) || s3.includes(KITS[k].icons[0]), `${k}: thẻ chưa dùng icon của world`);
  }
  const plain = buildDeck(Object.assign(deck(null), { meta: { short: "Thử" } }), ["--strict"]); assert.strictEqual(plain.code, 0, plain.all);
  assert.ok(/prst="chevron"/.test(await xmlOf(plain.pptx, 4)), "không world: giữ chevron cũ");
});

test("world biên bản ghi số trang 'TỜ 03/07'; slide thiếu dấu hiệu cỡ vừa → gợi ý", async () => {
  const r = buildDeck(deck("bien-ban"), ["--strict"]); assert.ok((await xmlOf(r.pptx, 3)).includes("TỜ 03/07"));
  const t = buildDeck({ meta: { kit: "so-bhxh", short: "Thử" }, slides: [deck("so-bhxh").slides[0], { type: "bignum", title: "Mức đóng BHXH bắt buộc của người lao động là 8%", num: "8%", notes: "x" }, { type: "bignum", title: "Mức đóng của người sử dụng lao động là 17,5%", num: "17,5%", notes: "x" }] });
  assert.match(t.all, /Slide [23] \(bignum\): che chữ đi khó nhận ra world "so-bhxh"/); // bignum cố ý tối giản; đồ vật chỉ 1 lần mỗi 3 slide → một trong hai slide thiếu cỡ vừa
});

test("biểu đồ đường + trích dẫn mang dáng world; ảnh tràn viền có khung world vẽ TRÊN ảnh", async () => {
  const sl = [{ type: "cover", title: "Thử", notes: "x" },
    { type: "chart", kicker: "Xu hướng ra sao?", title: "Số người đóng tăng đều sau năm 2021", kind: "line", insight: { value: "+3", unit: "triệu", text: "Tăng sau 2021" }, items: [{ label: "2019", value: 15.2 }, { label: "2021", value: 15.1 }, { label: "2023", value: 17.2, focus: true }], notes: "x" },
    { type: "quote", kicker: "Người lao động nói gì?", quote: "Đóng đủ thì về già mới có [lương hưu]", by: "Một công nhân may", notes: "x" }];
  for (const k of ["cang-bien", "bien-ban"]) { const r = buildDeck({ meta: { kit: k, short: "Thử" }, slides: sl }, ["--strict", "--sig"]); assert.strictEqual(r.code, 0, `${k}: ${r.all}`);
    assert.match(r.all, /Slide 2 \(chart\): macro\[[^\]]+\] meso\[[^\]]*(điểm mốc|đường nối)/, k);
    assert.match(r.all, /Slide 3 \(quote\): macro\[[^\]]+\] meso\[[^\]]*đường nối/, k); }
});

test("hiệu ứng có tính cách theo world: đóng dấu (sổ BHXH), trượt (bến cảng), kéo giấy (hoá đơn); nhịp nhấn sau con số; Morph thanh tiến độ khi meta.thread", async () => {
  const want = { "so-bhxh": /presetID="31" presetClass="entr"[\s\S]*style\.rotation/, "cang-bien": /presetID="2" presetClass="entr"/, "hoa-don": /filter="wipe\(up\)"/ };
  for (const [k, re] of Object.entries(want)) { const r = buildDeck(Object.assign(deck(k), { meta: { kit: k, short: "Thử", motion: true, thread: true } }), ["--strict"]); assert.strictEqual(r.code, 0, `${k}: ${r.all}`);
    const x = await xmlOf(r.pptx, 3); assert.match(x, re, k); assert.ok(x.includes('name="!!prog0"'), `${k}: thanh tiến độ chưa có tên Morph`);
    for (const m of x.matchAll(/spTgt spid="(\d+)"/g)) assert.ok(x.includes(`<p:cNvPr id="${m[1]}"`), `${k}: spid lạc`); }
  const h = buildDeck({ meta: { motion: true }, slides: [{ type: "cover", title: "Thử", notes: "x" }, { type: "hero", num: "89", unit: "%", title: "Người tham gia vẫn là lao động doanh nghiệp", notes: "x" }] }, ["--strict"]);
  const xh = await xmlOf(h.pptx, 2); assert.ok(/presetClass="emph"[\s\S]*<p:animScale>/.test(xh), "con số phải có nhịp nhấn sau khi đáp xuống"); assert.ok(xh.includes('grpId="1" animBg="1"'));
});
