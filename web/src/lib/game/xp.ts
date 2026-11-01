export const BASE_XP = 10;
export const SESSION_BONUS = 20;
export const LESSON_FIRST_BONUS = 50;

/** `combo` = số câu đúng liên tiếp TRƯỚC câu này. ×1,5 từ combo 5, ×2 từ combo 10; sai = 0. */
export function xpForAnswer(correct: boolean, combo: number): number {
  if (!correct) return 0;
  const mult = combo >= 10 ? 2 : combo >= 5 ? 1.5 : 1;
  return Math.round(BASE_XP * mult);
}
