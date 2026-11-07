import { describe, expect, it } from 'vitest';
import { levelName } from '$lib/game/levels';

describe('levelName', () => {
  it('bậc 0 mà đã có lượt trả lời → "Đã gặp · cần ôn", không gọi là "Chưa học"', () => {
    expect(levelName(0, true)).toBe('Đã gặp · cần ôn');
    expect(levelName(0, false)).toBe('Chưa học');
    expect(levelName(2, true)).toBe('Nhận biết');
  });
});
