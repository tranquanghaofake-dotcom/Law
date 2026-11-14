// Gói tải lên claude.ai: tối đa 200 file (người dùng 14/11/2026: zip đóng tay 354 file bị từ chối — lần thứ hai).
// scripts/dong_goi.py phải ra zip ≤ 200 file, và skill giải nén từ zip (không có file lẻ icon / vật 3D) vẫn vẽ được icon, vật 3D.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { execFileSync } = require("child_process");
const R = path.join(__dirname, "..");
let coUnzip = true; try { execFileSync("unzip", ["-v"], { stdio: "ignore" }); } catch { coUnzip = false; }

test("scripts/dong_goi.py: zip ≤ 200 file, không mang tests/ hay file lẻ icon / vật 3D", { skip: !coUnzip && "không có unzip", timeout: 60000 }, () => {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), "donggoi-")), zip = path.join(t, "slide-chuan.zip");
  const ra = execFileSync("python3", [path.join(R, "scripts", "dong_goi.py"), zip], { encoding: "utf8" });
  assert.match(ra, /^XANH: \d+ \/ 200 file/);
  const ds = execFileSync("unzip", ["-Z1", zip], { encoding: "utf8" }).split("\n").filter((x) => x && !x.endsWith("/"));
  assert.ok(ds.length <= 200, `${ds.length} file`);
  assert.ok(ds.every((x) => x.startsWith("slide-chuan/")), "mọi file nằm trong thư mục slide-chuan/");
  for (const f of ["SKILL.md", "package.json", "hinh/icons.json", "hinh/f3d.json", "hinh/emoji.json", "hinh/icons/LICENSE-phosphor.txt", "hinh/f3d/LICENSE-fluentui-emoji.txt"])
    assert.ok(ds.includes("slide-chuan/" + f), "thiếu " + f);
  assert.deepEqual(ds.filter((x) => /^slide-chuan\/tests\/|^slide-chuan\/hinh\/icons\/.*\.svg$|^slide-chuan\/hinh\/f3d\/.*\.png$/.test(x)), []);

  // skill giải nén: icon và vật 3D đọc từ kho gộp, ra đúng như bản file lẻ
  execFileSync("unzip", ["-q", zip, "-d", t]);
  const G = path.join(t, "slide-chuan", "hinh");
  const goc = { icon: require("../hinh/icon"), f3d: require("../hinh/f3d") }, zipd = { icon: require(path.join(G, "icon")), f3d: require(path.join(G, "f3d")) };
  assert.deepEqual(zipd.icon.danhSach(), goc.icon.danhSach());
  assert.deepEqual(zipd.f3d.danhSachF3d(), goc.f3d.danhSachF3d());
  const ic = goc.icon.danhSach()[0], v = goc.f3d.danhSachF3d()[0];
  assert.equal(zipd.icon.icon(ic, { mau: "276a58" }), goc.icon.icon(ic, { mau: "276a58" }));
  assert.equal(zipd.f3d.f3d(v), goc.f3d.f3d(v));
  assert.throws(() => zipd.icon.icon("khong-co-icon-nay"), /Không có icon/);
});
