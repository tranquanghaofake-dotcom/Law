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

import { SPACED_FROM, stepLevel } from '$lib/engine/progress';

describe('stepLevel — bậc ≥ 4 phải qua giãn cách', () => {
  const d1 = '2026-11-04', d2 = '2026-11-05', d3 = '2026-11-06';
  it('bậc 1–3 lên tự do trong cùng ngày', () => {
    let s = { level: 0 as const, upDay: undefined as string | undefined } as { level: number; upDay?: string };
    for (let k = 0; k < 3; k++) s = stepLevel(s.level as never, true, s.upDay, d1);
    expect(s.level).toBe(3);
  });
  it(`lên bậc ${SPACED_FROM} cần khác ngày với lần lên bậc trước`, () => {
    expect(stepLevel(3, true, d1, d1)).toEqual({ level: 3, upDay: d1, held: true });
    expect(stepLevel(3, true, d1, d2)).toEqual({ level: 4, upDay: d2, held: false });
  });
  it('học dồn: đúng liên tục trong 1 ngày không quá bậc 3; thuần thục (5) cần ≥ 3 ngày', () => {
    let s: { level: number; upDay?: string } = { level: 0 };
    for (let k = 0; k < 10; k++) s = stepLevel(s.level as never, true, s.upDay, d1);
    expect(s.level).toBe(3);
    for (let k = 0; k < 5; k++) s = stepLevel(s.level as never, true, s.upDay, d2);
    expect(s.level).toBe(4);
    s = stepLevel(s.level as never, true, s.upDay, d3);
    expect(s.level).toBe(5);
  });
  it('sai vẫn tụt 1 bậc, không đổi ngày lên bậc', () => {
    expect(stepLevel(4, false, d1, d2)).toEqual({ level: 3, upDay: d1, held: false });
  });
  it('dữ liệu cũ không có upDay: được lên bậc', () => {
    expect(stepLevel(4, true, undefined, d1)).toEqual({ level: 5, upDay: d1, held: false });
  });
});

describe('stepLevel — tự chấm "Gần đúng"', () => {
  it('giữ nguyên bậc (không lên, không tụt), không đổi ngày lên bậc', () => {
    expect(stepLevel(4, true, '2026-11-01', '2026-11-04', true)).toEqual({ level: 4, upDay: '2026-11-01', held: false });
  });
});
