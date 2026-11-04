import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/svelte';

const record = vi.fn(async () => ({}));
vi.mock('$lib/store/progress-repo', () => ({ repo: { record: (...a: unknown[]) => record(...(a as [])), due: async () => [] } }));
vi.mock('$lib/store/stats', () => ({
  stats: { addXp: async () => 0, xp: async () => 0, markLesson: async () => false, streak: async () => ({ count: 0, longest: 0, lastDay: null, freezes: 0 }), setStreak: async () => {} },
}));
const playCombo = vi.fn();
vi.mock('$lib/fx/sfx', () => ({ sfx: { preload() {}, play() {}, playCombo: (...a: unknown[]) => playCombo(...a), stopCombo() {} } }));
vi.mock('$lib/fx/confetti', () => ({ burst() {}, reducedMotion: () => true }));
vi.mock('$lib/fx/haptics', () => ({ buzz() {}, buzzCombo() {} }));
vi.mock('$lib/ui/header.svelte', () => ({ refreshHeader: async () => {} }));
vi.mock('$lib/ui/sidenav.svelte', () => ({ refreshSidenav: async () => {} }));
vi.mock('$lib/ui/shelf.svelte', () => ({ refreshShelf: async () => {} }));
vi.mock('$lib/ui/career.svelte', () => ({ currentTitle: () => 'Công dân' }));

import SessionView from '$lib/ui/SessionView.svelte';
import type { Concept } from '$lib/content/types';
import type { Step } from '$lib/engine/session';

const concept: Concept = {
  id: 'a', subject: 'hp', chapter: 'c', term: 'Hiến pháp', definition: 'Hiến pháp là luật cơ bản.', plain: 'Luật mẹ.', example: 'Ví dụ.',
  source: { kind: 'statute', cite: 'Điều 119' }, checked: '2026-11-01', confusables: [], keywords: ['a', 'b'], items: [],
};
const lastRating = () => (record.mock.calls.at(-1) as unknown as [{ rating?: { mode: string; chars: number; partial: boolean } }])[0].rating;

beforeEach(() => { record.mockClear(); localStorage.clear(); });
afterEach(() => cleanup());

describe('SessionView → repo.record: thông tin chấm FSRS', () => {
  it('trắc nghiệm: mode recognize, chars = độ dài đề + phương án, không phải gần đúng', async () => {
    const item: Step['item'] = { type: 'mcq', level: 1, q: 'Câu hỏi?', options: ['Đúng', 'Sai 1', 'Sai 2', 'Sai 3'], answer: 0, explain: 'e' };
    const { container } = render(SessionView, { props: { steps: [{ conceptId: 'a', level: 1, item }], concepts: [concept], levels: { a: 1 } } });
    await fireEvent.click([...container.querySelectorAll('.opt')].find((o) => o.textContent?.includes('Đúng'))!);
    await vi.waitFor(() => expect(record).toHaveBeenCalled());
    expect(lastRating()).toEqual({ mode: 'recognize', chars: 'Câu hỏi?'.length + 'ĐúngSai 1Sai 2Sai 3'.length, partial: false });
  });
  it('tự nhớ lại, tự chấm "Gần đúng": mode produce, partial = true', async () => {
    const item: Step['item'] = { type: 'recall', level: 5, q: 'Nêu khái niệm Hiến pháp.', model: 'Hiến pháp là luật cơ bản.', keywords: ['luật cơ bản'] };
    const { container, getByRole } = render(SessionView, { props: { steps: [{ conceptId: 'a', level: 5, item }], concepts: [concept], levels: { a: 5 } } });
    await fireEvent.input(container.querySelector('textarea')!, { target: { value: 'luật cơ bản của nhà nước' } });
    await fireEvent.click(getByRole('button', { name: 'Xem đáp án' }));
    await fireEvent.click(getByRole('button', { name: 'Gần đúng' }));
    await vi.waitFor(() => expect(record).toHaveBeenCalled());
    expect(lastRating()).toMatchObject({ mode: 'produce', partial: true });
  });
});
