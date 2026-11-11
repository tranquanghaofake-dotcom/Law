// Test đợt "logic đọc hiểu": --titles, duel paired, cards labels, scene 3 trạng thái mốc, nhãn span né vạch mốc, tự tạo thư mục output.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, tmpdir, build, buildDeck, cover } = require("./helpers");

async function slideXml(pptx, n) {
  const z = await JSZip.loadAsync(fs.readFileSync(pptx));
  return z.file(`ppt/slides/slide${n}.xml`).async("string");
}
const duel = (paired) => ({ type: "duel", title: "Phúc thẩm sửa phần lớn bản án sơ thẩm", paired,
  left: { tag: "Sơ thẩm", items: ["Bác yêu cầu giao nhà", "Huỷ hai GCN"] },
  right: { tag: "Phúc thẩm", items: ["Giữ phần vô hiệu", "Công nhận thoả thuận"] } });

test("--titles: in mạch tiêu đề, không cần file output, báo tiêu đề dạng nhãn / câu hỏi / trùng", () => {
  const dir = tmpdir(), p = path.join(dir, "deck.json");
  fs.writeFileSync(p, JSON.stringify({ slides: [cover,
    { type: "stats", title: "Hậu quả", items: [{ label: "a", value: "1" }] },
    { type: "stats", title: "Ai thiệt nhiều nhất trong vụ này?", items: [{ label: "a", value: "1" }] },
    { type: "stats", title: "Hậu quả", items: [{ label: "a", value: "1" }] }] }));
  const r = build([p, "--titles"]);
  assert.strictEqual(r.code, 0, r.all);
  assert.ok(/Mạch tiêu đề/.test(r.out), r.all);
  assert.ok(/02  Hậu quả/.test(r.out), r.all);
  assert.ok(/giống nhãn/.test(r.out) && /câu hỏi/.test(r.out) && /trùng tiêu đề/.test(r.out), r.all);
  assert.ok(!fs.readdirSync(dir).some(f => f.endsWith(".pptx")), "--titles không được dựng file");
});

test("examples/banan142.json --titles không có cảnh báo mạch", () => {
  const r = build([path.join(ROOT, "examples", "banan142.json"), "--titles"]);
  assert.strictEqual(r.code, 0, r.all);
  assert.ok(/✓ Không thấy tiêu đề dạng nhãn/.test(r.out), r.all);
});

test("duel: mặc định chấm tròn (không số); paired: true → đánh số + vạch nối từng cặp", async () => {
  const a = buildDeck({ slides: [cover, duel(undefined)] }, ["--strict"]);
  assert.strictEqual(a.code, 0, a.all);
  const b = buildDeck({ slides: [cover, duel(true)] }, ["--strict"]);
  assert.strictEqual(b.code, 0, b.all);
  const xa = await slideXml(a.pptx, 2), xb = await slideXml(b.pptx, 2);
  const nums = (x) => (x.match(/<a:t>[12]<\/a:t>/g) || []).length;
  assert.strictEqual(nums(xa), 0, "không paired mà vẫn đánh số");
  assert.strictEqual(nums(xb), 4, "paired phải đánh số 1–2 ở cả hai bên");
  assert.ok((xb.match(/prstDash val="dash"/g) || []).length >= 2, "paired thiếu vạch nối cặp");
});

test("cards: labels hiện thành nhãn chữ hoa; labels sai kiểu bị bắt", async () => {
  const items = ["Người mua", "Bên vay", "Ngân hàng"].map(n => ({ icon: "FaUser", name: n, who: "Thiệt 350 triệu", desc: "Đến xem nhà trước khi trả tiền" }));
  const r = buildDeck({ slides: [cover, { type: "cards", title: "Mỗi bên đều có thể tránh được vụ án", labels: ["Hậu quả", "Lẽ ra nên"], items }] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const x = await slideXml(r.pptx, 2);
  assert.ok(x.includes("HẬU QUẢ") && x.includes("LẼ RA NÊN"), "thiếu nhãn");
  const bad = buildDeck({ slides: [cover, { type: "cards", title: "Mỗi bên đều có thể tránh được vụ án", labels: "Hậu quả", items }] });
  assert.strictEqual(bad.code, 2, bad.all);
});

test("scene: mốc đã qua tô đặc nhạt, mốc chưa tới để rỗng", async () => {
  const deck = { timelines: { tl: [["01/01/2010", "A"], ["01/01/2011", "B"], ["01/01/2012", "C"], ["01/01/2013", "D"]] },
    slides: [cover, { type: "scene", year: "2012", title: "Mốc thứ ba là lúc tranh chấp bắt đầu", events: [{ date: "01/01/2012", text: "Khởi kiện" }], timeline: { ref: "tl", active: [2] } }] };
  const r = buildDeck(deck, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const x = await slideXml(r.pptx, 2);
  // 2 mốc đã qua có fill trong suốt 55% (alpha 45000)
  assert.ok((x.match(/<a:alpha val="45000"\/>/g) || []).length >= 2, "mốc đã qua chưa được tô nhạt");
});

test("chart span: nhãn ngoài thanh không bị vạch mốc cắt ngang", () => {
  const deck = { slides: [cover, { type: "chart", kind: "span", title: "Ký thời luật cũ, xử khi luật mới đã có hiệu lực",
    items: [{ label: "Giao dịch", from: "01/01/2011", to: "01/10/2014" }, { label: "Sơ thẩm", from: "01/10/2014", to: "01/12/2018", focus: true }, { label: "Phúc thẩm", from: "01/12/2018", to: "01/09/2019" }],
    markers: [{ date: "01/01/2017", label: "BLDS 2015 có hiệu lực" }], insight: { value: "59", unit: "tháng", text: "Từ khởi kiện đến phúc thẩm" } }] };
  const r = buildDeck(deck, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
});

test("build tự tạo thư mục output chưa có", () => {
  const dir = tmpdir(), p = path.join(dir, "deck.json"), out = path.join(dir, "a", "b", "out.pptx");
  fs.writeFileSync(p, JSON.stringify({ slides: [cover] }));
  const r = build([p, out]);
  assert.strictEqual(r.code, 0, r.all);
  assert.ok(fs.existsSync(out));
});
