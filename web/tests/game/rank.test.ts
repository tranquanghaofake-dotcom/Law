import { describe, expect, it } from 'vitest';
import { gradeFor, RANKS, rankFor } from '$lib/game/rank';

describe('rankFor', () => {
  it('8 bậc khoa cử theo mốc XP', () => {
    expect(RANKS.map((r) => r.xp)).toEqual([0, 300, 1000, 3000, 7000, 15000, 30000, 60000]);
    expect(rankFor(0)).toMatchObject({ rank: 'Thí sinh', tier: 'III' });
    expect(rankFor(299)).toMatchObject({ rank: 'Thí sinh', tier: 'I' });
    expect(rankFor(300)).toMatchObject({ rank: 'Tú tài', tier: 'III', nextXp: 1000 });
    expect(rankFor(60000)).toMatchObject({ rank: 'Trạng nguyên', nextXp: null, progress: 1 });
  });
  it('progress là tỉ lệ tới bậc kế', () => {
    expect(rankFor(150).progress).toBeCloseTo(0.5);
  });
});

describe('gradeFor', () => {
  it('null dưới 10%, Nhất phẩm từ 90%', () => {
    expect(gradeFor(0.05)).toBeNull();
    expect(gradeFor(0.1)).toBe('Cửu phẩm');
    expect(gradeFor(0.55)).toBe('Ngũ phẩm');
    expect(gradeFor(0.9)).toBe('Nhất phẩm');
    expect(gradeFor(1)).toBe('Nhất phẩm');
  });
});
