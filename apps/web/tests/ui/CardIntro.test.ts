import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
afterEach(() => cleanup());
import CardIntro from '$lib/ui/cards/CardIntro.svelte';
import type { Concept } from '$lib/content/types';

const concept: Concept = {
  id: 'a', subject: 'dan-su', chapter: 'c', term: 'Đặt cọc', definition: 'Đặt cọc là việc giao tiền để bảo đảm giao kết hợp đồng.',
  plain: 'Giao tiền trước để giữ chắc việc ký hợp đồng.', example: 'An giao 5 triệu cho chủ nhà trước khi ký hợp đồng thuê.',
  source: { kind: 'statute', cite: 'Điều 328 BLDS 2015' }, checked: '2026-11-01', confusables: [], keywords: ['giao tiền', 'bảo đảm', 'giao kết'], items: [],
};
const rng = () => 0.5;
const item = { type: 'intro' as const };

describe('CardIntro ba lớp', () => {
  it('mở đầu bằng ví dụ và chip dấu hiệu; nguyên văn điều luật ẩn cho tới khi bấm', async () => {
    const { container } = render(CardIntro, { props: { concept, item, rng, onanswer: vi.fn() } });
    expect(container.textContent).toContain('An giao 5 triệu');
    expect([...container.querySelectorAll('.intro-cues li')].map((l) => l.textContent)).toEqual(['giao tiền', 'bảo đảm', 'giao kết']);
    expect(container.querySelector('blockquote')).toBeNull();
    const btn = screen.getByRole('button', { name: 'Xem nguyên văn điều luật' });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    await fireEvent.click(btn);
    expect(container.querySelector('blockquote')?.textContent).toContain('Đặt cọc là việc giao tiền');
    expect(container.textContent).toContain('Điều 328 BLDS 2015');
  });
  it('luôn hiện nguồn (dạng gọn) ngay cả khi chưa mở nguyên văn', () => {
    const { container } = render(CardIntro, { props: { concept, item, rng, onanswer: vi.fn() } });
    expect(container.querySelector('.source')?.textContent).toContain('Điều 328 BLDS 2015');
  });
  it('khái niệm có ghi chú cập nhật luật thì mở sẵn nguyên văn và ghi chú', () => {
    const { container } = render(CardIntro, { props: { concept: { ...concept, note: 'Có thay đổi từ 01/07/2025.' }, item, rng, onanswer: vi.fn() } });
    expect(container.querySelector('blockquote')).not.toBeNull();
    expect(container.textContent).toContain('Cập nhật luật');
  });
  it('"Đã hiểu" và Enter gửi correct: true đúng một lần', async () => {
    const onanswer = vi.fn();
    render(CardIntro, { props: { concept, item, rng, onanswer } });
    await fireEvent.click(screen.getByRole('button', { name: /Đã hiểu/ }));
    await fireEvent.keyDown(window, { key: 'Enter' });
    expect(onanswer).toHaveBeenCalledTimes(1);
    expect(onanswer.mock.calls[0][0]).toMatchObject({ correct: true });
  });
});
