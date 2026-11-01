import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, within } from '@testing-library/svelte';
import SessionEnd from '$lib/ui/SessionEnd.svelte';
import { rankFor } from '$lib/game/rank';

const base = { summary: { correct: 3, total: 4, xp: 30, levelUps: [] }, concepts: [], streak: 1, streakEvent: 'started' as const, rankBefore: rankFor(0), rankAfter: rankFor(30), dueTomorrow: 2, onhome: () => {} };

describe('SessionEnd', () => {
  it('nút chính "Về Hôm nay"; có "Học đợt tiếp" khi truyền onnext', async () => {
    const onnext = vi.fn();
    const { container } = render(SessionEnd, { props: { ...base, onnext } });
    const { getByRole } = within(container);
    expect(getByRole('button', { name: 'Về Hôm nay' })).toBeTruthy();
    await fireEvent.click(getByRole('button', { name: /Học đợt tiếp/ }));
    expect(onnext).toHaveBeenCalled();
  });
  it('không có "Học đợt tiếp" khi không có đợt kế', () => {
    const { container } = render(SessionEnd, { props: base });
    const { queryByRole } = within(container);
    expect(queryByRole('button', { name: /Học đợt tiếp/ })).toBeNull();
  });
  it('có câu sai → mục "Xem lại câu sai" với câu hỏi, đáp án, link khái niệm; không có → không hiện', () => {
    const concept = { id: 'a', subject: 'hp', chapter: 'c', term: 'Hiến pháp', definition: 'd', plain: 'p', example: 'e', source: { kind: 'statute' as const, cite: 'Điều 1' }, checked: '2026-11-01', confusables: [], keywords: [], items: [] };
    const mistakes = [{ conceptId: 'a', level: 1 as const, item: { type: 'mcq' as const, level: 1 as const, q: 'Câu hỏi X?', options: ['Sai', 'Đúng'], answer: 1, explain: 'Vì Y' } }];
    const { container } = render(SessionEnd, { props: { ...base, concepts: [concept], mistakes } });
    const sec = container.querySelector('.mistakes')!;
    expect(sec.textContent).toContain('Câu hỏi X?');
    expect(sec.textContent).toContain('Đúng');
    expect(sec.textContent).toContain('Vì Y');
    expect(sec.querySelector('a')?.getAttribute('href')).toBe('#/mon/hp/khai-niem/a');
    const { container: c2 } = render(SessionEnd, { props: base });
    expect(c2.querySelector('.mistakes')).toBeNull();
  });
});
