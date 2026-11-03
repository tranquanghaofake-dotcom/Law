// Logic thuần cho bìa sách giáo trình (spec phần nhìn đợt 4 §3.2–3.3): tên trên bìa, tự co chữ tên môn, tìm môn.
import { fold } from './conceptSearch';

/** Tên in trên bìa: bỏ phần giải thích trong ngoặc ở cuối ("Luật Thương mại 1 (doanh nghiệp, …)" → "Luật Thương mại 1"). */
export const coverTitle = (title: string): string => title.replace(/\s*\([^()]*\)\s*$/, '').trim();

/** Phần chữ trên bìa: dòng nhỏ ("LUẬT"/"PHÁP LUẬT" khi tên bắt đầu như vậy), tên môn, số học phần ở cuối (nếu có). */
export function coverParts(title: string): { kicker: string; name: string; num: string | null } {
  let name = title.trim();
  let kicker = '';
  const head = /^(Pháp luật|Luật)\s+(.+)$/i.exec(name);
  if (head) { kicker = head[1].toLocaleUpperCase('vi'); name = head[2]; }
  const tail = /^(.+?)\s+(\d+)$/.exec(name);
  return tail ? { kicker, name: tail[1], num: tail[2] } : { kicker, name, num: null };
}

export type FitOptions = { maxWidth: number; maxLines: number; maxSize: number; minSize: number; charW: number; maxHeight?: number };

/** Chia các từ thành đúng n dòng sao cho dòng dài nhất (tính cả dấu cách) ngắn nhất. Tên môn ít từ nên duyệt hết. */
function balance(words: string[], n: number): string[] | null {
  if (n > words.length) return null;
  if (n === 1) return [words.join(' ')];
  let best: string[] | null = null;
  let bestLen = Infinity;
  for (let i = 1; i <= words.length - n + 1; i++) {
    const head = words.slice(0, i).join(' ');
    if (head.length >= bestLen) break;
    const rest = balance(words.slice(i), n - 1);
    if (!rest) continue;
    const len = Math.max(head.length, ...rest.map((l) => l.length));
    if (len < bestLen) { bestLen = len; best = [head, ...rest]; }
  }
  return best;
}

/** Ngắt dòng tham lam theo số ký tự, quá maxLines thì cắt dòng cuối bằng "…"; từ quá dài bị cắt. */
function greedy(words: string[], maxChars: number, maxLines: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    const w = word.length > maxChars ? word.slice(0, maxChars - 1) + '…' : word;
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1];
  kept[maxLines - 1] = (last.length >= maxChars ? last.slice(0, maxChars - 1) : last) + '…';
  return kept;
}

/** Khoảng dòng tên môn (× cỡ chữ): chữ in hoa có dấu chồng (Ề, Ậ) cần ≥ 1,2. BookCover dùng cùng số này. */
export const TITLE_LINE_H = 1.2;

/** Chỉ thêm dòng khi chữ to thêm ít nhất chừng này (đơn vị viewBox). */
const MORE_LINES_GAIN = 2;

/** Cách chia tốt nhất trong 1…maxLines dòng cho các "khối" từ (từ đơn hoặc cặp từ), hoặc null nếu không cách nào đạt minSize. */
function bestFit(chunks: string[], o: FitOptions): { lines: string[]; size: number } | null {
  const lineH = TITLE_LINE_H;
  let pick: { lines: string[]; size: number } | null = null;
  for (let n = 1; n <= o.maxLines; n++) {
    const lines = balance(chunks, n);
    if (!lines) break;
    const longest = Math.max(...lines.map((l) => l.length));
    const raw = Math.min(o.maxWidth / (longest * o.charW), (o.maxHeight ?? Infinity) / (n * lineH));
    const size = Math.min(o.maxSize, Math.floor(raw * 2) / 2);
    if (size < o.minSize) continue;
    if (!pick || size >= pick.size + MORE_LINES_GAIN) pick = { lines, size };
  }
  return pick;
}

/**
 * Tên môn in hoa trên bìa, tự co chữ: thử 1…maxLines dòng (chia cân), mỗi cách lấy cỡ lớn nhất vừa maxWidth
 * (bề rộng ước tính = số ký tự × charW × cỡ) và maxHeight (số dòng × cỡ × TITLE_LINE_H), làm tròn xuống 0,5, chặn ở maxSize.
 * Chọn cỡ lớn nhất; thêm dòng chỉ khi chữ to hơn ≥ MORE_LINES_GAIN. Tên có số từ chẵn được ngắt theo cặp trước
 * (từ ghép hai âm tiết: "QUẢN TRỊ / TÀI SẢN / TRÍ TUỆ"), không vừa mới ngắt tự do. Không cách nào đạt minSize →
 * minSize, ngắt tham lam, cắt "…".
 */
export function fitTitle(text: string | readonly string[], o: FitOptions): { lines: string[]; size: number } {
  const words = (typeof text === 'string' ? text.split(/\s+/) : [...text]).filter(Boolean).map((w) => w.toLocaleUpperCase('vi'));
  if (!words.length) return { lines: [], size: o.maxSize };
  const pairs = words.length % 2 === 0 ? words.flatMap((w, i) => (i % 2 ? [] : [`${w} ${words[i + 1]}`])) : null;
  return (pairs && bestFit(pairs, o)) || bestFit(words, o)
    || { lines: greedy(words, Math.floor(o.maxWidth / (o.charW * o.minSize)), o.maxLines), size: o.minSize };
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
