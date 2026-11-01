import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import CardPair from '$lib/ui/cards/CardPair.svelte';
import type { Concept, ItemPair } from '$lib/content/types';

const concept: Concept = {
  id: 'a', subject: 'hp', chapter: 'c', term: 'A', definition: 'd', plain: 'p', example: 'e',
  source: { kind: 'statute', cite: 'Đ1' }, checked: '2026-11-01', confusables: [], keywords: ['a', 'b', 'c'], items: [],
};
const item: ItemPair = { type: 'pair', level: 2, left: 'Trái', right: 'Phải', cases: [{ text: 't1', answer: 'left' }, { text: 't2', answer: 'right' }], explain: 'e' };

describe('CardPair — elapsedMs chia cho số tình huống (I4)', () => {
  it('2 tình huống, tổng 4 s → elapsedMs ≈ 2000', async () => {
    vi.useFakeTimers();
    const onanswer = vi.fn();
    render(CardPair, { props: { concept, item, rng: () => 0.99, onanswer } });
    vi.advanceTimersByTime(2000);
    await fireEvent.click(screen.getByRole('button', { name: /Trái/ }));
    vi.advanceTimersByTime(450);
    vi.advanceTimersByTime(1550);
    await fireEvent.click(screen.getByRole('button', { name: /Phải/ }));
    vi.advanceTimersByTime(450);
    expect(onanswer).toHaveBeenCalledTimes(1);
    expect(onanswer.mock.calls[0][0]).toMatchObject({ correct: true });
    expect(onanswer.mock.calls[0][0].elapsedMs).toBeLessThanOrEqual(2300);
    expect(onanswer.mock.calls[0][0].elapsedMs).toBeGreaterThanOrEqual(2000);
    vi.useRealTimers();
  });
});
