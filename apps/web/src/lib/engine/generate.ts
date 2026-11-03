// Dạng câu sinh tự động từ dữ liệu đã kiểm (đợt 6). KHÔNG viết khẳng định pháp lý mới:
// chỉ dùng `term`, `definition` (che thuật ngữ, cắt có đánh dấu "(…)"), `plain`, `example`, `confusables`, các câu `pair` có sẵn.
import type { Concept, ItemMcq, ItemPair, ItemTrueFalse } from '$lib/content/types';
import { normalize } from './grading';
import type { MatchItem, SortItem } from './step';
import { clip, coverage, leaks, maskDefiningHead, maskTerms, nearDuplicate, termParts } from './text';

/** Dữ liệu nạp thêm để làm phương án nhiễu: khái niệm dễ nhầm/cùng chương, bảng tên khái niệm theo môn. */
export type GenContext = { pool?: Concept[]; terms?: Record<string, Record<string, string>> };

/** Ứng viên phương án nhiễu. tier: 1 dễ nhầm · 2 cùng chương · 3 cùng môn (đủ dữ liệu) · 4 cùng môn (chỉ có tên). */
export type Cand = { id: string; term: string; tier: 1 | 2 | 3 | 4; concept?: Concept };

/** Giới hạn độ dài khi hiển thị (ký tự). */
export const LIMITS = { defQuestion: 380, defOption: 170, matchText: 150, explain: 240, sortCases: 6 } as const;

const MIN_OPTIONS = 3;
const MAX_OPTIONS = 4;

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Số ứng viên tối đa lấy từ tầng 3 và tầng 4 (đủ để chọn nhiễu, không phải duyệt cả môn). */
const FAR_CAP = 10;

/**
 * Ứng viên nhiễu cho `c`, đã xếp theo tầng (dễ nhầm → cùng chương → cùng môn → chỉ tên), cùng môn, không trùng tên.
 * Tầng 3–4 lấy tối đa FAR_CAP mỗi tầng (trộn bằng `rng` nếu có).
 */
export function candidates(c: Concept, known: Concept[], terms?: Record<string, Record<string, string>>, rng?: () => number): Cand[] {
  const out: Cand[] = [];
  const seen = new Set<string>([c.id]);
  const names = new Set<string>([normalize(c.term)]);
  const push = (x: Cand) => {
    const n = normalize(x.term);
    if (seen.has(x.id) || names.has(n) || nearDuplicate(x.term, c.term)) return false;
    seen.add(x.id);
    names.add(n);
    out.push(x);
    return true;
  };
  const same = known.filter((x) => x.subject === c.subject && x.id !== c.id);
  const byId = new Map(same.map((x) => [x.id, x]));
  for (const id of c.confusables) { const x = byId.get(id); if (x) push({ id, term: x.term, tier: 1, concept: x }); }
  for (const x of same) if (x.confusables.includes(c.id)) push({ id: x.id, term: x.term, tier: 1, concept: x });
  for (const x of same) if (x.chapter === c.chapter) push({ id: x.id, term: x.term, tier: 2, concept: x });
  const far = <T>(list: T[]) => (rng ? shuffle(list, rng) : list);
  let n3 = 0;
  for (const x of far(same)) if (n3 < FAR_CAP && push({ id: x.id, term: x.term, tier: 3, concept: x })) n3++;
  let n4 = 0;
  for (const [id, term] of far(Object.entries(terms?.[c.subject] ?? {}))) if (n4 < FAR_CAP && push({ id, term, tier: 4 })) n4++;
  return out;
}

/**
 * Chọn tối đa `n` phương án nhiễu: theo tầng trước; trong một tầng ưu tiên độ dài gần `targetLen`
 * (giảm mẹo "đáp án dài nhất"), ngang nhau thì ngẫu nhiên.
 */
export function pickDistractors(cands: Cand[], n: number, rng: () => number, targetLen: number, show: (c: Cand) => string | null): { cand: Cand; text: string }[] {
  const ok = cands.flatMap((cand) => { const text = show(cand); return text ? [{ cand, text, r: rng() }] : []; });
  ok.sort((a, b) => a.cand.tier - b.cand.tier
    || Math.floor(Math.abs(a.text.length - targetLen) / 20) - Math.floor(Math.abs(b.text.length - targetLen) / 20)
    || a.r - b.r);
  const out: { cand: Cand; text: string }[] = [];
  for (const x of ok) {
    if (out.length >= n) break;
    if (out.some((o) => nearDuplicate(o.text, x.text))) continue;
    out.push({ cand: x.cand, text: x.text });
  }
  return out;
}

function mcq(q: string, correct: string, wrong: string[], explain: string, rng: () => number, level: 1 | 4, c: Concept): ItemMcq | null {
  if (wrong.length + 1 < MIN_OPTIONS) return null;
  const options = shuffle([correct, ...wrong.slice(0, MAX_OPTIONS - 1)], rng);
  return { type: 'mcq', level, q, options, answer: options.indexOf(correct), explain, source: c.source };
}

const explainOf = (c: Concept, lead: string): string => `${lead} ${clip(c.plain, LIMITS.explain)}`;

/** Định nghĩa (đã che thuật ngữ của chính nó và `alsoMask`) để hiển thị. */
function shownDefinition(c: Concept, max: number, alsoMask: string[] = []): string {
  let t = maskTerms(c.definition, [...termParts(c.term), ...alsoMask.flatMap(termParts)]);
  for (const term of [c.term, ...alsoMask]) t = maskDefiningHead(t, term);
  return clip(t, max);
}

/** Định nghĩa → thuật ngữ (bậc 1). Null nếu định nghĩa sau khi che vẫn lộ thuật ngữ, hoặc thiếu phương án. */
export function genDefTerm(c: Concept, cands: Cand[], rng: () => number): ItemMcq | null {
  const text = shownDefinition(c, LIMITS.defQuestion);
  if (leaks(text, c.term) || normalize(text).length < 30) return null;
  const wrong = pickDistractors(cands, MAX_OPTIONS - 1, rng, c.term.length, (x) => x.term);
  return mcq(`«${text}»\nĐịnh nghĩa trên là của khái niệm nào?`, c.term, wrong.map((w) => w.text), explainOf(c, `Đây là định nghĩa «${c.term}» (${c.source.cite}).`), rng, 1, c);
}

/** Thuật ngữ → định nghĩa (bậc 2). Phương án là định nghĩa thật của các khái niệm khác, đã che thuật ngữ, cắt cùng mức. */
export function genTermDef(c: Concept, cands: Cand[], rng: () => number): ItemMcq | null {
  const correct = shownDefinition(c, LIMITS.defOption);
  if (normalize(correct).length < 30) return null;
  const wrong = pickDistractors(cands.filter((x) => x.concept), MAX_OPTIONS - 1, rng, correct.length, (x) => {
    const t = shownDefinition(x.concept!, LIMITS.defOption, [c.term]);
    return nearDuplicate(t, correct) || normalize(t).length < 30 ? null : t;
  });
  return mcq(`Đâu là định nghĩa của «${c.term}»?`, correct, wrong.map((w) => w.text), `«${c.term}»: ${clip(c.definition, LIMITS.explain)} (${c.source.cite}).`, rng, 1, c);
}

/** Hai thuật ngữ quan hệ bao hàm (một cái gần như nằm trong cái kia) → không dùng làm nhiễu cho câu ví dụ. */
const nested = (a: string, b: string): boolean => coverage(a, b) >= 0.6 || coverage(b, a) >= 0.6;

/**
 * Ví dụ → khái niệm (bậc 4, như câu tình huống). Chỉ khi ví dụ gắn rõ với khái niệm:
 * ví dụ không chứa tên khái niệm (lộ đáp án), không chứa tên phương án nhiễu nào, nhiễu không bao hàm/nằm trong khái niệm.
 */
export function genExampleConcept(c: Concept, cands: Cand[], rng: () => number): ItemMcq | null {
  if (leaks(c.example, c.term)) return null;
  const ok = cands.filter((x) => !leaks(c.example, x.term) && !nested(x.term, c.term));
  const wrong = pickDistractors(ok, MAX_OPTIONS - 1, rng, c.term.length, (x) => x.term);
  return mcq(`«${c.example}»\nTình huống trên minh hoạ cho khái niệm nào?`, c.term, wrong.map((w) => w.text), explainOf(c, `Ví dụ minh hoạ «${c.term}».`), rng, 4, c);
}

/**
 * Đúng/Sai từ định nghĩa (bậc 4): "«định nghĩa của c» là định nghĩa của «X»".
 * answer=true: X = c. answer=false: X là khái niệm dễ nhầm/cùng chương (tầng 1–2, đủ dữ liệu) sao cho câu chắc chắn Sai:
 * định nghĩa hai bên không gần trùng, tên không bao hàm nhau, và định nghĩa của c không mở đầu bằng "X là …".
 * Null nếu định nghĩa sau khi che vẫn lộ thuật ngữ, hoặc (với answer=false) không có X an toàn.
 */
export function genDefTrueFalse(c: Concept, cands: Cand[], answer: boolean, rng: () => number): ItemTrueFalse | null {
  const text = shownDefinition(c, LIMITS.defQuestion);
  if (leaks(text, c.term) || normalize(text).length < 30) return null;
  const cite = c.source.cite;
  if (answer) {
    return { type: 'truefalse', level: 4, statement: `«${text}» là định nghĩa của «${c.term}».`, answer: true, explain: `Đúng. Đây là định nghĩa «${c.term}» (${cite}).`, source: c.source };
  }
  const own = shownDefinition(c, LIMITS.defOption);
  const safe = cands.filter((x) => x.concept && x.tier <= 2
    && !nested(x.term, c.term)
    && maskDefiningHead(c.definition, x.term) === c.definition
    && !nearDuplicate(shownDefinition(x.concept, LIMITS.defOption), own));
  if (!safe.length) return null;
  const x = safe[Math.floor(rng() * safe.length)];
  return {
    type: 'truefalse', level: 4, statement: `«${text}» là định nghĩa của «${x.term}».`, answer: false,
    explain: `Sai. Đây là định nghĩa «${c.term}» (${cite}), không phải «${x.term}».`, source: c.source,
  };
}

/** Ghép cặp nhanh (bậc 2): `c` + tối đa 3 khái niệm khác (ưu tiên theo thứ tự `others`). Cần ≥ 3 cặp. */
export function genMatch(c: Concept, others: Concept[], rng: () => number, n = 4): MatchItem | null {
  const chosen: Concept[] = [c];
  for (const x of others) {
    if (chosen.length >= n) break;
    if (x.subject !== c.subject || chosen.some((y) => y.id === x.id || nearDuplicate(y.term, x.term))) continue;
    chosen.push(x);
  }
  if (chosen.length < 3) return null;
  const allTerms = chosen.map((x) => x.term);
  const pairs = chosen.map((x) => ({ conceptId: x.id, term: x.term, text: shownDefinition(x, LIMITS.matchText, allTerms.filter((t) => t !== x.term)) }));
  if (pairs.some((p, i) => normalize(p.text).length < 20 || pairs.some((q, j) => j < i && nearDuplicate(p.text, q.text)))) return null;
  return { type: 'match', level: 2, pairs: shuffle(pairs, rng), explain: explainOf(c, `«${c.term}»:`) };
}

// ---------- Phân biệt: gộp `pair` thành SortItem ----------

const GENERIC_LABELS = new Set(['đúng', 'sai', 'có', 'không', 'được', 'không được', 'được phép', 'bị cấm', 'hợp lệ', 'không hợp lệ', 'hợp pháp', 'trái pháp luật', 'có hiệu lực', 'vô hiệu', 'đúng luật', 'sai luật', 'đúng nguyên tắc', 'sai nguyên tắc']);
const NEG = /^(không được|không|chưa|được|bị)\s+/u;

/**
 * Cặp nhãn chung chung ("Được phép | Bị cấm", "Xâm phạm | Không xâm phạm"): nghĩa phụ thuộc ngữ cảnh khái niệm,
 * nên KHÔNG gộp tình huống của khái niệm khác vào.
 */
export function isGenericPair(p: Pick<ItemPair, 'left' | 'right'>): boolean {
  const a = normalize(p.left), b = normalize(p.right);
  if (GENERIC_LABELS.has(a) || GENERIC_LABELS.has(b)) return true;
  return a.replace(NEG, '') === b.replace(NEG, '');
}

/**
 * Phân biệt (bậc 2): gộp tình huống cho cặp nhãn của `pair` trong `c` từ
 * (A) các `pair` cùng cặp nhãn, (B) tình huống mang đúng một nhãn ở `pair` khác (nhãn cụ thể),
 * (C) `example` của khái niệm có tên trùng nhãn (ví dụ không lộ nhãn nào) — chỉ trong `scope` (dễ nhầm + cùng chương).
 * Cần ≥ 4 tình huống, có cả hai cột; tối đa LIMITS.sortCases (giữ tình huống của chính khái niệm).
 */
export function genSort(c: Concept, scope: Concept[], rng: () => number): SortItem | null {
  for (const p of c.items) {
    if (p.type !== 'pair') continue;
    const L = normalize(p.left), R = normalize(p.right);
    const own: SortItem['cases'] = [];
    const extra: SortItem['cases'] = [];
    const seen = new Set<string>();
    const add = (list: SortItem['cases'], text: string, answer: 'left' | 'right', conceptId: string) => {
      const k = normalize(text);
      if (seen.has(k)) return;
      seen.add(k);
      list.push({ text, answer, conceptId });
    };
    for (const cs of p.cases) add(own, cs.text, cs.answer, c.id);
    const explains = [p.explain];
    if (!isGenericPair(p)) {
      const others = scope.filter((x) => x.subject === c.subject && x.id !== c.id);
      for (const x of others) for (const q of x.items) {
        if (q.type !== 'pair' || isGenericPair(q)) continue;
        let used = false;
        for (const cs of q.cases) {
          const lab = normalize(cs.answer === 'left' ? q.left : q.right);
          if (lab === L) { add(extra, cs.text, 'left', x.id); used = true; } else if (lab === R) { add(extra, cs.text, 'right', x.id); used = true; }
        }
        if (used && !explains.includes(q.explain)) explains.push(q.explain);
      }
      for (const x of [c, ...others]) {
        const t = normalize(x.term);
        const side = t === L ? 'left' : t === R ? 'right' : null;
        if (side && !leaks(x.example, p.left) && !leaks(x.example, p.right)) add(extra, x.example, side, x.id);
      }
    }
    const room = Math.max(0, LIMITS.sortCases - own.length);
    const cases = [...own, ...shuffle(extra, rng).slice(0, room)];
    if (cases.length < 4 || !cases.some((x) => x.answer === 'left') || !cases.some((x) => x.answer === 'right')) continue;
    return { type: 'sort', level: 2, left: p.left, right: p.right, cases: shuffle(cases, rng), explain: explains.join(' ') };
  }
  return null;
}
