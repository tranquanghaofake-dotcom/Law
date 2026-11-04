import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import LevelLegend from '$lib/ui/LevelLegend.svelte';

describe('LevelLegend', () => {
  it('ô chú giải hiện chữ số bậc 0–6 (không chỉ màu)', () => {
    const { container } = render(LevelLegend);
    expect([...container.querySelectorAll('.cell')].map((c) => c.textContent)).toEqual(['0', '1', '2', '3', '4', '5', '6']);
  });
});
