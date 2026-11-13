// Test "máy quay" giữa hai slide (hinh/may_quay.js + bước 4b của hinh/build.js): vật không có cặp Morph được nhân một bản đặt ngoài khung.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const MQ = require("../hinh/may_quay");

const ngoai = (r) => !MQ.trong(r);

test("máy quay trôi ngang: vật cũ ra hẳn bên trái, vật mới chờ hẳn bên phải; thị sai làm vật gần đi xa hơn", () => {
  const cam = MQ.camOf("pan:1,0"), r = { x: 1500, y: 300, w: 600, h: 300 };   // thò ra mép phải: vẫn phải ra hẳn ngoài khung
  const a = MQ.ra(r, cam), b = MQ.vao({ x: 100, y: 200, w: 500, h: 400 }, cam);
  assert.ok(ngoai(a) && a.x + a.w <= 0, "vật cũ nằm hẳn bên trái khung");
  assert.ok(ngoai(b) && b.x >= 1920, "vật mới nằm hẳn bên phải khung");
  assert.strictEqual(a.y, r.y); assert.strictEqual(a.k, 1);
  const gan = MQ.ra({ x: 100, y: 100, w: 200, h: 200 }, cam, 1.6), xa = MQ.ra({ x: 100, y: 100, w: 200, h: 200 }, cam, 1);
  assert.ok(gan.x < xa.x, "vật gần (data-sau > 1) đi xa hơn trong cùng thời gian = nhanh hơn");
});

test("máy quay phóng vào: vật cũ nở ra và bay khỏi khung, vật mới mọc từ điểm phóng (rất nhỏ)", () => {
  const cam = MQ.camOf("zoom:3,1400,500");
  assert.deepStrictEqual([cam.kind, cam.k, cam.cx, cam.cy], ["zoom", 3, 1400, 500]);
  const a = MQ.ra({ x: 1300, y: 420, w: 200, h: 160 }, cam);          // chính ở điểm phóng
  assert.ok(ngoai(a) && a.k === 3 && Math.abs(a.w - 600) < 1e-9, "vật ở điểm phóng nở 3 lần và vẫn ra ngoài khung");
  const b = MQ.vao({ x: 0, y: 0, w: 1920, h: 1080 }, cam);
  assert.ok(b.w < 120 && Math.abs(b.x + b.w / 2 - 1400) < 1 && Math.abs(b.y + b.h / 2 - 500) < 1, "vật mới thu nhỏ, tâm ở điểm phóng");
  assert.strictEqual(MQ.camOf("lạ:1"), null); assert.strictEqual(MQ.camOf(null), null);
});

const chromiumPath = process.env.PW_CHROMIUM || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : null);
let hasPw = true; try { require.resolve("playwright"); } catch { hasPw = false; }

test("dựng PPTX có máy quay: bản nhân cùng tên !! nằm ngoài slide kia, vật cùng tên giữ nguyên, vật đến bằng máy quay bỏ hiệu ứng vào", { skip: !hasPw && "không có Playwright", timeout: 180000 }, async () => {
  if (chromiumPath) process.env.PW_CHROMIUM = chromiumPath;
  const { build } = require("../hinh/build");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mq-")), html = path.join(dir, "d.html");
  const sec = (id, at, inner) => `<section class="s" data-id="${id}" ${at} style="position:relative;width:1920px;height:1080px;overflow:hidden;background:#f4f7fc">${inner}</section>`;
  const box = (x, y, w, h, c, at = "") => `<div ${at} style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${c};border-radius:24px"></div>`;
  const txt = (x, y, t, at = "") => `<div data-t ${at} style="position:absolute;left:${x}px;top:${y}px;width:900px;font:700 48px/1.2 'Be Vietnam Pro'">${t}</div>`;
  fs.writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}</style></head><body>
    ${sec("a", 'data-trans="fade"', `${txt(110, 40, "Đầu trang", 'data-m="dau"')}${box(200, 300, 500, 400, "#0b57d0", 'data-l="hop-a"')}${txt(800, 400, "Chữ của slide trước")}`)}
    ${sec("b", 'data-trans="morph" data-cam="pan:1,0" data-dur="900"', `${txt(110, 40, "Đầu trang", 'data-m="dau"')}${box(1000, 300, 600, 400, "#f2a91d", 'data-l="hop-b" data-a="rise" data-at="200"')}${txt(200, 400, "Chữ mới", 'data-a="fade"')}${box(1600, 860, 120, 120, "#d63b2f", 'data-l="sao" data-sau="0" data-a="pop" data-at="300"')}`)}
  </body></html>`);
  const quiet = console.log; console.log = () => {};
  let r; try { r = await build({ htmlPath: html, outPath: path.join(dir, "d.pptx"), nhungFont: false }); } finally { console.log = quiet; }
  const JSZip = require("jszip"), z = await JSZip.loadAsync(fs.readFileSync(path.join(dir, "d.pptx")));
  const s1 = await z.file("ppt/slides/slide1.xml").async("string"), s2 = await z.file("ppt/slides/slide2.xml").async("string");
  const E = 914400 * 13.333 / 1920;   // EMU trên 1 px của slide 1920 px
  const shapes = (x) => x.split(/<p:(?:sp|pic)>/).slice(1).map((b) => { const nm = (b.match(/name="([^"]+)"/) || [])[1], o = b.match(/<a:off x="(-?\d+)" y="(-?\d+)"\s*\/>\s*<a:ext cx="(\d+)" cy="(\d+)"/);
    return o ? { name: nm, x: +o[1] / E, y: +o[2] / E, w: +o[3] / E } : null; }).filter(Boolean);
  const A = shapes(s1), B = shapes(s2), mq = (L) => L.filter((s) => s.name.startsWith("!!mq"));
  // đầu trang ghép cặp theo tên, không nhân bản
  assert.strictEqual(A.filter((s) => s.name === "!!dau").length, 1); assert.strictEqual(B.filter((s) => s.name === "!!dau").length, 1);
  // vật của slide trước (hộp + chữ) có bản ở slide sau, nằm hẳn bên trái khung; vật mới của slide sau (hộp vàng + chữ mới) có bản ở slide trước, hẳn bên phải
  const gB = mq(B).filter((s) => A.some((a) => a.name === s.name)), gA = mq(A).filter((s) => B.some((b) => b.name === s.name));
  assert.ok(gB.length >= 2 && gA.length >= 2, `phải có bản nhân hai chiều (${gB.length}, ${gA.length})`);
  for (const s of gB) { const goc = A.find((a) => a.name === s.name); if (goc.x >= 0 && goc.x < 1920) assert.ok(s.x + s.w <= 0, `bản nhân “${s.name}” ở slide sau phải nằm bên trái khung`); }
  for (const s of gA) { const goc = B.find((b) => b.name === s.name); if (goc.x >= 0 && goc.x < 1920) assert.ok(s.x >= 1920, `bản nhân “${s.name}” ở slide trước phải nằm bên phải khung`); }
  // vật đứng ngoài máy quay (data-sau="0") không có bản nhân và vẫn giữ hiệu ứng vào; vật đến bằng máy quay không còn hiệu ứng vào
  assert.ok(!/name="sao/.test(s1), "vật data-sau=0 không có bản ở slide trước");
  const nEff = (s2.match(/presetClass="entr"/g) || []).length;
  assert.strictEqual(nEff, 1, `chỉ còn hiệu ứng vào của vật đứng ngoài máy quay (đang có ${nEff})`);
  assert.ok(s2.includes("p159:morph"), "chuyển cảnh vẫn là Morph gốc");
});
