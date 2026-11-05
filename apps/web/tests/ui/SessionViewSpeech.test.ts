import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/svelte';

let calm = false;
const record = vi.fn(async () => ({}));
vi.mock('$lib/store/progress-repo', () => ({ repo: { record: (...a: unknown[]) => record(...(a as [])), due: async () => [] } }));
vi.mock('$lib/store/stats', () => ({
  stats: { addXp: async () => 0, xp: async () => 0, markLesson: async () => false, streak: async () => ({ count: 0, longest: 0, lastDay: null, freezes: 0 }), setStreak: async () => {} },
}));
const playCombo = vi.fn(), stamp = vi.fn();
vi.mock('$lib/fx/sfx', () => ({ sfx: { preload() {}, play() {}, playCombo: (...a: unknown[]) => playCombo(...a), stamp: (...a: unknown[]) => stamp(...a), stopCombo() {} } }));
vi.mock('$lib/fx/confetti', () => ({ burst() {}, reducedMotion: () => calm }));
const sparks = vi.fn(), stampConfetti = vi.fn(), buzzCombo = vi.fn();
vi.mock('$lib/fx/sparks', () => ({ sparks: (...a: unknown[]) => sparks(...a), stampConfetti: (...a: unknown[]) => stampConfetti(...a) }));
vi.mock('$lib/fx/haptics', () => ({ buzz() {}, buzzCombo: (...a: unknown[]) => buzzCombo(...a) }));
vi.mock('$lib/ui/header.svelte', () => ({ refreshHeader: async () => {} }));
vi.mock('$lib/ui/sidenav.svelte', () => ({ refreshSidenav: async () => {} }));
vi.mock('$lib/ui/shelf.svelte', () => ({ refreshShelf: async () => {} }));
const speak = vi.fn(), stop = vi.fn();
vi.mock('$lib/fx/tts.svelte', () => ({ tts: { available: true, speak: (t: string) => speak(t), stop: () => stop() } }));
vi.mock('$lib/ui/career.svelte', () => ({ currentTitle: () => 'Công dân' }));

import SessionView from '$lib/ui/SessionView.svelte';
import { settings } from '$lib/store/settings.svelte';
import type { Concept } from '$lib/content/types';
import type { Step } from '$lib/engine/session';

const concept: Concept = {
  id: 'a', subject: 'hp', chapter: 'c', term: 'Hiến pháp', definition: 'Hiến pháp là luật cơ bản.', plain: 'Luật mẹ.', example: 'Ví dụ.',
  source: { kind: 'statute', cite: 'Điều 119' }, checked: '2026-11-01', confusables: [], keywords: ['a', 'b'], items: [],
};
const mcq = (): Step['item'] => ({ type: 'mcq', level: 1, q: 'Câu hỏi?', options: ['Đúng', 'Sai 1', 'Sai 2', 'Sai 3'], answer: 0, explain: 'Giải thích.' });
const props = (first: Step['item'] = mcq()) => ({ steps: [{ conceptId: 'a', level: 1 as const, item: first }, { conceptId: 'a', level: 1 as const, item: mcq() }], concepts: [concept], levels: { a: 1 as const } });

beforeEach(() => { speak.mockClear(); settings.tts = true; localStorage.clear(); });
afterEach(() => { cleanup(); settings.tts = true; });

describe('SessionView: giọng đọc đề khi thẻ hiện, đáp án sau khi trả lời', () => {
  it('thẻ trắc nghiệm hiện → đọc câu hỏi và phương án theo đúng thứ tự trên màn hình, chưa đọc giải thích', async () => {
    const { container } = render(SessionView, { props: props() });
    await vi.waitFor(() => expect(speak).toHaveBeenCalled());
    const shown = [...container.querySelectorAll('.opt')].map((o, i) => `${'ABCD'[i]}: ${o.getAttribute('aria-label')!.slice(3)}.`);
    expect(speak.mock.calls[0][0]).toBe(`Câu hỏi? ${shown.join(' ')}`);
    expect(speak.mock.calls[0][0]).not.toContain('Giải thích');
  });
  it('trả lời → đọc "Chính xác. Đáp án: …" + giải thích; sang câu sau → đọc đề mới', async () => {
    const { container } = render(SessionView, { props: props() });
    await vi.waitFor(() => expect(speak).toHaveBeenCalledTimes(1));
    const opts = [...container.querySelectorAll('.opt')];
    await fireEvent.click(opts.find((o) => (o.textContent ?? '').includes('Đúng') && !(o.textContent ?? '').includes('Sai'))!);
    await vi.waitFor(() => expect(speak).toHaveBeenLastCalledWith('Chính xác. Đáp án: Đúng. Giải thích.'));
    await fireEvent.click(container.querySelector('.feedback [data-next]')!);
    await vi.waitFor(() => expect(speak.mock.lastCall?.[0]).toMatch(/^Câu hỏi\? A: /));
  });
  it('thẻ giới thiệu khái niệm → đọc tên và định nghĩa', async () => {
    render(SessionView, { props: props({ type: 'intro' } as Step['item']) });
    await vi.waitFor(() => expect(speak).toHaveBeenCalledWith('Hiến pháp. Hiến pháp là luật cơ bản.'));
  });
  it('tắt giọng đọc trong Cài đặt → không đọc gì', async () => {
    settings.tts = false;
    render(SessionView, { props: props() });
    await new Promise((r) => setTimeout(r, 30));
    expect(speak).not.toHaveBeenCalled();
  });
});
