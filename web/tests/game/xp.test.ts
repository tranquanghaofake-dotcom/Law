import { describe, expect, it } from 'vitest';
import { LESSON_FIRST_BONUS, SESSION_BONUS, xpForAnswer } from '$lib/game/xp';

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
});
