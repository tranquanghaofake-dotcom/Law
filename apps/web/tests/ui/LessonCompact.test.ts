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
const mcq = (): Step['item'] => ({ type: 'mcq', level: 1, q: 'Câu hỏi?', options: ['Đúng', 'Sai 1', 'Sai 2', 'Sai 3'], answer: 0, explain: 'e' });

beforeEach(() => { record.mockClear(); localStorage.clear(); });
afterEach(() => cleanup());

describe('Bài học gọn hơn (đợt 2: phần nhìn)', () => {
  it('gợi ý lần đầu là một dòng có nút đóng, không phải hộp kèm nút lớn đẩy thẻ xuống', () => {
    const { container, getByRole } = render(SessionView, { props: { steps: [{ conceptId: 'a', level: 2, item: mcq() }], concepts: [concept], levels: { a: 1 } } });
    const hint = container.querySelector('.session-hint')!;
    expect(hint.tagName).toBe('P');
    expect(hint.classList.contains('card')).toBe(false);
    expect(hint.textContent).toMatch(/giữ lửa chuỗi/);
    getByRole('button', { name: 'Ẩn gợi ý' });
  });
  it('câu chốt hiện câu hỏi ngay (không chen màn chờ), nhãn nói rõ là câu cuối', () => {
    const boss: Step = { conceptId: 'a', level: 2, item: mcq(), meta: { kind: 'boss' } } as Step;
    const { container } = render(SessionView, { props: { steps: [boss], concepts: [concept], levels: { a: 1 } } });
    expect(container.querySelector('.boss-intro')).toBeNull();
    expect(container.querySelector('.step-badge.boss')?.textContent).toMatch(/Câu chốt.*câu cuối/);
    expect(container.textContent).toContain('Câu hỏi?');
  });
});
