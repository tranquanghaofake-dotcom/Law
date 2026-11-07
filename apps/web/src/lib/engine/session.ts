import type { Concept, Item, Level } from '$lib/content/types';
import { interleave, nearConfusables, typeKey } from './arrange';
import { candidates, clozeExtras, genDefTerm, genExampleConcept, genMatch, genSort, genTermDef, type Cand, type GenContext } from './generate';
import type { Step, StepGen, StepItem, StepMeta } from './step';
import { hasAbsoluteWord, leaks } from './text';
import { normalize } from './grading';
import { REVIEW_MAX_STEPS } from './limits';

export type { IntroItem, Step, StepItem, StepMeta, GenItem, MatchItem, SortItem } from './step';
export type { GenContext as SessionContext } from './generate';
export type Pass = 1 | 2 | 3;

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pass theo bậc thấp nhất trong đợt: 0 → 1; 1–2 → 2; ≥3 → 3. */
export function passFor(levels: Record<string, Level>): Pass {
  const min = Math.min(...Object.values(levels)) as Level;
  if (min <= 0) return 1;
  if (min <= 2) return 2;
  return 3;
}

/**
 * Bậc 6 (đã thuộc) chỉ hỏi dạng nhớ chủ động 3–5 (điền khuyết gõ, tình huống/Đúng-Sai, tự nhớ lại),
 * không quay về trắc nghiệm nhận biết bậc 1–2.
 */
const MASTERED_LEVELS: Level[] = [3, 4, 5];

function wantLevel(level: Level, rng: () => number): Level {
  if (level === 6) return MASTERED_LEVELS[Math.floor(rng() * MASTERED_LEVELS.length)];
  return (level < 1 ? 1 : level) as Level;
}

/** Thứ tự thử bậc: bậc muốn → thấp dần → cao dần (thiếu loại thì lấy bậc gần nhất thấp hơn trước). */
function levelOrder(want: Level): Level[] {
  const out: Level[] = [];
  for (let l = want; l >= 1; l--) out.push(l as Level);
  for (let l = want + 1; l <= 5; l++) out.push(l as Level);
  return out;
}

/** Chọn item gốc trong JSON cho bậc (giữ cho tương thích; ghép phiên dùng `buildLearnSession`). */
export function pickItem(concept: Concept, level: Level, rng: () => number): Item {
  for (const l of levelOrder(wantLevel(level, rng))) {
    const pool = concept.items.filter((i) => i.level === l && !(i.type === 'pair' && i.cases.length < 4));
    if (pool.length) return pool[Math.floor(rng() * pool.length)];
  }
  if (!concept.items.length) throw new Error(`Khái niệm ${concept.id} không có item nào`);
  return concept.items[0];
}

/** Chế độ cloze: lần đầu (bậc < 3) chọn từ ngân hàng; đã qua bậc 3 thì gõ (spec 2.2). */
export function clozeModeFor(level: Level): 'bank' | 'type' {
  return level >= 3 ? 'type' : 'bank';
}

// ---------- Nhãn trên thẻ ----------

const GEN_KICKER: Record<StepGen, string> = {
  'def-term': 'Định nghĩa → thuật ngữ',
  'term-def': 'Thuật ngữ → định nghĩa',
  'example-concept': 'Ví dụ → khái niệm',
  'pair-merged': 'Phân biệt',
  match: 'Ghép cặp',
  'def-tf': 'Đúng hay sai',
};
const TYPE_KICKER: Record<string, string> = {
  intro: 'Khái niệm mới', mcq: 'Nhận biết', case: 'Tình huống', pair: 'Phân biệt', cloze: 'Điền khuyết', truefalse: 'Đúng hay sai', recall: 'Tự nhớ lại',
};

/** Kicker cho thẻ: thêm " · tên khái niệm" chỉ khi tên không lộ đáp án (không nằm trong phương án/chỗ trống). */
export function kickerFor(c: Concept, item: StepItem, gen?: StepGen): string {
  if (gen) return GEN_KICKER[gen];
  const base = TYPE_KICKER[item.type] ?? '';
  let safe = true;
  if (item.type === 'mcq' || item.type === 'case') safe = !item.options.some((o) => leaks(o, c.term));
  if (item.type === 'cloze') safe = ![...item.text.matchAll(/\{\{([^{}]+)\}\}/g)].some((m) => leaks(m[1], c.term));
  if (item.type === 'pair' || item.type === 'sort' || item.type === 'match') safe = false;
  return safe ? `${base} · ${c.term}` : base;
}

// ---------- Bộ chọn dạng câu trong một phiên ----------

/**
 * Bậc của từng dạng (lý do ghi trong engine.md):
 * 1 nhận biết: mcq gốc, def-term · 2 phân biệt: sort gộp ≥ 4, match, term-def · 3 cloze ·
 * 4 vận dụng: case, truefalse gốc, example-concept, def-tf · 5 recall.
 */
type Option = { family: string; gen?: StepGen; item: StepItem; key: string };

/** Họ dạng để xen kẽ khi chọn: hai loại Đúng/Sai tính chung một họ. */
const familyOf = (o: { gen?: StepGen; item: StepItem }) => (o.gen === 'def-tf' || o.item.type === 'truefalse' ? 'tf' : o.gen ?? o.item.type);
// Đúng/Sai có 50 % đoán mò → ưu tiên thấp hơn các dạng khác cùng bậc.
const FAMILY_BIAS: Record<string, number> = { tf: 0.5 };

class Picker {
  private known: Concept[];
  private candMemo = new Map<string, Cand[]>();
  private used = new Map<string, number>();
  private usedKeys = new Map<string, Set<string>>();
  private matchCap: number;
  private sessionIds: string[];
  /** Số bước Đúng/Sai có đáp án Đúng / Sai trong phiên (để giữ gần 50/50). */
  tally = { t: 0, f: 0 };

  constructor(private concepts: Concept[], private ctx: GenContext, private rng: () => number) {
    const seen = new Set<string>();
    this.known = [...concepts, ...(ctx.pool ?? [])].filter((c) => {
      const k = `${c.subject}/${c.id}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    this.sessionIds = concepts.map((c) => c.id);
    this.matchCap = Math.max(1, Math.ceil(concepts.length / 4));
  }

  private cands(c: Concept): Cand[] {
    const k = `${c.subject}/${c.id}`;
    let v = this.candMemo.get(k);
    if (!v) { v = candidates(c, this.known, this.ctx.terms, this.rng); this.candMemo.set(k, v); }
    return v;
  }

  /** Khái niệm cho ghép cặp: các khái niệm cùng đợt trước, rồi dễ nhầm/cùng chương. */
  private matchOthers(c: Concept): Concept[] {
    const mates = this.concepts.filter((x) => x.id !== c.id && x.subject === c.subject);
    const rest = this.cands(c).flatMap((x) => (x.concept && !this.sessionIds.includes(x.id) ? [x.concept] : []));
    return [...shuffle(mates, this.rng), ...rest];
  }

  private options(c: Concept, level: Level): Option[] {
    const out: Option[] = [];
    const withBank = (it: Item): Item => {
      if (it.type !== 'cloze') return it;
      const extras = clozeExtras(c, it, this.known, this.rng);
      return extras ? { ...it, bank_extra: extras } : it;
    };
    const orig = (it: Item, i: number) => { const x = withBank(it); out.push({ family: familyOf({ item: x }), item: x, key: `i${i}` }); };
    c.items.forEach((it, i) => { if (it.level === level && it.type !== 'pair') orig(it, i); });
    const gen = (g: StepGen, item: StepItem | null) => { if (item) out.push({ family: familyOf({ gen: g, item }), gen: g, item, key: g }); };
    const cands = this.cands(c);
    if (level === 1) gen('def-term', genDefTerm(c, cands, this.rng));
    if (level === 2) {
      gen('pair-merged', genSort(c, cands.flatMap((x) => (x.concept && x.tier <= 2 ? [x.concept] : [])), this.rng));
      if ((this.used.get('match') ?? 0) < this.matchCap) gen('match', genMatch(c, this.matchOthers(c), this.rng));
      gen('term-def', genTermDef(c, cands, this.rng));
    }
    if (level === 4) {
      gen('example-concept', genExampleConcept(c, cands, this.rng));
    }
    // câu Sai có từ tuyệt đối ("mọi/chỉ/luôn…") là mẹo đoán: bỏ nếu khái niệm còn dạng khác ở bậc này
    const isTell = (o: Option) => o.item.type === 'truefalse' && !o.item.answer && hasAbsoluteWord(o.item.statement);
    if (out.some((o) => !isTell(o))) { for (let i = out.length - 1; i >= 0; i--) if (isTell(out[i])) out.splice(i, 1); }
    const done = this.usedKeys.get(c.id);
    const fresh = done ? out.filter((o) => !done.has(o.key)) : out;
    return fresh.length ? fresh : out;
  }

  /** Chọn trong `opts`: họ dạng ít dùng nhất trong phiên; với họ Đúng/Sai chọn câu có đáp án đang thiếu. */
  private choose(opts: Option[]): Option {
    const score = (o: Option) => (this.used.get(o.family) ?? 0) + (FAMILY_BIAS[o.family] ?? 0);
    const best = Math.min(...opts.map(score));
    const top = opts.filter((o) => score(o) === best);
    const fam = top[Math.floor(this.rng() * top.length)].family;
    let pool = opts.filter((o) => o.family === fam);
    if (fam === 'tf') {
      const need = this.tally.t <= this.tally.f;
      const match = pool.filter((o) => o.item.type === 'truefalse' && o.item.answer === need);
      if (match.length) pool = match;
      // tránh mẹo "có từ tuyệt đối ⇒ Sai": câu Sai ưu tiên không có từ tuyệt đối, câu Đúng ưu tiên có
      const tell = (o: Option) => o.item.type === 'truefalse' && hasAbsoluteWord(o.item.statement);
      const fair = pool.filter((o) => tell(o) === need);
      if (fair.length) pool = fair;
    }
    return pool[Math.floor(this.rng() * pool.length)];
  }

  pick(c: Concept, level: Level): Step {
    const want = wantLevel(level, this.rng);
    for (const l of levelOrder(want)) {
      const opts = this.options(c, l);
      if (!opts.length) continue;
      const o = this.choose(opts);
      this.used.set(o.family, (this.used.get(o.family) ?? 0) + 1);
      if (o.gen === 'match') this.used.set('match', (this.used.get('match') ?? 0) + 1);
      if (!this.usedKeys.has(c.id)) this.usedKeys.set(c.id, new Set());
      this.usedKeys.get(c.id)!.add(o.key);
      if (o.item.type === 'truefalse') { if (o.item.answer) this.tally.t++; else this.tally.f++; }
      const meta: StepMeta = { kind: 'learn', kicker: kickerFor(c, o.item, o.gen), ...(o.gen ? { gen: o.gen } : {}) };
      return { conceptId: c.id, item: o.item, level: level === 6 ? l : level, meta };
    }
    // không có dạng nào hợp lệ (dữ liệu thiếu): rơi về item gốc như trước
    const item = pickItem(c, level, this.rng);
    return { conceptId: c.id, item, level: level === 6 ? item.level : level, meta: { kind: 'learn', kicker: kickerFor(c, item) } };
  }
}

// ---------- Câu chốt, câu vàng ----------

/** Ưu tiên chọn câu chốt: tình huống trước. */
const BOSS_PRIORITY = ['case', 'example-concept', 'pair-merged', 'truefalse', 'def-tf', 'match', 'recall', 'cloze', 'term-def', 'def-term', 'mcq'];
const bossRank = (s: Step) => { const k = BOSS_PRIORITY.indexOf(typeKey(s)); return k < 0 ? BOSS_PRIORITY.length : k; };

/** Hai bước liền nhau cùng khái niệm (intro → câu đầu của chính nó được phép). */
const clash = (a: Step | undefined, b: Step | undefined) => !!a && !!b && a.conceptId === b.conceptId && a.item.type !== 'intro';

const clashCount = (s: Step[]) => s.reduce((n, x, k) => n + (clash(s[k - 1], x) ? 1 : 0), 0);

/** Sửa chỗ hai bước liền trùng khái niệm bằng cách đổi chỗ hai bước khác khái niệm (giữ thứ tự trong từng khái niệm, không động intro/câu chốt). */
function repairClashes(out: Step[]): void {
  const movable = (k: number) => out[k].item.type !== 'intro' && out[k].meta?.kind !== 'boss';
  const between = (a: number, b: number, id: string) => out.slice(Math.min(a, b) + 1, Math.max(a, b)).some((x) => x.conceptId === id);
  for (let guard = 0; guard < out.length && clashCount(out) > 0; guard++) {
    const k = out.findIndex((x, i) => clash(out[i - 1], x));
    const base = clashCount(out);
    let fixed = false;
    for (const cand of [k, k - 1]) {
      if (cand < 0 || !movable(cand)) continue;
      for (let j = 0; j < out.length && !fixed; j++) {
        if (j === cand || !movable(j) || out[j].conceptId === out[cand].conceptId) continue;
        if (between(cand, j, out[cand].conceptId) || between(cand, j, out[j].conceptId)) continue;
        [out[cand], out[j]] = [out[j], out[cand]];
        if (clashCount(out) < base) fixed = true;
        else [out[cand], out[j]] = [out[j], out[cand]];
      }
      if (fixed) break;
    }
    if (!fixed) return;
  }
}

/** Tỉ lệ câu vàng: ~1/8 bước tính điểm (không tính câu chốt), tối thiểu 1 khi có ≥ 3 bước. */
export const GOLDEN_EVERY = 8;

/** Đặt câu chốt (`meta.kind='boss'`) ở cuối và rải câu vàng (`meta.golden`). Không đổi bậc của bước nào. */
export function finalize(steps: Step[], rng: () => number): Step[] {
  const out = steps.map((s) => ({ ...s, meta: { ...s.meta } }));
  const scoredIdx = out.flatMap((s, k) => (s.item.type === 'intro' ? [] : [k]));
  if (!scoredIdx.length) return out;
  const lastOf = (k: number) => !out.slice(k + 1).some((x) => x.conceptId === out[k].conceptId);
  // cùng dạng thì ưu tiên chỗ rút ra không làm hai bước kề nhau trùng khái niệm, rồi bước cuối của khái niệm đó
  const rank = (k: number) => bossRank(out[k]) * 4 + (clash(out[k - 1], out[k + 1]) ? 2 : 0) + (lastOf(k) ? 0 : 1);
  const best = Math.min(...scoredIdx.map(rank));
  const top = scoredIdx.filter((k) => rank(k) === best);
  const bi = top[Math.floor(rng() * top.length)];
  const [boss] = out.splice(bi, 1);
  boss.meta = { ...boss.meta, kind: 'boss' };
  out.push(boss);
  const n = out.length;
  if (clash(out[n - 2], boss)) {
    for (let k = n - 3; k >= 0; k--) {
      const s = out[k];
      if (s.item.type === 'intro' || s.conceptId === boss.conceptId) continue;
      if (out.slice(k + 1, n - 1).some((x) => x.conceptId === s.conceptId)) continue;
      if (clash(out[k - 1], out[k + 1])) continue;
      out.splice(k, 1);
      out.splice(n - 2, 0, s);
      break;
    }
  }
  repairClashes(out);
  const eligible = out.flatMap((s, k) => (s.item.type === 'intro' || s.meta?.kind === 'boss' ? [] : [k]));
  const count = eligible.length + 1 >= 3 ? Math.max(1, Math.round((eligible.length + 1) / GOLDEN_EVERY)) : 0;
  for (const k of shuffle(eligible, rng).slice(0, count)) out[k].meta = { ...out[k].meta, golden: true };
  return out;
}

// ---------- Phiên học / ôn ----------

/** Bậc của bước cho một khái niệm: không thấp hơn bậc hiện tại của nó (đợt lẫn bậc không kéo khái niệm cao về thấp). */
function stepLevel(stage: Level, current: Level): Level {
  return (current > stage ? current : stage) as Level;
}

/**
 * Pass 1: intro + bậc 1 theo khối 2–3 khái niệm (intro của khối rồi câu của khối).
 * Pass 2: bậc 2 rồi bậc 3 cho mỗi khái niệm; Pass 3: bậc 4 rồi bậc 5 — các khái niệm xen nhau, xen dạng,
 * không hai bước liền cùng khái niệm. Cuối phiên: câu chốt; ~1/8 câu vàng.
 * `ctx` (tùy chọn): khái niệm dễ nhầm/cùng chương + bảng tên để sinh phương án nhiễu.
 */
export function buildLearnSession(concepts: Concept[], levels: Record<string, Level>, rng: () => number, ctx: GenContext = {}, opts: { pretest?: number } = {}): Step[] {
  const pass = passFor(Object.fromEntries(concepts.map((c) => [c.id, levels[c.id] ?? 0])));
  // (đợt 7) Đoán trước chỉ ở pass 1 (có khái niệm mới), đặt đầu phiên, trước thẻ giới thiệu; mặc định tắt.
  if (pass === 1 && (opts.pretest ?? 0) > 0) {
    const pre = buildPretest(concepts, levels, rng, ctx, opts.pretest);
    return [...pre, ...buildLearnSession(concepts, levels, rng, ctx)];
  }
  const picker = new Picker(concepts, ctx, rng);
  const cur = (c: Concept) => (levels[c.id] ?? 0) as Level;
  if (pass === 1) {
    const order = shuffle(concepts, rng);
    const steps: Step[] = [];
    const blockSize = order.length <= 3 ? order.length : order.length === 4 ? 2 : 3;
    for (let i = 0; i < order.length; i += blockSize) {
      const block = order.slice(i, i + blockSize);
      for (const c of block) if (cur(c) === 0) steps.push({ conceptId: c.id, item: { type: 'intro' }, level: 0, meta: { kind: 'learn', kicker: TYPE_KICKER.intro } });
      const qs = shuffle(block, rng).map((c) => [picker.pick(c, stepLevel(1, cur(c)))]);
      const prev = steps[steps.length - 1];
      steps.push(...interleave(qs, { rng, prevType: prev ? typeKey(prev) : undefined }));
    }
    return finalize(steps, rng);
  }
  const [a, b]: [Level, Level] = pass === 2 ? [2, 3] : [4, 5];
  const queues = shuffle(concepts, rng).map((c) => [picker.pick(c, stepLevel(a, cur(c))), picker.pick(c, stepLevel(b, cur(c)))]);
  return finalize(interleave(queues, { rng }), rng);
}

/** Số bước tối đa của một phiên ôn. */
export { REVIEW_MAX_STEPS };

/**
 * Ôn: mỗi khái niệm 1 bước ở bậc hiện tại (bậc 6 → dạng nhớ chủ động 3–5), tối đa `max`, xen dạng, có câu chốt + câu vàng.
 * `urgency` (tuỳ chọn): xác suất còn nhớ theo khái niệm (FSRS retrievability) — thấp hơn được chọn trước khi đến hạn nhiều hơn `max`;
 * thiếu thì coi như 1, bằng nhau thì ngẫu nhiên.
 */
export function buildReviewSession(concepts: Concept[], levels: Record<string, Level>, rng: () => number, max = REVIEW_MAX_STEPS, ctx: GenContext = {}, urgency: Record<string, number> = {}): Step[] {
  const u = (c: Concept) => urgency[c.id] ?? 1;
  const ordered = shuffle(concepts, rng).sort((a, b) => u(a) - u(b));
  // (đợt 7, đề xuất ⑤) giữ cặp dễ nhầm cùng vào phiên, rồi đặt chúng cách nhau 1–3 câu.
  const chosen = pickReviewConcepts(ordered, max);
  const picker = new Picker(chosen, ctx, rng);
  const queues = chosen.map((c) => {
    const lv = (levels[c.id] ?? 1) as Level;
    return [picker.pick(c, lv < 1 ? 1 : lv)];
  });
  return arrangeConfusables(finalize(interleave(queues, { rng }), rng), chosen);
}

// ---------- Đợt 7: xen kẽ cặp dễ nhầm (⑤), đoán trước + thẻ giới thiệu ba lớp (③) ----------

const keyOf = (c: Pick<Concept, 'subject' | 'id'>) => `${c.subject}/${c.id}`;

/** Hai khái niệm (cùng môn) dễ nhầm theo `confusables` (một chiều là đủ). */
export function confusablePair(a: Concept, b: Concept): boolean {
  return a.subject === b.subject && a.id !== b.id && (a.confusables.includes(b.id) || b.confusables.includes(a.id));
}

/**
 * Chọn tối đa `max` khái niệm theo thứ tự `ordered`, nhưng khi lấy một khái niệm thì kéo luôn các khái niệm dễ nhầm
 * với nó (cũng đang trong danh sách) vào ngay sau — để cặp dễ nhầm cùng được ôn trong một phiên.
 */
export function pickReviewConcepts(ordered: Concept[], max: number): Concept[] {
  const out: Concept[] = [];
  const has = new Set<string>();
  const add = (c: Concept) => { if (out.length < max && !has.has(keyOf(c))) { out.push(c); has.add(keyOf(c)); } };
  for (const c of ordered) {
    if (out.length >= max) break;
    add(c);
    for (const d of ordered) if (confusablePair(c, d)) add(d);
  }
  return out;
}

/** Chữ người học thấy trên bước (để kiểm bước trước có lộ tên khái niệm bước sau không). */
export function stepText(item: StepItem): string {
  switch (item.type) {
    case 'mcq': case 'case': return [item.q, ...item.options, item.explain].join(' ');
    case 'truefalse': return `${item.statement} ${item.explain}`;
    case 'cloze': return item.text;
    case 'recall': return item.q;
    case 'pair': case 'sort': return [item.left, item.right, ...item.cases.map((x) => x.text), item.explain].join(' ');
    case 'match': return item.pairs.map((p) => `${p.term} ${p.text}`).join(' ');
    default: return '';
  }
}

/** Xếp các bước để cặp dễ nhầm cách nhau 1–3 câu, không đặt ngay sau bước vừa hiện tên khái niệm đó. */
export function arrangeConfusables(steps: Step[], concepts: Concept[]): Step[] {
  const by = new Map(concepts.map((c) => [c.id, c]));
  return nearConfusables(
    steps,
    (a, b) => { const x = by.get(a), y = by.get(b); return !!x && !!y && confusablePair(x, y); },
    (from, to) => { const c = by.get(to); return !!c && leaks(stepText(from.item), c.term); },
  );
}

/** Số câu đoán trước tối đa mỗi đợt (spec: 1–2, có "Bỏ qua"). */
export const PRETEST_MAX = 2;

/**
 * (đề xuất ③a) Câu đoán trước cho khái niệm MỚI (bậc 0) của đợt: "ví dụ → khái niệm nào?", phương án ưu tiên các khái niệm
 * cùng đợt. `meta.kind = 'pretest'`: không ghi tiến độ, không đổi bậc, không XP (xem `recordsProgress`, runner).
 */
export function buildPretest(concepts: Concept[], levels: Record<string, Level>, rng: () => number, ctx: GenContext = {}, max = PRETEST_MAX): Step[] {
  const known = [...concepts, ...(ctx.pool ?? [])];
  const out: Step[] = [];
  for (const c of shuffle(concepts, rng)) {
    if (out.length >= max) break;
    if ((levels[c.id] ?? 0) !== 0) continue;
    const mates = concepts.filter((x) => x.id !== c.id);
    // phương án: khái niệm cùng đợt trước (người học sắp gặp), thiếu thì bù khái niệm dễ nhầm/cùng chương
    const item = genExampleConcept(c, candidates(c, mates, undefined, rng), rng) ?? genExampleConcept(c, candidates(c, known, ctx.terms, rng), rng);
    if (!item) continue;
    out.push({ conceptId: c.id, item, level: 1, meta: { kind: 'pretest', gen: 'example-concept', kicker: 'Đoán trước' } });
  }
  return out;
}

export type IntroLayers = {
  /** Lớp 1: ví dụ cụ thể (`example`). */
  example: string;
  /** Lớp 2: 3–4 dấu hiệu (`keywords`); `verbatim` = cụm có nguyên văn trong định nghĩa (được in như trích dẫn), không thì chỉ là chú thích. */
  cues: { text: string; verbatim: boolean }[];
  /** Lớp 3 (mở khi bấm "Xem nguyên văn"): định nghĩa + nguồn. */
  definition: string;
  source: Concept['source'];
  plain: string;
};

/** (đề xuất ③b) Nội dung thẻ giới thiệu theo thứ tự ví dụ → dấu hiệu → nguyên văn. Chỉ dùng trường đã kiểm. */
export function introLayers(c: Concept, maxCues = 4): IntroLayers {
  const def = ` ${normalize(c.definition)} `;
  const cues = c.keywords.slice(0, maxCues).map((k) => ({ text: k, verbatim: def.includes(` ${normalize(k)} `) }));
  return { example: c.example, cues, definition: c.definition, source: c.source, plain: c.plain };
}
