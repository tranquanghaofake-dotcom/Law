import { describe, expect, it } from 'vitest';
import type { Concept } from '$lib/content/types';
import { compareConcepts, firstComparable } from '$lib/engine/compare';

const c = (id: string, o: Partial<Concept> = {}): Concept => ({
  id, subject: 'hinh-su', chapter: 'c1', term: `Khái niệm ${id}`, definition: `Định nghĩa của ${id}.`, plain: 'p', example: `Ví dụ của ${id}.`,
  source: { kind: 'statute', cite: 'Điều 1' }, checked: '2026-11-01', confusables: [], keywords: [`dấu hiệu ${id} 1`, `dấu hiệu ${id} 2`], items: [], ...o,
});

describe('compareConcepts', () => {
  it('hai cột, hàng = định nghĩa / dấu hiệu / ví dụ, đúng nguyên văn dữ liệu', () => {
    const r = compareConcepts(c('a'), c('b'))!;
    expect(r.a.term).toBe('Khái niệm a');
    expect(r.rows.map((x) => x.label)).toEqual(['Định nghĩa', 'Dấu hiệu', 'Ví dụ']);
    expect(r.rows[0]).toMatchObject({ kind: 'text', a: 'Định nghĩa của a.', b: 'Định nghĩa của b.' });
    expect(r.rows[1]).toMatchObject({ kind: 'signs', a: ['dấu hiệu a 1', 'dấu hiệu a 2'], b: ['dấu hiệu b 1', 'dấu hiệu b 2'] });
  });
  it('điểm giống nêu trước: cùng chương / cùng môn / khác môn thì không có', () => {
    expect(compareConcepts(c('a'), c('b'))!.common).toBe('Cùng chương, cùng môn.');
    expect(compareConcepts(c('a'), c('b', { chapter: 'c2' }))!.common).toBe('Cùng môn.');
    expect(compareConcepts(c('a'), c('b', { subject: 'dan-su' }))!.common).toBeNull();
  });
  it('định nghĩa dài được rút gọn nhưng vẫn là phần đầu nguyên văn', () => {
    const long = 'Câu một dài. '.repeat(40);
    const r = compareConcepts(c('a', { definition: long }), c('b'))!;
    const t = (r.rows[0] as { a: string }).a;
    expect(t.length).toBeLessThanOrEqual(215);
    expect(long.startsWith(t.replace(/ \(…\)$| …$/, ''))).toBe(true);
  });
  it('thiếu dữ liệu một bên thì bỏ hàng đó; không còn hàng nào hoặc cùng một khái niệm thì null', () => {
    const r = compareConcepts(c('a'), c('b', { example: '' }))!;
    expect(r.rows.map((x) => x.label)).toEqual(['Định nghĩa', 'Dấu hiệu']);
    expect(compareConcepts(c('a'), c('a'))).toBeNull();
    expect(compareConcepts(c('a', { definition: '', example: '', keywords: [] }), c('b', { definition: '', example: '', keywords: [] }))).toBeNull();
  });
});

describe('firstComparable', () => {
  it('lấy khái niệm dễ nhầm đầu tiên có trong pool và so sánh được', () => {
    const a = c('a', { confusables: ['x', 'b', 'd'] });
    expect(firstComparable(a, [c('d'), c('b')])?.id).toBe('b');
    expect(firstComparable(a, [c('zz')])).toBeNull();
  });
});
