#!/usr/bin/env node
// BÚT DẠ QUANG TRÊN VĂN BẢN THẬT (18/11/2026) — tìm cụm từ trong tài liệu gốc (hợp đồng, luật, bản án), cắt đúng đoạn chứa nó,
// trả về ảnh đoạn văn + toạ độ vệt dạ quang từng dòng. Slide đặt ảnh lên "tờ giấy", vệt dạ quang quét (wipe) đúng lúc người nói nhắc tới.
// Vật thật + nhấn đúng chữ = kiểu hình riêng của bài thuyết trình luật, thay cho chữ trích dẫn chép lại.
//
//   node scripts/danh_dau.js <tài_liệu.docx|.pdf> <ra.png> --cau="tự động hủy bỏ" [--cau="trừ khi có thỏa thuận khác"] [--le=1] [--them=3] [--rong=1600] [--dpi=200]
//     → <ra.png> + <ra.json>: { rong, cao, trang, vet: [[{x,y,w,h} tỉ lệ 0–1 theo ảnh, từng dòng], …] } (mỗi --cau một mục)
//   --them: lấy kèm N khối liền sau (các gạch đầu dòng liệt kê của điều khoản).
//   --le: số dòng lấy thêm trên / dưới cụm từ (mặc định: cả khối đoạn văn chứa cụm từ).
// Không thấy cụm từ → báo lỗi và in các dòng gần giống nhất (chép đúng chính tả của tài liệu: "hủy" ≠ "huỷ").
const fs = require("fs"), path = require("path"), os = require("os"), { execFileSync } = require("child_process");

const chuan = (s) => s.normalize("NFC").toLowerCase().replace(/[“”"'.,;:()!?…]/g, "");

// phân tích XHTML của pdftotext -bbox-layout → trang → khối → dòng → chữ
function docBbox(xhtml) {
  const trang = [];
  for (const p of xhtml.split(/<page /).slice(1)) {
    const [, W, H] = p.match(/width="([\d.]+)" height="([\d.]+)"/), khoi = [];
    for (const b of p.split(/<block /).slice(1)) {
      const dong = [];
      for (const l of b.split(/<line /).slice(1)) {
        const chu = [...l.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g)].map((m) => ({ x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4], t: m[5].replace(/&amp;/g, "&").replace(/&quot;/g, '"') }));
        if (chu.length) dong.push(chu);
      }
      if (dong.length) khoi.push(dong);
    }
    trang.push({ W: +W, H: +H, khoi });
  }
  return trang;
}

// tìm cụm từ (có thể vắt qua nhiều dòng trong cùng khối) → { trang, khoi, dong: [chỉ số dòng], hop: [{x0,y0,x1,y1} mỗi dòng] }
function timCau(trang, cau) {
  const muc = chuan(cau).split(/\s+/).filter(Boolean);
  for (let ti = 0; ti < trang.length; ti++) for (let ki = 0; ki < trang[ti].khoi.length; ki++) {
    const chu = trang[ti].khoi[ki].flatMap((d, di) => d.map((w) => ({ ...w, di }))), c = chu.map((w) => chuan(w.t));
    for (let i = 0; i + muc.length <= c.length; i++) {
      if (!muc.every((m, j) => c[i + j] === m)) continue;
      const trung = chu.slice(i, i + muc.length), theoDong = {};
      for (const w of trung) { const h = (theoDong[w.di] ||= { x0: w.x0, y0: w.y0, x1: w.x1, y1: w.y1 }); h.x0 = Math.min(h.x0, w.x0); h.y0 = Math.min(h.y0, w.y0); h.x1 = Math.max(h.x1, w.x1); h.y1 = Math.max(h.y1, w.y1); }
      return { trang: ti, khoi: ki, dong: Object.keys(theoDong).map(Number), hop: Object.values(theoDong) };
    }
  }
  return null;
}

function goiY(trang, cau) {   // các dòng có nhiều chữ chung nhất với cụm từ
  const muc = new Set(chuan(cau).split(/\s+/));
  return trang.flatMap((p) => p.khoi.flatMap((k) => k.map((d) => d.map((w) => w.t).join(" "))))
    .map((s) => [chuan(s).split(/\s+/).filter((w) => muc.has(w)).length, s]).sort((a, b) => b[0] - a[0]).slice(0, 3).map((x) => x[1]);
}

// vùng cắt (điểm PDF) bao trọn khối chứa các cụm từ (hoặc ± le dòng), cộng lề; vệt dạ quang quy về tỉ lệ 0–1 của vùng cắt
function vungVaVet(trang, kq, le = null, lePt = 10, leTren = 2, them = 0) {
  const p = trang[kq[0].trang], k0 = p.khoi[kq[0].khoi], phu = p.khoi.slice(kq[0].khoi + 1, kq[0].khoi + 1 + them).flat();
  const k = [...k0, ...phu];   // --them=N: lấy kèm N khối ngay sau (gạch đầu dòng, danh sách liệt kê của điều khoản)
  let d0 = 0, d1 = k.length - 1;
  if (le !== null) { const ds = kq.flatMap((r) => r.dong); d0 = Math.max(0, Math.min(...ds) - le); d1 = Math.min(k0.length - 1, Math.max(...ds) + le); }
  if (them) d1 = k.length - 1;
  const ws = k.slice(d0, d1 + 1).flat();
  const ytren = Math.min(...ws.map((w) => w.y0)), yduoi = Math.max(...ws.map((w) => w.y1));
  // lề trên / dưới không vượt nửa khoảng trống tới dòng liền kề (không dính chân / đầu dòng bên cạnh, đường kẻ phía trên)
  const ke = p.khoi[kq[0].khoi + 1 + them];   // dòng / khối liền sau vùng cắt
  const truoc = d0 > 0 ? Math.max(...k[d0 - 1].map((w) => w.y1)) : -Infinity, sau = d1 < k.length - 1 ? Math.min(...k[d1 + 1].map((w) => w.y0)) : ke ? Math.min(...ke.flat().map((w) => w.y0)) : Infinity;
  const X0 = Math.min(...ws.map((w) => w.x0)) - lePt, Y0 = Math.max(ytren - leTren, (truoc + ytren) / 2), X1 = Math.max(...ws.map((w) => w.x1)) + lePt, Y1 = Math.min(yduoi + lePt, (sau + yduoi) / 2);
  const W = X1 - X0, H = Y1 - Y0, r = (v) => +v.toFixed(4);
  return { vung: { x: X0 / p.W, y: Y0 / p.H, w: W / p.W, h: H / p.H }, trang: kq[0].trang + 1,
    vet: kq.map((q) => q.hop.map((h) => ({ x: r((h.x0 - 3 - X0) / W), y: r((h.y0 - 2 - Y0) / H), w: r((h.x1 - h.x0 + 6) / W), h: r((h.y1 - h.y0 + 4) / H) }))) };
}

async function danhDau(vao, ra, cau, { le = null, rong = 1600, dpi = 200, them = 0 } = {}) {
  const { trangGoc } = require("./trang_goc");
  let pdf = path.resolve(vao);
  if (!/\.pdf$/i.test(pdf)) { const d = fs.mkdtempSync(path.join(os.tmpdir(), "dd-")); execFileSync("soffice", ["--headless", "--convert-to", "pdf", "--outdir", d, pdf], { stdio: "ignore" }); pdf = path.join(d, path.basename(pdf).replace(/\.[^.]+$/, ".pdf")); }
  const trang = docBbox(execFileSync("pdftotext", ["-bbox-layout", pdf, "-"], { maxBuffer: 1 << 28 }).toString());
  const kq = cau.map((c) => { const r = timCau(trang, c); if (!r) throw new Error(`không thấy “${c}”. Gần nhất:\n  - ${goiY(trang, c).join("\n  - ")}`); return r; });
  if (new Set(kq.map((r) => `${r.trang}/${r.khoi}`)).size > 1) throw new Error("các cụm từ nằm ở khối / trang khác nhau — chạy riêng từng cụm");
  const v = vungVaVet(trang, kq, le, 10, 2, them);
  await trangGoc(pdf, ra, { trang: v.trang, vung: [v.vung.x, v.vung.y, v.vung.w, v.vung.h], rong, dpi });
  // bỏ đường kẻ bảng / khung ở mép trên – dưới (hàng điểm ảnh tối phủ > 50 % bề ngang): nét vẽ, không phải chữ nên toạ độ chữ không tránh được
  const sharp = require("sharp"), { data, info } = await sharp(ra).greyscale().raw().toBuffer({ resolveWithObject: true });
  const toi = (y) => { let n = 0; for (let x = 0; x < info.width; x++) if (data[y * info.width + x] < 110) n++; return n / info.width > 0.5; };
  let tren = 0, duoi = 0; const gioi = Math.round(info.height * 0.12);
  for (let y = 0; y < gioi; y++) if (toi(y)) tren = y + 2;
  for (let y = info.height - 1; y > info.height - gioi; y--) if (toi(y)) duoi = info.height - y + 1;
  if (tren || duoi) { const h0 = info.height, h1 = h0 - tren - duoi, buf = await sharp(ra).extract({ left: 0, top: tren, width: info.width, height: h1 }).png().toBuffer(); fs.writeFileSync(ra, buf);
    v.vet = v.vet.map((ds) => ds.map((q) => ({ ...q, y: +(((q.y * h0) - tren) / h1).toFixed(4), h: +((q.h * h0) / h1).toFixed(4) }))); }
  const m = await sharp(ra).metadata();
  const out = { rong: m.width, cao: m.height, trang: v.trang, cau, vet: v.vet };
  fs.writeFileSync(ra.replace(/\.png$/i, "") + ".json", JSON.stringify(out, null, 1));
  return out;
}

if (require.main === module) {
  const a = process.argv.slice(2), pos = a.filter((x) => !x.startsWith("--")), cau = a.filter((x) => x.startsWith("--cau=")).map((x) => x.slice(6));
  const f = Object.fromEntries(a.filter((x) => x.startsWith("--") && !x.startsWith("--cau=")).map((x) => { const [k, v] = x.slice(2).split("="); return [k, v ?? true]; }));
  if (pos.length < 2 || !cau.length) { console.error('Dùng: node scripts/danh_dau.js <tài_liệu> <ra.png> --cau="…" [--cau="…"] [--le=1] [--rong=1600]'); process.exit(2); }
  danhDau(pos[0], pos[1], cau, { le: f.le !== undefined ? +f.le : null, rong: +f.rong || 1600, dpi: +f.dpi || 200, them: +f.them || 0 })
    .then((r) => console.log(`✓ ${pos[1]} (${r.rong}×${r.cao}, trang ${r.trang}) — ${r.vet.map((v, i) => `“${cau[i]}”: ${v.length} dòng`).join("; ")}`))
    .catch((e) => { console.error("✗ " + e.message); process.exit(1); });
}
module.exports = { docBbox, timCau, vungVaVet, chuan };
