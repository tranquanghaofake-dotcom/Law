import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import CardMatch from '$lib/ui/cards/CardMatch.svelte';
import type { Concept } from '$lib/content/types';
import type { MatchItem } from '$lib/engine/session';

const concept = { id: 'a', subject: 'hp', chapter: 'c', term: 'A', definition: 'd', plain: 'p', example: 'e', source: { kind: 'statute', cite: 'Đ1' }, checked: '2026-11-01', confusables: [], keywords: [], items: [] } as unknown as Concept;
const item = { type: 'match', level: 2, explain: 'e', pairs: [{ conceptId: 'a', term: 'T1', text: 'mô tả một' }, { conceptId: 'b', term: 'T2', text: 'mô tả hai' }, { conceptId: 'c', term: 'T3', text: 'mô tả ba' }] } as unknown as MatchItem;

describe('CardMatch — chạm nhanh không bị nuốt khi đang rung báo sai', () => {
  it('ghép sai rồi chạm ngay (trước 420 ms) vẫn được ghi nhận', async () => {
    vi.useFakeTimers();
    const { container } = render(CardMatch, { props: { concept, item, rng: () => 0.5, onanswer: vi.fn() } });
    const btn = (side: 'term' | 'desc', text: string) => [...container.querySelectorAll<HTMLButtonElement>(side === 'term' ? '.match-cell:not(.desc)' : '.match-cell.desc')].find((b) => b.textContent!.includes(text))!;
    await fireEvent.click(btn('term', 'T1'));
    await fireEvent.click(btn('desc', 'mô tả hai')); // sai → rung
    expect(container.querySelector('.match-cell.wrong')).not.toBeNull();
    await fireEvent.click(btn('term', 'T2')); // chạm ngay, không chờ 420 ms
    expect(container.querySelector('.match-cell.wrong')).toBeNull();
    expect(btn('term', 'T2').getAttribute('aria-pressed')).toBe('true');
    await fireEvent.click(btn('desc', 'mô tả hai'));
    expect(btn('term', 'T2').disabled).toBe(true); // cặp đúng đã khoá
    vi.useRealTimers();
  });
});
