import { describe, expect, it } from 'vitest';
import { createReveal } from '$lib/fx/reveal.svelte';

describe('createReveal', () => {
  it('lộ từng ô, tối đa total', () => {
    const r = createReveal(20);
    r.reveal(); r.reveal(); r.reveal();
    expect(r.revealed).toBe(3);
    expect(r.tiles.filter(Boolean).length).toBe(3);
    r.reveal(100);
    expect(r.revealed).toBe(20);
    expect(r.tiles.every(Boolean)).toBe(true);
  });
});

import { render } from '@testing-library/svelte';
import Reveal from '$lib/ui/Reveal.svelte';

describe('Reveal.svelte', () => {
  it('số ô vẽ luôn phủ kín lưới cols×rows (không hở ô)', () => {
    const r = createReveal(12);
    const { container } = render(Reveal, { props: { reveal: r, src: 'x.webp', cols: 5 } });
    expect(container.querySelectorAll('.tile').length).toBe(15);
    expect(container.querySelectorAll('.tile.open').length).toBe(0);
  });
});
