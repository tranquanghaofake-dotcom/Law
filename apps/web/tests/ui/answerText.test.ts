import { describe, expect, it } from 'vitest';
import { answerText, promptText, reviewTexts } from '$lib/ui/cards/answer';

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

describe('reviewTexts: xem lại câu sai không còn chữ che […]', () => {
  const concept = { id: 'a', subject: 'hp', chapter: 'c', term: 'Hiến pháp', definition: 'Hiến pháp là đạo luật cơ bản của Nhà nước.', plain: 'Luật gốc của cả hệ thống.', example: 'e', source: { kind: 'statute' as const, cite: 'Điều 1' }, checked: '2026-11-01', confusables: [], keywords: [], items: [] };
  const other = { ...concept, id: 'b', term: 'Luật', definition: 'Luật là văn bản do Quốc hội ban hành, quy định […] chung.', plain: 'Văn bản của Quốc hội.' };
  it('định nghĩa → thuật ngữ: hiện định nghĩa đầy đủ trong câu hỏi', () => {
    const step = { conceptId: 'a', level: 1 as const, meta: { gen: 'def-term' as const }, item: { type: 'mcq' as const, level: 1 as const, q: '«[…] là đạo luật cơ bản…»\nĐịnh nghĩa trên là của khái niệm nào?', options: ['Hiến pháp', 'Luật'], answer: 0, explain: '' } };
    const r = reviewTexts(step, [concept]);
    expect(r.prompt).toContain('«Hiến pháp là đạo luật cơ bản của Nhà nước.»');
    expect(r.prompt).not.toContain('[…]');
    expect(r.answer).toBe('Hiến pháp');
  });
  it('thuật ngữ → định nghĩa: đáp án là định nghĩa gốc', () => {
    const step = { conceptId: 'a', level: 2 as const, meta: { gen: 'term-def' as const }, item: { type: 'mcq' as const, level: 1 as const, q: 'Đâu là định nghĩa của «Hiến pháp»?', options: ['[…] là đạo luật…', 'x'], answer: 0, explain: '' } };
    expect(reviewTexts(step, [concept]).answer).toBe(concept.definition);
  });
  it('Đúng/Sai từ định nghĩa: câu hỏi hiện định nghĩa đầy đủ', () => {
    const step = { conceptId: 'a', level: 4 as const, meta: { gen: 'def-tf' as const }, item: { type: 'truefalse' as const, level: 4 as const, statement: '«[…] là đạo luật cơ bản…» là định nghĩa của «Luật».', answer: false, explain: '' } };
    const r = reviewTexts(step, [concept]);
    expect(r.prompt).toBe('«Hiến pháp là đạo luật cơ bản của Nhà nước.» là định nghĩa của «Luật».');
    expect(r.answer).toBe('Sai');
  });
  it('ghép cặp: mô tả che được thay bằng định nghĩa/plain gốc; khái niệm không có trong danh sách thì giữ nguyên', () => {
    const step = { conceptId: 'a', level: 2 as const, meta: { gen: 'match' as const }, item: { type: 'match' as const, level: 2 as const, explain: '', pairs: [
      { conceptId: 'a', term: 'Hiến pháp', text: '[…] là đạo luật cơ bản…' },
      { conceptId: 'b', term: 'Luật', text: 'Văn bản của […]' },
      { conceptId: 'z', term: 'Z', text: '[…] chưa biết' }] } };
    const lines = reviewTexts(step, [concept, other]).answer.split('\n');
    expect(lines[0]).toBe('Hiến pháp — Hiến pháp là đạo luật cơ bản của Nhà nước.');
    expect(lines[1]).toBe('Luật — Văn bản của Quốc hội.');
    expect(lines[2]).toBe('Z — […] chưa biết');
  });
  it('câu thường (không sinh tự động) giữ nguyên', () => {
    const step = { conceptId: 'a', level: 1 as const, item: { type: 'mcq' as const, level: 1 as const, q: 'Hỏi?', options: ['A', 'B'], answer: 1, explain: '' } };
    expect(reviewTexts(step, [concept])).toEqual({ prompt: 'Hỏi?', answer: 'B' });
  });
});
