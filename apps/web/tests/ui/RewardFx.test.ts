import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/svelte';

let calm = false;
vi.mock('$lib/fx/confetti', () => ({ burst() {}, reducedMotion: () => calm }));

import ComboStamp from '$lib/ui/session/ComboStamp.svelte';
import WonderFlash from '$lib/ui/session/WonderFlash.svelte';
import WonderStrip from '$lib/ui/session/WonderStrip.svelte';
import XpCounter from '$lib/ui/session/XpCounter.svelte';
import SessionEnd from '$lib/ui/SessionEnd.svelte';
import { stampFor } from '$lib/ui/session/reward';
import type { Wonder } from '$lib/fx/wonders';

const wonder: Wonder = { id: 'x', name: 'Khuê Văn Các', place: 'Hà Nội', viewBox: '0 0 800 600', paths: Array.from({ length: 40 }, (_, i) => `M${i * 10} 0L${i * 10} 100`) };
const lit = (n: number) => Array.from({ length: n }, (_, i) => ({ i, tier: 'lam' as const }));

beforeEach(() => { calm = false; vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('ComboStamp', () => {
  it('hiện "×3 CHUỖI!" rồi tự gọi onend sau ~1,1 s; dọn timer khi huỷ', () => {
    const onend = vi.fn();
    const { container, unmount } = render(ComboStamp, { props: { stamp: stampFor(2, 3)!, onend } });
    expect(container.querySelector('.stamp')?.textContent).toContain('×3');
    expect(container.querySelector('.stamp')?.textContent).toContain('CHUỖI!');
    vi.advanceTimersByTime(1099); expect(onend).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2); expect(onend).toHaveBeenCalledTimes(1);
    const again = vi.fn();
    const r2 = render(ComboStamp, { props: { stamp: stampFor(4, 5)!, onend: again } });
    r2.unmount(); unmount();
    vi.advanceTimersByTime(3000); expect(again).not.toHaveBeenCalled();
  });
});

describe('WonderFlash', () => {
  it('tự tắt sau ~1,2 s; bấm để bỏ qua (chỉ gọi onend một lần)', async () => {
    const onend = vi.fn();
    const { container } = render(WonderFlash, { props: { wonder, lit: lit(10), onend } });
    expect(container.textContent).toContain('Đã thắp sáng 25%');
    await fireEvent.click(container.querySelector('.wonder-flash')!);
    expect(onend).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2000); expect(onend).toHaveBeenCalledTimes(1);
  });
  it('không bấm: tự gọi onend', () => {
    const onend = vi.fn();
    render(WonderFlash, { props: { wonder, lit: lit(10), onend } });
    vi.advanceTimersByTime(1201); expect(onend).toHaveBeenCalledTimes(1);
  });
});

describe('WonderStrip', () => {
  it('hiện tên, địa điểm, %; số nét sáng khớp', () => {
    const { container } = render(WonderStrip, { props: { wonder, lit: lit(14), tier: 'lam' } });
    expect(container.querySelector('.name')?.textContent).toBe('Khuê Văn Các');
    expect(container.querySelector('.place')?.textContent).toBe('Hà Nội');
    expect(container.querySelector('.pct b')?.textContent).toBe('35');
    expect(container.querySelectorAll('.lit .core')).toHaveLength(14);
  });
  it('chưa nạp kỳ quan: vẫn giữ chỗ, 0%', () => {
    const { container } = render(WonderStrip, { props: {} });
    expect(container.querySelector('.pct b')?.textContent).toBe('0');
  });
});

describe('XpCounter', () => {
  it('giảm chuyển động: đổi số hiện ngay', async () => {
    calm = true;
    const { container, rerender } = render(XpCounter, { props: { value: 0 } });
    await rerender({ value: 25 });
    await vi.waitFor(() => expect(container.querySelector('b')?.textContent).toBe('25'));
  });
});

describe('SessionEnd: thẻ kỳ quan', () => {
  const base = { concepts: [], streak: 1, streakEvent: 'extended' as const, rankBefore: { rank: 0 } as never, rankAfter: { rank: 0 } as never, dueTomorrow: 0, onhome() {}, summary: { correct: 3, total: 4, xp: 40, levelUps: [] } };
  it('hiện "Đã thắp sáng X% · tên · địa điểm"', () => {
    const { container } = render(SessionEnd, { props: { ...base, wonderCard: { wonder, lit: lit(20), percent: 50 } } });
    expect(container.querySelector('.wonder-card .wc-h')?.textContent).toContain('Đã thắp sáng 50%');
    expect(container.querySelector('.wonder-card .wc-n')?.textContent).toBe('Khuê Văn Các · Hà Nội');
    expect(container.querySelector('.wc-badge')).toBeNull();
  });
  it('100% → huy hiệu "Thắp sáng trọn vẹn"', () => {
    const { container } = render(SessionEnd, { props: { ...base, wonderCard: { wonder, lit: lit(40), percent: 100 } } });
    expect(container.querySelector('.wc-badge')?.textContent).toContain('Thắp sáng trọn vẹn');
  });
  it('không có thẻ khi chưa thắp nét nào', () => {
    const { container } = render(SessionEnd, { props: base });
    expect(container.querySelector('.wonder-card')).toBeNull();
  });
});
