import { describe, expect, it } from 'vitest';
import { SHELVES, OTHER_SHELF, shelfOf, orderedSubjects, byRecency, lastStudiedBySubject, contrastRatio } from '$lib/ui/shelves';

const ids = (xs: { id: string }[]) => xs.map((x) => x.id);
const s = (id: string) => ({ id, title: 'Luật ' + id });

describe('kệ môn (nhóm ngành + thứ tự chương trình học)', () => {
  it('mỗi môn thuộc đúng một kệ; môn lạ rơi vào kệ Khác', () => {
    const all = SHELVES.flatMap((k) => k.subjects);
    expect(new Set(all).size).toBe(all.length);
    expect(shelfOf('hien-phap').id).toBe('cong-phap');
    expect(shelfOf('dan-su-2').id).toBe('dan-su');
    expect(shelfOf('mon-la')).toBe(OTHER_SHELF);
  });
  it('orderedSubjects: theo kệ rồi theo vị trí trong kệ; môn lạ cuối, giữ thứ tự tên file', () => {
    const input = [s('an-sinh-xa-hoi'), s('zz-la'), s('dan-su-2'), s('dan-su'), s('aa-la'), s('ly-luan-nn-pl'), s('hien-phap')];
    expect(ids(orderedSubjects(input))).toEqual(['ly-luan-nn-pl', 'hien-phap', 'dan-su', 'dan-su-2', 'an-sinh-xa-hoi', 'zz-la', 'aa-la']);
  });
  it('orderedSubjects không đổi mảng gốc', () => {
    const input = [s('hien-phap'), s('ly-luan-nn-pl')];
    orderedSubjects(input);
    expect(ids(input)).toEqual(['hien-phap', 'ly-luan-nn-pl']);
  });
  it('byRecency: môn học gần nhất lên đầu, môn chưa học theo thứ tự chương trình', () => {
    const input = orderedSubjects([s('hien-phap'), s('ly-luan-nn-pl'), s('dan-su'), s('hinh-su')]);
    const out = byRecency(input, { 'dan-su': 200, 'hinh-su': 300 });
    expect(ids(out)).toEqual(['hinh-su', 'dan-su', 'ly-luan-nn-pl', 'hien-phap']);
  });
  it('lastStudiedBySubject: lấy updatedAt lớn nhất của khái niệm đã học (bậc > 0), bỏ khái niệm đã xoá', () => {
    const known = new Set(['a', 'b', 'c']);
    const out = lastStudiedBySubject([
      { subject: 'hp', conceptId: 'a', level: 1, updatedAt: 10 },
      { subject: 'hp', conceptId: 'b', level: 3, updatedAt: 50 },
      { subject: 'hp', conceptId: 'zzz', level: 6, updatedAt: 999 },
      { subject: 'ds', conceptId: 'c', level: 0, updatedAt: 70 },
    ], known);
    expect(out).toEqual({ hp: 50 });
  });
  it('màu 8 kệ đạt AA (≥ 4,5:1) với chữ kem trên bìa', () => {
    for (const k of SHELVES) expect(contrastRatio(k.color, '#F7F0DE'), k.id).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
  });
});
