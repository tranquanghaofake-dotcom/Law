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
  it('chọn nhiễu có `why`: hiện "Bạn chọn «…»" kèm lời giải thích của đúng phương án đó, kể cả khái niệm đã có Hiểu nhanh', () => {
    const w: StepItem = { ...item, options: ['A', 'B', 'C', 'D'], why: ['A sai vì x.', 'B đúng.', 'C sai vì điều kiện khác.', 'D sai.'] } as StepItem;
    const memo = { gist: 'Lời thường ngắn.', hook: 'Mẹo nhớ khác hẳn.' };
    const { container } = render(WhyPanel, { props: { concept: c('a', { memo }), item: w, correct: false, explain: 'Khoản 2 Điều 1.', chosen: 'C' } });
    expect(container.querySelector('.why-wrong')?.textContent).toBe('Bạn chọn «C»: C sai vì điều kiện khác.');
  });
});

describe('WhyPanel: "Dễ nhầm" không chọn thì gập khi đã có lời giải thích đúng lỗi (phần 2 "lúc sai")', () => {
  const w: StepItem = { type: 'mcq', level: 1, q: 'Phân biệt với KN b: điều kiện thứ hai?', options: ['A', 'B', 'C', 'D'], answer: 1, explain: 'Khoản 2 Điều 1.', why: ['A sai.', 'B đúng vì khoản 2.', 'C sai vì điều kiện khác.', 'D sai.'] } as StepItem;
  it('có lời giải thích đúng lỗi (why.wrong) + dễ nhầm không chọn → nằm trong <details> đóng', () => {
    const { container } = render(WhyPanel, { props: { concept: c('a'), item: w, correct: false, explain: 'x', chosen: 'C', confusables: [c('b')] } });
    const d = container.querySelector('details.why-mixup-more') as HTMLDetailsElement;
    expect(d).not.toBeNull();
    expect(d.open).toBe(false);
    expect(d.querySelector('summary')!.textContent).toContain('KN b');
    expect(d.querySelector('.why-mixup')).not.toBeNull();
    expect(container.querySelector('.why-wrong')).not.toBeNull();
  });
  it('không có lời giải thích đúng lỗi → "Dễ nhầm" vẫn hiện sẵn như cũ', () => {
    const noWhy = { ...w, why: undefined } as StepItem;
    const { container } = render(WhyPanel, { props: { concept: c('a'), item: noWhy, correct: false, explain: 'x', chosen: 'C', confusables: [c('b')] } });
    expect(container.querySelector('details.why-mixup-more')).toBeNull();
    expect(container.querySelector('.why-mixup')).not.toBeNull();
  });
  it('bạn đã chọn đúng khái niệm dễ nhầm đó → không gập', () => {
    const { container } = render(WhyPanel, { props: { concept: c('a'), item: w, correct: false, explain: 'x', chosen: 'KN b', confusables: [c('b')] } });
    expect(container.querySelector('details.why-mixup-more')).toBeNull();
    expect(container.querySelector('.why-mixup')).not.toBeNull();
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

describe('WhyPanel: câu phân biệt theo cặp (memo.contrast)', () => {
  it('chọn nhầm khái niệm có câu phân biệt: hiện một câu thay hai cột cụm từ', () => {
    const a = c('a', { memo: { gist: 'Câu ngắn.', hook: 'm', contrast: [{ with: 'b', text: 'A là cái này; còn B là cái kia.' }] } });
    const { container } = render(WhyPanel, { props: { concept: a, item, correct: false, explain: 'x', chosen: 'KN b', confusables: [c('b')] } });
    expect(container.querySelector('.why-contrast')?.textContent).toContain('A là cái này; còn B là cái kia.');
    expect(container.querySelector('.why-mixup')).toBeNull();
  });
  it('nhầm với khái niệm khác không có câu phân biệt: vẫn hai cột', () => {
    const a = c('a', { memo: { gist: 'Câu ngắn.', hook: 'm', contrast: [{ with: 'z', text: 'khác' }] } });
    const { container } = render(WhyPanel, { props: { concept: a, item, correct: false, explain: 'x', chosen: 'KN b', confusables: [c('b')] } });
    expect(container.querySelector('.why-contrast')).toBeNull();
    expect(container.querySelector('.why-mixup')).not.toBeNull();
  });
});
