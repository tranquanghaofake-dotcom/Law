import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/svelte';

let calm = false;
const record = vi.fn(async () => ({}));
vi.mock('$lib/store/progress-repo', () => ({ repo: { record: (...a: unknown[]) => record(...(a as [])), due: async () => [] } }));
vi.mock('$lib/store/stats', () => ({
  stats: { addXp: async () => 0, xp: async () => 0, markLesson: async () => false, streak: async () => ({ count: 0, longest: 0, lastDay: null, freezes: 0 }), setStreak: async () => {} },
}));
const playCombo = vi.fn();
vi.mock('$lib/fx/sfx', () => ({ sfx: { preload() {}, play() {}, playCombo: (...a: unknown[]) => playCombo(...a), stopCombo() {} } }));
vi.mock('$lib/fx/confetti', () => ({ burst() {}, reducedMotion: () => calm }));
vi.mock('$lib/fx/sparks', () => ({ sparks() {}, stampConfetti() {} }));
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
const steps = (): Step[] => Array.from({ length: 4 }, () => ({ conceptId: 'a', level: 1, item: mcq() }));
const props = () => ({ steps: steps(), concepts: [concept], levels: { a: 1 as const } });

beforeEach(() => { calm = false; record.mockClear(); playCombo.mockClear(); localStorage.clear(); });
afterEach(() => cleanup());

async function answerOk(container: HTMLElement, _g?: unknown, wrong = false) {
  // thứ tự phương án được xáo: chọn theo chữ
  const opts = [...container.querySelectorAll('.opt')];
  await fireEvent.click(opts.find((o) => (o.textContent ?? '').includes('Đúng') === !wrong)!);
  await vi.waitFor(() => expect(container.querySelector('.feedback')).not.toBeNull());
}
const next = (container: HTMLElement) => fireEvent.click(container.querySelector('.feedback .btn')!);

describe('SessionView: khoảnh khắc thưởng', () => {
  it('có dải Thắp sáng và bộ đếm XP ngay từ đầu', () => {
    const { container } = render(SessionView, { props: props() });
    expect(container.querySelector('.wonder-strip')).not.toBeNull();
    expect(container.querySelector('.session-bar .xp-chip')).not.toBeNull();
  });
  it('câu đúng thứ 2 liên tiếp: dấu mộc "×2 CHUỖI!" và âm thanh dời về lúc dấu chạm giấy', async () => {
    const { container, getByRole } = render(SessionView, { props: props() });
    await answerOk(container, getByRole as never); expect(container.ownerDocument.querySelector('.stamp')).toBeNull();
    await next(container);
    await answerOk(container, getByRole as never);
    await vi.waitFor(() => expect(container.ownerDocument.querySelector('.stamp')?.textContent).toContain('×2'));
    expect(playCombo).toHaveBeenLastCalledWith(2, 130);
  });
  it('giảm chuyển động: không dấu mộc, không dời âm thanh, XP hiện ngay', async () => {
    calm = true;
    const { container, getByRole } = render(SessionView, { props: props() });
    await answerOk(container, getByRole as never); await next(container);
    await answerOk(container, getByRole as never);
    expect(container.ownerDocument.querySelector('.stamp')).toBeNull();
    expect(playCombo).toHaveBeenLastCalledWith(2, 0);
    await vi.waitFor(() => expect(Number(container.querySelector('.xp-chip b')?.textContent)).toBeGreaterThan(0));
  });
  it('câu sai sau chuỗi: không dấu mộc', async () => {
    const { container, getByRole } = render(SessionView, { props: props() });
    await answerOk(container, getByRole as never); await next(container);
    await answerOk(container, getByRole as never, true);
    expect(playCombo).toHaveBeenCalledTimes(1);
  });
});
