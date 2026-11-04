import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/svelte';

const sets = [
  { id: 'q1', title: 'Quan hệ pháp luật', subtitle: 'Chủ thể', group: 'pldc', count: 10 },
  { id: 'q2', title: 'Đặt cọc', subtitle: 'Bảo đảm', group: 'dan-su', count: 10 },
  { id: 'q3', title: 'Thừa kế', subtitle: 'Di chúc', group: 'dan-su', count: 10 },
];
vi.mock('$lib/content/loader', () => ({ loadIndex: async () => ({ subjects: [], sets }) }));
vi.mock('$lib/store/stats', () => ({ stats: { ensureV1Migrated: async () => {}, best: async (id: string) => (id === 'q2' ? 7 : null) } }));
vi.mock('$lib/ui/rail.svelte', () => ({ setRail: () => () => {} }));

const Quizzes = (await import('../../src/routes/Quizzes.svelte')).default;
const ready = async (c: HTMLElement) => waitFor(() => expect(c.querySelector('.ticket')).not.toBeNull());

describe('Luyện đề — gọn phần đầu, heading kệ (Q-1, Q-2, Q-3, Q-6)', () => {
  afterEach(() => cleanup());
  it('số liệu gộp một dòng; một gợi ý chính (1 nút chính) thay ba thẻ', async () => {
    const { container } = render(Quizzes);
    await ready(container);
    expect(container.querySelector('.qz-stats')).toBeNull();
    expect(container.querySelector('.qz-line')?.textContent).toMatch(/1\/3 đề đã làm/);
    expect(container.querySelectorAll('.sug')).toHaveLength(0);
    const next = container.querySelector('.qz-next')!;
    expect(next.querySelectorAll('a.btn.primary')).toHaveLength(1);
    expect(next.textContent).toContain('Đặt cọc'); // đề chưa đạt có mặt dưới dạng lựa chọn phụ
    expect(next.querySelector('button')?.textContent).toContain('Xáo đề khác');
  });
  it('sắp xếp là <select> 3 lựa chọn; chip lọc xuống dòng (không cuộn ngang)', async () => {
    const { container } = render(Quizzes);
    await ready(container);
    const sel = container.querySelector('select.qz-sort') as HTMLSelectElement;
    expect([...sel.options].map((o) => o.textContent)).toEqual(['Theo kệ', 'Chưa làm trước', 'Điểm thấp trước']);
    await fireEvent.change(sel, { target: { value: 'low-first' } });
    expect(container.querySelectorAll('.qz-shelf-h')).toHaveLength(0); // không gom kệ khi sắp khác
  });
  it('sắp theo kệ: heading h3 mỗi kệ kèm số đề, tên đề là h4; không gắn "Mới" cho đề chưa làm', async () => {
    const { container } = render(Quizzes);
    await ready(container);
    const hs = [...container.querySelectorAll('h3.qz-shelf-h')];
    expect(hs).toHaveLength(2);
    expect(hs[1].textContent).toMatch(/2 đề/);
    expect(container.querySelectorAll('.ticket h4')).toHaveLength(3);
    expect(container.querySelector('.tk-st.new')).toBeNull();
    expect(container.querySelector('.ticket .tk-st.done')).not.toBeNull();
  });
});
