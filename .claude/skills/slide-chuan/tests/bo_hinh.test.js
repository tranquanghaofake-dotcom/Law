// Bộ hình dùng chung (dọn skill 18/11/2026): hàm nối công cụ hình vào deck.js, thay cho mỗi deck chép lại.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const boHinh = require("../scripts/bo_hinh");
const P = { muc: "#111111", phu: "#444444", xanh: "#00AA00", cam: "#FF8800", camNhat: "#FFEEDD", ray: "#EEEEEE" };

test("lớp hình đánh số tăng dần, ghi SVG vào asset/hinh; [từ] thành <em>, [12] giữ nguyên", () => {
  const D = fs.mkdtempSync(path.join(os.tmpdir(), "bh-")), H = boHinh({ D, P, tong: 10, chiaPhan: [4] });
  const a = H.lop("<rect/>", 0, 0, 10, 10, "a"), b = H.lop("<rect/>", 0, 0, 10, 10, "b");
  assert.match(a, /lop-1"/); assert.match(b, /lop-2"/); assert.strictEqual(H.soLop(), 2);
  assert.ok(fs.existsSync(path.join(D, "asset", "hinh", "l02.svg")));
  assert.match(H.T("x", 0, 0, 100, "giảm [8 %] theo [12]"), /<em>8 %<\/em>.*&#91;12&#93;/);
});

test("thanh tiến độ: phần đã qua đúng tỉ lệ, khe chia phần đúng chỗ", () => {
  const H = boHinh({ D: fs.mkdtempSync(path.join(os.tmpdir(), "bh-")), P, tong: 10, chiaPhan: [4] }), s = H.tienDo(5, 0, 1000);
  assert.match(s, /width="500" height="12" rx="6" fill="#FF8800"/); assert.match(s, /<rect x="396"/);
});

test("giấy + dạ quang: ảnh nguyên văn và một vệt cho mỗi dòng của cụm từ", () => {
  const D = fs.mkdtempSync(path.join(os.tmpdir(), "bh-")); fs.mkdirSync(path.join(D, "anh", "goc"), { recursive: true });
  fs.writeFileSync(path.join(D, "anh", "goc", "dd.json"), JSON.stringify({ rong: 1000, cao: 200, cau: ["a"], vet: [[{ x: 0.1, y: 0.2, w: 0.3, h: 0.1 }, { x: 0, y: 0.5, w: 0.2, h: 0.1 }]] }));
  const s = boHinh({ D, P }).giay("dd", 100, 100, 500, "trích", 0, [1000]);
  assert.match(s, /src="anh\/goc\/dd.png"[^>]*width:500px;height:100px/);
  assert.strictEqual((s.match(/Vệt dạ quang/g) || []).length, 2);
});
