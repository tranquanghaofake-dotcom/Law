// Logic thuần cho bìa sách giáo trình (spec phần nhìn đợt 4 §3.2–3.3): tên trên bìa, chữ lồng, tìm môn.
import { fold } from './conceptSearch';

/** Tên in trên bìa: bỏ phần giải thích trong ngoặc ở cuối ("Luật Thương mại 1 (doanh nghiệp, …)" → "Luật Thương mại 1"). */
export const coverTitle = (title: string): string => title.replace(/\s*\([^()]*\)\s*$/, '').trim();

/** Ngắt tên thành dòng theo từ, mỗi dòng ≤ maxChars; quá maxLines thì cắt dòng cuối bằng "…". Từ dài hơn maxChars bị cắt. */
export function wrapTitle(title: string, maxChars = 14, maxLines = 3): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const word of title.split(/\s+/).filter(Boolean)) {
    const w = word.length > maxChars ? word.slice(0, maxChars - 1) + '…' : word;
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    const last = kept[maxLines - 1];
    kept[maxLines - 1] = (last.length >= maxChars ? last.slice(0, maxChars - 1) : last) + '…';
    return kept;
  }
  return lines;
}

/** Chữ lồng cho tên ngắn đã viết tắt sẵn hoặc quá dài theo quy tắc chung. */
const MONOGRAM: Record<string, string> = {
  'ly-luan-nn-pl': 'LL', 'lich-su-nn-pl': 'LS', 'xay-dung-vbpl': 'XD', 'tai-chinh-doanh-nghiep': 'TCDN',
  'so-huu-tri-tue': 'SHTT', 'tai-san-tri-tue': 'TSTT', 'to-tung-dan-su': 'TTDS', 'an-sinh-xa-hoi': 'ASXH',
};

/** Chữ lồng to trên bìa: chữ cái đầu các từ của tên ngắn (≤ 4 chữ), số học phần giữ riêng ("Dân sự 1" → "DS 1"). */
export function monogramFor(s: { id: string; short: string }): string {
  if (MONOGRAM[s.id]) return MONOGRAM[s.id];
  const words = s.short.split(/\s+/).filter(Boolean);
  const num = words.find((w) => /^\d+$/.test(w));
  const letters = words.filter((w) => !/^\d+$/.test(w)).map((w) => (/^[A-ZĐ&]+$/.test(w) ? w.replace(/&/g, '') : w[0].toUpperCase())).join('').slice(0, 4);
  return num ? `${letters} ${num}` : letters;
}

/** Chữ cái đầu của tên (bỏ dấu), có cả bản bỏ chữ "luật" ở đầu: "Luật Dân sự 1" → "lds1 ds1". */
function initials(title: string): string {
  const words = fold(title).split(' ').filter(Boolean);
  const full = words.map((w) => w[0]).join('');
  const noLaw = words[0] === 'luat' ? words.slice(1).map((w) => w[0]).join('') : '';
  return noLaw ? `${full} ${noLaw}` : full;
}

export type SearchableSubject = { id: string; title: string; short: string };

/** Chuỗi để tìm: tên, tên ngắn, id, chữ cái đầu — tất cả không dấu. */
export function subjectHaystack(s: SearchableSubject): string {
  return fold([s.title, s.short, s.id.replace(/-/g, ' '), initials(s.title), initials(s.short)].join(' '));
}

/** Mọi từ trong truy vấn phải có mặt (không dấu). Truy vấn rỗng khớp tất cả. */
export function matchSubject(s: SearchableSubject, query: string): boolean {
  const words = fold(query).split(' ').filter(Boolean);
  if (!words.length) return true;
  const hay = subjectHaystack(s);
  return words.every((w) => hay.includes(w));
}
