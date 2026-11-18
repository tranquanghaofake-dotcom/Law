// Deck "Hợp đồng bảo hiểm Bảo Việt An Gia và thực trạng thị trường" — Nhóm 2. Skill slide-chuan, hướng BIÊN TẬP HỌC THUẬT (Hào chọn 18/11/2026).
// Luật của bản này (skill sửa 18/11/2026): hình chính là chính trang hợp đồng gốc (anh/goc/, scripts/trang_goc.js) có khoanh đúng điều khoản;
// nền trắng, bảng kẻ ngang, không thẻ / chip / bóng; tiêu đề là kết luận cụ thể; không viết tắt chưa giải thích.
//   node deck.js && node ../../../.claude/skills/slide-chuan/scripts/dung.js . --ten=hop-dong-bao-hiem-nhom2
const fs = require("fs"), path = require("path");
const D = __dirname;
const ghi = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
fs.rmSync(path.join(D, "asset", "hinh"), { recursive: true, force: true });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const em = (s) => esc(s).replace(/\[([^\]]+)\]/g, "<em>$1</em>").replace(/\{([^}]+)\}/g, '<em class="do">$1</em>');
const P = { nen: "#FFFFFF", muc: "#1B2A28", phu: "#3F4B48", ke: "#8C9491", x1: "#0E4F49", x2: "#2C7A6C", v1: "#946512", v2: "#E2A52E", d1: "#B13A2E", sang: "#F3D27E", nhat: "#DDECE7" };
const TONG = 22, S2 = [], KB = [];
let nL = 0;
const A = (a, at, dur = 500) => `data-a="${a}" data-at="${at}" data-dur="${dur}"`;
const lop = (body, x, y, w, h, alt, loai = "bieu-do", ex = "") => { const f = `l${String(++nL).padStart(2, "0")}.svg`;
  ghi(path.join(D, "asset", "hinh", f), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${body}</svg>`);
  return `<img data-l="lop-${nL}" data-loai="${loai}" data-alt="${esc(alt)}" ${ex} src="asset/hinh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
const T = (cls, x, y, w, s, ex = "") => `<div class="${cls}" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</div>`;
const sec = (mau, kieu, notes, inner, { ex = "", trans = "fade" } = {}) => {
  const td = (inner.match(/data-tieu-de[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "";
  KB.push([S2.length + 1, mau, td.replace(/<[^>]+>/g, ""), notes]);
  S2.push(`<section class="s ${kieu}" data-mau="${mau}" data-nen="${kieu === "dam" ? "N2" : "N1"}" ${ex} data-trans="${trans}" data-dur="500" data-notes="${esc(notes)}">\n${inner}\n</section>`); };
// đầu slide: nhãn mục (chữ thường), tiêu đề tối đa 2 dòng, phụ đề nói phạm vi / căn cứ — cùng một chỗ ở mọi slide
const dau = (nhan, td, phu, so, sang = false) => `<div class="dau" style="left:120px;top:64px;width:1500px">`
  + `<div class="nhan${sang ? " sang" : ""}" data-t ${A("fade", 0, 300)}>${esc(nhan)}</div>`
  + `<h1 class="td${sang ? " sang" : ""}" data-t data-tieu-de ${A("fade", 100, 500)}>${em(td)}</h1>`
  + (phu ? `<div class="phu${sang ? " sang" : ""}" data-t ${A("fade", 300, 400)}>${em(phu)}</div>` : "") + `</div>`
  + T(`so-trang${sang ? " sang" : ""}`, 1640, 64, 160, `${so} / ${TONG}`);
const nguon = (s, sang = false) => T(`nguon${sang ? " sang" : ""}`, 120, 1000, 1680, s);
const ke = (x, y, w, day = 2, mau = P.muc) => `<div class="ke" style="left:${x}px;top:${y}px;width:${w}px;height:${day}px;background:${mau}"></div>`;
function kichThuoc(p) { const b = fs.readFileSync(p); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }
const hGiay = (f, w) => { const [iw, ih] = kichThuoc(path.join(D, "anh", "goc", f + ".png")); return Math.round((w * ih) / iw); };
// trang hợp đồng gốc: khung mảnh + ảnh cắt + khoanh (lớp riêng, đè lên ảnh) — khoanh: [fy0, fy1, màu, fx0, fx1]
const giay = (f, x, y, w, alt, khoanh = [], t0 = 300) => { const h = hGiay(f, w);
  return `<div class="khung-giay" style="left:${x - 14}px;top:${y - 14}px;width:${w + 28}px;height:${h + 28}px"></div>`
    + `<img data-l="goc-${f}" data-loai="tai-lieu" data-alt="${esc(alt)}" ${A("fade", t0, 500)} src="anh/goc/${f}.png" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`
    + khoanh.map(([a, b, m = P.d1, c = 0, d = 1], k) => lop(`<rect x="${x + c * w - 8}" y="${y + a * h - 6}" width="${(d - c) * w + 16}" height="${(b - a) * h + 12}" rx="3" fill="none" stroke="${m}" stroke-width="5"/>`, Math.round(x + c * w - 12), Math.round(y + a * h - 10), Math.round((d - c) * w + 24), Math.round((b - a) * h + 20), "Khung khoanh đoạn đang phân tích", "net", A("wipe", t0 + 600 + k * 300, 500))).join(""); };
// bảng kẻ ngang: đầu bảng kẻ 3 px mực, hàng kẻ 1 px xám, hàng nhấn: thanh màu chủ bên trái + chữ đậm
const bang = (x, y, cot, hang, { cao = 96, nhan = -1, t0 = 400 } = {}) => { const W = cot.reduce((a, c) => a + c.w, 0); let o = "", cx = x;
  cot.forEach((c) => { o += T(`bh${c.phai ? " phai" : ""}`, cx, y, c.w - 24, c.t, A("fade", t0, 300)); cx += c.w; });
  o += ke(x, y + 52, W, 3);
  hang.forEach((r, i) => { const yy = y + 64 + i * cao, t = t0 + 200 + i * 150; cx = x;
    if (i === nhan) o += ke(x - 28, yy + 10, 8, cao - 28, P.x1);
    r.forEach((v, j) => { o += T(`${j ? "o" : "o dau"}${i === nhan ? " nhan" : ""}${cot[j].phai ? " phai" : ""}${cot[j].cls ? " " + cot[j].cls : ""}`, cx, yy + 12, cot[j].w - 24, v, A("fade", t, 300)); cx += cot[j].w; });
    o += ke(x, yy + cao - 4, W, 1, P.ke); });
  return o; };
const soLon = (x, y, w, so, mo, mau = "xanh", t0 = 400) => T(`so ${mau}`, x, y, w, so, `data-dl ${A("fade", t0, 400)}`) + T("so-m", x, y + 140, w, mo, A("fade", t0 + 150, 400));

// ============ 1 BÌA ============
{ const w = 900, h = hGiay("bia", w);
  sec("bia", "sang", "Chào thầy cô và các bạn. Nhóm 2 trình bày hai phần: phân tích mẫu hợp đồng bảo hiểm sức khoẻ Bảo Việt An Gia — trên màn hình là trang đầu của chính hợp đồng đó — và thực trạng thị trường bảo hiểm thương mại Việt Nam từ 2018 đến 9 tháng năm 2026.",
    T("nhan", 120, 140, 700, "Báo cáo nhóm 2")
    + `<h1 class="bia-td" data-t data-tieu-de ${A("fade", 100, 600)} style="left:120px;top:200px;width:740px">${em("Hợp đồng bảo hiểm sức khoẻ [Bảo Việt An Gia] và thị trường bảo hiểm Việt Nam")}</h1>`
    + ke(120, 700, 120, 6, P.v2) + T("bia-m", 120, 740, 720, "Phần I: đọc 8 nhóm điều khoản của một hợp đồng thật. Phần II: số liệu thị trường 2018 – 9 tháng 2026.", A("fade", 600, 500))
    + giay("bia", 960, Math.round(520 - h / 2), w, "Ảnh chụp trang đầu mẫu Hợp đồng bảo hiểm Bảo Việt An Gia: tên hợp đồng, căn cứ, Điều 1 về bên mua và công ty bảo hiểm", [[0, 0.075, P.v2]], 200)
    + T("chu-anh", 960, Math.round(520 + h / 2) + 30, w, "Trang đầu mẫu hợp đồng nhóm phân tích (tài liệu nhóm, trang 2)."));
}

// ============ 2 NỘI DUNG ============
{ const C = [["I", "Hợp đồng Bảo Việt An Gia", ["Cấu trúc và thứ tự ưu tiên tài liệu", "Các bên và quyền lợi theo chương trình", "Phí, thời gian chờ, đồng chi trả", "Chấm dứt hợp đồng và chi trả", "Đánh giá và khuyến nghị cho bên mua"]], ["II", "Thị trường bảo hiểm Việt Nam", ["Doanh thu phí 2018 – 2025", "Khủng hoảng bán qua ngân hàng 2023", "Luật cấm bán kèm từ 01/7/2024", "Nhân thọ giảm, phi nhân thọ tăng", "Cập nhật 9 tháng năm 2026"]]];
  sec("noi-dung", "sang", "Bài có hai phần. Phần I đọc từng nhóm điều khoản của một hợp đồng thật để thấy quyền và nghĩa vụ cụ thể. Phần II đặt hợp đồng đó vào bức tranh thị trường: vì sao doanh thu giảm năm 2023 và phục hồi ra sao.",
    dau("Nội dung", "Bài gồm hai phần: đọc một hợp đồng thật, rồi xem thị trường mà hợp đồng đó được bán ra", "", 2)
    + C.map(([so, ten, ds], k) => { const x = 120 + k * 880, t0 = 300 + k * 400;
      return T("mp-so-nho", x, 360, 120, so, A("fade", t0, 400)) + T("cot-t", x + 120, 372, 680, ten, A("fade", t0, 400)) + ke(x, 460, 780, 3)
        + ds.map((d, j) => T("dong", x + 120, 490 + j * 92, 660, d, A("fade", t0 + 150 + j * 100, 300)) + ke(x + 120, 566 + j * 92, 660, 1, P.ke)).join(""); }).join(""),
    { ex: "data-khong-hinh" });
}

// ============ 3 MỞ PHẦN I ============
sec("mo-phan", "dam", "Phần I. Mẫu hợp đồng Bảo Việt An Gia là hợp đồng bảo hiểm sức khoẻ của Tổng Công ty Bảo hiểm Bảo Việt, áp dụng Quy tắc bảo hiểm ban hành theo Quyết định 6029 ngày 27/6/2025. Nhóm đọc theo thứ tự các điều khoản trên màn hình.",
  T("mp-so", 110, 150, 300, "I", A("fade", 0, 500)) + `<h1 class="mp-t" data-t data-tieu-de ${A("fade", 200, 600)} style="left:120px;top:420px;width:760px">Hợp đồng Bảo Việt An Gia, đọc theo từng điều khoản</h1>`
  + T("mp-m", 120, 720, 760, "Hợp đồng bảo hiểm sức khoẻ gồm 13 điều và Phụ lục 1 (bảng quyền lợi). Bên phải: các điều khoản theo thứ tự trình bày.", A("fade", 500, 400))
  + [["Điều 12", "Bộ hợp đồng, thứ tự ưu tiên"], ["Điều 1, 2, 8", "Các bên trong hợp đồng"], ["Phụ lục 1", "Quyền lợi theo 5 chương trình"], ["Điều 4", "Phí và hạn thanh toán"], ["Điều 5", "Thời gian chờ"], ["Phụ lục 1, mục 2", "Đồng chi trả cho trẻ em"], ["Điều 6", "Chấm dứt, huỷ bỏ hợp đồng"], ["Điều 10", "Thời hạn chi trả"]].map(([a, b], k) => { const y = 170 + k * 96, t0 = 600 + k * 120;
    return T("mp-dieu", 1000, y, 300, a, A("fade", t0, 300)) + T("mp-noi", 1300, y, 500, b, A("fade", t0, 300)) + ke(1000, y + 70, 800, 1, P.nhat); }).join(""),
  { trans: "push", ex: "data-khong-hinh" });

// ============ 4 THỨ TỰ ƯU TIÊN (Điều 12) ============
{ const h = hGiay("uutien", 1680);
  sec("noi-dung", "sang", "Điều 12 liệt kê năm tài liệu tạo thành bộ hợp đồng: giấy yêu cầu bảo hiểm, hợp đồng, Phụ lục 1, các sửa đổi bổ sung và Quy tắc bảo hiểm. Đoạn trên màn hình là nguyên văn hợp đồng: nếu các tài liệu mâu thuẫn, áp dụng theo thứ tự từ trên xuống — sửa đổi bổ sung mới nhất trước, rồi hợp đồng và phụ lục, sau cùng là Quy tắc. Tức là điều đã thoả thuận riêng thắng điều khoản mẫu.",
    dau("I · Cấu trúc hợp đồng · Điều 12", "Khi các tài liệu mâu thuẫn, [sửa đổi bổ sung mới nhất] được áp dụng trước, Quy tắc bảo hiểm áp dụng sau cùng", "Khung đỏ trong nguyên văn hợp đồng: ba bậc, áp dụng từ trên xuống.", 4)
    + giay("uutien", 120, 370, 1680, "Ảnh chụp nguyên văn đoạn hợp đồng quy định thứ tự ưu tiên khi các tài liệu mâu thuẫn", [[0.55, 0.99, P.d1, 0, 0.68]])
    + [["1", "Sửa đổi bổ sung ký mới nhất"], ["2", "Hợp đồng và các phụ lục"], ["3", "Quy tắc bảo hiểm Bảo Việt An Gia"]].map(([so, t], k) => { const x = 120 + k * 570, t0 = 1200 + k * 250;
      return T("thu-so", x, 370 + h + 50, 70, so, A("fade", t0, 300)) + T("dong", x + 70, 370 + h + 56, 480, t, A("fade", t0, 300)); }).join("")
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 12 (tài liệu nhóm, trang 5–6). Khung đỏ: ba bậc ưu tiên."));
}

// ============ 5 CÁC BÊN ============
{ const R = [["Bên mua bảo hiểm", "Giao kết hợp đồng và đóng phí", "Điều 1"], ["Bảo Việt (công ty bảo hiểm)", "Chi trả tiền bảo hiểm theo hợp đồng", "Điều 1"], ["Người được bảo hiểm", "Người có sức khoẻ, tính mạng được bảo hiểm; có thể khác bên mua", "Điều 2"], ["Người thụ hưởng", "Nhận tiền khi người được bảo hiểm tử vong", "Điều 8"], ["Người chỉ định nhận tiền", "Nhận tiền bồi thường thông thường thay người được bảo hiểm, theo uỷ quyền", "Điều 8"]];
  sec("bang", "sang", "Hợp đồng tách bạch năm tư cách. Bên mua bảo hiểm giao kết và đóng phí; Bảo Việt cam kết chi trả. Người được bảo hiểm là người có sức khoẻ, tính mạng được bảo vệ — có thể khác bên mua, ví dụ bố mẹ mua cho con. Người thụ hưởng nhận tiền khi người được bảo hiểm tử vong; người chỉ định nhận tiền nhận bồi thường thông thường theo uỷ quyền. Một hợp đồng có thể gồm nhiều người, mỗi người một chương trình, mới hoặc tái tục — tiện cho gói gia đình.",
    dau("I · Các bên · Điều 1, 2, 8", "Hợp đồng phân biệt [năm tư cách]; người đóng phí, người được bảo vệ và người nhận tiền có thể là những người khác nhau", "Ví dụ: bố mẹ là bên mua, con là người được bảo hiểm.", 5)
    + bang(120, 380, [{ t: "Tư cách", w: 560 }, { t: "Vai trò trong hợp đồng", w: 920 }, { t: "Căn cứ", w: 200 }], R, { cao: 110 })
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 1, Điều 2, Điều 8 (tài liệu nhóm, trang 2–4)."), { ex: "data-khong-hinh" });
}

// ============ 6 QUYỀN LỢI — Phụ lục 1 ============
{ const CT = [["Đồng", 94], ["Bạc", 138], ["Vàng", 230], ["Bạch Kim", 342], ["Kim Cương", 454]], X = 340, K = 640 / 454;
  sec("noi-dung", "sang", "Phụ lục 1 có 5 chương trình từ Đồng đến Kim Cương; tổng hạn mức quyền lợi chính từ 94 đến 454 triệu đồng mỗi người mỗi năm, vẽ đúng tỷ lệ. Quyền lợi chính là điều trị nội trú do bệnh, tai nạn, biến chứng thai sản, tối đa 60 ngày nằm viện một năm, kèm chi phí khám trong 30 ngày trước khi nhập viện và tái khám 30 ngày sau khi ra viện. Người mua chọn thêm 5 quyền lợi bổ sung. Mọi gói chỉ áp dụng điều trị tại Việt Nam.",
    dau("I · Quyền lợi · Phụ lục 1", "Năm chương trình, hạn mức quyền lợi chính [từ 94 đến 454 triệu đồng] mỗi người mỗi năm", "Tổng hạn mức quyền lợi chính (điều trị nội trú) của từng chương trình, triệu đồng mỗi người mỗi năm.", 6)
    + CT.map(([ten, v], k) => { const y = 400 + k * 110, bw = Math.round(v * K), t0 = 500 + k * 150;
      return T("dong-dam", 120, y + 14, 210, ten, A("fade", t0, 300)) + lop(`<rect x="${X}" y="${y + 10}" width="${bw}" height="64" fill="${P.x2}"/>`, X, y + 10, bw, 64, `Thanh ${ten}: ${v} triệu đồng`, "bieu-do", A("wipe", t0, 400)) + T("so-thanh", X + bw + 16, y + 20, 140, String(v), A("fade", t0 + 200, 300)); }).join("")
    + T("cot-t", 1240, 400, 560, "Trong mọi chương trình", A("fade", 1400, 300)) + ke(1240, 466, 560, 3)
    + [["Nằm viện tối đa 60 ngày mỗi năm", "kèm khám 30 ngày trước khi nhập viện, tái khám 30 ngày sau khi ra viện"], ["5 quyền lợi bổ sung tự chọn", "ngoại trú, tai nạn cá nhân, sinh mạng cá nhân, nha khoa, thai sản"], ["Chỉ điều trị tại Việt Nam", "phạm vi lãnh thổ của cả 5 chương trình"]].map(([a, b], k) => { const y = 490 + k * 160, t0 = 1600 + k * 250;
      return `<div class="cap" style="left:1240px;top:${y}px;width:560px"><b data-t class="dong-dam" ${A("fade", t0, 300)}>${esc(a)}</b><span data-t class="dong-m" ${A("fade", t0 + 100, 300)}>${esc(b)}</span></div>`; }).join("")
    + nguon("Hợp đồng Bảo Việt An Gia, Phụ lục 1 — Bảng quyền lợi bảo hiểm (tài liệu nhóm, trang 5)."));
}

// ============ 7 PHÍ (Điều 4) ============
{ const h = hGiay("dieu4", 1680);
  sec("noi-dung", "sang", "Điều 4: nếu phí không được thanh toán đầy đủ và đúng hạn, bằng tiền mặt hoặc chuyển khoản, hợp đồng tự động huỷ bỏ, không cần thông báo trước, trừ khi có thoả thuận khác — câu trên màn hình là nguyên văn. Điều khoản bảo vệ doanh nghiệp trước trường hợp khách chậm phí mà vẫn phát sinh sự kiện bảo hiểm. Nhóm chưa đối chiếu điều khoản này với quy định về đóng phí trong Luật Kinh doanh bảo hiểm 2022 — nếu thầy cô hỏi, đó là hướng phân tích tiếp.",
    dau("I · Phí bảo hiểm · Điều 4", "Không đóng phí đủ và đúng hạn thì hợp đồng [tự động huỷ bỏ], không cần báo trước", "Trừ khi hai bên có thoả thuận khác.", 7)
    + giay("dieu4", 120, 380, 1680, "Ảnh chụp nguyên văn câu trong Điều 4: hợp đồng tự động huỷ bỏ khi phí không được thanh toán đúng và đủ", [[0, 1, P.d1]])
    + T("cot-t", 120, 380 + h + 70, 1680, "Hệ quả cho bên mua", A("fade", 900, 300)) + ke(120, 380 + h + 136, 1680, 3)
    + [["Lỡ hạn đóng phí", "hợp đồng bị huỷ ngay, Bảo Việt không phải báo trước (nguyên văn Điều 4)."], ["Chi phí phát sinh sau khi huỷ", "không được chi trả; mua lại thì phải chờ lại thời gian chờ (nhóm suy ra từ Điều 4 và Điều 5)."]].map(([a, b], k) => { const x = 120 + k * 860, t0 = 1100 + k * 300;
      return `<div class="cap" style="left:${x}px;top:${380 + h + 166}px;width:800px"><b data-t class="dong-dam" ${A("fade", t0, 300)}>${esc(a)}</b><span data-t class="dong-m" ${A("fade", t0 + 100, 300)}>${esc(b)}</span></div>`; }).join("")
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 4 (tài liệu nhóm, trang 3)."));
}

// ============ 8 THỜI GIAN CHỜ ============
{ const TG = [["Tai nạn", 0], ["Bệnh thông thường, điều trị răng", 30], ["Biến chứng thai sản", 90], ["Bệnh hô hấp ở trẻ đến 6 tuổi", 180], ["Bệnh có sẵn, đặc biệt; dây chằng, sụn chêm", 365], ["Sinh con (quyền lợi thai sản)", 635]], X = 820, K = 800 / 635;
  sec("noi-dung", "sang", "Thời gian chờ là khoảng quyền lợi chưa phát sinh hiệu lực chi trả, để chặn việc mua bảo hiểm khi đã biết trước bệnh. Tai nạn được bảo hiểm ngay. Bệnh thông thường chờ 30 ngày, biến chứng thai sản 90, bệnh hô hấp ở trẻ đến 6 tuổi 180, bệnh có sẵn, bệnh đặc biệt, tổn thương dây chằng hay sụn chêm 365. Dài nhất là quyền lợi sinh con: 635 ngày, gần 21 tháng — muốn dùng phải mua trước khi có kế hoạch sinh con. Bảo hiểm sinh mạng do bệnh: 90 ngày với bệnh thường, 365 ngày với bệnh có sẵn hoặc đặc biệt. Tái tục liên tục thì không phải chờ lại.",
    dau("I · Thời gian chờ · Điều 5", "Tai nạn được chi trả ngay; [sinh con phải chờ 635 ngày], gần 21 tháng sau khi hợp đồng có hiệu lực", "Trong thời gian chờ, chi phí phát sinh không được chi trả. Tái tục liên tục thì không phải chờ lại.", 8)
    + T("cot-t", 120, 390, 620, "Nhóm rủi ro", A("fade", 300, 300)) + T("cot-t", X, 390, 900, "Số ngày phải chờ", A("fade", 300, 300)) + ke(120, 450, 1680, 3)
    + lop(`<path d="M${X} 460 V970" stroke="${P.muc}" stroke-width="2"/><path d="M${X + 365 * K} 460 V970" stroke="${P.v1}" stroke-width="2" stroke-dasharray="8 6"/>`, X - 2, 460, Math.round(365 * K) + 6, 510, "Trục 0 ngày và vạch mốc 1 năm", "bieu-do", A("fade", 400, 300))
    + T("moc", X + 365 * K + 12, 462, 160, "1 năm", A("fade", 500, 300))
    + TG.map(([ten, d], k) => { const y = 486 + k * 82, w = Math.round(d * K), t0 = 600 + k * 200, dai = d >= 365;
      return T("dong-hep", 120, y + 6, 680, ten, A("fade", t0, 300))
        + (d ? lop(`<rect x="${X}" y="${y + 12}" width="${w}" height="44" fill="${dai ? P.d1 : P.x2}"/>`, X, y + 12, w, 44, `Thanh ${ten}: ${d} ngày`, "bieu-do", A("wipe", t0, 500)) : "")
        + T(`so-thanh${dai ? " do" : ""}`, X + w + 16, y + 10, 360, d ? `${d} ngày` : "0 ngày — chi trả ngay", A("fade", t0 + 300, 300)); }).join("")
    + nguon("Điều 5 hợp đồng. Riêng quyền lợi bảo hiểm sinh mạng do bệnh: chờ 90 ngày (bệnh thường), 365 ngày (bệnh có sẵn, đặc biệt)."),
    { ex: "data-hero" });
}

// ============ 9 ĐỒNG CHI TRẢ ============
{ const h = hGiay("dongchi", 1680), X = 120, Y = 380 + h + 110;
  sec("noi-dung", "sang", "Với trẻ từ 15 ngày tuổi đến 3 tuổi, nếu điều trị ở cơ sở y tế tư nhân, khoa quốc tế hoặc điều trị tự nguyện theo yêu cầu ở bệnh viện công, Bảo Việt trả 70 %, gia đình tự trả 30 %. Nếu khám, điều trị thông thường ở bệnh viện công lập thì không áp dụng đồng chi trả — Bảo Việt trả trong hạn mức. Vừa hạn chế dùng dịch vụ đắt tiền ở nhóm tuổi hay ốm, vừa giữ quyền lợi cho người dùng y tế công.",
    dau("I · Đồng chi trả · Phụ lục 1, mục 2", "Trẻ từ 15 ngày tuổi đến 3 tuổi chữa ở cơ sở tư nhân: [Bảo Việt trả 70 %, gia đình trả 30 %]", "Chữa thông thường ở bệnh viện công thì không phải đồng chi trả.", 9)
    + giay("dongchi", 120, 370, 1680, "Ảnh chụp nguyên văn mục 2 Phụ lục 1: tỷ lệ đồng chi trả 70/30 và trường hợp không áp dụng", [[0.02, 0.31, P.d1], [0.42, 0.98, P.x1]])
    + T("chu-anh", 120, 370 + h + 22, 1680, "Khung đỏ: tỷ lệ 70/30. Khung xanh: trường hợp không áp dụng — khám, điều trị thông thường ở bệnh viện công.", A("fade", 1200, 300))
    + T("dong-hep", X, Y + 14, 520, "Cơ sở tư nhân, khoa quốc tế, điều trị tự nguyện", A("fade", 1400, 300))
    + lop(`<rect x="660" y="${Y}" width="${Math.round(1140 * 0.7) - 4}" height="96" fill="${P.x1}"/><rect x="${660 + Math.round(1140 * 0.7)}" y="${Y}" width="${Math.round(1140 * 0.3)}" height="96" fill="${P.v2}"/>`, 660, Y, 1140, 96, "Thanh: Bảo Việt 70 %, gia đình 30 %", "bieu-do", A("wipe", 1500, 600))
    + T("trong-thanh sang", 684, Y + 26, 600, "Bảo Việt trả 70 %", A("fade", 1900, 300)) + T("trong-thanh", 660 + Math.round(1140 * 0.7) + 20, Y + 26, 320, "Gia đình 30 %", A("fade", 2000, 300))
    + T("dong-hep", X, Y + 150, 520, "Bệnh viện công, điều trị thông thường", A("fade", 2200, 300))
    + lop(`<rect x="660" y="${Y + 136}" width="1140" height="96" fill="${P.x1}"/>`, 660, Y + 136, 1140, 96, "Thanh: Bảo Việt trả, không đồng chi trả", "bieu-do", A("wipe", 2300, 600))
    + T("trong-thanh sang", 684, Y + 162, 1000, "Bảo Việt trả, không đồng chi trả (trong hạn mức)", A("fade", 2700, 300))
    + nguon("Hợp đồng Bảo Việt An Gia, Phụ lục 1, mục 2 (tài liệu nhóm, trang 8)."));
}

// ============ 10 CHẤM DỨT ============
{ const R = [["Bên mua chấm dứt", "Báo trước 30 ngày bằng văn bản; chưa có khoản chi trả nào", "70 %"], ["Bảo Việt chấm dứt", "Báo trước 30 ngày bằng văn bản; dù đã có khiếu nại hay chưa", "100 %"], ["Gian lận, trục lợi, không đúng đối tượng", "Huỷ ngay, mất toàn bộ quyền lợi; hoàn 70 % nếu chưa có bồi thường, đã bồi thường thì không hoàn", "70 % / 0"]];
  sec("bang", "sang", "Điều 6. Hai bên đều được chấm dứt, nhưng phải báo trước 30 ngày bằng văn bản. Bên mua chấm dứt thì chỉ được hoàn 70 % phí của thời gian còn lại, và chỉ khi chưa có khoản chi trả nào — 30 % giữ lại được nhóm hiểu là chi phí quản lý, khai thác. Bảo Việt chấm dứt thì phải hoàn đủ 100 %. Nếu người được bảo hiểm không đúng đối tượng hoặc gian lận, trục lợi, hợp đồng bị huỷ ngay, mất toàn bộ quyền lợi. Phí còn lại tính theo tỷ lệ số ngày còn lại. Câu hỏi mở cho thảo luận: mức hoàn 70 % khi bên mua chấm dứt có cân bằng quyền lợi hai bên không.",
    dau("I · Chấm dứt hợp đồng · Điều 6", "Bên mua tự chấm dứt chỉ được hoàn [70 % phí còn lại]; Bảo Việt chấm dứt phải hoàn [100 %]", "Phí còn lại tính theo tỷ lệ số ngày còn lại của hợp đồng.", 10)
    + bang(120, 400, [{ t: "Ai chấm dứt", w: 520 }, { t: "Điều kiện", w: 900 }, { t: "Hoàn phí", w: 260, phai: true, cls: "lon" }], R, { cao: 150 })
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 6 khoản 1 (chấm dứt, hoàn phí) và khoản 2 (huỷ bỏ do gian lận, trục lợi) — tài liệu nhóm, trang 3–4."), { ex: "data-khong-hinh" });
}

// ============ 11 CHI TRẢ ============
{ const h = hGiay("dieu10", 1680), Y = 370 + h + 40;
  sec("noi-dung", "sang", "Điều 10: Bảo Việt chi trả trong 15 ngày làm việc kể từ khi nhận đủ hồ sơ hợp lệ — dòng khoanh đỏ. Dòng khoanh xanh và Phụ lục 1 mục 3 cho nộp hồ sơ mềm qua ứng dụng BaoViet Direct nếu khoản bồi thường từ 10 triệu đồng trở xuống và không phải di sản thừa kế: xác thực bằng mã OTP, dùng hoá đơn điện tử có đường dẫn tra cứu, chứng từ y tế chụp hoặc scan, không cần công chứng hay gửi bản cứng.",
    dau("I · Chi trả tiền bảo hiểm · Điều 10", "Bảo Việt phải chi trả trong [15 ngày làm việc]; khoản đến 10 triệu đồng được nộp hồ sơ qua ứng dụng", "15 ngày tính từ khi Bảo Việt nhận đủ hồ sơ hợp lệ.", 11)
    + giay("dieu10", 120, 370, 1680, "Ảnh chụp nguyên văn Điều 10: chi trả trong vòng 15 ngày làm việc; hồ sơ mềm qua ứng dụng BaoViet Direct với khoản đến 10 triệu đồng", [[0.17, 0.31, P.d1], [0.35, 0.83, P.x1]])
    + T("cot-t", 120, Y, 1680, "Nộp hồ sơ qua ứng dụng BaoViet Direct khi (Phụ lục 1, mục 3)", A("fade", 1200, 300)) + ke(120, Y + 62, 1680, 3)
    + [["Khoản bồi thường đến 10 triệu đồng", "và không phải di sản thừa kế"], ["Xác thực bằng mã xác thực một lần (OTP)", "gửi tới số điện thoại đã đăng ký"], ["Chứng từ chụp hoặc scan", "hoá đơn điện tử; không cần công chứng"]].map(([a, b], k) => { const x = 120 + k * 570, t0 = 1400 + k * 250;
      return `<div class="cap" style="left:${x}px;top:${Y + 86}px;width:530px"><b data-t class="dong-dam" ${A("fade", t0, 300)}>${esc(a)}</b><span data-t class="dong-m" ${A("fade", t0 + 100, 300)}>${esc(b)}</span></div>`; }).join("")
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 10 (trang 4); Phụ lục 1, mục 3 (trang 8)."));
}

// ============ 12 ĐÁNH GIÁ ============
{ const UU = ["Thứ tự ưu tiên tài liệu rõ ràng (Điều 12)", "Năm mức hạn mức, từ 94 đến 454 triệu đồng", "Chi trả trong 15 ngày làm việc; nộp hồ sơ qua ứng dụng", "Bệnh viện công: trẻ nhỏ không phải đồng chi trả"], HC = ["Chờ 365 ngày với bệnh có sẵn, 635 ngày với sinh con", "Trẻ dưới 3 tuổi chữa ở cơ sở tư nhân: gia đình trả 30 %", "Chậm đóng phí là hợp đồng tự động huỷ bỏ", "Điểm loại trừ nằm trong Quy tắc, không in trong hợp đồng (Điều 7)"];
  sec("bang", "sang", "Tổng kết Phần I. Ưu điểm: cấu trúc minh bạch, thứ tự ưu tiên rõ; quyền lợi linh hoạt theo ngân sách; chi trả nhanh và số hoá hồ sơ; miễn đồng chi trả cho trẻ ở bệnh viện công. Điểm cần lưu ý: thời gian chờ dài; đồng chi trả 30 % cho trẻ dưới 3 tuổi ở cơ sở tư nhân; chậm phí là huỷ; và Điều 7 dẫn chiếu toàn bộ điểm loại trừ sang Quy tắc — người mua phải đọc thêm văn bản khác mới biết trường hợp nào không được trả.",
    dau("I · Đánh giá", "Hợp đồng minh bạch và chi trả nhanh, nhưng [người mua phải tự đọc nhiều ràng buộc]", "Bốn ưu điểm và bốn điểm bên mua cần lưu ý.", 12)
    + [[UU, 120, "Ưu điểm", "xanh"], [HC, 1000, "Cần lưu ý", "do"]].map(([ds, x, t, m], c) => T(`cot-t ${m}`, x, 380, 800, t, A("fade", 300 + c * 400, 300)) + ke(x, 446, 800, 3, c ? P.d1 : P.x1)
      + ds.map((s, k) => { const y = 470 + k * 124, t0 = 500 + c * 400 + k * 150; return T("dong", x, y + 12, 800, s, A("fade", t0, 300)) + ke(x, y + 116, 800, 1, P.ke); }).join("")).join("")
    + nguon("Tổng hợp từ Điều 4, 5, 6, 7, 10, 12 và Phụ lục 1 hợp đồng Bảo Việt An Gia."), { ex: "data-khong-hinh" });
}

// ============ 13 KHUYẾN NGHỊ ============
{ const KN = [["Khai trung thực tiền sử bệnh trên giấy yêu cầu bảo hiểm", "Khai sai có thể bị huỷ hợp đồng, mất toàn bộ quyền lợi (Điều 6 khoản 2)."], ["Đọc Quy tắc bảo hiểm Bảo Việt An Gia trước khi ký", "Các trường hợp không được trả nằm ở Chương III của Quy tắc, không in trong hợp đồng (Điều 7)."], ["Mua sớm, tính trước thời gian chờ", "Bệnh có sẵn chờ 365 ngày; sinh con chờ 635 ngày (Điều 5)."]];
  sec("noi-dung", "sang", "Ba khuyến nghị cho bên mua. Một, kê khai đầy đủ, chính xác tiền sử bệnh trên giấy yêu cầu bảo hiểm — khai sai là rủi ro bị huỷ hợp đồng theo Điều 6. Hai, yêu cầu và đọc Quy tắc bảo hiểm Bảo Việt An Gia, vì Điều 7 dẫn toàn bộ điểm loại trừ sang Chương III của Quy tắc. Ba, lên kế hoạch theo thời gian chờ, nhất là mốc 365 và 635 ngày.",
    dau("I · Khuyến nghị", "Ba việc bên mua nên làm [trước khi ký] hợp đồng", "Mỗi việc gắn với một điều khoản đã phân tích.", 13)
    + KN.map(([a, b], k) => { const y = 380 + k * 200, t0 = 400 + k * 300;
      return T("kn-so", 120, y, 140, String(k + 1), `data-dl ${A("fade", t0, 300)}`) + `<div class="cap" style="left:300px;top:${y + 10}px;width:1500px"><b data-t class="kn-t" ${A("fade", t0, 300)}>${esc(a)}</b><span data-t class="dong-m" ${A("fade", t0 + 100, 300)}>${esc(b)}</span></div>` + ke(120, y + 176, 1680, 1, P.ke); }).join(""),
    { ex: "data-khong-hinh" });
}

// ============ 14 MỞ PHẦN II ============
sec("mo-phan", "dam", "Phần II. Nhóm chia thị trường thành các giai đoạn: tăng nóng 2018–2022, khủng hoảng niềm tin 2023, chững lại 2024, phục hồi nhẹ 2025, và cập nhật 9 tháng 2026.",
  T("mp-so", 110, 150, 300, "II", A("fade", 0, 500)) + `<h1 class="mp-t" data-t data-tieu-de ${A("fade", 200, 600)} style="left:120px;top:420px;width:760px">Thị trường bảo hiểm Việt Nam 2018 – 2026</h1>`
  + T("mp-m", 120, 720, 760, "Doanh thu phí, bán bảo hiểm qua ngân hàng và các luật mới.", A("fade", 500, 400))
  + [["2018 – 2022", "Tăng 15 – 24 % mỗi năm"], ["2023", "Doanh thu giảm lần đầu sau khoảng 10 năm"], ["2024", "Đi ngang; luật cấm bán kèm qua ngân hàng"], ["2025", "Tăng lại nhờ phi nhân thọ"], ["9 tháng 2026", "Phi nhân thọ tiếp tục tăng mạnh"]].map(([a, b], k) => { const y = 200 + k * 130, t0 = 600 + k * 150;
    return T("mp-dieu", 1000, y, 300, a, A("fade", t0, 300)) + T("mp-noi", 1300, y, 500, b, A("fade", t0, 300)) + ke(1000, y + 100, 800, 1, P.nhat); }).join(""),
  { trans: "push", ex: "data-khong-hinh" });

// ============ 15 DOANH THU ============
{ const DT = [[2018, 133.7, "+24,0 %"], [2019, 160.2, "+21,0 %"], [2020, 184.7, "+15,0 %"], [2021, 216.0, "+16,1 %"], [2022, 251.3, "+15,09 %"], [2023, 227.1, "−8,02 %"], [2024, 227.5, "−0,26 %"], [2025, 237.2, "+3,96 %"]];
  const B0 = 830, K = 1.5, CW = 130, ST = 205, X0 = 200;
  sec("so-lon", "sang", "Giai đoạn 2018–2022 doanh thu phí tăng 15–24 % mỗi năm, từ 133,7 lên 251,3 nghìn tỷ đồng — gần gấp đôi — nhờ bùng nổ bán bảo hiểm qua ngân hàng. Năm 2023 doanh thu giảm lần đầu sau khoảng 10 năm, năm 2024 đi ngang, năm 2025 tăng lại. Lưu ý: tốc độ tăng giảm là số cơ quan quản lý công bố, so với số liệu đã điều chỉnh của năm trước, nên lệch nhẹ so với phép chia trực tiếp giữa các cột.",
    dau("II · Doanh thu toàn thị trường", "Doanh thu phí [gần gấp đôi] trong 2018 – 2022, rồi năm 2023 {giảm lần đầu} sau khoảng 10 năm", "Tổng doanh thu phí, nghìn tỷ đồng; dưới cột: tăng / giảm so với năm trước. Cột đỏ: giảm; cột xám: đi ngang.", 15)
    + lop(`<path d="M150 ${B0} H1800" stroke="${P.muc}" stroke-width="3"/>`, 150, B0 - 2, 1650, 4, "Trục ngang biểu đồ", "bieu-do", A("fade", 300, 300))
    + DT.map(([n, v, g], k) => { const x = X0 + k * ST, h = Math.round(v * K), t0 = 500 + k * 150, giam = g.startsWith("−");
      return lop(`<rect x="${x}" y="${B0 - h}" width="${CW}" height="${h}" fill="${n === 2023 ? P.d1 : n === 2024 ? P.ke : P.x2}"/>`, x, B0 - h, CW, h, `Cột năm ${n}: ${String(v.toFixed(1)).replace(".", ",")} nghìn tỷ đồng`, "bieu-do", A("wipe", t0, 400))
        + T("so-cot", x - 35, B0 - h - 52, CW + 70, String(v.toFixed(1)).replace(".", ","), A("fade", t0 + 200, 300))
        + `<div class="cot-nam" data-t ${A("fade", t0, 300)} style="left:${x - 35}px;top:${B0 + 14}px;width:${CW + 70}px">${n}<br><span class="${n === 2023 ? "do" : n === 2024 ? "xam" : "xanh"}">${g}</span></div>`; }).join("")
    + nguon("Bộ Tài chính, số ước tính (tài liệu nhóm, nguồn 5–11); 2024 đối chiếu mof.gov.vn; 2025 theo Cục Quản lý, giám sát bảo hiểm."),
    { ex: "data-hero" });
}

// ============ 16 BẢNG 2022–2025 ============
{ const R = [["2022", "Đỉnh tăng trưởng", "251,3", "Bán bảo hiểm qua ngân hàng tăng nóng; Bộ Tài chính thanh tra 4 doanh nghiệp nhân thọ"], ["2023", "Khủng hoảng niềm tin", "227,1", "Luật Kinh doanh bảo hiểm 2022 có hiệu lực; công bố kết luận thanh tra ngày 30/6"], ["2024", "Chững lại", "227,5", "Luật Các tổ chức tín dụng 2024 cấm bán kèm bảo hiểm; bão Yagi"], ["2025", "Phục hồi nhẹ", "237,2", "Quốc hội thông qua Luật sửa đổi Luật Kinh doanh bảo hiểm ngày 10/12/2025"]];
  sec("bang", "sang", "Bốn năm gần nhất, bốn trạng thái. 2022 là đỉnh: 78 doanh nghiệp, tổng tài sản hơn 811 nghìn tỷ, tỷ trọng bán qua ngân hàng trong phí khai thác mới nhân thọ lên khoảng 45 %. 2023 khủng hoảng niềm tin. 2024 chững lại khi luật cấm bán kèm qua ngân hàng và bão Yagi thử thách phi nhân thọ. 2025 phục hồi nhẹ, Quốc hội thông qua luật sửa đổi Luật Kinh doanh bảo hiểm.",
    dau("II · Từng năm 2022 – 2025", "Mỗi năm 2022 – 2025 gắn với một sự kiện chính sách hoặc thị trường", "Cùng đơn vị với biểu đồ trước: nghìn tỷ đồng.", 16)
    + bang(120, 380, [{ t: "Năm", w: 170 }, { t: "Trạng thái", w: 360 }, { t: "Tổng phí, nghìn tỷ", w: 300, phai: true }, { t: "Sự kiện chính", w: 850 }], R, { cao: 130 })
    + nguon("Tài liệu nhóm, Bảng 1 (số Bộ Tài chính); năm 2024 đối chiếu mof.gov.vn ngày 10/4/2025."), { ex: "data-khong-hinh" });
}

// ============ 17 KHỦNG HOẢNG 2023 ============
{ const SO = [["45 %", "xanh", "phí khai thác mới nhân thọ năm 2022 đến từ kênh bán qua ngân hàng (khoảng 20 % năm 2018)"], ["−44,5 %", "do", "phí khai thác mới bảo hiểm nhân thọ năm 2023 so với năm 2022"], ["−43,8 %", "do", "số hợp đồng bảo hiểm nhân thọ mới năm 2023 so với năm 2022"]];
  sec("so-lon", "sang", "Gốc của khủng hoảng là kênh bán qua ngân hàng. Theo Công ty Chứng khoán Dầu khí, tỷ trọng bán qua ngân hàng trong phí khai thác mới nhân thọ từ khoảng 20 % năm 2018 lên 45 % năm 2022. Ngày 30/6/2023 Bộ Tài chính công bố kết luận thanh tra tại Prudential, MB Ageas, Sun Life và BIDV MetLife: sai phạm nhiều nhất ở khâu tư vấn. Hệ quả: phí khai thác mới nhân thọ giảm 44,5 %, số hợp đồng mới giảm 43,8 %. Tổng doanh thu giảm chủ yếu do nhân thọ giảm 12,5 %, trong khi phi nhân thọ vẫn tăng.",
    dau("II · Năm 2023", "Năm 2023, bán bảo hiểm qua ngân hàng bị kết luận sai phạm; [hợp đồng nhân thọ mới giảm 43,8 %]", "Kết luận thanh tra ngày 30/6/2023 tại Prudential, MB Ageas, Sun Life, BIDV MetLife: sai phạm nhiều nhất ở khâu tư vấn.", 17)
    + SO.map(([so, m, mo], k) => { const x = 120 + k * 580; return soLon(x, 390, 520, so, mo, m, 400 + k * 300) + (k ? ke(x - 30, 390, 2, 320, P.ke) : ""); }).join("")
    + T("cot-t", 120, 760, 1680, "Tỷ trọng bán qua ngân hàng trong phí khai thác mới nhân thọ", A("fade", 1400, 300)) + ke(120, 822, 1680, 3)
    + [[2018, 20], [2021, 40], [2022, 45]].map(([n, v], k) => { const y = 836 + k * 50, t0 = 1500 + k * 200; return T("dong-hep", 120, y, 160, String(n), A("fade", t0, 300)) + lop(`<rect x="300" y="${y + 6}" width="${v * 20}" height="34" fill="${k === 2 ? P.x1 : P.x2}"/>`, 300, y + 6, v * 20, 34, `Thanh năm ${n}: ${v} %`, "bieu-do", A("wipe", t0, 400)) + T("so-thanh", 316 + v * 20, y, 200, `${k ? "" : "≈ "}${v} %`, A("fade", t0 + 200, 300)); }).join("")
    + nguon("Tài liệu nhóm: nguồn 12 (Công ty Chứng khoán Dầu khí), 14 (Báo Thanh tra, 01/7/2023), 15 (VnEconomy, số liệu Hiệp hội Bảo hiểm Việt Nam)."),
    { ex: "data-khong-hinh" });
}

// ============ 18 TRÍCH LUẬT ============
sec("trich", "dam", "Ngày 01/7/2024 Luật Các tổ chức tín dụng 2024 có hiệu lực. Điều 15 liệt kê các hành vi bị nghiêm cấm; khoản 5 cấm tổ chức tín dụng và nhân viên gắn việc bán bảo hiểm không bắt buộc với việc cung ứng sản phẩm, dịch vụ ngân hàng dưới mọi hình thức — tức là không được ép mua bảo hiểm mới cho vay. Đây là phản ứng trực tiếp với sai phạm năm 2023.",
  dau("II · Năm 2024 · Luật Các tổ chức tín dụng số 32/2024/QH15", "Từ 01/7/2024, ngân hàng [không được gắn việc bán bảo hiểm] với việc cung cấp dịch vụ ngân hàng", "Khoản 5 Điều 15 (Điều 15: các hành vi bị nghiêm cấm). Đang có hiệu lực.", 18, true)
  + lop(`<rect x="120" y="420" width="8" height="270" fill="${P.v2}"/>`, 120, 420, 8, 270, "Vạch đánh dấu trích dẫn", "net", A("wipe", 400, 400))
  + `<div class="trich" data-t ${A("fade", 600, 800)} style="left:170px;top:420px;width:1560px">“Tổ chức tín dụng, chi nhánh ngân hàng nước ngoài, người quản lý, người điều hành, nhân viên của tổ chức tín dụng, chi nhánh ngân hàng nước ngoài <em>gắn việc bán sản phẩm bảo hiểm không bắt buộc với việc cung ứng sản phẩm, dịch vụ ngân hàng dưới mọi hình thức</em>.”</div>`
  + nguon("Văn bản hợp nhất Luật Các tổ chức tín dụng (Văn phòng Quốc hội, số 158), datafiles.chinhphu.vn — đối chiếu 18/11/2026.", true),
  { ex: "data-khong-hinh" });

// ============ 19 NHÂN THỌ / PHI NHÂN THỌ ============
{ const NT = [[2023, -12.5, "−12,5 %", 2.87, "+2,87 %"], [2024, -5, "khoảng −5 %", 10.2, "+10,2 %"], [2025, 0.5, "+0,5 %", 10.5, "+10 – 11 %"]], Z = 680, K = 16, BW = 120;
  sec("noi-dung", "sang", "Hai xu hướng ngược chiều. Nhân thọ chịu tác động trực tiếp: giảm 12,5 % năm 2023, khoảng 5 % năm 2024, gần như đi ngang năm 2025. Phi nhân thọ tăng đều — 2,87 %, 10,2 %, rồi khoảng 10–11 % — và giữ cho thị trường không giảm sâu hơn. Nhưng bão Yagi cho thấy điểm yếu: thiệt hại ước tính khoảng 12.811 tỷ, đến giữa tháng 10/2024 mới tạm ứng 213 tỷ, đến 9/1/2025 lên 956,5 tỷ — bồi thường thiên tai còn chậm.",
    dau("II · 2023 – 2025", "Nhân thọ giảm, còn [phi nhân thọ tăng đều] và giữ cho thị trường không giảm sâu", "Mức tăng / giảm doanh thu phí so với năm trước. Bên phải: bão Yagi — phép thử của phi nhân thọ.", 19)
    + lop(`<rect x="120" y="382" width="30" height="24" fill="${P.x1}"/><rect x="380" y="382" width="30" height="24" fill="${P.v2}"/>`, 120, 382, 290, 24, "Chú giải: xanh đậm là nhân thọ, vàng là phi nhân thọ", "bieu-do", A("fade", 200, 300))
    + T("dong-hep", 162, 374, 200, "Nhân thọ", A("fade", 200, 300)) + T("dong-hep", 422, 374, 300, "Phi nhân thọ", A("fade", 200, 300))
    + lop(`<path d="M120 ${Z} H1060" stroke="${P.muc}" stroke-width="3"/>`, 120, Z - 2, 940, 4, "Trục 0 %", "bieu-do", A("fade", 300, 300))
    + NT.map(([n, a, la, b, lb], k) => { const cx = 280 + k * 310, t0 = 500 + k * 350, ha = Math.abs(a) * K, hb = b * K, ya = a < 0 ? Z : Z - ha;
      return lop(`<rect x="${cx - BW - 6}" y="${ya}" width="${BW}" height="${Math.max(ha, 6)}" fill="${P.x1}"/><rect x="${cx + 6}" y="${Z - hb}" width="${BW}" height="${hb}" fill="${P.v2}"/>`, cx - BW - 6, Math.min(ya, Z - hb), 2 * BW + 12, Math.max(Z + (a < 0 ? ha : 6), Z) - Math.min(ya, Z - hb), `Năm ${n}: nhân thọ ${la}, phi nhân thọ ${lb}`, "bieu-do", A("wipe", t0, 500))
        + T(`so-thanh${a < 0 ? " do" : ""} giua-ch`, cx - BW - 66, a < 0 ? Z + ha + 8 : ya - 48, BW + 120, la, A("fade", t0 + 300, 300)) + T("so-thanh giua-ch", cx - 54, Z - hb - 48, BW + 120, lb, A("fade", t0 + 350, 300))
        + T("cot-nam", cx - 100, 948, 200, String(n), A("fade", t0, 300)); }).join("")
    + T("cot-t", 1180, 380, 620, "Bão Yagi 9/2024: bồi thường chậm", A("fade", 1600, 300)) + ke(1180, 446, 620, 3, P.d1)
    + [["12.811 tỷ đồng", "thiệt hại ước tính", "do"], ["213 tỷ đồng", "đã tạm ứng bồi thường đến giữa tháng 10/2024", ""], ["956,5 tỷ đồng", "đã tạm ứng bồi thường đến 9/1/2025", ""]].map(([s, m, c], k) => { const y = 470 + k * 168, t0 = 1800 + k * 250;
      return `<div class="cap" style="left:1180px;top:${y}px;width:620px"><b data-t class="yagi${c ? " do" : ""}" ${A("fade", t0, 300)}>${esc(s)}</b><span data-t class="dong-m" ${A("fade", t0 + 100, 300)}>${esc(m)}</span></div>`; }).join("")
    + nguon("Tài liệu nhóm, Hình 2 (nguồn 10, 11); bão Yagi: nguồn 16 (VCCI), 17 (VietnamFinance) — số liệu Cục Quản lý, giám sát bảo hiểm."));
}

// ============ 20 MỐC PHÁP LÝ ============
{ const VN = [["01/01/2023", "Luật Kinh doanh bảo hiểm số 08/2022/QH15 có hiệu lực", "Hướng dẫn bởi 2 nghị định, 1 thông tư năm 2023"], ["30/6/2023", "Kết luận thanh tra bán bảo hiểm qua ngân hàng", "4 doanh nghiệp nhân thọ, sai phạm ở khâu tư vấn"], ["01/7/2024", "Luật Các tổ chức tín dụng số 32/2024/QH15 có hiệu lực", "Khoản 5 Điều 15: cấm gắn bán bảo hiểm với dịch vụ ngân hàng"], ["01/01/2026", "Luật 139/2025/QH15 sửa Luật Kinh doanh bảo hiểm có hiệu lực", "Thông qua 10/12/2025; cắt giảm điều kiện, thủ tục"]];
  sec("noi-dung", "sang", "Bốn mốc pháp lý. Luật Kinh doanh bảo hiểm 2022 có hiệu lực từ 01/01/2023, hướng dẫn bởi Nghị định 46/2023, Nghị định 67/2023 và Thông tư 67/2023 của Bộ Tài chính. Kết luận thanh tra 30/6/2023. Luật Các tổ chức tín dụng 2024 có hiệu lực 01/7/2024. Ngày 10/12/2025 Quốc hội thông qua Luật số 139/2025/QH15 sửa đổi Luật Kinh doanh bảo hiểm, hiệu lực 01/01/2026, một số khoản từ 01/7/2026, nhằm cắt giảm điều kiện kinh doanh và đơn giản hoá thủ tục.",
    dau("II · Khung pháp lý", "Bốn mốc pháp lý 2023 – 2026: [luật mới, thanh tra, cấm bán kèm, sửa luật]", "Chấm đặc: văn bản luật đang có hiệu lực (tra cứu 18/11/2026). Chấm rỗng: sự kiện thanh tra.", 20)
    + lop(`<path d="M120 470 H1800" stroke="${P.muc}" stroke-width="3"/>` + VN.map((_, k) => `<circle cx="${134 + k * 420}" cy="470" r="14" fill="${k === 1 ? P.nen : P.x1}" stroke="${P.x1}" stroke-width="4"/>`).join(""), 110, 452, 1700, 36, "Trục thời gian bốn mốc", "bieu-do", A("wipe", 300, 800))
    + VN.map(([y, a, b], k) => { const x = 120 + k * 420, t0 = 500 + k * 250;
      return T("moc-nam", x, 380, 400, y, A("fade", t0, 300)) + `<div class="cap" style="left:${x}px;top:516px;width:380px"><b data-t class="dong-dam" ${A("fade", t0 + 100, 300)}>${esc(a)}</b><span data-t class="dong-m" ${A("fade", t0 + 200, 300)}>${esc(b)}</span></div>`; }).join("")
    + nguon("vbpl.vn; vanban.chinhphu.vn; văn bản hợp nhất Luật Các tổ chức tín dụng — tra cứu 18/11/2026."),
    { ex: "data-khong-hinh" });
}

// ============ 21 9 THÁNG 2026 ============
{ const R = [["Phi nhân thọ", "74,1", 15.1], ["Chi trả quyền lợi", "77,9", 13.1], ["Tổng doanh thu phí", "175,8", 2.4], ["Nhân thọ", "101,7", null]], X = 1100, K = 34;
  sec("so-lon", "sang", "Cập nhật 9 tháng năm 2026 theo báo cáo tình hình kinh tế – xã hội: tổng doanh thu phí ước 175,8 nghìn tỷ, tăng 2,4 %; phi nhân thọ 74,1 nghìn tỷ, tăng 15,1 %; chi trả quyền lợi 77,9 nghìn tỷ, tăng 13,1 %. Nhân thọ ước 101,7 nghìn tỷ, vẫn chiếm phần lớn doanh thu; nguồn báo chí không nêu tốc độ của nhân thọ nên nhóm không ghi. Lưu ý: tài liệu nhóm trích nguồn 21, 22 nhưng chưa có trong danh mục — nhóm sẽ bổ sung.",
    dau("II · 9 tháng năm 2026", "9 tháng 2026: phi nhân thọ tăng 15,1 %, nhanh hơn nhiều so với [tổng doanh thu phí (2,4 %)]", "Số ước tính, so với cùng kỳ năm 2025. Chi trả quyền lợi cũng tăng mạnh (13,1 %).", 21)
    + bang(120, 390, [{ t: "Chỉ tiêu", w: 520 }, { t: "Nghìn tỷ đồng", w: 300, phai: true }, { t: "Tăng so với cùng kỳ", w: 860 }], R.map(([a, b]) => [a, b, ""]), { cao: 120 })
    + R.map(([a, b, g], k) => { const y = 454 + k * 120 + 22, t0 = 800 + k * 200; return g == null ? T("dong-m", X, y, 700, "báo cáo không nêu tốc độ", A("fade", t0, 300)) : lop(`<rect x="${X}" y="${y + 4}" width="${Math.round(g * K)}" height="48" fill="${g > 10 ? P.x1 : P.x2}"/>`, X, y + 4, Math.round(g * K), 48, `Thanh ${a}: tăng ${String(g).replace(".", ",")} %`, "bieu-do", A("wipe", t0, 400)) + T("so-thanh", X + Math.round(g * K) + 16, y + 6, 200, `+${String(g).replace(".", ",")} %`, A("fade", t0 + 200, 300)); }).join("")
    + nguon("Báo cáo tình hình kinh tế – xã hội quý III và 9 tháng 2026, dẫn theo anninhthudo.vn và baomoi.com."),
    { ex: "data-khong-hinh" });
}

// ============ 22 KẾT LUẬN ============
{ const KL = [["Hợp đồng Bảo Việt An Gia chặt về hình thức", "Thứ tự ưu tiên rõ, chi trả trong 15 ngày làm việc, hồ sơ nộp qua ứng dụng."], ["Nhưng nhiều ràng buộc người mua phải tự đọc", "Thời gian chờ đến 635 ngày, đồng chi trả 30 %, điểm loại trừ nằm trong Quy tắc."], ["Thị trường đã qua khủng hoảng năm 2023", "Luật cấm bán kèm qua ngân hàng; phi nhân thọ kéo doanh thu tăng trở lại."]];
  sec("ket", "dam", "Kết luận. Hợp đồng Bảo Việt An Gia chặt chẽ về hình thức, quyền lợi linh hoạt, chi trả nhanh, nhưng có nhiều ràng buộc người mua phải tự đọc. Thị trường đi từ tăng nóng, qua khủng hoảng niềm tin 2023, nay phục hồi nhờ phi nhân thọ và khung pháp lý siết việc bán hàng. Nhóm cảm ơn thầy cô và các bạn đã lắng nghe.",
    dau("Kết luận", "Ba điều nhóm rút ra từ hợp đồng và thị trường", "", 22, true)
    + KL.map(([a, b], k) => { const y = 300 + k * 180, t0 = 300 + k * 300;
      return T("kn-so sang", 120, y, 140, String(k + 1), `data-dl ${A("fade", t0, 300)}`) + `<div class="cap" style="left:300px;top:${y + 10}px;width:1500px"><b data-t class="kn-t sang" ${A("fade", t0, 300)}>${esc(a)}</b><span data-t class="dong-m sang" ${A("fade", t0 + 100, 300)}>${esc(b)}</span></div>` + ke(120, y + 160, 1680, 1, P.x2); }).join("")
    + T("cam-on", 120, 880, 1680, "Nhóm 2 cảm ơn thầy cô và các bạn đã lắng nghe.", A("fade", 1400, 500)),
    { ex: "data-khong-hinh" });
}

// =================== CSS ===================
ghi(path.join(D, "style.css"), `section.s{background:${P.nen};color:${P.muc}}section.s.dam{background:${P.x1};color:${P.nen}}
section.s > div, section.s > h1{position:absolute}
[data-t]{text-wrap:pretty}
em{font-style:normal;color:${P.x1};font-weight:inherit}em.do{color:${P.d1}}.dam em{color:${P.sang}}
.dau{display:flex;flex-direction:column;gap:14px}
.nhan{font:700 26px/1.2 'Be Vietnam Pro';color:${P.x1}}.nhan.sang{color:${P.nen}}
.td{font:700 54px/1.18 'Lora';color:${P.muc};text-wrap:balance}.td.sang{color:${P.nen}}
.phu{font:400 30px/1.4 'Be Vietnam Pro';color:${P.phu}}.phu.sang{color:${P.nhat}}
.so-trang{font:600 24px/1.2 'Be Vietnam Pro';color:${P.phu};text-align:right}.so-trang.sang{color:${P.nhat}}
.nguon{font:400 24px/1.4 'Be Vietnam Pro';color:${P.phu}}.nguon.sang{color:${P.nhat}}
.chu-anh{font:400 24px/1.4 'Be Vietnam Pro';color:${P.phu}}
.bia-td{position:absolute;font:700 76px/1.12 'Lora';color:${P.muc}}.bia-m{font:400 32px/1.45 'Be Vietnam Pro';color:${P.phu}}
.khung-giay{border:2px solid ${P.ke}}
.cot-t{font:700 32px/1.25 'Be Vietnam Pro';color:${P.muc}}.cot-t.xanh{color:${P.x1}}.cot-t.do{color:${P.d1}}
.dong{font:400 32px/1.4 'Be Vietnam Pro';color:${P.muc}}.dong-hep{font:600 30px/1.3 'Be Vietnam Pro';color:${P.muc}}
.cap > b,.cap > span{display:block}.cap > span{margin-top:8px}
.dong-dam{font:700 32px/1.3 'Be Vietnam Pro';color:${P.muc}}.dong-m{font:400 30px/1.4 'Be Vietnam Pro';color:${P.phu}}.dong-m.sang{color:${P.nhat}}
.bh{font:700 28px/1.3 'Be Vietnam Pro';color:${P.phu}}.phai{text-align:right}
.o{font:400 30px/1.35 'Be Vietnam Pro';color:${P.muc}}.o.dau{font-weight:700}.o.nhan{color:${P.x1};font-weight:700}.o.lon{font:700 44px/1.1 'Lora';color:${P.x1}}
.thu-so{font:700 64px/1 'Lora';color:${P.phu}}.thu-so.nhan{color:${P.d1}}
.y-nghia{font:600 32px/1.4 'Be Vietnam Pro';color:${P.x1}}
.so-thanh{font:700 34px/1.2 'Lora';color:${P.muc}}.so-thanh.do{color:${P.d1}}.giua-ch{text-align:center}
.moc{font:600 28px/1.2 'Be Vietnam Pro';color:${P.muc}}
.trong-thanh{font:700 34px/1.2 'Be Vietnam Pro';color:${P.muc}}.trong-thanh.sang{color:${P.nen}}
.mp-so{font:700 220px/1 'Lora';color:${P.sang}}.mp-t{position:absolute;font:700 72px/1.12 'Lora';color:${P.nen}}.mp-m{font:400 32px/1.45 'Be Vietnam Pro';color:${P.nhat}}
.mp-dieu{font:700 30px/1.3 'Be Vietnam Pro';color:${P.nen}}.mp-noi{font:400 30px/1.3 'Be Vietnam Pro';color:${P.nen}}
.mp-so-nho{font:700 72px/1 'Lora';color:${P.x1}}
.kn-so{font:700 120px/1 'Lora';color:${P.x1}}.kn-so.sang{color:${P.sang}}.kn-t{font:700 40px/1.25 'Lora';color:${P.muc}}.kn-t.sang{color:${P.nen}}
.cam-on{font:600 34px/1.3 'Be Vietnam Pro';color:${P.sang}}
.so{font:700 120px/1.05 'Lora'}.so.xanh{color:${P.x1}}.so.do{color:${P.d1}}.so-m{font:400 32px/1.4 'Be Vietnam Pro';color:${P.muc}}
.so-cot{font:700 34px/1 'Lora';color:${P.muc};text-align:center}.cot-nam{font:700 30px/1.35 'Be Vietnam Pro';color:${P.muc};text-align:center}
.cot-nam .do{color:${P.d1};font-weight:600}.cot-nam .xam{color:${P.phu};font-weight:600}.cot-nam .xanh{color:${P.x1};font-weight:600}
.yagi{font:700 48px/1.1 'Lora';color:${P.x1}}.yagi.do{color:${P.d1}}
.moc-nam{font:700 44px/1.1 'Lora';color:${P.x1}}
.trich{font:500 44px/1.5 'Lora';color:${P.nen}}.trich em{color:${P.sang}}
`);
fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
S2.forEach((h, k) => ghi(path.join(D, "slides", `${String(k + 1).padStart(2, "0")}.html`), h));
ghi(path.join(D, "kich-ban.md"), `# Kịch bản — sinh từ deck.js (sửa ở deck.js, chạy lại \`node deck.js\`)\n\nThể loại: báo cáo nhóm (bám dàn ý tài liệu gốc). Ước lượng: ${S2.length} slide × ≈ 45 giây ≈ ${Math.round(S2.length * 45 / 60)} phút.\n\n| # | Bố cục | Tiêu đề (khẳng định) | Lời nói |\n|---|---|---|---|\n` + KB.map(([n, m, t, l]) => `| ${n} | ${m} | ${t} | ${l.replace(/\|/g, "/")} |`).join("\n") + "\n");
console.log(`${S2.length} slide, ${nL} lớp hình`);
