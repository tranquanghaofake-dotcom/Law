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
