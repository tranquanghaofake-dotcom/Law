import { describe, expect, it } from 'vitest';
import { dueByDay } from '$lib/ui/dueByDay';

const today = new Date(2026, 10, 3, 14, 30); // 03/11/2026 14:30 giờ địa phương
const at = (dayOffset: number, h = 9) => new Date(2026, 10, 3 + dayOffset, h, 0);

describe('dueByDay', () => {
  it('7 ô: hôm nay, mai … +6; không có gì thì toàn 0', () => {
    expect(dueByDay([], today)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
  it('xếp theo ngày địa phương, không theo giờ', () => {
    const r = dueByDay([at(0, 8), at(0, 23), at(1, 0), at(1, 23), at(6, 10)], today);
    expect(r).toEqual([2, 2, 0, 0, 0, 0, 1]);
  });
  it('quá hạn tính vào hôm nay; xa hơn 6 ngày thì bỏ qua', () => {
    expect(dueByDay([at(-5), at(-1), at(7), at(30)], today)).toEqual([2, 0, 0, 0, 0, 0, 0]);
  });
  it('nhận cả số mili giây; đổi `days` đổi độ dài', () => {
    expect(dueByDay([at(1).getTime()], today, 3)).toEqual([0, 1, 0]);
  });
  it('qua ranh giới tháng/năm vẫn đúng', () => {
    const dec = new Date(2026, 11, 30, 20, 0);
    expect(dueByDay([new Date(2027, 0, 1, 7, 0)], dec)).toEqual([0, 0, 1, 0, 0, 0, 0]);
  });
});

describe('nextReview — Ôn tập rỗng nói khi nào có bài (đợt 2)', () => {
  it('ngày gần nhất có hẹn + số khái niệm ngày đó', async () => {
    const { nextReview } = await import('$lib/ui/dueByDay');
    const today = new Date(2026, 10, 4, 10);
    const r = nextReview([new Date(2026, 10, 6, 8), new Date(2026, 10, 5, 9), new Date(2026, 10, 5, 22)], today);
    expect(r).toEqual({ inDays: 1, count: 2, date: '05/11/2026' });
  });
  it('vắt qua 00:00: 23:59 hôm nay hẹn 00:01 mai là "1 ngày"', async () => {
    const { nextReview } = await import('$lib/ui/dueByDay');
    expect(nextReview([new Date(2026, 10, 5, 0, 1)], new Date(2026, 10, 4, 23, 59))?.inDays).toBe(1);
  });
  it('không có hẹn → null', async () => {
    const { nextReview } = await import('$lib/ui/dueByDay');
    expect(nextReview([], new Date())).toBeNull();
  });
});
