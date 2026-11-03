import { describe, expect, it } from 'vitest';
import { estMinutes, nextAfter, orderIds, pickRandom, quizStats, quizStatus, shelfFor, shelfProgress, sortSets, suggestSets, ticketNo, verdictFor } from '$lib/ui/quiz';

// 5 đề: hai nhóm pldc, hai nhóm dan-su, một nhóm hinh-su (thứ tự kệ: pldc → dan-su → hinh-su theo GROUPS)
const sets = [
  { id: 'd1', group: 'dan-su', count: 10, title: 'Dân sự 1' },
  { id: 'p1', group: 'pldc', count: 10, title: 'PLĐC 1' },
  { id: 'h1', group: 'hinh-su', count: 10, title: 'Hình sự 1' },
  { id: 'p2', group: 'pldc', count: 10, title: 'PLĐC 2' },
  { id: 'd2', group: 'dan-su', count: 10, title: 'Dân sự 2' },
];
const ids = (xs: { id: string }[]) => xs.map((s) => s.id);

describe('orderIds / ticketNo / nextAfter', () => {
  it('thứ tự kệ: nhóm theo GROUPS, trong nhóm giữ thứ tự đưa vào', () => {
    expect(orderIds(sets)).toEqual(['p1', 'p2', 'd1', 'd2', 'h1']);
  });
  it('ticketNo đánh số từ 1, hai chữ số, theo thứ tự kệ; id lạ → null', () => {
    const o = orderIds(sets);
    expect(ticketNo(o, 'p1')).toBe('01');
    expect(ticketNo(o, 'h1')).toBe('05');
    expect(ticketNo(o, 'x')).toBeNull();
  });
  it('nextAfter trả đề kế tiếp theo thứ tự kệ, đề cuối → null', () => {
    expect(nextAfter(sets, 'p2')?.id).toBe('d1');
    expect(nextAfter(sets, 'h1')).toBeNull();
    expect(nextAfter(sets, 'x')).toBeNull();
  });
});

describe('quizStats', () => {
  it('chưa làm gì: 0 đề, không có điểm trung bình', () => {
    expect(quizStats(sets, {})).toEqual({ total: 5, done: 0, perfect: 0, avgPct: null, donePct: 0 });
  });
  it('đếm đã làm, đạt tối đa; trung bình tính trên đề đã làm, làm tròn %', () => {
    const r = quizStats(sets, { p1: 10, p2: 7, d1: 4, h1: null, d2: undefined });
    expect(r).toEqual({ total: 5, done: 3, perfect: 1, avgPct: 70, donePct: 60 });
  });
  it('điểm 0 vẫn là đã làm', () => {
    expect(quizStats(sets, { p1: 0 }).done).toBe(1);
    expect(quizStats(sets, { p1: 0 }).avgPct).toBe(0);
  });
  it('danh sách rỗng không chia cho 0', () => {
    expect(quizStats([], {})).toEqual({ total: 0, done: 0, perfect: 0, avgPct: null, donePct: 0 });
  });
});

describe('quizStatus', () => {
  it('Mới / Đã làm / Tối đa', () => {
    expect(quizStatus(null, 10)).toBe('new');
    expect(quizStatus(undefined, 10)).toBe('new');
    expect(quizStatus(6, 10)).toBe('done');
    expect(quizStatus(10, 10)).toBe('perfect');
  });
});

describe('suggestSets', () => {
  it('next = đề chưa làm đầu tiên theo thứ tự kệ; retry = đề đã làm nhưng chưa tối đa có tỉ lệ thấp nhất', () => {
    const r = suggestSets(sets, { p1: 10, p2: 8, d1: 3 }, orderIds(sets));
    expect(r.next?.id).toBe('d2');
    expect(r.retry?.id).toBe('d1');
  });
  it('hoà điểm thì lấy đề đứng trước theo thứ tự kệ', () => {
    expect(suggestSets(sets, { d1: 5, p2: 5 }, orderIds(sets)).retry?.id).toBe('p2');
  });
  it('làm hết và đạt tối đa: không còn gợi ý nào', () => {
    const best = Object.fromEntries(sets.map((s) => [s.id, 10]));
    expect(suggestSets(sets, best, orderIds(sets))).toEqual({ next: null, retry: null });
  });
  it('chưa làm gì: next là đề đầu kệ, retry null', () => {
    const r = suggestSets(sets, {}, orderIds(sets));
    expect(r.next?.id).toBe('p1');
    expect(r.retry).toBeNull();
  });
});

describe('pickRandom', () => {
  it('cùng seed → cùng đề; rỗng → null', () => {
    expect(pickRandom(sets, 42)?.id).toBe(pickRandom(sets, 42)?.id);
    expect(pickRandom([], 1)).toBeNull();
  });
  it('mọi đề đều có thể được chọn khi đổi seed', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 200; s++) seen.add(pickRandom(sets, s)!.id);
    expect(seen.size).toBe(sets.length);
  });
  it('tránh đề đang hiện (avoidId) khi còn đề khác', () => {
    for (let s = 0; s < 50; s++) expect(pickRandom(sets, s, 'p1')?.id).not.toBe('p1');
    expect(pickRandom([sets[0]], 3, 'd1')?.id).toBe('d1'); // chỉ một đề thì vẫn trả đề đó
  });
});

describe('sortSets', () => {
  const best = { p1: 10, p2: 3, d1: 8 };
  it('theo kệ: thứ tự kệ', () => {
    expect(ids(sortSets(sets, best, 'shelf'))).toEqual(['p1', 'p2', 'd1', 'd2', 'h1']);
  });
  it('chưa làm trước: đề mới lên đầu (giữ thứ tự kệ), rồi đề đã làm theo thứ tự kệ', () => {
    expect(ids(sortSets(sets, best, 'new-first'))).toEqual(['d2', 'h1', 'p1', 'p2', 'd1']);
  });
  it('điểm thấp trước: đề đã làm tăng dần theo tỉ lệ, đề mới đứng sau', () => {
    expect(ids(sortSets(sets, best, 'low-first'))).toEqual(['p2', 'd1', 'p1', 'd2', 'h1']);
  });
  it('không đổi mảng gốc', () => {
    const copy = [...sets];
    sortSets(sets, best, 'low-first');
    expect(sets).toEqual(copy);
  });
});

describe('verdictFor / estMinutes', () => {
  it('lời nhận xét theo mức điểm', () => {
    expect(verdictFor(10, 10).tier).toBe('perfect');
    expect(verdictFor(9, 10).tier).toBe('great');
    expect(verdictFor(7, 10).tier).toBe('good');
    expect(verdictFor(5, 10).tier).toBe('fair');
    expect(verdictFor(2, 10).tier).toBe('low');
    expect(verdictFor(0, 10).tier).toBe('low');
    for (const s of [0, 3, 6, 8, 10]) expect(verdictFor(s, 10).title.length).toBeGreaterThan(0);
  });
  it('thời gian ước tính ~0,5 phút/câu, tối thiểu 1', () => {
    expect(estMinutes(10)).toBe(5);
    expect(estMinutes(1)).toBe(1);
  });
});

describe('shelfFor / shelfProgress', () => {
  it('màu đầu phiếu theo kệ của nhóm; nhóm lạ → Khác', () => {
    expect(shelfFor('dan-su').id).toBe('dan-su');
    expect(shelfFor('to-tung-dan-su').id).toBe('dan-su');
    expect(shelfFor('khong-co').id).toBe('khac');
  });
  it('tiến độ theo kệ: chỉ kệ có đề, đếm đề đã làm', () => {
    const r = shelfProgress(sets, { p1: 4, d2: 10 });
    expect(r.map((k) => [k.id, k.done, k.total])).toEqual([['ly-luan', 1, 2], ['dan-su', 1, 2], ['hinh-su', 0, 1]]);
    expect(r[0].color).toMatch(/^#/);
  });
});
