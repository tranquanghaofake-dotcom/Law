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
  it('trả lời đúng: một dòng "Dấu hiệu quyết định", không khối "Vì sao"', () => {
    const { container } = render(WhyPanel, { props: { concept: c('a'), item, correct: true, explain: 'Khoản 2 Điều 1.' } });
    expect(container.textContent).toContain('Dấu hiệu quyết định');
    expect(container.textContent).toContain('dấu hiệu a một');
    expect(container.querySelector('.why')).toBeNull();
  });
  it('trả lời sai: có "Vì sao?", đoạn định nghĩa nguyên văn, giải nghĩa gọn, dấu hiệu, dễ nhầm', () => {
    const { container } = render(WhyPanel, { props: { concept: c('a'), item, correct: false, explain: 'Khoản 2 Điều 1.', chosen: 'KN b', confusables: [c('b')] } });
    const t = container.textContent ?? '';
    expect(t).toContain('Vì sao?');
    expect(t).toContain('điều kiện thứ hai của a');
    expect(t).toContain('Nói gọn: Giải nghĩa a.');
    expect(t).toContain('Bạn chọn «KN b»');
  });
  it('dễ nhầm nhưng chưa đủ dữ liệu để so dấu hiệu: chỉ nêu tên', () => {
    const { container } = render(WhyPanel, { props: { concept: c('a'), item, correct: false, explain: 'x', confusables: [c('b')] } });
    expect(container.querySelector('.why-names')?.textContent).toContain('KN b');
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
