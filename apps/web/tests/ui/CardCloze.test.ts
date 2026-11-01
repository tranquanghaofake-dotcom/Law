import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import CardCloze from '$lib/ui/cards/CardCloze.svelte';
import type { Concept, ItemCloze } from '$lib/content/types';

const concept: Concept = {
  id: 'a', subject: 'hp', chapter: 'c', term: 'Tài sản', definition: 'd', plain: 'p', example: 'e',
  source: { kind: 'statute', cite: 'Điều 105' }, checked: '2026-11-01', confusables: [], keywords: ['a', 'b', 'c'], items: [],
};
const item: ItemCloze = { type: 'cloze', level: 3, text: 'Tài sản là vật, tiền, giấy tờ có giá và {{quyền tài sản}}.', bank_extra: ['hoa lợi', 'lợi tức'] };
const rng = () => 0.5;

describe('CardCloze', () => {
  it('mode type: gõ đúng → correct', async () => {
    const onanswer = vi.fn();
    render(CardCloze, { props: { concept, item, rng, onanswer, mode: 'type' } });
    const input = screen.getByRole('textbox');
    await fireEvent.input(input, { target: { value: 'quyền tài sản' } });
    await fireEvent.click(screen.getByRole('button', { name: /Kiểm tra/ }));
    expect(onanswer.mock.calls[0][0]).toMatchObject({ correct: true });
  });
  it('mode bank: hiện đủ từ trong ngân hàng', () => {
    render(CardCloze, { props: { concept, item, rng, onanswer: vi.fn(), mode: 'bank' } });
    expect(screen.getByRole('button', { name: 'quyền tài sản' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'hoa lợi' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'lợi tức' })).toBeTruthy();
  });
});
