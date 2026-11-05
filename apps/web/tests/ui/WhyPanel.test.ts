import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import WhyPanel from '$lib/ui/WhyPanel.svelte';
import CompareTable from '$lib/ui/CompareTable.svelte';
import type { Concept } from '$lib/content/types';
import type { StepItem } from '$lib/engine/session';

const c = (id: string, o: Partial<Concept> = {}): Concept => ({
  id, subject: 's', chapter: 'c', term: `KN ${id}`, definition: `KN ${id} là điều kiện thứ nhất; điều kiện thứ hai của ${id}.`, plain: `Giải nghĩa ${id}. Câu hai.`, example: `Ví dụ ${id}.`,
  source: { kind: 'statute', cite: 'Điều 1' }, checked: '2026-11-01', confusables: [], keywords: [`dấu hiệu ${id} một`, `dấu hiệu ${id} hai`], items: [], ...o,
});
const item: StepItem = { type: 'mcq', level: 1, q: 'Câu hỏi điều kiện thứ hai?', options: ['A', 'B', 'C'], answer: 1, explain: 'Khoản 2 Điều 1.' };

describe('WhyPanel', () => {
  it('trả lời đúng: không hiện gì (dấu hiệu đã nằm trong sơ đồ Ghi nhớ nhanh)', () => {
    const { container } = render(WhyPanel, { props: { concept: c('a'), item, correct: true, explain: 'Khoản 2 Điều 1.' } });
    expect(container.textContent?.trim()).toBe('');
  });
  it('trả lời sai: có "Vì sao?", đoạn định nghĩa nguyên văn, dễ nhầm; không lặp lời gọn/dấu hiệu', () => {
    const { container } = render(WhyPanel, { props: { concept: c('a'), item, correct: false, explain: 'Khoản 2 Điều 1.', chosen: 'KN b', confusables: [c('b')] } });
    const t = container.textContent ?? '';
    expect(t).toContain('Vì sao?');
    expect(t).toContain('điều kiện thứ hai của a');
    expect(t).not.toContain('Nói gọn');
    expect(container.querySelector('.why-signs')).toBeNull();
    expect(container.querySelector('.why-mixup')?.textContent).toContain('KN b');
    expect(container.querySelectorAll('.why-mixup .mix-col')).toHaveLength(2);
  });
  it('dễ nhầm nhưng chưa đủ dữ liệu để so dấu hiệu: không thêm dòng tên (đã nằm trong "Xem thêm")', () => {
    const { container } = render(WhyPanel, { props: { concept: c('a'), item, correct: false, explain: 'x', confusables: [c('b')] } });
    expect(container.querySelector('.why-names')).toBeNull();
    expect(container.querySelector('.why-mixup')).toBeNull();
  });
});

describe('CompareTable', () => {
  it('hai cột có tên hai khái niệm; hàng Định nghĩa / Dấu hiệu / Ví dụ', () => {
    const { container } = render(CompareTable, { props: { a: c('a'), b: c('b') } });
    const t = container.textContent ?? '';
    expect(container.querySelector('[role="table"]')?.getAttribute('aria-label')).toBe('So sánh KN a và KN b');
    for (const s of ['Định nghĩa', 'Dấu hiệu', 'Ví dụ', 'Ví dụ a.', 'Ví dụ b.', 'dấu hiệu b hai']) expect(t).toContain(s);
    expect(container.querySelectorAll('.cmp-row')).toHaveLength(3);
  });
  it('không dựng gì khi hai khái niệm trùng nhau', () => {
    const { container } = render(CompareTable, { props: { a: c('a'), b: c('a') } });
    expect(container.querySelector('.cmp')).toBeNull();
  });
});

describe('WhyPanel với khái niệm đã có Hiểu nhanh', () => {
  it('trả lời sai: không đặt đoạn nguyên văn lên trước (không còn khối Vì sao nếu không có dễ nhầm)', () => {
    const { container } = render(WhyPanel, { props: { concept: c('a', { memo: { gist: 'Câu ngắn.', hook: 'm' } }), item, correct: false, explain: 'x' } });
    expect(container.querySelector('.why-quote')).toBeNull();
    expect(container.querySelector('.why')).toBeNull();
  });
});
