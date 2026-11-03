import { describe, expect, it } from 'vitest';
import type { Step } from '$lib/engine/step';
import { interleave, spreadByConcept, typeKey } from '$lib/engine/arrange';
import { mulberry32 } from '$lib/engine/rng';

const st = (id: string, type: 'mcq' | 'cloze' | 'recall', gen?: 'def-term'): Step =>
  type === 'mcq'
    ? { conceptId: id, level: 1, item: { type: 'mcq', level: 1, q: id, options: ['1', '2', '3', '4'], answer: 0, explain: '' }, meta: gen ? { gen } : undefined }
    : type === 'cloze'
      ? { conceptId: id, level: 3, item: { type: 'cloze', level: 3, text: `${id} {{x}}` } }
      : { conceptId: id, level: 5, item: { type: 'recall', level: 5, q: id, model: 'm', keywords: ['a', 'b', 'c'] } };

const noAdjacent = (s: Step[]) => s.every((x, k) => k === 0 || x.conceptId !== s[k - 1].conceptId);

describe('interleave', () => {
  it('giữ thứ tự trong từng khái niệm và không để hai bước liền cùng khái niệm', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const queues = ['a', 'b', 'c', 'd'].map((id) => [st(id, 'mcq'), st(id, 'cloze')]);
      const out = interleave(queues, { rng: mulberry32(seed) });
      expect(out.length).toBe(8);
      expect(noAdjacent(out)).toBe(true);
      for (const id of ['a', 'b', 'c', 'd']) {
        const idx = out.flatMap((x, k) => (x.conceptId === id ? [k] : []));
        expect(out[idx[0]].item.type).toBe('mcq');
        expect(out[idx[1]].item.type).toBe('cloze');
      }
    }
  });
  it('xen kẽ dạng: không dồn hết một dạng thành khối khi còn lựa chọn', () => {
    const queues = ['a', 'b', 'c', 'd', 'e'].map((id) => [st(id, 'mcq'), st(id, 'cloze')]);
    const out = interleave(queues, { rng: mulberry32(7) });
    const sameRun = out.filter((x, k) => k > 0 && typeKey(x) === typeKey(out[k - 1])).length;
    expect(sameRun).toBeLessThanOrEqual(3);
  });
  it('bất khả thi (một khái niệm chiếm đa số) thì vẫn trả đủ bước', () => {
    const out = interleave([[st('a', 'mcq'), st('a', 'cloze'), st('a', 'recall')], [st('b', 'mcq')]]);
    expect(out.map((x) => x.conceptId)).toEqual(['a', 'b', 'a', 'a']);
  });
  it('bước đầu tránh prevConcept', () => {
    const out = interleave([[st('a', 'mcq')], [st('b', 'mcq')]], { prevConcept: 'a' });
    expect(out[0].conceptId).toBe('b');
  });
});

describe('spreadByConcept', () => {
  it('tất định, tránh liền nhau', () => {
    const out = spreadByConcept([st('a', 'mcq'), st('a', 'cloze'), st('c', 'mcq')], 'c');
    expect(out.map((x) => x.conceptId)).toEqual(['a', 'c', 'a']);
  });
});

describe('mulberry32', () => {
  it('cùng seed cùng dãy, trong [0, 1)', () => {
    const a = mulberry32(42), b = mulberry32(42);
    for (let k = 0; k < 20; k++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});
