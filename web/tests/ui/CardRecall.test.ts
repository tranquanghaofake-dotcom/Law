import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/svelte';
afterEach(() => cleanup());
import { fireEvent, render, screen } from '@testing-library/svelte';
import CardRecall from '$lib/ui/cards/CardRecall.svelte';
import type { Concept, ItemRecall } from '$lib/content/types';

const concept: Concept = {
  id: 'a', subject: 'hp', chapter: 'c', term: 'Quyền tài sản', definition: 'd', plain: 'p', example: 'e',
  source: { kind: 'statute', cite: 'Điều 115' }, checked: '2026-11-01', confusables: [], keywords: ['a', 'b', 'c'], items: [],
};
const item: ItemRecall = { type: 'recall', level: 5, q: 'Vì sao quyền đòi nợ là tài sản?', model: 'Vì là quyền tài sản, trị giá được bằng tiền (Điều 115).', keywords: ['quyền tài sản', 'trị giá được bằng tiền', 'Điều 115'] };

describe('CardRecall', () => {
  it('tô sáng từ khóa trúng và tự chấm Gần đúng → correct', async () => {
    const onanswer = vi.fn();
    render(CardRecall, { props: { concept, item, rng: () => 0.5, onanswer } });
    await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'Vì đó là quyền tài sản trị giá được bằng tiền.' } });
    await fireEvent.click(screen.getByRole('button', { name: /Xem đáp án/ }));
    expect(document.querySelectorAll('mark').length).toBe(2);
    await fireEvent.click(screen.getByRole('button', { name: /Gần đúng/ }));
    expect(onanswer.mock.calls[0][0]).toMatchObject({ correct: true, selfGrade: 'gan' });
  });
});

describe('CardRecall — elapsedMs (I4)', () => {
  it('đo thời gian tới lúc Xem đáp án, không tính thời gian tự chấm', async () => {
    vi.useFakeTimers();
    const onanswer = vi.fn();
    render(CardRecall, { props: { concept, item, rng: () => 0.5, onanswer } });
    vi.advanceTimersByTime(2000);
    await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'quyền tài sản' } });
    await fireEvent.click(screen.getByRole('button', { name: /Xem đáp án/ }));
    vi.advanceTimersByTime(20000);
    const btns = screen.getAllByRole('button', { name: /^Đúng$/ });
    await fireEvent.click(btns[btns.length - 1]);
    expect(onanswer.mock.calls[0][0].elapsedMs).toBe(2000);
    vi.useRealTimers();
  });
});
