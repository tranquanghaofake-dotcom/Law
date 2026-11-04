import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/svelte';

let rows: { card: { due: Date } }[] = [];
vi.mock('$lib/store/progress-repo', () => ({ repo: { due: async () => [], all: async () => rows } }));
vi.mock('$lib/router.svelte', () => ({ route: { name: 'review', params: {} }, hashFor: (n: string) => `#/${n}` }));
const Review = (await import('../../src/routes/Review.svelte')).default;
const at = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(12); return { card: { due: d } }; };

describe('Ôn tập rỗng (đợt 2: Empty States)', () => {
  afterEach(() => cleanup());
  it('đã học: nói lần ôn tới (ngày mai, số khái niệm) và mời học đợt mới', async () => {
    rows = [at(1), at(1), at(3)];
    const { container } = render(Review);
    await waitFor(() => expect(container.querySelector('h1')?.textContent).toBe('Ôn hôm nay'));
    await waitFor(() => expect(container.textContent).toMatch(/ngày mai.*2 khái niệm/));
    expect(container.querySelector('a.btn.primary')?.textContent).toMatch(/Học đợt mới/);
  });
  it('chưa học gì: nói rõ và dẫn tới đợt đầu tiên', async () => {
    rows = [];
    const { container } = render(Review);
    await waitFor(() => expect(container.textContent).toMatch(/chưa học khái niệm nào/));
    expect(container.querySelector('a.btn.primary')?.textContent).toMatch(/Học đợt đầu tiên/);
  });
});
