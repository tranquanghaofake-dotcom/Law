import { describe, expect, it, vi } from 'vitest';
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
    expect(items[0].getAttribute('title')).toContain('Tinh thông');
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

describe('MasteryGrid — cấu trúc heading và bậc không chỉ bằng màu (SJ-1, SJ-2)', () => {
  it('chương là h2, đợt là h3 chứa link đợt', () => {
    const { container } = render(MasteryGrid, { props: { subject, levels: {}, terms, states: {} } });
    expect([...container.querySelectorAll('h2')].map((h) => h.textContent?.trim())).toEqual(['Khái quát']);
    const h3 = [...container.querySelectorAll('h3')];
    expect(h3.map((h) => h.textContent?.trim())).toEqual(['Hiến pháp là gì', 'Sửa đổi']);
    expect(h3[0].querySelector('a')?.getAttribute('href')).toBe('#/hoc/hp/hp-1');
  });
  it('mỗi ô hiện chữ số bậc nhìn thấy được', () => {
    const { container } = render(MasteryGrid, { props: { subject, levels: { a: 6, b: 2 }, terms, states: {} } });
    expect([...container.querySelectorAll('.cell')].map((c) => c.textContent)).toEqual(['6', '2', '0', '0']);
  });
  it('đợt khoá có nhãn chữ "Chưa tới lượt", không chỉ xám', () => {
    const { container } = render(MasteryGrid, { props: { subject, levels: {}, terms, states: { 'hp-1': 'current', 'hp-2': 'locked' } } });
    expect(container.querySelector('#lesson-hp-2')?.textContent).toContain('Chưa tới lượt');
    expect(container.querySelector('#lesson-hp-1')?.textContent).not.toContain('Chưa tới lượt');
  });
});

describe('MasteryGrid — tên truy cập khớp chữ nhìn thấy (axe label-content-name-mismatch)', () => {
  it('ô khái niệm không dùng aria-label; tên = tên khái niệm + bậc (chữ số trong ô ẩn với trình đọc)', () => {
    const { container } = render(MasteryGrid, { props: { subject, levels: { a: 6 }, terms, states: {} } });
    const a = container.querySelector('.cell-item')!;
    expect(a.hasAttribute('aria-label')).toBe(false);
    expect(a.querySelector('.cell')?.getAttribute('aria-hidden')).toBe('true');
    expect(a.querySelector('.sr-only')?.textContent).toBe(', bậc 6, Tinh thông');
  });
});

describe('MasteryGrid — đợt khoá mở hộp trong app, không dùng confirm() (SJ-6)', () => {
  it('bấm đợt khoá: không gọi confirm, mở Sheet nói đợt đang học; "Ở lại" đóng; "Học vượt" trỏ đúng đợt', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/svelte');
    const conf = vi.spyOn(window, 'confirm');
    const r = render(MasteryGrid, { props: { subject, levels: {}, terms, states: { 'hp-1': 'current', 'hp-2': 'locked' } } });
    await fireEvent.click(r.container.querySelector('#lesson-hp-2 a')!);
    expect(conf).not.toHaveBeenCalled();
    const dlg = r.container.querySelector('dialog.sheet')!;
    await waitFor(() => expect(dlg.hasAttribute('open')).toBe(true));
    expect(dlg.textContent).toContain('Hiến pháp là gì');
    expect(dlg.textContent).not.toMatch(/Thi vượt/);
    expect(dlg.querySelector('a.btn')?.getAttribute('href')).toBe('#/hoc/hp/hp-2');
    await fireEvent.click(r.getByRole('button', { name: 'Ở lại' }));
    await waitFor(() => expect(dlg.hasAttribute('open')).toBe(false));
  });
});
