// BỘ HÌNH DÙNG CHUNG cho deck.js — gom các hàm nối công cụ hình vào slide (dọn skill 18/11/2026; trước đây mỗi deck chép lại).
//   const H = require("<skill>/scripts/bo_hinh.js")({ D: __dirname, P, tong: 22, chiaPhan: [13] });
//   const { A, T, lop, esc, em, canh, canhGiua, giay, nenBlob, blobSau, vongTay, iconTron, lopMui, dong, minhHoa, hangHinh, tienDo } = H;
// Quy ước thư mục bài: anh/storyset/ (minh hoạ), anh/canh/ (cảnh ghép), anh/goc/dd-*.png + .json (văn bản thật + dạ quang),
// asset/phosphor/<tên>.svg + bang-doi.json (icon hai tông), asset/hinh/ (lớp SVG sinh ra — xoá và dựng lại mỗi lần chạy).
// P cần: muc, phu, xanh, cam, camNhat, ray; tuỳ chọn: blob (nền sau minh hoạ), vienGiay (viền tờ giấy), xam (phần chưa đạt của thanh tiến độ).
// Cách phối các công cụ: references/nguon-hinh.md mục "Bộ công cụ hình".
const fs = require("fs"), path = require("path");
const { blob } = require("./blob"), { khoanh } = require("./ve_tay"), { iconDuo } = require("./icon_duo"), { hangHinh } = require("./hinh_dem");

module.exports = function boHinh({ D, P, tong = 0, chiaPhan = [], iconNet = null }) {
  const ghi = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
  fs.rmSync(path.join(D, "asset", "hinh"), { recursive: true, force: true });
  let nL = 0;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const em = (s) => esc(s).replace(/\[(\d+)\]/g, "&#91;$1&#93;").replace(/\[([^\]]+)\]/g, "<em>$1</em>");   // [từ] = nhấn; [12] = số tài liệu nguồn, giữ nguyên
  const A = (a, at, dur = 500) => `data-a="${a}" data-at="${at}" data-dur="${dur}"`;
  const lop = (body, x, y, w, h, alt, loai = "hoa-tiet", ex = "") => { const f = `l${String(++nL).padStart(2, "0")}.svg`;
    ghi(path.join(D, "asset", "hinh", f), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${body}</svg>`);
    return `<img data-l="lop-${nL}" data-loai="${loai}" data-alt="${esc(alt)}" ${ex} src="asset/hinh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
  const T = (cls, x, y, w, s, ex = "") => `<div class="${cls}" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</div>`;
  const doc = (thuMuc, f) => fs.readFileSync(path.join(D, ...thuMuc, f), "utf8");

  // thanh tiến độ ở đáy: phần đã qua tô màu nhấn, khe trắng ở ranh giới các phần (chiaPhan = số slide cuối của mỗi phần)
  const tienDo = (n, X = 120, W = 1680, H = 12, Y = 1022) => { const toi = X + Math.round((W * n) / tong);
    return `<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="${H / 2}" fill="${P.xam || "#DADFE2"}"/><rect x="${X}" y="${Y}" width="${toi - X}" height="${H}" rx="${H / 2}" fill="${P.cam}"/>`
      + chiaPhan.map((c) => `<rect x="${X + Math.round((W * c) / tong) - 4}" y="${Y - 4}" width="8" height="${H + 8}" fill="#FFFFFF"/>`).join(""); };
  // minh hoạ Storyset (anh/storyset/<f>.svg, khung vuông)
  const minhHoa = (f, x, y, w, alt, t0 = 300) => `<img data-l="mh-${f}" data-loai="minh-hoa" data-alt="${esc(alt)}" ${A("fade", t0, 700)} src="anh/storyset/${f}.svg" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${w}px">`;
  // cảnh / nhân vật ghép (scripts/ghep_canh.js → anh/canh/<f>.svg): đặt theo chiều cao, rộng theo viewBox
  const tiLe = (f) => { const [, , vw, vh] = doc(["anh", "canh"], f + ".svg").match(/viewBox="([^"]+)"/)[1].split(" ").map(Number); return vw / vh; };
  const canh = (f, x, y, h, alt, t0 = 300, hieu = "fade") => `<img data-l="canh-${f}" data-loai="minh-hoa" data-alt="${esc(alt)}" ${A(hieu, t0, 600)} src="anh/canh/${f}.svg" style="position:absolute;left:${x}px;top:${y}px;width:${Math.round(h * tiLe(f))}px;height:${h}px">`;
  const canhGiua = (f, cx, y, h, alt, t0, hieu) => canh(f, Math.round(cx - (h * tiLe(f)) / 2), y, h, alt, t0, hieu);
  // văn bản thật trên tờ giấy + vệt dạ quang quét theo nhịp nói (scripts/danh_dau.js → anh/goc/<f>.png + .json); tVet[i] = thời điểm cụm từ i
  const giay = (f, x, y, w, alt, t0, tVet) => { const j = JSON.parse(doc(["anh", "goc"], f + ".json")), h = Math.round((w * j.cao) / j.rong), p = 36, X = x - p, Y = y - p, W = w + 2 * p, H = h + 2 * p, g = 44, vg = P.vienGiay || "#C9D1D6";
    return lop(`<path d="M${X} ${Y} H${X + W - g} L${X + W} ${Y + g} V${Y + H} H${X} Z" fill="#FFFFFF" stroke="${vg}" stroke-width="3"/><path d="M${X + W - g} ${Y} V${Y + g} H${X + W} Z" fill="${P.ray}" stroke="${vg}" stroke-width="3" stroke-linejoin="round"/>`, X - 2, Y - 2, W + 4, H + 4, "Tờ giấy nền của trích đoạn", "hoa-tiet", A("rise", t0, 500))
      + `<img data-l="tl-${f}" data-loai="tai-lieu" data-alt="${esc(alt)}" ${A("fade", t0 + 200, 500)} src="anh/goc/${f}.png" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`
      + j.vet.map((ds, i) => ds.map((v) => { const vx = Math.round(x + v.x * w), vy = Math.round(y + v.y * h), vw = Math.round(v.w * w), vh = Math.round(v.h * h);
        return lop(`<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" rx="4" fill="${P.cam}" fill-opacity="0.38"/>`, vx, vy, vw, vh, `Vệt dạ quang: ${j.cau[i]}`, "net", A("wipe", tVet[i], 600)); }).join("")).join(""); };
  // mảng nền hữu cơ sau minh hoạ (một màu nhạt cho cả deck)
  const nenBlob = (cx, cy, rx, ry, hat, t0 = 200, mau = P.blob || "#E8F3E2") => lop(`<path d="${blob(cx, cy, rx, ry, { hat })}" fill="${mau}"/>`, Math.round(cx - rx * 1.3), Math.round(cy - ry * 1.3), Math.round(rx * 2.6), Math.round(ry * 2.6), "Mảng nền sau minh hoạ", "hoa-tiet", A("fade", t0, 500));
  const blobSau = (x, y, w, hat, t0) => nenBlob(x + w / 2, y + w * 0.5, w * 0.4, w * 0.34, hat, t0);
  // nét khoanh tay: ≤ 1 / slide, đặt TRƯỚC hộp chữ trong mã (nằm dưới chữ)
  const vongTay = (cx, cy, rx, ry, hat, t0, alt) => lop(khoanh(cx, cy, rx, ry, { hat, mau: P.cam }), Math.round(cx - rx * 1.15), Math.round(cy - ry * 1.25), Math.round(rx * 2.3), Math.round(ry * 2.5), alt, "net", A("wipe", t0, 700));
  // icon hai tông trong vòng tròn: asset/phosphor/bang-doi.json đổi tên icon → tên Phosphor; mảng phụ theo màu nền tròn
  const fDoi = path.join(D, "asset", "phosphor", "bang-doi.json"), DOI = fs.existsSync(fDoi) ? JSON.parse(fs.readFileSync(fDoi, "utf8")) : {};
  const phuCua = (nen) => (nen === P.cam ? "#FFFFFF" : nen === P.camNhat ? P.cam : P.xanh);
  const iconTron = (ic, cx, cy, r, alt, ex = "", nen = P.cam) => lop(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${nen}"/>`
    + (DOI[ic] ? iconDuo(doc(["asset", "phosphor"], DOI[ic] + ".svg"), cx, cy, r * 1.2, { chinh: P.muc, phu: phuCua(nen) }) : iconNet ? iconNet(D, ic, cx, cy, r * 1.05, P.muc, 3.2) : ""), cx - r, cy - r, 2 * r, 2 * r, alt, "net", ex);
  // mũi tên thẳng có đầu tam giác
  const muiTen = (x1, y1, x2, y2, mau = P.phu, net = 4, dash = "") => { const a = Math.atan2(y2 - y1, x2 - x1), h = 20, q = (d) => `${Math.round(x2 - h * Math.cos(a + d))},${Math.round(y2 - h * Math.sin(a + d))}`;
    return `<path d="M${x1} ${y1} L${Math.round(x2 - 12 * Math.cos(a))} ${Math.round(y2 - 12 * Math.sin(a))}" stroke="${mau}" stroke-width="${net}" ${dash ? `stroke-dasharray="${dash}"` : ""}/><polygon points="${x2},${y2} ${q(-0.45)} ${q(0.45)}" fill="${mau}"/>`; };
  const lopMui = (x1, y1, x2, y2, alt, ex = "", mau, dash) => lop(muiTen(x1, y1, x2, y2, mau, 4, dash), Math.min(x1, x2) - 22, Math.min(y1, y2) - 22, Math.abs(x2 - x1) + 44, Math.abs(y2 - y1) + 44, alt, "net", ex);
  // một dòng gạch: icon nhỏ trong tròn + chữ
  const dong = (ic, x, y, w, s, t0, nen = "#DDEFD5", cls = "gach") => iconTron(ic, x + 26, y + 22, 26, "Biểu tượng " + s.replace(/\[|\]/g, ""), A("pop", t0, 300), nen) + T(cls, x + 68, y, w - 68, s, A("fade", t0 + 80, 300));

  return { soLop: () => nL, ghi, esc, em, A, lop, T, tienDo, minhHoa, canh, canhGiua, giay, nenBlob, blobSau, vongTay, iconTron, muiTen, lopMui, dong, hangHinh, iconDuo, khoanh, blob };
};
