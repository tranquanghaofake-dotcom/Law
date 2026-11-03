import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
afterEach(() => cleanup());
import HyperNote from '$lib/ui/session/HyperNote.svelte';
import PretestBar from '$lib/ui/session/PretestBar.svelte';

describe('HyperNote', () => {
  it('nói rõ "chắc nhưng sai", nêu khái niệm dễ nhầm và báo câu sẽ quay lại', () => {
    const { container } = render(HyperNote, { props: { term: 'Đặt cọc', confusableTerms: ['Ký cược', 'Cầm cố'] } });
    expect(container.textContent).toContain('Bạn rất chắc nhưng sai');
    expect(container.textContent).toContain('Đặt cọc');
    expect(container.textContent).toContain('Ký cược, Cầm cố');
    expect(container.textContent).toContain('vòng sửa sai');
  });
  it('ở vòng sửa sai không hứa "sẽ quay lại"', () => {
    const { container } = render(HyperNote, { props: { term: 'X', retry: true } });
    expect(container.textContent).not.toContain('sẽ quay lại');
  });
});

describe('PretestBar', () => {
  it('chưa trả lời: có nút Bỏ qua gọi onskip', async () => {
    const onskip = vi.fn();
    render(PretestBar, { props: { onskip } });
    await fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua' }));
    expect(onskip).toHaveBeenCalled();
  });
  it('đã trả lời: hiện lời trấn an, không còn nút Bỏ qua', () => {
    const { container } = render(PretestBar, { props: { onskip: () => {}, answered: true } });
    expect(container.textContent).toContain('Đoán sai không sao');
    expect(screen.queryByRole('button', { name: 'Bỏ qua' })).toBeNull();
  });
});
