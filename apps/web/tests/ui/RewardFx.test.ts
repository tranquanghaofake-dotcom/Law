import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';

let calm = false;
vi.mock('$lib/fx/confetti', () => ({ burst() {}, reducedMotion: () => calm }));

import ComboStamp from '$lib/ui/session/ComboStamp.svelte';
import XpCounter from '$lib/ui/session/XpCounter.svelte';
import { stampFor } from '$lib/ui/session/reward';

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

describe('XpCounter', () => {
  it('giảm chuyển động: đổi số hiện ngay', async () => {
    calm = true;
    const { container, rerender } = render(XpCounter, { props: { value: 0 } });
    await rerender({ value: 25 });
    await vi.waitFor(() => expect(container.querySelector('b')?.textContent).toBe('25'));
  });
});
