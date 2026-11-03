import { describe, expect, it } from 'vitest';
import type { Subject } from '$lib/content/types';
import { chapterCounts, subjectSummary } from '$lib/ui/subjectSummary';

const subject: Subject = { id: 'hp', title: 'HP', short: 'HP', chapters: [
  { id: 'c1', title: 'C1', lessons: [{ id: 'l1', title: 'L1', concepts: ['a', 'b'] }, { id: 'l2', title: 'L2', concepts: ['c', 'd', 'e'] }] },
  { id: 'c2', title: 'C2', lessons: [{ id: 'l3', title: 'L3', concepts: ['f', 'g', 'h', 'i', 'j'] }] },
] };

describe('subjectSummary', () => {
  it('đếm chương/đợt/khái niệm, % thuần thục, phẩm hàm hiện tại và số khái niệm cần thêm để lên phẩm kế', () => {
    const s = subjectSummary(subject, { a: 5, b: 6 });
    expect(s).toMatchObject({ chapters: 2, lessons: 3, total: 10, mastered: 2, percent: 20 });
    expect(s.grade).toBe('Bát phẩm'); // 20 % → bậc 2/9
    expect(s.nextGrade).toBe('Thất phẩm');
    expect(s.needForNext).toBeGreaterThan(0);
  });
  it('môn rỗng không chia cho 0', () => {
    const s = subjectSummary({ ...subject, chapters: [] }, {});
    expect(s).toMatchObject({ total: 0, percent: 0, grade: null });
  });
});

describe('chapterCounts', () => {
  it('đếm khái niệm đạt ngưỡng thuần thục / tổng theo từng chương', () => {
    const c = chapterCounts(subject, { a: 5, b: 6, c: 4, f: 6 });
    expect(c).toEqual({ c1: { mastered: 2, total: 5 }, c2: { mastered: 1, total: 5 } });
  });
});
