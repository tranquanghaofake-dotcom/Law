import { describe, expect, it } from 'vitest';
import { endAction, type EndCtx } from '$lib/ui/endAction';

const base: EndCtx = { kind: 'lesson', gate: null, hasNext: false, hasAgain: false, dueNow: 0, next: null };
const labels = (c: Partial<EndCtx>) => { const r = endAction({ ...base, ...c }); return { p: r.primary.label, s: r.secondary.map((x) => x.label), hint: r.hint }; };

describe('endAction — nút chính theo tình huống (spec màn cuối phiên §2.3)', () => {
  it('1. đợt chưa qua cổng + có onagain → "Học lượt tiếp đợt này"', () => {
    const r = endAction({ ...base, gate: { done: false }, hasAgain: true, hasNext: true, dueNow: 4 });
    expect(r.primary).toEqual({ act: 'again', label: 'Học lượt tiếp đợt này →' });
    expect(r.secondary.map((x) => x.act)).toEqual(['home']);
  });
  it('2. phiên ôn còn bài đến hạn → "Ôn tiếp (còn N)"', () => {
    const r = endAction({ ...base, kind: 'review', dueNow: 5 });
    expect(r.primary).toEqual({ act: 'review', label: 'Ôn tiếp (còn 5) →' });
    expect(r.secondary.map((x) => x.act)).toEqual(['home']);
  });
  it('2b. phiên ôn hết bài → "Về Hôm nay"', () => {
    expect(endAction({ ...base, kind: 'review' }).primary).toEqual({ act: 'home', label: 'Về Hôm nay' });
  });
  it('3. đợt qua cổng + có đợt tiếp → "Học đợt tiếp"; còn bài đến hạn thì thêm nút phụ ôn', () => {
    const a = endAction({ ...base, gate: { done: true }, hasNext: true });
    expect(a.primary.label).toBe('Học đợt tiếp →');
    expect(a.secondary.map((x) => x.act)).toEqual(['home']);
    const b = endAction({ ...base, gate: { done: true }, hasNext: true, dueNow: 3 });
    expect(b.secondary.map((x) => x.act)).toEqual(['review', 'home']);
    expect(b.secondary[0].label).toBe('Ôn 3 khái niệm đến hạn');
  });
  it('3b. đợt không có cổng + có đợt tiếp → "Học đợt tiếp"', () => {
    expect(labels({ hasNext: true }).p).toBe('Học đợt tiếp →');
  });
  it('4. không có đợt tiếp nhưng có onagain → "Học lại đợt này"', () => {
    expect(labels({ hasAgain: true })).toMatchObject({ p: 'Học lại đợt này', s: ['Về Hôm nay'] });
  });
  it('5. không còn gì → "Về Hôm nay" là nút chính, không có nút phụ', () => {
    const r = endAction(base);
    expect(r.primary).toEqual({ act: 'home', label: 'Về Hôm nay' });
    expect(r.secondary).toEqual([]);
  });
  it('gate chưa xong nhưng không có onagain → rơi về "Học đợt tiếp" (như trước)', () => {
    expect(labels({ gate: { done: false }, hasNext: true }).p).toBe('Học đợt tiếp →');
  });
});

describe('endAction — hint lý do quay lại', () => {
  const next = (inDays: number) => ({ inDays, count: 3, date: '09/11/2026', time: '20:15' });
  it('còn bài đến hạn ngay', () => expect(labels({ dueNow: 2, next: next(1) }).hint).toBe('Còn 2 khái niệm đến hạn ôn ngay.'));
  it('hẹn trong hôm nay', () => expect(labels({ next: next(0) }).hint).toBe('Ôn lại lúc 20:15 hôm nay · 3 khái niệm.'));
  it('hẹn ngày mai', () => expect(labels({ next: next(1) }).hint).toBe('Ôn lại ngày mai · 3 khái niệm.'));
  it('hẹn xa hơn', () => expect(labels({ next: next(2) }).hint).toBe('Ôn lại ngày 09/11/2026 · 3 khái niệm.'));
  it('không có hẹn → không có hint', () => expect(labels({}).hint).toBeNull());
});
