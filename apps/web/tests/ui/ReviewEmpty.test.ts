import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/svelte';

let rows: { card: { due: Date } }[] = [];
let dueRows: { subject: string; conceptId: string }[] = [];
vi.mock('$lib/store/progress-repo', () => ({ repo: { due: async () => dueRows, all: async () => rows } }));
vi.mock('$lib/content/loader', () => ({ loadIndex: async () => ({ subjects: [], sets: [] }), loadSubject: async () => ({}), loadConcepts: async () => [], loadConceptPool: async () => [], loadTerms: async () => ({}) }));
vi.mock('$lib/router.svelte', () => ({ route: { name: 'review', params: {} }, hashFor: (n: string) => `#/${n}` }));
const Review = (await import('../../src/routes/Review.svelte')).default;
const at = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(12); return { card: { due: d } }; };

describe('Ôn tập rỗng (đợt 2: Empty States)', () => {
  afterEach(() => { cleanup(); dueRows = []; });
  it('vừa học xong: hẹn còn trong hôm nay → không nói "hôm nay hết bài", nói giờ quay lại', async () => {
    const soon = new Date(Date.now() + 8 * 60_000);
    rows = soon.getDate() === new Date().getDate() ? [{ card: { due: soon } }] : [at(1)];
    const { container } = render(Review);
    await waitFor(() => expect(container.querySelector('.review-empty')).not.toBeNull());
    if (rows[0].card.due === soon) {
      expect(container.textContent).not.toMatch(/không còn khái niệm nào cần ôn/);
      expect(container.textContent).toMatch(/hôm nay/);
    }
  });
  it('có thẻ đến hạn nhưng nội dung không còn → nói rõ, không khẳng định "hết bài"', async () => {
    dueRows = [{ subject: 'xoa', conceptId: 'x' }];
    rows = [at(0)];
    const { container } = render(Review);
    await waitFor(() => expect(container.querySelector('.review-empty')).not.toBeNull());
    expect(container.textContent).not.toMatch(/không còn khái niệm nào cần ôn/);
    expect(container.textContent).toMatch(/1 khái niệm đến hạn.*không còn trong nội dung/);
  });
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
