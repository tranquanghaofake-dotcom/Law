import { describe, expect, it } from 'vitest';
import { answerText, promptText } from '$lib/ui/cards/answer';

describe('câu hỏi / đáp án dạng chữ (dùng cho phản hồi và xem lại câu sai)', () => {
  it('mcq/case: câu hỏi và phương án đúng', () => {
    const it1 = { type: 'mcq' as const, level: 1 as const, q: 'Hỏi?', options: ['A', 'B'], answer: 1, explain: '' };
    expect(promptText(it1)).toBe('Hỏi?');
    expect(answerText(it1)).toBe('B');
  });
  it('cloze: câu có chỗ trống ___ và các từ cần điền', () => {
    const c = { type: 'cloze' as const, level: 3 as const, text: 'Tài sản là {{vật}}, {{tiền}}.' };
    expect(promptText(c)).toBe('Tài sản là ___, ___.');
    expect(answerText(c)).toBe('vật · tiền');
  });
  it('truefalse, recall, pair', () => {
    expect(answerText({ type: 'truefalse', level: 4, statement: 'S', answer: false, explain: '' })).toBe('Sai');
    expect(promptText({ type: 'recall', level: 5, q: 'Vì sao?', model: 'Vì X', keywords: [] })).toBe('Vì sao?');
    expect(answerText({ type: 'recall', level: 5, q: 'Vì sao?', model: 'Vì X', keywords: [] })).toBe('Vì X');
    const pair = { type: 'pair' as const, level: 2 as const, left: 'L', right: 'R', cases: [{ text: 't1', answer: 'right' as const }], explain: '' };
    expect(promptText(pair)).toBe('Phân biệt: L hay R');
    expect(answerText(pair)).toBe('t1 → R');
  });
  it('intro: rỗng', () => {
    expect(promptText({ type: 'intro' })).toBe('');
    expect(answerText({ type: 'intro' })).toBe('');
  });
});
