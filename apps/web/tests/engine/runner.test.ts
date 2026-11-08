import { describe, expect, it } from 'vitest';
import type { Level } from '$lib/content/types';
import type { Step } from '$lib/engine/session';
import { answer, createRunner, isLast, mistakes, next, summary, unfixed } from '$lib/engine/runner';
import { RETRY_XP } from '$lib/game/xp';

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
    expect(s.done).toBe(false); // còn vòng sửa sai cho câu b
    expect(s.steps[s.i].meta?.kind).toBe('retry');
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

describe('runner đợt 6: câu vàng, combo dài nhất, vòng sửa sai', () => {
  const gold = (id: string): Step => ({ ...mcq(id), meta: { golden: true } });
  const play = (s: ReturnType<typeof createRunner>, oks: boolean[]) => {
    for (const ok of oks) s = next(answer(s, { correct: ok, elapsedMs: 1000 }).state);
    return s;
  };

  it('câu vàng đúng ×2 XP; sai thì 0; summary đếm số câu vàng đúng', () => {
    let s = createRunner([gold('a'), gold('b'), mcq('c')], levels);
    const r = answer(s, { correct: true, elapsedMs: 1000 });
    expect(r.xpGained).toBe(20);
    s = next(r.state);
    s = next(answer(s, { correct: false, elapsedMs: 1000 }).state);
    s = next(answer(s, { correct: true, elapsedMs: 1000 }).state);
    expect(summary(s).golden).toBe(1);
  });

  it('hết bước: câu sai được nối thêm MỘT lần với meta.kind = retry, không đổi bậc', () => {
    let s = createRunner(steps, levels);
    s = play(s, [false, true, false]);
    expect(s.done).toBe(false);
    expect(s.steps.length).toBe(5);
    expect(s.retryStart).toBe(3);
    expect(s.steps.slice(3).map((x) => [x.conceptId, x.meta?.kind, x.meta?.retryOf])).toEqual([['a', 'retry', 0], ['c', 'retry', 2]]);
    const lvBefore = { ...s.levels };
    const r = answer(s, { correct: true, elapsedMs: 1000 });
    expect(r.levelUp).toBe(false);
    expect(r.xpGained).toBe(RETRY_XP);
    expect(r.state.levels).toEqual(lvBefore);
    s = next(r.state);
    s = next(answer(s, { correct: false, elapsedMs: 1000 }).state);
    expect(s.done).toBe(true); // retry sai không nối tiếp vòng nữa
    const sum = summary(s);
    expect(sum).toMatchObject({ correct: 1, total: 3, retried: 2, fixed: 1 });
    expect(mistakes(s).map((m) => m.conceptId)).toEqual(['a', 'c']); // chỉ câu sai ở lượt chính
    expect(unfixed(s).map((m) => m.conceptId)).toEqual(['c']);
  });

  it('không câu sai thì không có vòng sửa sai', () => {
    const s = play(createRunner(steps, levels), [true, true, true]);
    expect(s.done).toBe(true);
    expect(s.steps.length).toBe(3);
    expect(summary(s)).toMatchObject({ retried: 0, fixed: 0 });
  });

  it('vòng sửa sai không làm đứt hay tăng combo; bestCombo là chuỗi đúng dài nhất', () => {
    let s = createRunner([mcq('a'), mcq('b'), mcq('c'), mcq('d')], {});
    s = play(s, [true, true, false, true]);
    expect(s.combo).toBe(1);
    s = play(s, [false]);
    expect(s.combo).toBe(1);
    expect(summary(s).bestCombo).toBe(2);
  });

  it('câu vàng bị sai: bản retry không còn là câu vàng', () => {
    let s = createRunner([gold('a'), mcq('b')], {});
    s = play(s, [false, true]);
    expect(s.steps[2].meta).toMatchObject({ kind: 'retry', golden: false });
  });

  it('vòng sửa sai tránh hai bước liền nhau cùng khái niệm khi có thể', () => {
    let s = createRunner([mcq('a'), mcq('b'), mcq('a'), mcq('c')], {});
    s = play(s, [false, true, false, false]);
    const ids = s.steps.slice(s.retryStart!).map((x) => x.conceptId);
    expect([...ids].sort()).toEqual(['a', 'a', 'c']);
    const order = s.steps.map((x) => x.conceptId);
    for (let k = 1; k < order.length; k++) expect(order[k]).not.toBe(order[k - 1]);
  });

  it('isLast: bước cuối thật sự (không còn vòng sửa sai phía sau)', () => {
    let s = createRunner([mcq('a'), mcq('b')], {});
    s = next(answer(s, { correct: false, elapsedMs: 1 }).state);
    expect(isLast(answer(s, { correct: true, elapsedMs: 1 }).state)).toBe(false); // còn câu a để sửa
    expect(isLast(answer(createRunner([mcq('a')], {}), { correct: true, elapsedMs: 1 }).state)).toBe(true);
    expect(isLast(answer(createRunner([mcq('a')], {}), { correct: false, elapsedMs: 1 }).state)).toBe(false);
  });

  it('xpParts cộng dồn theo nguồn, tổng bằng xp', () => {
    let s = createRunner([gold('a'), mcq('b')], {});
    s = play(s, [true, false]);
    s = play(s, [true]);
    expect(s.xpParts).toEqual({ base: 10, combo: 0, golden: 10, retry: RETRY_XP, total: 20 + RETRY_XP });
    expect(summary(s).xpParts.total).toBe(s.xp);
  });

  it('intro không được nối vào vòng sửa sai', () => {
    const intro: Step = { conceptId: 'a', level: 0, item: { type: 'intro' } };
    const s = play(createRunner([intro, mcq('a')], { a: 0 }), [true, true]);
    expect(s.done).toBe(true);
  });
  it('giãn cách: cùng ngày với lần lên bậc trước thì đúng vẫn giữ bậc 3, ghi held', () => {
    const st = [{ ...mcq('a'), level: 3 as Level }];
    const r = answer(createRunner(st, { a: 3 }, { a: '2026-11-04' }, '2026-11-04'), { correct: true, elapsedMs: 2000 });
    expect(r.levelUp).toBe(false);
    expect(r.state.levels.a).toBe(3);
    expect(r.state.results[0].held).toBe(true);
    expect(r.xpGained).toBe(10); // vẫn có XP: câu đúng là câu đúng
    const r2 = answer(createRunner(st, { a: 3 }, { a: '2026-11-03' }, '2026-11-04'), { correct: true, elapsedMs: 2000 });
    expect(r2.state.levels.a).toBe(4);
  });
  it('giãn cách trong phiên: 2 câu cùng khái niệm ở bậc 3 → chỉ câu đầu bị giữ, không lên 2 lần', () => {
    let s = createRunner([mcq('a'), mcq('b'), mcq('a')], { a: 2, b: 0 }, {}, '2026-11-04');
    s = next(answer(s, { correct: true, elapsedMs: 1 }).state); // a 2→3 (upDay = hôm nay)
    s = next(answer(s, { correct: true, elapsedMs: 1 }).state);
    const r = answer(s, { correct: true, elapsedMs: 1 }); // a 3→4 bị giữ
    expect(r.state.levels.a).toBe(3);
    expect(summary(r.state).held).toBe(1);
  });
  it('tự chấm "Gần đúng": vẫn tính đúng (XP, combo) nhưng giữ bậc', () => {
    const r = answer(createRunner([mcq('a')], { a: 2 }, {}, '2026-11-04'), { correct: true, elapsedMs: 9000, selfGrade: 'gan' });
    expect(r.state.levels.a).toBe(2);
    expect(r.levelUp).toBe(false);
    expect(r.xpGained).toBe(10);
  });
});

describe('runner: vòng sửa sai ra câu khác (alt)', () => {
  const alt = (st: Step): Step | null => (st.conceptId === 'a' ? { ...st, item: { type: 'mcq', level: 1, q: 'câu khác', options: ['1', '2', '3', '4'], answer: 2, explain: 'e' } } : null);
  const play = (oks: boolean[], a?: (s: Step) => Step | null) => {
    let s = createRunner(steps, levels);
    for (const ok of oks) s = next(answer(s, { correct: ok, elapsedMs: 1000 }).state, a);
    return s;
  };
  it('có câu thay thế → bước sửa sai dùng câu đó, vẫn là retry, giữ retryOf, không câu vàng', () => {
    const s = play([false, true, false], alt);
    const [ra, rc] = s.steps.slice(3);
    expect(ra.item.type === 'mcq' && ra.item.q).toBe('câu khác');
    expect(ra.meta).toMatchObject({ kind: 'retry', retryOf: 0, golden: false });
    expect(rc.item.type === 'mcq' && rc.item.q).toBe('q'); // alt trả null → lặp câu cũ
    expect(rc.meta).toMatchObject({ kind: 'retry', retryOf: 2 });
  });
  it('không truyền alt → như cũ (lặp đúng câu sai)', () => {
    const s = play([false, true, false]);
    expect(s.steps.slice(3).every((x) => x.item.type === 'mcq' && x.item.q === 'q')).toBe(true);
  });
  it('câu thay thế đúng khái niệm: vòng sửa sai vẫn tính "sửa được" theo câu gốc', () => {
    let s = play([false, true, true], alt);
    s = next(answer(s, { correct: true, elapsedMs: 1000 }).state, alt);
    expect(summary(s).fixed).toBe(1);
    expect(unfixed(s)).toHaveLength(0);
  });
});

