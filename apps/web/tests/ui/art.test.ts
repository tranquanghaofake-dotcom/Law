import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import { ART_NAMES, VIGNETTE_NAMES, artFor, vignetteFor } from '$lib/art/registry';
import Vignette from '$lib/art/Vignette.svelte';
import SubjectArt from '$lib/art/SubjectArt.svelte';
import Icon from '$lib/art/Icon.svelte';
import { NAV } from '$lib/ui/nav';

describe('hình minh hoạ theo môn', () => {
  it('Hiến pháp → Nhà Quốc hội; môn chưa có hình → cổng tam quan', () => {
    expect(artFor('hien-phap')).toBe('quoc-hoi');
    expect(artFor('mon-chua-co')).toBe('tam-quan');
  });
  it('hình là trang trí: aria-hidden, không nhận focus, có viewBox', () => {
    for (const name of ART_NAMES) {
      const { container } = render(SubjectArt, { props: { name } });
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.getAttribute('focusable')).toBe('false');
      expect(svg?.getAttribute('viewBox')).toBe('0 0 520 325');
    }
  });
  it('mỗi cảnh và tranh nhỏ vẽ khác nhau (không trùng nội dung)', () => {
    const scenes = ART_NAMES.map((n) => render(SubjectArt, { props: { name: n } }).container.innerHTML);
    expect(new Set(scenes).size).toBe(ART_NAMES.length);
    const vs = VIGNETTE_NAMES.map((n) => render(Vignette, { props: { name: n } }).container.querySelector('svg'));
    expect(vs.every((v) => v?.getAttribute('aria-hidden') === 'true' && v.getAttribute('viewBox') === '0 0 160 100')).toBe(true);
    expect(new Set(vs.map((v) => v?.innerHTML)).size).toBe(VIGNETTE_NAMES.length);
  });
  it('bộ đề: theo id, rồi theo nhóm, cuối cùng mặc định', () => {
    expect(vignetteFor({ id: 'dat-coc', group: 'dan-su' })).toBe('dat-coc');
    expect(vignetteFor({ id: 'de-moi', group: 'lao-dong' })).toBe('nghi-viec');
    expect(vignetteFor({ id: 'de-moi', group: 'nhom-la' })).toBe('quan-he');
  });
  it('mỗi mục điều hướng có icon nét vẽ riêng', () => {
    const paths = NAV.map((n) => render(Icon, { props: { name: n.name } }).container.querySelector('svg')?.innerHTML);
    expect(paths.every(Boolean)).toBe(true);
    expect(new Set(paths).size).toBe(NAV.length);
  });
});
