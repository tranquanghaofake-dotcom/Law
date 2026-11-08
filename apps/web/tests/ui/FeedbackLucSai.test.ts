import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Feedback from '$lib/ui/Feedback.svelte';
import type { Concept } from '$lib/content/types';
import type { StepItem } from '$lib/engine/session';

const concept: Concept = {
  id: 'a', subject: 's', chapter: 'c', term: 'KN a', definition: 'KN a là điều kiện thứ nhất.', plain: 'Giải nghĩa a.', example: 'Ví dụ a.',
  source: { kind: 'statute', cite: 'Điều 1' }, checked: '2026-11-01', confusables: [], keywords: ['một', 'hai'], items: [],
};
const base: StepItem = { type: 'mcq', level: 1, q: 'Câu hỏi?', options: ['A', 'B', 'C', 'D'], answer: 1, explain: 'Khoản 1 Điều 1.' };
const wrong = { correct: false, elapsedMs: 1, chosen: 'C' };
const verdict = (item: StepItem) => render(Feedback, { props: { result: wrong, item, concept, onnext: () => {} } }).container.querySelector('.vtext')!.textContent!;

describe('Feedback lúc sai: không lặp đáp án (phần 2 "lúc sai")', () => {
  it('trắc nghiệm có "Vì sao" nêu đáp án đúng → dòng đầu chỉ "Chưa đúng."', () => {
    const item: StepItem = { ...base, why: ['A sai.', 'B đúng vì khoản 1.', 'C sai vì điều kiện khác.', 'D sai.'] } as StepItem;
    const { container } = render(Feedback, { props: { result: wrong, item, concept, onnext: () => {} } });
    expect(container.querySelector('.vtext')!.textContent).toBe('Chưa đúng.');
    expect(container.querySelector('.why-right')!.textContent).toContain('B đúng vì khoản 1');
  });
  it('trắc nghiệm không có lời giải thích từng phương án → vẫn nêu "Đáp án: …" ở dòng đầu', () => {
    expect(verdict(base)).toBe('Chưa đúng. Đáp án: B');
  });
  it('điền khuyết/dạng không tô xanh phương án → giữ nguyên cách báo cũ (không mất đáp án)', () => {
    const cloze = { type: 'truefalse', level: 4, statement: 'Nhận định.', answer: true, explain: 'Vì vậy.' } as StepItem;
    expect(verdict(cloze)).toContain('Đáp án:');
  });
  it('trả lời đúng: không đổi', () => {
    const item: StepItem = { ...base, why: ['A sai.', 'B đúng.', 'C sai.', 'D sai.'] } as StepItem;
    const { container } = render(Feedback, { props: { result: { correct: true, elapsedMs: 1 }, item, concept, onnext: () => {} } });
    expect(container.querySelector('.vtext')!.textContent).toBe('Chính xác.');
  });
});
