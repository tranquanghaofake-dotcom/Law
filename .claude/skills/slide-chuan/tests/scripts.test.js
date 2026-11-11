// Test offline cho các script lấy ảnh / xử lý ảnh: dùng bản ghi mẫu (cấu trúc thật đã đọc từ API ngày 04/11/2026), không gọi mạng.
const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");
const { ROOT, tmpdir } = require("./helpers");

function py(code) {
  const r = spawnSync("python3", ["-c", `import sys, json; sys.path.insert(0, ${JSON.stringify(path.join(ROOT, "scripts"))})\n${code}`], { encoding: "utf8" });
  assert.strictEqual(r.status, 0, r.stderr);
  return JSON.parse(r.stdout.trim().split("\n").pop());
}

const RIJKS = {
  id: "https://id.rijksmuseum.nl/200111116",
  identified_by: [{ type: "Identifier", content: "RP-T-1954-189" }, { type: "Name", content: "Ontwerp voor een titelblad met Pax en Justitia" }],
  produced_by: { type: "Production", part: [{ carried_out_by: [{ notation: [{ "@language": "en", "@value": "Giovanni Battista Tiepolo" }] }] }] },
  subject_of: [{ digitally_carried_by: [{ access_point: [{ id: "https://iiif.micr.io/XfZLV/full/max/0/default.jpg" }], referred_to_by: [{ _label: "Public Domain" }] }] }],
};

test("find_images.rijks_record: lấy ảnh IIIF ≤ 2400px, tác giả, trang gốc; bỏ ảnh không phải Public Domain/CC0", () => {
  const ok = py(`import find_images as f; print(json.dumps(f.rijks_record(json.loads(${JSON.stringify(JSON.stringify(RIJKS))}))))`);
  assert.strictEqual(ok.url, "https://iiif.micr.io/XfZLV/full/!2400,2400/0/default.jpg");
  assert.strictEqual(ok.creator, "Giovanni Battista Tiepolo");
  assert.strictEqual(ok.source, "https://www.rijksmuseum.nl/en/collection/RP-T-1954-189");
  assert.strictEqual(ok.license, "Public Domain");
  const copy = JSON.parse(JSON.stringify(RIJKS)); copy.subject_of[0].digitally_carried_by[0].referred_to_by[0]._label = "© Rijksmuseum";
  assert.strictEqual(py(`import find_images as f; print(json.dumps(f.rijks_record(json.loads(${JSON.stringify(JSON.stringify(copy))}))))`), null);
});

const SI = {
  title: "Necklace", url: "edanmdm:saam_1929.8.175.19",
  content: { freetext: { name: [{ label: "Artist", content: "Unidentified" }] },
    descriptiveNonRepeating: { data_source: "Smithsonian American Art Museum", record_link: "https://americanart.si.edu/collections/search/artwork/?id=29819",
      online_media: { media: [{ type: "Images", usage: { access: "CC0" }, width: 3755, content: "https://ids.si.edu/ids/deliveryService?id=SAAM-1929.8.175.19_1",
        resources: [{ label: "High-resolution JPEG", url: "https://ids.si.edu/ids/download?id=SAAM-1929.8.175.19_1.jpg", width: 2200, height: 3000 }] }] } } },
};

test("find_images.smithsonian_record: chỉ lấy media CC0, ảnh JPEG độ phân giải cao; tác giả 'Unidentified' → tên bảo tàng", () => {
  const ok = py(`import find_images as f; print(json.dumps(f.smithsonian_record(json.loads(${JSON.stringify(JSON.stringify(SI))}))))`);
  assert.strictEqual(ok.url, "https://ids.si.edu/ids/download?id=SAAM-1929.8.175.19_1.jpg");
  assert.strictEqual(ok.creator, "Smithsonian American Art Museum");
  assert.strictEqual(ok.w, 2200);
  const nc = JSON.parse(JSON.stringify(SI)); nc.content.descriptiveNonRepeating.online_media.media[0].usage.access = "Usage conditions apply";
  assert.strictEqual(py(`import find_images as f; print(json.dumps(f.smithsonian_record(json.loads(${JSON.stringify(JSON.stringify(nc))}))))`), null);
});

test("find_images: không có SI_API_KEY → bỏ qua Smithsonian, không gọi mạng", () => {
  const r = spawnSync("python3", ["-c", `import sys, json; sys.path.insert(0, ${JSON.stringify(path.join(ROOT, "scripts"))})\nimport find_images as f; print(json.dumps(f.smithsonian("x", 3)))`], { encoding: "utf8", env: Object.assign({}, process.env, { SI_API_KEY: "" }) });
  assert.strictEqual(r.stdout.trim(), "[]");
});

test("cutout.license_ok: từ chối ND, ảnh không rõ giấy phép, ảnh web; cho phép CC BY-SA, Pexels, CC0", () => {
  const cases = [[null, false], [{ license: "CC BY-ND 4.0" }, false], [{ license: "BY-ND" }, false], [{ license: "Pexels License", via: "web" }, false],
    [{ license: "BY-SA" }, true], [{ license: "Pexels License", via: "Pexels" }, true], [{ license: "CC0" }, true]];
  for (const [m, want] of cases) {
    const got = py(`import cutout as c; print(json.dumps(c.license_ok(json.loads(${JSON.stringify(JSON.stringify(m))}))[0]))`);
    assert.strictEqual(got, want, JSON.stringify(m));
  }
});

test("cutout.trim: cắt sát chủ thể + chừa lề; ảnh trong suốt hoàn toàn → None", () => {
  const out = py(`import cutout as c
from PIL import Image
im = Image.new("RGBA", (400, 300), (0, 0, 0, 0))
for x in range(100, 200):
    for y in range(50, 150): im.putpixel((x, y), (200, 0, 0, 255))
t = c.trim(im, 0.04); e = c.trim(Image.new("RGBA", (50, 50), (0, 0, 0, 0)), 0.04)
print(json.dumps([t.size, e is None]))`);
  assert.deepStrictEqual(out, [[108, 108], true]);
});

test("cutout trên ảnh mẫu (nếu đã cài rembg): ra PNG trong suốt + images.json ghi 'đã tách nền'", { skip: spawnSync("python3", ["-c", "import rembg"]).status !== 0 && "chưa cài rembg" }, () => {
  const dir = tmpdir(); fs.mkdirSync(path.join(dir, "images"));
  for (const f of ["chia-khoa-nha.jpg", "images.json"]) fs.copyFileSync(path.join(ROOT, "examples", "images", f), path.join(dir, "images", f));
  const r = spawnSync("python3", [path.join(ROOT, "scripts", "cutout.py"), dir, "images/chia-khoa-nha.jpg"], { encoding: "utf8" });
  assert.strictEqual(r.status, 0, r.stdout + r.stderr);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "images", "images.json"), "utf8"))["chia-khoa-nha_cut.png"];
  assert.ok(meta && /tách nền/.test(meta.edited) && meta.license === "Pexels License", JSON.stringify(meta));
});
