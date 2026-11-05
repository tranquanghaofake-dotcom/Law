import { beforeEach, describe, expect, it } from 'vitest';
import { feedbackSpeech, promptSpeech } from '$lib/ui/session/speech';
import type { Concept } from '$lib/content/types';
import { comboTier } from '$lib/ui/session/combo';
import { createMatch, firstTry, isComplete, matchCorrect, tap } from '$lib/ui/session/matchGame';
import { place, sideAt, sortCorrect, sortWrongs, type Placed } from '$lib/ui/session/sortGame';
import { readRecord, submitRecord } from '$lib/ui/session/record';
import type { StepItem } from '$lib/engine/session';

describe('feedbackSpeech', () => {
  const mcq: StepItem = { type: 'mcq', level: 1, q: 'q', options: ['Một', 'Hai'], answer: 1, explain: 'Vì Hai đúng' };
  it('đúng → "Chính xác." + đọc đáp án + giải thích (đáp án chỉ đọc sau khi trả lời)', () => {
    expect(feedbackSpeech(mcq, { correct: true })).toBe('Chính xác. Đáp án: Hai. Vì Hai đúng.');
  });
  it('sai → đọc đáp án rồi giải thích', () => {
    expect(feedbackSpeech(mcq, { correct: false })).toBe('Chưa đúng. Đáp án: Hai. Vì Hai đúng.');
  });
  it('ghép cặp/xếp cột chỉ đọc tóm tắt, không đọc danh sách', () => {
    const sort: StepItem = { type: 'sort', level: 2, left: 'A', right: 'B', cases: [{ text: 'tình huống dài 1', answer: 'left' }, { text: 'tình huống dài 2', answer: 'right' }], explain: 'Phân biệt theo X.' };
    const t = feedbackSpeech(sort, { correct: false, chosen: '3/5' });
    expect(t).toBe('Chưa đúng. Xếp đúng 3 trên 5 tình huống. Phân biệt theo X.');
    expect(t).not.toContain('tình huống dài');
    const match: StepItem = { type: 'match', level: 2, pairs: [{ conceptId: 'a', term: 'T', text: 'mô tả dài' }], explain: 'Ghép theo định nghĩa.' };
    expect(feedbackSpeech(match, { correct: false, chosen: '2/4' })).toBe('Chưa đúng. Ghép đúng ngay lần đầu 2 trên 4 cặp. Ghép theo định nghĩa.');
    expect(feedbackSpeech(match, { correct: true })).toBe('Chính xác. Ghép theo định nghĩa.');
  });
});

describe('comboTier', () => {
  it('khớp ngưỡng XP: ×1,5 từ 5, ×2 từ 10', () => {
    expect(comboTier(0).tier).toBe(0);
    expect(comboTier(1).tier).toBe(0);
    expect(comboTier(3).tier).toBe(1);
    expect(comboTier(5)).toMatchObject({ tier: 2, mult: 1.5, label: '×1,5 XP' });
    expect(comboTier(9).tier).toBe(2);
    expect(comboTier(10)).toMatchObject({ tier: 3, mult: 2, label: '×2 XP', progress: 1 });
  });
});

describe('matchGame', () => {
  it('chạm thuật ngữ rồi mô tả đúng → khoá cặp; sai → đếm lỗi, bỏ chọn', () => {
    let s = createMatch(3);
    let r = tap(s, 'term', 1); expect(r.outcome).toBe('select'); s = r.state;
    r = tap(s, 'desc', 0); expect(r.outcome).toBe('bad'); s = r.state;
    expect(s.wrongs).toBe(1); expect(s.sel).toEqual({ term: null, desc: null }); expect(s.missed).toEqual([1]);
    r = tap(s, 'desc', 1); s = r.state; r = tap(s, 'term', 1); expect(r.outcome).toBe('ok'); s = r.state;
    expect(s.done).toEqual([false, true, false]);
    expect(tap(s, 'term', 1).outcome).toBe('none'); // cặp đã khoá
  });
  it('chạm lại ô đang chọn thì bỏ chọn; chạm ô khác cùng bên thì đổi chọn', () => {
    let s = tap(createMatch(2), 'term', 0).state;
    s = tap(s, 'term', 1).state; expect(s.sel.term).toBe(1);
    s = tap(s, 'term', 1).state; expect(s.sel.term).toBeNull();
  });
  it('đúng khi không sai quá 1 lần', () => {
    let s = createMatch(2);
    s = tap(tap(s, 'term', 0).state, 'desc', 1).state; // sai 1
    expect(matchCorrect(s)).toBe(true);
    s = tap(tap(s, 'term', 1).state, 'desc', 0).state; // sai 2
    expect(matchCorrect(s)).toBe(false);
    s = tap(tap(s, 'term', 0).state, 'desc', 0).state;
    s = tap(tap(s, 'term', 1).state, 'desc', 1).state;
    expect(isComplete(s)).toBe(true);
    expect(firstTry(s)).toBe(0);
  });
});

describe('sortGame', () => {
  const cases = [{ text: 'a', answer: 'left' as const }, { text: 'b', answer: 'right' as const }, { text: 'c', answer: 'left' as const }];
  it('đặt đúng/sai; sai vẫn rơi vào cột đúng; xong khi hết tình huống', () => {
    let placed: Placed[] = [];
    let r = place(cases, placed, 'left')!; placed = r.placed; expect(r.ok).toBe(true);
    r = place(cases, placed, 'left')!; placed = r.placed; expect(r.ok).toBe(false); expect(placed[1].side).toBe('right');
    r = place(cases, placed, 'left')!; placed = r.placed; expect(r.done).toBe(true);
    expect(sortWrongs(placed)).toBe(1); expect(sortCorrect(placed)).toBe(false);
    expect(place(cases, placed, 'left')).toBeNull();
  });
  it('sideAt đọc data-side của phần tử gần nhất', () => {
    document.body.innerHTML = '<div data-side="right"><span id="x"></span></div><p id="y"></p>';
    expect(sideAt(document.getElementById('x'))).toBe('right');
    expect(sideAt(document.getElementById('y'))).toBeNull();
    expect(sideAt(null)).toBeNull();
  });
});

describe('record', () => {
  beforeEach(() => { try { localStorage.clear(); } catch { /* */ } });
  it('lưu và nhận biết phá kỷ lục', () => {
    expect(readRecord()).toEqual({ bestCombo: 0, bestRate: 0 });
    expect(submitRecord({ bestCombo: 6, correct: 8, total: 10 })).toMatchObject({ comboBeaten: true, rateBeaten: true });
    expect(readRecord()).toEqual({ bestCombo: 6, bestRate: 0.8 });
    expect(submitRecord({ bestCombo: 4, correct: 7, total: 10 })).toMatchObject({ comboBeaten: false, rateBeaten: false });
    expect(readRecord().bestCombo).toBe(6);
  });
  it('localStorage bị chặn không làm hỏng', () => {
    const orig = Object.getOwnPropertyDescriptor(window, 'localStorage')!;
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); }, configurable: true });
    try { expect(readRecord().bestCombo).toBe(0); expect(() => submitRecord({ bestCombo: 5, correct: 5, total: 5 })).not.toThrow(); }
    finally { Object.defineProperty(window, 'localStorage', orig); }
  });
});

describe('promptSpeech — đọc đề/khái niệm ngay khi thẻ hiện, KHÔNG lộ đáp án', () => {
  const concept = { term: 'Tài sản', definition: 'Tài sản là vật, tiền.' } as Concept;
  it('thẻ giới thiệu: đọc tên và định nghĩa khái niệm; có mẹo nhớ thì đọc thêm', async () => {
    expect(promptSpeech({ type: 'intro' }, concept)).toBe('Tài sản. Tài sản là vật, tiền.');
    expect(promptSpeech({ type: 'intro' }, { ...concept, memo: { hook: 'Nhớ VẬT và TIỀN' } } as Concept)).toBe('Tài sản. Tài sản là vật, tiền. Mẹo nhớ: Nhớ VẬT và TIỀN.');
    // định nghĩa kết thúc bằng ";" vẫn tách mẹo nhớ thành câu riêng
    const { sentences } = await import('$lib/fx/prosody');
    const t = promptSpeech({ type: 'intro' }, { term: 'X', definition: 'X là a;', memo: { hook: 'Nhớ a' } } as Concept);
    expect(sentences(t).at(-1)).toBe('Mẹo nhớ: Nhớ a.');
  });
  it('có Hiểu nhanh: đọc tên + Hiểu nhanh + mẹo nhớ, KHÔNG đọc nguyên văn định nghĩa', () => {
    const t = promptSpeech({ type: 'intro' }, { ...concept, memo: { gist: 'Mọi thứ có giá trị mà luật cho sở hữu.', hook: 'Nhớ vật và tiền' } } as Concept);
    expect(t).toBe('Tài sản. Mọi thứ có giá trị mà luật cho sở hữu. Mẹo nhớ: Nhớ vật và tiền.');
    expect(t).not.toContain('Tài sản là vật, tiền');
  });
  it('chữ cái phương án là câu riêng "Phương án A." để giọng dựng sẵn dùng lại được cho mọi câu', async () => {
    const { sentences } = await import('$lib/fx/prosody');
    const t = promptSpeech({ type: 'mcq', level: 1, q: 'Hỏi?', options: ['Vật', 'Ý tưởng'], answer: 0, explain: '' }, concept);
    expect(sentences(t)).toEqual(['Hỏi?', 'Phương án A.', 'Vật.', 'Phương án B.', 'Ý tưởng.']);
  });
  it('trắc nghiệm/tình huống: đọc câu hỏi và các phương án, không nói phương án nào đúng', () => {
    const t = promptSpeech({ type: 'mcq', level: 1, q: 'Tài sản gồm gì?', options: ['Vật', 'Ý tưởng'], answer: 0, explain: 'Vì vật.' }, concept);
    expect(t).toBe('Tài sản gồm gì? Phương án A. Vật. Phương án B. Ý tưởng.');
    expect(t).not.toContain('Vì vật');
  });
  it('đúng/sai: đọc nhận định; điền chỗ trống: đọc "chỗ trống" thay cho đáp án; che […] cũng đọc "chỗ trống"', () => {
    expect(promptSpeech({ type: 'truefalse', level: 4, statement: 'Tiền là tài sản', answer: true, explain: 'x' }, concept)).toBe('Đúng hay sai? Tiền là tài sản.');
    const cz = promptSpeech({ type: 'cloze', level: 3, text: 'Tài sản là {{vật}}, tiền.' }, concept);
    expect(cz).toBe('Điền vào chỗ trống: Tài sản là chỗ trống, tiền.');
    expect(cz).not.toContain('vật');
    expect(promptSpeech({ type: 'mcq', level: 1, q: '«[…] là vật, tiền» là gì?', options: ['Tài sản'], answer: 0, explain: '' }, concept)).toContain('«chỗ trống là vật, tiền»');
  });
  it('xếp cột/ghép cặp: đọc yêu cầu ngắn, không đọc danh sách', () => {
    expect(promptSpeech({ type: 'sort', level: 2, left: 'A', right: 'B', cases: [{ text: 'dài', answer: 'left' }], explain: '' }, concept)).toBe('Phân biệt: A hay B.');
    expect(promptSpeech({ type: 'match', level: 2, pairs: [{ conceptId: 'a', term: 'T', text: 'x' }], explain: '' }, concept)).toBe('Ghép thuật ngữ với mô tả.');
  });
});
