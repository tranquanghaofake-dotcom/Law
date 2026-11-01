import type { Level } from '$lib/content/types';
export type { Level };

/** Đúng → +1 (tối đa 6); sai → −1 (tối thiểu 0). */
export function nextLevel(level: Level, correct: boolean): Level {
  const n = correct ? Math.min(6, level + 1) : Math.max(0, level - 1);
  return n as Level;
}
