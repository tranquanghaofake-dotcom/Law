import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';

vi.mock('$lib/fx/confetti', () => ({ reducedMotion: () => true }));
import ComboEdge from '$lib/ui/session/ComboEdge.svelte';
import WonderBackdrop from '$lib/ui/session/WonderBackdrop.svelte';

afterEach(cleanup);

describe('ComboEdge', () => {
  it('mức và bậc màu theo chuỗi; sai → tắt (opacity 0)', async () => {
    const { container, rerender } = render(ComboEdge, { combo: 5 });
    const el = () => container.querySelector('.combo-edge') as HTMLElement;
    expect(el().dataset.level).toBe('4');
    expect(el().dataset.tier).toBe('trang-den');
    expect(el().classList.contains('rm')).toBe(true);
    expect(Number(el().style.opacity)).toBeGreaterThan(0.5);
    await rerender({ combo: 0 });
    expect(el().dataset.level).toBe('0');
    expect(el().style.opacity).toBe('0');
  });
});

describe('WonderBackdrop', () => {
  const wonder = { id: 'x', name: 'X', place: 'Y', viewBox: '0 0 800 600', paths: ['M0 0L10 10', 'M5 5L9 9', 'M1 1L2 2'] };
  it('vẽ nền mờ cho mọi nét, chỉ nét đã sáng có lớp sáng', () => {
    const { container } = render(WonderBackdrop, { wonder, lit: [{ i: 1, tier: 'lam' }] });
    expect(container.querySelectorAll('.base path')).toHaveLength(3);
    expect(container.querySelectorAll('.lit .core')).toHaveLength(1);
  });
  it('hết phiên: mọi nét sáng', () => {
    const { container } = render(WonderBackdrop, { wonder, lit: [{ i: 1, tier: 'lam' }], complete: true });
    expect(container.querySelectorAll('.lit .core')).toHaveLength(3);
  });
  it('chưa nạp kỳ quan: không vẽ gì', () => {
    const { container } = render(WonderBackdrop, { wonder: null });
    expect(container.querySelector('.wonder')).toBeNull();
  });
});
