import type { Level } from '$lib/content/types';
import { xpForAnswer } from '$lib/game/xp';
import type { AnswerResult } from '$lib/ui/cards/types';
import { nextLevel } from './progress';
import type { Step } from './session';

export type StepResult = { conceptId: string; correct: boolean; levelBefore: Level; levelAfter: Level };
export type RunnerState = {
  steps: Step[];
  i: number;
  combo: number;
  xp: number;
  levels: Record<string, Level>;
  results: StepResult[];
  done: boolean;
};

export function createRunner(steps: Step[], levels: Record<string, Level>): RunnerState {
  return { steps, i: 0, combo: 0, xp: 0, levels: { ...levels }, results: [], done: steps.length === 0 };
}

/** Áp dụng câu trả lời cho bước hiện tại. Intro không tính XP và không đổi bậc. */
export function answer(s: RunnerState, r: AnswerResult): { state: RunnerState; levelUp: boolean; sfx: 'correct' | 'wrong'; xpGained: number } {
  const step = s.steps[s.i];
  const before = (s.levels[step.conceptId] ?? 0) as Level;
  const isIntro = step.item.type === 'intro';
  const after = isIntro ? before : nextLevel(before, r.correct);
  const xpGained = isIntro ? 0 : xpForAnswer(r.correct, s.combo);
  const state: RunnerState = {
    ...s,
    combo: isIntro ? s.combo : r.correct ? s.combo + 1 : 0,
    xp: s.xp + xpGained,
    levels: { ...s.levels, [step.conceptId]: after },
    results: [...s.results, { conceptId: step.conceptId, correct: r.correct, levelBefore: before, levelAfter: after }],
  };
  return { state, levelUp: after > before, sfx: r.correct ? 'correct' : 'wrong', xpGained };
}

export function next(s: RunnerState): RunnerState {
  const i = s.i + 1;
  return { ...s, i, done: i >= s.steps.length };
}

export function summary(s: RunnerState): { correct: number; total: number; xp: number; levelUps: { conceptId: string; to: Level }[] } {
  const scored = s.results.filter((r, k) => s.steps[k]?.item.type !== 'intro');
  const final = new Map<string, { from: Level; to: Level }>();
  for (const r of s.results) {
    const cur = final.get(r.conceptId);
    final.set(r.conceptId, { from: cur?.from ?? r.levelBefore, to: r.levelAfter });
  }
  const levelUps = [...final.entries()].filter(([, v]) => v.to > v.from).map(([conceptId, v]) => ({ conceptId, to: v.to }));
  return { correct: scored.filter((r) => r.correct).length, total: scored.length, xp: s.xp, levelUps };
}
