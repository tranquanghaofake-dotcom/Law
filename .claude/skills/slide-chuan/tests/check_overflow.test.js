// Test: kiểm sau dựng (PDF render thật). Bỏ qua nếu máy thiếu LibreOffice / python-pptx / pdfplumber.
const test = require("node:test");
const assert = require("node:assert");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { ROOT, build, tmpdir } = require("./helpers");

const has = (cmd, args) => { const r = spawnSync(cmd, args); return r.status === 0; };
const OK = (has("which", ["soffice"]) || has("which", ["libreoffice"])) && has("python3", ["-c", "import pptx, pdfplumber"]);
const opt = { skip: OK ? false : "thiếu LibreOffice/python-pptx/pdfplumber" };
const CHECK = path.join(ROOT, "scripts", "check_overflow.py");
const py = (pptx) => spawnSync("python3", [CHECK, pptx], { encoding: "utf8" });

for (const t of ["teal", "kem", "son"]) {
  test(`banan142 theme ${t}: check_overflow exit 0 và PDF không có DejaVu/Caladea`, opt, () => {
    const dir = tmpdir(), pptx = path.join(dir, `b_${t}.pptx`);
    assert.strictEqual(build([path.join(ROOT, "examples", "banan142.json"), pptx, "--theme", t, "--strict"]).code, 0);
    const r = py(pptx);
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    if (has("which", ["pdffonts"])) {
      // PDF do check_overflow tạo nằm ở thư mục tạm riêng; render lại tại đây để chắc chắn
      const soffice = spawnSync("sh", ["-c", `soffice --headless --convert-to pdf --outdir ${dir} ${pptx} >/dev/null 2>&1`]);
      const fonts = spawnSync("pdffonts", [path.join(dir, `b_${t}.pdf`)], { encoding: "utf8" }).stdout;
      assert.ok(fonts.includes("Carlito") || fonts.includes("Liberation"), fonts);
      assert.ok(!/DejaVu|Caladea/i.test(fonts), fonts);
    }
  });
}
test("stress.json: check_overflow exit 1 và chỉ báo ô cards.items[*].name / who của slide 3", opt, () => {
  const pptx = path.join(tmpdir(), "stress.pptx");
  build([path.join(__dirname, "stress.json"), pptx]);
  const r = py(pptx);
  assert.strictEqual(r.status, 1, r.stdout + r.stderr);
  const lines = r.stdout.split("\n").filter(l => l.startsWith("  - "));
  assert.ok(lines.length >= 4, r.stdout);
  for (const l of lines) assert.ok(/^  - Slide 3 .*items\[\d\]\.(name|who)/.test(l) || /^  - Slide 3: chữ đè nhau giữa \[cards items\[\d\]\.name\]/.test(l), "báo nhầm ô: " + l);
  for (let i = 0; i < 4; i++) assert.ok(r.stdout.includes(`items[${i}].name`), r.stdout);
});
