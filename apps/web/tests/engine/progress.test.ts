import { describe, expect, it } from 'vitest';
import { nextLevel } from '$lib/engine/progress';

describe('nextLevel', () => {
  it('đúng thì lên 1 bậc, tối đa 6', () => {
    expect(nextLevel(0, true)).toBe(1);
    expect(nextLevel(6, true)).toBe(6);
  });
  it('sai thì tụt 1 bậc, tối thiểu 0', () => {
    expect(nextLevel(0, false)).toBe(0);
    expect(nextLevel(3, false)).toBe(2);
  });
});
