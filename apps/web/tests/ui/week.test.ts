import { describe, expect, it } from 'vitest';
import { weekFlags } from '$lib/ui/week';

describe('weekFlags', () => {
  it('7 cờ từ 6 ngày trước tới hôm nay, theo ngày địa phương', () => {
    const now = new Date(2026, 10, 1, 9);
    expect(weekFlags(new Set(['2026-11-01', '2026-10-28']), now)).toEqual([false, false, true, false, false, false, true]);
  });
});
