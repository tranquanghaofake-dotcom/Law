import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import { artFor } from '$lib/art/registry';
import SubjectArt from '$lib/art/SubjectArt.svelte';
import Icon from '$lib/art/Icon.svelte';
import { NAV } from '$lib/ui/nav';

describe('hình minh hoạ theo môn', () => {
  it('Hiến pháp → Nhà Quốc hội; môn chưa có hình → cổng tam quan', () => {
    expect(artFor('hien-phap')).toBe('quoc-hoi');
    expect(artFor('mon-chua-co')).toBe('tam-quan');
  });
  it('hình là trang trí: aria-hidden, không nhận focus, có viewBox', () => {
    for (const name of ['khue-van-cac', 'quoc-hoi', 'tam-quan'] as const) {
      const { container } = render(SubjectArt, { props: { name } });
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.getAttribute('focusable')).toBe('false');
      expect(svg?.getAttribute('viewBox')).toBe('0 0 320 200');
    }
  });
  it('mỗi mục điều hướng có icon nét vẽ riêng', () => {
    const paths = NAV.map((n) => render(Icon, { props: { name: n.name } }).container.querySelector('svg')?.innerHTML);
    expect(paths.every(Boolean)).toBe(true);
    expect(new Set(paths).size).toBe(NAV.length);
  });
});
