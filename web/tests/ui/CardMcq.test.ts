import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import CardMcq from '$lib/ui/cards/CardMcq.svelte';
import type { Concept, ItemMcq } from '$lib/content/types';

const concept: Concept = {
  id: 'a', subject: 'hp', chapter: 'c', term: 'Hiến pháp', definition: 'd', plain: 'p', example: 'e',
  source: { kind: 'statute', cite: 'Điều 119' }, checked: '2026-11-01', confusables: [], keywords: ['a', 'b', 'c'], items: [],
};
const item: ItemMcq = { type: 'mcq', level: 1, q: 'Hiến pháp là gì?', options: ['Đúng', 'Sai 1', 'Sai 2', 'Sai 3'], answer: 0, explain: 'e' };
const rng = () => 0.99; // không xáo (shuffle với rng ~1 giữ nguyên thứ tự)

describe('CardMcq', () => {
  it('hiện 4 nút A–D và báo đúng khi chọn phương án đúng', async () => {
    const onanswer = vi.fn();
    render(CardMcq, { props: { concept, item, rng, onanswer } });
    const opts = screen.getAllByRole('button', { name: /^[A-D]\./ });
    expect(opts.length).toBe(4);
    await fireEvent.click(screen.getByRole('button', { name: /Đúng/ }));
    expect(onanswer).toHaveBeenCalledTimes(1);
    expect(onanswer.mock.calls[0][0]).toMatchObject({ correct: true });
    expect(opts.every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
  });
  it('phím 2 chọn phương án B', async () => {
    const onanswer = vi.fn();
    render(CardMcq, { props: { concept, item, rng, onanswer } });
    await fireEvent.keyDown(window, { key: '2' });
    expect(onanswer).toHaveBeenCalledTimes(1);
    expect(onanswer.mock.calls[0][0]).toMatchObject({ correct: false, chosen: 'Sai 1' });
  });
});
