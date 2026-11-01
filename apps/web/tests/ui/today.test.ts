import { describe, expect, it } from 'vitest';
import type { Subject } from '$lib/content/types';
import { minutesFor, pickHeroState } from '$lib/ui/today';

const subject: Subject = {
  id: 'hp', title: 'Luật Hiến pháp', short: 'HP',
  chapters: [{ id: 'c1', title: 'Khái quát', lessons: [
    { id: 'hp-1', title: 'Hiến pháp là gì', concepts: ['a', 'b'] },
    { id: 'hp-2', title: 'Sửa đổi', concepts: ['c', 'd'] },
  ] }],
};
const subjects = [subject];

describe('pickHeroState', () => {
  it('có bài đến hạn → due với số lượng, tên và phút ước lượng', () => {
    const ids = Array.from({ length: 12 }, (_, i) => `k${i}`);
    const big: Subject = { id: 'ds', title: 'Dân sự', short: 'DS', chapters: [{ id: 'c', title: 'C', lessons: [{ id: 'l', title: 'L', concepts: ids }] }] };
    const due = ids.map((id, i) => ({ conceptId: id, term: `Khái niệm ${i}` }));
    const s = pickHeroState({ due, subjects: [big], levels: {}, dueSteps: 12 });
    expect(s).toMatchObject({ kind: 'due', count: 12, minutes: 5 });
    expect(s.kind === 'due' && s.terms).toEqual(['Khái niệm 0', 'Khái niệm 1', 'Khái niệm 2']);
  });
  it('không due, đợt dở (bậc 1–2) → continue với done/total', () => {
    const s = pickHeroState({ due: [], subjects, levels: { a: 2 } });
    expect(s).toMatchObject({ kind: 'continue', lesson: { id: 'hp-1' }, done: 0, total: 2 });
  });
  it('không due, đợt 1 xong → next là đợt 2 với phút ước lượng', () => {
    const s = pickHeroState({ due: [], subjects, levels: { a: 3, b: 3 } });
    expect(s).toMatchObject({ kind: 'next', lesson: { id: 'hp-2' } });
    expect(s.kind === 'next' && s.minutes).toBeGreaterThanOrEqual(1);
  });
  it('chưa có tiến độ → start đợt đầu', () => {
    expect(pickHeroState({ due: [], subjects, levels: {} })).toMatchObject({ kind: 'start', lesson: { id: 'hp-1' } });
  });
  it('học hết mọi đợt, không due → done', () => {
    expect(pickHeroState({ due: [], subjects, levels: { a: 3, b: 4, c: 5, d: 6 } })).toEqual({ kind: 'done' });
  });
  it('tiến độ của khái niệm không còn trong môn → start, không throw', () => {
    expect(pickHeroState({ due: [], subjects, levels: { zzz: 4 } })).toMatchObject({ kind: 'start', lesson: { id: 'hp-1' } });
  });
  it('khái niệm đến hạn không còn trong môn bị bỏ qua → start, không throw (Review Focus 1)', () => {
    const s = pickHeroState({ due: [{ conceptId: 'zzz' }], subjects, levels: { zzz: 4 } });
    expect(s).toMatchObject({ kind: 'start', lesson: { id: 'hp-1' } });
    const mixed = pickHeroState({ due: [{ conceptId: 'zzz' }, { conceptId: 'a', term: 'A' }], subjects, levels: { a: 4, zzz: 4 } });
    expect(mixed).toMatchObject({ kind: 'due', count: 1, terms: ['A'] });
  });
  it('không có môn nào → done', () => {
    expect(pickHeroState({ due: [], subjects: [], levels: {} })).toEqual({ kind: 'done' });
  });
});

describe('minutesFor', () => {
  it('25 giây một bước, làm tròn, tối thiểu 1', () => {
    expect(minutesFor(1)).toBe(1);
    expect(minutesFor(12)).toBe(5);
    expect(minutesFor(14)).toBe(6);
  });
});
