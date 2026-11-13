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

test("chart span: nhãn ngoài thanh không bị vạch mốc cắt ngang", () => {
  const deck = { slides: [cover, { type: "chart", kind: "span", title: "Ký thời luật cũ, xử khi luật mới đã có hiệu lực",
    items: [{ label: "Giao dịch", from: "01/01/2011", to: "01/10/2014" }, { label: "Sơ thẩm", from: "01/10/2014", to: "01/12/2018", focus: true }, { label: "Phúc thẩm", from: "01/12/2018", to: "01/09/2019" }],
    markers: [{ date: "01/01/2017", label: "BLDS 2015 có hiệu lực" }], insight: { value: "59", unit: "tháng", text: "Từ khởi kiện đến phúc thẩm" } }] };
  const r = buildDeck(deck, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
});
