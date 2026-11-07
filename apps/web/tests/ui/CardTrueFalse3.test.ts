import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/svelte';
import CardTrueFalse from '$lib/ui/cards/CardTrueFalse.svelte';

const concept = { id: 'c', subject: 'dan-su', term: 'Giao dịch' } as never;
const item = {
  type: 'truefalse' as const, level: 4 as const, statement: 'Mọi hợp đồng không bằng văn bản đều vô hiệu.', answer: false, explain: 'Sai.',
  parts: {
    basis: { options: ['Điều 116', 'Điều 119', 'Khoản 2 Điều 117', 'Điều 123'], answer: 2 },
    reason: { options: ['Hình thức chỉ là điều kiện khi luật quy định', 'Hợp đồng miệng luôn vô hiệu', 'Chỉ cần công chứng', 'Tùy giá trị hợp đồng'], answer: 0 },
  },
};
const btn = (c: HTMLElement, t: string) => [...c.querySelectorAll<HTMLButtonElement>('.opt')].find((b) => b.textContent!.includes(t))!;

describe('CardTrueFalse — nhận định 3 phần', () => {
  afterEach(() => cleanup());
  it('3 bước: Đúng/Sai → căn cứ → lập luận; chỉ báo kết quả sau bước 3, kèm điểm từng phần', async () => {
    const onanswer = vi.fn();
    const { container } = render(CardTrueFalse, { props: { concept, item, rng: Math.random, onanswer } });
    await fireEvent.click(btn(container, 'Đúng'));
    expect(onanswer).not.toHaveBeenCalled();
    expect(container.textContent).toMatch(/Căn cứ/);
    await fireEvent.click(btn(container, 'Khoản 2 Điều 117'));
    expect(container.textContent).toMatch(/Lập luận/);
    await fireEvent.click(btn(container, 'Hình thức chỉ là điều kiện'));
    expect(onanswer).toHaveBeenCalledTimes(1);
    expect(onanswer.mock.calls[0][0]).toMatchObject({ correct: true, selfGrade: 'gan' });
    expect(container.querySelector('.nd-score')!.textContent).toMatch(/0,75\/1/);
  });
  it('không có parts: một bước như cũ', async () => {
    const onanswer = vi.fn();
    const { container } = render(CardTrueFalse, { props: { concept, item: { ...item, parts: undefined }, rng: Math.random, onanswer } });
    await fireEvent.click(btn(container, 'Sai'));
    expect(onanswer.mock.calls[0][0]).toMatchObject({ correct: true });
  });
});

describe('Feedback — nhận định 3 phần gần đúng', () => {
  afterEach(() => cleanup());
  it('0,5–0,75 điểm: "Gần đúng", không đóng dấu ĐÚNG', async () => {
    const Feedback = (await import('$lib/ui/Feedback.svelte')).default;
    const c = { id: 'c', subject: 'dan-su', term: 'Giao dịch', definition: 'd', plain: 'p', example: 'e', source: { kind: 'statute', cite: 'Điều 117 Bộ luật Dân sự 2015', url: 'https://x' }, keywords: [], confusables: [], items: [] } as never;
    const { container } = render(Feedback, { props: { result: { correct: true, elapsedMs: 1, selfGrade: 'gan' }, item, concept: c, onnext: () => {} } });
    expect(container.querySelector('.verdict')!.textContent).toMatch(/Gần đúng\. Nhận định sai/);
    expect(container.querySelector('.ok-seal')).toBeNull();
  });
});
