import type { Level } from '$lib/content/types';
import { xpBreakdown, type XpParts } from '$lib/game/xp';
import type { AnswerResult } from '$lib/ui/cards/types';
import { nextLevel } from './progress';
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

export function createRunner(steps: Step[], levels: Record<string, Level>): RunnerState {
  return { steps, i: 0, combo: 0, bestCombo: 0, xp: 0, xpParts: ZERO, levels: { ...levels }, results: [], retryStart: null, done: steps.length === 0 };
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
  const golden = !retry && !!step.meta?.golden;
  const after = intro || retry ? before : nextLevel(before, r.correct);
  const parts = intro ? ZERO : xpBreakdown(r.correct, s.combo, { golden, retry });
  const combo = intro || retry ? s.combo : r.correct ? s.combo + 1 : 0;
  const state: RunnerState = {
    ...s,
    combo,
    bestCombo: Math.max(s.bestCombo, combo),
    xp: s.xp + parts.total,
    xpParts: addParts(s.xpParts, parts),
    levels: { ...s.levels, [step.conceptId]: after },
    results: [...s.results, { conceptId: step.conceptId, correct: r.correct, levelBefore: before, levelAfter: after, retry: retry || undefined, golden: golden || undefined }],
  };
  return { state, levelUp: after > before, sfx: r.correct ? 'correct' : 'wrong', xpGained: parts.total };
}

/** Chỉ số các bước lượt chính trả lời sai (không intro, không retry). */
function wrongMain(s: RunnerState): number[] {
  return s.results.flatMap((r, k) => (!r.correct && !isIntro(s.steps[k]) && !isRetry(s.steps[k]) ? [k] : []));
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
};

export function summary(s: RunnerState): SessionSummary {
  const scored = s.results.filter((r, k) => !isIntro(s.steps[k]) && !r.retry);
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
