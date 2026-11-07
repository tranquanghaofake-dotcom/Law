// Bảng ánh xạ tên văn bản → file toàn văn trong packages/content/data/laws/.
// Mỗi mục: mẫu tên (regex, so khớp ngay sau "Điều N"), file, các năm được coi là cùng văn bản hiện hành.
// Gặp năm khác (vd. "Luật Đất đai 2013") → văn bản cũ, không có trong kho (ly_do 'van-ban-cu').
// excerpt: file chỉ là bản trích (sử liệu, Hiến pháp cũ, slide) → không kết luận "điều không tồn tại".

export type LawRef = {
  /** Tên hiển thị. */
  label: string;
  /** Mẫu tên, không có cờ; được bọc ^(?:của\s+)?(...) và dùng cờ 'iu'. */
  pattern: string;
  /** File trong laws/ hoặc null nếu kho chưa có toàn văn. */
  file: string | null;
  /** Năm ghi sau tên vẫn là văn bản này (năm ban hành, năm sửa đổi, năm VBHN). Rỗng = mọi năm. */
  years?: number[];
  /** Năm cũ → file khác (thường là bản trích lịch sử). */
  oldYears?: Record<number, string>;
  excerpt?: boolean;
};

const LS = 'lich-su-su-lieu.txt';

export const LAWS: LawRef[] = [
  { label: 'Nghị quyết 203/2025/QH15 (sửa Hiến pháp)', pattern: 'Nghị quyết (?:số )?203/2025/QH15|NQ 203/2025/QH15', file: null },
  {
    label: 'Hiến pháp 2013', pattern: 'Hiến pháp(?: nước Cộng hòa xã hội chủ nghĩa Việt Nam)?|HP', file: 'hien-phap-2013.txt', years: [2013, 2025],
    oldYears: { 1946: 'hien-phap-lich-su.txt', 1959: 'hien-phap-lich-su.txt', 1980: 'hien-phap-lich-su.txt', 1992: 'hien-phap-lich-su.txt' },
  },
  { label: 'Bộ luật Dân sự 2015', pattern: 'Bộ luật Dân sự|BLDS', file: 'blds-2015.txt', years: [2015], oldYears: { 1995: LS } },
  { label: 'Bộ luật Hình sự 2015', pattern: 'Bộ luật Hình sự|BLHS', file: 'blhs-vbhn-2025.txt', years: [2015, 2017, 2025], oldYears: { 1985: LS } },
  { label: 'Bộ luật Lao động 2019', pattern: 'Bộ luật Lao động|BLLĐ', file: 'blld-vbhn-2025.txt', years: [2019, 2025, 2026] },
  { label: 'Bộ luật Tố tụng dân sự 2015', pattern: 'Bộ luật Tố tụng dân sự|BLTTDS|BLTTDS', file: 'bltt-ds-vbhn-2026.txt', years: [2015, 2025, 2026] },
  { label: 'Bộ luật Tố tụng hình sự', pattern: 'Bộ luật Tố tụng hình sự|BLTTHS', file: null },
  { label: 'Luật Chứng khoán 2019', pattern: 'Luật Chứng khoán|LCK', file: 'chung-khoan-vbhn-2026.txt', years: [2019, 2024, 2026] },
  { label: 'Luật Doanh nghiệp 2020', pattern: 'Luật Doanh nghiệp|LDN', file: 'ldn-vbhn-2025.txt', years: [2020, 2022, 2025], oldYears: { 1999: LS } },
  { label: 'Luật Sở hữu trí tuệ', pattern: 'Luật Sở hữu trí tuệ|Luật SHTT', file: 'shtt-vbhn-2026.txt', years: [2005, 2009, 2019, 2022, 2025, 2026] },
  { label: 'Luật Ban hành VBQPPL 2025', pattern: 'Luật Ban hành văn bản quy phạm pháp luật|Luật BHVBQPPL|Luật Ban hành VBQPPL', file: 'bhvbqppl-vbhn-2025.txt', years: [2025] },
  { label: 'Luật Thương mại 2005', pattern: 'Luật Thương mại|LTM', file: 'ltm-vbhn-2025.txt', years: [2005, 2017, 2019, 2025] },
  { label: 'Luật Đất đai 2024', pattern: 'Luật Đất đai|LĐĐ', file: 'ldd-vbhn-2026.txt', years: [2024, 2025, 2026], oldYears: { 1987: LS } },
  { label: 'Luật Hôn nhân và gia đình 2014', pattern: 'Luật Hôn nhân và gia đình|Luật HN(?:&|và)GĐ|Luật HNGĐ', file: 'hngd-vbhn-2025.txt', years: [2014, 2025] },
  { label: 'Luật Cạnh tranh 2018', pattern: 'Luật Cạnh tranh|LCT', file: 'luat-canh-tranh-2018.txt', years: [2018] },
  { label: 'Luật Đầu tư 2025', pattern: 'Luật Đầu tư|LĐT', file: 'ldt-vbhn-2026.txt', years: [2025, 2026] },
  { label: 'Luật Xử lý vi phạm hành chính', pattern: 'Luật Xử lý vi phạm hành chính|Luật XLVPHC', file: 'xlvphc-vbhn-2026.txt', years: [2012, 2014, 2017, 2020, 2022, 2024, 2025, 2026] },
  { label: 'Luật Các tổ chức tín dụng 2024', pattern: 'Luật (?:Các )?tổ chức tín dụng|Luật (?:các )?TCTD', file: 'ltctd-vbhn-2026.txt', years: [2024, 2025, 2026] },
  { label: 'Luật Bầu cử ĐBQH và ĐB HĐND', pattern: 'Luật Bầu cử', file: 'bau-cu-vbhn-2026.txt', years: [2015, 2025, 2026] },
  { label: 'Luật Quốc tịch Việt Nam', pattern: 'Luật Quốc tịch', file: 'quoc-tich-vbhn-2025.txt', years: [2008, 2014, 2025] },
  { label: 'Luật Bảo hiểm xã hội 2024', pattern: 'Luật Bảo hiểm xã hội|Luật BHXH', file: 'lbhxh-2024.txt', years: [2024, 2026] },
  { label: 'Luật Bảo hiểm y tế', pattern: 'Luật Bảo hiểm y tế|Luật BHYT', file: 'lbhyt-vbhn-2026.txt', years: [2008, 2014, 2024, 2026] },
  { label: 'Luật Bảo hiểm tiền gửi 2025', pattern: 'Luật Bảo hiểm tiền gửi|Luật BHTG', file: 'lbhtg-2025.txt', years: [2025] },
  { label: 'Luật Ngân sách nhà nước 2025', pattern: 'Luật Ngân sách nhà nước|Luật NSNN', file: 'lnsnn-2025.txt', years: [2025] },
  { label: 'Luật Phục hồi, phá sản 2025', pattern: 'Luật Phục hồi,? phá sản', file: 'lphps-2025.txt', years: [2025] },
  { label: 'Luật Phá sản 2014 (đã bị thay thế)', pattern: 'Luật Phá sản', file: null },
  { label: 'Luật Ngân hàng Nhà nước Việt Nam', pattern: 'Luật Ngân hàng Nhà nước(?: Việt Nam)?|Luật NHNN', file: 'lnhnn-vbhn-2026.txt', years: [2010, 2022, 2026] },
  { label: 'Luật Thuế thu nhập doanh nghiệp 2025', pattern: 'Luật Thuế thu nhập doanh nghiệp|Luật Thuế TNDN', file: 'ltndn-2025.txt', years: [2025] },
  { label: 'Luật Thuế thu nhập cá nhân 2025', pattern: 'Luật Thuế thu nhập cá nhân|Luật Thuế TNCN', file: 'ltncn-2025.txt', years: [2025] },
  { label: 'Luật Thuế giá trị gia tăng 2024', pattern: 'Luật Thuế giá trị gia tăng|Luật Thuế GTGT', file: 'lgtgt-2024.txt', years: [2024, 2025, 2026] },
  { label: 'Luật Thuế tiêu thụ đặc biệt 2025', pattern: 'Luật Thuế tiêu thụ đặc biệt|Luật Thuế TTĐB', file: 'lttdb-2025.txt', years: [2025] },
  { label: 'Luật Thuế xuất khẩu, thuế nhập khẩu', pattern: 'Luật Thuế xuất khẩu,? thuế nhập khẩu|Luật Thuế XK,? ?NK|Luật Thuế XNK', file: 'lxnk-vbhn-2026.txt', years: [2016, 2025, 2026] },
  { label: 'Luật Thuế sử dụng đất phi nông nghiệp', pattern: 'Luật Thuế sử dụng đất phi nông nghiệp', file: 'lpnn-vbhn-2024.txt', years: [2010, 2024] },
  { label: 'Luật Thuế tài nguyên', pattern: 'Luật Thuế tài nguyên', file: 'lttn-vbhn-2022.txt', years: [2009, 2014, 2022] },
  { label: 'Luật Quản lý thuế 2025', pattern: 'Luật Quản lý thuế|Luật QLT', file: 'lqlt-2025.txt', years: [2025] },
  { label: 'Luật Hợp tác xã 2023', pattern: 'Luật Hợp tác xã|Luật HTX', file: 'lhtx-vbhn-2026.txt', years: [2023, 2026] },
  { label: 'Luật Việc làm 2025', pattern: 'Luật Việc làm', file: 'lvl-2025.txt', years: [2025] },
  { label: 'Luật Tư pháp người chưa thành niên 2024', pattern: 'Luật Tư pháp người chưa thành niên', file: 'tptn-2024.txt', years: [2024, 2025, 2026] },
  { label: 'Luật Cán bộ, công chức 2025', pattern: 'Luật Cán bộ,? công chức|Luật CBCC', file: 'lcbcc-2025.txt', years: [2025] },
  { label: 'Luật Trọng tài thương mại 2010', pattern: 'Luật Trọng tài thương mại|Luật TTTM', file: 'tttm-vbhn-2025.txt', years: [2010, 2025] },
  { label: 'Pháp lệnh Ưu đãi người có công', pattern: 'Pháp lệnh (?:số )?(?:Ưu đãi người có công(?: với cách mạng)?|02/2020(?:/UBTVQH14)?)', file: 'plud-2020.txt', years: [2020] },
  { label: 'Pháp lệnh Ngoại hối', pattern: 'Pháp lệnh Ngoại hối', file: 'plnh-vbhn-2026.txt', years: [2005, 2013, 2026] },
  { label: 'Luật Tổ chức Chính phủ 2025', pattern: 'Luật Tổ chức Chính phủ', file: 'ltccp-2025.txt', years: [2025] },
  { label: 'Luật Tố cáo', pattern: 'Luật Tố cáo', file: 'ltc-vbhn-2026.txt', years: [2018, 2025, 2026] },
  { label: 'Luật Khiếu nại', pattern: 'Luật Khiếu nại', file: 'lkn-vbhn-2026.txt', years: [2011, 2025, 2026] },
  { label: 'Luật Người lao động VN đi làm việc ở nước ngoài', pattern: 'Luật Người lao động Việt Nam đi làm việc ở nước ngoài[^.;,()]*|Luật (?:số )?69/2020(?:/QH14)?', file: 'lnldnn-2020.txt', years: [2020] },
  { label: 'Luật Tố tụng hành chính', pattern: 'Luật Tố tụng hành chính|Luật TTHC', file: 'ltthc-vbhn-2026.txt', years: [2015, 2025, 2026] },
  { label: 'Nghị quyết 198/2025/QH15', pattern: 'Nghị quyết (?:số )?198(?:/2025/QH15)?|NQ 198(?:/2025/QH15)?', file: 'nq198-2025.txt' },
  { label: 'Nghị định 168/2025/NĐ-CP', pattern: 'Nghị định (?:số )?168(?:/2025/NĐ-CP)?|NĐ 168(?:/2025/NĐ-CP)?', file: 'nd168-2025.txt' },
  // Văn bản lịch sử: chỉ có bản trích.
  { label: 'Quốc triều hình luật', pattern: 'Quốc triều hình luật|QTHL', file: LS, excerpt: true },
  { label: 'Hoàng Việt luật lệ', pattern: 'Hoàng Việt luật lệ', file: null },
  { label: 'Sắc lệnh (1945–1950)', pattern: 'Sắc lệnh(?: số)? \\d+(?:/SL)?', file: LS, excerpt: true },
  { label: 'Luật Hôn nhân và gia đình 1959', pattern: 'Luật (?:Hôn nhân và gia đình|HNGĐ) 1959', file: LS, excerpt: true },
  { label: 'Luật Công ty 1990', pattern: 'Luật Công ty(?: 1990)?', file: LS, excerpt: true },
  { label: 'Luật Hôn nhân và gia đình 2014', pattern: 'Luật (?:Hôn nhân và gia đình|HNGĐ)', file: null },
];

/** File chỉ là bản trích — không kết luận điều không tồn tại. */
export const EXCERPT_FILES = new Set(['hien-phap-lich-su.txt', LS, 'hc-slide-trich.txt']);

/** Đầu một tên văn bản mà bảng trên không nhận ra → ngoài kho. */
export const GENERIC_LAW_HEAD = /^(?:của\s+)?((?:Bộ luật|Luật|Nghị định|Nghị quyết|Pháp lệnh|Thông tư|Sắc lệnh|Quyết định|Công ước|Hiệp định|Lệnh)(?:\s+(?:số\s+)?[\p{Lu}\dĐ][^\s.;,():]*)(?:\s+[^\s.;,():]+){0,6})/u;

export type Resolved =
  | { ok: true; file: string; label: string; excerpt: boolean; matched: string }
  | { ok: false; reason: 'ngoai-kho' | 'van-ban-cu'; label: string; matched: string };

const compiled = LAWS.map((l) => ({ l, re: new RegExp(`^(?:của\\s+|theo\\s+|thuộc\\s+)?(?:${l.pattern})(?![\\p{L}])(?:\\s+(?:năm\\s+)?(\\d{4}))?`, 'iu') }));

/** Thử nhận tên văn bản ở đầu chuỗi `s` (văn bản ngay sau "Điều N"). null = không có tên. */
export function resolveLawAt(s: string): Resolved | null {
  const t = s.replace(/^[\s(]+/, '');
  for (const { l, re } of compiled) {
    const m = re.exec(t);
    if (!m) continue;
    // Viết tắt toàn chữ hoa (BLDS, LTM…) phải đúng hoa để khỏi nhầm từ thường.
    const year = m[1] ? Number(m[1]) : null;
    if (year && l.oldYears?.[year]) {
      const file = l.oldYears[year];
      return { ok: true, file, label: `${l.label.replace(/ \d{4}$/, '')} ${year}`, excerpt: EXCERPT_FILES.has(file), matched: m[0] };
    }
    if (year && l.years && l.years.length && !l.years.includes(year)) return { ok: false, reason: 'van-ban-cu', label: `${l.label} — ghi năm ${year}`, matched: m[0] };
    if (!l.file) return { ok: false, reason: 'ngoai-kho', label: l.label, matched: m[0] };
    return { ok: true, file: l.file, label: l.label, excerpt: !!l.excerpt || EXCERPT_FILES.has(l.file), matched: m[0] };
  }
  const g = GENERIC_LAW_HEAD.exec(t);
  if (g) {
    const name = g[1];
    // "Luật này", "Bộ luật này", "Nghị định này": văn bản đang được trích (ngữ cảnh), không phải tên mới.
    if (/^(?:Bộ luật|Luật|Nghị định|Nghị quyết|Pháp lệnh|Thông tư)\s+(?:này|đó|trên|nói trên|đã dẫn|hiện hành|mới|cũ|năm|số)(?![\p{L}])/iu.test(name)) return null;
    // "Luật 2024", "Luật 1959": viết tắt văn bản đang bàn (ngữ cảnh). Tên môn học/trường ("Luật Hiến pháp", "ĐH Luật Hà Nội") không phải văn bản.
    if (/^Luật\s+\d{4}(?!\/)/u.test(name)) return null;
    if (/^Luật\s+(?:Hiến pháp|Hình sự|Dân sự|Hành chính|An sinh xã hội|Lao động|Hà Nội|Kinh tế|Tài chính|Ngân hàng|Thương mại quốc tế|Quốc tế)(?![\p{L}])/u.test(name)) return null;
    return { ok: false, reason: 'ngoai-kho', label: name.trim(), matched: g[0] };
  }
  return null;
}

/** Ánh xạ URL (source.url) → file, từ dòng đầu các file luật và SOURCES.md. */
export function buildUrlMap(lawHeaders: Record<string, string>, sourcesMd: string): Map<string, string> {
  const map = new Map<string, string>();
  const urlRe = /https?:\/\/[^\s)|;,]+/g;
  const key = urlKey;
  for (const [file, head] of Object.entries(lawHeaders)) for (const u of head.match(urlRe) ?? []) if (!map.has(key(u))) map.set(key(u), file);
  for (const row of sourcesMd.split('\n')) {
    const files = [...row.matchAll(/laws\/([a-z0-9-]+\.txt)/g)].map((m) => m[1]);
    if (files.length !== 1) continue;
    for (const u of row.match(urlRe) ?? []) if (!map.has(key(u))) map.set(key(u), files[0]);
  }
  return map;
}

export function urlKey(u: string): string {
  return u.replace(/[.)]+$/, '').replace(/^https?:\/\/(www\.)?/, '').toLowerCase();
}

/** Mọi chỗ nhắc tên văn bản trong chuỗi (vị trí bắt đầu, kết thúc, văn bản). */
export const LAW_HEAD_RE = /(?:^|[\s(;,:"“])(?=(?:Bộ luật|Luật|Hiến pháp|Nghị định|Nghị quyết|NQ|NĐ|Pháp lệnh|Sắc lệnh|Quốc triều|BL[A-ZĐ]{2,}|LTM|LĐĐ|LCK|LDN)[\s\d:,)])/gu;
export function scanLaws(text: string): { index: number; end: number; law: Resolved }[] {
  const s = text.normalize('NFC');
  const out: { index: number; end: number; law: Resolved }[] = [];
  const re = new RegExp(LAW_HEAD_RE.source, 'gu');
  for (let m = re.exec(s); m; m = re.exec(s)) {
    if (m[0].length === 0) re.lastIndex++;
    const start = m.index + m[0].length;
    const r = resolveLawAt(s.slice(start));
    if (r) out.push({ index: start, end: start + r.matched.length, law: r });
  }
  return out;
}
