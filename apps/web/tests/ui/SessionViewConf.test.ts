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
vi.mock('$lib/fx/haptics', () => ({ buzz() {} }));
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
const steps = (kind?: 'pretest'): Step[] => [
  { conceptId: 'a', level: 2, item: mcq() },
  { conceptId: 'a', level: 2, item: mcq() },
  ...(kind ? [] : []),
];

beforeEach(() => { record.mockClear(); playCombo.mockClear(); localStorage.clear(); });
afterEach(() => cleanup());

describe('SessionView: độ tự tin', () => {
  it('bước đầu (chỉ số 0) có thanh Chắc/Tạm/Đoán; chọn Chắc rồi trả lời sai → HyperNote + ghi conf vào repo.record', async () => {
    const { container } = render(SessionView, { props: { steps: steps(), concepts: [concept], levels: { a: 2 } } });
    expect(container.querySelector('.conf-bar')).not.toBeNull();
    await fireEvent.click(container.querySelector('.conf-btn.conf-chac')!);
    const opts = [...container.querySelectorAll('.opt')];
    // phương án sai: bất kỳ nút không phải "Đúng"
    await fireEvent.click(opts.find((o) => !o.textContent?.includes('Đúng'))!);
    await vi.waitFor(() => expect(container.querySelector('.hyper-note')).not.toBeNull());
    expect(record).toHaveBeenCalledTimes(1);
    expect((record.mock.calls[0] as unknown[])[0]).toMatchObject({ conceptId: 'a', correct: false, conf: 'chac' });
    expect(container.querySelector('.conf-bar')).toBeNull();
  });
  it('không chọn gì vẫn trả lời bình thường: không có conf, không có HyperNote', async () => {
    const { container } = render(SessionView, { props: { steps: steps(), concepts: [concept], levels: { a: 2 } } });
    await fireEvent.click([...container.querySelectorAll('.opt')].find((o) => !o.textContent?.includes('Đúng'))!);
    await vi.waitFor(() => expect(container.querySelector('.feedback')).not.toBeNull());
    expect(container.querySelector('.hyper-note')).toBeNull();
    expect((record.mock.calls[0] as unknown[])[0]).toMatchObject({ correct: false });
    expect((record.mock.calls[0] as { conf?: unknown }[])[0].conf).toBeUndefined();
  });
  it('tắt trong cài đặt (localStorage) thì không hiện thanh', () => {
    localStorage.setItem('ll.pref.confidence', '0');
    const { container } = render(SessionView, { props: { steps: steps(), concepts: [concept], levels: { a: 2 } } });
    expect(container.querySelector('.conf-bar')).toBeNull();
  });
});

describe('SessionView: đoán trước', () => {
  it('câu pretest: có "Bỏ qua"; bỏ qua sang thẻ giới thiệu ngay, KHÔNG ghi tiến độ', async () => {
    const pre: Step = { conceptId: 'a', level: 1, item: mcq(), meta: { kind: 'pretest', gen: 'example-concept', kicker: 'Đoán trước' } };
    const intro: Step = { conceptId: 'a', level: 0, item: { type: 'intro' } };
    const { container, getByRole } = render(SessionView, { props: { steps: [pre, intro, { conceptId: 'a', level: 1, item: mcq() }], concepts: [concept], levels: { a: 0 } } });
    expect(container.querySelector('.pretest-bar')).not.toBeNull();
    expect(container.querySelector('.conf-bar')).toBeNull();
    await fireEvent.click(getByRole('button', { name: 'Bỏ qua' }));
    await vi.waitFor(() => expect(container.querySelector('.intro-layers')).not.toBeNull());
    expect(record).not.toHaveBeenCalled();
  });
  it('trả lời câu pretest: không ghi tiến độ nhưng vẫn có phản hồi', async () => {
    const pre: Step = { conceptId: 'a', level: 1, item: mcq(), meta: { kind: 'pretest', gen: 'example-concept', kicker: 'Đoán trước' } };
    const { container } = render(SessionView, { props: { steps: [pre, { conceptId: 'a', level: 0, item: { type: 'intro' } }], concepts: [concept], levels: { a: 0 } } });
    await fireEvent.click([...container.querySelectorAll('.opt')][0]);
    await vi.waitFor(() => expect(container.querySelector('.feedback')).not.toBeNull());
    expect(record).not.toHaveBeenCalled();
    expect(container.querySelector('.pretest-bar')?.textContent).toContain('Đoán sai không sao');
  });
});

describe('SessionView: hiệu ứng chuỗi đúng', () => {
  const click = (c: HTMLElement, right: boolean) => fireEvent.click([...c.querySelectorAll('.opt')].find((o) => !!o.textContent?.includes('Đúng') === right)!);
  it('đúng → viền lên mốc 1, nét kỳ quan sáng thêm, phát playCombo(1); sai → viền về 0, nét giữ nguyên', async () => {
    const { container, getByRole } = render(SessionView, { props: { steps: steps(), concepts: [concept], levels: { a: 2 } } });
    const edge = () => container.querySelector('.combo-edge') as HTMLElement;
    expect(edge().dataset.level).toBe('0');
    await click(container, true);
    await vi.waitFor(() => expect(edge().dataset.level).toBe('1'));
    expect(edge().dataset.tier).toBe('do');
    expect(playCombo).toHaveBeenCalledWith(1);
    await vi.waitFor(() => expect(container.querySelectorAll('.wonder .lit .core').length).toBe(3));
    await fireEvent.click(getByRole('button', { name: /Câu tiếp/ }));
    await click(container, false);
    await vi.waitFor(() => expect(edge().dataset.level).toBe('0'));
    expect(container.querySelectorAll('.wonder .lit .core').length).toBe(3);
  });
});
