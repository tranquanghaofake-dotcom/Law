#!/usr/bin/env node
// NHÂN VẬT VẼ TAY TỪ OPEN PEEPS (CC0) — ghép dáng + tóc + nét mặt, tô theo bảng màu của bài, xuất SVG vector sửa được.
//   node scripts/nhan_vat.js <ra.svg> --dang=BlazerColorPants --toc=ShortTwo --mat=Smile \
//        [--da=#E0A47C] [--ao=#2E6DA4] [--quan=#1D2B2A] [--giay=#1D2B2A] [--vien=#1D2B2A] [--toc-mau=#1D2B2A] [--lat]
//   node scripts/nhan_vat.js --ds          (liệt kê dáng / tóc / nét mặt)
// Dáng: thư mục body/standing (đứng) hoặc body/sitting (ngồi). Vị trí đầu tự dò: dựng thân với màu da riêng, tìm cổ (điểm da cao nhất).
// Ghi công không bắt buộc (CC0) nhưng nên ghi "Open Peeps — Pablo Stanley, CC0" trong ghi-cong.md của bài.
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const { damBao, CACHE } = require("./tai_nguyen");

const BUILD = (nm) => path.join(nm, "@opeepsfun", "open-peeps", "build");
const tim = (nm, ten) => { for (const d of ["body/standing", "body/sitting"]) if (fs.existsSync(path.join(BUILD(nm), d, ten + ".js"))) return d; return null; };

function danhSach() {
  const nm = damBao(), b = BUILD(nm), ls = (d) => fs.readdirSync(path.join(b, d)).filter((f) => f.endsWith(".js") && f !== "index.js").map((f) => f.slice(0, -3));
  return { dung: ls("body/standing"), ngoi: ls("body/sitting"), toc: ls("head"), mat: ls("face") };
}

// dựng một SVG bằng React trong bộ nhớ đệm (gói dùng cú pháp import + JSX đã biên dịch → đóng gói bằng esbuild)
function dung(nm, { dang, toc, mat, mau, dau }) {
  const thu = tim(nm, dang); if (!thu) throw new Error(`không có dáng “${dang}” (xem --ds)`);
  for (const [d, t] of [["head", toc], ["face", mat]]) if (!fs.existsSync(path.join(BUILD(nm), d, t + ".js"))) throw new Error(`không có ${d === "head" ? "tóc" : "nét mặt"} “${t}” (xem --ds)`);
  const vao = path.join(CACHE, `_nv_${process.pid}_${Date.now()}.mjs`), ra = vao.replace(/\.mjs$/, ".cjs");
  fs.writeFileSync(vao, `import React from "react"; import { renderToStaticMarkup } from "react-dom/server";
import Than, * as T from "@opeepsfun/open-peeps/build/${thu}/${dang}.js"; import Toc from "@opeepsfun/open-peeps/build/head/${toc}.js"; import Mat from "@opeepsfun/open-peeps/build/face/${mat}.js";
const e = React.createElement, m = ${JSON.stringify(mau)}, dau = ${JSON.stringify(dau || null)};
const cfg = Object.values(T).find((v) => v && v.viewBox), [, , W, H] = cfg.viewBox.split(" ").map(Number);
const than = e(Than, { skinColor: m.da, pantsColor: m.quan, shoesColor: m.giay, jacketColor: m.ao, shirtColor: m.ao, outlineColor: m.vien });
const dauG = dau ? e("g", { transform: "translate(" + dau.tx + "," + dau.ty + ")" }, e("g", { transform: "translate(342,190)" }, e(Toc, { hairColor: m.toc, outlineColor: m.vien, skinColor: m.da })), e("g", { transform: "translate(531,366)" }, e(Mat, { outlineColor: m.vien }))) : null;
process.stdout.write(JSON.stringify({ W, H, svg: renderToStaticMarkup(e("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 -760 " + W + " " + (H + 760) }, than, dauG)) }));`);
  try { execFileSync(path.join(nm, ".bin", "esbuild"), [vao, "--bundle", "--platform=node", "--format=cjs", `--outfile=${ra}`, "--log-level=error"], { cwd: CACHE });
    return JSON.parse(execFileSync(process.execPath, [ra], { maxBuffer: 64 << 20 }).toString()); }
  finally { for (const f of [vao, ra]) fs.rmSync(f, { force: true }); }
}

// cổ = điểm cao nhất có màu da riêng (#FF00FF) trên ảnh thân; đầu Open Peeps có cằm ở (624, 705) trong hệ toạ độ của nó
async function doCo(nm, opt) {
  const sharp = require("sharp"), r = dung(nm, { ...opt, mau: { ...opt.mau, da: "#FF00FF" }, dau: null }), k = 0.25;
  const { data, info } = await sharp(Buffer.from(r.svg), { density: 72 * k * 4 }).resize(Math.round(r.W * k)).raw().toBuffer({ resolveWithObject: true });
  const sx = r.W / info.width, sy = (r.H + 760) / info.height;
  for (let y = 0; y < info.height; y++) { const xs = []; for (let x = 0; x < info.width; x++) { const o = (y * info.width + x) * info.channels; if (data[o] > 200 && data[o + 1] < 60 && data[o + 2] > 200) xs.push(x); }
    if (xs.length >= 3) { const nx = (xs.reduce((a, b) => a + b, 0) / xs.length) * sx, ny = y * sy - 760; return { tx: Math.round(nx - 624), ty: Math.round(ny - 705 + 85) }; } }
  throw new Error(`không dò được cổ của dáng “${opt.dang}”`);
}

async function nhanVat(ra, { dang = "BlazerColorPants", toc = "ShortTwo", mat = "Smile", da = "#E0A47C", ao = "#2E6DA4", quan = "#1D2B2A", giay = "#1D2B2A", vien = "#1D2B2A", tocMau, lat = false } = {}) {
  const nm = damBao(), mau = { da, ao, quan, giay, vien, toc: tocMau || vien }, opt = { dang, toc, mat, mau };
  const dau = await doCo(nm, opt), r = dung(nm, { ...opt, dau });
  let svg = r.svg; if (lat) svg = svg.replace(/(<svg[^>]*>)([\s\S]*)<\/svg>$/, (m, a, b) => `${a}<g transform="translate(${r.W} 0) scale(-1 1)">${b}</g></svg>`);
  fs.mkdirSync(path.dirname(path.resolve(ra)), { recursive: true }); fs.writeFileSync(ra, svg);
  return { ra, dau };
}

module.exports = { nhanVat, danhSach };
if (require.main === module) {
  const a = process.argv.slice(2), o = {}; for (const x of a.filter((s) => s.startsWith("--"))) { const [k, v] = x.slice(2).split("="); o[k.replace(/-(\w)/g, (_, c) => c.toUpperCase())] = v === undefined ? true : v; }
  if (o.ds) { const d = danhSach(); for (const [k, v] of Object.entries(d)) console.log(`${k} (${v.length}): ${v.join(" ")}`); process.exit(0); }
  const ra = a.find((s) => !s.startsWith("--")); if (!ra) { console.error("Dùng: node scripts/nhan_vat.js <ra.svg> --dang=… --toc=… --mat=… [màu] | --ds"); process.exit(2); }
  nhanVat(ra, o).then((r) => console.log(`✓ ${r.ra} (đầu đặt tại ${r.dau.tx}, ${r.dau.ty})`)).catch((e) => { console.error("✗ " + e.message); process.exit(1); });
}
