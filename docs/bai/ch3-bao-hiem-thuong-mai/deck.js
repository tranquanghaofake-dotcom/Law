// Deck Chương 3 — hướng "TƯ VẤN PHÁP LÝ" (skill slide-chuan, references/bo-cuc.md mục 6–9):
//   ảnh Unsplash + tranh tư liệu (cắt khung vòm / tròn / chéo, cùng một cách chỉnh màu) · minh hoạ unDraw tô lại màu + vật phẳng tự vẽ (minh-hoa.js)
//   · nền theo vai · khối thông tin tô đặc · tiêu đề Lora có từ khoá màu · mỗi phần một slide hero · hiệu ứng xuất hiện + chuyển cảnh (không Morph).
// Nội dung: kich-ban.md + noi-dung.md (đã đối chiếu luật). Ghi chú người nói: notes-cu.json (đánh số theo slide cũ).
//   node deck.js && node ../../../.claude/skills/slide-chuan/scripts/dung.js . --ten=bao-hiem-thuong-mai
const fs = require("fs"), path = require("path");
const D = __dirname, N = require("./notes-cu.json");
const SUA = { 22: "Định nghĩa theo Điều 4 Luật 2022: khoản 24 bên mua bảo hiểm, khoản 25 người được bảo hiểm, khoản 26 người thụ hưởng. Bên mua và người được bảo hiểm có thể là hai người: bố mẹ (bên mua) mua bảo hiểm nhân thọ cho con (người được bảo hiểm). Tự mua cho mình thì một người giữ cả hai vai. Ví dụ do người soạn thêm.",
  26: "p = f + d theo bài giảng. Định nghĩa phí bảo hiểm theo khoản 28 Điều 4 Luật 2022.",
  37: "Con số 70 %, 85 %, phí 100 / bồi thường 80 chỉ minh hoạ (người soạn thêm). Thanh tính trên phí cả kỳ = 100 %; giới hạn trách nhiệm của DN nhận tái tới 85 %, phần trên 85 % trở lại DN nhượng. Bài giảng: công ty nhượng tái chịu bồi thường khi tỷ lệ bồi thường của toàn bộ nghiệp vụ nhỏ hơn hoặc bằng tỷ lệ nhất định; phần tỷ lệ thực tế vượt tỷ lệ giữ lại chuyển cho công ty nhận tái." };
SUA[23] = `${N[23] || ""} Cách đếm 15 ngày: ngày DNBH nhận đủ hồ sơ hợp lệ không tính, ngày 1 là hôm sau (khoản 3 Điều 147 BLDS 2015).`.trim();
const nc = (k) => SUA[k] || N[k] || "";   // dự phòng khi kich-ban.md chưa có cột lời nói
// lời nói: kich-ban.md là NGUỒN DUY NHẤT (skill slide-chuan, quy-trinh.md mục 3) — cột "Lời nói" theo số slide; sửa lời ở kịch bản, không ở đây
const LOI_NOI = (() => { const f = path.join(D, "kich-ban.md"), m = {}; if (!fs.existsSync(f)) return m; let cot = -1;
  for (const d of fs.readFileSync(f, "utf8").split("\n")) { if (!d.startsWith("|")) continue;
    const c = d.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((x) => x.trim().replace(/\\\|/g, "|"));
    if (cot < 0) { cot = c.findIndex((x) => /^lời nói/i.test(x)); continue; } if (/^\d+$/.test(c[0])) m[+c[0]] = c[cot] === "—" ? "" : c[cot]; }
  return m; })();
const ghi = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
fs.rmSync(path.join(D, "asset", "hinh"), { recursive: true, force: true });   // sơ đồ nét sinh lại mỗi lần dựng
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const em = (s) => esc(s).replace(/\[([^\]]+)\]/g, "<em>$1</em>").replace(/\{([^}]+)\}/g, '<em class="v">$1</em>');
const cap = (kt, km, x, y, w, a, b) => `<div class="cap" style="left:${x}px;top:${y}px;width:${w}px"><b data-t class="${kt}">${em(a)}</b><span data-t class="${km}">${em(b)}</span></div>`;
{
  const mh = require("./minh-hoa.js"), P = mh.P, S2 = [], TONG = 46, PANEL = 720;
  let nL = 0;
  const A = (a, at, dur = 500) => `data-a="${a}" data-at="${at}" data-dur="${dur}"`;
  const lop = (body, x, y, w, h, alt, loai = "phang", ex = "") => { const f = `l${String(++nL).padStart(2, "0")}.svg`;
    ghi(path.join(D, "asset", "hinh", f), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${body}</svg>`);
    return `<img data-l="lop-${nL}" data-loai="${loai}" data-alt="${esc(alt)}" ${ex} src="asset/hinh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
  const ud = (ten, x, y, w, alt, ex = "", doi = {}) => { const r = mh.unDraw(D, ten, x, y, w, doi); return lop(r.svg, x, y, w, Math.ceil(r.h), alt, "undraw", ex); };
  const udH = (ten, w) => mh.unDraw(D, ten, 0, 0, w).h;
  const chup = (f, x, y, w, h, alt, ex = "") => `<img data-l="anh-${f.replace(/\W/g, "")}" data-loai="anh-chup" data-alt="${esc(alt)}" ${ex} src="anh/unsplash/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`;
  const nen = (body) => lop(body, 0, 0, 1920, 1080, "Hình trang trí", "nen");
  const T = (cls, x, y, w, s, ex = "") => `<div class="${cls}" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</div>`;
  const G = (cls, x, y, w, h, html, ex = "") => `<div class="${cls} giua" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${html}</div>`;
  const chip = (s, x = 120, y = 80, cls = "chip", ex = "") => `<div class="${cls}" data-t data-l="c${++nL}" data-alt="Nhãn ${esc(s)}" ${ex} style="left:${x}px;top:${y}px">${esc(s)}</div>`;   // data-t + data-l: nền là lớp ảnh, chữ là hộp chữ — không mất nền khi nằm trên ảnh
  const khoi = (x, y, w, h, cls, alt, ex = "", st = "") => `<div class="${cls}" data-l="k${++nL}" data-alt="${esc(alt)}" ${ex} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px${st}"></div>`;   // thẻ nền thành lớp riêng để hiện có hiệu ứng
  const dau = (kk, td, dan, so, x = 120, w = 1500) => chip(kk, x, 80, "chip", A("fade", 0, 400)) + `<h1 class="td" data-t data-tieu-de ${A("rise", 100, 600)} style="left:${x}px;top:132px;width:${w}px">${em(td)}</h1>` + (dan ? T("dan", x, 246, w + 60, dan, A("fade", 350, 500)) : "") + T("so-trang", 1600, 84, 200, `${so} / ${TONG}`);
  const dauToi = (kk, td, dan, so, x = 120, w = 1500) => chip(kk, x, 80, "chip vang", A("fade", 0, 400)) + `<h1 class="td sang" data-t data-tieu-de ${A("rise", 100, 600)} style="left:${x}px;top:132px;width:${w}px">${em(td)}</h1>` + (dan ? T("dan sang", x, 246, w + 60, dan, A("fade", 350, 500)) : "") + T("so-trang sang", 1600, 84, 200, `${so} / ${TONG}`);
  const sec2 = (mau, kieu, notes, inner, { ex = "", trans = "fade", dur = 600 } = {}) => S2.push(`<section class="s ${kieu}" data-mau="${mau}" data-nen="${kieu}" ${ex} data-trans="${trans}" data-dur="${dur}" data-notes="${esc(LOI_NOI[S2.length + 1] ?? notes)}">\n${inner}\n</section>`);
  const NEN = {
    tron: () => `<circle cx="1920" cy="0" r="300" fill="${P.x4}"/>` + mh.cham(1660, 960, 6, 2, 26, 5, P.v2),
    goc: () => `<circle cx="0" cy="1080" r="110" fill="${P.x4}"/><circle cx="1920" cy="0" r="110" fill="${P.v4}"/>`,
    dat: (y0) => `<rect x="0" y="${y0}" width="1920" height="${1080 - y0}" fill="${P.x4}"/>` + mh.cham(1700, 150, 5, 3, 26, 5, P.v2),
  };

  const G_BIA = () => {
  // ---- 1 BÌA — ảnh thật cắt chéo + thẻ nổi ----
  const vom = (x, y, w, h) => `M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h} Z`;
  sec2("bia", "sang", nc(1), nen(`<path d="${vom(1080, 160, 760, 900)}" fill="${P.x4}"/>` + mh.cham(120, 1000, 6, 2, 26, 5, P.v2) + mh.cham(1800, 90, 4, 4, 26, 5, P.v2) + mh.saoCum(940, 220, 28))
    + lop(`<path d="${vom(996, 86, 808, 948)}" fill="none" stroke="${P.v2}" stroke-width="6"/>`, 990, 80, 820, 960, "Viền vòm vàng bao quanh ảnh", "phang", A("fade", 500, 700))
    + chup("bia-vom.png", 1020, 110, 760, 900, "Ảnh: bàn tay nâng một ngôi nhà mô hình — bảo hiểm che chở tài sản", A("rise", 0, 900))
    + khoi(880, 850, 580, 150, "the-noi", "Thẻ nổi", A("rise", 1400, 600)) + lop(`<rect x="910" y="880" width="90" height="90" rx="18" fill="${P.x1}"/>` + mh.khien(955, 925, 62, { trai: P.v2, phai: P.v3, dau: P.x1 }), 910, 880, 90, 90, "Biểu tượng khiên", "phang", A("pop", 1600, 400))
    + T("noi-t", 1030, 880, 410, "Chuyển giao rủi ro", A("fade", 1700, 400)) + T("noi-m", 1030, 926, 410, "tài chính qua hợp đồng", A("fade", 1800, 400))
    + chip("BNK405 · Nghiệp vụ bảo hiểm", 120, 240, "chip", A("fade", 300, 400)) + T("bia-chuong", 120, 318, 700, "Chương 3", A("rise", 450, 500))
    + `<h1 class="bia-td" data-t data-tieu-de ${A("rise", 600, 700)} style="left:116px;top:388px;width:780px">${em("Bảo hiểm [thương mại]")}</h1>`
    + `<div class="gach" data-l="gach-bia" data-alt="Gạch vàng" ${A("wipe", 1000, 400)} style="left:120px;top:720px;width:150px;height:12px"></div>` + T("bia-mo", 120, 768, 720, "Khái niệm · Phân loại · Hợp đồng · Tái bảo hiểm", A("fade", 1100, 500)) + T("bia-by", 120, 930, 640, "GV Nguyễn Thị Thu Hằng · 120 phút", A("fade", 1200, 500)));

  };
  const G_SODO = () => {
  // ---- 3 SƠ ĐỒ — người mua ↔ hợp đồng ↔ DNBH, từng bước hiện ----
  { const G0 = 830, hn = udH("legal-counsel_kdnh", 380), hh = udH("handshake-deal_nwk6", 380);
    sec2("noi-dung", "sang", nc(8), nen(NEN.dat(G0))
      + dau("3.1 · Khái niệm", "BHTM: [chuyển rủi ro] qua hợp đồng", "Phí trả chắc chắn; bồi thường chỉ khi rủi ro xảy ra.", 8)
      + lop(mh.mayMua(440, 362, 180), 330, 296, 230, 160, "Minh hoạ: đám mây mưa có tia sét trên đầu người mua — rủi ro có thể xảy ra", "phang", `${A("drop", 450, 600)} data-em="teeter" data-emat="1300"`)
      + ud("legal-counsel_kdnh", 150, Math.round(G0 - hn), 380, "Minh hoạ: người mua bảo hiểm cầm giấy yêu cầu", A("slide", 600, 600))
      + ud("handshake-deal_nwk6", 770, Math.round(665 - hh / 2), 380, "Minh hoạ: cái bắt tay trên bản hợp đồng — giao kết hợp đồng bảo hiểm", A("pop", 1000, 500))
      + lop(`<rect x="1370" y="${G0 - 4}" width="340" height="14" rx="7" fill="${P.x3}"/>` + mh.toaVP(1540, G0, 290), 1360, 400, 360, 450, "Minh hoạ: toà văn phòng doanh nghiệp bảo hiểm có huy hiệu ô", "phang", A("slide-r", 1400, 600))
      + lop(mh.muiKhoi(620, 1340, 490, 30), 610, 450, 740, 80, "Mũi tên: phí bảo hiểm đi từ bên mua tới doanh nghiệp bảo hiểm", "phang", A("wipe", 1800, 600)) + chip("Phí · luôn trả", 880, 384, "chip", A("fade", 2100, 400))
      + lop(mh.muiKhoi(1340, 620, 890, 30, { vien: P.v1, dut: true, nen: P.v4 }) + `<circle cx="680" cy="975" r="40" fill="${P.d4}"/>` + mh.lua(680, 1004, 58), 610, 850, 740, 180, "Mũi tên đứt: bồi thường chỉ khi rủi ro đã thoả thuận xảy ra", "phang", A("wipe-r", 2500, 600))
      + T("nhan-vang", 740, 924, 560, "Bồi thường", A("fade", 2800, 400)) + T("dk-vang", 740, 972, 560, "khi rủi ro được bảo hiểm xảy ra", A("fade", 2900, 400))
      + `<div class="cap" style="left:180px;top:850px;width:360px"><b data-t class="la-t" ${A("fade", 900, 400)}>Bên mua bảo hiểm</b><span data-t class="la-m" ${A("fade", 1000, 400)}>trả phí</span></div>`
      + `<div class="cap" style="left:1360px;top:850px;width:360px"><b data-t class="la-t" ${A("fade", 1700, 400)}>Doanh nghiệp bảo hiểm</b><span data-t class="la-m" ${A("fade", 1800, 400)}>cam kết bồi thường</span></div>`, { ex: "data-khong-hinh data-hero" });
  }

  };
  const G_SOLON = () => {
  // ---- 4 SỐ LỚN — lịch 15 ô: ngày 1 nhận đủ hồ sơ → ngày 15 hạn trả tiền ----
  { const cw = 162, ch = 132, g = 12, x0 = 140, y0 = 452;
    const o = (k) => ({ x: x0 + (k % 5) * (cw + g), y: y0 + Math.floor(k / 5) * (ch + g) });
    sec2("so-lon", "sang", nc(23), nen(NEN.tron())
      + dau("3.3 · Nghĩa vụ của DNBH", "Giải thích rõ, [bồi thường đúng hạn]", "Ngày nhận đủ hồ sơ hợp lệ không tính (khoản 3 Điều 147 BLDS).", 24)
      + khoi(136, 336, 900, 640, "bong", "Bóng tờ lịch", A("pop", 400, 500)) + khoi(120, 320, 900, 640, "the-trang lich", "Tờ lịch", A("pop", 400, 500)) + khoi(120, 320, 900, 110, "dau-xanh", "Đầu tờ lịch", A("pop", 400, 500))
      + `<div class="lich-so" data-t data-dl ${A("rise", 700, 500)} style="left:150px;top:326px;width:840px">15 ngày <span class="lich-m">nếu không thoả thuận</span></div>`
      + [0, 1, 2].map((hang) => lop([0, 1, 2, 3, 4].map((c) => { const k = hang * 5 + c, q = o(k), dau = k === 0, cuoi = k === 14;
          return `<rect x="${q.x}" y="${q.y}" width="${cw}" height="${ch}" rx="14" fill="${dau ? P.x1 : cuoi ? P.v2 : P.v4}"/>` + (dau ? `<circle cx="${q.x + cw / 2}" cy="${q.y + ch / 2}" r="9" fill="${P.v3}"/>` : cuoi ? mh.iconNet(D, "coins", q.x + cw / 2, q.y + ch / 2 + 10, 56, P.x1, 3) : `<circle cx="${q.x + cw / 2}" cy="${q.y + ch / 2}" r="7" fill="${P.v2}"/>`); }).join(""),
          x0, y0 + hang * (ch + g), 5 * (cw + g), ch, `Hàng ${hang + 1} của 15 ô ngày`, "phang", A("wipe", 1100 + hang * 300, 500))).join("")
      + T("lich-o", o(0).x + 14, o(0).y + 8, 60, "1", A("fade", 1100, 300)) + T("lich-o toi", o(14).x + 14, o(14).y + 8, 80, "15", A("fade", 1700, 300))
      + T("lich-nhan", 140, 896, 420, "Ngày 1: hôm sau", A("fade", 2000, 400)) + T("lich-nhan vang", 590, 896, 420, "Ngày 15: hạn trả", A("fade", 2100, 400))
      + [["file-certificate", P.x1, "Khi giao kết", "giải thích loại trừ"], ["calendar", P.x1, "Khi xảy ra", "trả đúng hạn"], ["coins", P.v1, "Chậm trả", "trả thêm lãi"]].map(([i, m, a, b], k) => { const y = 360 + k * 190, t0 = 2300 + k * 300;
        return lop(`<rect x="1100" y="${y}" width="100" height="100" rx="18" fill="${m}"/>` + mh.iconNet(D, i, 1150, y + 50, 60, P.nen, 3), 1100, y, 100, 100, `Biểu tượng ${a}`, "phang", `data-lap ${A("pop", t0, 400)}`)
          + `<div class="cap" style="left:1230px;top:${y + 2}px;width:570px"><b data-t class="dong-t" ${A("fade", t0 + 100, 400)}>${esc(a)}</b><span data-t class="dong-m" ${A("fade", t0 + 200, 400)}>${esc(b)}</span></div>` + (k ? `<div class="vach" style="left:1100px;top:${y - 36}px;width:700px"></div>` : ""); }).join("")
      + T("nguon", 120, 1000, 1680, "Luật KDBH 08/2022/QH15: Điều 20 khoản 2 điểm b, đ (giải thích, trả đúng hạn); Điều 31 (thời hạn, lãi chậm trả)."));
  }

  };
  const G_BANG = () => {
  // ---- 5 BẢNG — bốn trường hợp; mỗi hàng hiện lần lượt, thanh so sánh trong ô ----
  { const R = [["Đúng giá trị", P.x1, [340], "Theo thiệt hại thực tế"], ["Dưới giá trị", P.x1, [204], "Theo tỷ lệ STBH / giá trị"], ["Trên giá trị", P.x1, [440], "Tối đa bằng giá trị; hoàn phí vượt"], ["Bảo hiểm trùng", P.x1, [200, 236], "Chia theo tỷ lệ STBH"]];
    const y0 = 400, HR = [128, 200, 128, 128], X = 440, YS = HR.map((h, k) => y0 + HR.slice(0, k).reduce((a, v) => a + v, 0));
    sec2("bang", "sang", nc(25), nen(NEN.dat(760))
      + dau("3.3 · So STBH với giá trị", "Bốn trường hợp, [bốn cách bồi thường]", "Cùng ngôi nhà, khai STBH khác nhau thì bồi thường khác nhau.", 26)

      + khoi(120, 330, 1680, 62, "bh", "Đầu bảng", A("wipe", 500, 500))
      + [["Trường hợp", 140, 240], ["Giá trị và số tiền bảo hiểm (STBH)", 440, 580], ["Bồi thường", 1040, 600]].map(([s, x, w]) => G("bh-t", x, 330, w, 62, esc(s), A("fade", 700, 300))).join("")
      + R.map(([ten, m, st, bt], k) => { const y = YS[k], hr = HR[k], t0 = 0, K = (a, at, dur) => A(a, at, dur) + ` data-click="${k + 1}"`, yb = y + (k === 1 ? 30 : 34);
        let bars = `<rect x="${X}" y="${yb}" width="340" height="28" rx="5" fill="${P.x1}"/>`, x = X; st.forEach((v, j) => { bars += `<rect x="${x}" y="${yb + 38}" width="${v}" height="28" rx="5" fill="${j ? P.v3 : P.v2}"/>`; x += v + 4; });
        if (st[0] > 340 || st.length > 1) bars += `<path d="M${X + 340} ${yb - 10} V${yb + 72}" stroke="${P.phu}" stroke-width="3" stroke-dasharray="6 5"/>`;
        return khoi(120, y, 1680, hr - 8, `hang${k === 1 ? " nhan" : ""}`, `Hàng ${ten}`, K("rise", t0, 450)) + khoi(120, y, 260, hr - 8, "tab", `Nhãn ${ten}`, K("rise", t0, 450), `;background:${m}`)
          + G("tab-t", 140, y, 220, hr - 8, esc(ten), K("rise", t0, 450))
          + lop(bars, 430, y, 560, hr - 8, `Thanh so sánh: ${ten}`, "phang", K("wipe", t0 + 200, 500))
          + (k !== 1 ? T("tren-thanh", 790, yb - 2, 120, "giá trị", K("fade", t0 + 500, 300)) + T("tren-thanh vang", X + st.reduce((a, v) => a + v + 4, 0) + 8, yb + 36, 120, "STBH", K("fade", t0 + 550, 300)) : "")
          + (k === 1 ? T("tren-thanh", 790, yb - 2, 120, "1 tỷ", K("fade", t0 + 500, 300)) + T("tren-thanh vang", 654, yb + 36, 140, "600 tr", K("fade", t0 + 550, 300))
              + G("o-t", 1040, y + 6, 740, 80, esc(bt), K("fade", t0 + 300, 400)) + `<div class="vd-ct" data-t ${K("rise", t0 + 700, 500)} style="left:1040px;top:${y + 100}px;width:740px">Thiệt hại <span class="d">200</span>: <b>600</b> / 1.000 × <span class="d">200</span> = <i>120 triệu</i></div>`
              : G("o-t", 1040, y, 740, hr - 8, esc(bt), K("fade", t0 + 300, 400))); }).join("")
      + T("nguon", 120, 1000, 1680, "Luật KDBH 08/2022/QH15: đúng giá trị — Điều 16 khoản 3 · dưới — Điều 48 · trên — Điều 47 · trùng — Điều 49."), { ex: "data-khong-hinh" });
  }

  };
  const G_TRICH = () => {
  // ---- 6 TRÍCH LUẬT — HERO: ảnh ký hợp đồng tràn mép, dải màu chủ phủ trái, câu trích chữ sáng ----
  sec2("trich", "anh", nc(20), chup("trich-full.jpg", 0, 0, 1920, 1080, "Ảnh: bàn tay ký vào bản hợp đồng, phủ dải màu chủ bên trái", A("fade", 0, 900))
    + chip("3.3 · Khái niệm", 120, 80, "chip vang", A("fade", 200, 400)) + `<h1 class="td sang" data-t data-tieu-de ${A("rise", 300, 600)} style="left:120px;top:132px;width:1100px">${em("Bên mua [đóng phí], DNBH {bồi thường} theo hợp đồng")}</h1>` + chip(`21 / ${TONG}`, 1690, 80, "chip")
    + lop([0, 70].map((d) => `<circle cx="${138 + d}" cy="400" r="26" fill="${P.v2}"/><path d="M${112 + d} 400 Q${108 + d} 350 ${152 + d} 332 L${156 + d} 344 Q${130 + d} 358 ${136 + d} 390 Z" fill="${P.v2}"/>`).join(""), 100, 322, 160, 110, "Dấu ngoặc kép", "phang", `data-lap ${A("pop", 700, 400)}`)
    + `<div class="trich sang" data-t data-trich ${A("fade", 900, 900)} style="left:176px;top:450px;width:940px">Hợp đồng bảo hiểm là sự thoả thuận giữa bên mua bảo hiểm và doanh nghiệp bảo hiểm, …, theo đó bên mua bảo hiểm phải <mark class="xanh">đóng phí bảo hiểm</mark>, doanh nghiệp bảo hiểm, … phải <mark>bồi thường, trả tiền bảo hiểm</mark> theo thỏa thuận trong hợp đồng.</div>`
    + chip("Khoản 16 Điều 4 · Luật KDBH 08/2022/QH15", 180, 880, "chip vien", A("rise", 1700, 400)) + T("dan sang", 178, 950, 940, "Hợp đồng phải lập thành văn bản (Điều 18).", A("fade", 1900, 400)), { ex: "data-hero" });

  };
  const G_SOSANH = () => {
  // ---- 7 SO SÁNH — hai thẻ, đầu thẻ có minh hoạ unDraw ----
  { const H = [["Vì sao có", "Bảo vệ lợi ích công cộng", "Theo nhu cầu người mua"], ["Ví dụ", "TNDS chủ xe cơ giới, cháy nổ, xây dựng…", "Nhân thọ, sức khoẻ, vật chất xe…"], ["Lưu ý", "Không từ chối người đủ điều kiện", "Tự chọn sản phẩm và mức"]];
    sec2("so-sanh", "sang", nc(16), nen(NEN.dat(700))
      + dau("3.2 · Theo tính chất pháp lý", "Bắt buộc [do luật], tự nguyện [do nhu cầu]", "Bắt buộc chỉ gồm các loại luật liệt kê.", 17)
      + [[120, "dau-xanh", "Bảo hiểm bắt buộc", 1, "", "Minh hoạ: văn bản luật có dấu đỏ và búa — bảo hiểm do luật buộc", {}], [990, "dau-vang", "Bảo hiểm tự nguyện", 2, "choose_5kz4", "Minh hoạ: phiếu tự chọn có hai ô đã tích và cây bút — bảo hiểm do người mua tự chọn", { "#6c63ff": P.x1 }]].map(([x, cls, ten, c, u, alt, doi]) => { const t0 = c === 1 ? 500 : 900;
        return khoi(x + 14, 344, 810, 650, "bong", "Bóng thẻ", A("rise", t0, 500)) + khoi(x, 330, 810, 650, "the-trang", `Thẻ ${ten}`, A("rise", t0, 500)) + khoi(x, 330, 810, 190, cls, `Đầu thẻ ${ten}`, A("rise", t0, 500))
          + (c === 2 ? lop(`<g transform="rotate(5 ${x + 658} 425)">${mh.phieu(x + 600, 356, 116)}</g>` + mh.but(x + 706, 474, 120, -50), x + 500, 330, 300, 190, alt, "phang", A("pop", t0 + 300, 500)) : lop(`<g transform="rotate(-6 ${x + 600} 430)">${mh.hopDong(x + 540, 340, 130, { bar: false })}</g>` + mh.bua(x + 720, 450, 150, { dau: P.v3, soc: P.v2, vet: P.x3 }), x + 500, 330, 300, 190, alt, "phang", A("pop", t0 + 300, 500))) + T(`the-td${c === 2 ? " toi" : ""}`, x + 40, 392, 480, ten, A("fade", t0 + 200, 400))
          + H.map((h, k) => `${T("the-nhan", x + 40, 550 + k * 145, 730, h[0], A("fade", t0 + 500 + k * 200, 300))}${T("the-chu", x + 40, 586 + k * 145, 730, h[c], A("fade", t0 + 550 + k * 200, 400))}${k ? khoi(x + 40, 536 + k * 145, 730, 2, "vach", "Vạch kẻ", A("fade", t0 + 450 + k * 200, 300)) : ""}`).join(""); }).join("")
      + T("nguon", 120, 1012, 1680, "Luật KDBH 08/2022/QH15: Điều 8 khoản 1 (vì sao có), khoản 2 (danh mục), khoản 4 (không được từ chối)."));
  }

  };
  const MP01 = () => mMoPhan("01", "Khái niệm và nguyên tắc", "BHTM là gì — và năm nguyên tắc giữ cho nó vận hành.", "mo-phan-tron.png", "Ảnh: người cầm chiếc ô vàng dưới mưa — che chắn rủi ro", ["Số đông", "Rủi ro bảo hiểm", "Quyền lợi bảo hiểm", "Phân tán rủi ro", "Trung thực tuyệt đối"], nc(5));
  // =================== BỐ CỤC MẪU DÙNG LẶP ===================
  const chipsRow = (ds, y0 = 830, x0 = 120, xMax = 800, t0 = 1000) => { let x = x0, y = y0, o = "";
    ds.forEach((s, k) => { const w = Math.round(s.length * 16 + 36); if (x + w > xMax) { x = x0; y += 68; } o += chip(s, x, y, "chip vang nt", A("rise", t0 + k * 120, 400)); x += w + 16; }); return o; };
  // mở phần: ô số vàng, tiêu đề, mô tả, chip nội dung; ảnh khung tròn + mảng tròn + vòng vàng (đẩy sang)
  const mMoPhan = (so, ten, mo, anh, alt, chips, notes) => sec2("mo-phan", "dam", notes, nen(mh.cham(120, 96, 5, 3, 26, 5, P.v2))
    + lop(`<circle cx="1480" cy="580" r="470" fill="${P.x2}"/>`, 1010, 110, 910, 940, "Mảng tròn sau ảnh", "phang", A("grow", 0, 700))
    + chup(anh, 1000, 110, 860, 860, alt, A("pop", 200, 800))
    + lop(`<circle cx="1430" cy="540" r="462" fill="none" stroke="${P.v2}" stroke-width="6"/>` + mh.saoCum(990, 860, 26, P.v3), 960, 70, 940, 950, "Vòng vàng quanh ảnh", "phang", `data-lap ${A("fade", 700, 600)}`)
    + khoi(120, 190, 300, 240, "o-so", "Ô số phần", A("pop", 300, 500)) + T("mp-so", 120, 196, 300, so, `data-dl ${A("pop", 400, 500)}`)
    + `<h1 class="mp-t" data-t data-tieu-de ${A("rise", 600, 600)} style="left:116px;top:500px;width:720px">${esc(ten)}</h1>` + T("mp-m", 118, 730, 640, mo, A("fade", 850, 500))
    + chipsRow(chips), { trans: "push", dur: 700 });
  // câu chốt trên ảnh tràn mép (hero): dải màu ở đáy, câu lớn chữ sáng
  const mCauAnh = (anh, alt, cau, phu, notes) => sec2("cau", "anh", notes, chup(anh, 0, 0, 1920, 1080, alt, A("fade", 0, 900))
    + `<h1 class="cau-anh" data-t data-tieu-de ${A("rise", 500, 700)} style="left:120px;top:620px;width:1500px">${em(cau)}</h1>` + T("cau-anh-phu", 122, 880, 1400, phu, A("fade", 1200, 600)), { ex: "data-hero" });
  // câu hỏi: cột bạc hà có cảnh "ba hợp đồng vào ba hộp" (dùng lặp, data-lap) + câu hỏi + bốn phương án trượt vào
  const CANH_HOI = [[P.x2, 150], [P.v2, 340], [P.x1, 530]].map(([m, cx]) => `<path d="M${cx - 80} 470 L${cx - 100} 430 H${cx - 20} Z M${cx + 80} 470 L${cx + 100} 430 H${cx + 20} Z" fill="${m}"/><rect x="${cx - 80}" y="470" width="160" height="120" rx="10" fill="${m}"/><rect x="${cx - 50}" y="510" width="100" height="14" rx="7" fill="${P.nen}" opacity="0.7"/>`).join("")
    + [[150, 300, -14], [340, 250, 6], [530, 290, 16]].map(([cx, cy, g]) => `<g transform="rotate(${g} ${cx} ${cy})">${mh.hopDong(cx - 55, cy - 72, 110, { bar: false })}</g>`).join("")
    + `<path d="M210 220 q40 -60 100 -40 M400 170 q60 -40 110 0" fill="none" stroke="${P.x3}" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 14"/>` + mh.saoCum(560, 140, 22, P.v2);
  const CANH = [
    { ve: () => CANH_HOI, alt: "Minh hoạ: ba hợp đồng đang được xếp vào ba hộp — phân loại" },
    { ve: () => `<rect x="110" y="556" width="520" height="14" rx="7" fill="${P.x3}"/>` + mh.toaVP(260, 560, 240) + `<circle cx="520" cy="330" r="110" fill="${P.v2}"/>` + mh.iconNet(D, "zoom-check", 520, 330, 140, P.x1, 4) + mh.saoCum(620, 170, 22, P.x2), alt: "Minh hoạ: toà nhà DNBH và kính lúp có dấu tích — kiểm tra, giám sát" },
    { ve: () => `<g transform="rotate(-6 230 330)">${mh.hopDong(130, 200, 200)}</g>` + mh.muiKhoi(345, 425, 420, 16, { mau: P.v2 }) + mh.xu(440, 570, 6, 170) + mh.saoCum(600, 180, 22, P.x2), alt: "Minh hoạ: bản hợp đồng và chồng xu — giải thích điều khoản, trả tiền đúng hạn" },
    { ud: ["handshake-deal_nwk6", 540], alt: "Minh hoạ: cái bắt tay trên bản hợp đồng — hai bên tin tưởng tuyệt đối lẫn nhau" },
    { ve: () => `<g transform="rotate(-4 360 320)">${mh.hopDong(220, 140, 280)}<rect x="252" y="280" width="214" height="34" rx="8" fill="${P.v4}" stroke="${P.v1}" stroke-width="4" stroke-dasharray="10 7"/></g>` + mh.but(478, 300, 210, -40) + mh.saoCum(150, 200, 22, P.v2), alt: "Minh hoạ: bản hợp đồng có một chỗ trống tô vàng và cây bút" },
  ];
  const mHoi = (k, q, ds, notes, dien) => { const y0 = dien ? 560 : 400, b = dien ? 126 : 150, h = dien ? 108 : 120, c = CANH[k - 1];
    sec2("hoi", "chia", notes, lop(`<rect x="0" y="0" width="${PANEL}" height="1080" fill="${P.x4}"/><path d="M0 990 L${PANEL} 800 V1080 H0 Z" fill="${P.x3}"/>` + mh.cham(520, 960, 6, 2, 26, 5, P.v2), 0, 0, PANEL, 1080, "Cột màu bạc hà", "phang", `data-lap ${A("fade", 0, 500)}`)
      + (c.ud ? ud(c.ud[0], 90, Math.round(360 - udH(c.ud[0], c.ud[1]) / 2), c.ud[1], c.alt, A("pop", 300, 600)) : lop(c.ve(), 40, 100, 640, 520, c.alt, "phang", A("pop", 300, 600)))
      + chip(dien ? "Điền vào chỗ trống" : "Câu hỏi tức thì", 120, 660, "chip", A("fade", 600, 400)) + T("hoi-so", 120, 730, 520, `${k}/5`, `data-dl ${A("pop", 700, 500)}`)
      + `<h1 class="hoi-td${dien ? " dien" : ""}" data-t data-tieu-de ${A("rise", 500, 600)} style="left:820px;top:${dien ? 150 : 200}px;width:980px">${esc(dien || q)}</h1>` + T("so-trang", 1600, 84, 200, `${39 + k} / ${TONG}`)
      + ds.map((d, j) => { const y = y0 + j * b, t0 = 1000 + j * 200;
        return khoi(820, y, 980, h, "pa", `Phương án ${"ABCD"[j]}`, A("slide-r", t0, 450)) + khoi(820, y, 120, h, "pa-o", "Ô chữ cái", A("slide-r", t0, 450)) + G("pa-chu", 820, y, 120, h, `<span style="width:100%;text-align:center">${"ABCD"[j]}</span>`, A("slide-r", t0, 450)) + G("pa-t", 980, y, 800, h, esc(d), A("slide-r", t0, 450)); }).join("")); };
  // bảng số (đề bài tái bảo hiểm): đầu cột tô, hàng xen kẽ, số canh phải
  const bangSo = (x, y, cols, wc, rows, t0 = 900) => { const w = wc.reduce((a, v) => a + v, 0), hh = 66, hr = 76; let o = khoi(x, y, w, hh, "bh", "Đầu bảng", A("wipe", t0, 400)), cx = x;
    cols.forEach((c, j) => { o += G(`bh-t${j ? " phai" : ""}`, cx + 18, y, wc[j] - 36, hh, j ? `<span style="width:100%;text-align:right">${esc(c)}</span>` : esc(c), A("fade", t0 + 150, 300)); cx += wc[j]; });
    rows.forEach((r, i) => { const yy = y + hh + i * hr; o += khoi(x, yy, w, hr - 4, `hang${i % 2 ? " le" : ""}`, `Hàng ${i + 1}`, A("rise", t0 + 300 + i * 110, 300)); let c2 = x;
      r.forEach((v, j) => { o += G(`so-o${j ? "" : " dau"}`, c2 + 18, yy, wc[j] - 36, hr - 4, j ? `<span style="width:100%;text-align:right">${esc(v)}</span>` : esc(v), A("rise", t0 + 300 + i * 110, 300)); c2 += wc[j]; }); });
    return o; };
  const hopBadge = (x, y, ten, mau = P.x1, co = 100, net = P.nen) => lop(`<rect x="${x}" y="${y}" width="${co}" height="${co}" rx="${co * 0.18}" fill="${mau}"/>` + mh.iconNet(D, ten, x + co / 2, y + co / 2, co * 0.6, net, 3), x, y, co, co, `Biểu tượng ${ten}`, "phang", "data-lap");
  const badgeNguoi = (x, y, co, mau, ao, ao2, ten, ex = "") => lop(`<rect x="${x}" y="${y}" width="${co}" height="${co}" rx="${co * 0.18}" fill="${mau}"/>` + mh.nguoi(x + co / 2, y + co * 0.94, co * 0.72, { ao, ao2 }), x, y, co, co, `Hình người: ${ten}`, "phang", `data-lap ${ex}`);   // các bên là người: vẽ phẳng, cùng kiểu với toà nhà DNBH
  const badgeToa = (x, y, co, mau, ex = "") => lop(`<rect x="${x}" y="${y}" width="${co}" height="${co}" rx="${co * 0.18}" fill="${mau}"/>` + mh.toaVP(x + co / 2, y + co * 0.9, co * 0.56), x, y, co, co, "Toà nhà doanh nghiệp bảo hiểm", "phang", `data-lap ${ex}`);   // DNBH luôn là toà nhà (slide 8, 12, 23, 30, 31)
  const nhaNho = (x, y, w, m) => `<path d="M${x} ${y + w * 0.42} L${x + w / 2} ${y} L${x + w} ${y + w * 0.42} V${y + w * 0.95} H${x} Z" fill="${m}"/><rect x="${x + w * 0.4}" y="${y + w * 0.6}" width="${w * 0.2}" height="${w * 0.35}" fill="${P.trang}" opacity="0.8"/>`;
  const panel = (x, y, w, h, t0 = 200) => khoi(x, y, w, h, "panel-nen", "Khối nền", A("fade", t0, 500));   // khối nền điểm neo cho slide danh sách / nhiều thẻ
  const S = [];   // thứ tự slide

  // ---- 2 CÂU CHỐT MỞ BÀI — hero ảnh cháy nhà ----
  S.push(() => mCauAnh("chay-full.jpg", "Ảnh: đám cháy lan tới sát một ngôi nhà, vòi nước đang phun dập lửa", "Một vụ cháy có thể lấy đi [tài sản cả đời]", "Xác suất nhỏ, hậu quả lớn — nhiều người cùng chia thì gánh được.", nc(2)));

  // ---- 3 MỤC TIÊU ----
  S.push(() => { const MT = [["bulb", "Giải thích", "chuyển giao rủi ro qua hợp đồng"], ["shield-check", "Nhận diện", "các nguyên tắc của BHTM"], ["category", "Phân loại", "theo pháp lý, kỹ thuật, đối tượng"], ["arrows-split", "Phân biệt", "chủ thể, tài liệu, STBH, phí, thời hạn"], ["coins", "Tính toán", "chia STBH, phí, bồi thường tái bảo hiểm"]];
    sec2("noi-dung", "sang", nc(3), nen(NEN.tron()) + dau("Mục tiêu chương", "Năm việc [làm được]", "Năm việc, năm động từ.", 3) + panel(100, 316, 1720, 668)
      + MT.map(([i, v, m], k) => { const y = 330 + k * 128, t0 = 500 + k * 220;
        return khoi(120, y, 1680, 112, `hang-mt${k % 2 ? " le" : ""}`, `Mục tiêu ${k + 1}`, A("rise", t0, 400)) + T("mt-so", 150, y + 22, 80, `0${k + 1}`, A("rise", t0, 400)) + hopBadge(250, y + 12, i, P.x1, 88).replace('data-lap', `data-lap ${A("pop", t0 + 100, 300)}`)
          + G("mt-v", 370, y, 360, 112, esc(v), A("rise", t0, 400)) + G("mt-m", 760, y, 1020, 112, esc(m), A("fade", t0 + 150, 400)); }).join("")); });

  // ---- 4 KẾT CẤU ----
  S.push(() => { const PH = [["01", "Khái niệm và nguyên tắc", "năm nguyên tắc", 17], ["02", "Phân loại", "pháp lý, kỹ thuật, đối tượng", 7], ["03", "Hợp đồng bảo hiểm", "chủ thể, các con số, phí", 15], ["04", "Tái bảo hiểm", "bốn loại và hai bài tập", 46]];
    let bar = "", x = 120; [[17, P.x1], [7, P.x2], [15, P.x1], [46, P.v2], [35, P.ke]].forEach(([m, c]) => { const w = (m / 120) * 1680; bar += `<rect x="${x + 2}" y="868" width="${w - 4}" height="40" rx="8" fill="${c}"/>`; x += w; });
    sec2("noi-dung", "sang", nc(4), nen(NEN.dat(780)) + dau("Kết cấu chương 3", "Bốn phần, [120 phút]", "Phần 4 dài nhất: hai bài tập.", 4) + panel(100, 316, 1720, 504)
      + PH.map(([so, ten, mo, ph], k) => { const x = 120 + k * 426, t0 = 500 + k * 250;
        return khoi(x + 12, 342, 400, 470, "bong", "Bóng thẻ", A("rise", t0, 450)) + khoi(x, 330, 400, 470, "the-trang", `Thẻ phần ${so}`, A("rise", t0, 450)) + khoi(x, 330, 400, 150, k === 3 ? "dau-vang" : "dau-xanh", `Đầu thẻ ${so}`, A("rise", t0, 450))
          + T(`kc-so${k === 3 ? " toi" : ""}`, x + 26, 346, 200, so, A("rise", t0, 450)) + T("kc-t", x + 30, 500, 340, ten, A("fade", t0 + 150, 400)) + T("kc-m", x + 30, 620, 340, mo, A("fade", t0 + 250, 400))
          + chip(`${ph} phút`, x + 30, 720, k === 3 ? "chip vang" : "chip", A("rise", t0 + 350, 400)); }).join("")
      + lop(bar, 120, 860, 1680, 56, "Thanh 120 phút chia theo bốn phần và phần câu hỏi, tổng kết", "phang", A("wipe", 1600, 800))
      + T("nguon", 120, 930, 1680, "120 phút = 85 phút giảng bốn phần + 35 phút câu hỏi tức thì, đề tài nhóm, tổng kết, hỏi đáp.")); });

  // ---- 6 LỊCH SỬ THẾ GIỚI — trục dọc + tranh Lloyd's khung bo ----
  S.push(() => { const LS = [["1347", "Genoa (Ý)", "hợp đồng đầu tiên"], ["1666", "Đại hoả hoạn London", "13.000 nhà cháy"], ["1688", "Quán cà phê Lloyd's", "mua bán bảo hiểm tàu"], ["1706", "Amicable Society", "nhân thọ đầu tiên"]];
    sec2("noi-dung", "sang", nc(6), nen(NEN.goc()) + dau("Sự ra đời · thế giới", "Bảo hiểm ra đời từ [thương mại]", "Rủi ro biển và hoả hoạn sinh ra nó.", 6)
      + lop(`<path d="M318 360 V930" stroke="${P.x3}" stroke-width="4"/>` + LS.map((_, k) => `<circle cx="318" cy="${376 + k * 160}" r="14" fill="${k === 2 ? P.v2 : P.x1}" stroke="${P.nen}" stroke-width="4"/>`).join(""), 290, 350, 60, 600, "Trục thời gian bốn mốc", "phang", A("wipe", 400, 900))
      + LS.map(([y, a, b], k) => { const yy = 352 + k * 160, t0 = 600 + k * 300; return T(`ls-nam${k === 2 ? " vang" : ""}`, 120, yy, 170, y, A("rise", t0, 400)) + `<div class="cap" style="left:360px;top:${yy + 2}px;width:560px"><b data-t class="dong-t" ${A("fade", t0 + 100, 400)}>${esc(a)}</b><span data-t class="dong-m" ${A("fade", t0 + 200, 400)}>${esc(b)}</span></div>`; }).join("")
      + khoi(1030, 360, 720, 540, "bong", "Mảng lệch sau tranh", A("pop", 1400, 600)) + chup("bao-bo.png", 1000, 330, 700, 520, "Tranh sơn dầu: thuyền buôn Hà Lan gặp bão — rủi ro đường biển sinh ra bảo hiểm hàng hải", A("pop", 1500, 700))
      + T("nguon", 1000, 920, 800, "Ludolf Bakhuizen, Thuyền buôn Hà Lan gặp bão (thế kỷ 17) · phạm vi công cộng")); });

  // ---- 7 LỊCH SỬ VIỆT NAM — trục ngang, thẻ luật đang hiệu lực tô đặc ----
  S.push(() => { const VN = [["1964", "Công ty Bảo hiểm Việt Nam", "thành lập 17/12/1964"], ["1993", "Nghị định 100/CP", "18/12/1993, về kinh doanh bảo hiểm"], ["2001", "Luật KDBH 24/2000/QH10", "hiệu lực 01/04/2001"], ["2023", "Luật KDBH 08/2022/QH15", "hiệu lực 01/01/2023"], ["2026", "Luật 139/2025/QH15", "sửa đổi; hiệu lực 01/01/2026*"]];
    sec2("noi-dung", "sang", nc(7), nen(NEN.dat(700)) + dau("Sự ra đời · Việt Nam", "Từ công ty nhà nước tới [thị trường có luật]", "Đang áp dụng: Luật 08/2022/QH15, sửa đổi bởi Luật 139/2025/QH15.", 7) + panel(100, 520, 1720, 380)
      + lop(`<path d="M120 500 H1800" stroke="${P.x3}" stroke-width="4"/>` + VN.map((_, k) => `<circle cx="${270 + k * 345}" cy="500" r="15" fill="${k >= 3 ? P.x1 : P.nen}" stroke="${P.x1}" stroke-width="4"/>`).join(""), 110, 480, 1700, 40, "Trục thời gian năm mốc", "phang", A("wipe", 400, 900))
      + VN.map(([y, a, b], k) => { const x = 120 + k * 345, t0 = 600 + k * 250, dac = k >= 3;
        return T(`vn-nam${dac ? "" : " nhat"}`, x, 384, 300, y, A("rise", t0, 400)) + khoi(x, 540, 315, 330, dac ? "vn-the dac" : "vn-the", `Thẻ mốc ${y}`, A("rise", t0, 450))
          + `<div class="cap" style="left:${x + 24}px;top:566px;width:267px"><b data-t class="vn-t${dac ? " sang" : ""}" ${A("fade", t0 + 100, 400)}>${esc(a)}</b><span data-t class="vn-m${dac ? " sang" : ""}" ${A("fade", t0 + 200, 400)}>${esc(b)}</span></div>` ; }).join("")
      + T("nguon", 120, 960, 1680, "Thẻ tô đậm: văn bản đang có hiệu lực. * Một số khoản của Luật 139/2025/QH15 có hiệu lực từ 01/7/2026.")); });

  // ---- 9 SỐ ĐÔNG — lưới 100 người, 2 người đỏ ----
  S.push(() => { let g = `<rect x="120" y="330" width="640" height="620" rx="24" fill="${P.x4}"/>`; for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) { const d = (r === 2 && c === 7) || (r === 7 && c === 3); g += mh.iconDac(D, "user", 170 + c * 60, 380 + r * 58, 46, d ? P.d1 : P.x2); }
    sec2("noi-dung", "sang", nc(9), nen(NEN.tron()) + dau("3.1 · Nguyên tắc 1", "Số đông [bù cho số ít]", "Số ít gặp rủi ro, số đông cùng gánh.", 9)
      + lop(g, 120, 330, 640, 620, "Lưới 100 người cùng đóng phí; 2 người tô đỏ là người gặp rủi ro", "phang", A("fade", 400, 800))
      + T("so-lon xanh", 860, 330, 380, "100", `data-dl ${A("pop", 900, 500)}`) + T("chu-lon", 1250, 400, 550, "người đóng phí vào quỹ", A("fade", 1100, 400))
      + lop(mh.xu(880, 760, 5, 130) + mh.muiKhoi(1050, 1240, 700, 22, { mau: P.v2 }), 870, 560, 400, 210, "Chồng xu: quỹ chung chảy sang người gặp rủi ro", "phang", A("wipe", 1400, 600))
      + T("so-lon do", 1270, 560, 200, "2", `data-dl ${A("pop", 1700, 500)}`) + T("chu-lon", 1420, 630, 380, "người gặp rủi ro được bù", A("fade", 1900, 400))
      + khoi(860, 840, 940, 110, "dai-nhat", "Dải chốt ý", A("wipe", 2200, 500)) + G("chot", 890, 840, 880, 110, "Ai cũng có thể gặp rủi ro, nên ai cũng góp phí.", A("fade", 2400, 400))); });

  // ---- 10 RỦI RO NGẪU NHIÊN — năm sự kiện, phán quyết có / không ----
  S.push(() => { const R = [["flame", "Nhà cháy do chập điện", 1, "Có — bất ngờ"], ["flame", "Chủ nhà cố ý đốt nhà", 0, "Không — cố ý"], ["car-crash", "Xe bị đâm khi dừng đèn đỏ", 1, "Có — ngoài ý muốn"], ["clock", "Xe hao mòn theo thời gian", 0, "Không — chắc chắn xảy ra"], ["ship", "Tàu gặp bão trên biển", 1, "Có — bất ngờ"]];
    sec2("bang", "sang", nc(10), nen(NEN.goc()) + dau("3.1 · Nguyên tắc 2", "Chỉ bảo hiểm [rủi ro ngẫu nhiên]", "Bất ngờ thì nhận; cố ý hoặc chắc chắn thì không.", 10) + panel(100, 316, 1720, 690)
      + R.map(([i, a, co, v], k) => { const y = 330 + k * 116, t0 = 500 + k * 280;
        return khoi(120, y, 1680, 104, "hang", `Sự kiện ${k + 1}`, A("rise", t0, 400)) + hopBadge(140, y + 12, i, co ? P.x1 : P.phu, 80).replace("data-lap", `data-lap ${A("pop", t0, 300)}`)
          + G("ev-t", 250, y, 900, 104, esc(a), A("rise", t0, 400)) + khoi(1230, y + 18, 550, 68, co ? "pill-co" : "pill-khong", v, A("pop", t0 + 250, 300)) + G(co ? "pill-co-t" : "pill-khong-t", 1250, y + 18, 510, 68, `<span style="width:100%;text-align:center">${esc(v)}</span>`, A("pop", t0 + 250, 300)); }).join("")
      + khoi(120, 920, 1680, 72, "dai", "Dải kết luận", A("wipe", 2000, 500)) + G("dai-t", 150, 920, 1620, 72, "Rủi ro phải bất ngờ, không lường trước (khoản 5 Điều 16).", A("fade", 2200, 400))); });

  // ---- 11 QUYỀN LỢI — hai cảnh đối chiếu ----
  S.push(() => { const canh = (x, la, ok) => `<circle cx="${x + 190}" cy="560" r="105" fill="${ok ? P.x1 : P.ke}"/>` + mh.iconDac(D, "user", x + 190, 552, 130, ok ? P.nen : P.phu) + mh.nha(x + 470, 470, 210)
      + (ok ? mh.muiKhoi(x + 310, x + 440, 560, 20) : mh.muiKhoi(x + 310, x + 440, 560, 20, { vien: P.d1, dut: true, nen: P.d4 }))
      + `<circle cx="${x + 690}" cy="430" r="40" fill="${ok ? P.x2 : P.d1}"/>` + (ok ? `<path d="M${x + 672} 430 l12 12 l22 -24" fill="none" stroke="${P.nen}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` : `<path d="M${x + 676} 416 l28 28 M${x + 704} 416 l-28 28" stroke="${P.nen}" stroke-width="8" stroke-linecap="round"/>`);
    sec2("noi-dung", "sang", nc(11), nen(NEN.dat(800)) + dau("3.1 · Nguyên tắc 3", "Phải có [quyền lợi] với đối tượng", "Mất đối tượng thì chính người mua thiệt.", 11)
      + [[120, "Chủ nhà mua cho nhà mình", 1, "Được bảo hiểm"], [990, "Người lạ mua cho nhà khác", 0, "Không được"]].map(([x, la, ok, v], k) => { const t0 = 500 + k * 900;
        return khoi(x + 12, 342, 810, 620, "bong", "Bóng thẻ", A("rise", t0, 450)) + khoi(x, 330, 810, 620, "the-trang", `Cảnh ${la}`, A("rise", t0, 450))
          + lop(canh(x, la, ok), x + 40, 380, 740, 320, ok ? "Minh hoạ: chủ nhà nối với ngôi nhà của mình, có dấu tích" : "Minh hoạ: người lạ nối nét đứt đỏ với nhà người khác, có dấu gạch chéo", "phang", A("pop", t0 + 200, 600))
          + T("q-t", x + 40, 730, 730, la, A("fade", t0 + 400, 400)) + T("q-m", x + 40, 786, 730, ok ? "nhà cháy, chính họ mất" : "nhà cháy, họ không mất gì", A("fade", t0 + 500, 400))
          + chip(v, x + 40, 870, ok ? "chip" : "chip do", A("pop", t0 + 700, 300)); }).join("")); });

  // ---- 12 TRUNG THỰC — trích luật + hai chiều ----
  S.push(() => sec2("trich", "dam", nc(12), nen(mh.cham(1660, 1010, 6, 2, 26, 5, P.v2)) + dauToi("3.1 · Nguyên tắc 4", "Trung thực: [nghĩa vụ hai chiều]", "Cả hai bên đều phải khai đúng, làm đúng.", 12) + khoi(100, 620, 1720, 250, "panel-toi", "Khối nền", A("fade", 200, 500))
    + khoi(120, 330, 10, 112, "gach-doc", "Vạch trích", A("wipe", 400, 400)) + `<div class="trich-vua sang" data-t data-trich ${A("fade", 500, 800)} style="left:160px;top:326px;width:1600px">“…các bên tham gia hợp đồng bảo hiểm phải cung cấp thông tin, thực hiện các quyền và nghĩa vụ một cách trung thực nhất, trên cơ sở tin tưởng tuyệt đối lẫn nhau…”</div>`
    + chip("Khoản 1 Điều 16 · Luật KDBH 08/2022/QH15", 160, 456, "chip vien", A("rise", 1100, 400)) + chip("Khoản 1 Điều 22", 120, 556, "chip vang", A("rise", 1250, 400))
    + [[120, "building-bank", "Doanh nghiệp bảo hiểm", "giải thích điều khoản"], [1040, "user", "Bên mua bảo hiểm", "khai đúng rủi ro"]].map(([x, i, a, b], k) => { const t0 = 1300 + k * 300;
      return khoi(x, 640, 760, 210, "the-trang", a, A("rise", t0, 450)) + (k === 0 ? badgeToa(x + 30, 695, 100, P.x4, A("pop", t0 + 100, 300)) : badgeNguoi(x + 30, 695, 100, P.x4, P.x2, P.x1, a, A("pop", t0 + 100, 300))) + `<div class="cap" style="left:${x + 160}px;top:698px;width:570px"><b data-t class="dong-t" ${A("fade", t0 + 150, 400)}>${esc(a)}</b><span data-t class="dong-m" ${A("fade", t0 + 250, 400)}>${esc(b)}</span></div>`; }).join("")
    + lop(mh.muiKhoi(890, 1030, 720, 18, { mau: P.x4 }) + mh.muiKhoi(1030, 890, 780, 18, { mau: P.v2 }), 880, 690, 160, 120, "Mũi tên hai chiều: nghĩa vụ trung thực của cả hai bên", "phang", A("fade", 1900, 500))
    + khoi(120, 890, 1680, 86, "dai-do", "Dải hậu quả", A("wipe", 2200, 500)) + G("dai-do-t", 160, 890, 1610, 86, "Cố ý khai sai → bên kia được huỷ hợp đồng (Điều 22 khoản 2, 3).", A("fade", 2400, 400))));

  // ---- 13 PHÂN TÁN — 18/18 so với 2/18 ----
  S.push(() => { let a = `<rect x="120" y="330" width="800" height="460" rx="24" fill="${P.x4}"/><circle cx="520" cy="560" r="200" fill="none" stroke="${P.d1}" stroke-width="4" stroke-dasharray="12 9"/>`;
    for (let k = 0; k < 18; k++) a += nhaNho(352 + (k % 6) * 58, 470 + Math.floor(k / 6) * 62, 44, P.d1);
    let b = `<rect x="1000" y="330" width="800" height="460" rx="24" fill="${P.x4}"/><circle cx="1180" cy="470" r="90" fill="none" stroke="${P.d1}" stroke-width="4" stroke-dasharray="12 9"/>`;
    [[1120, 440, 1], [1192, 440, 1], [1380, 400], [1520, 380], [1660, 450], [1090, 620], [1250, 680], [1420, 580], [1560, 540], [1700, 620], [1330, 500], [1480, 690], [1620, 712], [1150, 712], [1300, 728], [1720, 380], [1030, 356], [1400, 728]].forEach(([x, y, c]) => { b += nhaNho(x, y, 44, c ? P.d1 : P.x2); });
    sec2("noi-dung", "sang", nc(13), nen(NEN.tron()) + dau("3.1 · Nguyên tắc 5", "Phân tán để [tổn thất không dồn]", "Rải hợp đồng ra nhiều nơi để một vụ cháy không trúng tất cả.", 13)
      + lop(a, 120, 330, 800, 460, "Mười tám ngôi nhà dồn một chỗ: vụ cháy trúng cả 18", "phang", A("fade", 500, 700)) + lop(b, 1000, 330, 800, 460, "Mười tám ngôi nhà rải nhiều nơi: vụ cháy chỉ trúng 2", "phang", A("fade", 1300, 700))
      + T("so-vua do", 120, 820, 240, "18/18", `data-dl ${A("pop", 1000, 400)}`) + T("chu-lon", 370, 842, 540, "Dồn một nơi: cháy trúng cả 18", A("fade", 1100, 400))
      + T("so-vua xanh", 1000, 820, 220, "2/18", `data-dl ${A("pop", 1800, 400)}`) + T("chu-lon", 1230, 842, 570, "Rải nhiều nơi: chỉ trúng 2", A("fade", 1900, 400))
      + T("nguon", 120, 960, 1680, "Mỗi ngôi nhà là một hợp đồng. Cách phân tán: mở rộng phạm vi, đa dạng hoá sản phẩm, tái bảo hiểm.")); });

  // ---- 14 ĐỐI CHIẾU — biểu đồ Venn ----
  S.push(() => sec2("noi-dung", "sang", nc(14), nen(NEN.goc()) + dau("Đối chiếu · Luật KDBH 2022", "Nghiệp vụ và Luật: [chỉ trùng ba]", "Số đông, phân tán chỉ là nghiệp vụ.", 14)
    + lop(`<circle cx="830" cy="650" r="330" fill="${P.x4}" stroke="${P.x2}" stroke-width="5"/>`, 495, 315, 670, 670, "Vòng nghiệp vụ (giáo trình)", "phang", A("grow", 400, 600))
    + lop(`<circle cx="1090" cy="650" r="330" fill="${P.v3}" fill-opacity="0.55" stroke="${P.v1}" stroke-width="5"/>`, 755, 315, 670, 670, "Vòng Điều 16 Luật KDBH 2022, chồng lên vòng nghiệp vụ", "phang", A("grow", 800, 600))
    + chip("Nghiệp vụ (giáo trình)", 120, 340, "chip", A("fade", 500, 400)) + chip("Điều 16 Luật KDBH", 1400, 340, "chip vang", A("fade", 900, 400))
    + [["Số đông", 560], ["Phân\u00a0tán rủi\u00a0ro", 680]].map(([s, y], k) => T("venn-t", 520, y, 200, s, A("fade", 1200 + k * 150, 400))).join("")
    + [["Rủi ro ngẫu nhiên", 545], ["Quyền lợi bảo hiểm", 630], ["Trung thực tuyệt đối", 715]].map(([s, y], k) => T("venn-t dac nho", 790, y, 340, s, A("pop", k * 200, 400) + ' data-click="1"')).join("")
    + [["Bồi thường", 560], ["Thế quyền", 700]].map(([s, y], k) => T("venn-t vang", 1165, y, 240, s, A("fade", k * 150, 400) + ' data-click="2"')).join("")
    + T("nguon", 120, 1000, 1680, "Điều 16 Luật KDBH 08/2022/QH15: năm nguyên tắc giao kết, thực hiện hợp đồng bảo hiểm.")));

  // ---- 15 CÂU CHỐT ĐIỀU 16 — nền đậm, chữ khổng lồ ----
  S.push(() => sec2("cau", "dam", "Slide thở: chốt phân biệt nguyên tắc nghiệp vụ và nguyên tắc pháp lý (khoản 1–5 Điều 16 Luật KDBH 2022).", nen(`<circle cx="1500" cy="560" r="520" fill="${P.x2}"/>` + mh.cham(120, 96, 5, 3, 26, 5, P.v2))
    + T("so-khong-lo can", 1100, 360, 800, "Đ16", `data-dl ${A("pop", 300, 700)}`)
    + `<h1 class="cau-dam" data-t data-tieu-de ${A("rise", 500, 700)} style="left:120px;top:230px;width:900px">${em("Thi luật: dùng [năm nguyên tắc của Điều 16]")}</h1>`
    + T("cau-dam-phu", 118, 600, 820, "Năm nguyên tắc giáo trình là nghiệp vụ — chỉ trùng ba với Luật.", A("fade", 1000, 500))
    + chipsRow(["Trung thực tuyệt đối", "Quyền lợi có thể được bảo hiểm", "Bồi thường", "Thế quyền", "Rủi ro ngẫu nhiên"], 760, 120, 1000, 1300), { ex: "data-khong-hinh" }));

  // ---- 16 MỞ PHẦN 02 ----
  S.push(() => mMoPhan("02", "Phân loại bảo hiểm thương mại", "Theo tính chất pháp lý, kỹ thuật bảo hiểm và đối tượng.", "mp02-tron.png", "Ảnh: chiếc ô tô đâm vào gốc cây — rủi ro trên đường", ["Pháp lý", "Kỹ thuật", "Đối tượng"], nc(15)));

  // ---- 18 KỸ THUẬT — phân bổ / dồn tích ----
  S.push(() => { const H = [["Thời hạn", "Ngắn", "Dài"], ["Rủi ro", "Độc lập với tuổi thọ", "Gắn với tuổi thọ"], ["Dùng quỹ", "Có rủi ro thì chi ngay", "Tích nhiều năm mới chi"], ["Ví dụ", "Cháy nổ một năm", "Nhân thọ 20 năm"]];
    const ve1 = (x) => mh.xu(x + 600, 470, 3, 90) + mh.muiKhoi(x + 700, x + 780, 430, 14, { mau: P.v3 }), ve2 = (x) => [0, 1, 2].map((k) => mh.xu(x + 560 + k * 80, 480, 2 + k * 2, 64)).join("");
    sec2("so-sanh", "sang", nc(17), nen(NEN.dat(700)) + dau("3.2 · Theo kỹ thuật bảo hiểm", "Phân bổ [chi ngay], dồn tích [tích quỹ]", "Khác nhau ở thời hạn và cách dùng quỹ phí.", 18)
      + [[120, "dau-xanh", "Kỹ thuật phân bổ", 1, ve1, "Minh hoạ: chồng xu thu về rồi chi ra ngay trong năm"], [990, "dau-vang", "Kỹ thuật dồn tích", 2, ve2, "Minh hoạ: ba chồng xu cao dần qua các năm"]].map(([x, cls, ten, c, ve, alt]) => { const t0 = c === 1 ? 500 : 900;
        return khoi(x + 14, 344, 810, 650, "bong", "Bóng thẻ", A("rise", t0, 500)) + khoi(x, 330, 810, 650, "the-trang", `Thẻ ${ten}`, A("rise", t0, 500)) + khoi(x, 330, 810, 190, cls, `Đầu thẻ ${ten}`, A("rise", t0, 500))
          + lop(ve(x), x + 520, 330, 290, 190, alt, "phang", A("pop", t0 + 300, 500)) + T(`the-td${c === 2 ? " toi" : ""}`, x + 40, 392, 460, ten, A("fade", t0 + 200, 400))
          + H.map((h, k) => `${T("the-nhan", x + 40, 548 + k * 108, 300, h[0], A("fade", t0 + 500 + k * 180, 300))}${T("the-chu", x + 300, 544 + k * 108, 480, h[c], A("fade", t0 + 550 + k * 180, 400))}${k ? khoi(x + 40, 530 + k * 108, 730, 2, "vach", "Vạch kẻ", A("fade", t0 + 450 + k * 180, 300)) : ""}`).join(""); }).join("")); });

  // ---- 19 BA NHÓM — hero: ba thẻ có minh hoạ lớn ----
  S.push(() => { const hp = udH("property-agreement_olsb", 400), hf = udH("family_6gj8", 300);
    sec2("noi-dung", "sang", nc(18), nen(NEN.dat(760)) + dau("3.2 · Theo đối tượng", "Bảo hiểm [cái gì] thì thuộc nhóm đó", "Tài sản, con người, hay trách nhiệm với người khác.", 19)
      + [["Bảo hiểm tài sản", "nhà, xe, hàng hoá…"], ["Bảo hiểm con người", "tính mạng, sức khoẻ"], ["Bảo hiểm TNDS", "trách nhiệm với người thứ ba"]].map(([a, b], k) => { const x = 120 + k * 570, t0 = 500 + k * 400;
        return khoi(x + 12, 342, 540, 610, "bong", "Bóng thẻ", A("rise", t0, 450)) + khoi(x, 330, 540, 610, "the-trang", `Thẻ ${a}`, A("rise", t0, 450)) + khoi(x, 330, 540, 380, "nen-xanh-nhat", `Nền minh hoạ ${a}`, A("rise", t0, 450))
          + (k === 0 ? ud("property-agreement_olsb", x + 70, Math.round(520 - hp / 2), 400, "Minh hoạ: ngôi nhà và bản hợp đồng — bảo hiểm tài sản", A("pop", t0 + 200, 500), { "#f2f2f2": P.x3 })
            : k === 1 ? ud("family_6gj8", x + 120, Math.round(700 - hf), 300, "Minh hoạ: gia đình — bảo hiểm con người", A("pop", t0 + 200, 500), { "#f2f2f2": P.x3 })
            : lop(`<rect x="${x + 30}" y="640" width="480" height="10" rx="5" fill="${P.x3}"/>` + mh.xeCon(x + 36, 640, 232, P.v2) + mh.xeCon(x + 262, 640, 232, P.x2, true) + mh.saoCum(x + 262, 560, 30, P.d1) + mh.xu(x + 70, 440, 3, 76) + mh.muiKhoi(x + 166, x + 348, 412, 14, { mau: P.v2 }) + `<circle cx="${x + 420}" cy="410" r="64" fill="${P.trang}"/>` + mh.nguoi(x + 420, 466, 96, { ao: P.x2, ao2: P.x1 }), x + 30, 340, 480, 312, "Minh hoạ: xe vàng của người mua đâm vào xe của người khác; tiền bồi thường chuyển tới người thứ ba", "phang", A("pop", t0 + 200, 500)))
          + T("nhom-t", x + 36, 740, 470, a, A("fade", t0 + 400, 400)) + T("nhom-m", x + 36, 800, 470, b, A("fade", t0 + 500, 400)); }).join("")
      + T("nguon", 120, 1000, 1680, "Luật hiện hành: 3 loại hình — nhân thọ, sức khoẻ, phi nhân thọ (Điều 7); 5 loại hợp đồng (Điều 15)."), { ex: "data-hero" }); });

  // ---- 20 MỞ PHẦN 03 ----
  S.push(() => mMoPhan("03", "Hợp đồng bảo hiểm", "Khái niệm, tài liệu, chủ thể, các con số, phí và thời hạn.", "mp03-tron.png", "Tranh khắc mẫu hợp đồng bảo hiểm hoả hoạn, Philadelphia, khoảng 1840–1860", ["Khái niệm", "Chủ thể", "Giá trị – STBH", "Phí, thời hạn"], nc(19)));

  // ---- 22 BẢY TÀI LIỆU — ba chồng giấy theo thời điểm ----
  S.push(() => { const TL = [["file-description", "Trước khi ký", ["Bản mô tả quyền lợi", "Giấy yêu cầu BH"]], ["file-certificate", "Nội dung hợp đồng", ["Các điều kiện BH", "Điều kiện sửa đổi, bổ sung"]], ["receipt", "Chứng nhận, thu phí", ["Giấy chứng nhận tạm thời", "Giấy chứng nhận BH", "Thông báo thu phí, hoá đơn"]]]; let so = 0;
    sec2("bang", "sang", nc(21), nen(NEN.goc()) + dau("3.3 · Tài liệu liên quan", "Một hợp đồng gồm [cả bộ bảy tài liệu]", "Xếp theo lúc dùng.", 22) + panel(100, 480, 1720, 510)
      + lop(mh.muiKhoi(140, 1780, 446, 16, { mau: P.x3 }), 130, 420, 1660, 52, "Mũi tên thời gian: trước khi ký, khi ký, sau khi ký", "phang", A("wipe", 400, 900))
      + TL.map(([i, nhom, ds], k) => { const x = 120 + k * 580, t0 = 600 + k * 500;
        return hopBadge(x, 324, i, P.x1, 84).replace("data-lap", `data-lap ${A("pop", t0, 300)}`) + T("tl-nhom", x + 112, 344, 450, nhom, A("fade", t0 + 100, 400))
          + ds.map((d, j) => { so++; const y = 500 + j * 150, t1 = t0 + 200 + j * 150;
            return khoi(x + 10, y + 10, 520, 124, "giay-bong", "Bóng giấy", A("rise", t1, 400)) + khoi(x, y, 520, 124, "giay", `Tài liệu ${so}`, A("rise", t1, 400)) + T("tl-so", x + 24, y + 30, 80, `0${so}`, A("rise", t1, 400)) + G("tl-t", x + 110, y, 390, 124, esc(d), A("rise", t1, 400)); }).join(""); }).join("")); });

  // ---- 23 BỐN CHỦ THỂ — hợp đồng ở giữa ----
  S.push(() => { const A4 = [["building-bank", "Doanh nghiệp bảo hiểm", 120, 330, 1, "bồi thường, trả tiền"], ["user", "Bên mua bảo hiểm", 1360, 330, 1, "ký, đóng phí"], ["user-check", "Người được bảo hiểm", 120, 630, 0, "có tài sản, tính mạng… được BH"], ["gift", "Người thụ hưởng", 1360, 630, 0, "nhận tiền BH"]];
    sec2("noi-dung", "sang", nc(22), nen(NEN.dat(860)) + dau("3.3 · Chủ thể", "Hai bên ký, [bốn chủ thể] liên quan", "", 23) + panel(600, 360, 720, 470)
      + lop(`<path d="M560 420 L840 520 M1360 420 L1080 520" stroke="${P.x1}" stroke-width="5"/><path d="M560 710 L840 640 M1360 710 L1080 640" stroke="${P.phu}" stroke-width="3" stroke-dasharray="10 8"/>`, 550, 400, 820, 330, "Đường nối: hai bên ký nét liền, hai chủ thể còn lại nét đứt", "phang", A("fade", 1200, 600))
      + lop(mh.chongGiay(880, 420, 160) + mh.hopDong(880, 420, 160, { bar: false }), 840, 390, 240, 260, "Minh hoạ: bản hợp đồng ở giữa", "phang", A("pop", 400, 600))
      + chip("Ký", 640, 430, "chip", A("pop", 1400, 300)) + chip("Ký", 1210, 430, "chip", A("pop", 1400, 300))
      + A4.map(([i, a, x, y, ky, mo], k) => { const t0 = 700 + k * 250; return khoi(x, y, 440, 190, ky ? "the-xanh" : "the-xanh-nhat", a, A("rise", t0, 400)) + (k === 0 ? badgeToa(x + 20, y + 45, 100, P.v2, A("pop", t0 + 100, 300)) : badgeNguoi(x + 20, y + 45, 100, ky ? P.v2 : P.x1, [P.x1, P.x1, P.x3, P.v2][k], [P.x1, P.muc, P.x2, P.v1][k], a, A("pop", t0 + 100, 300))) + `<div class="cap" style="left:${x + 140}px;top:${y + 18}px;width:284px"><b data-t class="ct-t${ky ? " sang" : ""}" ${A("fade", t0 + 150, 400)}>${esc(a)}</b><span data-t class="ct-m${ky ? " sang" : ""}" ${A("fade", t0 + 250, 400)}>${esc(mo)}</span></div>`; }).join("")
      + hopBadge(120, 900, "users", P.v1, 80) + G("vd-dong", 220, 900, 1580, 80, "VD: bố mẹ (bên mua) mua BH nhân thọ cho con (người được BH).", A("fade", 2000, 400))); });

  // ---- 25 GIÁ TRỊ BH và STBH — nhà có nhãn giá + hai thanh ----
  S.push(() => sec2("noi-dung", "sang", nc(24), nen(NEN.dat(820)) + dau("3.3 · Hai con số khác nhau", "Giá trị BH [khác] số tiền BH", "Giá trị đo tài sản; STBH là mức trả tối đa.", 25)
    + lop(`<rect x="120" y="743" width="560" height="16" rx="8" fill="${P.x3}"/>` + mh.nha(230, 400, 340) + `<path d="M560 380 L700 380 L740 420 L700 460 L560 460 Z" fill="${P.v2}"/><circle cx="580" cy="420" r="9" fill="${P.nen}"/>`, 110, 360, 650, 470, "Minh hoạ: ngôi nhà có thẻ giá 1 tỷ", "phang", A("pop", 400, 600))
    + T("the-gia", 600, 396, 140, "1 tỷ", A("pop", 800, 300))
    + lop(`<rect x="860" y="400" width="940" height="70" rx="12" fill="${P.x1}"/><rect x="860" y="640" width="564" height="70" rx="12" fill="${P.v2}"/><path d="M1424 610 V740" stroke="${P.phu}" stroke-width="3" stroke-dasharray="8 6"/>`, 850, 390, 960, 360, "Hai thanh: giá trị 1 tỷ dài hơn số tiền bảo hiểm 600 triệu", "phang", A("wipe", 1000, 800))
    + T("thanh-t sang", 890, 414, 600, "Giá trị bảo hiểm · 1 tỷ", A("fade", 1400, 300)) + T("thanh-m", 860, 490, 940, "giá thị trường", A("fade", 1500, 300))
    + T("thanh-t", 890, 654, 520, "STBH · 600 triệu", A("fade", 1700, 300)) + T("thanh-m", 860, 730, 940, "theo hợp đồng", A("fade", 1800, 300)) + chip("60 %", 1444, 652, "chip vang", A("pop", 2000, 300))
    + khoi(120, 870, 1680, 96, "the-xanh", "Dải hệ quả", A("wipe", 2300, 500)) + hopBadge(140, 880, "scale", P.v2, 76, P.x1).replace("data-lap", `data-lap ${A("pop", 2400, 300)}`) + G("dai-t", 240, 870, 1540, 96, "STBH thấp hơn giá trị → bồi thường theo tỷ lệ (Điều 48).", A("fade", 2500, 400))));

  // ---- 27 PHÍ — công thức lớn + cột xu chia hai phần ----
  S.push(() => sec2("noi-dung", "dam", nc(26), nen(mh.cham(1660, 1010, 6, 2, 26, 5, P.v2)) + dauToi("3.3 · Phí bảo hiểm", "Phí gồm [phí thuần] và [phụ phí]", "Phí thuần để bồi thường; phụ phí để trang trải hoạt động.", 27) + khoi(100, 330, 1720, 520, "panel-toi", "Khối nền công thức", A("fade", 200, 500))
    + lop([[300, P.nen], [900, P.x3], [1500, P.v2]].map(([cx, m]) => `<circle cx="${cx}" cy="520" r="150" fill="${m}"/>`).join(""), 140, 360, 1540, 320, "Ba vòng tròn mang ba chữ của công thức", "phang", A("grow", 400, 600))
    + [["p", 150, "toi"], ["f", 750, "toi"], ["d", 1350, "toi"]].map(([c, x, k], j) => T(`ct-chu ${k}`, x, 396, 300, c, `data-dl ${A("pop", 600 + j * 300, 400)}`)).join("") + T("ct-dau sang", 500, 420, 200, "=", `data-dl ${A("fade", 750, 300)}`) + T("ct-dau sang", 1140, 420, 120, "+", `data-dl ${A("fade", 1050, 300)}`)
    + [["Phí bảo hiểm", "giá của sản phẩm", 150], ["Phí thuần", "để bồi thường", 750], ["Phụ phí", "chi phí hoạt động", 1350]].map(([a, b, x], j) => `<div class="cap" style="left:${x}px;top:700px;width:300px"><b data-t class="la-t sang" ${A("fade", 1400 + j * 150, 300)}>${esc(a)}</b><span data-t class="la-m sang" ${A("fade", 1450 + j * 150, 300)}>${esc(b)}</span></div>`).join("")
    + khoi(120, 890, 1680, 86, "the-xanh-nhat", "Dải định nghĩa", A("wipe", 2000, 500)) + G("dinh-nghia", 150, 890, 1620, 86, "Luật (khoản 28 Điều 4): tiền bên mua đóng, theo luật hoặc thoả thuận.", A("fade", 2200, 400))));

  // ---- 28 THỜI HẠN — cửa sổ bảo hiểm trên thước thời gian ----
  S.push(() => sec2("noi-dung", "sang", nc(27), nen(NEN.dat(780)) + dau("3.3 · Thời hạn", "Thời hạn: từ [hiệu lực] tới hết trách nhiệm", "Sự kiện ngoài cửa sổ này thì không bồi thường.", 28)
    + lop(`<rect x="120" y="580" width="1680" height="20" rx="10" fill="${P.ke}"/>` + Array.from({ length: 29 }, (_, k) => `<rect x="${150 + k * 58}" y="${k % 4 ? 604 : 600}" width="4" height="${k % 4 ? 14 : 24}" fill="${P.phu}"/>`).join("") + `<rect x="300" y="500" width="880" height="180" rx="24" fill="${P.x1}"/>`, 120, 490, 1680, 200, "Thước thời gian; cửa sổ màu chủ là thời hạn bảo hiểm", "phang", A("wipe", 400, 900))
    + G("cs-t", 320, 500, 840, 180, `<span style="width:100%;text-align:center">Thời hạn</span>`, A("fade", 1100, 400))
    + lop(mh.lua(640, 470, 70) + `<circle cx="710" cy="400" r="30" fill="${P.x2}"/><path d="M696 400 l10 10 l18 -20" fill="none" stroke="${P.nen}" stroke-width="6" stroke-linecap="round"/>` + mh.lua(1380, 470, 70) + `<circle cx="1450" cy="400" r="30" fill="${P.d1}"/><path d="M1438 388 l24 24 M1462 388 l-24 24" stroke="${P.nen}" stroke-width="6" stroke-linecap="round"/>`, 590, 360, 900, 120, "Hai sự kiện: trong thời hạn có dấu tích, sau thời hạn có dấu gạch chéo", "phang", A("drop", 1400, 600))
    + T("nhan-xanh", 752, 382, 420, "Trong hạn: bồi thường", A("fade", 1700, 400)) + T("nhan-do-dam", 1492, 382, 310, "Ngoài hạn: không", A("fade", 1900, 400))
    + lop(`<path d="M302 680 V800 M1182 680 V800" stroke="${P.x1}" stroke-width="4" stroke-dasharray="8 6"/>`, 298, 680, 890, 120, "Hai vạch nối mép cửa sổ với nhãn bắt đầu, kết thúc", "phang", A("wipe", 2000, 400))
    + hopBadge(300, 800, "file-certificate", P.x1, 90) + `<div class="cap" style="left:410px;top:798px;width:620px"><b data-t class="dong-t" ${A("fade", 2100, 400)}>Bắt đầu: có hiệu lực</b><span data-t class="dong-m" ${A("fade", 2200, 400)}>ký + chấp nhận + đóng phí</span></div>`
    + hopBadge(1180, 800, "calendar", P.v1, 90) + `<div class="cap" style="left:1290px;top:798px;width:510px"><b data-t class="dong-t" ${A("fade", 2300, 400)}>Kết thúc: hết trách nhiệm</b><span data-t class="dong-m" ${A("fade", 2400, 400)}>từ đó không bồi thường</span></div>`
    + T("nguon", 120, 1000, 1680, "Định nghĩa của giáo trình. Luật yêu cầu hợp đồng ghi thời hạn và thời điểm có hiệu lực (Điều 17 khoản 1 điểm e).")));

  // ---- 29 MỞ PHẦN 04 ----
  S.push(() => mMoPhan("04", "Tái bảo hiểm", "Doanh nghiệp bảo hiểm cũng chuyển bớt rủi ro — và hai bài tập tính.", "mp04-tron.png", "Tranh khắc trụ sở Hartford Fire Insurance Company", ["Khái niệm", "Bốn loại", "Bài 11", "Bài 12"], nc(28)));

  // ---- 30 TÁI BẢO HIỂM — hero ảnh toà cao tầng, chuỗi ba bên chữ sáng ----
  S.push(() => sec2("noi-dung", "anh", nc(29), chup("toa-full.jpg", 0, 0, 1920, 1080, "Ảnh: các toà nhà cao tầng nhìn từ dưới lên, phủ dải màu chủ bên trái", A("fade", 0, 900))
    + chip("3.4 · Khái niệm", 120, 80, "chip vang", A("fade", 200, 400)) + `<h1 class="td sang" data-t data-tieu-de ${A("rise", 300, 600)} style="left:120px;top:132px;width:1300px">${em("Tái bảo hiểm: [chuyển tiếp] rủi ro")}</h1>` + T("dan sang", 120, 246, 1200, "Một phần rủi ro đã nhận, kèm một phần phí đã nhận.", A("fade", 500, 400)) + chip(`30 / ${TONG}`, 1690, 80, "chip")
    + [["Bên mua", 230, P.trang, mh.nguoi(230, 640, 150, { ao: P.x2, ao2: P.x1 })], ["DNBH gốc", 640, P.trang, mh.toaVP(640, 640, 120)], ["DN nhận tái", 1050, P.v4, mh.toaVP(1050, 640, 120, { than: P.v1, bong: P.v2 })]].map(([a, cx, nen2, ve], k) => lop(`<circle cx="${cx}" cy="560" r="110" fill="${nen2}"/>` + ve, cx - 110, 450, 220, 220, k ? `Toà nhà ${a}` : `Hình người: ${a}`, "phang", A("pop", 700 + k * 500, 500)) + G("chuoi-t", cx - 150, 690, 300, 60, `<span style="width:100%;text-align:center">${a}</span>`, A("fade", 800 + k * 500, 400))).join("")
    + lop(mh.muiKhoi(350, 520, 560, 18, { mau: P.x3 }) + mh.muiKhoi(760, 930, 560, 18, { mau: P.v3 }), 340, 530, 600, 60, "Mũi tên: phí đi từ bên mua tới DNBH gốc, một phần rủi ro và phí đi tiếp tới DN nhận tái", "phang", A("wipe", 1100, 900))
    + T("chuoi-nhan", 330, 470, 210, "phí", A("fade", 1300, 300)) + T("chuoi-nhan vang", 690, 436, 300, "một phần rủi\u00a0ro + phí", A("fade", 1800, 300))
    + chip("DNBH gốc vẫn chịu trách nhiệm duy nhất với bên mua (khoản 1 Điều 29)", 120, 860, "chip vang dai-chip", A("rise", 2300, 500)), { ex: "data-hero" }));

  // ---- 31 VÍ DỤ BA BƯỚC ----
  S.push(() => { const hn = udH("legal-counsel_kdnh", 240);
    sec2("noi-dung", "sang", nc(30), nen(NEN.dat(760)) + dau("3.4 · Ví dụ", "DNBH A [nhượng tái] cho công ty B", "A chia bớt rủi ro sang B.", 31)
      + [["01", "X mua bảo hiểm", "đóng phí cho DNBH A"], ["02", "DNBH A nhận rủi ro", "cam kết bồi thường"], ["03", "A nhượng một phần", "A vẫn chịu trách nhiệm với X"]].map(([so, a, b], k) => { const x = 120 + k * 580, t0 = 500 + k * 600;
        return khoi(x + 12, 342, 520, 620, "bong", "Bóng thẻ", A("rise", t0, 450)) + khoi(x, 330, 520, 620, "the-trang", `Bước ${so}`, A("rise", t0, 450)) + khoi(x, 330, 520, 330, "nen-xanh-nhat", `Nền bước ${so}`, A("rise", t0, 450))
          + (k === 0 ? ud("legal-counsel_kdnh", x + 140, Math.round(650 - hn), 240, "Minh hoạ: anh X mua bảo hiểm", A("pop", t0 + 200, 500))
            : lop(k === 1 ? mh.toaVP(x + 260, 640, 170) : mh.toaVP(x + 170, 640, 150) + mh.toaVP(x + 380, 640, 130, { than: P.v1, bong: P.v2 }) + mh.muiKhoi(x + 255, x + 305, 480, 12, { mau: P.v2 }), x + 40, 370, 440, 290, k === 1 ? "Minh hoạ: toà nhà DNBH A" : "Minh hoạ: DNBH A chuyển một phần sang toà nhà vàng của công ty B", "phang", A("pop", t0 + 200, 500)))
          + chip(`Bước ${so}`, x + 30, 690, k === 2 ? "chip vang" : "chip", A("pop", t0 + 300, 300)) + T("buoc-t", x + 30, 760, 460, a, A("fade", t0 + 350, 400)) + T("buoc-m", x + 30, 820, 460, b, A("fade", t0 + 450, 400)); }).join("")
      + lop(mh.muiKhoi(650, 690, 640, 14, { mau: P.v2 }) + mh.muiKhoi(1230, 1270, 640, 14, { mau: P.v2 }), 640, 615, 640, 50, "Mũi tên nối các bước", "phang", A("fade", 1900, 400))); });

  // ---- 32 CÂY PHÂN LOẠI — khối tô đặc ----
  S.push(() => sec2("noi-dung", "sang", nc(31), nen(NEN.tron()) + dau("3.4 · Phân loại", "Hai nhánh: [tỷ lệ] và [phi tỷ lệ]", "Chia theo STBH, hay theo tổn thất.", 32)
    + lop(`<path d="M960 420 V460 M540 460 H1380 M540 460 V500 M1380 460 V500 M540 590 V630 M330 630 H750 M330 630 V670 M750 630 V670 M1380 590 V630 M1170 630 H1590 M1170 630 V670 M1590 630 V670" fill="none" stroke="${P.phu}" stroke-width="3"/>`, 320, 410, 1280, 270, "Đường nối cây phân loại", "phang", A("fade", 900, 600))
    + khoi(740, 330, 440, 90, "khoi-goc", "Gốc cây", A("pop", 400, 400)) + G("goc-t", 740, 330, 440, 90, `<span style="width:100%;text-align:center">Tái bảo hiểm</span>`, A("pop", 400, 400))
    + [[340, "khoi-xanh", "Tỷ lệ", ""], [1180, "khoi-vang", "Phi tỷ lệ", " toi"]].map(([x, c, s, k], j) => khoi(x, 500, 400, 90, c, s, A("pop", 700 + j * 200, 400)) + G(`nhanh-t${k}`, x, 500, 400, 90, `<span style="width:100%;text-align:center">${s}</span>`, A("pop", 700 + j * 200, 400))).join("")
    + [["Số thành", "một tỷ lệ chung", 330, "x"], ["Mức dôi", "STBH vượt mức giữ\u00a0lại", 750, "x"], ["Vượt mức bồi\u00a0thường", "tổn thất vượt\u00a0ngưỡng", 1170, "v"], ["Vượt mức tỷ\u00a0lệ bồi\u00a0thường", "tỷ lệ tổn thất vượt\u00a0ngưỡng", 1590, "v"]].map(([a, b, cx, m], j) => { const t0 = 1200 + j * 250;
      return khoi(cx - 195, 670, 390, 240, "la-the", a, A("rise", t0, 400)) + khoi(cx - 195, 670, 390, 14, m === "x" ? "dai-x" : "dai-v", "Dải màu nhánh", A("rise", t0, 400)) + `<div class="cap" style="left:${cx - 170}px;top:706px;width:340px"><b data-t class="la-t trai" ${A("fade", t0 + 100, 300)}>${esc(a)}</b><span data-t class="la-m trai" ${A("fade", t0 + 200, 300)}>${esc(b)}</span></div>`; }).join("")));

  // ---- 33 SỐ THÀNH — ba thanh 35/65 + vòng tròn tỷ lệ ----
  S.push(() => { const g = 0.35 * 2 * Math.PI, R = 170, cx = 1580, cy = 610, px = cx + R * Math.sin(g), py = cy - R * Math.cos(g);
    sec2("noi-dung", "sang", nc(32), nen(NEN.goc()) + dau("3.4 · Tái bảo hiểm số thành", "Số thành: [một tỷ lệ] cho mọi thứ", "Tỷ lệ chốt khi ký, áp như nhau cho mọi khoản.", 33) + panel(100, 316, 1250, 620)
      + ["STBH", "Phí bảo hiểm", "Bồi thường"].map((r, k) => { const y = 400 + k * 150; return T("dong-t", 120, y + 20, 280, r, A("fade", 500 + k * 200, 300)) + lop(`<rect x="420" y="${y}" width="${0.35 * 860}" height="84" rx="10" fill="${P.x1}"/><rect x="${426 + 0.35 * 860}" y="${y}" width="${0.65 * 860 - 6}" height="84" rx="10" fill="${P.v2}"/>`, 420, y, 860, 84, `Thanh ${r}: 35 % giữ lại, 65 % nhượng`, "phang", A("wipe", 600 + k * 250, 600)); }).join("")
      + T("nhan-xanh", 420, 340, 420, "DN nhượng giữ 35 %", A("fade", 1400, 300)) + T("nhan-vang phai", 820, 340, 460, "DN nhận tái chịu 65 %", A("fade", 1500, 300))
      + lop(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${P.v2}"/><path d="M${cx} ${cy} L${cx} ${cy - R} A${R} ${R} 0 0 1 ${px.toFixed(1)} ${py.toFixed(1)} Z" fill="${P.x1}"/><circle cx="${cx}" cy="${cy}" r="${R * 0.55}" fill="${P.nen}"/>`, cx - R, cy - R, 2 * R, 2 * R, "Vòng tròn: 35 % giữ lại, 65 % nhượng tái", "phang", A("grow", 1700, 700))
      + T("vong-so", cx - 90, cy - 40, 180, "35/65", `data-dl ${A("fade", 2100, 300)}`)
      + T("nguon", 120, 1000, 1680, "Tỷ lệ 35 / 65 là số liệu của Bài 11.")); });

  // ---- 34 BÀI 11 ----
  S.push(() => sec2("bang", "sang", nc(33), nen(NEN.tron()) + dau("Bài 11 · Tái bảo hiểm số thành", "Bài 11: chia theo [tỷ lệ 35 / 65]", "Áp cùng tỷ lệ cho STBH, phí và thiệt hại của từng hợp đồng.", 34)
    + khoi(120, 330, 560, 620, "the-xanh-nhat", "Thẻ đề bài", A("rise", 400, 500)) + T("de-nhan", 150, 360, 500, "Đề bài", A("fade", 500, 300))
    + T("de-chu", 150, 420, 500, "5 nghiệp vụ hoả hoạn, tái bảo hiểm số thành: giữ 35 %, nhượng 65 %.", A("fade", 600, 500))
    + khoi(150, 800, 500, 120, "dai", "Dải câu hỏi", A("wipe", 900, 400)) + G("dai-t", 170, 800, 460, 120, "Hãy phân chia STBH, phí BH và bồi thường.", A("fade", 1000, 300))
    + bangSo(760, 330, ["HĐ gốc", "Số tiền BH", "Phí BH", "Thiệt hại"], [180, 300, 260, 300], [["1", "10.000.000", "15.000", "8.000.000"], ["2", "8.000.000", "12.000", "4.000.000"], ["3", "7.000.000", "10.500", "3.200.000"], ["4", "4.000.000", "6.000", "2.500.000"], ["5", "1.700.000", "2.550", "500.000"]], 1100)
    + T("nguon", 760, 870, 1040, "Đơn vị: đồng")));

  // ---- 35 MỨC DÔI — HERO nền đậm: cột chồng lớn trên khối xanh, nhãn từng đoạn ----
  S.push(() => { const day = 960, top = 360, H = day - top, st = 18000, y = (v) => day - (H * v) / st;
    sec2("noi-dung", "dam", nc(34), nen(mh.cham(120, 990, 6, 2, 26, 5, P.v2))
      + chip("3.4 · Mức dôi", 120, 80, "chip vang", A("fade", 0, 400)) + `<h1 class="td sang" data-t data-tieu-de ${A("rise", 100, 600)} style="left:120px;top:132px;width:1500px">${em("Mức dôi: tính theo [“lần”]")}</h1>` + T("dan sang", 120, 246, 1560, "Phần vượt tính bằng bội số mức giữ lại.", A("fade", 350, 500)) + T("so-trang sang", 1600, 84, 200, `35 / ${TONG}`)
      + khoi(880, 330, 480, 690, "panel-toi", "Khối nền cột", A("fade", 200, 500))
      + khoi(120, 340, 700, 420, "the-toi", "Thẻ ví dụ", A("rise", 400, 500)) + T("de-nhan sang", 150, 370, 640, "Ví dụ", A("fade", 500, 300)) + T("de-chu sang", 150, 430, 640, "Loại B: STBH 18.000, giữ lại 500 (nghìn USD).", A("fade", 600, 400))
      + khoi(150, 620, 640, 100, "dai-vang", "Dải công thức", A("wipe", 900, 400)) + G("dai-vang-t", 170, 620, 600, 100, "Mức tái = STBH − mức giữ lại", A("fade", 1000, 300))
      + lop(`<rect x="940" y="${y(500)}" width="360" height="${day - y(500)}" fill="${P.nen}"/><rect x="940" y="${y(8000)}" width="360" height="${y(500) - y(8000) - 4}" rx="6" fill="${P.v2}"/><rect x="940" y="${y(18000)}" width="360" height="${y(8000) - y(18000) - 4}" rx="6" fill="${P.x3}"/>` + [250, 4250, 13000].map((v) => `<path d="M1310 ${y(v)} H1370" stroke="${P.x4}" stroke-width="3"/>`).join(""), 930, 350, 450, 620, "Cột STBH 18.000: 500 giữ lại, 7.500 dôi thứ nhất, 10.000 dôi thứ hai", "phang", A("wipe", 1200, 900))
      + T("so-cot toi", 940, y(13000) - 30, 360, "10.000", A("fade", 1700, 300)) + T("so-cot toi", 940, y(4250) - 30, 360, "7.500", A("fade", 1600, 300))
      + T("dong-t sang", 1380, y(250) - 22, 420, "Giữ lại: 1 lần = 500", A("fade", 1500, 300)) + T("dong-t v3", 1380, y(4250) - 22, 420, "Dôi 1: 15 lần = 7.500", A("fade", 1800, 300)) + T("dong-t x3", 1380, y(13000) - 22, 420, "Dôi 2: 20 lần = 10.000", A("fade", 2000, 300)), { ex: "data-hero" }); });

  // ---- 36 BÀI 12 ----
  S.push(() => sec2("bang", "sang", nc(35), nen(NEN.tron()) + dau("Bài 12 · Tái bảo hiểm mức dôi", "Bài 12: [sáu hợp đồng], ba loại rủi ro", "Mỗi loại có mức giữ lại riêng; dôi 1 là 15 lần, dôi 2 là 20 lần.", 36)
    + khoi(120, 330, 560, 640, "the-xanh-nhat", "Thẻ đề bài", A("rise", 400, 500)) + T("de-nhan", 150, 360, 500, "Mức giữ lại", A("fade", 500, 300))
    + [["A", "Thông thường", "1.000.000 USD"], ["B", "Công nghiệp", "500.000 USD"], ["C", "Thương nghiệp", "800.000 USD"]].map(([l, a, b], k) => { const yy = 430 + k * 110; return khoi(150, yy, 80, 80, "o-loai", `Loại ${l}`, A("pop", 600 + k * 150, 300)) + G("o-loai-t", 150, yy, 80, 80, `<span style="width:100%;text-align:center">${l}</span>`, A("pop", 600 + k * 150, 300)) + `<div class="cap" style="left:250px;top:${yy + 2}px;width:400px"><b data-t class="dong-t" ${A("fade", 650 + k * 150, 300)}>${a}</b><span data-t class="dong-m" ${A("fade", 700 + k * 150, 300)}>${b}</span></div>`; }).join("")
    + khoi(150, 790, 500, 150, "dai", "Dải câu hỏi", A("wipe", 1200, 400)) + G("dai-t", 170, 790, 460, 150, "Hãy phân chia STBH, phí BH và bồi thường.", A("fade", 1300, 300))
    + bangSo(760, 330, ["HĐ · loại", "STBH", "Phí BH", "Thiệt hại"], [220, 280, 240, 300], [["1 · A", "16.000", "16", "5.000"], ["2 · C", "10.000", "30", "8.000"], ["3 · A", "800", "0,8", "600"], ["4 · B", "18.000", "90", "13.000"], ["5 · C", "4.000", "12", "–"], ["6 · B", "7.000", "35", "2.000"]], 1400)
    + T("nguon", 760, 940, 1040, "Đơn vị: 1.000 USD")));

  // ---- 37 VƯỢT MỨC BỒI THƯỜNG — thanh tổn thất 6 triệu ----
  S.push(() => { const X = 220, W = 1470, k = W / 6;
    sec2("noi-dung", "sang", nc(36), nen(NEN.dat(800)) + dau("3.4 · Vượt mức", "Vượt mức bồi thường: [trả phần vượt]", "DN nhận tái trả phần vượt mức giữ lại.", 37) + panel(100, 470, 1720, 290)
      + hopBadge(120, 340, "flame", P.d1, 80) + G("vd-dong", 220, 340, 1580, 80, "Một vụ tổn thất 6 triệu; hợp đồng “4 triệu vượt 1 triệu”.", A("fade", 500, 400))
      + lop(`<rect x="${X}" y="500" width="${k - 4}" height="130" rx="12" fill="${P.x1}"/><rect x="${X + k}" y="500" width="${4 * k - 4}" height="130" rx="12" fill="${P.v2}"/><rect x="${X + 5 * k}" y="500" width="${k}" height="130" rx="12" fill="${P.ke}"/>` + Array.from({ length: 7 }, (_, i) => `<rect x="${X + i * k - 2}" y="650" width="4" height="26" fill="${P.phu}"/>`).join(""), X, 500, W + 4, 180, "Thanh tổn thất 6 triệu: 1 triệu giữ lại, 4 triệu DN nhận tái trả, 1 triệu vượt trở lại DN nhượng", "phang", A("wipe", 800, 1100))
      + Array.from({ length: 7 }, (_, i) => T("thuoc", X + i * k - 40, 690, 80, `${i}`, A("fade", 1000, 300))).join("") + T("thuoc-don", X + W + 24, 690, 100, "triệu", A("fade", 1000, 300))
      + [["1 triệu", "DN\u00a0nhượng giữ\u00a0lại", X, k, "xanh"], ["4 triệu", "DN nhận tái trả", X + k, 4 * k, "vang"], ["1 triệu", "trở\u00a0lại DN\u00a0nhượng", X + 5 * k, k, ""]].map(([a, b, x, w, c], j) => `<div class="cap" style="left:${x}px;top:830px;width:${w}px"><b data-t class="dong-t can ${c}" ${A("fade", 0, 300)} data-click="${j + 1}">${a}</b><span data-t class="dong-m can" ${A("fade", 80, 300)} data-click="${j + 1}">${b}</span></div>`).join("")); });

  // ---- 38 VƯỢT MỨC TỶ LỆ — thanh 0–100 % cả kỳ ----
  S.push(() => { const X = 120, W = 1680;
    sec2("noi-dung", "sang", nc(37), nen(NEN.dat(880)) + dau("3.4 · Loại thứ tư", "Vượt mức tỷ lệ: tính theo [cả kỳ]", "Ngưỡng tính trên cả kỳ, không theo từng vụ.", 38)
      + khoi(120, 330, 1680, 84, "the-xanh-nhat", "Dải công thức", A("wipe", 400, 400)) + G("cong-t", 150, 330, 1620, 84, "Tỷ lệ tổn thất = bồi thường / phí cả kỳ", A("fade", 500, 300))
      + lop(`<rect x="${X}" y="540" width="${0.7 * W - 4}" height="130" rx="12" fill="${P.x1}"/><rect x="${X + 0.7 * W}" y="540" width="${0.15 * W - 4}" height="130" rx="12" fill="${P.v2}"/><rect x="${X + 0.85 * W}" y="540" width="${0.15 * W}" height="130" rx="12" fill="${P.ke}"/><path d="M${X + 0.7 * W - 2} 510 V700 M${X + 0.85 * W - 2} 510 V700" stroke="${P.muc}" stroke-width="4"/>`, X, 505, W, 200, "Thanh tỷ lệ tổn thất: 0–70 % DN nhượng, 70–85 % DN nhận tái, trên 85 % trở lại DN nhượng", "phang", A("wipe", 800, 1100))
      + T("nhan-den phai", X + 0.7 * W - 380, 460, 360, "VD: ngưỡng 70 %", A("fade", 1600, 300)) + T("nhan-den phai", X + 0.85 * W - 222, 460, 200, "85 %", A("fade", 1700, 300))
      + [["0 – 70 %", "nhượng tự trả", X, 0.7 * W, "xanh"], ["70 – 85 %", "nhận tái trả", X + 0.7 * W, 0.15 * W, "vang"], ["trên 85 %", "trở lại nhượng", X + 0.85 * W, 0.15 * W, ""]].map(([a, b, x, w, c], j) => `<div class="cap" style="left:${x}px;top:720px;width:${w}px"><b data-t class="dong-t can ${c}" ${A("fade", 1800 + j * 250, 300)}>${a}</b><span data-t class="dong-m can" ${A("fade", 1850 + j * 250, 300)}>${b}</span></div>`).join("")
      + khoi(120, 900, 1680, 84, "dai", "Dải ví dụ", A("wipe", 2600, 400)) + G("dai-t", 150, 900, 1620, 84, "VD: phí 100, bồi thường 80 → nhượng chịu 70, nhận tái trả 10.", A("fade", 2700, 300))); });

  // ---- 39 LÀM VIỆC NHÓM — nền đậm, ảnh nhóm sinh viên khung bo, hai đề tài bên trái ----
  S.push(() => sec2("noi-dung", "dam", nc(38), nen(mh.cham(120, 1000, 6, 2, 26, 5, P.v2))
    + chip("Làm việc nhóm", 120, 80, "chip vang", A("fade", 0, 400)) + `<h1 class="td sang" data-t data-tieu-de ${A("rise", 100, 600)} style="left:120px;top:132px;width:700px">${em("Hai đề tài [sau giờ học]")}</h1>` + T("so-trang sang", 1600, 84, 200, `39 / ${TONG}`)
    + T("dan sang", 120, 330, 700, "Chọn một trong hai; nộp theo hướng dẫn của giảng viên.", A("fade", 350, 500))
    + khoi(890, 330, 1000, 640, "panel-toi", "Mảng lệch sau ảnh", A("pop", 500, 600)) + chup("nhom-bo.png", 860, 300, 1000, 640, "Ảnh: một nhóm sinh viên cùng bàn bài quanh bàn đứng", A("pop", 600, 700))
    + [["01", "Tìm một hợp đồng BHTM thực tế và nhận xét nội\u00a0dung của hợp\u00a0đồng", 470], ["02", "Thực trạng triển khai BHTM ở Việt\u00a0Nam thời\u00a0gian\u00a0qua", 720]].map(([so, a, yy], k) => { const t0 = 1000 + k * 500;
      return T("de-so sang", 120, yy, 140, so, `data-dl ${A("pop", t0, 300)}`) + T("de-tai sang", 270, yy + 6, 540, a, A("fade", t0 + 100, 400)) + (k ? `<div class="vach toi" style="left:120px;top:${yy - 30}px;width:690px"></div>` : ""); }).join("")
    + T("nguon sang", 860, 975, 1000, "Ảnh: Akson · Unsplash")));

  // ---- 40–44 CÂU HỎI ----
  const CH = [["Luật KDBH phân loại HĐBH theo tiêu chí nào?", ["Số tiền bảo hiểm", "Đối tượng bảo hiểm", "Thời hạn bảo hiểm", "Kỹ thuật bảo hiểm"]], ["DNBH có quyền nào?", ["Kiểm tra, giám sát việc thực hiện hợp đồng đại lý bảo hiểm", "Cho cán bộ, nhân viên làm đại lý cho chính DNBH đó", "Yêu cầu đại lý phải có hợp đồng bảo hiểm trước khi thành đại lý chính thức", "Cả A, B đều đúng"]], ["DNBH có nghĩa vụ gì?", ["Giải thích điều kiện, điều khoản BH; quyền, nghĩa vụ của bên mua", "Trả tiền BH kịp thời cho người thụ hưởng hoặc bồi thường cho người được BH", "Ứng tiền cho bên mua đóng phí hoặc giảm phí khi họ khó khăn tài chính", "Cả A và B đều đúng"]], ["Trung thực tuyệt đối áp cho ai?", ["Doanh nghiệp bảo hiểm", "Doanh nghiệp bảo hiểm và đại lý bảo hiểm", "Doanh nghiệp bảo hiểm và người tham gia bảo hiểm", "Doanh nghiệp bảo hiểm và người thụ hưởng"]], ["Điền vào chỗ trống", ["Công ty chứng khoán", "Công ty tài chính", "Doanh nghiệp bảo hiểm", "Ngân hàng thương mại"]]];
  CH.forEach(([q, ds], k) => S.push(() => mHoi(k + 1, q, ds, nc(39 + k), k === 4 ? "HĐBH là sự thoả thuận giữa bên mua BH và DNBH, theo đó bên mua BH phải đóng phí BH, ………… phải trả tiền BH cho người thụ hưởng hoặc bồi thường cho người được BH khi xảy ra sự kiện BH." : "")));

  // ---- 45 TỔNG KẾT — nền đậm ----
  S.push(() => sec2("cau", "dam", nc(44), nen(`<circle cx="1460" cy="575" r="590" fill="${P.x2}"/>` + mh.cham(120, 96, 5, 3, 26, 5, P.v2))
    + `<h1 class="cau-dam" data-t data-tieu-de ${A("rise", 300, 700)} style="left:116px;top:260px;width:720px">${em("BHTM: [phí\u00a0chắc\u00a0chắn] đổi cam\u00a0kết bồi\u00a0thường")}</h1>` + T("cau-dam-phu", 118, 660, 680, "Bốn điều mang về.", A("fade", 900, 500))
    + [["scale", "Thi luật: năm nguyên\u00a0tắc ở\u00a0Điều\u00a016"], ["gavel", "Bắt buộc: chỉ các loại luật\u00a0liệt\u00a0kê"], ["coins", "STBH dưới giá trị → chia\u00a0tỷ\u00a0lệ"], ["arrows-split", "Tái BH: DNBH gốc vẫn chịu\u00a0trách\u00a0nhiệm"]].map(([i, a], k) => { const y = 250 + k * 170, t0 = 1100 + k * 250;
      return khoi(1080, y, 720, 140, "tk-the", `Ý ${k + 1}`, A("slide-r", t0, 450)) + T("tk-so", 1110, y + 36, 90, `0${k + 1}`, A("slide-r", t0, 450)) + hopBadge(1210, y + 25, i, P.v2, 90).replace("data-lap", `data-lap ${A("slide-r", t0, 450)}`) + G("tk-t", 1320, y, 460, 140, esc(a), A("slide-r", t0, 450)); }).join(""), { ex: "data-khong-hinh" }));

  // ---- 46 KẾT ----
  S.push(() => { const vom = (x, y, w, h) => `M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h} Z`;
    sec2("bia", "sang", nc(45), nen(`<path d="${vom(1080, 160, 760, 900)}" fill="${P.x4}"/>` + mh.cham(120, 1000, 6, 2, 26, 5, P.v2) + mh.saoCum(940, 220, 28))
      + lop(`<path d="${vom(996, 86, 808, 948)}" fill="none" stroke="${P.v2}" stroke-width="6"/>`, 990, 80, 820, 960, "Viền vòm vàng bao quanh ảnh", "phang", `data-lap ${A("fade", 500, 700)}`)
      + chup("bia-vom.png", 1020, 110, 760, 900, "Ảnh: bàn tay nâng ngôi nhà mô hình — khép lại bằng chính hình bìa", `data-lap ${A("rise", 0, 900)}`)
      + chip("Bảo hiểm thương mại · Chương 3", 120, 240, "chip", A("fade", 300, 400))
      + `<h1 class="bia-td" data-t data-tieu-de ${A("rise", 600, 700)} style="left:116px;top:388px;width:820px">${em("Còn tiếp: [Chương 4]")}</h1>`
      + `<div class="gach" data-l="gach-ket" data-alt="Gạch vàng" ${A("wipe", 1000, 400)} style="left:120px;top:720px;width:150px;height:12px"></div>` + T("bia-mo", 120, 768, 720, "Hỏi đáp · đề tài nhóm nộp theo hướng dẫn của giảng viên", A("fade", 1100, 500))); });

  const THU_TU = [G_BIA, S[0], S[1], S[2], MP01, S[3], S[4], G_SODO, S[5], S[6], S[7], S[8], S[9], S[10], S[11], S[12], G_SOSANH, S[13], S[14], S[15], G_TRICH, S[16], S[17], G_SOLON, S[18], G_BANG, S[19], S[20], S[21], S[22], S[23], S[24], S[25], S[26], S[27], S[28], S[29], S[30], S[31], S[32], S[33], S[34], S[35], S[36], S[37], S[38]];
  THU_TU.forEach((f) => f());
  // ---- CSS ----
  ghi(path.join(D, "style.css"), `section.s{background:${P.nen};color:${P.muc}}section.s.dam{background:${P.x1};color:${P.nen}}
section.s > div, section.s > h1{position:absolute}
[data-t]{text-wrap:pretty}.td,.bia-td,.mp-t,.hoi-td{text-wrap:balance}
em{font-style:normal;color:${P.x2}}em.v{color:${P.v1}}.dam em,.anh em{color:${P.x3}}.anh em.v{color:${P.v3}}
section.s.anh{background:${P.x1}}.td.sang{color:${P.nen}}.so-trang.sang,.dan.sang{color:${P.x4}}.trich.sang{color:${P.nen}}.trich.sang mark{background:none;color:${P.v3}}.trich.sang mark.xanh{background:none;color:${P.x3}}
.giua{display:flex;align-items:center}
.chip{font:700 28px/1 'Be Vietnam Pro';letter-spacing:.08em;text-transform:uppercase;color:${P.nen};background:${P.x1};padding:11px 18px 10px;border-radius:6px;white-space:nowrap;width:auto !important}
.chip.vang{background:${P.v3};color:${P.muc}}.chip.cot{width:156px !important;text-align:center;padding:10px 0;letter-spacing:0;text-transform:none;font-size:26px}
.chip.nt{font-size:30px;letter-spacing:0;text-transform:none;padding:10px 16px 9px}
.chip.vien{background:${P.v4};color:${P.muc}}
.td{font:700 72px/1.1 'Lora';color:${P.muc}}.dan{font:400 34px/1.4 'Be Vietnam Pro';color:${P.phu}}
.so-trang{font:600 24px/1 'Be Vietnam Pro';color:${P.phu};text-align:right}
.nguon{font:400 26px/1.4 'Be Vietnam Pro';color:${P.phu}}
.the,.the-trang{background:${P.trang};border-radius:20px}.the-vang{background:${P.v4};border-radius:24px}.bong{background:${P.x3};border-radius:22px}
.the-noi{background:${P.trang};border-radius:20px;border:2px solid ${P.ke}}.noi-t{font:800 32px/1.2 'Be Vietnam Pro';color:${P.x1}}.noi-m{font:400 30px/1.3 'Be Vietnam Pro';color:${P.phu}}
.gach{background:${P.v2};border-radius:6px}.vach{height:2px;background:${P.ke}}
.bia-chuong{font:700 48px/1.2 'Lora';color:${P.v1}}.bia-td{position:absolute;font:700 132px/1.06 'Lora';color:${P.muc}}
.bia-mo{font:400 32px/1.45 'Be Vietnam Pro';color:${P.phu}}.bia-by{font:600 28px/1.4 'Be Vietnam Pro';color:${P.phu}}
.o-so{background:${P.v2};border-radius:24px}.mp-so{font:700 200px/1.15 'Lora';color:${P.x1};text-align:center}
.mp-t{position:absolute;font:700 88px/1.08 'Lora';color:${P.nen}}.mp-m{font:400 32px/1.45 'Be Vietnam Pro';color:${P.x4}}
.la-t{font:800 32px/1.25 'Be Vietnam Pro';color:${P.x1};text-align:center}.la-m{font:400 32px/1.35 'Be Vietnam Pro';color:${P.phu};text-align:center}
.cap > b,.cap > span{display:block}.cap > span{margin-top:8px}
.nhan-vang{font:800 36px/1.2 'Be Vietnam Pro';color:${P.v1}}.dk-vang{font:600 32px/1.3 'Be Vietnam Pro';color:${P.v1}}
.lich{border:3px solid ${P.x4}}.lich-so{font:700 80px/1.15 'Lora';color:${P.v3}}.lich-m{font:700 34px/1.3 'Be Vietnam Pro';color:${P.x4}}.lich-o{font:700 40px/1 'Lora';color:${P.nen}}.lich-o.toi{color:${P.x1}}.lich-nhan{font:800 32px/1.2 'Be Vietnam Pro';color:${P.x1}}.lich-nhan.vang{color:${P.v1}}
.tren-thanh{font:800 28px/1 'Be Vietnam Pro';color:${P.x1}}.tren-thanh.vang{color:${P.v1}}.vd-ct{font:600 32px/1.2 'Be Vietnam Pro';color:${P.muc}}.vd-ct b{color:${P.v1}}.vd-ct .d{color:${P.d0}}.vd-ct i{font-style:normal;font-weight:800;color:${P.x1}}
.nhan-do{font:800 36px/1.2 'Be Vietnam Pro';color:${P.d0}}.dk-do{font:600 32px/1.3 'Be Vietnam Pro';color:${P.d0}}
.so-to{font:700 330px/1 'Lora';color:${P.x1}}.don-vi{font:700 64px/1 'Lora';color:${P.v1}}
.dai{background:${P.x1};border-radius:0 0 24px 24px}.dai-t{font:600 30px/1.3 'Be Vietnam Pro';color:${P.nen}}
.dong-t{font:800 34px/1.25 'Be Vietnam Pro';color:${P.muc}}.dong-t.do{color:${P.d0}}.dong-m{font:400 32px/1.35 'Be Vietnam Pro';color:${P.phu}}
.bh{background:${P.x1};border-radius:14px 14px 0 0}.bh-t{font:600 30px/1.2 'Be Vietnam Pro';color:${P.nen}}
.hang{background:${P.trang};border-bottom:3px solid ${P.ke}}.hang.nhan{background:${P.v4}}
.tab-t{font:800 32px/1.15 'Be Vietnam Pro';color:${P.nen}}.o-t{font:400 34px/1.3 'Be Vietnam Pro';color:${P.muc}}.o-nhan{font:600 28px/1 'Be Vietnam Pro';color:${P.phu}}.o-mau{display:inline-block;width:34px;height:16px;border-radius:4px;margin:0 12px 0 22px}.o-mau.x{background:${P.x4};margin-left:0}.o-mau.v{background:${P.v2}}.o-mau.d{width:4px;height:30px;background:${P.d4}}.o-do{font:700 28px/1 'Be Vietnam Pro';color:${P.d0}}
.trich{font:700 42px/1.45 'Lora';color:${P.muc}}
.trich mark{background:${P.v4};color:${P.v1};padding:0 2px}.trich mark.xanh{background:${P.x4};color:${P.x1}}
.dau-xanh{background:${P.x1};border-radius:20px 20px 0 0}.dau-vang{background:${P.v2};border-radius:20px 20px 0 0}
.the-td{font:700 44px/1.15 'Lora';color:${P.nen}}.the-td.toi{color:${P.muc}}
.the-nhan{font:700 28px/1.2 'Be Vietnam Pro';letter-spacing:.06em;text-transform:uppercase;color:${P.x1}}.the-chu{font:400 34px/1.35 'Be Vietnam Pro';color:${P.muc}}
.hoi-so{font:700 160px/1 'Lora';color:${P.x1}}.hoi-td{position:absolute;font:700 60px/1.15 'Lora';color:${P.muc}}
.pa{background:${P.trang};border-radius:16px;border:2px solid ${P.ke}}.pa-o{border-radius:16px 0 0 16px;background:${P.x1}}
.vd{background:${P.x1};border-radius:30px}.vd-x{background:${P.x4};border-radius:12px}.vd-v{background:${P.v4};border-radius:12px}.vd-d{background:${P.d4};border-radius:12px}.vd-k{background:${P.v3};border-radius:12px}
.vd-t{font:700 26px/1 'Be Vietnam Pro';color:${P.nen};text-transform:uppercase;letter-spacing:.06em}.vd-x-t,.vd-v-t,.vd-k-t{font:800 32px/1 'Be Vietnam Pro';color:${P.muc}}.vd-d-t{font:800 32px/1 'Be Vietnam Pro';color:${P.d0}}
.pa-chu{font:700 60px/1.15 'Lora';color:${P.nen};text-align:center}.pa-t{font:600 36px/1.3 'Be Vietnam Pro';color:${P.muc}}

.hoi-td.dien{font-size:40px;line-height:1.35}
.cau-anh{position:absolute;font:700 84px/1.12 'Lora';color:${P.nen};text-wrap:balance}.anh .cau-anh em{color:${P.v3}}.cau-anh-phu{font:500 36px/1.4 'Be Vietnam Pro';color:${P.x4}}
.hang-mt{background:${P.trang};border-radius:18px}.hang-mt.le{background:${P.x4}}.mt-so{font:700 48px/1.4 'Lora';color:${P.v1}}.mt-v{font:800 36px/1.2 'Be Vietnam Pro';color:${P.x1}}.mt-m{font:400 34px/1.3 'Be Vietnam Pro';color:${P.muc}}
.kc-so{font:700 96px/1.1 'Lora';color:${P.v3}}.kc-so.toi{color:${P.x1}}.kc-t{font:700 40px/1.15 'Lora';color:${P.muc}}.kc-m{font:400 30px/1.35 'Be Vietnam Pro';color:${P.phu}}
.ls-nam{font:700 56px/1.1 'Lora';color:${P.x1}}.ls-nam.vang{color:${P.v1}}.vn-nam{font:700 64px/1.1 'Lora';color:${P.x1}}.vn-nam.nhat{color:${P.phu}}
.vn-the{background:${P.trang};border-radius:20px;border:2px solid ${P.ke}}.vn-the.dac{background:${P.x1};border-color:${P.x1}}.vn-t{font:800 30px/1.25 'Be Vietnam Pro';color:${P.x1}}.vn-t.sang{color:${P.nen}}.vn-m{font:400 28px/1.35 'Be Vietnam Pro';color:${P.phu}}.vn-m.sang{color:${P.x4}}
.chu-lon{font:600 34px/1.3 'Be Vietnam Pro';color:${P.muc}}.so-lon{font:700 200px/1 'Lora'}.so-lon.xanh,.so-vua.xanh{color:${P.x1}}.so-lon.do,.so-vua.do{color:${P.d1}}.so-vua{font:700 80px/1 'Lora'}
.dai-nhat{background:${P.x4};border-radius:16px}.chot{font:700 34px/1.3 'Be Vietnam Pro';color:${P.x1}}.ev-t{font:600 34px/1.25 'Be Vietnam Pro';color:${P.muc}}
.pill-co{background:${P.x4};border-radius:34px}.pill-khong{background:${P.d4};border-radius:34px}.pill-co-t{font:800 32px/1 'Be Vietnam Pro';color:${P.x1}}.pill-khong-t{font:800 32px/1 'Be Vietnam Pro';color:${P.d0}}
.q-t{font:800 36px/1.2 'Be Vietnam Pro';color:${P.muc}}.q-m{font:400 32px/1.3 'Be Vietnam Pro';color:${P.phu}}.chip.do{background:${P.d0};color:${P.nen}}
.trich-vua{font:700 38px/1.45 'Lora';color:${P.muc}}.trich-vua.sang{color:${P.nen}}.ct-dau.sang{color:${P.v3}}.la-t.sang{color:${P.v3}}.la-m.sang{color:${P.x4}}.gach-doc{background:${P.v2};border-radius:5px}.the-xanh-nhat{background:${P.x4};border-radius:20px}.the-xanh{background:${P.x1};border-radius:20px}
.dai-do{background:${P.d4};border-radius:16px}.dai-do-t{font:700 32px/1.3 'Be Vietnam Pro';color:${P.d0}}
.venn-t{font:800 32px/1.2 'Be Vietnam Pro';color:${P.x1};text-align:center}.venn-t.dac{color:${P.muc}}.venn-t.vang{color:${P.v1}}.venn-t.nho{font-size:30px}
.so-khong-lo{font:700 360px/1 'Lora';color:${P.v3};text-align:right}.cau-dam{position:absolute;font:700 76px/1.12 'Lora';color:${P.nen};text-wrap:balance}.cau-dam-phu{font:400 34px/1.4 'Be Vietnam Pro';color:${P.x4}}
.nen-xanh-nhat{background:${P.x4};border-radius:20px 20px 0 0}.nhom-t{font:700 42px/1.15 'Lora';color:${P.muc}}.nhom-m{font:400 32px/1.3 'Be Vietnam Pro';color:${P.phu}}
.giay{background:${P.trang};border-radius:14px;border:2px solid ${P.ke}}.giay-bong{background:${P.x4};border-radius:14px}.tl-nhom{font:700 36px/1.2 'Lora';color:${P.x1}}.tl-so{font:700 44px/1.3 'Lora';color:${P.v1}}.tl-t{font:600 32px/1.25 'Be Vietnam Pro';color:${P.muc}}
.ct-t{font:800 32px/1.2 'Be Vietnam Pro';color:${P.x1}}.ct-t.sang{color:${P.nen}}.ct-m{font:400 28px/1.35 'Be Vietnam Pro';color:${P.phu}}.ct-m.sang{color:${P.x4}}.vd-dong{font:600 32px/1.3 'Be Vietnam Pro';color:${P.muc}}.the-gia{font:800 36px/1.2 'Be Vietnam Pro';color:${P.muc}}
.thanh-t{font:800 34px/1.2 'Be Vietnam Pro';color:${P.muc}}.thanh-t.sang{color:${P.nen}}.thanh-m{font:400 30px/1.3 'Be Vietnam Pro';color:${P.phu}}
.ct-chu{font:700 200px/1.2 'Lora';color:${P.nen};text-align:center}.ct-chu.toi{color:${P.muc}}.ct-dau{font:700 160px/1.2 'Lora';color:${P.v1};text-align:center}.dinh-nghia{font:600 32px/1.3 'Be Vietnam Pro';color:${P.x1}}
.cs-t{font:700 48px/1 'Lora';color:${P.nen}}.nhan-xanh{font:800 32px/1.2 'Be Vietnam Pro';color:${P.x1}}.nhan-do-dam{font:800 32px/1.2 'Be Vietnam Pro';color:${P.d0}}
.chuoi-t{font:800 32px/1 'Be Vietnam Pro';color:${P.nen}}.chuoi-nhan{font:700 30px/1.2 'Be Vietnam Pro';color:${P.x4};text-align:center}.chuoi-nhan.vang{color:${P.v3}}.chip.dai-chip{text-transform:none;letter-spacing:0;font-size:30px;padding:16px 22px}
.buoc-t{font:800 34px/1.2 'Be Vietnam Pro';color:${P.muc}}.buoc-m{font:400 30px/1.35 'Be Vietnam Pro';color:${P.phu}}
.khoi-goc{background:${P.x1};border-radius:16px}.goc-t{font:700 40px/1 'Lora';color:${P.nen}}.khoi-xanh{background:${P.x2};border-radius:16px}.khoi-vang{background:${P.v2};border-radius:16px}.nhanh-t{font:700 40px/1 'Lora';color:${P.nen}}.nhanh-t.toi{color:${P.muc}}
.la-the{background:${P.trang};border-radius:16px;border:2px solid ${P.ke}}.dai-x{background:${P.x2};border-radius:16px 16px 0 0}.dai-v{background:${P.v2};border-radius:16px 16px 0 0}
.trai{text-align:left !important}.phai{text-align:right !important}.vong-so{font:700 48px/1.6 'Lora';color:${P.x1};text-align:center}
.de-nhan{font:800 32px/1.2 'Be Vietnam Pro';letter-spacing:.06em;text-transform:uppercase;color:${P.x1}}.de-chu{font:400 34px/1.4 'Be Vietnam Pro';color:${P.muc}}
.o-loai{background:${P.x1};border-radius:14px}.o-loai-t{font:700 44px/1 'Lora';color:${P.nen}}.so-cot{font:700 40px/1.5 'Lora';color:${P.nen};text-align:center}.so-cot.toi{color:${P.muc}}
.dong-t.xanh{color:${P.x1}}.dong-t.vang{color:${P.v1}}.thuoc{font:600 28px/1 'Be Vietnam Pro';color:${P.phu};text-align:center}.thuoc-don{font:600 28px/1 'Be Vietnam Pro';color:${P.phu}}
.cong-t{font:700 34px/1.2 'Be Vietnam Pro';color:${P.x1}}.nhan-den{font:800 30px/1.2 'Be Vietnam Pro';color:${P.muc}}.de-so{font:700 96px/1 'Lora';color:${P.v1}}.de-tai{font:700 40px/1.25 'Lora';color:${P.muc}}
.tk-the{background:${P.x1};border-radius:18px}.tk-so{font:700 48px/1.4 'Lora';color:${P.v3}}.tk-t{font:700 32px/1.25 'Be Vietnam Pro';color:${P.nen}}
.panel-nen{background:${P.x4};border-radius:28px}.panel-toi{background:${P.x2};border-radius:28px}.the-toi{background:${P.x2};border-radius:20px}.dai-vang{background:${P.v2};border-radius:0 0 20px 20px}.dai-vang-t{font:700 32px/1.3 'Be Vietnam Pro';color:${P.muc}}
.can{text-align:center !important}.de-nhan.sang{color:${P.v3}}.de-chu.sang,.de-tai.sang,.dong-t.sang{color:${P.nen}}.de-so.sang{color:${P.v3}}.dong-t.v3{color:${P.v3}}.dong-t.x3{color:${P.x3}}.nguon.sang{color:${P.x4}}.vach.toi{background:${P.x2}}.bh-t.phai{justify-content:flex-end}.so-o{font:600 32px/1 'Be Vietnam Pro';color:${P.muc};font-variant-numeric:tabular-nums}.so-o.dau{font-weight:800;color:${P.x1}}.hang.le{background:${P.x4}}
`);
  fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
  S2.forEach((h, k) => ghi(path.join(D, "slides", `${String(k + 1).padStart(2, "0")}.html`), h));
  console.log(`${S2.length} slide, ${nL} lớp hình`);
}
