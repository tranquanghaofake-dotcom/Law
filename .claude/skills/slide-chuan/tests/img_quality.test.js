// Test: bộ chấm chất lượng ảnh nhận ra ảnh mờ (phóng to từ ảnh nhỏ), ảnh tối, ảnh nhỏ — và không phạt ảnh nét.
const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const { spawnSync } = require("child_process");
const { ROOT } = require("./helpers");

const PY = `
import sys, json
sys.path.insert(0, ${JSON.stringify(path.join(ROOT, "scripts"))})
from img_quality import assess
from PIL import Image, ImageDraw, ImageFilter
import random
random.seed(1)
im = Image.new("RGB", (2400, 1600), (60, 70, 80)); d = ImageDraw.Draw(im)
for _ in range(9000):
    x, y = random.randrange(2400), random.randrange(1600); r = random.randrange(3, 24)
    d.ellipse([x, y, x + r, y + r], fill=(random.randrange(256), random.randrange(256), random.randrange(256)))
blur = im.resize((600, 400)).resize((2400, 1600), Image.BICUBIC)
dark = im.point(lambda v: v // 6)
small = im.resize((1200, 800))
print(json.dumps({k: assess(v, v.width) for k, v in {"net": im, "mo": blur, "toi": dark, "nho": small}.items()}))
`;
test("img_quality: ảnh nét ≥ 2.5; ảnh mờ / tối / nhỏ < 2", () => {
  const r = spawnSync("python3", ["-c", PY], { encoding: "utf8" });
  assert.strictEqual(r.status, 0, r.stderr);
  const q = JSON.parse(r.stdout);
  assert.ok(q.net.diem >= 2.5, JSON.stringify(q.net));
  assert.ok(q.mo.diem < 2 && q.mo.ghi_chu.some(x => x.includes("mờ")), JSON.stringify(q.mo));
  assert.ok(q.toi.diem < 2.5 && q.toi.ghi_chu.includes("quá tối"), JSON.stringify(q.toi));
  assert.ok(q.nho.diem < 2 && q.nho.ghi_chu.some(x => x.startsWith("nhỏ")), JSON.stringify(q.nho));
});
