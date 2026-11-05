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
vi.mock('$lib/ui/career.svelte', () => ({ currentTitle: () => 'Công dân' }));

import SessionView from '$lib/ui/SessionView.svelte';
import type { Concept } from '$lib/content/types';
import type { Step } from '$lib/engine/session';

const concept: Concept = {
  id: 'a', subject: 'hp', chapter: 'c', term: 'Hiến pháp', definition: 'Hiến pháp là luật cơ bản.', plain: 'Luật mẹ.', example: 'Ví dụ.',
  source: { kind: 'statute', cite: 'Điều 119' }, checked: '2026-11-01', confusables: [], keywords: ['a', 'b'], items: [],
};
const mcq = (): Step['item'] => ({ type: 'mcq', level: 1, q: 'Câu hỏi?', options: ['Đúng', 'Sai 1', 'Sai 2', 'Sai 3'], answer: 0, explain: 'e' });
const steps = (): Step[] => Array.from({ length: 8 }, () => ({ conceptId: 'a', level: 1, item: mcq() }));
const props = () => ({ steps: steps(), concepts: [concept], levels: { a: 1 as const } });

beforeEach(() => { calm = false; sparks.mockClear(); stampConfetti.mockClear(); buzzCombo.mockClear(); record.mockClear(); playCombo.mockClear(); localStorage.clear(); });
afterEach(() => cleanup());

async function answerOk(container: HTMLElement, _g?: unknown, wrong = false) {
  // thứ tự phương án được xáo: chọn theo chữ
  const opts = [...container.querySelectorAll('.opt')];
  await fireEvent.click(opts.find((o) => (o.textContent ?? '').includes('Đúng') === !wrong)!);
  await vi.waitFor(() => expect(container.querySelector('.feedback')).not.toBeNull());
}
const next = (container: HTMLElement) => fireEvent.click(container.querySelector('.feedback .btn')!);

describe('SessionView: khoảnh khắc thưởng', () => {
  it('có bộ đếm XP ngay từ đầu, không còn dải kỳ quan', () => {
    const { container } = render(SessionView, { props: props() });
    expect(container.querySelector('.wonder-strip')).toBeNull();
    expect(container.querySelector('.session-bar .xp-chip')).not.toBeNull();
  });
  it('câu đúng thứ 2 liên tiếp: dấu mộc "×2 CHUỖI!" và âm thanh dời về lúc dấu chạm giấy', async () => {
    const { container, getByRole } = render(SessionView, { props: props() });
    await answerOk(container, getByRole as never); expect(container.ownerDocument.querySelector('.stamp')).toBeNull();
    await next(container);
    await answerOk(container, getByRole as never);
    await vi.waitFor(() => expect(container.ownerDocument.querySelector('.stamp')?.textContent).toContain('×2'));
    expect(playCombo).toHaveBeenLastCalledWith(2, 130);
    // tiếng đóng mộc: lần 1 dấu "ĐÚNG" nhỏ (260 ms), lần 2 mộc mốc chuỗi to đúng lúc chạm giấy (130 ms)
    expect(stamp.mock.calls.slice(-2)).toEqual([[{ heavy: false, delay: 260 }], [{ heavy: true, delay: 130 }]]);
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

  it('câu đúng: hạt sáng bung, rung theo mốc, nút đúng nảy', async () => {
    const { container } = render(SessionView, { props: props() });
    await answerOk(container);
    await vi.waitFor(() => expect(sparks).toHaveBeenCalledTimes(1));
    expect(buzzCombo).toHaveBeenCalledWith(1);
    expect(container.querySelector('.opt.correct')?.classList.contains('reward-bounce')).toBe(true);
  });
  it('giảm chuyển động: không hạt sáng, không nảy', async () => {
    calm = true;
    const { container } = render(SessionView, { props: props() });
    await answerOk(container);
    expect(sparks).not.toHaveBeenCalled();
    expect(container.querySelector('.reward-bounce')).toBeNull();
  });
  it('mốc 5: confetti, không phủ kỳ quan; Esc mở hộp thoát', async () => {
    const { container } = render(SessionView, { props: props() });
    for (let n = 1; n <= 5; n++) { await answerOk(container); if (n < 5) await next(container); }
    await vi.waitFor(() => expect(stampConfetti).toHaveBeenCalledTimes(1));
    expect(container.ownerDocument.querySelector('.wonder-flash')).toBeNull();
    await fireEvent.keyDown(window, { key: 'Escape' });
    expect(container.querySelector('.confirm')).not.toBeNull();
  });
  it('huỷ giữa chừng: timer dọn, không confetti muộn', async () => {
    const { container, unmount } = render(SessionView, { props: props() });
    for (let n = 1; n <= 5; n++) { await answerOk(container); if (n < 5) await next(container); }
    unmount();
    stampConfetti.mockClear();
    await new Promise((r) => setTimeout(r, 700));
    expect(stampConfetti).not.toHaveBeenCalled();
  });
});
