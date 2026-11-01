import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import type { Subject } from '$lib/content/types';
import MasteryGrid from '$lib/ui/MasteryGrid.svelte';
import { LEVEL_NAMES } from '$lib/game/levels';

const subject: Subject = { id: 'hp', title: 'Luật Hiến pháp', short: 'HP', chapters: [{ id: 'c1', title: 'Khái quát', lessons: [
  { id: 'hp-1', title: 'Hiến pháp là gì', concepts: ['a', 'b'] },
  { id: 'hp-2', title: 'Sửa đổi', concepts: ['c', 'd'] },
] }] };
const terms = { a: 'Hiến pháp', b: 'Hiệu lực', c: 'Sửa đổi', d: 'Bảo vệ' };

describe('MasteryGrid', () => {
  it('một ô mỗi khái niệm, class theo bậc, title có tên mức', () => {
    const { container } = render(MasteryGrid, { props: { subject, levels: { a: 6, b: 2 }, terms, states: { 'hp-1': 'current', 'hp-2': 'locked' } } });
    const cells = container.querySelectorAll('.cell');
    expect(cells).toHaveLength(4);
    expect(cells[0].classList.contains('lv6')).toBe(true);
    expect(cells[1].classList.contains('lv2')).toBe(true);
    expect(cells[2].classList.contains('lv0')).toBe(true);
    const items = container.querySelectorAll('.cell-item');
    expect(items[0].getAttribute('title')).toContain('Thuần thục');
    expect(items[0].getAttribute('title')).toContain('Hiến pháp');
  });
  it('nhãn TIẾP THEO CHO BẠN chỉ ở hàng current; link đợt đúng hash', () => {
    const { container } = render(MasteryGrid, { props: { subject, levels: {}, terms, states: { 'hp-1': 'done', 'hp-2': 'current' } } });
    const tags = container.querySelectorAll('.next-tag');
    expect(tags).toHaveLength(1);
    expect(tags[0].closest('#lesson-hp-2')).not.toBeNull();
    expect(container.querySelector('#lesson-hp-1 a')?.getAttribute('href')).toBe('#/hoc/hp/hp-1');
  });
  it('tên khái niệm hiện rõ cạnh ô (không chỉ trong tooltip), có trên điện thoại', () => {
    const { container } = render(MasteryGrid, { props: { subject, levels: { a: 6 }, terms, states: {} } });
    const items = [...container.querySelectorAll('.cell-item')];
    expect(items.map((x) => x.querySelector('.cell-term')?.textContent)).toEqual(['Hiến pháp', 'Hiệu lực', 'Sửa đổi', 'Bảo vệ']);
  });
  it('LEVEL_NAMES có 7 mức', () => { expect(LEVEL_NAMES).toHaveLength(7); });
});
