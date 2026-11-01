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
});
