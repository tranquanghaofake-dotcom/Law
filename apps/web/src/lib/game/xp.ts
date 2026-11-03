export const BASE_XP = 10;
export const SESSION_BONUS = 20;
export const LESSON_FIRST_BONUS = 50;
/** Câu vàng (meta.golden) đúng: nhân XP của câu (sau combo). */
export const GOLDEN_MULT = 2;
/** Câu sửa được trong vòng sửa sai (meta.kind = 'retry'): thưởng nhỏ cố định — thưởng việc nhớ ra, không thưởng tốc độ. */
export const RETRY_XP = 5;

export type XpOpts = { golden?: boolean; retry?: boolean };
/** XP một câu chia theo nguồn (để màn kết thúc hiện "XP từ đâu"). */
export type XpParts = { base: number; combo: number; golden: number; retry: number; total: number };

/** `combo` = số câu đúng liên tiếp TRƯỚC câu này. ×1,5 từ combo 5, ×2 từ combo 10; câu vàng ×2; sai = 0; câu sửa sai = RETRY_XP. */
export function xpBreakdown(correct: boolean, combo: number, opts: XpOpts = {}): XpParts {
  if (!correct) return { base: 0, combo: 0, golden: 0, retry: 0, total: 0 };
  if (opts.retry) return { base: 0, combo: 0, golden: 0, retry: RETRY_XP, total: RETRY_XP };
  const mult = combo >= 10 ? 2 : combo >= 5 ? 1.5 : 1;
  const withCombo = Math.round(BASE_XP * mult);
  const total = opts.golden ? withCombo * GOLDEN_MULT : withCombo;
  return { base: BASE_XP, combo: withCombo - BASE_XP, golden: total - withCombo, retry: 0, total };
}

export function xpForAnswer(correct: boolean, combo: number, opts: XpOpts = {}): number {
  return xpBreakdown(correct, combo, opts).total;
}
