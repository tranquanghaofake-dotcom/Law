// Test: bảng trường trong references/layouts.md phải khớp engine/limits.js.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const LIMITS = require("../engine/limits");

const md = fs.readFileSync(path.join(__dirname, "..", "references", "layouts.md"), "utf8");
function rows() {
  const m = {};
  for (const line of md.split("\n")) {
    const t = line.match(/^\| `(\w+)` \|/);
    if (t) m[t[1]] = line;
  }
  return m;
}
function flat(rule, out = new Set()) {
  for (const [k, v] of Object.entries(rule)) {
    if (typeof v === "number") out.add(`${k}:${v}`); else flat(v, out);
  }
  return out;
}
function docNums(line) {
  return new Set([...line.matchAll(/(\w+)(?:\[[^\]]*\])?\((\d+)\)/g)].map(m => `${m[1]}:${m[2]}`));
}

test("mọi type trong limits.js đều có dòng trong layouts.md", () => {
  const r = rows();
  for (const t of Object.keys(LIMITS)) assert.ok(r[t], `layouts.md thiếu type ${t}`);
});
test("giới hạn ký tự trong layouts.md == limits.js", () => {
  const r = rows();
  for (const [t, rule] of Object.entries(LIMITS)) {
    const want = flat(rule), got = docNums(r[t] || "");
    const thieu = [...want].filter(x => !got.has(x)), thua = [...got].filter(x => !want.has(x));
    assert.deepStrictEqual({ t, thieu, thua }, { t, thieu: [], thua: [] });
  }
});
test("thông báo không trỏ tới file không tồn tại", () => {
  const root = path.join(__dirname, "..");
  for (const f of ["hinh/dung.js", "hinh/kiem.js", "hinh/kiem_tang.js", "hinh/kiem_noi_dung.js", "engine/validate.js"]) {
    const p = path.join(root, f); if (!fs.existsSync(p)) continue;
    for (const m of fs.readFileSync(p, "utf8").matchAll(/references\/[\w.-]+/g))
      assert.ok(fs.existsSync(path.join(root, m[0])), `${f} trỏ tới ${m[0]} không tồn tại`);
  }
});

test("đồng bộ: mỗi type có mẫu (stage/templates.js), schema, dòng trong SKILL.md; số type ghi trong tài liệu khớp thực tế", () => {
  const root = path.join(__dirname, "..");
  const b = fs.readFileSync(path.join(root, "stage/templates.js"), "utf8"), v = fs.readFileSync(path.join(root, "engine/validate.js"), "utf8");
  const sk = fs.readFileSync(path.join(root, "SKILL.md"), "utf8"), types = Object.keys(LIMITS), miss = [];
  for (const t of types) {
    if (!b.includes(`T.${t} = `)) miss.push(`${t}: thiếu mẫu trong stage/templates.js`);
    if (!new RegExp(`\\b${t}: \\{`).test(v)) miss.push(`${t}: thiếu schema trong validate.js`);
    if (!sk.includes("`" + t + "`")) miss.push(`${t}: SKILL.md chưa nhắc`);
  }
  assert.deepStrictEqual(miss, []);
  for (const f of ["SKILL.md", "references/layouts.md"]) for (const m of fs.readFileSync(path.join(root, f), "utf8").matchAll(/đủ (\d+) type/g))
    assert.strictEqual(+m[1], types.length, `${f} ghi "đủ ${m[1]} type" nhưng engine có ${types.length}`);
});
test("tài liệu không trỏ tới file/script không tồn tại", () => {
  const root = path.join(__dirname, ".."), bad = [];
  for (const f of ["SKILL.md", ...fs.readdirSync(path.join(root, "references")).map(x => "references/" + x)])
    for (const m of fs.readFileSync(path.join(root, f), "utf8").matchAll(/(?:scripts\/[\w.-]+\.py|references\/[\w.-]+\.md|examples\/[\w.-]+\.(?:json|md))/g))
      if (!fs.existsSync(path.join(root, m[0]))) bad.push(`${f} → ${m[0]}`);
  assert.deepStrictEqual(bad, []);
});
