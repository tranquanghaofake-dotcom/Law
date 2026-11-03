import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import StreakBadge from '$lib/art/StreakBadge.svelte';
import { streakView } from '$lib/ui/streakView';

describe('StreakBadge (huy hiệu lửa cỡ nhỏ)', () => {
  afterEach(() => cleanup());
  it('ẩn khỏi cây truy cập (số ngày do chữ bên cạnh đảm nhiệm) và dùng màu chu kỳ của streakView', () => {
    const { container } = render(StreakBadge, { props: { count: 12, longest: 12 } });
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('style')).toContain(streakView(12, 12).flame);
    expect(svg.classList.contains('cold')).toBe(false);
  });
  it('chưa có chuỗi: xám (cold)', () => {
    const { container } = render(StreakBadge, { props: { count: 0, longest: 0 } });
    expect(container.querySelector('svg')!.classList.contains('cold')).toBe(true);
  });
});
