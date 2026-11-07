import { describe, expect, it } from 'vitest';
import { accuracyByLevel, weakLessons } from '$lib/engine/weak';

const now = Date.UTC(2026, 10, 7);
const day = 86_400_000;
const r = (conceptId: string, ok: boolean, level = 2, ago = 1) => ({ conceptId, rating: ok ? 3 : 1, level, at: now - ago * day });
const where = (id: string) => ({ a1: { subject: 'dan-su', lesson: 'L1' }, a2: { subject: 'dan-su', lesson: 'L1' }, b1: { subject: 'dan-su', lesson: 'L2' }, c1: { subject: 'hien-phap', lesson: 'H1' } } as Record<string, { subject: string; lesson: string }>)[id];

describe('weakLessons: bài hay sai nhất', () => {
  it('gom theo môn + bài, chỉ giữ bài ≥ 5 lượt, sắp tỷ lệ đúng tăng dần', () => {
    const rows = [
      ...Array.from({ length: 4 }, () => r('a1', false)), r('a2', true), // L1: 1/5
      ...Array.from({ length: 6 }, (_, i) => r('b1', i < 3)), // L2: 3/6
      r('c1', false), r('c1', false), // H1: 2 lượt — bỏ
    ];
    const w = weakLessons(rows, where, { now });
    expect(w.map((x) => x.lesson)).toEqual(['L1', 'L2']);
    expect(w[0]).toMatchObject({ subject: 'dan-su', lesson: 'L1', tries: 5, correct: 1 });
    expect(w[0].rate).toBeCloseTo(0.2);
  });
  it('hoà tỷ lệ thì bài nhiều lượt hơn đứng trước; tối đa 3 bài', () => {
    const many = (id: string, n: number, okN: number) => Array.from({ length: n }, (_, i) => r(id, i < okN));
    const wh = (id: string) => ({ subject: 's', lesson: id });
    const w = weakLessons([...many('x', 5, 1), ...many('y', 10, 2), ...many('z', 5, 4), ...many('t', 5, 3)], wh, { now });
    expect(w.map((x) => x.lesson)).toEqual(['y', 'x', 't']);
  });
  it('bỏ lượt quá 90 ngày và lượt không rõ khái niệm', () => {
    const rows = [...Array.from({ length: 5 }, () => r('a1', false, 2, 120)), ...Array.from({ length: 5 }, () => r('zz', false))];
    expect(weakLessons(rows, where, { now })).toEqual([]);
  });
});

describe('accuracyByLevel', () => {
  it('tỷ lệ đúng theo bậc, chỉ bậc có ≥ 5 lượt', () => {
    const rows = [...Array.from({ length: 5 }, (_, i) => r('a1', i < 4, 2)), r('a1', false, 4)];
    expect(accuracyByLevel(rows, { now })).toEqual([{ level: 2, tries: 5, correct: 4, rate: 0.8 }]);
  });
});
