import type { Level } from '$lib/content/types';
import { xpBreakdown, type XpParts } from '$lib/game/xp';
import type { AnswerResult } from '$lib/ui/cards/types';
import { stepLevel } from './progress';
import { localDay } from '$lib/game/streak';
import { spreadByConcept } from './arrange';
import type { Step } from './session';

export type StepResult = {
  conceptId: string;
  correct: boolean;
  levelBefore: Level;
  levelAfter: Level;
  /** Bước thuộc vòng sửa sai (không tính điểm phiên, không đổi bậc). */
  retry?: boolean;
  golden?: boolean;
  /** Đúng nhưng giữ bậc vì luật giãn cách (cùng ngày với lần lên bậc trước, bậc ≥ 4). */
  held?: boolean;
  /** (đợt 7) Bước đoán trước: không đổi bậc, không XP, không combo, không tính điểm phiên, không vào vòng sửa sai. */
  pretest?: boolean;
};
export type RunnerState = {
  steps: Step[];
  i: number;
  combo: number;
  /** Chuỗi đúng liên tiếp dài nhất trong phiên (lượt chính). */
  bestCombo: number;
  xp: number;
  /** XP từ câu trả lời, chia theo nguồn (chưa gồm thưởng phiên/đợt do SessionView cộng). */
  xpParts: XpParts;
  levels: Record<string, Level>;
  /** Ngày lên bậc gần nhất theo khái niệm (luật giãn cách, cùng luật với repo.record). */
  upDays: Record<string, string>;
  /** Ngày của phiên (YYYY-MM-DD giờ địa phương). */
  today: string;
  results: StepResult[];
  /** Chỉ số bước retry đầu tiên trong `steps`; null = chưa nối vòng sửa sai. */
  retryStart: number | null;
  done: boolean;
};

const ZERO: XpParts = { base: 0, combo: 0, golden: 0, retry: 0, total: 0 };
const addParts = (a: XpParts, b: XpParts): XpParts => ({
  base: a.base + b.base, combo: a.combo + b.combo, golden: a.golden + b.golden, retry: a.retry + b.retry, total: a.total + b.total,
});

const isIntro = (st: Step | undefined): boolean => st?.item.type === 'intro';
const isRetry = (st: Step | undefined): boolean => st?.meta?.kind === 'retry';
const isPretest = (st: Step | undefined): boolean => st?.meta?.kind === 'pretest';
/** Bước không tính vào lượt chính (điểm phiên, vòng sửa sai). */
const offMain = (st: Step | undefined): boolean => isIntro(st) || isRetry(st) || isPretest(st);

export function createRunner(steps: Step[], levels: Record<string, Level>, upDays: Record<string, string> = {}, today = localDay(new Date())): RunnerState {
  return { steps, i: 0, combo: 0, bestCombo: 0, xp: 0, xpParts: ZERO, levels: { ...levels }, upDays: { ...upDays }, today, results: [], retryStart: null, done: steps.length === 0 };
}

/**
 * Áp dụng câu trả lời cho bước hiện tại.
 * Intro: không XP, không đổi bậc. Retry: không đổi bậc, không chạm combo, đúng thì RETRY_XP.
 * Câu vàng đúng: XP ×2.
 */
export function answer(s: RunnerState, r: AnswerResult): { state: RunnerState; levelUp: boolean; sfx: 'correct' | 'wrong'; xpGained: number } {
  const step = s.steps[s.i];
  const before = (s.levels[step.conceptId] ?? 0) as Level;
  const intro = isIntro(step);
  const retry = isRetry(step);
  const pretest = isPretest(step);
  const golden = !retry && !pretest && !!step.meta?.golden;
  const off = intro || retry || pretest;
  const lv = off ? null : stepLevel(before, r.correct, s.upDays[step.conceptId], s.today);
  const after = lv ? lv.level : before;
  const parts = intro || pretest ? ZERO : xpBreakdown(r.correct, s.combo, { golden, retry });
  const combo = intro || retry || pretest ? s.combo : r.correct ? s.combo + 1 : 0;
  const state: RunnerState = {
    ...s,
    combo,
    bestCombo: Math.max(s.bestCombo, combo),
    xp: s.xp + parts.total,
    xpParts: addParts(s.xpParts, parts),
    levels: { ...s.levels, [step.conceptId]: after },
    upDays: lv?.upDay ? { ...s.upDays, [step.conceptId]: lv.upDay } : s.upDays,
    results: [...s.results, {
      conceptId: step.conceptId, correct: r.correct, levelBefore: before, levelAfter: after,
      retry: retry || undefined, golden: golden || undefined, pretest: pretest || undefined, held: lv?.held || undefined,
    }],
  };
  return { state, levelUp: after > before, sfx: r.correct ? 'correct' : 'wrong', xpGained: parts.total };
}

/** Chỉ số các bước lượt chính trả lời sai (không intro, không retry, không đoán trước). */
function wrongMain(s: RunnerState): number[] {
  return s.results.flatMap((r, k) => (!r.correct && !offMain(s.steps[k]) ? [k] : []));
}

/** Bước hiện tại là bước cuối thật sự: sau nó không còn bước nào và không nối vòng sửa sai. Gọi sau `answer`. */
export function isLast(s: RunnerState): boolean {
  if (s.i < s.steps.length - 1) return false;
  return s.retryStart !== null || wrongMain(s).length === 0;
}

/** Sang bước sau. Hết lượt chính mà có câu sai → nối vòng sửa sai (mỗi câu sai một lần, `meta.kind = 'retry'`). */
export function next(s: RunnerState): RunnerState {
  const i = s.i + 1;
  if (i < s.steps.length) return { ...s, i, done: false };
  if (s.retryStart === null) {
    const wrong = wrongMain(s);
    if (wrong.length) {
      const retries: Step[] = wrong.map((k) => {
        const st = s.steps[k];
        return { ...st, meta: { ...st.meta, kind: 'retry', golden: false, retryOf: k } };
      });
      const ordered = spreadByConcept(retries, s.steps[s.steps.length - 1]?.conceptId);
      return { ...s, steps: [...s.steps, ...ordered], i, retryStart: s.steps.length, done: false };
    }
  }
  return { ...s, i, done: true };
}

export type SessionSummary = {
  /** Đúng / tổng ở lượt chính (không tính intro, không tính retry). */
  correct: number;
  total: number;
  xp: number;
  levelUps: { conceptId: string; to: Level }[];
  bestCombo: number;
  /** Số câu vàng trả lời đúng. */
  golden: number;
  /** Số câu đưa vào vòng sửa sai / số câu sửa được. */
  retried: number;
  fixed: number;
  xpParts: XpParts;
  /** (đợt 7) Đoán trước: số câu / số câu đoán đúng (không tính vào correct/total). */
  pretest: { total: number; correct: number };
  /** Số khái niệm trả lời đúng nhưng giữ bậc vì luật giãn cách (hẹn ngày sau mới lên). */
  held: number;
};

export function summary(s: RunnerState): SessionSummary {
  const scored = s.results.filter((r, k) => !offMain(s.steps[k]));
  const pre = s.results.filter((r, k) => isPretest(s.steps[k]));
  const final = new Map<string, { from: Level; to: Level }>();
  for (const r of s.results) {
    const cur = final.get(r.conceptId);
    final.set(r.conceptId, { from: cur?.from ?? r.levelBefore, to: r.levelAfter });
  }
  const levelUps = [...final.entries()].filter(([, v]) => v.to > v.from).map(([conceptId, v]) => ({ conceptId, to: v.to }));
  const retries = s.results.filter((r) => r.retry);
  return {
    correct: scored.filter((r) => r.correct).length,
    total: scored.length,
    xp: s.xp,
    levelUps,
    bestCombo: s.bestCombo,
    golden: s.results.filter((r) => r.golden && r.correct).length,
    retried: retries.length,
    fixed: retries.filter((r) => r.correct).length,
    xpParts: s.xpParts,
    pretest: { total: pre.length, correct: pre.filter((r) => r.correct).length },
    held: new Set(s.results.filter((r) => r.held).map((r) => r.conceptId)).size,
  };
}

/** Các bước trả lời sai ở lượt chính (không intro, không retry), theo thứ tự: dùng cho màn "Xem lại câu sai". */
export function mistakes(s: RunnerState): Step[] {
  return wrongMain(s).map((k) => s.steps[k]);
}

/** Câu sai ở lượt chính mà vòng sửa sai chưa sửa được (retry sai hoặc chưa làm tới). */
export function unfixed(s: RunnerState): Step[] {
  const fixed = new Set(s.results.flatMap((r, k) => (r.retry && r.correct ? [s.steps[k].meta?.retryOf] : [])));
  return wrongMain(s).filter((k) => !fixed.has(k)).map((k) => s.steps[k]);
}
