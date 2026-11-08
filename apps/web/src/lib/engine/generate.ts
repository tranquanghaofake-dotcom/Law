// Dạng câu sinh tự động từ dữ liệu đã kiểm (đợt 6). KHÔNG viết khẳng định pháp lý mới:
// chỉ dùng `term`, `definition` (che thuật ngữ, cắt có đánh dấu "(…)"), `plain`, `example`, `confusables`, các câu `pair` có sẵn.
import type { Concept, ItemCloze, ItemMcq, ItemPair, ItemTrueFalse } from '$lib/content/types';
import { normalize } from './grading';
import type { MatchItem, SortItem } from './step';
import { MASK, clip, coverage, informative, leaks, maskDefiningHead, maskTerms, nearDuplicate, overlaps, qualifierParts, sharedWords, termParts } from './text';

/** Dữ liệu nạp thêm để làm phương án nhiễu: khái niệm dễ nhầm/cùng chương, bảng tên khái niệm theo môn. */
export type GenContext = { pool?: Concept[]; terms?: Record<string, Record<string, string>> };

/** Ứng viên phương án nhiễu. tier: 1 dễ nhầm · 2 cùng chương · 3 cùng môn (đủ dữ liệu) · 4 cùng môn (chỉ có tên). */
export type Cand = { id: string; term: string; tier: 1 | 2 | 3 | 4; concept?: Concept };

/** Giới hạn độ dài khi hiển thị (ký tự). */
export const LIMITS = { defQuestion: 380, defOption: 220, matchText: 200, explain: 240, sortCases: 6 } as const;
/** Số tiếng tối thiểu của một tình huống xếp cột: ngắn hơn là tên gọi trơn ("Bị đơn"), mất ngữ cảnh. */
const MIN_CASE_WORDS = 3;
/** Cặp nhãn đối lập ("X | Không phải X") chỉ giữ khi mọi tình huống đủ ngữ cảnh. */
const MIN_CASE_WORDS_NEG = 5;

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
export function pickDistractors(cands: Cand[], n: number, rng: () => number, targetLen: number, show: (c: Cand) => string | null, ref?: { stem: string; correct: string }): { cand: Cand; text: string }[] {
  const ok = cands.flatMap((cand) => { const text = show(cand); return text ? [{ cand, text, r: rng() }] : []; });
  // Chống "clang association" (NBME): trong cùng tầng, ưu tiên nhiễu trùng chữ với stem ngang đáp án đúng,
  // để đáp án đúng không nổi bật chỉ vì lặp lại chữ của câu hỏi.
  const want = ref ? sharedWords(ref.stem, ref.correct) : 0;
  const gap = (t: string) => (ref ? Math.abs(sharedWords(ref.stem, t) - want) : 0);
  // gap đứng trước tầng khi có `ref`: nhiễu "cùng chương" nhưng không trùng chữ nào làm đáp án đúng lộ ra (đo: 43 % → giảm khi ưu tiên gap)
  ok.sort((a, b) => (ref ? gap(a.text) - gap(b.text) : 0)
    || a.cand.tier - b.cand.tier
    || Math.floor(Math.abs(a.text.length - targetLen) / 20) - Math.floor(Math.abs(b.text.length - targetLen) / 20)
    || a.r - b.r);
  // Nhiễu lệch dạng (dài/ngắn hơn đáp án nhiều lần: tên bài, cả mệnh đề) bị loại bằng hình thức chứ không bằng kiến thức.
  // Chỉ dùng làm phương án bù khi không đủ nhiễu vừa dạng.
  const fit = ok.filter((x) => !misfit(x.text, targetLen));
  const out: { cand: Cand; text: string }[] = [];
  for (const pool of [fit, ok.filter((x) => !fit.includes(x))]) {
    for (const x of pool) {
      if (out.length >= n) break;
      if (out.some((o) => overlaps(o.text, x.text))) continue;
      out.push({ cand: x.cand, text: x.text });
    }
  }
  return out;
}

/** Độ dài lệch quá 2,5 lần so với đáp án (cộng đệm 8 ký tự cho tên rất ngắn). */
const SHAPE_RATIO = 2.5;
const misfit = (text: string, targetLen: number): boolean =>
  text.length > targetLen * SHAPE_RATIO + 8 || text.length * SHAPE_RATIO + 8 < targetLen;

function mcq(q: string, correct: string, wrong: string[], explain: string, rng: () => number, level: 1 | 4, c: Concept): ItemMcq | null {
  if (wrong.length + 1 < MIN_OPTIONS) return null;
  const options = shuffle([correct, ...wrong.slice(0, MAX_OPTIONS - 1)], rng);
  return { type: 'mcq', level, q, options, answer: options.indexOf(correct), explain, source: c.source };
}

const explainOf = (c: Concept, lead: string): string => `${lead} ${clip(c.plain, LIMITS.explain)}`;

/** Định nghĩa đã che vẫn vừa `max` ký tự mà KHÔNG phải cắt "…" (phương án bị cắt giữa chừng làm người học đoán mò). */
function wholeDefinition(c: Concept, max: number, alsoMask: string[] = []): string | null {
  const full = shownText(c, c.definition, 100000, alsoMask);
  return full.length <= max ? full : null;
}
const wordCount = (t: string): number => normalize(t).split(' ').filter(Boolean).length;

/** Định nghĩa (đã che thuật ngữ của chính nó và `alsoMask`) để hiển thị. */
function shownDefinition(c: Concept, max: number, alsoMask: string[] = []): string {
  return shownText(c, c.definition, max, alsoMask);
}

function shownText(c: Concept, text: string, max: number, alsoMask: string[] = []): string {
  let t = maskTerms(text, [...termParts(c.term), ...alsoMask.flatMap(termParts)]);
  for (const term of [c.term, ...alsoMask]) t = maskDefiningHead(t, term);
  return clip(t, max);
}

/** Đếm số lần loại vì mô tả chồng nhau / ít thông tin (để đo trên toàn dữ liệu, ghi engine.md). */
export const genStats = { defOverlapDistractor: 0, matchPlainFallback: 0, matchDropped: 0, matchNull: 0, lowInfo: 0 };
export function resetGenStats(): void { for (const k of Object.keys(genStats) as (keyof typeof genStats)[]) genStats[k] = 0; }

/**
 * Hai khái niệm có định nghĩa chồng nhau (sau khi che cả hai tên): định nghĩa của khái niệm này
 * cũng mô tả được khái niệm kia → không được cùng xuất hiện trong một câu định nghĩa/ghép cặp.
 */
export function definitionsOverlap(a: Concept, b: Concept): boolean {
  return overlaps(shownDefinition(a, 4000, [b.term]), shownDefinition(b, 4000, [a.term]));
}

/** Bỏ ứng viên có định nghĩa chồng với `c` (chỉ xét được ứng viên đủ dữ liệu). */
function distinctFrom(c: Concept, cands: Cand[]): Cand[] {
  return cands.filter((x) => {
    if (!x.concept || !definitionsOverlap(c, x.concept)) return true;
    genStats.defOverlapDistractor++;
    return false;
  });
}

/** Số chỗ che tối đa mong muốn trong đề bài: nhiều hơn thì câu gãy, người học phải đoán ngữ pháp trước khi nghĩ đến luật. */
const MAX_MASKS = 2;
const maskCount = (t: string): number => t.split(MASK).length - 1;

/**
 * Đề bài che dày (≥ 3 chỗ `[…]`) → thử dùng đoạn đầu của định nghĩa (đến hết câu/vế), lấy đoạn ngắn nhất
 * ≤ MAX_MASKS chỗ che mà vẫn đủ thông tin (≥ 10 tiếng). Không được thì giữ nguyên. Chỉ cắt ở ranh giới câu: không viết thêm chữ.
 */
function lighterStem(text: string): string {
  if (maskCount(text) <= MAX_MASKS) return text;
  const parts = text.split(/(?<=[.;])\s+/u);
  for (let k = 1; k < parts.length; k++) {
    const head = parts.slice(0, k).join(' ');
    if (maskCount(head) <= MAX_MASKS && wordCount(head) >= 10 && informative(head)) return head;
  }
  return text;
}

/** Định nghĩa → thuật ngữ (bậc 1). Null nếu định nghĩa sau khi che vẫn lộ thuật ngữ / ít thông tin, hoặc thiếu phương án. */
export function genDefTerm(c: Concept, cands: Cand[], rng: () => number): ItemMcq | null {
  const text = lighterStem(shownDefinition(c, LIMITS.defQuestion, qualifierParts(c.term)));
  if (leaks(text, c.term) || normalize(text).length < 30) return null;
  if (!informative(text)) { genStats.lowInfo++; return null; }
  const wrong = pickDistractors(distinctFrom(c, cands), MAX_OPTIONS - 1, rng, c.term.length, (x) => x.term, { stem: text, correct: c.term });
  return mcq(`«${text}»\nĐịnh nghĩa trên là của khái niệm nào?`, c.term, wrong.map((w) => w.text), explainOf(c, `Đây là định nghĩa «${c.term}» (${c.source.cite}).`), rng, 1, c);
}

/** Thuật ngữ → định nghĩa (bậc 2). Phương án là định nghĩa thật của các khái niệm khác, đã che thuật ngữ, cắt cùng mức. */
export function genTermDef(c: Concept, cands: Cand[], rng: () => number): ItemMcq | null {
  const correct = wholeDefinition(c, LIMITS.defOption);
  if (!correct || normalize(correct).length < 30) return null;
  if (!informative(correct)) { genStats.lowInfo++; return null; }
  const wrong = pickDistractors(distinctFrom(c, cands.filter((x) => x.concept)), MAX_OPTIONS - 1, rng, correct.length, (x) => {
    const t = wholeDefinition(x.concept!, LIMITS.defOption, [c.term]);
    return !t || overlaps(t, correct) || !informative(t) || normalize(t).length < 30 ? null : t;
  }, { stem: c.term, correct });
  return mcq(`Đâu là định nghĩa của «${c.term}»?`, correct, wrong.map((w) => w.text), `«${c.term}»: ${clip(c.definition, LIMITS.explain)} (${c.source.cite}).`, rng, 1, c);
}

/** Hai thuật ngữ quan hệ bao hàm (một cái gần như nằm trong cái kia) → không dùng làm nhiễu cho câu ví dụ. */
const nested = (a: string, b: string): boolean => coverage(a, b) >= 0.6 || coverage(b, a) >= 0.6;

/** `example` là một minh hoạ (tình huống/trường hợp) chứ không phải đoạn so sánh, đối chiếu hay bình luận. */
const NOT_ILLUSTRATION = /^(so sánh|đối chiếu|phân biệt|khác với|quan hệ giữa|nhìn chung|theo cách)\b/iu;
export function isIllustration(example: string): boolean {
  return !NOT_ILLUSTRATION.test(example.trim());
}

/** Tên hai khái niệm lồng nhau (cha–con: "Thời hiệu" và "Thời hiệu thừa kế") → không cùng xuất hiện làm phương án. */
const related = (a: string, b: string): boolean => nested(a, b) || leaks(a, b) || leaks(b, a);

/**
 * Ví dụ → khái niệm (bậc 4). Chỉ khi ví dụ là minh hoạ gắn rõ với khái niệm:
 * ví dụ không chứa tên khái niệm (lộ đáp án), không chứa tên phương án nhiễu nào, nhiễu không lồng nhau với khái niệm.
 * Lời giải thích nêu dấu hiệu (`keywords`) vì sao ví dụ thuộc khái niệm này.
 */
export function genExampleConcept(c: Concept, cands: Cand[], rng: () => number): ItemMcq | null {
  if (!isIllustration(c.example) || leaks(c.example, c.term)) return null;
  const ok = distinctFrom(c, cands.filter((x) => !leaks(c.example, x.term) && !related(x.term, c.term)));
  const wrong = pickDistractors(ok, MAX_OPTIONS - 1, rng, c.term.length, (x) => x.term, { stem: c.example, correct: c.term });
  const signs = c.keywords.filter((k) => k.trim()).slice(0, 3);
  const explain = signs.length
    ? `Ví dụ minh hoạ «${c.term}» (${c.source.cite}). Dấu hiệu: ${signs.join('; ')}.`
    : explainOf(c, `Ví dụ minh hoạ «${c.term}».`);
  return mcq(`«${c.example}»\nVí dụ trên minh hoạ cho khái niệm nào?`, c.term, wrong.map((w) => w.text), explain, rng, 4, c);
}

/**
 * Ghép cặp nhanh (bậc 2): `c` + tối đa 3 khái niệm khác (ưu tiên theo thứ tự `others`). Cần ≥ 3 cặp.
 * Mô tả = định nghĩa đã che mọi tên trong nhóm. Hai mô tả chồng nhau (vd "Hiến pháp" và "Hiệu lực pháp lý cao nhất
 * của Hiến pháp") hoặc mô tả ít thông tin → thử `plain` của khái niệm đó; vẫn không được thì bỏ khái niệm ấy.
 */
export function genMatch(c: Concept, others: Concept[], rng: () => number, n = 4): MatchItem | null {
  type Pick = { x: Concept; src: string };
  const chosen: Pick[] = [];
  const textOf = (p: Pick, terms: string[]) => shownText(p.x, p.src, LIMITS.matchText, terms.filter((t) => t !== p.x.term));
  // mô tả bị cắt "…" giữa chừng thì bỏ (thử `plain`, không được thì bỏ khái niệm đó)
  const whole = (p: Pick, terms: string[]) => shownText(p.x, p.src, 100000, terms.filter((t) => t !== p.x.term)).length <= LIMITS.matchText;
  const ok = (p: Pick, terms: string[], with_: Pick[]) => {
    const t = textOf(p, terms);
    return whole(p, terms) && normalize(t).length >= 20 && informative(t) && !with_.some((q) => q.x.id !== p.x.id && overlaps(textOf(q, terms), t));
  };
  const tryAdd = (x: Concept): boolean => {
    const terms = [...chosen.map((p) => p.x.term), x.term];
    for (const src of [x.definition, x.plain]) {
      const p = { x, src };
      if (ok(p, terms, chosen)) {
        if (src === x.plain) genStats.matchPlainFallback++;
        chosen.push(p);
        return true;
      }
    }
    return false;
  };
  if (!tryAdd(c)) { genStats.matchNull++; return null; }
  for (const x of others) {
    if (chosen.length >= n) break;
    if (x.subject !== c.subject || chosen.some((p) => p.x.id === x.id || nearDuplicate(p.x.term, x.term))) continue;
    if (!tryAdd(x)) genStats.matchDropped++;
  }
  // kiểm lại với đủ tên của cả nhóm (che thêm tên có thể làm mô tả ít thông tin hoặc giống nhau hơn)
  const all = chosen.map((p) => p.x.term);
  const final = chosen.filter((p) => ok(p, all, chosen));
  if (final.length !== chosen.length || final.length < 3 || !final.some((p) => p.x.id === c.id)) { genStats.matchNull++; return null; }
  const pairs = final.map((p) => ({ conceptId: p.x.id, term: p.x.term, text: textOf(p, all) }));
  return { type: 'match', level: 2, pairs: shuffle(pairs, rng), explain: explainOf(c, `«${c.term}»:`) };
}

// ---------- Phân biệt: gộp `pair` thành SortItem ----------

const GENERIC_LABELS = new Set(['đúng', 'sai', 'có', 'không', 'được', 'không được', 'được phép', 'bị cấm', 'hợp lệ', 'không hợp lệ', 'hợp pháp', 'trái pháp luật', 'có hiệu lực', 'vô hiệu', 'đúng luật', 'sai luật', 'đúng nguyên tắc', 'sai nguyên tắc']);
const NEG = /^(không phải|không được|không|chưa|được|bị|phải)\s+/u;

/**
 * Cặp nhãn chung chung ("Được phép | Bị cấm", "Xâm phạm | Không xâm phạm"): nghĩa phụ thuộc ngữ cảnh khái niệm,
 * nên KHÔNG gộp tình huống của khái niệm khác vào.
 */
export function isGenericPair(p: Pick<ItemPair, 'left' | 'right'>): boolean {
  const a = normalize(p.left), b = normalize(p.right);
  return GENERIC_LABELS.has(a) || GENERIC_LABELS.has(b) || isNegationPair(p);
}

/** Hai nhãn chỉ khác nhau ở chữ phủ định ("Đương sự" | "Không phải đương sự"). */
function isNegationPair(p: Pick<ItemPair, 'left' | 'right'>): boolean {
  return normalize(p.left).replace(NEG, '') === normalize(p.right).replace(NEG, '');
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
    const minWords = isNegationPair(p) ? MIN_CASE_WORDS_NEG : MIN_CASE_WORDS;
    const own: SortItem['cases'] = [];
    const extra: SortItem['cases'] = [];
    const seen = new Set<string>();
    const add = (list: SortItem['cases'], text: string, answer: 'left' | 'right', conceptId: string) => {
      const k = normalize(text);
      if (seen.has(k) || wordCount(text) < minWords) return;
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
    let cases = [...own, ...shuffle(extra, rng).slice(0, room)];
    if (cases.length < 4 || !cases.some((x) => x.answer === 'left') || !cases.some((x) => x.answer === 'right')) continue;
    // Tình huống gộp từ nhiều khái niệm: tình huống ngắn kiểu "Thời hạn 10 năm" mất ngữ cảnh → ghi kèm tên khái niệm gốc
    // (trừ khi tên đó chứa một nhãn — lộ đáp án; và trừ `example`, vốn là tình huống trọn vẹn).
    if (new Set(cases.map((x) => x.conceptId)).size > 1) {
      const termOf = new Map([c, ...scope].map((x) => [x.id, x.term]));
      const examples = new Set([c, ...scope].map((x) => normalize(x.example)));
      cases = cases.map((x) => {
        const t = termOf.get(x.conceptId!);
        if (!t || examples.has(normalize(x.text)) || leaks(t, p.left) || leaks(t, p.right)) return x;
        return { ...x, text: `${t} — ${x.text}` };
      });
    }
    return { type: 'sort', level: 2, left: p.left, right: p.right, cases: shuffle(cases, rng), explain: explains.join(' ') };
  }
  return null;
}

// ---------- Điền khuyết: nhiễu cho ngân hàng từ ----------

const NUM_WORDS = /(?<![\p{L}])(?:hai|ba|bốn|sáu|bảy|tám|chín|mười|nửa|phần|trăm|nghìn|triệu|tỷ)(?![\p{L}])/iu;
/** Chỗ trống là con số/tỉ lệ ("90 ngày", "hai phần ba") hay từ chữ. Nhiễu phải cùng loại với chỗ trống. */
export function blankKind(b: string): 'num' | 'word' {
  return /\d/.test(b) || NUM_WORDS.test(b) ? 'num' : 'word';
}
const BLANK_RE = /\{\{([^{}]+)\}\}/g;
const blanksOf = (text: string): string[] => [...text.matchAll(BLANK_RE)].map((m) => m[1]);

/**
 * Nhiễu cho ngân hàng từ của câu điền khuyết: chỗ trống của các câu điền khuyết khác CÙNG MÔN, cùng loại (số với số, chữ với chữ),
 * độ dài ±1 tiếng, không xuất hiện trong chính câu này; ưu tiên cùng chương. Thay `bank_extra` viết tay kiểu "thuế", "thương mại"
 * vốn sai ngay từ ngữ pháp. Thiếu `n` nhiễu thì null (giữ `bank_extra` gốc).
 */
export function clozeExtras(c: Concept, item: ItemCloze, known: Concept[], rng: () => number, n = 2): string[] | null {
  const mine = blanksOf(item.text);
  if (!mine.length) return null;
  const kinds = new Set(mine.map(blankKind));
  const lens = mine.map((b) => normalize(b).split(' ').length);
  const text = ` ${normalize(item.text.replace(BLANK_RE, ' '))} `;
  const taken = new Set(mine.map(normalize));
  const tiers: string[][] = [[], []];
  for (const x of known) {
    if (x.subject !== c.subject || x.id === c.id) continue;
    for (const it of x.items) {
      if (it.type !== 'cloze') continue;
      for (const b of blanksOf(it.text)) {
        const k = normalize(b);
        const wc = k.split(' ').length;
        if (taken.has(k) || !kinds.has(blankKind(b)) || !lens.some((l) => Math.abs(l - wc) <= 1) || text.includes(` ${k} `)) continue;
        if (mine.some((m) => nearDuplicate(m, b))) continue;
        taken.add(k);
        tiers[x.chapter === c.chapter ? 0 : 1].push(b);
      }
    }
  }
  const out = [...shuffle(tiers[0], rng), ...shuffle(tiers[1], rng)].slice(0, n);
  return out.length === n ? out : null;
}
