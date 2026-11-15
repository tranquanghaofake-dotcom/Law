// Bộ hình PHẲNG 2 TÔNG của bài Chương 3 (thẻ phong cách: thiet-ke/phong-cach.json). Asset của bài, không thuộc skill.
// Quy tắc: mỗi khối một màu nền + một màu bóng (nửa phải tối hơn, ánh sáng từ trái), không gradient, không làm nhoè,
// bóng đất là elip phẳng một màu; khung 240×240, đất ở y ≈ 222; thước: người cao ≈ 200, toà nhà ≈ 210 khi vẽ ở cùng chiều rộng — đặt toà nhà to gấp ~2,2 lần người khi ghép.
const M = { muc: "#1D2B2A", dat: "#E3D9C6", da: "#E8B48C", daB: "#D19A70", trang: "#FFFFFF", vang: "#E8A33D",
  xanh: "#2E6DA4", xanhB: "#22547F", xanhNhat: "#DCE7F2", ngoc: "#0F5C55", ngocB: "#0B4540", ngocNhat: "#CFE6E0",
  nau: "#8A5A2B", nauB: "#6A441F", nauNhat: "#EADBC5", do: "#B0302A", doB: "#8A2420", xam: "#7F8C8F", xamB: "#66737A",
  tuong: "#EFE6D6", tuongB: "#DCCFB7" };
// nét viền mực như Open Peeps (≈ 0,6 % bề ngang) để nhà, toà nhà, hợp đồng cùng phong cách với nhân vật
const VIEN = `stroke="#1D2B2A" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
const svg = (b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><g ${VIEN}>${b}</g></svg>`;
const dat = (rx) => `<ellipse cx="120" cy="224" rx="${rx}" ry="7" fill="${M.dat}" stroke="none"/>`;

// người: áo (màu vai trò) + nửa phải tối; quần mực; đầu tròn; tóc mực
function nguoi({ ao, aoB, quan = M.muc, vest = true, cam = "" }) {
  return svg(`${dat(44)}
  <rect x="102" y="146" width="16" height="72" rx="7" fill="${quan}"/><rect x="122" y="146" width="16" height="72" rx="7" fill="${quan}"/>
  <rect x="96" y="212" width="24" height="10" rx="5" fill="${M.muc}"/><rect x="120" y="212" width="24" height="10" rx="5" fill="${M.muc}"/>
  <rect x="80" y="80" width="15" height="66" rx="7.5" fill="${ao}"/><rect x="145" y="80" width="15" height="66" rx="7.5" fill="${aoB}"/>
  <circle cx="87.5" cy="148" r="7" fill="${M.da}"/><circle cx="152.5" cy="148" r="7" fill="${M.daB}"/>
  <path d="M90 92 Q90 72 112 72 H128 Q150 72 150 92 V156 H90Z" fill="${ao}"/><path d="M120 72 H128 Q150 72 150 92 V156 H120Z" fill="${aoB}"/>
  ${vest ? `<path d="M110 72 L120 96 L130 72Z" fill="${M.trang}"/><path d="M117 78 L123 78 L121 104 L119 104Z" fill="${M.vang}"/>` : `<path d="M110 72 Q120 84 130 72Z" fill="${M.da}"/>`}
  <rect x="113" y="60" width="14" height="14" fill="${M.daB}"/><circle cx="120" cy="46" r="20" fill="${M.da}"/>
  <path d="M100 44 Q100 24 120 24 Q141 24 140 44 Q132 34 120 35 Q108 34 100 44Z" fill="${M.muc}"/>${cam}`);
}
function nguoiNu({ ao, aoB }) {
  return svg(`${dat(44)}
  <rect x="106" y="176" width="12" height="42" rx="6" fill="${M.muc}"/><rect x="122" y="176" width="12" height="42" rx="6" fill="${M.muc}"/>
  <rect x="100" y="212" width="20" height="10" rx="5" fill="${M.muc}"/><rect x="120" y="212" width="20" height="10" rx="5" fill="${M.muc}"/>
  <rect x="82" y="80" width="14" height="62" rx="7" fill="${ao}"/><rect x="144" y="80" width="14" height="62" rx="7" fill="${aoB}"/>
  <circle cx="89" cy="144" r="7" fill="${M.da}"/><circle cx="151" cy="144" r="7" fill="${M.daB}"/>
  <path d="M92 92 Q92 72 112 72 H128 Q148 72 148 92 L156 180 H84Z" fill="${ao}"/><path d="M120 72 H128 Q148 72 148 92 L156 180 H120Z" fill="${aoB}"/>
  <path d="M96 40 Q96 20 120 20 Q144 20 144 40 L148 84 H92Z" fill="${M.muc}"/>
  <rect x="113" y="60" width="14" height="14" fill="${M.daB}"/><circle cx="120" cy="46" r="19" fill="${M.da}"/>
  <path d="M101 44 Q102 26 120 26 Q138 26 139 44 Q128 34 112 38Z" fill="${M.muc}"/>`);
}
// toà nhà doanh nghiệp: khối + mặt phải tối + lưới cửa sổ + huy hiệu khiên
function toa(mau, mauB, nhat) {
  let cua = ""; for (let h = 0; h < 8; h++) for (let c = 0; c < 4; c++) cua += `<rect x="${72 + c * 26}" y="${70 + h * 17}" width="14" height="10" rx="2" fill="${c < 2 ? nhat : mauB === M.ngocB ? "#A9CFC6" : "#D6C1A2"}"/>`;
  return svg(`${dat(70)}<rect x="60" y="24" width="120" height="196" rx="4" fill="${mau}"/><rect x="120" y="24" width="60" height="196" fill="${mauB}"/><rect x="54" y="16" width="132" height="14" rx="4" fill="${mauB}"/>
  ${cua}<rect x="104" y="188" width="32" height="32" rx="3" fill="${M.muc}"/>
  <path d="M120 36 L134 41 V52 Q134 61 120 66 Q106 61 106 52 V41Z" fill="${M.vang}"/><path d="M114 51 l5 5 l8 -9" stroke="${M.trang}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
}
// nhà: tường + mặt phải tối, mái đỏ hai tông, cửa ngọc, cửa sổ
const nhaKhoi = `<rect x="56" y="120" width="128" height="98" fill="${M.tuong}"/><rect x="146" y="120" width="38" height="98" fill="${M.tuongB}"/>
  <rect x="152" y="62" width="16" height="40" fill="${M.doB}"/><path d="M40 126 L120 58 L200 126Z" fill="${M.do}"/><path d="M120 58 L200 126 H120Z" fill="${M.doB}"/>
  <rect x="104" y="164" width="30" height="54" rx="3" fill="${M.ngoc}"/><rect x="68" y="142" width="28" height="26" rx="2" fill="${M.xanhNhat}"/><rect x="150" y="142" width="26" height="26" rx="2" fill="#C5D4E3"/>`;
const nha = () => svg(`${dat(90)}${nhaKhoi}`);
const nhaChay = () => svg(`${dat(90)}${nhaKhoi}
  <path d="M168 128 Q140 104 156 70 Q162 92 174 92 Q168 62 192 40 Q190 72 206 84 Q216 100 206 118 Q196 134 168 128Z" fill="${M.do}"/>
  <path d="M172 124 Q156 108 166 88 Q172 102 182 100 Q180 80 194 66 Q196 88 204 98 Q208 112 198 122 Q188 130 172 124Z" fill="${M.vang}"/>
  <path d="M178 120 Q170 110 176 100 Q182 108 188 104 Q190 112 194 114 Q192 124 178 120Z" fill="#F7D58C"/>`);
const hopDong = () => svg(`${dat(80)}<g transform="rotate(-6 120 120)"><rect x="66" y="30" width="122" height="170" rx="4" fill="${M.tuongB}"/><rect x="58" y="22" width="122" height="170" rx="4" fill="#FBF7EF"/>
  <rect x="72" y="38" width="62" height="9" rx="3" fill="${M.ngoc}"/>${[0, 1, 2, 3, 4, 5, 6].map((k) => `<rect x="72" y="${60 + k * 14}" width="${92 - (k % 3) * 14}" height="5" rx="2.5" fill="#CFC3AE"/>`).join("")}
  <circle cx="152" cy="164" r="15" fill="none" stroke="${M.do}" stroke-width="3"/><path d="M72 170 q9 -12 16 -2 q7 10 14 -4 q6 -9 12 2" fill="none" stroke="${M.xanh}" stroke-width="2.6" stroke-linecap="round"/></g>
  <g transform="rotate(32 196 150)"><rect x="190" y="84" width="12" height="92" rx="5" fill="${M.muc}"/><path d="M190 176 L196 194 L202 176Z" fill="${M.vang}"/></g>`);
// hai xe va chạm (TNDS): xe người được bảo hiểm (xanh) đâm xe người thứ ba (xám)
const xe = (v, vB, tx, lat) => `<g transform="translate(${tx} 0)${lat ? " translate(240 0) scale(-1 1)" : ""}"><path d="M24 112 Q22 86 46 82 L78 80 L104 52 Q112 44 128 44 L168 44 Q182 44 190 56 L206 80 Q226 84 226 104 L226 116 Q226 122 218 122 L30 122 Q24 122 24 112Z" fill="${v}"/>
  <path d="M24 104 H226 V116 Q226 122 218 122 H30 Q24 122 24 112Z" fill="${vB}"/><path d="M110 58 Q114 52 124 52 L144 52 L144 80 L92 80Z" fill="${M.xanhNhat}"/><path d="M152 52 L168 52 Q176 52 182 60 L196 80 L152 80Z" fill="${M.xanhNhat}"/>
  ${[66, 182].map((x) => `<circle cx="${x}" cy="122" r="22" fill="${M.muc}"/><circle cx="${x}" cy="122" r="10" fill="${M.tuongB}"/>`).join("")}</g>`;
const vaCham = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200"><ellipse cx="250" cy="150" rx="230" ry="9" fill="${M.dat}"/><g stroke="#1D2B2A" stroke-width="3" stroke-linejoin="round">${xe(M.xanh, M.xanhB, 0, false)}${xe(M.xam, M.xamB, 250, true)}</g>
  <path d="M250 64 l10 18 l20 -6 l-12 16 l16 12 l-20 2 l2 20 l-14 -14 l-14 14 l2 -20 l-20 -2 l16 -12 l-12 -16 l20 6Z" fill="${M.vang}" stroke="${M.do}" stroke-width="3"/></svg>`;

module.exports = { M, VE: {
  nguoi: () => nguoi({ ao: M.xanh, aoB: M.xanhB, cam: `<rect x="150" y="128" width="34" height="24" rx="2" fill="${M.trang}"/><path d="M150 128 L167 142 L184 128Z" fill="${M.vang}"/>` }),
  nguoiDung: () => nguoi({ ao: "#5B8FC4", aoB: M.xanh, quan: "#33475B", vest: false }),
  nu: () => nguoiNu({ ao: M.xam, aoB: M.xamB }),
  toa: () => toa(M.ngoc, M.ngocB, M.ngocNhat), toaNhan: () => toa(M.nau, M.nauB, M.nauNhat),
  nha, nhaChay, hopDong, vaCham } };
