import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import type { Subject } from '$lib/content/types';
import HeroCard from '$lib/ui/HeroCard.svelte';

const subject: Subject = { id: 'hien-phap', title: 'Luật Hiến pháp', short: 'HP', chapters: [{ id: 'c1', title: 'Khái quát', lessons: [{ id: 'hp-1', title: 'Hiến pháp là gì', concepts: ['a', 'b', 'c', 'd', 'e'] }] }] };
const lesson = subject.chapters[0].lessons[0];
const q = (c: HTMLElement, sel: string) => c.querySelector(sel);

describe('HeroCard', () => {
  it('due: kicker ÔN HÔM NAY, số 12, tối đa 3 chip, nút Ôn ngay → #/on', () => {
    const { container } = render(HeroCard, { props: { state: { kind: 'due', count: 12, terms: ['A', 'B', 'C'], minutes: 5 } } });
    expect(q(container, '.kicker')?.textContent).toBe('ÔN HÔM NAY');
    expect(q(container, '.big')?.textContent).toBe('12');
    expect(container.querySelectorAll('.chip')).toHaveLength(3);
    const btn = q(container, 'a.btn.primary');
    expect(btn?.textContent).toContain('Ôn ngay');
    expect(btn?.getAttribute('href')).toBe('#/on');
  });
  it('continue: TIẾP TỤC, môn › đợt, 2/5, nút Học tiếp → đợt', () => {
    const { container } = render(HeroCard, { props: { state: { kind: 'continue', subject, lesson, done: 2, total: 5 } } });
    expect(q(container, '.kicker')?.textContent).toBe('TIẾP TỤC');
    expect(container.textContent).toContain('Luật Hiến pháp › Hiến pháp là gì');
    expect(container.textContent).toContain('2/5');
    const btn = q(container, 'a.btn.primary');
    expect(btn?.textContent).toContain('Học tiếp');
    expect(btn?.getAttribute('href')).toBe('#/hoc/hien-phap/hp-1');
  });
  it('next: ĐỢT MỚI với số khái niệm và phút; nút Bắt đầu', () => {
    const { container } = render(HeroCard, { props: { state: { kind: 'next', subject, lesson, minutes: 6 } } });
    expect(q(container, '.kicker')?.textContent).toBe('ĐỢT MỚI');
    expect(container.textContent).toContain('5 khái niệm · ~6 phút');
    expect(q(container, 'a.btn.primary')?.textContent).toContain('Bắt đầu');
  });
  it('start: BẮT ĐẦU, câu giải thích 6 bậc, nút Học đợt đầu tiên', () => {
    const { container } = render(HeroCard, { props: { state: { kind: 'start', subject, lesson } } });
    expect(q(container, '.kicker')?.textContent).toBe('BẮT ĐẦU');
    expect(container.textContent).toContain('6 bậc');
    expect(q(container, 'a.btn.primary')?.textContent).toContain('Học đợt đầu tiên');
  });
  it('done: ĐÃ HỌC HẾT, không có nút primary', () => {
    const { container } = render(HeroCard, { props: { state: { kind: 'done' } } });
    expect(q(container, '.kicker')?.textContent).toBe('ĐÃ HỌC HẾT');
    expect(q(container, 'a.btn.primary')).toBeNull();
  });
});
