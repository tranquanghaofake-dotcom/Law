// Test: 8 bố cục bổ sung (pyramid, steps, matrix, venn, tree, quote, frame, beforeafter)
// — deck mẫu qua --strict ở 3 theme, shape gốc sửa được, kiểm tra cấu trúc chặn các ca "hình cho đẹp".
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, build, buildDeck, tmpdir, cover } = require("./helpers");

const EX = path.join(ROOT, "examples", "bocuc_moi.json");

test("bocuc_moi.json --strict xanh ở cả 3 theme (không tràn, không đè, đủ tương phản)", () => {
  for (const t of ["teal", "kem", "son"]) {
    const r = build([EX, path.join(tmpdir(), `bm_${t}.pptx`), "--theme", t, "--strict"]);
    assert.strictEqual(r.code, 0, `${t}:\n${r.all}`);
  }
});

test("pyramid vẽ bằng custGeom, steps bằng chevron — shape gốc sửa được trong PowerPoint", async () => {
  const out = path.join(tmpdir(), "bm.pptx"), r = build([EX, out]); assert.strictEqual(r.code, 0, r.all);
  const z = await JSZip.loadAsync(fs.readFileSync(out));
  const s2 = await z.file("ppt/slides/slide2.xml").async("string"), s3 = await z.file("ppt/slides/slide3.xml").async("string");
  assert.strictEqual((s2.match(/<a:custGeom>/g) || []).length, 5, "5 tầng tháp = 5 đa giác");
  assert.ok(/prst="chevron"/.test(s3) && /prst="homePlate"/.test(s3), "bước đầu homePlate, các bước sau chevron");
  assert.ok(!/\[trái luật\]/.test(s2), "[từ khoá] trong levels.text phải được tô, không in nguyên ngoặc");
});

test("chặn hình vô nghĩa: matrix thiếu ô, venn không có điểm chung, tháp < 3 tầng, focus sai chỉ số", () => {
  const cells = (n) => Array.from({ length: n }, (_, i) => ({ head: "Ô " + i }));
  const bad = buildDeck({ slides: [cover,
    { type: "matrix", title: "Ma trận thiếu ô", cells: cells(3) },
    { type: "venn", title: "Không có điểm chung", left: { label: "A", items: ["a"] }, right: { label: "B", items: ["b"] } },
    { type: "pyramid", title: "Tháp hai tầng", levels: [{ head: "X" }, { head: "Y" }] },
    { type: "steps", title: "Focus sai", steps: [{ head: "1" }, { head: "2" }, { head: "3" }], focus: 3 }] });
  assert.strictEqual(bad.code, 2, bad.all);
  for (const k of ["Slide 2 (matrix): cells", "Slide 3 (venn): both.items", "Slide 4 (pyramid): levels", "Slide 5 (steps): focus"]) assert.ok(bad.all.includes(k), `thiếu lỗi ${k}\n${bad.all}`);
});

test("frame: toạ độ điểm ngoài 0.04–0.96 bị chặn; beforeafter thiếu ảnh bị chặn", () => {
  const r = buildDeck({ slides: [cover,
    { type: "frame", title: "Ảnh có chú thích", photo: "x.jpg", points: [{ x: 1.2, y: 0.5, head: "A" }] },
    { type: "beforeafter", title: "Trước và sau", before: { label: "Trước" }, after: { photo: "y.jpg" } }] });
  assert.strictEqual(r.code, 2, r.all);
  assert.ok(r.all.includes("points[0].x") && r.all.includes("before.photo"), r.all);
});

test("quote: câu trích nguyên văn không bị bắt cụm đệm (không được sửa chữ của văn bản)", () => {
  const r = buildDeck({ slides: [cover, { type: "quote", quote: "Phải thực hiện nghĩa vụ một cách thiện chí, trung thực.", by: "Khoản 3 Điều 3 BLDS 2015" }] });
  assert.ok(!/cụm đệm "một cách"/.test(r.all), r.all);
});

test("kiemthu_con_lai.json (section, split, gallery, share, map nhóm, photo chú thích, table, 4 dạng chart, closing) --strict ở 3 theme", () => {
  for (const t of ["teal", "kem", "son"]) {
    const r = build([path.join(ROOT, "examples", "kiemthu_con_lai.json"), path.join(tmpdir(), `kt_${t}.pptx`), "--theme", t, "--strict"]);
    assert.strictEqual(r.code, 0, `${t}:\n${r.all}`);
    assert.ok(!/Gợi ý bố cục/.test(r.all), `${t}: không còn gợi ý dư khoảng trống\n${r.all}`);
  }
});

test("cutout: ảnh tách nền thay hình vẽ, ghi nguồn có 'đã tách nền'; file thiếu → lỗi cấu trúc", () => {
  const r = build([EX, path.join(tmpdir(), "cut.pptx"), "--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  assert.ok(/Slide 9: Ảnh: .*đã tách nền/.test(r.all), r.all);
  const bad = buildDeck({ slides: [cover, { type: "panelrows", title: "Vật thật thiếu file", cutout: "images/khong-co.png", rows: [{ head: "A", text: "a" }] }] });
  assert.strictEqual(bad.code, 2, bad.all); assert.ok(bad.all.includes("khong-co.png"), bad.all);
});
