// P1 (loi-da-biet-2026-11.md mục E): cổng "môn chưa có bộ hình" — lỗi L10 lặp 3 lần vì Bước 0 không dừng lại khi tầng hình ảnh
// chỉ có nền / khung chung. prep.py check phải chặn; summary phải nói ở dòng đầu; dung.js báo ⚠ và --strict dừng.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { spawnSync } = require("child_process");
const { kiemDeck } = require("../hinh/kiem");
const ROOT = path.join(__dirname, "..");
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "cong-"));
const P = (args) => spawnSync("python3", [path.join(ROOT, "scripts", "prep.py"), ...args], { encoding: "utf8" });

// gói chuẩn bị đủ mọi mục khác, để chỉ còn cổng bộ hình quyết định
const du = (dir, extra = {}) => {
  assert.strictEqual(P(["init", dir, "--kind", "lecture", "--minutes", "10", "--topic", "Thử"]).status, 0);
  const pf = path.join(dir, "prep.json"), pr = JSON.parse(fs.readFileSync(pf, "utf8"));
  Object.assign(pr, { audience: "Lớp", sources: [{ title: "Luật X", legal: true, status: "hiện hành" }],
    world: { objects: ["a", "b", "c", "d", "e", "f", "g", "h"], main: "a", minor: ["b", "c"], kit: "paper" },
    plan: [{ slide: 1, type: "cover", title: "Bìa" }, { slide: 2, type: "quizgo", title: "Hỏi" }, { slide: 3, type: "end", title: "Cảm ơn" }] }, extra);
  fs.writeFileSync(pf, JSON.stringify(pr));
  return pr;
};

test("prep.py init ghi sẵn tang, boHinh, chapNhanNenChung", () => {
  const dir = tmp(); assert.strictEqual(P(["init", dir, "--kind", "lecture", "--minutes", "10"]).status, 0);
  const pr = JSON.parse(fs.readFileSync(path.join(dir, "prep.json"), "utf8"));
  assert.strictEqual(pr.tang, "hinh"); assert.strictEqual(pr.boHinh, ""); assert.strictEqual(pr.chapNhanNenChung, false);
});

test("prep.py check: tầng hình ảnh chưa chọn bộ hình → chặn, nêu 3 lựa chọn", () => {
  const dir = tmp(); du(dir);
  const r = P(["check", dir]); assert.strictEqual(r.status, 1);
  assert.match(r.stdout, /boHinh:/); assert.match(r.stdout, /bc/); assert.match(r.stdout, /qt/); assert.match(r.stdout, /chapNhanNenChung/);
});

test("prep.py check: qua khi chọn bộ có sẵn, khi người dùng đồng ý nền chung, hoặc khi dựng tầng lưới Office", () => {
  for (const extra of [{ boHinh: "qt" }, { boHinh: "bc" }, { chapNhanNenChung: true }, { tang: "luoi" }]) {
    const dir = tmp(); du(dir, extra); const r = P(["check", dir]);
    assert.strictEqual(r.status, 0, `${JSON.stringify(extra)} → ${r.stdout}`);
  }
  const dir = tmp(); du(dir, { boHinh: "xyz" }); assert.match(P(["check", dir]).stdout, /boHinh: "xyz" không có/);
});

test("prep.py summary: nền chung được nói ở ngay dưới tiêu đề, không chôn trong mục ảnh", () => {
  const dir = tmp(); du(dir, { chapNhanNenChung: true });
  const L = P(["summary", dir]).stdout.split("\n");
  assert.match(L.slice(0, 4).join("\n"), /⚠ .*nền, khung chung/);
  const d2 = tmp(); du(d2, { boHinh: "qt" });
  assert.match(P(["summary", d2]).stdout.split("\n").slice(0, 4).join("\n"), /Bộ hình: qt/);
});

test("kiem.js: deck ≥ 6 slide không dùng bộ hình theo môn → ⚠ Nền chung; im lặng khi có qt*/bc* hoặc người dùng đã đồng ý", () => {
  const dir = tmp(), sl = (t) => Array.from({ length: 6 }, (_, i) => ({ type: i ? "cards" : t, title: "T", items: [] }));
  fs.writeFileSync(path.join(dir, "prep.json"), JSON.stringify({ approved: true }));
  assert.match(kiemDeck({ meta: {}, slides: sl("cover") }, { deckDir: dir }).join("\n"), /⚠ Nền chung/);
  assert.doesNotMatch(kiemDeck({ meta: {}, slides: sl("qtbia") }, { deckDir: dir }).join("\n"), /Nền chung/);
  assert.doesNotMatch(kiemDeck({ meta: {}, slides: sl("bcbia") }, { deckDir: dir }).join("\n"), /Nền chung/);
  fs.writeFileSync(path.join(dir, "prep.json"), JSON.stringify({ approved: true, chapNhanNenChung: true }));
  assert.doesNotMatch(kiemDeck({ meta: {}, slides: sl("cover") }, { deckDir: dir }).join("\n"), /⚠ Nền chung/);
});

test("dung.js --strict: dừng trước khi dựng khi deck dùng nền chung mà chưa được đồng ý", () => {
  const dir = tmp(), dp = path.join(dir, "deck.json");
  fs.writeFileSync(dp, JSON.stringify({ meta: { title: "T" }, slides: Array.from({ length: 6 }, (_, i) => ({ type: i ? "statement" : "cover", title: "Câu kết luận số " + i })) }));
  fs.writeFileSync(path.join(dir, "prep.json"), JSON.stringify({ approved: true }));
  const run = (f) => spawnSync("node", [path.join(ROOT, "hinh", "dung.js"), dp, "--html", ...f], { encoding: "utf8" });
  const a = run(["--strict"]); assert.strictEqual(a.status, 3, a.stdout + a.stderr); assert.match(a.stderr, /--strict/);
  const b = run([]); assert.strictEqual(b.status, 0, b.stdout + b.stderr); assert.match(b.stdout, /⚠ Nền chung/);
});
