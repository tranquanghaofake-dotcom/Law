import { describe, expect, it } from 'vitest';
import { GOLDEN_MULT, LESSON_FIRST_BONUS, RETRY_XP, SESSION_BONUS, xpBreakdown, xpForAnswer } from '$lib/game/xp';

describe('xpForAnswer', () => {
  it('10 XP cơ bản, ×1,5 từ combo 5, ×2 từ combo 10, sai = 0', () => {
    expect(xpForAnswer(true, 0)).toBe(10);
    expect(xpForAnswer(true, 4)).toBe(10);
    expect(xpForAnswer(true, 5)).toBe(15);
    expect(xpForAnswer(true, 10)).toBe(20);
    expect(xpForAnswer(false, 7)).toBe(0);
  });
  it('thưởng phiên và đợt', () => {
    expect(SESSION_BONUS).toBe(20);
    expect(LESSON_FIRST_BONUS).toBe(50);
  });
  it('câu vàng ×2 chỉ khi đúng (nhân sau combo)', () => {
    expect(GOLDEN_MULT).toBe(2);
    expect(xpForAnswer(true, 0, { golden: true })).toBe(20);
    expect(xpForAnswer(true, 5, { golden: true })).toBe(30);
    expect(xpForAnswer(false, 5, { golden: true })).toBe(0);
  });
  it('vòng sửa sai: thưởng nhỏ cố định khi sửa được, không combo, không vàng', () => {
    expect(xpForAnswer(true, 12, { retry: true, golden: true })).toBe(RETRY_XP);
    expect(RETRY_XP).toBeLessThan(10);
    expect(xpForAnswer(false, 0, { retry: true })).toBe(0);
  });
});

describe('xpBreakdown', () => {
  it('tách XP theo nguồn, tổng khớp xpForAnswer', () => {
    expect(xpBreakdown(true, 5, { golden: true })).toEqual({ base: 10, combo: 5, golden: 15, retry: 0, total: 30 });
    expect(xpBreakdown(true, 0, { retry: true })).toEqual({ base: 0, combo: 0, golden: 0, retry: RETRY_XP, total: RETRY_XP });
    expect(xpBreakdown(false, 9)).toEqual({ base: 0, combo: 0, golden: 0, retry: 0, total: 0 });
    for (const combo of [0, 3, 5, 9, 10, 20]) for (const golden of [false, true]) {
      expect(xpBreakdown(true, combo, { golden }).total).toBe(xpForAnswer(true, combo, { golden }));
    }
  });
});
