import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';

let rmOn = false;
vi.mock('$lib/fx/confetti', () => ({ reducedMotion: () => rmOn }));
import ComboMeter from '$lib/ui/session/ComboMeter.svelte';

beforeEach(() => { vi.useFakeTimers(); rmOn = false; });
afterEach(() => { vi.useRealTimers(); });

describe('ComboMeter — lửa chuỗi đúng', () => {
  it('lên mốc → bật pulse và có tia, không dựng lại SVG; hết giờ thì gỡ', async () => {
    const { container, rerender } = render(ComboMeter, { props: { combo: 1 } });
    await tick();
    const svg = container.querySelector('svg');
    await rerender({ combo: 2 });
    expect(container.querySelectorAll('.sp').length).toBeGreaterThan(0);
    expect(container.querySelector('.flame.pulse')).toBeTruthy();
    expect(container.querySelector('svg')).toBe(svg);
    vi.advanceTimersByTime(1000);
    await tick();
    expect(container.querySelectorAll('.sp').length).toBe(0);
    expect(container.querySelector('.flame.pulse')).toBeNull();
  });
  it('mỗi instance có id gradient riêng', () => {
    const a = render(ComboMeter, { props: { combo: 2 } });
    const b = render(ComboMeter, { props: { combo: 2 } });
    const ia = a.container.querySelector('linearGradient')!.id, ib = b.container.querySelector('linearGradient')!.id;
    expect(ia).toBeTruthy();
    expect(ia).not.toBe(ib);
  });
  it('giảm chuyển động → không tia, không pulse', async () => {
    rmOn = true;
    const { container, rerender } = render(ComboMeter, { props: { combo: 1 } });
    await rerender({ combo: 2 });
    expect(container.querySelectorAll('.sp').length).toBe(0);
    expect(container.querySelector('.flame.pulse')).toBeNull();
    expect(container.querySelector('.combo.rm')).toBeTruthy();
  });
  it('sai → tắt dịu rồi gỡ sau 650 ms', async () => {
    const { container, rerender } = render(ComboMeter, { props: { combo: 3 } });
    await rerender({ combo: 0 });
    expect(container.querySelector('.combo.out')).toBeTruthy();
    vi.advanceTimersByTime(649);
    await tick();
    expect(container.querySelector('.combo')).toBeTruthy();
    vi.advanceTimersByTime(2);
    await tick();
    expect(container.querySelector('.combo')).toBeNull();
  });
  it('unmount huỷ hết timer', async () => {
    const { rerender, unmount } = render(ComboMeter, { props: { combo: 1 } });
    await rerender({ combo: 2 });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
