import { describe, expect, it } from 'vitest';
import type { Concept, Level } from '$lib/content/types';
import { buildLearnSession, buildReviewSession, clozeModeFor, passFor, pickItem } from '$lib/engine/session';

function concept(id: string): Concept {
  return {
    id, subject: 'hp', chapter: 'c', term: id, definition: 'd', plain: 'p', example: 'e',
    source: { kind: 'statute', cite: 'Đ1' }, checked: '2026-11-01', confusables: [], keywords: ['a', 'b', 'c'],
    items: [
      { type: 'mcq', level: 1, q: 'q1', options: ['1', '2', '3', '4'], answer: 0, explain: 'e' },
      { type: 'pair', level: 2, left: id, right: 'x', cases: [{ text: 't', answer: 'left' }, { text: 'u', answer: 'right' }], explain: 'e' },
      { type: 'cloze', level: 3, text: 'A {{b}}' },
      { type: 'case', level: 4, q: 'q4', options: ['1', '2', '3', '4'], answer: 1, explain: 'e' },
      { type: 'recall', level: 5, q: 'q5', model: 'm', keywords: ['a', 'b', 'c'] },
    ],
  };
}
// rng tất định
const rng = () => 0.5;
const ids = ['a', 'b', 'c', 'd', 'e'];
const concepts = ids.map(concept);
const levels = (l: Level) => Object.fromEntries(ids.map((i) => [i, l])) as Record<string, Level>;

describe('passFor', () => {
  it('bậc thấp nhất 0 → pass 1; 1–2 → pass 2; ≥3 → pass 3', () => {
    expect(passFor({ a: 0, b: 3 })).toBe(1);
    expect(passFor({ a: 1, b: 2 })).toBe(2);
    expect(passFor({ a: 2 })).toBe(2);
    expect(passFor({ a: 3, b: 6 })).toBe(3);
  });
});

describe('buildLearnSession', () => {
  it('pass 1: 5 intro + 5 bậc 1, intro đứng trước bậc 1 của chính nó', () => {
    const steps = buildLearnSession(concepts, levels(0), rng);
    expect(steps.length).toBe(10);
    expect(steps.filter((s) => s.item.type === 'intro').length).toBe(5);
    for (const id of ids) {
      const intro = steps.findIndex((s) => s.conceptId === id && s.item.type === 'intro');
      const mcq = steps.findIndex((s) => s.conceptId === id && s.item.type === 'mcq');
      expect(intro).toBeGreaterThanOrEqual(0);
      expect(mcq).toBeGreaterThan(intro);
    }
  });
  it('pass 2: 5 bậc 2 rồi 5 bậc 3', () => {
    const steps = buildLearnSession(concepts, levels(1), rng);
    expect(steps.map((s) => s.level)).toEqual([2, 2, 2, 2, 2, 3, 3, 3, 3, 3]);
    expect(steps.slice(0, 5).every((s) => s.item.type === 'pair')).toBe(true);
    expect(steps.slice(5).every((s) => s.item.type === 'cloze')).toBe(true);
  });
  it('pass 3: 5 bậc 4 rồi 5 bậc 5', () => {
    const steps = buildLearnSession(concepts, levels(3), rng);
    expect(steps.map((s) => s.level)).toEqual([4, 4, 4, 4, 4, 5, 5, 5, 5, 5]);
  });
});

describe('buildReviewSession', () => {
  it('giới hạn 20 bước', () => {
    const many = Array.from({ length: 25 }, (_, i) => concept('c' + i));
    const lv = Object.fromEntries(many.map((c) => [c.id, 6])) as Record<string, Level>;
    expect(buildReviewSession(many, lv, rng).length).toBe(20);
  });
});

describe('pickItem', () => {
  it('bậc 6 trả về item có level 1–5', () => {
    const it6 = pickItem(concepts[0], 6, rng);
    expect(it6.level).toBeGreaterThanOrEqual(1);
    expect(it6.level).toBeLessThanOrEqual(5);
  });
  it('thiếu loại ở bậc yêu cầu thì lấy bậc gần nhất thấp hơn', () => {
    const c = concept('z');
    c.items = c.items.filter((i) => i.level !== 5);
    expect(pickItem(c, 5, rng).level).toBe(4);
  });
});

describe('đợt có bậc lẫn lộn (I3)', () => {
  it('khái niệm bậc cao không nhận intro và không bị kéo về bậc thấp', () => {
    const lv = { a: 0, b: 3, c: 0, d: 0, e: 6 } as Record<string, Level>;
    const steps = buildLearnSession(concepts, lv, rng);
    expect(steps.filter((s) => s.item.type === 'intro').map((s) => s.conceptId).sort()).toEqual(['a', 'c', 'd']);
    expect(steps.find((s) => s.conceptId === 'b' && s.item.type !== 'intro')!.level).toBe(3);
    const e = steps.find((s) => s.conceptId === 'e')!;
    expect(e.level).toBeGreaterThanOrEqual(1);
    expect(e.level).toBeLessThanOrEqual(5);
  });
  it('clozeModeFor: bậc < 3 ngân hàng từ, từ bậc 3 gõ', () => {
    expect(clozeModeFor(2)).toBe('bank');
    expect(clozeModeFor(3)).toBe('type');
    expect(clozeModeFor(6)).toBe('type');
  });
});
