import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import { rankFor } from '$lib/game/rank';

const rows: { at: number; rating: number; conf?: string; conceptId: string; level: number; elapsedMs: number }[] = [];
let hyper: unknown[] = [];
vi.mock('$lib/store/progress-repo', () => ({ repo: { reviewsSince: async () => rows, hypercorrections: async () => hyper } }));

import CalibrationPanel from '$lib/ui/CalibrationPanel.svelte';
import SessionEnd from '$lib/ui/SessionEnd.svelte';

afterEach(() => { cleanup(); rows.length = 0; hyper = []; });
const row = (conf: string, ok: boolean) => ({ at: Date.now(), rating: ok ? 3 : 1, conf, conceptId: 'a', level: 2, elapsedMs: 3000 });

describe('CalibrationPanel', () => {
  it('ít dữ liệu: nói rõ cần thêm lượt, không vẽ bảng', async () => {
    rows.push(row('chac', true));
    const { container } = render(CalibrationPanel);
    await vi.waitFor(() => expect(container.textContent).toContain('mới có 1/10'));
    expect(container.querySelector('table')).toBeNull();
  });
  it('đủ dữ liệu: bảng ba mức với tỉ lệ đúng thực tế và kỳ vọng; có lối vào Sửa kỹ khi có khái niệm chắc mà sai', async () => {
    for (let k = 0; k < 6; k++) rows.push(row('chac', k < 3)); // Chắc mà chỉ đúng 50 %
    for (let k = 0; k < 4; k++) rows.push(row('doan', k < 2));
    hyper = [{ conceptId: 'a' }, { conceptId: 'b' }];
    const { container } = render(CalibrationPanel);
    await vi.waitFor(() => expect(container.querySelector('table')).not.toBeNull());
    const tr = [...container.querySelectorAll('tbody tr')].map((r) => r.textContent!.replace(/\s+/g, ' ').trim());
    expect(tr[0]).toContain('Chắc'); expect(tr[0]).toContain('50%'); expect(tr[0]).toContain('90%');
    expect(tr[2]).toContain('Đoán'); expect(tr[2]).toContain('30%');
    const link = container.querySelector('.calib-hyper a')!;
    expect(link.getAttribute('href')).toBe('#/on/chac-sai');
    expect(container.querySelector('.calib-hyper')!.textContent).toContain('2 khái niệm');
  });
});

describe('SessionEnd: chắc mà sai và đoán trước', () => {
  const base = { concepts: [], streak: 1, streakEvent: 'started' as const, rankBefore: rankFor(0), rankAfter: rankFor(0), dueTomorrow: 0, onhome: () => {} };
  it('hiện số câu chắc mà sai kèm liên kết Sửa kỹ, và kết quả đoán trước', () => {
    const { container } = render(SessionEnd, { props: { ...base, summary: { correct: 3, total: 5, xp: 30, levelUps: [], hyper: 2, pretest: { total: 2, correct: 1 } } } });
    expect(container.textContent).toContain('Chắc mà sai');
    expect(container.textContent).toContain('1/2');
    expect(container.querySelector('.hyper-end a')?.getAttribute('href')).toBe('#/on/chac-sai');
  });
  it('không có thì không hiện dòng nào', () => {
    const { container } = render(SessionEnd, { props: { ...base, summary: { correct: 3, total: 5, xp: 30, levelUps: [] } } });
    expect(container.querySelector('.hyper-end')).toBeNull();
    expect(container.textContent).not.toContain('Đoán trước đúng');
  });
});
