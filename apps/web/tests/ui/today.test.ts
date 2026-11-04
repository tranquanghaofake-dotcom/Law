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
  it('đợt có khái niệm đã qua bậc 3 nhưng khái niệm khác chưa học → continue, không phải next', () => {
    expect(pickHeroState({ due: [], subjects, levels: { a: 3 } })).toMatchObject({ kind: 'continue', lesson: { id: 'hp-1' }, done: 1, total: 2 });
  });
  it('phút ôn không vượt trần 20 bước của phiên ôn', () => {
    const ids = Array.from({ length: 60 }, (_, i) => `k${i}`);
    const big: Subject = { id: 'ds', title: 'DS', short: 'DS', chapters: [{ id: 'c', title: 'C', lessons: [{ id: 'l', title: 'L', concepts: ids }] }] };
    const s = pickHeroState({ due: ids.map((conceptId) => ({ conceptId })), subjects: [big], levels: {} });
    expect(s).toMatchObject({ kind: 'due', count: 60, minutes: 8 });
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

describe('pickHeroState — ưu tiên môn học gần nhất (spec phần nhìn đợt 4, PR 1)', () => {
  const mk = (id: string, c: string[]): Subject => ({ id, title: 'Luật ' + id, short: id, chapters: [{ id: 'c', title: 'C', lessons: [{ id: id + '-1', title: 'Đợt 1', concepts: c }, { id: id + '-2', title: 'Đợt 2', concepts: c.map((x) => x + '2') }] }] });
  const asxh = mk('an-sinh-xa-hoi', ['a1', 'a2']);
  const hp = mk('hien-phap', ['h1', 'h2']);
  it('cả hai môn có đợt dở → continue môn học gần hơn dù đứng sau trong danh sách', () => {
    const s = pickHeroState({ due: [], subjects: [asxh, hp], levels: { a1: 1, h1: 1 }, recent: { 'an-sinh-xa-hoi': 10, 'hien-phap': 20 } });
    expect(s).toMatchObject({ kind: 'continue', subject: { id: 'hien-phap' } });
  });
  it('đợt 1 của Hiến pháp đã xong, An sinh chưa học → next là đợt 2 Hiến pháp, không nhảy sang An sinh', () => {
    const s = pickHeroState({ due: [], subjects: [asxh, hp], levels: { h1: 3, h2: 3 }, recent: { 'hien-phap': 20 } });
    expect(s).toMatchObject({ kind: 'next', subject: { id: 'hien-phap' }, lesson: { id: 'hien-phap-2' } });
  });
  it('không có recent → giữ thứ tự danh sách đưa vào', () => {
    expect(pickHeroState({ due: [], subjects: [asxh, hp], levels: {} })).toMatchObject({ kind: 'start', subject: { id: 'an-sinh-xa-hoi' } });
  });
});

describe('startAlternatives — Hôm nay lần đầu không lặp môn của thẻ chính (H-3)', () => {
  it('bỏ môn đã ở thẻ chính, lấy n môn kế theo thứ tự', async () => {
    const { startAlternatives } = await import('$lib/ui/today');
    const subs = ['a', 'b', 'c', 'd'].map((id) => ({ id })) as never[];
    expect(startAlternatives(subs, 'a', 3).map((x: { id: string }) => x.id)).toEqual(['b', 'c', 'd']);
    expect(startAlternatives(subs, 'c', 2).map((x: { id: string }) => x.id)).toEqual(['a', 'b']);
  });
});
