import { beforeEach, describe, expect, it } from 'vitest';
import { feedbackSpeech } from '$lib/ui/session/speech';
import { comboTier } from '$lib/ui/session/combo';
import { createMatch, firstTry, isComplete, matchCorrect, tap } from '$lib/ui/session/matchGame';
import { place, sideAt, sortCorrect, sortWrongs, type Placed } from '$lib/ui/session/sortGame';
import { readRecord, submitRecord } from '$lib/ui/session/record';
import type { StepItem } from '$lib/engine/session';

describe('feedbackSpeech', () => {
  const mcq: StepItem = { type: 'mcq', level: 1, q: 'q', options: ['Một', 'Hai'], answer: 1, explain: 'Vì Hai đúng' };
  it('đúng → "Chính xác." + giải thích', () => {
    expect(feedbackSpeech(mcq, { correct: true })).toBe('Chính xác. Vì Hai đúng.');
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
