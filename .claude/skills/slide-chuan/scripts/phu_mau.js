#!/usr/bin/env node
// PHỦ MÀU ẢNH CHỤP: cắt ảnh theo khung + điểm nhìn, rồi phủ một dải màu chủ chuyển dần (để đặt chữ lên ảnh mà vẫn đọc được).
//   node scripts/phu_mau.js <vào.jpg> <ra.jpg> --rong=1920 --cao=1080 [--tieu=0.7,0.5] [--phu=#0E4F49] [--tu=trai|phai|duoi|tren] [--dac=0.94] [--den=0.62] [--bot=0]
//   --tieu  điểm nhìn (tỉ lệ x,y của ảnh gốc) giữ trong khung khi cắt
//   --phu   màu phủ; --tu  phía màu đặc nhất; --dac  độ đục ở mép đó; --den  tỉ lệ khung nơi màu phủ tan hết (0–1)
//   --bot   độ đục phủ đều toàn ảnh (làm dịu ảnh quá rực), mặc định 0
//   --cheo  cắt chéo mép trái (tỉ lệ bề rộng ở đỉnh, vd. 0.2) → PNG trong suốt phần bị cắt; ra phải là .png
//   --khung=vom|tron|bo  cắt ảnh theo khung cách điệu (vòm cửa, tròn, bo góc --bo=40) → PNG trong suốt
//   --hat=0.08  phủ hạt in (nhiễu đơn sắc) cho cảm giác ảnh in / tạp chí; 0 = không
// Lớp phủ được nướng vào JPG (PowerPoint chỉ thấy một ảnh) — chữ vẫn là hộp chữ thật đặt bên trên. Ảnh không phải ảnh AI: ghi nguồn trong ghi-cong.md.
const path = require("path"), fs = require("fs");
const sharp = require("sharp");

async function phuMau(vao, ra, { rong = 1920, cao = 1080, tieu = [0.5, 0.5], phu = "#0E4F49", tu = "", dac = 0.94, den = 0.62, bot = 0, cheo = 0, khung = "", bo = 40, hat = 0 } = {}) {
  const meta = await sharp(vao).metadata(), k = Math.max(rong / meta.width, cao / meta.height), W = Math.round(meta.width * k), H = Math.round(meta.height * k);
  const left = Math.min(Math.max(0, Math.round(tieu[0] * W - rong / 2)), W - rong), top = Math.min(Math.max(0, Math.round(tieu[1] * H - cao / 2)), H - cao);
  let img = sharp(vao).resize(W, H).extract({ left, top, width: rong, height: cao });
  const lop = [];
  if (bot > 0) lop.push(`<rect width="${rong}" height="${cao}" fill="${phu}" fill-opacity="${bot}"/>`);
  if (tu) { const [x1, y1, x2, y2] = { trai: [0, 0, 1, 0], phai: [1, 0, 0, 0], duoi: [0, 1, 0, 0], tren: [0, 0, 0, 1] }[tu];
    lop.push(`<defs><linearGradient id="g" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${phu}" stop-opacity="${dac}"/><stop offset="${den * 0.55}" stop-color="${phu}" stop-opacity="${(dac * 0.8).toFixed(3)}"/><stop offset="${den}" stop-color="${phu}" stop-opacity="0"/></linearGradient></defs><rect width="${rong}" height="${cao}" fill="url(#g)"/>`); }
  if (hat > 0) lop.push(`<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/><feColorMatrix type="saturate" values="0"/></filter><rect width="${rong}" height="${cao}" filter="url(#n)" opacity="${hat}"/>`);
  if (lop.length) img = sharp(await img.toBuffer()).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${rong}" height="${cao}">${lop.join("")}</svg>`) }]);
  fs.mkdirSync(path.dirname(path.resolve(ra)), { recursive: true });
  const MASK = { vom: `<path d="M0 ${cao} V${rong / 2} A${rong / 2} ${rong / 2} 0 0 1 ${rong} ${rong / 2} V${cao} Z" fill="#fff"/>`, tron: `<circle cx="${rong / 2}" cy="${cao / 2}" r="${Math.min(rong, cao) / 2}" fill="#fff"/>`, bo: `<rect width="${rong}" height="${cao}" rx="${bo}" fill="#fff"/>` };
  if (khung && MASK[khung]) { img = sharp(await img.png().toBuffer()).ensureAlpha().composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${rong}" height="${cao}">${MASK[khung]}</svg>`), blend: "dest-in" }]);
    await img.png().toFile(ra); return { rong, cao, left, top }; }
  if (cheo > 0) { img = sharp(await img.png().toBuffer()).ensureAlpha().composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${rong}" height="${cao}"><path d="M${Math.round(cheo * rong)} 0 H${rong} V${cao} H0 Z" fill="#fff"/></svg>`), blend: "dest-in" }]);
    await img.png().toFile(ra); return { rong, cao, left, top }; }
  await img.jpeg({ quality: 88, mozjpeg: true }).toFile(ra);
  return { rong, cao, left, top };
}

module.exports = { phuMau };

if (require.main === module) {
  const a = process.argv.slice(2), pos = a.filter((x) => !x.startsWith("--")), o = (k, d) => { const x = a.find((s) => s.startsWith(`--${k}=`)); return x ? x.split("=")[1] : d; };
  if (pos.length < 2) { console.error("Dùng: node scripts/phu_mau.js <vào.jpg> <ra.jpg> --rong= --cao= [--tieu=x,y] [--phu=#hex] [--tu=trai|phai|duoi|tren] [--dac=] [--den=] [--bot=]"); process.exit(2); }
  phuMau(pos[0], pos[1], { rong: +o("rong", 1920), cao: +o("cao", 1080), tieu: o("tieu", "0.5,0.5").split(",").map(Number), phu: o("phu", "#0E4F49"), tu: o("tu", ""), dac: +o("dac", 0.94), den: +o("den", 0.62), bot: +o("bot", 0), cheo: +o("cheo", 0), khung: o("khung", ""), bo: +o("bo", 40), hat: +o("hat", 0) })
    .then((r) => console.log(`✓ ${pos[1]} (${r.rong}×${r.cao}, cắt từ ${r.left},${r.top})`)).catch((e) => { console.error(e.message); process.exit(1); });
}
