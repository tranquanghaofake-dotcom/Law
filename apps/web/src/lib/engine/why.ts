// "Vì sao" cho phản hồi sau câu (đề xuất ② của spec phương pháp học): ghép từ dữ liệu đã kiểm
// (`definition` trích đúng đoạn liên quan, `plain`, `keywords`, `confusables`). Không viết khẳng định pháp lý mới:
// chỉ chọn/cắt/ghép trường có sẵn, `explain` gốc vẫn hiện nguyên ở Feedback.
import type { Concept } from '$lib/content/types';
import type { StepItem } from './step';
import { normalize } from './grading';
import { clip } from './text';

export type Why = {
  /** `explain` gốc chỉ là trích dẫn điều khoản (62 % kho) nên cần phần giải thích thêm. */
  citeOnly: boolean;
  /** Đoạn định nghĩa nguyên văn liên quan nhất; `marks` là các dấu hiệu nằm đúng nguyên văn trong đoạn (để in đậm). */
  excerpt: { text: string; marks: string[] } | null;
  /** Câu giải nghĩa gọn (câu đầu của `plain`), chỉ khi định nghĩa trích chưa đủ. */
  plain: string | null;
  /** Dấu hiệu quyết định (`keywords`). */
  signs: string[];
  /** Khái niệm dễ nhầm với dấu hiệu của nó; chỉ khi cả hai bên có đủ dữ liệu. `picked`: bạn đã chọn đúng khái niệm này. */
  mixup: { id: string; term: string; theirs: string[]; ours: string[]; picked: boolean } | null;
  /** Vì sao phương án đã chọn sai: lấy nguyên câu `why` người soạn viết cho đúng phương án đó (không tự sinh). */
  wrong?: { option: string; text: string } | null;
  /** Vì sao đáp án đúng là đúng: câu `why` người soạn viết cho đúng phương án đó (đã bỏ tiền tố "Đúng:"). Hiện cả khi trả lời đúng. */
  right?: string | null;
};

const CITE_PARTS = /(điểm\s+[a-zđ]\b|khoản\s+\d+|điều\s+\d+[a-z]?|chương\s+[ivx\d]+|mục\s+\d+|phần\s+[ivx\d]+|bài\s+\d+|vd\s*\d+|các|và|,|;|\.|\(|\)|-|–|\d+)/giu;

/** `explain` chỉ gồm số điều/khoản (vd "Khoản 2 Điều 107.") hoặc quá ngắn để giải thích. */
export function isCiteOnly(explain: string): boolean {
  const t = explain.trim();
  if (!t) return true;
  const rest = normalize(t.replace(CITE_PARTS, ' ')).replace(/\s+/g, '');
  return rest.length < 10 || t.length < 24;
}

/** Tách định nghĩa thành các đoạn: theo ";" và ". ", mục đánh số "1." giữ nguyên số. */
export function clauses(def: string): string[] {
  const parts = def.replace(/\s+/g, ' ').split(/(?<=[.;])\s+(?=[\p{Lu}\d])|(?<=:)\s+(?=\d+\.)|(?<=[.;])\s+(?=\d+\.)/u).map((s) => s.trim()).filter(Boolean);
  // số thứ tự mục ('1.') bị tách riêng thì dính lại với đoạn sau nó
  const merged: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (/^(\d+|[a-zđ])[.)]$/.test(parts[i]) && i + 1 < parts.length) { merged.push(`${parts[i]} ${parts[i + 1]}`); i++; } else merged.push(parts[i]);
  }
  return merged.length ? merged : [def.trim()];
}

const words = (s: string): string[] => normalize(s).split(' ').filter((w) => w.length >= 3);

/** Chữ của câu hỏi + đáp án đúng, dùng để chọn đoạn định nghĩa liên quan. */
export function keyOf(item: StepItem): string {
  switch (item.type) {
    case 'mcq': case 'case': return `${item.q} ${item.options[item.answer] ?? ''}`;
    case 'truefalse': return item.statement;
    case 'cloze': return item.text.replace(/\{\{([^{}]+)\}\}/g, '$1');
    case 'recall': return `${item.q} ${item.model}`;
    case 'pair': case 'sort': return `${item.left} ${item.right} ${item.cases.map((c) => c.text).join(' ')}`;
    case 'match': return item.pairs.map((p) => p.term).join(' ');
    default: return '';
  }
}

/** Đoạn của định nghĩa trùng nhiều tiếng nhất với `key`; không trùng gì thì đoạn đầu. Mục đánh số được thêm vế mở đầu. */
export function relevantClause(def: string, key: string, max = 240, term = ''): string {
  const cl = clauses(def);
  // bỏ các tiếng của chính tên khái niệm: chúng có mặt ở mọi đoạn nên không giúp chọn đoạn
  const skip = new Set(words(term));
  const kw = new Set(words(key).filter((w) => !skip.has(w)));
  let best = 0, bestScore = -1;
  cl.forEach((c, i) => {
    const sc = words(c).reduce((n, w) => n + (kw.has(w) ? 1 : 0), 0);
    if (sc > bestScore) { best = i; bestScore = sc; }
  });
  let text = cl[best];
  if (/^\d+\.\s/.test(text) && best > 0) {
    const head = cl[0].replace(/\s*(?:sau đây)?:\s*$/u, ':');
    text = `${clip(head, 110)} ${text}`;
  }
  return clip(text, max);
}

/** Các dấu hiệu nằm nguyên văn trong đoạn trích (so không phân biệt hoa thường), trả đúng chữ trong đoạn để in đậm. */
export function marksIn(text: string, signs: string[]): string[] {
  const low = text.toLowerCase();
  const out: string[] = [];
  for (const s of signs) {
    const i = low.indexOf(s.toLowerCase());
    if (i >= 0) out.push(text.slice(i, i + s.length));
  }
  return out;
}

/** Chia đoạn chữ thành các khúc để in đậm `marks`: [{t, b}]. */
export function segments(text: string, marks: string[]): { t: string; b: boolean }[] {
  const ranges: [number, number][] = [];
  const low = text.toLowerCase();
  for (const m of marks) {
    const i = low.indexOf(m.toLowerCase());
    if (i >= 0) ranges.push([i, i + m.length]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const out: { t: string; b: boolean }[] = [];
  let pos = 0;
  for (const [a, b] of ranges) {
    if (a < pos) continue;
    if (a > pos) out.push({ t: text.slice(pos, a), b: false });
    out.push({ t: text.slice(a, b), b: true });
    pos = b;
  }
  if (pos < text.length) out.push({ t: text.slice(pos), b: false });
  return out.length ? out : [{ t: text, b: false }];
}

function firstSentence(s: string, max = 200): string | null {
  const t = s.replace(/\s+/g, ' ').trim();
  if (!t) return null;
  const m = t.match(/^.+?[.!?](?=\s|$)/u);
  return clip(m ? m[0] : t, max);
}

const chosenTerm = (chosen: string | undefined, c: Concept): boolean => !!chosen && normalize(chosen).includes(normalize(c.term));
/** Khái niệm dễ nhầm có được nhắc tên trong câu hỏi/phương án (câu thật sự đang đặt hai khái niệm cạnh nhau). */
const mentioned = (item: StepItem, c: Concept): boolean => {
  const t = normalize(c.term);
  const opts = item.type === 'mcq' || item.type === 'case' ? item.options.join(' ') : '';
  return normalize(`${keyOf(item)} ${opts}`).includes(t);
};

/**
 * Ghép khối "vì sao". `explain` là lời giải thích gốc của item (để biết có chỉ là trích dẫn không).
 * Trả null khi không có gì đáng hiện (câu đúng và không có dấu hiệu).
 */
export function whyOf(concept: Concept, item: StepItem, opts: { correct: boolean; explain?: string; chosen?: string; confusables?: Concept[] }): Why | null {
  const signs = concept.keywords.filter((k) => k.trim()).slice(0, 4);
  const citeOnly = isCiteOnly(opts.explain ?? '');
  const right = rightWhy(item);
  if (opts.correct) return signs.length || right ? { citeOnly, excerpt: null, plain: null, signs: signs.slice(0, 3), mixup: null, right } : null;
  const text = relevantClause(concept.definition, keyOf(item), 240, concept.term);
  const marks = marksIn(text, signs);
  // chỉ nói "dễ nhầm" khi dữ liệu đủ: khái niệm kia có ≥ 2 dấu hiệu, bản thân cũng có
  // và chỉ nêu khi bạn đã chọn khái niệm đó hoặc câu hỏi có nhắc tên nó (không gán một khái niệm dễ nhầm bất kỳ)
  const cands = (opts.confusables ?? []).filter((c) => c.keywords.filter((k) => k.trim()).length >= 2 && (chosenTerm(opts.chosen, c) || mentioned(item, c)));
  const pick = cands.find((c) => chosenTerm(opts.chosen, c)) ?? cands[0];
  const mixup = pick && signs.length >= 2
    ? { id: pick.id, term: pick.term, theirs: pick.keywords.slice(0, 3), ours: signs.slice(0, 3), picked: chosenTerm(opts.chosen, pick) }
    : null;
  const needPlain = citeOnly || text.length < 60;
  return { citeOnly, excerpt: { text, marks }, plain: needPlain ? firstSentence(concept.plain) : null, signs, mixup, wrong: wrongWhy(item, opts.chosen), right };
}

/** Tiền tố "Đúng:" / "Sai:" của câu `why` (người soạn viết) bỏ đi khi hiện ra, viết hoa lại chữ đầu. */
export function stripVerdict(t: string): string {
  const r = t.replace(/^(đúng|sai)\s*:\s*/iu, '');
  return r ? r.charAt(0).toLocaleUpperCase('vi') + r.slice(1) : r;
}

/** Câu `why` của đáp án đúng (mcq/case có `why`); không có thì null. */
export function rightWhy(item: StepItem): string | null {
  if (item.type !== 'mcq' && item.type !== 'case') return null;
  const t = item.why?.[item.answer];
  return t ? stripVerdict(t) : null;
}

/** Câu `why` của phương án đã chọn (khác đáp án). Không có dữ liệu thì null. */
export function wrongWhy(item: StepItem, chosen: string | undefined): { option: string; text: string } | null {
  if (item.type !== 'mcq' && item.type !== 'case') return null;
  return pickedWhy(item, chosen);
}

/** Như wrongWhy nhưng cho mọi câu có options/answer/why (bộ đề 10 câu). Tìm theo chữ của phương án nên không phụ thuộc thứ tự xáo. */
export function pickedWhy(q: { options: string[]; answer: number; why?: string[] }, chosen: string | undefined): { option: string; text: string } | null {
  if (!q.why || chosen === undefined) return null;
  const i = q.options.indexOf(chosen);
  if (i < 0 || i === q.answer || !q.why[i]) return null;
  return { option: chosen, text: q.why[i] };
}
