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

/** Thuật ngữ và các vế đủ nghĩa của nó (≥ 2 tiếng, hoặc chữ viết tắt in hoa), dài trước. */
export function termParts(term: string): string[] {
  const t = term.normalize('NFC').trim();
  const out = [t];
  for (const raw of t.split(SPLIT)) {
    const p = raw.trim().replace(LEADING_PLURAL, '');
    if (!p || FUNCTION_START.test(p)) continue;
    const isAbbr = /^\p{Lu}{2,}$/u.test(p);
    if (!isAbbr && syllables(p).length < 2) continue;
    if (!out.some((o) => normalize(o) === normalize(p))) out.push(p);
  }
  return [out[0], ...out.slice(1).sort((a, b) => b.length - a.length)];
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
