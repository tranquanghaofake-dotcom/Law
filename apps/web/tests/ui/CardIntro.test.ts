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
  it('nhãn nút theo loại nguồn: giáo trình/ghi chép không gọi là "nguyên văn điều luật"', async () => {
    const tb = { ...concept, source: { kind: 'textbook' as const, cite: 'Ghi chép ôn thi — chưa đối chiếu nguyên văn giáo trình' } };
    render(CardIntro, { props: { concept: tb, item, rng, onanswer: vi.fn() } });
    expect(screen.queryByRole('button', { name: 'Xem nguyên văn điều luật' })).toBeNull();
    const btn = screen.getByRole('button', { name: 'Xem định nghĩa theo giáo trình' });
    await fireEvent.click(btn);
    expect(btn.textContent).toContain('Ẩn định nghĩa theo giáo trình');
    cleanup();
    const pr = { ...concept, source: { kind: 'primary' as const, cite: 'Nghị quyết 01/2020' } };
    render(CardIntro, { props: { concept: pr, item, rng, onanswer: vi.fn() } });
    expect(screen.getByRole('button', { name: 'Xem nguyên văn văn bản' })).toBeTruthy();
  });
  it('mở đầu bằng sơ đồ dấu hiệu và ví dụ; nguyên văn điều luật ẩn cho tới khi bấm', async () => {
    const { container } = render(CardIntro, { props: { concept, item, rng, onanswer: vi.fn() } });
    expect(container.textContent).toContain('An giao 5 triệu');
    expect([...container.querySelectorAll('.memo-row')].map((l) => l.textContent)).toEqual(['giao tiền', 'bảo đảm', 'giao kết']);
    expect(container.querySelector('.intro-cues')).toBeNull();
    expect(container.querySelector('blockquote')).toBeNull();
    const btn = screen.getByRole('button', { name: 'Xem nguyên văn điều luật' });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    await fireEvent.click(btn);
    expect(container.querySelector('blockquote')?.textContent).toContain('Đặt cọc là việc giao tiền');
    expect(container.textContent).toContain('Điều 328 BLDS 2015');
  });
  it('chưa có sơ đồ người soạn: thêm đoạn giải nghĩa; nguồn chỉ hiện trong phần nguyên văn', () => {
    const { container } = render(CardIntro, { props: { concept, item, rng, onanswer: vi.fn() } });
    expect(container.querySelector('p.plain')?.textContent).toContain('Giao tiền trước');
    expect(container.querySelector('.source')).toBeNull();
  });
  it('có sơ đồ người soạn: sơ đồ + mẹo nhớ thay đoạn giải nghĩa', () => {
    const memo = { hook: 'Cọc để GIỮ hợp đồng.', tree: [{ label: 'Giao gì', children: ['tiền'] }, { label: 'Để làm gì', children: ['bảo đảm giao kết'] }] };
    const { container } = render(CardIntro, { props: { concept: { ...concept, memo }, item, rng, onanswer: vi.fn() } });
    expect(container.querySelectorAll('.memo-row')).toHaveLength(2);
    expect(container.querySelector('.memo-hook')?.textContent).toContain('Cọc để GIỮ hợp đồng.');
    expect(container.querySelector('p.plain')).toBeNull();
  });
  it('khái niệm có ghi chú luật mới: chỉ hiện nhãn "⚠ Luật đã thay đổi", bấm mới mở nguyên văn và ghi chú', async () => {
    const { container } = render(CardIntro, { props: { concept: { ...concept, note: 'Có thay đổi từ 01/07/2025.' }, item, rng, onanswer: vi.fn() } });
    expect(container.querySelector('blockquote')).toBeNull();
    expect(container.textContent).not.toContain('Có thay đổi từ 01/07/2025.');
    await fireEvent.click(screen.getByRole('button', { name: /Luật đã thay đổi/ }));
    expect(container.querySelector('blockquote')).not.toBeNull();
    expect(container.textContent).toContain('Có thay đổi từ 01/07/2025.');
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

describe('CardIntro: tình huống hỏi–đáp (memo.case)', () => {
  const withCase: Concept = { ...concept, memo: { gist: 'Giao tiền trước để giữ chắc việc ký.', hook: 'Như giữ chỗ.', tree: [{ label: 'a' }, { label: 'b' }], case: { q: 'An đưa 5 triệu trước khi ký, đó là gì?', a: 'Là đặt cọc.' } } };
  it('hiện câu hỏi, đáp ẩn tới khi bấm "Xem đáp"; thay đoạn ví dụ; bấm thì đọc đáp', async () => {
    const onspeak = vi.fn();
    const { container } = render(CardIntro, { props: { concept: withCase, item, rng, onanswer: vi.fn(), onspeak } });
    expect(container.querySelector('.intro-example')).toBeNull();
    expect(container.querySelector('.intro-case-q')?.textContent).toContain('An đưa 5 triệu');
    expect(container.querySelector('.intro-case-a')).toBeNull();
    await fireEvent.click(screen.getByRole('button', { name: 'Xem đáp' }));
    expect(container.querySelector('.intro-case-a')?.textContent).toContain('Là đặt cọc.');
    expect(onspeak).toHaveBeenLastCalledWith('Đáp: Là đặt cọc.');
    expect(screen.queryByRole('button', { name: 'Xem đáp' })).toBeNull();
  });
});
