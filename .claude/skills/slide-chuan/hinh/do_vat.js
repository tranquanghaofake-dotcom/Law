// ĐỒ VẬT VẼ BẰNG CODE (chuyển từ engine/kits.js của tầng Office cũ, 11/2026): mỗi hàm (P) → { svg, ratio }; P = { acc, gold, ink, tape, accLight, bad } (hex không #).
// Phẳng + bóng đổ mềm, SVG thuần, không ảnh. Mặt con dấu TRƠN (không chữ, không hình cơ quan); thẻ ngân hàng không số thật, không logo.
const f1 = (v) => (Math.round(v * 10) / 10).toString();
const SHADOW = `<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="6" dy="10" stdDeviation="9" flood-color="#000" flood-opacity=".22"/></filter>`;
const svg = (w, h, body, defs = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${SHADOW}${defs}</defs><g filter="url(#sh)">${body}</g></svg>`;

// ---------- ĐỒ VẬT (vẽ bằng code, phẳng + bóng đổ mềm). Mỗi hàm (P) → { svg, ratio (rộng/cao) }. P = bảng màu theme ----------
const PROPS = {
  // kẹp giấy: hai vòng lồng nhau
  clip: (P) => ({ ratio: 0.42, svg: svg(84, 200, `<path d="M20,30 L20,150 A22,22 0 0 0 64,150 L64,40 A14,14 0 0 0 36,40 L36,140" fill="none" stroke="#8C96A3" stroke-width="9" stroke-linecap="round"/><path d="M20,30 L20,150 A22,22 0 0 0 64,150 L64,40 A14,14 0 0 0 36,40 L36,140" fill="none" stroke="#D5DBE2" stroke-width="3" stroke-linecap="round"/>`) }),
  // băng dính giấy: dải mờ, hai đầu răng cưa
  tape: (P) => { let e1 = "", e2 = ""; for (let i = 0; i <= 6; i++) { e1 += `${i % 2 ? 6 : 0},${i * 10} `; e2 += `${i % 2 ? 214 : 220},${i * 10} `; }
    return { ratio: 220 / 60, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60"><polygon points="${e1}${e2.split(" ").filter(Boolean).reverse().join(" ")}" fill="#${P.tape}" fill-opacity=".78"/></svg>` }; },
  // đinh ghim: mũ tròn màu nhấn + bóng
  pin: (P) => ({ ratio: 1, svg: svg(120, 120, `<line x1="60" y1="60" x2="78" y2="104" stroke="#9AA3AD" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="52" r="26" fill="#${P.acc}"/><circle cx="51" cy="43" r="8" fill="#fff" fill-opacity=".45"/>`) }),
  // bút chì nằm chéo
  pencil: (P) => ({ ratio: 3.2, svg: svg(480, 150, `<g transform="rotate(-12 240 75)"><polygon points="40,60 360,60 360,96 40,96" fill="#${P.gold}"/><polygon points="40,60 360,60 360,72 40,72" fill="#fff" fill-opacity=".25"/><polygon points="360,60 420,78 360,96" fill="#E9D3B0"/><polygon points="404,73 420,78 404,83" fill="#333"/><rect x="18" y="60" width="26" height="36" fill="#B9BEC5"/><rect x="0" y="60" width="20" height="36" rx="6" fill="#E59A9A"/></g>`) }),
  // thước kẻ có vạch
  ruler: (P) => { let t = ""; for (let x = 24; x < 560; x += 16) t += `<line x1="${x}" y1="0" x2="${x}" y2="${(x / 16) % 5 === 0 ? 30 : 18}" stroke="#7A6A50" stroke-width="2"/>`;
    return { ratio: 600 / 150, svg: svg(600, 150, `<g transform="rotate(-8 300 75) translate(10 40)"><rect width="580" height="70" rx="6" fill="#E8D9B8"/>${t}</g>`) }; },
  // kính lúp
  lens: (P) => ({ ratio: 1, svg: svg(200, 200, `<line x1="128" y1="128" x2="186" y2="186" stroke="#3B3B3B" stroke-width="18" stroke-linecap="round"/><circle cx="84" cy="84" r="62" fill="#${P.acc}" fill-opacity=".08" stroke="#4A4A4A" stroke-width="12"/><path d="M50,62 A42,42 0 0 1 84,40" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/>`) }),
  // bút máy
  pen: (P) => ({ ratio: 3.2, svg: svg(480, 150, `<g transform="rotate(14 240 75)"><rect x="40" y="60" width="250" height="34" rx="17" fill="#${P.ink}"/><rect x="250" y="62" width="70" height="30" fill="#C9A45C"/><polygon points="320,62 410,77 320,92" fill="#B8BEC6"/><line x1="330" y1="77" x2="400" y2="77" stroke="#555" stroke-width="2"/><rect x="70" y="52" width="120" height="8" rx="4" fill="#C9A45C"/></g>`) }),
  // viên kính tròn (quả cầu trong) — bộ "kính"
  orb: (P) => ({ ratio: 1, svg: svg(200, 200, `<circle cx="100" cy="100" r="78" fill="url(#og)"/><ellipse cx="74" cy="66" rx="30" ry="18" fill="#fff" fill-opacity=".55" transform="rotate(-30 74 66)"/>`,
    `<radialGradient id="og" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#${P.accLight}"/><stop offset="1" stop-color="#${P.acc}"/></radialGradient>`) }),
  // chồng xu (tài chính, quỹ) — 4 đồng lệch nhẹ, mặt trên có vạch sáng
  coins: (P) => ({ ratio: 1.3, svg: svg(260, 200, [0, 1, 2, 3].map(i => `<ellipse cx="${130 + (i % 2 ? 6 : -4)}" cy="${160 - i * 30}" rx="92" ry="28" fill="#${P.gold}" stroke="#${P.ink}" stroke-opacity=".25" stroke-width="3"/><rect x="${38 + (i % 2 ? 6 : -4)}" y="${160 - i * 30}" width="184" height="12" fill="#${P.gold}" opacity=".85"/>`).join("") + `<ellipse cx="124" cy="70" rx="56" ry="14" fill="#fff" fill-opacity=".35"/>`) }),
  // sổ gập (sổ BHXH / hồ sơ cá nhân) — bìa màu nhấn, nhãn trắng, dây đánh dấu
  booklet: (P) => ({ ratio: 0.82, svg: svg(200, 244, `<g transform="rotate(-8 100 122)"><rect x="30" y="20" width="140" height="200" rx="10" fill="#${P.acc}"/><rect x="30" y="20" width="18" height="200" rx="6" fill="#${P.ink}" fill-opacity=".25"/><rect x="66" y="64" width="84" height="40" rx="6" fill="#fff" fill-opacity=".85"/><circle cx="108" cy="150" r="22" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5"/><rect x="138" y="200" width="12" height="40" fill="#${P.gold}"/></g>`) }),
  // ba cột kính (số liệu tăng) — gradient trong, đỉnh sáng
  bars: (P) => ({ ratio: 1.2, svg: svg(240, 200, [[30, 110], [100, 70], [170, 30]].map(([x, y]) => `<rect x="${x}" y="${y}" width="50" height="${190 - y}" rx="10" fill="url(#bg)"/><rect x="${x + 8}" y="${y + 8}" width="10" height="${170 - y}" rx="5" fill="#fff" fill-opacity=".5"/>`).join(""),
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${P.accLight}"/><stop offset="1" stop-color="#${P.acc}"/></linearGradient>`) }),
  // ---- đồ vật của 4 world đợt 2 + bổ sung (11/2026) ----
  // máy tính bỏ túi: màn hình + lưới phím (hoá đơn, thuế, kế toán)
  calculator: (P) => ({ ratio: 0.72, svg: svg(180, 250, `<g transform="rotate(-8 90 125)"><rect x="20" y="16" width="140" height="218" rx="16" fill="#${P.ink}"/><rect x="36" y="34" width="108" height="46" rx="6" fill="#DDE7DA"/><rect x="96" y="50" width="38" height="16" rx="3" fill="#${P.ink}" fill-opacity=".55"/>`
    + [0, 1, 2, 3].flatMap(r => [0, 1, 2].map(q => `<rect x="${38 + q * 36}" y="${96 + r * 32}" width="28" height="24" rx="5" fill="${r === 3 && q === 2 ? "#" + P.gold : "#FFFFFF"}" fill-opacity="${r === 3 && q === 2 ? 1 : 0.85}"/>`)).join("") + `</g>`) }),
  // thẻ ngân hàng: chip + dải số (không số thật, không logo)
  bankcard: (P) => ({ ratio: 1.55, svg: svg(310, 200, `<g transform="rotate(-10 155 100)"><rect x="20" y="30" width="270" height="168" rx="18" fill="#${P.acc}"/><rect x="20" y="30" width="270" height="168" rx="18" fill="url(#cg)"/>`
    + `<rect x="46" y="78" width="46" height="36" rx="6" fill="#${P.gold}"/><line x1="46" y1="96" x2="92" y2="96" stroke="#${P.ink}" stroke-opacity=".35" stroke-width="2"/>`
    + [0, 1, 2, 3].map(i => `<rect x="${46 + i * 56}" y="140" width="44" height="10" rx="5" fill="#FFFFFF" fill-opacity=".75"/>`).join("") + `</g>`,
    `<linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`) }),
  // con dấu cầm tay: cán gỗ + đế (mặt dấu TRƠN — không chữ, không hình cơ quan)
  stamp: (P) => ({ ratio: 0.8, svg: svg(200, 250, `<ellipse cx="100" cy="222" rx="70" ry="16" fill="#${P.bad || P.acc}" fill-opacity=".35"/><rect x="40" y="160" width="120" height="50" rx="10" fill="#${P.ink}"/>`
    + `<rect x="54" y="150" width="92" height="16" rx="6" fill="#5A4636"/><path d="M78 150 L84 70 Q100 44 116 70 L122 150 Z" fill="#8A6A4A"/><circle cx="100" cy="50" r="30" fill="#8A6A4A"/><ellipse cx="92" cy="42" rx="10" ry="7" fill="#fff" fill-opacity=".3"/>`) }),
  // container nhỏ: thân gờ tôn + cửa có thanh khoá (bến cảng, vận tải)
  crate: (P) => ({ ratio: 2.1, svg: svg(420, 200, `<rect x="16" y="40" width="388" height="140" rx="6" fill="#${P.acc}"/>` + [...Array(21).keys()].map(i => `<rect x="${30 + i * 17}" y="52" width="7" height="116" fill="#000" fill-opacity=".12"/>`).join("")
    + `<rect x="16" y="40" width="388" height="12" fill="#000" fill-opacity=".25"/><rect x="16" y="168" width="388" height="12" fill="#000" fill-opacity=".25"/>` + [330, 360].map(x => `<rect x="${x}" y="60" width="6" height="100" rx="3" fill="#E9E2D8"/>`).join("")) }),
  // vòng kính (xuyến dẹt)
  ring: (P) => ({ ratio: 1.6, svg: svg(320, 200, `<ellipse cx="160" cy="100" rx="130" ry="62" fill="none" stroke="url(#rg)" stroke-width="34"/>`,
    `<linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#${P.accLight}"/><stop offset="1" stop-color="#${P.acc}"/></linearGradient>`) }),
  // ---- da hop-dong-bh (bảo hiểm thương mại, 11/2026) ----
  // ô che mở: tán 6 múi xen màu nhấn / vàng, cán cong — vật chủ đạo "chuyển giao rủi ro"
  umbrella: (P) => { const m = [0, 1, 2, 3, 4, 5].map(i => { const x0 = 20 + i * 40, x1 = x0 + 40; return `<path d="M120 30 L${x0} 120 Q${x0 + 20} 104 ${x1} 120 Z" fill="#${i % 2 ? P.gold : P.acc}"/>`; }).join("");
    return { ratio: 1, svg: svg(240, 240, `<g transform="rotate(-10 120 120)">${m}<path d="M120 30 Q60 34 20 120 M120 30 Q180 34 260 120" fill="none" stroke="#${P.ink}" stroke-opacity=".15" stroke-width="2"/><line x1="120" y1="18" x2="120" y2="30" stroke="#${P.ink}" stroke-width="6" stroke-linecap="round"/>`
      + `<path d="M120 120 L120 200 Q120 222 100 222 Q84 222 84 206" fill="none" stroke="#${P.ink}" stroke-width="8" stroke-linecap="round"/></g>`) }; },
  // khiên có dấu chọn trống (không chữ, không biểu trưng): phạm vi / trách nhiệm bảo hiểm
  shield: (P) => ({ ratio: 0.85, svg: svg(204, 240, `<path d="M102 16 L184 46 L184 118 Q184 190 102 226 Q20 190 20 118 L20 46 Z" fill="#${P.acc}"/><path d="M102 16 L184 46 L184 118 Q184 190 102 226 Z" fill="#000" fill-opacity=".12"/>`
    + `<path d="M102 40 L162 62 L162 118 Q162 172 102 200 Q42 172 42 118 L42 62 Z" fill="none" stroke="#${P.gold}" stroke-width="6"/><path d="M70 118 L94 142 L138 96" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`) }),
};

module.exports = { PROPS };
