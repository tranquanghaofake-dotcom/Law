import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { artFor, emblemFor, EMBLEM_NAMES } from '$lib/art/registry';
import { schemeFor } from '$lib/ui/shelf';
import Emblem from '$lib/art/Emblem.svelte';

const chapters = (id: string): string[] => JSON.parse(readFileSync(`../../packages/content/data/subjects/${id}.json`, 'utf8')).chapters.map((c: { id: string }) => c.id);

describe('tranh cho nội dung mới', () => {
  it('mỗi môn có cảnh riêng', () => {
    expect(artFor('hien-phap')).toBe('quoc-hoi');
    expect(artFor('chung-khoan')).toBe('san-giao-dich');
    expect(artFor('lich-su-nn-pl')).toBe('bia-tien-si');
  });
  it('màu gáy sách theo bìa thật: Hiến pháp vàng, Chứng khoán xanh, giáo trình Lịch sử xanh đêm', () => {
    expect(schemeFor('hien-phap', 0)).toBe('vang');
    expect(schemeFor('chung-khoan', 0)).toBe('xanh');
    expect(schemeFor('lich-su-nn-pl', 0)).toBe('dem');
  });
  it('mọi chương của 3 môn đều có huy hiệu riêng theo nội dung (không rơi vào mặc định)', () => {
    for (const s of ['hien-phap', 'chung-khoan', 'lich-su-nn-pl']) for (const ch of chapters(s)) expect(emblemFor(s, ch), `${s}/${ch}`).not.toBe('sach');
    expect(emblemFor('mon-la', 'c1')).toBe('sach');
  });
  it('huy hiệu là trang trí, mỗi tên vẽ khác nhau', () => {
    const htmls = EMBLEM_NAMES.map((n) => {
      const svg = render(Emblem, { props: { name: n } }).container.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      return svg?.innerHTML;
    });
    expect(new Set(htmls).size).toBe(EMBLEM_NAMES.length);
  });
});
