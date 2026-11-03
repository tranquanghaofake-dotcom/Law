// Thuật ngữ/chế định đã đổi từ 2025. Căn cứ chi tiết (số hiệu, điều, hiệu lực, link): $DOT7/audit/luat-doi-2025.md
// và docs/review/dot-7-do-chuan/luat-doi-2025.md. Mỗi mục: mẫu (regex 'iu'), nhãn, chế định hiện hành, căn cứ ngắn.
// Dùng như luật HIỆN HÀNH là sai; mô tả lịch sử ("trước 01/7/2025 có cấp huyện") là đúng → HISTORY_RE nhận ra ngữ cảnh lịch sử.

export type OldTerm = { id: string; re: RegExp; label: string; now: string; basis: string; /** chỉ gắn cờ khi cùng câu có mẫu này */ with?: RegExp };

export const OLD_TERMS: OldTerm[] = [
  {
    id: 'toa-an-cap-huyen',
    re: /(Tòa án|Toà án|TAND)( nhân dân)? (cấp huyện|huyện|quận)/iu,
    label: 'Tòa án nhân dân cấp huyện',
    now: 'Tòa án nhân dân khu vực',
    basis: 'Luật 81/2025/QH15 sửa Luật Tổ chức TAND; Luật 85/2025/QH15 sửa BLTTDS, Luật TTHC… (hiệu lực 01/7/2025)',
  },
  {
    id: 'toa-an-cap-cao',
    re: /(Tòa án|Toà án|TAND)( nhân dân)? cấp cao/iu,
    label: 'Tòa án nhân dân cấp cao',
    now: 'không còn cấp này; hệ thống: TAND tối cao, TAND cấp tỉnh, TAND khu vực (và Tòa án quân sự)',
    basis: 'Luật 81/2025/QH15 sửa Luật Tổ chức TAND (hiệu lực 01/7/2025)',
  },
  {
    id: 'vks-cap-huyen-cao',
    re: /(Viện kiểm sát|VKSND)( nhân dân)? (cấp huyện|huyện|quận|cấp cao)/iu,
    label: 'Viện kiểm sát nhân dân cấp huyện / cấp cao',
    now: 'VKSND tối cao, VKSND cấp tỉnh, VKSND khu vực (và VKS quân sự)',
    basis: 'Luật 82/2025/QH15 sửa Luật Tổ chức VKSND (hiệu lực 01/7/2025)',
  },
  {
    id: 'cap-huyen',
    re: /cấp huyện|(Ủy ban nhân dân|Uỷ ban nhân dân|UBND|Hội đồng nhân dân|HĐND) (huyện|quận|thị xã)\b/iu,
    label: 'cấp huyện / UBND, HĐND huyện',
    now: 'chính quyền địa phương 2 cấp: cấp tỉnh và cấp xã (xã, phường, đặc khu); việc của cấp huyện chuyển cho cấp tỉnh hoặc cấp xã theo luật chuyên ngành',
    basis: 'Hiến pháp sửa đổi NQ 203/2025/QH15 (Điều 110); Luật Tổ chức CQĐP 72/2025/QH15; cấp huyện kết thúc hoạt động từ 01/7/2025',
  },
  {
    id: 'thi-tran',
    re: /thị trấn/iu,
    label: 'thị trấn',
    now: 'đơn vị hành chính cấp xã gồm xã, phường, đặc khu',
    basis: 'Hiến pháp sửa đổi NQ 203/2025/QH15 (Điều 110); Luật Tổ chức CQĐP 72/2025/QH15',
  },
  {
    id: '63-tinh',
    re: /\b63 tỉnh/iu,
    label: '63 tỉnh, thành phố',
    now: '34 đơn vị hành chính cấp tỉnh (28 tỉnh, 6 thành phố)',
    basis: 'Nghị quyết 202/2025/QH15 về sắp xếp đơn vị hành chính cấp tỉnh (hiệu lực 12/6/2025)',
  },
  {
    id: 'bo-cu',
    re: /(Bộ|Sở) Kế hoạch và Đầu tư|(Bộ|Sở|Phòng) Lao động(\s*[-–—,]?\s*Thương binh)?|(Bộ|Sở) Thông tin và Truyền thông|(Bộ|Sở|Phòng) Tài nguyên và Môi trường|(Bộ|Sở) Nông nghiệp và Phát triển nông thôn|(Bộ|Sở) Giao thông vận tải|Ủy ban Dân tộc/iu,
    label: 'tên bộ/sở trước sắp xếp 2025',
    now: 'Bộ/Sở Tài chính (nhận KH&ĐT); Bộ/Sở Nội vụ (nhận LĐ-TB&XH); Bộ/Sở Khoa học và Công nghệ (nhận TT&TT); Bộ/Sở Nông nghiệp và Môi trường; Bộ/Sở Xây dựng (nhận GTVT); Bộ Dân tộc và Tôn giáo',
    basis: 'Nghị quyết 176/2025/QH15 (14 bộ, 3 cơ quan ngang bộ, hoạt động từ 01/3/2025); Nghị định 45/2025/NĐ-CP (sở thuộc UBND tỉnh, từ 01/3/2025)',
  },
  {
    id: 'thanh-tra-bo',
    re: /Thanh tra (Bộ (?!Quốc phòng|Công an)\p{Lu}[\p{L}]*( [\p{L}]+){0,4}|sở\b|huyện\b)/u,
    label: 'Thanh tra Bộ / Thanh tra sở / Thanh tra huyện',
    now: 'Thanh tra Chính phủ, Thanh tra tỉnh, thanh tra trong Quân đội, Công an, Ngân hàng Nhà nước, Thanh tra Cơ yếu (Điều 7)',
    basis: 'Luật Thanh tra 84/2025/QH15 (hiệu lực 01/7/2025)',
  },
  {
    id: 'tu-hinh-8-toi',
    re: /tử hình/iu,
    with: /tham ô|nhận hối lộ|vận chuyển trái phép chất ma túy|gián điệp|phá hoại cơ sở vật chất|hàng giả là thuốc|phá hoại hòa bình|lật đổ chính quyền|ba phần tư tài sản/iu,
    label: 'tử hình đối với 8 tội đã bỏ (Điều 109, 110, 114, 194, 250, 353, 354, 421) hoặc miễn thi hành do nộp lại 3/4 tài sản',
    now: 'các tội này không còn hình phạt tử hình; khoản 3 Điều 40 chỉ còn 3 trường hợp không thi hành án tử hình',
    basis: 'Luật 86/2025/QH15 sửa BLHS (hiệu lực 01/7/2025); VBHN 135/VBHN-VPQH 2025',
  },
  {
    id: 'luat-cu',
    re: /Luật Ban hành văn bản quy phạm pháp luật (năm )?2015|Luật (Ban hành )?VBQPPL (năm )?2015|Luật Đất đai (năm )?2013|Luật Đầu tư (năm )?(2014|2020)|Luật Phá sản (năm )?2014|Luật (Ngân sách nhà nước|NSNN) (năm )?2015|Luật Việc làm (năm )?2013|Luật Cán bộ,? công chức (năm )?2008|Luật Tổ chức Chính phủ (năm )?2015|Luật Tổ chức chính quyền địa phương (năm )?2015|Luật Bảo hiểm xã hội (năm )?2014|Luật Bảo hiểm tiền gửi (năm )?2012|Luật Quản lý thuế (năm )?2019|Luật Thuế thu nhập doanh nghiệp (năm )?2008|Luật Thuế thu nhập cá nhân (năm )?2007|Luật Thuế tiêu thụ đặc biệt (năm )?2008|Luật Thuế giá trị gia tăng (năm )?2008|Luật Các tổ chức tín dụng (năm )?2010|Luật Doanh nghiệp (năm )?(2005|2014)/iu,
    label: 'văn bản đã bị thay thế',
    now: 'văn bản thay thế (xem luat-doi-2025.md)',
    basis: 'xem luat-doi-2025.md',
  },
];

/** Dấu hiệu câu đang nói về lịch sử / so sánh trước-sau → thường là báo nhầm. */
export const HISTORY_RE =
  /đã được thay thế|thay thế bởi|nay thuộc|giữ nguyên theo văn bản|không còn|trước (ngày )?0?1\/0?7\/2025|trước 2025|trước khi (sắp xếp|sửa đổi|bỏ)|đến (hết )?(ngày )?30\/0?6\/2025|kết thúc hoạt động|bỏ cấp huyện|không còn (cấp huyện|tổ chức|TAND|Tòa)|đã bỏ|đã bãi bỏ|đã bị thay thế|hết hiệu lực|trước đây|lịch sử|thời kỳ|giai đoạn|Hiến pháp (năm )?(1946|1959|1980|1992)|Luật 86\/2025|Luật 81\/2025|Luật 85\/2025|NQ 203|Nghị quyết 203|sắp xếp đơn vị hành chính|chính quyền (địa phương )?2 cấp|hai cấp/iu;

export type TermHit = { term: OldTerm; match: string; history: boolean };

export function findOldTerms(text: string): TermHit[] {
  const s = text.normalize('NFC');
  const out: TermHit[] = [];
  for (const t of OLD_TERMS) {
    const m = t.re.exec(s);
    if (!m) continue;
    if (t.with && !t.with.test(s)) continue;
    const luatCu = OLD_TERMS.find((x) => x.id === 'luat-cu')!.re;
    out.push({ term: t, match: m[0], history: HISTORY_RE.test(s) || (t.id !== 'luat-cu' && luatCu.test(s)) || (t.id === 'luat-cu' && /so với|khác với|thay|trước/iu.test(s)) });
  }
  // "Tòa án nhân dân cấp huyện" đã có mục riêng: chỉ giữ cờ "cấp huyện" chung khi còn "cấp huyện" ở chỗ khác.
  const g = out.findIndex((h) => h.term.id === 'cap-huyen');
  if (g >= 0 && out.some((h) => h.term.id === 'toa-an-cap-huyen' || h.term.id === 'vks-cap-huyen-cao')) {
    const rest = s.replace(/(Tòa án|Toà án|TAND|Viện kiểm sát|VKSND)( nhân dân)? (cấp huyện|huyện|quận)/giu, '');
    if (!OLD_TERMS.find((t) => t.id === 'cap-huyen')!.re.test(rest)) out.splice(g, 1);
  }
  return out;
}
