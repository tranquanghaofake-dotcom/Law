// Test: chế độ bài giảng (meta.kind) + quiz + timeline + hình vẽ mới + kiểm đường cắt trong flow + hình lặp + bước 0 (prep.json) + outline .pptx
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const JSZip = require("jszip");
const { ROOT, build, buildDeck, tmpdir, cover } = require("./helpers");

const OPTS = ["Sự không chắc chắn", "Một khả năng xấu", "Cả A và B đều đúng", "Cả A và B đều sai"];
const Q = "Rủi ro đề cập đến yếu tố nào?";
const lecture = (extra = []) => ({ meta: { title: "Thử", kind: "lecture" }, slides: [cover,
  { type: "quiz", kicker: "Câu hỏi 1/1", title: Q, options: OPTS },
  { type: "quiz", kicker: "Đáp án 1/1", title: Q, options: OPTS, answer: 2, reveal: true, why: "Ba định nghĩa đều gồm hai yếu tố: không chắc chắn và khả năng xấu" },
  ...extra] });

test("quiz + timeline + hình mới qua --strict ở cả 3 theme", () => {
  const deck = lecture([
    { type: "timeline", kicker: "Lịch sử", title: "Từ kho thóc chung đến [hợp đồng] đầu tiên", focus: 2,
      items: [{ when: "Cổ đại", head: "Quỹ tương trợ", text: "Góp vào quỹ chung" }, { when: "Hy Lạp, La Mã", head: "Vay đi biển", text: "Mất tàu thì khỏi trả nợ" }, { when: "Năm 1347", head: "Hợp đồng Genoa", text: "Hợp đồng cổ nhất còn lưu" }] },
    { type: "panelrows", title: "Bảo hiểm là [ô che] trước rủi ro", art: "umbrella", rows: [{ head: "Ví dụ", text: "Nhà cháy được bồi thường" }, { head: "Ví dụ", text: "Tai nạn được trả tiền" }, { head: "Ví dụ", text: "Ốm đau được chi trả" }] },
    { type: "panelrows", title: "Phạm vi bảo hiểm là [khiên] có giới hạn", art: "shield", rows: [{ head: "Ví dụ", text: "Rủi ro được nhận" }, { head: "Ví dụ", text: "Rủi ro bị loại trừ" }, { head: "Ví dụ", text: "Hành vi cố ý" }] },
    { type: "panelrows", title: "Phí nhỏ của nhiều người lập [quỹ chung]", art: "fund", rows: [{ head: "Ví dụ", text: "Đóng phí hằng năm" }, { head: "Ví dụ", text: "Quỹ bù cho số ít" }, { head: "Ví dụ", text: "Phí chưa dùng đem đầu tư" }] },
  ]);
  for (const t of ["teal", "kem", "son"]) { const r = buildDeck(deck, ["--theme", t, "--strict"]); assert.strictEqual(r.code, 0, `${t}:\n${r.all}`); }
});

test("quiz: slide đáp án tô phương án đúng; thẻ đứng yên giữa slide hỏi và slide đáp án", async () => {
  const r = buildDeck(lecture()); assert.strictEqual(r.code, 0, r.all);
  const z = await JSZip.loadAsync(fs.readFileSync(r.pptx));
  const pos = async (n) => { const x = await z.file(`ppt/slides/slide${n}.xml`).async("string");
    return [...x.matchAll(/<p:sp>.*?<\/p:sp>/gs)].map(m => m[0]).filter(sp => /<a:t>[ABCD]<\/a:t>/.test(sp)).map(sp => sp.match(/<a:off x="(\d+)" y="(\d+)"/).slice(1).join(",")); };
  const a = await pos(2), b = await pos(3);
  assert.strictEqual(a.length, 4); assert.deepStrictEqual(a, b, "vị trí 4 nút A–D phải trùng nhau ở slide hỏi và slide đáp án");
  const s3 = await z.file("ppt/slides/slide3.xml").async("string");
  assert.ok(s3.includes("VÌ SAO") && s3.includes("Ba định nghĩa"), "slide đáp án có dòng Vì sao");
  const s2 = await z.file("ppt/slides/slide2.xml").async("string");
  assert.ok(!s2.includes("VÌ SAO"), "slide hỏi không lộ đáp án");
});

test("quiz: chặn ca sai (ít phương án, answer ngoài phạm vi, đáp án không đứng sau câu hỏi, lộ why)", () => {
  const r = buildDeck({ slides: [cover, { type: "quiz", title: "Câu?", options: ["Một"] }, { type: "quiz", title: "Câu khác?", options: ["a", "b"], answer: 5, reveal: true }] });
  assert.strictEqual(r.code, 2, r.all);
  assert.ok(r.all.includes("Slide 2 (quiz): options") && r.all.includes("Slide 3 (quiz): answer"), r.all);
  const w = buildDeck({ meta: { kind: "lecture" }, slides: [cover, { type: "quiz", title: "Câu A?", options: ["a", "b"], why: "lộ" }, { type: "quiz", title: "Câu B?", options: ["a", "b"], answer: 0, reveal: true, why: "x" }] }, ["--strict"]);
  assert.strictEqual(w.code, 1, w.all);
  assert.ok(/chỉ hiện ở slide đáp án/.test(w.all) && /phải đứng ngay sau slide hỏi/.test(w.all), w.all);
});

test("bài giảng không có quiz → cảnh báo; tiêu đề quiz là câu hỏi thì không bị bắt lỗi", () => {
  const r = buildDeck({ meta: { kind: "lecture" }, slides: [cover, { type: "statement", title: "Số đông bù số ít" }] }, ["--strict"]);
  assert.ok(/chưa có slide "quiz"/.test(r.all), r.all);
  const q = buildDeck(lecture()); assert.ok(!/tiêu đề là câu hỏi/.test(q.all), q.all);
});

test("timeline: < 3 mốc và focus sai bị chặn", () => {
  const r = buildDeck({ slides: [cover, { type: "timeline", title: "Hai mốc", items: [{ when: "a", head: "A" }, { when: "b", head: "B" }], focus: 4 }] });
  assert.strictEqual(r.code, 2, r.all);
  assert.ok(r.all.includes("Slide 2 (timeline): items") && r.all.includes("Slide 2 (timeline): focus"), r.all);
});

const flowDeck = (side) => ({ slides: [cover, { type: "flow", title: "Phí vào quỹ, quỹ [bù đắp]", nodes: [{ id: "a", name: "Người góp" }, { id: "q", name: "Quỹ" }, { id: "b", name: "Người nhận" }, { id: "d", name: "Đầu tư" }],
  edges: [{ from: "a", to: "q", label: "Đóng phí" }, { from: "q", to: "b", label: "Bù đắp" }, Object.assign({ from: "q", to: "d", label: "Phí chưa dùng", dash: true }, side ? { side } : {})] }] });
test("flow: mũi tên cắt nhau → cảnh báo chặn --strict; side: below gỡ được", () => {
  const bad = buildDeck(flowDeck(), ["--strict"]);
  assert.strictEqual(bad.code, 1, bad.all); assert.ok(/mũi tên "Phí chưa dùng" cắt mũi tên "Bù đắp"/.test(bad.all), bad.all);
  const ok = buildDeck(flowDeck("below"), ["--strict"]); assert.strictEqual(ok.code, 0, ok.all);
});

test("cùng một hình lặp ở ≥ 3 slide nội dung → cảnh báo; hình tự giữ tỉ lệ trong ô", async () => {
  const row = [{ head: "Ví dụ", text: "Một dòng" }, { head: "Ví dụ", text: "Hai dòng" }, { head: "Ví dụ", text: "Ba dòng" }];
  const r = buildDeck({ slides: [cover, ...["Một", "Hai", "Ba"].map(t => ({ type: "panelrows", title: `Ý [${t}]`, art: "umbrella", rows: row }))] }, ["--strict"]);
  assert.strictEqual(r.code, 1, r.all); assert.ok(/Hình "umbrella" lặp ở 3 slide nội dung \(2, 3, 4\)/.test(r.all), r.all);
  const z = await JSZip.loadAsync(fs.readFileSync(buildDeck({ slides: [cover, { type: "panelrows", title: "Ô [che]", art: "umbrella", rows: row }] }).pptx));
  const x = await z.file("ppt/slides/slide2.xml").async("string"), pic = [...x.matchAll(/<p:pic>.*?<\/p:pic>/gs)].map(m => m[0]).find(p => /descr="Hình minh hoạ"/.test(p));
  const [, cx, cy] = pic.match(/<a:ext cx="(\d+)" cy="(\d+)"/); assert.ok(Math.abs(cx / cy - 400 / 360) < 0.02, `tỉ lệ ${cx / cy}`);
});

test("meta.kind = lecture → hình mặc định là sách, không phải cán cân", () => {
  const r = buildDeck({ meta: { kind: "lecture" }, slides: [cover] }); assert.strictEqual(r.code, 0, r.all);
  const bad = buildDeck({ meta: { kind: "lop-hoc" }, slides: [cover] }); assert.strictEqual(bad.code, 2); assert.ok(/meta.kind/.test(bad.all));
});

test("bước 0: thiếu prep.json / chưa duyệt → --strict dừng; đủ và đã duyệt → qua", () => {
  const dir = tmpdir(), deck = { meta: { kind: "report" }, slides: [cover, { type: "statement", title: "Số người đóng BHXH [tăng] gần 1,5 lần" }, { type: "end", title: "Cảm ơn" }] };
  let r = buildDeck(deck, ["--strict"], dir, { prep: true }); assert.strictEqual(r.code, 1); assert.ok(/chưa có gói chuẩn bị/.test(r.all), r.all);
  const P = (args) => spawnSync("python3", [path.join(ROOT, "scripts", "prep.py"), ...args], { encoding: "utf8" });
  assert.strictEqual(P(["init", dir, "--kind", "report", "--minutes", "5", "--topic", "Thử"]).status, 0);
  assert.strictEqual(P(["approve", dir, "--by", "Người dùng"]).status, 1, "chưa điền đủ thì không duyệt được");
  const pf = path.join(dir, "prep.json"), pr = JSON.parse(fs.readFileSync(pf, "utf8"));
  Object.assign(pr, { audience: "Lớp", sources: [{ title: "Luật X", legal: true, status: "hiện hành" }],
    plan: [{ slide: 1, type: "cover", title: "Bìa" }, { slide: 2, type: "statement", title: "Phát hiện chính" }, { slide: 3, type: "end", title: "Cảm ơn" }] });
  fs.writeFileSync(pf, JSON.stringify(pr));
  // bài report còn phải khai phạm vi (scope.in) và nguồn từng số liệu (data) — thiếu thì check báo
  const ck = P(["check", dir]); assert.strictEqual(ck.status, 1); assert.ok(/scope\.in/.test(ck.stdout) && /data:/.test(ck.stdout), ck.stdout);
  Object.assign(pr, { scope: { in: "Chỉ BHXH bắt buộc", out: ["BHYT"] }, data: [{ figure: "Số người tham gia 2020", value: "15,064 triệu", source: "BHXH Việt Nam" }] });
  fs.writeFileSync(pf, JSON.stringify(pr)); assert.ok(/world:/.test(P(["check", dir]).stdout), "thiếu bước 0 thế giới hình ảnh thì check phải báo");
  pr.world = { objects: ["sổ BHXH", "tờ rời", "phiếu lương", "VssID", "thẻ BHYT", "cơ quan BHXH", "bưu điện", "quyết định hưu"], main: "Sổ BHXH", minor: ["phiếu lương", "chồng xu"], kit: "so-bhxh" };
  fs.writeFileSync(pf, JSON.stringify(pr));
  r = buildDeck(deck, ["--strict"], dir, { prep: true }); assert.strictEqual(r.code, 1); assert.ok(/chưa được người dùng duyệt/.test(r.all), r.all);
  assert.strictEqual(P(["check", dir]).status, 0);
  const sm = P(["summary", dir]); assert.ok(sm.stdout.includes("CHỜ NGƯỜI DÙNG DUYỆT") && fs.existsSync(path.join(dir, "prep.md")));
  assert.strictEqual(P(["approve", dir, "--by", "Người dùng"]).status, 0);
  r = buildDeck(deck, ["--strict"], dir, { prep: true }); assert.strictEqual(r.code, 0, r.all);
  r = buildDeck(Object.assign({}, deck, { slides: [cover, { type: "end", title: "Cảm ơn" }] }), ["--strict"], dir, { prep: true });
  assert.ok(/lệch > 25%/.test(r.all), r.all);
});

test("outline.py đọc .pptx: tiêu đề slide = đề mục, thân slide không thành đề mục, slide cùng tiêu đề gộp lại", () => {
  const dir = tmpdir(), src = path.join(dir, "bg.pptx"), out = path.join(dir, "o.json");
  const mk = spawnSync("python3", ["-c", `
from pptx import Presentation
from pptx.util import Inches
p = Presentation(); L = p.slide_layouts[1]
for t, b in [("1.1. Thuật ngữ", "Mở đầu mục"), ("RỦI RO", "2. Rủi ro thuần túy là rủi ro chỉ gây thiệt hại"), ("RỦI RO", "Dao động lợi nhuận"), ("1.2. Lịch sử", "Ai Cập cổ đại")]:
    s = p.slides.add_slide(L); s.shapes.title.text = t; s.placeholders[1].text = b
p.save(${JSON.stringify(src)})`], { encoding: "utf8" });
  assert.strictEqual(mk.status, 0, mk.stderr);
  const r = spawnSync("python3", [path.join(ROOT, "scripts", "outline.py"), src, out], { encoding: "utf8" }); assert.strictEqual(r.status, 0, r.stderr);
  const ids = JSON.parse(fs.readFileSync(out, "utf8")).map(o => o.id);
  assert.deepStrictEqual(ids, ["1.1", "1.1.rủi-ro", "1.2"]);
});

test("find_images --brief nhận cả mảng trần lẫn {briefs: [...]}", () => {
  const code = `import sys, json; sys.path.insert(0, ${JSON.stringify(path.join(ROOT, "scripts"))})
import inspect, find_images as f
src = inspect.getsource(f.brief_mode); print('isinstance(raw, dict)' in src)`;
  const r = spawnSync("python3", ["-c", code], { encoding: "utf8" }); assert.strictEqual(r.stdout.trim(), "True", r.stderr);
});
