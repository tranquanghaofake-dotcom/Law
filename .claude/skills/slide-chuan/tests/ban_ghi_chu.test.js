// Bản in ghi chú cho người trình bày (scripts/ban_ghi_chu.py): mỗi slide một trang — ảnh slide, tiêu đề, ghi chú, số giây nói
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path"), cp = require("child_process");
const R = path.join(__dirname, "..");
const coPy = cp.spawnSync("python3", ["-c", "import pptx, reportlab"]).status === 0, coPdf = cp.spawnSync("pdftotext", ["-v"]).status === 0;
test("bản in ghi chú: đủ trang, có tiêu đề + ghi chú + giây nói; slide không ghi chú vẫn có trang", { skip: !(coPy && coPdf) && "thiếu python-pptx / reportlab / pdftotext" }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bgc-")), pp = path.join(dir, "thu.pptx");
  cp.execFileSync("python3", ["-c", `
from pptx import Presentation
p = Presentation()
for i, (t, n, nh) in enumerate([("Lương hưu bằng 45–75%", "Nữ 45% ở mốc 15 năm, nam 45% ở 20 năm. " * 8, ""), ("Câu hỏi nhanh", "", ""), ("Chưa đúng", "Người học chọn A. " * 40, "Nhánh trắc nghiệm: sai A")]):
    s = p.slides.add_slide(p.slide_layouts[5]); s.shapes.title.text = t
    if n: s.notes_slide.notes_text_frame.text = n
    if nh: s._element.cSld.set("name", nh)
p.save(${JSON.stringify(pp)})`]);
  const out = path.join(dir, "thu_ghi-chu.pdf");
  const r = cp.spawnSync("python3", [path.join(R, "scripts", "ban_ghi_chu.py"), pp, out], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const txt = cp.execFileSync("pdftotext", ["-layout", out, "-"], { encoding: "utf8" });
  assert.match(txt, /Slide 1 \/ 3/); assert.match(txt, /Lương hưu bằng 45–75%/); assert.match(txt, /Nữ 45% ở mốc 15 năm/);
  assert.match(txt, /~\d+ giây/); assert.match(txt, /Slide 2 \/ 3/); assert.match(txt, /\(không có ghi chú\)/);
  assert.match(txt, /Lịch nói/); assert.match(txt, /Mốc/);
  const lich = txt.split("Slide 1 / 3")[0];   // trang đầu: bảng lịch nói đứng trước trang của slide 1
  assert.match(lich, /Lương hưu bằng 45–75%[\s\S]*0:3\d/, "dòng slide 1: mốc cộng dồn 0:3x"); assert.match(lich, /nhánh sai/i, "slide nhánh sai ghi rõ, không cộng mốc");
  assert.match(txt, /Nhánh sai A — chỉ nói khi người học chọn/); assert.match(txt, /tổng ~0 phút 3[0-9] giây/, "nhánh sai không cộng vào tổng (chỉ 64 tiếng của slide 1)");
});
