import { describe, it, expect } from 'vitest';
import { countAt, startOf } from '$lib/ui/countUp';

describe('countAt — giá trị số đếm tại thời điểm t (0..1)', () => {
  it('đầu = from, cuối = to, luôn là số nguyên, đơn điệu', () => {
    expect(countAt(0, 120, 0)).toBe(0);
    expect(countAt(0, 120, 1)).toBe(120);
    let prev = -1;
    for (let k = 0; k <= 20; k++) { const v = countAt(0, 120, k / 20); expect(Number.isInteger(v)).toBe(true); expect(v).toBeGreaterThanOrEqual(prev); prev = v; }
  });
  it('chạy được cả chiều giảm', () => {
    expect(countAt(50, 10, 1)).toBe(10);
    expect(countAt(50, 10, 0.5)).toBeLessThan(50);
  });
});

describe('startOf — chỉ đếm khi số thật sự đổi', () => {
  it('chưa từng thấy → hiện thẳng giá trị (không đếm); đã thấy số khác → đếm từ số cũ; from cố định thắng', () => {
    expect(startOf(340, null)).toBe(340);
    expect(startOf(340, 300)).toBe(300);
    expect(startOf(340, 340)).toBe(340);
    expect(startOf(25, null, 0)).toBe(0);
  });
});
