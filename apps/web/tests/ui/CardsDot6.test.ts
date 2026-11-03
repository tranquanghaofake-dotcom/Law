import { afterEach, describe, expect, it, vi } from 'vitest';
import { tick } from 'svelte';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import CardMcq from '$lib/ui/cards/CardMcq.svelte';
import CardMatch from '$lib/ui/cards/CardMatch.svelte';
import CardSort from '$lib/ui/cards/CardSort.svelte';
import Feedback from '$lib/ui/Feedback.svelte';
import SessionBar from '$lib/ui/SessionBar.svelte';
import SessionEnd from '$lib/ui/SessionEnd.svelte';
import { cardFor } from '$lib/ui/cards';
import { barMarks } from '$lib/ui/session/marks';
import { xpSources } from '$lib/ui/session/xpSources';
import { rankFor } from '$lib/game/rank';
import type { Concept, ItemMcq } from '$lib/content/types';
import type { MatchItem, SortItem, Step } from '$lib/engine/session';

const concept: Concept = {
  id: 'a', subject: 'hp', chapter: 'c', term: 'Hiến pháp', definition: 'd', plain: 'p', example: 'e',
  source: { kind: 'statute', cite: 'Điều 119' }, checked: '2026-11-01', confusables: [], keywords: ['a', 'b', 'c'], items: [],
};
const rng = () => 0.99; // shuffle giữ nguyên thứ tự
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('CardMcq đợt 6', () => {
  const two: ItemMcq = { type: 'mcq', level: 1, q: 'Câu?', options: ['Đúng', 'Sai'], answer: 0, explain: 'e' };
  it('hỗ trợ 2 phương án: chỉ A–B, phím 3 không làm gì', async () => {
    const onanswer = vi.fn();
    render(CardMcq, { props: { concept, item: two, rng, onanswer } });
    expect(screen.getAllByRole('button', { name: /^[A-D]\./ }).length).toBe(2);
    await fireEvent.keyDown(window, { key: '3' });
    expect(onanswer).not.toHaveBeenCalled();
    await fireEvent.keyDown(window, { key: '1' });
    expect(onanswer).toHaveBeenCalledTimes(1);
  });
  it('def-term / example-concept không hiện tên khái niệm ở kicker', () => {
    for (const gen of ['def-term', 'example-concept'] as const) {
      const { container } = render(CardMcq, { props: { concept, item: two, rng, onanswer: () => {}, meta: { gen, kicker: 'Định nghĩa → thuật ngữ' } } });
      const k = container.querySelector('.kicker')!.textContent!;
      expect(k).toBe('Định nghĩa → thuật ngữ');
      expect(k).not.toContain('Hiến pháp');
      cleanup();
    }
  });
  it('không có meta: giữ kicker cũ có tên khái niệm', () => {
    const { container } = render(CardMcq, { props: { concept, item: two, rng, onanswer: () => {} } });
    expect(container.querySelector('.kicker')!.textContent).toContain('Hiến pháp');
  });
});

describe('CardMatch', () => {
  const item: MatchItem = { type: 'match', level: 2, explain: 'e', pairs: [
    { conceptId: 'a', term: 'Alpha', text: 'mô tả alpha' }, { conceptId: 'b', term: 'Beta', text: 'mô tả beta' },
    { conceptId: 'c', term: 'Gamma', text: 'mô tả gamma' }, { conceptId: 'd', term: 'Delta', text: 'mô tả delta' } ] };
  const click = (name: RegExp) => fireEvent.click(screen.getByRole('button', { name }));
  it('đã đăng ký trong cardFor', () => { expect(cardFor(item)).toBe(CardMatch); });
  it('ghép đủ không sai → đúng; khoá cặp (nút bị vô hiệu)', async () => {
    vi.useFakeTimers();
    const onanswer = vi.fn();
    render(CardMatch, { props: { concept, item, rng, onanswer } });
    for (const n of ['Alpha', 'Beta', 'Gamma', 'Delta']) { await click(new RegExp(n)); await click(new RegExp(`mô tả ${n.toLowerCase()}`)); }
    expect((screen.getByRole('button', { name: /Alpha/ }) as HTMLButtonElement).disabled).toBe(true);
    vi.advanceTimersByTime(700);
    expect(onanswer).toHaveBeenCalledWith(expect.objectContaining({ correct: true, chosen: '4/4' }));
  });
  it('sai 1 lần vẫn đúng, sai 2 lần là sai; đi được bằng bàn phím (1–4, A–D)', async () => {
    vi.useFakeTimers();
    const onanswer = vi.fn();
    render(CardMatch, { props: { concept, item, rng, onanswer } });
    // thứ tự không xáo: thuật ngữ 1..4 = a..d, mô tả A..D = a..d
    const key = (k: string) => fireEvent.keyDown(window, { key: k });
    await key('1'); await key('B'); vi.advanceTimersByTime(500); // sai lần 1
    await key('1'); await key('C'); vi.advanceTimersByTime(500); // sai lần 2
    for (const [t, d] of [['1', 'A'], ['2', 'B'], ['3', 'C'], ['4', 'D']]) { await key(t); await key(d); }
    vi.advanceTimersByTime(700);
    expect(onanswer).toHaveBeenCalledWith(expect.objectContaining({ correct: false, chosen: '3/4' }));
  });
});

describe('CardSort', () => {
  const item: SortItem = { type: 'sort', level: 2, left: 'Cột trái', right: 'Cột phải', explain: 'e', cases: [
    { text: 'tình huống 1', answer: 'left' }, { text: 'tình huống 2', answer: 'right' }, { text: 'tình huống 3', answer: 'left' }, { text: 'tình huống 4', answer: 'right' } ] };
  it('đã đăng ký trong cardFor', () => { expect(cardFor(item)).toBe(CardSort); });
  it('xếp bằng phím 1–2: thấy thẻ đã xếp trong cột; xong báo kết quả', async () => {
    vi.useFakeTimers();
    const onanswer = vi.fn();
    const { container } = render(CardSort, { props: { concept, item, rng, onanswer } });
    for (const k of ['1', '2', '1', '2']) { await fireEvent.keyDown(window, { key: k }); vi.advanceTimersByTime(900); }
    await tick();
    expect(container.querySelectorAll('.sort-col')[0].querySelectorAll('li').length).toBe(2);
    expect(container.querySelectorAll('.sort-col')[1].querySelectorAll('li').length).toBe(2);
    expect(onanswer).toHaveBeenCalledWith(expect.objectContaining({ correct: true, chosen: '4/4' }));
  });
  it('xếp sai: thẻ rơi vào cột đúng, đánh dấu sai, kết quả không đúng', async () => {
    vi.useFakeTimers();
    const onanswer = vi.fn();
    const { container } = render(CardSort, { props: { concept, item, rng, onanswer } });
    for (const k of ['2', '2', '1', '2']) { await fireEvent.keyDown(window, { key: k }); vi.advanceTimersByTime(900); }
    await tick();
    expect(container.querySelectorAll('.sort-col')[0].querySelectorAll('li.bad').length).toBe(1);
    expect(onanswer).toHaveBeenCalledWith(expect.objectContaining({ correct: false, chosen: '3/4' }));
  });
  it('chạm nút cột cũng xếp được', async () => {
    const { container } = render(CardSort, { props: { concept, item, rng, onanswer: () => {} } });
    await fireEvent.click(screen.getByRole('button', { name: /Cột trái/ }));
    expect(container.querySelector('.sort-case.ok')).toBeTruthy();
  });
});

describe('Feedback đợt 6', () => {
  const item: ItemMcq = { type: 'mcq', level: 1, q: 'q', options: ['Đúng', 'Sai'], answer: 0, explain: 'Giải thích.' };
  it('hiện XP, câu vàng, nhãn lên bậc; vòng sửa sai có ghi chú', () => {
    const { container } = render(Feedback, { props: { result: { correct: true, elapsedMs: 1 }, item, concept, onnext: () => {}, xp: 20, golden: true, levelTo: 3, retry: true } });
    expect(container.querySelector('.xp-chip')!.textContent).toContain('+20 XP');
    expect(container.querySelector('.xp-chip.gold')).toBeTruthy();
    expect(container.querySelector('.level-chip')!.textContent).toContain('Lên bậc 3');
    expect(container.textContent).toContain('không ghi vào tiến độ');
  });
  it('Space đọc lại bản đọc đầy đủ', async () => {
    const onspeak = vi.fn();
    render(Feedback, { props: { result: { correct: false, elapsedMs: 1 }, item, concept, onnext: () => {}, onspeak } });
    await fireEvent.keyDown(window, { key: ' ' });
    expect(onspeak).toHaveBeenCalledWith('Chưa đúng. Đáp án: Đúng. Giải thích.');
  });
});

describe('SessionBar / mốc / XP nguồn', () => {
  const mk = (kind?: 'boss' | 'retry' | 'learn', golden = false): Step => ({ conceptId: 'a', level: 1 as const, item: { type: 'truefalse', level: 4, statement: 's', answer: true, explain: 'e' }, meta: { kind, golden } });
  it('barMarks: câu chốt, mốc sửa sai, câu vàng chỉ hiện khi đã tới', () => {
    const steps = [mk(), mk('learn', true), mk(), mk('boss'), mk('retry'), mk('retry')];
    expect(barMarks(steps, 0).map((m) => m.kind)).toEqual(['boss', 'retry']);
    expect(barMarks(steps, 1).map((m) => m.kind)).toEqual(['golden', 'boss', 'retry']);
  });
  it('SessionBar vẽ combo khi từ 2 câu đúng liên tiếp', () => {
    const { container, rerender } = render(SessionBar, { props: { done: 1, total: 10, combo: 1 } });
    expect(container.querySelector('.combo')).toBeNull();
    rerender({ done: 1, total: 10, combo: 5 });
    expect(container.querySelector('.combo.t2')).toBeTruthy();
    rerender({ done: 1, total: 10, combo: 10 });
    expect(container.querySelector('.combo.t3')).toBeTruthy();
  });
  it('xpSources chia câu đúng / combo / câu vàng / sửa sai / thưởng', () => {
    const s = xpSources({ base: 30, combo: 5, golden: 10, retry: 5 }, { session: 20, lesson: 0 });
    expect(Object.fromEntries(s.map((x) => [x.key, x.xp]))).toEqual({ base: 30, combo: 5, golden: 10, retry: 5, session: 20 });
  });
});

describe('SessionEnd đợt 6', () => {
  const base = { summary: { correct: 7, total: 10, xp: 90, levelUps: [{ conceptId: 'a', to: 3 as const }], bestCombo: 6, golden: 1, fixed: 2 }, concepts: [concept], streak: 1, streakEvent: 'started' as const, rankBefore: rankFor(0), rankAfter: rankFor(30), dueTomorrow: 2, onhome: () => {} };
  it('hiện vòng tỉ lệ, combo dài nhất, sửa được x/y, nguồn XP, kỷ lục, khái niệm lên bậc', () => {
    const { container } = render(SessionEnd, { props: { ...base, retryTotal: 3, sources: [{ key: 'base', label: 'Câu đúng', xp: 70 }, { key: 'session', label: 'Hoàn thành phiên', xp: 20 }], record: { comboBeaten: true, rateBeaten: false, before: { bestCombo: 4, bestRate: 0.9 } } } });
    const t = container.textContent!;
    expect(container.querySelector('.end-ring')).toBeTruthy();
    expect(t).toContain('Combo dài nhất');
    expect(t).toContain('2/3');
    expect(t).toContain('Câu đúng');
    expect(t).toContain('Kỷ lục combo mới: 6');
    expect(t).toContain('Hiến pháp');
  });
  it('không có dữ liệu mới thì không hiện mục thừa', () => {
    const { container } = render(SessionEnd, { props: { ...base, summary: { correct: 1, total: 2, xp: 10, levelUps: [] } } });
    expect(container.querySelector('.xp-sources')).toBeNull();
    expect(container.querySelector('.record-msg')).toBeNull();
    expect(container.textContent).not.toContain('Sửa được');
  });
});
