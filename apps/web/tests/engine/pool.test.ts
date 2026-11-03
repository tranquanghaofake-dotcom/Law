import { describe, expect, it } from 'vitest';
import type { Concept, Subject } from '$lib/content/types';
import { lessonPoolIds, reviewPoolIds } from '$lib/engine/pool';

const C = (id: string, chapter: string, confusables: string[] = [], subject = 's'): Concept => ({
  id, subject, chapter, term: id, definition: 'd', plain: 'p', example: 'e', source: { kind: 'statute', cite: 'x' }, checked: '2026-11-01', confusables, keywords: [], items: [],
});
const subject: Subject = {
  id: 's', title: 'S', short: 'S',
  chapters: [
    { id: 'c1', title: '1', lessons: [{ id: 'l1', title: '', concepts: ['a', 'b'] }, { id: 'l2', title: '', concepts: ['c', 'd'] }, { id: 'l3', title: '', concepts: ['e', 'f', 'g'] }] },
    { id: 'c2', title: '2', lessons: [{ id: 'l4', title: '', concepts: ['x', 'y'] }] },
  ],
};

describe('lessonPoolIds', () => {
  it('dễ nhầm trước, rồi cùng chương gần đợt nhất, bỏ khái niệm đã có, giới hạn', () => {
    const cs = [C('c', 'c1', ['x']), C('d', 'c1', ['a', 'c'])];
    expect(lessonPoolIds(subject, cs)).toEqual(['x', 'a', 'b', 'e', 'f', 'g']);
    expect(lessonPoolIds(subject, cs, 3)).toEqual(['x', 'a', 'b']);
  });
});

describe('reviewPoolIds', () => {
  it('khái niệm dễ nhầm chưa nạp, theo môn, không trùng', () => {
    const cs = [C('a', 'c1', ['b', 'z']), C('b', 'c1', ['z']), C('a', 'k', ['m'], 't')];
    expect(reviewPoolIds(cs)).toEqual([{ subject: 's', id: 'z' }, { subject: 't', id: 'm' }]);
  });
});
