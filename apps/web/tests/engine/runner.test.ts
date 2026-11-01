import { describe, expect, it } from 'vitest';
import type { Level } from '$lib/content/types';
import type { Step } from '$lib/engine/session';
import { answer, createRunner, mistakes, next, summary } from '$lib/engine/runner';

const mcq = (id: string): Step => ({ conceptId: id, level: 1, item: { type: 'mcq', level: 1, q: 'q', options: ['1', '2', '3', '4'], answer: 0, explain: 'e' } });
const steps = [mcq('a'), mcq('b'), mcq('c')];
const levels: Record<string, Level> = { a: 0, b: 0, c: 0 };

describe('runner', () => {
  it('đúng-sai-đúng → 20 XP, combo về 0 sau sai, 2 khái niệm lên bậc', () => {
    let s = createRunner(steps, levels);
    let r = answer(s, { correct: true, elapsedMs: 2000 });
    expect(r.xpGained).toBe(10); expect(r.levelUp).toBe(true); expect(r.sfx).toBe('correct');
    s = next(r.state);
    r = answer(s, { correct: false, elapsedMs: 2000 });
    expect(r.xpGained).toBe(0); expect(r.state.combo).toBe(0); expect(r.sfx).toBe('wrong'); expect(r.levelUp).toBe(false);
    s = next(r.state);
    r = answer(s, { correct: true, elapsedMs: 2000 });
    s = next(r.state);
    expect(s.done).toBe(true);
    expect(s.xp).toBe(20);
    const sum = summary(s);
    expect(sum.correct).toBe(2); expect(sum.total).toBe(3);
    expect(sum.levelUps.map((l) => l.conceptId)).toEqual(['a', 'c']);
  });
  it('combo nhân XP: câu thứ 6 liên tiếp được 15', () => {
    let s = createRunner(Array.from({ length: 6 }, (_, i) => mcq('k' + i)), {});
    let gained = 0;
    for (let i = 0; i < 6; i++) { const r = answer(s, { correct: true, elapsedMs: 1000 }); gained = r.xpGained; s = next(r.state); }
    expect(gained).toBe(15);
  });
  it('intro không tính XP, không lên bậc', () => {
    const intro: Step = { conceptId: 'a', level: 0, item: { type: 'intro' } };
    const r = answer(createRunner([intro], { a: 0 }), { correct: true, elapsedMs: 500 });
    expect(r.xpGained).toBe(0);
    expect(r.levelUp).toBe(false);
    expect(r.state.results[0].levelAfter).toBe(0);
  });
  it('mistakes: chỉ các bước trả lời sai, đúng thứ tự, kèm item', () => {
    let s = createRunner(steps, levels);
    for (const ok of [false, true, false]) s = next(answer(s, { correct: ok, elapsedMs: 1000 }).state);
    expect(mistakes(s).map((m) => m.conceptId)).toEqual(['a', 'c']);
    expect(mistakes(s)[0].item.type).toBe('mcq');
  });
});
