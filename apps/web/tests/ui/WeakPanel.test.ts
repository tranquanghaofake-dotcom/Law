import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import WeakPanel from '$lib/ui/WeakPanel.svelte';

const item = { subject: 'dan-su', short: 'Dân sự', lesson: 'l1', lessonTitle: 'Giao dịch dân sự', href: '#/hoc/dan-su/l1', tries: 5, correct: 1, rate: 0.2 };

describe('WeakPanel', () => {
  afterEach(() => cleanup());
  it('chưa đủ dữ liệu: hiện hướng dẫn, không có danh sách', () => {
    const { container } = render(WeakPanel, { props: { data: { items: [], levels: [] } } });
    expect(container.textContent).toMatch(/ít nhất 5 câu/);
    expect(container.querySelector('.wk-list')).toBeNull();
  });
  it('có điểm yếu: tên môn, bài, x/y đúng (%) và nút ôn trỏ đúng bài', () => {
    const { container } = render(WeakPanel, { props: { data: { items: [item], levels: [{ level: 2, tries: 5, correct: 4, rate: 0.8 }] } } });
    const li = container.querySelector('.wk-item')!;
    expect(li.textContent).toMatch(/Dân sự/);
    expect(li.textContent).toMatch(/Giao dịch dân sự/);
    expect(li.textContent).toMatch(/1\/5 đúng \(20%\)/);
    expect(li.querySelector('a')!.getAttribute('href')).toBe('#/hoc/dan-su/l1');
    expect(container.querySelector('.wk-lv')!.textContent).toMatch(/Nhận biết.*80%/);
  });
});
