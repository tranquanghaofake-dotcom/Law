// Xử lý chữ cho câu sinh tự động: che thuật ngữ, cắt gọn trích dẫn, đo độ giống nhau giữa hai chuỗi.
// Không viết thêm nội dung pháp lý: chỉ che/cắt văn bản đã kiểm trong dữ liệu.
import { normalize } from './grading';

/** Chỗ che thuật ngữ trong định nghĩa/ví dụ. */
export const MASK = '[…]';

const SPLIT = /\s*[:;,()–—…]\s*|\s+-\s+|\s+(?:và|hoặc)\s+/u;
// Vế mở đầu bằng hư từ ("của quỹ", "theo giao việc") không đủ nghĩa để che.
const FUNCTION_START = /^(của|đối với|trong|theo|với|khi|về|do|cho|tại|ở|là)\s/iu;
const LEADING_PLURAL = /^(các|những)\s+/iu;

const syllables = (s: string): string[] => normalize(s).split(' ').filter(Boolean);

// Tiền tố mô tả của tên khái niệm kiểu giáo trình: "Khái niệm và đặc điểm của thuế" → lõi "thuế".
const DESC = '(?:khái niệm|định nghĩa|đặc điểm|đặc trưng|vai trò|ý nghĩa|phân loại|nội dung|bản chất|chức năng)';
const DESCRIPTOR = new RegExp(`^${DESC}(?:\\s*(?:,|và)\\s*${DESC})*(?:\\s+của)?\\s+`, 'iu');
// Phần định tính phía sau lõi: "tội phạm trong Bộ luật Hình sự 1985" → "tội phạm".
const QUALIFIER = /\s+(?:trong|theo|của|đối với|tại|năm)\s+.*$/iu;

/**
 * Thuật ngữ và các vế đủ nghĩa của nó (≥ 2 tiếng, hoặc chữ viết tắt in hoa), dài trước.
 * Tên có tiền tố mô tả ("Khái niệm …", "Khái niệm và đặc điểm của …") thì thêm lõi (kể cả 1 tiếng).
 */
export function termParts(term: string): string[] {
  const t = term.normalize('NFC').trim();
  const out = [t];
  const push = (p: string, allowShort: boolean) => {
    p = p.trim().replace(LEADING_PLURAL, '');
    if (!p || FUNCTION_START.test(p)) return;
    const isAbbr = /^\p{Lu}{2,}$/u.test(p);
    if (!isAbbr && !allowShort && syllables(p).length < 2) return;
    if (!syllables(p).length && !isAbbr) return;
    if (!out.some((o) => normalize(o) === normalize(p))) out.push(p);
  };
  const core = t.replace(DESCRIPTOR, '');
  if (core !== t) {
    push(core, true);
    push(core.replace(QUALIFIER, ''), true);
  }
  for (const raw of [...t.split(SPLIT), ...(core !== t ? core.split(SPLIT) : [])]) {
    const p = raw.trim();
    const stripped = p.replace(DESCRIPTOR, '');
    if (stripped !== p) push(stripped, true);
    else if (!new RegExp(`^${DESC}$`, 'iu').test(p)) push(p, false);
  }
  return [out[0], ...out.slice(1).sort((a, b) => b.length - a.length)];
}

/**
 * Che "chủ ngữ định nghĩa" ở đầu mỗi vế (đầu văn bản, sau dấu chấm, sau "1-", "2.") dạng "<cụm> là …"
 * khi cụm đó trùng phần lớn với thuật ngữ: "Hình phạt là …" của "Khái niệm hình phạt".
 */
export function maskDefiningHead(text: string, term: string): string {
  const termSyl = new Set(syllables(term));
  return text.replace(/(^|[.;]\s+)(\d+\s*[-.)]\s*)?([^.;:«»()]{2,70}?)(\s+là\s)/gu, (all, pre: string, num: string | undefined, head: string, la: string) => {
    const h = head.trim();
    if (h === MASK || !syllables(h).length) return all;
    const sy = syllables(h);
    const hit = sy.length === 1 ? termSyl.has(sy[0]) : coverage(h, term) >= 0.5;
    return hit ? `${pre}${num ?? ''}${MASK}${la}` : all;
  });
}

/**
 * Phần trong ngoặc của tên khái niệm (vd. "Nguồn gốc của nhà nước (quan điểm Mác – Lênin)") kèm bản bỏ chữ dẫn chung
 * ("quan điểm", "theo"…): định nghĩa nhắc lại cụm này sẽ lộ đáp án ở câu định nghĩa → thuật ngữ.
 */
export function qualifierParts(term: string): string[] {
  const out: string[] = [];
  for (const m of term.normalize('NFC').matchAll(/\(([^()]+)\)/gu)) {
    const q = m[1].trim();
    if (!q) continue;
    out.push(q);
    const core = q.replace(/^(theo\s+)?(quan điểm|học thuyết|cách hiểu|nghĩa|góc độ|chủ nghĩa)\s+(của\s+)?/iu, '').trim();
    if (core && core !== q) out.push(core);
  }
  return out;
}

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Che mọi lần xuất hiện của các chuỗi `terms` (không phân biệt hoa thường, đúng ranh giới từ). */
export function maskTerms(text: string, terms: string[]): string {
  let out = text.normalize('NFC');
  for (const t of [...terms].sort((a, b) => b.length - a.length)) {
    const p = t.normalize('NFC').trim();
    if (!p) continue;
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(p).replace(/\s+/g, '\\s+')}(?![\\p{L}\\p{N}])`, 'giu');
    out = out.replace(re, MASK);
  }
  return out;
}

/** Cắt chuỗi về tối đa `max` ký tự: ưu tiên hết câu (thêm " (…)"), không thì ở khoảng trắng (thêm " …"). */
export function clip(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const head = t.slice(0, max);
  let cut = -1;
  for (const m of head.matchAll(/[.;!?](?=\s)/g)) if ((m.index ?? 0) + 1 >= max * 0.5) cut = (m.index ?? 0) + 1;
  if (cut > 0) return `${t.slice(0, cut)} (…)`;
  const sp = t.lastIndexOf(' ', max - 2);
  const body = (sp > max * 0.3 ? t.slice(0, sp) : t.slice(0, max - 2)).replace(/[\s,;:–—-]+$/u, '');
  return `${body} …`;
}

function bigrams(s: string): string[] {
  const w = syllables(s);
  if (w.length < 2) return w;
  return w.slice(1).map((x, i) => `${w[i]} ${x}`);
}

/** Tỉ lệ cặp tiếng liền nhau của `a` xuất hiện trong `b` (0–1). */
export function coverage(a: string, b: string): number {
  const ga = bigrams(a);
  if (!ga.length) return 0;
  const gb = new Set(bigrams(b));
  return ga.filter((g) => gb.has(g)).length / ga.length;
}

/** `text` có để lộ thuật ngữ không: chứa thuật ngữ / một vế của nó, hoặc ≥ 1/2 cặp tiếng (tối thiểu 2 cặp). */
export function leaks(text: string, term: string): boolean {
  const t = ` ${normalize(text)} `;
  if (termParts(term).some((p) => t.includes(` ${normalize(p)} `))) return true;
  const g = bigrams(term);
  const hit = g.length >= 2 ? Math.round(coverage(term, text) * g.length) : 0;
  return hit >= 2 && hit / g.length >= 0.5;
}

/** Hai chuỗi trùng sau chuẩn hoá, hoặc gần như trùng (Jaccard cặp tiếng ≥ 0,9). */
export function nearDuplicate(a: string, b: string): boolean {
  const na = normalize(a), nb = normalize(b);
  if (na === nb) return true;
  const ga = new Set(bigrams(a)), gb = new Set(bigrams(b));
  const inter = [...ga].filter((g) => gb.has(g)).length;
  const union = ga.size + gb.size - inter;
  return union > 0 && inter / union >= 0.9;
}

/** Bỏ dấu thanh/dấu mũ, đ → d: so khớp không lệ thuộc kiểu bỏ dấu ("hòa"/"hoà"). */
const fold = (s: string): string => normalize(s).normalize('NFD').replace(/\p{M}+/gu, '').replace(/đ/g, 'd');
const foldedBigrams = (s: string): Set<string> => {
  const w = fold(s).split(' ').filter(Boolean);
  return new Set(w.length < 2 ? w : w.slice(1).map((x, i) => `${w[i]} ${x}`));
};

/**
 * Hai mô tả chồng nhau: một bên gần như nằm trong bên kia (hệ số chồng lấn cặp tiếng, đã bỏ dấu, ≥ 0,6),
 * ví dụ định nghĩa "Hiến pháp" nằm trọn trong định nghĩa "Hiệu lực pháp lý cao nhất của Hiến pháp".
 * Chỉ xét khi bên ngắn có ≥ 3 cặp tiếng; ngắn hơn thì dùng `nearDuplicate`.
 */
export function overlaps(a: string, b: string): boolean {
  if (nearDuplicate(a, b) || fold(a) === fold(b)) return true;
  const ga = foldedBigrams(a), gb = foldedBigrams(b);
  const small = Math.min(ga.size, gb.size);
  if (small < 3) return false;
  const inter = [...ga].filter((g) => gb.has(g)).length;
  return inter / small >= 0.6;
}

/** Mô tả đủ thông tin: bỏ chỗ che "[…]" và "(…)" vẫn còn ≥ `min` tiếng. */
export function informative(text: string, min = 6): boolean {
  return normalize(text.split(MASK).join(' ').replace(/\(…\)/g, ' ')).split(' ').filter(Boolean).length >= min;
}

/**
 * Từ tuyệt đối ("mọi", "chỉ", "luôn", "đều", "bắt buộc"…): trong kho nhận định, 84 % câu có từ này là Sai
 * nên người học đoán Sai mà không cần biết luật. Bộ chọn câu dùng để tránh dồn Sai vào câu có dấu hiệu này.
 */
export function hasAbsoluteWord(text: string): boolean {
  return /(?<![\p{L}])(?:luôn|mọi|tất cả|không bao giờ|duy nhất|đều|bắt buộc|không thể|chỉ)(?![\p{L}])/iu.test(text);
}

const STOP = new Set('và của là các những trong theo cho được có không một để khi với về này đó tại do bởi như hoặc thì nào sau đây đã sẽ bị phải'.split(' '));
const contentWords = (s: string): Set<string> => new Set((s.toLowerCase().match(/\p{L}+/gu) ?? []).filter((w) => w.length > 2 && !STOP.has(w)));

/** Số tiếng nội dung (bỏ từ nối) hai chuỗi chung nhau. Giữ đồng bộ với `sharedWords` ở packages/content/src/quality.ts. */
export function sharedWords(a: string, b: string): number {
  const wb = contentWords(b);
  let n = 0;
  for (const w of contentWords(a)) if (wb.has(w)) n++;
  return n;
}

/** Đáp án đúng là phương án DUY NHẤT trùng ≥ 2 tiếng với stem (clang association: đoán được bằng mặt chữ). */
export function clangs(stem: string, options: string[], answer: number): boolean {
  const sc = options.map((o) => sharedWords(stem, o));
  const max = Math.max(...sc);
  return max >= 2 && sc[answer] === max && sc.filter((x) => x === max).length === 1;
}
