// Cổng "da theo môn" ở Bước 0 (thay cổng "bộ hình / nền chung" cũ — loi-da-biet-2026-11.md mục E, lỗi L10 lặp ở 4 bài):
// mọi deck nhận một da (chất liệu của môn); nền, khung chung chỉ còn khi deck ghi "da": "none" VÀ người dùng đã đồng ý.
// prep.py init ghi sẵn da gợi ý; check chặn da trống / sai tên / none chưa đồng ý; summary nói da ở dòng đầu; dung.js --strict dừng.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { spawnSync } = require("child_process");
const { kiemDeck } = require("../hinh/kiem");
const ROOT = path.join(__dirname, "..");
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "cong-"));
const P = (args) => spawnSync("python3", [path.join(ROOT, "scripts", "prep.py"), ...args], { encoding: "utf8" });

// gói chuẩn bị đủ mọi mục khác, để chỉ còn cổng da quyết định
const du = (dir, extra = {}, topic = "Thử") => {
  assert.strictEqual(P(["init", dir, "--kind", "lecture", "--minutes", "10", "--topic", topic]).status, 0);
  const pf = path.join(dir, "prep.json"), pr = JSON.parse(fs.readFileSync(pf, "utf8"));
  Object.assign(pr, { audience: "Lớp", sources: [{ title: "Luật X", legal: true, status: "hiện hành" }],
    world: { objects: ["a", "b", "c", "d", "e", "f", "g", "h"], main: "a", minor: ["b", "c"] },
    plan: [{ slide: 1, type: "cover", title: "Bìa" }, { slide: 2, type: "quizgo", title: "Hỏi" }, { slide: 3, type: "end", title: "Cảm ơn" }] }, extra);
  fs.writeFileSync(pf, JSON.stringify(pr));
  return pr;
};

test("prep.py init ghi sẵn da gợi ý theo đề tài (khớp môn) hoặc theo loại bài, và chapNhanNenChung = false", () => {
  const a = tmp(); du(a, {}, "Bảo hiểm xã hội bắt buộc");
  const pa = JSON.parse(fs.readFileSync(path.join(a, "prep.json"), "utf8"));
  assert.strictEqual(pa.da, "so-bhxh"); assert.strictEqual(pa.chapNhanNenChung, false); assert.ok(!("tang" in pa) && !("boHinh" in pa));
  const b = tmp(); du(b);
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(b, "prep.json"), "utf8")).da, "giay", "bài giảng không khớp môn nào → da chung giay");
});

test("prep.py check: da trống, sai tên, hoặc none khi người dùng chưa đồng ý → chặn; da có thật / none đã đồng ý → qua", () => {
  for (const [extra, re] of [[{ da: "" }, /da: chưa chọn/], [{ da: "xyz" }, /da: "xyz" không có/], [{ da: "none" }, /da: "none" → .*nền, khung chung/]]) {
    const dir = tmp(); du(dir, extra); const r = P(["check", dir]);
    assert.strictEqual(r.status, 1, JSON.stringify(extra)); assert.match(r.stdout, re);
  }
  for (const extra of [{ da: "qt" }, { da: "bc" }, { da: "ban-ve" }, { da: "none", chapNhanNenChung: true }]) {
    const dir = tmp(); du(dir, extra); const r = P(["check", dir]);
    assert.strictEqual(r.status, 0, `${JSON.stringify(extra)} → ${r.stdout}`);
  }
});

test("prep.py summary: da nói ở ngay dưới tiêu đề; nền chung (đã đồng ý) có ⚠", () => {
  const d1 = tmp(); du(d1, { da: "so-bhxh" });
  assert.match(P(["summary", d1]).stdout.split("\n").slice(0, 4).join("\n"), /Da theo môn: `so-bhxh`/);
  const d2 = tmp(); du(d2, { da: "none", chapNhanNenChung: true });
  assert.match(P(["summary", d2]).stdout.split("\n").slice(0, 4).join("\n"), /⚠ .*nền, khung chung/);
});

test("kiem.js: ⚠ Nền chung chỉ khi deck ghi da none mà prep.json chưa ghi người dùng đồng ý; mọi deck khác có da", () => {
  const dir = tmp(), sl = (t) => Array.from({ length: 6 }, (_, i) => ({ type: i ? "cards" : t, title: "T", items: [] }));
  fs.writeFileSync(path.join(dir, "prep.json"), JSON.stringify({ approved: true }));
  assert.match(kiemDeck({ meta: { da: "none" }, slides: sl("cover") }, { deckDir: dir }).join("\n"), /⚠ Nền chung/);
  for (const d of [{ meta: {}, slides: sl("cover") }, { meta: {}, slides: sl("qtbia") }, { meta: {}, slides: sl("bcbia") }, { meta: { kind: "report" }, slides: sl("cover") }])
    assert.doesNotMatch(kiemDeck(d, { deckDir: dir }).join("\n"), /⚠ Nền chung/, JSON.stringify(d.slides[0]));
  fs.writeFileSync(path.join(dir, "prep.json"), JSON.stringify({ approved: true, chapNhanNenChung: true }));
  assert.doesNotMatch(kiemDeck({ meta: { da: "none" }, slides: sl("cover") }, { deckDir: dir }).join("\n"), /⚠ Nền chung/);
});

test("dung.js --strict: dừng trước khi dựng khi deck ghi da none mà chưa được đồng ý; da sai tên → mã 2", () => {
  const dir = tmp(), dp = path.join(dir, "deck.json");
  const ghi = (meta) => fs.writeFileSync(dp, JSON.stringify({ meta: { title: "T", ...meta }, slides: Array.from({ length: 6 }, (_, i) => ({ type: i ? "statement" : "cover", title: "Câu kết luận số " + i, notes: "Lời nói của slide này." })) }));
  fs.writeFileSync(path.join(dir, "prep.json"), JSON.stringify({ approved: true }));
  const run = (f) => spawnSync("node", [path.join(ROOT, "hinh", "dung.js"), dp, "--html", ...f], { encoding: "utf8" });
  ghi({ da: "none" });
  const a = run(["--strict"]); assert.strictEqual(a.status, 3, a.stdout + a.stderr); assert.match(a.stderr, /--strict: ⚠ Nền chung/);
  const b = run([]); assert.strictEqual(b.status, 0, b.stdout + b.stderr); assert.match(b.stdout, /⚠ Nền chung/);
  ghi({ da: "khong-co" });
  const c = run([]); assert.strictEqual(c.status, 2, c.stdout + c.stderr); assert.match(c.stderr, /khong-co/);
});

test("deck có vài slide bộ hình qt* và nhiều slide thường: da qt phủ cả slide thường (không còn 'Nền chung một phần')", () => {
  const dir = tmp(); fs.writeFileSync(path.join(dir, "prep.json"), JSON.stringify({ approved: true }));
  const deck = { meta: {}, slides: [...Array.from({ length: 2 }, () => ({ type: "qtban", title: "T", items: [] })), ...Array.from({ length: 6 }, () => ({ type: "cards", title: "T", items: [], emoji: "dove" }))] };
  assert.doesNotMatch(kiemDeck(deck, { deckDir: dir }).join("\n"), /Nền chung/);
  assert.strictEqual(require("../hinh/da").chonDa(deck, { qtTypes: require("../hinh/hoi_nghi").TYPES }).ten, "qt");
});
