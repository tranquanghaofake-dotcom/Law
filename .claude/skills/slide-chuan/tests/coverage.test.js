// Test: đối chiếu dàn ý (outline.py + covers + meta.skip), thời lượng (meta.minutes), slide refs đã bỏ, bộ icon Lucide/Tabler, ghi nguồn Font Awesome.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const JSZip = require("jszip");
const { ROOT, buildDeck, tmpdir, cover } = require("./helpers");

const MD = "# Đề tài\n\n1.1 Khái niệm\nBảo hiểm xã hội là sự bảo đảm thay thế một phần thu nhập.\n\n1.2 Vai trò\nTrụ cột an sinh xã hội.\n\n2.1 Chế độ ốm đau\nNghỉ việc do ốm.\n\nDANH MỤC TÀI LIỆU THAM KHẢO\n1. Một nguồn nào đó\n";
function outlineOf(dir) {
  fs.writeFileSync(path.join(dir, "src.md"), MD);
  const r = spawnSync("python3", [path.join(ROOT, "scripts", "outline.py"), path.join(dir, "src.md"), path.join(dir, "outline.json")], { encoding: "utf8" });
  assert.strictEqual(r.status, 0, r.stderr);
  return JSON.parse(fs.readFileSync(path.join(dir, "outline.json"), "utf8"));
}
const card = (covers, title) => ({ type: "cards", title, covers, items: [{ icon: "PiUserDuotone", name: "A", desc: "x" }, { icon: "LuScale", name: "B", desc: "y" }, { icon: "TbBuildingBank", name: "C", desc: "z" }] });

test("outline.py: nhận đề mục đánh số, dừng ở tài liệu tham khảo, đếm chữ", () => {
  const o = outlineOf(tmpdir()), ids = o.map(x => x.id);
  for (const id of ["1.1", "1.2", "2.1"]) assert.ok(ids.includes(id), ids.join(","));
  assert.ok(!o.some(x => /Một nguồn/.test(x.title)), "không được đọc danh mục tài liệu thành đề mục");
  assert.ok(o.find(x => x.id === "1.1").words > 5);
});

test("dàn ý: mục chưa có slide -> cảnh báo (chặn --strict); có covers hoặc skip -> qua", () => {
  const dir = tmpdir(); outlineOf(dir);
  const miss = buildDeck({ meta: { outline: "outline.json" }, slides: [cover, card(["1.1"], "Khái niệm và chế độ chính")] }, ["--strict"], dir);
  assert.notStrictEqual(miss.code, 0); assert.ok(miss.all.includes("mục 1.2") && miss.all.includes("mục 2.1"), miss.all);
  const ok = buildDeck({ meta: { outline: "outline.json", skip: { "2.1": "để phần hỏi đáp" } }, slides: [cover, card(["1.1", "1.2"], "Khái niệm và vai trò rõ ràng")] }, ["--strict"], dir);
  assert.strictEqual(ok.code, 0, ok.all); assert.ok(ok.all.includes("Đối chiếu dàn ý: 3/3"), ok.all);
  const bad = buildDeck({ meta: { outline: "outline.json" }, slides: [cover, card(["9.9", "1.1", "1.2", "2.1"], "Sai mã mục dàn ý")] }, [], dir);
  assert.ok(bad.all.includes('covers "9.9" không có trong dàn ý'), bad.all);
});

test("meta.minutes: số slide lệch thời lượng -> cảnh báo", () => {
  const r = buildDeck({ meta: { minutes: 20 }, slides: [cover, card(null, "Một slide nội dung duy nhất")].map(s => (s.covers === null ? (delete s.covers, s) : s)) });
  assert.ok(r.all.includes("meta.minutes = 20 phút → nên có 18–30 slide"), r.all);
});

test("refs đã bỏ: báo lỗi rõ; icon Lucide/Tabler không cần ghi nguồn; icon Font Awesome -> in ghi nguồn CC BY", () => {
  const refs = { type: "refs", title: "Số liệu lấy từ hai nguồn chính", items: [{ text: "Luật BHXH 2014", url: "https://thuvienphapluat.vn/van-ban/x" }] };
  const r = buildDeck({ slides: [cover, card(undefined, "Ba bên tham gia hệ thống"), refs] });
  assert.strictEqual(r.code, 2, r.all);
  assert.ok(r.all.includes('kiểu "refs"') && r.all.includes("đã bỏ"), r.all);
  const ok = buildDeck({ slides: [cover, card(undefined, "Ba bên tham gia hệ thống")] }, ["--strict"]);
  assert.strictEqual(ok.code, 0, ok.all);
  assert.ok(!ok.all.includes("Font Awesome"), "Pi/Lu/Tb không phải ghi nguồn:\n" + ok.all);
  const fa = buildDeck({ slides: [cover, Object.assign(card(undefined, "Ba bên tham gia hệ thống"), { items: [{ icon: "FaIndustry", name: "A", desc: "x" }, { icon: "PiUserDuotone", name: "B", desc: "y" }, { icon: "PiBankDuotone", name: "C", desc: "z" }] })] });
  assert.ok(fa.all.includes("Font Awesome Free (CC BY 4.0") && fa.all.includes("FaIndustry"), fa.all);
});
