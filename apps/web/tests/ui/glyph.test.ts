import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import Glyph from '$lib/art/Glyph.svelte';

afterEach(() => cleanup());

describe('Glyph — icon nét thay ký tự Unicode (HT14)', () => {
  const names = ['star', 'star-fill', 'chevron-right', 'chevron-down', 'back', 'warn', 'check', 'close', 'lock', 'dot', 'dot-empty'] as const;
  it.each(names)('%s: vẽ được, ẩn với trình đọc màn hình, không chứa ký tự', (name) => {
    const { container } = render(Glyph, { props: { name } });
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelectorAll('path, circle').length).toBeGreaterThan(0);
    expect(svg.textContent).toBe('');
  });
  it('star-fill tô đặc, star rỗng', () => {
    const a = render(Glyph, { props: { name: 'star-fill' } }).container.querySelector('path')!;
    expect(a.getAttribute('fill')).toBe('currentColor');
    cleanup();
    const b = render(Glyph, { props: { name: 'star' } }).container.querySelector('path')!;
    expect(b.getAttribute('fill')).toBe('none');
  });
});
